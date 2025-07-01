import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  ArrowLeft,
  Loader2,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PaystackValidation from "@/services/paystackValidation";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface CheckoutPaymentProcessorProps {
  cartItems: any[];
  shippingData: any;
  deliveryData: any;
  totalAmount: number;
  onSuccess: (data: any) => void;
  onBack: () => void;
  isProcessing: boolean;
}

const CheckoutPaymentProcessor: React.FC<CheckoutPaymentProcessorProps> = ({
  cartItems,
  shippingData,
  deliveryData,
  totalAmount,
  onSuccess,
  onBack,
  isProcessing,
}) => {
  const { user } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [sellerSubaccounts, setSellerSubaccounts] = useState<
    Record<string, string>
  >({});

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Get seller subaccounts for split payment
  useEffect(() => {
    const getSellerSubaccounts = async () => {
      try {
        const sellerIds = [...new Set(cartItems.map((item) => item.sellerId))];
        const subaccounts: Record<string, string> = {};

        for (const sellerId of sellerIds) {
          const { data: subaccountData } = await supabase
            .from("banking_subaccounts")
            .select("subaccount_code")
            .eq("user_id", sellerId)
            .single();

          if (subaccountData?.subaccount_code) {
            subaccounts[sellerId] = subaccountData.subaccount_code;
          }
        }

        setSellerSubaccounts(subaccounts);
      } catch (error) {
        console.error("Error getting seller subaccounts:", error);
        toast.error("Error loading payment information");
      }
    };

    if (cartItems.length > 0) {
      getSellerSubaccounts();
    }
  }, [cartItems]);

  const processPayment = async () => {
    // Validate Paystack configuration
    if (!PaystackValidation.validateConfiguration()) {
      return;
    }

    if (!paystackLoaded || !window.PaystackPop) {
      toast.error("Payment system not ready. Please try again.");
      return;
    }

    if (!user?.email) {
      toast.error("User information not available");
      return;
    }

    // Validate payment data
    const paymentData = {
      amount: totalAmount,
      email: user.email,
      cartItems,
      shippingData,
      deliveryData,
    };

    if (!PaystackValidation.validatePaymentData(paymentData)) {
      return;
    }

    // Validate seller subaccounts
    if (
      !PaystackValidation.validateSellerSubaccounts(
        sellerSubaccounts,
        cartItems,
      )
    ) {
      return;
    }

    // Calculate and validate payment splits
    const splitCalculation = PaystackValidation.calculatePaymentSplits(
      cartItems,
      deliveryData?.price || 0,
    );

    if (!splitCalculation.isValid) {
      toast.error("Payment calculation error. Please contact support.");
      return;
    }

    setIsInitializing(true);

    try {
      // For multiple items, we need to handle split payments
      // For now, let's process the first item (single book checkout)
      // TODO: Implement multi-seller cart handling

      const firstItem = cartItems[0];
      const bookPrice = firstItem.price;
      const deliveryFee = deliveryData?.price || 0;
      const totalInKobo = Math.round((bookPrice + deliveryFee) * 100);

      // Initialize payment with Paystack
      const { data: paymentInit, error: initError } =
        await supabase.functions.invoke("initialize-paystack-payment", {
          body: {
            email: user.email,
            amount: totalInKobo,
            bookId: firstItem.bookId,
            sellerId: firstItem.sellerId,
            sellerSubaccountCode: sellerSubaccounts[firstItem.sellerId],
            bookPrice: bookPrice,
            deliveryFee: deliveryFee,
            callback_url: `${window.location.origin}/checkout/callback`,
            metadata: {
              buyer_id: user.id,
              cart_items: cartItems.map((item) => ({
                book_id: item.bookId,
                seller_id: item.sellerId,
                price: item.price,
                title: item.title,
                author: item.author,
              })),
              shipping_data: shippingData,
              delivery_data: deliveryData,
              total_amount: totalAmount,
              book_price: bookPrice,
              delivery_fee: deliveryFee,
            },
          },
        });

      if (initError || !paymentInit.data?.success) {
        throw new Error(
          paymentInit.data?.message || "Failed to initialize payment",
        );
      }

      const { authorization_url, access_code, reference } =
        paymentInit.data.data;

      // Log payment attempt
      PaystackValidation.logPaymentAttempt({
        amount: totalAmount,
        reference,
        email: user.email,
        cartItems,
        splits: splitCalculation.splits,
      });

      // Configure Paystack popup with validated data
      const paystack = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: totalInKobo,
        currency: "ZAR",
        ref: reference,
        metadata: {
          buyer_id: user.id,
          book_id: firstItem.bookId,
          seller_id: firstItem.sellerId,
          shipping_data: shippingData,
          delivery_data: deliveryData,
          platform_fee: splitCalculation.platformFee,
          seller_splits: splitCalculation.splits,
          total_books: cartItems.length,
          validation_passed: true,
        },
        callback: async (response: any) => {
          console.log("💳 Payment successful:", response);
          await handlePaymentSuccess(response);
        },
        onClose: () => {
          console.log("💳 Payment cancelled by user");
          setIsInitializing(false);
          toast.info("Payment cancelled");
        },
      });

      // Open payment popup
      console.log("💳 Opening Paystack payment popup...");
      paystack.openIframe();
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(error instanceof Error ? error.message : "Payment failed");
      setIsInitializing(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse: any) => {
    try {
      setIsInitializing(false);

      // Verify payment with our backend
      const { data: verifyResult, error: verifyError } =
        await supabase.functions.invoke("verify-paystack-payment", {
          body: {
            reference: paymentResponse.reference,
          },
        });

      if (verifyError || !verifyResult.data?.success) {
        throw new Error("Payment verification failed");
      }

      // Create order record
      const firstItem = cartItems[0];
      const { data: orderResult, error: orderError } =
        await supabase.functions.invoke("create-order", {
          body: {
            buyer_id: user?.id,
            seller_id: firstItem.sellerId,
            book_id: firstItem.bookId,
            paystack_reference: paymentResponse.reference,
            total_amount: Math.round(totalAmount * 100), // Convert to kobo
            book_price: Math.round(firstItem.price * 100),
            delivery_fee: Math.round((deliveryData?.price || 0) * 100),
            delivery_service: deliveryData?.provider,
            delivery_quote_info: deliveryData,
            shipping_address: shippingData,
            seller_subaccount_code: sellerSubaccounts[firstItem.sellerId],
            metadata: {
              payment_reference: paymentResponse.reference,
              payment_method: "paystack",
              cart_items: cartItems,
            },
          },
        });

      if (orderError || !orderResult.data?.success) {
        console.error("Order creation failed:", orderError);
        throw new Error("Order creation failed");
      }

      // Call success handler
      onSuccess({
        order_id: orderResult.data.data.order_id,
        paystack_reference: paymentResponse.reference,
        payment_status: "success",
        amount: totalAmount,
      });
    } catch (error) {
      console.error("Error handling payment success:", error);
      toast.error(
        "Payment successful but order creation failed. Please contact support.",
      );
    }
  };

  const bookTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const deliveryFee = deliveryData?.price || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-3">Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>
                Books ({cartItems.length} item
                {cartItems.length !== 1 ? "s" : ""})
              </span>
              <span>R{bookTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery ({deliveryData?.service_name || "Standard"})</span>
              <span>R{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>R{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Seller Information */}
        <div className="space-y-3">
          <h3 className="font-medium">Seller Information</h3>
          {cartItems.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 bg-blue-50 rounded-lg"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-600">by {item.author}</p>
                <p className="text-sm text-blue-600">
                  Sold by {item.sellerName}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">R{item.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500">
                  Seller gets R{(item.price * 0.9).toFixed(2)} (90%)
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Security Notice */}
        <Alert>
          <Shield className="w-4 h-4" />
          <AlertDescription>
            Your payment is secured by Paystack with 256-bit SSL encryption.
            Funds are held securely until book collection is confirmed.
          </AlertDescription>
        </Alert>

        {/* Payment Flow Notice */}
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="space-y-2">
            <p className="font-medium">How it works:</p>
            <ul className="text-sm space-y-1 ml-4 list-disc">
              <li>Pay securely with your card</li>
              <li>
                Seller has 48 hours to prepare book for courier collection
              </li>
              <li>Automatic refund if not collected within 48 hours</li>
              <li>Seller receives payment after successful collection</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Payment Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isInitializing || isProcessing}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Delivery
          </Button>

          <Button
            onClick={processPayment}
            disabled={isInitializing || isProcessing || !paystackLoaded}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isInitializing || isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : !paystackLoaded ? (
              "Loading Payment..."
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay R{totalAmount.toFixed(2)}
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          By clicking "Pay", you agree to our Terms of Service and acknowledge
          our Privacy Policy.
        </p>
      </CardContent>
    </Card>
  );
};

export default CheckoutPaymentProcessor;
