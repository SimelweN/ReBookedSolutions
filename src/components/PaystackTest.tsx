import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PAYSTACK_CONFIG } from "@/config/paystack";
import PaystackPaymentService from "@/services/paystackPaymentService";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

const PaystackTest: React.FC = () => {
  const [testResults, setTestResults] = React.useState<{
    configCheck: boolean;
    sdkCheck: boolean;
    serviceCheck: boolean;
  }>({
    configCheck: false,
    sdkCheck: false,
    serviceCheck: false,
  });

  React.useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    // Test 1: Configuration check
    const configCheck = PAYSTACK_CONFIG.isConfigured();
    console.log("Config check:", configCheck);

    // Test 2: SDK import check
    let sdkCheck = false;
    try {
      const { PaystackPop } = await import("@paystack/inline-js");
      sdkCheck = !!PaystackPop;
      console.log("SDK check:", sdkCheck);
    } catch (error) {
      console.warn("SDK import failed:", error);
    }

    // Test 3: Service availability
    let serviceCheck = false;
    try {
      const reference = PaystackPaymentService.generateReference();
      serviceCheck = reference.startsWith("PSK_");
      console.log("Service check:", serviceCheck, reference);
    } catch (error) {
      console.error("Service check failed:", error);
    }

    setTestResults({
      configCheck,
      sdkCheck,
      serviceCheck,
    });
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? "default" : "destructive"}>
        {status ? "Pass" : "Fail"}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Paystack Integration Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.configCheck)}
              <span>Environment Configuration</span>
            </div>
            {getStatusBadge(testResults.configCheck)}
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.sdkCheck)}
              <span>Paystack SDK Import</span>
            </div>
            {getStatusBadge(testResults.sdkCheck)}
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.serviceCheck)}
              <span>Payment Service</span>
            </div>
            {getStatusBadge(testResults.serviceCheck)}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Configuration Details:</h4>
          <div className="text-sm space-y-1">
            <p>
              <strong>Public Key:</strong>{" "}
              {PAYSTACK_CONFIG.PUBLIC_KEY
                ? `${PAYSTACK_CONFIG.PUBLIC_KEY.substring(0, 20)}...`
                : "Not configured"}
            </p>
            <p>
              <strong>Environment:</strong>{" "}
              {PAYSTACK_CONFIG.isDevelopment ? "Development" : "Production"}
            </p>
            <p>
              <strong>Callback URL:</strong> {PAYSTACK_CONFIG.CALLBACK_URL}
            </p>
          </div>
        </div>

        <Button onClick={runTests} className="w-full" variant="outline">
          Run Tests Again
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaystackTest;
