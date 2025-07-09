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
  functionName?: string,
): Response {
  const errorId = crypto.randomUUID();
  const errorContext = {
    errorId,
    function: functionName,
    timestamp: new Date().toISOString(),
    message,
    details,
    stack: details?.stack,
  };

  console.error(
    `[ERROR ${status}] ${functionName || "Unknown"}: ${message}`,
    errorContext,
  );

  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      errorId,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === "development" && { details }),
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
    const isNetworkError =
      error.name === "TypeError" && error.message.includes("fetch");
    const isTimeoutError =
      error.name === "AbortError" || error.message.includes("timeout");

    let statusCode = 500;
    let userMessage = "An unexpected error occurred";

    if (isNetworkError) {
      statusCode = 503;
      userMessage = "External service temporarily unavailable";
    } else if (isTimeoutError) {
      statusCode = 504;
      userMessage = "Request timeout - please try again";
    } else if (error instanceof Error) {
      userMessage = error.message;
    }

    return createErrorResponse(
      userMessage,
      statusCode,
      {
        function: functionName,
        stack: error?.stack,
        type: error?.name,
        isNetworkError,
        isTimeoutError,
      },
      functionName,
    );
  };
}
