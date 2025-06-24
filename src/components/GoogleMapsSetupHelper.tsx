import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertTriangle,
  Settings,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";

const GoogleMapsSetupHelper: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

  const currentApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasApiKey = Boolean(currentApiKey);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const testApiKey = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key to test");
      return;
    }

    if (!apiKey.startsWith("AIza")) {
      toast.error(
        "Invalid API key format. Google Maps API keys start with 'AIza'",
      );
      return;
    }

    toast.success(
      "API key format looks correct! Add it to your .env file and restart the server.",
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Google Maps API Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            {hasApiKey ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">
                  API Key Configured
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-700 font-medium">
                  API Key Not Configured
                </span>
              </>
            )}
          </div>

          {hasApiKey ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Current API key:{" "}
                <code className="bg-gray-100 px-1 rounded">
                  {currentApiKey.substring(0, 12)}...
                </code>
              </p>
              <p className="text-sm text-green-600">
                ✅ Address autocomplete is available in forms
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                No API key found. Address forms will work but without
                autocomplete suggestions.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <Settings className="w-4 h-4 mr-2" />
                {showInstructions ? "Hide" : "Show"} Setup Instructions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      {(!hasApiKey || showInstructions) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Google Maps API Setup Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-blue-800">
            <div className="space-y-3">
              <h4 className="font-medium">Step 1: Get an API Key</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm ml-4">
                <li>
                  Go to{" "}
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-blue-600 underline"
                    onClick={() =>
                      window.open(
                        "https://console.cloud.google.com/google/maps-apis/overview",
                        "_blank",
                      )
                    }
                  >
                    Google Cloud Console
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </li>
                <li>Create a new project or select an existing one</li>
                <li>Enable the "Maps JavaScript API" and "Places API"</li>
                <li>Create credentials → API Key</li>
                <li>
                  Restrict the API key to your domain (optional but recommended)
                </li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Step 2: Add to Environment</h4>
              <p className="text-sm">
                Add this line to your <code>.env</code> file:
              </p>
              <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-sm flex items-center justify-between">
                <span>VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard("VITE_GOOGLE_MAPS_API_KEY=")}
                  className="ml-2"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Step 3: Test Your API Key</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Paste your API key here to test format"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button onClick={testApiKey} variant="outline">
                  Test Format
                </Button>
              </div>
            </div>

            <Alert className="border-blue-300 bg-blue-100">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <strong>Important:</strong> After adding the API key to your
                .env file, restart your development server for the changes to
                take effect.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  "https://console.cloud.google.com/google/maps-apis/overview",
                  "_blank",
                )
              }
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Cloud Console
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  "https://developers.google.com/maps/documentation/javascript/get-api-key",
                  "_blank",
                )
              }
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              API Key Guide
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  "https://developers.google.com/maps/documentation/places/web-service/overview",
                  "_blank",
                )
              }
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Places API Docs
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <Settings className="w-3 h-3 mr-1" />
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleMapsSetupHelper;
