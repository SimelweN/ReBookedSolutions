import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Package,
  Download,
  Eye,
  Search,
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Truck,
} from "lucide-react";
import { useUserOrders } from "@/hooks/useUserOrders";
import { OrderData } from "@/services/paystackPaymentService";
import Receipt from "@/components/Receipt";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PurchaseHistory: React.FC = () => {
  const { orders, loading, error, refetch } = useUserOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "committed":
        return <Package className="w-4 h-4 text-blue-500" />;
      case "shipped":
        return <Truck className="w-4 h-4 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "cancelled":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "committed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Payment Confirmed";
      case "committed":
        return "Seller Committed";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      case "pending":
        return "Payment Pending";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      order.items.some(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.author?.toLowerCase().includes(searchTerm.toLowerCase()),
      ) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-book-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading purchase history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Purchase History
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Purchase History
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by book title, author, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Payment Confirmed</SelectItem>
                <SelectItem value="committed">Seller Committed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="pending">Payment Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {orders.length === 0 ? "No Purchases Yet" : "No Results Found"}
              </h3>
              <p className="text-gray-600">
                {orders.length === 0
                  ? "Start shopping to see your purchase history here!"
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-sm">
                              Order #{order.id.slice(0, 8)}
                            </span>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">
                                {getStatusText(order.status)}
                              </span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.created_at)}
                          </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-2 mb-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex gap-3">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.title}
                                  className="w-12 h-16 object-cover rounded border"
                                />
                              ) : (
                                <div className="w-12 h-16 bg-gray-200 rounded border flex items-center justify-center">
                                  <Package className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                  {item.title}
                                </h4>
                                {item.author && (
                                  <p className="text-xs text-gray-600">
                                    by {item.author}
                                  </p>
                                )}
                                {item.condition && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs mt-1"
                                  >
                                    {item.condition}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="font-medium text-sm">
                                  R{(item.price / 100).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="font-medium text-sm">
                            Total Paid:
                          </span>
                          <span className="font-bold text-green-600">
                            R{(order.amount / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row lg:flex-col gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Receipt
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Order Receipt</DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <Receipt
                                order={selectedOrder}
                                showActions={true}
                              />
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Purchase Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-book-600">
                  {orders.length}
                </div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {orders.filter((o) => o.status === "delivered").length}
                </div>
                <div className="text-sm text-gray-600">Delivered</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {
                    orders.filter((o) =>
                      ["paid", "committed", "shipped"].includes(o.status),
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-book-600">
                  R
                  {(
                    orders.reduce((sum, order) => sum + order.amount, 0) / 100
                  ).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PurchaseHistory;
