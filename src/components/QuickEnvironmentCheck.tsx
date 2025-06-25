import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Settings,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface EnvCheck {
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
  value?: string;
  sensitive?: boolean;
}

const QuickEnvironmentCheck: React.FC = () => {
  const [envChecks, setEnvChecks] = useState<EnvCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);

  const runEnvironmentCheck = () => {
    setIsChecking(true);
    const checks: EnvCheck[] = [];

    // Check Supabase URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      checks.push({
        name: "VITE_SUPABASE_URL",
        status: "fail",
        message: "Missing - Required for database connection",
        value: "Not set",
      });
    } else {
      try {
        const url = new URL(supabaseUrl);
        if (url.hostname.includes("supabase.co")) {
          checks.push({
            name: "VITE_SUPABASE_URL",
            status: "pass",
            message: "Valid Supabase URL format",
            value: supabaseUrl,
          });
        } else {
          checks.push({
            name: "VITE_SUPABASE_URL",
            status: "warning",
            message:
              "URL doesn't look like Supabase (should contain 'supabase.co')",
            value: supabaseUrl,
          });
        }
      } catch {
        checks.push({
          name: "VITE_SUPABASE_URL",
          status: "fail",
          message: "Invalid URL format",
          value: supabaseUrl,
        });
      }
    }

    // Check Supabase API Key
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseKey) {
      checks.push({
        name: "VITE_SUPABASE_ANON_KEY",
        status: "fail",
        message: "Missing - Required for database authentication",
        value: "Not set",
        sensitive: true,
      });
    } else if (!supabaseKey.startsWith("eyJ")) {
      checks.push({
        name: "VITE_SUPABASE_ANON_KEY",
        status: "fail",
        message: "Invalid format - Should start with 'eyJ' (JWT token)",
        value: supabaseKey.substring(0, 20) + "...",
        sensitive: true,
      });
    } else {
      checks.push({
        name: "VITE_SUPABASE_ANON_KEY",
        status: "pass",
        message: "Valid JWT format",
        value: supabaseKey.substring(0, 20) + "...",
        sensitive: true,
      });
    }

    // Check environment mode
    const nodeEnv = import.meta.env.NODE_ENV;
    const mode = import.meta.env.MODE;
    checks.push({
      name: "Environment Mode",
      status: "pass",
      message: `Running in ${mode} mode`,
      value: `NODE_ENV: ${nodeEnv}, MODE: ${mode}`,
    });

    // Check if using fallback values
    const usingFallbacks =
      supabaseUrl === "https://kbpjqzaqbqukutflwixf.supabase.co";
    if (usingFallbacks) {
      checks.push({
        name: "Configuration Source",
        status: "warning",
        message:
          "Using default fallback values - Set your own project credentials",
        value: "Fallback values",
      });
    } else {
      checks.push({
        name: "Configuration Source",
        status: "pass",
        message: "Using custom environment variables",
        value: "Custom config",
      });
    }

    setEnvChecks(checks);
    setIsChecking(false);

    const failedChecks = checks.filter((c) => c.status === "fail").length;
    if (failedChecks === 0) {
      toast.success("Environment configuration looks good!");
    } else {
      toast.error(`${failedChecks} configuration issues found`);
    }
  };

  const copyValue = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  const getStatusIcon = (status: EnvCheck["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: EnvCheck["status"]) => {
    const variants = {
      pass: "bg-green-100 text-green-800",
      fail: "bg-red-100 text-red-800",
      warning: "bg-yellow-100 text-yellow-800",
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Environment Configuration Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={runEnvironmentCheck}
            disabled={isChecking}
            className="flex items-center gap-2"
          >
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Settings className="h-4 w-4" />
            )}
            Check Configuration
          </Button>

          {envChecks.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSensitive(!showSensitive)}
              className="flex items-center gap-2"
            >
              {showSensitive ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showSensitive ? "Hide" : "Show"} Sensitive
            </Button>
          )}
        </div>

        {envChecks.length > 0 && (
          <div className="space-y-3">
            {envChecks.map((check, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(check.status)}
                    <span className="font-medium">{check.name}</span>
                  </div>
                  {getStatusBadge(check.status)}
                </div>

                <p className="text-sm text-gray-600 mb-2">{check.message}</p>

                {check.value && (
                  <div className="text-xs bg-gray-100 rounded p-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono">
                        {check.sensitive && !showSensitive
                          ? "••••••••••••••••••••"
                          : check.value}
                      </span>
                      <div className="flex gap-1">
                        {!check.sensitive && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyValue(check.value!)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Fix Instructions */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Quick Fix:</strong> If you're getting "Cannot reach Supabase
            server" errors, check that your VITE_SUPABASE_URL and
            VITE_SUPABASE_ANON_KEY match your actual Supabase project. You can
            find these in your Supabase dashboard under Settings → API.
            <a
              href="https://app.supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 ml-2 text-blue-600 hover:underline"
            >
              Open Supabase Dashboard <ExternalLink className="h-3 w-3" />
            </a>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default QuickEnvironmentCheck;
