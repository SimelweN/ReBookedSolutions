import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Lock,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import PaystackPaymentService from "@/services/paystackPaymentService";
import { toast } from "sonner";

interface PaystackPaymentButtonProps {
  amount: number; // in cents (ZAR)
  disabled?: boolean;
  className?: string;
  onSuccess?: (reference: string) => void;
  onError?: (error: string) => void;
  metadata?: Record<string, any>;
}

const PaystackPaymentButton: React.FC<PaystackPaymentButtonProps> = ({
  amount,
  disabled = false,
  className = "",
  onSuccess,
  onError,
  metadata = {},
}) => {
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please sign in to make a payment");
      return;
    }

    if (amount <= 0) {
      toast.error("Invalid payment amount");
      return;
    }

    try {
      setIsProcessing(true);
      setPaymentStatus("processing");

      // Generate payment reference
      const reference = PaystackPaymentService.generateReference();

      // Validate data before creating order
      if (!user.email) {
        throw new Error("User email is required for payment");
      }
      if (items.length === 0) {
        throw new Error("No items in cart");
      }
      if (!items[0]?.sellerId) {
        throw new Error("Invalid seller information");
      }

      // Create order in database first
      const orderData = {
        buyer_email: user.email,
        seller_id: items[0].sellerId, // For multi-seller, handle differently
        amount: amount, // already in kobo (ZAR cents)
        paystack_ref: reference,
        items: items.map((item) => ({
          book_id: item.bookId,
          title: item.title,
          price: item.price, // price is already in rands, keep as is for the items array
          seller_id: item.sellerId,
        })),
        status: "pending" as const,
      };

      const order = await PaystackPaymentService.createOrder(orderData);

      // Initialize Paystack payment
      await PaystackPaymentService.initializePayment({
        email: user.email || "",
        amount: amount, // amount in kobo
        reference: reference,
        metadata: {
          order_id: order.id,
          user_id: user.id,
          items_count: items.length,
          ...metadata,
        },
      });

      // Payment successful
      setPaymentStatus("success");
      clearCart();
      onSuccess?.(reference);

      toast.success("Payment completed successfully!", {
        description:
          "Your order has been processed and books will be shipped soon.",
      });
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("error");

      const errorMessage =
        error instanceof Error ? error.message : "Payment failed";
      onError?.(errorMessage);

      if (errorMessage.includes("window was closed")) {
        toast.error("Payment was cancelled");
      } else {
        toast.error(`Payment failed: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `R${(amount / 100).toFixed(2)}`;
  };

  const getButtonContent = () => {
    switch (paymentStatus) {
      case "processing":
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        );
      case "success":
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Payment Successful
          </>
        );
      case "error":
        return (
          <>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Payment Failed - Retry
          </>
        );
      default:
        return (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay {formatAmount(amount)}
          </>
        );
    }
  };

  const getButtonVariant = () => {
    switch (paymentStatus) {
      case "success":
        return "default";
      case "error":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handlePayment}
        disabled={disabled || isProcessing || paymentStatus === "success"}
        className={`w-full py-6 text-lg font-semibold transition-all duration-200 ${className}`}
        variant={getButtonVariant()}
        size="lg"
      >
        {getButtonContent()}
      </Button>

      {/* Payment Security Info */}
      <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Lock className="w-4 h-4" />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center space-x-1">
          <Shield className="w-4 h-4" />
          <span>Powered by Paystack</span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="flex flex-wrap justify-center gap-2">
        <Badge variant="outline" className="text-xs">
          <CreditCard className="w-3 h-3 mr-1" />
          Visa
        </Badge>
        <Badge variant="outline" className="text-xs">
          <CreditCard className="w-3 h-3 mr-1" />
          Mastercard
        </Badge>
        <Badge variant="outline" className="text-xs">
          Bank Transfer
        </Badge>
        <Badge variant="outline" className="text-xs">
          EFT
        </Badge>
      </div>

      {/* Order Summary for Large Amounts */}
      {amount > 50000 && ( // Over R500
        <div className="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium">Large Order Protection</p>
          <p>
            Orders over R500 include enhanced buyer protection and tracking.
          </p>
        </div>
      )}

      {/* Commission Info */}
      <div className="text-center text-xs text-gray-500">
        <p>
          Platform fee: 10% • Seller receives:{" "}
          {formatAmount(Math.round(amount * 0.9))}
        </p>
      </div>
    </div>
  );
};

export default PaystackPaymentButton;
