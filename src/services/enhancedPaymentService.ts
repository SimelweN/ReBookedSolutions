import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  createOrder,
  updateOrderStatus,
  type CreateOrderData,
} from "./orderManagementService";

export interface PaymentVerificationResult {
  success: boolean;
  message: string;
  orderId?: string;
  reference?: string;
  amount?: number;
  status?: "success" | "failed" | "pending";
}

export interface PaymentInitiationData {
  buyerEmail: string;
  buyerId: string;
  sellerId: string;
  bookId: string;
  bookPrice: number;
  deliveryFee?: number;
  shippingAddress?: any;
  deliveryService?: string;
  sellerSubaccountCode?: string;
}

/**
 * Initialize a payment with comprehensive order tracking
 */
export const initializePaymentWithOrder = async (
  data: PaymentInitiationData,
): Promise<{
  authorization_url: string;
  access_code: string;
  reference: string;
}> => {
  try {
    const totalAmount = data.bookPrice + (data.deliveryFee || 0);
    const platformFee = Math.round(data.bookPrice * 0.1); // 10% platform fee

    // Generate unique reference
    const reference = `rbs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Call Supabase Edge Function to initialize payment
    const { data: response, error } = await supabase.functions.invoke(
      "initialize-paystack-payment",
      {
        body: {
          email: data.buyerEmail,
          amount: Math.round(totalAmount * 100), // Convert to kobo
          reference,
          subaccount: data.sellerSubaccountCode,
          metadata: {
            buyer_id: data.buyerId,
            seller_id: data.sellerId,
            book_id: data.bookId,
            book_price: data.bookPrice,
            delivery_fee: data.deliveryFee || 0,
            platform_fee: platformFee,
            shipping_address: data.shippingAddress,
            delivery_service: data.deliveryService,
          },
          callback_url: `${window.location.origin}/payment-callback`,
        },
      },
    );

    if (error) {
      console.error("Payment initialization error:", error);
      throw new Error(`Payment initialization failed: ${error.message}`);
    }

    if (!response?.success) {
      throw new Error(response?.message || "Payment initialization failed");
    }

    // Store payment intention in database for tracking
    await supabase.from("payment_intentions").insert([
      {
        reference,
        buyer_id: data.buyerId,
        seller_id: data.sellerId,
        book_id: data.bookId,
        amount: Math.round(totalAmount * 100),
        book_price: Math.round(data.bookPrice * 100),
        delivery_fee: Math.round((data.deliveryFee || 0) * 100),
        platform_fee: Math.round(platformFee * 100),
        status: "pending",
        metadata: {
          shipping_address: data.shippingAddress,
          delivery_service: data.deliveryService,
          seller_subaccount_code: data.sellerSubaccountCode,
        },
      },
    ]);

    return {
      authorization_url: response.data.authorization_url,
      access_code: response.data.access_code,
      reference: response.data.reference,
    };
  } catch (error) {
    console.error("Error in initializePaymentWithOrder:", error);
    const message =
      error instanceof Error ? error.message : "Payment initialization failed";
    toast.error(message);
    throw error;
  }
};

/**
 * Verify payment and create order
 */
export const verifyPaymentAndCreateOrder = async (
  reference: string,
): Promise<PaymentVerificationResult> => {
  try {
    // First, call the verification Edge Function
    const { data: response, error } = await supabase.functions.invoke(
      "verify-paystack-payment",
      {
        body: { reference },
      },
    );

    if (error) {
      console.error("Payment verification error:", error);
      return {
        success: false,
        message: `Payment verification failed: ${error.message}`,
      };
    }

    if (!response?.success) {
      return {
        success: false,
        message: response?.message || "Payment verification failed",
      };
    }

    const paymentData = response.data;

    // Check if payment was successful
    if (paymentData.status !== "success") {
      await updatePaymentIntention(reference, "failed");
      return {
        success: false,
        message: "Payment was not successful",
        reference,
        status: paymentData.status,
      };
    }

    // Get the payment intention
    const { data: intention, error: intentionError } = await supabase
      .from("payment_intentions")
      .select("*")
      .eq("reference", reference)
      .single();

    if (intentionError || !intention) {
      console.error("Payment intention not found:", intentionError);
      return {
        success: false,
        message: "Payment intention not found",
        reference,
      };
    }

    // Check if order already exists
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("paystack_reference", reference)
      .single();

    if (existingOrder) {
      return {
        success: true,
        message: "Order already created",
        orderId: existingOrder.id,
        reference,
        amount: paymentData.amount / 100,
        status: "success",
      };
    }

    // Create the order
    const orderData: CreateOrderData = {
      buyer_id: intention.buyer_id,
      seller_id: intention.seller_id,
      book_id: intention.book_id,
      paystack_reference: reference,
      total_amount: intention.amount,
      book_price: intention.book_price,
      delivery_fee: intention.delivery_fee || 0,
      platform_fee: intention.platform_fee,
      shipping_address: intention.metadata?.shipping_address,
      delivery_service: intention.metadata?.delivery_service,
      seller_subaccount_code: intention.metadata?.seller_subaccount_code,
      metadata: {
        paystack_data: paymentData,
        verified_at: new Date().toISOString(),
      },
    };

    const order = await createOrder(orderData);

    // Update payment intention status
    await updatePaymentIntention(reference, "completed", order.id);

    // Send notifications (implement as needed)
    await notifyPaymentSuccess(order);

    return {
      success: true,
      message: "Payment verified and order created successfully",
      orderId: order.id,
      reference,
      amount: paymentData.amount / 100,
      status: "success",
    };
  } catch (error) {
    console.error("Error in verifyPaymentAndCreateOrder:", error);
    await updatePaymentIntention(reference, "failed");

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Payment verification failed",
      reference,
    };
  }
};

/**
 * Update payment intention status
 */
const updatePaymentIntention = async (
  reference: string,
  status: string,
  orderId?: string,
) => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (orderId) {
      updateData.order_id = orderId;
    }

    await supabase
      .from("payment_intentions")
      .update(updateData)
      .eq("reference", reference);
  } catch (error) {
    console.error("Error updating payment intention:", error);
  }
};

/**
 * Send notifications after successful payment
 */
const notifyPaymentSuccess = async (order: any) => {
  try {
    // Create notifications for buyer and seller
    const notifications = [
      {
        user_id: order.buyer_id,
        title: "Payment Successful",
        message: `Your payment for "${order.book?.title}" has been processed. The seller will prepare your book for collection.`,
        type: "payment_success",
        metadata: { order_id: order.id },
      },
      {
        user_id: order.seller_id,
        title: "New Sale",
        message: `You have a new sale for "${order.book?.title}". Please prepare the book for courier collection within 48 hours.`,
        type: "new_sale",
        metadata: { order_id: order.id },
      },
    ];

    await supabase.from("notifications").insert(notifications);
  } catch (error) {
    console.error("Error sending notifications:", error);
    // Don't throw - notifications are not critical
  }
};

/**
 * Handle payment timeout/abandonment
 */
export const handlePaymentTimeout = async (
  reference: string,
): Promise<void> => {
  try {
    await updatePaymentIntention(reference, "abandoned");

    // Make book available again if it was reserved
    const { data: intention } = await supabase
      .from("payment_intentions")
      .select("book_id")
      .eq("reference", reference)
      .single();

    if (intention) {
      await supabase
        .from("books")
        .update({ sold: false, available: true })
        .eq("id", intention.book_id);
    }
  } catch (error) {
    console.error("Error handling payment timeout:", error);
  }
};

/**
 * Get payment status for a reference
 */
export const getPaymentStatus = async (
  reference: string,
): Promise<{
  status: string;
  order_id?: string;
  message?: string;
}> => {
  try {
    const { data: intention, error } = await supabase
      .from("payment_intentions")
      .select("status, order_id, metadata")
      .eq("reference", reference)
      .single();

    if (error || !intention) {
      return {
        status: "not_found",
        message: "Payment reference not found",
      };
    }

    return {
      status: intention.status,
      order_id: intention.order_id,
    };
  } catch (error) {
    console.error("Error getting payment status:", error);
    return {
      status: "error",
      message: "Failed to check payment status",
    };
  }
};

/**
 * Process refund for cancelled orders
 */
export const processRefund = async (
  orderId: string,
  reason: string,
): Promise<boolean> => {
  try {
    const { data: order, error } = await supabase
      .from("orders")
      .select("paystack_reference, total_amount, status")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      throw new Error("Order not found");
    }

    if (!["paid", "awaiting_collection"].includes(order.status)) {
      throw new Error("Order cannot be refunded at this stage");
    }

    // Call refund Edge Function
    const { data: response, error: refundError } =
      await supabase.functions.invoke("process-refund", {
        body: {
          reference: order.paystack_reference,
          amount: order.total_amount,
          reason,
        },
      });

    if (refundError || !response?.success) {
      throw new Error(response?.message || "Refund processing failed");
    }

    // Update order status
    await updateOrderStatus(orderId, "refunded", {
      refund_reason: reason,
      refund_reference: response.data.reference,
      refunded_at: new Date().toISOString(),
    });

    // Make book available again
    await supabase
      .from("books")
      .update({ sold: false, available: true })
      .eq("id", order.book_id);

    toast.success("Refund processed successfully");
    return true;
  } catch (error) {
    console.error("Error processing refund:", error);
    const message =
      error instanceof Error ? error.message : "Refund processing failed";
    toast.error(message);
    return false;
  }
};
