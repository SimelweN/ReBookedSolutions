import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  startTransition,
} from "react";
import { safeCreateContext } from "../utils/reactLoader";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  Profile,
  loginUser,
  registerUser,
  fetchUserProfile,
  fetchUserProfileQuick,
  createUserProfile,
  upgradeToUserProfile,
} from "@/services/authOperations";
import { addNotification } from "../services/notificationService";
import { safeNotificationOperation } from "../utils/safeAuthOperations";
import { logError, getErrorMessage } from "@/utils/errorUtils";
import { createFallbackProfile } from "@/utils/databaseConnectivityHelper";
import { shouldSkipAuthLoading } from "@/utils/instantStartup";
import { CookieManager } from "@/utils/cookieManager";
import { safeLocalStorage } from "@/utils/safeLocalStorage";
// Simple logging for development
const devLog = (message: string, data?: unknown) => {
  if (import.meta.env.DEV) console.log(message, data);
};
const devWarn = (message: string, data?: unknown) => {
  if (import.meta.env.DEV) console.warn(message, data);
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  status: string;
  profile_picture_url?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  initError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ needsVerification?: boolean }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(
    shouldSkipAuthLoading() ? false : true,
  ); // Start as true unless auth should be skipped
  const [authInitialized, setAuthInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Ref to track current state and prevent duplicate updates
  const currentUserIdRef = useRef<string | null>(null);
  const initializingRef = useRef<boolean>(false);
  const profileUpgradeRef = useRef<string | null>(null); // Track which user is being upgraded

  const isAuthenticated = !!user && !!session;
  const isAdmin = profile?.isAdmin === true;

  const createUserFallbackProfile = useCallback(
    (user: User): UserProfile => createFallbackProfile(user) as UserProfile,
    [],
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const updatedProfile = await fetchUserProfileQuick(user);

      if (updatedProfile) {
        setProfile(updatedProfile);
        console.log("✅ Profile refreshed successfully");
      } else {
        // Use fallback profile
        const fallbackProfile = createUserFallbackProfile(user);
        setProfile(fallbackProfile);
        console.log("ℹ️ Using fallback profile after refresh");
      }
    } catch (error) {
      logError("Profile refresh failed", error);
      // Keep existing profile on error
    } finally {
      setIsLoading(false);
    }
  }, [user, createFallbackProfile]);

  const upgradeProfileIfNeeded = useCallback(
    async (currentUser: User) => {
      // Prevent concurrent upgrades for the same user
      if (profileUpgradeRef.current === currentUser.id) {
        console.log("ℹ️ Profile upgrade already in progress");
        return;
      }

      try {
        // Only upgrade if we have a basic fallback profile
        if (profile && !profile.bio && !profile.profile_picture_url) {
          // Check if we've recently failed to avoid rapid retries
          const lastFailKey = `profile_fetch_fail_${currentUser.id}`;
          const lastFail = sessionStorage.getItem(lastFailKey);
          if (lastFail) {
            const lastFailTime = parseInt(lastFail);
            const timeSinceLastFail = Date.now() - lastFailTime;
            // Don't retry for 5 minutes after a failure
            if (timeSinceLastFail < 5 * 60 * 1000) {
              console.log("ℹ️ Profile upgrade skipped - recent failure");
              return;
            }
          }

          // Mark this user as being upgraded
          profileUpgradeRef.current = currentUser.id;

          const fullProfile = await fetchUserProfileQuick(currentUser);
          if (fullProfile && fullProfile !== profile) {
            setProfile(fullProfile);
            console.log("✅ Profile upgraded successfully");
            // Clear failure timestamp on success
            sessionStorage.removeItem(lastFailKey);
          }
        }
      } catch (error) {
        // Mark failure timestamp to prevent rapid retries
        const lastFailKey = `profile_fetch_fail_${currentUser.id}`;
        sessionStorage.setItem(lastFailKey, Date.now().toString());
        console.log("ℹ️ Profile upgrade skipped - will retry later");
      } finally {
        // Clear the upgrade lock
        profileUpgradeRef.current = null;
      }
    },
    [profile],
  );

  const handleAuthStateChange = useCallback(
    async (session: Session, event?: string) => {
      try {
        console.log("🔄 [AuthContext] Handling auth state change:", {
          event,
          userId: session.user?.id,
        });

        if (session.user) {
          // Check if this is actually a new user to prevent unnecessary updates
          if (currentUserIdRef.current !== session.user.id) {
            // If switching users, clear everything first to prevent mixing data
            if (currentUserIdRef.current !== null) {
              console.log(
                "🔄 [AuthContext] User switching detected, clearing state first",
              );

              // Use React's startTransition for non-urgent updates to prevent glitching
              startTransition(() => {
                setUser(null);
                setProfile(null);
                setSession(null);
              });

              // Clear local storage to prevent data contamination
              safeLocalStorage.removeItem("supabase.auth.token");
              sessionStorage.clear();

              // Small delay to ensure state is cleared
              await new Promise((resolve) => setTimeout(resolve, 200));
            }

            currentUserIdRef.current = session.user.id;

            // Batch state updates to prevent multiple re-renders and glitching
            const fallbackProfile = createUserFallbackProfile(session.user);

            // Add small delay to prevent glitching between states
            setTimeout(() => {
              // Use startTransition for smooth state updates
              startTransition(() => {
                setSession(session);
                setUser(session.user);
                setProfile(fallbackProfile);
                setIsLoading(false);
              });
            }, 100); // Small delay to stabilize

            console.log(
              "✅ [AuthContext] Auth state updated for user:",
              session.user.id,
            );
          } else {
            console.log(
              "ℹ️ [AuthContext] Skipping duplicate auth update for same user",
            );
            return; // Early return to prevent unnecessary processing
          }

          // Try to load full profile in background (non-blocking)
          fetchUserProfileQuick(session.user)
            .then((userProfile) => {
              if (userProfile && userProfile.id === session.user?.id) {
                // Only update if profile belongs to the same user (prevent race conditions)
                setProfile(userProfile);
                console.log(
                  "✅ [AuthContext] Background profile load successful",
                );
              } else {
                console.log(
                  "ℹ️ [AuthContext] No profile data returned, keeping fallback profile",
                );
              }
            })
            .catch((profileError) => {
              console.log(
                "ℹ️ [AuthContext] Background profile load failed, keeping fallback:",
                profileError instanceof Error
                  ? profileError.message
                  : String(profileError),
              );
              // Keep the fallback profile - don't change loading state
            });

          // DISABLED: Login notifications are too spammy
          // Users can see they're logged in from the UI state
          console.log(
            "[AuthContext] Skipping login notification to prevent spam",
          );

          // Background profile maintenance (every 2 minutes)
          // Initial delay increased to reduce rapid retries
          setTimeout(() => {
            if (session?.user) {
              upgradeProfileIfNeeded(session.user);
            }
          }, 10000); // 10 seconds instead of 2

          const upgradeInterval = setInterval(() => {
            if (session?.user) {
              upgradeProfileIfNeeded(session.user);
            }
          }, 120000); // 2 minutes instead of 30 seconds

          return () => clearInterval(upgradeInterval);
        }
      } catch (error) {
        console.error("[AuthContext] Auth state change failed:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          type: error instanceof Error ? error.constructor.name : typeof error,
        });

        // Don't throw - use fallback profile and ensure loading resolves
        if (session.user) {
          const fallbackProfile = createUserFallbackProfile(session.user);
          setProfile(fallbackProfile);
        }
        setIsLoading(false);
      }
    },
    [createUserFallbackProfile, upgradeProfileIfNeeded, isInitializing],
  );

  const initializeAuth = useCallback(() => {
    if (authInitialized) return;

    // Check if supabase client is available
    if (!supabase) {
      console.warn(
        "⚠️ Supabase client not available, skipping auth initialization",
      );
      setIsInitializing(false);
      setIsLoading(false);
      setInitError("Authentication service unavailable");
      return;
    }

    // Use startTransition to prevent suspense issues
    startTransition(() => {
      setIsLoading(false); // Start without loading to prevent suspense
      setInitError(null);
      setIsInitializing(true);

      console.log("🔄 [AuthContext] Auth initialization starting...");

      // Immediate initialization without blocking
      (async () => {
        try {
          // Immediate fallback timeout to prevent hanging
          const immediateTimeout = setTimeout(() => {
            console.info("ℹ️ [AuthContext] Setting to unauthenticated state");
            setIsLoading(false);
            setAuthInitialized(true);
            setUser(null);
            setProfile(null);
            setSession(null);
          }, 2000); // Increased to 2 seconds

          // Ultra-fast database connectivity check
          try {
            const connectivityTimeout = new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Database connectivity check timeout")),
                800,
              ),
            );

            const connectivityCheck = supabase
              .from("profiles")
              .select("id")
              .limit(1);

            await Promise.race([connectivityCheck, connectivityTimeout]);
            console.log("✅ [AuthContext] Database connectivity verified");
          } catch (dbError) {
            console.warn(
              "⚠️ [AuthContext] Database connection issues detected, using fallback",
            );
            console.info(
              "ℹ️ [AuthContext] Continuing with fallback profile strategy",
            );
          }

          // Check if there are auth code parameters in the URL
          const urlParams = new URLSearchParams(window.location.search);
          const hasAuthCode = urlParams.has("code");
          const hasError = urlParams.has("error");

          if (hasAuthCode) {
            console.log(
              "🔗 [AuthContext] Auth code detected in URL, attempting code exchange...",
            );

            try {
              // Try to exchange the code for a session
              const { data, error: exchangeError } =
                await supabase.auth.exchangeCodeForSession(
                  window.location.href,
                );

              if (exchangeError) {
                console.warn(
                  "⚠️ [AuthContext] Code exchange failed:",
                  exchangeError.message,
                );

                // If code exchange fails due to PKCE issues, clear URL and get regular session
                if (
                  exchangeError.message.includes("code verifier") ||
                  exchangeError.message.includes("invalid request")
                ) {
                  console.log(
                    "���� [AuthContext] Clearing auth parameters from URL due to PKCE error",
                  );
                  // Clear the URL parameters to prevent repeated failed attempts
                  window.history.replaceState(
                    {},
                    document.title,
                    window.location.pathname,
                  );

                  // Fall back to getting existing session
                  const { data: sessionData, error: sessionError } =
                    await supabase.auth.getSession();
                  if (sessionError) {
                    throw sessionError;
                  }

                  if (sessionData.session) {
                    await handleAuthStateChange(
                      sessionData.session,
                      "SESSION_RESTORED",
                    );
                  } else {
                    setUser(null);
                    setProfile(null);
                    setSession(null);
                    setIsLoading(false);
                  }
                } else {
                  throw exchangeError;
                }
              } else if (data.session) {
                console.log("✅ [AuthContext] Code exchange successful");
                await handleAuthStateChange(data.session, "SIGNED_IN");
              }
            } catch (codeExchangeError) {
              console.warn(
                "⚠️ [AuthContext] Code exchange attempt failed, falling back to session check:",
                codeExchangeError instanceof Error
                  ? codeExchangeError.message
                  : String(codeExchangeError),
              );

              // Clear problematic URL parameters
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname,
              );

              // Fall back to regular session check
              const { data: sessionData, error: sessionError } =
                await supabase.auth.getSession();
              if (
                sessionError &&
                !sessionError.message.includes("code verifier")
              ) {
                throw sessionError;
              }

              if (sessionData?.session) {
                await handleAuthStateChange(
                  sessionData.session,
                  "SESSION_RESTORED",
                );
              } else {
                setUser(null);
                setProfile(null);
                setSession(null);
                setIsLoading(false);
              }
            }
          } else if (hasError) {
            // Handle auth errors in URL
            const error = urlParams.get("error");
            const errorDescription = urlParams.get("error_description");
            console.warn(
              "🚨 [AuthContext] Auth error in URL:",
              error,
              errorDescription,
            );

            // Clear error from URL
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            );

            // Still try to get existing session
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session) {
              await handleAuthStateChange(
                sessionData.session,
                "SESSION_RESTORED",
              );
            } else {
              setUser(null);
              setProfile(null);
              setSession(null);
              setIsLoading(false);
            }
          } else {
            // Normal session check
            const {
              data: { session },
              error,
            } = await supabase.auth.getSession();

            if (error && !error.message.includes("code verifier")) {
              throw new Error(`Auth initialization failed: ${error.message}`);
            }

            if (session) {
              await handleAuthStateChange(session, "SESSION_RESTORED");
            } else {
              // No session found - user is not authenticated
              setUser(null);
              setProfile(null);
              setSession(null);
              setIsLoading(false);
            }
          }

          setAuthInitialized(true);
          clearTimeout(immediateTimeout);
          console.log("✅ [AuthContext] Auth initialized successfully");
        } catch (error) {
          const errorMessage = getErrorMessage(
            error,
            "Failed to initialize authentication",
          );

          // Don't show PKCE errors to users as they're not actionable
          if (
            error instanceof Error &&
            error.message.includes("code verifier")
          ) {
            console.warn(
              "⚠️ [AuthContext] PKCE error handled silently:",
              error.message,
            );
            setInitError(null);

            // Clear URL and set to unauthenticated state
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            );
            setUser(null);
            setProfile(null);
            setSession(null);
          } else {
            setInitError(errorMessage);
            logError("Auth initialization failed", error);
          }

          // Ensure loading is turned off on error to prevent infinite loading
          setIsLoading(false);
          clearTimeout(immediateTimeout);
        } finally {
          setIsInitializing(false);
        }
      })();
    });
  }, [authInitialized, handleAuthStateChange]);

  const handleError = useCallback((error: unknown, context: string) => {
    const errorMessage = getErrorMessage(
      error,
      `${context} failed. Please try again.`,
    );
    throw new Error(errorMessage);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        console.log("🔐 AuthContext: Starting login process");
        setIsLoading(true);
        const result = await loginUser(email, password);
        console.log("🔐 AuthContext: loginUser completed, result:", result);

        // Check if we have a session after login
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("🔐 AuthContext: Session after login:", sessionData);

        // Auth state change will be handled by the listener
        return result;
      } catch (error) {
        console.log("������ AuthContext: Login error:", error);
        handleError(error, "Login");
      } finally {
        setIsLoading(false);
      }
    },
    [handleError],
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        setIsLoading(true);
        const result = await registerUser(email, password, name);
        return result;
      } catch (error) {
        handleError(error, "Registration");
      } finally {
        setIsLoading(false);
      }
    },
    [handleError],
  );

  const logout = useCallback(async () => {
    try {
      console.log("🚪 [AuthContext] Starting logout process");
      setIsLoading(true);

      // Clear all local state immediately
      setUser(null);
      setProfile(null);
      setSession(null);

      // Clear all browser storage
      safeLocalStorage.clear();
      sessionStorage.clear();

      // Clear any cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie =
          name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });

      // Sign out from Supabase
      if (supabase) {
        const { error } = await supabase.auth.signOut({ scope: "global" });

        // Handle specific case where there's no session to sign out from
        if (error && error.message === "Auth session missing!") {
          console.log("ℹ️ [AuthContext] No active session to sign out from");
          // This is actually fine - user is already signed out
        } else if (error) {
          console.warn("⚠️ [AuthContext] Logout error:", error);
        }
      }

      console.log("✅ [AuthContext] Logout completed successfully");
    } catch (error) {
      // For logout, we still want to clear local state even if signOut fails
      console.warn(
        "⚠️ [AuthContext] Logout error, but clearing local state:",
        error,
      );
    } finally {
      setIsLoading(false);
      // Force a page reload to ensure clean state
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    }
  }, []);

  useEffect(() => {
    initializeAuth();

    // Emergency backup to prevent infinite loading - increased timeout for better reliability
    const emergencyTimeout = setTimeout(() => {
      if (!authInitialized) {
        console.warn(
          "⚠️ [AuthContext] Initialization taking longer than expected",
        );
        console.info(
          "💡 [AuthContext] Setting to unauthenticated state to prevent hanging",
        );

        // Force initialization to prevent app from hanging
        setAuthInitialized(true);
        setIsLoading(false);
        setUser(null);
        setProfile(null);
        setSession(null);
        setInitError(null); // Don't show error, just set to unauthenticated
      }
    }, 5000); // Increased to 5 seconds for better reliability

    return () => clearTimeout(emergencyTimeout);
  }, [initializeAuth, authInitialized]);

  // Separate effect for loading timeout to prevent infinite re-renders
  useEffect(() => {
    if (isLoading) {
      const loadingTimeout = setTimeout(() => {
        console.info(
          "ℹ️ [AuthContext] Loading resolved to unauthenticated state",
        );

        // Force resolution to unauthenticated state to stop loading spinner
        setUser(null);
        setProfile(null);
        setSession(null);
        setIsLoading(false);
        setAuthInitialized(true);
      }, 3000); // More reasonable 3 second timeout

      return () => clearTimeout(loadingTimeout);
    }
  }, [isLoading]);

  useEffect(() => {
    // Check if supabase client is available
    if (!supabase) {
      console.warn(
        "⚠️ Supabase client not available, skipping auth state change listener",
      );
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 [AuthContext] Auth state changed:", {
        event,
        hasSession: !!session,
      });

      try {
        if (session) {
          await handleAuthStateChange(session, event);
        } else {
          // Clear user tracking ref
          currentUserIdRef.current = null;

          // Batch clear all auth state to prevent UI flickering
          setUser(null);
          setProfile(null);
          setSession(null);
          setIsLoading(false);
          console.log("✅ [AuthContext] Auth state cleared");
        }
      } catch (error) {
        console.warn(
          "���️ [AuthContext] Auth state change error:",
          error instanceof Error ? error.message : String(error),
        );

        // Handle PKCE errors silently
        if (error instanceof Error && error.message.includes("code verifier")) {
          console.log(
            "🧹 [AuthContext] Handling PKCE error in auth state change",
          );

          // Clear URL parameters if they exist
          const url = new URL(window.location.href);
          if (url.searchParams.has("code") || url.searchParams.has("error")) {
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            );
          }

          // Set to unauthenticated state
          setUser(null);
          setProfile(null);
          setSession(null);
        }

        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [handleAuthStateChange]);

  const value = useMemo(
    () => ({
      user,
      profile,
      session,
      isLoading,
      isAuthenticated,
      isAdmin,
      initError,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [
      user,
      profile,
      session,
      isLoading,
      isAuthenticated,
      isAdmin,
      initError,
      login,
      register,
      logout,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
