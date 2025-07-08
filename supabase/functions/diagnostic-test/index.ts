import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  getEnvironmentConfig,
  validateRequiredEnvVars,
} from "../_shared/environment.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Test basic environment setup
    const requiredVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
    const missingVars = validateRequiredEnvVars(requiredVars);

    const diagnostics = {
      timestamp: new Date().toISOString(),
      deno_version: Deno.version.deno,
      typescript_version: Deno.version.typescript,
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      environment_status: {
        required_vars_missing: missingVars,
        supabase_url_set: !!Deno.env.get("SUPABASE_URL"),
        service_key_set: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
        paystack_key_set: !!Deno.env.get("PAYSTACK_SECRET_KEY"),
        courier_guy_key_set: !!Deno.env.get("COURIER_GUY_API_KEY"),
        fastway_key_set: !!Deno.env.get("FASTWAY_API_KEY"),
      },
      crypto_available: typeof crypto !== "undefined",
      web_crypto_available: typeof crypto?.subtle !== "undefined",
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: "Diagnostic function working correctly",
        diagnostics,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
