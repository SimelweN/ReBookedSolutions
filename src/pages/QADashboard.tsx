import * as React from "react";
import Layout from "@/components/Layout";
import QAStatusChecker from "@/components/QAStatusChecker";
import ComprehensiveQATests from "@/components/ComprehensiveQATests";
import LoginDiagnosticPanel from "@/components/LoginDiagnosticPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  ShoppingCart,
  User,
  CreditCard,
  TestTube,
  Activity,
  Zap,
} from "lucide-react";

const QADashboard: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Test Cart & Checkout",
      description: "Add items to cart and test the full checkout flow",
      icon: ShoppingCart,
      action: () => navigate("/"),
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Profile Setup",
      description: "Complete user profile with address and banking",
      icon: User,
      action: () => navigate("/profile"),
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Payment Test",
      description: "Test Paystack integration with small amount",
      icon: CreditCard,
      action: () => navigate("/checkout"),
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Admin Panel",
      description: "Access administrative functions",
      icon: Settings,
      action: () => navigate("/admin"),
      color: "bg-orange-600 hover:bg-orange-700",
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Production QA Dashboard
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive testing and monitoring for all critical ReBooked
            Solutions features
          </p>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="login-fix" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger
                value="login-fix"
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Login Fix</span>
                <span className="sm:hidden">Login</span>
              </TabsTrigger>
              <TabsTrigger
                value="comprehensive"
                className="flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                <span className="hidden sm:inline">Production Tests</span>
                <span className="sm:hidden">Tests</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">System Status</span>
                <span className="sm:hidden">Status</span>
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Quick Actions</span>
                <span className="sm:hidden">Actions</span>
              </TabsTrigger>
            </TabsList>
          </div>
          {/* Login Fix Tab */}
          <TabsContent value="login-fix" className="space-y-6">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-6 w-6 text-red-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Login Issue Diagnostics
                  </h2>
                  <p className="text-gray-600">
                    Debug and fix login problems with automatic checks
                  </p>
                </div>
              </div>
              <div className="text-sm text-red-700 bg-red-100 rounded p-3">
                <strong>Quick Fix:</strong> Run the diagnostic tool below to
                identify configuration issues, network problems, or
                authentication errors preventing login.
              </div>
            </div>

            <LoginDiagnosticPanel />
          </TabsContent>

          {/* Production Tests Tab */}
          <TabsContent value="comprehensive" className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <TestTube className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Comprehensive Production Testing
                  </h2>
                  <p className="text-gray-600">
                    Test all critical features for production readiness
                  </p>
                </div>
              </div>
              <div className="text-sm text-blue-700 bg-blue-100 rounded p-3">
                <strong>Testing Focus Areas:</strong> Authentication & Profile,
                Cart & Checkout, Paystack Integration (LIVE), and Seller
                Onboarding workflows.
              </div>
            </div>

            <ComprehensiveQATests />
          </TabsContent>

          {/* System Status Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="h-6 w-6 text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    System Health & Status
                  </h2>
                  <p className="text-gray-600">
                    Monitor database connectivity, API status, and system
                    performance
                  </p>
                </div>
              </div>
            </div>

            <QAStatusChecker />
          </TabsContent>

          {/* Quick Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="h-6 w-6 text-orange-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Quick Test Actions
                  </h2>
                  <p className="text-gray-600">
                    Navigate directly to key pages for manual testing
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Manual Testing Navigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
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

                {/* Additional Navigation */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Additional Test Pages
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/books")}
                    >
                      Browse Books
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/register")}
                    >
                      Registration
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/login")}
                    >
                      Login Page
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/create-listing")}
                    >
                      Sell Books
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/university-info")}
                    >
                      University Info
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/study-resources")}
                    >
                      Study Resources
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/forgot-password")}
                    >
                      Password Reset
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/contact")}
                    >
                      Contact Form
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            QA Dashboard v2.0 • Last updated: {new Date().toLocaleDateString()}{" "}
            •
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </span>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default QADashboard;
