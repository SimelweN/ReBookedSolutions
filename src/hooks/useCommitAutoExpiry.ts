import { useEffect, useState } from "react";
import { ClientCommitAutoExpiry } from "@/services/clientCommitAutoExpiry";

/**
 * Hook to manage and monitor the client-side commit auto-expiry system
 */
export const useCommitAutoExpiry = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [urgentCount, setUrgentCount] = useState(0);
  const [nextExpiry, setNextExpiry] = useState<Date | null>(null);

  // Workers environment check
  const isBrowser =
    typeof window !== "undefined" && typeof document !== "undefined";

  useEffect(() => {
    // Skip in Workers environment
    if (!isBrowser) {
      return;
    }

    // Defer initialization to avoid circular dependency issues
    const initializeService = () => {
      try {
        // Ensure the service is started
        ClientCommitAutoExpiry.start();
        setIsRunning(true);

        // Initial load of urgent commits and next expiry
        loadUrgentInfo();
      } catch (error) {
        console.warn("Failed to initialize commit auto-expiry:", error);
      }
    };

    // Use setTimeout to defer initialization after module loading is complete
    const timeoutId = setTimeout(initializeService, 100);

    // Update urgent info every 5 minutes
    const interval = setInterval(loadUrgentInfo, 5 * 60 * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, []);

  const loadUrgentInfo = async () => {
    // Skip if not in browser environment
    if (!isBrowser) {
      return;
    }

    try {
      const [urgentCount, nextExpiry] = await Promise.all([
        ClientCommitAutoExpiry.getUrgentCommitsCount(),
        ClientCommitAutoExpiry.getNextExpiryTime(),
      ]);

      setUrgentCount(urgentCount);
      setNextExpiry(nextExpiry);
    } catch (error) {
      // Don't log auth errors as they're expected when not authenticated
      if (
        !error?.message?.includes("authentication") &&
        !error?.message?.includes("401")
      ) {
        console.warn("Error loading urgent commit info:", error);
      }
      // Set default values on error
      setUrgentCount(0);
      setNextExpiry(null);
    }
  };

  const manualCheck = async () => {
    const result = await ClientCommitAutoExpiry.manualCheck();
    // Refresh urgent info after manual check
    await loadUrgentInfo();
    return result;
  };

  const stop = () => {
    ClientCommitAutoExpiry.stop();
    setIsRunning(false);
  };

  const restart = () => {
    ClientCommitAutoExpiry.start();
    setIsRunning(true);
    loadUrgentInfo();
  };

  return {
    isRunning,
    urgentCount,
    nextExpiry,
    manualCheck,
    stop,
    restart,
    refresh: loadUrgentInfo,
  };
};
