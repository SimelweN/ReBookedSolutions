/**
 * Complete Payment Button Component
 * Implements the full payment integration flow
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  PaymentIntegrationService,
  PaymentInitiationData,
} from "@/services/paymentIntegrationService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PaymentButtonProps {
  bookId: string;
  bookTitle: string;
  bookPrice: number;
  sellerId: string;
  deliveryFee?: number;
  disabled?: boolean;
  className?: string;
  onPaymentStart?: () => void;
  onPaymentSuccess?: (transactionId: string) => void;
  onPaymentError?: (error: string) => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  bookId,
  bookTitle,
  bookPrice,
  sellerId,
  deliveryFee = 0,
  disabled = false,
  className = "",
  onPaymentStart,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAmount = bookPrice + deliveryFee;

  const handlePayment = async () => {
    if (!user?.email) {
      const errorMsg = "Please log in to make a purchase";
      setError(errorMsg);
      onPaymentError?.(errorMsg);
      return;
    }

    if (user.id === sellerId) {
      const errorMsg = "You cannot buy your own book";
      setError(errorMsg);
      onPaymentError?.(errorMsg);
      return;
    }

    setIsProcessing(true);
    setError(null);
    onPaymentStart?.();

    try {
      // Step 1: Initiate payment → calls initialize-paystack-payment Edge Function
      console.log("🚀 Starting payment process...");

      const paymentData: PaymentInitiationData = {
        bookId,
        bookTitle,
        bookPrice,
        deliveryFee,
        buyerEmail: user.email,
        sellerId,
      };

      const { paymentUrl, transactionId } =
        await PaymentIntegrationService.initiatePayment(paymentData);

      // Store transaction ID for callback handling (with fallback)
      try {
        sessionStorage.setItem("current_transaction_id", transactionId);
        sessionStorage.setItem("payment_book_id", bookId);
      } catch (storageError) {
        console.warn(
          "SessionStorage not available, payment will continue without callback tracking",
        );
        // Payment can still continue, we'll just lose some tracking ability
      }

      console.log("✅ Payment initiated, redirecting to Paystack...");

      // Step 2: Redirect to Paystack checkout
      PaymentIntegrationService.redirectToPaystack(paymentUrl);
    } catch (error) {
      console.error("Payment initiation failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Payment failed to start";

      setError(errorMessage);
      setIsProcessing(false);
      onPaymentError?.(errorMessage);

      toast.error(errorMessage);
    }
  };

  if (error) {
    return (
      <div className="space-y-3">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          onClick={() => setError(null)}
          variant="outline"
          className="w-full"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isProcessing}
      className={`w-full bg-green-600 hover:bg-green-700 text-white ${className}`}
      size="lg"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing Payment...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Buy Now - R{totalAmount.toFixed(2)}
        </>
      )}
    </Button>
  );
};

export default PaymentButton;
