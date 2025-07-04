import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminUserDetails {
  id: string;
  name: string;
  email: string;
  status: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;

  // Profile details
  phone?: string;
  university?: string;
  address_line1?: string;
  city?: string;
  province?: string;
  country?: string;

  // Statistics
  total_listings: number;
  active_listings: number;
  sold_books: number;
  total_purchases: number;
  total_sales_value: number; // in cents
  average_rating?: number;

  // Banking details (for sellers)
  has_banking_setup: boolean;
  banking_verified: boolean;

  // Recent activity
  last_login?: string;
  last_activity?: string;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AdminUserUpdate {
  name?: string;
  status?: "active" | "inactive" | "suspended";
  is_admin?: boolean;
  phone?: string;
  university?: string;
}

/**
 * Get all users with comprehensive details for admin dashboard
 */
export const getAllUsersForAdmin = async (
  limit: number = 50,
  offset: number = 0,
  search?: string,
  status?: string,
): Promise<AdminUserDetails[]> => {
  try {
    let query = supabase
      .from("profiles")
      .select(
        `
        id,
        name,
        email,
        status,
        is_admin,
        phone,
        university,
        address_line1,
        city,
        province,
        country,
        created_at,
        updated_at
      `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    if (!users) return [];

    // Enrich with statistics
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const [bookStats, orderStats, bankingInfo] = await Promise.allSettled([
          getUserBookStats(user.id),
          getUserOrderStats(user.id),
          getUserBankingInfo(user.id),
        ]);

        const bookData =
          bookStats.status === "fulfilled"
            ? bookStats.value
            : {
                total_listings: 0,
                active_listings: 0,
                sold_books: 0,
                total_sales_value: 0,
              };

        const orderData =
          orderStats.status === "fulfilled"
            ? orderStats.value
            : {
                total_purchases: 0,
              };

        const banking =
          bankingInfo.status === "fulfilled"
            ? bankingInfo.value
            : {
                has_banking_setup: false,
                banking_verified: false,
              };

        return {
          ...user,
          ...bookData,
          ...orderData,
          ...banking,
        } as AdminUserDetails;
      }),
    );

    return enrichedUsers;
  } catch (error) {
    console.error("Error in getAllUsersForAdmin:", error);
    throw error;
  }
};

/**
 * Get user book statistics
 */
const getUserBookStats = async (userId: string) => {
  const [totalListings, activeListings, soldBooks, salesValue] =
    await Promise.all([
      // Total listings
      supabase
        .from("books")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", userId),

      // Active listings
      supabase
        .from("books")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", userId)
        .eq("sold", false),

      // Sold books
      supabase
        .from("books")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", userId)
        .eq("sold", true),

      // Total sales value
      supabase
        .from("orders")
        .select("seller_amount")
        .eq("seller_id", userId)
        .eq("status", "completed"),
    ]);

  const totalSalesValue =
    salesValue.data?.reduce(
      (sum, order) => sum + (order.seller_amount || 0),
      0,
    ) || 0;

  return {
    total_listings: totalListings.count || 0,
    active_listings: activeListings.count || 0,
    sold_books: soldBooks.count || 0,
    total_sales_value: totalSalesValue,
  };
};

/**
 * Get user order statistics
 */
const getUserOrderStats = async (userId: string) => {
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("buyer_id", userId);

  return {
    total_purchases: count || 0,
  };
};

/**
 * Get user banking information
 */
const getUserBankingInfo = async (userId: string) => {
  const { data: banking, error } = await supabase
    .from("banking_details")
    .select("account_verified")
    .eq("user_id", userId)
    .single();

  return {
    has_banking_setup: !error && !!banking,
    banking_verified: banking?.account_verified || false,
  };
};

/**
 * Get detailed user information by ID
 */
export const getUserDetailsForAdmin = async (
  userId: string,
): Promise<AdminUserDetails | null> => {
  try {
    const { data: user, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        name,
        email,
        status,
        is_admin,
        phone,
        university,
        address_line1,
        city,
        province,
        country,
        created_at,
        updated_at
      `,
      )
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // User not found
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    // Get additional statistics
    const [bookStats, orderStats, bankingInfo] = await Promise.allSettled([
      getUserBookStats(userId),
      getUserOrderStats(userId),
      getUserBankingInfo(userId),
    ]);

    const bookData =
      bookStats.status === "fulfilled"
        ? bookStats.value
        : {
            total_listings: 0,
            active_listings: 0,
            sold_books: 0,
            total_sales_value: 0,
          };

    const orderData =
      orderStats.status === "fulfilled"
        ? orderStats.value
        : {
            total_purchases: 0,
          };

    const banking =
      bankingInfo.status === "fulfilled"
        ? bankingInfo.value
        : {
            has_banking_setup: false,
            banking_verified: false,
          };

    return {
      ...user,
      ...bookData,
      ...orderData,
      ...banking,
    } as AdminUserDetails;
  } catch (error) {
    console.error("Error in getUserDetailsForAdmin:", error);
    throw error;
  }
};

/**
 * Update user profile (admin only)
 */
export const updateUserForAdmin = async (
  userId: string,
  updates: AdminUserUpdate,
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    toast.success("User updated successfully");
  } catch (error) {
    console.error("Error in updateUserForAdmin:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update user";
    toast.error(message);
    throw error;
  }
};

/**
 * Suspend/unsuspend user account
 */
export const toggleUserStatus = async (
  userId: string,
  suspend: boolean,
): Promise<void> => {
  try {
    const newStatus = suspend ? "suspended" : "active";

    const { error } = await supabase
      .from("profiles")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      throw new Error(
        `Failed to ${suspend ? "suspend" : "unsuspend"} user: ${error.message}`,
      );
    }

    toast.success(`User ${suspend ? "suspended" : "unsuspended"} successfully`);
  } catch (error) {
    console.error("Error in toggleUserStatus:", error);
    const message =
      error instanceof Error
        ? error.message
        : `Failed to ${suspend ? "suspend" : "unsuspend"} user`;
    toast.error(message);
    throw error;
  }
};

/**
 * Grant/revoke admin privileges
 */
export const toggleAdminStatus = async (
  userId: string,
  makeAdmin: boolean,
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        is_admin: makeAdmin,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      throw new Error(
        `Failed to ${makeAdmin ? "grant" : "revoke"} admin privileges: ${error.message}`,
      );
    }

    toast.success(
      `Admin privileges ${makeAdmin ? "granted" : "revoked"} successfully`,
    );
  } catch (error) {
    console.error("Error in toggleAdminStatus:", error);
    const message =
      error instanceof Error
        ? error.message
        : `Failed to ${makeAdmin ? "grant" : "revoke"} admin privileges`;
    toast.error(message);
    throw error;
  }
};

/**
 * Delete user account (admin only - careful!)
 */
export const deleteUserAccount = async (
  userId: string,
  reason: string,
): Promise<void> => {
  try {
    // First, update all user's books to mark them as unavailable
    await supabase
      .from("books")
      .update({
        sold: true,
        available: false,
        deleted_reason: reason,
      })
      .eq("seller_id", userId);

    // Cancel any pending orders
    await supabase
      .from("orders")
      .update({
        status: "cancelled",
        cancellation_reason: `Account deleted: ${reason}`,
        cancelled_at: new Date().toISOString(),
      })
      .eq("seller_id", userId)
      .in("status", ["pending", "paid", "awaiting_collection"]);

    // Mark profile as deleted (don't actually delete to preserve data integrity)
    const { error } = await supabase
      .from("profiles")
      .update({
        status: "deleted",
        name: "Deleted User",
        email: `deleted-${userId}@deleted.local`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      throw new Error(`Failed to delete user account: ${error.message}`);
    }

    toast.success("User account deleted successfully");
  } catch (error) {
    console.error("Error in deleteUserAccount:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete user account";
    toast.error(message);
    throw error;
  }
};

/**
 * Get user activity logs
 */
export const getUserActivityLogs = async (
  userId: string,
  limit: number = 50,
): Promise<UserActivityLog[]> => {
  try {
    const { data: logs, error } = await supabase
      .from("user_activity_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching activity logs:", error);
      return []; // Return empty array instead of throwing
    }

    return logs || [];
  } catch (error) {
    console.error("Error in getUserActivityLogs:", error);
    return [];
  }
};

/**
 * Get user statistics summary
 */
export const getUserStatsSummary = async (): Promise<{
  total_users: number;
  active_users: number;
  suspended_users: number;
  admin_users: number;
  new_users_this_week: number;
  new_users_this_month: number;
}> => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      adminUsers,
      newUsersWeek,
      newUsersMonth,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("status", "suspended"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_admin", true),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", oneWeekAgo.toISOString()),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", oneMonthAgo.toISOString()),
    ]);

    return {
      total_users: totalUsers.count || 0,
      active_users: activeUsers.count || 0,
      suspended_users: suspendedUsers.count || 0,
      admin_users: adminUsers.count || 0,
      new_users_this_week: newUsersWeek.count || 0,
      new_users_this_month: newUsersMonth.count || 0,
    };
  } catch (error) {
    console.error("Error in getUserStatsSummary:", error);
    return {
      total_users: 0,
      active_users: 0,
      suspended_users: 0,
      admin_users: 0,
      new_users_this_week: 0,
      new_users_this_month: 0,
    };
  }
};
