import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const LoadingSpinner = React.memo<LoadingSpinnerProps>(
  ({ size = "md", className, text }) => {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <Loader2
          className={cn(
            "animate-spin text-book-600",
            sizeClasses[size],
            className,
          )}
        />
        {text && <p className="text-sm text-gray-600 animate-pulse">{text}</p>}
      </div>
    );
  },
);

LoadingSpinner.displayName = "LoadingSpinner";

export default LoadingSpinner;
