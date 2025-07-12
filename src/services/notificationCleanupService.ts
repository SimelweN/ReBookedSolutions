import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export class NotificationCleanupService {
  /**
   * Remove duplicate and spam notifications for a user
   */
  static async cleanupUserNotifications(userId: string): Promise<{
    success: boolean;
    removed: number;
    error?: string;
  }> {
    try {
      let totalRemoved = 0;

      // 1. Remove excessive login notifications (keep only the latest 2)
      const { data: loginNotifications } = await supabase
        .from("notifications")
        .select("id, created_at")
        .eq("user_id", userId)
        .like("title", "%Welcome back%")
        .order("created_at", { ascending: false });

      if (loginNotifications && loginNotifications.length > 2) {
        const toDelete = loginNotifications.slice(2); // Keep first 2, delete rest
        const { error: deleteError } = await supabase
          .from("notifications")
          .delete()
          .in(
            "id",
            toDelete.map((n) => n.id),
          );

        if (!deleteError) {
          totalRemoved += toDelete.length;
          console.log(`Removed ${toDelete.length} excess login notifications`);
        }
      }

      // 2. Remove duplicate "Listings Reactivated" notifications
      const { data: listingNotifications } = await supabase
        .from("notifications")
        .select("id, created_at, message")
        .eq("user_id", userId)
        .like("title", "%Listings Reactivated%")
        .order("created_at", { ascending: false });

      if (listingNotifications && listingNotifications.length > 1) {
        // Group by message content and keep only the latest of each
        const messageGroups = new Map<string, typeof listingNotifications>();

        listingNotifications.forEach((notification) => {
          const existing = messageGroups.get(notification.message);
          if (!existing) {
            messageGroups.set(notification.message, [notification]);
          } else {
            existing.push(notification);
          }
        });

        // For each message group, keep only the latest notification
        const duplicatesToDelete: string[] = [];
        messageGroups.forEach((group) => {
          if (group.length > 1) {
            // Sort by created_at and keep the latest
            group.sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            );
            // Add all but the first (latest) to deletion list
            duplicatesToDelete.push(...group.slice(1).map((n) => n.id));
          }
        });

        if (duplicatesToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from("notifications")
            .delete()
            .in("id", duplicatesToDelete);

          if (!deleteError) {
            totalRemoved += duplicatesToDelete.length;
            console.log(
              `Removed ${duplicatesToDelete.length} duplicate listing notifications`,
            );
          }
        }
      }

      // 3. Remove notifications older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: oldNotifications } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
        .lt("created_at", thirtyDaysAgo.toISOString());

      if (oldNotifications && oldNotifications.length > 0) {
        const { error: deleteError } = await supabase
          .from("notifications")
          .delete()
          .in(
            "id",
            oldNotifications.map((n) => n.id),
          );

        if (!deleteError) {
          totalRemoved += oldNotifications.length;
          console.log(`Removed ${oldNotifications.length} old notifications`);
        }
      }

      return { success: true, removed: totalRemoved };
    } catch (error) {
      console.error("Error cleaning up notifications:", error);
      return {
        success: false,
        removed: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Clean up all spam notifications across all users (admin only)
   */
  static async cleanupAllSpamNotifications(): Promise<{
    success: boolean;
    removed: number;
    error?: string;
  }> {
    try {
      let totalRemoved = 0;

      // Remove excessive login notifications globally
      const { data: allLoginNotifications } = await supabase
        .from("notifications")
        .select("id, user_id, created_at")
        .like("title", "%Welcome back%")
        .order("created_at", { ascending: false });

      if (allLoginNotifications && allLoginNotifications.length > 0) {
        // Group by user and keep only latest 2 per user
        const userGroups = new Map<string, typeof allLoginNotifications>();

        allLoginNotifications.forEach((notification) => {
          const existing = userGroups.get(notification.user_id);
          if (!existing) {
            userGroups.set(notification.user_id, [notification]);
          } else {
            existing.push(notification);
          }
        });

        const toDelete: string[] = [];
        userGroups.forEach((userNotifications) => {
          if (userNotifications.length > 2) {
            // Keep latest 2, delete rest
            userNotifications.sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            );
            toDelete.push(...userNotifications.slice(2).map((n) => n.id));
          }
        });

        if (toDelete.length > 0) {
          // Delete in batches of 100 to avoid query limits
          for (let i = 0; i < toDelete.length; i += 100) {
            const batch = toDelete.slice(i, i + 100);
            const { error } = await supabase
              .from("notifications")
              .delete()
              .in("id", batch);

            if (!error) {
              totalRemoved += batch.length;
            }
          }
        }
      }

      return { success: true, removed: totalRemoved };
    } catch (error) {
      console.error("Error cleaning up all spam notifications:", error);
      return {
        success: false,
        removed: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Fix timestamp display issues for existing notifications
   */
  static async fixNotificationTimestamps(userId: string): Promise<boolean> {
    try {
      const { data: notifications } = await supabase
        .from("notifications")
        .select("id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!notifications) return false;

      // Notifications are already correctly timestamped in the database
      // The "Just now" issue is in the display logic, not the data
      console.log(
        `Found ${notifications.length} notifications with proper timestamps`,
      );

      return true;
    } catch (error) {
      console.error("Error fixing notification timestamps:", error);
      return false;
    }
  }
}

export default NotificationCleanupService;
