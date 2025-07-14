import { supabase } from "@/integrations/supabase/client";
import { logError, getErrorMessage } from "@/utils/errorUtils";

export interface VerificationResult {
  success: boolean;
  message: string;
  method?: string;
  session?: any;
  error?: any;
}

export interface VerificationParams {
  token_hash?: string | null;
  token?: string | null;
  type?: string | null;
  code?: string | null;
  error_code?: string | null;
  error_description?: string | null;
}

export class EmailVerificationService {
  /**
   * Extract verification parameters from URL
   */
  static extractParamsFromUrl(
    searchParams: URLSearchParams,
  ): VerificationParams {
    return {
      token_hash: searchParams.get("token_hash"),
      token: searchParams.get("token"),
      type: searchParams.get("type"),
      code: searchParams.get("code"),
      error_code: searchParams.get("error_code"),
      error_description: searchParams.get("error_description"),
    };
  }

  /**
   * Check if there are any error parameters in the URL
   */
  static hasErrorParams(params: VerificationParams): boolean {
    return !!(params.error_code || params.error_description);
  }

  /**
   * Verify email using token hash (modern Supabase auth)
   */
  static async verifyWithTokenHash(
    token_hash: string,
    type: string,
  ): Promise<VerificationResult> {
    try {
      console.log("🔐 Attempting token_hash verification");

      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any,
      });

      if (error) {
        console.error(
          "Token hash verification error:",
          JSON.stringify(error, null, 2),
        );
        logError("Token hash verification error", error);
        return {
          success: false,
          message: getErrorMessage(error),
          method: "token_hash",
          error,
        };
      }

      if (data.session) {
        console.log("✅ Token hash verification successful");
        return {
          success: true,
          message: "Email verified successfully using token hash",
          method: "token_hash",
          session: data.session,
        };
      }

      return {
        success: false,
        message: "Token hash verification did not return a session",
        method: "token_hash",
      };
    } catch (error) {
      logError("Token hash verification exception", error);
      return {
        success: false,
        message: getErrorMessage(error),
        method: "token_hash",
        error,
      };
    }
  }

  /**
   * Verify email using legacy token (older Supabase auth)
   */
  static async verifyWithLegacyToken(
    token: string,
    type: string,
  ): Promise<VerificationResult> {
    try {
      console.log("🔐 Attempting legacy token verification");

      const { data, error } = await supabase.auth.verifyOtp({
        token,
        type: type as any,
      });

      if (error) {
        console.error(
          "Legacy token verification error:",
          JSON.stringify(error, null, 2),
        );
        logError("Legacy token verification error", error);
        return {
          success: false,
          message: getErrorMessage(error),
          method: "legacy_token",
          error,
        };
      }

      if (data.session) {
        console.log("✅ Legacy token verification successful");
        return {
          success: true,
          message: "Email verified successfully using legacy token",
          method: "legacy_token",
          session: data.session,
        };
      }

      return {
        success: false,
        message: "Legacy token verification did not return a session",
        method: "legacy_token",
      };
    } catch (error) {
      logError("Legacy token verification exception", error);
      return {
        success: false,
        message: getErrorMessage(error),
        method: "legacy_token",
        error,
      };
    }
  }

  /**
   * Verify email using PKCE code exchange
   */
  static async verifyWithCodeExchange(
    url: string,
  ): Promise<VerificationResult> {
    try {
      console.log("🔐 Attempting PKCE code exchange");

      const { data, error } = await supabase.auth.exchangeCodeForSession(url);

      if (error) {
        console.error("Code exchange error:", JSON.stringify(error, null, 2));
        logError("Code exchange error", error);
        return {
          success: false,
          message: getErrorMessage(error),
          method: "code_exchange",
          error,
        };
      }

      if (data.session) {
        console.log("✅ Code exchange successful");
        return {
          success: true,
          message: "Email verified successfully using code exchange",
          method: "code_exchange",
          session: data.session,
        };
      }

      return {
        success: false,
        message: "Code exchange did not return a session",
        method: "code_exchange",
      };
    } catch (error) {
      logError("Code exchange exception", error);
      return {
        success: false,
        message: getErrorMessage(error),
        method: "code_exchange",
        error,
      };
    }
  }

  /**
   * Check if user already has an active session
   */
  static async checkExistingSession(): Promise<VerificationResult> {
    try {
      console.log("🔍 Checking existing session");

      const { data: sessionData, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session check error:", JSON.stringify(error, null, 2));
        logError("Session check error", error);
        return {
          success: false,
          message: getErrorMessage(error),
          method: "session_check",
          error,
        };
      }

      if (sessionData.session) {
        console.log("✅ User already has active session");
        return {
          success: true,
          message: "You are already verified and logged in",
          method: "existing_session",
          session: sessionData.session,
        };
      }

      return {
        success: false,
        message: "No existing session found",
        method: "session_check",
      };
    } catch (error) {
      logError("Session check exception", error);
      return {
        success: false,
        message: getErrorMessage(error),
        method: "session_check",
        error,
      };
    }
  }

  /**
   * Main verification method that tries all available methods
   */
  static async verifyEmail(
    params: VerificationParams,
    currentUrl: string,
  ): Promise<VerificationResult> {
    console.log("🔍 Starting comprehensive email verification");
    console.log("📍 URL:", currentUrl);
    console.log("📍 Params:", JSON.stringify(params, null, 2));

    // Check for errors first
    if (this.hasErrorParams(params)) {
      const errorMessage =
        params.error_description || "Email verification failed";
      console.error(
        "❌ Verification error from URL:",
        JSON.stringify(
          {
            error_code: params.error_code,
            error_description: params.error_description,
          },
          null,
          2,
        ),
      );

      const errorResult = {
        success: false,
        message: errorMessage,
        method: "url_error",
        error: {
          code: params.error_code,
          description: params.error_description,
        },
      };

      console.log("EmailVerificationService returning URL error:", errorResult);
      return errorResult;
    }

    // Method 1: Token hash verification (preferred)
    if (params.token_hash && params.type) {
      console.log("🔐 Trying Method 1: Token hash verification", {
        token_hash_length: params.token_hash.length,
        type: params.type,
      });
      const result = await this.verifyWithTokenHash(
        params.token_hash,
        params.type,
      );
      console.log(
        "🔐 Token hash verification result:",
        JSON.stringify(result, null, 2),
      );
      if (result.success) {
        return result;
      }
      console.log("❌ Token hash verification failed, trying other methods...");
    } else {
      console.log(
        "⏭️ Skipping Method 1: Token hash verification (missing params)",
        {
          has_token_hash: !!params.token_hash,
          has_type: !!params.type,
        },
      );
    }

    // Method 2: Legacy token verification
    if (params.token && params.type) {
      console.log("🔐 Trying Method 2: Legacy token verification", {
        token_length: params.token.length,
        type: params.type,
      });
      const result = await this.verifyWithLegacyToken(
        params.token,
        params.type,
      );
      console.log(
        "🔐 Legacy token verification result:",
        JSON.stringify(result, null, 2),
      );
      if (result.success) {
        return result;
      }
      console.log(
        "❌ Legacy token verification failed, trying other methods...",
      );
    } else {
      console.log(
        "⏭️ Skipping Method 2: Legacy token verification (missing params)",
        {
          has_token: !!params.token,
          has_type: !!params.type,
        },
      );
    }

    // Method 3: PKCE code exchange
    if (params.code || currentUrl.includes("code=")) {
      console.log("🔐 Trying Method 3: PKCE code exchange", {
        has_code_param: !!params.code,
        url_contains_code: currentUrl.includes("code="),
        url_length: currentUrl.length,
      });
      const result = await this.verifyWithCodeExchange(currentUrl);
      console.log("🔐 Code exchange result:", JSON.stringify(result, null, 2));
      if (result.success) {
        return result;
      }
      console.log("❌ Code exchange failed, trying other methods...");
    } else {
      console.log("⏭️ Skipping Method 3: PKCE code exchange (no code found)", {
        has_code: !!params.code,
        url_has_code: currentUrl.includes("code="),
      });
    }

    // Method 4: Check existing session
    console.log("🔐 Trying Method 4: Check existing session");
    const sessionResult = await this.checkExistingSession();
    console.log(
      "🔐 Session check result:",
      JSON.stringify(sessionResult, null, 2),
    );
    if (sessionResult.success) {
      return sessionResult;
    }
    console.log("❌ Session check failed");

    console.log("❌ All verification methods exhausted");

    // If all methods fail
    const failureResult = {
      success: false,
      message:
        "Unable to verify email with any available method. Please try registering again or contact support.",
      method: "all_failed",
    };

    console.log(
      "EmailVerificationService returning failure result:",
      failureResult,
    );
    return failureResult;
  }

  /**
   * Get a user-friendly error message based on the error type
   */
  static getFormattedErrorMessage(result: VerificationResult): string {
    if (result.success) {
      return result.message;
    }

    const error = result.error;
    let baseMessage = "Email verification failed. ";

    // Extract error message safely
    const errorMessage =
      error?.message || error?.error_description || error?.description || "";
    const errorCode = error?.code || error?.error_code || "";

    if (errorMessage.includes("expired") || errorCode === "token_expired") {
      return (
        baseMessage +
        "The verification link has expired. Please register again."
      );
    }

    if (
      errorMessage.includes("already confirmed") ||
      errorCode === "email_already_confirmed"
    ) {
      return (
        baseMessage +
        "This email has already been verified. You can now log in."
      );
    }

    if (errorMessage.includes("invalid") || errorCode === "invalid_token") {
      return (
        baseMessage + "The verification link is invalid. Please register again."
      );
    }

    if (errorMessage.includes("Email not confirmed")) {
      return (
        baseMessage +
        "Your email is not yet confirmed. Please check your email for the confirmation link."
      );
    }

    if (errorMessage.includes("not found") || errorCode === "user_not_found") {
      return baseMessage + "User not found. Please register again.";
    }

    // Ensure we return a proper string message
    let finalMessage = result.message || "Please try again or contact support.";

    // Prevent [object Object] from being returned
    if (typeof finalMessage === "object") {
      try {
        finalMessage = JSON.stringify(finalMessage);
      } catch {
        finalMessage = "Please try again or contact support.";
      }
    }

    if (finalMessage === "[object Object]") {
      finalMessage = "Please try again or contact support.";
    }

    return baseMessage + finalMessage;
  }
}
