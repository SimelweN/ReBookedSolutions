import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, MapPin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SellerRestrictionBannerProps {
  isVisible: boolean;
  missingRequirements: string[];
  hasAddress: boolean;
  hasBankingDetails: boolean;
  onDismiss?: () => void;
  variant?: "full" | "compact";
}

const SellerRestrictionBanner: React.FC<SellerRestrictionBannerProps> = ({
  isVisible,
  missingRequirements,
  hasAddress,
  hasBankingDetails,
  onDismiss,
  variant = "full",
}) => {
  const navigate = useNavigate();

  if (!isVisible) return null;

  const hasAddressIssue = missingRequirements.some(
    (req) => req.includes("address") || req.includes("pickup"),
  );
  const hasBankingIssue = missingRequirements.some(
    (req) => req.includes("banking") || req.includes("payment"),
  );

  if (variant === "compact") {
    return (
      <Alert className="border-red-200 bg-red-50 mb-4">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              Please add your banking details to start selling. We need this to
              send you your payment.
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/profile?tab=banking")}
              className="border-red-300 text-red-700 hover:bg-red-100 ml-3"
            >
              Add Banking Details
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-red-200 bg-red-50 mb-6">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div>
          <span className="font-medium block mb-2">
            Complete your seller profile to start listing books
          </span>
          <p className="text-sm mb-4">
            We need some information to process orders and send you payments:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div
              className={`flex items-center gap-2 p-2 rounded ${
                hasAddress
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">
                Pickup Address {hasAddress ? "✓" : "Required"}
              </span>
            </div>

            <div
              className={`flex items-center gap-2 p-2 rounded ${
                hasBankingDetails
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="text-sm font-medium">
                Banking Details {hasBankingDetails ? "✓" : "Required"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!hasAddress && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/profile?tab=addresses")}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <MapPin className="w-3 h-3 mr-1" />
                Add Address
              </Button>
            )}

            {!hasBankingDetails && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/profile?tab=banking")}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <CreditCard className="w-3 h-3 mr-1" />
                Add Banking Details
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/profile")}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Complete Profile
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>

            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="text-red-600 hover:bg-red-100"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SellerRestrictionBanner;
