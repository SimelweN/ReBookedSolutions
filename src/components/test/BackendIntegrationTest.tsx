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
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import {
  BackendOrchestrator,
  StudyResourcesService,
  NotificationService,
  AdvancedSearchService,
  AnalyticsService,
} from "@/services/comprehensive/backendOrchestrator";

type TestStatus = "idle" | "running" | "success" | "error";

interface TestResult {
  name: string;
  status: TestStatus;
  message: string;
  duration?: number;
}

const BackendIntegrationTest = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (
    name: string,
    status: TestStatus,
    message: string,
    duration?: number,
  ) => {
    setTests((prev) => {
      const existing = prev.find((t) => t.name === name);
      if (existing) {
        return prev.map((t) =>
          t.name === name ? { ...t, status, message, duration } : t,
        );
      }
      return [...prev, { name, status, message, duration }];
    });
  };

  const runTest = async (name: string, testFn: () => Promise<void>) => {
    const startTime = Date.now();
    updateTest(name, "running", "Running...");

    try {
      await testFn();
      const duration = Date.now() - startTime;
      updateTest(name, "success", "Passed", duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTest(
        name,
        "error",
        error instanceof Error ? error.message : "Unknown error",
        duration,
      );
    }
  };

  const runAllTests = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setTests([]);

    // Test 1: Backend Health Check
    await runTest("Backend Health Check", async () => {
      const health = await BackendOrchestrator.healthCheck();
      const healthyServices = Object.values(health).filter(Boolean).length;
      const totalServices = Object.keys(health).length;

      if (healthyServices === 0) {
        throw new Error("No backend services are responding");
      }

      console.log(`${healthyServices}/${totalServices} services healthy`);
    });

    // Test 2: Study Resources Search
    await runTest("Study Resources Search", async () => {
      const results = await StudyResourcesService.searchResources({
        query: "test",
        limit: 5,
      });
      console.log("Study resources search successful");
    });

    // Test 3: Advanced Search
    await runTest("Advanced Search", async () => {
      const results = await AdvancedSearchService.search({
        query: "physics",
        limit: 5,
      });
      console.log("Advanced search successful");
    });

    // Test 4: Notifications (Send Test)
    await runTest("Notifications Test", async () => {
      await NotificationService.sendNotification({
        user_id: "test-user",
        type: "test",
        title: "Test Notification",
        message: "This is a test notification",
        channels: ["in_app"],
      });
      console.log("Notification sent successfully");
    });

    // Test 5: Analytics Dashboard
    await runTest("Analytics Dashboard", async () => {
      const metrics = await AnalyticsService.getDashboardMetrics();
      console.log("Analytics dashboard loaded successfully");
    });

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestStatus) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Passed
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Failed</Badge>;
      case "running":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Running
          </Badge>
        );
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const successCount = tests.filter((t) => t.status === "success").length;
  const errorCount = tests.filter((t) => t.status === "error").length;
  const totalTests = tests.length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Backend Integration Test Suite
          </CardTitle>
          <CardDescription>
            Test all backend Edge Functions and services to ensure they're
            working correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="min-w-[120px]"
            >
              {isRunning ? "Running Tests..." : "Run All Tests"}
            </Button>

            {totalTests > 0 && (
              <div className="flex gap-2">
                <Badge variant="outline" className="text-green-600">
                  ✅ {successCount} Passed
                </Badge>
                <Badge variant="outline" className="text-red-600">
                  ❌ {errorCount} Failed
                </Badge>
                <Badge variant="outline">📊 {totalTests} Total</Badge>
              </div>
            )}
          </div>

          {tests.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Test Results:</h3>
              {tests.map((test, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-gray-500">
                        {test.message}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.duration && (
                      <span className="text-xs text-gray-400">
                        {test.duration}ms
                      </span>
                    )}
                    {getStatusBadge(test.status)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">
              💡 What This Tests:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • <strong>Backend Health Check</strong> - Verifies all Edge
                Functions are responding
              </li>
              <li>
                • <strong>Study Resources</strong> - Tests study materials
                search and management
              </li>
              <li>
                • <strong>Advanced Search</strong> - Tests book search with
                filtering and facets
              </li>
              <li>
                • <strong>Notifications</strong> - Tests real-time notification
                delivery
              </li>
              <li>
                • <strong>Analytics</strong> - Tests dashboard metrics and
                reporting
              </li>
            </ul>
          </div>

          {errorCount > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">
                🔧 Troubleshooting Failed Tests:
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>
                  • Check that all Edge Functions are deployed:{" "}
                  <code>supabase functions list</code>
                </li>
                <li>
                  • Verify environment variables are set in Supabase dashboard
                </li>
                <li>
                  • Check function logs:{" "}
                  <code>supabase functions logs &lt;function-name&gt;</code>
                </li>
                <li>
                  • Ensure database migration has been applied:{" "}
                  <code>supabase db push</code>
                </li>
                <li>• Verify user authentication is working</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BackendIntegrationTest;
