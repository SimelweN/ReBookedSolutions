import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Shield, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { PaystackPaymentService } from "@/services/paystackPaymentService";
import { PaystackSubaccountService } from "@/services/paystackSubaccountService";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedPaymentButtonProps {
  bookId: string;
  sellerId: string;
  bookPrice: number;
  bookTitle: string;
  buyerEmail: string;
  deliveryFee?: number;
  onSuccess?: (reference: string) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

const EnhancedPaymentButton: React.FC<EnhancedPaymentButtonProps> = ({
  bookId,
  sellerId,
  bookPrice,
  bookTitle,
  buyerEmail,
  deliveryFee = 0,
  onSuccess,
  onCancel,
  onError,
  disabled = false,
  className = "",
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitDetails, setSplitDetails] = useState<any>(null);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // First try to get subaccount code directly from the book
      const { data: bookData } = await supabase
        .from("books")
        .select("subaccount_code, seller_id")
        .eq("id", bookId)
        .single();

      let sellerSubaccountCode = bookData?.subaccount_code;

      if (!sellerSubaccountCode) {
        // Fallback to seller validation if book doesn't have direct subaccount_code
        console.warn(
          "Book missing subaccount_code, validating seller subaccount",
        );
        const validation =
          await PaystackSubaccountService.validateSubaccount(sellerId);

        if (!validation.isValid) {
          throw new Error(validation.message);
        }

        sellerSubaccountCode = validation.subaccountCode;
      } else {
        console.log("Using direct book subaccount_code:", sellerSubaccountCode);
      }

      // Calculate split amounts for display
      const splitAmounts = PaystackSubaccountService.calculatePaymentSplit(
        bookPrice,
        deliveryFee,
        10, // 10% platform commission
      );

      setSplitDetails(splitAmounts);

      // Prepare payment with split configuration
      const paymentResult =
        await PaystackPaymentService.preparePaymentWithSplit(
          sellerId,
          bookId,
          bookPrice,
          deliveryFee,
          buyerEmail,
        );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || "Failed to prepare payment");
      }

      // Initialize Paystack popup with split payment data
      await PaystackPaymentService.initializePayment({
        email: buyerEmail,
        amount: paymentResult.paymentData.amount,
        reference: paymentResult.paymentData.reference,
        subaccount: sellerSubaccountCode!,
        metadata: {
          book_id: bookId,
          book_title: bookTitle,
          seller_id: sellerId,
          split_amounts: splitAmounts,
          subaccount_code: sellerSubaccountCode,
        },
        callback_url: window.location.origin + "/payment-success",
      });

      // If we reach here, payment was successful
      toast.success("Payment completed successfully!");
      onSuccess?.(paymentResult.paymentData.reference);
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Payment failed";
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = bookPrice + deliveryFee;

  return (
    <div className="space-y-4">
      {/* Payment Split Preview */}
      {splitDetails && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            Payment Breakdown
          </h4>
          <div className="space-y-1 text-gray-600">
            <div className="flex justify-between">
              <span>Book Price:</span>
              <span>R{bookPrice.toFixed(2)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>R{deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-1 mt-2">
              <div className="flex justify-between">
                <span>Seller receives (90%):</span>
                <span className="font-medium">
                  R{splitDetails.sellerAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Platform fee (10%):</span>
                <span>R{splitDetails.platformAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-gray-900 border-t pt-1 mt-1">
                <span>Total Amount:</span>
                <span>R{splitDetails.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={disabled || isProcessing}
        className={`w-full h-12 bg-book-600 hover:bg-book-700 text-white font-semibold transition-all duration-200 ${className}`}
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pay R{totalAmount.toFixed(2)}
          </>
        )}
      </Button>

      {/* Security Badge */}
      <div className="flex items-center justify-center text-xs text-gray-500 space-x-2">
        <Shield className="w-3 h-3" />
        <span>Secured by Paystack</span>
        <span>•</span>
        <span>Split payment with 90% to seller</span>
      </div>
    </div>
  );
};

export default EnhancedPaymentButton;
