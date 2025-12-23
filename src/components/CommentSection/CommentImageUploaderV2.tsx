// Comment Image Uploader V2 - 改进的用户体验版本

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { validateImageFile, compressImage, createImagePreview, revokeImagePreview } from '../../utils/imageUtils';
import { useImagePreview } from '../../contexts/ImagePreviewContext';

interface CommentImage {
  id: string;
  file: File;
  previewUrl: string;
  uploadUrl?: string;
  isUploading?: boolean;
  error?: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  originalSize?: number;
  finalSize?: number;
}

interface CommentImageUploaderProps {
  maxImages?: number;
  onImagesChange: (images: CommentImage[]) => void;
  onUploadStart?: () => void;
  onUploadComplete?: (images: CommentImage[]) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface CommentImageUploaderRef {
  triggerFileSelect: () => void;
  clearImages: () => void;
}

export const CommentImageUploaderV2 = forwardRef<CommentImageUploaderRef, CommentImageUploaderProps>(({
  maxImages = 9,
  onImagesChange,
  onUploadStart,
  onUploadComplete,
  onError,
  disabled = false,
  className = ''
}, ref) => {

  const [images, setImages] = useState<CommentImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { openPreview } = useImagePreview();

  // 清理所有图片和状态
  const clearAllImages = () => {
    // 清理所有预览URL，防止内存泄漏
    images.forEach(image => {
      if (image.previewUrl) {
        revokeImagePreview(image.previewUrl);
      }
    });

    // 重置状态
    setImages([]);
    setIsProcessing(false);

    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // 通知父组件
    onImagesChange([]);

    console.log('🧹 图片缓存已清理');
  };

  useImperativeHandle(ref, () => ({
    triggerFileSelect: () => {
      fileInputRef.current?.click();
    },
    clearImages: clearAllImages
  }), [images, onImagesChange]);

  // 🎯 智能文件预处理
  const preprocessFiles = (files: File[]) => {
    const result = {
      valid: [] as File[],
      oversized: [] as File[],
      invalid: [] as { file: File; reason: string }[]
    };

    files.forEach(file => {
      const validation = validateImageFile(file);

      if (!validation.isValid) {
        result.invalid.push({
          file,
          reason: validation.error || '文件格式不支持'
        });
      } else if (file.size > 10 * 1024 * 1024) {  // 10MB - 极限大小
        result.invalid.push({
          file,
          reason: '文件太大 (>10MB)，无法处理'
        });
      } else if (file.size > 3 * 1024 * 1024) {  // 3MB - 需要积极压缩
        result.oversized.push(file);
      } else {
        result.valid.push(file);
      }
    });

    return result;
  };

  // 🚀 智能压缩策略
  const getCompressionStrategy = (file: File) => {
    const sizeInMB = file.size / (1024 * 1024);

    if (sizeInMB > 5) {
      return {
        maxWidth: 600,
        maxHeight: 450,
        quality: 0.5,
        format: 'webp' as const,
        description: '积极压缩'
      };
    } else if (sizeInMB > 2) {
      return {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.65,
        format: 'webp' as const,
        description: '智能压缩'
      };
    } else {
      return {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.75,
        format: 'webp' as const,
        description: '标准压缩'
      };
    }
  };

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      onError?.(`最多只能上传${maxImages}张图片，当前还可添加${remainingSlots}张`);
      return;
    }

    setIsProcessing(true);
    onUploadStart?.();

    // 🎯 预处理文件分类
    const { valid, oversized, invalid } = preprocessFiles(files);
    const allValidFiles = [...valid, ...oversized];

    // 🔔 友好的提示信息
    if (invalid.length > 0) {
      const messages = invalid.map(item => `${item.file.name}: ${item.reason}`);
      onError?.(`以下文件无法处理：\n${messages.join('\n')}`);
    }

    if (oversized.length > 0) {
      console.log(`💡 检测到${oversized.length}个大文件，将使用智能压缩...`);
    }

    if (allValidFiles.length === 0) {
      setIsProcessing(false);
      return;
    }

    // 🎨 创建临时预览项，显示处理进度
    const tempImages: CommentImage[] = allValidFiles.map((file, index) => ({
      id: `temp-${Date.now()}-${index}`,
      file,
      previewUrl: '',
      status: 'pending',
      originalSize: file.size
    }));

    const updatedTempImages = [...images, ...tempImages];
    setImages(updatedTempImages);
    onImagesChange(updatedTempImages);

    // 🔄 逐个处理文件（更好的用户反馈）
    const finalImages: CommentImage[] = [];

    for (let i = 0; i < allValidFiles.length; i++) {
      const file = allValidFiles[i];
      const tempImageId = `temp-${Date.now()}-${i}`;

      try {
        // 更新状态为处理中
        const processingImages = updatedTempImages.map(img =>
          img.id === tempImageId
            ? { ...img, status: 'processing' as const }
            : img
        );
        setImages(processingImages);
        onImagesChange(processingImages);

        const strategy = getCompressionStrategy(file);
        console.log(`🖼️ 开始${strategy.description}图片 ${i + 1}/${allValidFiles.length}:`, {
          originalName: file.name,
          originalSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
          strategy: strategy.description
        });

        const compressedFile = await compressImage(file, strategy);

        console.log(`✅ 图片处理完成:`, {
          compressedSize: (compressedFile.size / 1024 / 1024).toFixed(2) + 'MB',
          compressionRatio: ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%'
        });

        const imageId = `${Date.now()}-${i}`;
        const previewUrl = createImagePreview(compressedFile);

        // 创建重命名的文件
        const originalName = file.name.replace(/\.[^/.]+$/, '');
        const finalFile = new File(
          [compressedFile],
          `${originalName}.webp`,
          { type: 'image/webp', lastModified: Date.now() }
        );

        const processedImage: CommentImage = {
          id: imageId,
          file: finalFile,
          previewUrl,
          status: 'success',
          originalSize: file.size,
          finalSize: compressedFile.size
        };

        finalImages.push(processedImage);

        // 更新为成功状态
        const successImages = updatedTempImages.map(img =>
          img.id === tempImageId
            ? processedImage
            : img
        );
        setImages(successImages);
        onImagesChange(successImages);

      } catch (error) {
        console.error(`🖼️ 图片处理失败:`, error);

        // 更新为错误状态
        const errorImages = updatedTempImages.map(img =>
          img.id === tempImageId
            ? { ...img, status: 'error' as const, error: '处理失败' }
            : img
        );
        setImages(errorImages);
        onImagesChange(errorImages);
      }
    }

    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setIsProcessing(false);
    onUploadComplete?.(finalImages);
  };

  // 删除图片
  const handleRemoveImage = (imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove?.previewUrl) {
      revokeImagePreview(imageToRemove.previewUrl);
    }

    const filteredImages = images.filter(img => img.id !== imageId);
    setImages(filteredImages);
    onImagesChange(filteredImages);
  };

  // 预览图片
  const handleImageClick = (image: CommentImage) => {
    if (image.status === 'success' && image.previewUrl) {
      openPreview(image.previewUrl, image.file.name);
    }
  };

  // 渲染状态指示器
  const renderStatusIndicator = (image: CommentImage) => {
    switch (image.status) {
      case 'pending':
        return (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-xs">等待处理</div>
          </div>
        );
      case 'processing':
        return (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      case 'error':
        return (
          <div className="absolute inset-0 bg-red-500 bg-opacity-80 flex items-center justify-center">
            <div className="text-white text-xs text-center px-1">
              ❌<br />处理失败
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        disabled={disabled || isProcessing}
        className="hidden"
      />

      {/* 图片网格 */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5 w-fit">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative w-16 h-16 rounded-md overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-200"
            >
              {image.previewUrl ? (
                <img
                  src={image.previewUrl}
                  alt="预览"
                  className="w-full h-full object-cover"
                  onClick={() => handleImageClick(image)}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* 状态覆盖层 */}
              {renderStatusIndicator(image)}

              {/* 删除按钮 */}
              {image.status !== 'processing' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(image.id);
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
              )}

              {/* 压缩信息提示 */}
              {image.status === 'success' && image.originalSize && image.finalSize && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-[8px] px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  压缩 {((1 - image.finalSize / image.originalSize) * 100).toFixed(0)}%
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default CommentImageUploaderV2;