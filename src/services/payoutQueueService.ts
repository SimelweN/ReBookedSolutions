import { supabase } from "@/integrations/supabase/client";
import { PaystackTransferService } from "./paystackTransferService";

interface QueuedPayout {
  id: string;
  order_id: string;
  seller_id: string;
  amount: number;
  status: string;
  retry_count: number;
  error_message?: string;
  created_at: string;
  seller_name?: string;
  book_title?: string;
}

interface PayoutQueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalAmount: number;
}

export class PayoutQueueService {
  /**
   * Get payout queue status and statistics
   */
  static async getQueueStats(): Promise<PayoutQueueStats> {
    try {
      const { data, error } = await supabase
        .from("payout_transactions")
        .select("status, amount");

      if (error) {
        throw error;
      }

      const stats = data.reduce(
        (acc, payout) => {
          acc[payout.status as keyof PayoutQueueStats]++;
          acc.totalAmount += payout.amount;
          return acc;
        },
        { pending: 0, processing: 0, completed: 0, failed: 0, totalAmount: 0 },
      );

      return stats;
    } catch (error) {
      console.error("Error getting queue stats:", error);
      throw error;
    }
  }

  /**
   * Get all payouts in queue with details
   */
  static async getQueuedPayouts(status?: string): Promise<QueuedPayout[]> {
    try {
      let query = supabase
        .from("payout_transactions")
        .select(
          `
          id,
          order_id,
          seller_id,
          amount,
          status,
          retry_count,
          error_message,
          created_at,
          orders!payout_transactions_order_id_fkey(
            book_title,
            profiles!orders_seller_id_fkey(full_name)
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transform data to include seller name and book title
      return data.map((payout: any) => ({
        id: payout.id,
        order_id: payout.order_id,
        seller_id: payout.seller_id,
        amount: payout.amount,
        status: payout.status,
        retry_count: payout.retry_count,
        error_message: payout.error_message,
        created_at: payout.created_at,
        seller_name: payout.orders?.profiles?.full_name || "Unknown",
        book_title: payout.orders?.book_title || "Unknown",
      }));
    } catch (error) {
      console.error("Error getting queued payouts:", error);
      throw error;
    }
  }

  /**
   * Process pending payouts in queue
   */
  static async processQueue(batchSize: number = 10): Promise<{
    processed: number;
    failed: number;
    errors: string[];
  }> {
    try {
      console.log(`🔄 Processing payout queue (batch size: ${batchSize})...`);

      // Get pending payouts
      const pendingPayouts = await this.getQueuedPayouts("pending");
      const batch = pendingPayouts.slice(0, batchSize);

      let processed = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const payout of batch) {
        try {
          // Mark as processing
          await this.updatePayoutStatus(payout.id, "processing");

          // Get order details for the transfer
          const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("seller_subaccount_code, paystack_ref")
            .eq("id", payout.order_id)
            .single();

          if (orderError || !order) {
            throw new Error(`Order not found: ${orderError?.message}`);
          }

          if (!order.seller_subaccount_code) {
            throw new Error(
              `No subaccount code for seller ${payout.seller_id}`,
            );
          }

          // Create transfer request
          const transferRequest = {
            orderId: payout.order_id,
            sellerId: payout.seller_id,
            subaccountCode: order.seller_subaccount_code,
            amount: payout.amount,
            reference: `payout_${payout.order_id}_${Date.now()}`,
            reason: `Payment for "${payout.book_title}" sale`,
          };

          // Execute transfer
          await PaystackTransferService.transferToSeller(transferRequest);

          // Mark as completed
          await this.updatePayoutStatus(payout.id, "completed");

          // Update order
          await supabase
            .from("orders")
            .update({
              payment_held: false,
              payout_completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", payout.order_id);

          processed++;
          console.log(`✅ Payout processed: ${payout.id}`);
        } catch (error) {
          failed++;
          const errorMsg = `Payout ${payout.id}: ${error instanceof Error ? error.message : String(error)}`;
          errors.push(errorMsg);

          // Update retry count and status
          const newRetryCount = payout.retry_count + 1;
          const maxRetries = 3;

          if (newRetryCount >= maxRetries) {
            await this.updatePayoutStatus(payout.id, "failed", errorMsg);
          } else {
            await this.updatePayoutStatus(
              payout.id,
              "pending",
              errorMsg,
              newRetryCount,
            );
          }

          console.error(`❌ Payout failed: ${payout.id}`, error);
        }
      }

      console.log(
        `🎯 Queue processing complete: ${processed} processed, ${failed} failed`,
      );

      return { processed, failed, errors };
    } catch (error) {
      console.error("Error processing payout queue:", error);
      throw error;
    }
  }

  /**
   * Update payout status
   */
  private static async updatePayoutStatus(
    payoutId: string,
    status: string,
    errorMessage?: string,
    retryCount?: number,
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (errorMessage) {
        updateData.error_message = errorMessage;
      }

      if (retryCount !== undefined) {
        updateData.retry_count = retryCount;
      }

      if (status === "completed") {
        updateData.processed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("payout_transactions")
        .update(updateData)
        .eq("id", payoutId);

      if (error) {
        console.error("Error updating payout status:", error);
      }
    } catch (error) {
      console.error("Error updating payout status:", error);
    }
  }

  /**
   * Retry failed payouts
   */
  static async retryFailedPayouts(): Promise<{
    queued: number;
    errors: string[];
  }> {
    try {
      console.log("🔄 Retrying failed payouts...");

      // Get failed payouts that haven't exceeded max retries
      const { data: failedPayouts, error } = await supabase
        .from("payout_transactions")
        .select("*")
        .eq("status", "failed")
        .lt("retry_count", 3);

      if (error) {
        throw error;
      }

      let queued = 0;
      const errors: string[] = [];

      for (const payout of failedPayouts || []) {
        try {
          await this.updatePayoutStatus(
            payout.id,
            "pending",
            null,
            payout.retry_count,
          );
          queued++;
        } catch (error) {
          const errorMsg = `Failed to queue payout ${payout.id}: ${error instanceof Error ? error.message : String(error)}`;
          errors.push(errorMsg);
        }
      }

      console.log(
        `🎯 Retry queuing complete: ${queued} payouts queued for retry`,
      );

      return { queued, errors };
    } catch (error) {
      console.error("Error retrying failed payouts:", error);
      throw error;
    }
  }

  /**
   * Get payout history for a seller
   */
  static async getSellerPayoutHistory(
    sellerId: string,
  ): Promise<QueuedPayout[]> {
    try {
      const { data, error } = await supabase
        .from("payout_transactions")
        .select(
          `
          id,
          order_id,
          amount,
          status,
          created_at,
          processed_at,
          error_message,
          orders!payout_transactions_order_id_fkey(book_title)
        `,
        )
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data.map((payout: any) => ({
        id: payout.id,
        order_id: payout.order_id,
        seller_id: sellerId,
        amount: payout.amount,
        status: payout.status,
        retry_count: 0,
        created_at: payout.created_at,
        book_title: payout.orders?.book_title || "Unknown",
      }));
    } catch (error) {
      console.error("Error getting seller payout history:", error);
      throw error;
    }
  }

  /**
   * Manual payout trigger for admin
   */
  static async triggerManualPayout(orderId: string): Promise<void> {
    try {
      console.log("🔄 Triggering manual payout for order:", orderId);

      // Check if payout already exists
      const { data: existingPayout } = await supabase
        .from("payout_transactions")
        .select("id, status")
        .eq("order_id", orderId)
        .single();

      if (existingPayout) {
        if (existingPayout.status === "completed") {
          throw new Error("Payout already completed");
        }

        // Update existing payout to pending
        await this.updatePayoutStatus(existingPayout.id, "pending");
      } else {
        // Create new payout transaction
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select("seller_id, seller_amount")
          .eq("id", orderId)
          .single();

        if (orderError || !order) {
          throw new Error(`Order not found: ${orderError?.message}`);
        }

        await supabase.from("payout_transactions").insert([
          {
            order_id: orderId,
            seller_id: order.seller_id,
            amount: order.seller_amount,
            status: "pending",
          },
        ]);
      }

      console.log("✅ Manual payout queued for order:", orderId);
    } catch (error) {
      console.error("Error triggering manual payout:", error);
      throw error;
    }
  }
}
