import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Order {
  id: string;
  transaction_id?: string;
  buyer_id: string;
  seller_id: string;
  book_id: string;
  paystack_reference: string;
  total_amount: number; // in kobo
  book_price: number; // in kobo
  delivery_fee: number; // in kobo
  platform_fee: number; // in kobo
  seller_amount: number; // in kobo
  status: OrderStatus;
  collection_deadline?: string;
  delivery_deadline?: string;
  shipping_address?: any;
  delivery_service?: string;
  delivery_tracking_number?: string;
  delivery_quote_info?: any;
  seller_subaccount_code?: string;
  metadata?: any;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  collected_at?: string;
  delivered_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  refunded_at?: string;
  // Joined data
  book?: {
    title: string;
    author: string;
    imageUrl?: string;
  };
  buyer?: {
    name: string;
    email: string;
  };
  seller?: {
    name: string;
    email: string;
  };
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "awaiting_collection"
  | "collected"
  | "in_transit"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded"
  | "expired";

export interface CreateOrderData {
  buyer_id: string;
  seller_id: string;
  book_id: string;
  paystack_reference: string;
  total_amount: number;
  book_price: number;
  delivery_fee?: number;
  platform_fee?: number;
  shipping_address?: any;
  delivery_service?: string;
  seller_subaccount_code?: string;
  metadata?: any;
}

/**
 * Create a new order after successful payment
 */
export const createOrder = async (
  orderData: CreateOrderData,
): Promise<Order> => {
  try {
    const platformFee =
      orderData.platform_fee || Math.round(orderData.book_price * 0.1); // 10% platform fee
    const sellerAmount = orderData.book_price - platformFee;

    // Set collection deadline to 48 hours from now
    const collectionDeadline = new Date();
    collectionDeadline.setHours(collectionDeadline.getHours() + 48);

    // Set delivery deadline to 5 business days from collection
    const deliveryDeadline = new Date();
    deliveryDeadline.setDate(deliveryDeadline.getDate() + 7); // 7 days for safety

    const order = {
      ...orderData,
      platform_fee: platformFee,
      seller_amount: sellerAmount,
      status: "paid" as OrderStatus,
      collection_deadline: collectionDeadline.toISOString(),
      delivery_deadline: deliveryDeadline.toISOString(),
      paid_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("orders")
      .insert([order])
      .select(
        `
        *,
        book:books(title, author, imageUrl),
        buyer:profiles!orders_buyer_id_fkey(name, email),
        seller:profiles!orders_seller_id_fkey(name, email)
      `,
      )
      .single();

    if (error) {
      console.error("Error creating order:", error);
      throw new Error(`Failed to create order: ${error.message}`);
    }

    // Update book status to sold
    await supabase
      .from("books")
      .update({ sold: true, available: false })
      .eq("id", orderData.book_id);

    return data;
  } catch (error) {
    console.error("Error in createOrder:", error);
    throw error;
  }
};

/**
 * Get orders for a specific user (buyer or seller)
 */
export const getUserOrders = async (
  userId: string,
  role: "buyer" | "seller" | "all" = "all",
): Promise<Order[]> => {
  try {
    // First, try to check if orders table exists with a simple query
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
      console.error("Error fetching user orders:", error);

      // If orders table doesn't exist, return empty array instead of throwing
      if (
        error.message?.includes("relation") &&
        error.message?.includes("does not exist")
      ) {
        console.warn("Orders table does not exist - returning empty array");
        return [];
      }

      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    // Return the basic order data - we'll enhance with relationships later if needed
    return (data || []).map((order) => ({
      ...order,
      // Add some mock data for now to prevent UI errors
      book: order.book || { title: "Unknown Book", author: "Unknown Author" },
      buyer: order.buyer || { name: "Unknown Buyer", email: "" },
      seller: order.seller || { name: "Unknown Seller", email: "" },
    }));
  } catch (error) {
    console.error("Error in getUserOrders:", error);

    // Return empty array instead of throwing to prevent app crashes
    console.warn("Returning empty orders array due to error");
    return [];
  }
};

/**
 * Get a specific order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        book:books(title, author, imageUrl),
        buyer:profiles!orders_buyer_id_fkey(name, email),
        seller:profiles!orders_seller_id_fkey(name, email)
      `,
      )
      .eq("id", orderId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Order not found
      }
      console.error("Error fetching order:", error);
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in getOrderById:", error);
    throw error;
  }
};

/**
 * Get order by Paystack reference
 */
export const getOrderByReference = async (
  reference: string,
): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        book:books(title, author, imageUrl),
        buyer:profiles!orders_buyer_id_fkey(name, email),
        seller:profiles!orders_seller_id_fkey(name, email)
      `,
      )
      .eq("paystack_reference", reference)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Order not found
      }
      console.error("Error fetching order by reference:", error);
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in getOrderByReference:", error);
    throw error;
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  metadata?: any,
): Promise<Order> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Set appropriate timestamp based on status
    switch (status) {
      case "collected":
        updateData.collected_at = new Date().toISOString();
        break;
      case "delivered":
        updateData.delivered_at = new Date().toISOString();
        break;
      case "completed":
        updateData.completed_at = new Date().toISOString();
        break;
      case "cancelled":
        updateData.cancelled_at = new Date().toISOString();
        break;
      case "refunded":
        updateData.refunded_at = new Date().toISOString();
        break;
    }

    if (metadata) {
      updateData.metadata = metadata;
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select(
        `
        *,
        book:books(title, author, imageUrl),
        buyer:profiles!orders_buyer_id_fkey(name, email),
        seller:profiles!orders_seller_id_fkey(name, email)
      `,
      )
      .single();

    if (error) {
      console.error("Error updating order status:", error);
      throw new Error(`Failed to update order: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    throw error;
  }
};

/**
 * Mark order as collected (seller confirms courier pickup)
 */
export const confirmCollection = async (
  orderId: string,
  trackingNumber?: string,
): Promise<Order> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Verify user is the seller
    const order = await getOrderById(orderId);
    if (!order || order.seller_id !== user.id) {
      throw new Error("Order not found or access denied");
    }

    const updateData: any = {
      status: "collected" as OrderStatus,
      collected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (trackingNumber) {
      updateData.delivery_tracking_number = trackingNumber;
      updateData.status = "in_transit" as OrderStatus;
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select(
        `
        *,
        book:books(title, author, imageUrl),
        buyer:profiles!orders_buyer_id_fkey(name, email),
        seller:profiles!orders_seller_id_fkey(name, email)
      `,
      )
      .single();

    if (error) {
      console.error("Error confirming collection:", error);
      throw new Error(`Failed to confirm collection: ${error.message}`);
    }

    toast.success("Collection confirmed successfully");
    return data;
  } catch (error) {
    console.error("Error in confirmCollection:", error);
    const message =
      error instanceof Error ? error.message : "Failed to confirm collection";
    toast.error(message);
    throw error;
  }
};

/**
 * Mark order as delivered (buyer confirms receipt)
 */
export const confirmDelivery = async (orderId: string): Promise<Order> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Verify user is the buyer
    const order = await getOrderById(orderId);
    if (!order || order.buyer_id !== user.id) {
      throw new Error("Order not found or access denied");
    }

    const { data, error } = await supabase
      .from("orders")
      .update({
        status: "delivered" as OrderStatus,
        delivered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select(
        `
        *,
        book:books(title, author, imageUrl),
        buyer:profiles!orders_buyer_id_fkey(name, email),
        seller:profiles!orders_seller_id_fkey(name, email)
      `,
      )
      .single();

    if (error) {
      console.error("Error confirming delivery:", error);
      throw new Error(`Failed to confirm delivery: ${error.message}`);
    }

    toast.success("Delivery confirmed successfully");
    return data;
  } catch (error) {
    console.error("Error in confirmDelivery:", error);
    const message =
      error instanceof Error ? error.message : "Failed to confirm delivery";
    toast.error(message);
    throw error;
  }
};

/**
 * Cancel an order
 */
export const cancelOrder = async (
  orderId: string,
  reason: string,
): Promise<Order> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Get the order
    const order = await getOrderById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Check if user can cancel (buyer or seller, and order not yet collected)
    const canCancel =
      (order.buyer_id === user.id || order.seller_id === user.id) &&
      ![
        "collected",
        "in_transit",
        "delivered",
        "completed",
        "cancelled",
        "refunded",
      ].includes(order.status);

    if (!canCancel) {
      throw new Error("Order cannot be cancelled at this stage");
    }

    const { data, error } = await supabase
      .from("orders")
      .update({
        status: "cancelled" as OrderStatus,
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select(
        `
        *,
        book:books(title, author, imageUrl),
        buyer:profiles!orders_buyer_id_fkey(name, email),
        seller:profiles!orders_seller_id_fkey(name, email)
      `,
      )
      .single();

    if (error) {
      console.error("Error cancelling order:", error);
      throw new Error(`Failed to cancel order: ${error.message}`);
    }

    // Make book available again
    await supabase
      .from("books")
      .update({ sold: false, available: true })
      .eq("id", order.book_id);

    toast.success("Order cancelled successfully");
    return data;
  } catch (error) {
    console.error("Error in cancelOrder:", error);
    const message =
      error instanceof Error ? error.message : "Failed to cancel order";
    toast.error(message);
    throw error;
  }
};

/**
 * Get orders that need attention (expired, overdue, etc.)
 */
export const getOrdersNeedingAttention = async (): Promise<Order[]> => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        book:books(title, author, imageUrl),
        buyer:profiles!orders_buyer_id_fkey(name, email),
        seller:profiles!orders_seller_id_fkey(name, email)
      `,
      )
      .or(
        `
        and(status.eq.paid,collection_deadline.lt.${now}),
        and(status.eq.awaiting_collection,collection_deadline.lt.${now}),
        and(status.in.(collected,in_transit),delivery_deadline.lt.${now})
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders needing attention:", error);
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Error in getOrdersNeedingAttention:", error);
    throw error;
  }
};

/**
 * Admin function to get all orders with filters
 */
export const getAllOrders = async (
  status?: OrderStatus,
  limit: number = 50,
  offset: number = 0,
): Promise<Order[]> => {
  try {
    let query = supabase
      .from("orders")
      .select(
        `
        *,
        book:books(title, author, imageUrl),
        buyer:profiles!orders_buyer_id_fkey(name, email),
        seller:profiles!orders_seller_id_fkey(name, email)
      `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching all orders:", error);
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    throw error;
  }
};
