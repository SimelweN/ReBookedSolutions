import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import NotificationStack from "./NotificationStack";

interface NotificationWrapperProps {
  position?: "top-right" | "top-center" | "bottom-right";
  maxVisible?: number;
  autoHideDelay?: number;
}

const NotificationWrapper: React.FC<NotificationWrapperProps> = (props) => {
  try {
    // This will throw if auth context is not available
    const auth = useAuth();
    // If we get here, auth context is ready
    return <NotificationStack {...props} />;
  } catch (error) {
    // Auth context not ready, don't render notifications yet
    console.warn("NotificationWrapper: Auth context not ready");
    return null;
  }
};

export default NotificationWrapper;
