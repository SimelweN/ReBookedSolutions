import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const AddressSystemTest = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState({
    canLoadAddress: false,
    canSaveAddress: false,
    addressDisplaysCorrectly: false,
    canEditAddress: false,
  });
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    if (!user?.id) return;

    setIsRunning(true);
    const results = { ...testResults };

    try {
      // Test 1: Can load address
      console.log("🧪 Testing address loading...");
      const { data: loadData, error: loadError } = await supabase
        .from("profiles")
        .select("pickup_address")
        .eq("id", user.id)
        .single();

      results.canLoadAddress = !loadError;
      console.log(
        "✅ Address loading:",
        results.canLoadAddress ? "PASS" : "FAIL",
      );

      // Test 2: Can save address
      console.log("🧪 Testing address saving...");
      const testAddress = {
        streetAddress: "123 Test Street",
        city: "Test City",
        province: "Gauteng",
        postalCode: "1234",
        instructions: "Test instructions",
      };

      const { error: saveError } = await supabase
        .from("profiles")
        .update({
          pickup_address: testAddress,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      results.canSaveAddress = !saveError;
      console.log(
        "✅ Address saving:",
        results.canSaveAddress ? "PASS" : "FAIL",
      );

      // Test 3: Address displays correctly
      console.log("🧪 Testing address display...");
      const { data: displayData, error: displayError } = await supabase
        .from("profiles")
        .select("pickup_address")
        .eq("id", user.id)
        .single();

      const savedAddress = displayData?.pickup_address as any;
      results.addressDisplaysCorrectly =
        !displayError &&
        savedAddress?.streetAddress === testAddress.streetAddress &&
        savedAddress?.city === testAddress.city;

      console.log(
        "✅ Address display:",
        results.addressDisplaysCorrectly ? "PASS" : "FAIL",
      );

      // Test 4: Can edit address
      console.log("🧪 Testing address editing...");
      const updatedAddress = {
        ...testAddress,
        streetAddress: "456 Updated Street",
      };

      const { error: editError } = await supabase
        .from("profiles")
        .update({
          pickup_address: updatedAddress,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      results.canEditAddress = !editError;
      console.log(
        "✅ Address editing:",
        results.canEditAddress ? "PASS" : "FAIL",
      );
    } catch (error) {
      console.error("❌ Test suite failed:", error);
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const allTestsPassed = Object.values(testResults).every(Boolean);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Address System Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Can Load Address</span>
            {testResults.canLoadAddress ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Can Save Address</span>
            {testResults.canSaveAddress ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Address Displays Correctly</span>
            {testResults.addressDisplaysCorrectly ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Can Edit Address</span>
            {testResults.canEditAddress ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>

        <Button
          onClick={runTests}
          disabled={isRunning || !user}
          className="w-full"
        >
          {isRunning ? "Running Tests..." : "Run Address System Tests"}
        </Button>

        {!user && (
          <p className="text-sm text-gray-500 text-center">
            Please log in to run tests
          </p>
        )}

        {allTestsPassed && Object.values(testResults).some(Boolean) && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium text-center">
              ✅ All address system tests passed!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressSystemTest;
