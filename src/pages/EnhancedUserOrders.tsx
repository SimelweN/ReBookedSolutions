import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Clock,
  CheckCircle,
  CreditCard,
  Eye,
  Truck,
  ShoppingBag,
  ArrowLeft,
  Filter,
  Search,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Phone,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserOrders,
  confirmDelivery,
  type Order,
} from "@/services/orderManagementService";
import { commitToOrder } from "@/services/enhancedOrderService";
import CommitToOrder from "@/components/CommitToOrder";
import SEO from "@/components/SEO";
import { toast } from "sonner";

const EnhancedUserOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const loadOrders = useCallback(async () => {
    if (!user?.id) {
      console.log("No user ID available for loading orders");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Loading orders for user:", user.id);

      const [buyerOrdersData, sellerOrdersData] = await Promise.all([
        getUserOrders(user.id, "buyer").catch((err) => {
          console.error("Error loading buyer orders:", err);
          return [];
        }),
        getUserOrders(user.id, "seller").catch((err) => {
          console.error("Error loading seller orders:", err);
          return [];
        }),
      ]);

      console.log(
        "Loaded orders - Buyer:",
        buyerOrdersData.length,
        "Seller:",
        sellerOrdersData.length,
      );
      setBuyerOrders(buyerOrdersData);
      setSellerOrders(sellerOrdersData);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error(
        "Failed to load orders. Please check your internet connection and try again.",
      );

      // Show sample data if real data fails to load (for development)
      if (import.meta.env.DEV) {
        console.log("Development mode: Adding sample orders");
        const sampleOrders: Order[] = [
          {
            id: "sample-order-1",
            buyer_id: user.id,
            seller_id: "other-user",
            book_id: "sample-book-1",
            paystack_reference: "sample-ref-123",
            total_amount: 15000,
            book_price: 12000,
            delivery_fee: 3000,
            platform_fee: 0,
            seller_amount: 12000,
            status: "paid",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            book: {
              title: "Sample Textbook",
              author: "Sample Author",
              imageUrl: undefined,
            },
            buyer: {
              name: "Sample Buyer",
              email: "buyer@example.com",
            },
            seller: {
              name: "Sample Seller",
              email: "seller@example.com",
            },
          },
        ];

        // Add sample orders based on role
        setBuyerOrders(sampleOrders);
        setSellerOrders(user.id === "other-user" ? sampleOrders : []);
      } else {
        setBuyerOrders([]);
        setSellerOrders([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.id) {
      loadOrders();
    }
  }, [user?.id, isAuthenticated, navigate, loadOrders]);

  const handleConfirmDelivery = async (orderId: string) => {
    try {
      await confirmDelivery(orderId);
      await loadOrders(); // Reload orders to show updated status
    } catch (error) {
      // Error already handled in service
    }
  };

  const handleCommitToOrder = async (orderId: string) => {
    try {
      await commitToOrder(orderId);
      await loadOrders(); // Reload orders to show updated status
      toast.success("Successfully committed to the order!");
    } catch (error) {
      console.error("Error committing to order:", error);
      toast.error("Failed to commit to order. Please try again.");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Pending Payment",
        variant: "secondary" as const,
        color: "bg-yellow-100 text-yellow-800",
      },
      paid: {
        label: "Paid",
        variant: "default" as const,
        color: "bg-blue-100 text-blue-800",
      },
      awaiting_collection: {
        label: "Awaiting Collection",
        variant: "secondary" as const,
        color: "bg-orange-100 text-orange-800",
      },
      collected: {
        label: "Collected",
        variant: "secondary" as const,
        color: "bg-purple-100 text-purple-800",
      },
      in_transit: {
        label: "In Transit",
        variant: "secondary" as const,
        color: "bg-indigo-100 text-indigo-800",
      },
      delivered: {
        label: "Delivered",
        variant: "default" as const,
        color: "bg-green-100 text-green-800",
      },
      completed: {
        label: "Completed",
        variant: "default" as const,
        color: "bg-green-100 text-green-800",
      },
      cancelled: {
        label: "Cancelled",
        variant: "destructive" as const,
        color: "bg-red-100 text-red-800",
      },
      refunded: {
        label: "Refunded",
        variant: "outline" as const,
        color: "bg-gray-100 text-gray-800",
      },
      expired: {
        label: "Expired",
        variant: "destructive" as const,
        color: "bg-red-100 text-red-800",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "secondary" as const,
      color: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amountInKobo: number) => {
    return `R${(amountInKobo / 100).toFixed(2)}`;
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

  const filterOrders = (orders: Order[]) => {
    return orders.filter((order) => {
      const matchesSearch =
        !searchTerm ||
        order.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.book?.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.paystack_reference
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const OrderCard: React.FC<{ order: Order; userRole: "buyer" | "seller" }> = ({
    order,
    userRole,
  }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
              {order.book?.imageUrl ? (
                <img
                  src={order.book.imageUrl}
                  alt={order.book.title}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <Package className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {order.book?.title || "Book Title"}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-1">
                {order.book?.author || "Unknown Author"}
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Order:</span>{" "}
                  {order.paystack_reference}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">
                    {userRole === "buyer" ? "Seller:" : "Buyer:"}
                  </span>{" "}
                  {userRole === "buyer"
                    ? order.seller?.name
                    : order.buyer?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span>{" "}
                  {formatDate(order.created_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:items-end space-y-3">
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(order.total_amount)}
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Book: {formatCurrency(order.book_price)}</p>
                {order.delivery_fee > 0 && (
                  <p>Delivery: {formatCurrency(order.delivery_fee)}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              {getStatusBadge(order.status)}

              {/* Order Actions */}
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/order/${order.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </Button>

                {/* Seller Actions */}
                {userRole === "seller" && order.status === "paid" && (
                  <Button
                    size="sm"
                    onClick={() => handleCommitToOrder(order.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Commit to Order
                  </Button>
                )}

                {/* Buyer Actions */}
                {userRole === "buyer" && order.status === "delivered" && (
                  <Button
                    size="sm"
                    onClick={() => handleConfirmDelivery(order.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirm Received
                  </Button>
                )}

                {/* Delivery Tracking */}
                {order.delivery_tracking_number && (
                  <Button size="sm" variant="outline">
                    <Truck className="h-4 w-4 mr-1" />
                    Track
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address (for sellers) */}
        {userRole === "seller" && order.shipping_address && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Delivery Address:
            </h4>
            <div className="text-sm text-gray-600">
              <p>{order.shipping_address.name}</p>
              <p>{order.shipping_address.address_line1}</p>
              {order.shipping_address.address_line2 && (
                <p>{order.shipping_address.address_line2}</p>
              )}
              <p>
                {order.shipping_address.city}, {order.shipping_address.province}{" "}
                {order.shipping_address.postal_code}
              </p>
              {order.shipping_address.phone && (
                <p>
                  <Phone className="h-3 w-3 inline mr-1" />
                  {order.shipping_address.phone}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Collection Deadline (for sellers) */}
        {userRole === "seller" &&
          order.collection_deadline &&
          ["paid", "awaiting_collection"].includes(order.status) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm text-orange-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className="font-medium">
                  Collection Deadline: {formatDate(order.collection_deadline)}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Please prepare your book for courier collection within 48 hours
                of payment.
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-book-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const filteredBuyerOrders = filterOrders(buyerOrders);
  const filteredSellerOrders = filterOrders(sellerOrders);

  return (
    <Layout>
      <SEO
        title="My Orders - ReBooked Solutions"
        description="Track your book orders and sales on ReBooked Solutions"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">
            Track your purchases and manage your sales
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Orders</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by book title, author, or order reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status-filter">Filter by Status</Label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All statuses</option>
                  <option value="paid">Paid</option>
                  <option value="awaiting_collection">
                    Awaiting Collection
                  </option>
                  <option value="collected">Collected</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Tabs */}
        <Tabs defaultValue="purchases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="purchases" className="flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2" />
              My Purchases ({filteredBuyerOrders.length})
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              My Sales ({filteredSellerOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="purchases">
            {filteredBuyerOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No purchases found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || statusFilter
                      ? "No orders match your current filters"
                      : "You haven't purchased any books yet"}
                  </p>
                  <Link to="/books">
                    <Button>
                      <Package className="h-4 w-4 mr-2" />
                      Browse Books
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredBuyerOrders.map((order) => (
                  <OrderCard key={order.id} order={order} userRole="buyer" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sales">
            {filteredSellerOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No sales found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || statusFilter
                      ? "No orders match your current filters"
                      : "You haven't sold any books yet"}
                  </p>
                  <Link to="/create-listing">
                    <Button>
                      <Package className="h-4 w-4 mr-2" />
                      List a Book
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredSellerOrders.map((order) => (
                  <OrderCard key={order.id} order={order} userRole="seller" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default EnhancedUserOrders;
