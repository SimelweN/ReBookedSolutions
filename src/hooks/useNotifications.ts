import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Notification {
  id: string;
  order_id?: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsResult => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Try to get order notifications first
      let { data: orderNotifications, error: orderError } = await supabase
        .from("order_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (orderError) {
        // Check if table doesn't exist
        if (
          orderError.code === "42P01" ||
          orderError.message?.includes("relation") ||
          orderError.message?.includes("does not exist")
        ) {
          console.log("Order notifications table not available");
          orderNotifications = [];
        } else {
          throw orderError;
        }
      }

      // Fallback to regular notifications table
      let fallbackNotifications: Notification[] = [];
      try {
        const { data: regularNotifications, error: regularError } =
          await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(50);

        if (!regularError && regularNotifications) {
          fallbackNotifications = regularNotifications.map((notif) => ({
            id: notif.id,
            user_id: notif.user_id,
            type: notif.type || "info",
            title: notif.title || "Notification",
            message: notif.message || notif.description || "",
            read: notif.read || false,
            created_at: notif.created_at,
            updated_at: notif.updated_at,
          }));
        }
      } catch (fallbackError) {
        console.log("Regular notifications table also not available");
      }

      // Combine notifications
      const allNotifications = [
        ...(orderNotifications || []),
        ...fallbackNotifications,
      ].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setNotifications(allNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch notifications";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Find the notification to determine which table to update
      const notification = notifications.find((n) => n.id === notificationId);
      if (!notification) return;

      // Try order_notifications table first
      let { error } = await supabase
        .from("order_notifications")
        .update({ read: true })
        .eq("id", notificationId);

      // If that fails, try regular notifications table
      if (
        error &&
        (error.code === "42P01" || error.message?.includes("relation"))
      ) {
        const { error: fallbackError } = await supabase
          .from("notifications")
          .update({ read: true, updated_at: new Date().toISOString() })
          .eq("id", notificationId);

        if (fallbackError) {
          throw fallbackError;
        }
      } else if (error) {
        throw error;
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
    } catch (err) {
      let errorMessage = "Failed to mark notification as read";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      } else if (err && typeof err === "object") {
        // Handle Supabase error objects specifically
        if ("message" in err && typeof err.message === "string") {
          errorMessage = err.message;
        } else if ("error" in err && typeof err.error === "string") {
          errorMessage = err.error;
        } else {
          errorMessage = JSON.stringify(err);
        }
      }

      console.error("Error marking notification as read:", errorMessage);
      console.log("Error type:", typeof err);
      console.log("Error details:", err);

      toast.error(errorMessage);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const unreadNotifications = notifications.filter((n) => !n.read);

      for (const notification of unreadNotifications) {
        await markAsRead(notification.id);
      }

      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      toast.error("Failed to mark all notifications as read");
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription for order notifications
    if (user?.id) {
      // Create a unique channel name to avoid subscription conflicts
      const channelName = `order-notifications-${user.id}-${Date.now()}`;

      const subscription = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "order_notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("Notification change received:", payload);
            fetchNotifications(); // Refetch to get updated data
          },
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};

export default useNotifications;
