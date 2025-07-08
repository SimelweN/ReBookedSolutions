export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

export function createErrorResponse(
  message: string,
  status: number = 500,
  details?: any,
): Response {
  console.error(`[ERROR ${status}] ${message}`, details);
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

export function createSuccessResponse(
  data: any,
  status: number = 200,
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

export function handleOptionsRequest(): Response {
  return new Response("ok", { headers: corsHeaders });
}

export function createGenericErrorHandler(functionName: string) {
  return (error: any): Response => {
    console.error(`[${functionName}] Unhandled error:`, error);
    return createErrorResponse(
      error instanceof Error ? error.message : "An unexpected error occurred",
      500,
      { function: functionName, stack: error?.stack },
    );
  };
}
