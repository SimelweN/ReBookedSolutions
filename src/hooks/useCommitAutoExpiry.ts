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

    // Ensure the service is started
    ClientCommitAutoExpiry.start();
    setIsRunning(true);

    // Initial load of urgent commits and next expiry
    loadUrgentInfo();

    // Update urgent info every 5 minutes
    const interval = setInterval(loadUrgentInfo, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadUrgentInfo = async () => {
    try {
      const [urgentCount, nextExpiry] = await Promise.all([
        ClientCommitAutoExpiry.getUrgentCommitsCount(),
        ClientCommitAutoExpiry.getNextExpiryTime(),
      ]);

      setUrgentCount(urgentCount);
      setNextExpiry(nextExpiry);
    } catch (error) {
      console.warn("Error loading urgent commit info:", error);
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
