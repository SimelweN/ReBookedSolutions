import { useSellerRequirements } from "@/hooks/useSellerRequirements";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Shield,
  CreditCard,
  Loader2,
  Building,
  Lock,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SellerRequirementsDialog from "./SellerRequirementsDialog";

interface BankingRequirementGateProps {
  children: React.ReactNode;
  action: string; // e.g., "upload a book", "create a listing"
  showWarning?: boolean;
}

const BankingRequirementGate = ({
  children,
  action,
  showWarning = true,
}: BankingRequirementGateProps) => {
  const navigate = useNavigate();
  const {
    requirements,
    isLoading,
    showRequirementsDialog,
    requireSellerSetup,
    closeRequirementsDialog,
  } = useSellerRequirements();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-book-600"></div>
          <span className="text-gray-600">Checking seller requirements...</span>
        </div>
      </div>
    );
  }

  if (!requirements.isComplete) {
    return (
      <>
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <Building className="w-5 h-5" />
              <span>Seller Setup Required</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showWarning && (
              <Alert className="border-orange-300 bg-orange-100">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>
                    Complete your seller setup to {action}. Missing:{" "}
                    {requirements.missingRequirements.join(" and ")}.
                  </strong>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <p className="text-sm text-orange-700">
                To sell books, you need both banking details and a pickup
                address.
              </p>

              {/* Requirements Status */}
              <div className="grid grid-cols-1 gap-3">
                <div
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${
                    requirements.hasBankingSetup
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <CreditCard
                    className={`w-5 h-5 ${requirements.hasBankingSetup ? "text-green-600" : "text-gray-400"}`}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Banking Details</p>
                    <p className="text-xs text-gray-600">
                      Required for receiving payments
                    </p>
                  </div>
                  {requirements.hasBankingSetup && (
                    <span className="text-green-600 text-sm">���</span>
                  )}
                </div>

                <div
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${
                    requirements.hasPickupAddress
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <MapPin
                    className={`w-5 h-5 ${requirements.hasPickupAddress ? "text-green-600" : "text-gray-400"}`}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Pickup Address</p>
                    <p className="text-xs text-gray-600">
                      Required for book collection
                    </p>
                  </div>
                  {requirements.hasPickupAddress && (
                    <span className="text-green-600 text-sm">✓</span>
                  )}
                </div>
              </div>

              {/* Payout Information */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium">Payout Conditions</p>
                    <p>
                      Payments are only released to sellers{" "}
                      <strong>after the book has been delivered</strong> to the
                      buyer.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => requireSellerSetup(action)}
                className="w-full bg-book-600 hover:bg-book-700"
                size="lg"
              >
                Complete Setup to {action}
              </Button>

              <div className="flex justify-center space-x-4 pt-2">
                <Badge variant="outline" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Secure
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <CreditCard className="w-3 h-3 mr-1" />
                  Fast Payouts
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <SellerRequirementsDialog
          isOpen={showRequirementsDialog}
          onClose={closeRequirementsDialog}
          requirements={requirements}
        />
      </>
    );
  }

  // User has completed all requirements - render children (the protected content)
  return <>{children}</>;
};

export default BankingRequirementGate;
