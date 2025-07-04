import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Eye,
  RefreshCw,
  Download,
  Calendar,
} from "lucide-react";
import PaystackPaymentService, {
  OrderData,
} from "@/services/paystackPaymentService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SellerEarningsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    ready: 0,
  });
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user?.id) {
      loadEarningsData();
    }
  }, [user?.id]);

  const loadEarningsData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Load earnings summary
      const earningsData = await PaystackPaymentService.getSellerEarnings(
        user.id,
      );
      setEarnings(earningsData);

      // Load all orders for this seller
      const allOrders = await PaystackPaymentService.getOrdersByStatus("paid");
      const sellerOrders = allOrders.filter(
        (order) => order.seller_id === user.id,
      );
      setOrders(sellerOrders);
    } catch (error) {
      console.error("Error loading earnings data:", error);
      toast.error("Failed to load earnings data");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `R${(amount / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "ready_for_payout":
        return "bg-orange-100 text-orange-800";
      case "paid_out":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Awaiting Courier";
      case "ready_for_payout":
        return "Processing Payout";
      case "paid_out":
        return "Paid Out";
      default:
        return status;
    }
  };

  const exportEarnings = () => {
    const csvContent = [
      ["Order ID", "Date", "Amount", "Commission", "Net Amount", "Status"],
      ...orders.map((order) => [
        order.id,
        new Date(order.created_at).toLocaleDateString(),
        formatAmount(order.amount),
        formatAmount(Math.round(order.amount * 0.1)),
        formatAmount(Math.round(order.amount * 0.9)),
        getStatusText(order.status),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `earnings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading earnings data...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earnings Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(earnings.total)}
            </div>
            <p className="text-xs text-muted-foreground">
              All-time gross earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(earnings.paid)}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully transferred
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatAmount(earnings.ready)}
            </div>
            <p className="text-xs text-muted-foreground">Ready for payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatAmount(earnings.pending)}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting courier pickup
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Earnings Details</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={exportEarnings}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={loadEarningsData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Orders:</span>
                        <span className="font-medium">
                          {
                            orders.filter(
                              (o) =>
                                new Date(o.created_at).getMonth() ===
                                new Date().getMonth(),
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Gross:</span>
                        <span className="font-medium">
                          {formatAmount(
                            orders
                              .filter(
                                (o) =>
                                  new Date(o.created_at).getMonth() ===
                                  new Date().getMonth(),
                              )
                              .reduce((sum, o) => sum + o.amount, 0),
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Net:</span>
                        <span className="font-medium text-green-600">
                          {formatAmount(
                            orders
                              .filter(
                                (o) =>
                                  new Date(o.created_at).getMonth() ===
                                  new Date().getMonth(),
                              )
                              .reduce(
                                (sum, o) => sum + Math.round(o.amount * 0.9),
                                0,
                              ),
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Commission Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Platform Fee:
                        </span>
                        <span className="text-red-600">10%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">You Keep:</span>
                        <span className="text-green-600 font-medium">90%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Platform fee covers payment processing, hosting, and
                        support.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Gross</TableHead>
                      <TableHead>Net</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{order.items.length}</TableCell>
                        <TableCell>{formatAmount(order.amount)}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {formatAmount(Math.round(order.amount * 0.9))}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="payouts" className="space-y-4">
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Payout history will appear here</p>
                <p className="text-sm text-gray-500">
                  Track your payment transfers and banking details
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerEarningsDashboard;
