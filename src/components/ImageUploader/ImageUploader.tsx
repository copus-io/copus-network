import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { ImageCropper } from '../ImageCropper/ImageCropper';
import { validateImageFile, compressImage, createImagePreview, revokeImagePreview } from '../../utils/imageUtils';
import { AuthService } from '../../services/authService';
import profileDefaultAvatar from '../../assets/images/profile-default.svg';

interface ImageUploaderProps {
  type: 'avatar' | 'banner';
  currentImage?: string;
  onImageUploaded: (imageUrl: string) => void;
  onError?: (error: string) => void;
  onUploadStatusChange?: (isUploading: boolean) => void; // 新增：上传状态变化回调
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  type,
  currentImage,
  onImageUploaded,
  onError,
  onUploadStatusChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showCropper, setShowCropper] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>(''); // 本地预览URL，上传完成前立即显示

  const isAvatar = type === 'avatar';
  const aspectRatio = isAvatar ? 1 : 6 / 1; // Avatar 1:1, Banner 6:1 (matches cover display ~1100px:192px)
  const cropShape = isAvatar ? 'circle' : 'rect';

  // 监听 currentImage 变化，同步清理本地状态
  useEffect(() => {
    // 当 currentImage 变为空时，清理所有本地状态
    if (!currentImage) {
      // 使用当前状态值进行清理，避免依赖循环
      setLocalPreviewUrl(prev => {
        if (prev) {
          revokeImagePreview(prev);
        }
        return '';
      });

      setPreviewUrl(prev => {
        if (prev) {
          revokeImagePreview(prev);
        }
        return '';
      });

      setSelectedFile(null);
      setShowCropper(false);

      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [currentImage]); // 只依赖 currentImage，避免无限循环

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      onError?.(validation.error || 'File format not supported');
      return;
    }

    setSelectedFile(file);
    const preview = createImagePreview(file);
    setPreviewUrl(preview);
    setShowCropper(true);
  };

  const handleCrop = async (croppedFile: File) => {
    try {
      // 立即创建本地预览，无需等待上传完成
      const localPreview = createImagePreview(croppedFile);
      setLocalPreviewUrl(localPreview);

      setIsUploading(true);
      onUploadStatusChange?.(true); // 通知开始上传
      setShowCropper(false);

      // Compress image
      const compressedFile = await compressImage(croppedFile, {
        maxWidth: isAvatar ? 400 : 1920,
        maxHeight: isAvatar ? 400 : 1080,
        quality: 0.8,
        format: 'jpeg'
      });

      // Upload to server
      const result = await AuthService.uploadImage(compressedFile);

      onImageUploaded(result.url);

      // Clean up resources
      if (previewUrl) {
        revokeImagePreview(previewUrl);
        setPreviewUrl('');
      }
      if (localPreviewUrl) {
        revokeImagePreview(localPreviewUrl);
        setLocalPreviewUrl('');
      }
      setSelectedFile(null);

    } catch (error) {
      console.error('Image upload failed:', error);

      let errorMessage = 'Image upload failed, please try again';
      if (error.message) {
        errorMessage = `Upload failed: ${error.message}`;
      }

      onError?.(errorMessage);

      // 上传失败时清理本地预览
      if (localPreviewUrl) {
        revokeImagePreview(localPreviewUrl);
        setLocalPreviewUrl('');
      }
    } finally {
      setIsUploading(false);
      onUploadStatusChange?.(false); // 通知上传结束
    }
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    if (previewUrl) {
      revokeImagePreview(previewUrl);
      setPreviewUrl('');
    }
    setSelectedFile(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    // 清理所有本地状态
    if (localPreviewUrl) {
      revokeImagePreview(localPreviewUrl);
      setLocalPreviewUrl('');
    }
    if (previewUrl) {
      revokeImagePreview(previewUrl);
      setPreviewUrl('');
    }

    setSelectedFile(null);

    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // 通知父组件图片已删除
    onImageUploaded('');
  };

  if (isAvatar) {
    return (
      <>
        <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="inline-flex items-center gap-[15px] relative flex-[0_0_auto]">
            {/* Avatar preview */}
            <div className="relative w-[45px] h-[45px] rounded-[100px] overflow-hidden border-2 border-gray-200">
              <img
                src={currentImage || profileDefaultAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Upload button - matching curate page style */}
            <button
              type="button"
              className="flex items-center justify-center px-4 py-2 bg-white rounded-[15px] border border-solid border-medium-grey hover:border-red hover:shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleButtonClick}
              disabled={isUploading}
            >
              <svg className="w-5 h-5 text-medium-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="ml-2 [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base">
                {isUploading ? 'Uploading...' : 'Upload'}
              </span>
            </button>

            {/* Delete button */}
            {currentImage && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-red hover:text-red/80 text-[16px] [font-family:'Lato',Helvetica] font-normal"
              >
                Delete
              </button>
            )}
          </div>

          <p className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm">
            We recommend an image of at least 300x300. Gifs work too. Max 5mb.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="sr-only"
          />
        </div>

        {showCropper && selectedFile && (
          <ImageCropper
            image={selectedFile}
            aspectRatio={aspectRatio}
            cropShape={cropShape}
            type={type}
            onCrop={handleCrop}
            onCancel={handleCancelCrop}
          />
        )}
      </>
    );
  }

  // Banner component
  return (
    <>
      <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
        <div className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px]">
          Cover image (Optional)
        </div>

        <div className="flex flex-col h-[87px] items-center px-0 py-2.5 relative self-stretch w-full rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-light-grey-transparent overflow-hidden">
          {/* Current banner image - 优先显示本地预览，再显示远程图片 */}
          {(localPreviewUrl || currentImage) && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${localPreviewUrl || currentImage})` }}
            >
              {/* Uploading overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="bg-white/90 rounded-lg px-3 py-2 text-sm font-medium text-gray-700">
                    Uploading...
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons container - visible when image exists or uploading */}
          {(localPreviewUrl || currentImage) && (
            <div className="flex items-center justify-between gap-2.5 px-[15px] py-2 self-stretch w-full relative flex-[0_0_auto] z-10">
              {/* Change button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 rounded-[50px] border-medium-grey text-xs shadow-sm"
                onClick={handleButtonClick}
                disabled={isUploading}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="[font-family:'Lato',Helvetica] font-medium text-dark-grey">
                  {isUploading ? 'Uploading...' : 'Change'}
                </span>
              </Button>

              {/* Delete button - only show when image or local preview exists */}
              {(localPreviewUrl || currentImage) && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red/10 transition-colors bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-3.5 h-3.5 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Upload button - only show when no image and no local preview */}
          {!currentImage && !localPreviewUrl && (
            <div className="flex flex-col items-center justify-center gap-2.5 relative flex-1 self-stretch w-full grow">
              <Button
                type="button"
                variant="outline"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white rounded-[100px] border-medium-grey hover:bg-gray-50 transition-colors"
                onClick={handleButtonClick}
                disabled={isUploading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="[font-family:'Lato',Helvetica] font-semibold text-medium-dark-grey text-base">
                  {isUploading ? 'Uploading...' : 'Add File'}
                </span>
              </Button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="sr-only"
        />
      </div>

      {showCropper && selectedFile && (
        <ImageCropper
          image={selectedFile}
          aspectRatio={aspectRatio}
          cropShape={cropShape}
          type={type}
          onCrop={handleCrop}
          onCancel={handleCancelCrop}
        />
      )}
    </>
  );
};