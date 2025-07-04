import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  Clock,
  CheckCircle,
  CreditCard,
  Eye,
  Truck,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PaystackPaymentService, {
  OrderData,
} from "@/services/paystackPaymentService";
import SEO from "@/components/SEO";
import { toast } from "sonner";

const UserOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.email) {
      loadUserOrders();
    }
  }, [user, isAuthenticated]);

  const loadUserOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.email) {
        setError("User email not available");
        return;
      }

      const userOrders = await PaystackPaymentService.getUserOrders(user.email);
      setOrders(userOrders);

      if (userOrders.length === 0) {
        toast.info(
          "No orders found. Start shopping to see your purchases here!",
        );
      }
    } catch (error) {
      console.error("Error loading user orders:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load orders",
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      case "ready_for_payout":
        return <Truck className="w-4 h-4 text-orange-500" />;
      case "paid_out":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ready_for_payout":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "paid_out":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "paid":
        return "Payment confirmed - Order being prepared";
      case "ready_for_payout":
        return "In transit - On the way to you";
      case "paid_out":
        return "Completed - Order delivered";
      default:
        return "Processing";
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Please sign in to view your orders
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
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your orders...</p>
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
          <div className="max-w-6xl mx-auto px-4 py-8">
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="text-center mt-6 space-x-4">
              <Button onClick={loadUserOrders} variant="outline">
                Try Again
              </Button>
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
        title="My Orders - ReBooked Solutions"
        description="View all your book purchases and order history"
        keywords="order history, purchases, books, textbooks"
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">
              View and track all your book purchases
            </p>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start shopping to see your purchases here!
                </p>
                <Button onClick={() => navigate("/books")}>Browse Books</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card
                  key={order.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {getStatusIcon(order.status)}
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Order #{order.id.slice(0, 8)}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>

                        {/* Items */}
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">
                            {order.items.length} item
                            {order.items.length > 1 ? "s" : ""}:
                          </p>
                          <div className="space-y-1">
                            {order.items.slice(0, 2).map((item, index) => (
                              <p key={index} className="text-sm font-medium">
                                {item.title}
                                {item.author && ` by ${item.author}`}
                              </p>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-sm text-gray-600">
                                +{order.items.length - 2} more items
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-600">
                          {getStatusMessage(order.status)}
                        </p>
                      </div>

                      {/* Amount and Actions */}
                      <div className="flex items-center justify-between lg:justify-end lg:space-x-6 mt-4 lg:mt-0">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            R{(order.amount / 100).toFixed(2)}
                          </p>
                          {order.delivery_fee && (
                            <p className="text-xs text-gray-600">
                              Inc. R{(order.delivery_fee / 100).toFixed(2)}{" "}
                              delivery
                            </p>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/payment-status/${order.id}`)
                            }
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 text-center space-x-4">
            <Button variant="outline" onClick={() => navigate("/books")}>
              Continue Shopping
            </Button>
            <Button variant="outline" onClick={() => navigate("/profile")}>
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserOrders;
