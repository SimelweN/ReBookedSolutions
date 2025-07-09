import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Server,
  Zap,
  CreditCard,
  Mail,
  Upload,
  Package,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { executeFunction } from "@/services/functionExecutor";
import {
  aiPaymentService,
  aiEmailService,
  aiFileService,
  aiShippingService,
  aiOrderService,
  aiSearchService,
  aiAnalyticsService,
} from "@/services/aiIntegratedServices";

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
}

const AIFallbackSystemTester = () => {
  // Legacy component - redirecting to EnhancedAIFallbackTester
  return <EnhancedAIFallbackTester />;
};

// Import the enhanced version
import EnhancedAIFallbackTester from "./EnhancedAIFallbackTester";

// Keep original component for backward compatibility
const OriginalAIFallbackSystemTester = () => {
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
          aiPaymentService.initializePayment("test@example.com", 100, {
            test: true,
          }),
      },
      {
        id: "payment-verify",
        name: "Verify Payment",
        test: () => aiPaymentService.verifyPayment("test_reference_123"),
      },
    ],
    email: [
      {
        id: "email-send",
        name: "Send Email Notification",
        test: () =>
          aiEmailService.sendNotification(
            "test@example.com",
            "Test Email",
            "welcome",
            { name: "Test User" },
          ),
      },
      {
        id: "email-order",
        name: "Send Order Confirmation",
        test: () =>
          aiEmailService.sendOrderConfirmation("buyer@example.com", {
            orderId: "TEST123",
            bookTitle: "Test Book",
            price: 150,
            sellerName: "Test Seller",
          }),
      },
    ],
    shipping: [
      {
        id: "shipping-quotes",
        name: "Get Delivery Quotes",
        test: () =>
          aiShippingService.getDeliveryQuotes(
            { city: "Cape Town", province: "Western Cape" },
            { city: "Johannesburg", province: "Gauteng" },
            { weight: 1, value: 500 },
          ),
      },
      {
        id: "shipping-track",
        name: "Track Package",
        test: () => aiShippingService.trackPackage("courier-guy", "TEST123456"),
      },
    ],
    orders: [
      {
        id: "order-create",
        name: "Create Order",
        test: () =>
          aiOrderService.createOrder({
            bookId: "book123",
            buyerId: "buyer123",
            sellerId: "seller123",
            price: 200,
            shippingAddress: { city: "Cape Town", province: "Western Cape" },
          }),
      },
      {
        id: "order-commit",
        name: "Commit to Sale",
        test: () => aiOrderService.commitToSale("order123", "seller123", true),
      },
    ],
    search: [
      {
        id: "search-advanced",
        name: "Advanced Search",
        test: () =>
          aiSearchService.advancedSearch("mathematics", {
            university: "UCT",
            priceRange: { min: 100, max: 500 },
          }),
      },
      {
        id: "search-resources",
        name: "Study Resources",
        test: () =>
          aiSearchService.getStudyResources("UCT", "Computer Science"),
      },
    ],
    analytics: [
      {
        id: "analytics-track",
        name: "Track Event",
        test: () =>
          aiAnalyticsService.trackEvent(
            "test_event",
            { test: true },
            "user123",
          ),
      },
      {
        id: "analytics-page",
        name: "Track Page View",
        test: () => aiAnalyticsService.trackPageView("/test", "user123"),
      },
    ],
    direct: [
      {
        id: "direct-function",
        name: "Direct Function Call",
        test: () => executeFunction("study-resources-api", { test: true }),
      },
    ],
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

      // Update test status to running
      setTestResults((prev) => [
        ...prev.filter((r) => r.id !== test.id),
        {
          id: test.id,
          name: test.name,
          service: test.service,
          status: "running",
          message: "Testing...",
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
          message: result.success
            ? `Success from ${result.source}`
            : result.error || "Test failed",
          duration,
          source: result.source,
          cached: result.cached,
          fallbackUsed: result.fallbackUsed,
          data: result.data,
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
            message: `Error: ${error}`,
          },
        ]);
      }

      setProgress(((i + 1) / allTests.length) * 100);

      // Small delay to show progress
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setIsRunning(false);

    const summary = getTestSummary();
    toast.success(
      `Testing complete: ${summary.passed}/${summary.total} passed`,
    );
  };

  const runSingleTest = async (testId: string, service: string) => {
    const test = testSuites[service as keyof typeof testSuites]?.find(
      (t) => t.id === testId,
    );
    if (!test) return;

    setTestResults((prev) => [
      ...prev.filter((r) => r.id !== testId),
      {
        id: testId,
        name: test.name,
        service,
        status: "running",
        message: "Testing...",
      },
    ]);

    try {
      const startTime = Date.now();
      const result = await test.test();
      const duration = Date.now() - startTime;

      const testResult: TestResult = {
        id: testId,
        name: test.name,
        service,
        status: result.success
          ? "success"
          : result.fallbackUsed
            ? "fallback"
            : "failed",
        message: result.success
          ? `Success from ${result.source}`
          : result.error || "Test failed",
        duration,
        source: result.source,
        cached: result.cached,
        fallbackUsed: result.fallbackUsed,
        data: result.data,
      };

      setTestResults((prev) => [
        ...prev.filter((r) => r.id !== testId),
        testResult,
      ]);
    } catch (error) {
      setTestResults((prev) => [
        ...prev.filter((r) => r.id !== testId),
        {
          id: testId,
          name: test.name,
          service,
          status: "failed",
          message: `Error: ${error}`,
        },
      ]);
    }
  };

  const getTestSummary = () => {
    const total = testResults.length;
    const passed = testResults.filter(
      (r) => r.status === "success" || r.status === "fallback",
    ).length;
    const failed = testResults.filter((r) => r.status === "failed").length;
    const running = testResults.filter((r) => r.status === "running").length;
    const fallback = testResults.filter((r) => r.status === "fallback").length;

    return { total, passed, failed, running, fallback };
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

  const getStatusBadge = (status: string) => {
    const variants = {
      success: "default",
      failed: "destructive",
      fallback: "secondary",
      running: "outline",
      idle: "outline",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case "payment":
        return <CreditCard className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "file":
        return <Upload className="h-4 w-4" />;
      case "shipping":
        return <Package className="h-4 w-4" />;
      case "orders":
        return <Database className="h-4 w-4" />;
      case "search":
        return <Search className="h-4 w-4" />;
      case "analytics":
        return <Activity className="h-4 w-4" />;
      case "direct":
        return <Server className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
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
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {summary.total} tests • {summary.passed} passed •{" "}
                {summary.failed} failed • {summary.fallback} fallback
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
                {isRunning ? "Running..." : "Run Tests"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="services">By Service</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {testResults.length > 0 ? (
            <div className="grid gap-4">
              {testResults.map((result) => (
                <Card key={result.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getServiceIcon(result.service)}
                        <div>
                          <div className="font-medium">{result.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {result.message}
                            {result.duration && ` (${result.duration}ms)`}
                            {result.source && ` • Source: ${result.source}`}
                            {result.cached && " • Cached"}
                            {result.fallbackUsed && " • Fallback Used"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        {getStatusBadge(result.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            runSingleTest(result.id, result.service)
                          }
                          disabled={isRunning}
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                    {result.data && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                        <pre>{JSON.stringify(result.data, null, 2)}</pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No test results yet. Click "Run Tests" to start testing.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const serviceTests = testResults.filter(
                (r) => r.service === service,
              );
              const servicePassed = serviceTests.filter(
                (r) => r.status === "success" || r.status === "fallback",
              ).length;
              const serviceTotal =
                testSuites[service as keyof typeof testSuites].length;

              return (
                <Card key={service}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {getServiceIcon(service)}
                      {service.charAt(0).toUpperCase() + service.slice(1)}
                    </CardTitle>
                    <Badge variant="outline">
                      {servicePassed}/{serviceTotal}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {testSuites[service as keyof typeof testSuites].map(
                        (test) => {
                          const result = serviceTests.find(
                            (r) => r.id === test.id,
                          );
                          return (
                            <div
                              key={test.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span>{test.name}</span>
                              <div className="flex items-center gap-1">
                                {result
                                  ? getStatusIcon(result.status)
                                  : getStatusIcon("idle")}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    runSingleTest(test.id, service)
                                  }
                                  disabled={isRunning}
                                  className="h-6 px-2"
                                >
                                  Test
                                </Button>
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIFallbackSystemTester;
