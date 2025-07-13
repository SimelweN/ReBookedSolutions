import React, { useMemo } from "react";
import { Toaster as SonnerToaster, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

const Toaster = React.memo(({ ...props }: ToasterProps) => {
  // Ensure we're in a browser environment
  if (typeof window === "undefined") {
    return null;
  }

  // Memoize the toastOptions to prevent unnecessary re-renders
  const toastOptions = useMemo(
    () => ({
      classNames: {
        toast:
          "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        description: "group-[.toast]:text-muted-foreground",
        actionButton:
          "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
        cancelButton:
          "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
      },
    }),
    [],
  );

  // Memoize the entire component to prevent setState during render
  return useMemo(
    () => (
      <SonnerToaster
        theme="light"
        className="toaster group"
        position="bottom-right"
        toastOptions={toastOptions}
        {...props}
      />
    ),
    [toastOptions, props],
  );
});

Toaster.displayName = "Toaster";

export { Toaster, toast };
