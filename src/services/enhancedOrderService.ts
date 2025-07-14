import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type {
  Order,
  OrderNotification,
  Receipt,
  CreateOrderData,
  UpdateOrderData,
} from "@/types/orders";

export type { Order };

/**
 * Enhanced Order Service - Handles the new order system with notifications and receipts
 */

// Order Management Functions
export const createEnhancedOrder = async (
  orderData: CreateOrderData,
): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .insert([orderData])
      .select("*")
      .single();

    if (error) {
      console.error("Error creating enhanced order:", error);
      throw new Error(`Failed to create order: ${error.message}`);
    }

    // Manually fetch book data if needed
    if (data?.book_id) {
      const { data: bookData } = await supabase
        .from("books")
        .select("title, author, image_url")
        .eq("id", data.book_id)
        .single();

      if (bookData) {
        data.book = bookData;
      }
    }

    return data;
  } catch (error) {
    console.error("Error in createEnhancedOrder:", error);
    throw error;
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    // Manually fetch related data if needed
    if (data?.book_id) {
      const { data: bookData } = await supabase
        .from("books")
        .select("title, author, image_url")
        .eq("id", data.book_id)
        .single();

      if (bookData) {
        data.book = bookData;
      }
    }

    return data;
  } catch (error) {
    console.error("Error in getOrderById:", error);
    throw error;
  }
};

export const getOrderByReference = async (
  reference: string,
): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("paystack_reference", reference)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    // Manually fetch related data if needed
    if (data?.book_id) {
      const { data: bookData } = await supabase
        .from("books")
        .select("title, author, image_url")
        .eq("id", data.book_id)
        .single();

      if (bookData) {
        data.book = bookData;
      }
    }

    return data;
  } catch (error) {
    console.error("Error in getOrderByReference:", error);
    throw error;
  }
};

export const getUserOrders = async (
  userId: string,
  role: "buyer" | "seller" | "all" = "all",
): Promise<Order[]> => {
  try {
    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (role === "buyer") {
      query = query.eq("buyer_id", userId);
    } else if (role === "seller") {
      query = query.eq("seller_id", userId);
    } else {
      query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    // Manually fetch book data for each order
    if (data && data.length > 0) {
      for (const order of data) {
        if (order.book_id) {
          const { data: bookData } = await supabase
            .from("books")
            .select("title, author, image_url")
            .eq("id", order.book_id)
            .single();

          if (bookData) {
            order.book = bookData;
          }
        }
      }
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserOrders:", error);
    throw error;
  }
};

export const updateOrderStatus = async (
  orderId: string,
  updateData: UpdateOrderData,
): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select(
        `
        *,
        book:books(title, author, image_url),
        buyer:profiles!orders_buyer_id_fkey(name, email),
        seller:profiles!orders_seller_id_fkey(name, email)
      `,
      )
      .single();

    if (error) {
      throw new Error(`Failed to update order: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    throw error;
  }
};

// Commitment Functions
export const commitToOrder = async (orderId: string): Promise<Order> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const order = await getOrderById(orderId);
    if (!order || order.seller_id !== user.id) {
      throw new Error("Order not found or access denied");
    }

    if (order.status !== "paid" || order.payment_status !== "paid") {
      throw new Error("Order is not eligible for commitment");
    }

    const updatedOrder = await updateOrderStatus(orderId, {
      status: "committed",
      committed_at: new Date().toISOString(),
    });

    toast.success("Successfully committed to the order!");
    return updatedOrder;
  } catch (error) {
    console.error("Error in commitToOrder:", error);
    const message =
      error instanceof Error ? error.message : "Failed to commit to order";
    toast.error(message);
    throw error;
  }
};

export const cancelOrder = async (
  orderId: string,
  reason: string,
): Promise<Order> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const order = await getOrderById(orderId);
    if (!order) throw new Error("Order not found");

    const canCancel =
      (order.buyer_id === user.id || order.seller_id === user.id) &&
      !["shipped", "delivered", "cancelled", "refunded"].includes(order.status);

    if (!canCancel) {
      throw new Error("Order cannot be cancelled at this stage");
    }

    const updatedOrder = await updateOrderStatus(orderId, {
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
    });

    // Make book available again
    if (order.book_id) {
      await supabase
        .from("books")
        .update({ sold: false })
        .eq("id", order.book_id);
    }

    toast.success("Order cancelled successfully");
    return updatedOrder;
  } catch (error) {
    console.error("Error in cancelOrder:", error);
    const message =
      error instanceof Error ? error.message : "Failed to cancel order";
    toast.error(message);
    throw error;
  }
};

// Notification Functions
export const getUserNotifications = async (
  userId: string,
  unreadOnly = false,
): Promise<OrderNotification[]> => {
  try {
    let query = supabase
      .from("order_notifications")
      .select(
        `
        *,
        order:orders(id, amount, status)
      `,
      )
      .eq("user_id", userId)
      .order("sent_at", { ascending: false });

    if (unreadOnly) {
      query = query.eq("read", false);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserNotifications:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (
  notificationId: string,
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("order_notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (
  userId: string,
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("order_notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      throw new Error(`Failed to mark notifications as read: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in markAllNotificationsAsRead:", error);
    throw error;
  }
};

// Receipt Functions
export const getOrderReceipt = async (
  orderId: string,
): Promise<Receipt | null> => {
  try {
    const { data, error } = await supabase
      .from("receipts")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch receipt: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in getOrderReceipt:", error);
    throw error;
  }
};

export const generateReceiptForOrder = async (
  orderId: string,
): Promise<Receipt> => {
  try {
    const { data, error } = await supabase.rpc("generate_receipt_for_order", {
      order_id: orderId,
    });

    if (error) {
      throw new Error(`Failed to generate receipt: ${error.message}`);
    }

    // Fetch the generated receipt
    const receipt = await getOrderReceipt(orderId);
    if (!receipt) {
      throw new Error("Receipt was generated but could not be retrieved");
    }

    return receipt;
  } catch (error) {
    console.error("Error in generateReceiptForOrder:", error);
    throw error;
  }
};

// Admin Functions
export const getOrdersNeedingAttention = async (): Promise<Order[]> => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        book:books(title, author, image_url),
        buyer:profiles!orders_buyer_id_fkey(name, email),
        seller:profiles!orders_seller_id_fkey(name, email)
      `,
      )
      .or(
        `
        and(status.eq.paid,commit_deadline.lt.${now}),
        and(status.eq.committed,created_at.lt.${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()})
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(
        `Failed to fetch orders needing attention: ${error.message}`,
      );
    }

    return data || [];
  } catch (error) {
    console.error("Error in getOrdersNeedingAttention:", error);
    throw error;
  }
};

export const processOrderReminders = async (): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke(
      "process-order-reminders",
    );

    if (error) {
      throw new Error(`Failed to process order reminders: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in processOrderReminders:", error);
    throw error;
  }
};
