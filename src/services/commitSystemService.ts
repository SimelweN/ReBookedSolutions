import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CommitData {
  id: string;
  buyer_id: string;
  seller_id: string;
  book_id?: string;
  amount: number;
  status: string;
  expires_at?: string;
  commit_deadline?: string;
  seller_committed: boolean;
  committed_at?: string;
  paid_at?: string;
  paystack_reference?: string;
  metadata?: any;
}

export interface CommitResult {
  success: boolean;
  message: string;
  data?: CommitData;
  error?: string;
}

export class CommitSystemService {
  /**
   * Decline a commit (reject the sale)
   */
  static async declineCommit(
    transactionId: string,
    sellerId: string,
  ): Promise<CommitResult> {
    try {
      console.log("🔄 Declining commit:", { transactionId, sellerId });

      // For now, handle this locally since we might not have Edge Functions deployed
      const [transactionsResult, ordersResult] = await Promise.allSettled([
        supabase
          .from("transactions")
          .select("*")
          .eq("id", transactionId)
          .eq("seller_id", sellerId)
          .single(),

        supabase
          .from("orders")
          .select("*")
          .eq("id", transactionId)
          .eq("seller_id", sellerId)
          .single(),
      ]);

      let data = null;
      let tableName = "";

      if (
        transactionsResult.status === "fulfilled" &&
        !transactionsResult.value.error
      ) {
        data = transactionsResult.value.data;
        tableName = "transactions";
      } else if (
        ordersResult.status === "fulfilled" &&
        !ordersResult.value.error
      ) {
        data = ordersResult.value.data;
        tableName = "orders";
      }

      if (!data) {
        throw new Error("Transaction or order not found");
      }

      // Update status to declined/cancelled
      // Prepare base update data
      const baseUpdateData = {
        status: "cancelled",
        updated_at: new Date().toISOString(),
      };

      // Try to add optional columns if they exist
      const updateData: any = { ...baseUpdateData };

      // Only add these columns if they likely exist (graceful degradation)
      try {
        updateData.declined_at = new Date().toISOString();
        updateData.seller_committed = false;

        const { error: updateError } = await supabase
          .from(tableName)
          .update(updateData)
          .eq("id", transactionId)
          .eq("seller_id", sellerId);

        if (updateError) {
          // If error is about missing columns, retry with minimal data
          if (
            updateError.message.includes("declined_at") ||
            updateError.message.includes("seller_committed")
          ) {
            console.warn("Some commit columns missing, using basic update");
            const { error: fallbackError } = await supabase
              .from(tableName)
              .update(baseUpdateData)
              .eq("id", transactionId)
              .eq("seller_id", sellerId);

            if (fallbackError) {
              throw new Error(
                `Failed to decline commit: ${fallbackError.message}`,
              );
            }
          } else {
            throw new Error(`Failed to decline commit: ${updateError.message}`);
          }
        }
      } catch (error) {
        throw error;
      }

      // Create notification for buyer
      try {
        await supabase.from("order_notifications").insert({
          order_id: transactionId,
          user_id: data.buyer_id,
          type: "sale_declined",
          title: "Seller Declined Your Order",
          message: `Unfortunately, the seller could not fulfill your order #${transactionId.slice(0, 8)}. You have been automatically refunded.`,
          read: false,
        });
      } catch (notificationError) {
        console.warn(
          "Failed to create decline notification:",
          notificationError,
        );
      }

      console.log("✅ Commit declined successfully");

      return {
        success: true,
        message: "Order declined. The buyer will be notified and refunded.",
      };
    } catch (error) {
      console.error("❌ CommitSystemService.declineCommit error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to decline commit";

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  }

  /**
   * Commit to a sale using the Edge Function
   */
  static async commitToSale(
    transactionId: string,
    sellerId: string,
  ): Promise<CommitResult> {
    try {
      console.log("🔄 Committing to sale:", { transactionId, sellerId });

      // Get current user session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("User not authenticated");
      }

      // Call the commit-to-sale Edge Function
      const { data, error } = await supabase.functions.invoke(
        "commit-to-sale",
        {
          body: {
            transactionId,
            orderId: transactionId, // Try both in case it's an order ID
            sellerId,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (error) {
        console.error("❌ Commit Edge Function error:", error);

        // Handle different types of edge function errors
        if (
          error.message?.includes("FunctionsHttpError") ||
          error.message?.includes("Failed to send a request") ||
          error.message?.includes("not deployed")
        ) {
          console.log(
            "🔄 Edge Function not available, falling back to direct database commit",
          );
          return await this.commitToSaleLocal(transactionId, sellerId);
        } else {
          throw new Error(error.message || "Failed to commit sale");
        }
      }

      if (!data.success) {
        throw new Error(data.error || "Commit operation failed");
      }

      console.log("✅ Sale committed successfully:", data);

      return {
        success: true,
        message: data.message || "Sale committed successfully!",
        data: data.data,
      };
    } catch (error) {
      console.error("❌ CommitSystemService.commitToSale error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to commit sale";

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  }

  /**
   * Local fallback for committing to sale when Edge Function is not available
   */
  static async commitToSaleLocal(
    transactionId: string,
    sellerId: string,
  ): Promise<CommitResult> {
    try {
      console.log("🔄 Local commit to sale:", { transactionId, sellerId });

      // Get the current user to verify permissions
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || user.id !== sellerId) {
        throw new Error("Unauthorized: You can only commit to your own sales");
      }

      // Try to find transaction first, then order
      const [transactionsResult, ordersResult] = await Promise.allSettled([
        supabase
          .from("transactions")
          .select("*")
          .eq("id", transactionId)
          .eq("seller_id", sellerId)
          .single(),

        supabase
          .from("orders")
          .select("*")
          .eq("id", transactionId)
          .eq("seller_id", sellerId)
          .single(),
      ]);

      let data = null;
      let tableName = "";

      if (
        transactionsResult.status === "fulfilled" &&
        !transactionsResult.value.error
      ) {
        data = transactionsResult.value.data;
        tableName = "transactions";
      } else if (
        ordersResult.status === "fulfilled" &&
        !ordersResult.value.error
      ) {
        data = ordersResult.value.data;
        tableName = "orders";
      }

      if (!data) {
        throw new Error(
          "Transaction or order not found, or you don't have permission to commit this sale",
        );
      }

      // Check if already committed
      if (data.seller_committed || data.status === "committed") {
        return {
          success: true,
          message: "Sale already committed",
          data: data,
        };
      }

      // Check if expired
      const deadline = data.expires_at || data.commit_deadline;
      if (deadline && new Date(deadline) < new Date()) {
        throw new Error("Commit window has expired (48 hours have passed)");
      }

      // Check current status
      const validStatuses = ["paid", "paid_pending_seller"];
      if (!validStatuses.includes(data.status)) {
        throw new Error(`Cannot commit sale with status: ${data.status}`);
      }

      // Update the record
      const now = new Date();
      const { data: updatedRecord, error: updateError } = await supabase
        .from(tableName)
        .update({
          status: "committed",
          seller_committed: true,
          committed_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", data.id)
        .eq("seller_id", sellerId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to commit sale: ${updateError.message}`);
      }

      // Update book status if available
      if (data.book_id) {
        await supabase
          .from("books")
          .update({
            sold: true,
            available: false,
            status: "sold",
            updated_at: now.toISOString(),
          })
          .eq("id", data.book_id);
      }

      // Create notifications
      try {
        await Promise.all([
          supabase.from("order_notifications").insert({
            order_id: data.id,
            user_id: data.buyer_id,
            type: "sale_committed",
            title: "Seller Committed to Your Order",
            message: `Great news! The seller has committed to your order #${data.id.slice(0, 8)}. Your book will be prepared for delivery.`,
            read: false,
          }),
          supabase.from("order_notifications").insert({
            order_id: data.id,
            user_id: data.seller_id,
            type: "commitment_confirmed",
            title: "Sale Commitment Confirmed",
            message: `You have successfully committed to order #${data.id.slice(0, 8)}. Please prepare your book for courier collection.`,
            read: false,
          }),
        ]);
      } catch (notificationError) {
        console.warn("Failed to create notifications:", notificationError);
      }

      return {
        success: true,
        message:
          "Sale committed successfully! Please prepare your book for collection.",
        data: updatedRecord,
      };
    } catch (error) {
      console.error("❌ Local commit error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to commit sale";

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  }

  /**
   * Get pending commits for a seller
   */
  static async getPendingCommits(sellerId: string): Promise<CommitData[]> {
    try {
      console.log("🔍 Fetching pending commits for seller:", sellerId);

      // Check both transactions and orders tables
      const [transactionsResult, ordersResult] = await Promise.allSettled([
        supabase
          .from("transactions")
          .select("*")
          .eq("seller_id", sellerId)
          .eq("status", "paid_pending_seller")
          .order("created_at", { ascending: false }),

        supabase
          .from("orders")
          .select("*")
          .eq("seller_id", sellerId)
          .eq("status", "paid")
          .order("created_at", { ascending: false }),
      ]);

      const transactions =
        transactionsResult.status === "fulfilled" &&
        !transactionsResult.value.error
          ? Array.isArray(transactionsResult.value.data)
            ? transactionsResult.value.data
            : []
          : [];

      const orders =
        ordersResult.status === "fulfilled" && !ordersResult.value.error
          ? Array.isArray(ordersResult.value.data)
            ? ordersResult.value.data
            : []
          : [];

      console.log("Orders validation:", {
        data:
          ordersResult.status === "fulfilled" ? ordersResult.value.data : null,
        isArray: Array.isArray(orders),
        type: typeof orders,
        length: orders.length,
      });

      // Convert orders to transaction-like format
      const formattedOrders = orders.map((order) => ({
        ...order,
        transaction_reference: order.paystack_ref,
        paystack_reference: order.paystack_ref,
        expires_at: order.commit_deadline,
        seller_committed: order.status === "committed",
      }));

      const allPendingCommits = [...transactions, ...formattedOrders];

      console.log(`📊 Found ${allPendingCommits.length} pending commits`);
      return allPendingCommits;
    } catch (error) {
      console.error("❌ Error fetching pending commits:", error);
      return [];
    }
  }

  /**
   * Check if a commit has expired
   */
  static isCommitExpired(commitData: CommitData): boolean {
    const deadline = commitData.expires_at || commitData.commit_deadline;
    if (!deadline) return false;

    return new Date() > new Date(deadline);
  }

  /**
   * Get time remaining for commit in a human-readable format
   */
  static getTimeRemaining(commitData: CommitData): string {
    const deadline = commitData.expires_at || commitData.commit_deadline;
    if (!deadline) return "No deadline set";

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();

    if (diff <= 0) return "⚠️ Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  }

  /**
   * Get commit status with color coding
   */
  static getCommitStatus(commitData: CommitData): {
    status: string;
    color: string;
    urgent: boolean;
  } {
    if (commitData.seller_committed || commitData.status === "committed") {
      return {
        status: "Committed",
        color: "text-green-600",
        urgent: false,
      };
    }

    if (this.isCommitExpired(commitData)) {
      return {
        status: "Expired",
        color: "text-red-600",
        urgent: false,
      };
    }

    const deadline = commitData.expires_at || commitData.commit_deadline;
    if (deadline) {
      const hoursRemaining =
        (new Date(deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60);

      if (hoursRemaining <= 2) {
        return {
          status: "Urgent",
          color: "text-red-600",
          urgent: true,
        };
      } else if (hoursRemaining <= 12) {
        return {
          status: "Soon",
          color: "text-orange-600",
          urgent: true,
        };
      }
    }

    return {
      status: "Pending",
      color: "text-yellow-600",
      urgent: false,
    };
  }

  /**
   * Manually trigger the auto-expire function (for testing)
   */
  static async triggerAutoExpire(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log("🔄 Triggering auto-expire commits...");

      const { data, error } = await supabase.functions.invoke(
        "auto-expire-commits",
      );

      if (error) {
        console.error("Edge function error:", error);
        // Handle different types of edge function errors
        if (error.message?.includes("FunctionsHttpError")) {
          throw new Error("Auto-expire function is not deployed or accessible");
        } else if (error.message?.includes("Failed to send a request")) {
          throw new Error(
            "Cannot reach Edge Function - it may not be deployed",
          );
        } else {
          throw new Error(error.message || "Auto-expire function failed");
        }
      }

      console.log("✅ Auto-expire function response:", data);

      return {
        success: true,
        message: data?.message || "Auto-expire triggered successfully",
      };
    } catch (error) {
      console.error("❌ Error triggering auto-expire:", error);

      let errorMessage = "Failed to trigger auto-expire";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object") {
        errorMessage = JSON.stringify(error);
      }

      // For demo purposes, if the function doesn't exist, simulate the operation
      if (
        errorMessage.includes("not deployed") ||
        errorMessage.includes("Cannot reach")
      ) {
        console.log("🧪 Edge function not available - running demo simulation");

        return {
          success: true,
          message:
            "Demo mode: Auto-expire function simulated (Edge function not deployed)",
        };
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Subscribe to real-time updates for pending commits
   */
  static subscribeToCommitUpdates(
    sellerId: string,
    callback: (commits: CommitData[]) => void,
  ) {
    // Create unique channel names to avoid subscription conflicts
    const timestamp = Date.now();
    const transactionsChannelName = `commit-updates-transactions-${sellerId}-${timestamp}`;
    const ordersChannelName = `commit-updates-orders-${sellerId}-${timestamp}`;

    // Subscribe to transactions table changes
    const transactionSubscription = supabase
      .channel(transactionsChannelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `seller_id=eq.${sellerId}`,
        },
        () => {
          // Refetch and call callback
          this.getPendingCommits(sellerId).then(callback);
        },
      )
      .subscribe();

    // Subscribe to orders table changes
    const orderSubscription = supabase
      .channel(ordersChannelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `seller_id=eq.${sellerId}`,
        },
        () => {
          // Refetch and call callback
          this.getPendingCommits(sellerId).then(callback);
        },
      )
      .subscribe();

    // Return cleanup function
    return () => {
      transactionSubscription.unsubscribe();
      orderSubscription.unsubscribe();
    };
  }
}

export default CommitSystemService;
