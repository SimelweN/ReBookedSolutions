import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TestTube,
  Database,
  Settings,
  CheckCircle,
  XCircle,
  RefreshCw,
  Activity,
  Server,
  Globe,
  Cpu,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import Layout from "@/components/Layout";
import AdminMobileLayout from "@/components/admin/AdminMobileLayout";
import SentryTester from "@/components/SentryTester";

const DevDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [systemStatus, setSystemStatus] = useState({
    database: false,
    auth: false,
    environment: false,
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    checkSystemStatus();
  }, [user, navigate]);

  const checkSystemStatus = async () => {
    // Check database connection
    try {
      const { error } = await supabase.from("books").select("id").limit(1);
      setSystemStatus((prev) => ({ ...prev, database: !error }));
    } catch {
      setSystemStatus((prev) => ({ ...prev, database: false }));
    }

    // Check auth
    setSystemStatus((prev) => ({ ...prev, auth: !!user }));

    // Check environment
    const hasEnv = !!(
      process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY
    );
    setSystemStatus((prev) => ({ ...prev, environment: hasEnv }));
  };

  const StatusCard = ({
    title,
    status,
    icon: Icon,
  }: {
    title: string;
    status: boolean;
    icon: React.ComponentType<any>;
  }) => (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5" />
          <span className="font-medium">{title}</span>
        </div>
        {status ? (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            OK
          </Badge>
        ) : (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  if (isMobile) {
    return (
      <AdminMobileLayout>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">Development Dashboard</h1>
          <div className="space-y-4">
            <StatusCard
              title="Database"
              status={systemStatus.database}
              icon={Database}
            />
            <StatusCard
              title="Authentication"
              status={systemStatus.auth}
              icon={Shield}
            />
            <StatusCard
              title="Environment"
              status={systemStatus.environment}
              icon={Settings}
            />
          </div>
        </div>
      </AdminMobileLayout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TestTube className="h-8 w-8 text-blue-600" />
              Development Dashboard
            </h1>
            <Button onClick={checkSystemStatus} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
          </div>

          <Alert className="mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Admin Only:</strong> This dashboard provides development
              and debugging tools. Use with caution in production environments.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="status" className="space-y-6">
            <TabsList>
              <TabsTrigger value="status">System Status</TabsTrigger>
              <TabsTrigger value="tools">Testing Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatusCard
                  title="Database Connection"
                  status={systemStatus.database}
                  icon={Database}
                />
                <StatusCard
                  title="Authentication"
                  status={systemStatus.auth}
                  icon={Shield}
                />
                <StatusCard
                  title="Environment Variables"
                  status={systemStatus.environment}
                  icon={Settings}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>User ID:</strong>{" "}
                      {user?.id || "Not authenticated"}
                    </div>
                    <div>
                      <strong>Environment:</strong>{" "}
                      {process.env.NODE_ENV || "development"}
                    </div>
                    <div>
                      <strong>App Version:</strong> 0.0.0
                    </div>
                    <div>
                      <strong>Build Time:</strong> {new Date().toISOString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sentry Error Testing</CardTitle>
                </CardHeader>
                <CardContent>
                  <SentryTester />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => toast.success("Test notification sent!")}
                    className="w-full"
                  >
                    Test Toast Notification
                  </Button>

                  <Button
                    onClick={() => {
                      toast.info("System status checked!");
                      checkSystemStatus();
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Check System Status
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default DevDashboard;
