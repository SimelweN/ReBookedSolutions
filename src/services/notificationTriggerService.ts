import { useNotificationStore } from "@/stores/notificationStore";
import { supabase } from "@/integrations/supabase/client";

interface OrderDetails {
  id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  book_title?: string;
  total_amount?: number;
}

export class NotificationTriggerService {
  private static notificationStore = useNotificationStore.getState();

  /**
   * Triggered when a book is purchased
   * Sends notification to seller requiring 48-hour commitment
   */
  static async triggerCommitRequired(orderDetails: OrderDetails) {
    try {
      const commitDeadline = new Date();
      commitDeadline.setHours(commitDeadline.getHours() + 48);

      // Add notification to store
      this.notificationStore.addCommitRequiredNotification(
        orderDetails.id,
        orderDetails.seller_id,
        commitDeadline.toISOString(),
      );

      // Store in database for persistence (if table exists)
      try {
        await supabase.from("order_notifications").insert({
          order_id: orderDetails.id,
          user_id: orderDetails.seller_id,
          type: "commit_required",
          title: "⏰ Commitment Required",
          message: `You have 48 hours to commit to order ${orderDetails.id}. Please confirm you can fulfill this order or it will be automatically cancelled.`,
          read: false,
          commit_deadline: commitDeadline.toISOString(),
          priority: "urgent",
        });
      } catch (dbError) {
        console.warn("Failed to store notification in database:", dbError);
        // Continue with in-memory notification
      }

      console.log(
        `✅ Commit required notification sent for order ${orderDetails.id}`,
      );
    } catch (error) {
      console.error("Failed to trigger commit required notification:", error);
    }
  }

  /**
   * Triggered when seller commits to an order
   * Notifies buyer that delivery is in progress
   */
  static async triggerSellerCommitted(orderDetails: OrderDetails) {
    try {
      // Add notification to store
      this.notificationStore.addSellerCommittedNotification(
        orderDetails.id,
        orderDetails.buyer_id,
      );

      // Store in database
      try {
        await supabase.from("order_notifications").insert({
          order_id: orderDetails.id,
          user_id: orderDetails.buyer_id,
          type: "seller_committed",
          title: "✅ Seller Committed",
          message: `Great news! The seller has committed to your order ${orderDetails.id}. Your book is now being prepared for delivery.`,
          read: false,
          priority: "high",
        });
      } catch (dbError) {
        console.warn("Failed to store notification in database:", dbError);
      }

      console.log(
        `✅ Seller committed notification sent for order ${orderDetails.id}`,
      );
    } catch (error) {
      console.error("Failed to trigger seller committed notification:", error);
    }
  }

  /**
   * Triggered when 48-hour deadline passes without seller commitment
   * Notifies both seller and buyer about automatic cancellation
   */
  static async triggerAutoCancellation(orderDetails: OrderDetails) {
    try {
      // Add notifications to store
      this.notificationStore.addAutoCancelledNotification(
        orderDetails.id,
        orderDetails.seller_id,
        orderDetails.buyer_id,
      );

      // Store in database for both users
      try {
        const notifications = [
          {
            order_id: orderDetails.id,
            user_id: orderDetails.seller_id,
            type: "auto_cancelled",
            title: "❌ Order Auto-Cancelled",
            message: `Order ${orderDetails.id} has been automatically cancelled due to missed 48-hour commitment deadline. Your seller rating may be affected.`,
            read: false,
            priority: "urgent",
          },
          {
            order_id: orderDetails.id,
            user_id: orderDetails.buyer_id,
            type: "auto_cancelled",
            title: "❌ Order Cancelled",
            message: `Your order ${orderDetails.id} has been cancelled because the seller didn't commit within 48 hours. Your refund will be processed automatically.`,
            read: false,
            priority: "high",
          },
        ];

        await supabase.from("order_notifications").insert(notifications);
      } catch (dbError) {
        console.warn("Failed to store notifications in database:", dbError);
      }

      console.log(
        `✅ Auto-cancellation notifications sent for order ${orderDetails.id}`,
      );
    } catch (error) {
      console.error(
        "Failed to trigger auto-cancellation notifications:",
        error,
      );
    }
  }

  /**
   * Triggered when courier picks up the order
   * Notifies buyer (package on the way) and seller (pickup confirmed)
   */
  static async triggerPickupConfirmed(
    orderDetails: OrderDetails,
    trackingNumber?: string,
  ) {
    try {
      // Add notifications to store
      this.notificationStore.addPickupConfirmedNotification(
        orderDetails.id,
        orderDetails.buyer_id,
        orderDetails.seller_id,
      );

      // Store in database for both users
      try {
        const notifications = [
          {
            order_id: orderDetails.id,
            user_id: orderDetails.buyer_id,
            type: "pickup_confirmed",
            title: "🚚 Package Picked Up",
            message: `Your order ${orderDetails.id} has been picked up by the courier and is on its way to you!${trackingNumber ? ` Tracking: ${trackingNumber}` : ""}`,
            read: false,
            priority: "high",
          },
          {
            order_id: orderDetails.id,
            user_id: orderDetails.seller_id,
            type: "pickup_confirmed",
            title: "✅ Pickup Confirmed",
            message: `Your package for order ${orderDetails.id} has been successfully picked up by the courier. Payment will be released after delivery confirmation.`,
            read: false,
            priority: "medium",
          },
        ];

        await supabase.from("order_notifications").insert(notifications);
      } catch (dbError) {
        console.warn("Failed to store notifications in database:", dbError);
      }

      console.log(
        `✅ Pickup confirmed notifications sent for order ${orderDetails.id}`,
      );
    } catch (error) {
      console.error("Failed to trigger pickup confirmed notifications:", error);
    }
  }

  /**
   * Triggered when buyer cancels order (before pickup)
   * Notifies both buyer and seller about cancellation
   */
  static async triggerOrderCancellation(
    orderDetails: OrderDetails,
    cancelledBy: "buyer" | "seller",
    reason?: string,
  ) {
    try {
      const cancellerName =
        cancelledBy === "buyer" ? "the buyer" : "the seller";

      // Add notification to store
      this.notificationStore.addOrderCancelledNotification(
        orderDetails.id,
        cancellerName,
        reason || "No reason provided",
      );

      // Determine who to notify
      const recipientId =
        cancelledBy === "buyer"
          ? orderDetails.seller_id
          : orderDetails.buyer_id;

      // Store in database
      try {
        await supabase.from("order_notifications").insert({
          order_id: orderDetails.id,
          user_id: recipientId,
          type: "order_cancelled",
          title: "❌ Order Cancelled",
          message: `Order ${orderDetails.id} has been cancelled by ${cancellerName}. ${reason ? `Reason: ${reason}` : "Refund will be processed automatically."}`,
          read: false,
          priority: "medium",
        });
      } catch (dbError) {
        console.warn("Failed to store notification in database:", dbError);
      }

      console.log(
        `✅ Order cancellation notification sent for order ${orderDetails.id}`,
      );
    } catch (error) {
      console.error(
        "Failed to trigger order cancellation notification:",
        error,
      );
    }
  }

  /**
   * Check for orders that need auto-cancellation (past 48 hour deadline)
   * This should be called by a scheduled job or cron task
   */
  static async checkForExpiredCommitments() {
    try {
      const now = new Date();

      // Query for orders that are past their commit deadline
      const { data: expiredOrders, error } = await supabase
        .from("orders")
        .select("id, buyer_id, seller_id, status, commit_deadline")
        .eq("status", "pending_commit")
        .lt("commit_deadline", now.toISOString());

      if (error) {
        console.warn("Failed to check for expired commitments:", error);
        return;
      }

      if (expiredOrders && expiredOrders.length > 0) {
        console.log(`Found ${expiredOrders.length} expired commitments`);

        for (const order of expiredOrders) {
          // Update order status to cancelled
          await supabase
            .from("orders")
            .update({ status: "auto_cancelled" })
            .eq("id", order.id);

          // Trigger auto-cancellation notifications
          await this.triggerAutoCancellation({
            id: order.id,
            buyer_id: order.buyer_id,
            seller_id: order.seller_id,
            status: "auto_cancelled",
          });
        }
      }
    } catch (error) {
      console.error("Failed to check for expired commitments:", error);
    }
  }

  /**
   * Initialize the notification system
   * Sets up periodic checks for expired commitments
   */
  static initializeNotificationSystem() {
    // Check for expired commitments every 5 minutes
    setInterval(
      () => {
        this.checkForExpiredCommitments();
      },
      5 * 60 * 1000,
    );

    // Initial check
    this.checkForExpiredCommitments();

    console.log("✅ Notification system initialized");
  }
}

// Export convenience functions for easier usage
export const triggerCommitRequired =
  NotificationTriggerService.triggerCommitRequired.bind(
    NotificationTriggerService,
  );
export const triggerSellerCommitted =
  NotificationTriggerService.triggerSellerCommitted.bind(
    NotificationTriggerService,
  );
export const triggerAutoCancellation =
  NotificationTriggerService.triggerAutoCancellation.bind(
    NotificationTriggerService,
  );
export const triggerPickupConfirmed =
  NotificationTriggerService.triggerPickupConfirmed.bind(
    NotificationTriggerService,
  );
export const triggerOrderCancellation =
  NotificationTriggerService.triggerOrderCancellation.bind(
    NotificationTriggerService,
  );
