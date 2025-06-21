import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import GoogleMapsAddressInput from "@/components/GoogleMapsAddressInput";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

interface GoogleMapsAddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pickupAddress: Address, shippingAddress: Address) => Promise<void>;
  addressData?: {
    pickup_address?: Address;
    shipping_address?: Address;
  } | null;
  isLoading?: boolean;
}

const GoogleMapsAddressDialog = ({
  isOpen,
  onClose,
  onSave,
  addressData,
  isLoading = false,
}: GoogleMapsAddressDialogProps) => {
  const [pickupAddress, setPickupAddress] = useState<Address>({
    street: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const [useSameAddress, setUseSameAddress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [useManualEntry, setUseManualEntry] = useState(false);

  useEffect(() => {
    if (isOpen && addressData) {
      // Handle pickup address
      if (addressData.pickup_address) {
        const pickupData = addressData.pickup_address as any;
        setPickupAddress({
          street: pickupData.street || "",
          city: pickupData.city || "",
          province: pickupData.province || "",
          postalCode: pickupData.postalCode || pickupData.postal_code || "",
        });
      } else {
        setPickupAddress({
          street: "",
          city: "",
          province: "",
          postalCode: "",
        });
      }

      // Handle shipping address
      if (addressData.shipping_address) {
        const shippingData = addressData.shipping_address as any;
        setShippingAddress({
          street: shippingData.street || "",
          city: shippingData.city || "",
          province: shippingData.province || "",
          postalCode: shippingData.postalCode || shippingData.postal_code || "",
        });
      } else {
        setShippingAddress({
          street: "",
          city: "",
          province: "",
          postalCode: "",
        });
      }
    }
  }, [isOpen, addressData]);

  useEffect(() => {
    if (useSameAddress) {
      setShippingAddress({ ...pickupAddress });
    }
  }, [useSameAddress, pickupAddress]);

  const handleGoogleMapsPickupSelect = (addressData: AddressData) => {
    const newPickupAddress: Address = {
      street:
        addressData.street || addressData.formattedAddress.split(",")[0] || "",
      city: addressData.city || "",
      province: addressData.province || "",
      postalCode: addressData.postalCode || "",
    };

    setPickupAddress(newPickupAddress);

    if (useSameAddress) {
      setShippingAddress({ ...newPickupAddress });
    }
  };

  const handleGoogleMapsShippingSelect = (addressData: AddressData) => {
    const newShippingAddress: Address = {
      street:
        addressData.street || addressData.formattedAddress.split(",")[0] || "",
      city: addressData.city || "",
      province: addressData.province || "",
      postalCode: addressData.postalCode || "",
    };

    setShippingAddress(newShippingAddress);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate pickup address
    if (
      !pickupAddress.street ||
      !pickupAddress.city ||
      !pickupAddress.province ||
      !pickupAddress.postalCode
    ) {
      toast.error("Please fill in all pickup address fields");
      return;
    }

    // Validate shipping address if not using same address
    if (
      !useSameAddress &&
      (!shippingAddress.street ||
        !shippingAddress.city ||
        !shippingAddress.province ||
        !shippingAddress.postalCode)
    ) {
      toast.error("Please fill in all shipping address fields");
      return;
    }

    setIsSaving(true);
    try {
      const finalShippingAddress = useSameAddress
        ? pickupAddress
        : shippingAddress;
      await onSave(pickupAddress, finalShippingAddress);
      toast.success("Addresses updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error saving addresses:", error);
      toast.error("Failed to save addresses. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatAddressForDisplay = (address: Address) => {
    if (!address.street) return "";
    return `${address.street}, ${address.city}, ${address.province} ${address.postalCode}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Edit Addresses
          </DialogTitle>
          <DialogDescription>
            Update your pickup and shipping addresses. Use Google Maps for
            accurate location selection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Entry Method Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="manual-entry"
              checked={useManualEntry}
              onCheckedChange={(checked) => setUseManualEntry(checked === true)}
            />
            <Label htmlFor="manual-entry" className="text-sm">
              Use manual address entry instead of Google Maps
            </Label>
          </div>

          {/* Pickup Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pickup Address</h3>

            {!useManualEntry ? (
              <GoogleMapsAddressInput
                onAddressSelect={handleGoogleMapsPickupSelect}
                label="Pickup Address"
                placeholder="Enter your pickup address..."
                required
                defaultValue={formatAddressForDisplay(pickupAddress)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickup-street">Street Address *</Label>
                  <Input
                    id="pickup-street"
                    value={pickupAddress.street}
                    onChange={(e) =>
                      setPickupAddress({
                        ...pickupAddress,
                        street: e.target.value,
                      })
                    }
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pickup-city">City *</Label>
                  <Input
                    id="pickup-city"
                    value={pickupAddress.city}
                    onChange={(e) =>
                      setPickupAddress({
                        ...pickupAddress,
                        city: e.target.value,
                      })
                    }
                    placeholder="Johannesburg"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pickup-province">Province *</Label>
                  <Input
                    id="pickup-province"
                    value={pickupAddress.province}
                    onChange={(e) =>
                      setPickupAddress({
                        ...pickupAddress,
                        province: e.target.value,
                      })
                    }
                    placeholder="Gauteng"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pickup-postal">Postal Code *</Label>
                  <Input
                    id="pickup-postal"
                    value={pickupAddress.postalCode}
                    onChange={(e) =>
                      setPickupAddress({
                        ...pickupAddress,
                        postalCode: e.target.value,
                      })
                    }
                    placeholder="2000"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Same Address Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="same-address"
              checked={useSameAddress}
              onCheckedChange={(checked) => setUseSameAddress(checked === true)}
            />
            <Label htmlFor="same-address">
              Shipping address is the same as pickup address
            </Label>
          </div>

          {/* Shipping Address */}
          {!useSameAddress && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Shipping Address</h3>

              {!useManualEntry ? (
                <GoogleMapsAddressInput
                  onAddressSelect={handleGoogleMapsShippingSelect}
                  label="Shipping Address"
                  placeholder="Enter your shipping address..."
                  required
                  defaultValue={formatAddressForDisplay(shippingAddress)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shipping-street">Street Address *</Label>
                    <Input
                      id="shipping-street"
                      value={shippingAddress.street}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          street: e.target.value,
                        })
                      }
                      placeholder="123 Main Street"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shipping-city">City *</Label>
                    <Input
                      id="shipping-city"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          city: e.target.value,
                        })
                      }
                      placeholder="Johannesburg"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shipping-province">Province *</Label>
                    <Input
                      id="shipping-province"
                      value={shippingAddress.province}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          province: e.target.value,
                        })
                      }
                      placeholder="Gauteng"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shipping-postal">Postal Code *</Label>
                    <Input
                      id="shipping-postal"
                      value={shippingAddress.postalCode}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          postalCode: e.target.value,
                        })
                      }
                      placeholder="2000"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isLoading}
              className="bg-book-600 hover:bg-book-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Addresses"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleMapsAddressDialog;
