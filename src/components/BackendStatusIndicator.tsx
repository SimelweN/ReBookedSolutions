import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { SellerProfileService } from "@/services/sellerProfileService";
import { supabase } from "@/integrations/supabase/client";

export const BackendStatusIndicator = () => {
  const [status, setStatus] = useState<"checking" | "online" | "error">(
    "checking",
  );
  const [details, setDetails] = useState<string>("");

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      setStatus("checking");

      // Test basic database connection
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      if (error) {
        throw new Error(`Database connection failed: ${error.message}`);
      }

      // Test the new database functions
      try {
        // Try to call one of our new functions with a test UUID
        const testId = "00000000-0000-0000-0000-000000000000";
        await SellerProfileService.isSellerReadyForOrders(testId);

        setStatus("online");
        setDetails("Database functions operational");
      } catch (funcError) {
        console.warn("Database functions test failed:", funcError);
        setStatus("online");
        setDetails("Basic database operational, functions may need setup");
      }
    } catch (error) {
      console.error("Backend status check failed:", error);
      setStatus("error");
      setDetails(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "checking":
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case "online":
        return <CheckCircle className="h-3 w-3" />;
      case "error":
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "checking":
        return "bg-blue-100 text-blue-800";
      case "online":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "checking":
        return "Checking backend...";
      case "online":
        return "Backend Online";
      case "error":
        return "Backend Error";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge
        variant="secondary"
        className={`${getStatusColor()} flex items-center gap-2 px-3 py-1`}
      >
        {getStatusIcon()}
        <span className="text-xs font-medium">{getStatusText()}</span>
      </Badge>
      {details && (
        <div className="mt-1 text-xs text-gray-600 max-w-xs">{details}</div>
      )}
    </div>
  );
};

export default BackendStatusIndicator;
