import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Database,
  Search,
  Upload,
  Bell,
  BarChart3,
  Gavel,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Play,
  Zap,
  BookOpen,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BackendOrchestrator } from "@/services/comprehensive/backendOrchestrator";
import { EmailTester } from "./EmailTester";

interface BackendTest {
  id: string;
  service: string;
  operation: string;
  status: "pending" | "running" | "success" | "failed";
  message: string;
  timestamp: string;
  duration?: number;
  details?: any;
}

const ComprehensiveBackendTester = () => {
  const [tests, setTests] = useState<BackendTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testData, setTestData] = useState({
    searchQuery: "Physics 101",
    university: "University of Cape Town",
    course: "PHY1001",
    notificationMessage: "Test notification from dev dashboard",
    fileName: "test-file.pdf",
    fileContent: "Sample file content for testing",
    disputeId: "",
    reportPeriod: "7d",
  });

  const updateTestStatus = (
    id: string,
    status: BackendTest["status"],
    message: string,
    duration?: number,
    details?: any,
  ) => {
    setTests((prev) =>
      prev.map((test) =>
        test.id === id ? { ...test, status, message, duration, details } : test,
      ),
    );
  };

  const addTest = (service: string, operation: string) => {
    const testId = Date.now().toString();
    const newTest: BackendTest = {
      id: testId,
      service,
      operation,
      status: "running",
      message: "Test in progress...",
      timestamp: new Date().toISOString(),
    };

    setTests((prev) => [newTest, ...prev]);
    return testId;
  };

  // Study Resources Tests
  const testStudyResourcesSearch = async () => {
    const testId = addTest("Study Resources", "Search");
    const startTime = Date.now();

    try {
      const result = await supabase.functions.invoke("study-resources-api", {
        body: {
          action: "search",
          query: testData.searchQuery,
          university: testData.university,
          course: testData.course,
          limit: 10,
        },
      });

      const duration = Date.now() - startTime;

      if (result.error) throw result.error;

      updateTestStatus(
        testId,
        "success",
        `Found ${result.data?.resources?.length || 0} study resources`,
        duration,
        result.data,
      );
      toast.success("Study resources search test passed");
    } catch (error: any) {
      updateTestStatus(
        testId,
        "failed",
        `Search failed: ${error.message}`,
        Date.now() - startTime,
      );
      toast.error(`Study resources test failed: ${error.message}`);
    }
  };

  const testCreateStudyResource = async () => {
    const testId = addTest("Study Resources", "Create");
    const startTime = Date.now();

    try {
      const resourceData = {
        title: "Test Study Resource",
        description:
          "This is a test study resource created from the dev dashboard",
        content: "Sample content for testing purposes",
        resource_type: "notes",
        university_id: "test-university",
        course_code: testData.course,
        year_level: 1,
        semester: "1",
        tags: ["test", "development"],
      };

      const result = await supabase.functions.invoke("study-resources-api", {
        body: resourceData,
      });

      const duration = Date.now() - startTime;

      if (result.error) throw result.error;

      updateTestStatus(
        testId,
        "success",
        "Study resource created successfully",
        duration,
        result.data,
      );
      toast.success("Study resource creation test passed");
    } catch (error: any) {
      updateTestStatus(
        testId,
        "failed",
        `Creation failed: ${error.message}`,
        Date.now() - startTime,
      );
      toast.error(`Study resource creation failed: ${error.message}`);
    }
  };

  // Advanced Search Tests
  const testAdvancedSearch = async () => {
    const testId = addTest("Advanced Search", "Full-text Search");
    const startTime = Date.now();

    try {
      const result = await supabase.functions.invoke("advanced-search", {
        body: {
          action: "search",
          query: testData.searchQuery,
          filters: {
            university: testData.university,
            course: testData.course,
            price_min: 0,
            price_max: 1000,
          },
          limit: 20,
        },
      });

      const duration = Date.now() - startTime;

      if (result.error) throw result.error;

      updateTestStatus(
        testId,
        "success",
        `Search completed with ${result.data?.results?.length || 0} results`,
        duration,
        result.data,
      );
      toast.success("Advanced search test passed");
    } catch (error: any) {
      updateTestStatus(
        testId,
        "failed",
        `Search failed: ${error.message}`,
        Date.now() - startTime,
      );
      toast.error(`Advanced search failed: ${error.message}`);
    }
  };

  // File Upload Tests
  const testFileUpload = async () => {
    const testId = addTest("File Upload", "Upload Test File");
    const startTime = Date.now();

    try {
      // Create a mock file blob
      const fileBlob = new Blob([testData.fileContent], { type: "text/plain" });
      const formData = new FormData();
      formData.append("file", fileBlob, testData.fileName);
      formData.append("type", "document");
      formData.append("folder", "test");

      const result = await supabase.functions.invoke("file-upload", {
        body: formData,
      });

      const duration = Date.now() - startTime;

      if (result.error) throw result.error;

      updateTestStatus(
        testId,
        "success",
        "File uploaded successfully",
        duration,
        result.data,
      );
      toast.success("File upload test passed");
    } catch (error: any) {
      updateTestStatus(
        testId,
        "failed",
        `Upload failed: ${error.message}`,
        Date.now() - startTime,
      );
      toast.error(`File upload failed: ${error.message}`);
    }
  };

  // Notification Tests
  const testRealTimeNotification = async () => {
    const testId = addTest("Notifications", "Send Real-time");
    const startTime = Date.now();

    try {
      const result = await supabase.functions.invoke("realtime-notifications", {
        body: {
          action: "send",
          userId: "test-user",
          type: "info",
          title: "Test Notification",
          message: testData.notificationMessage,
          priority: "normal",
          channels: ["in_app"],
        },
      });

      const duration = Date.now() - startTime;

      if (result.error) throw result.error;

      updateTestStatus(
        testId,
        "success",
        "Notification sent successfully",
        duration,
        result.data,
      );
      toast.success("Real-time notification test passed");
    } catch (error: any) {
      updateTestStatus(
        testId,
        "failed",
        `Notification failed: ${error.message}`,
        Date.now() - startTime,
      );
      toast.error(`Notification test failed: ${error.message}`);
    }
  };

  // Analytics Tests
  const testAnalytics = async () => {
    const testId = addTest("Analytics", "Dashboard Metrics");
    const startTime = Date.now();

    try {
      const result = await supabase.functions.invoke("analytics-reporting", {
        body: {
          action: "dashboard",
          period: testData.reportPeriod,
        },
      });

      const duration = Date.now() - startTime;

      if (result.error) throw result.error;

      updateTestStatus(
        testId,
        "success",
        "Analytics data retrieved successfully",
        duration,
        result.data,
      );
      toast.success("Analytics test passed");
    } catch (error: any) {
      updateTestStatus(
        testId,
        "failed",
        `Analytics failed: ${error.message}`,
        Date.now() - startTime,
      );
      toast.error(`Analytics test failed: ${error.message}`);
    }
  };

  // Dispute Resolution Tests
  const testDisputeResolution = async () => {
    const testId = addTest("Dispute Resolution", "Create Test Dispute");
    const startTime = Date.now();

    try {
      const disputeData = {
        action: "create",
        orderId: "test-order-123",
        type: "quality_issue",
        description: "Test dispute created from dev dashboard",
        evidence: ["Test evidence item"],
      };

      const result = await supabase.functions.invoke("dispute-resolution", {
        body: disputeData,
      });

      const duration = Date.now() - startTime;

      if (result.error) throw result.error;

      updateTestStatus(
        testId,
        "success",
        "Test dispute created successfully",
        duration,
        result.data,
      );
      toast.success("Dispute resolution test passed");
    } catch (error: any) {
      updateTestStatus(
        testId,
        "failed",
        `Dispute creation failed: ${error.message}`,
        Date.now() - startTime,
      );
      toast.error(`Dispute test failed: ${error.message}`);
    }
  };

  // Health Check for All Services
  const runHealthCheck = async () => {
    const services = [
      { name: "Study Resources", endpoint: "study-resources-api" },
      { name: "Real-time Notifications", endpoint: "realtime-notifications" },
      { name: "File Upload", endpoint: "file-upload" },
      { name: "Advanced Search", endpoint: "advanced-search" },
      { name: "Analytics", endpoint: "analytics-reporting" },
      { name: "Email Automation", endpoint: "email-automation" },
      { name: "Dispute Resolution", endpoint: "dispute-resolution" },
    ];

    setIsLoading(true);

    for (const service of services) {
      const testId = addTest(service.name, "Health Check");
      const startTime = Date.now();

      try {
        const result = await supabase.functions.invoke(service.endpoint, {
          body: { action: "health" },
        });

        const duration = Date.now() - startTime;

        if (result.error) throw result.error;

        updateTestStatus(
          testId,
          "success",
          "Service is healthy",
          duration,
          result.data,
        );
      } catch (error: any) {
        updateTestStatus(
          testId,
          "failed",
          `Service unavailable: ${error.message}`,
          Date.now() - startTime,
        );
      }
    }

    setIsLoading(false);
    toast.success("Health check completed for all services");
  };

  const getStatusIcon = (status: BackendTest["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: BackendTest["status"]) => {
    const colors = {
      pending: "text-gray-600 bg-gray-100",
      running: "text-blue-600 bg-blue-100",
      success: "text-green-600 bg-green-100",
      failed: "text-red-600 bg-red-100",
    };

    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Backend Testing Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-query">Search Query</Label>
              <Input
                id="search-query"
                placeholder="Enter search query"
                value={testData.searchQuery}
                onChange={(e) =>
                  setTestData((prev) => ({
                    ...prev,
                    searchQuery: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                placeholder="Enter university name"
                value={testData.university}
                onChange={(e) =>
                  setTestData((prev) => ({
                    ...prev,
                    university: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">Course Code</Label>
              <Input
                id="course"
                placeholder="Enter course code"
                value={testData.course}
                onChange={(e) =>
                  setTestData((prev) => ({ ...prev, course: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-period">Report Period</Label>
              <Select
                value={testData.reportPeriod}
                onValueChange={(value) =>
                  setTestData((prev) => ({ ...prev, reportPeriod: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-message">Notification Message</Label>
            <Textarea
              id="notification-message"
              placeholder="Enter notification message"
              value={testData.notificationMessage}
              onChange={(e) =>
                setTestData((prev) => ({
                  ...prev,
                  notificationMessage: e.target.value,
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Individual Service Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4" />
              Study Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={testStudyResourcesSearch}
              disabled={isLoading}
              size="sm"
              className="w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              Test Search
            </Button>
            <Button
              onClick={testCreateStudyResource}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="w-full"
            >
              Test Create
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Search className="h-4 w-4" />
              Advanced Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={testAdvancedSearch}
              disabled={isLoading}
              size="sm"
              className="w-full"
            >
              Test Full-text Search
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Upload className="h-4 w-4" />
              File Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={testFileUpload}
              disabled={isLoading}
              size="sm"
              className="w-full"
            >
              Test Upload
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={testRealTimeNotification}
              disabled={isLoading}
              size="sm"
              className="w-full"
            >
              Test Real-time
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={testAnalytics}
              disabled={isLoading}
              size="sm"
              className="w-full"
            >
              Test Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Gavel className="h-4 w-4" />
              Disputes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={testDisputeResolution}
              disabled={isLoading}
              size="sm"
              className="w-full"
            >
              Test Creation
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              Email Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => {
                // This will scroll to the email tester section below
                const emailSection = document.getElementById(
                  "email-tester-section",
                );
                if (emailSection) {
                  emailSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
              disabled={isLoading}
              size="sm"
              className="w-full"
            >
              Test Email System
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Testing Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={runHealthCheck}
              disabled={isLoading}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Full Health Check
            </Button>
            <Button onClick={() => setTests([])} variant="outline">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Backend Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <Alert>
              <AlertDescription>
                No backend tests run yet. Use the controls above to test backend
                services.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="font-medium">
                        {test.service} - {test.operation}
                      </div>
                      <div className="text-sm text-gray-600">
                        {test.message}
                      </div>
                      {test.duration && (
                        <div className="text-xs text-gray-500">
                          Duration: {test.duration}ms
                        </div>
                      )}
                      {test.details && (
                        <details className="text-xs text-gray-500 mt-1">
                          <summary className="cursor-pointer">
                            View Response
                          </summary>
                          <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32">
                            {JSON.stringify(test.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(test.status)}
                    <div className="text-xs text-gray-500">
                      {new Date(test.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Service Testing */}
      <div id="email-tester-section">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Service Testing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmailTester />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComprehensiveBackendTester;
