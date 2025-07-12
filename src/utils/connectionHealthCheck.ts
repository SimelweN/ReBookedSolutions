import { supabase } from "@/integrations/supabase/client";

// Simple logging functions to replace debugHelpers
const devLog = (message: string, data?: any) => {
  if (import.meta.env.DEV) {
    console.log(message, data);
  }
};

const devWarn = (message: string, error?: any) => {
  if (import.meta.env.DEV) {
    console.warn(message, error);
  }
};

const perfMark = (name: string) => {
  if (
    import.meta.env.DEV &&
    typeof performance !== "undefined" &&
    performance.mark
  ) {
    performance.mark(name);
  }
};

const perfMeasure = (name: string, startMark: string) => {
  if (
    import.meta.env.DEV &&
    typeof performance !== "undefined" &&
    performance.measure
  ) {
    try {
      performance.measure(name, startMark);
    } catch (e) {
      // Ignore if marks don't exist
    }
  }
};

export interface ConnectionHealthResult {
  isOnline: boolean;
  supabaseConnected: boolean;
  authStatus: "connected" | "disconnected" | "error";
  latency?: number;
  error?: string;
  timestamp: string;
  cached?: boolean;
}

// Enhanced caching with different durations for different states
let lastHealthCheck: ConnectionHealthResult | null = null;
let lastCheckTime = 0;
const HEALTH_CHECK_CACHE_DURATION = 15000; // 15 seconds for successful checks
const ERROR_CACHE_DURATION = 5000; // 5 seconds for failed checks

// Connection state tracking
let consecutiveFailures = 0;
let isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

// Listen for online/offline events
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    isOnline = true;
    consecutiveFailures = 0;
    // Clear cache when coming back online
    lastHealthCheck = null;
    lastCheckTime = 0;
    devLog("🌐 Device came back online");
  });

  window.addEventListener("offline", () => {
    isOnline = false;
    devLog("🌐 Device went offline");
  });
}

/**
 * Check overall connection health with intelligent caching
 */
export const checkConnectionHealth = async (
  skipCache = false,
): Promise<ConnectionHealthResult> => {
  const now = Date.now();

  // Quick return if definitely offline
  if (!isOnline) {
    return {
      isOnline: false,
      supabaseConnected: false,
      authStatus: "error",
      error: "Device is offline",
      timestamp: new Date().toISOString(),
      cached: true,
    };
  }

  // Check cache validity based on previous result type
  if (!skipCache && lastHealthCheck) {
    const cacheAge = now - lastCheckTime;
    const cacheDuration = lastHealthCheck.supabaseConnected
      ? HEALTH_CHECK_CACHE_DURATION
      : ERROR_CACHE_DURATION;

    if (cacheAge < cacheDuration) {
      devLog("[ConnectionHealth] Returning cached result");
      return { ...lastHealthCheck, cached: true };
    }
  }

  perfMark("connection-health-start");
  const startTime = Date.now();

  const result: ConnectionHealthResult = {
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    supabaseConnected: false,
    authStatus: "disconnected",
    timestamp: new Date().toISOString(),
  };

  try {
    // Progressive timeout based on failure count
    const timeout = Math.min(3000 + consecutiveFailures * 1000, 8000);

    devLog(
      `[ConnectionHealth] Checking connection (timeout: ${timeout}ms, failures: ${consecutiveFailures})`,
    );

    // Test basic Supabase connection with a simple query
    const { data, error } = (await Promise.race([
      supabase.from("profiles").select("id").limit(1),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), timeout),
      ),
    ])) as any;

    const endTime = Date.now();
    result.latency = endTime - startTime;
    perfMeasure("connection-health", "connection-health-start");

    if (error) {
      // Handle auth errors gracefully - don't count as connection failures
      if (
        error.code === "UNAUTHORIZED" ||
        error.message?.includes("authentication")
      ) {
        devWarn("Connection check: Authentication required", error);
        result.supabaseConnected = true; // Connection is working, just not authenticated
        result.authStatus = "disconnected";
        result.error = "Authentication required";
      } else {
        consecutiveFailures++;
        result.error = error.message;
        result.supabaseConnected = false;
      }
    } else {
      consecutiveFailures = 0;
      result.supabaseConnected = true;
    }

    // Quick auth status check (non-blocking)
    try {
      const {
        data: { session },
        error: authError,
      } = (await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Auth check timeout")), 2000),
        ),
      ])) as any;

      if (authError) {
        result.authStatus = "error";
        if (!result.error) result.error = authError.message;
      } else if (session) {
        result.authStatus = "connected";
      } else {
        result.authStatus = "disconnected";
      }
    } catch (authError) {
      devWarn("[ConnectionHealth] Auth check failed:", authError);
      result.authStatus = "error";
    }

    // Cache the result
    lastHealthCheck = result;
    lastCheckTime = now;

    devLog("[ConnectionHealth] Check completed:", result);
    return result;
  } catch (error) {
    consecutiveFailures++;
    const endTime = Date.now();
    result.latency = endTime - startTime;
    result.error =
      error instanceof Error ? error.message : "Unknown connection error";
    result.supabaseConnected = false;
    result.authStatus = "error";

    // Cache error result for shorter duration
    lastHealthCheck = result;
    lastCheckTime = now;

    devWarn("[ConnectionHealth] Check failed:", result);
    return result;
  }
};

/**
 * Quick connection test with minimal overhead
 */
export const quickConnectionTest = async (): Promise<boolean> => {
  try {
    const { error } = (await Promise.race([
      supabase.from("profiles").select("id").limit(1),
      new Promise(
        (_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500), // Reduced timeout
      ),
    ])) as any;

    if (error) {
      console.warn("Connection test failed:", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.warn(
      "Connection test exception:",
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
};

/**
 * Enhanced error handler with connection context
 */
export const handleConnectionError = (
  error: any,
  operation: string,
): string => {
  devWarn(`Connection error in ${operation}:`, error);

  // Network-related errors
  if (
    error?.message?.includes("Failed to fetch") ||
    error?.message?.includes("Network request failed") ||
    error?.message?.includes("fetch")
  ) {
    if (!navigator.onLine) {
      return "You appear to be offline. Please check your internet connection and try again.";
    }
    return "Connection failed. Please check your internet connection and try again.";
  }

  // Timeout errors
  if (
    error?.message?.includes("timeout") ||
    error?.message?.includes("Timeout")
  ) {
    return "Connection timed out. Please try again.";
  }

  // CORS errors
  if (error?.message?.includes("CORS")) {
    return "Connection blocked. Please refresh the page and try again.";
  }

  // Authentication errors
  if (error?.message?.includes("JWT") || error?.message?.includes("auth")) {
    return "Session expired. Please log in again.";
  }

  // Generic fallback
  return `Connection error: ${error?.message || "Please try again"}`;
};

/**
 * Connection retry utility with intelligent backoff
 */
export const retryWithConnection = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 2, // Reduced retries
  delay: number = 500, // Reduced delay
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // For first attempt, just try the operation directly
      if (attempt === 1) {
        return await operation();
      }

      // For subsequent attempts, do a quick connection check with longer timeout
      const isConnected = await Promise.race([
        quickConnectionTest(),
        new Promise<boolean>(
          (resolve) => setTimeout(() => resolve(false), 3000), // Increased timeout
        ),
      ]);

      if (!isConnected) {
        console.warn(
          `[ConnectionHealthCheck] Connection test failed on attempt ${attempt}, but continuing anyway`,
        );
        // Don't throw "No connection available" - just try the operation
        // Only throw if the actual operation fails
      }

      return await operation();
    } catch (error) {
      lastError = error;

      const errorMessage =
        error instanceof Error
          ? error.message
          : error?.message ||
            (typeof error === "string"
              ? error
              : JSON.stringify(error, null, 2));
      const errorCode =
        (error as any)?.code || (error as any)?.error_code || "NO_CODE";

      console.warn(
        `[ConnectionHealthCheck] Operation failed on attempt ${attempt}: ${errorMessage} (Code: ${errorCode})`,
      );

      // Don't retry on certain errors
      if (
        error?.message?.includes("JWT") ||
        error?.message?.includes("auth") ||
        error?.code === "PGRST116" || // Not found
        error?.message?.includes("permission") ||
        error?.message?.includes("unauthorized") ||
        errorCode === "SUPABASE_NOT_CONFIGURED" // Don't retry Supabase config issues
      ) {
        console.warn(`Not retrying error: ${errorMessage} (non-retryable)`);
        throw error;
      }

      if (attempt < maxRetries) {
        console.warn(
          `Retry attempt ${attempt}/${maxRetries} in ${delay}ms for error: ${errorMessage}`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      }
    }
  }

  const finalErrorMessage =
    lastError instanceof Error
      ? lastError.message
      : lastError?.message ||
        (typeof lastError === "string"
          ? lastError
          : JSON.stringify(lastError, null, 2));
  const finalErrorCode =
    (lastError as any)?.code || (lastError as any)?.error_code || "NO_CODE";

  console.error(
    `[ConnectionHealthCheck] All retry attempts failed: ${finalErrorMessage} (Code: ${finalErrorCode})`,
  );

  throw lastError;
};

/**
 * Log connection health for debugging
 */
export const logConnectionHealth = async (): Promise<void> => {
  try {
    const health = await checkConnectionHealth();
    devLog("🌐 Connection Health Report:", {
      online: health.isOnline,
      connected: health.supabaseConnected,
      auth: health.authStatus,
      latency: health.latency ? `${health.latency}ms` : "N/A",
      cached: health.cached,
      failures: consecutiveFailures,
      timestamp: health.timestamp,
    });
  } catch (error) {
    devWarn("Failed to check connection health:", error);
  }
};

// Utility to force a fresh health check
export const forceHealthCheck = () => {
  return checkConnectionHealth(true);
};

// Utility to clear health check cache
export const clearHealthCache = () => {
  lastHealthCheck = null;
  lastCheckTime = 0;
  consecutiveFailures = 0;
  devLog("🌐 Connection health cache cleared");
};

// Get current connection status without triggering a new check
export const getCurrentHealthStatus = (): ConnectionHealthResult | null => {
  return lastHealthCheck;
};
