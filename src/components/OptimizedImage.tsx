import React, { useState, useRef, useEffect } from "react";
import {
  createIntersectionObserver,
  optimizeImageSrc,
} from "@/utils/performanceUtils";
import { cn } from "@/lib/utils";

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
}

const OptimizedImage = React.memo<OptimizedImageProps>(
  ({
    src,
    alt,
    width,
    height,
    priority = false,
    fallbackSrc,
    className,
    containerClassName,
    loading = "lazy",
    ...props
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(priority);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
      if (priority || shouldLoad) return;

      const observer = createIntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setShouldLoad(true);
              observer?.disconnect();
            }
          });
        },
        { rootMargin: "50px" },
      );

      if (containerRef.current && observer) {
        observer.observe(containerRef.current);
      }

      return () => observer?.disconnect();
    }, [priority, shouldLoad]);

    const handleLoad = () => {
      setIsLoaded(true);
    };

    const handleError = () => {
      setHasError(true);
      if (fallbackSrc) {
        setIsLoaded(true);
      }
    };

    const optimizedSrc = optimizeImageSrc(src, width, height);
    const displaySrc = hasError && fallbackSrc ? fallbackSrc : optimizedSrc;

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative overflow-hidden flex flex-col",
          containerClassName,
        )}
        style={{ width, height }}
      >
        {/* Loading placeholder */}
        {!isLoaded && shouldLoad && (
          <div
            className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center"
            style={{ width, height }}
          >
            <div className="text-xs text-gray-400">Loading...</div>
          </div>
        )}

        {/* Actual image */}
        {shouldLoad && (
          <img
            ref={imgRef}
            src={displaySrc}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-300",
              "max-sm:mx-auto",
              isLoaded ? "opacity-100" : "opacity-0",
              className,
            )}
            {...props}
          />
        )}

        {/* Error state */}
        {hasError && !fallbackSrc && (
          <div
            className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 text-xs"
            style={{ width, height }}
          >
            <span>Image unavailable</span>
          </div>
        )}
      </div>
    );
  },
);

OptimizedImage.displayName = "OptimizedImage";

export default OptimizedImage;
