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
  Timer,
  Eye,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import CommitSystemService, {
  CommitData,
} from "@/services/commitSystemService";

const PendingCommitsSection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingCommits, setPendingCommits] = useState<CommitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [committing, setCommitting] = useState<Set<string>>(new Set());
  const [declining, setDeclining] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.id) {
      loadPendingCommits();

      // Set up real-time subscription
      const unsubscribe = CommitSystemService.subscribeToCommitUpdates(
        user.id,
        setPendingCommits,
      );

      return unsubscribe;
    }
  }, [user?.id]);

  const loadPendingCommits = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const commits = await CommitSystemService.getPendingCommits(user.id);
      setPendingCommits(commits);

      console.log(
        `📊 Loaded ${commits.length} pending commits for seller:`,
        user.id,
      );
    } catch (err) {
      console.error("Error loading pending commits:", err);
      setError("Failed to load pending commitments");
    } finally {
      setLoading(false);
    }
  };

  const handleCommitToSale = async (commitData: CommitData) => {
    if (!user?.id) return;

    try {
      setCommitting((prev) => new Set([...prev, commitData.id]));

      const result = await CommitSystemService.commitToSale(
        commitData.id,
        user.id,
      );

      if (result.success) {
        toast.success(result.message);

        // Remove from pending commits list
        setPendingCommits((prev) => prev.filter((c) => c.id !== commitData.id));

        // Optionally reload to ensure sync
        loadPendingCommits();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error committing to sale:", error);
      toast.error("Failed to commit to sale. Please try again.");
    } finally {
      setCommitting((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commitData.id);
        return newSet;
      });
    }
  };

  const handleDeclineCommit = async (commitData: CommitData) => {
    if (!user?.id) return;

    // Confirm before declining
    if (
      !window.confirm(
        "Are you sure you want to decline this order? The buyer will be refunded and you cannot undo this action.",
      )
    ) {
      return;
    }

    try {
      setDeclining((prev) => new Set([...prev, commitData.id]));

      const result = await CommitSystemService.declineCommit(
        commitData.id,
        user.id,
      );

      if (result.success) {
        toast.success(result.message);

        // Remove from pending commits list
        setPendingCommits((prev) => prev.filter((c) => c.id !== commitData.id));

        // Optionally reload to ensure sync
        loadPendingCommits();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error declining commit:", error);
      toast.error("Failed to decline commit. Please try again.");
    } finally {
      setDeclining((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commitData.id);
        return newSet;
      });
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
              const statusInfo = CommitSystemService.getCommitStatus(commit);
              const expired = CommitSystemService.isCommitExpired(commit);
              const timeRemaining =
                CommitSystemService.getTimeRemaining(commit);
              const isCommittingThis = committing.has(commit.id);
              const isDecliningThis = declining.has(commit.id);

              return (
                <div
                  key={commit.id}
                  className={`border rounded-lg p-4 transition-all ${
                    expired
                      ? "border-red-200 bg-red-50"
                      : statusInfo.urgent
                        ? "border-orange-200 bg-orange-50 shadow-orange-100 shadow-lg"
                        : "border-blue-200 bg-blue-50"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          expired
                            ? "bg-red-100"
                            : statusInfo.urgent
                              ? "bg-orange-100"
                              : "bg-blue-100"
                        }`}
                      >
                        <Package
                          className={`h-4 w-4 ${
                            expired
                              ? "text-red-600"
                              : statusInfo.urgent
                                ? "text-orange-600"
                                : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">
                          Sale #{commit.id.slice(0, 8)}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              expired
                                ? "destructive"
                                : statusInfo.urgent
                                  ? "outline"
                                  : "secondary"
                            }
                            className={`text-xs ${statusInfo.color}`}
                          >
                            {statusInfo.status}
                          </Badge>
                          {!expired && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Timer className="h-3 w-3" />
                              {timeRemaining}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        R{(commit.amount / 100).toFixed(2)}
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        You get: R{((commit.amount * 0.9) / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        (90% after 10% platform fee)
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">Buyer:</span>
                        <span className="font-medium">
                          {commit.buyer_email || "Loading..."}
                        </span>
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
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-600 font-medium">Book:</span>
                        <div className="mt-1">
                          {commit.metadata?.book_title ? (
                            <span className="font-medium">
                              {commit.metadata.book_title}
                            </span>
                          ) : (
                            <span className="text-gray-500 italic">
                              Book details loading...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Countdown Bar for urgent items */}
                  {!expired && statusInfo.urgent && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Time remaining</span>
                        <span className="font-mono">{timeRemaining}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            statusInfo.status === "Urgent"
                              ? "bg-red-500"
                              : "bg-orange-500"
                          }`}
                          style={{
                            width: `${Math.max(10, ((new Date(commit.expires_at || commit.commit_deadline!).getTime() - Date.now()) / (48 * 60 * 60 * 1000)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {expired ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        This commitment window has expired. The buyer has been
                        automatically refunded and the book has been relisted
                        for sale.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      <Alert
                        className={
                          statusInfo.urgent
                            ? "border-orange-300 bg-orange-50"
                            : "border-blue-300 bg-blue-50"
                        }
                      >
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Action Required:</strong> You have{" "}
                          {timeRemaining} to commit to this sale. By committing,
                          you confirm that you have the book ready and can
                          fulfill this order.
                        </AlertDescription>
                      </Alert>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleCommitToSale(commit)}
                          disabled={isCommittingThis || isDecliningThis}
                          className={`flex-1 ${
                            statusInfo.urgent
                              ? "bg-orange-600 hover:bg-orange-700"
                              : "bg-green-600 hover:bg-green-700"
                          } text-white font-medium`}
                        >
                          {isCommittingThis ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Committing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />✅ Commit
                              to Sale
                            </>
                          )}
                        </Button>

                        <Button
                          variant="destructive"
                          onClick={() => handleDeclineCommit(commit)}
                          disabled={isCommittingThis || isDecliningThis}
                          className="flex-1"
                        >
                          {isDecliningThis ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Declining...
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 mr-2" />❌
                              Decline Order
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() =>
                            navigate(`/payment-status/${commit.id}`)
                          }
                          className="border-gray-300"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>

                      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <strong>What happens when you commit:</strong>
                        <ul className="mt-1 space-y-1 ml-4 list-disc">
                          <li>
                            Your book is marked as sold and removed from
                            listings
                          </li>
                          <li>Courier will contact you to arrange pickup</li>
                          <li>
                            You'll receive payment after successful delivery
                          </li>
                          <li>
                            Buyer will be notified that you've committed to the
                            sale
                          </li>
                        </ul>
                      </div>
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
