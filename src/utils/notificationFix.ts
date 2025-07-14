import { toast } from "sonner";

/**
 * Enhanced daily notification tracking with better deduplication
 */
export class NotificationTracker {
  private static readonly DAILY_PREFIX = "daily_notif_";
  private static readonly SESSION_PREFIX = "session_notif_";

  /**
   * Check if we should send a notification based on daily and session limits
   */
  static shouldSendNotification(
    userId: string,
    notificationType: string,
  ): boolean {
    const today = new Date().toDateString();
    const dailyKey = `${this.DAILY_PREFIX}${userId}_${notificationType}`;
    const sessionKey = `${this.SESSION_PREFIX}${userId}_${notificationType}`;

    const lastDaily = localStorage.getItem(dailyKey);
    const hasSession = sessionStorage.getItem(sessionKey);

    // Don't send if already sent today OR already sent this session
    if (lastDaily === today || hasSession === "true") {
      return false;
    }

    return true;
  }

  /**
   * Mark a notification as sent for both daily and session tracking
   */
  static markNotificationSent(userId: string, notificationType: string): void {
    const today = new Date().toDateString();
    const dailyKey = `${this.DAILY_PREFIX}${userId}_${notificationType}`;
    const sessionKey = `${this.SESSION_PREFIX}${userId}_${notificationType}`;

    localStorage.setItem(dailyKey, today);
    sessionStorage.setItem(sessionKey, "true");
  }

  /**
   * Clear all notification tracking for testing purposes
   */
  static clearAllTracking(): void {
    const keysToRemove: string[] = [];

    // Clear localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith(this.DAILY_PREFIX) || key.startsWith("last_welcome_"))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Clear sessionStorage
    keysToRemove.length = 0;
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (
        key &&
        (key.startsWith(this.SESSION_PREFIX) ||
          key.startsWith("session_welcome_"))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));

    toast.success("Notification tracking cleared");
  }
}

/**
 * Debug utilities for notification issues
 */
export class NotificationDebugger {
  static logNotificationState(): void {
    console.log("📊 Current Notification State:");

    // Check localStorage
    const localKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes("welcome") || key.includes("notif"))) {
        localKeys.push({ key, value: localStorage.getItem(key) });
      }
    }

    // Check sessionStorage
    const sessionKeys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes("welcome") || key.includes("notif"))) {
        sessionKeys.push({ key, value: sessionStorage.getItem(key) });
      }
    }

    console.table({ localStorage: localKeys, sessionStorage: sessionKeys });
  }

  static async testNotificationButtons(): Promise<boolean> {
    try {
      console.log("🧪 Testing notification button functionality...");

      // Test importing notification service functions
      const {
        markNotificationAsRead,
        deleteNotification,
        markMultipleAsRead,
        deleteMultipleNotifications,
      } = await import("@/services/notificationService");

      console.log("✅ Notification service functions imported successfully");
      console.log("Available functions:", {
        markNotificationAsRead: typeof markNotificationAsRead,
        deleteNotification: typeof deleteNotification,
        markMultipleAsRead: typeof markMultipleAsRead,
        deleteMultipleNotifications: typeof deleteMultipleNotifications,
      });

      return true;
    } catch (error) {
      console.error("❌ Notification button test failed:", error);
      return false;
    }
  }
}

// Export for global access in dev mode
if (typeof window !== "undefined" && import.meta.env.DEV) {
  (window as any).NotificationTracker = NotificationTracker;
  (window as any).NotificationDebugger = NotificationDebugger;
}
