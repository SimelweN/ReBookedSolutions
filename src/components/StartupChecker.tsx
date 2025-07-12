import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Database,
  CreditCard,
  MapPin,
  Mail,
  Truck,
} from "lucide-react";
import { validateEnvironment, ENV } from "@/config/environment";
import {
  checkDatabaseHealth,
  autoSetupDatabase,
  getDatabaseSetupInstructions,
} from "@/utils/databaseSetup";
import { toast } from "sonner";

interface StartupCheckerProps {
  onComplete: () => void;
}

interface ServiceStatus {
  name: string;
  status: "ok" | "warning" | "error" | "checking";
  message: string;
  icon: React.ComponentType<any>;
  critical: boolean;
  action?: () => void;
}

const StartupChecker: React.FC<StartupCheckerProps> = ({ onComplete }) => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isChecking, setIsChecking] = useState(true);
  const [canProceed, setCanProceed] = useState(false);

  const checkServices = async () => {
    setIsChecking(true);
    const newServices: ServiceStatus[] = [];

    // Check environment variables
    const envValid = validateEnvironment();
    newServices.push({
      name: "Environment Configuration",
      status: envValid ? "ok" : "error",
      message: envValid
        ? "All required variables configured"
        : "Missing required environment variables",
      icon: Database,
      critical: true,
    });

    // Check database connection
    newServices.push({
      name: "Database Connection",
      status: "checking",
      message: "Checking database connection...",
      icon: Database,
      critical: true,
    });

    setServices([...newServices]);

    try {
      const dbHealth = await checkDatabaseHealth();
      const dbIndex = newServices.findIndex(
        (s) => s.name === "Database Connection",
      );

      if (dbHealth.connected && dbHealth.tablesExist) {
        newServices[dbIndex] = {
          ...newServices[dbIndex],
          status: "ok",
          message: "Database connected and configured",
        };
      } else if (dbHealth.connected && !dbHealth.tablesExist) {
        newServices[dbIndex] = {
          ...newServices[dbIndex],
          status: "warning",
          message: "Connected but tables missing - auto-setup available",
          action: async () => {
            toast.loading("Setting up database...");
            const result = await autoSetupDatabase();
            if (result.success) {
              toast.success("Database setup completed!");
              checkServices();
            } else {
              toast.error("Auto-setup failed. Manual setup required.");
              window.open(getDatabaseSetupInstructions(), "_blank");
            }
          },
        };
      } else {
        newServices[dbIndex] = {
          ...newServices[dbIndex],
          status: "error",
          message: dbHealth.errors.join(", ") || "Cannot connect to database",
        };
      }
    } catch (error) {
      const dbIndex = newServices.findIndex(
        (s) => s.name === "Database Connection",
      );
      newServices[dbIndex] = {
        ...newServices[dbIndex],
        status: "error",
        message: "Database connection failed",
      };
    }

    // Check Paystack configuration
    const hasPaystack =
      ENV.VITE_PAYSTACK_PUBLIC_KEY &&
      !ENV.VITE_PAYSTACK_PUBLIC_KEY.includes("demo") &&
      ENV.VITE_PAYSTACK_PUBLIC_KEY.startsWith("pk_");

    newServices.push({
      name: "Payment System (Paystack)",
      status: hasPaystack ? "ok" : "error",
      message: hasPaystack
        ? "Paystack configured"
        : "Paystack keys missing or invalid",
      icon: CreditCard,
      critical: true,
    });

    // Check Google Maps
    const hasMaps =
      ENV.VITE_GOOGLE_MAPS_API_KEY &&
      !ENV.VITE_GOOGLE_MAPS_API_KEY.includes("demo") &&
      ENV.VITE_GOOGLE_MAPS_API_KEY.length > 20;

    newServices.push({
      name: "Google Maps Integration",
      status: hasMaps ? "ok" : "warning",
      message: hasMaps
        ? "Google Maps configured"
        : "Maps API key missing - address features limited",
      icon: MapPin,
      critical: false,
    });

    // Check Email service
    const hasEmail =
      ENV.VITE_SENDER_API &&
      !ENV.VITE_SENDER_API.includes("demo") &&
      ENV.VITE_SENDER_API.length > 10;

    newServices.push({
      name: "Email Service",
      status: hasEmail ? "ok" : "warning",
      message: hasEmail
        ? "Email service configured"
        : "Email API missing - notifications limited",
      icon: Mail,
      critical: false,
    });

    // Check Shipping services
    const hasShipping =
      (ENV.VITE_COURIER_GUY_API_KEY &&
        !ENV.VITE_COURIER_GUY_API_KEY.includes("demo")) ||
      (ENV.VITE_FASTWAY_API_KEY && !ENV.VITE_FASTWAY_API_KEY.includes("demo"));

    newServices.push({
      name: "Shipping Services",
      status: hasShipping ? "ok" : "warning",
      message: hasShipping
        ? "Shipping providers configured"
        : "Shipping APIs missing - delivery quotes limited",
      icon: Truck,
      critical: false,
    });

    setServices(newServices);
    setIsChecking(false);

    // Check if we can proceed (all critical services OK)
    const criticalServices = newServices.filter((s) => s.critical);
    const canStart = criticalServices.every((s) => s.status === "ok");
    setCanProceed(canStart);
  };

  useEffect(() => {
    checkServices();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "checking":
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const criticalIssues = services.filter(
    (s) => s.critical && s.status === "error",
  ).length;
  const warnings = services.filter((s) => s.status === "warning").length;

  if (canProceed && !isChecking) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600">System Ready!</CardTitle>
            <CardDescription>
              All critical services are configured and working.
              {warnings > 0 &&
                ` ${warnings} optional service(s) need attention for full functionality.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onComplete} className="w-full">
              Continue to Application
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">
            Setting Up ReBooked Solutions
          </CardTitle>
          <CardDescription>
            {isChecking
              ? "Checking system configuration..."
              : criticalIssues > 0
                ? "Please complete the required setup steps below"
                : "Almost ready! Optional services can be configured later"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 border rounded-lg"
            >
              <service.icon className="w-6 h-6 text-gray-600" />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">{service.name}</h3>
                  {service.critical && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{service.message}</p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(service.status)}
                {service.action && (
                  <Button size="sm" variant="outline" onClick={service.action}>
                    Fix
                  </Button>
                )}
              </div>
            </div>
          ))}

          <div className="border-t pt-4">
            {criticalIssues > 0 ? (
              <div className="text-center space-y-3">
                <p className="text-sm text-red-600 font-medium">
                  {criticalIssues} critical issue(s) need to be resolved before
                  proceeding
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() =>
                      window.open(
                        "https://github.com/your-repo/setup-guide",
                        "_blank",
                      )
                    }
                    variant="outline"
                    className="w-full"
                  >
                    📖 View Setup Guide
                  </Button>
                  <Button
                    onClick={checkServices}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Re-check Configuration
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Button onClick={onComplete} className="w-full">
                  {warnings > 0
                    ? "Continue with Limited Features"
                    : "Continue to Application"}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  You can configure optional services later in settings
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StartupChecker;
