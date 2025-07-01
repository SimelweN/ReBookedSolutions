/**
 * Complete Frontend Payment Integration Service
 * Implements the full payment flow as requested
 */

import { supabase } from "@/integrations/supabase/client";
import { PaystackService } from "@/services/paystackService";
import { toast } from "sonner";

export interface PaymentInitiationData {
  bookId: string;
  bookTitle: string;
  bookPrice: number;
  deliveryFee?: number;
  buyerEmail: string;
  sellerId: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  reference: string;
  amount: number;
  status: string;
  transactionId?: string;
}

export class PaymentIntegrationService {
  /**
   * Step 1: Create payment button → calls initialize-paystack-payment Edge Function
   */
  static async initiatePayment(data: PaymentInitiationData): Promise<{
    paymentUrl: string;
    transactionId: string;
  }> {
    try {
      console.log("💳 Initiating payment for:", data.bookTitle);

      // Call the initialize-paystack-payment Edge Function
      const { data: response, error } = await supabase.functions.invoke(
        "initialize-paystack-payment",
        {
          body: {
            email: data.buyerEmail,
            amount: Math.round(
              (data.bookPrice + (data.deliveryFee || 0)) * 100,
            ), // Convert to kobo
            bookId: data.bookId,
            sellerId: data.sellerId,
            sellerSubaccountCode: await this.getSellerSubaccountCode(
              data.sellerId,
            ),
            bookPrice: data.bookPrice,
            deliveryFee: data.deliveryFee || 0,
            callback_url: `${window.location.origin}/payment-callback`,
            metadata: {
              bookId: data.bookId,
              bookTitle: data.bookTitle,
              sellerId: data.sellerId,
              buyerEmail: data.buyerEmail,
            },
          },
        },
      );

      if (error) {
        throw new Error(`Payment initialization failed: ${error.message}`);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Payment initialization failed");
      }

      console.log("✅ Payment initialization successful");

      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          book_id: data.bookId,
          book_title: data.bookTitle,
          buyer_id: (await supabase.auth.getUser()).data.user?.id,
          seller_id: data.sellerId,
          price: data.bookPrice,
          commission: Math.round(data.bookPrice * 0.1 * 100) / 100, // 10% commission
          delivery_fee: data.deliveryFee || 0,
          status: "pending",
          paystack_reference: response.data.reference,
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
        })
        .select()
        .single();

      if (transactionError) {
        console.error("Transaction creation failed:", transactionError);
        throw new Error("Failed to create transaction record");
      }

      return {
        paymentUrl: response.data.authorization_url,
        transactionId: transaction.id,
      };
    } catch (error) {
      console.error("Payment initiation failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Payment initiation failed";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Step 2: Redirect to Paystack checkout → get redirect link from Edge Function
   */
  static redirectToPaystack(paymentUrl: string): void {
    console.log("🔄 Redirecting to Paystack checkout...");

    // Store current page for return
    sessionStorage.setItem("payment_return_url", window.location.href);

    // Redirect to Paystack
    window.location.href = paymentUrl;
  }

  /**
   * Step 3: On payment success → call verify-paystack-payment
   */
  static async verifyPayment(
    reference: string,
  ): Promise<PaymentVerificationResult> {
    try {
      console.log("🔍 Verifying payment:", reference);

      // Call verify-paystack-payment Edge Function
      const { data: response, error } = await supabase.functions.invoke(
        "verify-paystack-payment",
        {
          body: { reference },
        },
      );

      if (error) {
        throw new Error(`Payment verification failed: ${error.message}`);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Payment verification failed");
      }

      const paymentData = response.data;
      console.log("✅ Payment verification successful");

      return {
        success: true,
        reference: paymentData.reference,
        amount: paymentData.amount / 100, // Convert from kobo
        status: paymentData.status,
      };
    } catch (error) {
      console.error("Payment verification failed:", error);
      return {
        success: false,
        reference,
        amount: 0,
        status: "failed",
      };
    }
  }

  /**
   * Step 4: Update transaction with payment verification
   */
  static async updateTransactionAfterPayment(
    reference: string,
    verificationResult: PaymentVerificationResult,
  ): Promise<void> {
    try {
      if (!verificationResult.success) {
        // Update transaction as failed
        await supabase
          .from("transactions")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("paystack_reference", reference);

        toast.error("Payment failed. Transaction has been cancelled.");
        return;
      }

      // Update transaction as paid_pending_seller
      const { error } = await supabase
        .from("transactions")
        .update({
          status: "paid_pending_seller",
          updated_at: new Date().toISOString(),
        })
        .eq("paystack_reference", reference);

      if (error) {
        throw new Error(`Failed to update transaction: ${error.message}`);
      }

      console.log("✅ Transaction updated to paid_pending_seller");
      toast.success("Payment successful! Waiting for seller confirmation.");
    } catch (error) {
      console.error("Failed to update transaction:", error);
      toast.error("Payment successful but failed to update transaction status");
    }
  }

  /**
   * Step 5: Seller commits to sale
   */
  static async commitToSale(transactionId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("transactions")
        .update({
          status: "committed",
          seller_committed: true,
          committed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId)
        .eq("seller_id", user.id); // Ensure only seller can commit

      if (error) {
        throw new Error(`Failed to commit to sale: ${error.message}`);
      }

      console.log("✅ Seller committed to sale");
      toast.success(
        "You have committed to this sale. Please prepare the book for delivery.",
      );
      return true;
    } catch (error) {
      console.error("Failed to commit to sale:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to commit to sale",
      );
      return false;
    }
  }

  /**
   * Step 6: Buyer confirms delivery
   */
  static async confirmDelivery(transactionId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("transactions")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId)
        .eq("buyer_id", user.id); // Ensure only buyer can confirm

      if (error) {
        throw new Error(`Failed to confirm delivery: ${error.message}`);
      }

      console.log("✅ Delivery confirmed - transaction completed");
      toast.success("Delivery confirmed! Transaction completed successfully.");
      return true;
    } catch (error) {
      console.error("Failed to confirm delivery:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to confirm delivery",
      );
      return false;
    }
  }

  /**
   * Helper: Get seller's subaccount code
   */
  private static async getSellerSubaccountCode(
    sellerId: string,
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("banking_subaccounts")
        .select("subaccount_code")
        .eq("user_id", sellerId)
        .single();

      if (error || !data?.subaccount_code) {
        throw new Error("Seller payment account not found");
      }

      return data.subaccount_code;
    } catch (error) {
      console.error("Failed to get seller subaccount:", error);
      throw new Error("Seller payment account not properly set up");
    }
  }

  /**
   * Get transaction status for UI display
   */
  static async getTransactionStatus(transactionId: string): Promise<{
    status: string;
    canCommit: boolean;
    canConfirm: boolean;
    expired: boolean;
  }> {
    try {
      const { data: transaction, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .single();

      if (error || !transaction) {
        throw new Error("Transaction not found");
      }

      const now = new Date();
      const expiresAt = new Date(transaction.expires_at);
      const expired = now > expiresAt;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const isseller = user?.id === transaction.seller_id;
      const isBuyer = user?.id === transaction.buyer_id;

      return {
        status: transaction.status,
        canCommit:
          isseller && transaction.status === "paid_pending_seller" && !expired,
        canConfirm: isBuyer && transaction.status === "committed",
        expired,
      };
    } catch (error) {
      console.error("Failed to get transaction status:", error);
      return {
        status: "unknown",
        canCommit: false,
        canConfirm: false,
        expired: false,
      };
    }
  }
}

export default PaymentIntegrationService;
