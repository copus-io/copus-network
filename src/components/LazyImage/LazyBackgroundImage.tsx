import React, { useState, useEffect, useRef } from 'react';

interface LazyBackgroundImageProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  children?: React.ReactNode;
}

export const LazyBackgroundImage: React.FC<LazyBackgroundImageProps> = ({
  src,
  className = '',
  style = {},
  placeholder = 'none', // No placeholder image - just empty
  children
}) => {
  const [backgroundImage, setBackgroundImage] = useState<string>(src ? placeholder : 'none');
  const [elementRef, setElementRef] = useState<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(!src); // Already "loaded" if no src
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // If no src provided, don't try to load anything
    if (!src) {
      setBackgroundImage('none');
      setIsLoaded(true);
      return;
    }

    if (!elementRef) return;

    // If browser supports IntersectionObserver
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Preload image
              const img = new Image();
              img.src = src;
              img.onload = () => {
                setBackgroundImage(`url(${src})`);
                setIsLoaded(true);
              };
              img.onerror = () => {
                // If loading fails, show nothing (no placeholder)
                setBackgroundImage('none');
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

      observerRef.current.observe(elementRef);
    } else {
      // If IntersectionObserver not supported, load directly
      setBackgroundImage(`url(${src})`);
      setIsLoaded(true);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [elementRef, src, placeholder]);

  return (
    <div
      ref={setElementRef}
      className={`${className} transition-opacity duration-500 ${
        isLoaded ? 'opacity-100' : 'opacity-90'
      }`}
      style={{
        ...style,
        backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {children}
    </div>
  );
};