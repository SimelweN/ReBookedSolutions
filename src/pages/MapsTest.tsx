import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const MapsTest = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [googleMapsReady, setGoogleMapsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // Check API key
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    setApiKey(key);

    const results = [];

    // Test 1: Environment variable
    results.push({
      test: "Environment Variable",
      result: key ? "✅ Found" : "❌ Missing",
      details: key
        ? `Key starts with: ${key.substring(0, 10)}...`
        : "VITE_GOOGLE_MAPS_API_KEY not found",
      status: key ? "success" : "error",
    });

    // Test 2: Google object
    results.push({
      test: "Google Maps Object",
      result: window.google ? "✅ Available" : "❌ Not loaded",
      details: window.google
        ? "window.google exists"
        : "Google Maps script not loaded",
      status: window.google ? "success" : "warning",
    });

    // Test 3: Console errors
    const originalError = console.error;
    const errors: string[] = [];
    console.error = (...args) => {
      errors.push(args.join(" "));
      originalError(...args);
    };

    setTimeout(() => {
      console.error = originalError;
      results.push({
        test: "Console Errors",
        result:
          errors.length === 0 ? "✅ No errors" : `❌ ${errors.length} errors`,
        details:
          errors.length > 0
            ? errors.join(", ")
            : "No Google Maps related errors",
        status: errors.length === 0 ? "success" : "error",
      });

      setTestResults(results);
    }, 2000);
  }, []);

  const loadGoogleMapsManually = () => {
    if (!apiKey) {
      setError("No API key available");
      return;
    }

    setError(null);

    // Remove existing script if any
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]',
    );
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Set up callback
    (window as any).initGoogleMaps = () => {
      setScriptLoaded(true);
      setGoogleMapsReady(true);
      console.log("Google Maps loaded successfully!");
    };

    script.onload = () => {
      console.log("Google Maps script loaded");
      setScriptLoaded(true);
    };

    script.onerror = (e) => {
      console.error("Failed to load Google Maps script:", e);
      setError(
        "Failed to load Google Maps script. Check API key and network connection.",
      );
    };

    document.head.appendChild(script);
  };

  const testAutocomplete = () => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      setError("Google Maps Places API not available");
      return;
    }

    try {
      // Create a temporary input element
      const input = document.createElement("input");
      document.body.appendChild(input);

      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        types: ["address"],
        componentRestrictions: { country: "za" },
      });

      console.log("Autocomplete created successfully!", autocomplete);
      setError(null);

      // Clean up
      document.body.removeChild(input);
    } catch (err) {
      console.error("Autocomplete test failed:", err);
      setError(`Autocomplete test failed: ${err}`);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-book-800 mb-4">
            Google Maps API Test Page
          </h1>
          <p className="text-gray-600">
            Debugging Google Maps integration issues
          </p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              {apiKey ? (
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              )}
              <h3 className="font-semibold mb-2">API Key</h3>
              <Badge variant={apiKey ? "default" : "destructive"}>
                {apiKey ? "Available" : "Missing"}
              </Badge>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              {scriptLoaded ? (
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              )}
              <h3 className="font-semibold mb-2">Script Loaded</h3>
              <Badge variant={scriptLoaded ? "default" : "secondary"}>
                {scriptLoaded ? "Loaded" : "Not Loaded"}
              </Badge>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              {googleMapsReady ? (
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              )}
              <h3 className="font-semibold mb-2">Maps Ready</h3>
              <Badge variant={googleMapsReady ? "default" : "secondary"}>
                {googleMapsReady ? "Ready" : "Not Ready"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-6">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Diagnostic Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{result.test}</div>
                      <div className="text-sm text-gray-600">
                        {result.details}
                      </div>
                    </div>
                    <Badge
                      variant={
                        result.status === "success"
                          ? "default"
                          : result.status === "error"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {result.result}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={loadGoogleMapsManually}
                disabled={!apiKey}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Load Google Maps Script
              </Button>

              <Button
                onClick={testAutocomplete}
                disabled={!googleMapsReady}
                variant="outline"
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Test Autocomplete
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              <p>
                <strong>Step 1:</strong> Click "Load Google Maps Script" to
                manually load the API
              </p>
              <p>
                <strong>Step 2:</strong> Once loaded, click "Test Autocomplete"
                to verify Places API
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Environment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Mode:</strong> {import.meta.env.MODE}
              </div>
              <div>
                <strong>Dev:</strong> {import.meta.env.DEV ? "Yes" : "No"}
              </div>
              <div>
                <strong>Prod:</strong> {import.meta.env.PROD ? "Yes" : "No"}
              </div>
              <div>
                <strong>Base URL:</strong> {import.meta.env.BASE_URL}
              </div>
              <div className="md:col-span-2">
                <strong>API Key (first 20 chars):</strong>{" "}
                {apiKey ? apiKey.substring(0, 20) + "..." : "Not found"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MapsTest;
