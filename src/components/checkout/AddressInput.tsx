import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Save } from "lucide-react";
import { CheckoutAddress } from "@/types/checkout";

interface AddressInputProps {
  initialAddress?: Partial<CheckoutAddress>;
  onAddressSubmit: (address: CheckoutAddress) => void;
  onSaveToProfile?: (address: CheckoutAddress) => void;
  loading?: boolean;
  title?: string;
}

const SOUTH_AFRICAN_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

const AddressInput: React.FC<AddressInputProps> = ({
  initialAddress = {},
  onAddressSubmit,
  onSaveToProfile,
  loading = false,
  title = "Enter Delivery Address",
}) => {
  const [address, setAddress] = useState<CheckoutAddress>({
    street: initialAddress.street || "",
    city: initialAddress.city || "",
    province: initialAddress.province || "",
    postal_code: initialAddress.postal_code || "",
    country: "South Africa",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveToProfile, setSaveToProfile] = useState(false);

  const validateAddress = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!address.street.trim()) {
      newErrors.street = "Street address is required";
    }

    if (!address.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!address.province.trim()) {
      newErrors.province = "Province is required";
    }

    if (!address.postal_code.trim()) {
      newErrors.postal_code = "Postal code is required";
    } else if (!/^\d{4}$/.test(address.postal_code.trim())) {
      newErrors.postal_code = "Postal code must be 4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAddress()) {
      return;
    }

    const cleanAddress = {
      street: address.street.trim(),
      city: address.city.trim(),
      province: address.province.trim(),
      postal_code: address.postal_code.trim(),
      country: "South Africa",
    };

    onAddressSubmit(cleanAddress);

    if (saveToProfile && onSaveToProfile) {
      onSaveToProfile(cleanAddress);
    }
  };

  const handleInputChange = (field: keyof CheckoutAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Street Address */}
          <div>
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              value={address.street}
              onChange={(e) => handleInputChange("street", e.target.value)}
              placeholder="e.g. 123 Main Street, Apartment 4B"
              className={errors.street ? "border-red-500" : ""}
            />
            {errors.street && (
              <p className="text-sm text-red-600 mt-1">{errors.street}</p>
            )}
          </div>

          {/* City */}
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={address.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="e.g. Cape Town"
              className={errors.city ? "border-red-500" : ""}
            />
            {errors.city && (
              <p className="text-sm text-red-600 mt-1">{errors.city}</p>
            )}
          </div>

          {/* Province and Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="province">Province *</Label>
              <Select
                value={address.province}
                onValueChange={(value) => handleInputChange("province", value)}
              >
                <SelectTrigger
                  className={errors.province ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {SOUTH_AFRICAN_PROVINCES.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.province && (
                <p className="text-sm text-red-600 mt-1">{errors.province}</p>
              )}
            </div>

            <div>
              <Label htmlFor="postal_code">Postal Code *</Label>
              <Input
                id="postal_code"
                value={address.postal_code}
                onChange={(e) =>
                  handleInputChange("postal_code", e.target.value)
                }
                placeholder="e.g. 8001"
                maxLength={4}
                className={errors.postal_code ? "border-red-500" : ""}
              />
              {errors.postal_code && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.postal_code}
                </p>
              )}
            </div>
          </div>

          {/* Save to Profile Option */}
          {onSaveToProfile && (
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="saveToProfile"
                checked={saveToProfile}
                onChange={(e) => setSaveToProfile(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="saveToProfile" className="text-sm font-normal">
                Save this address to my profile for future orders
              </Label>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? (
              "Processing..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Continue with this Address
              </>
            )}
          </Button>

          {/* Info Alert */}
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              This address will be used for delivery calculation and shipment.
              Make sure it's accurate and complete.
            </AlertDescription>
          </Alert>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddressInput;
