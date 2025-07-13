import React, { useState, useEffect } from "react";

type ReactNode = React.ReactNode;

// Define the libraries array with proper typing
const libraries: "places"[] = ["places"];

// Stable reference to prevent re-initialization
let librariesRef: "places"[] | undefined;

// Conditional imports for Workers compatibility
let GoogleMap: any, LoadScript: any, useGoogleMap: any;

// Only import Google Maps in browser environment
if (typeof window !== "undefined") {
  try {
    const googleMapsApi = require("@react-google-maps/api");
    GoogleMap = googleMapsApi.GoogleMap;
    LoadScript = googleMapsApi.LoadScript;
    useGoogleMap = googleMapsApi.useGoogleMap;
  } catch (error) {
    console.warn("Google Maps API not available:", error);
  }
}

// Provider props interface
interface GoogleMapsProviderProps {
  children: ReactNode;
}

// Google Maps Provider component using LoadScript
export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({
  children,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Skip Google Maps loading in non-browser environments
  if (typeof window === "undefined") {
    return <>{children}</>;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Check if API key is available and we're in browser environment
  const isBrowser =
    typeof window !== "undefined" && typeof document !== "undefined";
  const hasApiKey = Boolean(apiKey && apiKey.trim() !== "" && isBrowser);

  // Use stable libraries reference to prevent re-initialization
  if (!librariesRef) {
    librariesRef = libraries;
  }

  // Initialize maps safely after component mount
  useEffect(() => {
    if (hasApiKey && isBrowser) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasApiKey, isBrowser]);

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

  if (hasError) {
    console.error(
      "Google Maps failed to load, rendering children without maps",
    );
    return <>{children}</>;
  }

  if (!isReady) {
    return <>{children}</>;
  }

  // Wrap LoadScript with error boundary to prevent initialization crashes
  try {
    return (
      <LoadScript
        googleMapsApiKey={apiKey || ""}
        libraries={librariesRef}
        preventGoogleFontsLoading={true}
        loadingElement={<div>Loading Google Maps...</div>}
        onLoad={() => {
          console.log("Google Maps loaded successfully");
        }}
        onError={(error) => {
          console.error("Google Maps LoadScript error:", error);
          setHasError(true);
        }}
      >
        {children}
      </LoadScript>
    );
  } catch (error) {
    console.error("Google Maps provider initialization error:", error);
    setHasError(true);
    return <>{children}</>;
  }
};

export default GoogleMapsProvider;
