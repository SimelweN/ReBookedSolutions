import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface SellerRequirementsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requirements: {
    hasBankingSetup: boolean;
    hasPickupAddress: boolean;
    isComplete: boolean;
    missingRequirements: string[];
  };
}

const SellerRequirementsDialog = ({
  isOpen,
  onClose,
  requirements,
}: SellerRequirementsDialogProps) => {
  const navigate = useNavigate();

  const handleNavigateToBanking = () => {
    onClose();
    navigate("/banking-setup");
  };

  const handleNavigateToProfile = () => {
    onClose();
    navigate("/profile");
    // Scroll to addresses tab after navigation
    setTimeout(() => {
      const addressTab = document.querySelector('[data-value="addresses"]');
      if (addressTab) {
        (addressTab as HTMLElement).click();
      }
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>Complete Your Seller Setup</span>
          </DialogTitle>
          <DialogDescription>
            To start listing books for sale, you need to complete these required
            steps:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Requirements Checklist */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg border">
              {requirements.hasBankingSetup ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <CreditCard className="w-5 h-5 text-orange-600" />
              )}
              <div className="flex-1">
                <p
                  className={`font-medium ${requirements.hasBankingSetup ? "text-green-800" : "text-gray-900"}`}
                >
                  Banking Details
                </p>
                <p className="text-sm text-gray-600">
                  {requirements.hasBankingSetup
                    ? "✓ Set up and ready for payments"
                    : "Required to receive payments from sales"}
                </p>
              </div>
              {!requirements.hasBankingSetup && (
                <Button
                  onClick={handleNavigateToBanking}
                  size="sm"
                  className="bg-book-600 hover:bg-book-700"
                >
                  Set Up
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border">
              {requirements.hasPickupAddress ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <MapPin className="w-5 h-5 text-orange-600" />
              )}
              <div className="flex-1">
                <p
                  className={`font-medium ${requirements.hasPickupAddress ? "text-green-800" : "text-gray-900"}`}
                >
                  Pickup Address
                </p>
                <p className="text-sm text-gray-600">
                  {requirements.hasPickupAddress
                    ? "✓ Address provided for book collection"
                    : "Required for buyers to collect books"}
                </p>
              </div>
              {!requirements.hasPickupAddress && (
                <Button
                  onClick={handleNavigateToProfile}
                  size="sm"
                  variant="outline"
                >
                  Add Address
                </Button>
              )}
            </div>
          </div>

          {/* Payout Information */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <p className="font-medium mb-1">Important: Payout Conditions</p>
              <p className="text-sm">
                Payments are only released to sellers{" "}
                <strong>after the book has been delivered</strong> to the buyer.
                This protects both buyers and sellers in the transaction.
              </p>
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            {requirements.isComplete ? (
              <Button
                onClick={() => {
                  onClose();
                  navigate("/create-listing");
                }}
                className="flex-1 bg-book-600 hover:bg-book-700"
              >
                Create Listing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={
                  requirements.hasBankingSetup
                    ? handleNavigateToProfile
                    : handleNavigateToBanking
                }
                className="flex-1 bg-book-600 hover:bg-book-700"
              >
                {requirements.hasBankingSetup
                  ? "Add Address"
                  : "Set Up Banking"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SellerRequirementsDialog;
