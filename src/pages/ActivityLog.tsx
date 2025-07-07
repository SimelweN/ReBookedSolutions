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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import { toast } from "sonner";

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

const ActivityLog: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    loadActivityLog();
  }, [isAuthenticated]); // Removed navigate and loadActivityLog to prevent loops

  const loadActivityLog = () => {
    setLoading(true);

    // For now, show sample activities - you can connect to your ActivityService later
    const sampleActivities: ActivityItem[] = [
      {
        id: "1",
        type: "book_listed",
        description: "Listed a new book for sale",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        type: "profile_updated",
        description: "Updated profile information",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        type: "order_placed",
        description: "Placed an order for a textbook",
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Simulate loading delay
    setTimeout(() => {
      setActivities(sampleActivities);
      setLoading(false);
    }, 300);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "book_listed":
        return <Package className="h-4 w-4" />;
      case "order_placed":
        return <CreditCard className="h-4 w-4" />;
      case "profile_updated":
        return <User className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "book_listed":
        return "bg-green-100 text-green-800";
      case "order_placed":
        return "bg-blue-100 text-blue-800";
      case "profile_updated":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
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
                          <p className="font-medium">{activity.description}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {formatTimestamp(activity.timestamp)}
                          </div>
                        </div>

                        <Badge variant="outline" className="mt-2">
                          {activity.type.replace(/_/g, " ")}
                        </Badge>
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
