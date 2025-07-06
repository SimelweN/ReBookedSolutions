import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Play,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TableCheck {
  name: string;
  exists: boolean;
  error?: string;
}

const DatabaseMigrationChecker = () => {
  const [tableChecks, setTableChecks] = useState<TableCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const requiredTables = [
    "profiles",
    "books",
    "orders",
    "banking_details",
    "payout_logs",
    "study_resources",
    "universities",
    "programs",
  ];

  const checkTables = async () => {
    setIsChecking(true);
    const results: TableCheck[] = [];

    try {
      for (const tableName of requiredTables) {
        try {
          // Try to query the table with limit 0 to check existence
          const { error } = await supabase.from(tableName).select("*").limit(0);

          results.push({
            name: tableName,
            exists: !error,
            error: error?.message || undefined,
          });
        } catch (error) {
          results.push({
            name: tableName,
            exists: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      setTableChecks(results);
      setLastChecked(new Date());

      const missingTables = results.filter((t) => !t.exists);
      if (missingTables.length === 0) {
        toast.success("All required tables exist!");
      } else {
        toast.warning(`${missingTables.length} tables are missing`);
      }
    } catch (error) {
      console.error("Table check failed:", error);
      toast.error("Failed to check database tables");
    } finally {
      setIsChecking(false);
    }
  };

  const createOrdersTable = async () => {
    try {
      toast.info("Creating orders table...");

      // Run the orders table creation SQL with comprehensive error handling
      const { error } = await supabase.rpc("exec_sql", {
        sql: `
          -- Create orders table for comprehensive order management
          CREATE TABLE IF NOT EXISTS public.orders (
              id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
              buyer_email text NOT NULL,
              seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
              amount integer NOT NULL, -- in kobo/cents
              status text NOT NULL CHECK (status IN ('pending', 'paid', 'ready_for_payout', 'paid_out', 'failed')) DEFAULT 'pending',
              paystack_ref text UNIQUE NOT NULL,
              items jsonb NOT NULL DEFAULT '[]'::jsonb,
              shipping_address jsonb DEFAULT '{}'::jsonb,
              metadata jsonb DEFAULT '{}'::jsonb,
              payment_data jsonb DEFAULT '{}'::jsonb,
              paid_at timestamp with time zone,
              created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
              updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
          );

          -- Create indexes for performance
          CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
          CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
          CREATE INDEX IF NOT EXISTS idx_orders_paystack_ref ON public.orders(paystack_ref);
          CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON public.orders(buyer_email);

          -- Enable RLS
          ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

          -- Create RLS policies
          DROP POLICY IF EXISTS "Users can view their own orders as buyer" ON public.orders;
          CREATE POLICY "Users can view their own orders as buyer" ON public.orders
              FOR SELECT USING (
                  buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
                  OR seller_id = auth.uid()
              );

          DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
          CREATE POLICY "Users can insert their own orders" ON public.orders
              FOR INSERT WITH CHECK (
                  buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
              );

          DROP POLICY IF EXISTS "Sellers can update their orders" ON public.orders;
          CREATE POLICY "Sellers can update their orders" ON public.orders
              FOR UPDATE USING (seller_id = auth.uid())
              WITH CHECK (seller_id = auth.uid());
        `,
      });

      if (error) {
        console.error("Error creating orders table:", error);

        // Enhanced error handling for specific SQL errors
        if (error.code === "42501") {
          throw new Error(
            "Insufficient permissions to create database tables. Please contact an administrator.",
          );
        } else if (error.code === "42P01") {
          throw new Error(
            "Required database functions not available. Please run database migrations.",
          );
        } else if (error.message?.includes("already exists")) {
          console.log("Orders table already exists");
          toast.success("Orders table already exists!");
          return;
        } else if (error.message?.includes("permission denied")) {
          throw new Error(
            "Permission denied. Admin privileges required to create tables.",
          );
        }

        throw error;
      }

      toast.success("Orders table created successfully!");
      // Recheck tables
      await checkTables();
    } catch (error) {
      console.error("Failed to create orders table:", error);
      toast.error(
        "Failed to create orders table. You may need admin privileges.",
      );
    }
  };

  const getStatusIcon = (exists: boolean, error?: string) => {
    if (exists) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    if (error?.includes("permission")) {
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusColor = (exists: boolean, error?: string) => {
    if (exists) {
      return "border-green-200 bg-green-50";
    }
    if (error?.includes("permission")) {
      return "border-yellow-200 bg-yellow-50";
    }
    return "border-red-200 bg-red-50";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>Database Migration Checker</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            This tool checks if all required database tables exist. If the
            orders table is missing, it can help create it.
          </AlertDescription>
        </Alert>

        <div className="flex space-x-2">
          <Button onClick={checkTables} disabled={isChecking} variant="outline">
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isChecking ? "animate-spin" : ""}`}
            />
            {isChecking ? "Checking..." : "Check Tables"}
          </Button>

          {tableChecks.some((t) => t.name === "orders" && !t.exists) && (
            <Button
              onClick={createOrdersTable}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Create Orders Table
            </Button>
          )}
        </div>

        {tableChecks.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Table Status</h4>
            {tableChecks.map((table) => (
              <div
                key={table.name}
                className={`p-3 rounded-lg border ${getStatusColor(table.exists, table.error)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(table.exists, table.error)}
                    <span className="font-medium">{table.name}</span>
                  </div>
                  <Badge variant="outline">
                    {table.exists ? "EXISTS" : "MISSING"}
                  </Badge>
                </div>
                {table.error && (
                  <p className="text-xs mt-1 opacity-75">{table.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {lastChecked && (
          <p className="text-xs text-gray-500 text-center">
            Last checked: {lastChecked.toLocaleString()}
          </p>
        )}

        <div className="bg-gray-50 p-3 rounded-lg text-sm">
          <h4 className="font-medium mb-2">Missing Orders Table?</h4>
          <p className="text-gray-600 mb-2">
            If the orders table is missing, you can try creating it with the
            button above. Alternatively, run the database migrations manually:
          </p>
          <code className="bg-white p-2 rounded text-xs block">
            supabase db reset --linked
          </code>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseMigrationChecker;
