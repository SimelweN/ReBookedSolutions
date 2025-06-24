import { supabase } from "@/integrations/supabase/client";
import { Book, BookFilters } from "@/types/book";
import { retryWithConnection } from "@/utils/connectionHealthCheck";
import { logError, logDetailedError } from "@/utils/errorUtils";

// Safe error logging utility
const safeLogError = (context: string, error: any) => {
  try {
    logError(context, error);
  } catch (loggingError) {
    console.error(`Failed to log error for ${context}:`, loggingError);
    logError(context, error);
  }
};

/**
 * Fetch books with applied filters
 */
export const getBooks = async (filters: BookFilters = {}): Promise<Book[]> => {
  try {
    console.log("🔄 [BookQueries] Starting getBooks with filters:", filters);

    // Use connection retry utility with reduced attempts
    return await retryWithConnection(
      async () => {
        // First get books
        let query = supabase
          .from("books")
          .select("*")
          .eq("sold", false)
          .order("created_at", { ascending: false });

        // Apply filters if provided
        if (filters) {
          if (filters.search) {
            query = query.or(
              `title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`,
            );
          }
          if (filters.category) {
            query = query.eq("category", filters.category);
          }
          if (filters.condition) {
            query = query.eq("condition", filters.condition);
          }
          if (filters.grade) {
            query = query.eq("grade", filters.grade);
          }
          if (filters.universityYear) {
            query = query.eq("university_year", filters.universityYear);
          }
          if (filters.university) {
            query = query.eq("university", filters.university);
          }
          if (filters.minPrice !== undefined) {
            query = query.gte("price", filters.minPrice);
          }
          if (filters.maxPrice !== undefined) {
            query = query.lte("price", filters.maxPrice);
          }
        }

        const { data: booksData, error: booksError } = await query;

        if (booksError) {
          const errorMessage = booksError.message || "Unknown database error";
          const errorCode = booksError.code || "NO_CODE";
          const errorDetails = booksError.details || "No additional details";

          // Log with proper string messages only
          console.error(`[Books query failed] ${errorMessage}`);
          console.error(`Books query failed: ${errorMessage} (${errorCode})`);

          // Use safeLogError for detailed logging (no object output)
          safeLogError("Books query failed", booksError);

          throw new Error(
            `Failed to fetch books: ${errorMessage} (Code: ${errorCode})`,
          );
        }

        if (!booksData || booksData.length === 0) {
          console.log("No books found");
          return [];
        }

        // Get unique seller IDs
        const sellerIds = [...new Set(booksData.map((book) => book.seller_id))];

        // Fetch seller profiles separately with error handling
        let profilesMap = new Map();
        try {
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, name, email")
            .in("id", sellerIds);

          if (profilesError) {
            const errorMessage =
              profilesError.message || "Unknown profiles error";
            const errorCode = profilesError.code || "NO_CODE";

            console.warn(
              `Failed to fetch seller profiles: ${errorMessage} (${errorCode})`,
            );
            console.warn("Continuing with fallback seller data...");

            // Create fallback profiles
            sellerIds.forEach((id) => {
              profilesMap.set(id, {
                id,
                name: "Unknown Seller",
                email: "unknown@example.com",
              });
            });
          } else if (profilesData) {
            profilesData.forEach((profile) => {
              profilesMap.set(profile.id, profile);
            });
          }
        } catch (profileError) {
          console.warn("Error fetching profiles:", profileError);
          // Create minimal fallback profiles
          sellerIds.forEach((id) => {
            profilesMap.set(id, {
              id,
              name: "Unknown Seller",
              email: "unknown@example.com",
            });
          });
        }

        // Map books to include seller information
        const books: Book[] = booksData.map((bookData) => {
          const sellerProfile = profilesMap.get(bookData.seller_id) || {
            id: bookData.seller_id,
            name: "Unknown Seller",
            email: "unknown@example.com",
          };

          return {
            id: bookData.id,
            title: bookData.title || "Untitled",
            author: bookData.author || "Unknown Author",
            price: bookData.price || 0,
            condition: bookData.condition || "unknown",
            category: bookData.category || "uncategorized",
            grade: bookData.grade || "",
            university: bookData.university || "",
            universityYear: bookData.university_year || "",
            description: bookData.description || "",
            imageUrl: bookData.image_url || bookData.front_cover || "",
            frontCover: bookData.front_cover || "",
            backCover: bookData.back_cover || "",
            sold: bookData.sold || false,
            createdAt: bookData.created_at || new Date().toISOString(),
            sellerId: bookData.seller_id,
            seller: {
              id: sellerProfile.id,
              name: sellerProfile.name,
              email: sellerProfile.email,
            },
          };
        });

        console.log(
          "✅ [BookQueries] Successfully processed books:",
          books.length,
        );
        return books;
      },
      2,
      500,
    ); // Reduced retries and delay
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`[Error in getBooks] ${errorMessage}`);
    console.error(`Error in getBooks: ${errorMessage}`);

    safeLogError("Error in getBooks", error);

    // Provide user-friendly error message
    const userMessage =
      error instanceof Error && error.message.includes("Failed to fetch")
        ? "Unable to connect to the book database. Please check your internet connection and try again."
        : `Failed to load books: ${errorMessage}. Please try again later.`;

    console.warn(`[BookQueries] ${userMessage}`);

    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};
