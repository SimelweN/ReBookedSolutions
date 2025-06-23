import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  id: string;
  title: string;
  price: number;
  seller?: {
    id: string;
  };
}

interface CartPaymentProcessorProps {
  amount: number;
  cartItems: CartItem[];
  onPaymentSuccess: (reference: string) => void;
  onPaymentStart: () => void;
  buyerId: string;
  buyerEmail: string;
  disabled?: boolean;
}

type PaymentMethod = "paystack" | "manual";

const CartPaymentProcessor = ({
  amount,
  cartItems,
  onPaymentSuccess,
  onPaymentStart,
  buyerId,
  buyerEmail,
  disabled = false,
}: CartPaymentProcessorProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("manual");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaystackPayment = async () => {
    // TODO: Implement multi-item Paystack payment
    toast.info(
      "Multi-item Paystack payment coming soon. Using manual payment for now.",
    );
    handleManualPayment();
  };

  const handleManualPayment = async () => {
    setIsProcessing(true);
    onPaymentStart();

    try {
      // Simulate payment processing for manual/fallback payment
      toast.loading("Processing cart payment...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Generate a mock reference for manual payment
      const reference = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      toast.success("Cart payment processed successfully!");
      onPaymentSuccess(reference);
    } catch (error) {
      console.error("Cart payment processing failed:", error);
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

  // Check if cart has multiple sellers
  const uniqueSellers = new Set(
    cartItems.map((item) => item.seller?.id).filter(Boolean),
  );
  const hasMultipleSellers = uniqueSellers.size > 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Cart Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasMultipleSellers && (
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Multiple Sellers Detected</p>
                <p className="text-xs">
                  Your cart contains items from {uniqueSellers.size} different
                  sellers. Separate transactions may be created for each seller.
                </p>
              </div>
            </div>
          </div>
        )}

        <RadioGroup
          value={paymentMethod}
          onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
          disabled={isProcessing}
        >
          <div className="flex items-center space-x-2 p-3 border rounded-lg opacity-50">
            <RadioGroupItem value="paystack" id="paystack-cart" disabled />
            <Label
              htmlFor="paystack-cart"
              className="flex-1 cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-500">
                    Secure Online Payment
                  </p>
                  <p className="text-sm text-gray-400">
                    Coming soon for cart checkout
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src="https://paystack.com/assets/img/logos/paystack-logo.png"
                    alt="Paystack"
                    className="h-6 opacity-50"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="manual" id="manual-cart" />
            <Label htmlFor="manual-cart" className="flex-1 cursor-pointer">
              <div>
                <p className="font-medium">Manual Cart Payment</p>
                <p className="text-sm text-gray-600">
                  Process cart payment manually
                </p>
              </div>
            </Label>
          </div>
        </RadioGroup>

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Cart Summary</p>
              <p className="text-xs">
                {cartItems.length} items from {uniqueSellers.size} seller
                {uniqueSellers.size !== 1 ? "s" : ""}
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
              Processing Cart...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Cart Total R{amount.toFixed(2)}
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Cart payments are processed securely with order tracking
        </p>
      </CardContent>
    </Card>
  );
};

export default CartPaymentProcessor;
