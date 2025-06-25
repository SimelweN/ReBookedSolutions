import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, CreditCard, AlertTriangle } from "lucide-react";

const PaystackTestComponent: React.FC = () => {
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [testMessage, setTestMessage] = useState<string>("");

  // Check if Paystack key is configured
  const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const isConfigured =
    paystackKey && paystackKey !== "pk_test_your-paystack-public-key-here";

  const testPaystackIntegration = () => {
    if (!isConfigured) {
      setTestStatus("error");
      setTestMessage(
        "Paystack public key not configured. Please set VITE_PAYSTACK_PUBLIC_KEY in .env.local",
      );
      return;
    }

    setTestStatus("testing");

    // Load Paystack script if not already loaded
    if (!(window as any).PaystackPop) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => initializePaystack();
      script.onerror = () => {
        setTestStatus("error");
        setTestMessage(
          "Failed to load Paystack script. Check your internet connection.",
        );
      };
      document.body.appendChild(script);
    } else {
      initializePaystack();
    }
  };

  const initializePaystack = () => {
    try {
      // Ensure PaystackPop is available
      if (!(window as any).PaystackPop) {
        setTestStatus("error");
        setTestMessage(
          "Paystack script not loaded. Please wait and try again.",
        );
        return;
      }

      const config = {
        key: paystackKey,
        email: "test@example.com",
        amount: 10000, // 100 ZAR in kobo
        currency: "ZAR",
        reference: `test_${new Date().getTime()}`,
        callback: function (response: any) {
          console.log("Payment callback:", response);
          setTestStatus("success");
          setTestMessage(
            `Test payment successful! Reference: ${response.reference}`,
          );
        },
        onClose: function () {
          if (testStatus === "testing") {
            setTestStatus("error");
            setTestMessage("Payment popup was closed without completion");
          }
        },
      };

      console.log("Initializing Paystack with config:", config);
      const handler = (window as any).PaystackPop.setup(config);
      handler.openIframe();
    } catch (error) {
      console.error("Paystack initialization error:", error);
      setTestStatus("error");
      setTestMessage(
        `Paystack initialization error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Paystack Integration Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Status */}
        <Alert
          className={
            isConfigured
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }
        >
          {isConfigured ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <AlertDescription
            className={isConfigured ? "text-green-800" : "text-red-800"}
          >
            <strong>Configuration:</strong>{" "}
            {isConfigured ? "✓ Paystack key found" : "✗ Paystack key missing"}
          </AlertDescription>
        </Alert>

        {/* Test Results */}
        {testStatus !== "idle" && (
          <Alert
            className={
              testStatus === "success"
                ? "border-green-200 bg-green-50"
                : testStatus === "error"
                  ? "border-red-200 bg-red-50"
                  : "border-blue-200 bg-blue-50"
            }
          >
            {testStatus === "success" ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : testStatus === "error" ? (
              <XCircle className="w-4 h-4 text-red-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-blue-600" />
            )}
            <AlertDescription
              className={
                testStatus === "success"
                  ? "text-green-800"
                  : testStatus === "error"
                    ? "text-red-800"
                    : "text-blue-800"
              }
            >
              <strong>Test Result:</strong> {testMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Test Button */}
        <Button
          onClick={testPaystackIntegration}
          disabled={!isConfigured || testStatus === "testing"}
          className="w-full"
        >
          {testStatus === "testing"
            ? "Opening Paystack..."
            : "Test Paystack Payment"}
        </Button>

        {/* Environment Info */}
        <div className="text-xs text-gray-600 space-y-1">
          <div>
            <strong>Environment:</strong>{" "}
            {import.meta.env.DEV ? "Development" : "Production"}
          </div>
          <div>
            <strong>Paystack Key:</strong>{" "}
            {paystackKey ? `${paystackKey.substring(0, 15)}...` : "Not set"}
          </div>
          <div>
            <strong>Test Amount:</strong> R100.00 (10000 kobo)
          </div>
        </div>

        {/* Instructions */}
        {!isConfigured && (
          <div className="text-sm bg-yellow-50 border border-yellow-200 rounded p-3">
            <strong>To fix:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>
                Get your test keys from{" "}
                <a
                  href="https://paystack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  paystack.com
                </a>
              </li>
              <li>
                Replace the placeholder in <code>.env.local</code>
              </li>
              <li>Restart the development server</li>
              <li>Test again</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaystackTestComponent;
