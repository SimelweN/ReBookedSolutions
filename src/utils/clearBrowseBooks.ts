import { supabase } from "@/integrations/supabase/client";

/**
 * Simple utility to clear all books for admin use
 */
export const clearAllBrowseBooks = async () => {
  try {
    const { error } = await supabase
      .from("books")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all except impossible ID

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "All books cleared successfully",
    };
  } catch (error) {
    console.error("Error clearing books:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to clear books",
    };
  }
};
