import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Database,
  HardDrive,
} from "lucide-react";

interface APSRecoveryStatusProps {
  userProfile: {
    subjects: Array<{ subject: string; marks: number }>;
    totalAPS: number;
    lastUpdated: string;
    isValid?: boolean;
  } | null;
  storageSource: string;
  onRefresh?: () => void;
  className?: string;
}

const APSRecoveryStatus: React.FC<APSRecoveryStatusProps> = ({
  userProfile,
  storageSource,
  onRefresh,
  className = "",
}) => {
  const [lastRecoveryCheck, setLastRecoveryCheck] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (userProfile) {
      setLastRecoveryCheck(new Date().toLocaleTimeString());
    }
  }, [userProfile]);

  const getStatusInfo = () => {
    if (!userProfile) {
      return {
        status: "empty" as const,
        icon: AlertTriangle,
        message: "No APS profile found",
        description: "Start by adding your matric subjects and marks",
        variant: "default" as const,
      };
    }

    const subjectCount = userProfile.subjects?.length || 0;

    if (subjectCount === 0) {
      return {
        status: "empty" as const,
        icon: AlertTriangle,
        message: "Profile exists but no subjects added",
        description: "Add your matric subjects to calculate your APS",
        variant: "default" as const,
      };
    }

    if (subjectCount < 4) {
      return {
        status: "incomplete" as const,
        icon: Info,
        message: `${subjectCount} subjects added`,
        description: "Add at least 4 subjects for program eligibility checking",
        variant: "default" as const,
      };
    }

    return {
      status: "complete" as const,
      icon: CheckCircle,
      message: `Profile complete with ${subjectCount} subjects`,
      description: `APS Score: ${userProfile.totalAPS || 0} • Ready to find programs`,
      variant: "default" as const,
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (statusInfo.status === "complete") {
    return (
      <div
        className={`flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200 ${className}`}
      >
        <StatusIcon className="w-4 h-4 text-green-600" />
        <div className="flex-1 text-sm">
          <div className="font-medium text-green-800">{statusInfo.message}</div>
          <div className="text-green-600 text-xs">{statusInfo.description}</div>
        </div>
        <div className="flex items-center gap-1">
          <Badge
            variant="outline"
            className="text-xs border-green-300 text-green-700"
          >
            {storageSource === "database" ? (
              <Database className="w-3 h-3 mr-1" />
            ) : (
              <HardDrive className="w-3 h-3 mr-1" />
            )}
            {storageSource === "database" ? "Cloud" : "Local"}
          </Badge>
          {onRefresh && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRefresh}
              className="h-6 w-6 p-0"
              title="Refresh profile"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Alert className={`border-blue-200 bg-blue-50 ${className}`}>
      <StatusIcon className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{statusInfo.message}</div>
            <div className="text-sm text-blue-600">
              {statusInfo.description}
            </div>
            {lastRecoveryCheck && (
              <div className="text-xs text-blue-500 mt-1">
                Last checked: {lastRecoveryCheck}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className="text-xs border-blue-300 text-blue-700"
            >
              {storageSource === "database" ? (
                <Database className="w-3 h-3 mr-1" />
              ) : (
                <HardDrive className="w-3 h-3 mr-1" />
              )}
              {storageSource === "database" ? "Cloud" : "Local"}
            </Badge>
            {onRefresh && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onRefresh}
                className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
                title="Refresh profile"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default APSRecoveryStatus;
