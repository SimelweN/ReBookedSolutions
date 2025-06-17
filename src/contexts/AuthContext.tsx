import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
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
import { addNotification } from "@/services/notificationService";
import { logError, getErrorMessage } from "@/utils/errorUtils";

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
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const isAuthenticated = !!user && !!session;
  const isAdmin = profile?.isAdmin === true;

  const createFallbackProfile = useCallback(
    (user: User): UserProfile => ({
      id: user.id,
      name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
      email: user.email || "",
      isAdmin: false,
      status: "active",
      profile_picture_url: user.user_metadata?.avatar_url,
      bio: undefined,
    }),
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
        const fallbackProfile = createFallbackProfile(user);
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
      try {
        // Only upgrade if we have a basic fallback profile
        if (profile && !profile.bio && !profile.profile_picture_url) {
          const fullProfile = await fetchUserProfileQuick(currentUser);
          if (fullProfile && fullProfile !== profile) {
            setProfile(fullProfile);
            console.log("✅ Profile upgraded successfully");
          }
        }
      } catch (error) {
        // Don't log upgrade failures as errors since it's not critical
        console.log("ℹ️ Profile upgrade skipped");
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

        // Set session and user in batch to prevent flickering
        setSession(session);
        setUser(session.user);

        if (session.user) {
          // Create immediate fallback profile to prevent UI flickering
          const fallbackProfile = createFallbackProfile(session.user);
          setProfile(fallbackProfile);

          console.log("ℹ️ [AuthContext] Using immediate fallback profile");

          // Try to load full profile in background (non-blocking)
          fetchUserProfileQuick(session.user)
            .then((userProfile) => {
              if (userProfile) {
                setProfile(userProfile);
                console.log(
                  "✅ [AuthContext] Background profile load successful",
                );
              }
            })
            .catch((profileError) => {
              console.log(
                "ℹ️ [AuthContext] Background profile load failed, keeping fallback",
              );
            });

          // Add login notification for new sign-ins only
          if (event === "SIGNED_IN" && !isInitializing) {
            try {
              const lastLoginKey = `lastLogin_${session.user.id}`;
              const lastLogin = sessionStorage.getItem(lastLoginKey);
              const now = Date.now();

              // Only send notification if last login was more than 5 minutes ago
              if (!lastLogin || now - parseInt(lastLogin) > 300000) {
                sessionStorage.setItem(lastLoginKey, now.toString());

                addNotification({
                  userId: session.user.id,
                  title: "Welcome back!",
                  message: `Successfully logged in at ${new Date().toLocaleString()}`,
                  type: "success",
                  read: false,
                }).catch((notifError) => {
                  console.warn(
                    "[AuthContext] Login notification failed:",
                    notifError,
                  );
                });
              }
            } catch (notifError) {
              console.warn(
                "[AuthContext] Login notification setup failed:",
                notifError,
              );
            }
          }

          // Background profile maintenance (every 30 seconds)
          setTimeout(() => {
            if (session?.user) {
              upgradeProfileIfNeeded(session.user);
            }
          }, 2000);

          const upgradeInterval = setInterval(() => {
            if (session?.user) {
              upgradeProfileIfNeeded(session.user);
            }
          }, 30000);

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
          const fallbackProfile = createFallbackProfile(session.user);
          setProfile(fallbackProfile);
        }
        setIsLoading(false);
      }
    },
    [createFallbackProfile, upgradeProfileIfNeeded, isInitializing],
  );

  const initializeAuth = useCallback(async () => {
    if (authInitialized) return;

    try {
      setIsLoading(true);
      setInitError(null);
      setIsInitializing(true);

      console.log("🔄 [AuthContext] Initializing auth...");

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw new Error(`Auth initialization failed: ${error.message}`);
      }

      if (session) {
        await handleAuthStateChange(session, "SESSION_RESTORED");
      } else {
        // No session found - user is not authenticated
        setUser(null);
        setProfile(null);
        setSession(null);
      }

      // Always ensure loading is turned off after initialization
      setIsLoading(false);

      setAuthInitialized(true);
      console.log("✅ [AuthContext] Auth initialized successfully");
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        "Failed to initialize authentication",
      );
      setInitError(errorMessage);
      logError("Auth initialization failed", error);

      // Ensure loading is turned off on error to prevent infinite loading
      setIsLoading(false);
    } finally {
      setIsInitializing(false);
    }
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
        setIsLoading(true);
        const result = await loginUser(email, password);
        // Auth state change will be handled by the listener
        return result;
      } catch (error) {
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
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      handleError(error, "Logout");
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Separate effect for loading timeout to prevent infinite re-renders
  useEffect(() => {
    if (isLoading) {
      const loadingTimeout = setTimeout(() => {
        console.warn("⚠️ [AuthContext] Loading timeout - forcing resolution");
        setIsLoading(false);
      }, 5000); // 5 second timeout

      return () => clearTimeout(loadingTimeout);
    }
  }, [isLoading]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        handleAuthStateChange(session, event);
      } else {
        setUser(null);
        setProfile(null);
        setSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [handleAuthStateChange]);

  const value = {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
