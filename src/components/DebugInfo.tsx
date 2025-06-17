import { useAuth } from "@/contexts/AuthContext";
import { ENV } from "@/config/environment";

const DebugInfo = () => {
  const { isLoading, user, initError, isAuthenticated } = useAuth();

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        left: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        zIndex: 9999,
        maxWidth: "300px",
        fontFamily: "monospace",
      }}
    >
      <div>
        <strong>🐛 Debug Info</strong>
      </div>
      <div>Loading: {isLoading ? "Yes" : "No"}</div>
      <div>Authenticated: {isAuthenticated ? "Yes" : "No"}</div>
      <div>User: {user ? "Present" : "None"}</div>
      <div>Init Error: {initError || "None"}</div>
      <div>Supabase URL: {ENV.VITE_SUPABASE_URL ? "Set" : "Missing"}</div>
      <div>Supabase Key: {ENV.VITE_SUPABASE_ANON_KEY ? "Set" : "Missing"}</div>
      <div>Node Env: {ENV.NODE_ENV}</div>
      <div>Page: {window.location.pathname}</div>
    </div>
  );
};

export default DebugInfo;
