import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt = '',
  className = '',
  style = {},
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3C/svg%3E',
  onError
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!imageRef) return;

    // Check if browser supports IntersectionObserver
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Start loading image
              const img = new Image();
              img.src = src;
              img.onload = () => {
                setImageSrc(src);
                setIsLoaded(true);
              };
              img.onerror = () => {
                // Use placeholder if loading fails
                setImageSrc(placeholder);
              };

              // Stop observing
              if (observerRef.current) {
                observerRef.current.disconnect();
              }
            }
          });
        },
        {
          rootMargin: '50px' // Start loading 50px early
        }
      );

      observerRef.current.observe(imageRef);
    } else {
      // Load directly if IntersectionObserver not supported
      setImageSrc(src);
      setIsLoaded(true);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [imageRef, src, placeholder]);

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      style={style}
      onError={onError}
      loading="lazy" // Native lazy loading as fallback
    />
  );
};