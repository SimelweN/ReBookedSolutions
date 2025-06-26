import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Stethoscope,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  runLoginDiagnostic,
  testLogin,
  LoginDiagnosticResult,
} from "@/utils/loginDiagnostic";
import QuickEnvironmentCheck from "./QuickEnvironmentCheck";
import { toast } from "sonner";

const LoginDiagnosticPanel: React.FC = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<
    LoginDiagnosticResult[]
  >([]);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testPassword, setTestPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isTestingLogin, setIsTestingLogin] = useState(false);

  const runDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      const results = await runLoginDiagnostic();
      setDiagnosticResults(results);

      const failedSteps = results.filter((r) => r.status === "fail");
      if (failedSteps.length === 0) {
        toast.success("All diagnostic checks passed!");
      } else {
        toast.error(`${failedSteps.length} issues found`);
      }
    } catch (error) {
      toast.error(
        "Diagnostic failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const runTestLogin = async () => {
    if (!testEmail || !testPassword) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsTestingLogin(true);
    try {
      const result = await testLogin(testEmail, testPassword);
      setDiagnosticResults((prev) => [...prev, result]);

      if (result.status === "pass") {
        toast.success("Login test successful!");
      } else {
        toast.error("Login test failed: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Test login failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    } finally {
      setIsTestingLogin(false);
    }
  };

  const getStatusIcon = (status: LoginDiagnosticResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: LoginDiagnosticResult["status"]) => {
    const variants = {
      pass: "bg-green-100 text-green-800",
      fail: "bg-red-100 text-red-800",
      warning: "bg-yellow-100 text-yellow-800",
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Quick Environment Check */}
      <QuickEnvironmentCheck />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Login Diagnostic Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={runDiagnostic}
              disabled={isRunningDiagnostic}
              className="flex items-center gap-2"
            >
              {isRunningDiagnostic ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Stethoscope className="h-4 w-4" />
              )}
              Run System Diagnostic
            </Button>
          </div>

          {/* Test Login Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Key className="h-4 w-4" />
              Test Login
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="email"
                placeholder="Test email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Test password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              onClick={runTestLogin}
              disabled={isTestingLogin || !testEmail || !testPassword}
              className="mt-3 flex items-center gap-2"
              variant="outline"
            >
              {isTestingLogin ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Key className="h-4 w-4" />
              )}
              Test Login
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {diagnosticResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {diagnosticResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.step}</span>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{result.message}</p>

                  {result.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                        Show details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {
                      diagnosticResults.filter((r) => r.status === "pass")
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {
                      diagnosticResults.filter((r) => r.status === "warning")
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {
                      diagnosticResults.filter((r) => r.status === "fail")
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Fixes */}
      <Card>
        <CardHeader>
          <CardTitle>Common Login Issues & Fixes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                <strong>Invalid API Key:</strong> Check your
                VITE_SUPABASE_ANON_KEY starts with "eyJ" and matches your
                Supabase project.
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Wrong URL:</strong> Verify VITE_SUPABASE_URL matches
                your project: https://[project-id].supabase.co
              </AlertDescription>
            </Alert>

            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Network Issues:</strong> Check internet connection and
                firewall settings blocking Supabase.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginDiagnosticPanel;
