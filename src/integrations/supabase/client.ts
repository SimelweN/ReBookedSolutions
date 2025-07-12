// Minimal Supabase client for Workers build compatibility
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Direct environment variable access for Workers compatibility
const getEnvVar = (key: string): string => {
  try {
    // Use import.meta.env directly for better Workers compatibility
    return (import.meta.env && import.meta.env[key]) || "";
  } catch {
    return "";
  }
};

const supabaseUrl = getEnvVar("VITE_SUPABASE_URL");
const supabaseAnonKey = getEnvVar("VITE_SUPABASE_ANON_KEY");

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
