import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

interface QuickAddressSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
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

const QuickAddressSetup = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Add Your Address",
  description = "We need your address so buyers know where to collect books from you.",
}: QuickAddressSetupProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState<Address>({
    street: "",
    city: "",
    province: "",
    postalCode: "",
  });
  const [errors, setErrors] = useState<Partial<Address>>({});

  const handleInputChange = (field: keyof Address, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Address> = {};

    if (!address.street.trim()) newErrors.street = "Street address is required";
    if (!address.city.trim()) newErrors.city = "City is required";
    if (!address.province) newErrors.province = "Province is required";
    if (!address.postalCode.trim())
      newErrors.postalCode = "Postal code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user?.id) {
      toast.error("You must be logged in to save your address");
      return;
    }

    setIsLoading(true);

    try {
      // Save as pickup address in the profiles table
      const { error } = await supabase
        .from("profiles")
        .update({
          pickup_address: {
            street: address.street,
            city: address.city,
            province: address.province,
            postalCode: address.postalCode,
            streetAddress: address.street, // Also add as streetAddress for compatibility
          },
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Address saved successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    address.street.trim() &&
    address.city.trim() &&
    address.province &&
    address.postalCode.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Important:</strong> This is where buyers will collect
              books from you. Make sure it's accurate!
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={address.street}
                onChange={(e) => handleInputChange("street", e.target.value)}
                placeholder="123 Main Street"
                className={errors.street ? "border-red-500" : ""}
              />
              {errors.street && (
                <p className="text-sm text-red-500 mt-1">{errors.street}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={address.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Johannesburg"
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && (
                  <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  value={address.postalCode}
                  onChange={(e) =>
                    handleInputChange("postalCode", e.target.value)
                  }
                  placeholder="2000"
                  className={errors.postalCode ? "border-red-500" : ""}
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.postalCode}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="province">Province *</Label>
              <select
                id="province"
                value={address.province}
                onChange={(e) => handleInputChange("province", e.target.value)}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.province ? "border-red-500" : ""
                }`}
              >
                <option value="">Select Province</option>
                {SOUTH_AFRICAN_PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              {errors.province && (
                <p className="text-sm text-red-500 mt-1">{errors.province}</p>
              )}
            </div>
          </div>

          {isFormValid && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Address Preview:</strong>
                <br />
                {address.street}, {address.city}, {address.province}{" "}
                {address.postalCode}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isFormValid || isLoading}
              className="flex-1 bg-book-600 hover:bg-book-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Save Address
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddressSetup;
