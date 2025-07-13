import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { isAdminUser } from "@/services/admin/adminAuthService";
import { ENV } from "@/config/environment";
import {
  logError,
  getErrorMessage,
  retryWithExponentialBackoff,
  withTimeout,
  isNetworkError,
} from "@/utils/errorUtils";

export interface Profile {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  status: string;
  profile_picture_url?: string;
  bio?: string;
}

// Test basic internet connectivity
const testNetworkConnectivity = async (): Promise<void> => {
  if (!navigator.onLine) {
    throw new Error(
      "You appear to be offline. Please check your internet connection.",
    );
  }

  // Skip network test in development to avoid interference
  if (import.meta.env.DEV) {
    console.log("🌐 Skipping network connectivity test in development");
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced timeout

    await fetch("https://httpbin.org/get", {
      method: "GET",
      signal: controller.signal,
      cache: "no-cache",
    });

    clearTimeout(timeoutId);
  } catch (error) {
    console.warn("🌐 Primary connectivity test failed, trying fallback");

    // Fallback test with Google
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await fetch("https://www.google.com/favicon.ico", {
        method: "GET",
        signal: controller.signal,
        mode: "no-cors",
        cache: "no-cache",
      });

      clearTimeout(timeoutId);
    } catch (fallbackError) {
      console.warn("🌐 Both connectivity tests failed:", {
        error,
        fallbackError,
      });
      throw new Error(
        "Cannot reach internet servers. Please check your network connection and try again.",
      );
    }
  }
};

export const loginUser = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  if (!email.includes("@") || email.length < 5) {
    throw new Error("Please enter a valid email address");
  }

  // Note: For login, we don't validate password length - let the server handle it
  // Password length validation should only be done during registration

  // Check if Supabase is configured - if not, provide development fallback
  const supabaseUrl = ENV.VITE_SUPABASE_URL;
  const supabaseKey = ENV.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    if (import.meta.env.DEV) {
      console.warn(
        "🔧 Supabase not configured - using development fallback auth",
      );

      // In development, simulate a successful login
      return {
        data: {
          user: {
            id: `dev-user-${Date.now()}`,
            email: email,
            created_at: new Date().toISOString(),
            email_confirmed_at: new Date().toISOString(),
            aud: "authenticated",
            role: "authenticated",
          },
          session: {
            access_token: "dev-token",
            refresh_token: "dev-refresh",
            expires_at: Date.now() + 3600000,
            token_type: "bearer",
            user: {
              id: `dev-user-${Date.now()}`,
              email: email,
            },
          },
        },
        error: null,
      };
    } else {
      throw new Error(
        "Authentication service not configured. Please contact support.",
      );
    }
  }

  // Quick network connectivity check
  await testNetworkConnectivity();

  console.log("🔧 Supabase Config Check:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlLength: supabaseUrl?.length || 0,
    keyPrefix: supabaseKey?.substring(0, 10) || "none",
    isDev: import.meta.env.DEV,
  });

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase Configuration Missing:");
    console.error("- VITE_SUPABASE_URL:", supabaseUrl ? "✓ Set" : "❌ Missing");
    console.error(
      "- VITE_SUPABASE_ANON_KEY:",
      supabaseKey ? "✓ Set" : "❌ Missing",
    );

    throw new Error(
      import.meta.env.DEV
        ? "Supabase configuration missing. Using fallback development configuration."
        : "Authentication service unavailable. Please try again later or contact support.",
    );
  }

  if (!supabaseKey.startsWith("eyJ")) {
    console.error(
      "❌ Invalid Supabase API key format. Key should start with 'eyJ'",
    );
    console.error(
      "Current key starts with:",
      supabaseKey.substring(0, 10) + "...",
    );

    throw new Error(
      "Authentication service configuration invalid. Please contact support.",
    );
  }

  try {
    // Use retry logic for network failures
    const result = await retryWithExponentialBackoff(
      async () => {
        return await withTimeout(
          supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          }),
          15000, // 15 second timeout for authentication
          "Login request timed out",
        );
      },
      {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 5000,
        retryCondition: (error) => {
          // Retry on network errors but not on authentication errors
          return (
            isNetworkError(error) &&
            !error.message?.includes("Invalid login credentials")
          );
        },
      },
    );

    const { data, error } = result;

    if (error) {
      console.error("Login error:", {
        message: error.message,
        code: error.name || error.code,
        details: error.details || error.hint,
      });

      // Handle network errors specifically
      if (isNetworkError(error)) {
        throw new Error(
          "Network connection failed. Please check your internet connection and try again.",
        );
      }

      // Provide user-friendly error messages
      if (error.message.includes("Invalid login credentials")) {
        throw new Error(
          "Invalid email or password. Please check your credentials and try again.",
        );
      } else if (error.message.includes("Email not confirmed")) {
        throw new Error(
          "Please verify your email address before logging in. Check your inbox for a verification email.",
        );
      } else if (error.message.includes("Too many requests")) {
        throw new Error(
          "Too many login attempts. Please wait a few minutes before trying again.",
        );
      } else {
        throw new Error(`Login failed: ${error.message}`);
      }
    }

    console.log("Login successful for:", email);
    return data;
  } catch (error) {
    // Enhanced error handling for network issues
    if (isNetworkError(error)) {
      throw new Error(
        "Network connection failed. Please check your internet connection and try again.",
      );
    }

    // Re-throw other errors as-is
    throw error;
  }
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
) => {
  // Input validation
  if (!name || name.trim().length < 2) {
    throw new Error("Name must be at least 2 characters long");
  }

  if (!email || !email.includes("@") || email.length < 5) {
    throw new Error("Please enter a valid email address");
  }

  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  // Check password strength
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    throw new Error(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: `${window.location.origin}/verify`,
    },
  });

  if (error) {
    console.error("Registration error:", {
      message: error.message,
      code: error.name || error.code,
      details: error.details || error.hint,
    });
    throw error;
  }

  console.log("Registration successful for:", email);
  return data;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout error:", {
      message: error.message,
      code: error.name || error.code,
      details: error.details || error.hint,
    });
    throw error;
  }
  console.log("Logout successful");
};

export const fetchUserProfileQuick = async (
  user: User,
): Promise<Profile | null> => {
  try {
    // Reduce logging frequency - only log once per minute per user
    const logKey = `profile_fetch_log_${user.id}`;
    const lastLog = sessionStorage.getItem(logKey);
    const shouldLog = !lastLog || Date.now() - parseInt(lastLog) > 60000;

    if (shouldLog) {
      console.log("🔄 Quick profile fetch for user:", user.id);
      sessionStorage.setItem(logKey, Date.now().toString());
    }

    // Use global circuit breaker for table existence check
    const { checkDatabaseHealth } = await import("@/utils/databaseHealthCheck");
    const dbHealth = await checkDatabaseHealth();

    if (!dbHealth.isHealthy) {
      console.log("ℹ️ Database unavailable - using fallback profile");
      return null;
    }

    // Attempt to fetch user profile with short timeout
    try {
      const { data: profile, error: profileError } = (await withTimeout(
        supabase
          .from("profiles")
          .select("id, name, email, status, profile_picture_url, bio, is_admin")
          .eq("id", user.id)
          .single(),
        1000, // 1 second timeout for much faster response
        "Profile fetch timed out after 1 second",
      )) as any;

      if (profileError) {
        // Handle auth errors gracefully - don't log as warnings
        if (
          profileError.code === "UNAUTHORIZED" ||
          profileError.message?.includes("authentication") ||
          profileError.message?.includes("HTTP 401") ||
          profileError.message?.includes("401")
        ) {
          // User not authenticated, return null silently
          return null;
        }

        // Profile not found is normal for new users
        if (profileError.code === "PGRST116") {
          console.log("ℹ�� Profile not found - will use fallback");
          return null;
        }

        // Log other errors but continue with fallback
        console.warn("⚠️ Profile fetch error:", {
          message: profileError.message || "Unknown error",
          code: profileError.code || "No code",
        });
        return null;
      }

      if (!profile) {
        console.log("ℹ️ No profile data returned - using fallback");
        return null;
      }

      // Quick admin check
      const adminEmails = ["AdminSimnLi@gmail.com", "adminsimnli@gmail.com"];
      const userEmail = profile.email || user.email || "";
      const isAdmin =
        profile.is_admin === true ||
        adminEmails.includes(userEmail.toLowerCase());

      const profileData = {
        id: profile.id,
        name:
          profile.name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "User",
        email: profile.email || user.email || "",
        isAdmin,
        status: profile.status || "active",
        profile_picture_url: profile.profile_picture_url,
        bio: profile.bio,
      };

      console.log("✅ Quick profile fetch successful");
      return profileData;
    } catch (profileFetchError) {
      console.warn("⚠️ Profile fetch failed:", profileFetchError);
      return null;
    }
  } catch (error) {
    // Enhanced error logging to debug the timeout issue
    const errorDetails = {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Unknown",
      isTimeout: (error as any)?.isTimeout || false,
      stack: error instanceof Error ? error.stack?.split("\n")[0] : undefined,
    };

    console.warn("⚠️ Quick profile fetch failed:", errorDetails);

    // Don't log as error since this is expected to fail sometimes
    // Just use fallback profile
    return null;
  }
};

export const fetchUserProfile = async (user: User): Promise<Profile | null> => {
  try {
    console.log("🔄 Fetching full profile for user:", user.id);

    // Enhanced retry logic with better error handling
    const result = await retryWithExponentialBackoff(
      async () => {
        return await withTimeout(
          supabase
            .from("profiles")
            .select(
              "id, name, email, status, profile_picture_url, bio, is_admin",
            )
            .eq("id", user.id)
            .single(),
          10000, // 10 second timeout for full fetch
          "Full profile fetch timed out",
        );
      },
      {
        maxRetries: 2,
        baseDelay: 500,
        maxDelay: 5000,
        retryCondition: (error) => isNetworkError(error),
      },
    );

    const { data: profile, error: profileError } = result;

    if (profileError) {
      logError("Error fetching profile", profileError);

      if (profileError.code === "PGRST116") {
        console.log("Profile not found, creating new profile...");
        return await createUserProfile(user);
      }

      throw new Error(
        getErrorMessage(profileError, "Failed to fetch user profile"),
      );
    }

    if (!profile) {
      console.log("No profile found, creating new profile...");
      return await createUserProfile(user);
    }

    // Check admin status - first check the profile flag, then fallback to email check
    let isAdmin = false;

    if (profile.is_admin === true) {
      isAdmin = true;
      console.log("✅ Admin status from profile flag:", isAdmin);
    } else {
      // Quick email-based admin check without additional database calls
      const adminEmails = ["AdminSimnLi@gmail.com", "adminsimnli@gmail.com"];
      const userEmail = profile.email || user.email || "";
      isAdmin = adminEmails.includes(userEmail.toLowerCase());

      if (isAdmin) {
        console.log("✅ Admin status from email check:", isAdmin);
        // Update admin flag in background (non-blocking)
        supabase
          .from("profiles")
          .update({ is_admin: true })
          .eq("id", user.id)
          .then(() => console.log("✅ Admin flag updated in background"))
          .catch(() =>
            console.warn("⚠️ Failed to update admin flag in background"),
          );
      }
    }

    console.log(
      "Profile loaded successfully:",
      profile.name,
      "isAdmin:",
      isAdmin,
    );

    return {
      id: profile.id,
      name:
        profile.name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User",
      email: profile.email || user.email || "",
      isAdmin,
      status: profile.status || "active",
      profile_picture_url: profile.profile_picture_url,
      bio: profile.bio,
    };
  } catch (error) {
    logError("Error in fetchUserProfile", error);
    throw new Error(getErrorMessage(error, "Failed to load user profile"));
  }
};

export const createUserProfile = async (user: User): Promise<Profile> => {
  try {
    console.log("Creating profile for user:", user.id);

    // Check if user should be admin based on email
    const adminEmails = ["AdminSimnLi@gmail.com", "adminsimnli@gmail.com"];
    const userEmail = user.email || "";
    const isAdmin = adminEmails.includes(userEmail.toLowerCase());

    const profileData = {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
      email: user.email || "",
      status: "active",
      is_admin: isAdmin, // Set admin flag during creation
    };

    // Use retry logic for profile creation as well
    const result = await retryWithExponentialBackoff(async () => {
      return await supabase
        .from("profiles")
        .insert([profileData])
        .select("id, name, email, status, profile_picture_url, bio, is_admin")
        .single();
    });

    const { data: newProfile, error: createError } = result;

    if (createError) {
      logError("Error creating profile", createError);
      throw new Error(
        getErrorMessage(createError, "Failed to create user profile"),
      );
    }

    console.log(
      "Profile created successfully:",
      newProfile.name,
      "Admin:",
      isAdmin,
    );

    return {
      id: newProfile.id,
      name: newProfile.name,
      email: newProfile.email,
      isAdmin: newProfile.is_admin || false, // Use the admin status from database
      status: newProfile.status,
      profile_picture_url: newProfile.profile_picture_url,
      bio: newProfile.bio,
    };
  } catch (error) {
    logError("Error in createUserProfile", error);
    throw new Error(getErrorMessage(error, "Failed to create user profile"));
  }
};
