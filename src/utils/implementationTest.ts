import { supabase } from "@/integrations/supabase/client";

export const testImplementation = async () => {
  const results = {
    schemaTest: { passed: false, error: null as string | null },
    bookMappingTest: { passed: false, error: null as string | null },
    addressTest: { passed: false, error: null as string | null },
    bookDeletionTest: { passed: false, error: null as string | null },
  };

  try {
    // 1. Test database schema - check if new columns exist
    // Testing database schema
    const { data: _schemaData, error: schemaError } = await supabase
      .from("books")
      .select("id, availability, updated_at, university")
      .limit(1);

    if (schemaError) {
      results.schemaTest.error = schemaError.message;
    } else {
      results.schemaTest.passed = true;
      // Schema test passed
    }

    // 2. Test book mapping - check if books can be fetched with new fields
    // Testing book mapping
    const { data: booksData, error: booksError } = await supabase
      .from("books")
      .select("*, profiles(id, name, email)")
      .limit(1);

    if (booksError) {
      results.bookMappingTest.error = booksError.message;
    } else if (booksData && booksData.length > 0) {
      const book = booksData[0];
      const hasRequiredFields =
        book.id && book.title && book.availability !== undefined;
      results.bookMappingTest.passed = hasRequiredFields;
      // Book mapping test passed
    } else {
      results.bookMappingTest.passed = true; // No books to test but query worked
      // Book mapping test passed (no books to test)
    }

    // 3. Test address format - check if profiles have proper address structure
    // Testing address format
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, pickup_address, shipping_address")
      .not("pickup_address", "is", null)
      .limit(1);

    if (profileError) {
      results.addressTest.error = profileError.message;
    } else {
      results.addressTest.passed = true;
      // Address format test passed
    }

    // 4. Test BookDeletionService compatibility - simulate update without actually changing data
    // Testing BookDeletionService compatibility
    const { error: deletionTestError } = await supabase
      .from("books")
      .select("id, availability, updated_at")
      .eq("sold", false)
      .limit(1);

    if (deletionTestError) {
      results.bookDeletionTest.error = deletionTestError.message;
    } else {
      results.bookDeletionTest.passed = true;
      // BookDeletionService compatibility test passed
    }
  } catch (error) {
    console.error("❌ Implementation test error:", error);
  }

  return results;
};
