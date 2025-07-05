import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GoogleMapsAddressInput from "@/components/GoogleMapsAddressInput";
import { MapPin, AlertCircle, Edit } from "lucide-react";

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

interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

interface ImprovedAddressInputProps {
  onAddressUpdate: (address: Address) => void;
  initialAddress?: Address;
  title?: string;
  description?: string;
  error?: string;
  className?: string;
}

const SOUTH_AFRICAN_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

const ImprovedAddressInput = ({
  onAddressUpdate,
  initialAddress,
  title = "Address",
  description = "Enter your address details",
  error,
  className = "",
}: ImprovedAddressInputProps) => {
  const [address, setAddress] = useState<Address>(
    initialAddress || {
      street: "",
      city: "",
      province: "",
      postalCode: "",
    },
  );

  const [useManualEntry, setUseManualEntry] = useState(false);
  const [hasSelectedAddress, setHasSelectedAddress] = useState(
    !!initialAddress?.street,
  );
  const [showGoogleMaps, setShowGoogleMaps] = useState(true);

  // Check if Google Maps API key is available
  const hasGoogleMapsKey = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!hasGoogleMapsKey) {
      setUseManualEntry(true);
      setShowGoogleMaps(false);
    }
  }, [hasGoogleMapsKey]);

  const handleGoogleMapsSelect = (addressData: AddressData) => {
    console.log("Google Maps address selected:", addressData);

    const newAddress: Address = {
      street:
        addressData.street || addressData.formattedAddress.split(",")[0] || "",
      city: addressData.city || "",
      province: addressData.province || "",
      postalCode: addressData.postalCode || "",
    };

    console.log("Processed address:", newAddress);

    setAddress(newAddress);
    setHasSelectedAddress(true);

    // Always call onAddressUpdate so parent can track changes
    onAddressUpdate(newAddress);
  };

  const handleManualUpdate = (field: keyof Address, value: string) => {
    const newAddress = { ...address, [field]: value };
    setAddress(newAddress);

    // Check if address is complete
    const isComplete = Object.values(newAddress).every(
      (val) => val.trim() !== "",
    );

    if (isComplete) {
      setHasSelectedAddress(true);
    }

    // Always call update so parent can track changes
    onAddressUpdate(newAddress);
  };

  const formatAddressForDisplay = (addr: Address) => {
    if (!addr.street) return "";
    return `${addr.street}, ${addr.city}, ${addr.province} ${addr.postalCode}`;
  };

  const isAddressComplete =
    address.street && address.city && address.province && address.postalCode;

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Google Maps Status */}
        {!hasGoogleMapsKey && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Google Maps is not configured. Using manual address entry.
            </AlertDescription>
          </Alert>
        )}

        {/* Address Entry Method Toggle */}
        {hasGoogleMapsKey && showGoogleMaps && (
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <Checkbox
              id="manual-entry"
              checked={useManualEntry}
              onCheckedChange={(checked) => setUseManualEntry(checked === true)}
            />
            <Label htmlFor="manual-entry" className="text-sm">
              Enter address manually instead of using Google Maps
            </Label>
          </div>
        )}

        {/* Google Maps Address Input */}
        {hasGoogleMapsKey && showGoogleMaps && !useManualEntry ? (
          <div className="space-y-3">
            <GoogleMapsAddressInput
              onAddressSelect={handleGoogleMapsSelect}
              placeholder="Start typing your address..."
              required
              error={error}
              defaultValue={formatAddressForDisplay(address)}
            />
          </div>
        ) : (
          /* Manual Address Entry */
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  value={address.street}
                  onChange={(e) => handleManualUpdate("street", e.target.value)}
                  placeholder="123 Main Street"
                  required
                  className={error ? "border-red-500" : ""}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={address.city}
                    onChange={(e) => handleManualUpdate("city", e.target.value)}
                    placeholder="Johannesburg"
                    required
                    className={error ? "border-red-500" : ""}
                  />
                </div>

                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={address.postalCode}
                    onChange={(e) =>
                      handleManualUpdate("postalCode", e.target.value)
                    }
                    placeholder="2000"
                    required
                    className={error ? "border-red-500" : ""}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="province">Province *</Label>
                <select
                  id="province"
                  value={address.province}
                  onChange={(e) =>
                    handleManualUpdate("province", e.target.value)
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select Province</option>
                  {SOUTH_AFRICAN_PROVINCES.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )}

        {/* Address Confirmation */}
        {hasSelectedAddress && isAddressComplete && (
          <Alert className="border-green-200 bg-green-50">
            <MapPin className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>✅ Address Confirmed:</strong>
              <br />
              {formatAddressForDisplay(address)}
            </AlertDescription>
          </Alert>
        )}

        {/* Warning if incomplete */}
        {!isAddressComplete && address.street && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Please complete all address fields to continue.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        {hasGoogleMapsKey && useManualEntry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setUseManualEntry(false)}
            className="w-full"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Switch to Google Maps
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ImprovedAddressInput;
