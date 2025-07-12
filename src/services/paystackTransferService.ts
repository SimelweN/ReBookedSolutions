import { ENV } from "@/config/environment";
import { supabase } from "@/integrations/supabase/client";

interface PaystackTransferResponse {
  status: boolean;
  message: string;
  data?: {
    reference: string;
    integration: number;
    domain: string;
    amount: number;
    currency: string;
    source: string;
    reason: string;
    recipient: string;
    status: string;
    transfer_code: string;
    id: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface PayoutRequest {
  orderId: string;
  sellerId: string;
  subaccountCode: string;
  amount: number;
  reference: string;
  reason: string;
}

export class PaystackTransferService {
  private static readonly API_BASE = "https://api.paystack.co";
  private static readonly SECRET_KEY = ENV.VITE_PAYSTACK_SECRET_KEY || "";

  /**
   * Initialize transfer to seller's subaccount
   */
  static async transferToSeller(
    payoutRequest: PayoutRequest,
  ): Promise<PaystackTransferResponse> {
    try {
      if (!this.SECRET_KEY) {
        throw new Error("Paystack secret key not configured");
      }

      // Convert amount to kobo (multiply by 100)
      const amountInKobo = Math.round(payoutRequest.amount * 100);

      const transferData = {
        source: "balance",
        amount: amountInKobo,
        recipient: payoutRequest.subaccountCode,
        reason: payoutRequest.reason,
        reference: payoutRequest.reference,
      };

      console.log("🔄 Initiating Paystack transfer:", transferData);

      const response = await fetch(`${this.API_BASE}/transfer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transferData),
      });

      const result: PaystackTransferResponse = await response.json();

      if (!result.status) {
        throw new Error(`Transfer failed: ${result.message}`);
      }

      // Log successful transfer
      await this.logPayoutTransaction({
        orderId: payoutRequest.orderId,
        sellerId: payoutRequest.sellerId,
        amount: payoutRequest.amount,
        transferCode: result.data?.transfer_code || "",
        paystackReference: result.data?.reference || "",
        status: "completed",
      });

      console.log("✅ Transfer initiated successfully:", result.data);
      return result;
    } catch (error) {
      console.error("❌ Transfer failed:", error);

      // Log failed transfer
      await this.logPayoutTransaction({
        orderId: payoutRequest.orderId,
        sellerId: payoutRequest.sellerId,
        amount: payoutRequest.amount,
        transferCode: "",
        paystackReference: "",
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * Verify transfer status
   */
  static async verifyTransfer(
    transferCode: string,
  ): Promise<PaystackTransferResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE}/transfer/${transferCode}`,
        {
          headers: {
            Authorization: `Bearer ${this.SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result: PaystackTransferResponse = await response.json();
      return result;
    } catch (error) {
      console.error("Error verifying transfer:", error);
      throw error;
    }
  }

  /**
   * Create recipient for subaccount
   */
  static async createRecipient(
    subaccountCode: string,
    accountDetails: {
      name: string;
      account_number: string;
      bank_code: string;
      type: string;
    },
  ): Promise<any> {
    try {
      const recipientData = {
        type: "subaccount",
        name: accountDetails.name,
        account_number: accountDetails.account_number,
        bank_code: accountDetails.bank_code,
        currency: "ZAR",
        subaccount: subaccountCode,
      };

      const response = await fetch(`${this.API_BASE}/transferrecipient`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipientData),
      });

      const result = await response.json();

      if (!result.status) {
        throw new Error(`Recipient creation failed: ${result.message}`);
      }

      return result.data;
    } catch (error) {
      console.error("Error creating recipient:", error);
      throw error;
    }
  }

  /**
   * Log payout transaction for audit trail
   */
  private static async logPayoutTransaction(transaction: {
    orderId: string;
    sellerId: string;
    amount: number;
    transferCode: string;
    paystackReference: string;
    status: string;
    error?: string;
  }): Promise<void> {
    try {
      const { error } = await supabase.from("payout_transactions").insert([
        {
          order_id: transaction.orderId,
          seller_id: transaction.sellerId,
          amount: transaction.amount,
          transfer_code: transaction.transferCode,
          paystack_reference: transaction.paystackReference,
          status: transaction.status,
          error_message: transaction.error || null,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Failed to log payout transaction:", error);
      }
    } catch (error) {
      console.error("Error logging payout transaction:", error);
    }
  }

  /**
   * Get pending payouts
   */
  static async getPendingPayouts(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          seller_id,
          seller_amount,
          seller_subaccount_code,
          paystack_ref,
          book_title,
          status,
          created_at,
          profiles!orders_seller_id_fkey(full_name, email)
        `,
        )
        .eq("status", "collected")
        .eq("payment_held", true);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching pending payouts:", error);
      throw error;
    }
  }

  /**
   * Process all pending payouts
   */
  static async processPendingPayouts(): Promise<{
    processed: number;
    failed: number;
    errors: string[];
  }> {
    const pendingPayouts = await this.getPendingPayouts();
    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    console.log(`🔄 Processing ${pendingPayouts.length} pending payouts...`);

    for (const payout of pendingPayouts) {
      try {
        if (!payout.seller_subaccount_code) {
          throw new Error(`No subaccount code for seller ${payout.seller_id}`);
        }

        const payoutRequest: PayoutRequest = {
          orderId: payout.id,
          sellerId: payout.seller_id,
          subaccountCode: payout.seller_subaccount_code,
          amount: payout.seller_amount,
          reference: `payout_${payout.id}_${Date.now()}`,
          reason: `Payment for "${payout.book_title}" sale`,
        };

        await this.transferToSeller(payoutRequest);

        // Update order to mark payment released
        await supabase
          .from("orders")
          .update({
            payment_held: false,
            payout_completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", payout.id);

        processed++;
        console.log(`✅ Payout processed for order ${payout.id}`);
      } catch (error) {
        failed++;
        const errorMsg = `Order ${payout.id}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        console.error(`❌ Payout failed for order ${payout.id}:`, error);
      }
    }

    console.log(
      `🎯 Payout processing complete: ${processed} processed, ${failed} failed`,
    );

    return { processed, failed, errors };
  }
}
