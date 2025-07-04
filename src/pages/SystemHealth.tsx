import React from "react";
import Layout from "@/components/Layout";
import SystemHealthCheck from "@/components/SystemHealthCheck";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SystemHealth: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              You must be logged in to access system health checks.
            </p>
            <Button onClick={() => navigate("/login")} className="w-full">
              Log In
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(isAdmin ? "/admin" : "/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isAdmin ? "Back to Admin" : "Back to Home"}
          </Button>
          <h1 className="text-3xl font-bold">System Health Check</h1>
          <p className="text-gray-600 mt-2">
            Monitor the health and status of all system components
          </p>
        </div>

        <div className="flex justify-center">
          <SystemHealthCheck />
        </div>
      </div>
    </Layout>
  );
};

export default SystemHealth;
