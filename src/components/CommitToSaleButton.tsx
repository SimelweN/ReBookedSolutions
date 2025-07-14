import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TransactionService } from "@/services/transactionService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface CommitToSaleButtonProps {
  transactionId: string;
  bookTitle: string;
  buyerName?: string;
  amount: number;
  expiresAt: string;
  onCommitSuccess?: () => void;
  className?: string;
}

const CommitToSaleButton: React.FC<CommitToSaleButtonProps> = ({
  transactionId,
  bookTitle,
  buyerName,
  amount,
  expiresAt,
  onCommitSuccess,
  className = "",
}) => {
  const [isCommitting, setIsCommitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { user } = useAuth();

  const timeRemaining = () => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const isExpired = () => {
    return new Date() > new Date(expiresAt);
  };

  const handleCommit = async () => {
    if (isExpired()) {
      toast.error("Commit window has expired");
      return;
    }

    setIsCommitting(true);
    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      await TransactionService.commitSale(transactionId, user.id);

      toast.success("🎉 Sale committed successfully!");
      setShowConfirmDialog(false);

      if (onCommitSuccess) {
        onCommitSuccess();
      }
    } catch (error) {
      console.error("Error committing sale:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to commit sale";
      toast.error(errorMessage);
    } finally {
      setIsCommitting(false);
    }
  };

  if (isExpired()) {
    return (
      <div
        className={`text-center p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
      >
        <AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-2" />
        <p className="text-sm text-red-800 font-medium">
          Commit Window Expired
        </p>
        <p className="text-xs text-red-600">
          This sale has been automatically cancelled
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className={`p-4 bg-orange-50 border border-orange-200 rounded-lg ${className}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-orange-600 mr-2" />
            <span className="font-medium text-orange-800">Commit Required</span>
          </div>
          <Badge
            variant="outline"
            className="text-orange-700 border-orange-300"
          >
            {timeRemaining()}
          </Badge>
        </div>

        <p className="text-sm text-orange-700 mb-4">
          A buyer has paid for "{bookTitle}". You have 48 hours to commit to
          this sale.
        </p>

        <Button
          onClick={() => setShowConfirmDialog(true)}
          className="w-full bg-book-600 hover:bg-book-700"
          disabled={isCommitting}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {isCommitting ? "Committing..." : "Commit to Sale"}
        </Button>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Confirm Sale Commitment
            </DialogTitle>
            <DialogDescription>
              Please confirm that you can fulfill this order
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Order Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Book:</span>
                  <span className="text-blue-900 font-medium">{bookTitle}</span>
                </div>
                {buyerName && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Buyer:</span>
                    <span className="text-blue-900">{buyerName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-blue-700">Amount:</span>
                  <span className="text-blue-900 font-medium">
                    R{amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Your Share (90%):</span>
                  <span className="text-green-700 font-medium">
                    R{(amount * 0.9).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Important</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• By committing, you guarantee this book is available</li>
                <li>• You must arrange pickup/delivery with the buyer</li>
                <li>• Payment will be processed after successful delivery</li>
                <li>• Failure to fulfill may affect your seller rating</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1"
                disabled={isCommitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCommit}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isCommitting}
              >
                {isCommitting ? "Committing..." : "Confirm Commitment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommitToSaleButton;
