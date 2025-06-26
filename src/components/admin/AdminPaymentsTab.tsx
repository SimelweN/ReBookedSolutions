import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Users,
  Search,
  Download,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import PaystackPaymentService, {
  OrderData,
} from "@/services/paystackPaymentService";
import { toast } from "sonner";

const AdminPaymentsTab: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
  });

  useEffect(() => {
    loadPaymentData();
  }, []);

  useEffect(() => {
    // Filter orders based on search term
    if (searchTerm) {
      const filtered = orders.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.paystack_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.buyer_email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchTerm, orders]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);

      // Load all orders for admin view
      const allStatuses = [
        "pending",
        "paid",
        "ready_for_payout",
        "paid_out",
        "failed",
      ];
      const allOrders: OrderData[] = [];

      for (const status of allStatuses) {
        const statusOrders = await PaystackPaymentService.getOrdersByStatus(
          status as any,
        );
        allOrders.push(...statusOrders);
      }

      setOrders(allOrders);
      setFilteredOrders(allOrders);

      // Calculate stats
      const totalRevenue = allOrders.reduce(
        (sum, order) => (order.status !== "failed" ? sum + order.amount : sum),
        0,
      );

      const pendingPayouts = allOrders
        .filter((o) => o.status === "ready_for_payout")
        .reduce((sum, o) => sum + Math.round(o.amount * 0.9), 0);

      const completedPayouts = allOrders
        .filter((o) => o.status === "paid_out")
        .reduce((sum, o) => sum + Math.round(o.amount * 0.9), 0);

      setStats({
        totalOrders: allOrders.length,
        totalRevenue,
        pendingPayouts,
        completedPayouts,
      });
    } catch (error) {
      console.error("Error loading payment data:", error);
      toast.error("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async (order: OrderData) => {
    try {
      await PaystackPaymentService.processPayout(
        order.id,
        order.seller_id,
        order.amount,
        `Manual payout for order ${order.id}`,
      );

      toast.success("Payout processed successfully");
      await loadPaymentData(); // Refresh data
    } catch (error) {
      console.error("Error processing payout:", error);
      toast.error("Failed to process payout");
    }
  };

  const handleMarkReadyForPayout = async (order: OrderData) => {
    try {
      await PaystackPaymentService.markReadyForPayout(order.id);
      toast.success("Order marked ready for payout");
      await loadPaymentData(); // Refresh data
    } catch (error) {
      console.error("Error marking ready for payout:", error);
      toast.error("Failed to mark ready for payout");
    }
  };

  const formatAmount = (amount: number) => {
    return `R${(amount / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "ready_for_payout":
        return "bg-orange-100 text-orange-800";
      case "paid_out":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const exportData = () => {
    const csvContent = [
      ["Order ID", "Date", "Buyer", "Amount", "Status", "Items", "Reference"],
      ...filteredOrders.map((order) => [
        order.id,
        new Date(order.created_at).toLocaleDateString(),
        order.buyer_email,
        formatAmount(order.amount),
        order.status,
        order.items.length,
        order.paystack_ref,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading payment data...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(stats.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payouts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatAmount(stats.pendingPayouts)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Payouts
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(stats.completedPayouts)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Payment Management</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={loadPaymentData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="overview">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending Payouts</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            {/* Search */}
            <div className="flex items-center space-x-2 my-4">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search orders by ID, reference, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            <TabsContent value="overview">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{order.buyer_email}</TableCell>
                        <TableCell>{formatAmount(order.amount)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {order.status === "paid" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkReadyForPayout(order)}
                              >
                                Mark Ready
                              </Button>
                            )}
                            {order.status === "ready_for_payout" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleProcessPayout(order)}
                              >
                                Process Payout
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="pending">
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Orders ready for payout:{" "}
                  {
                    filteredOrders.filter(
                      (o) => o.status === "ready_for_payout",
                    ).length
                  }
                </p>
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Completed orders:{" "}
                  {filteredOrders.filter((o) => o.status === "paid_out").length}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPaymentsTab;
