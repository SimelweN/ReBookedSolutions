import { supabase } from "@/integrations/supabase/client";
import { PaystackService } from "@/services/paystackService";
import { SecureBankingService } from "@/services/secureBankingService";

import { toast } from "sonner";

export interface Transaction {
  id: string;
  book_id: string;
  book_title: string;
  buyer_id: string;
  seller_id: string;
  price: number;
  commission: number;
  delivery_fee?: number;
  status:
    | "pending"
    | "paid_pending_seller"
    | "committed"
    | "collected"
    | "completed"
    | "refunded"
    | "cancelled";
  seller_committed: boolean;
  committed_at?: string;
  expires_at?: string;
  paystack_reference?: string;
  paystack_subaccount_code?: string;
  created_at: string;
  updated_at: string;
}

export class TransactionService {
  private static readonly COMMIT_WINDOW_HOURS = 48;

  /**
   * Initialize payment for a book purchase
   */
  static async initializeBookPayment({
    bookId,
    buyerId,
    buyerEmail,
    sellerId,
    bookPrice,
    deliveryFee = 0,
    bookTitle,
  }: {
    bookId: string;
    buyerId: string;
    buyerEmail: string;
    sellerId: string;
    bookPrice: number;
    deliveryFee?: number;
    bookTitle: string;
  }): Promise<{ payment_url: string; transaction_id: string }> {
    try {
      // Debug info in development
      if (import.meta.env.DEV) {
        console.log(`Initializing payment for seller: ${sellerId}`);
      }

      // Get seller's subaccount code from banking_details
      const { data: bankingDetails } = await supabase
        .from("banking_details")
        .select("paystack_subaccount_code")
        .eq("user_id", sellerId)
        .single();

      if (!bankingDetails?.paystack_subaccount_code) {
        console.warn(
          `Seller ${sellerId} has no subaccount code in banking_details, falling back to legacy payment`,
        );
        throw new Error("SELLER_NO_SUBACCOUNT");
      }

      // Create transaction record
      const commission = Math.round(bookPrice * 0.1 * 100) / 100; // 10% commission
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.COMMIT_WINDOW_HOURS);

      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert([
          {
            book_id: bookId,
            book_title: bookTitle,
            buyer_id: buyerId,
            seller_id: sellerId,
            price: bookPrice,
            commission: commission,
            delivery_fee: deliveryFee,
            status: "pending",
            seller_committed: false,
            expires_at: expiresAt.toISOString(),
            paystack_subaccount_code: bankingDetails.paystack_subaccount_code,
          },
        ])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Initialize Paystack payment
      const paymentData = await PaystackService.initializePayment({
        buyerEmail,
        bookPrice,
        deliveryFee,
        bookId,
        sellerId,
        sellerSubaccountCode: bankingDetails.paystack_subaccount_code,
        metadata: {
          transaction_id: transaction.id,
          book_title: bookTitle,
        },
      });

      // Update transaction with Paystack reference
      await supabase
        .from("transactions")
        .update({
          paystack_reference: paymentData.reference,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transaction.id);

      return {
        payment_url: paymentData.authorization_url,
        transaction_id: transaction.id,
      };
    } catch (error) {
      console.error("Error initializing payment:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to initialize payment";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Handle payment callback and update transaction status
   */
  static async handlePaymentCallback(reference: string): Promise<Transaction> {
    try {
      // Verify payment with Paystack
      const paymentData = await PaystackService.verifyPayment(reference);

      if (paymentData.status !== "success") {
        throw new Error("Payment verification failed");
      }

      // Update transaction status
      const { data: transaction, error } = await supabase
        .from("transactions")
        .update({
          status: "paid_pending_seller",
          updated_at: new Date().toISOString(),
        })
        .eq("paystack_reference", reference)
        .select()
        .single();

      if (error) throw error;

      // Mark book as sold
      await supabase
        .from("books")
        .update({
          sold: true,
          status: "pending_commit",
        })
        .eq("id", transaction.book_id);

      toast.success("Payment successful! Waiting for seller confirmation.");
      return transaction;
    } catch (error) {
      console.error("Error handling payment callback:", error);
      throw new Error("Failed to process payment");
    }
  }

  /**
   * Seller commits to the sale
   */
  static async commitSale(
    transactionId: string,
    sellerId: string,
  ): Promise<Transaction> {
    try {
      // Verify seller owns this transaction
      const { data: transaction, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .eq("seller_id", sellerId)
        .single();

      if (fetchError) throw fetchError;

      if (transaction.status !== "paid_pending_seller") {
        throw new Error("Invalid transaction status for commit");
      }

      // Check if commit window is still open
      const expiresAt = new Date(transaction.expires_at);
      if (new Date() > expiresAt) {
        throw new Error("Commit window has expired");
      }

      // Update transaction status
      const { data: updatedTransaction, error: updateError } = await supabase
        .from("transactions")
        .update({
          status: "committed",
          seller_committed: true,
          committed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update book status
      await supabase
        .from("books")
        .update({
          status: "committed",
        })
        .eq("id", transaction.book_id);

      toast.success(
        "Sale committed successfully! Buyer will be notified. Payment will be released after book collection.",
      );
      return updatedTransaction;
    } catch (error) {
      console.error("Error committing sale:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to commit sale";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Mark book as collected by buyer - this triggers payment release
   */
  static async markBookCollected(
    transactionId: string,
    collectedBy: "buyer" | "seller" = "buyer",
  ): Promise<Transaction> {
    try {
      const { data: transaction, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .single();

      if (fetchError) throw fetchError;

      if (transaction.status !== "committed") {
        throw new Error(
          "Transaction must be committed before marking as collected",
        );
      }

      // Update transaction to collected status
      const { data: updatedTransaction, error: updateError } = await supabase
        .from("transactions")
        .update({
          status: "collected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Mark book as collected
      await supabase
        .from("books")
        .update({
          status: "collected",
          sold: true,
        })
        .eq("id", transaction.book_id);

      // TODO: Trigger payment release to seller via Paystack
      // This is where the seller would actually receive their payment
      console.log(
        `Payment should be released to seller for transaction ${transactionId}`,
      );

      toast.success(
        `Book collection confirmed! Payment has been released to the seller.`,
      );
      return updatedTransaction;
    } catch (error) {
      console.error("Error marking book as collected:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to confirm collection";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Complete transaction after successful collection and payment release
   */
  static async completeTransaction(
    transactionId: string,
  ): Promise<Transaction> {
    try {
      const { data: transaction, error } = await supabase
        .from("transactions")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId)
        .select()
        .single();

      if (error) throw error;

      // Mark book as fully completed
      await supabase
        .from("books")
        .update({
          status: "completed",
        })
        .eq("id", transaction.book_id);

      return transaction;
    } catch (error) {
      console.error("Error completing transaction:", error);
      throw new Error("Failed to complete transaction");
    }
  }

  /**
   * Handle expired commits (refund buyer)
   */
  static async handleExpiredCommit(transactionId: string): Promise<void> {
    try {
      const { data: transaction, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .single();

      if (fetchError) throw fetchError;

      if (transaction.paystack_reference) {
        // Issue refund through Paystack
        await PaystackService.refundPayment(transaction.paystack_reference);
      }

      // Update transaction status
      await supabase
        .from("transactions")
        .update({
          status: "refunded",
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId);

      // Reset book status
      await supabase
        .from("books")
        .update({
          sold: false,
          status: null,
        })
        .eq("id", transaction.book_id);

      toast.success("Transaction refunded due to seller non-response.");
    } catch (error) {
      console.error("Error handling expired commit:", error);
      throw new Error("Failed to handle expired commit");
    }
  }

  /**
   * Get transactions for a user
   */
  static async getUserTransactions(
    userId: string,
    type: "buyer" | "seller" = "buyer",
  ): Promise<Transaction[]> {
    try {
      const column = type === "buyer" ? "buyer_id" : "seller_id";

      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*")
        .eq(column, userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return transactions || [];
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      return [];
    }
  }

  /**
   * Get transaction by ID
   */
  static async getTransaction(
    transactionId: string,
  ): Promise<Transaction | null> {
    try {
      const { data: transaction, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .single();

      if (error) throw error;

      return transaction;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return null;
    }
  }
}

export default TransactionService;
