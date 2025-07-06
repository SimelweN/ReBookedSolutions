import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Receipt from "@/components/Receipt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  ArrowLeft,
  Eye,
  Package,
  AlertTriangle,
} from "lucide-react";
import { useUserOrders } from "@/hooks/useUserOrders";
import { OrderData } from "@/services/paystackPaymentService";
import SEO from "@/components/SEO";
import { toast } from "sonner";

const CheckoutSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getOrderByReference } = useUserOrders();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get payment reference from URL params or location state
  const urlParams = new URLSearchParams(location.search);
  const paymentReference =
    urlParams.get("reference") ||
    location.state?.paymentReference ||
    location.state?.reference;

  useEffect(() => {
    if (paymentReference) {
      loadOrderDetails();
    } else {
      setError("Payment reference not found");
      setLoading(false);
    }
  }, [paymentReference]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get order from location state first
      const orderData = location.state?.orderData || location.state?.order;

      if (orderData) {
        setOrder(orderData);
      } else if (paymentReference) {
        // Fetch order using payment reference
        const foundOrder = await getOrderByReference(paymentReference);

        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError(
            "Order details not found. Please check your email for confirmation.",
          );
        }
      }
    } catch (error) {
      console.error("Error loading order details:", error);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <SEO title="Loading... - ReBooked Solutions" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-book-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading Your Receipt
            </h2>
            <p className="text-gray-600">
              Please wait while we retrieve your order details...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !paymentReference) {
    return (
      <Layout>
        <SEO
          title="Payment Error - ReBooked Solutions"
          description="Payment reference not found"
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <Card>
              <CardContent className="text-center p-8">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-red-600 mb-4">
                  {error || "Payment Reference Not Found"}
                </h1>
                <p className="text-gray-600 mb-6">
                  {error ===
                  "Order details not found. Please check your email for confirmation."
                    ? error
                    : "Please check your email for order confirmation or contact support."}
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate("/my-orders")}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View All Orders
                  </Button>
                  <Button
                    onClick={() => navigate("/books")}
                    variant="outline"
                    className="w-full"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <SEO title="Order Not Found - ReBooked Solutions" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <Card>
              <CardContent className="text-center p-8">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Order Not Found
                </h1>
                <p className="text-gray-600 mb-6">
                  We couldn't find order details for reference:{" "}
                  {paymentReference}
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate("/my-orders")}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View All Orders
                  </Button>
                  <Button
                    onClick={() => navigate("/books")}
                    variant="outline"
                    className="w-full"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600">
              Your order has been confirmed. Here's your receipt.
            </p>
          </div>

          {/* Order Status Alert */}
          <Alert className="mb-8 border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>What happens next?</strong> The seller has 48 hours to
              commit to your order. You'll receive email updates on the status,
              and your book will be prepared for delivery once confirmed.
            </AlertDescription>
          </Alert>

          {/* Receipt */}
          <div className="mb-8">
            <Receipt order={order} showActions={true} />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/my-orders")}
              className="flex-1 sm:flex-none sm:min-w-[200px]"
            >
              <Eye className="w-4 h-4 mr-2" />
              View All Orders
            </Button>

            <Button
              onClick={() => navigate("/books")}
              variant="outline"
              className="flex-1 sm:flex-none sm:min-w-[200px]"
            >
              <Package className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </div>

          {/* Contact Information */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>
              Need help? Contact us at{" "}
              <a
                href="mailto:support@rebookedsolutions.co.za"
                className="text-book-600 hover:underline"
              >
                support@rebookedsolutions.co.za
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;
