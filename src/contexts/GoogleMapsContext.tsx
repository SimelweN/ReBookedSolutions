import * as React from "react";
import { useContext } from "react";
type ReactNode = React.ReactNode;
import { useJsApiLoader } from "@react-google-maps/api";
// Define the libraries array with proper typing
const libraries: "places"[] = ["places"];

// Define the context type
interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

// Create the context with undefined as default
const GoogleMapsContext = React.createContext<
  GoogleMapsContextType | undefined
>(undefined);

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
  // Skip Google Maps loading in non-browser environments
  if (typeof window === "undefined") {
    const mockContext: GoogleMapsContextType = {
      isLoaded: false,
      loadError: undefined,
    };
    return (
      <GoogleMapsContext.Provider value={mockContext}>
        {children}
      </GoogleMapsContext.Provider>
    );
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Check if API key is available and we're in browser environment
  const isBrowser =
    typeof window !== "undefined" && typeof document !== "undefined";
  const hasApiKey = Boolean(apiKey && apiKey.trim() !== "" && isBrowser);

  // Only load Google Maps if we have a valid API key and we're in browser
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey || "",
    libraries,
    preventGoogleFontsLoading: true,
    // Skip loading if no API key or not in browser
    skipApiLoad: !hasApiKey || !isBrowser,
  });

  // Provide fallback state for non-browser or no API key
  const value: GoogleMapsContextType = {
    isLoaded: hasApiKey && isBrowser ? isLoaded : false,
    loadError:
      hasApiKey && isBrowser
        ? loadError
        : isBrowser
          ? new Error("Google Maps API key not configured")
          : new Error("Google Maps not available in Workers environment"),
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
