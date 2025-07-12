import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Truck,
  X,
  Bell,
} from "lucide-react";
import { useNotificationStore } from "@/stores/notificationStore";
import { useAuth } from "@/contexts/AuthContext";

const NotificationDemo: React.FC = () => {
  const { user } = useAuth();
  const {
    addCommitRequiredNotification,
    addSellerCommittedNotification,
    addAutoCancelledNotification,
    addPickupConfirmedNotification,
    addOrderCancelledNotification,
    clearAllNotifications,
    notifications,
    unreadCount,
  } = useNotificationStore();

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            Please log in to test notifications
          </p>
        </CardContent>
      </Card>
    );
  }

  const demoOrderId = `demo-${Date.now()}`;
  const demoSellerId = "demo-seller-123";
  const demoBuyerId = user.id;

  const testNotifications = [
    {
      name: "Commit Required",
      icon: <Clock className="w-4 h-4" />,
      color: "bg-orange-100 text-orange-600",
      action: () => {
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 48);
        addCommitRequiredNotification(
          demoOrderId,
          demoSellerId,
          deadline.toISOString(),
        );
      },
    },
    {
      name: "Seller Committed",
      icon: <CheckCircle className="w-4 h-4" />,
      color: "bg-green-100 text-green-600",
      action: () => {
        addSellerCommittedNotification(demoOrderId, demoBuyerId);
      },
    },
    {
      name: "Auto Cancelled",
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "bg-red-100 text-red-600",
      action: () => {
        addAutoCancelledNotification(demoOrderId, demoSellerId, demoBuyerId);
      },
    },
    {
      name: "Pickup Confirmed",
      icon: <Truck className="w-4 h-4" />,
      color: "bg-blue-100 text-blue-600",
      action: () => {
        addPickupConfirmedNotification(demoOrderId, demoBuyerId, demoSellerId);
      },
    },
    {
      name: "Order Cancelled",
      icon: <X className="w-4 h-4" />,
      color: "bg-gray-100 text-gray-600",
      action: () => {
        addOrderCancelledNotification(demoOrderId, "buyer", "Changed my mind");
      },
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification System Demo
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} unread</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {testNotifications.map((test, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={test.action}
                className="flex items-center gap-2 h-auto p-3"
              >
                <div className={`p-2 rounded-full ${test.color}`}>
                  {test.icon}
                </div>
                <span className="text-sm">{test.name}</span>
              </Button>
            ))}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="destructive"
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
            >
              Clear All ({notifications.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Display Behavior Info */}
      <Card>
        <CardHeader>
          <CardTitle>📍 Display Behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">🖥️ Desktop</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Notifications appear in top-right corner</li>
                <li>• Most recent notification is fully visible</li>
                <li>• Others stack beneath (collapsed)</li>
                <li>• Hover to expand each notification</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">📱 Mobile</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Only most recent notification shown</li>
                <li>• Tap to expand notification</li>
                <li>• "View All" button to expand stack</li>
                <li>• Swipe or tap X to dismiss</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Rules */}
      <Card>
        <CardHeader>
          <CardTitle>📦 Commit & Transaction Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-semibold text-sm text-yellow-800 mb-1">
                ⏰ When book is purchased:
              </h4>
              <p className="text-sm text-yellow-700">
                Seller gets 48-hour commitment notification with deadline
              </p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <h4 className="font-semibold text-sm text-green-800 mb-1">
                ✅ When seller commits:
              </h4>
              <p className="text-sm text-green-700">
                Buyer notified that delivery is in progress
              </p>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <h4 className="font-semibold text-sm text-red-800 mb-1">
                ❌ If seller fails to commit:
              </h4>
              <p className="text-sm text-red-700">
                Both parties notified of automatic cancellation
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-semibold text-sm text-blue-800 mb-1">
                🚚 When courier picks up:
              </h4>
              <p className="text-sm text-blue-700">
                Buyer: "Package on the way" • Seller: "Pickup confirmed"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationDemo;
