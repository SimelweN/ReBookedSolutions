import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WifiOff, RefreshCw, AlertTriangle } from "lucide-react";

interface NetworkErrorFallbackProps {
  error?: string;
  onRetry?: () => void;
  title?: string;
  description?: string;
  showRetry?: boolean;
  compact?: boolean;
}

const NetworkErrorFallback: React.FC<NetworkErrorFallbackProps> = ({
  error = "Network connection failed",
  onRetry,
  title = "Connection Problem",
  description = "Unable to connect to our servers. Please check your internet connection and try again.",
  showRetry = true,
  compact = false,
}) => {
  const isOffline = !navigator.onLine;

  if (compact) {
    return (
      <div className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center space-x-3">
          {isOffline ? (
            <WifiOff className="w-5 h-5 text-yellow-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">
              {isOffline ? "You're offline" : title}
            </p>
            <p className="text-xs text-yellow-700">
              {isOffline ? "Check your internet connection" : error}
            </p>
          </div>
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[200px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            {isOffline ? (
              <WifiOff className="w-6 h-6 text-red-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            )}
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {isOffline ? "You're Offline" : title}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isOffline
              ? "Please check your internet connection and try again."
              : description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && !isOffline && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 font-mono">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {showRetry && onRetry && (
              <Button onClick={onRetry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}

            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
          </div>

          {isOffline && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-1">
                Offline Tips:
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Check your WiFi or mobile data connection</li>
                <li>• Try moving to a location with better signal</li>
                <li>• Restart your router if using WiFi</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkErrorFallback;
