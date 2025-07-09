import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    const { fromAddress, toAddress, parcel } = await req.json();

    if (!fromAddress || !toAddress) {
      return new Response(
        JSON.stringify({ error: "Missing required address information" }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const parcelData = {
      length: parcel?.length || 20,
      width: parcel?.width || 15,
      height: parcel?.height || 5,
      weight: parcel?.weight || 0.5,
    };

    // Get quotes from multiple providers
    const quotePromises = [
      getQuote("courier-guy", fromAddress, toAddress, parcelData),
      getQuote("fastway", fromAddress, toAddress, parcelData),
    ];

    const results = await Promise.allSettled(quotePromises);

    const allQuotes: any[] = [];
    const providers: string[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value.success) {
        allQuotes.push(...result.value.quotes);
        providers.push(result.value.provider);
      }
    });

    // Add self-collection option
    allQuotes.push({
      service: "Self Collection",
      price: 0,
      currency: "ZAR",
      estimated_days: "Immediate",
      service_code: "SELF",
      provider: "self",
    });

    // Sort by price
    allQuotes.sort((a, b) => a.price - b.price);

    return new Response(
      JSON.stringify({
        success: true,
        quotes: allQuotes,
        providers: [...providers, "self"],
        total_quotes: allQuotes.length,
      }),
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Error in get-delivery-quotes:", error);

    // Return basic fallback quotes
    return new Response(
      JSON.stringify({
        success: true,
        quotes: [
          {
            service: "Self Collection",
            price: 0,
            currency: "ZAR",
            estimated_days: "Immediate",
            service_code: "SELF",
            provider: "self",
          },
          {
            service: "Standard Delivery",
            price: 75.0,
            currency: "ZAR",
            estimated_days: "2-3",
            service_code: "STD",
            provider: "fallback",
          },
        ],
        providers: ["self", "fallback"],
        fallback: true,
        error: error.message,
      }),
      { headers: corsHeaders },
    );
  }
});

async function getQuote(
  provider: string,
  fromAddress: any,
  toAddress: any,
  parcel: any,
) {
  const functionName =
    provider === "courier-guy" ? "courier-guy-quote" : "fastway-quote";

  // Retry logic with exponential backoff
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout for edge function calls

      const response = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/${functionName}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromAddress,
            toAddress,
            parcel,
          }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `${provider} quote failed (${response.status}):`,
          errorText,
        );

        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`${provider} quote failed: ${response.status}`);
        }

        // Retry on server errors (5xx) and other issues
        if (attempt < 3) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(
            `Retrying ${provider} quote in ${delay}ms (attempt ${attempt + 1}/3)`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw new Error(`${provider} quote failed after ${attempt} attempts`);
      }

      const result = await response.json();

      // Log successful quotes for monitoring
      console.log(`${provider} quote successful:`, {
        attempt,
        quotes: result.quotes?.length || 0,
        fallback: result.fallback || false,
      });

      return result;
    } catch (error) {
      if (error.name === "AbortError") {
        console.error(`${provider} quote timeout on attempt ${attempt}`);
      } else {
        console.error(
          `Error getting ${provider} quote (attempt ${attempt}):`,
          error,
        );
      }

      // If this is the last attempt, return failure
      if (attempt === 3) {
        return {
          success: false,
          error: error.message,
          provider,
          attempts: attempt,
        };
      }

      // Wait before retry
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return { success: false, error: "All retry attempts failed" };
}
