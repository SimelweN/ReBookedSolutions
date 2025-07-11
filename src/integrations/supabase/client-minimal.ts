// Minimal Supabase client for Workers build compatibility
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

import { ENV } from "@/config/environment";

// Simple client creation without complex logic
const supabaseUrl = ENV.VITE_SUPABASE_URL || "";
const supabaseAnonKey = ENV.VITE_SUPABASE_ANON_KEY || "";

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
