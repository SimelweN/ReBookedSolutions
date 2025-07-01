import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TableSetupResult {
  table: string;
  status: "exists" | "created" | "failed";
  message: string;
  error?: string;
}

export interface DatabaseSetupSummary {
  totalChecked: number;
  alreadyExists: number;
  created: number;
  failed: number;
  results: TableSetupResult[];
}

/**
 * Check if a table exists in the database
 */
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(tableName).select("*").limit(0);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Create the orders table with the complete schema
 */
async function createOrdersTable(): Promise<TableSetupResult> {
  try {
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        -- Enable necessary extensions
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Create orders table
        CREATE TABLE IF NOT EXISTS public.orders (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            buyer_email text NOT NULL,
            seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            amount integer NOT NULL CHECK (amount > 0), -- Amount in kobo (ZAR cents)
            status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'ready_for_payout', 'paid_out', 'failed', 'cancelled')),
            paystack_ref text UNIQUE NOT NULL,
            payment_data jsonb DEFAULT '{}',
            items jsonb NOT NULL DEFAULT '[]', -- Array of order items
            shipping_address jsonb DEFAULT '{}',
            delivery_data jsonb DEFAULT '{}',
            metadata jsonb DEFAULT '{}',
            paid_at timestamp with time zone,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            updated_at timestamp with time zone DEFAULT now() NOT NULL
        );

        -- Create indexes for performance
        CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
        CREATE INDEX IF NOT EXISTS idx_orders_paystack_ref ON public.orders(paystack_ref);
        CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON public.orders(buyer_email);

        -- Create updated_at trigger function if it doesn't exist
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        -- Add updated_at trigger
        DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
        CREATE TRIGGER update_orders_updated_at
            BEFORE UPDATE ON public.orders
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        -- Set up Row Level Security (RLS)
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

        -- RLS Policies for orders table
        DROP POLICY IF EXISTS "Users can view their own orders as buyer" ON public.orders;
        CREATE POLICY "Users can view their own orders as buyer" ON public.orders
            FOR SELECT USING (
                buyer_email = auth.jwt() ->> 'email' OR
                seller_id = auth.uid()
            );

        DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
        CREATE POLICY "Users can insert their own orders" ON public.orders
            FOR INSERT WITH CHECK (
                auth.uid() IS NOT NULL
            );

        DROP POLICY IF EXISTS "Sellers can update their orders" ON public.orders;
        CREATE POLICY "Sellers can update their orders" ON public.orders
            FOR UPDATE USING (seller_id = auth.uid())
            WITH CHECK (seller_id = auth.uid());

        -- Grant permissions
        GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
      `,
    });

    if (error) {
      console.error("❌ Failed to create orders table:", error);
      return {
        table: "orders",
        status: "failed",
        message: "Failed to create orders table",
        error: error.message,
      };
    }

    return {
      table: "orders",
      status: "created",
      message:
        "Orders table created successfully with indexes and RLS policies",
    };
  } catch (error) {
    console.error("❌ Exception creating orders table:", error);
    return {
      table: "orders",
      status: "failed",
      message: "Exception while creating orders table",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Create the payout_logs table
 */
async function createPayoutLogsTable(): Promise<TableSetupResult> {
  try {
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS public.payout_logs (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
            seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            amount integer NOT NULL CHECK (amount > 0), -- Amount in kobo (ZAR cents)
            commission integer NOT NULL DEFAULT 0 CHECK (commission >= 0), -- Commission taken in kobo
            transfer_code text,
            recipient_code text,
            status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'reversed')),
            reference text,
            paystack_response jsonb DEFAULT '{}',
            error_message text,
            retry_count integer DEFAULT 0,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            updated_at timestamp with time zone DEFAULT now() NOT NULL
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_payout_logs_order_id ON public.payout_logs(order_id);
        CREATE INDEX IF NOT EXISTS idx_payout_logs_seller_id ON public.payout_logs(seller_id);
        CREATE INDEX IF NOT EXISTS idx_payout_logs_status ON public.payout_logs(status);
        CREATE INDEX IF NOT EXISTS idx_payout_logs_created_at ON public.payout_logs(created_at DESC);

        -- Add updated_at trigger
        DROP TRIGGER IF EXISTS update_payout_logs_updated_at ON public.payout_logs;
        CREATE TRIGGER update_payout_logs_updated_at
            BEFORE UPDATE ON public.payout_logs
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        -- Set up Row Level Security (RLS)
        ALTER TABLE public.payout_logs ENABLE ROW LEVEL SECURITY;

        -- RLS Policies
        DROP POLICY IF EXISTS "Sellers can view their own payout logs" ON public.payout_logs;
        CREATE POLICY "Sellers can view their own payout logs" ON public.payout_logs
            FOR SELECT USING (seller_id = auth.uid());

        DROP POLICY IF EXISTS "System can insert payout logs" ON public.payout_logs;
        CREATE POLICY "System can insert payout logs" ON public.payout_logs
            FOR INSERT WITH CHECK (true);

        DROP POLICY IF EXISTS "System can update payout logs" ON public.payout_logs;
        CREATE POLICY "System can update payout logs" ON public.payout_logs
            FOR UPDATE USING (true);

        -- Grant permissions
        GRANT SELECT, INSERT, UPDATE ON public.payout_logs TO authenticated;
      `,
    });

    if (error) {
      return {
        table: "payout_logs",
        status: "failed",
        message: "Failed to create payout_logs table",
        error: error.message,
      };
    }

    return {
      table: "payout_logs",
      status: "created",
      message: "Payout logs table created successfully",
    };
  } catch (error) {
    return {
      table: "payout_logs",
      status: "failed",
      message: "Exception while creating payout_logs table",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Create helpful views for reporting
 */
async function createSellerEarningsView(): Promise<TableSetupResult> {
  try {
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE OR REPLACE VIEW public.seller_earnings_summary AS
        SELECT
            o.seller_id,
            p.name as seller_name,
            p.email as seller_email,
            COUNT(o.id) as total_orders,
            SUM(CASE WHEN o.status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
            SUM(CASE WHEN o.status = 'ready_for_payout' THEN 1 ELSE 0 END) as ready_orders,
            SUM(CASE WHEN o.status = 'paid_out' THEN 1 ELSE 0 END) as completed_orders,
            SUM(o.amount) as gross_earnings, -- in kobo
            SUM(CASE WHEN o.status IN ('paid', 'ready_for_payout', 'paid_out')
                     THEN ROUND(o.amount * 0.9) ELSE 0 END) as net_earnings, -- 90% after 10% commission
            SUM(CASE WHEN o.status = 'paid_out'
                     THEN ROUND(o.amount * 0.9) ELSE 0 END) as paid_earnings,
            SUM(CASE WHEN o.status IN ('paid', 'ready_for_payout')
                     THEN ROUND(o.amount * 0.9) ELSE 0 END) as pending_earnings
        FROM public.orders o
        JOIN public.profiles p ON p.id = o.seller_id
        WHERE o.status != 'failed' AND o.status != 'cancelled'
        GROUP BY o.seller_id, p.name, p.email;

        -- Grant permissions
        GRANT SELECT ON public.seller_earnings_summary TO authenticated;
      `,
    });

    if (error) {
      return {
        table: "seller_earnings_summary",
        status: "failed",
        message: "Failed to create seller earnings view",
        error: error.message,
      };
    }

    return {
      table: "seller_earnings_summary",
      status: "created",
      message: "Seller earnings summary view created successfully",
    };
  } catch (error) {
    return {
      table: "seller_earnings_summary",
      status: "failed",
      message: "Exception while creating seller earnings view",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Main function to setup all missing database tables
 */
export async function setupDatabaseTables(
  progressCallback?: (message: string) => void,
): Promise<DatabaseSetupSummary> {
  const results: TableSetupResult[] = [];

  const tables = [
    { name: "orders", createFn: createOrdersTable },
    { name: "payout_logs", createFn: createPayoutLogsTable },
    { name: "core_tables", createFn: createSellerEarningsView },
  ];

  progressCallback?.("🔍 Checking database tables...");

  for (const table of tables) {
    try {
      progressCallback?.(`📋 Checking ${table.name} table...`);

      const exists = await tableExists(table.name);

      if (exists) {
        results.push({
          table: table.name,
          status: "exists",
          message: `${table.name} table already exists`,
        });
        continue;
      }

      progressCallback?.(`🔨 Creating ${table.name} table...`);
      const result = await table.createFn();
      results.push(result);

      if (result.status === "created") {
        progressCallback?.(`✅ ${table.name} table created successfully`);
      } else {
        progressCallback?.(`❌ Failed to create ${table.name} table`);
      }
    } catch (error) {
      const errorResult: TableSetupResult = {
        table: table.name,
        status: "failed",
        message: `Exception checking/creating ${table.name}`,
        error: error instanceof Error ? error.message : String(error),
      };
      results.push(errorResult);
      progressCallback?.(`❌ Error with ${table.name}: ${errorResult.error}`);
    }
  }

  const summary: DatabaseSetupSummary = {
    totalChecked: results.length,
    alreadyExists: results.filter((r) => r.status === "exists").length,
    created: results.filter((r) => r.status === "created").length,
    failed: results.filter((r) => r.status === "failed").length,
    results,
  };

  // Show summary toast
  if (summary.failed > 0) {
    toast.error(
      `Database setup completed with ${summary.failed} failures. Check console for details.`,
    );
  } else if (summary.created > 0) {
    toast.success(
      `Database setup completed! Created ${summary.created} tables/views.`,
    );
  } else {
    toast.info("All database tables already exist.");
  }

  return summary;
}

/**
 * Quick check to see if orders table exists
 */
export async function checkOrdersTableExists(): Promise<boolean> {
  return await tableExists("orders");
}
