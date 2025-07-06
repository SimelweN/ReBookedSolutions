import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { testOrderSystem, checkDatabaseStatus } from "@/utils/testOrderSystem";

interface TestResult {
  name: string;
  status: "PASSED" | "FAILED";
  result?: string;
  error?: string;
}

const TestOrderSystem: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [quickStatus, setQuickStatus] = useState<string>("");

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      const testResults = await testOrderSystem();
      setResults(testResults);
    } catch (error) {
      console.error("Test execution failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const runQuickCheck = async () => {
    setQuickStatus("Running...");

    try {
      // Capture console output
      const originalLog = console.log;
      let output = "";
      console.log = (...args) => {
        output += args.join(" ") + "\n";
        originalLog(...args);
      };

      await checkDatabaseStatus();

      console.log = originalLog;
      setQuickStatus(output);
    } catch (error) {
      setQuickStatus(`Error: ${error.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    return status === "PASSED" ? "bg-green-500" : "bg-red-500";
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Enhanced Order System Tests</h1>
        <p className="text-muted-foreground">
          Test all components of the enhanced order management system to ensure
          everything is working correctly.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Quick Status Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔍 Quick Database Status Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runQuickCheck} variant="outline">
              Check Database Status
            </Button>
            {quickStatus && (
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">{quickStatus}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Full Test Suite */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🧪 Full Test Suite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runTests} disabled={isRunning} className="w-full">
              {isRunning ? "Running Tests..." : "Run All Tests"}
            </Button>

            {results.length > 0 && (
              <div className="space-y-3">
                <div className="flex gap-4 text-sm">
                  <span>Total: {results.length}</span>
                  <span className="text-green-600">
                    Passed:{" "}
                    {results.filter((r) => r.status === "PASSED").length}
                  </span>
                  <span className="text-red-600">
                    Failed:{" "}
                    {results.filter((r) => r.status === "FAILED").length}
                  </span>
                </div>

                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(result.status)}>
                          {result.status === "PASSED" ? "✅" : "❌"}{" "}
                          {result.status}
                        </Badge>
                        <span className="font-medium">{result.name}</span>
                      </div>

                      {result.result && (
                        <span className="text-sm text-muted-foreground">
                          {result.result}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {results.some((r) => r.error) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                    <div className="space-y-1">
                      {results
                        .filter((r) => r.error)
                        .map((result, index) => (
                          <div key={index} className="text-sm text-red-700">
                            <strong>{result.name}:</strong> {result.error}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Information */}
        <Card>
          <CardHeader>
            <CardTitle>📋 What These Tests Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Database Components</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Database connection</li>
                  <li>• Orders table schema</li>
                  <li>• Notifications table</li>
                  <li>• Receipts table</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Functions & Features</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Receipt number generation</li>
                  <li>• Auto-cancel expired orders</li>
                  <li>• Send commit reminders</li>
                  <li>• Create notifications</li>
                  <li>• Edge function (optional)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>⚙️ Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Before Running Tests:</h4>
                <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                  <li>
                    Run the database migration in your Supabase SQL Editor
                  </li>
                  <li>Ensure all tables and functions are created</li>
                  <li>Verify your Supabase connection is working</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium mb-2">After Tests Pass:</h4>
                <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                  <li>Deploy the Edge Function in Supabase</li>
                  <li>Set up a cron job to run reminders hourly</li>
                  <li>Update your order components to use the new service</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestOrderSystem;
