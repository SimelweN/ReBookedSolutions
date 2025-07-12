import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  CreditCard,
  Building2,
  DollarSign,
  Percent,
  RefreshCw,
} from "lucide-react";
import { PaystackSubaccountService } from "@/services/paystackSubaccountService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface BankingSystemStatusProps {
  userId?: string;
  onActionRequired?: (action: string) => void;
}

const BankingSystemStatus: React.FC<BankingSystemStatusProps> = ({
  userId,
  onActionRequired,
}) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<{
    loading: boolean;
    hasSubaccount: boolean;
    subaccountCode?: string;
    businessName?: string;
    bankName?: string;
    canEdit: boolean;
    error?: string;
    lastChecked?: Date;
  }>({
    loading: true,
    hasSubaccount: false,
    canEdit: false,
  });

  const currentUserId = userId || user?.id;

  const checkStatus = async () => {
    if (!currentUserId) return;

    setStatus((prev) => ({ ...prev, loading: true }));

    try {
      const result =
        await PaystackSubaccountService.getUserSubaccountStatus(currentUserId);

      setStatus({
        loading: false,
        hasSubaccount: result.hasSubaccount,
        subaccountCode: result.subaccountCode,
        businessName: result.businessName,
        bankName: result.bankName,
        canEdit: result.canEdit,
        lastChecked: new Date(),
      });
    } catch (error) {
      console.error("Error checking banking status:", error);
      setStatus({
        loading: false,
        hasSubaccount: false,
        canEdit: false,
        error:
          error instanceof Error ? error.message : "Failed to check status",
        lastChecked: new Date(),
      });
    }
  };

  useEffect(() => {
    if (currentUserId) {
      checkStatus();
    }
  }, [currentUserId]);

  const handleSetupClick = () => {
    onActionRequired?.("setup_banking");
  };

  const handleEditClick = () => {
    onActionRequired?.("edit_banking");
  };

  if (status.loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Checking banking status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status.error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">
                Error Checking Status
              </h3>
              <p className="text-red-700 text-sm">{status.error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={checkStatus}
                className="mt-2"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status.hasSubaccount) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-amber-900">
            <AlertTriangle className="w-5 h-5" />
            <span>Banking Setup Required</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-amber-800 text-sm mb-4">
            You need to set up your banking details to receive payments from
            book sales.
          </p>

          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 border border-amber-200">
              <h4 className="font-medium text-amber-900 text-sm mb-2">
                What you'll get:
              </h4>
              <ul className="text-amber-800 text-xs space-y-1">
                <li>• Secure Paystack subaccount</li>
                <li>
                  • Automatic payment splits (90% to you, 10% platform fee)
                </li>
                <li>• Fast payments within 24-48 hours</li>
                <li>• Bank-level security for your information</li>
              </ul>
            </div>

            <Button
              onClick={handleSetupClick}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Set Up Banking Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-green-900">
            <CheckCircle className="w-5 h-5" />
            <span>Banking Active</span>
          </CardTitle>
          <Badge className="bg-green-100 text-green-800 border-green-300">
            READY
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Account Details */}
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h4 className="font-medium text-green-900 mb-3">Account Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {status.businessName && (
                <div>
                  <span className="text-green-700 font-medium">Business:</span>
                  <p className="text-green-800">{status.businessName}</p>
                </div>
              )}
              {status.bankName && (
                <div>
                  <span className="text-green-700 font-medium">Bank:</span>
                  <p className="text-green-800">{status.bankName}</p>
                </div>
              )}
              {status.subaccountCode && (
                <div className="md:col-span-2">
                  <span className="text-green-700 font-medium">
                    Subaccount:
                  </span>
                  <p className="text-green-800 font-mono text-xs">
                    {status.subaccountCode.substring(0, 12)}...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 border border-green-200 text-center">
              <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-green-900">90% to You</p>
              <p className="text-xs text-green-700">Instant splits</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200 text-center">
              <Percent className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-green-900">10% Platform</p>
              <p className="text-xs text-green-700">Fair commission</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200 text-center">
              <CreditCard className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-green-900">Fast Payouts</p>
              <p className="text-xs text-green-700">24-48 hours</p>
            </div>
          </div>

          {/* Actions */}
          {status.canEdit && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditClick}
                className="flex-1 border-green-300 text-green-700 hover:bg-green-100"
              >
                Edit Details
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={checkStatus}
                className="text-green-700 hover:bg-green-100"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          )}

          {status.lastChecked && (
            <p className="text-xs text-green-600 text-center">
              Last checked: {status.lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BankingSystemStatus;
