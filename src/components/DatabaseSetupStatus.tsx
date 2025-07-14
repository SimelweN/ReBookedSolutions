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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DatabaseSetupStatus: React.FC = () => {
  const [status, setStatus] = useState<"checking" | "setup_required" | "ready">(
    "checking",
  );
  const [checkedTables, setCheckedTables] = useState<Record<string, boolean>>(
    {},
  );

  const requiredTables = [
    "profiles",
    "books",
    "orders",
    "payments",
    "notifications",
  ];

  const checkDatabaseSetup = async () => {
    setStatus("checking");
    const tableStatus: Record<string, boolean> = {};

    try {
      // Check each required table
      for (const table of requiredTables) {
        try {
          const { error } = await supabase.from(table).select("id").limit(1);
          tableStatus[table] = !error;
        } catch {
          tableStatus[table] = false;
        }
      }

      setCheckedTables(tableStatus);

      // If all tables exist, database is ready
      const allTablesExist = Object.values(tableStatus).every(
        (exists) => exists,
      );
      setStatus(allTablesExist ? "ready" : "setup_required");
    } catch (error) {
      console.error("Database check failed:", error);
      setStatus("setup_required");
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

  if (status === "checking") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Checking Database Status...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Verifying database tables...</p>
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
            </AlertDescription>
          </Alert>

          <div>
            <h4 className="font-medium mb-2">Table Status:</h4>
            <div className="space-y-1">
              {requiredTables.map((table) => (
                <div key={table} className="flex items-center gap-2">
                  {checkedTables[table] ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={
                      checkedTables[table] ? "text-green-700" : "text-red-700"
                    }
                  >
                    {table}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">
              Quick Setup Instructions:
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
            <Button onClick={checkDatabaseSetup} variant="outline">
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
        <div className="mt-3">
          <Button onClick={checkDatabaseSetup} variant="outline" size="sm">
            Refresh Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseSetupStatus;
