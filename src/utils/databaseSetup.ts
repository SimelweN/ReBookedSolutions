import { supabase } from "@/integrations/supabase/client";

/**
 * Minimal database setup utilities for StartupChecker
 */

export const checkDatabaseHealth = async () => {
  try {
    const { error } = await supabase.from("books").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
};

export const autoSetupDatabase = async () => {
  // Simple auto setup - just check if tables exist
  try {
    const { error } = await supabase.from("books").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
};

export const getDatabaseSetupInstructions = () => {
  return "https://supabase.com/dashboard/project/kbpjqzaqbqukutflwixf/editor";
};
