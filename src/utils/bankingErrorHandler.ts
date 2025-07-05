/**
 * Utility for handling banking_subaccounts database errors gracefully
 */

interface BankingQueryError {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}

export const isBankingTableMissingError = (
  error: BankingQueryError,
): boolean => {
  if (!error?.message) return false;

  return (
    error.message.includes('relation "banking_subaccounts" does not exist') ||
    error.message.includes(
      "column banking_subaccounts.user_id does not exist",
    ) ||
    error.message.includes('table "banking_subaccounts" does not exist')
  );
};

export const logBankingError = (context: string, error: unknown): void => {
  try {
    if (error && typeof error === "object") {
      const errorObj = error as BankingQueryError;

      // Create a proper error structure
      const errorDetails = {
        message: errorObj.message || "No message",
        code: errorObj.code || "No code",
        details: errorObj.details || "No details",
        hint: errorObj.hint || "No hint",
        type: typeof error,
      };

      // Log with structured format - use JSON.stringify to avoid [object Object]
      console.error(`${context}:`, JSON.stringify(errorDetails, null, 2));

      // Also log the raw error for debugging if structured logging fails
      console.error(`${context} (raw):`, JSON.stringify(error, null, 2));
    } else {
      console.error(
        `${context}:`,
        JSON.stringify(
          {
            error: String(error),
            type: typeof error,
          },
          null,
          2,
        ),
      );
    }
  } catch (loggingError) {
    // Fallback if logging itself fails
    console.error(`${context} (logging failed):`, {
      originalError: String(error),
      loggingError: String(loggingError),
    });
  }
};

export const handleBankingQueryError = (
  context: string,
  error: unknown,
): { shouldFallback: boolean; errorMessage?: string } => {
  logBankingError(context, error);

  if (error && typeof error === "object") {
    const errorObj = error as BankingQueryError;

    if (isBankingTableMissingError(errorObj)) {
      console.warn(
        `${context}: Banking table/column missing - falling back to no banking setup`,
      );
      return {
        shouldFallback: true,
        errorMessage:
          "Banking setup not available - please contact support if needed",
      };
    }
  }

  return { shouldFallback: false };
};

/**
 * Enhanced error logging that properly displays error objects
 */
export const logEnhancedError = (context: string, error: unknown): void => {
  try {
    if (error instanceof Error) {
      console.error(
        `${context}:`,
        JSON.stringify(
          {
            message: error.message,
            stack: error.stack,
            cause: error.cause,
            name: error.name,
          },
          null,
          2,
        ),
      );
    } else if (error && typeof error === "object") {
      console.error(
        `${context}:`,
        JSON.stringify(
          {
            type: "Object",
            stringified: JSON.stringify(error, null, 2),
            keys: Object.keys(error),
          },
          null,
          2,
        ),
      );
    } else {
      console.error(
        `${context}:`,
        JSON.stringify(
          {
            type: typeof error,
            value: error,
            stringified: String(error),
          },
          null,
          2,
        ),
      );
    }
  } catch (loggingError) {
    console.error(`${context} (logging failed):`, {
      originalError: String(error),
      loggingError: String(loggingError),
    });
  }
};
