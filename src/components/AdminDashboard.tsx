import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  getAdminStats,
  getAllUsers,
  getAllListings,
  AdminStats as AdminStatsType,
  AdminUser,
  AdminListing,
} from "@/services/admin/adminQueries";
import {
  updateUserStatus,
  deleteBookListing,
  sendBroadcastMessage,
} from "@/services/admin/adminMutations";
import { useIsMobile } from "@/hooks/use-mobile";
import AdminStats from "@/components/admin/AdminStats";
import AdminEarningsTab from "@/components/admin/AdminEarningsTab";
import AdminUsersTab from "@/components/admin/AdminUsersTab";
import AdminListingsTab from "@/components/admin/AdminListingsTab";
import AdminSettingsTab from "@/components/admin/AdminSettingsTab";
import AdminContactTab from "@/components/admin/AdminContactTab";
import AdminResourcesTab from "@/components/admin/AdminResourcesTab";

import ErrorFallback from "@/components/ErrorFallback";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useErrorHandler } from "@/hooks/useErrorHandler";

const AdminDashboard = () => {
  const isMobile = useIsMobile();
  const { handleError } = useErrorHandler();

  const [stats, setStats] = useState<AdminStatsType>({
    totalUsers: 0,
    activeListings: 0,
    booksSold: 0,
    reportedIssues: 0,
    newUsersThisWeek: 0,
    salesThisMonth: 0,
    weeklyCommission: 0,
    monthlyCommission: 0,
    pendingReports: 0,
    unreadMessages: 0,
  });

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Loading admin dashboard data...");

      // Load data with individual error handling to prevent cascading failures
      const results = await Promise.allSettled([
        getAdminStats(),
        getAllUsers(),
        getAllListings(),
      ]);

      // Handle stats
      if (results[0].status === "fulfilled") {
        setStats(results[0].value);
        console.log("Stats loaded successfully");
      } else {
        console.error("Failed to load stats:", results[0].reason);
        handleError(results[0].reason, "Load Admin Stats", {
          showToast: false,
        });
      }

      // Handle users
      if (results[1].status === "fulfilled") {
        setUsers(results[1].value);
        console.log("Users loaded successfully:", results[1].value.length);
      } else {
        console.error("Failed to load users:", results[1].reason);
        handleError(results[1].reason, "Load Users", { showToast: false });
        setUsers([]); // Set empty array as fallback
      }

      // Handle listings
      if (results[2].status === "fulfilled") {
        setListings(results[2].value);
        console.log("Listings loaded successfully:", results[2].value.length);
      } else {
        console.error("Failed to load listings:", results[2].reason);
        handleError(results[2].reason, "Load Listings", { showToast: false });
        setListings([]); // Set empty array as fallback
      }

      // Check if all operations failed
      const allFailed = results.every((result) => result.status === "rejected");
      if (allFailed) {
        throw new Error("Failed to load all dashboard data");
      }

      // Show warning if some operations failed
      const failedCount = results.filter(
        (result) => result.status === "rejected",
      ).length;
      if (failedCount > 0) {
        toast.warning(`${failedCount} out of 3 data sections failed to load`);
      }

      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load dashboard data";
      setError(errorMessage);
      handleError(error, "Admin Dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    loadDashboardData();
  };

  const handleUserAction = async (
    userId: string,
    action: "suspend" | "activate",
  ) => {
    try {
      const status = action === "suspend" ? "suspended" : "active";
      await updateUserStatus(userId, status);

      setUsers(
        users.map((user) => (user.id === userId ? { ...user, status } : user)),
      );

      toast.success(`User ${action}d successfully`);

      // Reload stats to reflect the change
      try {
        const newStats = await getAdminStats();
        setStats(newStats);
      } catch (error) {
        console.error("Failed to reload stats after user action:", error);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      handleError(error, `${action} User`);
    }
  };

  const handleListingAction = async (listingId: string, action: "delete") => {
    try {
      if (action === "delete") {
        await deleteBookListing(listingId);

        // Remove from local state immediately for better UX
        setListings(listings.filter((listing) => listing.id !== listingId));
        toast.success("Listing deleted successfully");

        // Reload stats and full listings to ensure accuracy
        try {
          const [newStats, updatedListings] = await Promise.all([
            getAdminStats(),
            getAllListings(),
          ]);
          setStats(newStats);
          setListings(updatedListings);
        } catch (error) {
          console.error("Failed to reload data after listing deletion:", error);
          // Reload the page data to ensure consistency
          loadDashboardData();
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing listing:`, error);
      handleError(error, `${action} Listing`);
      // Reload listings in case of error to show current state
      try {
        const updatedListings = await getAllListings();
        setListings(updatedListings);
      } catch (reloadError) {
        console.error("Failed to reload listings after error:", reloadError);
      }
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      await sendBroadcastMessage(broadcastMessage);
      toast.success(`Broadcast message sent to all ${stats.totalUsers} users`);
      setBroadcastMessage("");
    } catch (error) {
      console.error("Error sending broadcast:", error);
      handleError(error, "Send Broadcast");
    }
  };

  if (error && retryCount < 3) {
    return (
      <ErrorFallback
        error={new Error(error)}
        resetError={handleRetry}
        title="Dashboard Error"
        description="Failed to load admin dashboard. Click 'Try Again' to retry."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <AdminStats stats={stats} />

      <Tabs defaultValue="earnings" className="w-full">
        <TabsList
          className={`grid w-full ${
            isMobile
              ? "grid-cols-2 gap-2 h-auto p-2 bg-gray-50 rounded-lg"
              : "grid-cols-6"
          }`}
        >
          <TabsTrigger
            value="earnings"
            className={
              isMobile
                ? "text-xs px-3 py-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                : ""
            }
          >
            {isMobile ? "Earnings" : "Earnings"}
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className={
              isMobile
                ? "text-xs px-3 py-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                : ""
            }
          >
            <span className="flex items-center justify-center">
              {isMobile ? "Users" : "Users"}
              {stats.totalUsers > 0 && (
                <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                  {stats.totalUsers}
                </span>
              )}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="listings"
            className={
              isMobile
                ? "text-xs px-3 py-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                : ""
            }
          >
            <span className="flex items-center justify-center">
              {isMobile ? "Listings" : "Listings"}
              {listings.length > 0 && (
                <span className="ml-1 bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                  {listings.length}
                </span>
              )}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className={
              isMobile
                ? "text-xs px-3 py-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                : ""
            }
          >
            <span className="flex items-center justify-center">
              {isMobile ? "Contact" : "Contact Messages"}
              {stats.unreadMessages > 0 && (
                <span className="ml-1 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                  {stats.unreadMessages}
                </span>
              )}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className={
              isMobile
                ? "text-xs px-3 py-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                : ""
            }
          >
            {isMobile ? "Resources" : "Resources"}
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className={
              isMobile
                ? "text-xs px-3 py-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                : ""
            }
          >
            {isMobile ? "Settings" : "Settings"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="space-y-4">
          <AdminEarningsTab stats={stats} />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <AdminUsersTab users={users} onUserAction={handleUserAction} />
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          <AdminListingsTab
            listings={listings}
            onListingAction={handleListingAction}
          />
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <AdminContactTab />
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <AdminResourcesTab />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <AdminSettingsTab
            broadcastMessage={broadcastMessage}
            setBroadcastMessage={setBroadcastMessage}
            onSendBroadcast={handleSendBroadcast}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
