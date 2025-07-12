import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Package,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Eye,
  X,
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

const SimpleNotificationBell: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize with some mock notifications for demonstration
  useEffect(() => {
    if (user) {
      // Load mock notifications - in real app these would come from your backend
      const mockNotifications: SimpleNotification[] = [
        {
          id: "1",
          title: "Payment Confirmed",
          message: 'Your payment for "Calculus Textbook" has been confirmed.',
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
          message: "The textbook you were looking for is now available.",
          type: "info",
          read: false,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          action: {
            label: "View Book",
            path: "/books",
          },
        },
      ];

      setNotifications(mockNotifications);
    } else {
      setNotifications([]);
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: SimpleNotification["type"]) => {
    switch (type) {
      case "order":
        return <Package className="w-4 h-4 text-blue-600" />;
      case "payment":
        return <CreditCard className="w-4 h-4 text-green-600" />;
      case "system":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const notifTime = new Date(timestamp).getTime();
    const diffInMinutes = Math.floor((now - notifTime) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
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

  const removeNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId),
    );
  };

  const handleNotificationClick = (notification: SimpleNotification) => {
    markAsRead(notification.id);

    if (notification.action) {
      navigate(notification.action.path);
    }

    setIsOpen(false);
  };

  if (!user) {
    return null; // Don't show notifications if user is not logged in
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center min-w-[20px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 max-w-sm p-0"
        sideOffset={5}
      >
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs h-6"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs text-gray-400 mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 border-l-4 ${
                    !notification.read
                      ? "bg-blue-50 border-l-blue-400"
                      : "bg-white border-l-transparent"
                  }`}
                  onSelect={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4
                          className={`text-sm font-medium ${
                            !notification.read
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-gray-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <p
                        className={`text-xs ${
                          !notification.read ? "text-gray-600" : "text-gray-500"
                        } line-clamp-2 mb-1`}
                      >
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                        {notification.action && (
                          <span className="text-xs text-blue-600 font-medium">
                            {notification.action.label} →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-3 bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-blue-600 hover:text-blue-700"
                onClick={() => {
                  navigate("/notifications");
                  setIsOpen(false);
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SimpleNotificationBell;
