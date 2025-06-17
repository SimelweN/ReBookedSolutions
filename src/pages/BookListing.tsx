import { useState, useEffect, useCallback } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import BookFilters from "@/components/book-listing/BookFilters";
import BookGrid from "@/components/book-listing/BookGrid";
import { getBooks } from "@/services/book/bookQueries";
import { Book } from "@/types/book";
import { toast } from "sonner";

const BookListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [selectedCondition, setSelectedCondition] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedUniversityYear, setSelectedUniversityYear] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [bookType, setBookType] = useState<"all" | "school" | "university">(
    "all",
  );

  // Memoize loadBooks function to prevent infinite loops
  const loadBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const searchQuery = searchParams.get("search") || "";
      const category = searchParams.get("category") || "";
      const grade = searchParams.get("grade") || "";
      const universityYear = searchParams.get("universityYear") || "";
      const university = searchParams.get("university") || "";

      const filters: {
        search?: string;
        category?: string;
        condition?: string;
        grade?: string;
        universityYear?: string;
        university?: string;
        minPrice?: number;
        maxPrice?: number;
      } = {};

      if (searchQuery) filters.search = searchQuery;
      if (category) filters.category = category;
      if (selectedCondition) filters.condition = selectedCondition;
      if (grade) filters.grade = grade;
      if (universityYear) filters.universityYear = universityYear;
      if (selectedUniversity) filters.university = selectedUniversity;

      if (priceRange[0] > 0) filters.minPrice = priceRange[0];
      if (priceRange[1] < 1000) filters.maxPrice = priceRange[1];

      console.log("Applied filters:", filters);

      const loadedBooks = await getBooks(filters);
      console.log("Loaded books count:", loadedBooks.length);

      // Ensure we have an array
      const booksArray = Array.isArray(loadedBooks) ? loadedBooks : [];
      setBooks(booksArray);

      if (booksArray.length === 0) {
        console.log("No books found with current filters");
      }
    } catch (error) {
      const errorDetails = {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : "Unknown",
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      };

      console.error("[BookListing] Error loading books:", errorDetails);

      const userMessage =
        error instanceof Error && error.message.includes("Failed to fetch")
          ? "Unable to connect to the book database. Please check your internet connection and try again."
          : "Failed to load books. Please try again later.";

      toast.error(userMessage);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, selectedCondition, selectedUniversity, priceRange]);

  // Initial load
  useEffect(() => {
    console.log("BookListing component mounted");
    loadBooks();
  }, [loadBooks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search submitted with query:", searchQuery);
    updateFilters();
  };

  const updateFilters = useCallback(() => {
    console.log("Updating filters...");
    const params = new URLSearchParams();

    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedGrade) params.set("grade", selectedGrade);
    if (selectedUniversityYear)
      params.set("universityYear", selectedUniversityYear);
    if (selectedUniversity) params.set("university", selectedUniversity);

    setSearchParams(params);
  }, [
    searchQuery,
    selectedCategory,
    selectedGrade,
    selectedUniversityYear,
    selectedUniversity,
    setSearchParams,
  ]);

  const clearFilters = useCallback(() => {
    console.log("Clearing all filters");
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedCondition("");
    setSelectedGrade("");
    setSelectedUniversityYear("");
    setSelectedUniversity("");
    setPriceRange([0, 1000]);
    setBookType("all");
    setSearchParams({});
  }, [setSearchParams]);

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Error Loading Books
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                loadBooks();
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="Browse Textbooks - ReBooked Solutions"
        description="Browse thousands of used textbooks from students across South Africa. Find affordable academic books for university, college, and high school."
        keywords="browse textbooks, used books, academic books, student books, textbook marketplace"
        url="https://www.rebookedsolutions.co.za/books"
      />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-book-800 mb-4 sm:mb-8 px-2 sm:px-0">
          Browse Books
        </h1>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          <BookFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedCondition={selectedCondition}
            setSelectedCondition={setSelectedCondition}
            selectedGrade={selectedGrade}
            setSelectedGrade={setSelectedGrade}
            selectedUniversityYear={selectedUniversityYear}
            setSelectedUniversityYear={setSelectedUniversityYear}
            selectedUniversity={selectedUniversity}
            setSelectedUniversity={setSelectedUniversity}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            bookType={bookType}
            setBookType={setBookType}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            onSearch={handleSearch}
            onUpdateFilters={updateFilters}
            onClearFilters={clearFilters}
          />

          <BookGrid
            books={books}
            isLoading={isLoading}
            onClearFilters={clearFilters}
          />
        </div>
      </div>
    </Layout>
  );
};

export default BookListing;
