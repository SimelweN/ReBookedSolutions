import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TestTube,
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Settings,
  Activity,
  Zap,
  Shield,
  Database,
  Code,
  Bell,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import {
  functionFallback,
  FunctionResponse,
  getFunctionFallback,
} from "@/services/functionFallbackService";

interface TestResult {
  functionName: string;
  success: boolean;
  duration: number;
  fallbackUsed?: boolean;
  error?: string;
  data?: any;
  timestamp: string;
}

interface FunctionTestConfig {
  name: string;
  displayName: string;
  category:
    | "payment"
    | "delivery"
    | "email"
    | "upload"
    | "search"
    | "tracking"
    | "notifications"
    | "orders"
    | "automation";
  testPayload: any;
  description: string;
}

const FUNCTION_TESTS: FunctionTestConfig[] = [
  // Payment functions
  {
    name: "initialize-paystack-payment",
    displayName: "Initialize Payment",
    category: "payment",
    description: "Test payment initialization",
    testPayload: {
      amount: 10000,
      email: "test@example.com",
      reference: `test_${Date.now()}`,
    },
  },
  {
    name: "verify-paystack-payment",
    displayName: "Verify Payment",
    category: "payment",
    description: "Test payment verification",
    testPayload: {
      reference: "test_reference_123",
    },
  },

  // Delivery functions
  {
    name: "get-delivery-quotes",
    displayName: "Get Delivery Quotes",
    category: "delivery",
    description: "Test delivery quote generation",
    testPayload: {
      pickup_address: {
        city: "Cape Town",
        province: "Western Cape",
        postal_code: "8001",
      },
      delivery_address: {
        city: "Johannesburg",
        province: "Gauteng",
        postal_code: "2000",
      },
      weight: 1.5,
    },
  },
  {
    name: "courier-guy-quote",
    displayName: "Courier Guy Quote",
    category: "delivery",
    description: "Test Courier Guy quote API",
    testPayload: {
      fromAddress: {
        streetAddress: "123 Test Street",
        suburb: "City Bowl",
        city: "Cape Town",
        province: "Western Cape",
        postalCode: "8001",
      },
      toAddress: {
        streetAddress: "456 Test Avenue",
        suburb: "Berea",
        city: "Durban",
        province: "KwaZulu-Natal",
        postalCode: "4001",
      },
      parcel: {
        length: 25,
        width: 20,
        height: 10,
        weight: 2.0,
      },
    },
  },
  {
    name: "fastway-quote",
    displayName: "Fastway Quote",
    category: "delivery",
    description: "Test Fastway quote API",
    testPayload: {
      fromAddress: {
        streetAddress: "123 Test Street",
        suburb: "City Center",
        city: "Pretoria",
        province: "Gauteng",
        postalCode: "0001",
      },
      toAddress: {
        streetAddress: "456 Test Avenue",
        suburb: "Downtown",
        city: "Port Elizabeth",
        province: "Eastern Cape",
        postalCode: "6001",
      },
      parcel: {
        length: 20,
        width: 15,
        height: 5,
        weight: 1.0,
      },
    },
  },

  // Email functions
  {
    name: "send-email-notification",
    displayName: "Send Email",
    category: "email",
    description: "Test email notification sending",
    testPayload: {
      to: "test@example.com",
      subject: "Test Email from Function Tester",
      template: "welcome",
      data: { name: "Test User", message: "Test email from function tester" },
    },
  },
  {
    name: "email-automation",
    displayName: "Email Automation",
    category: "email",
    description: "Test automated email workflows",
    testPayload: {
      trigger: "test",
      user_id: "test-user",
    },
  },

  // Upload functions
  {
    name: "file-upload",
    displayName: "File Upload",
    category: "upload",
    description:
      "Test file upload functionality (requires FormData - not testable via JSON)",
    testPayload: {
      error:
        "This function requires FormData with a file and cannot be tested with JSON payload",
    },
  },

  // Search functions
  {
    name: "advanced-search",
    displayName: "Advanced Search",
    category: "search",
    description: "Test advanced search capabilities",
    testPayload: {
      query: "mathematics",
      filters: { price_max: 500 },
    },
  },
  {
    name: "study-resources-api",
    displayName: "Study Resources",
    category: "search",
    description: "Test study resources API",
    testPayload: {
      action: "get_resources",
      limit: 10,
    },
  },

  // Tracking functions
  {
    name: "courier-guy-track",
    displayName: "Courier Guy Tracking",
    category: "tracking",
    description: "Test Courier Guy tracking",
    testPayload: {
      tracking_number: "CG12345678",
    },
  },
  {
    name: "fastway-track",
    displayName: "Fastway Tracking",
    category: "tracking",
    description: "Test Fastway tracking",
    testPayload: {
      tracking_number: "FW12345678",
    },
  },

  // Shipment functions
  {
    name: "courier-guy-shipment",
    displayName: "Courier Guy Shipment",
    category: "delivery",
    description: "Test Courier Guy shipment creation",
    testPayload: {
      pickup_address: { city: "Cape Town", province: "Western Cape" },
      delivery_address: { city: "Johannesburg", province: "Gauteng" },
      rate: 85,
      weight: 1.5,
    },
  },
  {
    name: "fastway-shipment",
    displayName: "Fastway Shipment",
    category: "delivery",
    description: "Test Fastway shipment creation",
    testPayload: {
      pickup_address: { city: "Durban", province: "KwaZulu-Natal" },
      delivery_address: { city: "Cape Town", province: "Western Cape" },
      rate: 75,
      weight: 2.0,
    },
  },

  // Notification functions
  {
    name: "realtime-notifications",
    displayName: "Real-time Notifications",
    category: "notifications",
    description: "Test notification system",
    testPayload: {
      action: "create",
      user_id: "test-user",
      title: "Test Notification",
      message: "This is a test notification from fallback system",
      type: "info",
    },
  },

  // Order management
  {
    name: "mark-collected",
    displayName: "Mark Collected",
    category: "orders",
    description: "Test marking order as collected",
    testPayload: {
      order_id: "order_123",
      tracking_number: "TRK123456789",
    },
  },
  {
    name: "dispute-resolution",
    displayName: "Dispute Resolution",
    category: "orders",
    description: "Test dispute creation and handling",
    testPayload: {
      action: "create",
      order_id: "order_123",
      user_id: "user_123",
      type: "item_not_received",
      description: "Test dispute for fallback system",
    },
  },

  // Automation functions
  {
    name: "email-automation",
    displayName: "Email Automation",
    category: "automation",
    description: "Test automated email workflows",
    testPayload: {
      trigger: "order_status_change",
      user_id: "test-user",
      order_id: "order_123",
    },
  },
  {
    name: "analytics-reporting",
    displayName: "Analytics Reporting",
    category: "automation",
    description: "Test analytics data collection",
    testPayload: {
      report_type: "daily_summary",
      date_range: "7d",
    },
  },
];

const FunctionTester = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<string>("");
  const [customPayload, setCustomPayload] = useState<string>("{}");
  const [isRunningTest, setIsRunningTest] = useState<string>("");
  const [isRunningBatch, setIsRunningBatch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [functionStats, setFunctionStats] = useState<any>({});

  useEffect(() => {
    loadFunctionStats();
  }, []);

  const loadFunctionStats = () => {
    try {
      const stats = getFunctionFallback().getFunctionStats();
      setFunctionStats(stats);
    } catch (error) {
      console.warn("Could not load function stats:", error);
      setFunctionStats({});
    }
  };

  const runSingleTest = async (functionName: string, payload?: any) => {
    setIsRunningTest(functionName);

    try {
      const testConfig = FUNCTION_TESTS.find((t) => t.name === functionName);
      const testPayload = payload || testConfig?.testPayload || {};

      const result = await functionFallback(functionName, testPayload);

      const testResult: TestResult = {
        functionName,
        success: result.success,
        duration: result.duration || 0,
        fallbackUsed: result.fallbackUsed,
        error: result.error,
        data: result.data,
        timestamp: new Date().toISOString(),
      };

      setTestResults((prev) => [testResult, ...prev.slice(0, 49)]); // Keep last 50 results

      if (result.success) {
        toast.success(
          `✅ ${functionName} ${result.fallbackUsed ? "(fallback)" : "passed"}`,
        );
      } else {
        toast.error(`❌ ${functionName} failed`);
      }

      loadFunctionStats();
    } catch (error) {
      console.error("Test error:", error);
      toast.error(
        `Test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsRunningTest("");
    }
  };

  const runCustomTest = async () => {
    if (!selectedFunction) {
      toast.error("Please select a function to test");
      return;
    }

    try {
      const payload = JSON.parse(customPayload);
      await runSingleTest(selectedFunction, payload);
    } catch (error) {
      toast.error("Invalid JSON payload");
    }
  };

  const runBatchTest = async () => {
    setIsRunningBatch(true);

    const functionsToTest =
      selectedCategory === "all"
        ? FUNCTION_TESTS
        : FUNCTION_TESTS.filter((f) => f.category === selectedCategory);

    for (const testConfig of functionsToTest) {
      await runSingleTest(testConfig.name);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay between tests
    }

    setIsRunningBatch(false);
    toast.success(
      `Batch test completed for ${functionsToTest.length} functions`,
    );
  };

  const clearResults = () => {
    setTestResults([]);
    // Reset stats - since resetStats might not be available, just clear local state
    setFunctionStats({});
    loadFunctionStats(); // Reload fresh stats
    toast.info("Test results cleared");
  };

  const categoryStats = React.useMemo(() => {
    const categories = [
      "payment",
      "delivery",
      "email",
      "upload",
      "search",
      "tracking",
      "notifications",
      "orders",
      "automation",
    ];
    return categories.map((category) => {
      const categoryFunctions = FUNCTION_TESTS.filter(
        (f) => f.category === category,
      );
      const categoryResults = testResults.filter((r) =>
        categoryFunctions.some((f) => f.name === r.functionName),
      );

      const passed = categoryResults.filter((r) => r.success).length;
      const failed = categoryResults.filter((r) => !r.success).length;
      const fallbacks = categoryResults.filter((r) => r.fallbackUsed).length;

      return {
        category,
        total: categoryFunctions.length,
        tested: categoryResults.length,
        passed,
        failed,
        fallbacks,
        avgDuration:
          categoryResults.length > 0
            ? Math.round(
                categoryResults.reduce((sum, r) => sum + r.duration, 0) /
                  categoryResults.length,
              )
            : 0,
      };
    });
  }, [testResults]);

  const getStatusIcon = (result: TestResult) => {
    if (result.success && !result.fallbackUsed) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (result.success && result.fallbackUsed) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "payment":
        return <Shield className="h-4 w-4" />;
      case "delivery":
        return <TrendingUp className="h-4 w-4" />;
      case "email":
        return <Activity className="h-4 w-4" />;
      case "upload":
        return <Database className="h-4 w-4" />;
      case "search":
        return <Zap className="h-4 w-4" />;
      case "tracking":
        return <Code className="h-4 w-4" />;
      case "notifications":
        return <Bell className="h-4 w-4" />;
      case "orders":
        return <ShoppingCart className="h-4 w-4" />;
      case "automation":
        return <Settings className="h-4 w-4" />;
      default:
        return <TestTube className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5 text-blue-600" />
            <span>Function Testing & Fallback Monitor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="individual">Individual Tests</TabsTrigger>
              <TabsTrigger value="batch">Batch Testing</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryStats.map((stats) => (
                  <Card key={stats.category} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(stats.category)}
                          <span className="font-medium capitalize">
                            {stats.category}
                          </span>
                        </div>
                        <Badge variant="outline">{stats.total} functions</Badge>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Tested:</span>
                          <span>
                            {stats.tested}/{stats.total}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600">Passed:</span>
                          <span>{stats.passed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-600">Failed:</span>
                          <span>{stats.failed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-600">Fallbacks:</span>
                          <span>{stats.fallbacks}</span>
                        </div>
                        {stats.avgDuration > 0 && (
                          <div className="flex justify-between">
                            <span>Avg Duration:</span>
                            <span>{stats.avgDuration}ms</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="individual" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {FUNCTION_TESTS.map((testConfig) => (
                  <Card key={testConfig.name} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {testConfig.displayName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {testConfig.name}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {testConfig.category}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {testConfig.description}
                      </p>

                      <Button
                        size="sm"
                        onClick={() => runSingleTest(testConfig.name)}
                        disabled={
                          isRunningTest === testConfig.name || isRunningBatch
                        }
                        className="w-full"
                      >
                        {isRunningTest === testConfig.name ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Test Function
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="function-select">Select Function</Label>
                    <Select
                      value={selectedFunction}
                      onValueChange={setSelectedFunction}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a function to test" />
                      </SelectTrigger>
                      <SelectContent>
                        {FUNCTION_TESTS.map((test) => (
                          <SelectItem key={test.name} value={test.name}>
                            {test.displayName} ({test.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="custom-payload">
                      Custom Payload (JSON)
                    </Label>
                    <Textarea
                      id="custom-payload"
                      value={customPayload}
                      onChange={(e) => setCustomPayload(e.target.value)}
                      placeholder='{"key": "value"}'
                      rows={4}
                    />
                  </div>

                  <Button onClick={runCustomTest} disabled={!selectedFunction}>
                    <Play className="h-4 w-4 mr-2" />
                    Run Custom Test
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="batch" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Batch Testing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="category-select">Category</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Functions</SelectItem>
                        <SelectItem value="payment">
                          Payment Functions
                        </SelectItem>
                        <SelectItem value="delivery">
                          Delivery Functions
                        </SelectItem>
                        <SelectItem value="email">Email Functions</SelectItem>
                        <SelectItem value="upload">Upload Functions</SelectItem>
                        <SelectItem value="search">Search Functions</SelectItem>
                        <SelectItem value="tracking">
                          Tracking Functions
                        </SelectItem>
                        <SelectItem value="notifications">
                          Notification Functions
                        </SelectItem>
                        <SelectItem value="orders">Order Management</SelectItem>
                        <SelectItem value="automation">
                          Automation Functions
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={runBatchTest}
                      disabled={isRunningBatch}
                      className="flex-1"
                    >
                      {isRunningBatch ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Run Batch Test
                    </Button>

                    <Button variant="outline" onClick={clearResults}>
                      Clear Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Test Results ({testResults.length})</span>
                    <Button variant="outline" size="sm" onClick={clearResults}>
                      Clear All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {testResults.length === 0 ? (
                    <div className="text-center py-8">
                      <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No test results yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {testResults.map((result, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(result)}
                            <div>
                              <p className="font-medium">
                                {result.functionName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  result.timestamp,
                                ).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className="flex items-center space-x-1"
                            >
                              <Clock className="h-3 w-3" />
                              <span>{result.duration}ms</span>
                            </Badge>

                            {result.fallbackUsed && (
                              <Badge variant="secondary">Fallback</Badge>
                            )}

                            {result.error && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    Error
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Error Details</DialogTitle>
                                    <DialogDescription>
                                      Full error information for debugging
                                      purposes
                                    </DialogDescription>
                                  </DialogHeader>
                                  <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                                    {result.error}
                                  </pre>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Function Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(functionStats).length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No function statistics yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(functionStats).map(
                        ([functionName, stats]: [string, any]) => (
                          <div
                            key={functionName}
                            className="p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">{functionName}</h3>
                              <Badge
                                variant={
                                  stats.failures > 0 ? "destructive" : "default"
                                }
                              >
                                {stats.failures > 0
                                  ? `${stats.failures} failures`
                                  : "Healthy"}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">
                                  Total Calls:
                                </span>
                                <span className="ml-2 font-medium">
                                  {stats.totalCalls}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Failures:</span>
                                <span className="ml-2 font-medium">
                                  {stats.failures}
                                </span>
                              </div>
                              {stats.lastFailure && (
                                <div className="col-span-2">
                                  <span className="text-gray-600">
                                    Last Failure:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {new Date(
                                      stats.lastFailure,
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionTester;
