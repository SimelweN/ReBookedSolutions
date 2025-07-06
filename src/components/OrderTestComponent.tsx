import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useUserOrders } from "@/hooks/useUserOrders";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const OrderTestComponent: React.FC = () => {
  const { user } = useAuth();
  const { orders, loading, error, refetch } = useUserOrders();
  const [testResult, setTestResult] = useState<string>("");
  const [testing, setTesting] = useState(false);

  const testOrdersTableAccess = async () => {
    setTesting(true);
    setTestResult("");

    try {
      if (!user?.email) {
        setTestResult("❌ No user email available");
        return;
      }

      // Test direct table access
      const { data, error, count } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("buyer_email", user.email);

      if (error) {
        setTestResult(`❌ Database Error: ${error.message}`);
        return;
      }

      if (count === 0) {
        setTestResult(
          "✅ Orders table accessible, but no orders found for this user",
        );
      } else {
        setTestResult(
          `✅ Orders table accessible! Found ${count} orders for ${user.email}`,
        );
      }

      // Test if we can access orders table at all
      const {
        data: allOrders,
        error: allError,
        count: totalCount,
      } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .limit(1);

      if (allError) {
        setTestResult(
          (prev) =>
            prev + `\n❌ Cannot access orders table: ${allError.message}`,
        );
      } else {
        setTestResult(
          (prev) => prev + `\n✅ Orders table has ${totalCount} total orders`,
        );
      }
    } catch (err) {
      setTestResult(
        `❌ Exception: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setTesting(false);
    }
  };

  const createTestOrder = async () => {
    if (!user?.email) {
      toast.error("No user email available");
      return;
    }

    setTesting(true);

    try {
      const testOrder = {
        buyer_email: user.email,
        seller_id: user.id, // Self as seller for test
        amount: 10000, // R100 in kobo
        status: "paid",
        paystack_ref: `test_${Date.now()}`,
        items: [
          {
            book_id: "test-book-id",
            title: "Test Book",
            author: "Test Author",
            price: 10000,
            condition: "Used",
            isbn: "123-456-789",
            image_url: "",
            seller_id: user.id,
          },
        ],
        shipping_address: {
          street: "123 Test Street",
          city: "Cape Town",
          province: "Western Cape",
          postal_code: "8000",
        },
      };

      const { data, error } = await supabase
        .from("orders")
        .insert(testOrder)
        .select()
        .single();

      if (error) {
        toast.error(`Failed to create test order: ${error.message}`);
      } else {
        toast.success("Test order created successfully!");
        await refetch(); // Refresh orders list
      }
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order System Debugging</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testOrdersTableAccess} disabled={testing}>
              Test Orders Table Access
            </Button>
            <Button
              onClick={createTestOrder}
              disabled={testing}
              variant="outline"
            >
              Create Test Order
            </Button>
            <Button onClick={refetch} disabled={loading}>
              Refresh Orders
            </Button>
          </div>

          {testResult && (
            <Alert>
              <AlertDescription>
                <pre className="whitespace-pre-wrap">{testResult}</pre>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Order Status
            <Badge
              variant={
                error
                  ? "destructive"
                  : orders.length > 0
                    ? "default"
                    : "secondary"
              }
            >
              {loading
                ? "Loading..."
                : error
                  ? "Error"
                  : `${orders.length} orders`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading orders...</p>}

          {error && (
            <Alert>
              <AlertDescription>Error: {error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && orders.length === 0 && (
            <p className="text-gray-500">No orders found</p>
          )}

          {orders.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Recent Orders:</h4>
              {orders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium">{order.id.slice(0, 8)}...</p>
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} items • R
                      {(order.amount / 100).toFixed(2)}
                    </p>
                  </div>
                  <Badge
                    variant={order.status === "paid" ? "default" : "secondary"}
                  >
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderTestComponent;
