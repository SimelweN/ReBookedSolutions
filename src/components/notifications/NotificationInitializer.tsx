import { useEffect } from "react";
import { NotificationTriggerService } from "@/services/notificationTriggerService";
import { useAuth } from "@/contexts/AuthContext";

const NotificationInitializer: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Initialize the notification system when user is authenticated
      NotificationTriggerService.initializeNotificationSystem();
    }
  }, [user]);

  return null; // This component doesn't render anything
};

export default NotificationInitializer;
