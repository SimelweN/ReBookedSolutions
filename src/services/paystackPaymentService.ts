/**
 * Comprehensive Paystack Payment Service
 * Handles payment initialization, verification, transfers, and recipient management
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PaystackSubaccountService } from "./paystackSubaccountService";

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
    author?: string;
    price: number;
    condition?: string;
    isbn?: string;
    image_url?: string;
    seller_id: string;
  }>;
  shipping_address?: any;
  delivery_address?: any;
  delivery_fee?: number;
  payment_data?: any;
  delivery_data?: any;
  metadata?: any;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export class PaystackPaymentService {
  private static readonly PAYSTACK_PUBLIC_KEY =
    import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

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
   * Extract meaningful error message from error object
   */
  private static extractErrorMessage(error: any): string {
    if (!error) return "Unknown error";

    // Handle string errors
    if (typeof error === "string") {
      return error;
    }

    // Handle Error objects
    if (error instanceof Error) {
      return error.message;
    }

    // Handle Supabase/PostgresError objects
    if (error && typeof error === "object") {
      // Try to get the most meaningful error message
      const priorities = [
        "message",
        "details",
        "hint",
        "description",
        "error_description",
        "error",
      ];

      for (const key of priorities) {
        if (error[key] && typeof error[key] === "string" && error[key].trim()) {
          return error[key];
        }
      }

      // Special handling for PostgreSQL errors
      if (error.code) {
        const pgError = `PostgreSQL Error ${error.code}`;
        if (error.details) {
          return `${pgError}: ${error.details}`;
        }
        if (error.message) {
          return `${pgError}: ${error.message}`;
        }
        return pgError;
      }

      // Try to get a readable representation
      try {
        // Filter out non-string properties for a cleaner JSON
        const cleanError = Object.fromEntries(
          Object.entries(error).filter(
            ([_, value]) =>
              typeof value === "string" ||
              typeof value === "number" ||
              typeof value === "boolean",
          ),
        );

        if (Object.keys(cleanError).length > 0) {
          return JSON.stringify(cleanError, null, 2);
        }

        return JSON.stringify(error, null, 2);
      } catch (e) {
        return `Error object could not be processed: ${error.toString()}`;
      }
    }

    return `Unknown error type: ${typeof error}`;
  }

  /**
   * Prepare payment with proper split configuration using subaccount service
   */
  static async preparePaymentWithSplit(
    sellerId: string,
    bookId: string,
    bookPrice: number,
    deliveryFee: number,
    buyerEmail: string,
  ): Promise<{ success: boolean; paymentData?: any; error?: string }> {
    try {
      const result = await PaystackSubaccountService.preparePaymentData(
        sellerId,
        bookId,
        bookPrice,
        deliveryFee,
        buyerEmail,
      );

      if (!result.success) {
        return result;
      }

      // Initialize payment through Supabase function
      const { data, error } = await supabase.functions.invoke(
        "initialize-paystack-payment",
        {
          body: result.paymentData,
        },
      );

      if (error) {
        return {
          success: false,
          error: error.message || "Failed to initialize payment",
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.message || "Payment initialization failed",
        };
      }

      return {
        success: true,
        paymentData: {
          authorization_url: data.data.authorization_url,
          access_code: data.data.access_code,
          reference: data.data.reference,
          amount: result.paymentData.amount,
          splitAmounts: result.paymentData.splitAmounts,
        },
      };
    } catch (error) {
      console.error("Error preparing payment with split:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Payment preparation failed",
      };
    }
  }

  /**
   * Initialize payment with Paystack Inline popup
   */
  static async initializePayment(params: PaymentInitialization): Promise<void> {
    if (!this.PAYSTACK_PUBLIC_KEY) {
      throw new Error("Paystack public key not configured");
    }

    console.log("🔍 Initializing Paystack payment...");

    // Ensure Paystack is loaded
    const isLoaded = await this.ensurePaystackLoaded();
    if (!isLoaded) {
      throw new Error(
        "Paystack payment library not available - all loading methods failed",
      );
    }

    // Get PaystackPop from global window object (simplest and most reliable)
    const PaystackPop = (window as any).PaystackPop;

    if (!PaystackPop) {
      console.error("❌ PaystackPop not available - script may not be loaded");
      throw new Error("Paystack payment library not available");
    }

    console.log(`✅ Using successful method: ${loadMethod}`);
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

        // Simulate real transaction behavior - mark books as sold
        await this.processPostPaymentActions(reference, data);

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

      console.log("�� Order data validation passed:", {
        buyer_email: orderData.buyer_email,
        seller_id: orderData.seller_id,
        amount: orderData.amount,
        paystack_ref: orderData.paystack_ref,
        items_count: orderData.items.length,
      });

      // Prepare the order data for insertion - using only essential fields
      const insertData = {
        buyer_email: orderData.buyer_email,
        seller_id: orderData.seller_id,
        amount: orderData.amount,
        paystack_ref: orderData.paystack_ref,
        status: "pending" as const,
        shipping_address: orderData.shipping_address || {},
        metadata: {
          ...orderData.metadata,
          // Store additional data in metadata for now
          book_id: orderData.book_id,
          book_title: orderData.book_title,
          book_price: orderData.book_price,
          delivery_fee: orderData.delivery_fee,
          seller_amount: orderData.seller_amount,
          courier_provider: orderData.courier_provider,
          courier_service: orderData.courier_service,
          delivery_quote: orderData.delivery_quote,
          seller_subaccount_code: orderData.seller_subaccount_code,
        },
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

        // Add context for common issues and handle missing table
        if (
          errorMessage.includes("relation") &&
          errorMessage.includes("orders") &&
          errorMessage.includes("does not exist")
        ) {
          console.error("❌ Orders table does not exist in database");

          // In development, return a mock order for testing
          if (import.meta.env.DEV) {
            console.warn(
              "🛠️ Using mock order for development since orders table is missing",
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

            toast.warning(
              "Using mock order - orders table missing from database",
            );
            return mockOrder;
          }

          throw new Error(
            "Orders table does not exist. Please run database migrations to create the orders table.",
          );
        } else if (
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

      // If status is "paid", implement payment holding and courier assignment
      if (status === "paid") {
        const collectionDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now
        updateData.collection_deadline = collectionDeadline.toISOString();
        updateData.payment_held = true; // Flag to indicate payment is held pending collection
        updateData.seller_notified_at = new Date().toISOString(); // Track when seller was notified

        console.log(
          "💰 Payment held until courier collection. Deadline:",
          collectionDeadline.toLocaleString(),
        );
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("paystack_ref", reference);

      if (error) {
        const errorMessage = this.extractErrorMessage(error);

        console.error("❌ Failed to update order status:", {
          reference,
          status,
          error: errorMessage,
        });

        // Handle missing orders table
        if (
          errorMessage.includes("relation") &&
          errorMessage.includes("orders") &&
          errorMessage.includes("does not exist")
        ) {
          console.warn(
            "⚠️ Orders table does not exist, skipping status update",
          );

          if (import.meta.env.DEV) {
            console.warn(
              "⚠️ Skipping order status update due to missing orders table",
            );
            return;
          }
        }

        throw new Error(`Failed to update order: ${errorMessage}`);
      }

      console.log("✅ Order status updated successfully:", {
        reference,
        status,
      });

      // If payment is successful, automatically assign courier
      if (status === "paid") {
        try {
          // Get the order details to extract courier information from metadata
          const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("id, metadata")
            .eq("paystack_ref", reference)
            .single();

          if (!orderError && order && order.metadata) {
            const metadata = order.metadata as any;
            // Only assign courier if one was selected during checkout
            if (metadata.courier_provider && metadata.courier_service) {
              console.log("🚚 Auto-assigning courier after payment...");

              const courierAssigned =
                await CourierAssignmentService.assignCourierToOrder(
                  order.id,
                  metadata.courier_provider,
                  metadata.courier_service,
                  metadata.delivery_quote,
                );

              if (courierAssigned) {
                console.log("✅ Courier automatically assigned after payment");
                toast.success(
                  "Payment successful! Courier has been notified for pickup.",
                );
              } else {
                console.warn("⚠️ Failed to assign courier automatically");
                toast.warning(
                  "Payment successful! Please contact support for delivery arrangement.",
                );
              }
            } else {
              console.log(
                "ℹ️ No courier selected - manual arrangement required",
              );
            }
          }
        } catch (courierError) {
          console.error("Error assigning courier after payment:", courierError);
          // Don't fail the entire payment process if courier assignment fails
        }
      }
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
   * Process post-payment actions to simulate real transaction behavior
   */
  static async processPostPaymentActions(
    reference: string,
    paymentData: any,
  ): Promise<void> {
    try {
      console.log("🔄 Processing post-payment actions for:", reference);

      // Get order details
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("paystack_ref", reference)
        .single();

      if (orderError || !order) {
        console.warn(
          "Could not find order for post-payment processing:",
          reference,
        );
        return;
      }

      // Extract book information from metadata
      const metadata = order.metadata as any;
      const bookId = metadata?.book_id;

      if (bookId) {
        // Mark book as sold to simulate real transaction
        console.log("📚 Marking book as sold:", bookId);

        const { error: bookUpdateError } = await supabase
          .from("books")
          .update({
            sold: true,
            available: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", bookId);

        if (bookUpdateError) {
          console.error("Failed to mark book as sold:", bookUpdateError);
        } else {
          console.log("✅ Book marked as sold successfully");
        }

        // Create transaction record
        try {
          const transactionData = {
            book_id: bookId,
            book_title: metadata?.book_title || "Unknown Book",
            buyer_id: order.buyer_id,
            seller_id: order.seller_id,
            price: metadata?.book_price || order.amount,
            commission: Math.round(
              (metadata?.book_price || order.amount) * 0.1,
            ), // 10% commission
          };

          const { error: transactionError } = await supabase
            .from("transactions")
            .insert(transactionData);

          if (transactionError) {
            console.warn(
              "Could not create transaction record:",
              transactionError,
            );
          } else {
            console.log("���� Transaction record created");
          }
        } catch (transactionError) {
          console.warn("Transaction record creation failed:", transactionError);
        }
      }

      console.log("✅ Post-payment actions completed for:", reference);
    } catch (error) {
      console.error("Error in post-payment actions:", error);
      // Don't throw error as this shouldn't fail the payment
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
        const errorMessage = this.extractErrorMessage(error);

        // Handle missing orders table
        if (
          errorMessage.includes("relation") &&
          errorMessage.includes("orders") &&
          errorMessage.includes("does not exist")
        ) {
          console.warn("❌ Orders table does not exist, returning empty array");

          if (import.meta.env.DEV) {
            toast.warning("Orders table missing - returning empty results");
          }

          return [];
        }

        throw new Error(`Failed to fetch orders: ${errorMessage}`);
      }

      return data || [];
    } catch (error) {
      console.error("Get orders by status error:", error);

      // In development, return empty array to prevent app crashes
      if (
        import.meta.env.DEV &&
        error instanceof Error &&
        error.message.includes("does not exist")
      ) {
        console.warn("⚠️ Returning empty orders array due to missing table");
        return [];
      }

      throw error;
    }
  }

  /**
   * Get orders for a specific user (buyer)
   */
  static async getUserOrders(userEmail: string): Promise<OrderData[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("buyer_email", userEmail)
        .order("created_at", { ascending: false });

      if (error) {
        const errorMessage = this.extractErrorMessage(error);

        // Handle missing orders table
        if (
          errorMessage.includes("relation") &&
          errorMessage.includes("orders") &&
          errorMessage.includes("does not exist")
        ) {
          console.warn("❌ Orders table does not exist, returning empty array");

          if (import.meta.env.DEV) {
            toast.warning("Orders table missing - returning empty user orders");
          }

          return [];
        }

        throw new Error(`Failed to fetch user orders: ${errorMessage}`);
      }

      return data || [];
    } catch (error) {
      console.error("Get user orders error:", error);

      // In development, return empty array to prevent app crashes
      if (
        import.meta.env.DEV &&
        error instanceof Error &&
        error.message.includes("does not exist")
      ) {
        console.warn(
          "⚠️ Returning empty user orders array due to missing table",
        );
        return [];
      }

      throw error;
    }
  }

  /**
   * Get specific order by ID or reference for current user
   */
  static async getUserOrder(
    userEmail: string,
    orderIdOrReference: string,
  ): Promise<OrderData | null> {
    try {
      // Check if the input looks like a UUID (36 chars with dashes)
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          orderIdOrReference,
        );

      let query = supabase
        .from("orders")
        .select("*")
        .eq("buyer_email", userEmail);

      if (isUuid) {
        // If it's a UUID, search by ID first, then fallback to paystack_ref
        query = query.or(
          `id.eq.${orderIdOrReference},paystack_ref.eq.${orderIdOrReference}`,
        );
      } else {
        // If it's not a UUID (like Paystack reference), only search by paystack_ref
        query = query.eq("paystack_ref", orderIdOrReference);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === "PGRST116") {
          // Order not found - this is normal
          return null;
        }

        const errorMessage = this.extractErrorMessage(error);

        // Handle missing orders table
        if (
          errorMessage.includes("relation") &&
          errorMessage.includes("orders") &&
          errorMessage.includes("does not exist")
        ) {
          console.warn("❌ Orders table does not exist");

          if (import.meta.env.DEV) {
            toast.warning("Orders table missing - cannot fetch order");
          }

          return null;
        }

        throw new Error(`Failed to fetch order: ${errorMessage}`);
      }

      return data;
    } catch (error) {
      console.error("Get user order error:", error);

      // In development, return null to prevent app crashes
      if (
        import.meta.env.DEV &&
        error instanceof Error &&
        error.message.includes("does not exist")
      ) {
        console.warn("⚠️ Returning null order due to missing table");
        return null;
      }

      throw error;
    }
  }

  /**
   * Release payment to seller when courier collection is confirmed
   */
  static async releasePaymentAfterCollection(
    orderId: string,
    collectionData?: {
      collected_at?: string;
      courier_reference?: string;
      tracking_number?: string;
    },
  ): Promise<void> {
    try {
      console.log(
        "📦 Releasing payment after courier collection for order:",
        orderId,
      );

      const updateData: any = {
        status: "ready_for_payout",
        payment_held: false,
        collection_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (collectionData) {
        updateData.collected_at =
          collectionData.collected_at || new Date().toISOString();
        updateData.courier_reference = collectionData.courier_reference;
        updateData.tracking_number = collectionData.tracking_number;
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) {
        throw new Error(`Failed to release payment: ${error.message}`);
      }

      console.log("✅ Payment released successfully for order:", orderId);

      // Trigger actual Paystack transfer to seller's subaccount
      await this.initiateSellerPayout(orderId);
    } catch (error) {
      console.error("Error releasing payment:", error);
      throw error;
    }
  }

  /**
   * Initiate seller payout via Paystack transfer
   */
  private static async initiateSellerPayout(orderId: string): Promise<void> {
    try {
      console.log("🔄 Initiating seller payout for order:", orderId);

      // Get order details with seller information
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select(
          `
          id,
          seller_id,
          seller_amount,
          seller_subaccount_code,
          book_title,
          paystack_ref,
          profiles!orders_seller_id_fkey(full_name)
        `,
        )
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        throw new Error(`Order not found: ${orderError?.message}`);
      }

      if (!order.seller_subaccount_code) {
        throw new Error(
          `No subaccount code found for seller ${order.seller_id}`,
        );
      }

      // Create payout request
      const payoutRequest = {
        orderId: order.id,
        sellerId: order.seller_id,
        subaccountCode: order.seller_subaccount_code,
        amount: order.seller_amount,
        reference: `payout_${order.id}_${Date.now()}`,
        reason: `Payment for "${order.book_title}" sale`,
      };

      // Execute transfer via PaystackTransferService
      await PaystackTransferService.transferToSeller(payoutRequest);

      // Update order to mark payout completed
      await supabase
        .from("orders")
        .update({
          payment_held: false,
          payout_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      console.log("✅ Seller payout completed for order:", orderId);
    } catch (error) {
      console.error("❌ Seller payout failed:", error);

      // Mark payout as failed
      await supabase
        .from("orders")
        .update({
          payout_failed_at: new Date().toISOString(),
          payout_retry_count: supabase.rpc("increment_retry_count", {
            order_id: orderId,
          }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      throw error;
    }
  }

  /**
   * Handle expired collection deadline (automatic refund)
   */
  static async handleExpiredCollection(orderId: string): Promise<void> {
    try {
      console.log(
        "⏰ Handling expired collection deadline for order:",
        orderId,
      );

      const { error } = await supabase
        .from("orders")
        .update({
          status: "failed",
          payment_held: false,
          expired_at: new Date().toISOString(),
          refund_initiated: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) {
        throw new Error(
          `Failed to handle expired collection: ${error.message}`,
        );
      }

      console.log(
        "✅ Collection deadline expired, refund initiated for order:",
        orderId,
      );

      // Trigger automatic refund via Paystack API
      await this.processRefund(orderId, order.paystack_ref, order.amount);
    } catch (error) {
      console.error("Error handling expired collection:", error);
      throw error;
    }
  }

  /**
   * Process refund via Paystack API
   */
  private static async processRefund(
    orderId: string,
    paystackRef: string,
    amount: number,
  ): Promise<void> {
    try {
      console.log("��� Processing refund for order:", orderId);

      // Get Paystack secret key from environment
      const secretKey = ENV.VITE_PAYSTACK_SECRET_KEY;
      if (!secretKey) {
        throw new Error("Paystack secret key not configured");
      }

      // Call Paystack refund API
      const response = await fetch("https://api.paystack.co/refund", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction: paystackRef,
          amount: Math.round(amount * 100), // Convert to kobo
          currency: "ZAR",
          customer_note: "Refund for expired collection deadline",
          merchant_note: `Refund for order ${orderId} - collection deadline expired`,
        }),
      });

      const result = await response.json();

      if (!result.status) {
        throw new Error(`Refund failed: ${result.message}`);
      }

      // Update order with refund details
      await supabase
        .from("orders")
        .update({
          refund_completed_at: new Date().toISOString(),
          refund_reference: result.data?.reference || "",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      console.log("✅ Refund processed successfully:", result.data);
    } catch (error) {
      console.error("❌ Refund processing failed:", error);

      // Mark refund as failed
      await supabase
        .from("orders")
        .update({
          refund_failed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

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
        const errorMessage = this.extractErrorMessage(error);

        // Handle missing orders table
        if (
          errorMessage.includes("relation") &&
          errorMessage.includes("orders") &&
          errorMessage.includes("does not exist")
        ) {
          console.warn(
            "❌ Orders table does not exist, returning zero earnings",
          );

          if (import.meta.env.DEV) {
            toast.warning("Orders table missing - returning zero earnings");
          }

          return {
            total: 0,
            paid: 0,
            pending: 0,
            ready: 0,
          };
        }

        throw new Error(`Failed to fetch earnings: ${errorMessage}`);
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
