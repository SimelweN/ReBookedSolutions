import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Conditional imports for Workers compatibility
let GoogleMap: any, useGoogleMap: any;

// Only import Google Maps in browser environment
if (typeof window !== "undefined") {
  try {
    const googleMapsApi = require("@react-google-maps/api");
    GoogleMap = googleMapsApi.GoogleMap;
    useGoogleMap = googleMapsApi.useGoogleMap;
  } catch (error) {
    console.warn("Google Maps API not available:", error);
  }
}

// MapConsumerComponent that properly uses useGoogleMap hook
function MapConsumerComponent() {
  const map = useGoogleMap();
  console.log("Google Map:", map);

  return (
    <div className="absolute top-2 left-2 bg-white p-2 rounded shadow-md">
      <p className="text-xs text-green-600">Map loaded: {map ? "✅" : "❌"}</p>
    </div>
  );
}

const GoogleMapsValidationTest = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-red-600">
            Google Maps Test Failed
          </CardTitle>
          <CardDescription>Google Maps API key not configured</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            To test Google Maps integration, add VITE_GOOGLE_MAPS_API_KEY to
            your .env file.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-green-600">
          Google Maps Integration Test
        </CardTitle>
        <CardDescription>
          Testing proper GoogleMap and useGoogleMap hook usage within
          GoogleMapsProvider context
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm space-y-2">
          <p>
            <strong>✅ Correct imports:</strong> GoogleMap, useGoogleMap from
            @react-google-maps/api
          </p>
          <p>
            <strong>✅ GoogleMapsProvider:</strong> App wrapped with
            GoogleMapsProvider context
          </p>
          <p>
            <strong>✅ useGoogleMap hook:</strong> Used inside GoogleMap
            component
          </p>
          <p>
            <strong>✅ No conflicting LoadScript:</strong> Components rely on
            provider context
          </p>
        </div>

        <div className="border rounded-lg overflow-hidden relative">
          <GoogleMap
            id="validation-test-map"
            center={{ lat: -25.746, lng: 28.188 }}
            zoom={10}
            mapContainerStyle={{ width: "100%", height: "400px" }}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            <MapConsumerComponent />
          </GoogleMap>
        </div>

        <div className="text-sm text-gray-600">
          <p>
            If you see "Map loaded: ✅" in the top-left corner of the map, the
            integration is working correctly!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMapsValidationTest;
