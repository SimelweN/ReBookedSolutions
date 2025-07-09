import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const COURIER_GUY_API_KEY = Deno.env.get("COURIER_GUY_API_KEY");
const FASTWAY_API_KEY = Deno.env.get("FASTWAY_API_KEY");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "GET") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    const healthChecks = await Promise.allSettled([
      checkCourierGuyHealth(),
      checkFastwayHealth(),
    ]);

    const results = {
      timestamp: new Date().toISOString(),
      services: {
        "courier-guy":
          healthChecks[0].status === "fulfilled"
            ? healthChecks[0].value
            : { status: "error", error: "Health check failed" },
        fastway:
          healthChecks[1].status === "fulfilled"
            ? healthChecks[1].value
            : { status: "error", error: "Health check failed" },
      },
      overall: "healthy",
    };

    // Determine overall health
    const serviceStatuses = Object.values(results.services);
    const healthyServices = serviceStatuses.filter(
      (s) => s.status === "healthy",
    ).length;
    const totalServices = serviceStatuses.length;

    if (healthyServices === 0) {
      results.overall = "critical";
    } else if (healthyServices < totalServices) {
      results.overall = "degraded";
    }

    return new Response(JSON.stringify(results), {
      status: results.overall === "critical" ? 503 : 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in courier health check:", error);

    return new Response(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        overall: "error",
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

async function checkCourierGuyHealth() {
  if (!COURIER_GUY_API_KEY) {
    return {
      status: "configured",
      configured: false,
      message: "API key not configured",
      response_time: null,
    };
  }

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check

    // Use a minimal health check endpoint if available, otherwise test rates endpoint
    const response = await fetch("https://api.courierguy.co.za/v1/health", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${COURIER_GUY_API_KEY}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        status: "healthy",
        configured: true,
        response_time: responseTime,
        last_check: new Date().toISOString(),
      };
    } else if (response.status === 401) {
      return {
        status: "auth_error",
        configured: true,
        response_time: responseTime,
        message: "Authentication failed - check API key",
        last_check: new Date().toISOString(),
      };
    } else if (response.status === 429) {
      return {
        status: "rate_limited",
        configured: true,
        response_time: responseTime,
        message: "Rate limit exceeded",
        last_check: new Date().toISOString(),
      };
    } else {
      return {
        status: "unhealthy",
        configured: true,
        response_time: responseTime,
        status_code: response.status,
        last_check: new Date().toISOString(),
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;

    if (error.name === "AbortError") {
      return {
        status: "timeout",
        configured: true,
        response_time: responseTime,
        message: "Health check timed out",
        last_check: new Date().toISOString(),
      };
    }

    return {
      status: "error",
      configured: true,
      response_time: responseTime,
      error: error.message,
      last_check: new Date().toISOString(),
    };
  }
}

async function checkFastwayHealth() {
  if (!FASTWAY_API_KEY) {
    return {
      status: "configured",
      configured: false,
      message: "API key not configured",
      response_time: null,
    };
  }

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    // Use a minimal health check endpoint if available
    const response = await fetch("https://sa.api.fastway.org/v3/health", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${FASTWAY_API_KEY}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        status: "healthy",
        configured: true,
        response_time: responseTime,
        last_check: new Date().toISOString(),
      };
    } else if (response.status === 401) {
      return {
        status: "auth_error",
        configured: true,
        response_time: responseTime,
        message: "Authentication failed - check API key",
        last_check: new Date().toISOString(),
      };
    } else if (response.status === 429) {
      return {
        status: "rate_limited",
        configured: true,
        response_time: responseTime,
        message: "Rate limit exceeded",
        last_check: new Date().toISOString(),
      };
    } else {
      return {
        status: "unhealthy",
        configured: true,
        response_time: responseTime,
        status_code: response.status,
        last_check: new Date().toISOString(),
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;

    if (error.name === "AbortError") {
      return {
        status: "timeout",
        configured: true,
        response_time: responseTime,
        message: "Health check timed out",
        last_check: new Date().toISOString(),
      };
    }

    return {
      status: "error",
      configured: true,
      response_time: responseTime,
      error: error.message,
      last_check: new Date().toISOString(),
    };
  }
}
