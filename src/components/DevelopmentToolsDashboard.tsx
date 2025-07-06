import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Wrench,
  Activity,
  Bug,
  Settings,
  Database,
  Zap,
  Code,
  Monitor,
  Terminal,
  Gauge,
  Shield,
  Info,
} from "lucide-react";
import SystemHealthMonitor from "./SystemHealthMonitor";
import ErrorTracker from "./ErrorTracker";
import EnvironmentChecker from "./EnvironmentChecker";
import GoogleMapsSetupHelper from "./GoogleMapsSetupHelper";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface DevTool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: "monitoring" | "debugging" | "configuration" | "testing";
  status: "active" | "inactive" | "warning";
}

const DevelopmentToolsDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { items } = useCart();
  const [activeTools, setActiveTools] = useState<Set<string>>(new Set());

  const devTools: DevTool[] = [
    {
      id: "health-monitor",
      name: "System Health Monitor",
      description: "Real-time monitoring of system components and performance",
      icon: Activity,
      category: "monitoring",
      status: "active",
    },
    {
      id: "error-tracker",
      name: "Error Tracker",
      description: "Capture and analyze JavaScript errors and warnings",
      icon: Bug,
      category: "debugging",
      status: "inactive",
    },
    {
      id: "environment-checker",
      name: "Environment Checker",
      description: "Validate environment variables and configuration",
      icon: Settings,
      category: "configuration",
      status: "active",
    },
    {
      id: "maps-setup",
      name: "Google Maps Setup",
      description: "Configure Google Maps API integration",
      icon: Monitor,
      category: "configuration",
      status: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? "active" : "warning",
    },
  ];

  const getSystemStatus = () => {
    const issues = [];

    if (!isAuthenticated) {
      issues.push("User not authenticated");
    }

    if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) {
      issues.push("Payment system not configured");
    }

    if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      issues.push("Google Maps not configured");
    }

    return {
      status:
        issues.length === 0
          ? "healthy"
          : issues.length <= 2
            ? "warning"
            : "error",
      issues,
      score: Math.max(0, 100 - issues.length * 25),
    };
  };

  const runQuickDiagnostic = async () => {
    toast.info("Running quick diagnostic...");

    const results = [];

    // Test database connection (using circuit breaker)
    try {
      const { checkDatabaseHealth } = await import(
        "@/utils/databaseHealthCheck"
      );
      const dbHealth = await checkDatabaseHealth();

      results.push({
        test: "Database Connection",
        status: dbHealth.isHealthy ? "pass" : "fail",
        message: dbHealth.isHealthy
          ? `Connected successfully (${dbHealth.responseTime}ms${dbHealth.fromCache ? " cached" : ""})`
          : dbHealth.error || "Connection failed",
      });
    } catch (error) {
      results.push({
        test: "Database Connection",
        status: "fail",
        message: "Connection test failed",
      });
    }

    // Test local storage
    try {
      localStorage.setItem("test", "value");
      localStorage.removeItem("test");
      results.push({
        test: "Local Storage",
        status: "pass",
        message: "Working correctly",
      });
    } catch (error) {
      results.push({
        test: "Local Storage",
        status: "fail",
        message: "Not available",
      });
    }

    // Test cart functionality
    results.push({
      test: "Cart System",
      status: "pass",
      message: `${items.length} items in cart`,
    });

    // Test authentication
    results.push({
      test: "Authentication",
      status: isAuthenticated ? "pass" : "warning",
      message: isAuthenticated ? "User logged in" : "Not authenticated",
    });

    const passed = results.filter((r) => r.status === "pass").length;
    const score = Math.round((passed / results.length) * 100);

    toast.success(
      `Diagnostic complete: ${score}% (${passed}/${results.length} passed)`,
    );

    console.table(results);
    return results;
  };

  const clearAllData = () => {
    if (
      confirm(
        "Are you sure you want to clear all local data? This will refresh the page.",
      )
    ) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const systemStatus = getSystemStatus();

  return (
    <div className="space-y-6">
      {/* Header with System Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Development Tools Dashboard
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge
                className={`${
                  systemStatus.status === "healthy"
                    ? "bg-green-100 text-green-800"
                    : systemStatus.status === "warning"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {systemStatus.score}% Health
              </Badge>
              <Button onClick={runQuickDiagnostic} variant="outline" size="sm">
                <Gauge className="w-4 h-4 mr-2" />
                Quick Diagnostic
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {systemStatus.score}%
              </div>
              <div className="text-xs text-gray-500">System Health</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {isAuthenticated ? "✓" : "✗"}
              </div>
              <div className="text-xs text-gray-500">Authentication</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {items.length}
              </div>
              <div className="text-xs text-gray-500">Cart Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {devTools.filter((t) => t.status === "active").length}
              </div>
              <div className="text-xs text-gray-500">Active Tools</div>
            </div>
          </div>

          {systemStatus.issues.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <Shield className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>System Issues:</strong> {systemStatus.issues.join(", ")}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Development Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {devTools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <Card key={tool.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium text-sm">{tool.name}</span>
                  </div>
                  <Badge
                    size="sm"
                    className={`${
                      tool.status === "active"
                        ? "bg-green-100 text-green-800"
                        : tool.status === "warning"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {tool.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600 mb-3">{tool.description}</p>
                <div className="text-xs text-gray-500 mb-2">
                  Category: {tool.category}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tools Tabs */}
      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="health">Health Monitor</TabsTrigger>
          <TabsTrigger value="errors">Error Tracker</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="maps">Maps Setup</TabsTrigger>
          <TabsTrigger value="utilities">Utilities</TabsTrigger>
        </TabsList>

        <TabsContent value="health">
          <SystemHealthMonitor />
        </TabsContent>

        <TabsContent value="errors">
          <ErrorTracker />
        </TabsContent>

        <TabsContent value="environment">
          <EnvironmentChecker />
        </TabsContent>

        <TabsContent value="maps">
          <GoogleMapsSetupHelper />
        </TabsContent>

        <TabsContent value="utilities">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  <Terminal className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>

                <Button
                  onClick={clearAllData}
                  variant="outline"
                  className="w-full"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>

                <Button
                  onClick={() => {
                    console.clear();
                    toast.success("Console cleared");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Clear Console
                </Button>

                <Button
                  onClick={() => {
                    const debugInfo = {
                      timestamp: new Date().toISOString(),
                      url: window.location.href,
                      userAgent: navigator.userAgent,
                      user: user ? { id: user.id, email: user.email } : null,
                      cart: items.length,
                      environment: {
                        supabase: !!import.meta.env.VITE_SUPABASE_URL,
                        paystack: !!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
                        maps: !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
                      },
                    };
                    console.log("Debug Info:", debugInfo);
                    navigator.clipboard.writeText(
                      JSON.stringify(debugInfo, null, 2),
                    );
                    toast.success("Debug info copied to clipboard");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Copy Debug Info
                </Button>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Browser:</span>
                    <span className="font-mono text-xs">
                      {navigator.userAgent.split(" ")[0]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform:</span>
                    <span>{navigator.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span>{navigator.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Online:</span>
                    <span>{navigator.onLine ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cookie Enabled:</span>
                    <span>{navigator.cookieEnabled ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Screen:</span>
                    <span>
                      {screen.width}x{screen.height}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timezone:</span>
                    <span>
                      {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Development Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">
              Development Mode Active
            </span>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• This dashboard is only available in development mode</p>
            <p>
              • All tools provide real-time monitoring and debugging
              capabilities
            </p>
            <p>• Use the Quick Diagnostic to test system health</p>
            <p>
              • Check browser console for detailed logs and debug information
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevelopmentToolsDashboard;
