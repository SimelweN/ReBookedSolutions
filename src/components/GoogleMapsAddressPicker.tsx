import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Search, Loader2, CheckCircle } from "lucide-react";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";

declare global {
  interface Window {
    google: any;
  }
}

interface DeliveryAddress {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  lat?: number;
  lng?: number;
  formatted_address?: string;
  place_id?: string;
}

interface GoogleMapsAddressPickerProps {
  onAddressSelect: (address: DeliveryAddress) => void;
  initialAddress?: DeliveryAddress;
  className?: string;
}

const GoogleMapsAddressPicker: React.FC<GoogleMapsAddressPickerProps> = ({
  onAddressSelect,
  initialAddress,
  className = "",
}) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAddress, setSelectedAddress] =
    useState<DeliveryAddress | null>(initialAddress || null);
  const [isSearching, setIsSearching] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);

  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);
  const geocoder = useRef<any>(null);

  useEffect(() => {
    if (isLoaded && window.google) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
      geocoder.current = new window.google.maps.Geocoder();

      // Create a dummy map element for PlacesService
      const mapDiv = document.createElement("div");
      const map = new window.google.maps.Map(mapDiv);
      placesService.current = new window.google.maps.places.PlacesService(map);
    }
  }, [isLoaded]);

  useEffect(() => {
    if (initialAddress?.formatted_address) {
      setSearchQuery(initialAddress.formatted_address);
    }
  }, [initialAddress]);

  const searchAddresses = async (input: string) => {
    if (!autocompleteService.current || input.length < 3) {
      setPredictions([]);
      return;
    }

    setIsSearching(true);

    try {
      const request = {
        input,
        componentRestrictions: { country: "ZA" }, // Restrict to South Africa
        types: ["address"],
      };

      autocompleteService.current.getPlacePredictions(
        request,
        (predictions: any[], status: any) => {
          setIsSearching(false);
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setPredictions(predictions.slice(0, 5)); // Limit to 5 results
          } else {
            setPredictions([]);
          }
        },
      );
    } catch (error) {
      console.error("Error searching addresses:", error);
      setIsSearching(false);
      setPredictions([]);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowPredictions(true);

    if (value.length >= 3) {
      searchAddresses(value);
    } else {
      setPredictions([]);
    }
  };

  const selectPrediction = async (prediction: any) => {
    setIsSearching(true);
    setShowPredictions(false);
    setSearchQuery(prediction.description);

    try {
      if (placesService.current) {
        const request = {
          placeId: prediction.place_id,
          fields: ["address_components", "formatted_address", "geometry"],
        };

        placesService.current.getDetails(request, (place: any, status: any) => {
          setIsSearching(false);

          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place
          ) {
            const address = parseAddressComponents(place);
            setSelectedAddress(address);
            onAddressSelect(address);
          } else {
            console.error("Error getting place details:", status);
          }
        });
      }
    } catch (error) {
      console.error("Error selecting address:", error);
      setIsSearching(false);
    }
  };

  const parseAddressComponents = (place: any): DeliveryAddress => {
    const components = place.address_components || [];
    let street = "";
    let city = "";
    let province = "";
    let postal_code = "";
    let country = "";

    components.forEach((component: any) => {
      const types = component.types;

      if (types.includes("street_number") || types.includes("route")) {
        street += component.long_name + " ";
      } else if (types.includes("locality") || types.includes("sublocality")) {
        city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        province = component.long_name;
      } else if (types.includes("postal_code")) {
        postal_code = component.long_name;
      } else if (types.includes("country")) {
        country = component.long_name;
      }
    });

    // If no city found, try to extract from formatted address
    if (!city && place.formatted_address) {
      const parts = place.formatted_address.split(",");
      if (parts.length >= 2) {
        city = parts[parts.length - 3]?.trim() || "";
      }
    }

    return {
      street: street.trim(),
      city: city || "Unknown",
      province: province || "Unknown",
      postal_code: postal_code || "",
      country: country || "South Africa",
      lat: place.geometry?.location?.lat(),
      lng: place.geometry?.location?.lng(),
      formatted_address: place.formatted_address,
      place_id: place.place_id,
    };
  };

  const handleManualAddressChange = (
    field: keyof DeliveryAddress,
    value: string,
  ) => {
    if (!selectedAddress) return;

    const updatedAddress = {
      ...selectedAddress,
      [field]: value,
    };

    setSelectedAddress(updatedAddress);
    onAddressSelect(updatedAddress);
  };

  if (loadError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Google Maps is not available. Please enter your address manually.
            </AlertDescription>
          </Alert>

          {/* Manual address input fallback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={selectedAddress?.street || ""}
                onChange={(e) => {
                  const address = {
                    street: e.target.value,
                    city: selectedAddress?.city || "",
                    province: selectedAddress?.province || "",
                    postal_code: selectedAddress?.postal_code || "",
                    country: "South Africa",
                  };
                  setSelectedAddress(address);
                  onAddressSelect(address);
                }}
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={selectedAddress?.city || ""}
                onChange={(e) => {
                  const address = {
                    ...selectedAddress,
                    street: selectedAddress?.street || "",
                    city: e.target.value,
                    province: selectedAddress?.province || "",
                    postal_code: selectedAddress?.postal_code || "",
                    country: "South Africa",
                  };
                  setSelectedAddress(address);
                  onAddressSelect(address);
                }}
                placeholder="Cape Town"
              />
            </div>

            <div>
              <Label htmlFor="province">Province</Label>
              <Input
                id="province"
                value={selectedAddress?.province || ""}
                onChange={(e) => {
                  const address = {
                    ...selectedAddress,
                    street: selectedAddress?.street || "",
                    city: selectedAddress?.city || "",
                    province: e.target.value,
                    postal_code: selectedAddress?.postal_code || "",
                    country: "South Africa",
                  };
                  setSelectedAddress(address);
                  onAddressSelect(address);
                }}
                placeholder="Western Cape"
              />
            </div>

            <div>
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                value={selectedAddress?.postal_code || ""}
                onChange={(e) => {
                  const address = {
                    ...selectedAddress,
                    street: selectedAddress?.street || "",
                    city: selectedAddress?.city || "",
                    province: selectedAddress?.province || "",
                    postal_code: e.target.value,
                    country: "South Africa",
                  };
                  setSelectedAddress(address);
                  onAddressSelect(address);
                }}
                placeholder="8000"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading Google Maps...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Delivery Address
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Address Search */}
        <div className="relative">
          <Label htmlFor="address-search">Search for your address</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="address-search"
              type="text"
              placeholder="Start typing your address..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
              disabled={isSearching}
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin" />
            )}
          </div>

          {/* Address Predictions */}
          {showPredictions && predictions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  onClick={() => selectPrediction(prediction)}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">
                        {prediction.structured_formatting?.main_text ||
                          prediction.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {prediction.structured_formatting?.secondary_text || ""}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Address Display & Edit */}
        {selectedAddress && (
          <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Address Selected</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={selectedAddress.street}
                  onChange={(e) =>
                    handleManualAddressChange("street", e.target.value)
                  }
                  placeholder="Street address"
                />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={selectedAddress.city}
                  onChange={(e) =>
                    handleManualAddressChange("city", e.target.value)
                  }
                  placeholder="City"
                />
              </div>

              <div>
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  value={selectedAddress.province}
                  onChange={(e) =>
                    handleManualAddressChange("province", e.target.value)
                  }
                  placeholder="Province"
                />
              </div>

              <div>
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={selectedAddress.postal_code}
                  onChange={(e) =>
                    handleManualAddressChange("postal_code", e.target.value)
                  }
                  placeholder="Postal code"
                />
              </div>
            </div>

            {selectedAddress.lat && selectedAddress.lng && (
              <div className="text-xs text-gray-500">
                Coordinates: {selectedAddress.lat.toFixed(6)},{" "}
                {selectedAddress.lng.toFixed(6)}
              </div>
            )}
          </div>
        )}

        {!selectedAddress &&
          searchQuery &&
          !isSearching &&
          predictions.length === 0 &&
          searchQuery.length >= 3 && (
            <Alert>
              <AlertDescription>
                No addresses found. Please try a different search term or check
                your spelling.
              </AlertDescription>
            </Alert>
          )}
      </CardContent>
    </Card>
  );
};

export default GoogleMapsAddressPicker;
