import React, { useEffect } from "react";

interface MobileOptimizerProps {
  children: React.ReactNode;
}

const MobileOptimizer: React.FC<MobileOptimizerProps> = ({ children }) => {
  useEffect(() => {
    // Optimize mobile viewport handling
    const handleViewportChange = () => {
      // Prevent zoom on input focus
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
        );
      }

      // Fix iOS viewport height issue
      const updateVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
      };

      updateVH();
      window.addEventListener("resize", updateVH);
      window.addEventListener("orientationchange", updateVH);

      return () => {
        window.removeEventListener("resize", updateVH);
        window.removeEventListener("orientationchange", updateVH);
      };
    };

    // Only apply mobile optimizations on mobile devices
    if (window.innerWidth <= 768) {
      handleViewportChange();
    }

    // Prevent pull-to-refresh on mobile
    let startY = 0;
    const preventPullToRefresh = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const clientY = e.touches[0].clientY - startY;

      if (window.scrollY === 0 && clientY > 0) {
        e.preventDefault();
      }
    };

    const setStartY = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    document.addEventListener("touchstart", setStartY, { passive: false });
    document.addEventListener("touchmove", preventPullToRefresh, {
      passive: false,
    });

    return () => {
      document.removeEventListener("touchstart", setStartY);
      document.removeEventListener("touchmove", preventPullToRefresh);
    };
  }, []);

  return <>{children}</>;
};

export default MobileOptimizer;
