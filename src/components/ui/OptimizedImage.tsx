import React from 'react';

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
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ aspectRatio }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: src ? `url(${src})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: placeholder,
        }}
        role="img"
        aria-label={alt}
      />
    </div>
  );
};
