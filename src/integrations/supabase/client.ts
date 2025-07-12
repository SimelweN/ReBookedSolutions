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
    : null;

// Export default for compatibility
export default supabase;
