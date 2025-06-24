import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, AlertTriangle, ExternalLink, Settings } from "lucide-react";

interface GoogleMapsErrorHandlerProps {
  error?: Error;
  showSetupInstructions?: boolean;
  variant?: "minimal" | "detailed";
}

const GoogleMapsErrorHandler: React.FC<GoogleMapsErrorHandlerProps> = ({
  error,
  showSetupInstructions = false,
  variant = "minimal",
}) => {
  const isApiKeyError =
    error?.message?.includes("API key") ||
    error?.message?.includes("not configured") ||
    !import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!error && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return null; // No error, API key exists
  }

  if (variant === "minimal") {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <span className="font-medium">Address autocomplete unavailable</span>
          <br />
          Google Maps API key is not configured. You can still enter addresses
          manually.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <MapPin className="w-5 h-5" />
          Google Maps Configuration Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-yellow-700">
          <p className="mb-2">
            <strong>Address autocomplete is currently unavailable.</strong>
          </p>
          <p className="text-sm">
            {isApiKeyError
              ? "Google Maps API key is missing or invalid."
              : "There was an error loading Google Maps services."}
          </p>
        </div>

        {showSetupInstructions && isApiKeyError && (
          <div className="space-y-3">
            <h4 className="font-medium text-yellow-800">Setup Instructions:</h4>
            <ol className="text-sm text-yellow-700 space-y-2 list-decimal list-inside">
              <li>
                Get a Google Maps API key from{" "}
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-yellow-600 underline"
                  onClick={() =>
                    window.open(
                      "https://developers.google.com/maps/documentation/javascript/get-api-key",
                      "_blank",
                    )
                  }
                >
                  Google Cloud Console
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </li>
              <li>Enable the "Places API" for your project</li>
              <li>Add your API key to the environment variables:</li>
            </ol>

            <div className="bg-yellow-100 p-3 rounded border text-sm font-mono">
              VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    "https://developers.google.com/maps/documentation/javascript/get-api-key",
                    "_blank",
                  )
                }
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Get API Key
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                <Settings className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-yellow-600 border-t border-yellow-200 pt-3">
          <strong>Note:</strong> You can still enter addresses manually. The
          form will work normally, just without autocomplete suggestions.
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMapsErrorHandler;
