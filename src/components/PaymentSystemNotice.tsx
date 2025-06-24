import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Shield, CreditCard } from "lucide-react";

interface PaymentSystemNoticeProps {
  className?: string;
}

const PaymentSystemNotice: React.FC<PaymentSystemNoticeProps> = ({
  className,
}) => {
  return (
    <Alert className={`border-blue-200 bg-blue-50 ${className}`}>
      <Shield className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="font-medium">Secure Payment Processing</span>
            </div>
            <p className="text-sm">
              All payments are securely processed with Paystack integration.
              Your financial information is protected with enterprise-grade
              security and 256-bit SSL encryption.
            </p>
          </div>
          <ExternalLink className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PaymentSystemNotice;
