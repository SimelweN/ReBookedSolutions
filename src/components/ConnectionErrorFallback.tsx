import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Wifi,
  RefreshCw,
  AlertTriangle,
  Database,
  Home,
  Clock,
} from "lucide-react";

interface ConnectionErrorFallbackProps {
  error?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showRetry?: boolean;
}

const ConnectionErrorFallback: React.FC<ConnectionErrorFallbackProps> = ({
  error = "Connection not available",
  onRetry,
  onGoHome,
  showRetry = true,
}) => {
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorIcon = () => {
    if (error.includes("timeout") || error.includes("connection")) {
      return <Wifi className="w-12 h-12 text-orange-500" />;
    }
    if (error.includes("database") || error.includes("query")) {
      return <Database className="w-12 h-12 text-red-500" />;
    }
    return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
  };

  const getErrorTitle = () => {
    if (error.includes("timeout")) {
      return "Connection Timeout";
    }
    if (error.includes("connection")) {
      return "No Connection Available";
    }
    if (error.includes("database")) {
      return "Database Connection Error";
    }
    return "Connection Error";
  };

  const getErrorMessage = () => {
    if (error.includes("timeout")) {
      return "The request is taking longer than expected. This might be due to slow internet or server issues.";
    }
    if (error.includes("connection")) {
      return "Unable to connect to our servers. Please check your internet connection and try again.";
    }
    if (error.includes("database")) {
      return "There's an issue with our database connection. Our team has been notified and is working on a fix.";
    }
    return "We're experiencing technical difficulties. Please try again in a moment.";
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{getErrorIcon()}</div>
          <CardTitle className="text-xl">{getErrorTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{getErrorMessage()}</AlertDescription>
          </Alert>

          <div className="space-y-3">
            {showRetry && (
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full"
                variant="default"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </>
                )}
              </Button>
            )}

            {onGoHome && (
              <Button onClick={onGoHome} variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Button>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Issues usually resolve within a few minutes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionErrorFallback;
