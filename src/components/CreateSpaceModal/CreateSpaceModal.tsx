import React, { useState } from 'react';
import { AuthService } from '../../services/authService';
import { useToast } from '../ui/toast';
import { ImageUploader } from '../ImageUploader/ImageUploader';

export interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (space: any) => void;
  mode?: 'simple' | 'full'; // simple: only name, full: all fields
  title?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  submitLabel?: string;
}

export const CreateSpaceModal: React.FC<CreateSpaceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode = 'full',
  title = 'Create new collection',
  nameLabel = 'Name',
  namePlaceholder = 'Enter space name',
  submitLabel = 'Create'
}) => {
  const { showToast } = useToast();

  // Form state
  const [spaceName, setSpaceName] = useState('');
  const [spaceDescription, setSpaceDescription] = useState('');
  const [spaceCoverUrl, setSpaceCoverUrl] = useState('');
  const [spaceFaceUrl, setSpaceFaceUrl] = useState('');

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const resetForm = () => {
    setSpaceName('');
    setSpaceDescription('');
    setSpaceCoverUrl('');
    setSpaceFaceUrl('');
    setIsImageUploading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreateSpace = async () => {
    if (!spaceName.trim()) {
      showToast('Please enter a space name', 'error');
      return;
    }

    try {
      setIsCreating(true);

      // Prepare optional fields for full mode
      const description = mode === 'full' ? (spaceDescription.trim() || undefined) : undefined;
      const coverUrl = mode === 'full' ? (spaceCoverUrl.trim() || undefined) : undefined;
      const faceUrl = mode === 'full' ? (spaceFaceUrl.trim() || undefined) : undefined;

      // Call API to create space
      const response = await AuthService.createSpace(spaceName.trim(), description, coverUrl, faceUrl);
      console.log('Create space response:', response);

      // Get the created space data
      const newSpace = response.data || response;

      if (newSpace) {
        showToast('Space created successfully', 'success');

        // Call success callback with the new space
        if (onSuccess) {
          onSuccess(newSpace);
        }

        handleClose();
      } else {
        console.error('No space data in response:', response);
        showToast('Failed to create space', 'error');
      }
    } catch (err) {
      console.error('Failed to create space:', err);
      showToast('Failed to create space', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="flex flex-col w-[582px] max-w-[90vw] items-center gap-5 p-[30px] relative bg-white rounded-[15px] z-10"
        role="dialog"
        aria-labelledby="create-space-title"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M1 13L13 1" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="flex flex-col items-start gap-[30px] relative self-stretch w-full flex-[0_0_auto] pt-5">
          <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
            <h2
              id="create-space-title"
              className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap"
            >
              {title}
            </h2>

            {/* Space Name */}
            <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
              <label
                htmlFor="space-name-input"
                className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap"
              >
                {nameLabel}
              </label>

              <div className="flex h-12 items-center px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                <input
                  id="space-name-input"
                  type="text"
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                  placeholder={namePlaceholder}
                  className="flex-1 border-none bg-transparent [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] outline-none placeholder:text-medium-dark-grey"
                  aria-required="true"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateSpace();
                    }
                  }}
                />
              </div>
            </div>

            {/* Full mode: Description, Avatar, Cover */}
            {mode === 'full' && (
              <>
                {/* Space Description */}
                <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                  <label
                    htmlFor="space-description-input"
                    className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap"
                  >
                    Description (Optional)
                  </label>

                  <div className="flex items-start px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                    <textarea
                      id="space-description-input"
                      value={spaceDescription}
                      onChange={(e) => setSpaceDescription(e.target.value)}
                      placeholder="Describe your space (optional)"
                      className="flex-1 border-none bg-transparent [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] outline-none placeholder:text-medium-dark-grey resize-none"
                      rows={3}
                      maxLength={200}
                    />
                  </div>
                  <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-gray-400 text-sm tracking-[0] leading-[18px]">
                    {spaceDescription.length}/200 characters
                  </span>
                </div>

                {/* Avatar Upload */}
                <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                  <label className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                    Avatar (Optional)
                  </label>
                  <div className="flex flex-col gap-2 relative self-stretch w-full flex-[0_0_auto]">
                    <ImageUploader
                      type="avatar"
                      currentImage={spaceFaceUrl}
                      onUploadStatusChange={(uploading) => {
                        console.log('🔄 CREATE SPACE: Avatar upload status changed:', uploading);
                        setIsImageUploading(uploading);
                      }}
                      onImageUploaded={(url) => {
                        console.log('🔥 CREATE SPACE: Received avatar URL:', url);
                        setSpaceFaceUrl(url);
                      }}
                      onError={(error) => showToast(error, 'error')}
                    />
                    <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-gray-400 text-sm tracking-[0] leading-[18px]">
                      Recommended size: 400x400px (1:1 ratio)
                    </span>
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                  <div className="flex flex-col gap-2 relative self-stretch w-full flex-[0_0_auto]">
                    <ImageUploader
                      type="banner"
                      currentImage={spaceCoverUrl}
                      onUploadStatusChange={(uploading) => {
                        console.log('🔄 CREATE SPACE: Cover upload status changed:', uploading);
                        setIsImageUploading(uploading);
                      }}
                      onImageUploaded={(url) => {
                        console.log('🔥 CREATE SPACE: Received cover URL:', url);
                        setSpaceCoverUrl(url);
                      }}
                      onError={(error) => showToast(error, 'error')}
                    />
                    <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-gray-400 text-sm tracking-[0] leading-[18px]">
                      Recommended size: 1200x200px (6:1 ratio)
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
            <button
              className="inline-flex items-center justify-center gap-[30px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={handleClose}
              type="button"
            >
              <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                Cancel
              </span>
            </button>

            <button
              className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[100px] bg-red cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red/90 transition-colors"
              onClick={handleCreateSpace}
              disabled={isCreating || !spaceName.trim() || isImageUploading}
              type="button"
            >
              <span className="relative w-fit [font-family:'Lato',Helvetica] font-bold text-white text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                {isImageUploading ? 'Uploading image...' : (isCreating ? 'Creating...' : submitLabel)}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSpaceModal;