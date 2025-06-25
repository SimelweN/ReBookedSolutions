import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Settings,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ConfigCheck {
  name: string;
  status: "checking" | "pass" | "fail" | "warning";
  message: string;
  details?: string;
}

const PaystackConfigChecker: React.FC = () => {
  const [checks, setChecks] = useState<ConfigCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runConfigurationCheck = async () => {
    setIsRunning(true);
    const newChecks: ConfigCheck[] = [];

    // Check 1: Frontend Paystack key
    newChecks.push({
      name: "Frontend Paystack Key",
      status: "checking",
      message: "Checking...",
    });
    setChecks([...newChecks]);

    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    newChecks[0] = {
      name: "Frontend Paystack Key",
      status: paystackKey ? "pass" : "fail",
      message: paystackKey
        ? `Key found (${paystackKey.startsWith("pk_live_") ? "Live" : "Test"} mode)`
        : "VITE_PAYSTACK_PUBLIC_KEY not configured",
      details: paystackKey ? `${paystackKey.substring(0, 15)}...` : undefined,
    };
    setChecks([...newChecks]);

    // Check 2: Paystack script loading
    newChecks.push({
      name: "Paystack Script",
      status: "checking",
      message: "Checking...",
    });
    setChecks([...newChecks]);

    await new Promise((resolve) => setTimeout(resolve, 500)); // Give script time to load

    newChecks[1] = {
      name: "Paystack Script",
      status: (window as any).PaystackPop ? "pass" : "fail",
      message: (window as any).PaystackPop
        ? "Paystack script loaded successfully"
        : "Paystack script not loaded",
      details: (window as any).PaystackPop
        ? "PaystackPop object available"
        : "Script may be blocked or failed to load",
    };
    setChecks([...newChecks]);

    // Check 3: Edge Function availability
    newChecks.push({
      name: "Payment Verification Service",
      status: "checking",
      message: "Testing edge function...",
    });
    setChecks([...newChecks]);

    try {
      const { data, error } = await supabase.functions.invoke(
        "verify-paystack-payment",
        {
          body: { reference: "test_config_check" },
        },
      );

      if (error) {
        if (
          error.message?.includes("secret key") ||
          error.message?.includes("not configured")
        ) {
          newChecks[2] = {
            name: "Payment Verification Service",
            status: "fail",
            message: "Backend Paystack secret key not configured",
            details:
              "PAYSTACK_SECRET_KEY environment variable missing in Supabase",
          };
        } else {
          newChecks[2] = {
            name: "Payment Verification Service",
            status: "warning",
            message: "Edge function accessible but returned error",
            details: error.message,
          };
        }
      } else if (data?.error?.includes("secret key")) {
        newChecks[2] = {
          name: "Payment Verification Service",
          status: "fail",
          message: "Backend Paystack secret key not configured",
          details: "PAYSTACK_SECRET_KEY environment variable missing",
        };
      } else {
        newChecks[2] = {
          name: "Payment Verification Service",
          status: "pass",
          message: "Edge function responding correctly",
          details: "Payment verification service is working",
        };
      }
    } catch (error) {
      newChecks[2] = {
        name: "Payment Verification Service",
        status: "fail",
        message: "Edge function not accessible",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
    setChecks([...newChecks]);

    // Check 4: Database connection
    newChecks.push({
      name: "Database Connection",
      status: "checking",
      message: "Testing database...",
    });
    setChecks([...newChecks]);

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id")
        .limit(1);

      newChecks[3] = {
        name: "Database Connection",
        status: error ? "fail" : "pass",
        message: error ? "Database connection failed" : "Database accessible",
        details: error ? error.message : "Orders table accessible",
      };
    } catch (error) {
      newChecks[3] = {
        name: "Database Connection",
        status: "fail",
        message: "Database connection error",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
    setChecks([...newChecks]);

    setIsRunning(false);
  };

  const getStatusIcon = (status: ConfigCheck["status"]) => {
    switch (status) {
      case "checking":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      case "pass":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "fail":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: ConfigCheck["status"]) => {
    switch (status) {
      case "pass":
        return "border-green-200 bg-green-50";
      case "fail":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "checking":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Paystack Configuration Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button
            onClick={runConfigurationCheck}
            disabled={isRunning}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              <>
                <Settings className="w-4 h-4 mr-2" />
                Run Configuration Check
              </>
            )}
          </Button>
        </div>

        {checks.length > 0 && (
          <div className="space-y-3">
            {checks.map((check, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(check.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{check.name}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          check.status === "pass"
                            ? "bg-green-100 text-green-800"
                            : check.status === "fail"
                              ? "bg-red-100 text-red-800"
                              : check.status === "warning"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {check.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      {check.message}
                    </p>
                    {check.details && (
                      <p className="text-xs text-gray-500 mt-1 font-mono">
                        {check.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Common Fixes:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>
                <strong>Frontend Key:</strong> Add VITE_PAYSTACK_PUBLIC_KEY to
                .env.local
              </li>
              <li>
                <strong>Backend Key:</strong> Add PAYSTACK_SECRET_KEY to
                Supabase Edge Function environment
              </li>
              <li>
                <strong>Script Loading:</strong> Check network connectivity and
                ad blockers
              </li>
              <li>
                <strong>Database:</strong> Ensure orders table exists and RLS
                policies are correct
              </li>
            </ul>
            <div className="mt-3">
              <a
                href="https://dashboard.paystack.com/#/settings/developers"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
              >
                <ExternalLink className="w-3 h-3" />
                Get Paystack API Keys
              </a>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default PaystackConfigChecker;
