import React, { useRef, useEffect, useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  placeholder?: string;
  priority?: boolean;
  sizes?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = "",
  aspectRatio = "16 / 9",
  placeholder = "#f5f5f5",
  priority = false,
}) => {
  const [inView, setInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px', threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [priority]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ aspectRatio }}
    >
      {/* Placeholder background - always visible behind the image */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor: placeholder }}
      />

      {/* Image rendered as background-image - handles its own loading */}
      {inView && src && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${CSS.escape ? src : src})` }}
          role="img"
          aria-label={alt}
        />
      )}
    </div>
  );
};
