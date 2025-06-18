// Browser console script to clean up duplicate/test books
// Usage: Open browser console and paste this script

console.log("🧹 Starting book cleanup...");

// Function to clean up specific books
async function cleanupBooks() {
  try {
    // Titles to delete (from user's list)
    const titlesToDelete = [
      "Data Structures and Algorithms Mastery",
      "Advanced Physics Mechanics",
      "Constitutional Law of South Africa",
      "Business Management Fundamentals",
      "Psychology: The Science of Mind",
      "Human Anatomy and Physiology",
      "Calculus and Analytical Geometry",
      "Financial Accounting Principles",
      "Organic Chemistry 3rd Edition",
      "Introduction to Computer Science",
      "Environmental Science Today",
    ];

    console.log("🎯 Targeting these titles:", titlesToDelete);

    // Create Supabase client (assuming it's available globally)
    const supabaseUrl = "https://kbpjqzaqbqukutflwixf.supabase.co";
    const supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImticGpxemFxYnF1a3V0Zmx3aXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NjMzNzcsImV4cCI6MjA2MzEzOTM3N30.3EdAkGlyFv1JRaRw9OFMyA5AkkKoXp0hdX1bFWpLVMc";

    // Import Supabase
    const { createClient } = await import(
      "https://esm.sh/@supabase/supabase-js@2"
    );
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all books that match the titles
    const { data: booksToDelete, error: fetchError } = await supabase
      .from("books")
      .select("id, title, author")
      .in("title", titlesToDelete);

    if (fetchError) {
      console.error("❌ Error fetching books:", fetchError);
      return;
    }

    if (!booksToDelete || booksToDelete.length === 0) {
      console.log("✨ No matching books found - database is already clean!");
      return;
    }

    console.log(
      `📚 Found ${booksToDelete.length} books to delete:`,
      booksToDelete,
    );

    // Delete the books
    const bookIds = booksToDelete.map((book) => book.id);
    const { error: deleteError } = await supabase
      .from("books")
      .delete()
      .in("id", bookIds);

    if (deleteError) {
      console.error("❌ Error deleting books:", deleteError);
      return;
    }

    console.log(`✅ Successfully deleted ${booksToDelete.length} books!`);
    console.log("🔄 Refreshing page to show clean data...");

    // Refresh the page
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error) {
    console.error("💥 Cleanup failed:", error);
  }
}

// Run the cleanup
cleanupBooks();
