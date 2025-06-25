import * as React from "react";
import { useEffect } from "react";

// Emergency component to bypass all loading states
const EmergencyBypass: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    // Force bypass any loading states after 100ms
    const timeout = setTimeout(() => {
      // Find and hide any loading spinners
      const spinners = document.querySelectorAll(
        '[class*="animate-spin"], [class*="spinner"], [class*="loading"]',
      );
      spinners.forEach((spinner) => {
        (spinner as HTMLElement).style.display = "none";
      });

      // Show any hidden content
      const hiddenContent = document.querySelectorAll(
        '[style*="display: none"]',
      );
      hiddenContent.forEach((content) => {
        if (!content.className.includes("animate-spin")) {
          (content as HTMLElement).style.display = "";
        }
      });

      console.log("🚀 Emergency bypass activated - forced loading resolution");
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return <>{children}</>;
};

export default EmergencyBypass;
