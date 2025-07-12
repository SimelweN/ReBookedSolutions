import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { triggerOrderCancellation } from "@/services/notificationTriggerService";
import { toast } from "sonner";

interface OrderCancellationButtonProps {
  orderId: string;
  orderStatus: string;
  sellerId: string;
  canCancel?: boolean;
  onCancelled?: () => void;
}

const OrderCancellationButton: React.FC<OrderCancellationButtonProps> = ({
  orderId,
  orderStatus,
  sellerId,
  canCancel = true,
  onCancelled,
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Determine if cancellation is allowed based on order status
  const cancellationAllowed =
    canCancel &&
    ["pending_commit", "committed", "preparing"].includes(orderStatus);

  const handleCancellation = async () => {
    if (!user || !cancellationAllowed) return;

    setIsLoading(true);
    try {
      // Update order status in database
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "cancelled_by_buyer",
          cancellation_reason: reason.trim() || "No reason provided",
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("buyer_id", user.id); // Ensure only buyer can cancel their order

      if (updateError) {
        throw new Error(`Failed to cancel order: ${updateError.message}`);
      }

      // Trigger notifications
      await triggerOrderCancellation(
        {
          id: orderId,
          buyer_id: user.id,
          seller_id: sellerId,
          status: "cancelled_by_buyer",
        },
        "buyer",
        reason.trim() || undefined,
      );

      // Process refund (if payment was made)
      try {
        const { data: paymentData } = await supabase
          .from("payments")
          .select("id, amount, status")
          .eq("order_id", orderId)
          .eq("status", "completed")
          .single();

        if (paymentData) {
          // Mark payment for refund
          await supabase
            .from("payments")
            .update({
              status: "refund_pending",
              refund_requested_at: new Date().toISOString(),
            })
            .eq("id", paymentData.id);

          toast.success(
            "Order cancelled successfully! Refund will be processed within 3-5 business days.",
          );
        } else {
          toast.success("Order cancelled successfully!");
        }
      } catch (refundError) {
        console.warn("Could not process refund automatically:", refundError);
        toast.success(
          "Order cancelled successfully! Please contact support for refund processing.",
        );
      }

      setIsOpen(false);
      onCancelled?.();
    } catch (error) {
      console.error("Order cancellation failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel order",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!cancellationAllowed) {
    return null;
  }

  const getStatusMessage = () => {
    switch (orderStatus) {
      case "picked_up":
        return "Order cannot be cancelled after pickup";
      case "in_transit":
        return "Order cannot be cancelled while in transit";
      case "delivered":
        return "Order cannot be cancelled after delivery";
      case "completed":
        return "Order has been completed";
      default:
        return "You can cancel this order before pickup";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={!cancellationAllowed}
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel Order
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Cancel Order
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this order? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {getStatusMessage()}
              {cancellationAllowed && orderStatus === "committed" && (
                <span className="block mt-2 font-medium">
                  ⚠️ The seller has already committed to this order. Cancelling
                  now may affect your buyer rating.
                </span>
              )}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="cancellation-reason">
              Reason for cancellation (optional)
            </Label>
            <Textarea
              id="cancellation-reason"
              placeholder="Please let the seller know why you're cancelling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {reason.length}/500 characters
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">What happens next:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• The seller will be notified immediately</li>
              <li>
                • If you paid, a refund will be processed (3-5 business days)
              </li>
              <li>• You can search for alternative books on our platform</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Keep Order
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancellation}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            {isLoading ? "Cancelling..." : "Cancel Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderCancellationButton;
