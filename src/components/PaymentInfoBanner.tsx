import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Shield, ExternalLink } from "lucide-react";

const PaymentInfoBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Alert className="border-blue-200 bg-blue-50 mb-4">
      <Shield className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="font-medium">Secure Payment System</div>
            <p className="text-sm">
              All payments are processed securely with Paystack encryption. Your
              financial information is protected with enterprise-grade security
              and never stored on our servers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-blue-600" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PaymentInfoBanner;
