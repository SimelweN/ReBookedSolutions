// Minimal Supabase client for Workers build compatibility
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Workers-compatible environment access
const getEnvVar = (key: string): string => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      return import.meta.env[key] || "";
    }
    // Fallback for Workers environment
    if (typeof globalThis !== "undefined" && globalThis.process?.env) {
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
  console.error(
    "⚠️ Supabase environment variables not configured. Using mock client.",
  );

  const mockQuery = {
    select: () => mockQuery,
    from: () => mockQuery,
    eq: () => mockQuery,
    or: () => mockQuery,
    gte: () => mockQuery,
    lte: () => mockQuery,
    in: () => mockQuery,
    order: () => mockQuery,
    then: (resolve: any) => resolve({ data: [], error: null }),
  };

  return {
    from: () => mockQuery,
    auth: {
      signUp: () =>
        Promise.resolve({
          data: null,
          error: { message: "Supabase not configured" },
        }),
      signInWithPassword: () =>
        Promise.resolve({
          data: null,
          error: { message: "Supabase not configured" },
        }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
  };
};

// Enhanced client creation with error handling
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return createMockSupabaseClient() as any;
  }

  try {
    const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: async (url, options = {}) => {
          try {
            const response = await fetch(url, {
              ...options,
              // Add timeout to prevent hanging requests
              signal: AbortSignal.timeout?.(10000), // 10 second timeout if supported
            });
            return response;
          } catch (error) {
            console.warn("Supabase fetch error:", error);
            // Return a mock response to prevent crashes
            return new Response(JSON.stringify({ error: "Network error" }), {
              status: 500,
              statusText: "Network Error",
              headers: { "Content-Type": "application/json" },
            });
          }
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
