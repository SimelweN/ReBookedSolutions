import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  level?: "page" | "component" | "app";
  title?: string;
  message?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  level = "component",
  title,
  message,
}) => {
  const isProductionBuild = import.meta.env.PROD;

  const getErrorTitle = () => {
    if (title) return title;

    switch (level) {
      case "app":
        return "Application Error";
      case "page":
        return "Page Error";
      default:
        return "Something went wrong";
    }
  };

  const getErrorMessage = () => {
    if (message) return message;

    switch (level) {
      case "app":
        return "The application encountered an unexpected error. Please try refreshing the page.";
      case "page":
        return "This page failed to load properly. Please try again or navigate to a different page.";
      default:
        return "This component failed to load. Please try refreshing or contact support if the problem persists.";
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleRetry = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[300px] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {getErrorTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">{getErrorMessage()}</p>

          {/* Development error details */}
          {!isProductionBuild && error && (
            <details className="text-sm bg-gray-100 p-3 rounded-md">
              <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                <Bug className="w-4 h-4 inline mr-1" />
                Error Details (Development Only)
              </summary>
              <div className="mt-2 space-y-2">
                <div>
                  <strong>Message:</strong>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words mt-1">
                    {error.message}
                  </pre>
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words mt-1 max-h-32 overflow-y-auto">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleRetry} className="flex-1" variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            {level === "app" || level === "page" ? (
              <>
                <Button
                  onClick={handleReload}
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  onClick={handleGoHome}
                  className="flex-1"
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </>
            ) : (
              <Button
                onClick={handleReload}
                className="flex-1"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload
              </Button>
            )}
          </div>

          {/* Help text */}
          <p className="text-xs text-gray-500 text-center">
            If this problem persists, please contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorFallback;
