import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OrderNotification {
  id?: string;
  user_id: string;
  type:
    | "order_created"
    | "order_committed"
    | "order_cancelled"
    | "order_shipped"
    | "order_delivered"
    | "payment_successful"
    | "seller_commit_reminder";
  title: string;
  message: string;
  data?: any;
  read?: boolean;
  created_at?: string;
}

export class OrderNotificationService {
  /**
   * Create a notification for order events
   */
  static async createOrderNotification(
    notification: OrderNotification,
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from("notifications").insert([
        {
          user_id: notification.user_id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data || {},
          read: false,
        },
      ]);

      if (error) {
        console.error("Error creating notification:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Exception creating notification:", error);
      return false;
    }
  }

  /**
   * Notify buyer when payment is successful
   */
  static async notifyPaymentSuccessful(orderData: {
    buyer_email: string;
    order_id: string;
    book_title: string;
    amount: number;
  }): Promise<void> {
    try {
      await this.createOrderNotification({
        user_id: orderData.buyer_email, // In production, this should be buyer_id
        type: "payment_successful",
        title: "Payment Successful!",
        message: `Your payment for "${orderData.book_title}" has been confirmed. Total: R${(orderData.amount / 100).toFixed(2)}`,
        data: {
          order_id: orderData.order_id,
          book_title: orderData.book_title,
          amount: orderData.amount,
          order_type: "buyer",
        },
      });
    } catch (error) {
      console.error("Error notifying payment successful:", error);
    }
  }

  /**
   * Notify seller about new order requiring commitment
   */
  static async notifySellerNewOrder(orderData: {
    seller_id: string;
    order_id: string;
    book_title: string;
    buyer_email: string;
    amount: number;
    deadline: string;
  }): Promise<void> {
    try {
      await this.createOrderNotification({
        user_id: orderData.seller_id,
        type: "order_created",
        title: "New Order - Please Commit",
        message: `You have a new order for "${orderData.book_title}". Please commit within 48 hours to confirm fulfillment.`,
        data: {
          order_id: orderData.order_id,
          book_title: orderData.book_title,
          buyer_email: orderData.buyer_email,
          amount: orderData.amount,
          deadline: orderData.deadline,
          order_type: "seller",
        },
      });
    } catch (error) {
      console.error("Error notifying seller new order:", error);
    }
  }

  /**
   * Notify buyer that seller has committed to order
   */
  static async notifyOrderCommitted(orderData: {
    buyer_email: string;
    order_id: string;
    book_title: string;
    seller_name?: string;
  }): Promise<void> {
    try {
      await this.createOrderNotification({
        user_id: orderData.buyer_email, // In production, this should be buyer_id
        type: "order_committed",
        title: "Order Confirmed by Seller",
        message: `Great news! The seller has committed to your order for "${orderData.book_title}". Your book will be prepared for delivery.`,
        data: {
          order_id: orderData.order_id,
          book_title: orderData.book_title,
          seller_name: orderData.seller_name,
          order_type: "buyer",
        },
      });
    } catch (error) {
      console.error("Error notifying order committed:", error);
    }
  }

  /**
   * Notify buyer when order is cancelled by seller
   */
  static async notifyOrderCancelled(orderData: {
    buyer_email: string;
    order_id: string;
    book_title: string;
    reason?: string;
  }): Promise<void> {
    try {
      await this.createOrderNotification({
        user_id: orderData.buyer_email, // In production, this should be buyer_id
        type: "order_cancelled",
        title: "Order Cancelled",
        message: `Unfortunately, your order for "${orderData.book_title}" has been cancelled by the seller. You will receive a full refund.`,
        data: {
          order_id: orderData.order_id,
          book_title: orderData.book_title,
          reason: orderData.reason,
          order_type: "buyer",
        },
      });
    } catch (error) {
      console.error("Error notifying order cancelled:", error);
    }
  }

  /**
   * Send reminder to seller about pending commitment
   */
  static async sendCommitReminder(orderData: {
    seller_id: string;
    order_id: string;
    book_title: string;
    hours_remaining: number;
  }): Promise<void> {
    try {
      await this.createOrderNotification({
        user_id: orderData.seller_id,
        type: "seller_commit_reminder",
        title: `Reminder: Commit to Order (${orderData.hours_remaining}h left)`,
        message: `You have ${orderData.hours_remaining} hours remaining to commit to the order for "${orderData.book_title}". Please take action soon.`,
        data: {
          order_id: orderData.order_id,
          book_title: orderData.book_title,
          hours_remaining: orderData.hours_remaining,
          order_type: "seller",
        },
      });
    } catch (error) {
      console.error("Error sending commit reminder:", error);
    }
  }

  /**
   * Notify when order is shipped
   */
  static async notifyOrderShipped(orderData: {
    buyer_email: string;
    order_id: string;
    book_title: string;
    tracking_number?: string;
    courier?: string;
  }): Promise<void> {
    try {
      const trackingInfo = orderData.tracking_number
        ? ` Tracking number: ${orderData.tracking_number}`
        : "";

      await this.createOrderNotification({
        user_id: orderData.buyer_email, // In production, this should be buyer_id
        type: "order_shipped",
        title: "Your Order is on the Way!",
        message: `Your order for "${orderData.book_title}" has been shipped.${trackingInfo}`,
        data: {
          order_id: orderData.order_id,
          book_title: orderData.book_title,
          tracking_number: orderData.tracking_number,
          courier: orderData.courier,
          order_type: "buyer",
        },
      });
    } catch (error) {
      console.error("Error notifying order shipped:", error);
    }
  }

  /**
   * Get user's notifications
   */
  static async getUserNotifications(
    userId: string,
  ): Promise<OrderNotification[]> {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Exception fetching notifications:", error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("Error marking notification as read:", errorMessage);
        return false;
      }

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Exception marking notification as read:", errorMessage);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("Error marking all notifications as read:", errorMessage);
        return false;
      }

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        "Exception marking all notifications as read:",
        errorMessage,
      );
      return false;
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (error) {
        console.error("Error getting unread count:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Exception getting unread count:", error);
      return 0;
    }
  }
}

export default OrderNotificationService;
