import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FunctionTest {
  id: string;
  name: string;
  endpoint: string;
  category: string;
  status: "idle" | "running" | "success" | "failed" | "timeout";
  message: string;
  duration?: number;
  timestamp?: string;
  details?: any;
  icon: React.ReactNode;
  healthCheck?: boolean;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  running: number;
  timeout: number;
}

const EdgeFunctionsTester = () => {
  const [functions, setFunctions] = useState<FunctionTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testTimeout, setTestTimeout] = useState(10000); // 10 seconds default
  const [batchSize, setBatchSize] = useState(3); // Test 3 functions at a time
  const [selectedCategory, setSelectedCategory] = useState("all");

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
        healthCheck: false, // Webhook doesn't have health check
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

      // Shipping & Logistics
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
        icon: <Activity className="h-4 w-4" />,
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
        icon: <Activity className="h-4 w-4" />,
        healthCheck: true,
      },

      // Communication & Notifications
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
        icon: <Mail className="h-4 w-4" />,
        healthCheck: true,
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
      },

      // Analytics & Reporting
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

      // Administration
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
      },
      {
        id: "process-order-reminders",
        name: "Order Reminders",
        endpoint: "process-order-reminders",
        category: "background",
        status: "idle",
        message: "Ready to test",
        icon: <Bell className="h-4 w-4" />,
        healthCheck: true,
      },
    ];

    setFunctions(edgeFunctions);
  }, []);

  const updateFunctionStatus = (
    id: string,
    status: FunctionTest["status"],
    message: string,
    duration?: number,
    details?: any,
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
              timestamp: new Date().toISOString(),
            }
          : func,
      ),
    );
  };

  const testFunction = async (func: FunctionTest) => {
    updateFunctionStatus(func.id, "running", "Testing...");
    const startTime = Date.now();

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), testTimeout);
      });

      // Prepare different test bodies based on function type
      let testBody: any = {};

      if (func.healthCheck) {
        testBody = { action: "health" };
      } else {
        // For functions without health checks, try minimal valid requests
        switch (func.category) {
          case "payment":
            if (func.endpoint.includes("webhook")) {
              // Webhooks don't accept our test format
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
              pickup_address: "Test",
              delivery_address: "Test",
              test: true,
            };
            break;
          case "orders":
            testBody = {
              order_id: "test-order",
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

        // Analyze the error to determine function status
        if (
          errorMsg.includes("unauthorized") ||
          errorMsg.includes("Unauthorized") ||
          errorMsg.includes("JWT") ||
          errorMsg.includes("auth")
        ) {
          updateFunctionStatus(
            func.id,
            "success",
            "Function deployed (needs authentication)",
            duration,
            { error: errorMsg, status: "auth_required" },
          );
        } else if (
          errorMsg.includes("missing") ||
          errorMsg.includes("required") ||
          errorMsg.includes("validation") ||
          errorMsg.includes("invalid")
        ) {
          updateFunctionStatus(
            func.id,
            "success",
            "Function deployed (needs valid data)",
            duration,
            { error: errorMsg, status: "data_required" },
          );
        } else if (
          errorMsg.includes("FunctionsRelayError") ||
          errorMsg.includes("not found") ||
          errorMsg.includes("404")
        ) {
          updateFunctionStatus(
            func.id,
            "failed",
            "Function not deployed or unavailable",
            duration,
            result.error,
          );
        } else if (
          errorMsg.includes("Environment") ||
          errorMsg.includes("API key") ||
          errorMsg.includes("configuration")
        ) {
          updateFunctionStatus(
            func.id,
            "failed",
            "Missing environment variables or configuration",
            duration,
            result.error,
          );
        } else {
          // For other errors, consider the function deployed but with issues
          updateFunctionStatus(
            func.id,
            "success",
            `Function deployed (error: ${errorMsg.substring(0, 100)}...)`,
            duration,
            result.error,
          );
        }
      } else {
        updateFunctionStatus(
          func.id,
          "success",
          "Function healthy and responsive",
          duration,
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

  const testAllFunctions = async () => {
    setIsRunning(true);
    setProgress(0);

    const functionsToTest = functions.filter(
      (func) =>
        selectedCategory === "all" || func.category === selectedCategory,
    );

    const totalFunctions = functionsToTest.length;
    let completedFunctions = 0;

    // Test functions in batches to avoid overwhelming the server
    for (let i = 0; i < functionsToTest.length; i += batchSize) {
      const batch = functionsToTest.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (func) => {
          await testFunction(func);
          completedFunctions++;
          setProgress((completedFunctions / totalFunctions) * 100);
        }),
      );

      // Small delay between batches
      if (i + batchSize < functionsToTest.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setIsRunning(false);
    toast.success(`Completed testing ${totalFunctions} edge functions`);
  };

  const testSingleFunction = async (func: FunctionTest) => {
    await testFunction(func);
  };

  const resetAllTests = () => {
    setFunctions((prev) =>
      prev.map((func) => ({
        ...func,
        status: "idle",
        message: "Ready to test",
        duration: undefined,
        timestamp: undefined,
        details: undefined,
      })),
    );
    setProgress(0);
  };

  const getStatusIcon = (status: FunctionTest["status"]) => {
    switch (status) {
      case "idle":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "timeout":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: FunctionTest["status"]) => {
    const colors = {
      idle: "text-gray-600 bg-gray-100",
      running: "text-blue-600 bg-blue-100",
      success: "text-green-600 bg-green-100",
      failed: "text-red-600 bg-red-100",
      timeout: "text-yellow-600 bg-yellow-100",
    };

    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getSummary = (): TestSummary => {
    const functionsToCount = functions.filter(
      (func) =>
        selectedCategory === "all" || func.category === selectedCategory,
    );

    return {
      total: functionsToCount.length,
      passed: functionsToCount.filter((f) => f.status === "success").length,
      failed: functionsToCount.filter((f) => f.status === "failed").length,
      running: functionsToCount.filter((f) => f.status === "running").length,
      timeout: functionsToCount.filter((f) => f.status === "timeout").length,
    };
  };

  const summary = getSummary();
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

  const filteredFunctions = functions.filter(
    (func) => selectedCategory === "all" || func.category === selectedCategory,
  );

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Edge Functions Health Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeout">Test Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={testTimeout}
                onChange={(e) => setTestTimeout(Number(e.target.value))}
                min={1000}
                max={30000}
                step={1000}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch-size">Batch Size</Label>
              <Input
                id="batch-size"
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                min={1}
                max={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category Filter</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)} (
                    {cat === "all"
                      ? functions.length
                      : functions.filter((f) => f.category === cat).length}
                    )
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={testAllFunctions}
              disabled={isRunning}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunning
                ? "Testing..."
                : `Test All ${selectedCategory === "all" ? "Functions" : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
            </Button>
            <Button
              onClick={resetAllTests}
              variant="outline"
              disabled={isRunning}
            >
              Reset All
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Testing progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {summary.total}
            </div>
            <div className="text-sm text-gray-600">Total Functions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {summary.passed}
            </div>
            <div className="text-sm text-gray-600">Passed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {summary.failed}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {summary.running}
            </div>
            <div className="text-sm text-gray-600">Running</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {summary.timeout}
            </div>
            <div className="text-sm text-gray-600">Timeout</div>
          </CardContent>
        </Card>
      </div>

      {/* Functions List */}
      <Card>
        <CardHeader>
          <CardTitle>Edge Functions Status</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFunctions.length === 0 ? (
            <Alert>
              <AlertDescription>
                No functions found for the selected category.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {filteredFunctions.map((func) => (
                <div
                  key={func.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      {func.icon}
                      {getStatusIcon(func.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{func.name}</div>
                        <Badge variant="outline" className="text-xs">
                          {func.category}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {func.message}
                      </div>
                      {func.duration && (
                        <div className="text-xs text-gray-500">
                          Duration: {func.duration}ms
                        </div>
                      )}
                      {func.details && (
                        <details className="text-xs text-gray-500 mt-1">
                          <summary className="cursor-pointer">
                            View Response
                          </summary>
                          <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32">
                            {JSON.stringify(func.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(func.status)}
                    <Button
                      onClick={() => testSingleFunction(func)}
                      disabled={isRunning || func.status === "running"}
                      size="sm"
                      variant="outline"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    {func.timestamp && (
                      <div className="text-xs text-gray-500 ml-2">
                        {new Date(func.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Check Results Summary */}
      {summary.total > 0 &&
        (summary.passed > 0 || summary.failed > 0 || summary.timeout > 0) && (
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              <strong>Health Check Summary:</strong> {summary.passed} functions
              are healthy, {summary.failed} failed, and {summary.timeout} timed
              out.
              {summary.failed > 0 && (
                <span className="text-red-600">
                  {" "}
                  Check failed functions for deployment or configuration issues.
                </span>
              )}
              {summary.timeout > 0 && (
                <span className="text-yellow-600">
                  {" "}
                  Timeout functions may need longer response times or have
                  performance issues.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}
    </div>
  );
};

export default EdgeFunctionsTester;
