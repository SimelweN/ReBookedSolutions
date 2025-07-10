import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  Play,
  Square,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Timer,
  Settings,
} from "lucide-react";
import { useCommitAutoExpiry } from "@/hooks/useCommitAutoExpiry";
import { toast } from "sonner";

const CommitAutoExpiryPanel: React.FC = () => {
  const {
    isRunning,
    urgentCount,
    nextExpiry,
    manualCheck,
    stop,
    restart,
    refresh,
  } = useCommitAutoExpiry();

  const [loading, setLoading] = useState(false);

  const handleManualCheck = async () => {
    setLoading(true);
    try {
      const result = await manualCheck();
      toast.success(result.message);
    } catch (error) {
      toast.error("Failed to run manual check");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleService = () => {
    if (isRunning) {
      stop();
      toast.info("Commit auto-expiry service stopped");
    } else {
      restart();
      toast.success("Commit auto-expiry service started");
    }
  };

  const formatNextExpiry = (date: Date | null) => {
    if (!date) return "No upcoming expiries";

    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff <= 0) return "Past due";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Commit Auto-Expiry System
          <Badge variant={isRunning ? "default" : "secondary"}>
            {isRunning ? "RUNNING" : "STOPPED"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Service Status
              </span>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {isRunning ? "Active" : "Inactive"}
            </div>
            <p className="text-xs text-blue-600">
              {isRunning ? "Checking every 30 minutes" : "Manual checks only"}
            </p>
          </div>

          <div
            className={`border rounded-lg p-4 ${
              urgentCount > 0
                ? "bg-orange-50 border-orange-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle
                className={`h-4 w-4 ${
                  urgentCount > 0 ? "text-orange-600" : "text-green-600"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  urgentCount > 0 ? "text-orange-900" : "text-green-900"
                }`}
              >
                Urgent Commits
              </span>
            </div>
            <div
              className={`text-lg font-bold ${
                urgentCount > 0 ? "text-orange-900" : "text-green-900"
              }`}
            >
              {urgentCount}
            </div>
            <p
              className={`text-xs ${
                urgentCount > 0 ? "text-orange-600" : "text-green-600"
              }`}
            >
              Expiring within 2 hours
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                Next Expiry
              </span>
            </div>
            <div className="text-lg font-bold text-purple-900">
              {formatNextExpiry(nextExpiry)}
            </div>
            <p className="text-xs text-purple-600">
              {nextExpiry ? nextExpiry.toLocaleString() : "None scheduled"}
            </p>
          </div>
        </div>

        {/* System Information */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Client-Side Auto-Expiry:</strong> This system runs in the
            browser without requiring edge functions. It checks for expired
            commits every 30 minutes and handles automatic cancellations,
            refunds, and notifications.
          </AlertDescription>
        </Alert>

        {/* Control Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleToggleService}
            variant={isRunning ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Square className="h-4 w-4" />
                Stop Service
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Service
              </>
            )}
          </Button>

          <Button
            onClick={handleManualCheck}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Manual Check
              </>
            )}
          </Button>

          <Button
            onClick={refresh}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Stats
          </Button>
        </div>

        {/* How It Works */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">How It Works</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Runs automatically when the app loads</li>
            <li>• Checks for expired commits every 30 minutes</li>
            <li>• Cancels expired orders and processes refunds</li>
            <li>• Sends notifications to buyers and sellers</li>
            <li>• No edge functions or external cron jobs required</li>
            <li>• Works in all browsers with JavaScript enabled</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommitAutoExpiryPanel;
