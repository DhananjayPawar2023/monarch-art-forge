import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: "square" | "portrait" | "landscape" | "video";
  priority?: boolean;
}

const aspectRatioClasses = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[3/2]",
  video: "aspect-video",
};

const OptimizedImage = ({
  src,
  alt,
  className,
  aspectRatio = "portrait",
  priority = false,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden bg-muted/30",
        aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {/* Blur placeholder */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30 transition-opacity duration-500",
          isLoaded ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setIsLoaded(true)}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Subtle overlay for dark mode - museum frame effect */}
      <div className="absolute inset-0 pointer-events-none dark:shadow-[inset_0_0_40px_10px_rgba(0,0,0,0.2)]" />
    </div>
  );
};

export default OptimizedImage;
