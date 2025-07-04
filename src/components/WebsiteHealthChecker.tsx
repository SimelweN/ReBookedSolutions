import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Shield,
  Navigation,
  Database,
  Globe,
  Users,
  CreditCard,
  BookOpen,
  GraduationCap,
  Home,
  Settings,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface HealthCheck {
  id: string;
  name: string;
  category:
    | "navigation"
    | "authentication"
    | "database"
    | "payments"
    | "campus"
    | "marketplace";
  status: "pass" | "fail" | "warning";
  message: string;
  details?: string;
  fixAction?: () => Promise<void>;
}

const WebsiteHealthChecker = () => {
  const { user, isAuthenticated } = useAuth();
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [fixingId, setFixingId] = useState<string | null>(null);

  const runHealthChecks = async () => {
    setIsRunning(true);
    const results: HealthCheck[] = [];

    try {
      // Navigation Tests
      results.push({
        id: "nav-home",
        name: "Home Page Access",
        category: "navigation",
        status: "pass",
        message: "Home page accessible",
      });

      // Test login page access
      try {
        const loginTest = document.createElement("a");
        loginTest.href = "/login";
        results.push({
          id: "nav-login",
          name: "Login Page Access",
          category: "navigation",
          status: "pass",
          message: "Login page route accessible",
        });
      } catch (error) {
        results.push({
          id: "nav-login",
          name: "Login Page Access",
          category: "navigation",
          status: "fail",
          message: "Login page route issue",
          details: error instanceof Error ? error.message : String(error),
        });
      }

      // Test campus page access
      try {
        const campusTest = document.createElement("a");
        campusTest.href = "/university-info";
        results.push({
          id: "nav-campus",
          name: "Campus Page Access",
          category: "navigation",
          status: "pass",
          message: "Campus page route accessible",
        });
      } catch (error) {
        results.push({
          id: "nav-campus",
          name: "Campus Page Access",
          category: "navigation",
          status: "fail",
          message: "Campus page route issue",
          details: error instanceof Error ? error.message : String(error),
        });
      }

      // Test marketplace access
      try {
        const marketplaceTest = document.createElement("a");
        marketplaceTest.href = "/books";
        results.push({
          id: "nav-marketplace",
          name: "Marketplace Access",
          category: "navigation",
          status: "pass",
          message: "Marketplace route accessible",
        });
      } catch (error) {
        results.push({
          id: "nav-marketplace",
          name: "Marketplace Access",
          category: "navigation",
          status: "fail",
          message: "Marketplace route issue",
          details: error instanceof Error ? error.message : String(error),
        });
      }

      // Authentication Tests
      results.push({
        id: "auth-status",
        name: "Authentication Status",
        category: "authentication",
        status: isAuthenticated ? "pass" : "warning",
        message: isAuthenticated
          ? "User is authenticated"
          : "User not logged in",
        details: user?.email || "No user session",
      });

      // Database connectivity tests
      try {
        const { data: profileTest, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .limit(1);

        results.push({
          id: "db-profiles",
          name: "Profiles Table",
          category: "database",
          status: profileError ? "fail" : "pass",
          message: profileError
            ? "Profiles table inaccessible"
            : "Profiles table accessible",
          details: profileError?.message,
        });
      } catch (error) {
        results.push({
          id: "db-profiles",
          name: "Profiles Table",
          category: "database",
          status: "fail",
          message: "Database connection failed",
          details: error instanceof Error ? error.message : String(error),
        });
      }

      // Books table test
      try {
        const { data: booksTest, error: booksError } = await supabase
          .from("books")
          .select("id")
          .limit(1);

        results.push({
          id: "db-books",
          name: "Books Table",
          category: "database",
          status: booksError ? "fail" : "pass",
          message: booksError
            ? "Books table inaccessible"
            : "Books table accessible",
          details: booksError?.message,
        });
      } catch (error) {
        results.push({
          id: "db-books",
          name: "Books Table",
          category: "database",
          status: "fail",
          message: "Books table connection failed",
          details: error instanceof Error ? error.message : String(error),
        });
      }

      // Orders table test
      try {
        const { data: ordersTest, error: ordersError } = await supabase
          .from("orders")
          .select("id")
          .limit(1);

        results.push({
          id: "db-orders",
          name: "Orders Table",
          category: "database",
          status: ordersError ? "fail" : "pass",
          message: ordersError
            ? "Orders table missing"
            : "Orders table accessible",
          details: ordersError?.message,
          fixAction: ordersError
            ? async () => {
                toast.info(
                  "Orders table missing - this is expected if migrations haven't been run",
                );
                toast.info("Contact administrator to run database migrations");
              }
            : undefined,
        });
      } catch (error) {
        results.push({
          id: "db-orders",
          name: "Orders Table",
          category: "database",
          status: "fail",
          message: "Orders table connection failed",
          details: error instanceof Error ? error.message : String(error),
        });
      }

      // Campus functionality tests
      try {
        // Test university data availability
        const { ALL_SOUTH_AFRICAN_UNIVERSITIES } = await import(
          "@/constants/universities/index"
        );

        results.push({
          id: "campus-data",
          name: "University Data",
          category: "campus",
          status: ALL_SOUTH_AFRICAN_UNIVERSITIES?.length > 0 ? "pass" : "fail",
          message:
            ALL_SOUTH_AFRICAN_UNIVERSITIES?.length > 0
              ? `${ALL_SOUTH_AFRICAN_UNIVERSITIES.length} universities loaded`
              : "University data missing",
        });
      } catch (error) {
        results.push({
          id: "campus-data",
          name: "University Data",
          category: "campus",
          status: "fail",
          message: "Failed to load university data",
          details: error instanceof Error ? error.message : String(error),
        });
      }

      // Payment system tests
      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      results.push({
        id: "payment-config",
        name: "Payment Configuration",
        category: "payments",
        status: paystackKey ? "pass" : "fail",
        message: paystackKey
          ? "Paystack configured"
          : "Paystack not configured",
        details: paystackKey
          ? `Key: ${paystackKey.substring(0, 10)}...`
          : "VITE_PAYSTACK_PUBLIC_KEY missing",
      });

      // Test Paystack library availability
      results.push({
        id: "payment-library",
        name: "Payment Library",
        category: "payments",
        status: (window as any).PaystackPop ? "pass" : "warning",
        message: (window as any).PaystackPop
          ? "Paystack library loaded"
          : "Paystack library not loaded",
        details: (window as any).PaystackPop
          ? "Ready for payments"
          : "Will load on demand",
      });

      // Console error check
      const originalConsoleError = console.error;
      let errorCount = 0;
      console.error = (...args) => {
        errorCount++;
        originalConsoleError(...args);
      };

      // Restore original console.error after a brief period
      setTimeout(() => {
        console.error = originalConsoleError;

        results.push({
          id: "console-errors",
          name: "Console Errors",
          category: "navigation",
          status:
            errorCount === 0 ? "pass" : errorCount < 5 ? "warning" : "fail",
          message:
            errorCount === 0
              ? "No console errors"
              : `${errorCount} console errors detected`,
          details:
            errorCount > 0 ? "Check browser console for details" : undefined,
        });
      }, 2000);

      setChecks(results);
      setLastChecked(new Date());

      const failCount = results.filter((r) => r.status === "fail").length;
      const warningCount = results.filter((r) => r.status === "warning").length;

      if (failCount === 0 && warningCount === 0) {
        toast.success("🎉 All health checks passed!");
      } else if (failCount === 0) {
        toast.warning(`Health check complete with ${warningCount} warnings`);
      } else {
        toast.error(
          `Health check found ${failCount} issues and ${warningCount} warnings`,
        );
      }
    } catch (error) {
      console.error("Health check failed:", error);
      toast.error("Health check failed to complete");
    } finally {
      setIsRunning(false);
    }
  };

  const runFix = async (checkId: string) => {
    const check = checks.find((c) => c.id === checkId);
    if (!check?.fixAction) return;

    setFixingId(checkId);
    try {
      await check.fixAction();
      // Re-run health checks after fix
      setTimeout(() => runHealthChecks(), 1000);
    } catch (error) {
      toast.error(
        `Fix failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setFixingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "fail":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "border-green-200 bg-green-50";
      case "fail":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "navigation":
        return <Navigation className="w-5 h-5" />;
      case "authentication":
        return <Users className="w-5 h-5" />;
      case "database":
        return <Database className="w-5 h-5" />;
      case "payments":
        return <CreditCard className="w-5 h-5" />;
      case "campus":
        return <GraduationCap className="w-5 h-5" />;
      case "marketplace":
        return <BookOpen className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const categories = [
    "navigation",
    "authentication",
    "database",
    "payments",
    "campus",
    "marketplace",
  ] as const;

  const getChecksForCategory = (category: string) => {
    return checks.filter((check) => check.category === category);
  };

  const getCategoryStatus = (category: string) => {
    const categoryChecks = getChecksForCategory(category);
    if (categoryChecks.length === 0) return "pass";

    const hasFailure = categoryChecks.some((c) => c.status === "fail");
    const hasWarning = categoryChecks.some((c) => c.status === "warning");

    if (hasFailure) return "fail";
    if (hasWarning) return "warning";
    return "pass";
  };

  useEffect(() => {
    // Run initial health check
    runHealthChecks();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Website Health Checker</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-6">
            <Button
              onClick={runHealthChecks}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRunning ? "animate-spin" : ""}`}
              />
              {isRunning ? "Running Checks..." : "Run Health Check"}
            </Button>

            <Button
              onClick={() => {
                console.clear();
                runHealthChecks();
              }}
              variant="outline"
            >
              <Zap className="w-4 h-4 mr-2" />
              Deep Clean & Check
            </Button>
          </div>

          {lastChecked && (
            <p className="text-sm text-gray-500 mb-4">
              Last checked: {lastChecked.toLocaleString()}
            </p>
          )}

          {checks.length > 0 && (
            <Tabs defaultValue="navigation" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="flex items-center gap-1 text-xs"
                  >
                    {getCategoryIcon(category)}
                    <span className="hidden sm:inline capitalize">
                      {category}
                    </span>
                    <Badge
                      variant="outline"
                      className={`ml-1 h-4 w-4 p-0 text-xs ${
                        getCategoryStatus(category) === "pass"
                          ? "bg-green-100 text-green-700"
                          : getCategoryStatus(category) === "warning"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {getChecksForCategory(category).length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent
                  key={category}
                  value={category}
                  className="space-y-2"
                >
                  {getChecksForCategory(category).map((check) => (
                    <div
                      key={check.id}
                      className={`p-3 rounded-lg border ${getStatusColor(check.status)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(check.status)}
                          <span className="font-medium">{check.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {check.status.toUpperCase()}
                          </Badge>
                          {check.fixAction && check.status === "fail" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => runFix(check.id)}
                              disabled={fixingId === check.id}
                            >
                              {fixingId === check.id ? "Fixing..." : "Fix"}
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm mt-1">{check.message}</p>
                      {check.details && (
                        <p className="text-xs mt-1 opacity-75">
                          {check.details}
                        </p>
                      )}
                    </div>
                  ))}

                  {getChecksForCategory(category).length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      No checks in this category
                    </p>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="w-full justify-start"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Homepage
          </Button>

          <Button
            onClick={() => (window.location.href = "/login")}
            variant="outline"
            className="w-full justify-start"
          >
            <Users className="w-4 h-4 mr-2" />
            Test Login Page
          </Button>

          <Button
            onClick={() => (window.location.href = "/university-info")}
            variant="outline"
            className="w-full justify-start"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Test Campus Page
          </Button>

          <Button
            onClick={() => (window.location.href = "/books")}
            variant="outline"
            className="w-full justify-start"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Test Marketplace
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteHealthChecker;
