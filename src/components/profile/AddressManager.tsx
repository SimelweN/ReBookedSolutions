import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Edit, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AddressData {
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  instructions?: string;
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
  const [savedAddress, setSavedAddress] = useState<AddressData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<AddressData>({
    streetAddress: "",
    city: "",
    province: "",
    postalCode: "",
    instructions: "",
  });

  // Load saved address on component mount
  useEffect(() => {
    loadSavedAddress();
  }, [user?.id]);

  const loadSavedAddress = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("pickup_address")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading address:", error);
        setSavedAddress(null);
        return;
      }

      if (data?.pickup_address) {
        const address = data.pickup_address as any;
        const formattedAddress: AddressData = {
          streetAddress: address.streetAddress || address.street || "",
          city: address.city || "",
          province: address.province || "",
          postalCode: address.postalCode || address.postal_code || "",
          instructions: address.instructions || "",
        };
        setSavedAddress(formattedAddress);
        setFormData(formattedAddress);
      }
    } catch (error) {
      console.error("Error loading address:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof AddressData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.streetAddress.trim()) {
      toast.error("Street address is required");
      return;
    }
    if (!formData.city.trim()) {
      toast.error("City is required");
      return;
    }
    if (!formData.province) {
      toast.error("Province is required");
      return;
    }
    if (!formData.postalCode.trim()) {
      toast.error("Postal code is required");
      return;
    }

    setIsSaving(true);
    try {
      const addressToSave = {
        streetAddress: formData.streetAddress.trim(),
        city: formData.city.trim(),
        province: formData.province,
        postalCode: formData.postalCode.trim(),
        instructions: formData.instructions?.trim() || "",
      };

      const { error } = await supabase
        .from("profiles")
        .update({
          pickup_address: addressToSave,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user!.id);

      if (error) {
        throw error;
      }

      setSavedAddress(addressToSave);
      setIsEditing(false);
      toast.success("Address saved successfully!");
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (savedAddress) {
      setFormData(savedAddress);
    } else {
      setFormData({
        streetAddress: "",
        city: "",
        province: "",
        postalCode: "",
        instructions: "",
      });
    }
    setIsEditing(false);
  };

  const formatAddress = (address: AddressData) => {
    return `${address.streetAddress}, ${address.city}, ${address.province} ${address.postalCode}`;
  };

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
            <span className="ml-2">Loading address...</span>
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
          {savedAddress && !isEditing && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing && savedAddress ? (
          // Display saved address
          <div className="space-y-3">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="font-medium mb-1">Saved Address:</div>
                <div>{formatAddress(savedAddress)}</div>
                {savedAddress.instructions && (
                  <div className="mt-2 text-sm">
                    <strong>Instructions:</strong> {savedAddress.instructions}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          // Address form
          <div className="space-y-4">
            {!savedAddress && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Add your address to start listing books. This will be your
                  pickup location for buyers.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="streetAddress">
                  Street Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) =>
                    handleInputChange("streetAddress", e.target.value)
                  }
                  placeholder="e.g., 123 Main Street"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="e.g., Cape Town"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="province">
                    Province <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.province}
                    onValueChange={(value) =>
                      handleInputChange("province", value)
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
                <Label htmlFor="postalCode">
                  Postal Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) =>
                    handleInputChange("postalCode", e.target.value)
                  }
                  placeholder="e.g., 8001"
                  required
                />
              </div>

              <div>
                <Label htmlFor="instructions">
                  Additional Instructions (Optional)
                </Label>
                <textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) =>
                    handleInputChange("instructions", e.target.value)
                  }
                  placeholder="e.g., Gate code 1234, Unit 5B, Ring bell, Collection from side entrance..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add pickup instructions, gate codes, unit numbers, or other
                  helpful details for buyers
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-book-600 hover:bg-book-700"
              >
                {isSaving ? "Saving..." : "Save Address"}
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
