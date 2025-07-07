import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  CreditCard,
  Calendar,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import CommitToOrder from "@/components/CommitToOrder";
import { OrderData } from "@/services/paystackPaymentService";

interface PendingCommit {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  commit_deadline?: string;
  paid_at?: string;
  seller_id: string;
  buyer_email: string;
  items: Array<{
    title: string;
    author?: string;
    price: number;
  }>;
}

const PendingCommitsSection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingCommits, setPendingCommits] = useState<PendingCommit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadPendingCommits();
    }
  }, [user?.id]);

  const loadPendingCommits = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Get orders where this user is the seller and status is "paid" (needs commit)
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("seller_id", user.id)
        .eq("status", "paid")
        .order("created_at", { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      setPendingCommits(orders || []);
    } catch (err) {
      console.error("Error loading pending commits:", err);

      // Check if it's a missing table error
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      if (
        errorMessage.includes("relation") &&
        errorMessage.includes("does not exist")
      ) {
        console.log("Orders table not available - this is normal in demo mode");
        setError(null);
        setPendingCommits([]);
      } else {
        setError("Failed to load pending commitments");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCommitSuccess = () => {
    toast.success("Order committed successfully!");
    loadPendingCommits(); // Reload to remove from pending list
  };

  const formatTimeRemaining = (deadlineStr?: string) => {
    if (!deadlineStr) return "No deadline set";

    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) return "⚠️ Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const isExpired = (deadlineStr?: string) => {
    if (!deadlineStr) return false;
    return new Date() > new Date(deadlineStr);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Commits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">
              Loading pending commits...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Pending Commits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            onClick={loadPendingCommits}
            variant="outline"
            className="mt-3"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Commits
          {pendingCommits.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {pendingCommits.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingCommits.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Pending Commits
            </h3>
            <p className="text-gray-600">
              You don't have any orders waiting for commitment right now.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingCommits.map((commit) => {
              const expired = isExpired(commit.commit_deadline);

              return (
                <div
                  key={commit.id}
                  className={`border rounded-lg p-4 ${
                    expired
                      ? "border-red-200 bg-red-50"
                      : "border-orange-200 bg-orange-50"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-800">
                        Order #{commit.id.slice(0, 8)}
                      </span>
                      {expired ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-orange-700 border-orange-300"
                        >
                          {formatTimeRemaining(commit.commit_deadline)}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-orange-800">
                        R{(commit.amount / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-orange-600">
                        You receive: R{((commit.amount * 0.9) / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3 w-3 text-gray-500" />
                      <span className="text-gray-600">Buyer:</span>
                      <span className="font-medium">{commit.buyer_email}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-gray-500" />
                      <span className="text-gray-600">Paid:</span>
                      <span className="font-medium">
                        {new Date(
                          commit.paid_at || commit.created_at,
                        ).toLocaleString()}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="text-sm">
                      <span className="text-gray-600">Items:</span>
                      <div className="ml-4 mt-1">
                        {commit.items?.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{item.title}</span>
                            <span className="font-medium">
                              R{item.price.toFixed(2)}
                            </span>
                          </div>
                        )) || (
                          <span className="text-gray-500">
                            Order details loading...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {expired ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        This order has expired. The buyer has been refunded
                        automatically.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Action Required:</strong> You have{" "}
                          {formatTimeRemaining(commit.commit_deadline)} to
                          commit to this sale. Click "Commit to Sale" below to
                          confirm you can fulfill this order.
                        </AlertDescription>
                      </Alert>

                      {/* Commit Component */}
                      <CommitToOrder
                        order={commit as OrderData}
                        onCommitSuccess={handleCommitSuccess}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Help Section */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">
                💡 How the 48-Hour Commit System Works
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • When someone buys your book, you have 48 hours to commit
                </li>
                <li>
                  • Committing confirms you have the book and can fulfill the
                  order
                </li>
                <li>
                  • Once committed, prepare your book for courier collection
                </li>
                <li>
                  • If you don't commit within 48 hours, the order is
                  auto-cancelled
                </li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 text-blue-700 border-blue-300 hover:bg-blue-100"
                onClick={() => navigate("/my-orders")}
              >
                View All Orders
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingCommitsSection;
