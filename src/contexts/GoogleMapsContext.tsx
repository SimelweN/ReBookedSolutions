import * as React from "react";
import { createContext, useContext, ReactNode } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

// Ensure React is available before using createContext
if (typeof React === "undefined" || !React.createContext) {
  throw new Error(
    "React is not properly loaded. Please check your imports and bundler configuration.",
  );
}

// Define the libraries array with proper typing
const libraries: "places"[] = ["places"];

// Define the context type
interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

// Create the context with undefined as default
const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(
  undefined,
);

// Custom hook to use the Google Maps context
export const useGoogleMaps = (): GoogleMapsContextType => {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error("useGoogleMaps must be used within a GoogleMapsProvider");
  }
  return context;
};

// Provider props interface
interface GoogleMapsProviderProps {
  children: ReactNode;
}

// Google Maps Provider component
export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({
  children,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Check if API key is available
  const hasApiKey = Boolean(apiKey && apiKey.trim() !== "");

  // Only load Google Maps if we have a valid API key
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey || "",
    libraries,
    preventGoogleFontsLoading: true,
    // Skip loading if no API key
    skipApiLoad: !hasApiKey,
  });

  // If no API key, provide fallback state
  const value: GoogleMapsContextType = {
    isLoaded: hasApiKey ? isLoaded : false,
    loadError: hasApiKey
      ? loadError
      : new Error("Google Maps API key not configured"),
  };

  // Log warning in development
  if (!hasApiKey && import.meta.env.DEV) {
    console.warn(
      "🗺️ Google Maps API key not configured. Address autocomplete will not work.\n" +
        "To enable Google Maps features:\n" +
        "1. Get an API key from: https://developers.google.com/maps/documentation/javascript/get-api-key\n" +
        "2. Add VITE_GOOGLE_MAPS_API_KEY=your_api_key to your .env file\n" +
        "3. Enable Places API in Google Cloud Console",
    );
  }

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export default GoogleMapsProvider;
