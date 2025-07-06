import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import { BookFilters, BookQueryResult } from "./bookTypes";
import { mapBookFromDatabase } from "./bookMapper";
import {
  handleBookServiceError,
  logBookServiceError,
} from "./bookErrorHandler";
import {
  logError,
  getErrorMessage,
  logDatabaseError,
} from "@/utils/errorUtils";
import { safeLogError } from "@/utils/errorHandling";
import { retryWithConnection } from "@/utils/connectionHealthCheck";

// Circuit breaker to prevent error spam
let bookQueryErrorCount = 0;
let lastBookQueryError = 0;
const ERROR_SPAM_THRESHOLD = 5;
const ERROR_COOLDOWN_PERIOD = 60000; // 1 minute

const shouldLogBookError = (): boolean => {
  const now = Date.now();

  // Reset error count after cooldown period
  if (now - lastBookQueryError > ERROR_COOLDOWN_PERIOD) {
    bookQueryErrorCount = 0;
  }

  // Only log if we haven't exceeded the threshold
  if (bookQueryErrorCount < ERROR_SPAM_THRESHOLD) {
    bookQueryErrorCount++;
    lastBookQueryError = now;
    return true;
  }

  // Log warning about suppressing errors (only once)
  if (bookQueryErrorCount === ERROR_SPAM_THRESHOLD) {
    console.warn(
      "[BookQueries] Too many errors - suppressing further error logs for 1 minute",
    );
    bookQueryErrorCount++;
  }

  return false;
};

// Enhanced error logging function with spam protection
const logDetailedError = (context: string, error: any, details?: any) => {
  if (shouldLogBookError()) {
    // Extract proper error message
    const errorMessage =
      error instanceof Error
        ? error.message
        : error?.message ||
          (typeof error === "string" ? error : JSON.stringify(error, null, 2));
    const errorCode = error?.code || error?.error_code || "NO_CODE";

    console.error(`[${context}] ${errorMessage} (Code: ${errorCode})`);

    if (details) {
      console.error(`[${context}] Details:`, details);
    }

    // Also log the structured error info
    logError(context, error);
  }
};

// Safe error logging utility
const safeBooksLogError = (context: string, error: any) => {
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

    // Use connection retry utility with reduced attempts for faster failure
    return await retryWithConnection(
      async () => {
        // First get books with timeout
        const booksPromise = (async () => {
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

          return await query;
        })();

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Query timeout")), 5000),
        );

        const { data: booksData, error: booksError } = (await Promise.race([
          booksPromise,
          timeoutPromise,
        ])) as any;

        if (booksError) {
          const errorMessage = booksError.message || "Unknown database error";
          const errorCode = booksError.code || "NO_CODE";

          console.error(`[Books query failed] ${errorMessage}`);
          safeBooksLogError("Books query failed", booksError);

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

        // Fetch enhanced seller profiles using the new service
        let profilesMap = new Map();
        try {
          const { SellerProfileService } = await import(
            "../sellerProfileService"
          );
          const enhancedProfiles =
            await SellerProfileService.getMultipleSellerProfiles(sellerIds);

          enhancedProfiles.forEach((profile, sellerId) => {
            profilesMap.set(sellerId, {
              id: profile.seller_id,
              name: profile.seller_name,
              email: profile.seller_email,
              hasAddress: !!profile.pickup_address,
              hasSubaccount: profile.has_subaccount,
              isReadyForOrders: false, // Will be checked individually if needed
            });
          });
        } catch (profileError) {
          console.warn(
            "Error fetching enhanced profiles, falling back to basic profiles:",
            profileError,
          );

          // Fallback to basic profile fetching
          try {
            const profilesPromise = supabase
              .from("profiles")
              .select("id, name, email, pickup_address, subaccount_code")
              .in("id", sellerIds);

            const profilesTimeout = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Profiles timeout")), 3000),
            );

            const { data: profilesData, error: profilesError } =
              (await Promise.race([profilesPromise, profilesTimeout])) as any;

            if (profilesError) {
              console.warn("Failed to fetch seller profiles, using fallbacks");
            } else if (profilesData) {
              profilesData.forEach((profile: any) => {
                profilesMap.set(profile.id, {
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  hasAddress: !!profile.pickup_address,
                  hasSubaccount: !!profile.subaccount_code?.trim(),
                  isReadyForOrders: false,
                });
              });
            }
          } catch (fallbackError) {
            console.warn("Error fetching fallback profiles:", fallbackError);
          }
        }

        // Ensure all seller IDs have profiles (fallback)
        sellerIds.forEach((id) => {
          if (!profilesMap.has(id)) {
            profilesMap.set(id, {
              id,
              name: "Unknown Seller",
              email: "unknown@example.com",
              hasAddress: false,
              hasSubaccount: false,
              isReadyForOrders: false,
            });
          }
        });

        // Map books to include seller information
        const books: Book[] = booksData.map((bookData: any) => {
          const sellerProfile = profilesMap.get(bookData.seller_id) || {
            id: bookData.seller_id,
            name: "Unknown Seller",
            email: "unknown@example.com",
          };

          // Create book object with safe fallbacks
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
              hasAddress: sellerProfile.hasAddress,
              hasSubaccount: sellerProfile.hasSubaccount,
              isReadyForOrders: sellerProfile.isReadyForOrders,
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
    ); // Reduced retries and delay for faster response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`[Error in getBooks] ${errorMessage}`);
    safeBooksLogError("Error in getBooks", error);

    // Always return empty array instead of throwing to prevent app crashes
    return [];
  }
};

export const getBookById = async (id: string): Promise<Book | null> => {
  try {
    console.log("Fetching book by ID:", id);

    // Validate UUID format before making database call
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      const error = new Error(
        "Invalid book ID format. Please check the link and try again.",
      );
      logDetailedError("Invalid UUID format for book ID", { id, error });
      return null;
    }

    return await retryWithConnection(
      async () => {
        const { data: bookData, error: bookError } = await supabase
          .from("books")
          .select("*")
          .eq("id", id)
          .single();

        if (bookError) {
          if (bookError.code === "PGRST116") {
            // Not found - not an error, just return null
            console.log(`Book not found with ID: ${id}`);
            return null;
          }

          const errorMessage = bookError.message || "Unknown database error";
          const errorCode = bookError.code || "NO_CODE";

          logDetailedError("Failed to fetch book by ID", {
            bookId: id,
            error: bookError,
            code: errorCode,
          });

          throw new Error(
            `Failed to fetch book: ${errorMessage} (Code: ${errorCode})`,
          );
        }

        if (!bookData) {
          console.log(`No book found with ID: ${id}`);
          return null;
        }

        // Fetch seller profile separately
        const { data: sellerProfile, error: sellerError } = await supabase
          .from("profiles")
          .select("id, name, email")
          .eq("id", bookData.seller_id)
          .single();

        if (sellerError) {
          console.warn(
            `Failed to fetch seller profile for book ${id}:`,
            sellerError.message,
          );
          // Continue with fallback seller data instead of failing
        }

        // Use mapBookFromDatabase with fallback seller data
        const fallbackSeller = {
          id: bookData.seller_id,
          name: "Unknown Seller",
          email: "unknown@example.com",
        };

        return mapBookFromDatabase(bookData, sellerProfile || fallbackSeller);
      },
      2,
      500,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logDetailedError("Error in getBookById", {
      bookId: id,
      error,
      errorMessage,
    });

    console.error(`Failed to fetch book ${id}: ${errorMessage}`);

    // Return null instead of throwing to prevent crashes
    return null;
  }
};

export const getBooksByUser = async (userId: string): Promise<Book[]> => {
  try {
    if (!userId) {
      console.warn("getBooksByUser called with empty userId");
      return [];
    }

    console.log("Fetching books for user:", userId);

    return await retryWithConnection(
      async () => {
        const { data: booksData, error: booksError } = await supabase
          .from("books")
          .select("*")
          .eq("seller_id", userId)
          .order("created_at", { ascending: false });

        if (booksError) {
          const errorMessage = booksError.message || "Unknown database error";
          const errorCode = booksError.code || "NO_CODE";

          logDetailedError("Failed to fetch books by user", {
            userId,
            error: booksError,
            code: errorCode,
          });

          throw new Error(
            `Failed to fetch user books: ${errorMessage} (Code: ${errorCode})`,
          );
        }

        if (!booksData || booksData.length === 0) {
          console.log(`No books found for user: ${userId}`);
          return [];
        }

        // Fetch seller profile
        const { data: sellerProfile, error: sellerError } = await supabase
          .from("profiles")
          .select("id, name, email")
          .eq("id", userId)
          .single();

        const fallbackSeller = {
          id: userId,
          name: "Unknown Seller",
          email: "unknown@example.com",
        };

        const seller = sellerProfile || fallbackSeller;

        if (sellerError) {
          console.warn(
            `Failed to fetch seller profile for user ${userId}:`,
            sellerError.message,
          );
        }

        // Map books using the seller profile
        const books = booksData.map((bookData) =>
          mapBookFromDatabase(bookData, seller),
        );

        console.log(
          `✅ Successfully fetched ${books.length} books for user ${userId}`,
        );
        return books;
      },
      2,
      500,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logDetailedError("Error in getBooksByUser", {
      userId,
      error,
      errorMessage,
    });

    console.error(`Failed to fetch books for user ${userId}: ${errorMessage}`);

    // Return empty array instead of throwing
    return [];
  }
};

export const searchBooks = async (
  searchQuery: string,
  filters: BookFilters = {},
): Promise<BookQueryResult> => {
  try {
    if (!searchQuery || searchQuery.trim().length === 0) {
      return {
        books: [],
        total: 0,
        hasMore: false,
        error: null,
      };
    }

    console.log("Searching books with query:", searchQuery);

    const searchFilters: BookFilters = {
      ...filters,
      search: searchQuery.trim(),
    };

    const books = await getBooks(searchFilters);

    return {
      books,
      total: books.length,
      hasMore: false, // For now, we return all results
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logDetailedError("Error in searchBooks", {
      searchQuery,
      filters,
      error,
      errorMessage,
    });

    console.error(`Search failed for query "${searchQuery}": ${errorMessage}`);

    return {
      books: [],
      total: 0,
      hasMore: false,
      error: errorMessage,
    };
  }
};
