import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, AlertTriangle, Database } from "lucide-react";

interface TestResult {
  name: string;
  status: "PASSED" | "FAILED" | "RUNNING";
  message: string;
  error?: string;
}

const MigrationVerify: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [autoRan, setAutoRan] = useState(false);

  // Auto-run tests on page load
  useEffect(() => {
    if (!autoRan) {
      setAutoRan(true);
      setTimeout(() => runVerification(), 1000);
    }
  }, [autoRan]);

  const runVerification = async () => {
    setIsRunning(true);
    setTestResults([]);

    const results: TestResult[] = [];

    // Test 1: Orders table schema
    try {
      results.push({
        name: "Orders Table Schema",
        status: "RUNNING",
        message: "Checking...",
      });
      setTestResults([...results]);

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, buyer_id, book_id, delivery_option, payment_status, commit_deadline, paystack_reference",
        )
        .limit(1);

      if (error) throw error;

      results[results.length - 1] = {
        name: "Orders Table Schema",
        status: "PASSED",
        message:
          "Enhanced schema with buyer_id, book_id, payment_status detected",
      };
      setTestResults([...results]);
    } catch (error) {
      results[results.length - 1] = {
        name: "Orders Table Schema",
        status: "FAILED",
        message: "Missing enhanced schema fields",
        error: error.message,
      };
      setTestResults([...results]);
    }

    // Test 2: Order Notifications Table
    try {
      results.push({
        name: "Order Notifications Table",
        status: "RUNNING",
        message: "Checking...",
      });
      setTestResults([...results]);

      const { error } = await supabase
        .from("order_notifications")
        .select("id")
        .limit(1);

      if (error) throw error;

      results[results.length - 1] = {
        name: "Order Notifications Table",
        status: "PASSED",
        message: "Table exists and accessible",
      };
      setTestResults([...results]);
    } catch (error) {
      results[results.length - 1] = {
        name: "Order Notifications Table",
        status: "FAILED",
        message: "Table missing or inaccessible",
        error: error.message,
      };
      setTestResults([...results]);
    }

    // Test 3: Receipts Table
    try {
      results.push({
        name: "Receipts Table",
        status: "RUNNING",
        message: "Checking...",
      });
      setTestResults([...results]);

      const { error } = await supabase.from("receipts").select("id").limit(1);

      if (error) throw error;

      results[results.length - 1] = {
        name: "Receipts Table",
        status: "PASSED",
        message: "Table exists and accessible",
      };
      setTestResults([...results]);
    } catch (error) {
      results[results.length - 1] = {
        name: "Receipts Table",
        status: "FAILED",
        message: "Table missing or inaccessible",
        error: error.message,
      };
      setTestResults([...results]);
    }

    // Test 4: Receipt Number Function
    try {
      results.push({
        name: "Receipt Number Function",
        status: "RUNNING",
        message: "Testing...",
      });
      setTestResults([...results]);

      const { data, error } = await supabase.rpc("generate_receipt_number");

      if (error) throw error;

      if (typeof data === "string" && data.startsWith("RCP-")) {
        results[results.length - 1] = {
          name: "Receipt Number Function",
          status: "PASSED",
          message: `Generated: ${data}`,
        };
      } else {
        throw new Error("Invalid receipt number format");
      }
      setTestResults([...results]);
    } catch (error) {
      results[results.length - 1] = {
        name: "Receipt Number Function",
        status: "FAILED",
        message: "Function missing or failed",
        error: error.message,
      };
      setTestResults([...results]);
    }

    // Test 5: Auto Cancel Function
    try {
      results.push({
        name: "Auto Cancel Function",
        status: "RUNNING",
        message: "Testing...",
      });
      setTestResults([...results]);

      const { error } = await supabase.rpc("auto_cancel_expired_orders");

      if (error) throw error;

      results[results.length - 1] = {
        name: "Auto Cancel Function",
        status: "PASSED",
        message: "Function executed successfully",
      };
      setTestResults([...results]);
    } catch (error) {
      results[results.length - 1] = {
        name: "Auto Cancel Function",
        status: "FAILED",
        message: "Function missing or failed",
        error: error.message,
      };
      setTestResults([...results]);
    }

    // Test 6: Send Reminders Function
    try {
      results.push({
        name: "Send Reminders Function",
        status: "RUNNING",
        message: "Testing...",
      });
      setTestResults([...results]);

      const { error } = await supabase.rpc("send_commit_reminders");

      if (error) throw error;

      results[results.length - 1] = {
        name: "Send Reminders Function",
        status: "PASSED",
        message: "Function executed successfully",
      };
      setTestResults([...results]);
    } catch (error) {
      results[results.length - 1] = {
        name: "Send Reminders Function",
        status: "FAILED",
        message: "Function missing or failed",
        error: error.message,
      };
      setTestResults([...results]);
    }

    // Test 7: Create Notification Function
    try {
      results.push({
        name: "Create Notification Function",
        status: "RUNNING",
        message: "Testing...",
      });
      setTestResults([...results]);

      const { data, error } = await supabase.rpc("create_order_notification", {
        p_order_id: "00000000-0000-0000-0000-000000000000",
        p_user_id: "00000000-0000-0000-0000-000000000000",
        p_type: "test_migration",
        p_title: "Migration Test",
        p_message: "Testing notification system",
      });

      if (error) throw error;

      results[results.length - 1] = {
        name: "Create Notification Function",
        status: "PASSED",
        message: `Notification created with ID: ${data}`,
      };
      setTestResults([...results]);
    } catch (error) {
      results[results.length - 1] = {
        name: "Create Notification Function",
        status: "FAILED",
        message: "Function missing or failed",
        error: error.message,
      };
      setTestResults([...results]);
    }

    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PASSED":
        return "bg-green-500 text-white";
      case "FAILED":
        return "bg-red-500 text-white";
      case "RUNNING":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASSED":
        return <CheckCircle className="w-4 h-4" />;
      case "FAILED":
        return <XCircle className="w-4 h-4" />;
      case "RUNNING":
        return <AlertTriangle className="w-4 h-4 animate-pulse" />;
      default:
        return null;
    }
  };

  const passed = testResults.filter((r) => r.status === "PASSED").length;
  const failed = testResults.filter((r) => r.status === "FAILED").length;
  const running = testResults.filter((r) => r.status === "RUNNING").length;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Database className="w-8 h-8" />
          Migration Verification
        </h1>
        <p className="text-muted-foreground">
          Verifying that your enhanced order management system migration was
          successful.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enhanced Order System Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={runVerification}
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? "Running Verification..." : "Re-run Verification"}
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex gap-4 text-sm bg-muted p-3 rounded-lg">
                <span>Total: {testResults.length}</span>
                <span className="text-green-600">Passed: {passed}</span>
                <span className="text-red-600">Failed: {failed}</span>
                {running > 0 && (
                  <span className="text-blue-600">Running: {running}</span>
                )}
                {!isRunning && (
                  <span>
                    Success Rate:{" "}
                    {Math.round((passed / testResults.length) * 100)}%
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(result.status)}>
                        {getStatusIcon(result.status)} {result.status}
                      </Badge>
                      <span className="font-medium">{result.name}</span>
                    </div>

                    <span className="text-sm text-muted-foreground">
                      {result.message}
                    </span>
                  </div>
                ))}
              </div>

              {!isRunning && failed === 0 && passed > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                    🎉 Migration Successful!
                  </h4>
                  <p className="text-sm text-green-700">
                    All enhanced order management system components are working
                    correctly.
                  </p>
                  <div className="mt-3 text-sm text-green-700">
                    <strong>Next steps:</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Deploy the Edge Function for automated processing</li>
                      <li>Set up cron job for hourly order reminders</li>
                      <li>Update order components to use enhanced service</li>
                    </ul>
                  </div>
                </div>
              )}

              {!isRunning && failed > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">
                    Issues Found
                  </h4>
                  <div className="space-y-1">
                    {testResults
                      .filter((r) => r.status === "FAILED")
                      .map((result, index) => (
                        <div key={index} className="text-sm text-red-700">
                          <strong>{result.name}:</strong>{" "}
                          {result.error || result.message}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground border-t pt-4">
            This verification checks: database tables, functions, and enhanced
            order system components.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MigrationVerify;
