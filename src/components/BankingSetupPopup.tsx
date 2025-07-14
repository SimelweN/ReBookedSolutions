import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { handleBankingQueryError } from "@/utils/bankingErrorHandler";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CreditCard,
  ExternalLink,
  Shield,
  Banknote,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { ENV } from "@/config/environment";

interface BankingSetupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  triggerCheck?: boolean; // External trigger to recheck banking status
}

const BankingSetupPopup = ({
  isOpen,
  onClose,
  triggerCheck,
}: BankingSetupPopupProps) => {
  const { user } = useAuth();
  const [hasBankingDetails, setHasBankingDetails] = useState(false);
  const [isCheckingBanking, setIsCheckingBanking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Check if user has banking details (subaccount_code)
  const checkBankingStatus = useCallback(async () => {
    if (!user?.id) return;

    setIsCheckingBanking(true);
    try {
      console.log("Checking banking status for user:", user.id);
      const { data: subaccountData, error } = await supabase
        .from("banking_subaccounts")
        .select("subaccount_code")
        .eq("user_id", user.id)
        .maybeSingle();

      console.log("Banking status query result:", {
        subaccountData,
        hasError: !!error,
        errorMessage: error?.message || "No error",
      });

      if (error) {
        const { shouldFallback } = handleBankingQueryError(
          "BankingSetupPopup - checking banking status",
          error,
        );

        if (shouldFallback) {
          return;
        }

        return;
      }

      const hasValidSubaccount = !!subaccountData?.subaccount_code?.trim();
      setHasBankingDetails(hasValidSubaccount);
      setLastChecked(new Date());

      // If user now has banking details, show success and close
      if (hasValidSubaccount && isOpen) {
        toast.success("Banking details verified! You can now create listings.");
        setTimeout(() => onClose(), 1500);
      }
    } catch (error) {
      console.error(
        "Banking status check failed:",
        error instanceof Error ? error.message : JSON.stringify(error, null, 2),
      );
    } finally {
      setIsCheckingBanking(false);
    }
  }, [user?.id]);

  // Check banking status on mount and when triggerCheck changes
  useEffect(() => {
    if (user?.id) {
      checkBankingStatus();
    }
  }, [user?.id, triggerCheck, checkBankingStatus]);

  const openBankingVault = () => {
    // Open external banking site in popup
    const bankingUrl = ENV.VITE_BANKING_VAULT_URL;

    // Calculate popup dimensions (responsive)
    const width = Math.min(800, window.innerWidth * 0.9);
    const height = Math.min(900, window.innerHeight * 0.9);
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const popup = window.open(
      bankingUrl,
      "bankingSetup",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no`,
    );

    if (popup) {
      popup.focus();
      toast.info("Complete your banking setup in the popup window.");
    } else {
      toast.error(
        "Popup blocked. Please allow popups for this site and try again.",
      );
    }

    // Poll for banking details every 3 seconds while popup is open
    let pollInterval: NodeJS.Timeout;
    if (popup) {
      pollInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollInterval);
          toast.info("Banking setup window closed. Checking status...");
          setTimeout(() => {
            checkBankingStatus();
          }, 1000);
        } else if (isOpen) {
          checkBankingStatus();
        }
      }, 3000); // Reduced from 5 seconds to 3 seconds
    }

    // Clean up interval when component unmounts or popup closes
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  };

  const getStatusContent = () => {
    if (isCheckingBanking) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Checking banking status...</span>
        </div>
      );
    }

    if (hasBankingDetails) {
      return (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">
                  Banking Details Complete!
                </h3>
                <p className="text-sm text-green-600">
                  You can now create listings and receive payments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-800">
                Banking Setup Required
              </h3>
              <p className="text-sm text-orange-600">
                Complete your banking details to start selling books.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>Banking Setup Required</span>
          </DialogTitle>
          <DialogDescription>
            To sell books on our platform, you need to complete your banking
            details for secure payments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {getStatusContent()}

          {!hasBankingDetails && (
            <>
              <div className="space-y-3">
                <h4 className="font-medium text-sm">What you'll need:</h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-blue-500" />
                    <span>Bank account details</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Identity verification</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Banknote className="w-4 h-4 text-purple-500" />
                    <span>Paystack subaccount creation</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium">Secure & Fast Setup</p>
                    <p>
                      Your banking details are encrypted and managed securely
                      via Paystack's verified platform.
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={openBankingVault} className="w-full" size="lg">
                <ExternalLink className="w-4 h-4 mr-2" />
                Complete Banking Setup
              </Button>
            </>
          )}

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={checkBankingStatus}
              disabled={isCheckingBanking}
              className="flex-1"
            >
              {isCheckingBanking ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Refresh Status
            </Button>

            {hasBankingDetails && (
              <Button onClick={onClose} className="flex-1">
                Continue
              </Button>
            )}
          </div>

          {lastChecked && (
            <p className="text-xs text-gray-500 text-center">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}

          <div className="flex justify-center space-x-4 pt-2">
            <Badge variant="outline" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Secure
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Banknote className="w-3 h-3 mr-1" />
              Fast Payouts
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BankingSetupPopup;
