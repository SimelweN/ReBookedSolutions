import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { ENV } from "@/config/environment";

interface EnvVariable {
  key: string;
  required: boolean;
  description: string;
  type: "secret" | "url" | "text";
  validation?: (value: string) => boolean;
  example?: string;
}

const ENV_VARIABLES: EnvVariable[] = [
  {
    key: "VITE_SUPABASE_URL",
    required: true,
    description: "Your Supabase project URL",
    type: "url",
    validation: (value) => value.includes(".supabase.co"),
    example: "https://your-project-ref.supabase.co",
  },
  {
    key: "VITE_SUPABASE_ANON_KEY",
    required: true,
    description: "Your Supabase anonymous key (JWT token)",
    type: "secret",
    validation: (value) => value.startsWith("eyJ"),
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  },
  {
    key: "VITE_RESEND_API_KEY",
    required: false,
    description: "Resend API key for email sending",
    type: "secret",
    validation: (value) => value.startsWith("re_"),
    example: "re_123456789_...",
  },
  {
    key: "VITE_PAYSTACK_PUBLIC_KEY",
    required: false,
    description: "Paystack public key for payments",
    type: "secret",
    validation: (value) => value.startsWith("pk_"),
    example: "pk_test_123456789...",
  },
  {
    key: "VITE_GOOGLE_MAPS_API_KEY",
    required: false,
    description: "Google Maps API key",
    type: "secret",
    example: "AIzaSyD...",
  },
];

const EnvironmentTester = () => {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testValues, setTestValues] = useState<Record<string, string>>({});

  const toggleSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getCurrentValue = (key: string) => {
    return ENV[key as keyof typeof ENV] || "";
  };

  const getStatus = (variable: EnvVariable) => {
    const value = getCurrentValue(variable.key);

    if (!value) {
      return variable.required ? "error" : "warning";
    }

    if (variable.validation && !variable.validation(value)) {
      return "warning";
    }

    return "success";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      success: "text-green-600 bg-green-100",
      warning: "text-yellow-600 bg-yellow-100",
      error: "text-red-600 bg-red-100",
    };

    const labels = {
      success: "Valid",
      warning: "Invalid Format",
      error: "Missing",
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const generateEnvFile = () => {
    const envContent = ENV_VARIABLES.map((variable) => {
      const currentValue = getCurrentValue(variable.key);
      const value = currentValue || variable.example || "YOUR_VALUE_HERE";
      return `${variable.key}=${value}`;
    }).join("\n");

    copyToClipboard(envContent);
    toast.success(".env file content copied to clipboard!");
  };

  const testConnection = async () => {
    const url = getCurrentValue("VITE_SUPABASE_URL");
    const key = getCurrentValue("VITE_SUPABASE_ANON_KEY");

    if (!url || !key) {
      toast.error("Missing Supabase URL or API key");
      return;
    }

    try {
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      });

      if (response.ok) {
        toast.success("✅ Supabase connection successful!");
      } else {
        toast.error(`❌ Supabase connection failed: ${response.status}`);
      }
    } catch (error) {
      toast.error(`❌ Connection error: ${error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Environment Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Environment Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Current Issue:</strong> VITE_SUPABASE_ANON_KEY is missing.
              This is required for authentication and database access.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {ENV_VARIABLES.map((variable) => {
              const status = getStatus(variable);
              const value = getCurrentValue(variable.key);

              return (
                <div
                  key={variable.key}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(status)}
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {variable.key}
                        {variable.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {variable.description}
                      </div>
                      {value && (
                        <div className="text-xs text-gray-500 mt-1 font-mono">
                          {variable.type === "secret" &&
                          !showSecrets[variable.key]
                            ? "••••••••••••••••"
                            : value.length > 50
                              ? `${value.substring(0, 50)}...`
                              : value}
                          {variable.type === "secret" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="ml-2 h-4 w-4 p-0"
                              onClick={() => toggleSecret(variable.key)}
                            >
                              {showSecrets[variable.key] ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(status)}
                    {value && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(value)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={generateEnvFile}
              variant="outline"
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy .env Template
            </Button>
            <Button onClick={testConnection} className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Test Supabase Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>To fix the missing VITE_SUPABASE_ANON_KEY:</strong>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium">1. Get your Supabase credentials:</h4>
              <ul className="text-sm text-gray-600 ml-4 mt-1 space-y-1">
                <li>
                  • Go to{" "}
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    supabase.com/dashboard
                  </a>
                </li>
                <li>• Select your project</li>
                <li>• Go to Settings → API</li>
                <li>• Copy your Project URL and anon/public API key</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium">
                2. Create a .env file in your project root:
              </h4>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono mt-2">
                <div>
                  VITE_SUPABASE_URL=https://your-project-ref.supabase.co
                </div>
                <div>
                  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                </div>
                <div>VITE_RESEND_API_KEY=re_123456789_...</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium">
                3. Restart your development server:
              </h4>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono mt-2">
                npm run dev
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Environment Debug */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Node Environment:</strong> {ENV.NODE_ENV}
            </div>
            <div>
              <strong>Available Variables:</strong> {Object.keys(ENV).length}
            </div>
            <div>
              <strong>Missing Required:</strong>{" "}
              {
                ENV_VARIABLES.filter(
                  (v) => v.required && !getCurrentValue(v.key),
                ).length
              }
            </div>
          </div>

          <Button
            onClick={() => {
              const debugInfo = {
                environment: ENV.NODE_ENV,
                availableVars: Object.keys(ENV),
                missingRequired: ENV_VARIABLES.filter(
                  (v) => v.required && !getCurrentValue(v.key),
                ).map((v) => v.key),
                timestamp: new Date().toISOString(),
              };
              copyToClipboard(JSON.stringify(debugInfo, null, 2));
              toast.success("Debug info copied to clipboard");
            }}
            variant="outline"
            className="mt-3"
          >
            Copy Debug Info
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnvironmentTester;
