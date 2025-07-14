import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface AddressData {
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface BasicAddressInputProps {
  onAddressSelect: (addressData: AddressData) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  defaultValue?: string;
  className?: string;
}

const BasicAddressInput: React.FC<BasicAddressInputProps> = ({
  onAddressSelect,
  placeholder = "Enter your address",
  label = "Address",
  required = false,
  defaultValue = "",
  className = "",
}) => {
  const [streetAddress, setStreetAddress] = useState(defaultValue);
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("South Africa");

  const handleSubmit = () => {
    if (streetAddress.trim()) {
      const addressData: AddressData = {
        streetAddress: streetAddress.trim(),
        city: city.trim() || "Unknown City",
        province: province.trim() || "Unknown Province",
        postalCode: postalCode.trim() || "0000",
        country: country.trim() || "South Africa",
      };
      onAddressSelect(addressData);
    }
  };

  const handleStreetAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setStreetAddress(value);

    // Auto-submit when user finishes typing (with debounce)
    if (value.trim()) {
      setTimeout(() => {
        handleSubmit();
      }, 500);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="street-address" className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id="street-address"
          type="text"
          placeholder={placeholder}
          value={streetAddress}
          onChange={handleStreetAddressChange}
          required={required}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onBlur={handleSubmit}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="province">Province</Label>
          <Input
            id="province"
            type="text"
            placeholder="Province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            onBlur={handleSubmit}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postal-code">Postal Code</Label>
          <Input
            id="postal-code"
            type="text"
            placeholder="Postal Code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            onBlur={handleSubmit}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            onBlur={handleSubmit}
            disabled
          />
        </div>
      </div>
    </div>
  );
};

export default BasicAddressInput;
