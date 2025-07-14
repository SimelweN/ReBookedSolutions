import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Database,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  performDatabaseHealthCheck,
  getSetupInstructions,
} from "@/utils/autoSetupDatabase";

const EnhancedDatabaseSetupStatus: React.FC = () => {
  const [status, setStatus] = useState<
    "checking" | "setup_required" | "ready" | "error"
  >("checking");
  const [healthCheck, setHealthCheck] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkDatabaseSetup = async () => {
    setIsChecking(true);
    setStatus("checking");

    try {
      const result = await performDatabaseHealthCheck();
      setHealthCheck(result);
      setStatus(result.status as any);
    } catch (error) {
      console.error("Database health check failed:", error);
      setStatus("error");
      setHealthCheck({
        isHealthy: false,
        status: "error",
        details: {
          error: "Failed to connect to database",
          existingTables: [],
          missingTables: ["unknown"],
          totalRequired: 5,
          progress: "0/5 tables ready",
        },
        instructions: getSetupInstructions(),
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkDatabaseSetup();
  }, []);

  const openSupabaseDashboard = () => {
    window.open(
      "https://supabase.com/dashboard/project/kbpjqzaqbqukutflwixf/editor",
      "_blank",
    );
  };

  if (status === "checking" || isChecking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500 animate-spin" />
            Checking Database Status...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Verifying database tables...</p>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Database Connection Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to connect to the database. Please check your internet
              connection and Supabase configuration.
            </AlertDescription>
          </Alert>

          {healthCheck?.details?.error && (
            <div className="text-sm text-red-700 bg-red-100 p-2 rounded">
              Error: {healthCheck.details.error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={checkDatabaseSetup}
              variant="outline"
              disabled={isChecking}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`}
              />
              Retry Connection
            </Button>
            <Button onClick={openSupabaseDashboard} variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Supabase Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "setup_required") {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <XCircle className="h-5 w-5" />
            Database Setup Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              Your Supabase database needs to be set up before you can use the
              application.
              {healthCheck?.details?.progress &&
                ` Progress: ${healthCheck.details.progress}`}
            </AlertDescription>
          </Alert>

          {healthCheck?.details && (
            <div>
              <h4 className="font-medium mb-2">Table Status:</h4>
              <div className="space-y-1">
                {healthCheck.details.existingTables?.map((table: string) => (
                  <div key={table} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-700">{table}</span>
                  </div>
                ))}
                {healthCheck.details.missingTables?.map((table: string) => (
                  <div key={table} className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-700">{table}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">
              📋 Quick Setup Instructions:
            </h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Click "Open Supabase Dashboard" below</li>
              <li>Navigate to SQL Editor</li>
              <li>
                Copy and paste the contents of{" "}
                <code>scripts/setup-database.sql</code>
              </li>
              <li>Click "Run" to execute the script</li>
              <li>Return here and click "Check Again"</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={openSupabaseDashboard}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open Supabase Dashboard
            </Button>
            <Button
              onClick={checkDatabaseSetup}
              variant="outline"
              disabled={isChecking}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`}
              />
              Check Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CheckCircle className="h-5 w-5" />
          Database Ready
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-green-700">
          ✅ All required database tables are set up and ready to use!
        </p>
        {healthCheck?.details?.progress && (
          <p className="text-green-600 text-sm mt-1">
            Progress: {healthCheck.details.progress}
          </p>
        )}
        <div className="mt-3">
          <Button
            onClick={checkDatabaseSetup}
            variant="outline"
            size="sm"
            disabled={isChecking}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`}
            />
            Refresh Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedDatabaseSetupStatus;
