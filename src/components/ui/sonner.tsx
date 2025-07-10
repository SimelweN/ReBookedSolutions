import React, { useEffect, useState } from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to defer rendering until after the current render cycle
    const rafId = requestAnimationFrame(() => {
      // Add an additional setTimeout to ensure we're completely outside the render cycle
      setTimeout(() => {
        setShouldRender(true);
      }, 0);
    });

    return () => {
      cancelAnimationFrame(rafId);
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
