import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  getSimpleUserAddresses,
  saveSimpleUserAddresses,
  SimpleAddress,
} from "@/services/simplifiedAddressService";
import { toast } from "sonner";

export const AddressDebugger = () => {
  const { user } = useAuth();
  const [addressData, setAddressData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkAddresses = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      console.log("Checking addresses for user:", user.id);
      const addresses = await getSimpleUserAddresses(user.id);
      console.log("Retrieved addresses:", addresses);
      setAddressData(addresses);
      toast.success("Addresses retrieved successfully");
    } catch (error) {
      console.error("Error checking addresses:", error);
      toast.error("Failed to retrieve addresses");
    } finally {
      setLoading(false);
    }
  };

  const testSaveAddress = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const testPickupAddress: SimpleAddress = {
        streetAddress: "123 Test Street",
        city: "Cape Town",
        province: "Western Cape",
        postalCode: "7700",
        complex: "Test Complex",
        unitNumber: "A1",
        suburb: "Observatory",
      };

      const testShippingAddress: SimpleAddress = {
        streetAddress: "456 Shipping Street",
        city: "Cape Town",
        province: "Western Cape",
        postalCode: "7800",
        complex: "Shipping Complex",
        unitNumber: "B2",
        suburb: "Claremont",
      };

      console.log("Testing address save...");
      const result = await saveSimpleUserAddresses(
        user.id,
        testPickupAddress,
        testShippingAddress,
        false,
      );
      console.log("Save result:", result);
      setAddressData(result);
      toast.success("Test addresses saved successfully");
    } catch (error) {
      console.error("Error testing address save:", error);
      toast.error("Failed to save test addresses");
    } finally {
      setLoading(false);
    }
  };

  if (!user?.id) {
    return (
      <Card>
        <CardContent className="p-4">
          <p>Please log in to test address functions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Address Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={checkAddresses} disabled={loading}>
            Check Current Addresses
          </Button>
          <Button
            onClick={testSaveAddress}
            disabled={loading}
            variant="outline"
          >
            Test Save Address
          </Button>
        </div>

        {addressData && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Address Data:</h3>
            <pre className="text-xs overflow-auto whitespace-pre-wrap">
              {JSON.stringify(addressData, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressDebugger;
