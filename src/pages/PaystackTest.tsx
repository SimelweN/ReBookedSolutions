import React from "react";
import Layout from "@/components/Layout";
import PaystackDashboard from "@/components/PaystackDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PaystackTest: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/qa")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to QA Dashboard
          </Button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Paystack Payment Testing
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive testing suite for Paystack payment integration
              </p>
            </div>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-800">
                Test Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-blue-700">
                Use test amounts like R10, R100, R500 to simulate different
                payment scenarios
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-800">
                Cart Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-green-700">
                Add books to your cart and test the full checkout flow with real
                delivery quotes
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-orange-800">
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-orange-700">
                Verify your Paystack keys and webhook configuration are working
                correctly
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <PaystackDashboard />

        {/* Additional Testing Info */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Testing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-green-800">
                    ✅ What to Test
                  </h4>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>• Payment popup opens correctly</li>
                    <li>• Different payment amounts work</li>
                    <li>• Payment success callbacks trigger</li>
                    <li>• Cart checkout flow completes</li>
                    <li>• Order creation in database</li>
                    <li>• Email notifications (if configured)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-blue-800">
                    🔧 Test Card Numbers
                  </h4>
                  <div className="text-sm space-y-1 text-gray-700">
                    <div className="font-mono bg-gray-100 p-2 rounded">
                      <div>Success: 4084 0840 8408 4081</div>
                      <div>Decline: 4000 0000 0000 0002</div>
                      <div>CVV: Any 3 digits</div>
                      <div>Expiry: Any future date</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  ⚠️ Important Notes
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Test mode payments don't charge real money</li>
                  <li>• Switch to live keys for production</li>
                  <li>• Webhook URLs must be publicly accessible</li>
                  <li>• Test all payment flows before going live</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PaystackTest;
