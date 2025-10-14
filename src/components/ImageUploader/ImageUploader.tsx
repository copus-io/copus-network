import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { ImageCropper } from '../ImageCropper/ImageCropper';
import { validateImageFile, compressImage, createImagePreview, revokeImagePreview } from '../../utils/imageUtils';
import { AuthService } from '../../services/authService';

interface ImageUploaderProps {
  type: 'avatar' | 'banner';
  currentImage?: string;
  onImageUploaded: (imageUrl: string) => void;
  onError?: (error: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  type,
  currentImage,
  onImageUploaded,
  onError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showCropper, setShowCropper] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isAvatar = type === 'avatar';
  const aspectRatio = isAvatar ? 1 : 16 / 9; // Avatar 1:1, Banner 16:9
  const cropShape = isAvatar ? 'circle' : 'rect';

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
      setIsUploading(true);
      setShowCropper(false);

      // Compress image
      const compressedFile = await compressImage(croppedFile, {
        maxWidth: isAvatar ? 400 : 1200,
        maxHeight: isAvatar ? 400 : 675,
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
      setSelectedFile(null);

    } catch (error) {
      console.error('Image upload failed:', error);
      onError?.('Image upload failed, please try again');
    } finally {
      setIsUploading(false);
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
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    onImageUploaded('');
  };

  if (isAvatar) {
    return (
      <>
        <div className="flex flex-col items-start gap-2.5 px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto]">
          <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-lg tracking-[0] leading-[normal]">
            Profile photo
          </div>

          <div className="inline-flex items-center gap-[15px] relative flex-[0_0_auto]">
            {/* Avatar preview */}
            <div className="relative w-[45px] h-[45px] rounded-[100px] overflow-hidden border-2 border-gray-200">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[url(/img/add-profile-image.svg)] bg-cover bg-[50%_50%]" />
              )}
            </div>

            {/* Upload button */}
            <Button
              type="button"
              variant="outline"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-[100px] border-medium-grey hover:bg-gray-50 transition-colors"
              onClick={handleButtonClick}
              disabled={isUploading}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="[font-family:'Lato',Helvetica] font-semibold text-medium-dark-grey text-base">
                {isUploading ? 'Uploading...' : 'Add File'}
              </span>
            </Button>

            {/* Delete button */}
            {currentImage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveImage}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </Button>
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
      <div className="flex flex-col items-start gap-2.5 px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto]">
        <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-lg tracking-[0] leading-[normal]">
          Banner image
        </div>

        <div className="flex flex-col h-[102px] items-center px-0 py-2.5 relative self-stretch w-full rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-light-grey-transparent overflow-hidden">
          {/* Current banner image */}
          {currentImage && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${currentImage})` }}
            />
          )}

          {/* Action buttons container */}
          <div className="flex items-center justify-end gap-2.5 px-[15px] py-0 self-stretch w-full relative flex-[0_0_auto] z-10">
            {currentImage && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="relative flex-[0_0_auto] p-1 hover:bg-gray-100 rounded transition-colors bg-white/80"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Upload button */}
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
          onCrop={handleCrop}
          onCancel={handleCancelCrop}
        />
      )}
    </>
  );
};