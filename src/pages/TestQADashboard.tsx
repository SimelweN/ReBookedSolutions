import React from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { TestTube, Activity, CheckCircle } from "lucide-react";

const TestQADashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  console.log("🧪 TestQADashboard loaded successfully");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <TestTube className="h-8 w-8 text-green-600" />
            QA Dashboard - Test Version
          </h1>
          <p className="text-gray-600">
            This is a test version to verify the QA dashboard routing is working
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Route Test - PASSED
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                ✅ Successfully loaded QA Dashboard component
              </p>
              <p className="text-sm text-gray-600 mb-4">
                ✅ React routing is working correctly
              </p>
              <p className="text-sm text-gray-600">
                ✅ Layout and UI components are functioning
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                User Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>User ID:</strong> {user?.id || "Not available"}
                </p>
                <p>
                  <strong>Email:</strong> {user?.email || "Not available"}
                </p>
                <p>
                  <strong>Profile Role:</strong> {profile?.role || "Not set"}
                </p>
                <p>
                  <strong>Authenticated:</strong> {user ? "✅ Yes" : "❌ No"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <div className="space-x-4">
            <Button
              onClick={() => navigate("/qa-advanced")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Try Enhanced QA Dashboard
            </Button>
            <Button onClick={() => navigate("/qa-dashboard")} variant="outline">
              Try Original QA Dashboard
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            If you can see this page, the routing and components are working
            correctly.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default TestQADashboard;
