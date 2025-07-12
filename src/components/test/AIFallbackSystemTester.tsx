import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Play,
  Activity,
  Database,
  Server,
  Zap,
  Shield,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { executeFunction } from "@/services/functionExecutor";
import { getHealthTracker } from "@/services/healthTracker";

interface LayerStatus {
  supabase: "success" | "failed" | "skipped" | "disabled" | "not-tried";
  vercel: "success" | "failed" | "skipped" | "disabled" | "not-tried";
  fallback: "success" | "failed" | "not-reached" | "not-tried";
}

interface TestResult {
  id: string;
  name: string;
  service: string;
  status: "idle" | "running" | "success" | "failed" | "fallback";
  message: string;
  duration?: number;
  source?: string;
  cached?: boolean;
  fallbackUsed?: boolean;
  data?: any;
  layerStatus?: LayerStatus;
  executionPath?: string[];
  errorDetails?: {
    supabaseError?: string;
    vercelError?: string;
    fallbackError?: string;
  };
}

const AIFallbackSystemTester = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedService, setSelectedService] = useState("all");

  // Test configurations
  const testSuites = {
    payment: [
      {
        id: "payment-init",
        name: "Initialize Payment",
        test: () =>
          testWithDetailedStatus("initialize-paystack-payment", {
            email: "test@example.com",
            amount: 100,
            metadata: { test: true },
          }),
      },
      {
        id: "payment-verify",
        name: "Verify Payment",
        test: () =>
          testWithDetailedStatus("verify-paystack-payment", {
            reference: "test_reference_123",
          }),
      },
    ],
    email: [
      {
        id: "email-send",
        name: "Send Email Notification",
        test: () =>
          testWithDetailedStatus("send-email-notification", {
            to: "test@example.com",
            subject: "Test Email",
            template: "welcome",
            data: { name: "Test User" },
          }),
      },
    ],
    shipping: [
      {
        id: "shipping-quotes",
        name: "Get Delivery Quotes",
        test: () =>
          testWithDetailedStatus("get-delivery-quotes", {
            pickup_address: { city: "Cape Town", province: "Western Cape" },
            delivery_address: { city: "Johannesburg", province: "Gauteng" },
            package_details: { weight: 1, value: 500 },
          }),
      },
    ],
    orders: [
      {
        id: "order-create",
        name: "Create Order",
        test: () =>
          testWithDetailedStatus("create-order", {
            bookId: "book123",
            buyerId: "buyer123",
            sellerId: "seller123",
            price: 200,
            shippingAddress: { city: "Cape Town", province: "Western Cape" },
          }),
      },
    ],
    search: [
      {
        id: "search-advanced",
        name: "Advanced Search",
        test: () =>
          testWithDetailedStatus("advanced-search", {
            query: "mathematics",
            filters: { university: "UCT" },
          }),
      },
    ],
    health: [
      {
        id: "health-check",
        name: "Service Health Check",
        test: () => testServiceHealth(),
      },
    ],
  };

  // Enhanced test function with detailed status tracking
  const testWithDetailedStatus = async (functionName: string, payload: any) => {
    const healthStatus = getHealthTracker().getAllServiceStatuses();
    const supabaseHealthy =
      healthStatus.find((s) => s.service === "supabase")?.healthy &&
      !healthStatus.find((s) => s.service === "supabase")?.disabled;
    const vercelHealthy =
      healthStatus.find((s) => s.service === "vercel")?.healthy &&
      !healthStatus.find((s) => s.service === "vercel")?.disabled;

    const layerStatus: LayerStatus = {
      supabase: supabaseHealthy ? "not-tried" : "disabled",
      vercel: vercelHealthy ? "not-tried" : "disabled",
      fallback: "not-tried",
    };

    const executionPath: string[] = [];
    const errorDetails: any = {};

    try {
      // Layer 1: Test Supabase
      if (supabaseHealthy) {
        executionPath.push("Supabase");
        try {
          const { supabase } = await import("@/integrations/supabase/client");
          const { data, error } = await supabase.functions.invoke(
            functionName,
            {
              body: payload,
            },
          );

          if (!error && data) {
            layerStatus.supabase = "success";
            return {
              success: true,
              data,
              source: "supabase",
              timestamp: Date.now(),
              layerStatus,
              executionPath,
              errorDetails,
            };
          } else {
            throw new Error(error?.message || "Supabase function failed");
          }
        } catch (error) {
          layerStatus.supabase = "failed";
          errorDetails.supabaseError = String(error);

          // Try Layer 2: Vercel
          if (vercelHealthy) {
            executionPath.push("Vercel");
            try {
              const response = await fetch(`/api/${functionName}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });

              if (response.ok) {
                const data = await response.json();
                layerStatus.vercel = "success";
                return {
                  success: true,
                  data,
                  source: "vercel",
                  timestamp: Date.now(),
                  layerStatus,
                  executionPath,
                  errorDetails,
                };
              } else {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
              }
            } catch (vercelError) {
              layerStatus.vercel = "failed";
              errorDetails.vercelError = String(vercelError);
            }
          } else {
            layerStatus.vercel = "skipped";
          }

          // Try Layer 3: Fallback
          executionPath.push("Fallback");
          try {
            layerStatus.fallback = "success";
            return {
              success: true,
              data: {
                fallback: true,
                message: "Using fallback mechanism",
                originalPayload: payload,
                reason: "Primary services failed",
              },
              source: "fallback",
              timestamp: Date.now(),
              fallbackUsed: true,
              layerStatus,
              executionPath,
              errorDetails,
            };
          } catch (fallbackError) {
            layerStatus.fallback = "failed";
            errorDetails.fallbackError = String(fallbackError);
            throw new Error("All layers failed");
          }
        }
      } else {
        layerStatus.supabase = "skipped";
        executionPath.push("Vercel (Supabase disabled)");

        // Try Vercel directly
        if (vercelHealthy) {
          try {
            const response = await fetch(`/api/${functionName}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            if (response.ok) {
              const data = await response.json();
              layerStatus.vercel = "success";
              return {
                success: true,
                data,
                source: "vercel",
                timestamp: Date.now(),
                layerStatus,
                executionPath,
                errorDetails,
              };
            } else {
              throw new Error(`HTTP ${response.status}`);
            }
          } catch (vercelError) {
            layerStatus.vercel = "failed";
            errorDetails.vercelError = String(vercelError);
          }
        } else {
          layerStatus.vercel = "skipped";
        }

        // Use fallback
        executionPath.push("Fallback");
        layerStatus.fallback = "success";
        return {
          success: true,
          data: {
            fallback: true,
            message: "All primary services unavailable",
            originalPayload: payload,
          },
          source: "fallback",
          timestamp: Date.now(),
          fallbackUsed: true,
          layerStatus,
          executionPath,
          errorDetails,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: String(error),
        source: "none",
        timestamp: Date.now(),
        layerStatus,
        executionPath,
        errorDetails,
      };
    }
  };

  const testServiceHealth = async () => {
    const healthStatus = getHealthTracker().getAllServiceStatuses();

    return {
      success: true,
      data: {
        services: healthStatus,
        overall: getHealthTracker().getHealthSummary(),
      },
      source: "health-check",
      timestamp: Date.now(),
    };
  };

  const generateDetailedMessage = (result: any): string => {
    if (!result.layerStatus) {
      return result.success ? "Success" : result.error || "Failed";
    }

    const { layerStatus, source } = result;
    const parts: string[] = [];

    // Build status chain
    if (layerStatus.supabase === "success") {
      parts.push("✅ Supabase: SUCCESS");
    } else if (layerStatus.supabase === "failed") {
      parts.push("❌ Supabase: FAILED");
    } else if (layerStatus.supabase === "disabled") {
      parts.push("⏸️ Supabase: DISABLED");
    } else if (layerStatus.supabase === "skipped") {
      parts.push("⏭️ Supabase: SKIPPED");
    }

    if (layerStatus.vercel === "success") {
      parts.push("✅ Vercel: SUCCESS");
    } else if (layerStatus.vercel === "failed") {
      parts.push("❌ Vercel: FAILED");
    } else if (layerStatus.vercel === "disabled") {
      parts.push("⏸️ Vercel: DISABLED");
    } else if (layerStatus.vercel === "skipped") {
      parts.push("⏭️ Vercel: SKIPPED");
    }

    if (layerStatus.fallback === "success") {
      parts.push("✅ Fallback: SUCCESS");
    } else if (layerStatus.fallback === "failed") {
      parts.push("❌ Fallback: FAILED");
    }

    const statusText = parts.join(" → ");
    const sourceText = source ? ` (Final: ${source.toUpperCase()})` : "";

    return `${statusText}${sourceText}`;
  };

  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setTestResults([]);

    const servicesToTest =
      selectedService === "all" ? Object.keys(testSuites) : [selectedService];

    const allTests = servicesToTest.flatMap((service) =>
      testSuites[service as keyof typeof testSuites].map((test) => ({
        ...test,
        service,
      })),
    );

    for (let i = 0; i < allTests.length; i++) {
      const test = allTests[i];

      setTestResults((prev) => [
        ...prev.filter((r) => r.id !== test.id),
        {
          id: test.id,
          name: test.name,
          service: test.service,
          status: "running",
          message: "Testing layers...",
        },
      ]);

      try {
        const startTime = Date.now();
        const result = await test.test();
        const duration = Date.now() - startTime;

        const testResult: TestResult = {
          id: test.id,
          name: test.name,
          service: test.service,
          status: result.success
            ? "success"
            : result.fallbackUsed
              ? "fallback"
              : "failed",
          message: generateDetailedMessage(result),
          duration,
          source: result.source,
          cached: result.cached,
          fallbackUsed: result.fallbackUsed,
          data: result.data,
          layerStatus: result.layerStatus,
          executionPath: result.executionPath,
          errorDetails: result.errorDetails,
        };

        setTestResults((prev) => [
          ...prev.filter((r) => r.id !== test.id),
          testResult,
        ]);
      } catch (error) {
        setTestResults((prev) => [
          ...prev.filter((r) => r.id !== test.id),
          {
            id: test.id,
            name: test.name,
            service: test.service,
            status: "failed",
            message: `Test Error: ${error}`,
          },
        ]);
      }

      setProgress(((i + 1) / allTests.length) * 100);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    setIsRunning(false);

    const summary = getTestSummary();
    toast.success(
      `Testing complete: ${summary.passed}/${summary.total} passed`,
    );
  };

  const getTestSummary = () => {
    const total = testResults.length;
    const passed = testResults.filter(
      (r) => r.status === "success" || r.status === "fallback",
    ).length;
    const failed = testResults.filter((r) => r.status === "failed").length;

    return { total, passed, failed };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "fallback":
        return <Zap className="h-4 w-4 text-orange-500" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getLayerIcon = (layer: string) => {
    switch (layer) {
      case "supabase":
        return <Database className="h-3 w-3" />;
      case "vercel":
        return <Server className="h-3 w-3" />;
      case "fallback":
        return <Shield className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getLayerStatusBadge = (status: string) => {
    const config = {
      success: {
        variant: "default" as const,
        text: "✅",
        className: "text-green-700 bg-green-100",
      },
      failed: {
        variant: "destructive" as const,
        text: "❌",
        className: "text-red-700 bg-red-100",
      },
      disabled: {
        variant: "secondary" as const,
        text: "⏸️",
        className: "text-gray-700 bg-gray-100",
      },
      skipped: {
        variant: "outline" as const,
        text: "⏭️",
        className: "text-yellow-700 bg-yellow-100",
      },
      "not-tried": {
        variant: "outline" as const,
        text: "⏸",
        className: "text-gray-500 bg-gray-50",
      },
    };

    const conf = config[status as keyof typeof config] || config["not-tried"];

    return (
      <Badge variant={conf.variant} className={`text-xs ${conf.className}`}>
        {conf.text}
      </Badge>
    );
  };

  const services = Object.keys(testSuites);
  const summary = getTestSummary();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            AI Fallback System Tester
            <Badge variant="secondary">Layer Status Details</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {summary.total} tests • {summary.passed} passed •{" "}
                {summary.failed} failed
              </div>
              {isRunning && <Progress value={progress} className="w-64" />}
            </div>
            <div className="flex gap-2">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
                disabled={isRunning}
              >
                <option value="all">All Services</option>
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service.charAt(0).toUpperCase() + service.slice(1)}
                  </option>
                ))}
              </select>
              <Button
                onClick={runTests}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isRunning ? "Testing..." : "Run Tests"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {testResults.length > 0 ? (
          testResults.map((result) => (
            <Card key={result.id} className="overflow-hidden">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {/* Main test result */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {result.service} • {result.duration}ms
                          {result.source && ` • Source: ${result.source}`}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        result.status === "success"
                          ? "default"
                          : result.status === "fallback"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Layer status breakdown */}
                  {result.layerStatus && (
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Layer Execution Status:
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {Object.entries(result.layerStatus).map(
                          ([layer, status], index) => (
                            <div
                              key={layer}
                              className="flex items-center gap-1"
                            >
                              {index > 0 && (
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              )}
                              <div className="flex items-center gap-1 bg-background rounded px-2 py-1 border">
                                {getLayerIcon(layer)}
                                <span className="text-xs font-medium">
                                  {layer.charAt(0).toUpperCase() +
                                    layer.slice(1)}
                                </span>
                                {getLayerStatusBadge(status)}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {/* Detailed message */}
                  <div className="text-sm bg-muted/30 rounded p-2 font-mono">
                    {result.message}
                  </div>

                  {/* Error details */}
                  {result.errorDetails &&
                    Object.keys(result.errorDetails).length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded p-2 space-y-1">
                        <div className="text-xs font-medium text-red-800">
                          Error Details:
                        </div>
                        {Object.entries(result.errorDetails).map(
                          ([layer, error]) => (
                            <div key={layer} className="text-xs text-red-700">
                              <span className="font-medium">{layer}:</span>{" "}
                              {error}
                            </div>
                          ),
                        )}
                      </div>
                    )}

                  {/* Data preview */}
                  {result.data && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        View Response Data
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                No test results yet. Click "Run Tests" to see detailed layer
                status analysis.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIFallbackSystemTester;
