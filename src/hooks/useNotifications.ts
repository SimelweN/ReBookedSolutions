import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getNotifications,
  clearNotificationCache,
} from "@/services/notificationService";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

interface NotificationHookReturn {
  unreadCount: number;
  totalCount: number;
  notifications: Notification[];
  isLoading: boolean;
  hasError: boolean;
  lastError?: string;
  refreshNotifications: () => Promise<void>;
  clearError: () => void;
}

export const useNotifications = (): NotificationHookReturn => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastError, setLastError] = useState<string | undefined>();
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const isInitialLoadRef = useRef(true);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const refreshingRef = useRef(false); // Prevent concurrent refreshes
  const subscribingRef = useRef(false); // Prevent multiple subscription attempts

  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAYS = [5000, 15000, 30000]; // Progressive retry delays

  const clearError = useCallback(() => {
    setHasError(false);
    setLastError(undefined);
    retryCountRef.current = 0;
  }, []);

  const refreshNotifications = useCallback(
    async (isRetry = false) => {
      if (!isAuthenticated || !user) {
        setNotifications([]);
        setHasError(false);
        setLastError(undefined);
        return;
      }

      // Prevent concurrent refresh calls
      if (refreshingRef.current) {
        return;
      }

      refreshingRef.current = true;

      // Only show loading on initial load or manual refresh (not on retries)
      if (!isRetry || isInitialLoadRef.current) {
        setIsLoading(true);
      }

      try {
        const userNotifications = await getNotifications(user.id);

        // Check if we got valid data
        if (Array.isArray(userNotifications)) {
          // Deduplicate notifications by ID to prevent duplicates
          const uniqueNotifications = userNotifications.filter(
            (notification, index, array) =>
              array.findIndex((n) => n.id === notification.id) === index,
          );

          // Additional check to prevent setting duplicate data
          const newNotificationIds = new Set(
            uniqueNotifications.map((n) => n.id),
          );
          const currentNotificationIds = new Set(
            notifications.map((n) => n.id),
          );

          // Only update if the notifications have actually changed
          const hasChanges =
            uniqueNotifications.length !== notifications.length ||
            !Array.from(newNotificationIds).every((id) =>
              currentNotificationIds.has(id),
            );

          if (hasChanges) {
            setNotifications(uniqueNotifications);
          }
          setHasError(false);
          setLastError(undefined);
          retryCountRef.current = 0;
          isInitialLoadRef.current = false;

          // Clear any pending retry
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
          }
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          `[NotificationHook] Error fetching notifications:`,
          errorMessage,
        );

        // Handle 403 errors with session refresh
        if (
          errorMessage.includes("403") ||
          errorMessage.includes("forbidden")
        ) {
          console.log(
            "[NotificationHook] 403 error detected, attempting session refresh",
          );
          try {
            const {
              data: { session },
            } = await supabase.auth.refreshSession();
            if (session) {
              console.log(
                "[NotificationHook] Session refreshed, retrying notification fetch",
              );
              // Clear error and retry immediately
              setHasError(false);
              setLastError(undefined);
              setTimeout(() => refreshNotifications(true), 1000);
              return;
            }
          } catch (refreshError) {
            console.error(
              "[NotificationHook] Session refresh failed:",
              refreshError,
            );
          }
        }

        // Set user-friendly error state
        setHasError(true);
        setLastError(error instanceof Error ? error : new Error(errorMessage));

        // Only retry on network or temporary errors, not on auth errors
        if (
          errorMessage.includes("network") ||
          errorMessage.includes("timeout") ||
          errorMessage.includes("Failed to fetch")
        ) {
          if (retryCountRef.current < MAX_RETRY_ATTEMPTS) {
            retryCountRef.current++;
            const retryDelay =
              RETRY_DELAYS[retryCountRef.current - 1] ||
              RETRY_DELAYS[RETRY_DELAYS.length - 1];

            console.log(
              `[NotificationHook] Scheduling retry ${retryCountRef.current}/${MAX_RETRY_ATTEMPTS} in ${retryDelay}ms`,
            );

            retryTimeoutRef.current = setTimeout(() => {
              refreshNotifications(true);
            }, retryDelay);
          } else {
            console.warn(
              `[NotificationHook] Max retry attempts reached (${MAX_RETRY_ATTEMPTS})`,
            );
          }
        } else {
          console.warn(
            `[NotificationHook] Non-retryable error: ${errorMessage}`,
          );
        }
      } finally {
        setIsLoading(false);
        refreshingRef.current = false;
      }
    },
    [user, isAuthenticated],
  );

  // Initial load effect with better duplicate prevention
  useEffect(() => {
    if (isAuthenticated && user) {
      // Only refresh if we haven't loaded data for this user yet
      if (isInitialLoadRef.current || notifications.length === 0) {
        refreshNotifications();
      }
    } else {
      // Clear state when user logs out
      setNotifications([]);
      setHasError(false);
      setLastError(undefined);
      retryCountRef.current = 0;
      isInitialLoadRef.current = true;

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    }
  }, [user?.id, isAuthenticated]); // Only depend on user ID and auth status

  // Set up real-time subscription for notifications with proper cleanup
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Clean up any existing subscription
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log(
            "[NotificationHook] Cleaned up subscription for logged out user",
          );
        } catch (error) {
          console.error("Error removing notification channel:", error);
        }
        subscriptionRef.current = null;
        subscribingRef.current = false;
      }
      return;
    }

    // Prevent multiple subscription attempts for the same user
    if (subscribingRef.current || subscriptionRef.current) {
      console.log(
        "[NotificationHook] Subscription already exists or in progress, skipping",
      );
      return;
    }

    let debounceTimeout: NodeJS.Timeout | null = null;

    const channelName = `notifications_${user.id}`;

    subscribingRef.current = true;
    console.log(
      "[NotificationHook] Setting up new subscription for user:",
      user.id,
    );

    try {
      const channel = supabase.channel(channelName);

      // Configure the channel before subscribing
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log(
            "[NotificationHook] Received subscription event:",
            payload.eventType,
          );

          // Only handle INSERT events to prevent duplicate refreshes
          if (payload.eventType === "INSERT") {
            // Debounce the refresh to prevent multiple rapid calls
            if (debounceTimeout) {
              clearTimeout(debounceTimeout);
            }

            debounceTimeout = setTimeout(() => {
              // Clear cache and refresh only on new notifications
              clearNotificationCache(user.id);

              // Prevent refresh if we're already refreshing
              if (!refreshingRef.current) {
                refreshNotifications().catch((error) => {
                  if (import.meta.env.DEV) {
                    console.error(
                      "Error refreshing notifications from subscription:",
                      error,
                    );
                  }
                });
              }
            }, 1000); // Reduced debounce time for better responsiveness
          }
        },
      );

      // Subscribe to the channel
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(
            "[NotificationHook] Subscription established for user:",
            user.id,
          );
          subscribingRef.current = false; // Reset the subscribing flag
        } else if (status === "CHANNEL_ERROR") {
          console.warn(
            "[NotificationHook] Subscription error for user:",
            user.id,
          );
          // Clear the refs on error to allow retry
          subscriptionRef.current = null;
          subscribingRef.current = false;
        } else if (status === "CLOSED") {
          console.log(
            "[NotificationHook] Subscription closed for user:",
            user.id,
          );
          subscriptionRef.current = null;
          subscribingRef.current = false;
        }
      });

      // Store the channel reference
      subscriptionRef.current = channel;
      // Cleanup function
      return () => {
        console.log(
          "[NotificationHook] Cleaning up subscription on effect cleanup",
        );
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
          debounceTimeout = null;
        }
        try {
          if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;
          }
        } catch (error) {
          console.error(
            "Error removing notification channel on cleanup:",
            error,
          );
        }
        subscribingRef.current = false;
      };
    } catch (error) {
      console.error("Error setting up notification subscription:", error);
      subscriptionRef.current = null;
      subscribingRef.current = false;
      setHasError(true);
      setLastError(error as Error);
    }
  }, [user?.id, isAuthenticated]); // Only depend on user ID and auth status

  // Cleanup retry timeout and subscription on unmount
  useEffect(() => {
    // Set up periodic cleanup to prevent memory issues
    const cleanupInterval = setInterval(() => {
      // Force garbage collection of old notification data
      if (notifications.length > 200) {
        console.log(
          "[NotificationHook] Cleaning up old notifications for performance",
        );
        setNotifications((prev) => prev.slice(-100)); // Keep only last 100 notifications
      }
    }, 60000); // Every minute

    return () => {
      console.log(
        "[NotificationHook] Component unmounting - cleaning up all resources",
      );

      clearInterval(cleanupInterval);

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log(
            "[NotificationHook] Final cleanup - unsubscribed from notification channel",
          );
        } catch (error) {
          console.error(
            "Error unsubscribing from notification channel on unmount:",
            error,
          );
        }
        subscriptionRef.current = null;
      }
      refreshingRef.current = false;
      isInitialLoadRef.current = true;
      subscribingRef.current = false;
    };
  }, [notifications.length]);

  // Performance optimization: memoize computed values
  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalCount = notifications.length;

  return {
    unreadCount,
    totalCount,
    notifications,
    isLoading,
    hasError,
    lastError,
    refreshNotifications: () => refreshNotifications(false),
    clearError,
  };
};
