// Comment Image Gallery - 评论图片展示组件（小红书风格）

import React, { useState } from 'react';
import { useImagePreview } from '../../contexts/ImagePreviewContext';

interface CommentImageGalleryProps {
  images: string[];
  className?: string;
}

export const CommentImageGallery: React.FC<CommentImageGalleryProps> = ({
  images,
  className = ''
}) => {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set());
  const { openPreview } = useImagePreview();

  if (!images || images.length === 0) return null;

  // 处理图片加载
  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  // 处理图片开始加载
  const handleImageLoadStart = (index: number) => {
    setLoadingImages(prev => new Set(prev).add(index));
  };

  // 处理图片点击预览
  const handleImageClick = (index: number) => {
    openPreview(images[index], `图片 ${index + 1}`);
  };

  // 根据图片数量决定布局 - 参考小红书/微信朋友圈布局
  const getGridLayout = () => {
    const count = images.length;

    if (count === 1) {
      return 'grid-cols-1';
    } else if (count === 2) {
      return 'grid-cols-2';
    } else if (count === 3) {
      return 'grid-cols-3';
    } else if (count === 4) {
      return 'grid-cols-2'; // 2x2
    } else if (count <= 6) {
      return 'grid-cols-3'; // 3x2 或 3x1
    } else {
      return 'grid-cols-3'; // 3x3
    }
  };

  // 获取每个图片的样式
  const getImageStyle = (index: number) => {
    const count = images.length;

    // 单图：适中尺寸，保持长宽比
    if (count === 1) {
      return {
        aspectRatio: '16/10', // 更协调的比例
        maxWidth: '320px',
        maxHeight: '200px',
        minWidth: '240px',
        minHeight: '150px'
      };
    }

    // 2张图：适中的正方形，电脑端更舒适
    if (count === 2) {
      return {
        aspectRatio: '1/1',
        width: '140px',
        height: '140px'
      };
    }

    // 3张图：正方形，电脑端友好尺寸
    if (count === 3) {
      return {
        aspectRatio: '1/1',
        width: '120px',
        height: '120px'
      };
    }

    // 4张及以上：保持紧凑但提升视觉效果
    return {
      aspectRatio: '1/1',
      width: '110px',
      height: '110px'
    };
  };

  // 渲染更多图片指示器
  const renderMoreIndicator = (index: number) => {
    const remaining = images.length - index;
    if (remaining <= 1) return null;

    return (
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 backdrop-blur-[1px] flex items-center justify-center">
        <div className="text-center">
          <span className="text-white text-xl font-bold [font-family:'Lato',Helvetica] drop-shadow-lg">
            +{remaining - 1}
          </span>
          <div className="text-white text-xs mt-1 opacity-90">
            更多
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`mt-3 ${className}`}>
      <div className={`grid gap-2 ${getGridLayout()} w-fit`}>
        {images.slice(0, 9).map((imageUrl, index) => {
          const isLoading = loadingImages.has(index);
          const isLoaded = loadedImages.has(index);
          const showMoreIndicator = index === 8 && images.length > 9;

          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-md cursor-pointer group transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-[0.97] bg-gray-100"
              style={getImageStyle(index)}
              onClick={() => handleImageClick(index)}
            >
              {/* 加载状态 */}
              {isLoading && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                </div>
              )}

              {/* 图片 */}
              <img
                src={imageUrl}
                alt={`评论图片 ${index + 1}`}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoadStart={() => handleImageLoadStart(index)}
                onLoad={() => handleImageLoad(index)}
                onError={() => {
                  setLoadingImages(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(index);
                    return newSet;
                  });
                }}
                loading="lazy"
              />

              {/* 悬停效果 */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300"></div>

              {/* 更多图片指示器 */}
              {showMoreIndicator && renderMoreIndicator(index)}

              {/* 放大图标 - 更优雅的设计 */}
              <div className="absolute top-2 right-2 w-7 h-7 bg-black bg-opacity-40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-opacity-60">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* 图片数量提示 */}
      {images.length > 1 && (
        <div className="mt-2.5 text-xs text-gray-500 [font-family:'Lato',Helvetica] flex items-center gap-1">
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{images.length} 张图片</span>
        </div>
      )}
    </div>
  );
};

export default CommentImageGallery;