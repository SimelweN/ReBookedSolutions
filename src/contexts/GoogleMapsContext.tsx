import React from "react";
import { GoogleMap, LoadScript, useGoogleMap } from "@react-google-maps/api";

type ReactNode = React.ReactNode;

// Define the libraries array with proper typing
const libraries: "places"[] = ["places"];

// Provider props interface
interface GoogleMapsProviderProps {
  children: ReactNode;
}

// Google Maps Provider component using LoadScript
export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({
  children,
}) => {
  // Skip Google Maps loading in non-browser environments
  if (typeof window === "undefined") {
    return <>{children}</>;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Check if API key is available and we're in browser environment
  const isBrowser =
    typeof window !== "undefined" && typeof document !== "undefined";
  const hasApiKey = Boolean(apiKey && apiKey.trim() !== "" && isBrowser);

  // Log warning in development
  if (!hasApiKey && import.meta.env.DEV) {
    console.warn(
      "🗺️ Google Maps API key not configured. Address autocomplete will not work.\n" +
        "To enable Google Maps features:\n" +
        "1. Get an API key from: https://developers.google.com/maps/documentation/javascript/get-api-key\n" +
        "2. Add VITE_GOOGLE_MAPS_API_KEY=your_api_key to your .env file\n" +
        "3. Enable Places API in Google Cloud Console",
    );
    return <>{children}</>;
  }

  // Wrap LoadScript with error boundary to prevent initialization crashes
  try {
    return (
      <LoadScript
        googleMapsApiKey={apiKey || ""}
        libraries={libraries}
        preventGoogleFontsLoading={true}
        loadingElement={<div>Loading Google Maps...</div>}
        onError={(error) => {
          console.error("Google Maps LoadScript error:", error);
        }}
      >
        {children}
      </LoadScript>
    );
  } catch (error) {
    console.error("Google Maps provider initialization error:", error);
    return <>{children}</>;
  }
};

export default GoogleMapsProvider;
