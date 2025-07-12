import { useState, useEffect, useContext } from "react";

// Create a safe auth hook that doesn't throw if context is missing
export const useSafeAuth = () => {
  const [authState, setAuthState] = useState<{
    user: any;
    isLoading: boolean;
    isReady: boolean;
  }>({
    user: null,
    isLoading: true,
    isReady: false,
  });

  useEffect(() => {
    // Dynamic import to avoid context dependency issues
    const loadAuth = async () => {
      try {
        const { useAuth } = await import("@/contexts/AuthContext");
        const authData = useAuth();
        setAuthState({
          user: authData.user,
          isLoading: false,
          isReady: true,
        });
      } catch (error) {
        console.warn("Auth context not available:", error);
        setAuthState({
          user: null,
          isLoading: false,
          isReady: true,
        });
      }
    };

    loadAuth();
  }, []);

  return authState;
};
