import React, { useEffect, useState } from "react";
import { trackMemoryUsage } from "@/utils/performanceUtils";

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  domContentLoaded?: number;
  windowLoad?: number;
  bundleSize?: number;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
}

interface PerformanceMetricsProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  displayInConsole?: boolean;
}

const PerformanceMetrics = React.memo<PerformanceMetricsProps>(
  ({ onMetricsUpdate, displayInConsole = import.meta.env.DEV }) => {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({});

    useEffect(() => {
      if (!displayInConsole && !onMetricsUpdate) return;

      const collectMetrics = () => {
        const newMetrics: PerformanceMetrics = {};

        // Navigation timing
        const navigation = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          newMetrics.ttfb = navigation.responseStart - navigation.requestStart;
          newMetrics.domContentLoaded =
            navigation.domContentLoadedEventEnd - navigation.navigationStart;
          newMetrics.windowLoad =
            navigation.loadEventEnd - navigation.navigationStart;
        }

        // Paint timing
        const paintEntries = performance.getEntriesByType("paint");
        const fcpEntry = paintEntries.find(
          (entry) => entry.name === "first-contentful-paint",
        );
        if (fcpEntry) {
          newMetrics.fcp = fcpEntry.startTime;
        }

        // Memory usage (Chrome only)
        if ("memory" in performance) {
          const memory = (performance as any).memory;
          newMetrics.memoryUsage = {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit,
          };
        }

        setMetrics(newMetrics);
        onMetricsUpdate?.(newMetrics);

        if (displayInConsole) {
          console.group("📊 Performance Metrics");
          console.log(
            "First Contentful Paint:",
            newMetrics.fcp ? `${newMetrics.fcp.toFixed(2)}ms` : "N/A",
          );
          console.log(
            "Time to First Byte:",
            newMetrics.ttfb ? `${newMetrics.ttfb.toFixed(2)}ms` : "N/A",
          );
          console.log(
            "DOM Content Loaded:",
            newMetrics.domContentLoaded
              ? `${newMetrics.domContentLoaded.toFixed(2)}ms`
              : "N/A",
          );
          console.log(
            "Window Load:",
            newMetrics.windowLoad
              ? `${newMetrics.windowLoad.toFixed(2)}ms`
              : "N/A",
          );

          if (newMetrics.memoryUsage) {
            console.log("Memory Usage:", {
              used: `${(newMetrics.memoryUsage.used / 1048576).toFixed(2)}MB`,
              total: `${(newMetrics.memoryUsage.total / 1048576).toFixed(2)}MB`,
              limit: `${(newMetrics.memoryUsage.limit / 1048576).toFixed(2)}MB`,
            });
          }
          console.groupEnd();
        }
      };

      // Collect initial metrics
      if (document.readyState === "complete") {
        collectMetrics();
      } else {
        window.addEventListener("load", collectMetrics);
      }

      // Set up observers for Core Web Vitals
      if ("PerformanceObserver" in window) {
        // Largest Contentful Paint
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            setMetrics((prev) => ({ ...prev, lcp: lastEntry.startTime }));

            if (displayInConsole) {
              console.log("📊 LCP:", `${lastEntry.startTime.toFixed(2)}ms`);
            }
          });
          lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
        } catch (e) {
          // LCP not supported
        }

        // First Input Delay
        try {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            for (const entry of entries) {
              const fid = entry.processingStart - entry.startTime;
              setMetrics((prev) => ({ ...prev, fid }));

              if (displayInConsole) {
                console.log("📊 FID:", `${fid.toFixed(2)}ms`);
              }
            }
          });
          fidObserver.observe({ entryTypes: ["first-input"] });
        } catch (e) {
          // FID not supported
        }

        // Cumulative Layout Shift
        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            setMetrics((prev) => ({ ...prev, cls: clsValue }));

            if (displayInConsole && clsValue > 0) {
              console.log("📊 CLS:", clsValue.toFixed(4));
            }
          });
          clsObserver.observe({ entryTypes: ["layout-shift"] });
        } catch (e) {
          // CLS not supported
        }
      }

      // Track bundle size (approximate)
      if (import.meta.env.DEV) {
        const scripts = document.querySelectorAll("script[src]");
        let totalSize = 0;

        scripts.forEach((script) => {
          // This is an approximation - in a real scenario you'd need build tools to provide this
          totalSize += 100; // Placeholder
        });

        setMetrics((prev) => ({ ...prev, bundleSize: totalSize }));
      }

      return () => {
        window.removeEventListener("load", collectMetrics);
      };
    }, [displayInConsole, onMetricsUpdate]);

    // Track memory periodically
    useEffect(() => {
      if (!displayInConsole) return;

      const interval = setInterval(() => {
        trackMemoryUsage("Global");
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }, [displayInConsole]);

    // This component doesn't render anything
    return null;
  },
);

PerformanceMetrics.displayName = "PerformanceMetrics";

export default PerformanceMetrics;

// Performance scoring utility
export const calculatePerformanceScore = (
  metrics: PerformanceMetrics,
): number => {
  let score = 100;

  // FCP scoring (0-2000ms is good)
  if (metrics.fcp) {
    if (metrics.fcp > 3000) score -= 20;
    else if (metrics.fcp > 2000) score -= 10;
  }

  // LCP scoring (0-2500ms is good)
  if (metrics.lcp) {
    if (metrics.lcp > 4000) score -= 25;
    else if (metrics.lcp > 2500) score -= 15;
  }

  // FID scoring (0-100ms is good)
  if (metrics.fid) {
    if (metrics.fid > 300) score -= 20;
    else if (metrics.fid > 100) score -= 10;
  }

  // CLS scoring (0-0.1 is good)
  if (metrics.cls) {
    if (metrics.cls > 0.25) score -= 25;
    else if (metrics.cls > 0.1) score -= 15;
  }

  // TTFB scoring (0-200ms is good)
  if (metrics.ttfb) {
    if (metrics.ttfb > 600) score -= 15;
    else if (metrics.ttfb > 200) score -= 8;
  }

  return Math.max(0, score);
};

// Performance recommendations
export const getPerformanceRecommendations = (
  metrics: PerformanceMetrics,
): string[] => {
  const recommendations: string[] = [];

  if (metrics.fcp && metrics.fcp > 2000) {
    recommendations.push(
      "Optimize First Contentful Paint by reducing render-blocking resources",
    );
  }

  if (metrics.lcp && metrics.lcp > 2500) {
    recommendations.push(
      "Improve Largest Contentful Paint by optimizing images and critical resources",
    );
  }

  if (metrics.fid && metrics.fid > 100) {
    recommendations.push(
      "Reduce First Input Delay by minimizing main thread work",
    );
  }

  if (metrics.cls && metrics.cls > 0.1) {
    recommendations.push(
      "Minimize Cumulative Layout Shift by setting dimensions on images and dynamic content",
    );
  }

  if (metrics.ttfb && metrics.ttfb > 200) {
    recommendations.push(
      "Optimize Time to First Byte by improving server response times",
    );
  }

  if (
    metrics.memoryUsage &&
    metrics.memoryUsage.used / metrics.memoryUsage.limit > 0.8
  ) {
    recommendations.push(
      "High memory usage detected - consider reducing JavaScript bundle size",
    );
  }

  return recommendations;
};
