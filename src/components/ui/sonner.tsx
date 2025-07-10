import React, { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  // All hooks must be called at the top level, before any returns
  const [mounted, setMounted] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<string>("light");
  const { theme, systemTheme } = useTheme();

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

  // Wait for hydration to complete
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update resolved theme when theme changes
  useEffect(() => {
    if (mounted && theme) {
      const newTheme =
        theme === "system" ? systemTheme || "light" : theme || "light";
      setResolvedTheme(newTheme);
    }
  }, [mounted, theme, systemTheme]);

  // Don't render on server or before hydration
  if (!mounted) {
    return null;
  }

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={toastOptions}
      {...props}
    />
  );
};

export { Toaster, toast };
