// Conditional imports for Workers compatibility
let GoogleMap: any, useGoogleMap: any;

// Dynamic import for Workers compatibility
const loadGoogleMapsApi = async () => {
  if (typeof window !== "undefined" && !GoogleMap) {
    try {
      const googleMapsApi = await import("@react-google-maps/api");
      GoogleMap = googleMapsApi.GoogleMap;
      useGoogleMap = googleMapsApi.useGoogleMap;
    } catch (error) {
      console.warn("Google Maps API not available:", error);
    }
  }
};

// Example MapConsumerComponent that properly uses useGoogleMap hook
function MapConsumerComponent() {
  if (typeof window === "undefined" || !useGoogleMap) {
    return null;
  }

  const map = useGoogleMap();
  console.log("Google Map:", map);

  return null;
}

// Example of proper Google Maps usage that relies on GoogleMapsProvider context
const GoogleMapsExample = () => {
  // Skip in Workers environment
  if (typeof window === "undefined" || !GoogleMap) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-600">
          Google Maps not available in this environment
        </p>
      </div>
    );
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600">Google Maps API key not configured</p>
      </div>
    );
  }

  // No LoadScript here - rely on GoogleMapsProvider from context
  return (
    <GoogleMap
      id="map"
      center={{ lat: -25.746, lng: 28.188 }}
      zoom={10}
      mapContainerStyle={{ width: "100%", height: "400px" }}
    >
      <MapConsumerComponent />
    </GoogleMap>
  );
};

export { MapConsumerComponent };
export default GoogleMapsExample;
