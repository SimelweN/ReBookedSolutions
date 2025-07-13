import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Edit,
  CheckCircle,
  AlertCircle,
  Truck,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import BasicAddressInput from "@/components/BasicAddressInput";

interface AddressData {
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  instructions?: string;
}

interface UserAddresses {
  pickup_address: AddressData | null;
  shipping_address: AddressData | null;
  addresses_same: boolean;
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

const AddressManager = () => {
  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState<UserAddresses>({
    pickup_address: null,
    shipping_address: null,
    addresses_same: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sameAsPickup, setSameAsPickup] = useState(false);

  const [pickupAddress, setPickupAddress] = useState<AddressData>({
    streetAddress: "",
    city: "",
    province: "",
    postalCode: "",
    instructions: "",
  });

  const [shippingAddress, setShippingAddress] = useState<AddressData>({
    streetAddress: "",
    city: "",
    province: "",
    postalCode: "",
    instructions: "",
  });

  // Load saved addresses on component mount
  useEffect(() => {
    loadSavedAddresses();
  }, [user?.id]);

  // Sync shipping address with pickup when sameAsPickup is checked
  useEffect(() => {
    if (sameAsPickup) {
      setShippingAddress(pickupAddress);
    }
  }, [sameAsPickup, pickupAddress]);

  const loadSavedAddresses = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("pickup_address, shipping_address, addresses_same")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading addresses:", error);
        setSavedAddresses({
          pickup_address: null,
          shipping_address: null,
          addresses_same: false,
        });
        return;
      }

      const pickup = data?.pickup_address as AddressData | null;
      const shipping = data?.shipping_address as AddressData | null;
      const same = data?.addresses_same || false;

      setSavedAddresses({
        pickup_address: pickup,
        shipping_address: shipping,
        addresses_same: same,
      });

      if (pickup) {
        setPickupAddress(pickup);
      }
      if (shipping) {
        setShippingAddress(shipping);
      }
      setSameAsPickup(same);
    } catch (error) {
      console.error("Error loading addresses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickupAddressSelect = (addressData: any) => {
    const formattedAddress: AddressData = {
      streetAddress: addressData.formattedAddress || "",
      city: addressData.city || "",
      province: addressData.province || "",
      postalCode: addressData.postalCode || "",
      instructions: pickupAddress.instructions, // Keep existing instructions
    };
    setPickupAddress(formattedAddress);
  };

  const handleShippingAddressSelect = (addressData: any) => {
    const formattedAddress: AddressData = {
      streetAddress: addressData.formattedAddress || "",
      city: addressData.city || "",
      province: addressData.province || "",
      postalCode: addressData.postalCode || "",
      instructions: shippingAddress.instructions, // Keep existing instructions
    };
    setShippingAddress(formattedAddress);
  };

  const handleInputChange = (
    addressType: "pickup" | "shipping",
    field: keyof AddressData,
    value: string,
  ) => {
    if (addressType === "pickup") {
      setPickupAddress((prev) => ({ ...prev, [field]: value }));
    } else {
      setShippingAddress((prev) => ({ ...prev, [field]: value }));
    }
  };

  const validateAddress = (address: AddressData, type: string): boolean => {
    if (!address.streetAddress.trim()) {
      toast.error(`${type} street address is required`);
      return false;
    }
    if (!address.city.trim()) {
      toast.error(`${type} city is required`);
      return false;
    }
    if (!address.province) {
      toast.error(`${type} province is required`);
      return false;
    }
    if (!address.postalCode.trim()) {
      toast.error(`${type} postal code is required`);
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    // Validate pickup address
    if (!validateAddress(pickupAddress, "Pickup")) return;

    // Validate shipping address if different from pickup
    if (!sameAsPickup && !validateAddress(shippingAddress, "Shipping")) return;

    setIsSaving(true);
    try {
      const finalShippingAddress = sameAsPickup
        ? pickupAddress
        : shippingAddress;

      const { error } = await supabase
        .from("profiles")
        .update({
          pickup_address: pickupAddress,
          shipping_address: finalShippingAddress,
          addresses_same: sameAsPickup,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user!.id);

      if (error) {
        throw error;
      }

      setSavedAddresses({
        pickup_address: pickupAddress,
        shipping_address: finalShippingAddress,
        addresses_same: sameAsPickup,
      });
      setIsEditing(false);
      toast.success("Addresses saved successfully!");
    } catch (error) {
      console.error("Error saving addresses:", error);
      toast.error("Failed to save addresses. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (savedAddresses.pickup_address) {
      setPickupAddress(savedAddresses.pickup_address);
    }
    if (savedAddresses.shipping_address) {
      setShippingAddress(savedAddresses.shipping_address);
    }
    setSameAsPickup(savedAddresses.addresses_same);
    setIsEditing(false);
  };

  const formatAddress = (address: AddressData) => {
    return `${address.streetAddress}, ${address.city}, ${address.province} ${address.postalCode}`;
  };

  const hasAddresses =
    savedAddresses.pickup_address && savedAddresses.shipping_address;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-book-600"></div>
            <span className="ml-2">Loading addresses...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Address Information
          </div>
          {hasAddresses && !isEditing && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isEditing && hasAddresses ? (
          // Display saved addresses
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-3">
                  <div>
                    <div className="font-medium mb-1 flex items-center">
                      <Home className="h-4 w-4 mr-2" />
                      Pickup Address:
                    </div>
                    <div>{formatAddress(savedAddresses.pickup_address!)}</div>
                    {savedAddresses.pickup_address!.instructions && (
                      <div className="mt-1 text-sm">
                        <strong>Instructions:</strong>{" "}
                        {savedAddresses.pickup_address!.instructions}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="font-medium mb-1 flex items-center">
                      <Truck className="h-4 w-4 mr-2" />
                      Shipping Address:
                    </div>
                    {savedAddresses.addresses_same ? (
                      <div className="text-sm text-green-600">
                        Same as pickup address
                      </div>
                    ) : (
                      <>
                        <div>
                          {formatAddress(savedAddresses.shipping_address!)}
                        </div>
                        {savedAddresses.shipping_address!.instructions && (
                          <div className="mt-1 text-sm">
                            <strong>Instructions:</strong>{" "}
                            {savedAddresses.shipping_address!.instructions}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          // Address forms
          <div className="space-y-6">
            {!hasAddresses && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Add your pickup and shipping addresses to start listing and
                  buying books.
                </AlertDescription>
              </Alert>
            )}

            {/* Pickup Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Home className="h-5 w-5 mr-2 text-book-600" />
                Pickup Address
              </h3>
              <p className="text-sm text-gray-600">
                Where buyers will collect books from you
              </p>

              <BasicAddressInput
                onAddressSelect={handlePickupAddressSelect}
                placeholder="Search for your pickup address..."
                defaultValue={pickupAddress.streetAddress}
                label="Street Address"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickup-city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pickup-city"
                    value={pickupAddress.city}
                    onChange={(e) =>
                      handleInputChange("pickup", "city", e.target.value)
                    }
                    placeholder="e.g., Cape Town"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="pickup-province">
                    Province <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={pickupAddress.province}
                    onValueChange={(value) =>
                      handleInputChange("pickup", "province", value)
                    }
                  >
                    <SelectTrigger>
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
                </div>
              </div>

              <div>
                <Label htmlFor="pickup-postal">
                  Postal Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pickup-postal"
                  value={pickupAddress.postalCode}
                  onChange={(e) =>
                    handleInputChange("pickup", "postalCode", e.target.value)
                  }
                  placeholder="e.g., 8001"
                  required
                />
              </div>

              <div>
                <Label htmlFor="pickup-instructions">
                  Pickup Instructions (Optional)
                </Label>
                <textarea
                  id="pickup-instructions"
                  value={pickupAddress.instructions}
                  onChange={(e) =>
                    handleInputChange("pickup", "instructions", e.target.value)
                  }
                  placeholder="e.g., Gate code 1234, Unit 5B, Ring bell, Collection from side entrance..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Same as pickup checkbox */}
            <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                id="same-address"
                checked={sameAsPickup}
                onCheckedChange={(checked) =>
                  setSameAsPickup(checked as boolean)
                }
              />
              <Label htmlFor="same-address" className="font-medium">
                📦 My shipping address is the same as my pickup address
              </Label>
            </div>

            {/* Shipping Address */}
            {!sameAsPickup && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-book-600" />
                  Shipping Address
                </h3>
                <p className="text-sm text-gray-600">
                  Where you want items delivered when buying books
                </p>

                <GoogleMapsAddressInput
                  onAddressSelect={handleShippingAddressSelect}
                  placeholder="Search for your shipping address..."
                  defaultValue={shippingAddress.streetAddress}
                  label="Street Address"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shipping-city">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="shipping-city"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        handleInputChange("shipping", "city", e.target.value)
                      }
                      placeholder="e.g., Cape Town"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="shipping-province">
                      Province <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={shippingAddress.province}
                      onValueChange={(value) =>
                        handleInputChange("shipping", "province", value)
                      }
                    >
                      <SelectTrigger>
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
                  </div>
                </div>

                <div>
                  <Label htmlFor="shipping-postal">
                    Postal Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="shipping-postal"
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      handleInputChange(
                        "shipping",
                        "postalCode",
                        e.target.value,
                      )
                    }
                    placeholder="e.g., 8001"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="shipping-instructions">
                    Delivery Instructions (Optional)
                  </Label>
                  <textarea
                    id="shipping-instructions"
                    value={shippingAddress.instructions}
                    onChange={(e) =>
                      handleInputChange(
                        "shipping",
                        "instructions",
                        e.target.value,
                      )
                    }
                    placeholder="e.g., Gate code 1234, Unit 5B, Ring bell, Leave at front door..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-book-600 hover:bg-book-700"
              >
                {isSaving ? "Saving..." : "Save Addresses"}
              </Button>
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressManager;
