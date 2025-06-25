import { supabase } from "@/integrations/supabase/client";

export interface EnhancedConnectionResult {
  isReallyOnline: boolean;
  hasWorkingConnection: boolean;
  connectionQuality: "excellent" | "good" | "poor" | "offline";
  latency?: number;
  error?: string;
  timestamp: string;
  shouldShowWarning: boolean;
}

// Cache to prevent spam checking
let lastCheck: EnhancedConnectionResult | null = null;
let lastCheckTime = 0;
const CACHE_DURATION = 30000; // 30 seconds cache
const MIN_CHECK_INTERVAL = 5000; // Minimum 5 seconds between checks

/**
 * Enhanced connection check that avoids false positives
 * Only shows connection errors when there's a real issue
 */
export const checkRealConnection = async (
  forceCheck = false,
): Promise<EnhancedConnectionResult> => {
  const now = Date.now();

  // Return cached result if recent and not forcing
  if (!forceCheck && lastCheck && now - lastCheckTime < CACHE_DURATION) {
    return { ...lastCheck, timestamp: new Date().toISOString() };
  }

  // Prevent too frequent checks
  if (!forceCheck && now - lastCheckTime < MIN_CHECK_INTERVAL) {
    return (
      lastCheck || {
        isReallyOnline: navigator.onLine,
        hasWorkingConnection: false,
        connectionQuality: "poor",
        shouldShowWarning: false,
        timestamp: new Date().toISOString(),
        error: "Checking too frequently",
      }
    );
  }

  const startTime = Date.now();

  const result: EnhancedConnectionResult = {
    isReallyOnline: navigator.onLine,
    hasWorkingConnection: false,
    connectionQuality: "offline",
    shouldShowWarning: false,
    timestamp: new Date().toISOString(),
  };

  // Quick return if navigator says we're offline
  if (!navigator.onLine) {
    result.shouldShowWarning = true;
    result.error = "Device is offline";
    lastCheck = result;
    lastCheckTime = now;
    return result;
  }

  try {
    // Use a more realistic timeout - 10 seconds
    const timeoutMs = 10000;

    // Test with a simple, fast query that doesn't require auth
    const { data, error } = await Promise.race([
      supabase.from("profiles").select("id").limit(1),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), timeoutMs),
      ),
    ]);

    const endTime = Date.now();
    result.latency = endTime - startTime;

    if (error) {
      // Check if it's a real connection error vs other errors
      const isRealConnectionError =
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("Network request failed") ||
        error.message?.includes("fetch") ||
        error.message?.includes("ENOTFOUND") ||
        error.message?.includes("ECONNREFUSED") ||
        error.message?.includes("timeout");

      if (isRealConnectionError) {
        result.connectionQuality = "offline";
        result.shouldShowWarning = true;
        result.error = "Cannot reach server";
      } else {
        // It's likely an auth/permission error, not a connection issue
        result.hasWorkingConnection = true;
        result.connectionQuality = result.latency < 1000 ? "good" : "poor";
        result.shouldShowWarning = false;
        result.error = undefined; // Don't show error for non-connection issues
      }
    } else {
      result.hasWorkingConnection = true;
      result.shouldShowWarning = false;

      // Determine connection quality based on latency
      if (result.latency < 500) {
        result.connectionQuality = "excellent";
      } else if (result.latency < 2000) {
        result.connectionQuality = "good";
      } else {
        result.connectionQuality = "poor";
      }
    }
  } catch (error) {
    const endTime = Date.now();
    result.latency = endTime - startTime;

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Only show warning for real connection issues
    if (errorMessage.includes("timeout") || errorMessage.includes("fetch")) {
      result.shouldShowWarning = true;
      result.connectionQuality = "offline";
      result.error = "Connection timed out";
    } else {
      // Assume working connection for other errors
      result.hasWorkingConnection = true;
      result.connectionQuality = "poor";
      result.shouldShowWarning = false;
    }
  }

  // Cache the result
  lastCheck = result;
  lastCheckTime = now;

  return result;
};

/**
 * Simple check to see if we should show any connection warnings
 */
export const shouldShowConnectionWarning = async (): Promise<boolean> => {
  try {
    const result = await checkRealConnection();
    return result.shouldShowWarning;
  } catch {
    // If check fails, don't show warning to avoid spam
    return false;
  }
};

/**
 * Quick validation that basic fetch works
 */
export const validateBasicConnectivity = async (): Promise<boolean> => {
  try {
    // Try a simple fetch with short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    await fetch("https://httpbin.org/get", {
      signal: controller.signal,
      mode: "cors",
    });

    clearTimeout(timeoutId);
    return true;
  } catch {
    // Try fallback to google
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await fetch("https://www.google.com/favicon.ico", {
        signal: controller.signal,
        mode: "no-cors",
      });

      clearTimeout(timeoutId);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Clear the connection check cache
 */
export const clearConnectionCache = (): void => {
  lastCheck = null;
  lastCheckTime = 0;
};
