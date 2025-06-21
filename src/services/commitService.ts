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
 * Commits a book sale within the 48-hour window
 * Updates the book status and triggers delivery process
 */
export const commitBookSale = async (bookId: string): Promise<void> => {
  try {
    console.log("[CommitService] Starting commit process for book:", bookId);

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
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
      console.error("[CommitService] Error fetching book:", bookError);
      throw new Error("Failed to fetch book details");
    }

    if (!book) {
      throw new Error(
        "Book not found or you don't have permission to commit this sale",
      );
    }

    // Check if book is in pending commit state
    if (book.status !== "pending_commit") {
      throw new Error("Book is not in a state that requires commit");
    }

    // Update book status to committed
    const { error: updateError } = await supabase
      .from("books")
      .update({
        status: "committed",
        committed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookId)
      .eq("seller_id", user.id);

    if (updateError) {
      console.error("[CommitService] Error updating book status:", updateError);
      throw new Error("Failed to commit sale");
    }

    // Log the commit action
    const { error: logError } = await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "commit_sale",
      details: `Committed sale for book ${book.title}`,
      book_id: bookId,
      created_at: new Date().toISOString(),
    });

    if (logError) {
      console.warn("[CommitService] Failed to log commit action:", logError);
      // Don't throw error for logging failure
    }

    // TODO: Trigger delivery process initiation
    // This would typically involve:
    // 1. Notifying the buyer
    // 2. Creating shipping labels
    // 3. Starting the delivery tracking process

    console.log("[CommitService] Book sale committed successfully:", bookId);
  } catch (error) {
    console.error("[CommitService] Error committing book sale:", error);
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
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // For now, return empty array since the commit system would need
    // proper database schema with order tracking
    console.log(
      "[CommitService] Checking for pending commits for user:",
      user.id,
    );

    // Query books that might be sold but not yet committed
    // This is a simplified version - a real implementation would need
    // a proper orders/transactions table
    const { data: books, error } = await supabase
      .from("books")
      .select("*")
      .eq("seller_id", user.id)
      .eq("sold", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[CommitService] Error fetching pending books:", error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }

    // Filter for books that might need commits (this is simplified logic)
    // In a real system, you'd have proper order status tracking
    const pendingCommits = (books || [])
      .filter((book) => {
        // Simplified logic - in reality this would check order status
        return book.sold && !book.committed_at;
      })
      .map((book) => ({
        id: book.id,
        bookId: book.id,
        bookTitle: book.title,
        buyerName: "Buyer", // Would come from orders table
        price: book.price,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours from now
        createdAt: book.created_at,
      }));

    console.log(
      "[CommitService] Found pending commits:",
      pendingCommits.length,
    );
    return pendingCommits;
  } catch (error) {
    console.error("[CommitService] Error getting commit pending books:", error);
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
        // Cancel the order and refund buyer
        const { error: cancelError } = await supabase
          .from("books")
          .update({
            sold: false,
            updated_at: new Date().toISOString(),
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
    console.error("[CommitService] Error handling overdue commits:", error);
    // Don't throw error for background process
  }
};
