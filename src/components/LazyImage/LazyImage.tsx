import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  sizes?: string; // For responsive images
  quality?: 'low' | 'medium' | 'high'; // Image quality hint
}

// Helper function to optimize image URLs
const optimizeImageUrl = (url: string, quality: 'low' | 'medium' | 'high' = 'medium'): string => {
  if (!url) return url;

  // For external images, return as-is (could add query params for supported services)
  if (url.startsWith('http') && !url.includes('copus.network')) {
    return url;
  }

  // For internal images, could add quality parameters if backend supports
  const qualityMap = { low: 60, medium: 80, high: 95 };
  return url; // Placeholder for future image optimization service
};

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt = '',
  className = '',
  style = {},
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3C/svg%3E',
  onError,
  sizes,
  quality = 'medium'
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!imageRef) return;

    // 如果浏览器支持 IntersectionObserver
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Start loading image with optimization
              const optimizedSrc = optimizeImageUrl(src, quality);
              const img = new Image();

              // Add decode hint for better performance
              if ('decode' in img) {
                img.src = optimizedSrc;
                img.decode().then(() => {
                  setImageSrc(optimizedSrc);
                  setIsLoaded(true);
                }).catch(() => {
                  setImageSrc(placeholder);
                  setHasError(true);
                  setIsLoaded(true);
                });
              } else {
                // Fallback for older browsers
                img.onload = () => {
                  setImageSrc(optimizedSrc);
                  setIsLoaded(true);
                };
                img.onerror = () => {
                  setImageSrc(placeholder);
                  setHasError(true);
                  setIsLoaded(true);
                };
                img.src = optimizedSrc;
              }

              // 停止观察
              if (observerRef.current) {
                observerRef.current.disconnect();
              }
            }
          });
        },
        {
          rootMargin: '100px', // Increased from 50px to 100px for better preloading
          threshold: 0.1 // Load when 10% visible instead of any pixel
        }
      );

      observerRef.current.observe(imageRef);
    } else {
      // 如果不支持 IntersectionObserver，直接加载
      setImageSrc(src);
      setIsLoaded(true);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [imageRef, src, placeholder, quality]);

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      style={style}
      sizes={sizes}
      onError={onError}
      loading="lazy" // 原生懒加载作为后备
      decoding="async" // Hint for better decoding performance
      fetchPriority={quality === 'high' ? 'high' : 'auto'} // Priority hint for critical images
    />
  );
};