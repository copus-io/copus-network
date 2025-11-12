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
  placeholder = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  children
}) => {
  const [backgroundImage, setBackgroundImage] = useState<string>(placeholder);
  const [elementRef, setElementRef] = useState<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!elementRef) return;

    // Check if browser supports IntersectionObserver
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
                // Keep placeholder background if loading fails
                setBackgroundImage(placeholder);
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

      observerRef.current.observe(elementRef);
    } else {
      // Load directly if IntersectionObserver not supported
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