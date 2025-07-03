import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Database,
  CreditCard,
  User,
  Settings,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ENV, validateEnvironment } from "@/config/environment";

interface HealthCheck {
  name: string;
  status: "checking" | "healthy" | "warning" | "error";
  message: string;
  details?: string;
}

const SystemHealthCheck: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runHealthChecks = async () => {
    setIsRunning(true);
    const results: HealthCheck[] = [];

    // 1. Environment Variables Check
    results.push({
      name: "Environment Configuration",
      status: "checking",
      message: "Checking environment variables...",
    });

    try {
      const hasValidEnv = validateEnvironment();
      results[0] = {
        name: "Environment Configuration",
        status: hasValidEnv ? "healthy" : "warning",
        message: hasValidEnv
          ? "All required environment variables configured"
          : "Some environment variables missing",
        details: hasValidEnv
          ? undefined
          : "Check console for missing variables",
      };
    } catch (error) {
      results[0] = {
        name: "Environment Configuration",
        status: "error",
        message: "Environment validation failed",
        details: error instanceof Error ? error.message : String(error),
      };
    }

    // 2. Supabase Connection Check
    results.push({
      name: "Database Connection",
      status: "checking",
      message: "Testing database connectivity...",
    });

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      if (error) {
        results[1] = {
          name: "Database Connection",
          status: "error",
          message: "Database connection failed",
          details: error.message,
        };
      } else {
        results[1] = {
          name: "Database Connection",
          status: "healthy",
          message: "Database connection successful",
        };
      }
    } catch (error) {
      results[1] = {
        name: "Database Connection",
        status: "error",
        message: "Database connection failed",
        details: error instanceof Error ? error.message : String(error),
      };
    }

    // 3. Authentication System Check
    results.push({
      name: "Authentication System",
      status: "checking",
      message: "Checking authentication...",
    });

    try {
      const { data: session, error } = await supabase.auth.getSession();

      if (error) {
        results[2] = {
          name: "Authentication System",
          status: "warning",
          message: "Authentication system has issues",
          details: error.message,
        };
      } else {
        results[2] = {
          name: "Authentication System",
          status: "healthy",
          message: isAuthenticated
            ? "User authenticated"
            : "Authentication system working (not logged in)",
        };
      }
    } catch (error) {
      results[2] = {
        name: "Authentication System",
        status: "error",
        message: "Authentication system failed",
        details: error instanceof Error ? error.message : String(error),
      };
    }

    // 4. Payment System Check (if configured)
    results.push({
      name: "Payment System",
      status: "checking",
      message: "Checking payment configuration...",
    });

    if (ENV.VITE_PAYSTACK_PUBLIC_KEY) {
      try {
        // Check if Paystack script is loaded
        const paystackAvailable =
          !!(window as any).PaystackPop || !!(window as any).Paystack;

        results[3] = {
          name: "Payment System",
          status: paystackAvailable ? "healthy" : "warning",
          message: paystackAvailable
            ? "Payment system ready"
            : "Payment script not loaded",
          details: paystackAvailable
            ? undefined
            : "Paystack library may not be loaded",
        };
      } catch (error) {
        results[3] = {
          name: "Payment System",
          status: "error",
          message: "Payment system check failed",
          details: error instanceof Error ? error.message : String(error),
        };
      }
    } else {
      results[3] = {
        name: "Payment System",
        status: "warning",
        message: "Payment system not configured",
        details: "VITE_PAYSTACK_PUBLIC_KEY not set",
      };
    }

    // 5. Admin System Check (if user is admin)
    if (isAdmin) {
      results.push({
        name: "Admin System",
        status: "checking",
        message: "Checking admin functionality...",
      });

      try {
        // Try to fetch admin stats to test admin queries
        const { data, error } = await supabase
          .from("books")
          .select("id", { count: "exact", head: true });

        if (error) {
          results[4] = {
            name: "Admin System",
            status: "error",
            message: "Admin queries failed",
            details: error.message,
          };
        } else {
          results[4] = {
            name: "Admin System",
            status: "healthy",
            message: "Admin system functional",
          };
        }
      } catch (error) {
        results[4] = {
          name: "Admin System",
          status: "error",
          message: "Admin system check failed",
          details: error instanceof Error ? error.message : String(error),
        };
      }
    }

    // 6. Supabase Edge Functions Check
    results.push({
      name: "Edge Functions",
      status: "checking",
      message: "Testing serverless functions...",
    });

    try {
      // Test a simple edge function or health endpoint
      const { data, error } = await supabase.functions.invoke(
        "check-expired-orders",
        {
          body: { test: true },
        },
      );

      if (error && !error.message.includes("404")) {
        results.push({
          name: "Edge Functions",
          status: "warning",
          message: "Edge functions may not be deployed",
          details: error.message,
        });
      } else {
        results.push({
          name: "Edge Functions",
          status: "healthy",
          message: "Edge functions accessible",
        });
      }
    } catch (error) {
      results.push({
        name: "Edge Functions",
        status: "warning",
        message: "Edge functions not available",
        details: "Functions may not be deployed",
      });
    }

    setChecks(results);
    setLastRun(new Date());
    setIsRunning(false);
  };

  useEffect(() => {
    runHealthChecks();
  }, [isAuthenticated, isAdmin]);

  const getStatusIcon = (status: HealthCheck["status"]) => {
    switch (status) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: HealthCheck["status"]) => {
    const variants = {
      checking: "secondary",
      healthy: "default",
      warning: "destructive",
      error: "destructive",
    } as const;

    const labels = {
      checking: "Checking",
      healthy: "Healthy",
      warning: "Warning",
      error: "Error",
    };

    return (
      <Badge variant={variants[status]} className="ml-2">
        {labels[status]}
      </Badge>
    );
  };

  const overallStatus =
    checks.length > 0
      ? checks.some((c) => c.status === "error")
        ? "error"
        : checks.some((c) => c.status === "warning")
          ? "warning"
          : checks.every((c) => c.status === "healthy")
            ? "healthy"
            : "checking"
      : "checking";

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <CardTitle>System Health Check</CardTitle>
            {getStatusBadge(overallStatus)}
          </div>
          <div className="flex items-center space-x-2">
            {lastRun && (
              <span className="text-sm text-gray-500">
                Last check: {lastRun.toLocaleTimeString()}
              </span>
            )}
            <Button
              onClick={runHealthChecks}
              disabled={isRunning}
              size="sm"
              variant="outline"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isRunning ? "Checking..." : "Refresh"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checks.map((check, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 rounded-lg border"
            >
              {getStatusIcon(check.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium">{check.name}</h4>
                  {getStatusBadge(check.status)}
                </div>
                <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                {check.details && (
                  <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 p-2 rounded">
                    {check.details}
                  </p>
                )}
              </div>
            </div>
          ))}

          {checks.length === 0 && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Running initial health checks...</p>
            </div>
          )}
        </div>

        {overallStatus === "error" && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Critical system issues detected. Some features may not work
              properly. Please check the environment configuration and contact
              support if issues persist.
            </AlertDescription>
          </Alert>
        )}

        {overallStatus === "warning" && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Some systems are not fully configured. Basic functionality should
              work, but some features may be limited.
            </AlertDescription>
          </Alert>
        )}

        {overallStatus === "healthy" && (
          <Alert className="mt-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              All systems are functioning normally. The website is ready for
              full operation.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemHealthCheck;
