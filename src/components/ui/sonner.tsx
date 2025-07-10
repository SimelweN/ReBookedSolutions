import React, { useEffect, useState, useRef } from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Use multiple async boundaries to ensure we're completely outside the render cycle
    const rafId = requestAnimationFrame(() => {
      const timeoutId = setTimeout(() => {
        // Only update state if component is still mounted
        if (mountedRef.current) {
          setShouldRender(true);
        }
      }, 100); // Increased delay to ensure render cycle completion

      // Store timeout ID for cleanup
      mountedRef.current && (mountedRef.current.timeoutId = timeoutId);
    });

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rafId);
      // Clear any pending timeout
      if (mountedRef.current?.timeoutId) {
        clearTimeout(mountedRef.current.timeoutId);
      }
    };
  }, []);

  // Don't render until we're safely outside the render cycle
  if (!shouldRender) {
    return null;
  }

  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
