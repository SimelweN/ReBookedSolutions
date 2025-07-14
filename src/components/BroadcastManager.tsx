import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getLatestBroadcast,
  hasBroadcastBeenViewed,
  dismissBroadcast,
  saveBroadcastToNotifications,
} from "@/services/broadcastService";
import { Broadcast } from "@/types/broadcast";
import BroadcastDialog from "./BroadcastDialog";

const BroadcastManager = () => {
  // TEMPORARY FIX: Completely disable broadcasts to stop error spam
  const BROADCASTS_DISABLED = true;

  const [currentBroadcast, setCurrentBroadcast] = useState<Broadcast | null>(
    null,
  );
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);

  // Always call useAuth - if it fails, the component will fail gracefully
  const { user, isAuthenticated } = useAuth();

  const checkForBroadcasts = useCallback(async () => {
    // Early return if broadcasts are disabled
    if (BROADCASTS_DISABLED) {
      return;
    }
    // Check if broadcasts are disabled for this session (with fallback)
    try {
      if (
        typeof window !== "undefined" &&
        localStorage.getItem("broadcasts_disabled") === "true"
      ) {
        return;
      }
    } catch (error) {
      // If localStorage fails, continue to show broadcasts (better UX)
      console.warn("localStorage not accessible, continuing with broadcasts");
    }

    // Prevent rapid successive calls (debounce with 5 second minimum interval)
    const now = Date.now();
    if (now - lastCheckTime < 5000) {
      return;
    }

    // Prevent concurrent requests
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setLastCheckTime(now);

    try {
      const latestBroadcast = await getLatestBroadcast();

      if (!latestBroadcast) {
        return;
      }

      // Check if user has seen this broadcast (using localStorage for guests)
      if (isAuthenticated && user) {
        const hasViewed = await hasBroadcastBeenViewed(
          user.id,
          latestBroadcast.id,
        );
        if (!hasViewed) {
          setCurrentBroadcast(latestBroadcast);
          setShowBroadcast(true);
          // Save to notifications for logged-in users - fix parameter order
          try {
            await saveBroadcastToNotifications(latestBroadcast, user.id);
          } catch (notifError) {
            // Silently handle notification errors
          }
        }
      } else {
        // For guests, use localStorage (with fallback)
        let viewedBroadcasts: string[] = [];
        try {
          const stored = localStorage.getItem("viewedBroadcasts");
          viewedBroadcasts = stored ? JSON.parse(stored) : [];
        } catch (error) {
          console.warn(
            "Failed to parse viewed broadcasts from localStorage, using empty array",
          );
          viewedBroadcasts = [];
        }

        if (!viewedBroadcasts.includes(latestBroadcast.id)) {
          setCurrentBroadcast(latestBroadcast);
          setShowBroadcast(true);
        }
      }
    } catch (error) {
      // Broadcasts are optional - fail silently
    } finally {
      setIsLoading(false);
    }
  }, [BROADCASTS_DISABLED, isLoading, lastCheckTime, user, isAuthenticated]);

  useEffect(() => {
    // Only check for broadcasts if not already loading and if enough time has passed
    checkForBroadcasts();
  }, [isAuthenticated, user?.id, checkForBroadcasts]); // Only depend on user ID, not the full user object

  const handleDismiss = async () => {
    if (!currentBroadcast) return;

    if (isAuthenticated && user) {
      await dismissBroadcast(user.id, currentBroadcast.id);
    } else {
      // For guests, store in localStorage (with fallback)
      try {
        const stored = localStorage.getItem("viewedBroadcasts");
        const viewedBroadcasts = stored ? JSON.parse(stored) : [];
        viewedBroadcasts.push(currentBroadcast.id);
        localStorage.setItem(
          "viewedBroadcasts",
          JSON.stringify(viewedBroadcasts),
        );
      } catch (error) {
        console.warn(
          "Failed to store dismissed broadcast, broadcast may reappear",
        );
        // Broadcast dismissal will work for this session but not persist
      }
    }

    setShowBroadcast(false);
    setCurrentBroadcast(null);
  };

  if (!currentBroadcast || !showBroadcast) {
    return null;
  }

  // Early return after hooks if broadcasts are disabled
  if (BROADCASTS_DISABLED) {
    return null;
  }

  return (
    <BroadcastDialog
      broadcast={currentBroadcast}
      isOpen={showBroadcast}
      onDismiss={handleDismiss}
    />
  );
};

export default BroadcastManager;
