/**
 * Comprehensive Paystack Payment Service
 * Handles payment initialization, verification, transfers, and recipient management
 */

import { supabase } from "@/integrations/supabase/client";
import { PAYSTACK_CONFIG, PAYSTACK_BANK_CODES } from "@/config/paystack";
import { BankingDetails } from "@/types/banking";
import { toast } from "sonner";
import { PaystackLibraryTest } from "@/utils/paystackLibraryTest";

export interface PaymentInitialization {
  email: string;
  amount: number; // in kobo
  reference: string;
  subaccount?: string; // Subaccount code for split payments
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
   * Check if Paystack library is available and wait for it if needed
   */
  static async ensurePaystackLoaded(): Promise<boolean> {
    // First check if it's already available
    if ((window as any).PaystackPop || (window as any).Paystack) {
      return true;
    }

    // Wait up to 5 seconds for Paystack to load
    const maxWait = 5000;
    const checkInterval = 100;
    let waited = 0;

    while (waited < maxWait) {
      if ((window as any).PaystackPop || (window as any).Paystack) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, checkInterval));
      waited += checkInterval;
    }

    // If still not available, try loading the script
    try {
      await this.loadPaystackScript();
      return true;
    } catch (error) {
      console.error("Failed to load Paystack:", error);
      return false;
    }
  }

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

    console.log("🔍 Running comprehensive Paystack library test...");
    const testResults = await PaystackLibraryTest.testAllMethods();
    PaystackLibraryTest.logResults(testResults);

    // Find the first successful method
    const successfulMethod = testResults.find((result) => result.success);

    if (!successfulMethod) {
      console.error("❌ No Paystack library loading method succeeded");
      throw new Error(
        "Paystack payment library not available - all loading methods failed",
      );
    }

    console.log(`✅ Using successful method: ${successfulMethod.method}`);

    // Get PaystackPop based on successful method
    let PaystackPop;

    if (successfulMethod.method === "NPM Package Import") {
      try {
        const paystackModule = await import("@paystack/inline-js");
        if (paystackModule.PaystackPop) {
          PaystackPop = paystackModule.PaystackPop;
        } else if (paystackModule.default) {
          PaystackPop = paystackModule.default;
        } else if (typeof paystackModule === "function") {
          PaystackPop = paystackModule;
        }
      } catch (error) {
        console.error("NPM package import failed in production:", error);
      }
    }

    // Try global objects
    if (!PaystackPop) {
      PaystackPop = (window as any).PaystackPop;
    }

    // Fallback to global Paystack object
    if (!PaystackPop) {
      const globalPaystack = (window as any).Paystack;
      if (globalPaystack && typeof globalPaystack.setup === "function") {
        console.log("Using global Paystack object as fallback");
        PaystackPop = class {
          newTransaction(config: any) {
            globalPaystack.setup(config);
          }
        };
      }
    }

    if (!PaystackPop) {
      console.error("❌ PaystackPop still not available after successful test");
      throw new Error("Paystack payment library not available");
    }

    console.log("✅ PaystackPop ready:", typeof PaystackPop);

    return new Promise((resolve, reject) => {
      const paystack = new PaystackPop();

      const transactionParams: any = {
        key: this.PAYSTACK_PUBLIC_KEY,
        email: params.email,
        amount: params.amount,
        reference: params.reference,
        currency: "ZAR",
        metadata: {
          ...params.metadata,
          payment_method: "paystack_inline",
        },
        onSuccess: (response: any) => {
          // Handle payment verification in the background
          this.verifyPayment(response.reference)
            .then(() => {
              resolve(response);
            })
            .catch((error) => {
              reject(error);
            });
        },
        onCancel: () => {
          console.log("💡 Payment window was closed by user");
          toast.info("Payment was cancelled", {
            description: "You can try again when ready.",
          });
          // Don't reject as an error - resolve with cancellation status
          resolve({ cancelled: true, reference: params.reference });
        },
      };

      // Add subaccount for split payments if provided
      if (params.subaccount) {
        transactionParams.subaccount = params.subaccount;
        console.log("Payment will be split to subaccount:", params.subaccount);
      }

      paystack.newTransaction(transactionParams);
    });
  }

  /**
   * Verify payment through backend
   */
  static async verifyPayment(reference: string): Promise<PaymentVerification> {
    try {
      console.log(`🔍 Verifying payment with reference: ${reference}`);

      const { data, error } = await supabase.functions.invoke(
        "verify-paystack-payment",
        {
          body: { reference },
        },
      );

      if (error) {
        // Extract error message properly
        const errorMsg =
          error.message || error.details || JSON.stringify(error, null, 2);
        console.error("❌ Edge function error:", errorMsg);
        console.error("❌ Full error details:", {
          message: error.message,
          details: error.details,
          code: error.code,
          status: error.status,
        });

        // Check if it's a configuration issue
        if (
          errorMsg.includes("secret key") ||
          errorMsg.includes("not configured") ||
          errorMsg.includes("MISSING_SECRET_KEY")
        ) {
          console.warn(
            "🔧 Payment service configuration issue, using fallback",
          );
          return await this.fallbackPaymentVerification(reference);
        }

        // Check if it's an Edge Function deployment issue
        if (
          errorMsg.includes("non-2xx status code") ||
          errorMsg.includes("FunctionsHttpError") ||
          errorMsg.includes("Failed to send a request")
        ) {
          console.warn("🌐 Edge Function deployment issue, using fallback");
          return await this.fallbackPaymentVerification(reference);
        }

        // For other errors, try fallback verification
        console.warn("⚠️ Primary verification failed, attempting fallback...");
        return await this.fallbackPaymentVerification(reference);
      }

      if (data?.error) {
        console.error("Verification returned error:", data.error);

        // Try fallback if backend verification fails
        if (
          data.error.includes("secret key") ||
          data.error.includes("not configured")
        ) {
          console.warn(
            "Backend configuration issue, using fallback verification",
          );
          return await this.fallbackPaymentVerification(reference);
        }

        throw new Error(`Payment verification failed: ${data.error}`);
      }

      if (data?.status === "success") {
        // Update order status in database
        await this.updateOrderStatus(reference, "paid", data);
        toast.success("Payment verified successfully!");
      } else if (data?.status === "failed") {
        toast.error("Payment was not successful");
      } else {
        toast.warning("Payment status unclear, please check your order");
      }

      return data;
    } catch (error) {
      console.error("Payment verification error:", error);

      // If all else fails, try fallback
      if (error instanceof Error && !error.message.includes("fallback")) {
        try {
          console.warn("Final fallback attempt for payment verification");
          return await this.fallbackPaymentVerification(reference);
        } catch (fallbackError) {
          console.error("Fallback verification also failed:", fallbackError);
        }
      }

      throw error;
    }
  }

  /**
   * Fallback payment verification (when Edge Function fails)
   */
  private static async fallbackPaymentVerification(
    reference: string,
  ): Promise<PaymentVerification> {
    try {
      console.log(`🔄 Attempting fallback verification for ${reference}`);

      // In development, always assume payments are successful for testing
      if (import.meta.env.DEV) {
        console.log("🛠️ Development mode: Using fallback verification");

        const fallbackData: PaymentVerification = {
          status: "success",
          reference,
          amount: 10000, // Default test amount
          gateway_response: "Successful (development fallback)",
          paid_at: new Date().toISOString(),
          channel: "card",
          currency: "ZAR",
          customer: {
            email: "test@example.com",
          },
        };

        // Try to update order status, but don't fail if it doesn't work
        try {
          await this.updateOrderStatus(reference, "paid", fallbackData);
          console.log("✅ Order status updated in fallback mode");
        } catch (orderError) {
          console.warn(
            "⚠️ Order status update failed in fallback mode:",
            orderError,
          );
          // Continue anyway for testing purposes
        }

        toast.success("Payment verified (development fallback mode)");
        console.log("✅ Fallback verification successful");

        return fallbackData;
      }

      // For production, we can't verify without proper backend
      console.error(
        "❌ Production mode: Cannot verify payment without backend service",
      );
      throw new Error("Payment verification service unavailable in production");
    } catch (error) {
      console.error("Fallback verification failed:", error);

      // In development, still try to return success for testing
      if (import.meta.env.DEV) {
        console.warn(
          "⚠️ Even fallback failed, but returning success for development testing",
        );
        return {
          status: "success",
          reference,
          amount: 10000,
          gateway_response: "Successful (emergency fallback)",
          paid_at: new Date().toISOString(),
          channel: "card",
          currency: "ZAR",
          customer: {
            email: "test@example.com",
          },
        };
      }

      throw new Error(
        "Unable to verify payment - all verification methods failed",
      );
    }
  }

  /**
   * Debug function to check orders table structure
   */
  static async debugOrdersTable(): Promise<void> {
    try {
      console.log("🔍 Checking orders table structure...");

      // Test basic table access
      const { data: testData, error: testError } = await supabase
        .from("orders")
        .select("id")
        .limit(1);

      if (testError) {
        const errorMsg =
          testError.message ||
          testError.details ||
          JSON.stringify(testError, null, 2);
        console.error("❌ Cannot access orders table:", errorMsg);
        console.error("❌ Full error details:", {
          message: testError.message,
          details: testError.details,
          hint: testError.hint,
          code: testError.code,
        });
        return;
      }

      console.log("✅ Orders table accessible");

      // Check current user
      const { data: user } = await supabase.auth.getUser();
      console.log("👤 Current user:", user?.user?.id, user?.user?.email);
    } catch (error) {
      console.error("❌ Debug orders table failed:", error);
    }
  }

  /**
   * Create order in database
   */
  static async createOrder(orderData: Partial<OrderData>): Promise<OrderData> {
    try {
      // Debug in development
      if (import.meta.env.DEV) {
        console.log("🛠️ Development mode: Running orders table debug check");
        await this.debugOrdersTable();
      }

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

      console.log("✅ Order data validation passed:", {
        buyer_email: orderData.buyer_email,
        seller_id: orderData.seller_id,
        amount: orderData.amount,
        paystack_ref: orderData.paystack_ref,
        items_count: orderData.items.length,
      });

      // Prepare the order data for insertion
      const insertData = {
        buyer_email: orderData.buyer_email,
        seller_id: orderData.seller_id,
        amount: orderData.amount,
        paystack_ref: orderData.paystack_ref,
        items: orderData.items,
        status: "pending" as const,
        shipping_address: orderData.shipping_address || {},
        metadata: orderData.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("📤 Inserting order data:", insertData);

      const { data, error } = await supabase
        .from("orders")
        .insert([insertData])
        .select()
        .single();

      console.log("📥 Supabase response:", { data, error });

      if (error) {
        // Extract error details properly
        const errorDetails = {
          message: error.message || "No message",
          details: error.details || "No details",
          hint: error.hint || "No hint",
          code: error.code || "No code",
          type: typeof error,
          constructor: error?.constructor?.name || "Unknown",
        };

        console.error("❌ Database error details:", errorDetails);

        // Extract meaningful error message
        let errorMessage = this.extractErrorMessage(error);

        // Add context for common issues
        if (
          errorMessage.includes("RLS") ||
          errorMessage.includes("row-level security")
        ) {
          errorMessage +=
            " (Row Level Security policy issue - check user permissions)";
        } else if (
          errorMessage.includes("relation") &&
          errorMessage.includes("does not exist")
        ) {
          errorMessage += " (Table may not exist - check database migrations)";
        } else if (errorMessage.includes("violates check constraint")) {
          errorMessage += " (Data validation failed - check input values)";
        }

        throw new Error(`Failed to create order: ${errorMessage}`);
      }

      if (!data) {
        throw new Error(
          "Failed to create order: No data returned from database",
        );
      }

      return data;
    } catch (error) {
      console.error("Create order error:", error);

      // In development, create a mock order for testing
      if (import.meta.env.DEV) {
        console.warn(
          "🛠️ Database order creation failed in development, using mock order",
        );

        const mockOrder: OrderData = {
          id: `mock_${Date.now()}`,
          buyer_email: orderData.buyer_email || "test@example.com",
          seller_id: orderData.seller_id || "mock_seller",
          amount: orderData.amount || 10000,
          status: "pending",
          paystack_ref: orderData.paystack_ref || `mock_${Date.now()}`,
          items: orderData.items || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log("✅ Mock order created for development:", mockOrder);
        toast.warning("Using mock order for development testing");
        return mockOrder;
      }

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
        // Proper error message extraction
        let errorMessage = "Unknown error";

        if (error.message && typeof error.message === "string") {
          errorMessage = error.message;
        } else if (error.details && typeof error.details === "string") {
          errorMessage = error.details;
        } else if (typeof error === "string") {
          errorMessage = error;
        } else if (error && typeof error === "object") {
          try {
            errorMessage = JSON.stringify(error, null, 2);
          } catch (e) {
            errorMessage = error.toString();
          }
        }

        console.error("❌ Failed to update order status:", {
          reference,
          status,
          error: errorMessage,
        });

        throw new Error(`Failed to update order: ${errorMessage}`);
      }

      console.log("✅ Order status updated successfully:", {
        reference,
        status,
      });
    } catch (error) {
      console.error("Update order status error:", error);

      // In development, don't fail completely for order updates
      if (import.meta.env.DEV) {
        console.warn(
          "⚠️ Order status update failed in development mode, continuing...",
        );
        return; // Don't throw in dev mode
      }

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
      // Check if already loaded
      if ((window as any).PaystackPop) {
        console.log("PaystackPop already available");
        resolve();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector(
        'script[src="https://js.paystack.co/v1/inline.js"]',
      );
      if (existingScript) {
        console.log("Paystack script already loading, waiting...");
        existingScript.addEventListener("load", () => {
          console.log("Existing Paystack script loaded");
          resolve();
        });
        existingScript.addEventListener("error", (e) => {
          console.error("Existing Paystack script failed to load:", e);
          reject(new Error("Paystack script failed to load"));
        });
        return;
      }

      console.log("Loading Paystack script from CDN...");
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => {
        console.log("Paystack script loaded successfully");
        // Give it a moment to initialize
        setTimeout(() => {
          if ((window as any).PaystackPop) {
            console.log("PaystackPop is now available");
            resolve();
          } else {
            console.error("PaystackPop still not available after script load");
            console.log(
              "Available Paystack objects:",
              Object.keys(window).filter((key) =>
                key.toLowerCase().includes("paystack"),
              ),
            );
            reject(new Error("PaystackPop not available after script load"));
          }
        }, 100);
      };
      script.onerror = (error) => {
        console.error("Failed to load Paystack script:", error);
        reject(new Error("Failed to load Paystack script from CDN"));
      };
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
