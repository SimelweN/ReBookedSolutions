import React, { useEffect, useRef } from "react";
import { trackMemoryUsage, measurePerformance } from "@/utils/performanceUtils";

interface PerformanceMonitorProps {
  enabled?: boolean;
  trackMemory?: boolean;
  trackRender?: boolean;
  componentName?: string;
}

const PerformanceMonitor = React.memo<PerformanceMonitorProps>(
  ({
    enabled = import.meta.env.DEV,
    trackMemory = true,
    trackRender = true,
    componentName = "Unknown Component",
  }) => {
    const renderCount = useRef(0);
    const lastRenderTime = useRef(performance.now());
    const componentMountTime = useRef(performance.now());

    useEffect(() => {
      if (!enabled) return;

      renderCount.current += 1;
      const currentTime = performance.now();
      const renderTime = currentTime - lastRenderTime.current;
      const mountTime = currentTime - componentMountTime.current;

      if (trackRender) {
        console.log(`🔄 ${componentName} render #${renderCount.current}:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          totalTime: `${mountTime.toFixed(2)}ms`,
          timestamp: new Date().toISOString(),
        });
      }

      if (trackMemory && renderCount.current % 5 === 0) {
        trackMemoryUsage(componentName);
      }

      lastRenderTime.current = currentTime;

      // Cleanup function
      return () => {
        if (renderCount.current === 1) {
          console.log(
            `🏁 ${componentName} unmounted after ${mountTime.toFixed(2)}ms`,
          );
        }
      };
    });

    // Web Vitals tracking
    useEffect(() => {
      if (!enabled || typeof window === "undefined") return;

      // Track Largest Contentful Paint (LCP)
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log(`📊 LCP for ${componentName}:`, lastEntry.startTime);
      });

      try {
        observer.observe({ entryTypes: ["largest-contentful-paint"] });
      } catch (e) {
        // LCP not supported
      }

      return () => observer.disconnect();
    }, [enabled, componentName]);

    // Return null - this component doesn't render anything
    return null;
  },
);

PerformanceMonitor.displayName = "PerformanceMonitor";

export default PerformanceMonitor;

// HOC for wrapping components with performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
) => {
  const WrappedComponent = React.memo((props: P) => {
    return (
      <>
        <PerformanceMonitor
          componentName={
            componentName || Component.displayName || Component.name
          }
        />
        <Component {...props} />
      </>
    );
  });

  WrappedComponent.displayName = `withPerformanceMonitoring(${Component.displayName || Component.name})`;

  return WrappedComponent;
};
