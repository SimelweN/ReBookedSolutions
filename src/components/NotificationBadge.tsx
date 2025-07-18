import { memo } from "react";
import { Bell, BellOff, AlertTriangle, RefreshCw } from "lucide-react";
import { useNotificationStore } from "@/stores/notificationStore";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotificationBadgeProps {
  className?: string;
  iconSize?: string;
  showCount?: boolean;
  showErrorIndicator?: boolean;
  allowRetry?: boolean;
}

const NotificationBadge = ({
  className = "h-5 w-5",
  iconSize = "h-5 w-5",
  showCount = true,
  showErrorIndicator = true,
  allowRetry = false,
}: NotificationBadgeProps) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Always call hooks at the top level
  const { notifications, clearAllNotifications } = useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const notificationsLoading = false;
  const error = null;
  const refreshNotifications = () => {};

  const hasError = !!error;

  const handleNotificationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasError && allowRetry) {
      refreshNotifications();
    } else {
      navigate("/notifications");
    }
  };

  // Don't show anything if auth is still loading
  if (authLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className={`${iconSize} animate-pulse bg-gray-300 rounded`} />
      </div>
    );
  }

  // Don't show notifications for unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  const shouldShowCount = showCount && unreadCount > 0 && !hasError;
  const shouldShowError = showErrorIndicator && hasError;

  const getNotificationIcon = () => {
    if (hasError) {
      return <BellOff className={`${iconSize} text-gray-400`} />;
    }

    if (notificationsLoading) {
      return <Bell className={`${iconSize} animate-pulse text-gray-500`} />;
    }

    return <Bell className={iconSize} />;
  };

  const getTooltipContent = () => {
    if (hasError) {
      return "Notifications unavailable - connection issues";
    }

    if (notificationsLoading) {
      return "Loading notifications...";
    }

    if (unreadCount === 0) {
      return "No new notifications";
    }

    return `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`;
  };

  const content = (
    <div className={`relative ${className}`}>
      {getNotificationIcon()}

      {/* Unread count badge */}
      {shouldShowCount && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}

      {/* Error indicator */}
      {shouldShowError && (
        <span className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full p-0.5">
          <AlertTriangle className="h-2 w-2" />
        </span>
      )}

      {/* Loading indicator for active loading */}
      {notificationsLoading && !hasError && (
        <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
          <RefreshCw className="h-2 w-2 animate-spin" />
        </span>
      )}
    </div>
  );

  // For retry functionality, wrap in a button
  if (allowRetry && hasError) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotificationClick}
              className="p-2 h-10 w-10 rounded-full hover:bg-gray-100 text-gray-700 hover:text-book-600"
              disabled={notificationsLoading}
            >
              {content}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipContent()}</p>
            {hasError && (
              <p className="text-xs text-gray-300">Click to retry</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Make all notification badges clickable
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNotificationClick}
            className="p-2 h-10 w-10 rounded-full hover:bg-gray-100 text-gray-700 hover:text-book-600"
            disabled={notificationsLoading}
            title="View notifications"
          >
            {content}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipContent()}</p>
          <p className="text-xs text-gray-300 mt-1">
            Click to view notifications
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default memo(NotificationBadge);
