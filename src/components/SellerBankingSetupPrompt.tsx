import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  AlertTriangle,
  ArrowRight,
  DollarSign,
} from "lucide-react";

interface SellerBankingSetupPromptProps {
  isVisible: boolean;
  onDismiss?: () => void;
}

const SellerBankingSetupPrompt: React.FC<SellerBankingSetupPromptProps> = ({
  isVisible,
  onDismiss,
}) => {
  const navigate = useNavigate();

  if (!isVisible) return null;

  const handleSetupBanking = () => {
    navigate("/profile?tab=banking");
    if (onDismiss) onDismiss();
  };

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-900">
          <CreditCard className="h-5 w-5 mr-2" />
          Complete Payment Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-orange-300 bg-orange-100">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="space-y-2">
              <p className="font-medium">Payment Account Required</p>
              <p className="text-sm">
                To receive payments instantly when your books sell, you need to
                set up your banking details. This enables our automatic 90/10
                split payment system.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <h4 className="font-medium text-orange-900 mb-3">
            Why Set Up Banking Details?
          </h4>
          <div className="space-y-2 text-sm text-orange-800">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-600" />
              <span>
                Get paid instantly when books sell (90% of sale price)
              </span>
            </div>
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
              <span>Secure payment processing via Paystack</span>
            </div>
            <div className="flex items-center">
              <ArrowRight className="h-4 w-4 mr-2 text-purple-600" />
              <span>Automatic split - no manual processing needed</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">
            ⚠️ What Happens Without Banking Setup?
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Buyers will use alternative payment methods</li>
            <li>• You'll need manual payout processing</li>
            <li>• Payments may take 2-3 business days longer</li>
            <li>• You'll miss out on instant payment features</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSetupBanking}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Set Up Banking Details
          </Button>
          {onDismiss && (
            <Button
              variant="outline"
              onClick={onDismiss}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              Later
            </Button>
          )}
        </div>

        <p className="text-xs text-orange-600 text-center">
          Setup takes less than 2 minutes and is completely secure
        </p>
      </CardContent>
    </Card>
  );
};

export default SellerBankingSetupPrompt;
