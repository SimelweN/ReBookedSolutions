import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
  Settings,
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Eye,
  Edit,
  Trash2,
  Send,
  Download,
  RefreshCw,
  Shield,
  Star,
  Calendar,
  Clock,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with real API calls
  const [stats, setStats] = useState({
    totalUsers: 1247,
    activeBooks: 523,
    totalSales: 89234,
    pendingReports: 12,
    monthlyGrowth: 15.3,
    newUsersToday: 23,
    booksListedToday: 45,
    salesThisMonth: 156,
  });

  const [recentUsers, setRecentUsers] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@university.ac.za",
      joinDate: "2024-01-15",
      status: "active",
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@student.ac.za",
      joinDate: "2024-01-14",
      status: "active",
    },
    {
      id: 3,
      name: "Carol Davis",
      email: "carol@edu.ac.za",
      joinDate: "2024-01-13",
      status: "pending",
    },
  ]);

  const [recentBooks, setRecentBooks] = useState([
    {
      id: 1,
      title: "Advanced Mathematics",
      author: "Dr. Smith",
      price: 450,
      seller: "John Doe",
      status: "active",
    },
    {
      id: 2,
      title: "Physics Textbook",
      author: "Prof. Johnson",
      price: 380,
      seller: "Jane Smith",
      status: "sold",
    },
    {
      id: 3,
      title: "Chemistry Lab Manual",
      author: "Dr. Brown",
      price: 280,
      seller: "Mike Wilson",
      status: "active",
    },
  ]);

  const quickActions = [
    {
      title: "Send Announcement",
      description: "Broadcast message to all users",
      icon: Send,
      color: "bg-blue-500",
      action: () => toast.info("Opening announcement composer..."),
    },
    {
      title: "Generate Report",
      description: "Export analytics data",
      icon: Download,
      color: "bg-green-500",
      action: () => toast.info("Generating report..."),
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: Settings,
      color: "bg-purple-500",
      action: () => toast.info("Opening system settings..."),
    },
    {
      title: "Security Check",
      description: "Review security status",
      icon: Shield,
      color: "bg-red-500",
      action: () => toast.info("Running security check..."),
    },
  ];

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Dashboard refreshed successfully");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.user_metadata?.name || user?.email}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </Button>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              System Healthy
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-300" />
                    <span className="text-sm text-green-300">
                      +{stats.newUsersToday} today
                    </span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">
                    Active Books
                  </p>
                  <p className="text-3xl font-bold">{stats.activeBooks}</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-300" />
                    <span className="text-sm text-green-300">
                      +{stats.booksListedToday} today
                    </span>
                  </div>
                </div>
                <BookOpen className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Total Sales
                  </p>
                  <p className="text-3xl font-bold">
                    R{stats.totalSales.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-300" />
                    <span className="text-sm text-green-300">
                      {stats.salesThisMonth} this month
                    </span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">
                    Pending Reports
                  </p>
                  <p className="text-3xl font-bold">{stats.pendingReports}</p>
                  <div className="flex items-center mt-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-300" />
                    <span className="text-sm text-yellow-300">
                      Needs attention
                    </span>
                  </div>
                </div>
                <Activity className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-all"
                  onClick={action.action}
                >
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-500">
                      {action.description}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-3 lg:grid-cols-5 w-full bg-white shadow-sm border">
            <TabsTrigger
              value="overview"
              className="flex items-center space-x-2"
            >
              <PieChart className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="books" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Books</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Users</span>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">
                            {user.joinDate}
                          </p>
                        </div>
                        <Badge
                          variant={
                            user.status === "active" ? "default" : "secondary"
                          }
                        >
                          {user.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Books */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Book Listings</span>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBooks.map((book) => (
                      <div
                        key={book.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {book.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            by {book.author}
                          </p>
                          <p className="text-xs text-gray-400">
                            Seller: {book.seller}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            R{book.price}
                          </p>
                          <Badge
                            variant={
                              book.status === "active" ? "default" : "secondary"
                            }
                          >
                            {book.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <CardTitle>User Management</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    User Management
                  </h3>
                  <p className="text-gray-500">
                    Advanced user management features coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Books Tab */}
          <TabsContent value="books" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <CardTitle>Book Management</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Book Management
                  </h3>
                  <p className="text-gray-500">
                    Book management and moderation tools coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Analytics Dashboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Advanced Analytics
                  </h3>
                  <p className="text-gray-500">
                    Detailed analytics and reporting features coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>System Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="site-name">Site Name</Label>
                    <Input id="site-name" defaultValue="RebookedSolutions" />
                  </div>
                  <div>
                    <Label htmlFor="announcement">System Announcement</Label>
                    <Textarea
                      id="announcement"
                      placeholder="Enter system-wide announcement..."
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-gray-500">
                        Enable to put the system in maintenance mode
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <Button className="w-full">Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
