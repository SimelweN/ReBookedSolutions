import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ProvinceSelector } from "@/components/ui/province-selector";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  SimpleAddress,
  UserAddresses,
  saveSimpleUserAddresses,
} from "@/services/simplifiedAddressService";

interface SimplifiedAddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialAddresses?: UserAddresses | null;
  onSuccess?: () => void;
}

export const SimplifiedAddressDialog: React.FC<
  SimplifiedAddressDialogProps
> = ({ isOpen, onClose, userId, initialAddresses, onSuccess }) => {
  const [pickupAddress, setPickupAddress] = useState<SimpleAddress>({
    streetAddress: "",
    city: "",
    province: "",
    postalCode: "",
    complex: "",
    unitNumber: "",
    suburb: "",
  });

  const [shippingAddress, setShippingAddress] = useState<SimpleAddress>({
    streetAddress: "",
    city: "",
    province: "",
    postalCode: "",
    complex: "",
    unitNumber: "",
    suburb: "",
  });

  const [sameAsPickup, setSameAsPickup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial addresses when dialog opens
  useEffect(() => {
    if (isOpen && initialAddresses) {
      if (initialAddresses.pickup_address) {
        setPickupAddress({
          streetAddress: initialAddresses.pickup_address.streetAddress || "",
          city: initialAddresses.pickup_address.city || "",
          province: initialAddresses.pickup_address.province || "",
          postalCode: initialAddresses.pickup_address.postalCode || "",
          complex: initialAddresses.pickup_address.complex || "",
          unitNumber: initialAddresses.pickup_address.unitNumber || "",
          suburb: initialAddresses.pickup_address.suburb || "",
        });
      }

      if (initialAddresses.shipping_address) {
        setShippingAddress({
          streetAddress: initialAddresses.shipping_address.streetAddress || "",
          city: initialAddresses.shipping_address.city || "",
          province: initialAddresses.shipping_address.province || "",
          postalCode: initialAddresses.shipping_address.postalCode || "",
          complex: initialAddresses.shipping_address.complex || "",
          unitNumber: initialAddresses.shipping_address.unitNumber || "",
          suburb: initialAddresses.shipping_address.suburb || "",
        });
      }

      setSameAsPickup(initialAddresses.addresses_same || false);
    }
  }, [isOpen, initialAddresses]);

  // Update shipping address when "same as pickup" is checked
  useEffect(() => {
    if (sameAsPickup) {
      setShippingAddress({ ...pickupAddress });
    }
  }, [sameAsPickup, pickupAddress]);

  const handleSave = async () => {
    // Validate pickup address
    if (
      !pickupAddress.streetAddress.trim() ||
      !pickupAddress.city.trim() ||
      !pickupAddress.province.trim() ||
      !pickupAddress.postalCode.trim()
    ) {
      toast.error("Please fill in all required pickup address fields");
      return;
    }

    // Validate shipping address if different
    if (!sameAsPickup) {
      if (
        !shippingAddress.streetAddress.trim() ||
        !shippingAddress.city.trim() ||
        !shippingAddress.province.trim() ||
        !shippingAddress.postalCode.trim()
      ) {
        toast.error("Please fill in all required shipping address fields");
        return;
      }
    }

    setIsLoading(true);
    try {
      await saveSimpleUserAddresses(
        userId,
        pickupAddress,
        shippingAddress,
        sameAsPickup,
      );
      toast.success("Addresses saved successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving addresses:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save addresses",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-book-600" />
            Set Your Addresses
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pickup Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-book-700">
              📍 Pickup Address (Where buyers collect books)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickup-complex">
                  Complex/Building (Optional)
                </Label>
                <Input
                  id="pickup-complex"
                  value={pickupAddress.complex}
                  onChange={(e) =>
                    setPickupAddress((prev) => ({
                      ...prev,
                      complex: e.target.value,
                    }))
                  }
                  placeholder="e.g., University Heights"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="pickup-unit">Unit/Apt Number (Optional)</Label>
                <Input
                  id="pickup-unit"
                  value={pickupAddress.unitNumber}
                  onChange={(e) =>
                    setPickupAddress((prev) => ({
                      ...prev,
                      unitNumber: e.target.value,
                    }))
                  }
                  placeholder="e.g., 4B, Room 102"
                  disabled={isLoading}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="pickup-street">Street Address *</Label>
                <Input
                  id="pickup-street"
                  value={pickupAddress.streetAddress}
                  onChange={(e) =>
                    setPickupAddress((prev) => ({
                      ...prev,
                      streetAddress: e.target.value,
                    }))
                  }
                  placeholder="e.g., 123 Main Street"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="pickup-suburb">Suburb/Area (Optional)</Label>
                <Input
                  id="pickup-suburb"
                  value={pickupAddress.suburb}
                  onChange={(e) =>
                    setPickupAddress((prev) => ({
                      ...prev,
                      suburb: e.target.value,
                    }))
                  }
                  placeholder="e.g., Rosebank, Observatory"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="pickup-city">City *</Label>
                <Input
                  id="pickup-city"
                  value={pickupAddress.city}
                  onChange={(e) =>
                    setPickupAddress((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                  placeholder="e.g., Cape Town"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <ProvinceSelector
                  label="Province *"
                  value={pickupAddress.province}
                  onValueChange={(value) =>
                    setPickupAddress((prev) => ({ ...prev, province: value }))
                  }
                  placeholder="Select province"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="pickup-postal">Postal Code *</Label>
                <Input
                  id="pickup-postal"
                  value={pickupAddress.postalCode}
                  onChange={(e) =>
                    setPickupAddress((prev) => ({
                      ...prev,
                      postalCode: e.target.value,
                    }))
                  }
                  placeholder="e.g., 7700"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Same as pickup checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="same-address"
              checked={sameAsPickup}
              onCheckedChange={(checked) => setSameAsPickup(checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="same-address" className="font-medium">
              📦 My shipping address is the same as pickup address
            </Label>
          </div>

          {/* Shipping Address - only show if different */}
          {!sameAsPickup && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-book-700">
                🚚 Shipping Address (Where books are delivered to you)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipping-complex">
                    Complex/Building (Optional)
                  </Label>
                  <Input
                    id="shipping-complex"
                    value={shippingAddress.complex}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        complex: e.target.value,
                      }))
                    }
                    placeholder="e.g., University Heights"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="shipping-unit">
                    Unit/Apt Number (Optional)
                  </Label>
                  <Input
                    id="shipping-unit"
                    value={shippingAddress.unitNumber}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        unitNumber: e.target.value,
                      }))
                    }
                    placeholder="e.g., 4B, Room 102"
                    disabled={isLoading}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="shipping-street">Street Address *</Label>
                  <Input
                    id="shipping-street"
                    value={shippingAddress.streetAddress}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        streetAddress: e.target.value,
                      }))
                    }
                    placeholder="e.g., 456 Another Street"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="shipping-suburb">
                    Suburb/Area (Optional)
                  </Label>
                  <Input
                    id="shipping-suburb"
                    value={shippingAddress.suburb}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        suburb: e.target.value,
                      }))
                    }
                    placeholder="e.g., Claremont, Wynberg"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="shipping-city">City *</Label>
                  <Input
                    id="shipping-city"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    placeholder="e.g., Cape Town"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <ProvinceSelector
                    label="Province *"
                    value={shippingAddress.province}
                    onValueChange={(value) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        province: value,
                      }))
                    }
                    placeholder="Select province"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="shipping-postal">Postal Code *</Label>
                  <Input
                    id="shipping-postal"
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        postalCode: e.target.value,
                      }))
                    }
                    placeholder="e.g., 7800"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Addresses"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SimplifiedAddressDialog;
