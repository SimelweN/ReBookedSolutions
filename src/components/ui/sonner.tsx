import React, { useEffect, useState } from "react";
import { Toaster as SonnerToaster, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

const Toaster = ({ ...props }: ToasterProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Defer mounting to avoid SSR/hydration issues and setState during render
    setIsMounted(true);
  }, []);

  // Don't render until after mount to prevent setState warnings
  if (!isMounted || typeof window === "undefined") {
    return null;
  }

  return (
    <SonnerToaster
      theme="light"
      className="toaster group"
      position="bottom-right"
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

Toaster.displayName = "Toaster";

export { Toaster, toast };
