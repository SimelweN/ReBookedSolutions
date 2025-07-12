import React, { useEffect } from "react";

interface AccessibilityEnhancerProps {
  children: React.ReactNode;
}

const AccessibilityEnhancer: React.FC<AccessibilityEnhancerProps> = ({
  children,
}) => {
  useEffect(() => {
    // Skip to main content functionality
    const skipLink = document.createElement("a");
    skipLink.href = "#main-content";
    skipLink.textContent = "Skip to main content";
    skipLink.className =
      "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded";
    skipLink.style.cssText = `
      position: absolute;
      left: -10000px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;

    // Focus styles for skip link
    skipLink.addEventListener("focus", () => {
      skipLink.style.cssText = `
        position: fixed;
        top: 1rem;
        left: 1rem;
        z-index: 9999;
        background: #2563eb;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        text-decoration: none;
        font-weight: 500;
      `;
    });

    skipLink.addEventListener("blur", () => {
      skipLink.style.cssText = `
        position: absolute;
        left: -10000px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
    });

    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add main content ID if not present
    const mainContent =
      document.querySelector("main") || document.querySelector('[role="main"]');
    if (mainContent && !mainContent.id) {
      mainContent.id = "main-content";
    }

    // Improve focus management for modals and dropdowns
    const manageFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;

      // Ensure focus is visible
      if (
        target &&
        target.matches("button, a, input, select, textarea, [tabindex]")
      ) {
        target.style.outline = "2px solid #3b82f6";
        target.style.outlineOffset = "2px";

        // Remove outline after blur
        const removeOutline = () => {
          target.style.outline = "";
          target.style.outlineOffset = "";
          target.removeEventListener("blur", removeOutline);
        };
        target.addEventListener("blur", removeOutline);
      }
    };

    document.addEventListener("focusin", manageFocus);

    // Announce page changes for screen readers
    const announcePageChange = () => {
      const pageTitle = document.title;
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "status");
      announcement.setAttribute("aria-live", "polite");
      announcement.className = "sr-only";
      announcement.textContent = `Page loaded: ${pageTitle}`;

      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    };

    // Announce initial page load
    if (document.readyState === "complete") {
      announcePageChange();
    } else {
      window.addEventListener("load", announcePageChange);
    }

    // Cleanup
    return () => {
      document.removeEventListener("focusin", manageFocus);
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink);
      }
    };
  }, []);

  return <>{children}</>;
};

export default AccessibilityEnhancer;
