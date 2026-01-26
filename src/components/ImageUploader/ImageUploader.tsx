import React, { useState, useRef } from 'react';
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
  const aspectRatio = isAvatar ? 1 : 560 / 360; // Avatar 1:1, Banner 560:360 (Telegram card format)
  const cropShape = isAvatar ? 'circle' : 'rect';

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('🔥 ImageUploader: File selected, type:', type, 'file:', file?.name);
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    console.log('🔥 ImageUploader: File validation result:', validation);
    if (!validation.isValid) {
      onError?.(validation.error || 'File format not supported');
      return;
    }

    setSelectedFile(file);
    const preview = createImagePreview(file);
    setPreviewUrl(preview);
    setShowCropper(true);
    console.log('🔥 ImageUploader: Cropper should show now');
  };

  const handleCrop = async (croppedFile: File) => {
    try {
      console.log('🔥 Processing cropped image:', {
        fileName: croppedFile.name,
        fileSize: croppedFile.size,
        fileType: croppedFile.type,
        isAvatar,
        aspectRatio
      });

      setIsUploading(true);
      setShowCropper(false);

      // Compress image
      console.log('🔥 Starting image compression...');
      const compressedFile = await compressImage(croppedFile, {
        maxWidth: isAvatar ? 400 : 1920,
        maxHeight: isAvatar ? 400 : 1080,
        quality: 0.8,
        format: 'jpeg'
      });

      console.log('🔥 Image compression complete:', {
        originalSize: croppedFile.size,
        compressedSize: compressedFile.size,
        compression: `${((1 - compressedFile.size / croppedFile.size) * 100).toFixed(1)}%`
      });

      // Upload to server
      console.log('🔥 Starting upload to server...');
      const result = await AuthService.uploadImage(compressedFile);
      console.log('🔥 Upload successful, server response:', result);

      onImageUploaded(result.url);
      console.log('🔥🔥🔥 SPACE ImageUploader: Image URL passed to parent component:', result.url);

      // Clean up resources
      if (previewUrl) {
        revokeImagePreview(previewUrl);
        setPreviewUrl('');
      }
      setSelectedFile(null);

    } catch (error) {
      console.error('🔥 Image upload failed - detailed error information:', {
        error,
        errorMessage: error.message,
        errorStack: error.stack,
        errorType: typeof error,
        errorString: String(error)
      });

      let errorMessage = 'Image upload failed, please try again';
      if (error.message) {
        errorMessage = `Upload failed: ${error.message}`;
      }

      onError?.(errorMessage);
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
    console.log('🔥🔥🔥 SPACE ImageUploader: Button clicked, type:', type);
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    onImageUploaded('');
  };

  if (isAvatar) {
    return (
      <>
        <div className="flex flex-col items-start gap-2.5 px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto]">
          <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-[450] text-off-black text-[18px] tracking-[0] leading-[normal]">
            Profile photo
          </div>

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
      <div className="flex flex-col items-start gap-2.5 px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto]">
        <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-lg tracking-[0] leading-[normal]">
          Banner image
        </div>

        <div className="flex flex-col h-[130px] items-center px-0 py-2.5 relative self-stretch w-full rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-light-grey-transparent overflow-hidden">
          {/* Current banner image */}
          {currentImage && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${currentImage})` }}
            />
          )}

          {/* Action buttons container - always visible when image exists */}
          {currentImage && (
            <div className="flex items-center justify-between gap-2.5 px-[15px] py-2 self-stretch w-full relative flex-[0_0_auto] z-10">
              {/* Change button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white rounded-[50px] border-medium-grey text-xs"
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

              {/* Delete button */}
              <button
                type="button"
                onClick={handleRemoveImage}
                className="relative flex-[0_0_auto] p-1.5 hover:bg-red/10 rounded transition-colors bg-white/90"
              >
                <svg className="w-4 h-4 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}

          {/* Upload button - only show when no image */}
          {!currentImage && (
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