import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CommitData {
  bookId: string;
  sellerId: string;
  buyerId: string;
  saleAmount: number;
  commitDeadline: string;
}

/**
 * Helper function to properly log errors with meaningful information
 */
const logCommitError = (
  message: string,
  error: unknown,
  context?: Record<string, any>,
) => {
  try {
    let errorInfo: any = {
      timestamp: new Date().toISOString(),
      context: context || {},
    };

    if (error instanceof Error) {
      errorInfo.type = "Error";
      errorInfo.message = error.message;
      errorInfo.stack = error.stack;
    } else if (error && typeof error === "object") {
      errorInfo.type = "Object";
      errorInfo.message = (error as any).message || "No message";
      errorInfo.code = (error as any).code || "unknown";
      errorInfo.details =
        (error as any).details || (error as any).hint || "No details";

      // Try to stringify the whole error object for debugging
      try {
        errorInfo.fullError = JSON.stringify(error, null, 2);
      } catch (stringifyError) {
        errorInfo.fullError = "Could not stringify error object";
        errorInfo.errorKeys = Object.keys(error);
      }
    } else {
      errorInfo.type = typeof error;
      errorInfo.message = String(error);
    }

    console.error(`[CommitService] ${message}:`, errorInfo);
  } catch (loggingError) {
    // Fallback if our error logging itself fails
    console.error(`[CommitService] ${message}: Error logging failed`, {
      originalError: error,
      loggingError: loggingError,
    });
  }
};

/**
 * Commits a book sale within the 48-hour window
 * Updates the book status and triggers delivery process
 */
export const commitBookSale = async (bookId: string): Promise<void> => {
  try {
    console.log("[CommitService] Starting commit process for book:", bookId);

    // Validate input
    if (!bookId || typeof bookId !== "string") {
      throw new Error("Invalid book ID provided");
    }

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      if (userError) {
        logCommitError("Authentication error", userError);
      } else {
        console.log("[CommitService] No authenticated user found");
      }
      throw new Error("User not authenticated");
    }

    // First, check if the book exists and is in the correct state
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .eq("seller_id", user.id)
      .single();

    if (bookError) {
      logCommitError("Error fetching book", bookError, {
        bookId,
        userId: user.id,
      });
      throw new Error(
        `Failed to fetch book details: ${bookError.message || "Database error"}`,
      );
    }

    if (!book) {
      console.warn(
        "[CommitService] Book not found - ID:",
        bookId,
        "User:",
        user.id,
      );
      throw new Error(
        "Book not found or you don't have permission to commit this sale",
      );
    }

    // For now, just log the commit action since the commit system is in development
    console.log("[CommitService] Processing commit for book:", book.title);

    // Check if book is already sold
    if (book.sold) {
      console.log("[CommitService] Book is already marked as sold");
      // In a real system, we'd check if commit is already processed
    }

    // Update book to mark as sold and available = false
    const { error: updateError } = await supabase
      .from("books")
      .update({
        sold: true,
        available: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookId)
      .eq("seller_id", user.id);

    if (updateError) {
      logCommitError("Error updating book status", updateError, {
        bookId,
        userId: user.id,
      });
      throw new Error(
        `Failed to commit sale: ${updateError.message || "Database update failed"}`,
      );
    }

    // Log the commit action (console logging for now)
    console.log("[CommitService] Commit action completed:", {
      userId: user.id,
      action: "commit_sale",
      bookId: bookId,
      bookTitle: book.title,
      timestamp: new Date().toISOString(),
    });

    // TODO: Trigger delivery process initiation
    // This would typically involve:
    // 1. Notifying the buyer
    // 2. Creating shipping labels
    // 3. Starting the delivery tracking process

    console.log("[CommitService] Book sale committed successfully:", bookId);
  } catch (error) {
    logCommitError("Error committing book sale", error);
    throw error;
  }
};

/**
 * Checks if a book sale commit is overdue (past 48 hours)
 */
export const checkCommitDeadline = (orderCreatedAt: string): boolean => {
  const orderDate = new Date(orderCreatedAt);
  const now = new Date();
  const diffInHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

  return diffInHours > 48;
};

/**
 * Gets books that require commit action for the current user
 */
export const getCommitPendingBooks = async (): Promise<any[]> => {
  try {
    console.log("[CommitService] Starting getCommitPendingBooks...");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "[CommitService] Authentication error:",
        userError.message || userError,
      );
      return [];
    }

    if (!user) {
      console.log("[CommitService] No authenticated user found");
      return [];
    }

    // For now, return empty array since the commit system would need
    // proper database schema with order tracking
    console.log(
      "[CommitService] Checking for pending commits for user:",
      user.id,
    );

    // Query books that are available but might need commits
    // Focus on books that are available and not sold yet
    console.log("[CommitService] Querying available books for user:", user.id);

    const { data: books, error } = await supabase
      .from("books")
      .select("id, title, price, sold, created_at, seller_id")
      .eq("seller_id", user.id)
      .eq("sold", false)
      .order("created_at", { ascending: false })
      .limit(10); // Limit to recent books

    console.log(
      "[CommitService] Query executed, error:",
      !!error,
      "data:",
      !!books,
    );

    if (error) {
      // Enhanced error logging for debugging
      console.error("[CommitService] Raw error object:", error);
      console.error("[CommitService] Error message:", error.message);
      console.error("[CommitService] Error code:", error.code);
      console.error("[CommitService] Error details:", error.details);
      console.error("[CommitService] Error hint:", error.hint);

      logCommitError("Error fetching pending books", error, {
        userId: user.id,
        query:
          "books table, seller_id + sold filters (removed non-existent available column)",
        errorMessage: error.message,
        errorCode: error.code,
        errorDetails: error.details,
      });
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }

    console.log(
      "[CommitService] Query successful, found books:",
      books?.length || 0,
    );

    // For demonstration purposes, return empty array since we don't have a proper order system
    // In a real system, this would query an orders table for pending transactions
    const pendingCommits: any[] = [];

    console.log(
      "[CommitService] Simplified commit system - returning empty commits",
    );
    console.log("[CommitService] Available books found:", books?.length || 0);

    console.log(
      "[CommitService] Found pending commits:",
      pendingCommits.length,
    );
    console.log("[CommitService] Returning commits data:", pendingCommits);
    return pendingCommits;
  } catch (error) {
    logCommitError("Exception in getCommitPendingBooks", error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
};

/**
 * Handles automatic cancellation of overdue commits
 */
export const handleOverdueCommits = async (): Promise<void> => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return; // Silent fail for background process
    }

    const pendingBooks = await getCommitPendingBooks();

    for (const book of pendingBooks) {
      if (book.createdAt && checkCommitDeadline(book.createdAt)) {
        // Cancel the order and make book available again
        const { error: cancelError } = await supabase
          .from("books")
          .update({
            sold: false,
          })
          .eq("id", book.bookId);

        if (cancelError) {
          console.error(
            `Failed to cancel overdue commit for book ${book.bookId}:`,
            cancelError,
          );
        } else {
          console.log(`Cancelled overdue commit for book ${book.bookId}`);

          // TODO: Trigger refund process
          // TODO: Notify both buyer and seller
        }
      }
    }
  } catch (error) {
    logCommitError("Error handling overdue commits", error);
    // Don't throw error for background process
  }
};
