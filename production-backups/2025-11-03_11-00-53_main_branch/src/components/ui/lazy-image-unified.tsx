import React, { useState, useRef, useEffect } from 'react';

interface LazyImageUnifiedProps {
  src: string;
  alt?: string;
  className?: string;
  placeholder?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoad?: () => void;
  style?: React.CSSProperties;
  isBackgroundImage?: boolean;
  children?: React.ReactNode;
}

export const LazyImageUnified: React.FC<LazyImageUnifiedProps> = ({
  src,
  alt = '',
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==',
  onError,
  onLoad,
  style,
  isBackgroundImage = false,
  children
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement | HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    onError?.(e);
  };

  const errorPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZjlmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNjY2NjY2MiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNjY2NjY2MiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZhaWxlZDwvdGV4dD48L3N2Zz4=';

  // 如果是背景图片模式
  if (isBackgroundImage) {
    return (
      <div
        ref={imgRef as React.RefObject<HTMLDivElement>}
        className={`relative overflow-hidden ${className}`}
        style={{
          ...style,
          backgroundImage: hasError ? `url(${errorPlaceholder})` : (isInView ? `url(${src})` : `url(${placeholder})`),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Loading overlay */}
        {isInView && !isLoaded && !hasError && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        {children}
      </div>
    );
  }

  // 普通图片模式
  return (
    <div className="relative overflow-hidden">
      <img
        ref={imgRef as React.RefObject<HTMLImageElement>}
        src={hasError ? errorPlaceholder : (isInView ? src : placeholder)}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded && !hasError ? 'opacity-100' : 'opacity-70'
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        style={style}
      />

      {/* Loading overlay */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};