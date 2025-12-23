// Comment Image Uploader - 小红书风格的评论图片上传组件

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { validateImageFile, compressImage, createImagePreview, revokeImagePreview } from '../../utils/imageUtils';
import { useImagePreview } from '../../contexts/ImagePreviewContext';

interface CommentImage {
  id: string;
  file: File;
  previewUrl: string;
  uploadUrl?: string; // 上传后的URL
  isUploading?: boolean;
  error?: string;
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

// Ref interface for parent components
export interface CommentImageUploaderRef {
  triggerFileSelect: () => void;
}

export const CommentImageUploader = forwardRef<CommentImageUploaderRef, CommentImageUploaderProps>(({
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

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    triggerFileSelect: () => {
      fileInputRef.current?.click();
    }
  }), []);

  // 处理文件选择和压缩
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // 检查是否超过最大图片数量
    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      onError?.(`最多只能上传${maxImages}张图片，当前还可添加${remainingSlots}张`);
      return;
    }

    setIsProcessing(true);
    const newImages: CommentImage[] = [];
    const errors: string[] = [];

    // 并行处理所有文件
    const results = await Promise.allSettled(files.map(async (file, index) => {
      try {
        // 验证文件
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          errors.push(`${file.name}: ${validation.error || '文件格式不支持'}`);
          return null;
        }

        // 压缩图片 - 评论图片使用更小的尺寸
        console.log(`🖼️ 开始压缩图片 ${index + 1}:`, {
          originalName: file.name,
          originalSize: (file.size / 1024 / 1024).toFixed(2) + 'MB'
        });

        const compressedFile = await compressImage(file, {
          maxWidth: 800,    // 评论图片最大宽度800px
          maxHeight: 600,   // 评论图片最大高度600px
          quality: 0.75,    // WebP格式下可以用稍高质量
          format: 'webp'    // 使用WebP格式，体积更小，质量更好
        });

        console.log(`🖼️ 图片压缩完成 ${index + 1}:`, {
          compressedSize: (compressedFile.size / 1024 / 1024).toFixed(2) + 'MB',
          compressionRatio: ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%'
        });

        const imageId = `${Date.now()}-${index}`;
        const previewUrl = createImagePreview(compressedFile);

        // 修改文件名扩展名为webp
        const originalName = file.name.replace(/\.[^/.]+$/, '');
        const compressedFileWithCorrectName = new File(
          [compressedFile],
          `${originalName}.webp`,
          { type: 'image/webp', lastModified: Date.now() }
        );

        return {
          id: imageId,
          file: compressedFileWithCorrectName, // 使用重命名后的压缩文件
          previewUrl,
          isUploading: false
        };

      } catch (error) {
        console.error(`🖼️ 图片处理失败 ${index + 1}:`, error);
        errors.push(`${file.name}: 图片处理失败`);
        return null;
      }
    }));

    // 收集成功处理的图片
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        newImages.push(result.value);
      } else if (result.status === 'rejected') {
        errors.push('图片处理失败');
      }
    });

    // 更新图片列表
    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange(updatedImages);
    }

    // 显示错误信息（如果有）
    if (errors.length > 0) {
      onError?.(errors.join('\n'));
    }

    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setIsProcessing(false);
  };

  // 删除图片
  const handleRemoveImage = (imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove?.previewUrl) {
      revokeImagePreview(imageToRemove.previewUrl);
    }

    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  // 点击上传按钮
  const handleUploadClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  // 处理图片点击预览
  const handleImageClick = (clickedImageUrl: string) => {
    openPreview(clickedImageUrl, '图片预览');
  };

  // 检查是否可以添加更多图片
  const canAddMore = images.length < maxImages && !disabled && !isProcessing;

  return (
    <div className={`w-full ${className}`}>
      {/* 处理状态提示 */}
      {isProcessing && (
        <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <span>正在处理图片...</span>
        </div>
      )}


      {/* 文件输入框 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={maxImages > 1}
        onChange={handleFileSelect}
        className="sr-only comment-image-input"
      />
    </div>
  );
});

CommentImageUploader.displayName = 'CommentImageUploader';

export default CommentImageUploader;