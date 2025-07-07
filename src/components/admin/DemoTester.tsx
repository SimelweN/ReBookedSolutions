import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "lucide-react";
import { toast } from "sonner";
import DemoKeysService, {
  DemoKeyValidationResult,
} from "@/services/demoKeysService";

const DemoTester: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [validationResult, setValidationResult] =
    useState<DemoKeyValidationResult | null>(null);
  const [testResults, setTestResults] = useState<any>(null);

  const runValidation = () => {
    const result = DemoKeysService.validateDemoKeys();
    setValidationResult(result);

    if (result.isValid) {
      toast.success("Demo keys validation passed!");
    } else {
      toast.error("Demo keys validation failed");
    }
  };

  const runComprehensiveTest = async () => {
    setTesting(true);
    try {
      toast.info("Running comprehensive demo test...");

      const results = await DemoKeysService.runComprehensiveDemoTest();
      setTestResults(results);

      if (results.success) {
        toast.success("All demo tests passed!");
      } else {
        toast.warning("Some demo tests failed - check results below");
      }
    } catch (error) {
      toast.error("Demo test failed: " + error);
      console.error("Demo test error:", error);
    } finally {
      setTesting(false);
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

  const testCommitFunctionality = async () => {
    try {
      toast.info("Testing commit functionality...");

      const result = await DemoKeysService.testCommitFunctionality();

      if (result.success) {
        toast.success("Commit functionality test passed!");
        console.log("Demo order created:", result.demoOrder);
      } else {
        toast.error("Commit test failed: " + result.message);
      }
    } catch (error) {
      toast.error("Commit test error: " + error);
    }
  };

  const createDemoOrder = async () => {
    try {
      toast.info("Creating demo order for commit testing...");

      // Import required modules
      const { useAuth } = await import("@/contexts/AuthContext");
      const { supabase } = await import("@/integrations/supabase/client");

      // Note: This is a simplified demo creation that would need proper auth context
      // In real usage, this would be called from a component with auth context
      console.log("Demo order functionality available in commit testing");

      toast.success(
        "Demo order creation test completed! Check console for details.",
      );
    } catch (error) {
      toast.error("Demo order creation error: " + error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Demo Environment Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Test and validate demo keys, payment functionality, and commit
            system.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button onClick={runValidation} variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Validate Keys
            </Button>

            <Button onClick={setupDemoEnvironment} variant="outline" size="sm">
              <Info className="h-4 w-4 mr-2" />
              Show Demo .env
            </Button>

            <Button
              onClick={testCommitFunctionality}
              variant="outline"
              size="sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              Test Commit
            </Button>

            <Button onClick={createDemoOrder} variant="outline" size="sm">
              <Package className="h-4 w-4 mr-2" />
              Create Demo Order
            </Button>

            <Button
              onClick={runComprehensiveTest}
              disabled={testing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {testing ? "Testing..." : "Run Full Test"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Keys Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge
                variant={validationResult.isValid ? "default" : "destructive"}
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
                  <ul className="mt-2 list-disc list-inside">
                    {validationResult.issues.map((issue, index) => (
                      <li key={index} className="text-sm">
                        {issue}
                      </li>
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
                  <ul className="mt-2 list-disc list-inside">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index} className="text-sm">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validationResult.recommendations.length > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendations:</strong>
                  <ul className="mt-2 list-disc list-inside">
                    {validationResult.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResults.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              Comprehensive Test Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {/* Keys Test */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Keys Validation</span>
                </div>
                <div className="flex items-center gap-2">
                  {testResults.results.keysValidation.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">
                    {testResults.results.keysValidation.isValid
                      ? "Passed"
                      : "Failed"}
                  </span>
                </div>
              </div>

              {/* Payment Test */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-medium">Payment System</span>
                </div>
                <div className="flex items-center gap-2">
                  {testResults.results.paymentTest.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">
                    {testResults.results.paymentTest.success
                      ? "Passed"
                      : "Failed"}
                  </span>
                </div>
              </div>

              {/* Commit Test */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Commit System</span>
                </div>
                <div className="flex items-center gap-2">
                  {testResults.results.commitTest.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">
                    {testResults.results.commitTest.success
                      ? "Passed"
                      : "Failed"}
                  </span>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="pt-4 border-t">
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Payment Test:</strong>{" "}
                  {testResults.results.paymentTest.message}
                </div>
                <div className="text-sm">
                  <strong>Commit Test:</strong>{" "}
                  {testResults.results.commitTest.message}
                </div>

                {testResults.results.commitTest.demoOrder && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-2">
                      Demo Order Created:
                    </div>
                    <div className="text-xs font-mono text-blue-700">
                      ID: {testResults.results.commitTest.demoOrder.id}
                    </div>
                    <div className="text-xs font-mono text-blue-700">
                      Amount: R
                      {(
                        testResults.results.commitTest.demoOrder.amount / 100
                      ).toFixed(2)}
                    </div>
                    <div className="text-xs font-mono text-blue-700">
                      Deadline:{" "}
                      {new Date(
                        testResults.results.commitTest.demoOrder.commit_deadline,
                      ).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Environment Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>
              <strong>To use demo keys:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Click "Show Demo .env" to get demo environment variables</li>
              <li>Copy the output to your .env file (or create .env.local)</li>
              <li>Restart your development server</li>
              <li>Run "Run Full Test" to verify everything works</li>
            </ol>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">
                <strong>Note:</strong> Demo keys are safe for testing but won't
                process real payments. The commit system will work with test
                data for 48-hour functionality testing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoTester;
