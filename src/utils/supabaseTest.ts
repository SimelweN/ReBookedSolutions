import { supabase } from "@/integrations/supabase/client";

export const testSupabaseConnection = async () => {
  try {
    console.log("🔗 Testing Supabase connection...");

    // Test basic connection
    const { data, error } = await supabase
      .from("profiles")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("❌ Supabase connection test failed:", error);
      return false;
    }

    console.log("✅ Supabase connection successful");
    return true;
  } catch (error) {
    console.error("❌ Supabase connection test error:", error);
    return false;
  }
};

export const testSupabaseAuth = async (email: string, password: string) => {
  try {
    console.log("🔐 Testing Supabase auth with:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      console.error("❌ Supabase auth test failed:", error);
      return { success: false, error };
    }

    console.log("✅ Supabase auth test successful:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Supabase auth test error:", error);
    return { success: false, error };
  }
};
