// Comprehensive database error handling utility for Supabase operations

import { PostgrestError } from "@supabase/supabase-js";
import { toast } from "sonner";

export interface DatabaseError {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
}

export interface DatabaseErrorResult {
  userMessage: string;
  shouldLog: boolean;
  shouldNotify: boolean;
  severity: "low" | "medium" | "high" | "critical";
  canRetry: boolean;
}

// Common PostgreSQL error codes and their meanings
export const POSTGRES_ERROR_CODES = {
  // Connection errors
  "08000": "connection_exception",
  "08003": "connection_does_not_exist",
  "08006": "connection_failure",

  // Authentication errors
  "28000": "invalid_authorization_specification",
  "28P01": "invalid_password",

  // Syntax errors
  "42601": "syntax_error",
  "42701": "duplicate_column",
  "42702": "ambiguous_column",
  "42703": "undefined_column",
  "42P01": "undefined_table",
  "42P02": "undefined_parameter",

  // Constraint violations
  "23000": "integrity_constraint_violation",
  "23001": "restrict_violation",
  "23502": "not_null_violation",
  "23503": "foreign_key_violation",
  "23505": "unique_violation",
  "23514": "check_violation",

  // Permissions
  "42501": "insufficient_privilege",

  // Data exceptions
  "22001": "string_data_right_truncation",
  "22003": "numeric_value_out_of_range",
  "22008": "datetime_field_overflow",
  "22012": "division_by_zero",

  // Row-level security
  PGRST116: "no_rows_returned",
  PGRST301: "rls_policy_violation",
} as const;

// Enhanced error classification for database operations
export const classifyDatabaseError = (
  error: DatabaseError | PostgrestError | any,
): DatabaseErrorResult => {
  const errorCode = error?.code || error?.error_code;
  const errorMessage = error?.message || String(error);
  const details = error?.details || error?.hint;

  // Handle Supabase-specific errors first
  if (errorCode === "PGRST116") {
    return {
      userMessage: "No records found matching your request.",
      shouldLog: false,
      shouldNotify: false,
      severity: "low",
      canRetry: false,
    };
  }

  if (errorCode === "PGRST301") {
    return {
      userMessage: "You do not have permission to access this data.",
      shouldLog: true,
      shouldNotify: true,
      severity: "medium",
      canRetry: false,
    };
  }

  // Handle PostgreSQL error codes
  switch (errorCode) {
    // Connection errors - often temporary
    case "08000":
    case "08003":
    case "08006":
      return {
        userMessage: "Database connection error. Please try again in a moment.",
        shouldLog: true,
        shouldNotify: true,
        severity: "high",
        canRetry: true,
      };

    // Authentication errors
    case "28000":
    case "28P01":
      return {
        userMessage: "Authentication failed. Please log in again.",
        shouldLog: true,
        shouldNotify: true,
        severity: "high",
        canRetry: false,
      };

    // Table/column not found
    case "42P01":
      return {
        userMessage: "Database table not found. Please contact support.",
        shouldLog: true,
        shouldNotify: true,
        severity: "critical",
        canRetry: false,
      };

    case "42703":
      return {
        userMessage: "Database structure error. Please contact support.",
        shouldLog: true,
        shouldNotify: true,
        severity: "critical",
        canRetry: false,
      };

    // Constraint violations
    case "23502":
      return {
        userMessage:
          "Required field is missing. Please fill in all required information.",
        shouldLog: false,
        shouldNotify: true,
        severity: "low",
        canRetry: true,
      };

    case "23503":
      return {
        userMessage:
          "Referenced record not found. Please refresh and try again.",
        shouldLog: true,
        shouldNotify: true,
        severity: "medium",
        canRetry: true,
      };

    case "23505":
      if (errorMessage.includes("email")) {
        return {
          userMessage: "This email address is already registered.",
          shouldLog: false,
          shouldNotify: true,
          severity: "low",
          canRetry: false,
        };
      } else if (
        errorMessage.includes("title") ||
        errorMessage.includes("book")
      ) {
        return {
          userMessage:
            "A similar book listing already exists. Please check your existing listings.",
          shouldLog: false,
          shouldNotify: true,
          severity: "low",
          canRetry: false,
        };
      } else {
        return {
          userMessage:
            "This record already exists. Please check for duplicates.",
          shouldLog: true,
          shouldNotify: true,
          severity: "medium",
          canRetry: false,
        };
      }

    case "23514":
      return {
        userMessage:
          "Invalid data provided. Please check your input and try again.",
        shouldLog: true,
        shouldNotify: true,
        severity: "low",
        canRetry: true,
      };

    // Permission errors
    case "42501":
      return {
        userMessage: "You do not have permission to perform this action.",
        shouldLog: true,
        shouldNotify: true,
        severity: "medium",
        canRetry: false,
      };

    // Data validation errors
    case "22001":
      return {
        userMessage:
          "Input text is too long. Please shorten your text and try again.",
        shouldLog: false,
        shouldNotify: true,
        severity: "low",
        canRetry: true,
      };

    case "22003":
      return {
        userMessage:
          "Number value is out of range. Please enter a valid number.",
        shouldLog: false,
        shouldNotify: true,
        severity: "low",
        canRetry: true,
      };

    default:
      // Check for common error message patterns
      if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("timed out")
      ) {
        return {
          userMessage: "Request timed out. Please try again.",
          shouldLog: true,
          shouldNotify: true,
          severity: "medium",
          canRetry: true,
        };
      }

      if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        return {
          userMessage:
            "Network error. Please check your connection and try again.",
          shouldLog: true,
          shouldNotify: true,
          severity: "medium",
          canRetry: true,
        };
      }

      if (
        errorMessage.includes("rate limit") ||
        errorMessage.includes("too many requests")
      ) {
        return {
          userMessage: "Too many requests. Please wait a moment and try again.",
          shouldLog: true,
          shouldNotify: true,
          severity: "medium",
          canRetry: true,
        };
      }

      // Generic database error
      return {
        userMessage:
          "Database error occurred. Please try again or contact support if the problem persists.",
        shouldLog: true,
        shouldNotify: true,
        severity: "medium",
        canRetry: true,
      };
  }
};

// Main database error handler
export const handleDatabaseError = (
  error: any,
  context?: string,
  options?: {
    showToast?: boolean;
    logToConsole?: boolean;
    throwError?: boolean;
  },
): DatabaseErrorResult => {
  const {
    showToast = true,
    logToConsole = true,
    throwError = false,
  } = options || {};

  const result = classifyDatabaseError(error);

  // Log to console if needed
  if (result.shouldLog && logToConsole) {
    const logContext = context ? `[${context}]` : "[Database Error]";
    console.error(`${logContext}:`, {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      errorType: typeof error,
      errorString: String(error),
    });
    // Log the full error object separately to avoid circular references
    if (error && typeof error === "object") {
      console.error(
        `${logContext} Full Error:`,
        JSON.stringify(error, null, 2),
      );
    }
  }

  // Show toast notification if needed
  if (result.shouldNotify && showToast) {
    switch (result.severity) {
      case "critical":
        toast.error(result.userMessage, {
          duration: 10000,
          action: {
            label: "Contact Support",
            onClick: () => (window.location.href = "/contact"),
          },
        });
        break;
      case "high":
        toast.error(result.userMessage, { duration: 6000 });
        break;
      case "medium":
        toast.error(result.userMessage, { duration: 4000 });
        break;
      case "low":
        toast.warning(result.userMessage, { duration: 3000 });
        break;
    }
  }

  // Throw error if requested
  if (throwError) {
    throw new Error(result.userMessage);
  }

  return result;
};

// Utility function for safe database operations
export const safeDbOperation = async <T>(
  operation: () => Promise<{ data: T; error: any }>,
  context?: string,
  options?: {
    showToast?: boolean;
    retryCount?: number;
    retryDelay?: number;
  },
): Promise<{ data: T | null; error: DatabaseErrorResult | null }> => {
  const { showToast = true, retryCount = 0, retryDelay = 1000 } = options || {};

  let lastError: any;

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      const { data, error } = await operation();

      if (error) {
        lastError = error;
        const errorResult = handleDatabaseError(error, context, {
          showToast: showToast && attempt === retryCount, // Only show toast on final attempt
          throwError: false,
        });

        // If the error is retryable and we have attempts left, continue
        if (errorResult.canRetry && attempt < retryCount) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * (attempt + 1)),
          );
          continue;
        }

        return { data: null, error: errorResult };
      }

      return { data, error: null };
    } catch (exception) {
      lastError = exception;

      // For unexpected exceptions, don't retry
      const errorResult = handleDatabaseError(exception, context, {
        showToast: showToast,
        throwError: false,
      });

      return { data: null, error: errorResult };
    }
  }

  // This should never be reached, but just in case
  const errorResult = handleDatabaseError(lastError, context, {
    showToast,
    throwError: false,
  });
  return { data: null, error: errorResult };
};

// Utility for checking if an error is a "not found" error
export const isNotFoundError = (error: any): boolean => {
  return (
    error?.code === "PGRST116" ||
    error?.message?.includes("not found") ||
    error?.message?.includes("No rows returned")
  );
};

// Utility for checking if an error is a permission error
export const isPermissionError = (error: any): boolean => {
  return (
    error?.code === "42501" ||
    error?.code === "PGRST301" ||
    error?.message?.includes("permission") ||
    error?.message?.includes("unauthorized")
  );
};

// Utility for checking if an error is a constraint violation
export const isConstraintError = (error: any): boolean => {
  const code = error?.code;
  return (
    code === "23000" ||
    code === "23502" ||
    code === "23503" ||
    code === "23505" ||
    code === "23514"
  );
};

// Utility for checking if an error is retryable
export const isRetryableError = (error: any): boolean => {
  const result = classifyDatabaseError(error);
  return result.canRetry;
};
