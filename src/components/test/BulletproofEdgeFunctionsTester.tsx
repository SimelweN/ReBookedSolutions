import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Play,
  AlertTriangle,
  Activity,
  Database,
  Mail,
  CreditCard,
  Package,
  Search,
  Bell,
  FileText,
  BarChart3,
  Gavel,
  Upload,
  Bot,
  ArrowRight,
  Shield,
  Settings,
  Zap,
  TrendingUp,
  Server,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import {
  edgeFunctionRouter,
  getRouterConfig,
  updateRouterConfig,
  getFunctionStatus,
  getHealthSummary,
  testAllFunctions,
  resetFunctionStatuses,
  enableMockMode,
  disableMockMode,
  enableAutoFallback,
  disableAutoFallback,
} from "@/services/edgeFunctionRouter";

interface FunctionTest {
  id: string;
  name: string;
  endpoint: string;
  category: string;
  status:
    | "idle"
    | "running"
    | "success"
    | "failed"
    | "timeout"
    | "fallback-success";
  message: string;
  duration?: number;
  timestamp?: string;
  details?: any;
  icon: React.ReactNode;
  healthCheck?: boolean;
  usedFallback?: boolean;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  running: number;
  timeout: number;
  fallbackSuccess: number;
}

const BulletproofEdgeFunctionsTester = () => {
  const [functions, setFunctions] = useState<FunctionTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [routerConfig, setRouterConfig] = useState(getRouterConfig());
  const [healthSummary, setHealthSummary] = useState(getHealthSummary());

  // Initialize edge functions list
  useEffect(() => {
    const edgeFunctions: FunctionTest[] = [
      // Core Services
      {
        id: "study-resources-api",
        name: "Study Resources API",
        endpoint: "study-resources-api",
        category: "core",
        status: "idle",
        message: "Ready to test",
        icon: <FileText className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "advanced-search",
        name: "Advanced Search",
        endpoint: "advanced-search",
        category: "core",
        status: "idle",
        message: "Ready to test",
        icon: <Search className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "file-upload",
        name: "File Upload",
        endpoint: "file-upload",
        category: "core",
        status: "idle",
        message: "Ready to test",
        icon: <Upload className="h-4 w-4" />,
        healthCheck: true,
      },

      // Payment & Commerce
      {
        id: "initialize-paystack-payment",
        name: "Initialize Payment",
        endpoint: "initialize-paystack-payment",
        category: "payment",
        status: "idle",
        message: "Ready to test",
        icon: <CreditCard className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "verify-paystack-payment",
        name: "Verify Payment",
        endpoint: "verify-paystack-payment",
        category: "payment",
        status: "idle",
        message: "Ready to test",
        icon: <CheckCircle className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "paystack-webhook",
        name: "Paystack Webhook",
        endpoint: "paystack-webhook",
        category: "payment",
        status: "idle",
        message: "Ready to test",
        icon: <Bot className="h-4 w-4" />,
        healthCheck: false,
      },
      {
        id: "create-paystack-subaccount",
        name: "Create Subaccount",
        endpoint: "create-paystack-subaccount",
        category: "payment",
        status: "idle",
        message: "Ready to test",
        icon: <Database className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "update-paystack-subaccount",
        name: "Update Subaccount",
        endpoint: "update-paystack-subaccount",
        category: "payment",
        status: "idle",
        message: "Ready to test",
        icon: <Database className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "pay-seller",
        name: "Pay Seller",
        endpoint: "pay-seller",
        category: "payment",
        status: "idle",
        message: "Ready to test",
        icon: <CreditCard className="h-4 w-4" />,
        healthCheck: true,
      },

      // Orders & Commerce
      {
        id: "create-order",
        name: "Create Order",
        endpoint: "create-order",
        category: "orders",
        status: "idle",
        message: "Ready to test",
        icon: <Package className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "process-book-purchase",
        name: "Process Book Purchase",
        endpoint: "process-book-purchase",
        category: "orders",
        status: "idle",
        message: "Ready to test",
        icon: <Package className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "process-multi-seller-purchase",
        name: "Multi-Seller Purchase",
        endpoint: "process-multi-seller-purchase",
        category: "orders",
        status: "idle",
        message: "Ready to test",
        icon: <Package className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "commit-to-sale",
        name: "Commit to Sale",
        endpoint: "commit-to-sale",
        category: "orders",
        status: "idle",
        message: "Ready to test",
        icon: <CheckCircle className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "decline-commit",
        name: "Decline Commit",
        endpoint: "decline-commit",
        category: "orders",
        status: "idle",
        message: "Ready to test",
        icon: <XCircle className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "mark-collected",
        name: "Mark Collected",
        endpoint: "mark-collected",
        category: "orders",
        status: "idle",
        message: "Ready to test",
        icon: <CheckCircle className="h-4 w-4" />,
        healthCheck: true,
      },

      // Shipping & Delivery
      {
        id: "get-delivery-quotes",
        name: "Get Delivery Quotes",
        endpoint: "get-delivery-quotes",
        category: "shipping",
        status: "idle",
        message: "Ready to test",
        icon: <Package className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "courier-guy-quote",
        name: "Courier Guy Quote",
        endpoint: "courier-guy-quote",
        category: "shipping",
        status: "idle",
        message: "Ready to test",
        icon: <Package className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "courier-guy-shipment",
        name: "Courier Guy Shipment",
        endpoint: "courier-guy-shipment",
        category: "shipping",
        status: "idle",
        message: "Ready to test",
        icon: <Package className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "courier-guy-track",
        name: "Courier Guy Tracking",
        endpoint: "courier-guy-track",
        category: "shipping",
        status: "idle",
        message: "Ready to test",
        icon: <Search className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "fastway-quote",
        name: "Fastway Quote",
        endpoint: "fastway-quote",
        category: "shipping",
        status: "idle",
        message: "Ready to test",
        icon: <Package className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "fastway-shipment",
        name: "Fastway Shipment",
        endpoint: "fastway-shipment",
        category: "shipping",
        status: "idle",
        message: "Ready to test",
        icon: <Package className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "fastway-track",
        name: "Fastway Tracking",
        endpoint: "fastway-track",
        category: "shipping",
        status: "idle",
        message: "Ready to test",
        icon: <Search className="h-4 w-4" />,
        healthCheck: true,
      },

      // Communication
      {
        id: "email-automation",
        name: "Email Automation",
        endpoint: "email-automation",
        category: "communication",
        status: "idle",
        message: "Ready to test",
        icon: <Mail className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "send-email-notification",
        name: "Send Email Notification",
        endpoint: "send-email-notification",
        category: "communication",
        status: "idle",
        message: "Ready to test",
        icon: <Bell className="h-4 w-4" />,
        healthCheck: true,
      },

      // Analytics & Admin
      {
        id: "analytics-reporting",
        name: "Analytics Reporting",
        endpoint: "analytics-reporting",
        category: "analytics",
        status: "idle",
        message: "Ready to test",
        icon: <BarChart3 className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "dispute-resolution",
        name: "Dispute Resolution",
        endpoint: "dispute-resolution",
        category: "admin",
        status: "idle",
        message: "Ready to test",
        icon: <Gavel className="h-4 w-4" />,
        healthCheck: true,
      },

      // Background Tasks
      {
        id: "auto-expire-commits",
        name: "Auto Expire Commits",
        endpoint: "auto-expire-commits",
        category: "background",
        status: "idle",
        message: "Ready to test",
        icon: <Clock className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "check-expired-orders",
        name: "Check Expired Orders",
        endpoint: "check-expired-orders",
        category: "background",
        status: "idle",
        message: "Ready to test",
        icon: <AlertTriangle className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "process-order-reminders",
        name: "Process Order Reminders",
        endpoint: "process-order-reminders",
        category: "background",
        status: "idle",
        message: "Ready to test",
        icon: <Bell className="h-4 w-4" />,
        healthCheck: true,
      },
      {
        id: "realtime-notifications",
        name: "Realtime Notifications",
        endpoint: "realtime-notifications",
        category: "background",
        status: "idle",
        message: "Ready to test",
        icon: <Activity className="h-4 w-4" />,
        healthCheck: true,
      },
    ];

    setFunctions(edgeFunctions);
  }, []);

  // Update health summary periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthSummary(getHealthSummary());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateFunctionStatus = (
    id: string,
    status: FunctionTest["status"],
    message: string,
    duration?: number,
    details?: any,
    usedFallback?: boolean,
  ) => {
    setFunctions((prev) =>
      prev.map((func) =>
        func.id === id
          ? {
              ...func,
              status,
              message,
              duration,
              details,
              usedFallback,
              timestamp: new Date().toISOString(),
            }
          : func,
      ),
    );
  };

  const testFunction = async (func: FunctionTest) => {
    updateFunctionStatus(func.id, "running", "Testing with smart routing...");
    const startTime = Date.now();

    try {
      let result;

      if (func.healthCheck) {
        // For health checks, use GET request
        result = await edgeFunctionRouter.invoke(func.endpoint, {
          method: "GET",
        });
      } else {
        // For regular tests, use POST with test body
        result = await edgeFunctionRouter.invoke(func.endpoint, {
          body: { test: true },
        });
      }

      const duration = Date.now() - startTime;
      const usedFallback = result.data?._fallback_used || false;

      if (result.error) {
        updateFunctionStatus(
          func.id,
          "failed",
          `Error: ${result.error.message || "Unknown error"}`,
          duration,
          result.error,
          false,
        );
      } else {
        const responseData = result.data;

        if (usedFallback) {
          updateFunctionStatus(
            func.id,
            "fallback-success",
            `Fallback success: ${responseData._fallback_reason || "Primary unavailable"}`,
            duration,
            responseData,
            true,
          );
        } else {
          updateFunctionStatus(
            func.id,
            "success",
            "Function healthy and responsive",
            duration,
            responseData,
            false,
          );
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateFunctionStatus(
        func.id,
        "failed",
        `Unexpected error: ${error.message}`,
        duration,
        error,
        false,
      );
    }
  };

  const testAllFunctions = async () => {
    const functionsToTest = functions.filter((func) =>
      selectedCategory === "all" ? true : func.category === selectedCategory,
    );

    if (functionsToTest.length === 0) {
      toast.error("No functions to test in selected category");
      return;
    }

    setIsRunning(true);
    setProgress(0);

    // Reset all function statuses
    setFunctions((prev) =>
      prev.map((func) => ({
        ...func,
        status: functionsToTest.includes(func) ? "idle" : func.status,
        message: functionsToTest.includes(func)
          ? "Waiting to test..."
          : func.message,
        usedFallback: false,
      })),
    );

    let completed = 0;
    const total = functionsToTest.length;

    // Test functions in parallel with some concurrency control
    const batchSize = 5;
    for (let i = 0; i < functionsToTest.length; i += batchSize) {
      const batch = functionsToTest.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (func) => {
          await testFunction(func);
          completed++;
          setProgress((completed / total) * 100);
        }),
      );

      // Small delay between batches
      if (i + batchSize < functionsToTest.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setIsRunning(false);

    // Show summary
    const summary = calculateSummary();
    const totalSuccessful = summary.passed + summary.fallbackSuccess;
    toast.success(
      `🎉 Testing complete! ${totalSuccessful}/${summary.total} successful (${summary.passed} direct, ${summary.fallbackSuccess} fallback)`,
      {
        description:
          summary.failed > 0
            ? `${summary.failed} functions failed`
            : "All functions working!",
        duration: 5000,
      },
    );
  };

  const calculateSummary = (): TestSummary => {
    const filtered = functions.filter((func) =>
      selectedCategory === "all" ? true : func.category === selectedCategory,
    );

    return {
      total: filtered.length,
      passed: filtered.filter((f) => f.status === "success").length,
      failed: filtered.filter((f) => f.status === "failed").length,
      running: filtered.filter((f) => f.status === "running").length,
      timeout: filtered.filter((f) => f.status === "timeout").length,
      fallbackSuccess: filtered.filter((f) => f.status === "fallback-success")
        .length,
    };
  };

  const resetAllTests = () => {
    setFunctions((prev) =>
      prev.map((func) => ({
        ...func,
        status: "idle",
        message: "Ready to test",
        duration: undefined,
        details: undefined,
        timestamp: undefined,
        usedFallback: false,
      })),
    );
    resetFunctionStatuses();
    setProgress(0);
    toast.info("All tests reset");
  };

  const getStatusIcon = (status: FunctionTest["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "timeout":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "fallback-success":
        return <Shield className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: FunctionTest["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            Success
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "running":
        return (
          <Badge variant="default" className="bg-blue-500">
            Running
          </Badge>
        );
      case "timeout":
        return (
          <Badge variant="default" className="bg-orange-500">
            Timeout
          </Badge>
        );
      case "fallback-success":
        return (
          <Badge variant="default" className="bg-amber-500">
            Fallback Success
          </Badge>
        );
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...routerConfig, [key]: value };
    setRouterConfig(newConfig);
    updateRouterConfig({ [key]: value });
  };

  const categories = [
    "all",
    "core",
    "payment",
    "orders",
    "shipping",
    "communication",
    "analytics",
    "admin",
    "background",
  ];

  const summary = calculateSummary();

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Bulletproof Edge Functions Monitor
            <Badge variant="outline" className="ml-auto">
              Smart Routing Enabled
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Health Summary Dashboard */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Server className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {healthSummary.totalFunctions}
                  </div>
                  <div className="text-sm text-gray-600">Total Functions</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {healthSummary.healthyFunctions}
                  </div>
                  <div className="text-sm text-gray-600">Healthy</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {healthSummary.averageResponseTime}ms
                  </div>
                  <div className="text-sm text-gray-600">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Activity className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(healthSummary.overallSuccessRate * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Globe className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div className="text-2xl font-bold text-cyan-600">
                    {routerConfig.enableMockMode ? "Mock" : "Live"}
                  </div>
                  <div className="text-sm text-gray-600">Mode</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Smart Router Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mock-mode" className="text-sm">
                    Mock Mode
                  </Label>
                  <Switch
                    id="mock-mode"
                    checked={routerConfig.enableMockMode}
                    onCheckedChange={(checked) => {
                      handleConfigChange("enableMockMode", checked);
                      if (checked) {
                        enableMockMode();
                      } else {
                        disableMockMode();
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-fallback" className="text-sm">
                    Auto Fallback
                  </Label>
                  <Switch
                    id="auto-fallback"
                    checked={routerConfig.enableAutoFallback}
                    onCheckedChange={(checked) => {
                      handleConfigChange("enableAutoFallback", checked);
                      if (checked) {
                        enableAutoFallback();
                      } else {
                        disableAutoFallback();
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="status-tracking" className="text-sm">
                    Status Tracking
                  </Label>
                  <Switch
                    id="status-tracking"
                    checked={routerConfig.enableStatusTracking}
                    onCheckedChange={(checked) =>
                      handleConfigChange("enableStatusTracking", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="toast-notifications" className="text-sm">
                    Fallback Notifications
                  </Label>
                  <Switch
                    id="toast-notifications"
                    checked={routerConfig.fallbackToastNotifications}
                    onCheckedChange={(checked) =>
                      handleConfigChange("fallbackToastNotifications", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded"
                disabled={isRunning}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <Button
                onClick={testAllFunctions}
                disabled={isRunning}
                className="flex-1"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Test All
                  </>
                )}
              </Button>
              <Button
                onClick={resetAllTests}
                variant="outline"
                disabled={isRunning}
              >
                Reset
              </Button>
            </div>
            <div className="flex items-end">
              <Button
                onClick={async () => {
                  toast.info("Running comprehensive test...");
                  const results = await testAllFunctions();
                  console.log("Test results:", results);
                }}
                variant="secondary"
                disabled={isRunning}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                Smart Test
              </Button>
            </div>
          </div>

          {/* Progress */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Testing Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold">{summary.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {summary.passed}
              </div>
              <div className="text-sm text-gray-600">Success</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded">
              <div className="text-2xl font-bold text-amber-600">
                {summary.fallbackSuccess}
              </div>
              <div className="text-sm text-gray-600">Fallback</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded">
              <div className="text-2xl font-bold text-red-600">
                {summary.failed}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded">
              <div className="text-2xl font-bold text-orange-600">
                {summary.timeout}
              </div>
              <div className="text-sm text-gray-600">Timeout</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {summary.running}
              </div>
              <div className="text-sm text-gray-600">Running</div>
            </div>
          </div>

          {/* Alert for current mode */}
          {routerConfig.enableMockMode && (
            <Alert className="border-amber-200 bg-amber-50">
              <Shield className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Mock Mode Active:</strong> All functions are using
                simulated responses. Disable mock mode to test real edge
                function deployments.
              </AlertDescription>
            </Alert>
          )}

          {!routerConfig.enableAutoFallback && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Auto-Fallback Disabled:</strong> Functions will fail
                completely if primary endpoints are unavailable. Enable
                auto-fallback for resilient testing.
              </AlertDescription>
            </Alert>
          )}

          {/* Test Results by Category */}
          <Tabs
            defaultValue="all"
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <TabsList className="grid grid-cols-5 md:grid-cols-9 w-full">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="text-xs"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {functions
                    .filter((func) =>
                      category === "all" ? true : func.category === category,
                    )
                    .map((func) => (
                      <Card key={func.id} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {func.icon}
                              <span className="font-medium text-sm">
                                {func.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(func.status)}
                              {getStatusBadge(func.status)}
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            {func.message}
                          </div>
                          {func.duration && (
                            <div className="mt-1 text-xs text-gray-500">
                              Duration: {func.duration}ms
                            </div>
                          )}
                          {func.usedFallback && (
                            <Alert className="mt-2 border-amber-200 bg-amber-50">
                              <Shield className="h-4 w-4 text-amber-600" />
                              <AlertDescription className="text-xs text-amber-800">
                                Smart routing used fallback mechanism. Primary
                                function unavailable but backup provided
                                functionality.
                              </AlertDescription>
                            </Alert>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() => testFunction(func)}
                            disabled={isRunning}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Smart Test
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulletproofEdgeFunctionsTester;
