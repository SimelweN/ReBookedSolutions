import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingFallbackProps {
  type?: "page" | "card" | "list" | "table" | "compact" | "fullscreen";
  message?: string;
  showMessage?: boolean;
  count?: number;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  type = "page",
  message = "Loading...",
  showMessage = true,
  count = 3,
}) => {
  if (type === "fullscreen") {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-book-600 mx-auto mb-4"></div>
          {showMessage && (
            <p className="text-gray-600 font-medium">{message}</p>
          )}
        </div>
      </div>
    );
  }

  if (type === "compact") {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-book-600"></div>
          {showMessage && (
            <span className="text-sm text-gray-600">{message}</span>
          )}
        </div>
      </div>
    );
  }

  if (type === "card") {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === "list") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-4 p-3 border rounded-lg"
          >
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="w-full">
        <div className="border rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="bg-gray-50 p-4 border-b">
            <div className="flex space-x-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Table rows */}
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0">
              <div className="flex space-x-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default 'page' type
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-book-600 mx-auto mb-6"></div>
        {showMessage && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{message}</h3>
            <p className="text-gray-600">
              Please wait while we load your content
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingFallback;
