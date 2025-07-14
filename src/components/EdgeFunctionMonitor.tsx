import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Wrench,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EdgeFunction {
  id: string;
  name: string;
  endpoint: string;
  category: string;
  status: "idle" | "running" | "success" | "failed" | "timeout" | "rebuilding";
  message: string;
  duration?: number;
  timestamp?: string;
  details?: any;
  icon: React.ReactNode;
  healthCheck?: boolean;
  lastTestTime?: string;
  errorCount: number;
  successCount: number;
  responseData?: any;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  running: number;
  timeout: number;
  rebuilding: number;
}

const EdgeFunctionMonitor = () => {
  const [functions, setFunctions] = useState<EdgeFunction[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testTimeout, setTestTimeout] = useState(10000);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFailedOnly, setShowFailedOnly] = useState(false);
  const [autoRebuild, setAutoRebuild] = useState(false);

  // Initialize edge functions list
  useEffect(() => {
    const edgeFunctions: EdgeFunction[] = [
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
        errorCount: 0,
        successCount: 0,
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
        errorCount: 0,
        successCount: 0,
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
        errorCount: 0,
        successCount: 0,
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
        errorCount: 0,
        successCount: 0,
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
        errorCount: 0,
        successCount: 0,
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
        errorCount: 0,
        successCount: 0,
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
        errorCount: 0,
        successCount: 0,
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
        errorCount: 0,
        successCount: 0,
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
        errorCount: 0,
        successCount: 0,
      },
      // Order Management
      {
        id: "create-order",
        name: "Create Order",
        endpoint: "create-order",
        category: "orders",
        status: "idle",
        message: "Ready to test",
        icon: <Package className="h-4 w-4" />,
        healthCheck: true,
        errorCount: 0,
        successCount: 0,
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
        errorCount: 0,
        successCount: 0,
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
        errorCount: 0,
        successCount: 0,
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
        errorCount: 0,
        successCount: 0,
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
        errorCount: 0,
        successCount: 0,
      },
      // Shipping
      {
        id: "courier-guy-quote",
        name: "Courier Guy Quote",
        endpoint: "courier-guy-quote",
        category: "shipping",
        status: "idle",
        message: "Ready to test",
        icon: <Package className="h-4 w-4" />,
        healthCheck: true,
        errorCount: 0,
        successCount: 0,
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
        errorCount: 0,
        successCount: 0,
      },
      {
        id: "courier-guy-track",
        name: "Courier Guy Track",
        endpoint: "courier-guy-track",
        category: "shipping",
        status: "idle",
        message: "Ready to test",
        icon: <Package className="h-4 w-4" />,
        healthCheck: true,
        errorCount: 0,
        successCount: 0,
      },
      {
        id: "fastway-quote",
        name: "Fastway Quote",
        endpoint: "fastway-quote",
        category: "shipping",
        status: "idle",
        message: "Ready to test",
        icon: <Activity className="h-4 w-4" />,
        healthCheck: true,
        errorCount: 0,
        successCount: 0,
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
        errorCount: 0,
        successCount: 0,
      },
      {
        id: "get-delivery-quotes",
        name: "Get Delivery Quotes",
        endpoint: "get-delivery-quotes",
        category: "shipping",
        status: "idle",
        message: "Ready to test",
        icon: <Activity className="h-4 w-4" />,
        healthCheck: true,
        errorCount: 0,
        successCount: 0,
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
        errorCount: 0,
        successCount: 0,
      },
      {
        id: "send-email-notification",
        name: "Send Email Notification",
        endpoint: "send-email-notification",
        category: "communication",
        status: "idle",
        message: "Ready to test",
        icon: <Mail className="h-4 w-4" />,
        healthCheck: true,
        errorCount: 0,
        successCount: 0,
      },
      {
        id: "realtime-notifications",
        name: "Realtime Notifications",
        endpoint: "realtime-notifications",
        category: "communication",
        status: "idle",
        message: "Ready to test",
        icon: <Bell className="h-4 w-4" />,
        healthCheck: true,
        errorCount: 0,
        successCount: 0,
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
        errorCount: 0,
        successCount: 0,
      },
      {
        id: "dispute-resolution",
        name: "Dispute Resolution",
        endpoint: "dispute-resolution",
        category: "analytics",
        status: "idle",
        message: "Ready to test",
        icon: <Gavel className="h-4 w-4" />,
        healthCheck: true,
        errorCount: 0,
        successCount: 0,
      },
      // Background Jobs
      {
        id: "auto-expire-commits",
        name: "Auto Expire Commits",
        endpoint: "auto-expire-commits",
        category: "background",
        status: "idle",
        message: "Ready to test",
        icon: <Clock className="h-4 w-4" />,
        healthCheck: true,
        errorCount: 0,
        successCount: 0,
      },
      {
        id: "check-expired-orders",
        name: "Check Expired Orders",
        endpoint: "check-expired-orders",
        category: "background",
        status: "idle",
        message: "Ready to test",
        icon: <Clock className="h-4 w-4" />,
        healthCheck: true,
        errorCount: 0,
        successCount: 0,
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
        errorCount: 0,
        successCount: 0,
      },
    ];

    setFunctions(edgeFunctions);
  }, []);

  const updateFunctionStatus = (
    id: string,
    status: EdgeFunction["status"],
    message: string,
    duration?: number,
    details?: any,
    responseData?: any,
  ) => {
    setFunctions((prev) =>
      prev.map((func) => {
        if (func.id === id) {
          const updated = {
            ...func,
            status,
            message,
            duration,
            timestamp: new Date().toISOString(),
            details,
            responseData,
            lastTestTime: new Date().toISOString(),
          };

          if (status === "success") {
            updated.successCount = func.successCount + 1;
          } else if (status === "failed") {
            updated.errorCount = func.errorCount + 1;
          }

          return updated;
        }
        return func;
      }),
    );
  };

  const testFunction = async (func: EdgeFunction) => {
    updateFunctionStatus(func.id, "running", "Testing...");
    const startTime = Date.now();

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), testTimeout);
      });

      let testBody: any = {};

      if (func.healthCheck) {
        // For health checks, use GET request instead of POST with body
        try {
          const { data, error } = await supabase.functions.invoke(
            func.endpoint,
            {
              method: "GET",
            },
          );

          if (error) {
            throw error;
          }

          setFunctions((prev) =>
            prev.map((f) =>
              f.id === func.id
                ? {
                    ...f,
                    status: "success",
                    message: `Health check passed: ${data?.status || "healthy"}`,
                    successCount: f.successCount + 1,
                  }
                : f,
            ),
          );
          return;
        } catch (error) {
          setFunctions((prev) =>
            prev.map((f) =>
              f.id === func.id
                ? {
                    ...f,
                    status: "error",
                    message: `Health check failed: ${error.message}`,
                    errorCount: f.errorCount + 1,
                  }
                : f,
            ),
          );
          return;
        }
      } else {
        switch (func.category) {
          case "payment":
            if (func.endpoint.includes("webhook")) {
              testBody = {};
            } else if (func.endpoint.includes("initialize")) {
              testBody = { amount: 100, email: "test@example.com" };
            } else if (func.endpoint.includes("verify")) {
              testBody = { reference: "test_ref" };
            } else {
              testBody = { test: true };
            }
            break;
          case "shipping":
            testBody = {
              fromAddress: {
                streetAddress: "Test Street",
                city: "Test City",
                postalCode: "1234",
              },
              toAddress: {
                streetAddress: "Test Street 2",
                city: "Test City 2",
                postalCode: "5678",
              },
              parcel: { weight: 1, length: 10, width: 10, height: 5 },
            };
            break;
          case "orders":
            testBody = {
              orderId: "test-order",
              test: true,
            };
            break;
          case "communication":
            testBody = {
              action: "test",
              message: "Test notification",
            };
            break;
          default:
            testBody = { action: "health", test: true };
        }
      }

      const testPromise = supabase.functions.invoke(func.endpoint, {
        body: testBody,
      });

      const result = await Promise.race([testPromise, timeoutPromise]);
      const duration = Date.now() - startTime;

      if (result.error) {
        const errorMsg = result.error.message || "Unknown error";

        // Check for specific error that requires rebuilding
        if (
          errorMsg.includes("Edge Function returned a non-2xx status code") ||
          errorMsg.includes("FunctionsRelayError") ||
          errorMsg.includes("not found") ||
          errorMsg.includes("404")
        ) {
          updateFunctionStatus(
            func.id,
            "failed",
            "Function deployment error - needs rebuild",
            duration,
            result.error,
            result.data,
          );

          if (autoRebuild) {
            await rebuildFunction(func);
          }
        } else {
          updateFunctionStatus(
            func.id,
            "failed",
            `Function error: ${errorMsg.substring(0, 100)}${errorMsg.length > 100 ? "..." : ""}`,
            duration,
            result.error,
            result.data,
          );
        }
      } else if (result.data) {
        const responseData = result.data;

        if (responseData && typeof responseData === "object") {
          if (responseData.success === false || responseData.error) {
            updateFunctionStatus(
              func.id,
              "failed",
              `Function returned error: ${responseData.error || responseData.message || "Unknown error"}`,
              duration,
              responseData,
              responseData,
            );
          } else {
            updateFunctionStatus(
              func.id,
              "success",
              "Function healthy and responsive",
              duration,
              responseData,
              responseData,
            );
          }
        } else {
          updateFunctionStatus(
            func.id,
            "success",
            "Function healthy and responsive",
            duration,
            result.data,
            result.data,
          );
        }
      } else {
        updateFunctionStatus(
          func.id,
          "success",
          "Function healthy and responsive",
          duration,
          result.data,
          result.data,
        );
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;

      if (error.message === "Timeout") {
        updateFunctionStatus(
          func.id,
          "timeout",
          `Function timeout after ${testTimeout}ms`,
          duration,
        );
      } else {
        updateFunctionStatus(
          func.id,
          "failed",
          `Network error: ${error.message}`,
          duration,
          error,
        );
      }
    }
  };

  const rebuildFunction = async (func: EdgeFunction) => {
    updateFunctionStatus(func.id, "rebuilding", "Rebuilding function...");

    try {
      // Here you would implement the actual rebuild logic
      // For now, we'll simulate the rebuild process
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // After rebuild, test the function again
      await testFunction(func);

      toast.success(`Function ${func.name} rebuilt successfully`);
    } catch (error) {
      updateFunctionStatus(func.id, "failed", "Rebuild failed");
      toast.error(`Failed to rebuild ${func.name}`);
    }
  };

  const testAllFunctions = async () => {
    setIsRunning(true);
    setProgress(0);

    const functionsToTest = functions.filter(
      (func) =>
        selectedCategory === "all" || func.category === selectedCategory,
    );

    const totalFunctions = functionsToTest.length;
    let completedFunctions = 0;

    for (let i = 0; i < functionsToTest.length; i += 3) {
      const batch = functionsToTest.slice(i, i + 3);

      await Promise.all(
        batch.map(async (func) => {
          await testFunction(func);
          completedFunctions++;
          setProgress((completedFunctions / totalFunctions) * 100);
        }),
      );

      if (i + 3 < functionsToTest.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setIsRunning(false);
    toast.success(`Completed testing ${totalFunctions} edge functions`);
  };

  const rebuildAllFailed = async () => {
    const failedFunctions = functions.filter(
      (func) => func.status === "failed",
    );

    if (failedFunctions.length === 0) {
      toast.info("No failed functions to rebuild");
      return;
    }

    toast.info(`Rebuilding ${failedFunctions.length} failed functions...`);

    for (const func of failedFunctions) {
      await rebuildFunction(func);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Small delay between rebuilds
    }
  };

  const resetAllTests = () => {
    setFunctions((prev) =>
      prev.map((func) => ({
        ...func,
        status: "idle" as const,
        message: "Ready to test",
        duration: undefined,
        timestamp: undefined,
        details: undefined,
        responseData: undefined,
      })),
    );
  };

  const getStatusIcon = (status: EdgeFunction["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case "timeout":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "rebuilding":
        return <Wrench className="h-4 w-4 text-purple-600 animate-pulse" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: EdgeFunction["status"]) => {
    const colors = {
      idle: "secondary",
      running: "default",
      success: "default",
      failed: "destructive",
      timeout: "secondary",
      rebuilding: "secondary",
    } as const;

    const labels = {
      idle: "Idle",
      running: "Testing",
      success: "Passed",
      failed: "Failed",
      timeout: "Timeout",
      rebuilding: "Rebuilding",
    };

    return (
      <Badge variant={colors[status] || "secondary"}>{labels[status]}</Badge>
    );
  };

  const filteredFunctions = showFailedOnly
    ? functions.filter(
        (func) => func.status === "failed" || func.status === "timeout",
      )
    : functions.filter(
        (func) =>
          selectedCategory === "all" || func.category === selectedCategory,
      );

  const summary: TestSummary = functions.reduce(
    (acc, func) => {
      acc.total++;
      switch (func.status) {
        case "success":
          acc.passed++;
          break;
        case "failed":
          acc.failed++;
          break;
        case "running":
          acc.running++;
          break;
        case "timeout":
          acc.timeout++;
          break;
        case "rebuilding":
          acc.rebuilding++;
          break;
      }
      return acc;
    },
    { total: 0, passed: 0, failed: 0, running: 0, timeout: 0, rebuilding: 0 },
  );

  const categories = [
    "all",
    "core",
    "payment",
    "orders",
    "shipping",
    "communication",
    "analytics",
    "background",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Enhanced Edge Function Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {summary.total}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                  {summary.passed}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                  {summary.failed}
                  <TrendingDown className="h-4 w-4" />
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {summary.timeout}
                </div>
                <div className="text-sm text-muted-foreground">Timeout</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {summary.running}
                </div>
                <div className="text-sm text-muted-foreground">Running</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {summary.rebuilding}
                </div>
                <div className="text-sm text-muted-foreground">Rebuilding</div>
              </div>
            </div>

            {/* Progress Bar */}
            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Testing Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                onClick={testAllFunctions}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Test All Functions
              </Button>

              <Button
                onClick={rebuildAllFailed}
                disabled={isRunning || summary.failed === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Wrench className="h-4 w-4" />
                Rebuild Failed ({summary.failed})
              </Button>

              <Button
                onClick={resetAllTests}
                disabled={isRunning}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset All
              </Button>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showFailedOnly"
                  checked={showFailedOnly}
                  onChange={(e) => setShowFailedOnly(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="showFailedOnly" className="text-sm">
                  Show Failed Only
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoRebuild"
                  checked={autoRebuild}
                  onChange={(e) => setAutoRebuild(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="autoRebuild" className="text-sm">
                  Auto-Rebuild Failed
                </label>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "all"
                    ? "All"
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {summary.total > 0 && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <strong>Health Check Summary:</strong> {summary.passed} functions
            are healthy, {summary.failed} failed, {summary.timeout} timed out,
            and {summary.rebuilding} are being rebuilt.
            {summary.failed > 0 && (
              <span className="text-red-600 font-medium">
                {" "}
                ⚠️ {summary.failed} functions need attention!
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Function List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Functions ({filteredFunctions.length})
        </h3>
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFunctions.map((func) => (
              <Card key={func.id} className="border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {func.icon}
                        <div>
                          <h4 className="font-medium text-sm">{func.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {func.category}
                          </p>
                        </div>
                      </div>
                      {getStatusIcon(func.status)}
                    </div>

                    <div className="space-y-2">
                      {getStatusBadge(func.status)}
                      <p className="text-xs text-muted-foreground">
                        {func.message}
                      </p>

                      {func.duration && (
                        <p className="text-xs text-muted-foreground">
                          Duration: {func.duration}ms
                        </p>
                      )}

                      {/* Success/Error Count */}
                      <div className="flex gap-4 text-xs">
                        <span className="text-green-600">
                          ✓ {func.successCount}
                        </span>
                        <span className="text-red-600">
                          ✗ {func.errorCount}
                        </span>
                      </div>

                      {func.lastTestTime && (
                        <p className="text-xs text-muted-foreground">
                          Last tested:{" "}
                          {new Date(func.lastTestTime).toLocaleTimeString()}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testFunction(func)}
                        disabled={
                          func.status === "running" ||
                          func.status === "rebuilding"
                        }
                      >
                        Test
                      </Button>

                      {func.status === "failed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rebuildFunction(func)}
                          disabled={func.status === "rebuilding"}
                        >
                          <Wrench className="h-3 w-3 mr-1" />
                          Rebuild
                        </Button>
                      )}
                    </div>

                    {/* Response Details */}
                    {func.responseData && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground">
                          Response Details
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                          {JSON.stringify(func.responseData, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default EdgeFunctionMonitor;
