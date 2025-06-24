import React from "react";
import { AlertTriangle, Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DatabaseErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
}

export const DatabaseErrorFallback: React.FC<DatabaseErrorFallbackProps> = ({
  error,
  onRetry,
}) => {
  const isDatabaseError =
    error?.message?.includes("relation") ||
    error?.message?.includes("profiles") ||
    error?.message?.includes("does not exist");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg mx-auto text-center space-y-6">
        <div className="flex justify-center">
          {isDatabaseError ? (
            <Database className="h-16 w-16 text-amber-500" />
          ) : (
            <AlertTriangle className="h-16 w-16 text-red-500" />
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {isDatabaseError ? "Database Setup Required" : "Application Error"}
          </h2>
          <p className="text-gray-600">
            {isDatabaseError
              ? "The database tables are not set up yet. This is normal for new deployments."
              : "Something went wrong while loading the application."}
          </p>
        </div>

        {isDatabaseError && (
          <Alert className="text-left">
            <Database className="h-4 w-4" />
            <AlertTitle>Quick Fix Instructions</AlertTitle>
            <AlertDescription>
              <ol className="list-decimal list-inside space-y-2 mt-2">
                <li>Open your Supabase project dashboard</li>
                <li>Go to the SQL Editor</li>
                <li>
                  Copy and paste the <code>complete_database_setup.sql</code>{" "}
                  script
                </li>
                <li>Run the script to create all required tables</li>
                <li>Refresh this page</li>
              </ol>
            </AlertDescription>
          </Alert>
        )}

        {error && !isDatabaseError && (
          <Alert variant="destructive" className="text-left">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription>
              <code className="text-sm">{error.message}</code>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => window.location.reload()}
            variant="default"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>

          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              Try Again
            </Button>
          )}
        </div>

        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border text-left">
            <h3 className="font-semibold text-blue-900 mb-2">
              Development Tools
            </h3>
            <p className="text-sm text-blue-700 mb-2">
              Open browser console and run these commands:
            </p>
            <div className="space-y-1 text-xs font-mono bg-blue-100 p-2 rounded">
              <div>
                • <code>checkDatabaseStatus()</code> - Check database
                connectivity
              </div>
              <div>
                • <code>DatabaseSetup.showSetupInstructions()</code> - Get setup
                help
              </div>
              <div>
                • <code>logDatabaseStatus()</code> - View current status
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseErrorFallback;
