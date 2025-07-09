import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const EdgeFunctionTester = () => {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string | null>(null);

  const testFunction = async (functionName: string, testData: any) => {
    setLoading(functionName);
    try {
      console.log(`Testing ${functionName} with:`, testData);

      const result = await supabase.functions.invoke(functionName, {
        body: testData,
      });

      console.log(`${functionName} result:`, result);

      setResults((prev) => ({
        ...prev,
        [functionName]: {
          success: true,
          data: result.data,
          error: result.error,
        },
      }));
    } catch (error) {
      console.error(`${functionName} failed:`, error);

      setResults((prev) => ({
        ...prev,
        [functionName]: {
          success: false,
          error: error.message,
        },
      }));
    } finally {
      setLoading(null);
    }
  };

  const testCreateOrder = () => {
    testFunction("create-order", {
      bookId: "test-book-id",
      buyerId: "test-buyer-id",
      buyerEmail: "test@example.com",
      sellerId: "test-seller-id",
      amount: 100,
      deliveryOption: "self-collection",
      shippingAddress: { street: "Test Street" },
      deliveryData: { service: "test" },
      paystackReference: "test-ref-" + Date.now(),
      paystackSubaccount: "test-subaccount",
    });
  };

  const testInitializePayment = () => {
    testFunction("initialize-paystack-payment", {
      order_id: "test-order-id",
      email: "test@example.com",
      amount: 100,
      currency: "ZAR",
      callback_url: "https://example.com/callback",
      metadata: { test: true },
    });
  };

  const testUserAuth = async () => {
    setLoading("auth");
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log("Auth result:", { data, error });

      setResults((prev) => ({
        ...prev,
        auth: {
          success: !error,
          data: {
            user: data.session?.user?.id || null,
            email: data.session?.user?.email || null,
            authenticated: !!data.session,
          },
          error: error?.message,
        },
      }));
    } catch (error) {
      console.error("Auth test failed:", error);
      setResults((prev) => ({
        ...prev,
        auth: {
          success: false,
          error: error.message,
        },
      }));
    } finally {
      setLoading(null);
    }
  };

  const testSimplePayment = async () => {
    setLoading("simple-payment");
    try {
      // Get current user email for the test
      const { data: authData } = await supabase.auth.getSession();
      const userEmail = authData.session?.user?.email || "test@example.com";

      const testData = {
        email: userEmail,
        amount: 100,
        currency: "ZAR",
        callback_url: `${window.location.origin}/payment/callback`,
        metadata: { test: true, debug: true },
      };

      await testFunction("initialize-payment-simple", testData);
    } catch (error) {
      console.error("Simple payment test failed:", error);
      setResults((prev) => ({
        ...prev,
        "initialize-payment-simple": {
          success: false,
          error: error.message,
        },
      }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Edge Function Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            onClick={testUserAuth}
            disabled={loading === "auth"}
            variant="outline"
          >
            {loading === "auth" ? "Testing..." : "Test Auth"}
          </Button>

          <Button
            onClick={testCreateOrder}
            disabled={loading === "create-order"}
            variant="outline"
          >
            {loading === "create-order" ? "Testing..." : "Test Create Order"}
          </Button>

          <Button
            onClick={testInitializePayment}
            disabled={loading === "initialize-paystack-payment"}
            variant="outline"
          >
            {loading === "initialize-paystack-payment"
              ? "Testing..."
              : "Test Payment Init"}
          </Button>

          <Button
            onClick={testSimplePayment}
            disabled={loading === "simple-payment"}
            variant="secondary"
          >
            {loading === "simple-payment"
              ? "Testing..."
              : "Test Simple Payment"}
          </Button>
        </div>

        <div className="space-y-4">
          {Object.entries(results).map(
            ([functionName, result]: [string, any]) => (
              <Card key={functionName}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {functionName} -{" "}
                    {result.success ? "✅ Success" : "❌ Failed"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EdgeFunctionTester;
