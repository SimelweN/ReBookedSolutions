import { GoogleMap, LoadScript, useGoogleMap } from "@react-google-maps/api";

// Example MapConsumerComponent that properly uses useGoogleMap hook
function MapConsumerComponent() {
  const map = useGoogleMap();
  console.log("Google Map:", map);

  return null;
}

// Example of proper Google Maps usage following the guidelines
const GoogleMapsExample = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600">Google Maps API key not configured</p>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        id="map"
        center={{ lat: -25.746, lng: 28.188 }}
        zoom={10}
        mapContainerStyle={{ width: "100%", height: "400px" }}
      >
        <MapConsumerComponent />
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapsExample;
