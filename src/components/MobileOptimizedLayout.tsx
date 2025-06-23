import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/utils/performanceUtils";

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
  enableVirtualization?: boolean;
}

const MobileOptimizedLayout = React.memo<MobileOptimizedLayoutProps>(
  ({ children, className, enableVirtualization = false }) => {
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
      // Detect mobile device
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      // Check reduced motion preference
      setReducedMotion(prefersReducedMotion());

      checkMobile();
      window.addEventListener("resize", checkMobile);

      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Scroll to top on route change (mobile optimization)
    useEffect(() => {
      if (isMobile && !reducedMotion) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.scrollTo(0, 0);
      }
    }, [location.pathname, isMobile, reducedMotion]);

    const containerClasses = cn(
      "mobile-optimize", // Apply mobile optimizations from CSS
      "min-h-screen",
      "relative",
      // Conditional classes based on device
      isMobile && [
        "touch-target", // Ensure proper touch targets
        "overflow-x-hidden", // Prevent horizontal scroll
      ],
      // Performance optimizations
      enableVirtualization && "contain-layout",
      !reducedMotion && "scroll-smooth",
      className,
    );

    return (
      <div className={containerClasses}>
        {/* Mobile-specific optimizations */}
        {isMobile && (
          <>
            {/* Viewport meta optimization */}
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
            />

            {/* Touch action optimization */}
            <style>{`
            body {
              touch-action: manipulation;
              -webkit-text-size-adjust: 100%;
            }
          `}</style>
          </>
        )}

        <main className="relative z-10">{children}</main>
      </div>
    );
  },
);

MobileOptimizedLayout.displayName = "MobileOptimizedLayout";

export default MobileOptimizedLayout;

// Hook for mobile detection
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet };
};

// Hook for performance-aware rendering
export const usePerformanceAwareRendering = (threshold = 1000) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Use requestIdleCallback for non-critical rendering
    if ("requestIdleCallback" in window) {
      const handle = requestIdleCallback(() => setShouldRender(true), {
        timeout: threshold,
      });

      return () => cancelIdleCallback(handle);
    } else {
      // Fallback for browsers without requestIdleCallback
      const timeout = setTimeout(() => setShouldRender(true), 100);
      return () => clearTimeout(timeout);
    }
  }, [threshold]);

  return shouldRender;
};
