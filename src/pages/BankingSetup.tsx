import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  Shield,
  DollarSign,
  Clock,
  Users,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { handleBankingQueryError } from "@/utils/bankingErrorHandler";
import { toast } from "sonner";

const BankingSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [bankingStatus, setBankingStatus] = useState<{
    hasSubaccount: boolean;
    subaccountCode?: string;
    businessName?: string;
    bankName?: string;
    accountNumberMasked?: string;
  }>({ hasSubaccount: false });
  const [isLoading, setIsLoading] = useState(true);

  const returnTo = searchParams.get("return") || "/profile";

  useEffect(() => {
    if (user) {
      checkBankingStatus();
    }
  }, [user]);

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

  const checkBankingStatus = async () => {
    if (!user?.id) return;

    try {
      const { data: subaccountData, error } = await supabase
        .from("banking_subaccounts")
        .select("subaccount_code")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        const { shouldFallback, errorMessage } = handleBankingQueryError(
          "BankingSetup - checking banking status",
          error,
        );

        if (shouldFallback) {
          setBankingStatus({
            hasSubaccount: false,
            businessName: "Banking setup not available",
          });
          setIsLoading(false);
          return;
        }

        setBankingStatus({ hasSubaccount: false });
        setIsLoading(false);
        return;
      }

      const hasValidSubaccount = !!subaccountData?.subaccount_code?.trim();
      setBankingStatus({
        hasSubaccount: hasValidSubaccount,
        subaccountCode: subaccountData?.subaccount_code || undefined,
        businessName: hasValidSubaccount ? "Banking Active" : undefined,
      });

      if (hasValidSubaccount) {
        toast.success("Banking setup verified!");
      }
    } catch (error) {
      console.error("Error checking banking status:", error);
      setBankingStatus({ hasSubaccount: false });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleCancel = () => {
    navigate(returnTo);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Login Required</h3>
              <p className="text-gray-600 mb-4">
                Please log in to set up your banking details.
              </p>
              <Button onClick={() => navigate("/login")} className="w-full">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-book-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">
                Checking banking status...
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // If user already has banking details
  if (bankingStatus.hasSubaccount) {
    return (
      <Layout>
        <SEO
          title="Banking Details - ReBooked Solutions"
          description="Your banking details are set up and ready for receiving payments."
          keywords="banking, payments, seller account"
          url="https://www.rebookedsolutions.co.za/banking-setup"
        />

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(returnTo)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-6 h-6" />
                Banking Details Complete
              </CardTitle>
              <CardDescription>
                Your payment account is set up and ready to receive funds from
                book sales.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Current Details */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-3">
                  Current Setup
                </h3>
                <div className="space-y-2 text-sm">
                  {bankingStatus.businessName && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Status:</span>
                      <span className="font-medium">
                        {bankingStatus.businessName}
                      </span>
                    </div>
                  )}
                  {bankingStatus.subaccountCode && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Account ID:</span>
                      <span className="font-medium font-mono text-xs">
                        {bankingStatus.subaccountCode.substring(0, 12)}...
                      </span>
                    </div>
                  )}
                  {bankingStatus.bankName && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Bank:</span>
                      <span className="font-medium">
                        {bankingStatus.bankName}
                      </span>
                    </div>
                  )}
                  {bankingStatus.accountNumberMasked && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Account:</span>
                      <span className="font-medium">
                        {bankingStatus.accountNumberMasked}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-sm">Ready for Sales</h4>
                  <p className="text-xs text-gray-600">
                    Start listing books immediately
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-sm">Fast Payments</h4>
                  <p className="text-xs text-gray-600">
                    Receive funds within 24-48 hours
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium text-sm">Secure Platform</h4>
                  <p className="text-xs text-gray-600">
                    Encrypted and verified by Paystack
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate("/create-listing")}
                  className="flex-1 bg-book-600 hover:bg-book-700"
                >
                  Start Selling Books
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/profile")}
                  className="flex-1"
                >
                  Go to Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Show banking setup form
  return (
    <Layout>
      <SEO
        title="Set Up Banking Details - ReBooked Solutions"
        description="Add your banking details to start receiving payments from book sales. Secure and encrypted by Paystack."
        keywords="banking setup, seller account, payments, Paystack"
        url="https://www.rebookedsolutions.co.za/banking-setup"
      />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleCancel} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Set Up Banking Details
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Add your banking information to start receiving payments from book
              sales. Your details are securely encrypted and managed by
              Paystack.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm text-blue-900">
                Bank-level Security
              </h3>
              <p className="text-xs text-blue-700">
                Your data is encrypted and protected
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm text-green-900">
                Fast Payments
              </h3>
              <p className="text-xs text-green-700">
                Receive funds within 1-2 business days
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm text-purple-900">
                Trusted Platform
              </h3>
              <p className="text-xs text-purple-700">
                Used by thousands of students
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-book-600" />
              Complete Banking Setup
            </CardTitle>
            <CardDescription>
              Set up your banking details securely using our external banking
              platform.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
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
                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Complete Banking Setup
              </Button>

              <Button
                onClick={checkBankingStatus}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                {isLoading ? "Checking..." : "Refresh Status"}
              </Button>

              <Button onClick={handleCancel} variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {returnTo === "/profile" ? "Profile" : "Previous Page"}
              </Button>
            </div>

            {/* Security Info */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3 mt-6">
              <h4 className="font-medium text-gray-900">Security & Trust</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">
                    Bank-grade encryption protects your banking details
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <CreditCard className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">
                    Powered by Paystack, South Africa's leading payment
                    processor
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default BankingSetup;
