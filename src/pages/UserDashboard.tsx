import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  DollarSign,
  Package,
  TrendingUp,
  Eye,
  Edit,
  Plus,
  ShoppingBag,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEO from "@/components/SEO";

interface UserStats {
  totalListings: number;
  activeListings: number;
  soldBooks: number;
  totalEarnings: number;
  totalPurchases: number;
  pendingOrders: number;
}

interface UserBook {
  id: string;
  title: string;
  author: string;
  price: number;
  imageUrl?: string;
  sold: boolean;
  created_at: string;
  views?: number;
}

interface UserOrder {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  book: {
    title: string;
    author: string;
    imageUrl?: string;
  };
  seller: {
    name: string;
  };
}

const UserDashboard: React.FC = () => {
  const { user, isAuthenticated, profile } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<UserStats>({
    totalListings: 0,
    activeListings: 0,
    soldBooks: 0,
    totalEarnings: 0,
    totalPurchases: 0,
    pendingOrders: 0,
  });

  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadUserData();
  }, [isAuthenticated, navigate]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load user statistics
      const [booksData, ordersData, salesData] = await Promise.all([
        // User's books
        supabase
          .from("books")
          .select("*")
          .eq("seller_id", user.id)
          .order("created_at", { ascending: false }),

        // User's orders as buyer
        supabase
          .from("orders")
          .select(
            `
            *,
            book:books(title, author, imageUrl),
            seller:profiles!orders_seller_id_fkey(name)
          `,
          )
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false }),

        // User's sales (as seller)
        supabase
          .from("orders")
          .select("seller_amount, status")
          .eq("seller_id", user.id)
          .eq("status", "completed"),
      ]);

      if (booksData.error) throw booksData.error;
      if (ordersData.error) throw ordersData.error;
      if (salesData.error) throw salesData.error;

      const books = booksData.data || [];
      const orders = ordersData.data || [];
      const sales = salesData.data || [];

      setUserBooks(books);
      setUserOrders(orders);

      // Calculate statistics
      const totalEarnings =
        sales.reduce((sum, sale) => sum + (sale.seller_amount || 0), 0) / 100; // Convert from kobo
      const pendingOrders = orders.filter((order) =>
        ["paid", "awaiting_collection", "collected", "in_transit"].includes(
          order.status,
        ),
      ).length;

      setStats({
        totalListings: books.length,
        activeListings: books.filter((book) => !book.sold).length,
        soldBooks: books.filter((book) => book.sold).length,
        totalEarnings,
        totalPurchases: orders.length,
        pendingOrders,
      });
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: "Paid", variant: "default" as const },
      awaiting_collection: {
        label: "Awaiting Collection",
        variant: "secondary" as const,
      },
      collected: { label: "Collected", variant: "secondary" as const },
      in_transit: { label: "In Transit", variant: "secondary" as const },
      delivered: { label: "Delivered", variant: "default" as const },
      completed: { label: "Completed", variant: "default" as const },
      cancelled: { label: "Cancelled", variant: "destructive" as const },
      refunded: { label: "Refunded", variant: "outline" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "secondary" as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-book-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="My Dashboard - ReBooked Solutions"
        description="Manage your books, orders, and earnings on ReBooked Solutions"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.name || user?.email?.split("@")[0]}!
          </h1>
          <p className="text-gray-600">
            Manage your books, track your orders, and view your earnings.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Listings
                  </p>
                  <p className="text-2xl font-bold">{stats.totalListings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{stats.activeListings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Sold</p>
                  <p className="text-2xl font-bold">{stats.soldBooks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Earnings</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.totalEarnings)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Purchases</p>
                  <p className="text-2xl font-bold">{stats.totalPurchases}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/create-listing">
              <Button className="bg-book-600 hover:bg-book-700">
                <Plus className="h-4 w-4 mr-2" />
                List a Book
              </Button>
            </Link>
            <Link to="/books">
              <Button variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Books
              </Button>
            </Link>
            <Link to="/my-orders">
              <Button variant="outline">
                <Package className="h-4 w-4 mr-2" />
                View All Orders
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>My Book Listings</span>
                  <Link to="/create-listing">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Book
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userBooks.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No books listed yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start selling your textbooks to earn money
                    </p>
                    <Link to="/create-listing">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        List Your First Book
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userBooks.slice(0, 6).map((book) => (
                      <Card key={book.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                              {book.imageUrl ? (
                                <img
                                  src={book.imageUrl}
                                  alt={book.title}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <BookOpen className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm line-clamp-2">
                                {book.title}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-1">
                                {book.author}
                              </p>
                              <p className="text-lg font-bold text-book-600 mt-1">
                                {formatCurrency(book.price)}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                {book.sold ? (
                                  <Badge variant="default">Sold</Badge>
                                ) : (
                                  <Badge variant="secondary">Available</Badge>
                                )}
                                <div className="flex space-x-1">
                                  <Link to={`/books/${book.id}`}>
                                    <Button size="sm" variant="ghost">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Link to={`/edit-book/${book.id}`}>
                                    <Button size="sm" variant="ghost">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {userBooks.length > 6 && (
                  <div className="text-center mt-6">
                    <Link to="/profile">
                      <Button variant="outline">View All Listings</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {userOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No orders yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start shopping for textbooks
                    </p>
                    <Link to="/books">
                      <Button>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Browse Books
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                            {order.book?.imageUrl ? (
                              <img
                                src={order.book.imageUrl}
                                alt={order.book.title}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <BookOpen className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{order.book?.title}</h4>
                            <p className="text-sm text-gray-600">
                              {order.book?.author}
                            </p>
                            <p className="text-sm text-gray-600">
                              Seller: {order.seller?.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {formatCurrency(order.total_amount / 100)}
                          </p>
                          {getStatusBadge(order.status)}
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {userOrders.length > 5 && (
                  <div className="text-center mt-6">
                    <Link to="/my-orders">
                      <Button variant="outline">View All Orders</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserDashboard;
