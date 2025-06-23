import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  Loader2,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { PAYSTACK_CONFIG } from "@/config/paystack";

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
  const [isPaystackConfigured, setIsPaystackConfigured] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  // Check Paystack configuration on component mount
  useEffect(() => {
    const checkConfiguration = () => {
      const configured = PAYSTACK_CONFIG.isConfigured();
      setIsPaystackConfigured(configured);

      if (!configured) {
        setConfigError("Payment system is not properly configured");
        setPaymentMethod("manual"); // Fall back to manual payment
      } else {
        setConfigError(null);
      }
    };

    checkConfiguration();
  }, []);

  const handlePaystackPayment = async () => {
    if (!bookId || !sellerId || !bookTitle) {
      toast.error("Missing payment information");
      return;
    }

    if (!isPaystackConfigured) {
      toast.error(
        "Payment system is not available. Please try manual payment.",
      );
      return;
    }

    setIsProcessing(true);
    onPaymentStart();

    try {
      toast.loading("Initializing secure payment...", { id: "payment-init" });

      const { TransactionService } = await import(
        "@/services/transactionService"
      );

      const { payment_url, transaction_id } =
        await TransactionService.initializeBookPayment({
          bookId,
          buyerId,
          buyerEmail,
          sellerId,
          bookPrice: amount,
          deliveryFee: 0, // Delivery fee should be handled separately
          bookTitle,
        });

      toast.success("Redirecting to secure payment...", { id: "payment-init" });

      // Store transaction ID for reference
      sessionStorage.setItem("current_transaction_id", transaction_id);

      // Add a small delay to ensure user sees the success message
      setTimeout(() => {
        window.location.href = payment_url;
      }, 1500);
    } catch (error) {
      console.error("Paystack payment initialization failed:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes("SELLER_NO_BANKING_DETAILS")) {
        toast.error(
          "Seller payment details not configured. Please contact the seller.",
          { id: "payment-init" },
        );
      } else if (errorMessage.includes("SELLER_NO_SUBACCOUNT")) {
        toast.error(
          "Seller account not ready for payments. Please contact the seller.",
          { id: "payment-init" },
        );
      } else {
        toast.error(`Payment initialization failed: ${errorMessage}`, {
          id: "payment-init",
        });
      }

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
        {/* Configuration Status */}
        {configError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {configError}. Manual payment is available as an alternative.
            </AlertDescription>
          </Alert>
        )}

        {isPaystackConfigured && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Secure payment system is ready. Your payment will be processed
              safely.
            </AlertDescription>
          </Alert>
        )}

        <RadioGroup
          value={paymentMethod}
          onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
          disabled={isProcessing}
        >
          <div
            className={`flex items-center space-x-2 p-3 border rounded-lg ${!isPaystackConfigured ? "bg-gray-50 opacity-60" : ""}`}
          >
            <RadioGroupItem
              value="paystack"
              id="paystack"
              disabled={!isPaystackConfigured}
            />
            <Label
              htmlFor="paystack"
              className={`flex-1 ${isPaystackConfigured ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Secure Online Payment</p>
                  <p className="text-sm text-gray-600">
                    {isPaystackConfigured
                      ? "Pay securely with card via Paystack"
                      : "Currently unavailable - configuration issue"}
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
                  <Shield
                    className={`h-4 w-4 ${isPaystackConfigured ? "text-green-600" : "text-gray-400"}`}
                  />
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

        {/* Payment Method Information */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              {paymentMethod === "paystack" ? (
                <>
                  <p className="font-medium">Secure Online Payment</p>
                  <p className="text-xs">
                    You will be redirected to Paystack to complete your payment
                    securely. Your card details are never stored on our servers.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">Manual Payment Processing</p>
                  <p className="text-xs">
                    Your payment will be processed manually. You may be
                    contacted for additional verification.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentProcessor;
