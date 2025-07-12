// Minimal Supabase client for Workers build compatibility
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Ultra-simple environment access for Workers
let supabaseUrl = "";
let supabaseAnonKey = "";

try {
  supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || "";
  supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || "";
} catch {
  // Fallback if import.meta.env is not available
  supabaseUrl = "";
  supabaseAnonKey = "";
}

// Debug logging for development
if (import.meta.env.DEV) {
  console.log("Supabase Config Check:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlStart: supabaseUrl.substring(0, 20) + "...",
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

// Create client directly if environment variables are available
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : (createMockSupabaseClient() as any);

// Export default for compatibility
export default supabase;
