import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ShoppingCart,
  Timer,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import CommitSystemService from "@/services/commitSystemService";

interface CommitTest {
  id: string;
  type: string;
  status: "pending" | "running" | "success" | "failed";
  message: string;
  timestamp: string;
  orderId?: string;
  details?: any;
}

interface MockOrder {
  id: string;
  seller_id: string;
  buyer_id: string;
  book_id: string;
  amount: number;
  status: string;
  payment_reference: string;
  created_at: string;
  commit_deadline?: string;
  committed_at?: string;
}

const CommitTester = () => {
  const [tests, setTests] = useState<CommitTest[]>([]);
  const [mockOrders, setMockOrders] = useState<MockOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testOrderId, setTestOrderId] = useState("");
  const [testSellerId, setTestSellerId] = useState("");

  const updateTestStatus = (
    id: string,
    status: CommitTest["status"],
    message: string,
    details?: any,
  ) => {
    setTests((prev) =>
      prev.map((test) =>
        test.id === id ? { ...test, status, message, details } : test,
      ),
    );
  };

  const addTest = (type: string, orderId?: string) => {
    const testId = Date.now().toString();
    const newTest: CommitTest = {
      id: testId,
      type,
      status: "running",
      message: "Test in progress...",
      timestamp: new Date().toISOString(),
      orderId,
    };

    setTests((prev) => [newTest, ...prev]);
    return testId;
  };

  const loadMockOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!data || !Array.isArray(data)) {
        console.log(
          "No orders data or invalid data format, setting empty array",
        );
        setMockOrders([]);
        return;
      }

      setMockOrders(data);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      setMockOrders([]);
    }
  };

  useEffect(() => {
    loadMockOrders();
  }, []);

  const createMockOrder = async () => {
    const testId = addTest("Create Mock Order");
    setIsLoading(true);

    try {
      // Create a mock order for testing
      const mockOrderData = {
        seller_id: testSellerId || "seller-test-123",
        buyer_id: "buyer-test-123",
        book_id: "book-test-123",
        amount: 100.0,
        status: "pending_commit",
        payment_reference: `test-${Date.now()}`,
        commit_deadline: new Date(
          Date.now() + 48 * 60 * 60 * 1000,
        ).toISOString(), // 48 hours from now
      };

      const { data, error } = await supabase
        .from("orders")
        .insert(mockOrderData)
        .select()
        .single();

      if (error) throw error;

      updateTestStatus(
        testId,
        "success",
        `Mock order created successfully: ${data.id}`,
        data,
      );
      setTestOrderId(data.id);
      setTimeout(() => {
        toast.success("Mock order created for testing");
      }, 0);
      await loadMockOrders();
    } catch (error: any) {
      updateTestStatus(
        testId,
        "failed",
        `Failed to create mock order: ${error.message}`,
      );
      setTimeout(() => {
        toast.error(`Failed to create mock order: ${error.message}`);
      }, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const testCommitToSale = async () => {
    if (!testOrderId) {
      setTimeout(() => {
        toast.error("Please create a mock order first or enter an order ID");
      }, 0);
      return;
    }

    const testId = addTest("Commit to Sale", testOrderId);
    setIsLoading(true);

    try {
      const result = await CommitSystemService.commitToSale(testOrderId);
      updateTestStatus(
        testId,
        "success",
        "Successfully committed to sale",
        result,
      );
      setTimeout(() => {
        toast.success("Commit to sale test passed");
      }, 0);
      await loadMockOrders();
    } catch (error: any) {
      updateTestStatus(testId, "failed", `Commit failed: ${error.message}`);
      setTimeout(() => {
        toast.error(`Commit test failed: ${error.message}`);
      }, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const testDeclineCommit = async () => {
    if (!testOrderId) {
      setTimeout(() => {
        toast.error("Please create a mock order first or enter an order ID");
      }, 0);
      return;
    }

    const testId = addTest("Decline Commit", testOrderId);
    setIsLoading(true);

    try {
      const result = await CommitSystemService.declineCommit(
        testOrderId,
        "Testing decline functionality",
      );
      updateTestStatus(
        testId,
        "success",
        "Successfully declined commit",
        result,
      );
      setTimeout(() => {
        toast.success("Decline commit test passed");
      }, 0);
      await loadMockOrders();
    } catch (error: any) {
      updateTestStatus(testId, "failed", `Decline failed: ${error.message}`);
      toast.error(`Decline test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAutoExpire = async () => {
    const testId = addTest("Auto Expire Commits");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "auto-expire-commits",
      );

      if (error) throw error;

      updateTestStatus(
        testId,
        "success",
        "Auto expire function executed",
        data,
      );
      toast.success("Auto expire test completed");
      await loadMockOrders();
    } catch (error: any) {
      updateTestStatus(
        testId,
        "failed",
        `Auto expire failed: ${error.message}`,
      );
      toast.error(`Auto expire test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCommitReminder = async () => {
    if (!testOrderId) {
      setTimeout(() => {
        toast.error("Please create a mock order first or enter an order ID");
      }, 0);
      return;
    }

    const testId = addTest("Commit Reminder", testOrderId);
    setIsLoading(true);

    try {
      const result = await CommitSystemService.sendCommitReminder(testOrderId);
      updateTestStatus(
        testId,
        "success",
        "Commit reminder sent successfully",
        result,
      );
      toast.success("Commit reminder test passed");
    } catch (error: any) {
      updateTestStatus(testId, "failed", `Reminder failed: ${error.message}`);
      toast.error(`Reminder test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: CommitTest["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: CommitTest["status"]) => {
    const colors = {
      pending: "text-gray-600 bg-gray-100",
      running: "text-blue-600 bg-blue-100",
      success: "text-green-600 bg-green-100",
      failed: "text-red-600 bg-red-100",
    };

    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getOrderStatusColor = (status: string) => {
    const colors = {
      pending_commit: "text-yellow-600 bg-yellow-100",
      committed: "text-green-600 bg-green-100",
      declined: "text-red-600 bg-red-100",
      expired: "text-gray-600 bg-gray-100",
      completed: "text-blue-600 bg-blue-100",
    };
    return colors[status as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Commit System Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-order-id">Test Order ID</Label>
              <Input
                id="test-order-id"
                placeholder="Enter order ID or create mock order"
                value={testOrderId}
                onChange={(e) => setTestOrderId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-seller-id">Test Seller ID (for mock)</Label>
              <Input
                id="test-seller-id"
                placeholder="Enter seller ID for mock order"
                value={testSellerId}
                onChange={(e) => setTestSellerId(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button
              onClick={createMockOrder}
              disabled={isLoading}
              variant="outline"
            >
              Create Mock Order
            </Button>
            <Button
              onClick={testCommitToSale}
              disabled={isLoading || !testOrderId}
            >
              Test Commit
            </Button>
            <Button
              onClick={testDeclineCommit}
              disabled={isLoading || !testOrderId}
              variant="destructive"
            >
              Test Decline
            </Button>
            <Button
              onClick={testCommitReminder}
              disabled={isLoading || !testOrderId}
              variant="secondary"
            >
              Test Reminder
            </Button>
            <Button
              onClick={testAutoExpire}
              disabled={isLoading}
              variant="secondary"
            >
              Test Auto Expire
            </Button>
            <Button
              onClick={loadMockOrders}
              disabled={isLoading}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Orders
            </Button>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              These tests interact with real database records. Use carefully in
              production environments.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Mock Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!Array.isArray(mockOrders) || mockOrders.length === 0 ? (
            <Alert>
              <AlertDescription>
                No orders found. Create a mock order to begin testing.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {mockOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">
                      Order #{order.id.slice(-8)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Amount: R{order.amount} • Reference:{" "}
                      {order.payment_reference}
                    </div>
                    {order.commit_deadline && (
                      <div className="text-xs text-gray-500">
                        Deadline:{" "}
                        {new Date(order.commit_deadline).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getOrderStatusColor(order.status)}>
                      {order.status.replace("_", " ")}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTestOrderId(order.id)}
                    >
                      Use for Testing
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Commit Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <Alert>
              <AlertDescription>
                No commit tests run yet. Use the controls above to test commit
                functionality.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="font-medium">{test.type}</div>
                      <div className="text-sm text-gray-600">
                        {test.message}
                      </div>
                      {test.orderId && (
                        <div className="text-xs text-gray-500">
                          Order: {test.orderId}
                        </div>
                      )}
                      {test.details && (
                        <details className="text-xs text-gray-500 mt-1">
                          <summary className="cursor-pointer">
                            View Details
                          </summary>
                          <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto">
                            {JSON.stringify(test.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(test.status)}
                    <div className="text-xs text-gray-500">
                      {new Date(test.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommitTester;
