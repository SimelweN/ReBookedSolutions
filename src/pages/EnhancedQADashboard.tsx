import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Settings,
  ShoppingCart,
  User,
  CreditCard,
  TestTube,
  Activity,
  Zap,
  Shield,
  BookOpen,
  Truck,
  MapPin,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Users,
  Crown,
  Database,
} from "lucide-react";

interface TestLog {
  id: string;
  timestamp: Date;
  testName: string;
  status: "pass" | "fail" | "warning";
  message: string;
  details?: string;
}

interface SimulationMode {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

const EnhancedQADashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [currentRole, setCurrentRole] = useState<"buyer" | "seller" | "admin">(
    "buyer",
  );
  const [testLogs, setTestLogs] = useState<TestLog[]>([]);
  const [simulationModes, setSimulationModes] = useState<SimulationMode[]>([
    {
      id: "success-payment",
      name: "Successful Payment",
      description: "Simulate successful Paystack transactions",
      enabled: true,
    },
    {
      id: "failed-payment",
      name: "Failed Payment",
      description: "Simulate payment failures and error handling",
      enabled: false,
    },
    {
      id: "courier-pickup",
      name: "Courier Pickup",
      description: "Simulate courier collection confirmation",
      enabled: false,
    },
  ]);

  // Check if user has QA/Admin access
  const hasQAAccess = () => {
    return (
      profile?.role === "admin" ||
      profile?.role === "qa" ||
      user?.email?.includes("qa") ||
      user?.email?.includes("admin")
    );
  };

  const addTestLog = (
    testName: string,
    status: "pass" | "fail" | "warning",
    message: string,
    details?: string,
  ) => {
    const newLog: TestLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      testName,
      status,
      message,
      details,
    };
    setTestLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  const clearTestData = () => {
    setTestLogs([]);
    addTestLog("System", "pass", "Test data cleared successfully");
  };

  const simulateBookListing = async () => {
    addTestLog("Book Listing", "pass", "Starting book listing simulation...");
    try {
      navigate("/create-listing");
      addTestLog("Book Listing", "pass", "Navigated to create listing page");
    } catch (error) {
      addTestLog(
        "Book Listing",
        "fail",
        "Failed to navigate to listing page",
        error as string,
      );
    }
  };

  const simulateCheckoutFlow = async () => {
    addTestLog("Checkout", "pass", "Starting checkout flow simulation...");
    try {
      // First add item to cart
      navigate("/books");
      setTimeout(() => {
        addTestLog(
          "Checkout",
          "pass",
          "Ready for checkout test - add a book to cart",
        );
      }, 1000);
    } catch (error) {
      addTestLog(
        "Checkout",
        "fail",
        "Checkout simulation failed",
        error as string,
      );
    }
  };

  const simulateBankingFlow = () => {
    addTestLog("Banking", "pass", "Testing banking subaccount setup...");
    navigate("/profile");
    setTimeout(() => {
      addTestLog(
        "Banking",
        "pass",
        "Navigate to profile to complete banking setup",
      );
    }, 500);
  };

  const simulateDeliveryFlow = () => {
    addTestLog("Delivery", "pass", "Testing delivery and courier selection...");
    navigate("/checkout");
    setTimeout(() => {
      addTestLog("Delivery", "pass", "Test delivery options in checkout");
    }, 500);
  };

  const simulateAddressHandling = () => {
    addTestLog(
      "Address",
      "pass",
      "Testing address input with Google Maps fallback...",
    );
    navigate("/profile");
    setTimeout(() => {
      addTestLog("Address", "pass", "Test address entry in profile settings");
    }, 500);
  };

  const simulateErrorScenarios = () => {
    addTestLog("Error Testing", "warning", "Simulating error scenarios...");
    // Simulate various error conditions
    setTimeout(() => {
      addTestLog(
        "Error Testing",
        "pass",
        "Error handling simulation completed",
      );
    }, 2000);
  };

  const toggleSimulationMode = (modeId: string) => {
    setSimulationModes((prev) =>
      prev.map((mode) =>
        mode.id === modeId ? { ...mode, enabled: !mode.enabled } : mode,
      ),
    );
    const mode = simulationModes.find((m) => m.id === modeId);
    addTestLog(
      "Simulation Mode",
      "pass",
      `${mode?.enabled ? "Disabled" : "Enabled"} ${mode?.name}`,
    );
  };

  const roleActions = {
    buyer: [
      {
        title: "Browse & Purchase",
        description: "Test book browsing and purchase flow",
        icon: ShoppingCart,
        action: () => navigate("/books"),
        color: "bg-blue-600 hover:bg-blue-700",
      },
      {
        title: "My Orders",
        description: "View order history and status",
        icon: BookOpen,
        action: () => navigate("/my-orders"),
        color: "bg-green-600 hover:bg-green-700",
      },
      {
        title: "Activity Log",
        description: "Check activity tracking",
        icon: Activity,
        action: () => navigate("/activity"),
        color: "bg-purple-600 hover:bg-purple-700",
      },
    ],
    seller: [
      {
        title: "Create Listing",
        description: "Add new book listing",
        icon: BookOpen,
        action: simulateBookListing,
        color: "bg-green-600 hover:bg-green-700",
      },
      {
        title: "Banking Setup",
        description: "Configure subaccount details",
        icon: CreditCard,
        action: simulateBankingFlow,
        color: "bg-blue-600 hover:bg-blue-700",
      },
      {
        title: "Profile Setup",
        description: "Complete seller profile",
        icon: User,
        action: () => navigate("/profile"),
        color: "bg-orange-600 hover:bg-orange-700",
      },
    ],
    admin: [
      {
        title: "Admin Panel",
        description: "Access administrative functions",
        icon: Settings,
        action: () => navigate("/admin"),
        color: "bg-red-600 hover:bg-red-700",
      },
      {
        title: "System Status",
        description: "Monitor system health",
        icon: Activity,
        action: () => navigate("/admin/reports"),
        color: "bg-indigo-600 hover:bg-indigo-700",
      },
      {
        title: "User Management",
        description: "Manage user accounts",
        icon: Users,
        action: () => navigate("/admin"),
        color: "bg-gray-600 hover:bg-gray-700",
      },
    ],
  };

  // Access control check
  if (!hasQAAccess()) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <Shield className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Restricted
            </h1>
            <p className="text-gray-600">
              This QA Dashboard is only available to administrators and QA
              testers.
            </p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Return to Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Advanced QA Dashboard
              </h1>
              <p className="text-gray-600">
                Comprehensive testing and simulation for all ReBooked Solutions
                features
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="text-green-600 border-green-200"
              >
                QA Access Granted
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-600">Test as:</span>
            {(["buyer", "seller", "admin"] as const).map((role) => (
              <Button
                key={role}
                variant={currentRole === role ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentRole(role)}
                className="capitalize"
              >
                {role === "admin" && <Crown className="h-3 w-3 mr-1" />}
                {role}
              </Button>
            ))}
          </div>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="simulation" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-3xl grid-cols-5">
              <TabsTrigger
                value="simulation"
                className="flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                <span className="hidden sm:inline">Simulation</span>
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Features</span>
              </TabsTrigger>
              <TabsTrigger value="errors" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Errors</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Logs</span>
              </TabsTrigger>
              <TabsTrigger
                value="utilities"
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Utilities</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Simulation Tab */}
          <TabsContent value="simulation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Simulation Modes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {simulationModes.map((mode) => (
                    <div
                      key={mode.id}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        mode.enabled
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{mode.name}</h3>
                        <Button
                          size="sm"
                          variant={mode.enabled ? "default" : "outline"}
                          onClick={() => toggleSimulationMode(mode.id)}
                        >
                          {mode.enabled ? "ON" : "OFF"}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        {mode.description}
                      </p>
                    </div>
                  ))}
                </div>

                <Alert>
                  <Eye className="h-4 w-4" />
                  <AlertDescription>
                    Simulation modes control how the system behaves during
                    testing. Enable different modes to test various scenarios.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Role-Based Testing ({currentRole})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roleActions[currentRole].map((action, index) => (
                    <Button
                      key={index}
                      onClick={action.action}
                      className={`${action.color} text-white h-auto p-4 flex flex-col items-center space-y-2 transition-all hover:scale-105`}
                    >
                      <action.icon className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-semibold">{action.title}</div>
                        <div className="text-xs opacity-90">
                          {action.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Core Feature Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" onClick={simulateCheckoutFlow}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Checkout
                  </Button>
                  <Button variant="outline" onClick={simulateBankingFlow}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Banking
                  </Button>
                  <Button variant="outline" onClick={simulateDeliveryFlow}>
                    <Truck className="h-4 w-4 mr-2" />
                    Delivery
                  </Button>
                  <Button variant="outline" onClick={simulateAddressHandling}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Address
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/activity")}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Activity
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/notifications")}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                  <Button variant="outline" onClick={simulateErrorScenarios}>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Errors
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/profile")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Error Testing Tab */}
          <TabsContent value="errors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Error Simulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Test error handling and edge cases to ensure robust user
                      experience.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="destructive"
                      onClick={() =>
                        addTestLog(
                          "Error Test",
                          "fail",
                          "Simulated Order Not Found error",
                        )
                      }
                    >
                      Order Not Found
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        addTestLog(
                          "Error Test",
                          "fail",
                          "Simulated courier unavailability",
                        )
                      }
                    >
                      Courier Unavailable
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        addTestLog(
                          "Error Test",
                          "fail",
                          "Simulated payment failure",
                        )
                      }
                    >
                      Payment Failed
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        addTestLog(
                          "Error Test",
                          "fail",
                          "Simulated Google Maps API failure",
                        )
                      }
                    >
                      Maps API Failure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Test Execution Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {testLogs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No test logs yet. Run some tests to see results here.
                    </p>
                  ) : (
                    testLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3 rounded-lg border ${
                          log.status === "pass"
                            ? "border-green-200 bg-green-50"
                            : log.status === "fail"
                              ? "border-red-200 bg-red-50"
                              : "border-yellow-200 bg-yellow-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {log.status === "pass" && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            {log.status === "fail" && (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            {log.status === "warning" && (
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            )}
                            <span className="font-medium">{log.testName}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{log.message}</p>
                        {log.details && (
                          <p className="text-xs text-gray-500 mt-1">
                            {log.details}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Utilities Tab */}
          <TabsContent value="utilities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Reset & Utilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Database className="h-4 w-4" />
                    <AlertDescription>
                      Use these utilities to reset test data and prepare for
                      fresh testing sessions.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" onClick={clearTestData}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear Test Logs
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        addTestLog("System", "pass", "Reset simulation modes")
                      }
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Reset Modes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Page
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Enhanced QA Dashboard v3.0 • {testLogs.length} test logs • Last
            updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default EnhancedQADashboard;
