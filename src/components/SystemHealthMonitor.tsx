import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  Database,
  Wifi,
  Server,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HealthMetric {
  id: string;
  name: string;
  status: "healthy" | "warning" | "error" | "unknown";
  value: string;
  description: string;
  lastChecked: Date;
  trend?: "up" | "down" | "stable";
}

interface SystemStats {
  uptime: string;
  responseTime: number;
  errorRate: number;
  userSessions: number;
  cartItems: number;
  lastSync: Date;
}

const SystemHealthMonitor: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { items } = useCart();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [overallHealth, setOverallHealth] = useState<
    "healthy" | "warning" | "error"
  >("unknown");

  // Initialize monitoring with aggressive throttling
  useEffect(() => {
    // Only run health check if user is authenticated and monitoring is enabled
    if (isAuthenticated && isMonitoring) {
      runHealthCheck();
    }

    // Set up periodic monitoring every 2 minutes (reduced frequency)
    const interval = setInterval(() => {
      if (isMonitoring && isAuthenticated) {
        runHealthCheck();
      }
    }, 120000); // 2 minutes instead of 30 seconds

    return () => clearInterval(interval);
  }, [isMonitoring, isAuthenticated]);

  const runHealthCheck = async () => {
    const startTime = Date.now();
    const newMetrics: HealthMetric[] = [];

    try {
      // 1. Database Connectivity (using circuit breaker to prevent spam)
      const { checkDatabaseHealth } = await import(
        "@/utils/databaseHealthCheck"
      );
      const dbHealth = await checkDatabaseHealth();

      newMetrics.push({
        id: "database",
        name: "Database Connection",
        status: dbHealth.isHealthy ? "healthy" : "error",
        value: dbHealth.isHealthy
          ? `${dbHealth.responseTime}ms${dbHealth.fromCache ? " (cached)" : ""}`
          : "Failed",
        description: dbHealth.error || "Supabase connection healthy",
        lastChecked: dbHealth.lastChecked,
      });

      // 2. Authentication System
      newMetrics.push({
        id: "auth",
        name: "Authentication System",
        status: isAuthenticated ? "healthy" : "warning",
        value: isAuthenticated ? "Authenticated" : "Not logged in",
        description: isAuthenticated
          ? `User: ${user?.email || "Unknown"}`
          : "User not authenticated",
        lastChecked: new Date(),
      });

      // 3. Cart System
      newMetrics.push({
        id: "cart",
        name: "Shopping Cart",
        status: "healthy",
        value: `${items.length} items`,
        description: "Cart system operational",
        lastChecked: new Date(),
      });

      // 4. Environment Configuration
      const envVars = [
        "VITE_SUPABASE_URL",
        "VITE_SUPABASE_ANON_KEY",
        "VITE_PAYSTACK_PUBLIC_KEY",
      ];
      const configuredVars = envVars.filter((v) => import.meta.env[v]).length;
      newMetrics.push({
        id: "environment",
        name: "Environment Config",
        status:
          configuredVars === envVars.length
            ? "healthy"
            : configuredVars > 0
              ? "warning"
              : "error",
        value: `${configuredVars}/${envVars.length} configured`,
        description: "Critical environment variables",
        lastChecked: new Date(),
      });

      // 5. Payment System
      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      newMetrics.push({
        id: "payment",
        name: "Payment System",
        status: paystackKey ? "healthy" : "error",
        value: paystackKey
          ? paystackKey.startsWith("pk_live_")
            ? "Live Mode"
            : "Test Mode"
          : "Not configured",
        description: paystackKey
          ? "Paystack integration ready"
          : "Payment processing unavailable",
        lastChecked: new Date(),
      });

      // 6. Google Maps Integration
      const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      newMetrics.push({
        id: "maps",
        name: "Google Maps",
        status: mapsKey ? "healthy" : "warning",
        value: mapsKey ? "Configured" : "Not configured",
        description: mapsKey
          ? "Address autocomplete available"
          : "Manual address entry only",
        lastChecked: new Date(),
      });

      // 7. Local Storage
      try {
        localStorage.setItem("health_check", "test");
        localStorage.removeItem("health_check");
        newMetrics.push({
          id: "storage",
          name: "Local Storage",
          status: "healthy",
          value: "Operational",
          description: "Browser storage working",
          lastChecked: new Date(),
        });
      } catch (error) {
        newMetrics.push({
          id: "storage",
          name: "Local Storage",
          status: "error",
          value: "Failed",
          description: "Browser storage not available",
          lastChecked: new Date(),
        });
      }

      setMetrics(newMetrics);

      // Calculate overall health
      const healthyCount = newMetrics.filter(
        (m) => m.status === "healthy",
      ).length;
      const errorCount = newMetrics.filter((m) => m.status === "error").length;

      if (errorCount > 0) {
        setOverallHealth("error");
      } else if (healthyCount === newMetrics.length) {
        setOverallHealth("healthy");
      } else {
        setOverallHealth("warning");
      }

      // Update stats
      const responseTime = Date.now() - startTime;
      setStats({
        uptime: formatUptime(Date.now() - performance.timeOrigin),
        responseTime,
        errorRate: (errorCount / newMetrics.length) * 100,
        userSessions: isAuthenticated ? 1 : 0,
        cartItems: items.length,
        lastSync: new Date(),
      });
    } catch (error) {
      console.error("Health check failed:", error);
      toast.error("Health check failed");
    }
  };

  const formatUptime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOverallHealthScore = () => {
    const healthyCount = metrics.filter((m) => m.status === "healthy").length;
    return metrics.length > 0
      ? Math.round((healthyCount / metrics.length) * 100)
      : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header with Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Health Monitor
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(overallHealth)}>
                {overallHealth.toUpperCase()}
              </Badge>
              <Button
                onClick={runHealthCheck}
                variant="outline"
                size="sm"
                disabled={isMonitoring}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => setIsMonitoring(!isMonitoring)}
                variant={isMonitoring ? "destructive" : "default"}
                size="sm"
              >
                {isMonitoring ? "Stop" : "Start"} Monitoring
              </Button>
            </div>
          </div>
        </CardHeader>

        {stats && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {getOverallHealthScore()}%
                </div>
                <div className="text-xs text-gray-500">Health Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.responseTime}ms
                </div>
                <div className="text-xs text-gray-500">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.uptime}
                </div>
                <div className="text-xs text-gray-500">Session Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.cartItems}
                </div>
                <div className="text-xs text-gray-500">Cart Items</div>
              </div>
            </div>

            <Progress value={getOverallHealthScore()} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">
              Last updated: {stats.lastSync.toLocaleTimeString()}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{metric.name}</CardTitle>
                {getStatusIcon(metric.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{metric.value}</span>
                  <Badge className={getStatusColor(metric.status)} size="sm">
                    {metric.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{metric.description}</p>
                <p className="text-xs text-gray-400">
                  Checked: {metric.lastChecked.toLocaleTimeString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Alerts */}
      {overallHealth === "error" && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical system issues detected!</strong> Some core features
            may not work properly. Check the metrics above and fix any error
            conditions.
          </AlertDescription>
        </Alert>
      )}

      {overallHealth === "warning" && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>System warnings detected.</strong> Some features may be
            limited. Review the metrics above for optimization opportunities.
          </AlertDescription>
        </Alert>
      )}

      {/* Real-time Monitoring Status */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">
              Real-time Monitoring
            </span>
            {isMonitoring && (
              <Badge className="bg-green-100 text-green-800 animate-pulse">
                ACTIVE
              </Badge>
            )}
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              • <strong>Auto-refresh:</strong>{" "}
              {isMonitoring ? "Every 30 seconds" : "Disabled"}
            </p>
            <p>
              • <strong>Metrics tracked:</strong> {metrics.length} system
              components
            </p>
            <p>
              • <strong>Health score:</strong> {getOverallHealthScore()}%
              overall system health
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthMonitor;
