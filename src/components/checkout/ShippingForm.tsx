import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Truck } from "lucide-react";
import { toast } from "sonner";

interface AddressData {
  complex?: string;
  unitNumber?: string;
  streetAddress?: string;
  suburb?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

interface SavedAddresses {
  pickup_address?: AddressData;
  shipping_address?: AddressData;
}

interface DeliveryQuote {
  courier: string;
  serviceName: string;
  price: number;
  estimatedDays: string;
}

interface ShippingFormProps {
  savedAddresses: SavedAddresses | null;
  shippingAddress: {
    complex: string;
    unitNumber: string;
    streetAddress: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
  };
  setShippingAddress: React.Dispatch<
    React.SetStateAction<{
      complex: string;
      unitNumber: string;
      streetAddress: string;
      suburb: string;
      city: string;
      province: string;
      postalCode: string;
    }>
  >;
  selectedAddress: "pickup" | "shipping" | "new";
  onAddressSelection: (type: "pickup" | "shipping" | "new") => void;
  deliveryQuotes: DeliveryQuote[];
  selectedDelivery: DeliveryQuote | null;
  setSelectedDelivery: (delivery: DeliveryQuote | null) => void;
  onGetQuotes: () => void;
  loadingQuotes: boolean;
}

const ShippingForm = ({
  savedAddresses,
  shippingAddress,
  setShippingAddress,
  selectedAddress,
  onAddressSelection,
  deliveryQuotes,
  selectedDelivery,
  setSelectedDelivery,
  onGetQuotes,
  loadingQuotes,
}: ShippingFormProps) => {
  const provinces = [
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Shipping Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {savedAddresses &&
            (savedAddresses.pickup_address ||
              savedAddresses.shipping_address) && (
              <div>
                <Label className="text-base font-medium">
                  Use saved address
                </Label>
                <Select
                  value={selectedAddress}
                  onValueChange={(value: "pickup" | "shipping" | "new") =>
                    onAddressSelection(value)
                  }
                >
                  <SelectTrigger className="mt-2 min-h-[44px]">
                    <SelectValue placeholder="Select an address" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedAddresses.pickup_address && (
                      <SelectItem value="pickup">Pickup Address</SelectItem>
                    )}
                    {savedAddresses.shipping_address && (
                      <SelectItem value="shipping">Shipping Address</SelectItem>
                    )}
                    <SelectItem value="new">Enter new address</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="complex">Complex/Building</Label>
              <Input
                id="complex"
                value={shippingAddress.complex}
                onChange={(e) =>
                  setShippingAddress((prev) => ({
                    ...prev,
                    complex: e.target.value,
                  }))
                }
                placeholder="Optional"
                className="w-full min-h-[44px]"
              />
            </div>
            <div>
              <Label htmlFor="unitNumber">Unit Number</Label>
              <Input
                id="unitNumber"
                value={shippingAddress.unitNumber}
                onChange={(e) =>
                  setShippingAddress((prev) => ({
                    ...prev,
                    unitNumber: e.target.value,
                  }))
                }
                placeholder="Optional"
                className="w-full min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="streetAddress">Street Address *</Label>
            <Input
              id="streetAddress"
              value={shippingAddress.streetAddress}
              onChange={(e) =>
                setShippingAddress((prev) => ({
                  ...prev,
                  streetAddress: e.target.value,
                }))
              }
              placeholder="123 Main Street"
              required
              className="w-full min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="suburb">Suburb *</Label>
              <Input
                id="suburb"
                value={shippingAddress.suburb}
                onChange={(e) =>
                  setShippingAddress((prev) => ({
                    ...prev,
                    suburb: e.target.value,
                  }))
                }
                placeholder="Suburb"
                required
                className="w-full min-h-[44px]"
              />
            </div>
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }))
                }
                placeholder="City"
                required
                className="w-full min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="province">Province *</Label>
              <Select
                value={shippingAddress.province}
                onValueChange={(value) =>
                  setShippingAddress((prev) => ({
                    ...prev,
                    province: value,
                  }))
                }
              >
                <SelectTrigger className="w-full min-h-[44px]">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  setShippingAddress((prev) => ({
                    ...prev,
                    postalCode: e.target.value,
                  }))
                }
                placeholder="1234"
                required
                className="w-full min-h-[44px]"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={onGetQuotes}
              disabled={loadingQuotes || !shippingAddress.streetAddress}
              className="w-full"
              variant="outline"
            >
              <Truck className="mr-2 h-4 w-4" />
              {loadingQuotes ? "Getting Quotes..." : "Get Delivery Quotes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Options */}
      {deliveryQuotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Delivery Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedDelivery?.courier || ""}
              onValueChange={(value) => {
                const quote = deliveryQuotes.find((q) => q.courier === value);
                setSelectedDelivery(quote || null);
              }}
            >
              {deliveryQuotes.map((quote) => (
                <div
                  key={quote.courier}
                  className="flex items-center space-x-2 p-3 border rounded-lg"
                >
                  <RadioGroupItem value={quote.courier} id={quote.courier} />
                  <div className="flex-1">
                    <Label htmlFor={quote.courier} className="cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{quote.serviceName}</p>
                          <p className="text-sm text-gray-600">
                            Estimated delivery: {quote.estimatedDays} days
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">R{quote.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShippingForm;
