import React from "react";
import Layout from "@/components/Layout";
import QAStatusChecker from "@/components/QAStatusChecker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Settings, ShoppingCart, User, CreditCard } from "lucide-react";

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
      description: "Access admin dashboard for order management",
      icon: Settings,
      action: () => navigate("/admin"),
      color: "bg-orange-600 hover:bg-orange-700",
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            QA Dashboard
          </h1>
          <p className="text-gray-600">
            Comprehensive system status and testing tools for ReBooked Solutions
          </p>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Test Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} text-white h-auto p-4 flex flex-col items-center space-y-2`}
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

        {/* System Status */}
        <QAStatusChecker />

        {/* Critical Issues Alert */}
        <Card className="mt-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">
              Critical QA Items to Address
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-700">
            <div className="space-y-2 text-sm">
              <p>• Ensure Paystack is in LIVE mode with real keys</p>
              <p>• Verify all Edge Functions are deployed</p>
              <p>• Test end-to-end seller onboarding flow</p>
              <p>• Verify 48-hour timeout automation works</p>
              <p>
                • Test email notifications from noreply@rebookedsolutions.co.za
              </p>
              <p>• Validate courier API integrations (Fastway & Courier Guy)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default QADashboard;
