import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Database,
  Wifi,
  Key,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { checkDatabaseStatus } from "@/utils/databaseConnectivityHelper";

interface SystemStatus {
  database: "checking" | "connected" | "error" | "missing_tables";
  auth: "checking" | "connected" | "error";
  apiKey: "checking" | "valid" | "invalid";
  tables: {
    profiles: boolean;
    books: boolean;
    transactions: boolean;
    banking_details: boolean;
    notifications: boolean;
  };
  errors: string[];
}

const SystemStatusPage: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>({
    database: "checking",
    auth: "checking",
    apiKey: "checking",
    tables: {
      profiles: false,
      books: false,
      transactions: false,
      banking_details: false,
      notifications: false,
    },
    errors: [],
  });

  const checkSystemStatus = async () => {
    const newStatus: SystemStatus = {
      database: "checking",
      auth: "checking",
      apiKey: "checking",
      tables: {
        profiles: false,
        books: false,
        transactions: false,
        banking_details: false,
        notifications: false,
      },
      errors: [],
    };

    try {
      // Check database connectivity
      const dbStatus = await checkDatabaseStatus();
      newStatus.tables = dbStatus.tablesExist;
      newStatus.errors = dbStatus.errors;

      if (dbStatus.isConnected) {
        newStatus.database = Object.values(dbStatus.tablesExist).every(
          (exists) => exists,
        )
          ? "connected"
          : "missing_tables";
      } else {
        newStatus.database = "error";
      }

      // Check auth
      try {
        const { data, error } = await supabase.auth.getSession();
        newStatus.auth = error ? "error" : "connected";
      } catch (authError) {
        newStatus.auth = "error";
        newStatus.errors.push(`Auth error: ${authError}`);
      }

      // Check API key validity
      try {
        const response = await fetch("/api/health");
        newStatus.apiKey = response.ok ? "valid" : "invalid";
      } catch {
        // API key check via supabase instead
        try {
          await supabase.from("profiles").select("id").limit(1);
          newStatus.apiKey = "valid";
        } catch (keyError) {
          newStatus.apiKey = "invalid";
          newStatus.errors.push(`API key error: ${keyError}`);
        }
      }
    } catch (error) {
      newStatus.database = "error";
      newStatus.auth = "error";
      newStatus.apiKey = "invalid";
      newStatus.errors.push(`System check failed: ${error}`);
    }

    setStatus(newStatus);
  };

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "connected":
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "missing_tables":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "error":
      case "invalid":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (statusValue: string) => {
    switch (statusValue) {
      case "checking":
        return <Badge variant="secondary">Checking...</Badge>;
      case "connected":
      case "valid":
        return (
          <Badge variant="default" className="bg-green-500">
            OK
          </Badge>
        );
      case "missing_tables":
        return (
          <Badge variant="secondary" className="bg-amber-500">
            Incomplete
          </Badge>
        );
      case "error":
      case "invalid":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">System Status</h1>
          <p className="text-gray-600 mt-2">
            Check the health of your StudentMarketplace application
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database</CardTitle>
              {getStatusIcon(status.database)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Database className="h-4 w-4 text-muted-foreground" />
                {getStatusBadge(status.database)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tables & connectivity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Authentication
              </CardTitle>
              {getStatusIcon(status.auth)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Wifi className="h-4 w-4 text-muted-foreground" />
                {getStatusBadge(status.auth)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                User auth system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Keys</CardTitle>
              {getStatusIcon(status.apiKey)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Key className="h-4 w-4 text-muted-foreground" />
                {getStatusBadge(status.apiKey)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Supabase connection
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
            <CardDescription>
              Critical tables required for the application to function
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(status.tables).map(([table, exists]) => (
                <div
                  key={table}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <span className="text-sm font-medium">{table}</span>
                  <div className="flex items-center gap-2">
                    {exists ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Badge variant={exists ? "default" : "destructive"}>
                      {exists ? "EXISTS" : "MISSING"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {status.errors.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Issues Found</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {status.errors.map((error, index) => (
                  <div
                    key={index}
                    className="text-sm text-red-600 bg-red-50 p-2 rounded"
                  >
                    {error}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 justify-center">
          <Button onClick={checkSystemStatus} variant="outline">
            Refresh Status
          </Button>
          <Button onClick={() => (window.location.href = "/")}>
            Back to App
          </Button>
        </div>

        {import.meta.env.DEV && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700">Development Tools</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="mb-2">Open browser console and run:</p>
              <div className="font-mono text-xs space-y-1 bg-blue-100 p-2 rounded">
                <div>
                  • <code>checkDatabaseStatus()</code>
                </div>
                <div>
                  • <code>DatabaseSetup.showSetupInstructions()</code>
                </div>
                <div>
                  • <code>logDatabaseStatus()</code>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SystemStatusPage;
