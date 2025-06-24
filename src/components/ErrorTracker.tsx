import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Bug,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Download,
  Trash2,
  Search,
  Filter,
  Clock,
  Code,
  FileText,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface ErrorLog {
  id: string;
  timestamp: Date;
  level: "error" | "warning" | "info";
  message: string;
  source: string;
  stack?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  context?: Record<string, any>;
}

interface ErrorStats {
  total: number;
  errors: number;
  warnings: number;
  lastHour: number;
  mostCommon: string;
}

const ErrorTracker: React.FC = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [filteredErrors, setFilteredErrors] = useState<ErrorLog[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<
    "all" | "error" | "warning" | "info"
  >("all");
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [stats, setStats] = useState<ErrorStats | null>(null);

  // Initialize error tracking
  useEffect(() => {
    if (isTracking) {
      setupErrorTracking();
    } else {
      removeErrorTracking();
    }

    return () => removeErrorTracking();
  }, [isTracking]);

  // Filter errors when search/filter changes
  useEffect(() => {
    let filtered = errors;

    if (searchTerm) {
      filtered = filtered.filter(
        (error) =>
          error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          error.source.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (levelFilter !== "all") {
      filtered = filtered.filter((error) => error.level === levelFilter);
    }

    setFilteredErrors(filtered);
  }, [errors, searchTerm, levelFilter]);

  // Update stats when errors change
  useEffect(() => {
    updateStats();
  }, [errors]);

  const setupErrorTracking = () => {
    // Global error handler
    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Console override for capturing console errors
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      logError("error", args.join(" "), "console.error");
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      logError("warning", args.join(" "), "console.warn");
      originalWarn.apply(console, args);
    };

    toast.success("Error tracking enabled");
  };

  const removeErrorTracking = () => {
    window.removeEventListener("error", handleGlobalError);
    window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  };

  const handleGlobalError = (event: ErrorEvent) => {
    logError(
      "error",
      event.message,
      event.filename || "unknown",
      event.error?.stack,
      {
        line: event.lineno,
        column: event.colno,
      },
    );
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    logError(
      "error",
      `Unhandled Promise Rejection: ${event.reason}`,
      "promise",
      event.reason?.stack,
    );
  };

  const logError = (
    level: "error" | "warning" | "info",
    message: string,
    source: string,
    stack?: string,
    context?: Record<string, any>,
  ) => {
    const errorLog: ErrorLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      message,
      source,
      stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      context,
    };

    setErrors((prev) => [errorLog, ...prev].slice(0, 100)); // Keep last 100 errors
  };

  const updateStats = () => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const lastHourErrors = errors.filter(
      (error) => error.timestamp.getTime() > oneHourAgo,
    );

    const errorMessages = errors.map((e) => e.message);
    const messageCounts = errorMessages.reduce(
      (acc, message) => {
        acc[message] = (acc[message] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const mostCommon =
      Object.entries(messageCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "None";

    setStats({
      total: errors.length,
      errors: errors.filter((e) => e.level === "error").length,
      warnings: errors.filter((e) => e.level === "warning").length,
      lastHour: lastHourErrors.length,
      mostCommon:
        mostCommon.substring(0, 50) + (mostCommon.length > 50 ? "..." : ""),
    });
  };

  const clearErrors = () => {
    setErrors([]);
    setFilteredErrors([]);
    setSelectedError(null);
    toast.success("Error log cleared");
  };

  const exportErrors = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      errors: errors,
      stats: stats,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `error-log-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Error log exported");
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "info":
        return <Bug className="w-4 h-4 text-blue-600" />;
      default:
        return <Bug className="w-4 h-4 text-gray-600" />;
    }
  };

  const triggerTestError = () => {
    // Trigger a test error for demonstration
    logError(
      "error",
      "This is a test error",
      "ErrorTracker",
      "Test stack trace",
    );
    logError("warning", "This is a test warning", "ErrorTracker");
    toast.info("Test errors logged");
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5" />
              Error Tracking & Debugging
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsTracking(!isTracking)}
                variant={isTracking ? "destructive" : "default"}
                size="sm"
              >
                {isTracking ? "Stop" : "Start"} Tracking
              </Button>
              <Button onClick={triggerTestError} variant="outline" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Test
              </Button>
              <Button onClick={exportErrors} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={clearErrors} variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>

        {stats && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {stats.total}
                </div>
                <div className="text-xs text-gray-500">Total Logs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.errors}
                </div>
                <div className="text-xs text-gray-500">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.warnings}
                </div>
                <div className="text-xs text-gray-500">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.lastHour}
                </div>
                <div className="text-xs text-gray-500">Last Hour</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {isTracking ? "ON" : "OFF"}
                </div>
                <div className="text-xs text-gray-500">Tracking Status</div>
              </div>
            </div>

            {stats.mostCommon !== "None" && (
              <Alert className="bg-blue-50 border-blue-200">
                <Bug className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Most common error:</strong> {stats.mostCommon}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search errors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="level">Level Filter</Label>
              <select
                id="level"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Levels</option>
                <option value="error">Errors Only</option>
                <option value="warning">Warnings Only</option>
                <option value="info">Info Only</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setLevelFilter("all");
                }}
                variant="outline"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Error Log ({filteredErrors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredErrors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bug className="w-8 h-8 mx-auto mb-2" />
                  <p>No errors found</p>
                  <p className="text-sm">
                    {isTracking
                      ? "System is running smoothly!"
                      : "Start tracking to capture errors"}
                  </p>
                </div>
              ) : (
                filteredErrors.map((error) => (
                  <div
                    key={error.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedError?.id === error.id
                        ? "bg-blue-50 border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedError(error)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        {getLevelIcon(error.level)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {error.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {error.source}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={getLevelColor(error.level)} size="sm">
                          {error.level.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {error.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Error Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedError ? (
              <div className="space-y-4">
                <div>
                  <Label>Message</Label>
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {selectedError.message}
                  </div>
                </div>

                <div>
                  <Label>Source</Label>
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {selectedError.source}
                  </div>
                </div>

                <div>
                  <Label>Timestamp</Label>
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {selectedError.timestamp.toLocaleString()}
                  </div>
                </div>

                {selectedError.stack && (
                  <div>
                    <Label>Stack Trace</Label>
                    <Textarea
                      value={selectedError.stack}
                      readOnly
                      className="font-mono text-xs"
                      rows={6}
                    />
                  </div>
                )}

                {selectedError.context && (
                  <div>
                    <Label>Context</Label>
                    <pre className="p-2 bg-gray-50 rounded text-xs overflow-auto">
                      {JSON.stringify(selectedError.context, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <Label>Browser Info</Label>
                  <div className="p-2 bg-gray-50 rounded text-xs">
                    <div>
                      <strong>URL:</strong> {selectedError.url}
                    </div>
                    <div>
                      <strong>User Agent:</strong> {selectedError.userAgent}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-8 h-8 mx-auto mb-2" />
                <p>Select an error to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ErrorTracker;
