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
          error instanceof Error ? error.message : "Unknown error occurred";

        if (import.meta.env.DEV) {
          console.warn("Error in refreshNotifications:", errorMessage);
        }

        setHasError(true);
        setLastError(errorMessage);

        // Implement progressive retry with exponential backoff
        if (
          retryCountRef.current < MAX_RETRY_ATTEMPTS &&
          !retryTimeoutRef.current
        ) {
          const delay =
            RETRY_DELAYS[retryCountRef.current] ||
            RETRY_DELAYS[RETRY_DELAYS.length - 1];

          retryTimeoutRef.current = setTimeout(() => {
            retryTimeoutRef.current = null;
            retryCountRef.current++;

            if (isAuthenticated && user) {
              refreshNotifications(true);
            }
          }, delay);
        }

        // Keep existing notifications if we have them (don't clear on error)
        // This provides better UX by showing stale data rather than empty state
      } finally {
        setIsLoading(false);
        refreshingRef.current = false;
      }
    },
    [user, isAuthenticated],
  );

  // Initial load effect
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshNotifications();
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
  }, [user?.id, isAuthenticated]); // Constants don't need to be in dependencies

  // Set up real-time subscription for notifications with improved debouncing
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Clean up any existing subscription
      if (subscriptionRef.current) {
        try {
          supabase.removeChannel(subscriptionRef.current);
        } catch (error) {
          console.error("Error removing notification channel:", error);
        }
        subscriptionRef.current = null;
      }
      return;
    }

    // Prevent duplicate subscriptions - check if we already have an active subscription
    if (subscriptionRef.current) {
      return; // Don't create a new subscription
    }

    let debounceTimeout: NodeJS.Timeout | null = null;
    const channelName = `notifications_${user.id}`;

    try {
      subscriptionRef.current = supabase
        .channel(channelName)
        .on(
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
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log(
              "[NotificationHook] Subscription established for user:",
              user.id,
            );
          } else if (status === "CHANNEL_ERROR") {
            console.warn(
              "[NotificationHook] Subscription error for user:",
              user.id,
            );
          }
        });

      return () => {
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }
        try {
          if (subscriptionRef.current) {
            supabase.removeChannel(subscriptionRef.current);
            subscriptionRef.current = null;
          }
        } catch (error) {
          console.error("Error removing notification channel:", error);
        }
      };
    } catch (error) {
      console.error("Error setting up notification subscription:", error);
    }
  }, [user?.id, isAuthenticated]); // Removed refreshNotifications from dependencies to prevent recreation

  // Cleanup retry timeout and subscription on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (subscriptionRef.current) {
        try {
          supabase.removeChannel(subscriptionRef.current);
        } catch (error) {
          console.error(
            "Error removing notification channel on unmount:",
            error,
          );
        }
        subscriptionRef.current = null;
      }
    };
  }, []);

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
