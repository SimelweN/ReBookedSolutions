/**
 * Transaction Status Component
 * Handles seller commit and buyer delivery confirmation
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  Clock,
  Package,
  Truck,
  HandHeart,
  AlertTriangle,
  User,
  CreditCard,
} from "lucide-react";
import { PaymentIntegrationService } from "@/services/paymentIntegrationService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TransactionStatusProps {
  transactionId: string;
  bookTitle: string;
  amount: number;
  className?: string;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({
  transactionId,
  bookTitle,
  amount,
  className = "",
}) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>("pending");
  const [canCommit, setCanCommit] = useState(false);
  const [canConfirm, setCanConfirm] = useState(false);
  const [expired, setExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTransactionStatus();

    // Refresh status every 30 seconds
    const interval = setInterval(loadTransactionStatus, 30000);
    return () => clearInterval(interval);
  }, [transactionId]);

  const loadTransactionStatus = async () => {
    try {
      const statusData =
        await PaymentIntegrationService.getTransactionStatus(transactionId);
      setStatus(statusData.status);
      setCanCommit(statusData.canCommit);
      setCanConfirm(statusData.canConfirm);
      setExpired(statusData.expired);
    } catch (error) {
      console.error("Failed to load transaction status:", error);
    }
  };

  const handleCommit = async () => {
    setIsLoading(true);
    try {
      const success =
        await PaymentIntegrationService.commitToSale(transactionId);
      if (success) {
        await loadTransactionStatus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    setIsLoading(true);
    try {
      const success =
        await PaymentIntegrationService.confirmDelivery(transactionId);
      if (success) {
        await loadTransactionStatus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case "pending":
        return {
          icon: <Clock className="h-5 w-5 text-yellow-600" />,
          color: "bg-yellow-100 text-yellow-800 border-yellow-300",
          label: "Payment Pending",
          description: "Waiting for payment to be completed",
        };
      case "paid_pending_seller":
        return {
          icon: <User className="h-5 w-5 text-blue-600" />,
          color: "bg-blue-100 text-blue-800 border-blue-300",
          label: "Awaiting Seller",
          description:
            "Payment received. Waiting for seller to confirm the sale.",
        };
      case "committed":
        return {
          icon: <Package className="h-5 w-5 text-purple-600" />,
          color: "bg-purple-100 text-purple-800 border-purple-300",
          label: "Sale Confirmed",
          description: "Seller confirmed. Book is being prepared for delivery.",
        };
      case "collected":
        return {
          icon: <Truck className="h-5 w-5 text-orange-600" />,
          color: "bg-orange-100 text-orange-800 border-orange-300",
          label: "Ready for Delivery",
          description: "Book has been collected and is ready for delivery.",
        };
      case "completed":
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          color: "bg-green-100 text-green-800 border-green-300",
          label: "Completed",
          description: "Transaction completed successfully!",
        };
      case "cancelled":
      case "refunded":
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
          color: "bg-red-100 text-red-800 border-red-300",
          label: "Cancelled",
          description: "Transaction was cancelled or refunded.",
        };
      default:
        return {
          icon: <Clock className="h-5 w-5 text-gray-600" />,
          color: "bg-gray-100 text-gray-800 border-gray-300",
          label: "Unknown",
          description: "Transaction status unknown.",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Transaction Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transaction Details */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Book:</span>
            <span className="font-medium">{bookTitle}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="font-medium">R{amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Transaction ID:</span>
            <span className="text-xs font-mono text-gray-500">
              {transactionId.slice(0, 8)}...
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {statusInfo.icon}
          <Badge variant="outline" className={statusInfo.color}>
            {statusInfo.label}
          </Badge>
        </div>

        {/* Status Description */}
        <p className="text-sm text-gray-600">{statusInfo.description}</p>

        {/* Expired Warning */}
        {expired && status === "paid_pending_seller" && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This transaction has expired. The seller did not confirm within 48
              hours. A refund will be processed automatically.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {canCommit && (
            <div className="space-y-2">
              <Alert className="border-blue-200 bg-blue-50">
                <HandHeart className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">Confirm this sale?</div>
                    <div className="text-sm">
                      By confirming, you commit to providing the book to the
                      buyer. You have 48 hours to confirm before the transaction
                      expires.
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleCommit}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Confirming..." : "Confirm Sale"}
              </Button>
            </div>
          )}

          {canConfirm && (
            <div className="space-y-2">
              <Alert className="border-green-200 bg-green-50">
                <Package className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">Received your book?</div>
                    <div className="text-sm">
                      Only confirm delivery after you've received the book and
                      are satisfied with its condition.
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleConfirmDelivery}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Confirming..." : "Confirm Delivery"}
              </Button>
            </div>
          )}
        </div>

        {/* Progress Timeline */}
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Progress Timeline
          </h4>
          <div className="space-y-2">
            {[
              {
                key: "pending",
                label: "Payment Initiated",
                completed: [
                  "paid_pending_seller",
                  "committed",
                  "completed",
                ].includes(status),
              },
              {
                key: "paid_pending_seller",
                label: "Payment Confirmed",
                completed: ["committed", "completed"].includes(status),
              },
              {
                key: "committed",
                label: "Sale Confirmed",
                completed: ["completed"].includes(status),
              },
              {
                key: "completed",
                label: "Delivery Confirmed",
                completed: status === "completed",
              },
            ].map((step) => (
              <div key={step.key} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${step.completed ? "bg-green-500" : "bg-gray-300"}`}
                />
                <span
                  className={`text-sm ${step.completed ? "text-green-700 font-medium" : "text-gray-500"}`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionStatus;
