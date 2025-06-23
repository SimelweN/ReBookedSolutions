import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionService } from "@/services/transactionService";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<
    "processing" | "success" | "failed" | "error"
  >("processing");
  const [transactionData, setTransactionData] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        const reference = searchParams.get("reference");
        const trxref = searchParams.get("trxref");
        const paymentReference = reference || trxref;

        if (!paymentReference) {
          setStatus("error");
          setError("Payment reference not found");
          return;
        }

        // Handle successful payment callback
        const transaction =
          await TransactionService.handlePaymentCallback(paymentReference);

        setTransactionData(transaction);
        setStatus("success");

        toast.success("Payment successful! Seller has been notified.");
      } catch (error) {
        console.error("Payment callback error:", error);
        setStatus("failed");
        setError(
          error instanceof Error ? error.message : "Payment processing failed",
        );
        toast.error("Payment processing failed");
      }
    };

    handlePaymentCallback();
  }, [searchParams]);

  const handleContinue = () => {
    if (status === "success" && transactionData) {
      navigate(`/profile?tab=activity&transaction=${transactionData.id}`);
    } else {
      navigate("/books");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-2xl">
              {status === "processing" && (
                <>
                  <Loader2 className="h-6 w-6 mr-2 animate-spin text-blue-600" />
                  Processing Payment
                </>
              )}
              {status === "success" && (
                <>
                  <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
                  Payment Successful
                </>
              )}
              {status === "failed" && (
                <>
                  <XCircle className="h-6 w-6 mr-2 text-red-600" />
                  Payment Failed
                </>
              )}
              {status === "error" && (
                <>
                  <AlertTriangle className="h-6 w-6 mr-2 text-orange-600" />
                  Processing Error
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === "processing" && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-book-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  Please wait while we process your payment...
                </p>
              </div>
            )}

            {status === "success" && transactionData && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">
                    🎉 Payment Completed Successfully!
                  </h3>
                  <p className="text-green-800 text-sm">
                    Your payment has been processed and the seller has been
                    notified. They have 48 hours to commit to the sale.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">
                    Transaction Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Book:</span>
                      <span className="text-blue-900 font-medium">
                        {transactionData.book_title}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Amount:</span>
                      <span className="text-blue-900 font-medium">
                        R{transactionData.price?.toFixed(2)}
                      </span>
                    </div>
                    {transactionData.delivery_fee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-blue-700">Delivery Fee:</span>
                        <span className="text-blue-900">
                          R{transactionData.delivery_fee?.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-blue-200 pt-2">
                      <span className="text-blue-700 font-medium">
                        Total Paid:
                      </span>
                      <span className="text-blue-900 font-bold">
                        R
                        {(
                          (transactionData.price || 0) +
                          (transactionData.delivery_fee || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">
                    What happens next?
                  </h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• The seller has 48 hours to commit to the sale</li>
                    <li>
                      • You'll receive email notifications about the status
                    </li>
                    <li>
                      • If the seller doesn't commit, you'll get a full refund
                    </li>
                    <li>• Once committed, delivery arrangements will begin</li>
                  </ul>
                </div>
              </div>
            )}

            {(status === "failed" || status === "error") && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-900 mb-2">
                    Payment Processing Failed
                  </h3>
                  <p className="text-red-800 text-sm mb-3">
                    {error ||
                      "There was an issue processing your payment. Please try again."}
                  </p>
                  <p className="text-red-700 text-xs">
                    If you were charged but see this error, please contact our
                    support team.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
                  <p className="text-blue-800 text-sm">
                    Contact our support team at support@rebookedsolutions.co.za
                    with your transaction details.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleContinue}
                className="flex-1 bg-book-600 hover:bg-book-700"
              >
                {status === "success"
                  ? "View Transaction"
                  : "Continue Shopping"}
              </Button>

              {status !== "success" && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/contact")}
                  className="flex-1"
                >
                  Contact Support
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentCallback;
