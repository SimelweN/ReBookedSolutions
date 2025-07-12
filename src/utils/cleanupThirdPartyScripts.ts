// Utility to clean up problematic third-party scripts and prevent errors

export const cleanupThirdPartyScripts = () => {
  // Remove FullStory scripts if they exist
  const fullstoryScripts = document.querySelectorAll(
    'script[src*="fullstory.com"]',
  );
  fullstoryScripts.forEach((script) => {
    console.log("Removing FullStory script to prevent errors");
    script.remove();
  });

  // Remove any scripts that might be causing fetch errors
  const problematicScripts = document.querySelectorAll(
    'script[src*="edge.fullstory.com"]',
  );
  problematicScripts.forEach((script) => {
    console.log("Removing problematic script:", script.src);
    script.remove();
  });

  // Disable FullStory if it exists globally
  if (typeof (window as any).FS !== "undefined") {
    console.log("Disabling FullStory to prevent fetch errors");
    try {
      (window as any).FS = {
        identify: () => {},
        event: () => {},
        log: () => {},
        getCurrentSession: () => null,
        getCurrentSessionURL: () => null,
        shutdown: () => {},
      };
    } catch (error) {
      console.warn("Could not disable FullStory:", error);
    }
  }

  // Block any new FullStory scripts from loading
  const originalAppendChild = document.head.appendChild;
  document.head.appendChild = function (newChild: any) {
    if (
      newChild.tagName === "SCRIPT" &&
      newChild.src &&
      (newChild.src.includes("fullstory.com") || newChild.src.includes("fs.js"))
    ) {
      console.log("Blocked FullStory script from loading");
      return newChild;
    }
    return originalAppendChild.call(this, newChild);
  };
};

// Run cleanup when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", cleanupThirdPartyScripts);
} else {
  cleanupThirdPartyScripts();
}

// Also run cleanup periodically to catch any dynamically added scripts
setInterval(cleanupThirdPartyScripts, 5000);
