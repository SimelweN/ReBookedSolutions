import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  ChevronDown,
  Eye,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationStore } from "@/stores/notificationStore";

export interface Notification {
  id: string;
  type:
    | "commit_required"
    | "seller_committed"
    | "auto_cancelled"
    | "pickup_confirmed"
    | "order_cancelled"
    | "refund_processed";
  title: string;
  message: string;
  orderId?: string;
  sellerId?: string;
  buyerId?: string;
  deadline?: string;
  priority: "low" | "medium" | "high" | "urgent";
  read: boolean;
  createdAt: string;
  actions?: {
    label: string;
    action: () => void;
    variant?: "default" | "destructive" | "outline";
  }[];
}

interface NotificationStackProps {
  position?: "top-right" | "top-center" | "bottom-right";
  maxVisible?: number;
  autoHideDelay?: number;
}

const NotificationStack: React.FC<NotificationStackProps> = ({
  position = "top-right",
  maxVisible = 3,
  autoHideDelay = 8000,
}) => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    removeNotification,
    markAllAsRead,
  } = useNotificationStore();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-hide notifications after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      notifications.forEach((notif) => {
        if (!notif.read && notif.priority !== "urgent") {
          const age = Date.now() - new Date(notif.createdAt).getTime();
          if (age > autoHideDelay) {
            markAsRead(notif.id);
          }
        }
      });
    }, autoHideDelay);

    return () => clearTimeout(timer);
  }, [notifications, autoHideDelay, markAsRead]);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "commit_required":
        return <Clock className="w-5 h-5 text-orange-600" />;
      case "seller_committed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "auto_cancelled":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "pickup_confirmed":
        return <Truck className="w-5 h-5 text-blue-600" />;
      case "order_cancelled":
        return <X className="w-5 h-5 text-gray-600" />;
      case "refund_processed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: Notification["priority"]) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500 bg-red-50";
      case "high":
        return "border-l-orange-500 bg-orange-50";
      case "medium":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const handleNotificationAction = useCallback(
    (notificationId: string, action: () => void) => {
      markAsRead(notificationId);
      action();
    },
    [markAsRead],
  );

  const handleExpand = useCallback(
    (notificationId: string) => {
      if (isMobile) {
        setExpandedId(expandedId === notificationId ? null : notificationId);
      }
    },
    [isMobile, expandedId],
  );

  const visibleNotifications = showAll
    ? notifications.filter((n) => !n.read)
    : notifications.filter((n) => !n.read).slice(0, maxVisible);

  const stackedCount = notifications.filter((n) => !n.read).length - maxVisible;

  if (!user || visibleNotifications.length === 0) {
    return null;
  }

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-center": "top-4 left-1/2 transform -translate-x-1/2",
    "bottom-right": "bottom-4 right-4",
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 space-y-2 max-w-sm w-full`}
    >
      {/* View All Button for Mobile */}
      {isMobile && stackedCount > 0 && !showAll && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg border p-3 text-center"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(true)}
            className="w-full"
          >
            <ChevronDown className="w-4 h-4 mr-2" />
            View All {stackedCount + maxVisible} Notifications
          </Button>
        </motion.div>
      )}

      {/* Notifications Stack */}
      <AnimatePresence>
        {visibleNotifications.map((notification, index) => {
          const isExpanded = expandedId === notification.id;
          const isStacked = !showAll && index >= maxVisible;
          const stackOffset = Math.min(index, 2) * 4;

          return (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, x: 300, scale: 0.9 }}
              animate={{
                opacity: isStacked ? 0.7 : 1,
                x: 0,
                scale: isStacked ? 0.95 : 1,
                y: isStacked ? stackOffset : 0,
              }}
              exit={{ opacity: 0, x: 300, scale: 0.9 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
              className={`
                bg-white rounded-lg shadow-lg border-l-4 ${getPriorityColor(notification.priority)}
                ${isStacked ? "absolute inset-0" : "relative"}
                ${isMobile ? "cursor-pointer" : ""}
              `}
              style={{ zIndex: visibleNotifications.length - index }}
              onMouseEnter={
                !isMobile ? () => setExpandedId(notification.id) : undefined
              }
              onMouseLeave={!isMobile ? () => setExpandedId(null) : undefined}
              onClick={
                isMobile ? () => handleExpand(notification.id) : undefined
              }
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getNotificationIcon(notification.type)}
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {notification.title}
                    </h4>
                    {notification.priority === "urgent" && (
                      <Badge variant="destructive" className="text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Message */}
                <p className="text-sm text-gray-600 mb-3">
                  {notification.message}
                </p>

                {/* Deadline (if applicable) */}
                {notification.deadline && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Deadline:{" "}
                        {new Date(notification.deadline).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {notification.actions &&
                  (isExpanded || !isMobile || index === 0) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap gap-2 mt-3"
                    >
                      {notification.actions.map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          variant={action.variant || "default"}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationAction(
                              notification.id,
                              action.action,
                            );
                          }}
                          className="text-xs"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </motion.div>
                  )}

                {/* Timestamp */}
                <div className="mt-2 text-xs text-gray-400">
                  {new Date(notification.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Stack Indicator for Desktop */}
      {!isMobile && stackedCount > 0 && !showAll && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-100 rounded-lg p-2 text-center text-sm text-gray-600"
        >
          +{stackedCount} more notifications
        </motion.div>
      )}

      {/* Collapse Button for Mobile */}
      {isMobile && showAll && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-lg border p-3 text-center"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(false)}
            className="w-full"
          >
            Show Less
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="w-full mt-2 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            Mark All Read
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default NotificationStack;
