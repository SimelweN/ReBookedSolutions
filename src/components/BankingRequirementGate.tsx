import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  handleBankingQueryError,
  logEnhancedError,
} from "@/utils/bankingErrorHandler";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ExternalLink,
  Shield,
  CreditCard,
  Loader2,
  Building,
  Lock,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

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
  const { user } = useAuth();
  const [hasSubaccountCode, setHasSubaccountCode] = useState<boolean | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const checkSubaccountCode = async () => {
    if (!user?.id) {
      setHasSubaccountCode(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log("Checking subaccount code for user:", user.id);

      const { data: subaccountData, error } = await supabase
        .from("banking_subaccounts")
        .select("subaccount_code")
        .eq("user_id", user.id)
        .single();

      console.log("Subaccount query result:", { subaccountData, error });

      if (error) {
        console.error("Error fetching subaccount:", error);
        setHasSubaccountCode(false);
        return;
      }

      const hasValidCode = !!subaccountData?.subaccount_code?.trim();
      setHasSubaccountCode(hasValidCode);

      console.log("Has valid subaccount code:", hasValidCode);
    } catch (error) {
      console.error("Subaccount check failed:", error);
      setHasSubaccountCode(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSubaccountCode();
  }, [user?.id]);

  // Also check when window regains focus (user returns from banking setup)
  useEffect(() => {
    const handleFocus = () => {
      if (hasSubaccountCode === false) {
        checkSubaccountCode();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [hasSubaccountCode]);

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
      toast.info("Complete your banking setup in the popup window.");
    } else {
      toast.error(
        "Popup blocked. Please allow popups for this site and try again.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Checking banking setup...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <Lock className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Login Required</h3>
              <p className="text-sm text-red-600">
                You must be logged in to {action}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasSubaccountCode) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-800">
            <Building className="w-5 h-5" />
            <span>Banking Setup Required</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showWarning && (
            <Alert className="border-orange-300 bg-orange-100">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>
                  You must first link your banking info before you can {action}.
                </strong>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <p className="text-sm text-orange-700">
              To sell books and receive payments, you need to complete your
              banking setup through our secure partner portal.
            </p>

            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-blue-500" />
                <span>Secure bank account verification</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Paystack subaccount creation</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-purple-500" />
                <span>Instant payment processing</span>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium">Bank-Level Security</p>
                  <p>
                    Your banking details are encrypted and protected by
                    Paystack's verified security standards.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={openBankingSetup}
                className="w-full bg-orange-600 hover:bg-orange-700"
                size="lg"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Complete Banking Setup
              </Button>

              <Button
                onClick={checkSubaccountCode}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                {isLoading ? "Checking..." : "Refresh Status"}
              </Button>
            </div>

            <div className="flex justify-center space-x-4 pt-2">
              <Badge variant="outline" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Bank-Grade Security
              </Badge>
              <Badge variant="outline" className="text-xs">
                <CreditCard className="w-3 h-3 mr-1" />
                Instant Payouts
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // User has subaccount code - render children (the protected content)
  return <>{children}</>;
};

export default BankingRequirementGate;
