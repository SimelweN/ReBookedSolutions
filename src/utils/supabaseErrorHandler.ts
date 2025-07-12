// Utility to handle Supabase and fetch errors gracefully
export interface SupabaseErrorResponse {
  data: any;
  error: {
    message: string;
    code?: string;
    details?: string;
  } | null;
}

export const isNetworkError = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error.message || String(error);
  return (
    errorMessage.includes("Failed to fetch") ||
    errorMessage.includes("NetworkError") ||
    errorMessage.includes("TypeError: Failed to fetch") ||
    errorMessage.includes("fetch") ||
    error.name === "TypeError" ||
    error.name === "NetworkError"
  );
};

export const isSupabaseConfigError = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error.message || String(error);
  return (
    errorMessage.includes("Supabase not configured") ||
    errorMessage.includes("Invalid API key") ||
    errorMessage.includes("Invalid URL")
  );
};

export const isAuthError = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error.message || String(error);
  return (
    errorMessage.includes("HTTP 401") ||
    errorMessage.includes("Unauthorized") ||
    errorMessage.includes("authentication") ||
    errorMessage.includes("UNAUTHORIZED")
  );
};

export const handleSupabaseError = (
  error: any,
  operation: string,
): SupabaseErrorResponse => {
  console.warn(`Supabase operation "${operation}" failed:`, error);

  if (isNetworkError(error)) {
    return {
      data: null,
      error: {
        message:
          "Unable to connect to the database. Please check your internet connection and try again.",
        code: "NETWORK_ERROR",
        details: error.message,
      },
    };
  }

  if (isSupabaseConfigError(error)) {
    return {
      data: null,
      error: {
        message: "Database configuration issue. Running in demo mode.",
        code: "CONFIG_ERROR",
        details: error.message,
      },
    };
  }

  // Generic error handling
  return {
    data: null,
    error: {
      message: error.message || "An unexpected error occurred",
      code: error.code || "UNKNOWN_ERROR",
      details: error.details,
    },
  };
};

export const safeSupabaseCall = async <T>(
  operation: () => Promise<any>,
  operationName: string,
  fallbackData: T = null as T,
): Promise<{ data: T; error: any }> => {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    const handled = handleSupabaseError(error, operationName);
    console.warn(`Safe Supabase call "${operationName}" using fallback data`);

    return {
      data: fallbackData,
      error: handled.error,
    };
  }
};

// Global error listener for unhandled fetch errors
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    if (isNetworkError(event.reason)) {
      console.warn("Unhandled network error caught:", event.reason);
      event.preventDefault(); // Prevent console error spam
    }
  });
}
