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
  placeholder = '', // No placeholder - empty by default
  onError
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src ? placeholder : '');
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(!src); // Already "loaded" if no src
  const [hasError, setHasError] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // If no src provided, don't try to load anything
    if (!src) {
      setImageSrc('');
      setIsLoaded(true);
      return;
    }

    if (!imageRef) return;

    // If browser supports IntersectionObserver
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
                // If loading fails, show nothing (no placeholder)
                setImageSrc('');
                setHasError(true);
                setIsLoaded(true);
              };

              // Stop observing
              if (observerRef.current) {
                observerRef.current.disconnect();
              }
            }
          });
        },
        {
          rootMargin: '50px' // Start loading 50px before visible
        }
      );

      observerRef.current.observe(imageRef);
    } else {
      // If IntersectionObserver not supported, load directly
      setImageSrc(src);
      setIsLoaded(true);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [imageRef, src, placeholder]);

  // Don't render anything if no src or if there was an error
  if (!src || hasError) {
    return null;
  }

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
      loading="lazy" // 原生懒加载作为后备
    />
  );
};