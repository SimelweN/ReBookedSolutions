import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExpiredCommit {
  id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  paystack_reference?: string;
  expires_at?: string;
  commit_deadline?: string;
}

/**
 * Client-side auto-expiry system that runs without edge functions
 * Uses browser timers and local checks to handle expired commits
 */
export class ClientCommitAutoExpiry {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isRunning = false;

  /**
   * Start the auto-expiry service (call once in app initialization)
   */
  static start() {
    if (this.isRunning) return;

    console.log("🚀 Starting client-side commit auto-expiry service");
    this.isRunning = true;

    // Temporarily disabled to fix 400 database errors
    console.log(
      "⚠️ Auto-expiry temporarily disabled - fixing database queries",
    );
    return;

    // Check immediately on start
    this.checkAndExpireCommits();

    // Then check every 30 minutes
    this.intervalId = setInterval(
      () => {
        this.checkAndExpireCommits();
      },
      30 * 60 * 1000,
    ); // 30 minutes
  }

  /**
   * Stop the auto-expiry service
   */
  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("⏹️ Stopped client-side commit auto-expiry service");
  }

  /**
   * Manually trigger expiry check (for testing)
   */
  static async manualCheck(): Promise<{
    success: boolean;
    message: string;
    expired: number;
  }> {
    console.log("🔍 Manual commit expiry check triggered");
    const result = await this.checkAndExpireCommits();
    return {
      success: true,
      message: `Manual check completed. ${result.expired} commits expired.`,
      expired: result.expired,
    };
  }

  /**
   * Check for and expire commits that have passed their deadline
   */
  private static async checkAndExpireCommits(): Promise<{ expired: number }> {
    try {
      console.log("⏰ Checking for expired commits...");

      const now = new Date().toISOString();
      let expiredCount = 0;

      // Check transactions table
      const { data: expiredTransactions, error: transError } = await supabase
        .from("transactions")
        .select("*")
        .in("status", ["paid_pending_seller", "paid"])
        .not("seller_committed", "eq", true)
        .or(`expires_at.lt.${now},commit_deadline.lt.${now}`);

      if (transError) {
        console.warn("Error checking expired transactions:", transError);
      } else if (expiredTransactions && expiredTransactions.length > 0) {
        console.log(
          `📋 Found ${expiredTransactions.length} expired transactions`,
        );
        expiredCount += await this.expireCommitList(
          expiredTransactions,
          "transactions",
        );
      }

      // Check orders table
      const { data: expiredOrders, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "paid")
        .not("seller_committed", "eq", true)
        .or(`expires_at.lt.${now},commit_deadline.lt.${now}`);

      if (orderError) {
        console.warn("Error checking expired orders:", orderError);
      } else if (expiredOrders && expiredOrders.length > 0) {
        console.log(`📋 Found ${expiredOrders.length} expired orders`);
        expiredCount += await this.expireCommitList(expiredOrders, "orders");
      }

      if (expiredCount > 0) {
        console.log(`✅ Auto-expired ${expiredCount} commits`);
      } else {
        console.log("✅ No expired commits found");
      }

      return { expired: expiredCount };
    } catch (error) {
      console.error("❌ Error in checkAndExpireCommits:", error);
      return { expired: 0 };
    }
  }

  /**
   * Expire a list of commits from a specific table
   */
  private static async expireCommitList(
    commitList: ExpiredCommit[],
    tableName: "transactions" | "orders",
  ): Promise<number> {
    let expiredCount = 0;

    for (const commit of commitList) {
      try {
        await this.expireSingleCommit(commit, tableName);
        expiredCount++;
      } catch (error) {
        console.error(`Failed to expire ${tableName} ${commit.id}:`, error);
      }
    }

    return expiredCount;
  }

  /**
   * Expire a single commit
   */
  private static async expireSingleCommit(
    commit: ExpiredCommit,
    tableName: "transactions" | "orders",
  ): Promise<void> {
    console.log(`⚠️ Expiring commit ${commit.id} from ${tableName}`);

    // Update status to cancelled/expired
    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
        expired_at: new Date().toISOString(),
      })
      .eq("id", commit.id);

    if (updateError) {
      // Try with minimal update if some columns don't exist
      const { error: fallbackError } = await supabase
        .from(tableName)
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", commit.id);

      if (fallbackError) {
        throw new Error(
          `Failed to update ${tableName}: ${fallbackError.message}`,
        );
      }
    }

    // Set book back to available if book_id exists
    if (commit.book_id) {
      await supabase
        .from("books")
        .update({
          sold: false,
          available: true,
          status: "available",
          updated_at: new Date().toISOString(),
        })
        .eq("id", commit.book_id);
    }

    // Create notifications
    await Promise.allSettled([
      // Notify buyer
      supabase.from("order_notifications").insert({
        order_id: commit.id,
        user_id: commit.buyer_id,
        type: "commit_expired_refund", // Use valid type from schema
        title: "Order Expired - Refund Processed",
        message: `Your order #${commit.id.slice(0, 8)} has expired as the seller didn't commit within 48 hours. You have been automatically refunded.`,
        read: false,
        metadata: {
          notification_subtype: "order_expired",
        },
      }),
      // Notify seller
      supabase.from("order_notifications").insert({
        order_id: commit.id,
        user_id: commit.seller_id,
        type: "commit_expired_penalty", // Use valid type from schema
        title: "Commitment Window Expired",
        message: `Your 48-hour commitment window for order #${commit.id.slice(0, 8)} has expired. The buyer has been refunded and your book has been relisted.`,
        read: false,
        metadata: {
          notification_subtype: "commit_expired",
        },
      }),
    ]);

    console.log(`✅ Expired commit ${commit.id} from ${tableName}`);
  }

  /**
   * Get next expiry time for display purposes
   */
  static async getNextExpiryTime(): Promise<Date | null> {
    try {
      // Get the earliest expiry from both tables
      const { data: nextTransaction, error: transError } = await supabase
        .from("transactions")
        .select("expires_at, commit_deadline")
        .in("status", ["paid_pending_seller", "paid"])
        .not("seller_committed", "eq", true)
        .order("expires_at", { ascending: true, nullsLast: true })
        .order("commit_deadline", { ascending: true, nullsLast: true })
        .limit(1)
        .single();

      const { data: nextOrder, error: orderError } = await supabase
        .from("orders")
        .select("expires_at, commit_deadline")
        .eq("status", "paid")
        .not("seller_committed", "eq", true)
        .order("expires_at", { ascending: true, nullsLast: true })
        .order("commit_deadline", { ascending: true, nullsLast: true })
        .limit(1)
        .single();

      // Handle auth errors gracefully - don't log as errors
      if (
        transError?.code === "UNAUTHORIZED" ||
        transError?.message?.includes("HTTP 401") ||
        transError?.message?.includes("401") ||
        orderError?.code === "UNAUTHORIZED" ||
        orderError?.message?.includes("HTTP 401") ||
        orderError?.message?.includes("401")
      ) {
        // User not authenticated, return null instead of logging error
        return null;
      }

      const dates = [
        nextTransaction?.expires_at || nextTransaction?.commit_deadline,
        nextOrder?.expires_at || nextOrder?.commit_deadline,
      ].filter(Boolean);

      if (dates.length === 0) return null;

      return new Date(Math.min(...dates.map((d) => new Date(d!).getTime())));
    } catch (error) {
      // Only log non-auth errors
      if (
        !error.message?.includes("authentication") &&
        !error.message?.includes("401")
      ) {
        console.warn("Error getting next expiry time:", error);
      }
      return null;
    }
  }

  /**
   * Get count of commits expiring soon (within next 2 hours)
   */
  static async getUrgentCommitsCount(): Promise<number> {
    try {
      const twoHoursFromNow = new Date(
        Date.now() + 2 * 60 * 60 * 1000,
      ).toISOString();

      const [transResult, orderResult] = await Promise.allSettled([
        supabase
          .from("transactions")
          .select("id", { count: "exact", head: true })
          .in("status", ["paid_pending_seller", "paid"])
          .not("seller_committed", "eq", true)
          .or(
            `expires_at.lt.${twoHoursFromNow},commit_deadline.lt.${twoHoursFromNow}`,
          ),

        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("status", "paid")
          .not("seller_committed", "eq", true)
          .or(
            `expires_at.lt.${twoHoursFromNow},commit_deadline.lt.${twoHoursFromNow}`,
          ),
      ]);

      const transCount =
        transResult.status === "fulfilled" ? transResult.value.count || 0 : 0;
      const orderCount =
        orderResult.status === "fulfilled" ? orderResult.value.count || 0 : 0;

      // Check if any results failed due to auth errors
      const hasAuthError =
        (transResult.status === "rejected" &&
          (transResult.reason?.code === "UNAUTHORIZED" ||
            transResult.reason?.message?.includes("authentication") ||
            transResult.reason?.message?.includes("HTTP 401") ||
            transResult.reason?.message?.includes("401"))) ||
        (orderResult.status === "rejected" &&
          (orderResult.reason?.code === "UNAUTHORIZED" ||
            orderResult.reason?.message?.includes("authentication") ||
            orderResult.reason?.message?.includes("HTTP 401") ||
            orderResult.reason?.message?.includes("401")));

      if (hasAuthError) {
        // User not authenticated, return 0 without logging error
        return 0;
      }

      return transCount + orderCount;
    } catch (error) {
      // Only log non-auth errors
      if (
        !error.message?.includes("authentication") &&
        !error.message?.includes("HTTP 401") &&
        !error.message?.includes("401")
      ) {
        console.warn("Error getting urgent commits count:", error);
      }
      return 0;
    }
  }
}

// Export function to manually start auto-expiry (avoid module-level execution)
export const startClientCommitAutoExpiry = () => {
  if (typeof window !== "undefined") {
    // Only run in browser environment
    ClientCommitAutoExpiry.start();

    // Clean up on page unload
    window.addEventListener("beforeunload", () => {
      ClientCommitAutoExpiry.stop();
    });
  }
};
