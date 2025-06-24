import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PaymentStatusTracker from "@/components/payment/PaymentStatusTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Package,
  CreditCard,
  Download,
  Share,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PaystackPaymentService, {
  OrderData,
} from "@/services/paystackPaymentService";
import SEO from "@/components/SEO";
import { toast } from "sonner";

const PaymentStatus: React.FC = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const reference = searchParams.get("reference");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (orderId || reference) {
      loadOrderDetails();
    } else {
      setError("No order ID or payment reference provided");
      setLoading(false);
    }
  }, [orderId, reference, isAuthenticated]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (reference) {
        // If we have a reference, try to verify the payment first
        await PaystackPaymentService.verifyPayment(reference);
      }

      // Load order details
      // This would typically query the orders table by ID or reference
      // For now, we'll use a placeholder implementation
      const orders = await PaystackPaymentService.getOrdersByStatus("paid");
      const foundOrder = orders.find(
        (o) => o.id === orderId || o.paystack_ref === reference,
      );

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError("Order not found");
      }
    } catch (error) {
      console.error("Error loading order details:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load order details",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Order Status - ${order?.id.slice(0, 8)}`,
      text: `Track my ReBooked Solutions order`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success("Order link copied to clipboard");
    }
  };

  const handleDownloadReceipt = () => {
    if (!order) return;

    // Generate a simple receipt
    const receiptContent = `
      ReBooked Solutions - Order Receipt
      
      Order ID: ${order.id}
      Reference: ${order.paystack_ref}
      Date: ${new Date(order.created_at).toLocaleDateString()}
      Amount: R${(order.amount / 100).toFixed(2)}
      Status: ${order.status}
      
      Items:
      ${order.items.map((item) => `- ${item.title}: R${(item.price / 100).toFixed(2)}`).join("\n")}
      
      Thank you for your purchase!
    `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${order.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CreditCard className="w-8 h-8 text-blue-500" />;
      case "ready_for_payout":
        return <Package className="w-8 h-8 text-orange-500" />;
      case "paid_out":
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      default:
        return <Clock className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "paid":
        return "Payment confirmed! Your order is being prepared for shipping.";
      case "ready_for_payout":
        return "Your order has been picked up by the courier and is on its way to you.";
      case "paid_out":
        return "Order completed! The seller has been paid.";
      default:
        return "Processing your order...";
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Please sign in to view your order status
              </p>
              <Button onClick={() => navigate("/login")}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="text-center mt-6">
              <Button onClick={() => navigate("/")}>Go to Homepage</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={`Order Status - ${order?.id.slice(0, 8)} | ReBooked Solutions`}
        description="Track your ReBooked Solutions order status and payment details"
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadReceipt}
              >
                <Download className="w-4 h-4 mr-2" />
                Receipt
              </Button>
            </div>
          </div>

          {/* Status Header */}
          {order && (
            <Card className="mb-8">
              <CardContent className="text-center py-8">
                <div className="mb-4">{getStatusIcon(order.status)}</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Order #{order.id.slice(0, 8)}
                </h1>
                <p className="text-gray-600 mb-4">
                  {getStatusMessage(order.status)}
                </p>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {order.status.toUpperCase().replace("_", " ")}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Detailed Status Tracker */}
          <PaymentStatusTracker
            orderId={orderId}
            reference={reference}
            showSellerActions={false}
          />

          {/* Support Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Need Help?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have any questions about your order, our support team is
                here to help.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" onClick={() => navigate("/contact")}>
                  Contact Support
                </Button>
                <Button variant="outline" onClick={() => navigate("/faq")}>
                  View FAQ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentStatus;
