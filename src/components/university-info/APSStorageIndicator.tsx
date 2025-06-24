import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Database,
  HardDrive,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Cloud,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface APSStorageIndicatorProps {
  storageSource?: string;
  syncStatus?: {
    needsSync: boolean;
    recommendation: "none" | "localToDb" | "dbToLocal";
  };
  isAuthenticated: boolean;
  onRefresh?: () => void;
  className?: string;
}

const APSStorageIndicator: React.FC<APSStorageIndicatorProps> = ({
  storageSource,
  syncStatus,
  isAuthenticated,
  onRefresh,
  className,
}) => {
  const getStorageIcon = () => {
    switch (storageSource) {
      case "database":
        return <Database className="w-3 h-3" />;
      case "localStorage":
        return <HardDrive className="w-3 h-3" />;
      case "sessionStorage":
        return <Smartphone className="w-3 h-3" />;
      case "none":
        return <WifiOff className="w-3 h-3" />;
      default:
        return <AlertTriangle className="w-3 h-3" />;
    }
  };

  const getStorageVariant = () => {
    if (!storageSource || storageSource === "none") return "destructive";
    if (storageSource === "database") return "default";
    if (storageSource === "localStorage") return "secondary";
    if (storageSource === "sessionStorage") return "outline";
    return "outline";
  };

  const getStorageLabel = () => {
    switch (storageSource) {
      case "database":
        return isAuthenticated ? "Cloud Saved" : "Database";
      case "localStorage":
        return "Local Storage";
      case "sessionStorage":
        return "Session Only";
      case "none":
        return "Not Saved";
      case "error":
        return "Storage Error";
      default:
        return "Unknown";
    }
  };

  const getStorageDescription = () => {
    switch (storageSource) {
      case "database":
        return "Your APS profile is safely stored in the cloud and will sync across all your devices.";
      case "localStorage":
        return isAuthenticated
          ? "Stored locally. Will sync to cloud when possible."
          : "Stored in your browser. Data will persist until you clear it or use a different device.";
      case "sessionStorage":
        return "Temporary storage. Data will be lost when you close your browser.";
      case "none":
        return "No APS profile data found.";
      case "error":
        return "There was an error accessing your APS profile storage.";
      default:
        return "Storage status unknown.";
    }
  };

  const getSyncMessage = () => {
    if (!syncStatus || !syncStatus.needsSync) return null;

    switch (syncStatus.recommendation) {
      case "localToDb":
        return "Local data is newer. Click refresh to sync to cloud.";
      case "dbToLocal":
        return "Cloud data is newer. Click refresh to sync locally.";
      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Storage Status Badge */}
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant={getStorageVariant()}
                className="flex items-center gap-1 text-xs"
              >
                {getStorageIcon()}
                {getStorageLabel()}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-sm">{getStorageDescription()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Sync Status */}
        {isAuthenticated && syncStatus?.needsSync && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 text-xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  Sync Available
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{getSyncMessage()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRefresh}
            className="h-6 w-6 p-0"
            title="Refresh storage status"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Sync Alert */}
      {isAuthenticated && syncStatus?.needsSync && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm">
            <div className="flex items-center justify-between">
              <span>{getSyncMessage()}</span>
              {onRefresh && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRefresh}
                  className="ml-2 h-6 text-xs border-amber-200 text-amber-700 hover:bg-amber-100"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Sync Now
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Storage Info for Non-Authenticated Users */}
      {!isAuthenticated && storageSource === "localStorage" && (
        <Alert className="border-blue-200 bg-blue-50">
          <Cloud className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            <div className="space-y-1">
              <div className="font-medium">Save across devices</div>
              <div>
                Sign in to sync your APS profile across all your devices and
                never lose your data.
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* No Storage Warning */}
      {(!storageSource || storageSource === "none") && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 text-sm">
            No APS profile data found. Add your subjects to create a profile.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default APSStorageIndicator;
