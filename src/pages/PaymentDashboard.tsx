import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import PaymentStatus from "@/components/checkout/PaymentStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  ShoppingBag,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

const PaymentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const handleTestPayment = async () => {
    if (import.meta.env.DEV) {
      try {
        // Import and run payment system test
        const { PaymentTester } = await import("@/utils/paymentTester");
        const result = await PaymentTester.testPaymentSystem();

        if (result.configured && result.databaseConnected) {
          toast.success("Payment system is working correctly!");
        } else {
          toast.error(
            "Payment system has configuration issues. Check console for details.",
          );
        }
      } catch (error) {
        toast.error("Failed to test payment system");
        console.error(error);
      }
    } else {
      toast.info("Payment testing is only available in development mode");
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Authentication Required
              </h2>
              <p className="text-gray-600">
                Please log in to view your payment dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your transactions and payment settings
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Payment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Spent
                      </p>
                      <p className="text-2xl font-bold">R0.00</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Books Purchased
                      </p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <ShoppingBag className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Pending Payments
                      </p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Completed
                      </p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Payments */}
            <PaymentStatus showRecent={true} maxTransactions={5} />

            {/* Development Tools */}
            {import.meta.env.DEV && (
              <Card>
                <CardHeader>
                  <CardTitle>Development Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button onClick={handleTestPayment} variant="outline">
                      Test Payment System
                    </Button>
                    <Button
                      onClick={() => {
                        // Open browser console and run payment test
                        console.log(
                          "Run PaymentTester.testPaymentSystem() in console for detailed tests",
                        );
                        toast.info(
                          "Check browser console for payment testing commands",
                        );
                      }}
                      variant="outline"
                    >
                      Open Console Tests
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentStatus showRecent={false} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales & Earnings</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sales Dashboard
                </h3>
                <p className="text-gray-600 mb-4">
                  Track your book sales and earnings here.
                </p>
                <Badge variant="secondary">Coming Soon</Badge>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Payment Methods</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Manage your payment methods and preferences.
                  </p>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Banking Details</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Configure your banking details for receiving payments from
                    book sales.
                  </p>
                  <Button variant="outline" size="sm">
                    Manage Banking Details
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Notification Preferences</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Choose how you want to be notified about payments and
                    transactions.
                  </p>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PaymentDashboard;
