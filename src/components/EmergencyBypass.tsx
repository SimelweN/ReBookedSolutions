import React, { useEffect } from "react";

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
        const element = content as HTMLElement;
        const className = element.className;
        // Check if className exists and is a string before calling includes
        if (
          className &&
          typeof className === "string" &&
          !className.includes("animate-spin")
        ) {
          element.style.display = "";
        } else if (!className) {
          // If no className, it's safe to show (not a spinner)
          element.style.display = "";
        }
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return <>{children}</>;
};

export default EmergencyBypass;
