import { useEffect } from "react";
import { NotificationTriggerService } from "@/services/notificationTriggerService";
import { useAuth } from "@/contexts/AuthContext";

const NotificationInitializer: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Initialize the notification system when user is authenticated
      NotificationTriggerService.initializeNotificationSystem();

      // Demo: Add some sample notifications for testing
      if (process.env.NODE_ENV === "development") {
        setTimeout(() => {
          // Simulate a commit required notification
          NotificationTriggerService.triggerCommitRequired({
            id: "demo-order-123",
            buyer_id: "demo-buyer",
            seller_id: user.id,
            status: "pending_commit",
          });
        }, 2000);
      }
    }
  }, [user]);

  return null; // This component doesn't render anything
};

export default NotificationInitializer;
