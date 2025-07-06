import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, CheckCircle } from "lucide-react";

interface DeliveryAddress {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

interface DeliveryOption {
  id: string;
  name: string;
  price: number;
  days: string;
  description: string;
}

interface DeliverySelectorProps {
  onAddressChange: (address: DeliveryAddress) => void;
  onDeliverySelect: (option: DeliveryOption) => void;
  selectedDelivery?: DeliveryOption;
  initialAddress?: DeliveryAddress;
}

const DeliverySelector: React.FC<DeliverySelectorProps> = ({
  onAddressChange,
  onDeliverySelect,
  selectedDelivery,
  initialAddress,
}) => {
  const [address, setAddress] = useState<DeliveryAddress>(
    initialAddress || {
      street: "",
      city: "",
      province: "",
      postal_code: "",
      country: "South Africa",
    },
  );

  const deliveryOptions: DeliveryOption[] = [
    {
      id: "standard",
      name: "Standard Delivery",
      price: 85,
      days: "3-5",
      description: "Standard courier delivery service",
    },
    {
      id: "express",
      name: "Express Delivery",
      price: 120,
      days: "1-2",
      description: "Priority express delivery service",
    },
  ];

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    const updatedAddress = {
      ...address,
      [field]: value,
    };
    setAddress(updatedAddress);
    onAddressChange(updatedAddress);
  };

  const handleDeliverySelect = (option: DeliveryOption) => {
    onDeliverySelect(option);
  };

  return (
    <div className="space-y-6">
      {/* Address Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={address.street}
                onChange={(e) => handleAddressChange("street", e.target.value)}
                placeholder="123 Main Street"
                required
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={address.city}
                onChange={(e) => handleAddressChange("city", e.target.value)}
                placeholder="Cape Town"
                required
              />
            </div>

            <div>
              <Label htmlFor="province">Province</Label>
              <Input
                id="province"
                value={address.province}
                onChange={(e) =>
                  handleAddressChange("province", e.target.value)
                }
                placeholder="Western Cape"
                required
              />
            </div>

            <div>
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                value={address.postal_code}
                onChange={(e) =>
                  handleAddressChange("postal_code", e.target.value)
                }
                placeholder="8000"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Delivery Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deliveryOptions.map((option) => (
              <div
                key={option.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedDelivery?.id === option.id
                    ? "border-book-500 bg-book-50"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                }`}
                onClick={() => handleDeliverySelect(option)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {option.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {option.days} business days
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">
                      R{option.price.toFixed(2)}
                    </div>

                    {selectedDelivery?.id === option.id && (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle className="w-4 h-4 text-book-600" />
                        <span className="text-xs text-book-600 font-medium">
                          Selected
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> All deliveries are tracked and insured.
              You'll receive tracking information via email once your order is
              shipped.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliverySelector;
