import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Key,
  Database,
  MapPin,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnvVariable {
  name: string;
  value: string | undefined;
  required: boolean;
  description: string;
  icon: React.ElementType;
  setupUrl?: string;
}

const EnvironmentChecker: React.FC = () => {
  const envVariables: EnvVariable[] = [
    {
      name: "VITE_SUPABASE_URL",
      value: import.meta.env.VITE_SUPABASE_URL,
      required: true,
      description: "Supabase project URL for database connectivity",
      icon: Database,
      setupUrl: "https://supabase.com",
    },
    {
      name: "VITE_SUPABASE_ANON_KEY",
      value: import.meta.env.VITE_SUPABASE_ANON_KEY,
      required: true,
      description: "Supabase anonymous key for client authentication",
      icon: Key,
      setupUrl: "https://supabase.com",
    },
    {
      name: "VITE_PAYSTACK_PUBLIC_KEY",
      value: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      required: true,
      description: "Paystack public key for payment processing",
      icon: CreditCard,
      setupUrl: "https://dashboard.paystack.com",
    },
    {
      name: "VITE_GOOGLE_MAPS_API_KEY",
      value: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      required: false,
      description: "Google Maps API key for address autocomplete",
      icon: MapPin,
      setupUrl: "https://console.cloud.google.com/google/maps-apis/overview",
    },
  ];

  const getStatus = (envVar: EnvVariable) => {
    if (!envVar.value) {
      return envVar.required ? "error" : "warning";
    }

    // Additional validation for specific keys
    if (
      envVar.name === "VITE_PAYSTACK_PUBLIC_KEY" &&
      !envVar.value.startsWith("pk_")
    ) {
      return "error";
    }

    if (
      envVar.name === "VITE_GOOGLE_MAPS_API_KEY" &&
      !envVar.value.startsWith("AIza")
    ) {
      return "warning";
    }

    return "success";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800">Configured</Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800">Missing/Invalid</Badge>
        );
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Not Set</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const requiredVars = envVariables.filter((v) => v.required);
  const optionalVars = envVariables.filter((v) => !v.required);

  const requiredConfigured = requiredVars.filter(
    (v) => getStatus(v) === "success",
  ).length;
  const totalRequired = requiredVars.length;

  const overallStatus =
    requiredConfigured === totalRequired
      ? "success"
      : requiredConfigured > 0
        ? "warning"
        : "error";

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Environment Configuration Status
            </CardTitle>
            <div className="flex items-center gap-2">
              {getStatusIcon(overallStatus)}
              <span className="text-sm font-medium">
                {requiredConfigured}/{totalRequired} Required Variables
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {overallStatus === "error" && (
            <Alert className="border-red-200 bg-red-50 mb-4">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Critical configuration missing!</strong> Some core
                features will not work without required environment variables.
              </AlertDescription>
            </Alert>
          )}

          {overallStatus === "warning" && (
            <Alert className="border-yellow-200 bg-yellow-50 mb-4">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Partial configuration detected.</strong> Some features
                may be limited without all required variables.
              </AlertDescription>
            </Alert>
          )}

          {overallStatus === "success" && (
            <Alert className="border-green-200 bg-green-50 mb-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>All required variables configured!</strong> Core
                functionality should work properly.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Required Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Required Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requiredVars.map((envVar) => {
              const status = getStatus(envVar);
              const IconComponent = envVar.icon;

              return (
                <div
                  key={envVar.name}
                  className="flex items-start gap-3 p-4 border rounded-lg"
                >
                  <IconComponent className="w-5 h-5 mt-0.5 text-gray-600" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">
                        {envVar.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        {getStatusBadge(status)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {envVar.description}
                    </p>
                    {envVar.value ? (
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {envVar.value.substring(0, 20)}...
                      </code>
                    ) : (
                      <span className="text-xs text-red-600">
                        Not configured
                      </span>
                    )}
                    {envVar.setupUrl && !envVar.value && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(envVar.setupUrl, "_blank")}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Setup Guide
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Optional Variables */}
      {optionalVars.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Optional Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optionalVars.map((envVar) => {
                const status = getStatus(envVar);
                const IconComponent = envVar.icon;

                return (
                  <div
                    key={envVar.name}
                    className="flex items-start gap-3 p-4 border rounded-lg"
                  >
                    <IconComponent className="w-5 h-5 mt-0.5 text-gray-600" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">
                          {envVar.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          {getStatusBadge(status)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {envVar.description}
                      </p>
                      {envVar.value ? (
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {envVar.value.substring(0, 20)}...
                        </code>
                      ) : (
                        <span className="text-xs text-gray-500">
                          Not configured (optional)
                        </span>
                      )}
                      {envVar.setupUrl && !envVar.value && (
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(envVar.setupUrl, "_blank")
                            }
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Setup Guide
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">
            Environment Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-3">
          <p className="text-sm">
            <strong>1. Create a .env file</strong> in your project root if it
            doesn't exist
          </p>
          <p className="text-sm">
            <strong>2. Add your environment variables:</strong>
          </p>
          <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-xs">
            {envVariables.map((envVar) => (
              <div key={envVar.name}>
                {envVar.name}=
                {envVar.value ? "***configured***" : "your_value_here"}
              </div>
            ))}
          </div>
          <p className="text-sm">
            <strong>3. Restart your development server</strong> after making
            changes
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            Reload Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnvironmentChecker;
