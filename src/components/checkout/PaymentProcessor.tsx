import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

interface PaymentProcessorProps {
  amount: number;
  onPaymentSuccess: (reference: string) => void;
  onPaymentStart: () => void;
  bookId?: string;
  bookTitle?: string;
  sellerId?: string;
  buyerId: string;
  buyerEmail: string;
  disabled?: boolean;
}

type PaymentMethod = "paystack" | "manual";

const PaymentProcessor = ({
  amount,
  onPaymentSuccess,
  onPaymentStart,
  bookId,
  bookTitle,
  sellerId,
  buyerId,
  buyerEmail,
  disabled = false,
}: PaymentProcessorProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paystack");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaystackPayment = async () => {
    if (!bookId || !sellerId || !bookTitle) {
      toast.error("Missing payment information");
      return;
    }

    setIsProcessing(true);
    onPaymentStart();

    try {
      const { TransactionService } = await import(
        "@/services/transactionService"
      );

      const { payment_url, reference } =
        await TransactionService.initializeBookPayment({
          bookId,
          buyerId,
          buyerEmail,
          sellerId,
          bookPrice: amount,
          deliveryFee: 0, // Delivery fee should be handled separately
          bookTitle,
        });

      toast.success("Redirecting to secure payment...");

      // Redirect to Paystack payment page
      window.location.href = payment_url;
    } catch (error) {
      console.error("Paystack payment initialization failed:", error);
      toast.error("Payment initialization failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleManualPayment = async () => {
    setIsProcessing(true);
    onPaymentStart();

    try {
      // Simulate payment processing for manual/fallback payment
      toast.loading("Processing payment...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate a mock reference for manual payment
      const reference = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      toast.success("Payment processed successfully!");
      onPaymentSuccess(reference);
    } catch (error) {
      console.error("Manual payment processing failed:", error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === "paystack") {
      handlePaystackPayment();
    } else {
      handleManualPayment();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
          disabled={isProcessing}
        >
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="paystack" id="paystack" />
            <Label htmlFor="paystack" className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Secure Online Payment</p>
                  <p className="text-sm text-gray-600">
                    Pay securely with card via Paystack
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src="https://paystack.com/assets/img/logos/paystack-logo.png"
                    alt="Paystack"
                    className="h-6"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="manual" id="manual" />
            <Label htmlFor="manual" className="flex-1 cursor-pointer">
              <div>
                <p className="font-medium">Alternative Payment</p>
                <p className="text-sm text-gray-600">
                  Manual payment processing
                </p>
              </div>
            </Label>
          </div>
        </RadioGroup>

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Secure Payment</p>
              <p className="text-xs">
                Your payment information is encrypted and secure. We never store
                your card details.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={disabled || isProcessing}
          className="w-full bg-book-600 hover:bg-book-700"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay R{amount.toFixed(2)}
            </>
          )}
        </Button>

        {paymentMethod === "paystack" && (
          <p className="text-xs text-gray-500 text-center">
            You will be redirected to Paystack to complete your payment securely
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentProcessor;
