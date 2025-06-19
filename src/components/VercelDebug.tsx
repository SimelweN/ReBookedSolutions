import { useEffect, useState } from "react";

/**
 * Debug component to verify Vercel Analytics and Speed Insights integration
 * This component will be removed after verification
 */
const VercelDebug = () => {
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  const [speedInsightsLoaded, setSpeedInsightsLoaded] = useState(false);

  useEffect(() => {
    // Check if Vercel Analytics is loaded
    const checkAnalytics = () => {
      if (typeof window !== "undefined") {
        // Check for Vercel Analytics script or global variables
        const scripts = Array.from(document.scripts);
        const hasAnalyticsScript = scripts.some(
          (script) =>
            script.src.includes("vercel") || script.src.includes("analytics"),
        );

        if (hasAnalyticsScript || (window as any).va) {
          setAnalyticsLoaded(true);
        }
      }
    };

    // Check if Speed Insights is loaded
    const checkSpeedInsights = () => {
      if (typeof window !== "undefined") {
        const scripts = Array.from(document.scripts);
        const hasSpeedInsightsScript = scripts.some(
          (script) =>
            script.src.includes("speed-insights") ||
            script.src.includes("vitals"),
        );

        if (hasSpeedInsightsScript || (window as any).webVitals) {
          setSpeedInsightsLoaded(true);
        }
      }
    };

    // Initial check
    checkAnalytics();
    checkSpeedInsights();

    // Delayed check to account for async loading
    const timeout = setTimeout(() => {
      checkAnalytics();
      checkSpeedInsights();
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-3 shadow-lg z-50 text-xs">
      <div className="font-semibold mb-2">Vercel Integration Status</div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${analyticsLoaded ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <span>Analytics: {analyticsLoaded ? "Loaded" : "Loading..."}</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${speedInsightsLoaded ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <span>
            Speed Insights: {speedInsightsLoaded ? "Loaded" : "Loading..."}
          </span>
        </div>
      </div>
      <div className="text-gray-500 mt-2">Deploy to Vercel to see data</div>
    </div>
  );
};

export default VercelDebug;
