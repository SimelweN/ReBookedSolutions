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
  if (error && typeof error === "object") {
    const errorObj = error as BankingQueryError;
    console.error(`${context}:`, {
      message: errorObj.message,
      code: errorObj.code,
      details: errorObj.details,
      hint: errorObj.hint,
      type: typeof error,
    });
  } else {
    console.error(`${context}:`, {
      error: String(error),
      type: typeof error,
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
      console.error(`${context}:`, {
        message: error.message,
        stack: error.stack,
        cause: error.cause,
        name: error.name,
      });
    } else if (error && typeof error === "object") {
      console.error(`${context}:`, {
        type: "Object",
        value: error,
        stringified: JSON.stringify(error, null, 2),
        keys: Object.keys(error),
      });
    } else {
      console.error(`${context}:`, {
        type: typeof error,
        value: error,
        stringified: String(error),
      });
    }
  } catch (loggingError) {
    console.error(`${context} (logging failed):`, {
      originalError: error,
      loggingError,
    });
  }
};
