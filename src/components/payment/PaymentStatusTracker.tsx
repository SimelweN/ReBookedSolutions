import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Truck,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Eye,
  RefreshCw,
} from "lucide-react";
import PaystackPaymentService, {
  OrderData,
} from "@/services/paystackPaymentService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PaymentStatusTrackerProps {
  orderId?: string;
  reference?: string;
  showSellerActions?: boolean;
}

const PaymentStatusTracker: React.FC<PaymentStatusTrackerProps> = ({
  orderId,
  reference,
  showSellerActions = false,
}) => {
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (orderId || reference) {
      loadOrder();
    }
  }, [orderId, reference]);

  const loadOrder = async () => {
    if (!orderId && !reference) return;

    try {
      setLoading(true);
      // Implementation would fetch order by ID or reference
      // For now, using placeholder data structure
      const orders = await PaystackPaymentService.getOrdersByStatus("paid");
      const foundOrder = orders.find(
        (o) => o.id === orderId || o.paystack_ref === reference,
      );

      if (foundOrder) {
        setOrder(foundOrder);
      }
    } catch (error) {
      console.error("Error loading order:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrder();
    setRefreshing(false);
  };

  const handleMarkReadyForPayout = async () => {
    if (!order) return;

    try {
      await PaystackPaymentService.markReadyForPayout(order.id);
      toast.success("Order marked ready for payout");
      await loadOrder(); // Refresh order status
    } catch (error) {
      console.error("Error marking ready for payout:", error);
      toast.error("Failed to mark order ready for payout");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "paid":
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      case "ready_for_payout":
        return <Package className="w-4 h-4 text-orange-500" />;
      case "paid_out":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "paid":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ready_for_payout":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "paid_out":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Payment Pending";
      case "paid":
        return "Payment Confirmed";
      case "ready_for_payout":
        return "Ready for Payout";
      case "paid_out":
        return "Seller Paid";
      case "failed":
        return "Payment Failed";
      default:
        return "Unknown Status";
    }
  };

  const formatAmount = (amount: number) => {
    return `R${(amount / 100).toFixed(2)}`;
  };

  const getSellerAmount = (amount: number) => {
    return Math.round(amount * 0.9); // 90% after 10% commission
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading order details...
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Order not found</p>
          <Button variant="outline" onClick={handleRefresh} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Order {order.id.slice(0, 8)}</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center space-x-2">
            {getStatusIcon(order.status)}
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-900">Amount</p>
              <p className="text-gray-600">{formatAmount(order.amount)}</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Date</p>
              <p className="text-gray-600">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Reference</p>
              <p className="text-gray-600 font-mono text-xs">
                {order.paystack_ref}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Items</p>
              <p className="text-gray-600">{order.items.length} book(s)</p>
            </div>
          </div>

          {/* Seller Actions */}
          {showSellerActions && user?.id === order.seller_id && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Seller Actions</h4>

              {order.status === "paid" && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Mark as ready for payout when courier confirms pickup
                  </p>
                  <Button
                    onClick={handleMarkReadyForPayout}
                    size="sm"
                    className="w-full"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Courier Confirmed Pickup
                  </Button>
                </div>
              )}

              {order.status === "ready_for_payout" && (
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-orange-800">
                    Payout Processing
                  </p>
                  <p className="text-sm text-orange-600">
                    Your payment of{" "}
                    {formatAmount(getSellerAmount(order.amount))} will be
                    processed within 1 hour.
                  </p>
                </div>
              )}

              {order.status === "paid_out" && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    Payment Completed
                  </p>
                  <p className="text-sm text-green-600">
                    {formatAmount(getSellerAmount(order.amount))} has been
                    transferred to your account.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Payout Information - Only show to sellers */}
          {order.status !== "pending" &&
            order.status !== "failed" &&
            user?.id === order.seller_id && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Your Payout
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Total:</span>
                    <span>{formatAmount(order.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee (10%):</span>
                    <span className="text-red-600">
                      -{formatAmount(Math.round(order.amount * 0.1))}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>You Receive:</span>
                    <span className="text-green-600">
                      {formatAmount(getSellerAmount(order.amount))}
                    </span>
                  </div>
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Order Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Order Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Payment Step */}
            <div className="flex items-start space-x-3">
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  ["paid", "ready_for_payout", "paid_out"].includes(
                    order.status,
                  )
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
              <div>
                <p className="font-medium text-sm">Payment Received</p>
                <p className="text-xs text-gray-500">
                  {order.status !== "pending" ? "Completed" : "Pending"}
                </p>
              </div>
            </div>

            {/* Courier Step */}
            <div className="flex items-start space-x-3">
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  ["ready_for_payout", "paid_out"].includes(order.status)
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
              <div>
                <p className="font-medium text-sm">Courier Pickup</p>
                <p className="text-xs text-gray-500">
                  {order.status === "ready_for_payout" ||
                  order.status === "paid_out"
                    ? "Confirmed"
                    : "Pending"}
                </p>
              </div>
            </div>

            {/* Payout Step */}
            <div className="flex items-start space-x-3">
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  order.status === "paid_out" ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <div>
                <p className="font-medium text-sm">Seller Payout</p>
                <p className="text-xs text-gray-500">
                  {order.status === "paid_out" ? "Completed" : "Pending"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentStatusTracker;
