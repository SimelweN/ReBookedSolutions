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
  }, []);

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

      // Verify payment with Paystack
      const { data: verificationResult, error: verificationError } =
        await supabase.functions.invoke("verify-paystack-payment", {
          body: { reference },
        });

      if (verificationError || !verificationResult) {
        throw new Error(
          verificationError?.message || "Payment verification failed",
        );
      }

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

        setOrderData(orderConfirmation);
        toast.success("Payment verified successfully! 🎉");
      } else {
        throw new Error(
          verificationResult.message || "Payment verification failed",
        );
      }
    } catch (err) {
      console.error("Payment callback error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      toast.error("Payment verification failed: " + errorMessage);
    } finally {
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
            <div className="mt-6 text-center space-x-4">
              <Button onClick={() => navigate("/books")}>Browse Books</Button>
              <Button variant="outline" onClick={() => navigate("/orders")}>
                View My Orders
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
