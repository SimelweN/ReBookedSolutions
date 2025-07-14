import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Activity,
  Database,
  Server,
  Mail,
  Search,
  FileText,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { BackendOrchestrator } from "@/services/comprehensive/backendOrchestrator";

interface ServiceStatus {
  name: string;
  key: string;
  icon: React.ReactNode;
  status: boolean;
  description: string;
}

const BackendStatus = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "Study Resources",
      key: "studyResources",
      icon: <FileText className="h-4 w-4" />,
      status: false,
      description: "Study materials and resources management",
    },
    {
      name: "Real-time Notifications",
      key: "notifications",
      icon: <MessageSquare className="h-4 w-4" />,
      status: false,
      description: "Live notification delivery system",
    },
    {
      name: "File Upload",
      key: "fileUpload",
      icon: <Server className="h-4 w-4" />,
      status: false,
      description: "File upload and storage management",
    },
    {
      name: "Advanced Search",
      key: "search",
      icon: <Search className="h-4 w-4" />,
      status: false,
      description: "Enhanced search with filtering",
    },
    {
      name: "Analytics & Reporting",
      key: "analytics",
      icon: <BarChart3 className="h-4 w-4" />,
      status: false,
      description: "Business intelligence and metrics",
    },
    {
      name: "Email Automation",
      key: "email",
      icon: <Mail className="h-4 w-4" />,
      status: false,
      description: "Automated email workflows",
    },
    {
      name: "Dispute Resolution",
      key: "disputes",
      icon: <Activity className="h-4 w-4" />,
      status: false,
      description: "Payment dispute management",
    },
  ]);

  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkServices = async () => {
    setIsChecking(true);

    try {
      const healthStatus = await BackendOrchestrator.healthCheck();

      setServices((prev) =>
        prev.map((service) => ({
          ...service,
          status: healthStatus[service.key] || false,
        })),
      );

      setLastChecked(new Date());
    } catch (error) {
      console.error("Health check failed:", error);
      // Set all services to false on error
      setServices((prev) =>
        prev.map((service) => ({
          ...service,
          status: false,
        })),
      );
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkServices();
  }, []);

  const healthyServices = services.filter((s) => s.status).length;
  const totalServices = services.length;
  const overallHealth = healthyServices / totalServices;

  const getHealthColor = () => {
    if (overallHealth >= 0.8) return "text-green-600";
    if (overallHealth >= 0.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthStatus = () => {
    if (overallHealth >= 0.8) return "Healthy";
    if (overallHealth >= 0.5) return "Degraded";
    return "Critical";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backend Services Status
            </CardTitle>
            <CardDescription>
              Monitor the health of all backend Edge Functions and services
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkServices}
            disabled={isChecking}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Health Summary */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {overallHealth >= 0.8 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className={`font-semibold ${getHealthColor()}`}>
                System Status: {getHealthStatus()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getHealthColor()}>
              {healthyServices}/{totalServices} Services Online
            </Badge>
            {lastChecked && (
              <span className="text-xs text-gray-500">
                Last checked: {lastChecked.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Service Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <div
              key={service.key}
              className={`p-4 border rounded-lg transition-colors ${
                service.status
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {service.icon}
                  <span className="font-medium">{service.name}</span>
                </div>
                {service.status ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {service.description}
              </p>
              <Badge
                variant={service.status ? "outline" : "destructive"}
                className={
                  service.status ? "text-green-600 border-green-600" : ""
                }
              >
                {service.status ? "Online" : "Offline"}
              </Badge>
            </div>
          ))}
        </div>

        {/* Status Information */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">
            📋 Service Details:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <strong>Study Resources:</strong> Manages study materials, notes,
              and past papers
            </div>
            <div>
              <strong>Notifications:</strong> Real-time notification delivery
              system
            </div>
            <div>
              <strong>File Upload:</strong> Secure file upload and image
              processing
            </div>
            <div>
              <strong>Advanced Search:</strong> Enhanced search with faceted
              filtering
            </div>
            <div>
              <strong>Analytics:</strong> Business intelligence and reporting
            </div>
            <div>
              <strong>Email Automation:</strong> Template-based email workflows
            </div>
            <div>
              <strong>Dispute Resolution:</strong> Payment dispute management
              system
            </div>
          </div>
        </div>

        {healthyServices < totalServices && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">
              ⚠️ Action Required:
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Check that all Edge Functions are deployed in Supabase</li>
              <li>• Verify environment variables are set correctly</li>
              <li>• Review function logs for any errors</li>
              <li>• Ensure database migrations have been applied</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BackendStatus;
