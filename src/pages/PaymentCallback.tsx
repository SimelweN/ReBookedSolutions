/**
 * Payment Callback Page
 * Handles users returning from Paystack after payment
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { PaymentIntegrationService } from "@/services/paymentIntegrationService";
import { toast } from "sonner";

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<
    "processing" | "success" | "failed" | "unknown"
  >("processing");
  const [message, setMessage] = useState("Processing payment...");
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        // Get payment reference from URL
        const reference = searchParams.get("reference");
        const trxref = searchParams.get("trxref");
        const paymentReference = reference || trxref;

        if (!paymentReference) {
          setStatus("failed");
          setMessage(
            "No payment reference found. Payment may have been cancelled.",
          );
          return;
        }

        console.log(
          "🔍 Processing payment callback for reference:",
          paymentReference,
        );

        // Step 3: Verify payment with Paystack
        const verificationResult =
          await PaymentIntegrationService.verifyPayment(paymentReference);

        if (!verificationResult.success) {
          setStatus("failed");
          setMessage(
            "Payment verification failed. Please contact support if you were charged.",
          );
          return;
        }

        // Step 4: Update transaction status
        await PaymentIntegrationService.updateTransactionAfterPayment(
          paymentReference,
          verificationResult,
        );

        // Get transaction ID from session storage
        const storedTransactionId = sessionStorage.getItem(
          "current_transaction_id",
        );
        if (storedTransactionId) {
          setTransactionId(storedTransactionId);
        }

        setStatus("success");
        setMessage(
          `Payment successful! Amount: R${verificationResult.amount.toFixed(2)}`,
        );

        // Clear stored data
        sessionStorage.removeItem("current_transaction_id");
        sessionStorage.removeItem("payment_book_id");

        console.log("✅ Payment callback processing completed successfully");
      } catch (error) {
        console.error("Payment callback processing failed:", error);
        setStatus("failed");
        setMessage(
          error instanceof Error ? error.message : "Payment processing failed",
        );
        toast.error("Payment processing failed");
      }
    };

    handlePaymentCallback();
  }, [searchParams]);

  const handleContinue = () => {
    const returnUrl = sessionStorage.getItem("payment_return_url");
    sessionStorage.removeItem("payment_return_url");

    if (status === "success" && transactionId) {
      // Go to transaction details or payment dashboard
      navigate(`/payment-dashboard?transaction=${transactionId}`);
    } else if (returnUrl) {
      navigate(returnUrl);
    } else {
      navigate("/");
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "processing":
        return <Loader2 className="h-12 w-12 animate-spin text-blue-600" />;
      case "success":
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case "failed":
        return <XCircle className="h-12 w-12 text-red-600" />;
      default:
        return <XCircle className="h-12 w-12 text-gray-400" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case "processing":
        return "Processing Payment...";
      case "success":
        return "Payment Successful!";
      case "failed":
        return "Payment Failed";
      default:
        return "Payment Status Unknown";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "processing":
        return "border-blue-200 bg-blue-50";
      case "success":
        return "border-green-200 bg-green-50";
      case "failed":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className={`${getStatusColor()}`}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">{getStatusIcon()}</div>
              <CardTitle className="text-xl font-semibold">
                {getStatusTitle()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-gray-700">{message}</p>

              {status === "success" && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium">What happens next?</div>
                      <div className="text-sm">
                        1. The seller has 48 hours to confirm the sale
                        <br />
                        2. Once confirmed, you'll be notified about delivery
                        <br />
                        3. After receiving the book, confirm delivery to
                        complete the transaction
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {status === "failed" && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    If you were charged but the payment failed, please contact
                    our support team with your payment reference for assistance.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleContinue}
                  className="flex-1"
                  disabled={status === "processing"}
                >
                  {status === "success" ? (
                    <>
                      View Transaction <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>

                {status === "failed" && (
                  <Button
                    onClick={() => navigate("/")}
                    variant="outline"
                    className="flex-1"
                  >
                    Go Home
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentCallback;
