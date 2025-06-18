// Simple test to verify the cleanup works
import { supabase } from "../integrations/supabase/client.js";

console.log("🧪 Testing database connection and cleanup...");

// Test database connection
supabase
  .from("books")
  .select("id, title, author", { count: "exact" })
  .limit(5)
  .then(({ data, error, count }) => {
    if (error) {
      console.error("❌ Database connection failed:", error);
    } else {
      console.log("✅ Database connected successfully");
      console.log(`📚 Found ${count} total books in database`);
      console.log("📋 Sample books:", data);

      // Check for specific problematic books
      const problematicTitles = [
        "Data Structures and Algorithms Mastery",
        "Advanced Physics Mechanics",
        "Psychology: The Science of Mind",
      ];

      return supabase
        .from("books")
        .select("id, title")
        .in("title", problematicTitles);
    }
  })
  .then(({ data, error }) => {
    if (error) {
      console.error("❌ Error checking problematic books:", error);
    } else {
      console.log(`🎯 Found ${data?.length || 0} problematic books:`, data);

      if (data && data.length > 0) {
        console.log("🧹 These books should be deleted");
      } else {
        console.log("✨ No problematic books found - database is clean!");
      }
    }
  })
  .catch((err) => {
    console.error("💥 Unexpected error:", err);
  });
