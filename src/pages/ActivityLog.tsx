import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Package,
  CreditCard,
  Eye,
  Activity,
  ArrowLeft,
  Calendar,
  User,
  ShoppingBag,
  BookOpen,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import { toast } from "sonner";
import {
  ActivityService,
  Activity as ActivityType,
} from "@/services/activityService";
import { useUserOrders } from "@/hooks/useUserOrders";
import PendingCommitsSection from "@/components/profile/PendingCommitsSection";

const ActivityLog: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { orders } = useUserOrders();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    loadActivityLog();
  }, [isAuthenticated, user?.id]);

  const loadActivityLog = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get activities from ActivityService
      const userActivities = await ActivityService.getUserActivities(
        user.id,
        50,
      );

      // Add purchase activities from orders
      const purchaseActivities = orders.map((order, index) => ({
        id: `purchase-${order.id}`,
        user_id: user.id,
        type: "purchase" as const,
        title: "Book Purchase",
        description: `Purchased ${order.items.length} book${order.items.length > 1 ? "s" : ""} for R${(order.amount / 100).toFixed(2)}`,
        metadata: {
          orderId: order.id,
          amount: order.amount,
          itemCount: order.items.length,
          status: order.status,
        },
        created_at: order.created_at,
      }));

      // Combine and sort activities
      const allActivities = [...userActivities, ...purchaseActivities].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setActivities(allActivities);
    } catch (err) {
      console.error("Error loading activity log:", err);
      setError("Failed to load activity. Some activities may not be shown.");

      // Still show purchase activities if main activity service fails
      const purchaseActivities = orders.map((order) => ({
        id: `purchase-${order.id}`,
        user_id: user.id,
        type: "purchase" as const,
        title: "Book Purchase",
        description: `Purchased ${order.items.length} book${order.items.length > 1 ? "s" : ""} for R${(order.amount / 100).toFixed(2)}`,
        metadata: {
          orderId: order.id,
          amount: order.amount,
          itemCount: order.items.length,
          status: order.status,
        },
        created_at: order.created_at,
      }));

      setActivities(purchaseActivities);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "listing_created":
        return <BookOpen className="h-4 w-4" />;
      case "purchase":
        return <ShoppingBag className="h-4 w-4" />;
      case "sale":
        return <CreditCard className="h-4 w-4" />;
      case "profile_updated":
        return <User className="h-4 w-4" />;
      case "login":
        return <UserPlus className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "listing_created":
        return "bg-green-100 text-green-800";
      case "purchase":
        return "bg-blue-100 text-blue-800";
      case "sale":
        return "bg-emerald-100 text-emerald-800";
      case "profile_updated":
        return "bg-purple-100 text-purple-800";
      case "login":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-orange-100 text-orange-800";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return "Just now";
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-book-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your activity...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="My Activity"
        description="View your recent activity and actions"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate(-1)} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="h-6 w-6" />
                My Activity
              </h1>
              <p className="text-gray-600">
                View your recent actions and updates
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">{error}</span>
            </div>
          )}

          {/* Pending Commits Section */}
          <PendingCommitsSection />

          {/* Activity List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No Activity Yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Start using the platform to see your activity here
                  </p>
                  <Button onClick={() => navigate("/books")}>
                    Browse Books
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div
                        className={`p-2 rounded-full ${getActivityColor(activity.type)}`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {activity.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {formatTimestamp(activity.created_at)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {activity.type.replace(/_/g, " ")}
                          </Badge>
                          {activity.metadata?.status && (
                            <Badge variant="secondary" className="text-xs">
                              {activity.metadata.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={() => navigate("/profile")} className="flex-1">
              <Eye className="mr-2 h-4 w-4" />
              View Profile
            </Button>
            <Button
              onClick={() => navigate("/my-orders")}
              variant="outline"
              className="flex-1"
            >
              <Package className="mr-2 h-4 w-4" />
              View Orders
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ActivityLog;
