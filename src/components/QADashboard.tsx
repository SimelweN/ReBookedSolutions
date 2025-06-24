import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  PlayCircle,
  RefreshCw,
  Database,
  Calculator,
  Map,
  CreditCard,
  Truck,
  ShoppingCart,
  User,
  Loader2,
} from "lucide-react";
import { qaChecker, QATestResult } from "@/utils/qaFunctionalityChecker";

const QADashboard: React.FC = () => {
  const [results, setResults] = useState<QATestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const testResults = await qaChecker.runAllTests();
      setResults(testResults);
      setSummary(qaChecker.generateSummaryReport());
    } catch (error) {
      console.error("QA Tests failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: "default",
      fail: "destructive",
      warning: "secondary",
      skip: "outline",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "authentication":
        return <User className="h-5 w-5" />;
      case "aps calculator":
        return <Calculator className="h-5 w-5" />;
      case "google maps":
        return <Map className="h-5 w-5" />;
      case "payment system":
        return <CreditCard className="h-5 w-5" />;
      case "courier integration":
        return <Truck className="h-5 w-5" />;
      case "database structure":
        return <Database className="h-5 w-5" />;
      case "cart functionality":
        return <ShoppingCart className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = [];
      }
      acc[result.category].push(result);
      return acc;
    },
    {} as Record<string, QATestResult[]>,
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              QA Functionality Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive functionality testing without UI changes
            </p>
          </div>
          <Button
            onClick={runTests}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PlayCircle className="h-4 w-4 mr-2" />
            )}
            {isRunning ? "Running Tests..." : "Run All Tests"}
          </Button>
        </div>

        {/* Summary */}
        {summary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Test Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {summary.passed}
                  </div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {summary.failed}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {summary.warnings}
                  </div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {summary.skipped}
                  </div>
                  <div className="text-sm text-gray-600">Skipped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {summary.totalTests}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600">
                    {Math.round((summary.passed / summary.totalTests) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(summary.passed / summary.totalTests) * 100}
                  className="h-2"
                />
              </div>

              <Alert
                className={`${
                  summary.overallStatus === "critical"
                    ? "border-red-200 bg-red-50"
                    : summary.overallStatus === "issues"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-green-200 bg-green-50"
                }`}
              >
                <AlertDescription
                  className={`${
                    summary.overallStatus === "critical"
                      ? "text-red-800"
                      : summary.overallStatus === "issues"
                        ? "text-yellow-800"
                        : "text-green-800"
                  }`}
                >
                  <strong>
                    System Status: {summary.overallStatus.toUpperCase()}
                  </strong>
                  {summary.overallStatus === "critical" &&
                    " - Multiple critical issues detected"}
                  {summary.overallStatus === "issues" &&
                    " - Some issues need attention"}
                  {summary.overallStatus === "healthy" &&
                    " - All core functionality working"}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Test Results by Category */}
        {Object.entries(groupedResults).map(([category, categoryResults]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(category)}
                {category}
                <Badge variant="outline">{categoryResults.length} tests</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {result.message}
                        </div>
                        {result.details && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer">
                              View Details
                            </summary>
                            <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(result.status)}
                      <span className="text-xs text-gray-500">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* No Results */}
        {!isRunning && results.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Tests Run Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Click "Run All Tests" to start the comprehensive functionality
                check
              </p>
              <Button
                onClick={runTests}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Run All Tests
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QADashboard;
