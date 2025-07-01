import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Database,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  AlertTriangle,
} from "lucide-react";
import {
  setupDatabaseTables,
  checkOrdersTableExists,
  type DatabaseSetupSummary,
  type TableSetupResult,
} from "@/utils/databaseTableSetup";

const DatabaseTableSetup: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<DatabaseSetupSummary | null>(null);
  const [progress, setProgress] = useState<string[]>([]);
  const [ordersTableExists, setOrdersTableExists] = useState<boolean | null>(
    null,
  );

  const checkOrdersTable = async () => {
    try {
      const exists = await checkOrdersTableExists();
      setOrdersTableExists(exists);
    } catch (error) {
      console.error("Failed to check orders table:", error);
      setOrdersTableExists(false);
    }
  };

  const runSetup = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setProgress([]);
    setSummary(null);

    try {
      const result = await setupDatabaseTables((message) => {
        setProgress((prev) => [...prev, message]);
      });

      setSummary(result);

      // Recheck orders table status
      await checkOrdersTable();
    } catch (error) {
      console.error("Database setup failed:", error);
      setProgress((prev) => [
        ...prev,
        `❌ Setup failed: ${error instanceof Error ? error.message : String(error)}`,
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TableSetupResult["status"]) => {
    switch (status) {
      case "exists":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "created":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: TableSetupResult["status"]) => {
    switch (status) {
      case "exists":
        return <Badge variant="secondary">Already Exists</Badge>;
      case "created":
        return (
          <Badge variant="default" className="bg-green-500">
            Created
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  React.useEffect(() => {
    checkOrdersTable();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Table Setup
          </CardTitle>
          <CardDescription>
            Create missing database tables including the orders table needed for
            payments. This utility will check for missing tables and create them
            safely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="font-medium">Orders Table Status:</span>
                {ordersTableExists === null ? (
                  <Badge variant="outline">Checking...</Badge>
                ) : ordersTableExists ? (
                  <Badge variant="default" className="bg-green-500">
                    Exists
                  </Badge>
                ) : (
                  <Badge variant="destructive">Missing</Badge>
                )}
              </div>
              <Button
                onClick={checkOrdersTable}
                variant="outline"
                size="sm"
                disabled={ordersTableExists === null}
              >
                Recheck
              </Button>
            </div>
            {ordersTableExists === false && (
              <p className="text-sm text-gray-600 mt-2">
                The orders table is missing, which will cause payment errors.
                Run the setup to create it.
              </p>
            )}
          </div>

          {/* Setup Button */}
          <div className="flex items-center gap-2">
            <Button
              onClick={runSetup}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
              {isRunning ? "Setting up..." : "Run Database Setup"}
            </Button>

            {summary && (
              <div className="text-sm text-gray-600">
                Checked {summary.totalChecked} tables • Created{" "}
                {summary.created} • Already existed {summary.alreadyExists} •
                Failed {summary.failed}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Log */}
      {progress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Setup Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-1">
                {progress.map((message, index) => (
                  <div key={index} className="text-sm font-mono">
                    {message}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Setup Results</CardTitle>
            <CardDescription>
              Summary of database table setup operation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {summary.totalChecked}
                  </div>
                  <div className="text-sm text-gray-600">Total Checked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {summary.created}
                  </div>
                  <div className="text-sm text-gray-600">Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {summary.alreadyExists}
                  </div>
                  <div className="text-sm text-gray-600">Already Existed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {summary.failed}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
              </div>

              <Separator />

              {/* Detailed Results */}
              <div className="space-y-3">
                <h4 className="font-medium">Detailed Results</h4>
                {summary.results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">{result.table}</div>
                        <div className="text-sm text-gray-600">
                          {result.message}
                        </div>
                        {result.error && (
                          <div className="text-sm text-red-600 mt-1">
                            Error: {result.error}
                          </div>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What This Does</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p>
              <strong>Orders Table:</strong> Stores payment transactions, order
              status, and buyer/seller information. Required for the payment
              system to work.
            </p>
            <p>
              <strong>Payout Logs Table:</strong> Tracks seller payouts and
              transfer status for the payment system.
            </p>
            <p>
              <strong>Seller Earnings View:</strong> Creates a summary view for
              seller earnings and order statistics.
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Safe to run:</strong> This utility uses "CREATE TABLE IF
              NOT EXISTS" so it won't overwrite existing data. All tables
              include proper indexes, triggers, and Row Level Security (RLS)
              policies.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseTableSetup;
