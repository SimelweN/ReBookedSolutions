import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showRefreshButton?: boolean;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.",
  showHomeButton = true,
  showRefreshButton = true,
}) => {
  const handleRefresh = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>

        <p className="text-gray-600 mb-6">{message}</p>

        {isDevelopment && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 mb-2">
              Developer Details
            </summary>
            <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800 whitespace-pre-wrap">
              <strong>Error:</strong> {error.message}
              {error.stack && (
                <>
                  <br />
                  <strong>Stack:</strong>
                  <br />
                  {error.stack}
                </>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRefreshButton && (
            <Button
              onClick={handleRefresh}
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}

          {showHomeButton && (
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          )}
        </div>

        <div className="mt-6 text-xs text-gray-400">
          If this problem continues, please contact our support team.
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
