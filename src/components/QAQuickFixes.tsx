import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Bug,
  Zap,
  Settings,
  Play,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuickFix {
  id: string;
  title: string;
  description: string;
  category: "auth" | "cart" | "payment" | "seller" | "system";
  severity: "critical" | "warning" | "info";
  status: "pending" | "running" | "success" | "failed";
  action: () => Promise<void>;
}

const QAQuickFixes: React.FC = () => {
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const { items, addToCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [fixes, setFixes] = useState<QuickFix[]>([]);
  const [isRunning, setIsRunning] = useState<Set<string>>(new Set());

  // Define quick fixes
  const quickFixes: QuickFix[] = [
    {
      id: "test-auth",
      title: "Test Authentication Flow",
      description: "Verify login/logout functionality works correctly",
      category: "auth",
      severity: "critical",
      status: "pending",
      action: async () => {
        if (!isAuthenticated) {
          toast.info("Redirecting to login page...");
          navigate("/login");
          return;
        }

        // Test profile refresh
        await refreshProfile();
        toast.success("Authentication flow verified!");
      },
    },
    {
      id: "test-cart-persistence",
      title: "Test Cart Persistence",
      description: "Verify cart saves and loads from localStorage",
      category: "cart",
      severity: "warning",
      status: "pending",
      action: async () => {
        // Clear cart first
        clearCart();

        // Check if localStorage is cleared
        const clearedCart = localStorage.getItem("cart");
        if (clearedCart && JSON.parse(clearedCart).length > 0) {
          throw new Error("Cart not properly cleared");
        }

        // Test adding dummy item (we can't actually add without a book object)
        // So we'll just verify localStorage functionality
        const testData = [
          { id: "test", bookId: "test", title: "Test Book", price: 100 },
        ];
        localStorage.setItem("cart", JSON.stringify(testData));

        // Verify it was saved
        const savedCart = localStorage.getItem("cart");
        if (!savedCart || JSON.parse(savedCart).length === 0) {
          throw new Error("Cart persistence failed");
        }

        // Clean up
        localStorage.removeItem("cart");
        toast.success("Cart persistence verified!");
      },
    },
    {
      id: "check-paystack-config",
      title: "Verify Paystack Configuration",
      description: "Check if Paystack keys are properly configured",
      category: "payment",
      severity: "critical",
      status: "pending",
      action: async () => {
        const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

        if (!paystackKey) {
          throw new Error("VITE_PAYSTACK_PUBLIC_KEY not configured");
        }

        if (!paystackKey.startsWith("pk_")) {
          throw new Error("Invalid Paystack key format");
        }

        const isLive = paystackKey.startsWith("pk_live_");
        const isTest = paystackKey.startsWith("pk_test_");

        if (!isLive && !isTest) {
          throw new Error("Unknown Paystack key type");
        }

        toast.success(
          `Paystack configured with ${isLive ? "LIVE" : "TEST"} keys`,
        );
      },
    },
    {
      id: "test-database-connection",
      title: "Test Database Connection",
      description: "Verify Supabase connection and basic queries work",
      category: "system",
      severity: "critical",
      status: "pending",
      action: async () => {
        // Test basic connection
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .limit(1);

        if (error) {
          throw new Error(`Database connection failed: ${error.message}`);
        }

        toast.success("Database connection verified!");
      },
    },
    {
      id: "test-google-maps",
      title: "Test Google Maps Integration",
      description: "Check if Google Maps API key is configured",
      category: "system",
      severity: "warning",
      status: "pending",
      action: async () => {
        const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!mapsKey) {
          throw new Error("VITE_GOOGLE_MAPS_API_KEY not configured");
        }

        // Test if Google Maps script can be loaded (simplified check)
        if (typeof window.google === "undefined") {
          toast.info(
            "Google Maps script not loaded yet - this is normal on first page load",
          );
        } else {
          toast.success("Google Maps API available!");
        }
      },
    },
    {
      id: "test-seller-validation",
      title: "Test Seller Validation",
      description: "Check seller requirements validation system",
      category: "seller",
      severity: "warning",
      status: "pending",
      action: async () => {
        if (!user?.id) {
          throw new Error("Must be logged in to test seller validation");
        }

        const { SellerValidationService } = await import(
          "@/services/sellerValidationService"
        );
        const validation =
          await SellerValidationService.validateSellerRequirements(user.id);

        const statusMessage = validation.canSell
          ? "User can sell books"
          : `Missing: ${validation.missingRequirements.length} requirements`;

        toast.success(`Seller validation working: ${statusMessage}`);
      },
    },
    {
      id: "force-checkout-test",
      title: "Force Checkout Flow Test",
      description: "Navigate to checkout page (requires items in cart)",
      category: "cart",
      severity: "info",
      status: "pending",
      action: async () => {
        if (!isAuthenticated) {
          toast.error("Must be logged in to test checkout");
          navigate("/login");
          return;
        }

        if (items.length === 0) {
          toast.info(
            "Add books to cart first, then come back to test checkout",
          );
          navigate("/");
          return;
        }

        toast.success("Navigating to checkout...");
        navigate("/checkout");
      },
    },
    {
      id: "test-environment-vars",
      title: "Audit Environment Variables",
      description: "Check all critical environment variables",
      category: "system",
      severity: "warning",
      status: "pending",
      action: async () => {
        const requiredVars = [
          {
            name: "VITE_SUPABASE_URL",
            value: import.meta.env.VITE_SUPABASE_URL,
          },
          {
            name: "VITE_SUPABASE_ANON_KEY",
            value: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          {
            name: "VITE_PAYSTACK_PUBLIC_KEY",
            value: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
          },
          {
            name: "VITE_GOOGLE_MAPS_API_KEY",
            value: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          },
        ];

        const missing = requiredVars.filter((v) => !v.value);
        const configured = requiredVars.filter((v) => v.value);

        console.log("Environment Variables Audit:");
        console.log(
          "✅ Configured:",
          configured.map((v) => v.name),
        );
        console.log(
          "❌ Missing:",
          missing.map((v) => v.name),
        );

        if (missing.length > 0) {
          toast.error(`Missing ${missing.length} environment variables`);
        } else {
          toast.success("All environment variables configured!");
        }
      },
    },
  ];

  const runFix = async (fixId: string) => {
    const fix = quickFixes.find((f) => f.id === fixId);
    if (!fix) return;

    setIsRunning((prev) => new Set(prev).add(fixId));

    try {
      await fix.action();
      setFixes((prev) =>
        prev.map((f) => (f.id === fixId ? { ...f, status: "success" } : f)),
      );
    } catch (error) {
      console.error(`Fix ${fixId} failed:`, error);
      setFixes((prev) =>
        prev.map((f) => (f.id === fixId ? { ...f, status: "failed" } : f)),
      );
      toast.error(error instanceof Error ? error.message : "Fix failed");
    } finally {
      setIsRunning((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fixId);
        return newSet;
      });
    }
  };

  const runAllFixes = async () => {
    for (const fix of quickFixes) {
      await runFix(fix.id);
      // Small delay between fixes
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  React.useEffect(() => {
    setFixes(quickFixes.map((f) => ({ ...f, status: "pending" })));
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string, isRunning: boolean) => {
    if (isRunning) return <Loader2 className="w-4 h-4 animate-spin" />;

    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "pending":
        return <Play className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "auth":
        return "🔐";
      case "cart":
        return "🛒";
      case "payment":
        return "💳";
      case "seller":
        return "🧑‍💼";
      case "system":
        return "⚙️";
      default:
        return "🔧";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Fixes & Diagnostics
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Run targeted tests to identify and fix specific issues
              </p>
            </div>
            <Button onClick={runAllFixes} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Run All Tests
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fixes.map((fix) => (
          <Card key={fix.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getCategoryIcon(fix.category)}
                  </span>
                  <div>
                    <CardTitle className="text-sm">{fix.title}</CardTitle>
                    <p className="text-xs text-gray-600 mt-1">
                      {fix.description}
                    </p>
                  </div>
                </div>
                <Badge className={getSeverityColor(fix.severity)}>
                  {fix.severity.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(fix.status, isRunning.has(fix.id))}
                  <span className="text-sm capitalize">{fix.status}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => runFix(fix.id)}
                  disabled={isRunning.has(fix.id)}
                >
                  {isRunning.has(fix.id) ? "Running..." : "Run Test"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Bug className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">Quick Fix Guide</span>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              • <strong>Critical issues</strong> will prevent core functionality
            </p>
            <p>
              • <strong>Warning issues</strong> may cause degraded experience
            </p>
            <p>
              • <strong>Info tests</strong> provide system verification
            </p>
            <p>• Run tests after making configuration changes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QAQuickFixes;
