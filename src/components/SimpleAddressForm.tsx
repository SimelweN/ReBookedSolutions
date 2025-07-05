import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SimpleAddressFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  title?: string;
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

const SimpleAddressForm = ({
  onSuccess,
  onCancel,
  title = "Add Your Address",
}: SimpleAddressFormProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    address.street.trim() &&
    address.city.trim() &&
    address.province &&
    address.postalCode.trim();

  const handleSave = async () => {
    if (!isFormValid) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!user?.id) {
      toast.error("You must be logged in");
      return;
    }

    setIsLoading(true);

    try {
      // Save to profiles table as pickup_address
      const { error } = await supabase
        .from("profiles")
        .update({
          pickup_address: {
            street: address.street.trim(),
            city: address.city.trim(),
            province: address.province,
            postalCode: address.postalCode.trim(),
            streetAddress: address.street.trim(), // For compatibility
          },
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("✅ Address saved successfully!");
      onSuccess?.();
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <MapPin className="w-5 h-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600">
          This is where buyers will collect books from you
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <MapPin className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            <strong>No Google Maps needed!</strong> Just fill in your address
            manually.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              value={address.street}
              onChange={(e) => handleInputChange("street", e.target.value)}
              placeholder="e.g., 123 Main Street"
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={address.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="e.g., Johannesburg"
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                value={address.postalCode}
                onChange={(e) =>
                  handleInputChange("postalCode", e.target.value)
                }
                placeholder="e.g., 2000"
                className="h-12"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="province">Province *</Label>
            <select
              id="province"
              value={address.province}
              onChange={(e) => handleInputChange("province", e.target.value)}
              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

        {isFormValid && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 text-sm">
              <strong>✅ Address Preview:</strong>
              <br />
              {address.street}, {address.city}, {address.province}{" "}
              {address.postalCode}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-2">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!isFormValid || isLoading}
            className="flex-1 bg-book-600 hover:bg-book-700 h-12 text-base"
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
      </CardContent>
    </Card>
  );
};

export default SimpleAddressForm;
