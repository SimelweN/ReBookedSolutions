import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  ShoppingBag,
  DollarSign,
  Bell,
  Plus,
  TrendingUp,
  Package,
  Star,
  MessageSquare,
  Settings,
  BarChart3,
  Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LoadingFallback from "@/components/LoadingFallback";
import EdgeFunctionTester from "@/components/debug/EdgeFunctionTester";

interface DashboardStats {
  totalListings: number;
  activeOrders: number;
  totalSales: number;
  totalPurchases: number;
  unreadNotifications: number;
  recentActivity: any[];
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user's books/listings
      const { data: books, error: booksError } = await supabase
        .from("books")
        .select("id, title, price, sold, status")
        .eq("seller_id", user?.id);

      if (booksError) throw booksError;

      // Fetch user's orders (as buyer)
      const { data: buyerOrders, error: buyerOrdersError } = await supabase
        .from("orders")
        .select("id, status, total_price, created_at")
        .eq("buyer_id", user?.id);

      if (buyerOrdersError) throw buyerOrdersError;

      // Fetch user's orders (as seller)
      const { data: sellerOrders, error: sellerOrdersError } = await supabase
        .from("orders")
        .select("id, status, total_price, created_at")
        .eq("seller_id", user?.id);

      if (sellerOrdersError) throw sellerOrdersError;

      // Fetch notifications
      const { data: notifications, error: notificationsError } = await supabase
        .from("notifications")
        .select("id, read, created_at")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (notificationsError) throw notificationsError;

      // Fetch recent activity
      const { data: activity, error: activityError } = await supabase
        .from("audit_logs")
        .select("action, created_at, details")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (activityError) console.error("Activity fetch error:", activityError);

      // Calculate stats
      const totalListings = books?.length || 0;
      const activeListings =
        books?.filter((book) => !book.sold && book.status === "available")
          .length || 0;
      const totalSales =
        sellerOrders?.filter((order) => order.status === "delivered").length ||
        0;
      const totalPurchases =
        buyerOrders?.filter((order) => order.status === "delivered").length ||
        0;
      const unreadNotifications =
        notifications?.filter((n) => !n.read).length || 0;
      const activeOrders = [
        ...(buyerOrders || []),
        ...(sellerOrders || []),
      ].filter((order) =>
        ["paid", "committed", "shipped", "in_transit"].includes(order.status),
      ).length;

      setStats({
        totalListings: activeListings,
        activeOrders,
        totalSales,
        totalPurchases,
        unreadNotifications,
        recentActivity: activity || [],
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingFallback type="page" message="Loading your dashboard..." />;
  }

  if (!user || !stats) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard Not Available</h1>
        <p className="text-gray-600 mb-6">
          Please log in to view your dashboard.
        </p>
        <Button onClick={() => navigate("/login")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || user.email}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your account
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/notifications")}
            className="relative"
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
            {stats.unreadNotifications > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {stats.unreadNotifications}
              </Badge>
            )}
          </Button>
          <Button size="sm" onClick={() => navigate("/create-listing")}>
            <Plus className="h-4 w-4 mr-2" />
            List Book
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Listings
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground">
              Books available for sale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">Orders in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books Sold</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">Successful sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books Bought</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPurchases}</div>
            <p className="text-xs text-muted-foreground">
              Successful purchases
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/create-listing")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  List a New Book
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/books")}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Books
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/my-orders")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  View My Orders
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/profile")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/banking-setup")}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Banking Setup
                </Button>
              </CardContent>
            </Card>

            {/* Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Profile Completion
                  </span>
                  <Badge variant={profile?.full_name ? "default" : "secondary"}>
                    {profile?.full_name ? "Complete" : "Incomplete"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Verified</span>
                  <Badge
                    variant={
                      user.email_confirmed_at ? "default" : "destructive"
                    }
                  >
                    {user.email_confirmed_at ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Banking Setup</span>
                  <Badge variant="secondary">View Setup</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Notifications</span>
                  <Badge
                    variant={
                      stats.unreadNotifications > 0 ? "destructive" : "default"
                    }
                  >
                    {stats.unreadNotifications} Unread
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium capitalize">
                          {activity.action.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No recent activity to show
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick-actions" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/create-listing")}
            >
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold mb-1">List a Book</h3>
                <p className="text-sm text-gray-600">
                  Sell your textbooks to other students
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/books")}
            >
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold mb-1">Find Books</h3>
                <p className="text-sm text-gray-600">
                  Search for textbooks you need
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/my-orders")}
            >
              <CardContent className="p-6 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold mb-1">Track Orders</h3>
                <p className="text-sm text-gray-600">
                  Monitor your purchases and sales
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/profile")}
            >
              <CardContent className="p-6 text-center">
                <Settings className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <h3 className="font-semibold mb-1">Settings</h3>
                <p className="text-sm text-gray-600">
                  Manage your account preferences
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/banking-setup")}
            >
              <CardContent className="p-6 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold mb-1">Banking</h3>
                <p className="text-sm text-gray-600">Set up payment methods</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/notifications")}
            >
              <CardContent className="p-6 text-center">
                <Bell className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <h3 className="font-semibold mb-1">Notifications</h3>
                <p className="text-sm text-gray-600">
                  Check your messages and updates
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="debug" className="space-y-4">
          <EdgeFunctionTester />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
