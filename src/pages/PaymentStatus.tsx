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
  Truck,
  AlertCircle,
  DollarSign,
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

      if (import.meta.env.MODE !== "production") {
        console.log("🔍 Starting order lookup with:", {
          orderId,
          reference,
          userId: user.id,
          userEmail: user.email,
          urlSearchParams: window.location.search
        });
      }
      // All logging and blocks are now correct

      // Try to load order by ID first
      if (orderId) {
        if (import.meta.env.MODE !== "production") {
          console.log("🔍 Looking up order by ID:", orderId);
        }
        try {
          foundOrder = await getOrderById(orderId);
          if (import.meta.env.MODE !== "production") {
            console.log("📋 Raw order found by ID:", foundOrder);
          }

          // Check if this order belongs to the current user
          if (foundOrder) {
            if (import.meta.env.MODE !== "production") {
              console.log("🔍 Order ownership check:", {
                orderBuyerId: foundOrder.buyer_id,
                orderSellerId: foundOrder.seller_id,
                currentUserId: user.id,
                buyerMatch: foundOrder.buyer_id === user.id,
                sellerMatch: foundOrder.seller_id === user.id
              });
            }
            // Removed stray lines, only console.log inside if block

            if (
              foundOrder.buyer_id !== user.id &&
              foundOrder.seller_id !== user.id
            ) {
              if (import.meta.env.MODE !== "production") {
                console.log("❌ Order found but doesn't belong to current user");
              }
              foundOrder = null;
            } else {
              if (import.meta.env.MODE !== "production") {
                console.log("✅ Order belongs to current user");
              }
            }
          }
        } catch (error) {
          console.error("❌ Error looking up order by ID:", error);
        }
      }

      // If not found by ID, try by reference
      if (!foundOrder && reference) {
        if (import.meta.env.MODE !== "production") {
          console.log("🔍 Looking up order by reference:", reference);
        }
        try {
          foundOrder = await getOrderByReference(reference);
          if (import.meta.env.MODE !== "production") {
            console.log("📋 Raw order found by reference:", foundOrder);
          }

          // Check if this order belongs to the current user
          if (foundOrder) {
            if (import.meta.env.MODE !== "production") {
              console.log("🔍 Order ownership check (by reference):", {
                orderBuyerId: foundOrder.buyer_id,
                orderSellerId: foundOrder.seller_id,
                currentUserId: user.id,
                buyerMatch: foundOrder.buyer_id === user.id,
                sellerMatch: foundOrder.seller_id === user.id
              });
            }
            // Removed stray lines, only console.log inside if block

            if (
              foundOrder.buyer_id !== user.id &&
              foundOrder.seller_id !== user.id
            ) {
              if (import.meta.env.MODE !== "production") {
                console.log("❌ Order found but doesn't belong to current user");
              }
              foundOrder = null;
            } else {
              if (import.meta.env.MODE !== "production") {
                console.log("✅ Order belongs to current user");
              }
            }
          }
        } catch (error) {
          console.error("❌ Error looking up order by reference:", error);
        }
      }

      if (import.meta.env.MODE !== "production") {
        console.log("🔍 Final order lookup result:", {
          orderId,
          reference,
          foundOrder
        });
      }
      // Removed stray lines, only console.log inside if block

      if (foundOrder) {
        setOrder(foundOrder);
        if (import.meta.env.MODE !== "production") {
          console.log("✅ Order loaded successfully:", foundOrder.id);
        }
      } else {
        if (import.meta.env.MODE !== "production") {
          console.log("❌ Order not found for user:", user.id);
        }
        // Debug: Check what orders this user has
        try {
          const userOrders = await getUserOrders(user.id);
          if (import.meta.env.MODE !== "production") {
            console.log(
              "🔍 User's available orders:",
              userOrders.map((o) => ({
                id: o.id,
                paystack_reference: o.paystack_reference,
                status: o.status,
                created_at: o.created_at,
              })),
            );
            if (userOrders.length === 0) {
              console.log("ℹ️ User has no orders at all");
            } else {
              console.log(
                `ℹ️ User has ${userOrders.length} orders, but none match the requested ID/reference`,
              );
            }
          }
        } catch (debugError) {
          console.error(
            "❌ Error fetching user orders for debugging:",
            debugError,
          );
        }
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
      Reference: ${order.paystack_reference}
      Date: ${new Date(order.created_at).toLocaleDateString()}
      Amount: R${(order.amount / 100).toFixed(2)}
      Status: ${order.status}
      Payment Status: ${order.payment_status}

      Book Details:
      ${order.book ? `- ${order.book.title} by ${order.book.author}` : "- Book details not available"}

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
      case "pending":
        return <Clock className="w-8 h-8 text-gray-500" />;
      case "paid":
        return <CreditCard className="w-8 h-8 text-blue-500" />;
      case "committed":
        return <Package className="w-8 h-8 text-orange-500" />;
      case "shipped":
        return <Truck className="w-8 h-8 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case "cancelled":
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      case "refunded":
        return <DollarSign className="w-8 h-8 text-yellow-500" />;
      default:
        return <Clock className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "pending":
        return "Your order is being processed...";
      case "paid":
        return "Payment confirmed! The seller has 48 hours to commit to your order.";
      case "committed":
        return "Great! The seller has committed to your order and will prepare it for collection/delivery.";
      case "shipped":
        return "Your order has been shipped and is on its way to you.";
      case "delivered":
        return "Order delivered successfully!";
      case "cancelled":
        return "This order has been cancelled.";
      case "refunded":
        return "This order has been refunded.";
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
                {order.payment_status &&
                  order.payment_status !== order.status && (
                    <Badge variant="outline" className="ml-2">
                      Payment: {order.payment_status}
                    </Badge>
                  )}
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
                    <h4 className="font-medium mb-3">Book Purchased</h4>
                    <div className="space-y-3">
                      {order.book ? (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {order.book.title}
                            </p>
                            {order.book.author && (
                              <p className="text-xs text-gray-600">
                                by {order.book.author}
                              </p>
                            )}
                            {order.book.imageUrl && (
                              <div className="mt-2">
                                <img
                                  src={order.book.imageUrl}
                                  alt={order.book.title}
                                  className="w-16 h-20 object-cover rounded"
                                />
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-medium">
                              R{(order.amount / 100).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-600">Qty: 1</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">
                          Book details not available
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Book Price</span>
                      <span>R{(order.amount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery</span>
                      <span>
                        {order.delivery_option === "pickup"
                          ? "Collection"
                          : "Included"}
                      </span>
                    </div>
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
                  {order.delivery_option === "delivery" &&
                  order.delivery_address ? (
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
                        {order.delivery_option === "pickup"
                          ? "Pickup from seller"
                          : "Collection method not specified"}
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

                  {order.commit_deadline && order.status === "paid" && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Seller Commitment Deadline
                      </p>
                      <p className="text-sm font-medium text-orange-600">
                        {new Date(order.commit_deadline).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(order.commit_deadline).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Seller must commit within 48 hours of payment
                      </p>
                    </div>
                  )}

                  {order.committed_at && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Committed At</p>
                      <p className="text-sm">
                        {new Date(order.committed_at).toLocaleDateString()} at{" "}
                        {new Date(order.committed_at).toLocaleTimeString()}
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
