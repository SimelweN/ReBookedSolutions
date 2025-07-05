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
import BankingDetailsForm from "@/components/BankingDetailsForm";
import type { Tables } from "@/integrations/supabase/types";
import {
  Building,
  Shield,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  DollarSign,
  Banknote,
  Lock,
  Info,
} from "lucide-react";
import { toast } from "sonner";

type PaystackSubaccount = Tables<"paystack_subaccounts">;

const ModernBankingSection = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [showBankingForm, setShowBankingForm] = useState(false);
  const [bankingStatus, setBankingStatus] = useState<{
    hasSubaccount: boolean;
    subaccountCode: string | null;
    businessName: string | null;
    bankName: string | null;
    isLoading: boolean;
    lastChecked: Date | null;
  }>({
    hasSubaccount: false,
    subaccountCode: null,
    businessName: null,
    bankName: null,
    isLoading: true,
    lastChecked: null,
  });

  const checkBankingStatus = async () => {
    if (!user?.id) return;

    setBankingStatus((prev) => ({ ...prev, isLoading: true }));

    try {
      const { data: subaccountData, error } = await supabase
        .from("paystack_subaccounts")
        .select("subaccount_code, business_name, settlement_bank, status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        const { shouldFallback, errorMessage } = handleBankingQueryError(
          "ModernBankingSection - checking banking status",
          error,
        );

        if (shouldFallback) {
          setBankingStatus({
            hasSubaccount: false,
            subaccountCode: null,
            businessName: null,
            bankName: null,
            isLoading: false,
            lastChecked: new Date(),
          });
          return;
        }

        setBankingStatus({
          hasSubaccount: false,
          subaccountCode: null,
          businessName: null,
          bankName: null,
          isLoading: false,
          lastChecked: new Date(),
        });
        return;
      }

      const hasValidSubaccount = !!subaccountData?.subaccount_code?.trim();
      setBankingStatus({
        hasSubaccount: hasValidSubaccount,
        subaccountCode: subaccountData?.subaccount_code || null,
        businessName: subaccountData?.business_name || null,
        bankName: subaccountData?.settlement_bank || null,
        isLoading: false,
        lastChecked: new Date(),
      });

      if (hasValidSubaccount) {
        toast.success("Banking setup verified!");
      }
    } catch (error) {
      console.error(
        "Banking status check failed:",
        error instanceof Error ? error.message : JSON.stringify(error, null, 2),
      );
      setBankingStatus((prev) => ({
        ...prev,
        isLoading: false,
        lastChecked: new Date(),
      }));
    }
  };

  useEffect(() => {
    if (user?.id) {
      checkBankingStatus();
    }
  }, [user?.id]);

  const handleBankingFormSuccess = () => {
    toast.success("Banking details added successfully!");
    setShowBankingForm(false);
    // Refresh banking status after successful form submission
    setTimeout(() => {
      checkBankingStatus();
    }, 1000);
  };

  const handleBankingFormCancel = () => {
    setShowBankingForm(false);
  };

  if (bankingStatus.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Payment Setup</h2>
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Checking...</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                Verifying Status
              </h3>
              <p className="text-blue-700">
                Please wait while we check your banking setup...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (bankingStatus.hasSubaccount) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Payment Setup</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkBankingStatus}
            disabled={bankingStatus.isLoading}
            className="text-gray-500 hover:text-gray-700"
          >
            <RefreshCw
              className={`w-4 h-4 ${bankingStatus.isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Success State */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">All Set! 🎉</h3>
                <p className="text-emerald-100 mb-3">
                  Your payment account is active and ready to receive funds
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {bankingStatus.businessName && (
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                      <p className="text-emerald-100 text-xs font-medium">
                        Business Name
                      </p>
                      <p className="text-white font-semibold">
                        {bankingStatus.businessName}
                      </p>
                    </div>
                  )}
                  {bankingStatus.bankName && (
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                      <p className="text-emerald-100 text-xs font-medium">
                        Bank
                      </p>
                      <p className="text-white font-semibold">
                        {bankingStatus.bankName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">
              ACTIVE
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Instant Payouts
                </p>
                <p className="text-xs text-gray-500">90% of sale price</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Secure</p>
                <p className="text-xs text-gray-500">Bank-grade encryption</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Banknote className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Auto Transfer
                </p>
                <p className="text-xs text-gray-500">No manual work</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Payment Setup</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={checkBankingStatus}
          disabled={bankingStatus.isLoading}
          className="text-gray-500 hover:text-gray-700"
        >
          <RefreshCw
            className={`w-4 h-4 ${bankingStatus.isLoading ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {!showBankingForm ? (
        <>
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Ready to Start Selling?
                </h3>
                <p className="text-blue-100 mb-6 max-w-md">
                  Set up your payment account in under 2 minutes and start
                  receiving instant payments from your book sales.
                </p>
                <Button
                  onClick={() => setShowBankingForm(true)}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                  size="lg"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Set Up Payments
                </Button>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                  <Building className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Fast Payouts
              </h4>
              <p className="text-gray-600 text-sm">
                Receive 90% of your sale price directly to your bank account
                within 24-48 hours.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Bank-Level Security
              </h4>
              <p className="text-gray-600 text-sm">
                Your banking information is protected with the same encryption
                banks use.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Banknote className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Automatic Splits
              </h4>
              <p className="text-gray-600 text-sm">
                Payments are automatically split between you and delivery costs
                - no manual work.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Trusted Platform
              </h4>
              <p className="text-gray-600 text-sm">
                Powered by Paystack, South Africa's most trusted payment
                processor.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <div className="max-w-md mx-auto">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Get Started Today
              </h4>
              <p className="text-gray-600 text-sm mb-4">
                Join thousands of students already earning from their textbooks
              </p>
              <Button
                onClick={() => setShowBankingForm(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                size="lg"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Add Banking Details
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <BankingDetailsForm
            onSuccess={handleBankingFormSuccess}
            onCancel={handleBankingFormCancel}
            showAsModal={false}
          />
        </div>
      )}

      {bankingStatus.lastChecked && (
        <p className="text-xs text-gray-400 text-center">
          Last updated: {bankingStatus.lastChecked.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default ModernBankingSection;
