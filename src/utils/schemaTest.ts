import { supabase } from "@/integrations/supabase/client";

export const testDatabaseSchema = async () => {
  try {
    console.log("🔍 Testing database schema...");

    // Test if new columns exist by trying to select them
    const { data, error } = await supabase
      .from("books")
      .select("id, availability, updated_at, university")
      .limit(1);

    if (error) {
      console.error("❌ Schema test failed:", error.message);
      return {
        hasAvailability: false,
        hasUpdatedAt: false,
        hasUniversity: false,
        error: error.message,
      };
    }

    console.log("✅ Schema test passed - all columns exist");
    return {
      hasAvailability: true,
      hasUpdatedAt: true,
      hasUniversity: true,
      error: null,
    };
  } catch (error) {
    console.error("❌ Schema test error:", error);
    return {
      hasAvailability: false,
      hasUpdatedAt: false,
      hasUniversity: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
