import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, CreditCard, Shield, ArrowRight } from "lucide-react";

interface PaymentRedirectNoticeProps {
  bookTitle?: string;
  amount?: number;
  isCart?: boolean;
  onProceed: () => void;
  onCancel: () => void;
}

const PaymentRedirectNotice: React.FC<PaymentRedirectNoticeProps> = ({
  bookTitle,
  amount,
  isCart = false,
  onProceed,
  onCancel,
}) => {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You will be redirected to our secure payment system to complete your
            purchase.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="font-medium">
            {isCart ? "Cart Checkout" : "Book Purchase"}
          </h4>
          {bookTitle && (
            <p className="text-sm text-gray-600">Book: {bookTitle}</p>
          )}
          {amount && (
            <p className="text-sm font-medium">Amount: R{amount.toFixed(2)}</p>
          )}
        </div>

        <div className="bg-blue-50 p-3 rounded-lg space-y-2">
          <h5 className="font-medium text-blue-900">What happens next?</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You'll be taken to our secure payment portal</li>
            <li>• Complete your payment safely</li>
            <li>• Return here to track your order</li>
            <li>• Your payment is protected until delivery</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onProceed}
            className="flex-1 bg-book-600 hover:bg-book-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Proceed to Payment
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Powered by secure payment technology
        </p>
      </CardContent>
    </Card>
  );
};

export default PaymentRedirectNotice;
