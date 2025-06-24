/**
 * Safe async operations for Auth context
 * Prevents Suspense issues during authentication flows
 */

import { startTransition } from "react";

export function safeAuthOperation<T = any>(
  operation: () => Promise<T>,
  onSuccess?: (result: T) => void,
  onError?: (error: any) => void,
): void {
  startTransition(() => {
    (async () => {
      try {
        const result = await operation();
        if (onSuccess) {
          onSuccess(result);
        }
      } catch (error) {
        console.error("Auth operation failed:", error);
        if (onError) {
          onError(error);
        }
      }
    })();
  });
}

export function safeNotificationOperation(
  notificationFn: () => Promise<void>,
  fallback?: () => void,
): void {
  safeAuthOperation(
    notificationFn,
    () => {
      // Success - notification sent
    },
    (error) => {
      console.warn("Notification operation failed:", error);
      if (fallback) {
        fallback();
      }
    },
  );
}
