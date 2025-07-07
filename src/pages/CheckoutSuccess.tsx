import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Step4Confirmation from "@/components/checkout/Step4Confirmation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { OrderConfirmation } from "@/types/checkout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<OrderConfirmation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    processPaymentCallback();

    // Set a maximum loading time to prevent users from being stuck
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn("⏰ [CheckoutSuccess] Loading timeout reached");
        setError(
          "Payment verification is taking longer than expected. Please check your orders or try again.",
        );
        setLoading(false);
      }
    }, 45000); // 45 seconds timeout

    return () => clearTimeout(loadingTimeout);
  }, [loading]);

  const processPaymentCallback = async () => {
    try {
      console.log("🔄 [CheckoutSuccess] Starting payment verification process");
      console.log(
        "🔍 [CheckoutSuccess] URL search params:",
        Object.fromEntries(searchParams),
      );
      console.log("🔍 [CheckoutSuccess] Location state:", location.state);

      setLoading(true);

      // Get payment reference from URL params
      const reference =
        searchParams.get("reference") || searchParams.get("trxref");

      console.log("📝 [CheckoutSuccess] Payment reference found:", reference);

      if (!reference) {
        // Check if order data was passed through state (from successful payment)
        const stateOrderData = location.state?.orderData;
        console.log("🔍 [CheckoutSuccess] State order data:", stateOrderData);

        if (stateOrderData) {
          console.log("✅ [CheckoutSuccess] Using order data from state");
          setOrderData(stateOrderData);
          setLoading(false);
          return;
        }

        console.error(
          "❌ [CheckoutSuccess] No payment reference or state data found",
        );
        throw new Error("No payment reference found");
      }

      console.log(
        "📞 [CheckoutSuccess] Verifying payment with reference:",
        reference,
      );

      // Verify payment with Paystack (with timeout)
      const verificationPromise = supabase.functions.invoke(
        "verify-paystack-payment",
        {
          body: { reference },
        },
      );

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Payment verification timeout")),
          30000,
        ),
      );

      const { data: verificationResult, error: verificationError } =
        (await Promise.race([verificationPromise, timeoutPromise])) as any;

      console.log(
        "📊 [CheckoutSuccess] Verification result:",
        verificationResult,
      );
      console.log(
        "❌ [CheckoutSuccess] Verification error:",
        verificationError,
      );

      if (verificationError || !verificationResult) {
        console.error(
          "❌ [CheckoutSuccess] Payment verification failed:",
          verificationError,
        );
        throw new Error(
          verificationError?.message || "Payment verification failed",
        );
      }

      console.log(
        "🔍 [CheckoutSuccess] Verification status:",
        verificationResult.status,
      );
      console.log("📦 [CheckoutSuccess] Order data:", verificationResult.order);

      if (verificationResult.status === "success" && verificationResult.order) {
        // Convert the order data to our OrderConfirmation format
        const order = verificationResult.order;
        const orderConfirmation: OrderConfirmation = {
          order_id: order.id,
          payment_reference: reference,
          book_id: order.book_id,
          seller_id: order.seller_id,
          buyer_id: order.buyer_id,
          book_title: order.book_title || "Unknown Book",
          book_price: order.book_price || 0,
          delivery_method: order.delivery_method || "Standard Delivery",
          delivery_price: order.delivery_price || 0,
          total_paid: order.total_amount || 0,
          created_at: order.created_at,
          status: order.status || "completed",
        };

        console.log(
          "✅ [CheckoutSuccess] Order confirmation created:",
          orderConfirmation,
        );
        setOrderData(orderConfirmation);
        console.log(
          "🎉 [CheckoutSuccess] Order data set successfully, loading should stop",
        );
        toast.success("Payment verified successfully! 🎉");
      } else {
        console.error(
          "❌ [CheckoutSuccess] Payment verification unsuccessful:",
          verificationResult,
        );
        throw new Error(
          verificationResult.message || "Payment verification failed",
        );
      }
    } catch (err) {
      console.error("❌ [CheckoutSuccess] Payment callback error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      toast.error("Payment verification failed: " + errorMessage);
    } finally {
      console.log("🏁 [CheckoutSuccess] Setting loading to false");
      setLoading(false);
    }
  };

  const handleViewOrders = () => {
    navigate("/orders");
  };

  const handleContinueShopping = () => {
    navigate("/books");
  };

  if (loading) {
    return (
      <Layout>
        <SEO
          title="Processing Payment - ReBooked Solutions"
          description="Processing your payment and confirming your order"
        />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Your Payment
              </h1>
              <p className="text-gray-600">
                Please wait while we confirm your payment and create your
                order...
              </p>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Taking longer than usual?
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setError("Verification timeout - please check your orders");
                    setLoading(false);
                  }}
                  className="bg-white"
                >
                  Skip to Order Check
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !orderData) {
    return (
      <Layout>
        <SEO
          title="Payment Error - ReBooked Solutions"
          description="There was an issue processing your payment"
        />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-2xl mx-auto px-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error || "Failed to load order information"}
              </AlertDescription>
            </Alert>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Payment Successful but Verification Failed?
              </h3>
              <p className="text-sm text-blue-800 mb-4">
                If your payment was successful, you can check your order status
                in "My Orders" or try refreshing this page.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="bg-white"
                >
                  Retry Verification
                </Button>
                <Button
                  onClick={() => navigate("/orders")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Check My Orders
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center space-x-4">
              <Button onClick={() => navigate("/books")}>Browse Books</Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="Purchase Successful - ReBooked Solutions"
        description="Your book purchase has been completed successfully"
        keywords="purchase complete, order confirmation, receipt"
      />
      <div className="min-h-screen bg-gray-50 py-8">
        <Step4Confirmation
          orderData={orderData}
          onViewOrders={handleViewOrders}
          onContinueShopping={handleContinueShopping}
        />
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;
