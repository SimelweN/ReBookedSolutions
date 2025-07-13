import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Home,
  ShoppingBag,
} from "lucide-react";
import PaystackPaymentService from "@/services/paystackPaymentService";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface PaymentResult {
  status: "success" | "failed" | "abandoned" | "pending";
  reference: string;
  message: string;
  amount?: number;
  gateway_response?: string;
}

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [isVerifying, setIsVerifying] = useState(true);
  const [result, setResult] = useState<PaymentResult | null>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const reference = searchParams.get("reference");
      const trxref = searchParams.get("trxref");
      const paymentRef = reference || trxref;

      if (!paymentRef) {
        setResult({
          status: "failed",
          reference: "N/A",
          message: "No payment reference found in URL",
        });
        setIsVerifying(false);
        return;
      }

      if (import.meta.env.MODE !== "production") {
        console.log(`Verifying payment with reference: ${paymentRef}`);
      }

      const verification =
        await PaystackPaymentService.verifyPayment(paymentRef);

      if (verification.status === "success") {
        // Clear cart on successful payment
        clearCart();

        setResult({
          status: "success",
          reference: paymentRef,
          message:
            "Payment completed successfully! Your order has been processed.",
          amount: verification.amount,
          gateway_response: verification.gateway_response,
        });

        toast.success("Payment Successful!", {
          description:
            "Your order has been processed and will be shipped soon.",
        });
      } else if (verification.status === "failed") {
        setResult({
          status: "failed",
          reference: paymentRef,
          message:
            verification.gateway_response || "Payment was not successful",
        });

        toast.error("Payment Failed", {
          description: "Your payment could not be processed. Please try again.",
        });
      } else {
        setResult({
          status: "abandoned",
          reference: paymentRef,
          message: "Payment was cancelled or abandoned",
        });

        toast.warning("Payment Cancelled", {
          description: "Your payment was not completed.",
        });
      }
    } catch (error) {
      console.error("Payment verification error:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      setResult({
        status: "failed",
        reference: searchParams.get("reference") || "N/A",
        message: `Payment verification failed: ${errorMessage}`,
      });

      toast.error("Verification Error", {
        description: "Could not verify payment status. Please contact support.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusIcon = () => {
    switch (result?.status) {
      case "success":
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case "failed":
        return <XCircle className="w-16 h-16 text-red-500" />;
      case "abandoned":
        return <Clock className="w-16 h-16 text-yellow-500" />;
      default:
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = () => {
    switch (result?.status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case "abandoned":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Cancelled</Badge>
        );
      default:
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
    }
  };

  const formatAmount = (amount: number) => {
    return `R${(amount / 100).toFixed(2)}`;
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
              <h2 className="text-xl font-semibold">Verifying Payment</h2>
              <p className="text-gray-600">
                Please wait while we confirm your payment...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">{getStatusIcon()}</div>
          <CardTitle className="flex items-center justify-center gap-2">
            Payment Status
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">
              {result?.status === "success"
                ? "Payment Successful!"
                : result?.status === "failed"
                  ? "Payment Failed"
                  : result?.status === "abandoned"
                    ? "Payment Cancelled"
                    : "Payment Status Unknown"}
            </p>

            <p className="text-gray-600 text-sm">{result?.message}</p>
          </div>

          {result?.amount && result.status === "success" && (
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Amount Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {formatAmount(result.amount)}
              </p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Reference</p>
            <p className="font-mono text-sm break-all">{result?.reference}</p>
          </div>

          {result?.gateway_response && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Gateway Response</p>
              <p className="text-sm">{result.gateway_response}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>

            <Button
              onClick={() => navigate("/book-listing")}
              className="flex-1"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </div>

          {result?.status === "success" && user && (
            <div className="text-center">
              <Button
                onClick={() => navigate("/profile")}
                variant="ghost"
                size="sm"
              >
                View My Orders
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCallback;
