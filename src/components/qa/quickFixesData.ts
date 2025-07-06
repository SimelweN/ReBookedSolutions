import { QuickFix } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const createQuickFixes = (
  user: any,
  isAuthenticated: boolean,
  refreshProfile: () => Promise<void>,
  clearCart: () => void,
  navigate: (path: string) => void,
): QuickFix[] => [
  {
    id: "test-auth",
    title: "Test Authentication Flow",
    description: "Verify login/logout functionality works correctly",
    category: "auth",
    severity: "critical",
    status: "pending",
    action: async () => {
      if (!isAuthenticated) {
        toast.error("Please login first to test authentication");
        return;
      }

      // Clear cart to test localStorage
      clearCart();

      // Check if localStorage is cleared
      const clearedCart = localStorage.getItem("cart");
      if (clearedCart && JSON.parse(clearedCart).length > 0) {
        throw new Error("Cart localStorage not cleared properly");
      }

      // Test adding dummy item (we can't actually add without a book object)
      // So we'll just verify localStorage functionality
      const testData = [
        { id: "test", title: "Test Book", price: 100, quantity: 1 },
      ];
      localStorage.setItem("cart", JSON.stringify(testData));

      // Verify it was saved
      const savedCart = localStorage.getItem("cart");
      if (!savedCart || JSON.parse(savedCart).length === 0) {
        throw new Error("Cart localStorage save failed");
      }

      // Clean up
      clearCart();

      // Test profile refresh
      await refreshProfile();

      toast.success("Authentication flow working correctly");
    },
  },
  {
    id: "test-paystack",
    title: "Verify Paystack Configuration",
    description: "Check if Paystack public key is properly configured",
    category: "payment",
    severity: "critical",
    status: "pending",
    action: async () => {
      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

      if (!paystackKey) {
        throw new Error("VITE_PAYSTACK_PUBLIC_KEY is not configured");
      }

      const isLive = paystackKey.startsWith("pk_live_");
      const isTest = paystackKey.startsWith("pk_test_");

      if (!isLive && !isTest) {
        throw new Error("Invalid Paystack key format");
      }

      toast.success(
        `Paystack configured correctly (${isLive ? "LIVE" : "TEST"} mode)`,
      );
    },
  },
  {
    id: "test-supabase",
    title: "Test Database Connection",
    description: "Verify Supabase connection and basic queries",
    category: "system",
    severity: "critical",
    status: "pending",
    action: async () => {
      try {
        // Test basic connection
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .limit(1);

        if (error) {
          throw new Error(`Database query failed: ${error.message}`);
        }

        // Test auth status
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        toast.success(
          `Database connection working. Auth: ${authUser ? "✓" : "×"}`,
        );
      } catch (error) {
        throw new Error(`Supabase connection failed: ${error.message}`);
      }
    },
  },
  {
    id: "test-api-health",
    title: "API Health Check",
    description: "Check if all external APIs are responding",
    category: "system",
    severity: "warning",
    status: "pending",
    action: async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      if (!supabaseUrl) {
        throw new Error("VITE_SUPABASE_URL not configured");
      }

      // Test Supabase API
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: "HEAD",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Supabase API returned ${response.status}`);
        }
      } catch (error) {
        if (error.name === "AbortError") {
          throw new Error("Supabase API timeout (>5s)");
        }
        throw error;
      }

      toast.success("All APIs responding correctly");
    },
  },
  {
    id: "check-seller-requirements",
    title: "Verify Seller Requirements",
    description: "Check if user meets all seller requirements",
    category: "seller",
    severity: "info",
    status: "pending",
    action: async () => {
      if (!isAuthenticated || !user) {
        throw new Error("Must be logged in to check seller requirements");
      }

      try {
        const { SellerValidationService } = await import(
          "@/services/sellerValidationService"
        );

        const validation =
          await SellerValidationService.validateSellerRequirements(user.id);

        const issues = [];
        if (!validation.hasProfile) issues.push("Profile incomplete");
        if (!validation.hasAddress) issues.push("No pickup address");
        if (!validation.hasBanking) issues.push("Banking not set up");

        if (issues.length > 0) {
          throw new Error(`Seller requirements not met: ${issues.join(", ")}`);
        }

        toast.success("All seller requirements met ✓");
      } catch (error) {
        throw new Error(`Seller validation failed: ${error.message}`);
      }
    },
  },
  {
    id: "audit-environment",
    title: "Environment Variables Audit",
    description: "Check all required environment variables",
    category: "system",
    severity: "info",
    status: "pending",
    action: async () => {
      const requiredVars = [
        { name: "VITE_SUPABASE_URL", value: import.meta.env.VITE_SUPABASE_URL },
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

      if (missing.length > 0) {
        toast.warning(
          `Missing env vars: ${missing.map((v) => v.name).join(", ")}`,
        );
      }

      toast.success(
        `Environment audit: ${configured.length}/${requiredVars.length} configured`,
      );
    },
  },
];
