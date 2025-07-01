import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { handleBankingQueryError } from "@/utils/bankingErrorHandler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Building,
  ExternalLink,
  Shield,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  DollarSign,
  Banknote,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";

const ModernBankingSection = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [bankingStatus, setBankingStatus] = useState<{
    hasSubaccount: boolean;
    subaccountCode: string | null;
    isLoading: boolean;
    lastChecked: Date | null;
  }>({
    hasSubaccount: false,
    subaccountCode: null,
    isLoading: true,
    lastChecked: null,
  });

  const checkBankingStatus = async () => {
    if (!user?.id) return;

    setBankingStatus((prev) => ({ ...prev, isLoading: true }));

    try {
      const { data: subaccountData, error } = await supabase
        .from("banking_subaccounts")
        .select("subaccount_code")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking banking status:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });

        // Handle specific column missing error
        if (
          error.message?.includes("column") &&
          error.message?.includes("user_id")
        ) {
          console.warn(
            "Banking subaccounts table/column missing - treating as no banking setup",
          );
          setBankingStatus({
            hasSubaccount: false,
            subaccountCode: null,
            isLoading: false,
            error: "Banking setup not available - please contact support",
          });
          return;
        }

        setBankingStatus({
          hasSubaccount: false,
          subaccountCode: null,
          isLoading: false,
          lastChecked: new Date(),
        });
        return;
      }

      const hasValidSubaccount = !!subaccountData?.subaccount_code?.trim();
      setBankingStatus({
        hasSubaccount: hasValidSubaccount,
        subaccountCode: subaccountData?.subaccount_code || null,
        isLoading: false,
        lastChecked: new Date(),
      });

      if (hasValidSubaccount) {
        toast.success("Banking setup verified!");
      }
    } catch (error) {
      console.error(
        "Banking status check failed:",
        error instanceof Error ? error.message : error,
      );
      setBankingStatus((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    checkBankingStatus();
  }, [user?.id]);

  // Listen for window messages from banking setup popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from the banking setup domain
      if (event.origin !== "https://paystack-vault-south-africa.lovable.app") {
        return;
      }

      if (event.data.type === "BANKING_SETUP_COMPLETE") {
        toast.success("Banking setup completed! Refreshing status...");
        setTimeout(() => {
          checkBankingStatus();
        }, 1000);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const openBankingSetup = () => {
    const bankingUrl = "https://paystack-vault-south-africa.lovable.app";

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
      toast.info(
        "Complete your banking setup in the popup window and click 'Refresh Status' when done.",
      );

      // Check if popup is closed and refresh banking status
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          toast.info(
            "Banking setup window closed. Click 'Refresh Status' to update.",
          );
        }
      }, 1000);

      // Also poll for status updates while popup is open
      const pollStatus = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollStatus);
        } else {
          checkBankingStatus();
        }
      }, 3000); // Check every 3 seconds while popup is open
    } else {
      toast.error(
        "Popup blocked. Please allow popups for this site and try again.",
      );
    }
  };

  const StatusCard = () => {
    if (bankingStatus.isLoading) {
      return (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-800">
                  Checking Status...
                </h3>
                <p className="text-sm text-blue-600">
                  Verifying your banking setup
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (bankingStatus.hasSubaccount) {
      return (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-green-800">Banking Active</h3>
                  <p className="text-sm text-green-600">
                    Ready to receive payments
                  </p>
                  {bankingStatus.subaccountCode && (
                    <p className="text-xs text-green-500 mt-1 font-mono">
                      ID: {bankingStatus.subaccountCode.substring(0, 12)}...
                    </p>
                  )}
                </div>
              </div>
              <Badge
                variant="outline"
                className="border-green-300 text-green-700"
              >
                ACTIVE
              </Badge>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-orange-800">Setup Required</h3>
                <p className="text-sm text-orange-600">
                  Complete banking to sell books
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-orange-300 text-orange-700"
            >
              PENDING
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  const FeatureGrid = () => (
    <div
      className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 gap-4"}`}
    >
      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
        <DollarSign className="w-5 h-5 text-blue-600" />
        <div>
          <p className="font-medium text-blue-800 text-sm">Instant Payouts</p>
          <p className="text-xs text-blue-600">90% of sale price</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
        <Shield className="w-5 h-5 text-green-600" />
        <div>
          <p className="font-medium text-green-800 text-sm">Bank Security</p>
          <p className="text-xs text-green-600">Encrypted & protected</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
        <Banknote className="w-5 h-5 text-purple-600" />
        <div>
          <p className="font-medium text-purple-800 text-sm">Auto Split</p>
          <p className="text-xs text-purple-600">No manual processing</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
        <CreditCard className="w-5 h-5 text-indigo-600" />
        <div>
          <p className="font-medium text-indigo-800 text-sm">All Methods</p>
          <p className="text-xs text-indigo-600">Cards, EFT, transfers</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Status Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2
            className={`font-semibold text-gray-900 ${isMobile ? "text-lg" : "text-xl"}`}
          >
            Payment Setup
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={checkBankingStatus}
            disabled={bankingStatus.isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${bankingStatus.isLoading ? "animate-spin" : ""}`}
            />
            {isMobile ? "Refresh" : "Check Status"}
          </Button>
        </div>

        <StatusCard />
      </div>

      <Separator />

      {/* Action Section */}
      {!bankingStatus.hasSubaccount && (
        <div className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>
                Complete your banking setup to start selling books.
              </strong>
              <br />
              This secure process takes just 2 minutes and enables instant
              payments.
              <br />
              <span className="text-sm font-medium mt-1 inline-block">
                💡 After completing banking setup, click "Refresh Status" to
                update this page.
              </span>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button
              onClick={openBankingSetup}
              className={`bg-blue-600 hover:bg-blue-700 ${isMobile ? "w-full h-12" : "w-full"}`}
              size={isMobile ? "lg" : "default"}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Complete Banking Setup
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              onClick={checkBankingStatus}
              variant="outline"
              className="w-full"
              disabled={bankingStatus.isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${bankingStatus.isLoading ? "animate-spin" : ""}`}
              />
              {bankingStatus.isLoading ? "Checking..." : "Refresh Status"}
            </Button>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Payment Features</h3>
        <FeatureGrid />
      </div>

      <Separator />

      {/* Security Info */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Security & Trust</h3>

        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-800 text-sm">
                Bank-Grade Encryption
              </p>
              <p className="text-xs text-gray-600">
                Your banking details are encrypted using the same standards as
                major banks.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Building className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-800 text-sm">
                Paystack Verified
              </p>
              <p className="text-xs text-gray-600">
                Powered by Paystack, South Africa's leading payment processor.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      {bankingStatus.lastChecked && (
        <p className="text-xs text-gray-500 text-center">
          Last checked: {bankingStatus.lastChecked.toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default ModernBankingSection;
