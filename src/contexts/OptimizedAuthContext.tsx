import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { safeCreateContext } from "../utils/reactLoader";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  Profile,
  loginUser,
  registerUser,
  fetchUserProfileQuick,
} from "@/services/authOperations";
import { measureAsyncPerformance } from "@/utils/performanceUtils";
// Simple logging for development
const devLog = (message: string, data?: unknown) => {
  if (import.meta.env.DEV) console.log(message, data);
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

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  initError: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ needsVerification?: boolean }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Split context into state and actions to prevent unnecessary re-renders
const AuthStateContext = safeCreateContext<AuthState | undefined>(undefined);
const AuthActionsContext = safeCreateContext<AuthActions | undefined>(
  undefined,
);

export const useAuthState = () => {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error("useAuthState must be used within an AuthProvider");
  }
  return context;
};

export const useAuthActions = () => {
  const context = useContext(AuthActionsContext);
  if (context === undefined) {
    throw new Error("useAuthActions must be used within an AuthProvider");
  }
  return context;
};

// Combined hook for backward compatibility
export const useAuth = () => {
  const state = useAuthState();
  const actions = useAuthActions();
  return { ...state, ...actions };
};

export const OptimizedAuthProvider: React.FC<{ children: React.ReactNode }> =
  React.memo(({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
      user: null,
      profile: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      isAdmin: false,
      initError: null,
    });

    const currentUserIdRef = useRef<string | null>(null);
    const authInitializedRef = useRef(false);

    // Optimized profile creation
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

    // Memoized actions to prevent re-renders
    const authActions = useMemo<AuthActions>(
      () => ({
        login: async (email: string, password: string) => {
          return measureAsyncPerformance("Login", async () => {
            setAuthState((prev) => ({
              ...prev,
              isLoading: true,
              initError: null,
            }));

            try {
              const result = await loginUser(email, password);
              devLog("✅ Login successful");
              // State will be updated by auth state change listener
              return result;
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : "Login failed";
              setAuthState((prev) => ({
                ...prev,
                isLoading: false,
                initError: errorMessage,
              }));
              throw error;
            }
          });
        },

        register: async (email: string, password: string, name: string) => {
          return measureAsyncPerformance("Register", async () => {
            setAuthState((prev) => ({
              ...prev,
              isLoading: true,
              initError: null,
            }));

            try {
              const result = await registerUser(email, password, name);
              devLog("✅ Registration successful");
              return result;
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : "Registration failed";
              setAuthState((prev) => ({
                ...prev,
                isLoading: false,
                initError: errorMessage,
              }));
              throw error;
            }
          });
        },

        logout: async () => {
          return measureAsyncPerformance("Logout", async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;

              // Reset state
              setAuthState({
                user: null,
                profile: null,
                session: null,
                isLoading: false,
                isAuthenticated: false,
                isAdmin: false,
                initError: null,
              });

              currentUserIdRef.current = null;
              devLog("✅ Logout successful");
            } catch (error) {
              console.error("❌ Logout error:", error);
              throw error;
            }
          });
        },

        refreshProfile: async () => {
          if (!authState.user) return;

          return measureAsyncPerformance("RefreshProfile", async () => {
            try {
              const updatedProfile = await fetchUserProfileQuick(
                authState.user,
              );

              if (updatedProfile) {
                setAuthState((prev) => ({ ...prev, profile: updatedProfile }));
                devLog("✅ Profile refreshed successfully");
              }
            } catch (error) {
              console.error("❌ Profile refresh failed:", error);
            }
          });
        },
      }),
      [authState.user, createFallbackProfile],
    );

    // Optimized auth state change handler
    const handleAuthStateChange = useCallback(
      async (session: Session | null, event?: string) => {
        try {
          devLog("🔄 Auth state change:", { event, userId: session?.user?.id });

          if (!session || !session.user) {
            setAuthState({
              user: null,
              profile: null,
              session: null,
              isLoading: false,
              isAuthenticated: false,
              isAdmin: false,
              initError: null,
            });
            currentUserIdRef.current = null;
            return;
          }

          const { user } = session;

          // Skip if same user to prevent unnecessary updates
          if (currentUserIdRef.current === user.id && authState.user) {
            setAuthState((prev) => ({ ...prev, session, isLoading: false }));
            return;
          }

          currentUserIdRef.current = user.id;

          // Set loading state
          setAuthState((prev) => ({
            ...prev,
            user,
            session,
            isLoading: true,
            isAuthenticated: true,
          }));

          // Load profile
          try {
            const profile =
              (await fetchUserProfileQuick(user)) ||
              createFallbackProfile(user);

            setAuthState((prev) => ({
              ...prev,
              profile,
              isAdmin: profile.isAdmin === true,
              isLoading: false,
            }));

            devLog("✅ Auth state updated successfully");
          } catch (error) {
            // Use fallback profile on error
            const fallbackProfile = createFallbackProfile(user);
            setAuthState((prev) => ({
              ...prev,
              profile: fallbackProfile,
              isAdmin: false,
              isLoading: false,
            }));

            console.warn("⚠️ Using fallback profile:", error);
          }
        } catch (error) {
          console.error("❌ Auth state change error:", error);
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            initError: "Authentication error occurred",
          }));
        }
      },
      [createFallbackProfile, authState.user],
    );

    // Initialize auth
    useEffect(() => {
      if (authInitializedRef.current) return;
      authInitializedRef.current = true;

      measureAsyncPerformance("InitializeAuth", async () => {
        try {
          // Get current session
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            console.warn("⚠�� Session retrieval error:", error);
            setAuthState((prev) => ({ ...prev, isLoading: false }));
            return;
          }

          await handleAuthStateChange(session, "INITIAL_SESSION");

          // Listen for auth changes
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange(async (event, session) => {
            await handleAuthStateChange(session, event);
          });

          devLog("✅ Auth initialized");

          return () => {
            subscription.unsubscribe();
          };
        } catch (error) {
          console.error("❌ Auth initialization error:", error);
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            initError: "Failed to initialize authentication",
          }));
        }
      });
    }, [handleAuthStateChange]);

    return (
      <AuthStateContext.Provider value={authState}>
        <AuthActionsContext.Provider value={authActions}>
          {children}
        </AuthActionsContext.Provider>
      </AuthStateContext.Provider>
    );
  });

OptimizedAuthProvider.displayName = "OptimizedAuthProvider";
