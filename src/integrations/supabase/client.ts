// Minimal Supabase client for Workers build compatibility
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { isNetworkError } from "../../utils/supabaseErrorHandler";

// Workers-compatible environment access
const getEnvVar = (key: string): string => {
  try {
    // Primary: Vite environment variables (most reliable in Workers)
    if (typeof import.meta !== "undefined" && import.meta.env) {
      return import.meta.env[key] || "";
    }

    // Fallback: Check for process env only if in Node-like environment
    if (typeof process !== "undefined" && process.env) {
      return process.env[key] || "";
    }

    // Final fallback: Try globalThis.process but with stricter checks
    if (
      typeof globalThis !== "undefined" &&
      globalThis.process &&
      typeof globalThis.process.env === "object"
    ) {
      return globalThis.process.env[key] || "";
    }

    return "";
  } catch {
    return "";
  }
};

let supabaseUrl = getEnvVar("VITE_SUPABASE_URL");
let supabaseAnonKey = getEnvVar("VITE_SUPABASE_ANON_KEY");

// Debug logging for development - Workers compatible
const isDev = (() => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      return import.meta.env.DEV || import.meta.env.NODE_ENV === "development";
    }
    if (typeof globalThis !== "undefined" && globalThis.process?.env) {
      return globalThis.process.env.NODE_ENV === "development";
    }
    return false;
  } catch {
    return false;
  }
})();

if (isDev) {
  console.log("Supabase Config Check:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlStart: supabaseUrl ? supabaseUrl.substring(0, 20) + "..." : "none",
  });
}

// Create a mock client for when environment variables are missing
const createMockSupabaseClient = () => {
  if (isDev) {
    console.warn(
      "⚠️ Supabase environment variables not configured. Using mock client.",
    );
  }

  const mockQuery = {
    select: () => mockQuery,
    from: () => mockQuery,
    eq: () => mockQuery,
    or: () => mockQuery,
    gte: () => mockQuery,
    lte: () => mockQuery,
    in: () => mockQuery,
    order: () => mockQuery,
    limit: () => mockQuery,
    single: () => mockQuery,
    insert: () => mockQuery,
    update: () => mockQuery,
    delete: () => mockQuery,
    upsert: () => mockQuery,
    then: (resolve: any) => resolve({ data: [], error: null }),
    catch: (reject: any) =>
      reject(new Error("Mock client - no database connection")),
  };

  return {
    from: () => mockQuery,
    auth: {
      signUp: () =>
        Promise.resolve({
          data: null,
          error: { message: "Supabase not configured - using demo mode" },
        }),
      signInWithPassword: () =>
        Promise.resolve({
          data: null,
          error: { message: "Supabase not configured - using demo mode" },
        }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    // Add storage mock
    storage: {
      from: () => ({
        upload: () =>
          Promise.resolve({
            data: null,
            error: { message: "Storage not configured" },
          }),
        download: () =>
          Promise.resolve({
            data: null,
            error: { message: "Storage not configured" },
          }),
      }),
    },
  };
};

// Enhanced client creation with error handling and fetch protection
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isDev) {
      console.warn(
        "Supabase environment variables not configured, using mock client",
      );
    }
    return createMockSupabaseClient() as any;
  }

  // Validate URL format to prevent fetch errors
  try {
    new URL(supabaseUrl);
  } catch {
    console.error("Invalid Supabase URL format:", supabaseUrl);
    return createMockSupabaseClient() as any;
  }

  // Validate API key format
  const cleanKey = supabaseAnonKey.replace(/^=+/, "");
  if (!cleanKey || cleanKey.length < 20) {
    console.error("Invalid Supabase anon key format");
    return createMockSupabaseClient() as any;
  }

  try {
    const client = createClient<Database>(supabaseUrl, cleanKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      // Add global fetch error handling
      global: {
        fetch: async (url, options = {}) => {
          try {
            const response = await fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            });

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`,
              );
            }

            return response;
          } catch (error) {
            // Handle HTTP 401 (Unauthorized) errors first (don't log as errors)
            if (error.message?.includes("HTTP 401")) {
              // Don't log 401 errors as they're expected when not authenticated
              return new Response(
                JSON.stringify({
                  data: null,
                  error: {
                    message: "Authentication required. Please sign in again.",
                    code: "UNAUTHORIZED",
                  },
                }),
                {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
                },
              );
            }

            // Handle network errors gracefully
            if (isNetworkError(error)) {
              console.warn(
                "Network error detected, returning fallback response",
              );
              return new Response(
                JSON.stringify({
                  data: null,
                  error: {
                    message:
                      "Unable to connect to database. Please check your internet connection.",
                    code: "NETWORK_ERROR",
                  },
                }),
                {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
                },
              );
            }

            // Log other types of errors (but not 401 or network errors)
            console.error("Supabase fetch error:", error);

            // Return a mock response for development to prevent crashes
            if (isDev) {
              return new Response(
                JSON.stringify({
                  data: null,
                  error: {
                    message: "Development mode - no Supabase connection",
                  },
                }),
                {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
                },
              );
            }

            throw error;
          }
        },
      },
      realtime: {
        params: {
          eventsPerSecond: 2,
        },
      },
    });

    return client;
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    return createMockSupabaseClient() as any;
  }
};

// Create client with error handling
export const supabase = createSupabaseClient();

// Export default for compatibility
export default supabase;
