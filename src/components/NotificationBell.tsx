import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Clock,
  Package,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotifications();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "commit_required":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "payment_confirmed":
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case "order_shipped":
        return <Package className="h-4 w-4 text-green-600" />;
      case "order_completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "commit_expired":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string, read: boolean) => {
    const baseColor = read ? "bg-gray-50" : "bg-white";
    const borderColor = read ? "border-gray-200" : "border-blue-200";

    switch (type) {
      case "commit_required":
        return `${baseColor} ${borderColor} ${!read ? "border-l-4 border-l-orange-400" : ""}`;
      case "payment_confirmed":
        return `${baseColor} ${borderColor} ${!read ? "border-l-4 border-l-blue-400" : ""}`;
      case "order_shipped":
        return `${baseColor} ${borderColor} ${!read ? "border-l-4 border-l-green-400" : ""}`;
      case "commit_expired":
        return `${baseColor} ${borderColor} ${!read ? "border-l-4 border-l-red-400" : ""}`;
      default:
        return `${baseColor} ${borderColor}`;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case "commit_required":
        navigate("/profile", { state: { tab: "activity" } });
        break;
      case "payment_confirmed":
      case "order_shipped":
      case "order_completed":
        navigate("/my-orders");
        break;
      default:
        if (notification.order_id) {
          navigate(`/payment-status/${notification.order_id}`);
        }
        break;
    }

    setIsOpen(false);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "Recently";
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Bell className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center min-w-[20px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 max-w-sm p-0"
        sideOffset={5}
      >
        <DropdownMenuHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
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
                  className="text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </DropdownMenuHeader>

        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-1">
                You'll see important updates here
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 10).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 ${getNotificationColor(notification.type, notification.read)}`}
                  onSelect={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4
                          className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"}`}
                        >
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>

                      <p
                        className={`text-xs ${!notification.read ? "text-gray-600" : "text-gray-500"} line-clamp-2`}
                      >
                        {notification.message}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}

              {notifications.length > 10 && (
                <DropdownMenuItem
                  className="p-4 text-center text-blue-600 hover:text-blue-700 cursor-pointer"
                  onSelect={() => {
                    navigate("/notifications");
                    setIsOpen(false);
                  }}
                >
                  <span className="text-sm">View all notifications</span>
                </DropdownMenuItem>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Quick Actions */}
        {unreadCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigate("/profile", { state: { tab: "activity" } });
                    setIsOpen(false);
                  }}
                  className="text-xs"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  View Activity
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigate("/my-orders");
                    setIsOpen(false);
                  }}
                  className="text-xs"
                >
                  <Package className="h-3 w-3 mr-1" />
                  My Orders
                </Button>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
