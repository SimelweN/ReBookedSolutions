import { supabase } from "@/integrations/supabase/client";

export interface PaymentAttempt {
  user_id: string;
  book_id: string;
  amount: number;
  timestamp: string;
  payment_ref?: string;
  status: "pending" | "completed" | "failed" | "cancelled";
}

export class DuplicatePaymentPrevention {
  private static attempts: Map<string, PaymentAttempt> = new Map();
  private static readonly PREVENTION_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if a payment attempt is a duplicate
   */
  static isDuplicateAttempt(
    userId: string,
    bookId: string,
    amount: number,
  ): boolean {
    const key = `${userId}_${bookId}`;
    const existing = this.attempts.get(key);

    if (!existing) {
      return false;
    }

    const timeDiff = Date.now() - new Date(existing.timestamp).getTime();

    // If attempt is within prevention window and not failed
    if (timeDiff < this.PREVENTION_WINDOW_MS && existing.status !== "failed") {
      return true;
    }

    // Clean up old attempt
    this.attempts.delete(key);
    return false;
  }

  /**
   * Register a new payment attempt
   */
  static registerAttempt(
    userId: string,
    bookId: string,
    amount: number,
    paymentRef?: string,
  ): void {
    const key = `${userId}_${bookId}`;

    this.attempts.set(key, {
      user_id: userId,
      book_id: bookId,
      amount,
      timestamp: new Date().toISOString(),
      payment_ref: paymentRef,
      status: "pending",
    });
  }

  /**
   * Update payment attempt status
   */
  static updateAttemptStatus(
    userId: string,
    bookId: string,
    status: PaymentAttempt["status"],
  ): void {
    const key = `${userId}_${bookId}`;
    const existing = this.attempts.get(key);

    if (existing) {
      existing.status = status;
      this.attempts.set(key, existing);
    }
  }

  /**
   * Check if book is already sold (from database)
   */
  static async isBookAlreadySold(bookId: string): Promise<boolean> {
    try {
      const { data: book, error } = await supabase
        .from("books")
        .select("sold")
        .eq("id", bookId)
        .single();

      if (error) {
        console.error("Error checking book status:", error);
        return false; // Allow purchase attempt if we can't verify
      }

      return book?.sold === true;
    } catch (error) {
      console.error("Exception checking book status:", error);
      return false;
    }
  }

  /**
   * Check if user has already purchased this book
   */
  static async hasUserPurchasedBook(
    userEmail: string,
    bookId: string,
  ): Promise<boolean> {
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("id, status, items")
        .eq("buyer_email", userEmail)
        .in("status", ["paid", "committed", "shipped", "delivered"]);

      if (error) {
        console.error("Error checking user purchases:", error);
        return false;
      }

      // Check if any order contains this book
      const hasPurchased = orders?.some((order) => {
        return order.items?.some((item: any) => item.book_id === bookId);
      });

      return hasPurchased || false;
    } catch (error) {
      console.error("Exception checking user purchases:", error);
      return false;
    }
  }

  /**
   * Check if there's a pending payment for this book
   */
  static async hasPendingPayment(bookId: string): Promise<boolean> {
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("id, status, items")
        .eq("status", "pending");

      if (error) {
        console.error("Error checking pending payments:", error);
        return false;
      }

      // Check if any pending order contains this book
      const hasPending = orders?.some((order) => {
        return order.items?.some((item: any) => item.book_id === bookId);
      });

      return hasPending || false;
    } catch (error) {
      console.error("Exception checking pending payments:", error);
      return false;
    }
  }

  /**
   * Comprehensive purchase validation
   */
  static async validatePurchaseAttempt(
    userEmail: string,
    userId: string,
    bookId: string,
    amount: number,
  ): Promise<{
    valid: boolean;
    reason?: string;
  }> {
    try {
      // Check for duplicate attempt in memory
      if (this.isDuplicateAttempt(userId, bookId, amount)) {
        return {
          valid: false,
          reason:
            "Duplicate payment attempt detected. Please wait before trying again.",
        };
      }

      // Check if book is already sold
      const isBookSold = await this.isBookAlreadySold(bookId);
      if (isBookSold) {
        return {
          valid: false,
          reason: "This book has already been sold.",
        };
      }

      // Check if user already purchased this book
      const hasAlreadyPurchased = await this.hasUserPurchasedBook(
        userEmail,
        bookId,
      );
      if (hasAlreadyPurchased) {
        return {
          valid: false,
          reason: "You have already purchased this book.",
        };
      }

      // Check for pending payments for this book
      const hasPending = await this.hasPendingPayment(bookId);
      if (hasPending) {
        return {
          valid: false,
          reason: "There is already a pending payment for this book.",
        };
      }

      return { valid: true };
    } catch (error) {
      console.error("Exception validating purchase attempt:", error);
      return {
        valid: false,
        reason: "Unable to validate purchase. Please try again.",
      };
    }
  }

  /**
   * Clean up old attempts (call periodically)
   */
  static cleanupOldAttempts(): void {
    const now = Date.now();
    const cutoff = now - this.PREVENTION_WINDOW_MS;

    for (const [key, attempt] of this.attempts.entries()) {
      const attemptTime = new Date(attempt.timestamp).getTime();
      if (attemptTime < cutoff) {
        this.attempts.delete(key);
      }
    }
  }

  /**
   * Get current attempt count (for debugging)
   */
  static getAttemptCount(): number {
    return this.attempts.size;
  }

  /**
   * Clear all attempts (for debugging/testing)
   */
  static clearAllAttempts(): void {
    this.attempts.clear();
  }
}

// Clean up old attempts every 5 minutes
setInterval(
  () => {
    DuplicatePaymentPrevention.cleanupOldAttempts();
  },
  5 * 60 * 1000,
);

export default DuplicatePaymentPrevention;
