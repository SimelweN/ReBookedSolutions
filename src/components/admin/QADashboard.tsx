import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Settings,
  CreditCard,
  Clock,
  Info,
  Terminal,
  Package,
  TestTube,
  Bug,
  Monitor,
  Database,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import DemoKeysService, {
  DemoKeyValidationResult,
} from "@/services/demoKeysService";
import CommitSystemService from "@/services/commitSystemService";

const QADashboard: React.FC = () => {
  const [activeTests, setActiveTests] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<any>({});
  const [validationResult, setValidationResult] =
    useState<DemoKeyValidationResult | null>(null);

  const setTestActive = (testName: string, active: boolean) => {
    setActiveTests((prev) => {
      const newSet = new Set(prev);
      if (active) {
        newSet.add(testName);
      } else {
        newSet.delete(testName);
      }
      return newSet;
    });
  };

  const runValidation = () => {
    setTestActive("validation", true);

    try {
      const result = DemoKeysService.validateDemoKeys();
      setValidationResult(result);

      if (result.isValid) {
        toast.success("Demo keys validation passed!");
      } else {
        toast.error("Demo keys validation failed");
      }
    } catch (error) {
      toast.error("Validation error: " + error);
    } finally {
      setTestActive("validation", false);
    }
  };

  const setupDemoEnvironment = () => {
    const result = DemoKeysService.setupDemoEnvironment();

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const createDemoOrder = async () => {
    setTestActive("createOrder", true);

    try {
      toast.info("Creating demo order for commit testing...");

      const { supabase } = await import("@/integrations/supabase/client");

      // Get current user to use as buyer
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to create a demo order");
        return;
      }

      // Create a demo order with current user as seller for testing
      // In a real scenario, this would be a different user, but for testing
      // we use the same user so they can see the commit functionality
      const demoSellerId = user.id;
      const commitDeadline = new Date();
      commitDeadline.setHours(commitDeadline.getHours() + 48);

      const demoOrder = {
        buyer_email: user.email,
        buyer_id: user.id,
        seller_id: demoSellerId,
        amount: 15000, // R150.00 in kobo
        status: "paid",
        paystack_ref: `demo_${Date.now()}`,
        commit_deadline: commitDeadline.toISOString(),
        paid_at: new Date().toISOString(),
        items: [
          {
            book_id: "demo-book-1",
            title: "Demo Textbook: Introduction to QA Testing",
            author: "Dr. QA Tester",
            price: 150.0,
            condition: "Good",
            seller_id: demoSellerId,
          },
        ],
        metadata: {
          demo_order: true,
          created_by: "qa_dashboard",
          test_type: "commit_system",
        },
      };

      const { data, error } = await supabase
        .from("orders")
        .insert(demoOrder)
        .select()
        .single();

      if (error) {
        console.error("Demo order creation error:", error);

        let errorMessage = "Failed to create demo order";
        if (error.message) {
          errorMessage = error.message;
        } else if (error.details) {
          errorMessage = error.details;
        } else if (typeof error === "string") {
          errorMessage = error;
        }

        toast.error(errorMessage);

        setTestResults((prev) => ({
          ...prev,
          demoOrder: {
            success: false,
            error: errorMessage,
            created_at: new Date().toISOString(),
          },
        }));

        return;
      }

      console.log("✅ Demo order created:", data);

      // Try to create a notification for testing
      try {
        const { error: notificationError } = await supabase
          .from("order_notifications")
          .insert({
            order_id: data.id,
            user_id: demoSellerId,
            type: "commit_required",
            title: "QA Test: Payment Received - Commit Required",
            message: `QA test payment received for order #${data.id.slice(0, 8)}. You have 48 hours to commit to this sale.`,
            read: false,
          });

        if (notificationError) {
          console.warn("Demo notification creation failed:", notificationError);
        } else {
          console.log("✅ Demo notification created");
        }
      } catch (notifError) {
        console.warn("Demo notification error:", notifError);
      }

      toast.success(`Demo order created! Order ID: ${data.id.slice(0, 8)}`);

      setTestResults((prev) => ({
        ...prev,
        demoOrder: {
          success: true,
          data: data,
          created_at: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error("Demo order creation error:", error);
      toast.error("Demo order creation error: " + error);

      setTestResults((prev) => ({
        ...prev,
        demoOrder: {
          success: false,
          error: error.toString(),
          created_at: new Date().toISOString(),
        },
      }));
    } finally {
      setTestActive("createOrder", false);
    }
  };

  const testCommitFunctionality = async () => {
    setTestActive("testCommit", true);

    try {
      toast.info("Testing commit functionality...");

      const result = await DemoKeysService.testCommitFunctionality();

      if (result.success) {
        toast.success("Commit functionality test passed!");
        console.log("Demo order created:", result.demoOrder);

        setTestResults((prev) => ({
          ...prev,
          commitTest: {
            success: true,
            message: result.message,
            demoOrder: result.demoOrder,
            created_at: new Date().toISOString(),
          },
        }));
      } else {
        toast.error("Commit test failed: " + result.message);

        setTestResults((prev) => ({
          ...prev,
          commitTest: {
            success: false,
            error: result.message,
            created_at: new Date().toISOString(),
          },
        }));
      }
    } catch (error) {
      toast.error("Commit test error: " + error);

      setTestResults((prev) => ({
        ...prev,
        commitTest: {
          success: false,
          error: error.toString(),
          created_at: new Date().toISOString(),
        },
      }));
    } finally {
      setTestActive("testCommit", false);
    }
  };

  const testAutoExpire = async () => {
    setTestActive("autoExpire", true);

    try {
      toast.info("Testing auto-expire functionality...");

      const result = await CommitSystemService.triggerAutoExpire();

      if (result.success) {
        toast.success(result.message);

        setTestResults((prev) => ({
          ...prev,
          autoExpire: {
            success: true,
            message: result.message,
            created_at: new Date().toISOString(),
          },
        }));
      } else {
        toast.error(result.message);

        setTestResults((prev) => ({
          ...prev,
          autoExpire: {
            success: false,
            error: result.message,
            created_at: new Date().toISOString(),
          },
        }));
      }
    } catch (error) {
      toast.error("Auto-expire test error: " + error);

      setTestResults((prev) => ({
        ...prev,
        autoExpire: {
          success: false,
          error: error.toString(),
          created_at: new Date().toISOString(),
        },
      }));
    } finally {
      setTestActive("autoExpire", false);
    }
  };

  const runComprehensiveTest = async () => {
    setTestActive("comprehensive", true);

    try {
      toast.info("Running comprehensive demo test...");

      const results = await DemoKeysService.runComprehensiveDemoTest();
      setTestResults((prev) => ({
        ...prev,
        comprehensive: results,
      }));

      if (results.success) {
        toast.success("All demo tests passed!");
      } else {
        toast.warning("Some demo tests failed - check results below");
      }
    } catch (error) {
      toast.error("Comprehensive test failed: " + error);
      console.error("Comprehensive test error:", error);

      setTestResults((prev) => ({
        ...prev,
        comprehensive: {
          success: false,
          error: error.toString(),
          created_at: new Date().toISOString(),
        },
      }));
    } finally {
      setTestActive("comprehensive", false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            QA Testing Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Comprehensive testing suite for the 48-hour commit system, demo
            keys, payment flow, and system validation.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="commit-system" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="commit-system">Commit System</TabsTrigger>
          <TabsTrigger value="demo-keys">Demo Keys</TabsTrigger>
          <TabsTrigger value="system-tests">System Tests</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        {/* Commit System Testing */}
        <TabsContent value="commit-system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                48-Hour Commit System Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={createDemoOrder}
                  disabled={activeTests.has("createOrder")}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  {activeTests.has("createOrder") ? (
                    <RefreshCw className="h-6 w-6 animate-spin mb-2" />
                  ) : (
                    <Package className="h-6 w-6 mb-2" />
                  )}
                  <span className="text-sm">Create Demo Order</span>
                  <span className="text-xs text-gray-500">
                    Creates order with 48h deadline
                  </span>
                </Button>

                <Button
                  onClick={testCommitFunctionality}
                  disabled={activeTests.has("testCommit")}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                >
                  {activeTests.has("testCommit") ? (
                    <RefreshCw className="h-6 w-6 animate-spin mb-2" />
                  ) : (
                    <CheckCircle className="h-6 w-6 mb-2" />
                  )}
                  <span className="text-sm">Test Commit Flow</span>
                  <span className="text-xs text-gray-500">
                    Tests commit functionality
                  </span>
                </Button>

                <Button
                  onClick={testAutoExpire}
                  disabled={activeTests.has("autoExpire")}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                >
                  {activeTests.has("autoExpire") ? (
                    <RefreshCw className="h-6 w-6 animate-spin mb-2" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 mb-2" />
                  )}
                  <span className="text-sm">Test Auto-Expire</span>
                  <span className="text-xs text-gray-500">
                    Triggers expiry process
                  </span>
                </Button>

                <Button
                  onClick={runComprehensiveTest}
                  disabled={activeTests.has("comprehensive")}
                  className="h-20 flex flex-col items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {activeTests.has("comprehensive") ? (
                    <RefreshCw className="h-6 w-6 animate-spin mb-2" />
                  ) : (
                    <Play className="h-6 w-6 mb-2" />
                  )}
                  <span className="text-sm">Run Full Test Suite</span>
                  <span className="text-xs text-gray-200">
                    Tests entire system
                  </span>
                </Button>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Testing Flow:</strong> Create a demo order → Check
                  notifications → Go to Profile → Activity to see pending
                  commits → Test commit functionality.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demo Keys Testing */}
        <TabsContent value="demo-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Demo Keys Validation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={runValidation}
                  disabled={activeTests.has("validation")}
                  variant="outline"
                  size="sm"
                >
                  {activeTests.has("validation") ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Settings className="h-4 w-4 mr-2" />
                  )}
                  Validate Keys
                </Button>

                <Button
                  onClick={setupDemoEnvironment}
                  variant="outline"
                  size="sm"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Show Demo .env
                </Button>
              </div>

              {/* Validation Results */}
              {validationResult && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      {validationResult.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      Validation Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          validationResult.isValid ? "default" : "destructive"
                        }
                      >
                        {validationResult.isValid ? "Valid" : "Invalid"}
                      </Badge>

                      {validationResult.usingDemoKeys && (
                        <Badge variant="secondary">Using Demo Keys</Badge>
                      )}
                    </div>

                    {validationResult.issues.length > 0 && (
                      <Alert>
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Issues:</strong>
                          <ul className="mt-2 list-disc list-inside text-sm">
                            {validationResult.issues.map((issue, index) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {validationResult.warnings.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Warnings:</strong>
                          <ul className="mt-2 list-disc list-inside text-sm">
                            {validationResult.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tests */}
        <TabsContent value="system-tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                System Health & Integration Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>System health checks and integration tests</p>
                <p className="text-sm mt-2">Coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Results */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Test Results & Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(testResults).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Terminal className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No test results yet</p>
                  <p className="text-sm mt-2">
                    Run some tests to see results here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(testResults).map(
                    ([testName, result]: [string, any]) => (
                      <Card key={testName} className="bg-gray-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            {result.success ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            {testName} Test
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="text-xs bg-white p-3 rounded border overflow-auto">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QADashboard;
