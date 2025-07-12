import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Package,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SimpleNotification {
  id: string;
  title: string;
  message: string;
  type: "order" | "payment" | "system" | "info";
  read: boolean;
  timestamp: string;
  action?: {
    label: string;
    path: string;
  };
}

const SimpleNotifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (user) {
      // Load mock notifications - in real app these would come from your backend
      const mockNotifications: SimpleNotification[] = [
        {
          id: "1",
          title: "Payment Confirmed",
          message:
            'Your payment for "Calculus Textbook" has been confirmed. Your order will be processed shortly.',
          type: "payment",
          read: false,
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          action: {
            label: "View Order",
            path: "/my-orders",
          },
        },
        {
          id: "2",
          title: "Book Available",
          message:
            'The textbook "Advanced Physics" you were looking for is now available from a seller in your area.',
          type: "info",
          read: false,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          action: {
            label: "View Book",
            path: "/books",
          },
        },
        {
          id: "3",
          title: "Order Shipped",
          message:
            "Your order #ORD-001 has been shipped and is on the way to your address.",
          type: "order",
          read: true,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          action: {
            label: "Track Order",
            path: "/my-orders",
          },
        },
        {
          id: "4",
          title: "Welcome to ReBooked Solutions",
          message:
            "Thank you for joining our community! Start browsing books or list your own textbooks for sale.",
          type: "system",
          read: true,
          timestamp: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 3,
          ).toISOString(), // 3 days ago
          action: {
            label: "Browse Books",
            path: "/books",
          },
        },
      ];

      setNotifications(mockNotifications);
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  const getNotificationIcon = (type: SimpleNotification["type"]) => {
    switch (type) {
      case "order":
        return <Package className="w-5 h-5 text-blue-600" />;
      case "payment":
        return <CreditCard className="w-5 h-5 text-green-600" />;
      case "system":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    toast.success("All notifications marked as read");
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId),
    );
    toast.success("Notification deleted");
  };

  const handleNotificationClick = (notification: SimpleNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.action) {
      navigate(notification.action.path);
    }
  };

  const filteredNotifications =
    filter === "all" ? notifications : notifications.filter((n) => !n.read);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Layout>
      <SEO
        title="Notifications - ReBooked Solutions"
        description="View all your notifications from ReBooked Solutions"
        keywords="notifications, updates, alerts"
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} unread</Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
              >
                Unread ({unreadCount})
              </Button>
            </div>

            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <Eye className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card className="p-8">
              <div className="text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">
                  {filter === "unread"
                    ? "No unread notifications"
                    : "No notifications"}
                </h3>
                <p className="text-gray-400">
                  {filter === "unread"
                    ? "You're all caught up!"
                    : "You'll see important updates here"}
                </p>
              </div>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-colors hover:bg-gray-50 border-l-4 ${
                  !notification.read
                    ? "bg-blue-50 border-l-blue-400"
                    : "bg-white border-l-transparent"
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3
                          className={`font-medium text-sm ${
                            !notification.read
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 ml-4">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-gray-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <p
                        className={`text-sm mb-3 ${
                          !notification.read ? "text-gray-700" : "text-gray-600"
                        }`}
                      >
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {formatDateTime(notification.timestamp)}
                        </p>
                        {notification.action && (
                          <span className="text-xs text-blue-600 font-medium">
                            {notification.action.label} →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SimpleNotifications;
