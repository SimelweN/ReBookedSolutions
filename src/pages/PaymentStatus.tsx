import React, { useState, useEffect } from "react";
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
import {
  getOrderById,
  getOrderByReference,
  getUserOrders,
  type Order,
} from "@/services/enhancedOrderService";
import SEO from "@/components/SEO";
import { toast } from "sonner";

const PaymentStatus: React.FC = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const reference = searchParams.get("reference");
  const [order, setOrder] = useState<Order | null>(null);
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

      if (!user?.id) {
        setError("User not authenticated");
        return;
      }

      if (reference) {
        // If we have a reference, try to verify the payment first
        try {
          await PaystackPaymentService.verifyPayment(reference);
        } catch (verifyError) {
          console.warn("Payment verification failed:", verifyError);
          // Continue to try fetching order anyway
        }
      }

      let foundOrder: Order | null = null;

      // Try to load order by ID first
      if (orderId) {
        console.log("🔍 Looking up order by ID:", orderId);
        foundOrder = await getOrderById(orderId);

        // Check if this order belongs to the current user
        if (
          foundOrder &&
          foundOrder.buyer_id !== user.id &&
          foundOrder.seller_id !== user.id
        ) {
          console.log("❌ Order found but doesn't belong to current user");
          foundOrder = null;
        }
      }

      // If not found by ID, try by reference
      if (!foundOrder && reference) {
        console.log("🔍 Looking up order by reference:", reference);
        foundOrder = await getOrderByReference(reference);

        // Check if this order belongs to the current user
        if (
          foundOrder &&
          foundOrder.buyer_id !== user.id &&
          foundOrder.seller_id !== user.id
        ) {
          console.log("❌ Order found but doesn't belong to current user");
          foundOrder = null;
        }
      }

      console.log("🔍 Order lookup:", {
        userId: user.id,
        orderId,
        reference,
        foundOrder: foundOrder ? "✅ Found" : "❌ Not found",
      });

      if (foundOrder) {
        setOrder(foundOrder);
        console.log("✅ Order loaded successfully:", foundOrder.id);
      } else {
        console.log("❌ Order not found for user:", user.id);
        setError("Order not found or doesn't belong to your account");
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

          {/* Purchase Summary */}
          {order && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span>Purchase Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-mono text-sm">{order.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Items Purchased</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.title}</p>
                            {item.author && (
                              <p className="text-xs text-gray-600">
                                by {item.author}
                              </p>
                            )}
                            {item.isbn && (
                              <p className="text-xs text-gray-600">
                                ISBN: {item.isbn}
                              </p>
                            )}
                            {item.condition && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {item.condition}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-medium">
                              R{(item.price / 100).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-600">Qty: 1</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>
                        R
                        {(
                          (order.amount - (order.delivery_fee || 0)) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>
                    {order.delivery_fee && (
                      <div className="flex justify-between text-sm">
                        <span>Delivery Fee</span>
                        <span>R{(order.delivery_fee / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-lg border-t pt-2">
                      <span>Total Paid</span>
                      <span>R{(order.amount / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span>Delivery Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.delivery_address ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Delivery Address
                      </p>
                      <div className="text-sm">
                        <p>{order.delivery_address.street}</p>
                        <p>
                          {order.delivery_address.city},{" "}
                          {order.delivery_address.province}
                        </p>
                        <p>{order.delivery_address.postal_code}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Collection Method
                      </p>
                      <p className="text-sm">
                        Buyer to collect directly from seller
                      </p>
                    </div>
                  )}

                  {order.delivery_method && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Delivery Method
                      </p>
                      <p className="text-sm capitalize">
                        {order.delivery_method}
                      </p>
                    </div>
                  )}

                  {order.tracking_number && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Tracking Number
                      </p>
                      <p className="font-mono text-sm">
                        {order.tracking_number}
                      </p>
                    </div>
                  )}

                  {order.collection_deadline && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Collection Deadline
                      </p>
                      <p className="text-sm">
                        {new Date(
                          order.collection_deadline,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">Instructions</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        {order.delivery_address
                          ? "Your order will be delivered to the address above. You'll receive tracking information once the seller dispatches the item."
                          : "Please contact the seller to arrange collection. Make sure to bring valid ID and mention your order reference."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
