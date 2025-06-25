/**
 * Comprehensive Paystack Payment Service
 * Handles payment initialization, verification, transfers, and recipient management
 */

import { supabase } from "@/integrations/supabase/client";
import { PAYSTACK_CONFIG, PAYSTACK_BANK_CODES } from "@/config/paystack";
import { BankingDetails } from "@/types/banking";
import { toast } from "sonner";

export interface PaymentInitialization {
  email: string;
  amount: number; // in kobo
  reference: string;
  metadata?: Record<string, any>;
  callback_url?: string;
}

export interface PaymentVerification {
  status: "success" | "failed" | "abandoned";
  reference: string;
  amount: number;
  gateway_response: string;
  paid_at?: string;
  channel: string;
  currency: "ZAR" | "NGN";
  customer: {
    email: string;
  };
}

export interface TransferRecipient {
  recipient_code: string;
  name: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
  currency: "ZAR" | "NGN";
  type: "nuban";
}

export interface Transfer {
  transfer_code: string;
  amount: number;
  recipient: string;
  status: "pending" | "success" | "failed" | "reversed";
  reference: string;
  reason: string;
  currency: "ZAR" | "NGN";
}

export interface OrderData {
  id: string;
  buyer_email: string;
  seller_id: string;
  amount: number; // in kobo
  status: "pending" | "paid" | "ready_for_payout" | "paid_out" | "failed";
  paystack_ref: string;
  items: Array<{
    book_id: string;
    title: string;
    price: number;
    seller_id: string;
  }>;
  shipping_address?: any;
  created_at: string;
  updated_at: string;
}

export class PaystackPaymentService {
  private static readonly PAYSTACK_PUBLIC_KEY = PAYSTACK_CONFIG.PUBLIC_KEY;

  /**
   * Generate unique payment reference
   */
  static generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `PSK_${timestamp}_${random}`;
  }

  /**
   * Initialize payment with Paystack Inline popup
   */
  static async initializePayment(params: PaymentInitialization): Promise<void> {
    if (!this.PAYSTACK_PUBLIC_KEY) {
      throw new Error("Paystack public key not configured");
    }

    // Ensure Paystack script is loaded
    await this.loadPaystackScript();

    return new Promise((resolve, reject) => {
      const handler = (window as any).PaystackPop.setup({
        key: this.PAYSTACK_PUBLIC_KEY,
        email: params.email,
        amount: params.amount,
        reference: params.reference,
        currency: "ZAR",
        metadata: {
          ...params.metadata,
          payment_method: "paystack_inline",
        },
        callback: (response: any) => {
          // Handle payment verification in the background
          this.verifyPayment(response.reference)
            .then(() => {
              resolve(response);
            })
            .catch((error) => {
              reject(error);
            });
        },
        onClose: () => {
          reject(new Error("Payment window was closed"));
        },
      });

      handler.openIframe();
    });
  }

  /**
   * Verify payment through backend
   */
  static async verifyPayment(reference: string): Promise<PaymentVerification> {
    try {
      const { data, error } = await supabase.functions.invoke(
        "verify-paystack-payment",
        {
          body: { reference },
        },
      );

      if (error) {
        throw new Error(`Payment verification failed: ${error.message}`);
      }

      if (data.status === "success") {
        // Update order status in database
        await this.updateOrderStatus(reference, "paid", data);
        toast.success("Payment verified successfully!");
      } else {
        toast.error("Payment verification failed");
      }

      return data;
    } catch (error) {
      console.error("Payment verification error:", error);
      throw error;
    }
  }

  /**
   * Create order in database
   */
  static async createOrder(orderData: Partial<OrderData>): Promise<OrderData> {
    try {
      // Validate required fields
      if (!orderData.buyer_email) {
        throw new Error("Buyer email is required");
      }
      if (!orderData.seller_id) {
        throw new Error("Seller ID is required");
      }
      if (!orderData.amount || orderData.amount <= 0) {
        throw new Error("Valid amount is required");
      }
      if (!orderData.paystack_ref) {
        throw new Error("Paystack reference is required");
      }
      if (
        !orderData.items ||
        !Array.isArray(orderData.items) ||
        orderData.items.length === 0
      ) {
        throw new Error("Order items are required");
      }

      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            ...orderData,
            status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Database error details:", error);
        throw new Error(
          `Failed to create order: ${error.message || error.details || "Unknown database error"}`,
        );
      }

      if (!data) {
        throw new Error(
          "Failed to create order: No data returned from database",
        );
      }

      return data;
    } catch (error) {
      console.error("Create order error:", error);

      // Enhance error message for better debugging
      if (error instanceof Error) {
        throw new Error(`Order creation failed: ${error.message}`);
      } else {
        throw new Error(`Order creation failed: ${String(error)}`);
      }
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    reference: string,
    status: OrderData["status"],
    paymentData?: any,
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (paymentData) {
        updateData.payment_data = paymentData;
        updateData.paid_at = paymentData.paid_at;
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("paystack_ref", reference);

      if (error) {
        throw new Error(`Failed to update order: ${error.message}`);
      }
    } catch (error) {
      console.error("Update order status error:", error);
      throw error;
    }
  }

  /**
   * Create transfer recipient for seller payouts
   */
  static async createTransferRecipient(
    bankingDetails: BankingDetails,
  ): Promise<TransferRecipient> {
    try {
      const bankCode = PAYSTACK_BANK_CODES[bankingDetails.bank_name];
      if (!bankCode) {
        throw new Error(`Bank code not found for ${bankingDetails.bank_name}`);
      }

      const { data, error } = await supabase.functions.invoke(
        "create-paystack-subaccount",
        {
          body: {
            type: "nuban",
            name: bankingDetails.full_name,
            account_number: bankingDetails.bank_account_number,
            bank_code: bankCode,
            currency: "ZAR",
          },
        },
      );

      if (error) {
        throw new Error(`Failed to create recipient: ${error.message}`);
      }

      // Save recipient code to banking details
      await supabase
        .from("banking_details")
        .update({
          recipient_code: data.recipient_code,
          account_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", bankingDetails.user_id);

      return data;
    } catch (error) {
      console.error("Create transfer recipient error:", error);
      throw error;
    }
  }

  /**
   * Process seller payout
   */
  static async processPayout(
    orderId: string,
    sellerId: string,
    amount: number,
    reason: string,
  ): Promise<Transfer> {
    try {
      // Get seller banking details
      const { data: bankingDetails, error: bankingError } = await supabase
        .from("banking_details")
        .select("*")
        .eq("user_id", sellerId)
        .single();

      if (bankingError || !bankingDetails) {
        throw new Error("Seller banking details not found");
      }

      if (!bankingDetails.recipient_code) {
        // Create recipient if not exists
        await this.createTransferRecipient(bankingDetails);
        // Refresh banking details
        const { data: refreshedBanking } = await supabase
          .from("banking_details")
          .select("*")
          .eq("user_id", sellerId)
          .single();

        if (!refreshedBanking?.recipient_code) {
          throw new Error("Failed to create transfer recipient");
        }
        bankingDetails.recipient_code = refreshedBanking.recipient_code;
      }

      // Calculate amount (subtract 10% commission)
      const commissionRate = 0.1;
      const commission = Math.round(amount * commissionRate);
      const sellerAmount = amount - commission;

      // Process transfer
      const { data, error } = await supabase.functions.invoke("pay-seller", {
        body: {
          amount: sellerAmount,
          recipient: bankingDetails.recipient_code,
          reason: reason,
          reference: `payout_${orderId}_${Date.now()}`,
        },
      });

      if (error) {
        throw new Error(`Payout failed: ${error.message}`);
      }

      // Update order status
      await this.updateOrderStatus(orderId, "paid_out");

      // Log payout
      await this.logPayout(orderId, sellerId, sellerAmount, commission, data);

      // Send notification email
      await this.sendPayoutNotification(sellerId, sellerAmount, orderId);

      toast.success(
        `Payout of R${(sellerAmount / 100).toFixed(2)} processed successfully!`,
      );

      return data;
    } catch (error) {
      console.error("Process payout error:", error);
      throw error;
    }
  }

  /**
   * Mark order ready for payout (triggered by courier confirmation)
   */
  static async markReadyForPayout(orderId: string): Promise<void> {
    try {
      await this.updateOrderStatus(orderId, "ready_for_payout");

      // Get order details for auto-payout
      const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error || !order) {
        throw new Error("Order not found");
      }

      // Trigger auto-payout after 1 hour delay (for safety)
      setTimeout(() => {
        this.processPayout(
          orderId,
          order.seller_id,
          order.amount,
          `Book sale payout for order ${orderId}`,
        ).catch(console.error);
      }, 3600000); // 1 hour delay

      toast.success(
        "Order marked ready for payout. Seller will be paid within 1 hour.",
      );
    } catch (error) {
      console.error("Mark ready for payout error:", error);
      throw error;
    }
  }

  /**
   * Log payout transaction
   */
  static async logPayout(
    orderId: string,
    sellerId: string,
    amount: number,
    commission: number,
    transferData: any,
  ): Promise<void> {
    try {
      await supabase.from("payout_logs").insert([
        {
          order_id: orderId,
          seller_id: sellerId,
          amount: amount,
          commission: commission,
          transfer_code: transferData.transfer_code,
          status: transferData.status,
          reference: transferData.reference,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Log payout error:", error);
      // Don't throw - logging failure shouldn't break payout
    }
  }

  /**
   * Send payout notification email
   */
  static async sendPayoutNotification(
    sellerId: string,
    amount: number,
    orderId: string,
  ): Promise<void> {
    try {
      await supabase.functions.invoke("send-email-notification", {
        body: {
          to: sellerId,
          type: "payout_success",
          data: {
            amount: (amount / 100).toFixed(2),
            orderId: orderId,
          },
        },
      });
    } catch (error) {
      console.error("Send payout notification error:", error);
      // Don't throw - email failure shouldn't break payout
    }
  }

  /**
   * Load Paystack script dynamically
   */
  private static async loadPaystackScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).PaystackPop) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Failed to load Paystack script"));
      document.head.appendChild(script);
    });
  }

  /**
   * Get orders by status
   */
  static async getOrdersByStatus(
    status: OrderData["status"],
  ): Promise<OrderData[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Get orders by status error:", error);
      throw error;
    }
  }

  /**
   * Get seller earnings
   */
  static async getSellerEarnings(sellerId: string): Promise<{
    total: number;
    paid: number;
    pending: number;
    ready: number;
  }> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("amount, status")
        .eq("seller_id", sellerId);

      if (error) {
        throw new Error(`Failed to fetch earnings: ${error.message}`);
      }

      const earnings = {
        total: 0,
        paid: 0,
        pending: 0,
        ready: 0,
      };

      data?.forEach((order) => {
        const amount = order.amount * 0.9; // After 10% commission
        earnings.total += amount;

        switch (order.status) {
          case "paid_out":
            earnings.paid += amount;
            break;
          case "ready_for_payout":
            earnings.ready += amount;
            break;
          case "paid":
            earnings.pending += amount;
            break;
        }
      });

      return earnings;
    } catch (error) {
      console.error("Get seller earnings error:", error);
      throw error;
    }
  }
}

export default PaystackPaymentService;
