import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  Clock,
  Package,
  CreditCard,
  Truck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface TestResult {
  name: string;
  status: "pass" | "fail" | "pending" | "running";
  message: string;
  details?: any;
}

const PurchaseFlowTester: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTestResult = (name: string, result: Partial<TestResult>) => {
    setTestResults((prev) =>
      prev.map((test) => (test.name === name ? { ...test, ...result } : test)),
    );
  };

  const addTestResult = (result: TestResult) => {
    setTestResults((prev) => [...prev, result]);
  };

  const testDeliveryQuotes = async (): Promise<void> => {
    const testName = "Delivery Quotes API";
    addTestResult({
      name: testName,
      status: "running",
      message: "Testing delivery quotes...",
    });

    try {
      const response = await fetch("/api/get-delivery-quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup_address: {
            city: "Cape Town",
            province: "Western Cape",
            street: "Test Street 123",
          },
          delivery_address: {
            city: "Johannesburg",
            province: "Gauteng",
            street: "Test Avenue 456",
          },
          package_details: {
            weight: 1.5,
            value: 250,
          },
          test: true,
        }),
      });

      const data = await response.json();

      if (data.success && data.quotes && data.quotes.length > 0) {
        updateTestResult(testName, {
          status: "pass",
          message: `✅ Found ${data.quotes.length} delivery options`,
          details: data.quotes.map((q: any) => `${q.provider} - R${q.price}`),
        });
      } else {
        updateTestResult(testName, {
          status: "fail",
          message: "❌ No delivery quotes returned",
          details: data,
        });
      }
    } catch (error) {
      updateTestResult(testName, {
        status: "fail",
        message: `❌ Delivery API error: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: error,
      });
    }
  };

  const testPaymentInitialization = async (): Promise<void> => {
    const testName = "Payment Initialization";
    addTestResult({
      name: testName,
      status: "running",
      message: "Testing payment initialization...",
    });

    try {
      const response = await fetch("/api/initialize-paystack-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          amount: 150.5,
          reference: `test_${Date.now()}`,
          metadata: {
            book_id: "test-book-123",
            buyer_id: "test-buyer-456",
          },
        }),
      });

      const data = await response.json();

      if (data.status && data.data?.authorization_url) {
        updateTestResult(testName, {
          status: "pass",
          message: "✅ Payment initialization successful",
          details: {
            authorization_url: data.data.authorization_url,
            reference: data.data.reference,
          },
        });
      } else {
        updateTestResult(testName, {
          status: "fail",
          message: "❌ Payment initialization failed",
          details: data,
        });
      }
    } catch (error) {
      updateTestResult(testName, {
        status: "fail",
        message: `❌ Payment API error: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: error,
      });
    }
  };

  const testHealthEndpoints = async (): Promise<void> => {
    const testName = "Health Check";
    addTestResult({
      name: testName,
      status: "running",
      message: "Testing API health...",
    });

    try {
      const response = await fetch("/api/health");
      const data = await response.json();

      if (data.success && data.status === "healthy") {
        updateTestResult(testName, {
          status: "pass",
          message: "✅ API health check passed",
          details: {
            environment: data.environment,
            runtime: data.runtime,
          },
        });
      } else {
        updateTestResult(testName, {
          status: "fail",
          message: "❌ API health check failed",
          details: data,
        });
      }
    } catch (error) {
      updateTestResult(testName, {
        status: "fail",
        message: `❌ Health API error: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: error,
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    toast.info("Running purchase flow tests...");

    try {
      await testHealthEndpoints();
      await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay between tests

      await testDeliveryQuotes();
      await new Promise((resolve) => setTimeout(resolve, 500));

      await testPaymentInitialization();

      const passedTests = testResults.filter(
        (test) => test.status === "pass",
      ).length;
      const totalTests = testResults.length;

      if (passedTests === totalTests) {
        toast.success("All purchase flow tests passed! ✅");
      } else {
        toast.error(
          `${totalTests - passedTests} tests failed. Check details below.`,
        );
      }
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "fail":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "running":
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return "bg-green-100 text-green-800";
      case "fail":
        return "bg-red-100 text-red-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-6 h-6" />
            Purchase Flow Tester
          </CardTitle>
          <p className="text-gray-600">
            Test all components of the purchase flow to ensure everything works
            properly.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                onClick={runAllTests}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : (
                  <Package className="w-4 h-4" />
                )}
                {isRunning ? "Running Tests..." : "Run All Tests"}
              </Button>
            </div>
            {testResults.length > 0 && (
              <div className="flex gap-2">
                <Badge variant="outline">
                  {testResults.filter((t) => t.status === "pass").length} Passed
                </Badge>
                <Badge variant="outline">
                  {testResults.filter((t) => t.status === "fail").length} Failed
                </Badge>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results</h3>

            {testResults.length === 0 && !isRunning && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Click "Run All Tests" to test the purchase flow functionality.
                </AlertDescription>
              </Alert>
            )}

            {testResults.map((test, index) => (
              <Card key={index} className="border-l-4 border-l-gray-200">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h4 className="font-medium">{test.name}</h4>
                        <p className="text-sm text-gray-600">{test.message}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(test.status)}>
                      {test.status.toUpperCase()}
                    </Badge>
                  </div>

                  {test.details && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                        {typeof test.details === "string"
                          ? test.details
                          : JSON.stringify(test.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Key Flow Components:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Delivery Quotes</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-600" />
                <span>Payment Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-600" />
                <span>Order Management</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseFlowTester;
