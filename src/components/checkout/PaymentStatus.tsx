import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Transaction {
  id: string;
  book_title: string;
  price: number;
  status: string;
  seller_committed: boolean;
  committed_at?: string;
  expires_at?: string;
  paystack_reference?: string;
  created_at: string;
}

interface PaymentStatusProps {
  transactionId?: string;
  showRecent?: boolean;
  maxTransactions?: number;
}

const PaymentStatus = ({
  transactionId,
  showRecent = true,
  maxTransactions = 5,
}: PaymentStatusProps) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (transactionId) {
        query = query.eq("id", transactionId);
      } else if (showRecent) {
        query = query.limit(maxTransactions);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setTransactions(data || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load payment status",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user, transactionId]);

  const getStatusInfo = (transaction: Transaction) => {
    const now = new Date();
    const expiresAt = transaction.expires_at
      ? new Date(transaction.expires_at)
      : null;
    const isExpired = expiresAt && now > expiresAt;

    switch (transaction.status) {
      case "pending":
        return {
          icon: <Clock className="h-4 w-4" />,
          color: "bg-yellow-500",
          label: "Payment Pending",
          description: "Waiting for payment completion",
        };
      case "paid_pending_seller":
        return {
          icon: isExpired ? (
            <XCircle className="h-4 w-4" />
          ) : (
            <Clock className="h-4 w-4" />
          ),
          color: isExpired ? "bg-red-500" : "bg-blue-500",
          label: isExpired ? "Seller Response Expired" : "Awaiting Seller",
          description: isExpired
            ? "Seller did not respond within 48 hours"
            : "Waiting for seller to confirm the sale",
        };
      case "committed":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: "bg-green-500",
          label: "Sale Confirmed",
          description: "Seller has confirmed the sale - arrange collection",
        };
      case "collected":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: "bg-green-600",
          label: "Book Collected",
          description: "Book has been collected - payment released to seller",
        };
      case "completed":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: "bg-green-700",
          label: "Completed",
          description: "Transaction completed successfully",
        };
      case "refunded":
        return {
          icon: <RefreshCw className="h-4 w-4" />,
          color: "bg-purple-500",
          label: "Refunded",
          description: "Payment has been refunded",
        };
      case "cancelled":
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: "bg-red-500",
          label: "Cancelled",
          description: "Transaction was cancelled",
        };
      default:
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          color: "bg-gray-500",
          label: "Unknown Status",
          description: "Status not recognized",
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRefresh = () => {
    toast.promise(fetchTransactions(), {
      loading: "Refreshing payment status...",
      success: "Payment status updated",
      error: "Failed to refresh status",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading payment status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Payments Found
          </h3>
          <p className="text-gray-600">You haven't made any payments yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {transactionId ? "Payment Details" : "Recent Payments"}
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((transaction) => {
          const statusInfo = getStatusInfo(transaction);

          return (
            <div key={transaction.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {transaction.book_title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">
                    R{transaction.price.toFixed(2)}
                  </p>
                  <Badge
                    variant="secondary"
                    className={`${statusInfo.color} text-white`}
                  >
                    <span className="flex items-center gap-1">
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {statusInfo.description}
              </p>

              {transaction.expires_at &&
                transaction.status === "paid_pending_seller" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                    <p className="text-sm text-yellow-800">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Seller must respond by:{" "}
                      {formatDate(transaction.expires_at)}
                    </p>
                  </div>
                )}

              {transaction.paystack_reference && (
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Reference: {transaction.paystack_reference}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={`/payment-callback?reference=${transaction.paystack_reference}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Details
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PaymentStatus;
