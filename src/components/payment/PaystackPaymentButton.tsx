import React, { useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaystackPaymentButtonProps {
  amount: number; // in cents (ZAR)
  disabled?: boolean;
  className?: string;
  onSuccess?: (reference: string) => void;
  onError?: (error: string) => void;
  metadata?: Record<string, string | number | boolean>;
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

      console.log("Creating order with data:", orderData);

      let order;
      try {
        order = await PaystackPaymentService.createOrder(orderData);
        console.log("Order created successfully:", order);
      } catch (orderError) {
        console.error("Order creation failed:", orderError);

        // In development, continue with payment even if order creation fails
        if (import.meta.env.DEV) {
          console.warn(
            "🛠️ Continuing with payment despite order creation failure (dev mode)",
          );
          order = {
            id: `temp_${Date.now()}`,
            ...orderData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        } else {
          throw orderError; // In production, fail if we can't create the order
        }
      }

      // Get seller's subaccount code directly from the book
      let subaccountCode = undefined;
      if (items.length > 0 && items[0].bookId) {
        try {
          // First try to get subaccount_code directly from the book
          const { data: bookData } = await supabase
            .from("books")
            .select("subaccount_code, seller_id")
            .eq("id", items[0].bookId)
            .single();

          if (bookData?.subaccount_code) {
            subaccountCode = bookData.subaccount_code;
            console.log("Using direct book subaccount_code:", subaccountCode);
          } else if (bookData?.seller_id) {
            // Fallback to seller lookup if book doesn't have direct subaccount_code
            console.warn(
              "Book missing subaccount_code, falling back to seller lookup",
            );
            const { data: subaccountData } = await supabase
              .from("banking_subaccounts")
              .select("subaccount_code")
              .eq("user_id", bookData.seller_id)
              .single();

            if (subaccountData?.subaccount_code) {
              subaccountCode = subaccountData.subaccount_code;
              console.log(
                "Using seller subaccount from banking_subaccounts:",
                subaccountCode,
              );
            }
          }

          if (!subaccountCode) {
            console.warn("No subaccount found for book:", items[0].bookId);
          }
        } catch (error) {
          console.warn("Could not fetch book subaccount:", error);
        }
      }

      // Initialize Paystack payment
      const paymentResult = await PaystackPaymentService.initializePayment({
        email: user.email || "",
        amount: amount, // amount in kobo
        reference: reference,
        subaccount: subaccountCode,
        metadata: {
          order_id: order.id,
          user_id: user.id,
          items_count: items.length,
          seller_id: items[0]?.sellerId,
          subaccount_code: subaccountCode,
          ...metadata,
        },
      });

      // Check if payment was cancelled
      if (paymentResult && (paymentResult as any).cancelled) {
        setPaymentStatus("idle"); // Reset to allow retry
        console.log(
          "💡 Payment was cancelled by user, resetting to idle state",
        );
        onError?.("Payment cancelled by user");
        return; // Don't show error, user cancelled intentionally
      }

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
      const errorMessage =
        error instanceof Error ? error.message : "Payment failed";

      // Handle different types of errors
      if (
        errorMessage.includes("PAYMENT_CANCELLED_BY_USER") ||
        errorMessage.includes("cancelled by user") ||
        errorMessage.includes("window was closed")
      ) {
        setPaymentStatus("idle"); // Reset to allow retry
        console.log(
          "💡 Payment was cancelled by user, resetting to idle state",
        );
        onError?.("Payment cancelled by user");
        return; // Don't show error toast, already handled by service
      } else if (
        errorMessage.includes("not configured") ||
        errorMessage.includes("service unavailable")
      ) {
        setPaymentStatus("error");
        toast.error(
          "Payment service is not available. Please contact support.",
        );
        onError?.("Payment service unavailable");
      } else {
        setPaymentStatus("error");
        toast.error(`Payment failed: ${errorMessage}`);
        onError?.(errorMessage);
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
        <p>Secure payment powered by Paystack</p>
      </div>
    </div>
  );
};

export default PaystackPaymentButton;
