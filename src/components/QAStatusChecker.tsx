import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

interface QACheck {
  id: string;
  category: string;
  title: string;
  status: "pass" | "fail" | "warning" | "loading";
  message: string;
}

const QAStatusChecker: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { items } = useCart();
  const [checks, setChecks] = useState<QACheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runQAChecks = async () => {
    setIsRunning(true);
    const results: QACheck[] = [];

    // 1. Authentication & Profile Checks
    results.push({
      id: "auth-login",
      category: "Authentication",
      title: "User Login Status",
      status: isAuthenticated ? "pass" : "fail",
      message: isAuthenticated
        ? "User is logged in"
        : "User is not authenticated",
    });

    if (user) {
      // Check profile completeness
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        results.push({
          id: "profile-complete",
          category: "Profile",
          title: "Profile Completeness",
          status: profile?.name && profile?.email ? "pass" : "warning",
          message:
            profile?.name && profile?.email
              ? "Profile has basic information"
              : "Profile missing name or email",
        });

        // Check address setup
        const hasAddress = profile?.shipping_address || profile?.pickup_address;
        results.push({
          id: "address-setup",
          category: "Profile",
          title: "Address Setup",
          status: hasAddress ? "pass" : "fail",
          message: hasAddress ? "Address configured" : "No address configured",
        });

        // Check banking details
        const { data: banking } = await supabase
          .from("banking_details")
          .select("*")
          .eq("user_id", user.id)
          .single();

        results.push({
          id: "banking-setup",
          category: "Seller Setup",
          title: "Banking Details",
          status: banking ? "pass" : "fail",
          message: banking
            ? "Banking details configured"
            : "No banking details",
        });
      } catch (error) {
        results.push({
          id: "profile-error",
          category: "Profile",
          title: "Profile Access",
          status: "fail",
          message: "Could not access profile data",
        });
      }
    }

    // 2. Cart & Checkout Checks
    results.push({
      id: "cart-status",
      category: "Cart",
      title: "Cart Contents",
      status: items.length > 0 ? "pass" : "warning",
      message: `Cart has ${items.length} item${items.length !== 1 ? "s" : ""}`,
    });

    // 3. Paystack Configuration
    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    results.push({
      id: "paystack-config",
      category: "Payment",
      title: "Paystack Configuration",
      status: paystackKey
        ? paystackKey.startsWith("pk_live_")
          ? "pass"
          : "warning"
        : "fail",
      message: paystackKey
        ? paystackKey.startsWith("pk_live_")
          ? "Live Paystack key configured"
          : "Using test Paystack key"
        : "No Paystack key configured",
    });

    // 4. Database Connectivity
    try {
      const { data, error } = await supabase
        .from("books")
        .select("id")
        .limit(1);

      results.push({
        id: "database-access",
        category: "Backend",
        title: "Database Access",
        status: !error ? "pass" : "fail",
        message: !error
          ? "Database accessible"
          : `Database error: ${error.message}`,
      });
    } catch (error) {
      results.push({
        id: "database-access",
        category: "Backend",
        title: "Database Access",
        status: "fail",
        message: "Database connection failed",
      });
    }

    // 5. Google Maps API
    const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    results.push({
      id: "maps-config",
      category: "Integration",
      title: "Google Maps API",
      status: mapsKey ? "pass" : "fail",
      message: mapsKey
        ? "Google Maps API key configured"
        : "No Google Maps API key",
    });

    // 6. Edge Functions (test one)
    try {
      const { data, error } = await supabase.functions.invoke(
        "courier-guy-quote",
        {
          body: { test: true },
        },
      );

      results.push({
        id: "edge-functions",
        category: "Backend",
        title: "Edge Functions",
        status: !error ? "pass" : "warning",
        message: !error
          ? "Edge Functions accessible"
          : "Edge Functions may not be deployed",
      });
    } catch (error) {
      results.push({
        id: "edge-functions",
        category: "Backend",
        title: "Edge Functions",
        status: "warning",
        message: "Edge Functions not accessible (using fallbacks)",
      });
    }

    setChecks(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runQAChecks();
  }, [user, items]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "fail":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "bg-green-100 text-green-800";
      case "fail":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const categories = [...new Set(checks.map((check) => check.category))];
  const passCount = checks.filter((c) => c.status === "pass").length;
  const failCount = checks.filter((c) => c.status === "fail").length;
  const warningCount = checks.filter((c) => c.status === "warning").length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>System Status Check</span>
          <Button onClick={runQAChecks} disabled={isRunning} variant="outline">
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Refresh
          </Button>
        </CardTitle>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-800">
            ✓ {passCount} Passed
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-800">
            ⚠ {warningCount} Warnings
          </Badge>
          <Badge className="bg-red-100 text-red-800">
            ✗ {failCount} Failed
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {categories.map((category) => (
          <div key={category} className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{category}</h3>
            <div className="space-y-2">
              {checks
                .filter((check) => check.category === category)
                .map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <span className="font-medium">{check.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {check.message}
                      </span>
                      <Badge className={getStatusColor(check.status)}>
                        {check.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default QAStatusChecker;
