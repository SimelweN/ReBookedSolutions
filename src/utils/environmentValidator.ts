/**
 * Comprehensive environment validation utility
 * Validates all required environment variables and configurations
 */

export interface EnvironmentVariable {
  key: string;
  value: string | undefined;
  required: boolean;
  description: string;
  validationRule?: (value: string) => boolean;
  suggestions?: string[];
}

export interface ValidationResult {
  valid: boolean;
  score: number; // 0-100
  issues: {
    critical: string[];
    warnings: string[];
    suggestions: string[];
  };
  variables: {
    [key: string]: {
      status: "valid" | "invalid" | "missing" | "warning";
      message: string;
      value?: string;
    };
  };
}

/**
 * Environment Configuration Validator
 */
export class EnvironmentValidator {
  private static readonly REQUIRED_VARIABLES: EnvironmentVariable[] = [
    // Supabase Configuration
    {
      key: "VITE_SUPABASE_URL",
      value: import.meta.env.VITE_SUPABASE_URL,
      required: true,
      description: "Supabase project URL",
      validationRule: (value) =>
        value.startsWith("https://") && value.includes(".supabase.co"),
      suggestions: ["Should look like: https://your-project.supabase.co"],
    },
    {
      key: "VITE_SUPABASE_ANON_KEY",
      value: import.meta.env.VITE_SUPABASE_ANON_KEY,
      required: true,
      description: "Supabase anonymous key",
      validationRule: (value) => value.startsWith("eyJ") && value.length > 100,
      suggestions: ['Should be a long JWT token starting with "eyJ"'],
    },

    // Payment Configuration
    {
      key: "VITE_PAYSTACK_PUBLIC_KEY",
      value: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      required: true,
      description: "Paystack public key for payments",
      validationRule: (value) =>
        value.startsWith("pk_test_") || value.startsWith("pk_live_"),
      suggestions: ["Test: pk_test_...", "Live: pk_live_..."],
    },

    // Google Maps (Optional but recommended)
    {
      key: "VITE_GOOGLE_MAPS_API_KEY",
      value: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      required: false,
      description: "Google Maps API key for address autocomplete",
      validationRule: (value) => value.length > 20,
      suggestions: ["Get from Google Cloud Console"],
    },

    // Courier APIs (Optional)
    {
      key: "VITE_COURIER_GUY_API_KEY",
      value: import.meta.env.VITE_COURIER_GUY_API_KEY,
      required: false,
      description: "Courier Guy API key for shipping",
      suggestions: ["Contact Courier Guy for API access"],
    },
    {
      key: "VITE_FASTWAY_API_KEY",
      value: import.meta.env.VITE_FASTWAY_API_KEY,
      required: false,
      description: "Fastway API key for shipping",
      suggestions: ["Contact Fastway for API access"],
    },

    // Sender API
    {
      key: "VITE_SENDER_API",
      value: import.meta.env.VITE_SENDER_API,
      required: false,
      description: "Sender API token for notifications",
      suggestions: ["JWT token for notification service"],
    },
  ];

  /**
   * Validate all environment variables
   */
  static validate(): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      score: 100,
      issues: {
        critical: [],
        warnings: [],
        suggestions: [],
      },
      variables: {},
    };

    let totalVariables = this.REQUIRED_VARIABLES.length;
    let validVariables = 0;
    let criticalMissing = 0;

    for (const variable of this.REQUIRED_VARIABLES) {
      const varResult = this.validateVariable(variable);
      result.variables[variable.key] = varResult;

      switch (varResult.status) {
        case "valid":
          validVariables++;
          break;
        case "missing":
          if (variable.required) {
            criticalMissing++;
            result.issues.critical.push(
              `Missing required variable: ${variable.key} - ${variable.description}`,
            );
          } else {
            result.issues.warnings.push(
              `Optional variable not set: ${variable.key} - ${variable.description}`,
            );
          }
          break;
        case "invalid":
          if (variable.required) {
            criticalMissing++;
            result.issues.critical.push(
              `Invalid value for ${variable.key}: ${varResult.message}`,
            );
          } else {
            result.issues.warnings.push(
              `Invalid value for ${variable.key}: ${varResult.message}`,
            );
          }
          break;
        case "warning":
          result.issues.warnings.push(`${variable.key}: ${varResult.message}`);
          validVariables += 0.5; // Partial credit
          break;
      }
    }

    // Calculate score
    result.score = Math.round((validVariables / totalVariables) * 100);

    // Determine overall validity
    result.valid = criticalMissing === 0;

    // Add environment-specific suggestions
    this.addEnvironmentSuggestions(result);

    return result;
  }

  /**
   * Validate a single environment variable
   */
  private static validateVariable(variable: EnvironmentVariable) {
    const value = variable.value;

    if (!value || value.trim() === "") {
      return {
        status: "missing" as const,
        message: variable.required
          ? "Required but not set"
          : "Optional - not set",
      };
    }

    // Run custom validation if provided
    if (variable.validationRule) {
      try {
        if (!variable.validationRule(value)) {
          return {
            status: variable.required ? "invalid" : ("warning" as const),
            message: "Value format is invalid",
            value: this.maskSensitiveValue(variable.key, value),
          };
        }
      } catch (error) {
        return {
          status: "invalid" as const,
          message: `Validation failed: ${error}`,
          value: this.maskSensitiveValue(variable.key, value),
        };
      }
    }

    // Additional checks
    if (variable.key.includes("KEY") || variable.key.includes("TOKEN")) {
      if (value.length < 10) {
        return {
          status: "warning" as const,
          message: "Value seems too short for a key/token",
          value: this.maskSensitiveValue(variable.key, value),
        };
      }
    }

    return {
      status: "valid" as const,
      message: "Valid",
      value: this.maskSensitiveValue(variable.key, value),
    };
  }

  /**
   * Mask sensitive values for display
   */
  private static maskSensitiveValue(key: string, value: string): string {
    const sensitiveKeys = ["KEY", "TOKEN", "SECRET"];
    const isSensitive = sensitiveKeys.some((sensitive) =>
      key.includes(sensitive),
    );

    if (!isSensitive) {
      return value;
    }

    if (value.length <= 8) {
      return "*".repeat(value.length);
    }

    return `${value.slice(0, 4)}${"*".repeat(value.length - 8)}${value.slice(-4)}`;
  }

  /**
   * Add environment-specific suggestions
   */
  private static addEnvironmentSuggestions(result: ValidationResult): void {
    const isDev = import.meta.env.DEV;
    const isProd = import.meta.env.PROD;

    if (isDev) {
      result.issues.suggestions.push(
        "Development environment detected - using test keys is recommended",
      );

      // Check if using live keys in development
      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (paystackKey?.startsWith("pk_live_")) {
        result.issues.warnings.push(
          "Live Paystack key detected in development - consider using test keys",
        );
      }
    }

    if (isProd) {
      result.issues.suggestions.push(
        "Production environment detected - ensure all keys are live/production keys",
      );

      // Check if using test keys in production
      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (paystackKey?.startsWith("pk_test_")) {
        result.issues.critical.push(
          "Test Paystack key detected in production - must use live keys",
        );
      }
    }

    // Suggest creating .env file if many variables are missing
    const missingRequired = Object.values(result.variables).filter(
      (v) => v.status === "missing",
    ).length;

    if (missingRequired > 2) {
      result.issues.suggestions.push(
        "Create a .env file in your project root with the required environment variables",
      );
    }

    // Database suggestions
    const supabaseUrl = result.variables["VITE_SUPABASE_URL"];
    const supabaseKey = result.variables["VITE_SUPABASE_ANON_KEY"];

    if (supabaseUrl?.status === "valid" && supabaseKey?.status === "valid") {
      result.issues.suggestions.push(
        "Supabase configuration looks good - database should be accessible",
      );
    }

    // Payment suggestions
    const paystackKey = result.variables["VITE_PAYSTACK_PUBLIC_KEY"];
    if (paystackKey?.status === "valid") {
      result.issues.suggestions.push(
        "Paystack configuration is valid - payments should work",
      );
    }
  }

  /**
   * Get quick status summary
   */
  static getQuickStatus(): {
    status: "healthy" | "warning" | "critical";
    message: string;
    score: number;
  } {
    const validation = this.validate();

    let status: "healthy" | "warning" | "critical";
    let message: string;

    if (validation.issues.critical.length > 0) {
      status = "critical";
      message = `${validation.issues.critical.length} critical issues found`;
    } else if (validation.issues.warnings.length > 0) {
      status = "warning";
      message = `${validation.issues.warnings.length} warnings found`;
    } else {
      status = "healthy";
      message = "All environment variables configured correctly";
    }

    return {
      status,
      message,
      score: validation.score,
    };
  }

  /**
   * Generate setup guide based on missing variables
   */
  static generateSetupGuide(): string[] {
    const validation = this.validate();
    const guide: string[] = [];

    guide.push("# Environment Setup Guide");
    guide.push("");
    guide.push(
      "Create a `.env` file in your project root with the following variables:",
    );
    guide.push("");

    for (const variable of this.REQUIRED_VARIABLES) {
      const result = validation.variables[variable.key];

      if (result.status === "missing" || result.status === "invalid") {
        guide.push(`# ${variable.description}`);
        if (variable.suggestions) {
          guide.push(`# Suggestions: ${variable.suggestions.join(", ")}`);
        }
        guide.push(`${variable.key}=your_${variable.key.toLowerCase()}_here`);
        guide.push("");
      }
    }

    guide.push("# Additional Notes:");
    guide.push("# - Never commit .env files to version control");
    guide.push("# - Use different keys for development and production");
    guide.push(
      "# - Restart your dev server after changing environment variables",
    );

    return guide;
  }
}

// Export convenience functions
export const validateEnvironment = () => EnvironmentValidator.validate();
export const getEnvironmentStatus = () => EnvironmentValidator.getQuickStatus();
export const generateSetupGuide = () =>
  EnvironmentValidator.generateSetupGuide();
