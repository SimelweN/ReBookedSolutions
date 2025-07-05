import React, { useState } from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, CheckCircle, Loader2, Search } from "lucide-react";

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

interface ModernAddressAutocompleteProps {
  onAddressSelect: (addressData: AddressData) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  defaultValue?: string;
}

const ModernAddressAutocomplete: React.FC<ModernAddressAutocompleteProps> = ({
  onAddressSelect,
  label = "Address",
  placeholder = "Start typing your address...",
  required = false,
  error,
  className = "",
  defaultValue = "",
}) => {
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      // Restrict to South Africa
      componentRestrictions: { country: "za" },
    },
    debounce: 300, // Wait 300ms before making API call
  });

  const extractAddressComponents = (
    place: google.maps.GeocoderResult,
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

  const handleSelect =
    (suggestion: google.maps.places.AutocompletePrediction) => async () => {
      setIsProcessing(true);

      try {
        // Set the value in the input
        setValue(suggestion.description, false);
        clearSuggestions();

        console.log("🎯 Selected suggestion:", suggestion.description);

        // Get detailed place information
        const results = await getGeocode({ address: suggestion.description });
        const { lat, lng } = await getLatLng(results[0]);

        console.log("📍 Geocoded result:", results[0]);
        console.log("🗺️ Coordinates:", { lat, lng });

        // Extract address components
        const addressComponents = extractAddressComponents(results[0]);

        const addressData: AddressData = {
          formattedAddress: suggestion.description,
          latitude: lat,
          longitude: lng,
          ...addressComponents,
        };

        console.log("✅ Final address data:", addressData);

        setSelectedAddress(addressData);
        onAddressSelect(addressData);
      } catch (error) {
        console.error("❌ Error processing address selection:", error);
      } finally {
        setIsProcessing(false);
      }
    };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <Label className="text-base font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={value}
            onChange={handleInputChange}
            disabled={!ready}
            placeholder={ready ? placeholder : "Loading Google Maps..."}
            className={`pl-10 h-12 text-base ${error ? "border-red-500" : ""}`}
            required={required}
            style={{ fontSize: "16px" }} // Prevent zoom on mobile
          />
          {(isProcessing || !ready) && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>

        {/* Suggestions Dropdown */}
        {status === "OK" && data.length > 0 && (
          <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg border">
            <CardContent className="p-0">
              {data.map((suggestion) => {
                const {
                  place_id,
                  structured_formatting: { main_text, secondary_text },
                  description,
                } = suggestion;

                return (
                  <div
                    key={place_id}
                    onClick={handleSelect(suggestion)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {main_text}
                        </div>
                        {secondary_text && (
                          <div className="text-sm text-gray-500 truncate">
                            {secondary_text}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Selected Address Preview */}
      {selectedAddress && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>✅ Address Selected:</strong>
            <br />
            {selectedAddress.formattedAddress}
            <br />
            <small className="text-green-600">
              Coordinates: {selectedAddress.latitude.toFixed(6)},{" "}
              {selectedAddress.longitude.toFixed(6)}
            </small>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {!ready && (
        <Alert className="border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertDescription className="text-blue-800">
            <strong>Loading Google Maps...</strong>
            <br />
            Please wait while we initialize the address search.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ModernAddressAutocomplete;
