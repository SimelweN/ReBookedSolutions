import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  User,
  Calendar,
  Timer,
  Handshake,
} from "lucide-react";
import { OrderData } from "@/services/paystackPaymentService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CommitToOrderProps {
  order: OrderData;
  onCommit?: (order: OrderData) => void;
  onCancel?: (order: OrderData) => void;
}

const CommitToOrder: React.FC<CommitToOrderProps> = ({
  order,
  onCommit,
  onCancel,
}) => {
  const { user } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitDeadline, setCommitDeadline] = useState<Date | null>(null);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    // Calculate commit deadline (48 hours from paid_at)
    if (order.paid_at) {
      const paidAt = new Date(order.paid_at);
      const deadline = new Date(paidAt.getTime() + 48 * 60 * 60 * 1000); // 48 hours
      setCommitDeadline(deadline);
    }
  }, [order.paid_at]);

  useEffect(() => {
    if (!commitDeadline) return;

    const updateTimer = () => {
      const now = new Date();
      const remaining = commitDeadline.getTime() - now.getTime();

      if (remaining <= 0) {
        setTimeRemaining(0);
        setHasExpired(true);
      } else {
        setTimeRemaining(remaining);
        setHasExpired(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [commitDeadline]);

  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) return "Expired";

    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getProgressPercentage = () => {
    if (!commitDeadline || !order.paid_at) return 0;

    const totalTime = 48 * 60 * 60 * 1000; // 48 hours in ms
    const elapsed = Date.now() - new Date(order.paid_at).getTime();
    const percentage = Math.min((elapsed / totalTime) * 100, 100);

    return percentage;
  };

  const getTimeColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-orange-600";
    return "text-green-600";
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-orange-500";
    return "bg-green-500";
  };

  const handleCommitToOrder = async () => {
    if (!user?.id || user.id !== order.seller_id) {
      toast.error("You are not authorized to commit to this order");
      return;
    }

    if (hasExpired) {
      toast.error("The commit window has expired");
      return;
    }

    setIsCommitting(true);

    try {
      // Update order status to committed
      const { error } = await supabase
        .from("orders")
        .update({
          status: "committed",
          committed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (error) throw error;

      // Create notification for buyer with error handling
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: order.buyer_email, // This should be buyer_id in production
          type: "order_committed",
          title: "Seller Committed to Your Order",
          message: `The seller has committed to your order for "${order.items[0]?.title}". Your book will be prepared for delivery.`,
          data: {
            order_id: order.id,
            order_type: "buyer",
          },
        });

      if (notificationError) {
        console.warn(
          "Failed to create notification for buyer:",
          notificationError,
        );
        // Don't throw here - order commitment was successful, notification is secondary
      }

      toast.success(
        "Order committed successfully! The buyer has been notified.",
      );
      onCommit?.(order);
    } catch (error) {
      console.error("Error committing to order:", error);
      toast.error("Failed to commit to order. Please try again.");
    } finally {
      setIsCommitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!user?.id || user.id !== order.seller_id) {
      toast.error("You are not authorized to cancel this order");
      return;
    }

    try {
      // Update order status to cancelled
      const { error } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (error) throw error;

      // Create notification for buyer with error handling
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: order.buyer_email, // This should be buyer_id in production
          type: "order_cancelled",
          title: "Order Cancelled by Seller",
          message: `Unfortunately, the seller cannot fulfill your order for "${order.items[0]?.title}". Your payment will be refunded.`,
          data: {
            order_id: order.id,
            order_type: "buyer",
          },
        });

      if (notificationError) {
        console.warn(
          "Failed to create notification for buyer:",
          notificationError,
        );
        // Don't throw here - order cancellation was successful, notification is secondary
      }

      toast.success(
        "Order cancelled. The buyer will be notified and refunded.",
      );
      onCancel?.(order);
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order. Please try again.");
    }
  };

  // Don't show commit component for buyers or if already committed
  if (user?.id !== order.seller_id || order.status !== "paid") {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Timer className="w-5 h-5" />
          Action Required: Commit to Order
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <div className={`text-3xl font-bold ${getTimeColor()}`}>
              {formatTimeRemaining(timeRemaining)}
            </div>
            <div className="text-sm text-gray-600">
              {hasExpired
                ? "Time to commit has expired"
                : "Time remaining to commit"}
            </div>
          </div>

          <Progress value={getProgressPercentage()} className="w-full h-3" />

          <div className="text-xs text-gray-500">
            {commitDeadline && (
              <>
                Deadline: {commitDeadline.toLocaleDateString()} at{" "}
                {commitDeadline.toLocaleTimeString()}
              </>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg p-4 border border-orange-200">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Order Details
          </h4>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono">{order.id.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Buyer:</span>
              <span>{order.buyer_email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Book:</span>
              <span>{order.items[0]?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold text-green-600">
                R{(order.amount / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Paid At:</span>
              <span>
                {order.paid_at
                  ? new Date(order.paid_at).toLocaleString()
                  : "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* Commit Requirements */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            What happens when you commit?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ You confirm you can fulfill this order</li>
            <li>✓ The buyer will be notified</li>
            <li>✓ Courier will be arranged for pickup/delivery</li>
            <li>✓ You'll receive payment after successful delivery</li>
            <li>⚠ Failing to commit may affect your seller rating</li>
          </ul>
        </div>

        {/* Action Buttons */}
        {!hasExpired ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleCommitToOrder}
              disabled={isCommitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isCommitting ? (
                "Committing..."
              ) : (
                <>
                  <Handshake className="w-4 h-4 mr-2" />
                  Commit to Order
                </>
              )}
            </Button>

            <Button
              onClick={handleCancelOrder}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Cannot Fulfill
            </Button>
          </div>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              The 48-hour commit window has expired. This order will be
              automatically cancelled and the buyer will be refunded. Please
              contact support if needed.
            </AlertDescription>
          </Alert>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500 text-center">
          As a seller, you have 48 hours to commit to each order after payment.
          This ensures quick fulfillment and maintains buyer confidence.
        </div>
      </CardContent>
    </Card>
  );
};

export default CommitToOrder;
