import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface TestResult {
  name: string;
  status: "PASSED" | "FAILED" | "WARNING";
  message: string;
  error?: string;
}

const OrderSystemTests: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runBasicTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const results: TestResult[] = [];

    // Test 1: Database Connection
    try {
      const { error } = await supabase.from("orders").select("count").limit(1);
      if (error) throw error;
      results.push({
        name: "Database Connection",
        status: "PASSED",
        message: "Successfully connected to Supabase",
      });
    } catch (error) {
      results.push({
        name: "Database Connection",
        status: "FAILED",
        message: "Failed to connect to database",
        error: error.message,
      });
    }

    // Test 2: Orders Table Schema
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, buyer_id, seller_id, book_id, status, payment_status")
        .limit(1);

      if (error) throw error;

      // Check if new schema fields exist
      const hasEnhancedSchema =
        data.length === 0 ||
        ("buyer_id" in (data[0] || {}) &&
          "book_id" in (data[0] || {}) &&
          "payment_status" in (data[0] || {}));

      if (hasEnhancedSchema) {
        results.push({
          name: "Enhanced Orders Schema",
          status: "PASSED",
          message:
            "Orders table has enhanced schema with buyer_id, book_id, payment_status",
        });
      } else {
        results.push({
          name: "Enhanced Orders Schema",
          status: "FAILED",
          message:
            "Orders table missing enhanced schema fields - migration needed",
        });
      }
    } catch (error) {
      results.push({
        name: "Enhanced Orders Schema",
        status: "FAILED",
        message: "Error checking orders table schema",
        error: error.message,
      });
    }

    // Test 3: Order Notifications Table
    try {
      const { error } = await supabase
        .from("order_notifications")
        .select("id")
        .limit(1);

      if (error) throw error;
      results.push({
        name: "Order Notifications Table",
        status: "PASSED",
        message: "Order notifications table exists and accessible",
      });
    } catch (error) {
      results.push({
        name: "Order Notifications Table",
        status: "FAILED",
        message: "Order notifications table missing - migration needed",
        error: error.message,
      });
    }

    // Test 4: Receipts Table
    try {
      const { error } = await supabase.from("receipts").select("id").limit(1);

      if (error) throw error;
      results.push({
        name: "Receipts Table",
        status: "PASSED",
        message: "Receipts table exists and accessible",
      });
    } catch (error) {
      results.push({
        name: "Receipts Table",
        status: "FAILED",
        message: "Receipts table missing - migration needed",
        error: error.message,
      });
    }

    // Test 5: Generate Receipt Number Function
    try {
      const { data, error } = await supabase.rpc("generate_receipt_number");
      if (error) throw error;

      if (typeof data === "string" && data.match(/^RCP-\d{8}-\d{6}$/)) {
        results.push({
          name: "Receipt Number Function",
          status: "PASSED",
          message: `Receipt number generated: ${data}`,
        });
      } else {
        results.push({
          name: "Receipt Number Function",
          status: "FAILED",
          message: "Invalid receipt number format",
        });
      }
    } catch (error) {
      results.push({
        name: "Receipt Number Function",
        status: "FAILED",
        message: "Generate receipt number function missing",
        error: error.message,
      });
    }

    // Test 6: Auto Cancel Function
    try {
      const { error } = await supabase.rpc("auto_cancel_expired_orders");
      if (error) throw error;
      results.push({
        name: "Auto Cancel Function",
        status: "PASSED",
        message: "Auto-cancel expired orders function works",
      });
    } catch (error) {
      results.push({
        name: "Auto Cancel Function",
        status: "FAILED",
        message: "Auto-cancel function missing",
        error: error.message,
      });
    }

    // Test 7: Send Reminders Function
    try {
      const { error } = await supabase.rpc("send_commit_reminders");
      if (error) throw error;
      results.push({
        name: "Send Reminders Function",
        status: "PASSED",
        message: "Send commit reminders function works",
      });
    } catch (error) {
      results.push({
        name: "Send Reminders Function",
        status: "FAILED",
        message: "Send reminders function missing",
        error: error.message,
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PASSED":
        return "bg-green-500 text-white";
      case "FAILED":
        return "bg-red-500 text-white";
      case "WARNING":
        return "bg-yellow-500 text-white";
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
      case "WARNING":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const passed = testResults.filter((r) => r.status === "PASSED").length;
  const failed = testResults.filter((r) => r.status === "FAILED").length;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order System Tests</h1>
        <p className="text-muted-foreground">
          Basic tests for the enhanced order management system components.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database & Function Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={runBasicTests}
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? "Running Tests..." : "Run Order System Tests"}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex gap-4 text-sm">
                <span>Total: {testResults.length}</span>
                <span className="text-green-600">Passed: {passed}</span>
                <span className="text-red-600">Failed: {failed}</span>
                <span>
                  Success Rate:{" "}
                  {Math.round((passed / testResults.length) * 100)}%
                </span>
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

              {failed > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">
                    Issues Found:
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
                  <div className="mt-3 text-sm text-red-700">
                    <strong>Next step:</strong> Run the database migration in
                    your Supabase SQL Editor.
                  </div>
                </div>
              )}

              {failed === 0 && passed > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">
                    🎉 All Tests Passed!
                  </h4>
                  <p className="text-sm text-green-700">
                    Your enhanced order management system is ready to use.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSystemTests;
