import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoadingFallbackProps {
  timeout?: number;
  onTimeout?: () => void;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  timeout = 5000,
  onTimeout,
}) => {
  const [showTimeout, setShowTimeout] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 100);
    }, 100);

    const timeoutTimer = setTimeout(() => {
      setShowTimeout(true);
      onTimeout?.();
    }, timeout);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutTimer);
    };
  }, [timeout, onTimeout]);

  const progress = Math.min((elapsed / timeout) * 100, 100);

  if (showTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-amber-500" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">
              Taking longer than expected...
            </h2>
            <p className="text-gray-600">
              The app might be experiencing connectivity issues.
            </p>
          </div>

          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              This is often caused by missing database tables. If this is a new
              deployment, run the database setup script.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()} variant="default">
              Refresh Page
            </Button>

            <Button onClick={() => setShowTimeout(false)} variant="outline">
              Continue Waiting
            </Button>
          </div>

          {import.meta.env.DEV && (
            <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-700">
              Try: <code>checkDatabaseStatus()</code> in console
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs font-medium text-blue-600">
              {Math.round(progress)}%
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Loading...</h3>
          <p className="text-sm text-gray-500">Setting up your account</p>
        </div>

        <div className="w-48 mx-auto bg-gray-200 rounded-full h-1">
          <div
            className="bg-blue-600 h-1 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingFallback;
