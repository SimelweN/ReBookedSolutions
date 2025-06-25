import * as React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Settings } from "lucide-react";

const ConfigurationChecker: React.FC = () => {
  const checks = {
    paystack: {
      name: "Paystack Public Key",
      value: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      required: true,
      description: "Required for payment processing",
    },
    supabase: {
      name: "Supabase URL",
      value: import.meta.env.VITE_SUPABASE_URL,
      required: true,
      description: "Required for database connection",
    },
    supabaseKey: {
      name: "Supabase Anon Key",
      value: import.meta.env.VITE_SUPABASE_ANON_KEY,
      required: true,
      description: "Required for database authentication",
    },
    googleMaps: {
      name: "Google Maps API Key",
      value: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      required: false,
      description: "Required for address validation",
    },
  };

  const requiredMissing = Object.values(checks).filter(
    (check) => check.required && !check.value,
  );
  const optionalMissing = Object.values(checks).filter(
    (check) => !check.required && !check.value,
  );

  // Only show if there are missing required configs
  if (requiredMissing.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Settings className="w-5 h-5" />
            Configuration Issues
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {requiredMissing.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Missing Required Configuration:</strong>
                <ul className="mt-2 space-y-1">
                  {requiredMissing.map((check) => (
                    <li key={check.name} className="text-sm">
                      • {check.name}: {check.description}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {optionalMissing.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Optional Configuration:</strong>
                <ul className="mt-2 space-y-1">
                  {optionalMissing.map((check) => (
                    <li key={check.name} className="text-sm">
                      • {check.name}: {check.description}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">
              Configuration Status:
            </h4>
            {Object.entries(checks).map(([key, check]) => (
              <div
                key={key}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700">{check.name}</span>
                <Badge
                  variant={
                    check.value
                      ? "default"
                      : check.required
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {check.value ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  {check.value ? "✓" : "Missing"}
                </Badge>
              </div>
            ))}
          </div>

          <div className="text-xs text-gray-600 mt-3 p-2 bg-gray-100 rounded">
            <strong>Fix:</strong> Add missing environment variables to your{" "}
            <code>.env.local</code> file and restart the development server.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigurationChecker;
