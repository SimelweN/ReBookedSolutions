import { useRef, useState, useCallback } from "react";
import {
  LoadScript,
  Autocomplete,
  GoogleMap,
  Marker,
} from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";

const libraries: "places"[] = ["places"];
const mapContainerStyle = { width: "100%", height: "300px" };

// Default center - Johannesburg, South Africa
const defaultCenter = { lat: -26.2041, lng: 28.0473 };

interface AddressData {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
}

interface GoogleMapsAddressInputProps {
  onAddressSelect: (addressData: AddressData) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  defaultValue?: string;
}

const GoogleMapsAddressInput = ({
  onAddressSelect,
  label = "Address",
  placeholder = "Type your address...",
  required = false,
  error,
  className = "",
  defaultValue = "",
}: GoogleMapsAddressInputProps) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [address, setAddress] = useState(defaultValue || "");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const extractAddressComponents = (
    place: google.maps.places.PlaceResult,
  ): Partial<AddressData> => {
    const components: Partial<AddressData> = {};

    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;

        if (types.includes("street_number") || types.includes("route")) {
          components.street =
            (components.street || "") + " " + component.long_name;
        } else if (
          types.includes("locality") ||
          types.includes("administrative_area_level_2")
        ) {
          components.city = component.long_name;
        } else if (types.includes("administrative_area_level_1")) {
          components.province = component.long_name;
        } else if (types.includes("postal_code")) {
          components.postalCode = component.long_name;
        } else if (types.includes("country")) {
          components.country = component.long_name;
        }
      }
    }

    // Clean up street address
    if (components.street) {
      components.street = components.street.trim();
    }

    return components;
  };

  const handlePlaceChanged = useCallback(() => {
    if (!autocompleteRef.current) {
      return;
    }

    setIsLoading(true);

    try {
      const place = autocompleteRef.current.getPlace();
      console.log("📍 Place data received:", place);

      if (!place) {
        console.warn("❌ No place object received");
        setIsLoading(false);
        return;
      }

      if (!place.geometry || !place.geometry.location) {
        console.warn("❌ No geometry/location in place data");
        setIsLoading(false);
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const formattedAddress = place.formatted_address || place.name || "";

      console.log("✅ Valid place data:", { lat, lng, formattedAddress });

      // Extract address components
      const addressComponents = extractAddressComponents(place);

      const addressData: AddressData = {
        formattedAddress,
        latitude: lat,
        longitude: lng,
        ...addressComponents,
      };

      setAddress(formattedAddress);
      setCoords({ lat, lng });

      console.log("🚀 Calling onAddressSelect with:", addressData);

      // Call parent callback with address data
      onAddressSelect(addressData);

      console.log("✅ Address selection completed successfully!");
    } catch (error) {
      console.error("❌ Error processing place selection:", error);
    } finally {
      setIsLoading(false);
    }
  }, [onAddressSelect]);

  const handleLoad = useCallback(
    (autocomplete: google.maps.places.Autocomplete) => {
      autocompleteRef.current = autocomplete;

      // Restrict to South Africa for better results
      autocomplete.setComponentRestrictions({ country: "za" });

      // Set fields to return
      autocomplete.setFields([
        "formatted_address",
        "geometry.location",
        "address_components",
        "name",
      ]);

      // Add multiple event listeners to ensure selection works
      autocomplete.addListener("place_changed", handlePlaceChanged);

      // Also listen for when a place is selected from dropdown
      google.maps.event.addListener(autocomplete, "place_changed", () => {
        console.log("Place changed event fired!");
        handlePlaceChanged();
      });
    },
    [handlePlaceChanged],
  );

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      loadingElement={
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading Maps...
        </div>
      }
    >
      <div className={`space-y-4 ${className}`}>
        {/* Address Input */}
        <div>
          {label && (
            <Label className="text-base font-medium">
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
          )}

          <div className="relative">
            <Autocomplete
              onLoad={handleLoad}
              onPlaceChanged={handlePlaceChanged}
            >
              <input
                type="text"
                placeholder={placeholder}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => {
                  // Handle Enter key to trigger place selection
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // Small delay to ensure autocomplete processes the selection
                    setTimeout(() => {
                      if (autocompleteRef.current) {
                        const place = autocompleteRef.current.getPlace();
                        if (place && place.geometry) {
                          console.log("Manual place selection triggered");
                          handlePlaceChanged();
                        }
                      }
                    }, 100);
                  }
                }}
                onBlur={() => {
                  // Also try to get place on blur (when user clicks away)
                  setTimeout(() => {
                    if (autocompleteRef.current) {
                      const place = autocompleteRef.current.getPlace();
                      if (place && place.geometry && !coords) {
                        console.log("Place selection on blur");
                        handlePlaceChanged();
                      }
                    }
                  }, 200);
                }}
                className={`flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? "border-red-500" : ""}`}
                required={required}
                style={{ fontSize: "16px" }} // Prevent zoom on mobile
              />
            </Autocomplete>

            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>

          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>

        {/* Address Preview */}
        {address && coords && (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Selected Address:</strong> {address}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Coordinates: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
              </p>
            </div>

            {/* Map Preview */}
            <div className="border rounded-lg overflow-hidden">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={coords}
                zoom={15}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                <Marker position={coords} title={address} />
              </GoogleMap>
            </div>
          </div>
        )}
      </div>
    </LoadScript>
  );
};

export default GoogleMapsAddressInput;
