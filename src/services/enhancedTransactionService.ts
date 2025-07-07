import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TransactionSplit {
  bookPrice: number; // Total book price in kobo
  deliveryFee: number; // Total delivery fee in kobo
  sellerShare: number; // 90% of book price
  platformShare: number; // 10% of book price
  courierShare: number; // 100% of delivery fee
  totalAmount: number; // Total transaction amount
}

export interface TransactionRecord {
  id: string;
  orderId: string;
  sellerId: string;
  buyerId: string;
  paystackReference: string;
  bookPrice: number;
  deliveryFee: number;
  sellerShare: number;
  platformShare: number;
  courierShare: number;
  totalAmount: number;
  status:
    | "pending"
    | "paid"
    | "delivery_confirmed"
    | "seller_paid"
    | "completed"
    | "failed";
  deliveryConfirmedAt?: string;
  sellerPaidAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

export class EnhancedTransactionService {
  private static readonly PLATFORM_COMMISSION = 0.1; // 10%
  private static readonly SELLER_COMMISSION = 0.9; // 90%

  /**
   * Calculate transaction split before payment
   */
  static calculateTransactionSplit(
    bookPrice: number,
    deliveryFee: number,
  ): TransactionSplit {
    const sellerShare = Math.round(bookPrice * this.SELLER_COMMISSION);
    const platformShare = bookPrice - sellerShare; // Ensure exact split
    const courierShare = deliveryFee; // 100% to courier
    const totalAmount = bookPrice + deliveryFee;

    return {
      bookPrice,
      deliveryFee,
      sellerShare,
      platformShare,
      courierShare,
      totalAmount,
    };
  }

  /**
   * Create transaction record when payment is initiated
   */
  static async createTransaction(
    orderId: string,
    sellerId: string,
    buyerId: string,
    paystackReference: string,
    bookPrice: number,
    deliveryFee: number,
    metadata?: any,
  ): Promise<TransactionRecord> {
    try {
      const split = this.calculateTransactionSplit(bookPrice, deliveryFee);

      const transactionData = {
        order_id: orderId,
        seller_id: sellerId,
        buyer_id: buyerId,
        paystack_reference: paystackReference,
        book_price: split.bookPrice,
        delivery_fee: split.deliveryFee,
        seller_share: split.sellerShare,
        platform_share: split.platformShare,
        courier_share: split.courierShare,
        total_amount: split.totalAmount,
        status: "pending" as const,
        metadata: metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Try to insert into transactions table if it exists
      try {
        const { data, error } = await supabase
          .from("transactions")
          .insert([transactionData])
          .select()
          .single();

        if (error) {
          console.error("Database insert error:", error);
          // Continue with in-memory transaction if DB fails
        } else if (data) {
          return {
            id: data.id,
            orderId: data.order_id,
            sellerId: data.seller_id,
            buyerId: data.buyer_id,
            paystackReference: data.paystack_reference,
            bookPrice: data.book_price,
            deliveryFee: data.delivery_fee,
            sellerShare: data.seller_share,
            platformShare: data.platform_share,
            courierShare: data.courier_share,
            totalAmount: data.total_amount,
            status: data.status,
            deliveryConfirmedAt: data.delivery_confirmed_at,
            sellerPaidAt: data.seller_paid_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            metadata: data.metadata,
          };
        }
      } catch (dbError) {
        console.warn(
          "Transaction table not available, using fallback:",
          dbError,
        );
      }

      // Fallback: create in-memory transaction record
      return {
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId,
        sellerId,
        buyerId,
        paystackReference,
        bookPrice: split.bookPrice,
        deliveryFee: split.deliveryFee,
        sellerShare: split.sellerShare,
        platformShare: split.platformShare,
        courierShare: split.courierShare,
        totalAmount: split.totalAmount,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata,
      };
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw new Error("Failed to create transaction record");
    }
  }

  /**
   * Update transaction status when payment is confirmed
   */
  static async confirmPayment(paystackReference: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({
          status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("paystack_reference", paystackReference);

      if (error) {
        console.error("Error confirming payment:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.warn("Transaction table not available for payment confirmation");
      return true; // Continue with order processing
    }
  }

  /**
   * Update transaction when delivery is confirmed (triggers seller payout)
   */
  static async confirmDelivery(orderId: string): Promise<{
    success: boolean;
    sellerPayout?: number;
    transactionId?: string;
  }> {
    try {
      // Get transaction details
      const { data: transaction, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .eq("order_id", orderId)
        .eq("status", "paid")
        .single();

      if (fetchError || !transaction) {
        console.warn("Transaction not found for delivery confirmation");
        return { success: false };
      }

      // Update transaction status to delivery_confirmed
      const { error: updateError } = await supabase
        .from("transactions")
        .update({
          status: "delivery_confirmed",
          delivery_confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", transaction.id);

      if (updateError) {
        console.error(
          "Error updating transaction for delivery confirmation:",
          updateError,
        );
        return { success: false };
      }

      // Initiate seller payout process
      await this.processSellersP.ayout(transaction);

      return {
        success: true,
        sellerPayout: transaction.seller_share,
        transactionId: transaction.id,
      };
    } catch (error) {
      console.error("Error confirming delivery:", error);
      return { success: false };
    }
  }

  /**
   * Process seller payout (90% of book price)
   */
  private static async processSellerPayout(transaction: any): Promise<void> {
    try {
      // Get seller's banking details
      const { data: bankingAccount, error: bankingError } = await supabase
        .from("banking_subaccounts")
        .select("*")
        .eq("user_id", transaction.seller_id)
        .single();

      if (bankingError || !bankingAccount) {
        console.error("Seller banking account not found");
        toast.error("Seller banking details not available for payout");
        return;
      }

      // Use Paystack Transfer API to send money to seller
      const payoutResult = await this.initiatePaystackTransfer(
        bankingAccount.subaccount_code,
        transaction.seller_share,
        `Payout for order ${transaction.order_id}`,
      );

      if (payoutResult.success) {
        // Update transaction status
        await supabase
          .from("transactions")
          .update({
            status: "seller_paid",
            seller_paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", transaction.id);

        toast.success(
          `Seller payout of R${(transaction.seller_share / 100).toFixed(2)} initiated successfully`,
        );
      } else {
        console.error("Seller payout failed:", payoutResult.error);
        toast.error("Seller payout failed. Please contact support.");
      }
    } catch (error) {
      console.error("Error processing seller payout:", error);
      toast.error("Error processing seller payout");
    }
  }

  /**
   * Initiate Paystack transfer to seller
   */
  private static async initiatePaystackTransfer(
    subaccountCode: string,
    amount: number,
    reason: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Call Paystack transfer API through Supabase function
      const { data, error } = await supabase.functions.invoke("pay-seller", {
        body: {
          subaccount_code: subaccountCode,
          amount: amount,
          reason: reason,
          currency: "ZAR",
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Transfer failed",
      };
    }
  }

  /**
   * Get transaction details by order ID
   */
  static async getTransactionByOrderId(
    orderId: string,
  ): Promise<TransactionRecord | null> {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        orderId: data.order_id,
        sellerId: data.seller_id,
        buyerId: data.buyer_id,
        paystackReference: data.paystack_reference,
        bookPrice: data.book_price,
        deliveryFee: data.delivery_fee,
        sellerShare: data.seller_share,
        platformShare: data.platform_share,
        courierShare: data.courier_share,
        totalAmount: data.total_amount,
        status: data.status,
        deliveryConfirmedAt: data.delivery_confirmed_at,
        sellerPaidAt: data.seller_paid_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return null;
    }
  }

  /**
   * Calculate platform earnings summary
   */
  static async getPlatformEarningsSummary(): Promise<{
    totalPlatformEarnings: number;
    totalSellerPayouts: number;
    totalCourierPayments: number;
    transactionCount: number;
  }> {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("platform_share, seller_share, courier_share")
        .eq("status", "completed");

      if (error || !data) {
        return {
          totalPlatformEarnings: 0,
          totalSellerPayouts: 0,
          totalCourierPayments: 0,
          transactionCount: 0,
        };
      }

      const summary = data.reduce(
        (acc, transaction) => ({
          totalPlatformEarnings:
            acc.totalPlatformEarnings + (transaction.platform_share || 0),
          totalSellerPayouts:
            acc.totalSellerPayouts + (transaction.seller_share || 0),
          totalCourierPayments:
            acc.totalCourierPayments + (transaction.courier_share || 0),
          transactionCount: acc.transactionCount + 1,
        }),
        {
          totalPlatformEarnings: 0,
          totalSellerPayouts: 0,
          totalCourierPayments: 0,
          transactionCount: 0,
        },
      );

      return summary;
    } catch (error) {
      console.error("Error calculating platform earnings:", error);
      return {
        totalPlatformEarnings: 0,
        totalSellerPayouts: 0,
        totalCourierPayments: 0,
        transactionCount: 0,
      };
    }
  }
}

export default EnhancedTransactionService;
