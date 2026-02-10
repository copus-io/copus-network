import React, { useState, useEffect } from 'react';
import { AuthService } from '../../services/authService';
import { useToast } from '../ui/toast';
import { SPACE_VISIBILITY } from '../../types/space';
import { ImageUploader } from '../ImageUploader/ImageUploader';
import { ArenaImportModal } from '../ArenaImportModal/ArenaImportModal';
import { CSVImportModal } from '../CSVImportModal/CSVImportModal';

export interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (space: any) => void;
  mode?: 'simple' | 'full'; // simple: only name, full: all fields
  title?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  submitLabel?: string;
  // Edit mode props
  editMode?: boolean;
  editSpaceId?: number;
  initialData?: {
    name?: string;
    description?: string;
    coverUrl?: string;
    faceUrl?: string;
    visibility?: number;
  };
}

export const CreateSpaceModal: React.FC<CreateSpaceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode = 'full',
  title = 'Create new collection',
  nameLabel = 'Name',
  namePlaceholder = 'Enter space name',
  submitLabel = 'Create',
  editMode = false,
  editSpaceId,
  initialData
}) => {
  const { showToast } = useToast();

  // Form state
  const [spaceName, setSpaceName] = useState('');
  const [spaceDescription, setSpaceDescription] = useState('');
  const [spaceCoverUrl, setSpaceCoverUrl] = useState('');
  const [spaceFaceUrl, setSpaceFaceUrl] = useState('');
  const [visibility, setVisibility] = useState(SPACE_VISIBILITY.PUBLIC);

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Import states
  const [showArenaImport, setShowArenaImport] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);

  // Populate form when in edit mode
  useEffect(() => {
    if (isOpen && editMode && initialData) {
      setSpaceName(initialData.name || '');
      setSpaceDescription(initialData.description || '');
      setSpaceCoverUrl(initialData.coverUrl || '');
      setSpaceFaceUrl(initialData.faceUrl || '');
      setVisibility(initialData.visibility === 1 ? SPACE_VISIBILITY.PRIVATE : SPACE_VISIBILITY.PUBLIC);
    } else if (!isOpen) {
      // Reset form when modal closes
      setSpaceName('');
      setSpaceDescription('');
      setSpaceCoverUrl('');
      setSpaceFaceUrl('');
      setVisibility(SPACE_VISIBILITY.PUBLIC);
    }
  }, [isOpen, editMode, initialData]);

  const resetForm = () => {
    setSpaceName('');
    setSpaceDescription('');
    setSpaceCoverUrl('');
    setSpaceFaceUrl('');
    setVisibility(SPACE_VISIBILITY.PUBLIC);
    setIsImageUploading(false);
  };

  const handleClose = () => {
    resetForm();
    setShowArenaImport(false);
    setShowCSVImport(false);
    onClose();
  };

  const handleArenaImport = (data: { spaceName: string; blocks: any[]; isPrivate: boolean }) => {
    // Pre-fill form with Arena data
    setSpaceName(data.spaceName);
    setSpaceDescription(`Imported from Are.na with ${data.blocks.length} items`);

    // 🔒 设置隐私状态
    setVisibility(data.isPrivate ? SPACE_VISIBILITY.PRIVATE : SPACE_VISIBILITY.PUBLIC);

    // TODO: Save the blocks data for later use when creating articles
    // For now, we'll just create the space with the name and description
    const privacyLabel = data.isPrivate ? 'private space' : 'public space';
    showToast(`Ready to import "${data.spaceName}" with ${data.blocks.length} items as ${privacyLabel}`, 'success');

    setShowArenaImport(false);
  };

  const handleCSVImport = (data: { spaceName: string; items: any[]; isPrivate: boolean }) => {
    // Pre-fill form with CSV data
    setSpaceName(data.spaceName);
    setSpaceDescription(`Imported from CSV with ${data.items.length} bookmarks`);

    // 🔒 设置隐私状态
    setVisibility(data.isPrivate ? SPACE_VISIBILITY.PRIVATE : SPACE_VISIBILITY.PUBLIC);

    // TODO: Save the items data for later use when creating articles
    // For now, we'll just create the space with the name and description
    const privacyLabel = data.isPrivate ? 'private space' : 'public space';
    showToast(`Ready to import "${data.spaceName}" with ${data.items.length} bookmarks as ${privacyLabel}`, 'success');

    setShowCSVImport(false);
  };

  const handleSubmit = async () => {
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

      let response;
      let resultSpace;

      if (editMode && editSpaceId) {
        // Update existing space
        response = await AuthService.updateSpace(
          editSpaceId,
          spaceName.trim(),
          description,
          coverUrl,
          faceUrl,
          visibility
        );
        console.log('Update space response:', response);
        resultSpace = response.data || response;

        if (resultSpace) {
          showToast('Collection updated successfully', 'success');
        }
      } else {
        // Create new space
        response = await AuthService.createSpace(
          spaceName.trim(),
          description,
          coverUrl,
          faceUrl,
          visibility
        );
        console.log('Create space response:', response);
        resultSpace = response.data || response;

        if (resultSpace) {
          showToast('Space created successfully', 'success');
        }
      }

      if (resultSpace) {
        // Call success callback with the space
        if (onSuccess) {
          onSuccess(resultSpace);
        }

        handleClose();
      } else {
        console.error('No space data in response:', response);
        showToast(editMode ? 'Failed to update collection' : 'Failed to create space', 'error');
      }
    } catch (err) {
      console.error(editMode ? 'Failed to update space:' : 'Failed to create space:', err);
      showToast(editMode ? 'Failed to update collection' : 'Failed to create space', 'error');
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
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
          type="button"
        >
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M1 13L13 1" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="flex flex-col items-start gap-[30px] relative self-stretch w-full flex-[0_0_auto] pt-8">
          <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
              <h2
                id="create-space-title"
                className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap"
              >
                {title}
              </h2>

              {mode === 'full' && !editMode && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowArenaImport(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                    type="button"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" x2="12" y1="15" y2="3"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Import Are.na</span>
                  </button>

                  <button
                    onClick={() => setShowCSVImport(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                    type="button"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" x2="8" y1="13" y2="13"/>
                      <line x1="16" x2="8" y1="17" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Import CSV</span>
                  </button>
                </div>
              )}
            </div>

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
                      handleSubmit();
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

                  <div className="flex flex-col px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                    <textarea
                      id="space-description-input"
                      value={spaceDescription}
                      onChange={(e) => setSpaceDescription(e.target.value)}
                      placeholder="Describe your space (optional)"
                      className="flex-1 border-none bg-transparent [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] outline-none placeholder:text-medium-dark-grey resize-none"
                      rows={3}
                      maxLength={200}
                    />
                    <span className="self-end [font-family:'Lato',Helvetica] font-normal text-gray-400 text-xs tracking-[0] leading-[16px]">
                      {spaceDescription.length}/200
                    </span>
                  </div>
                </div>

                {/* Profile Upload */}
                <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full">
                  <label className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                    Profile (Optional)
                  </label>
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
                </div>

                {/* Cover Image Upload */}
                <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full">
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
                </div>

                {/* Private Space Toggle - matching curate page style */}
                <div className="flex items-center gap-3 w-full flex-wrap">
                  <div
                    onClick={() => setVisibility(visibility === SPACE_VISIBILITY.PRIVATE ? SPACE_VISIBILITY.PUBLIC : SPACE_VISIBILITY.PRIVATE)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                      visibility === SPACE_VISIBILITY.PRIVATE
                        ? 'bg-red border-red'
                        : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {visibility === SPACE_VISIBILITY.PRIVATE && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div
                    onClick={() => setVisibility(visibility === SPACE_VISIBILITY.PRIVATE ? SPACE_VISIBILITY.PUBLIC : SPACE_VISIBILITY.PRIVATE)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E0E0E0] rounded-[100px] cursor-pointer flex-shrink-0"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.9723 3C15.4989 3 14.096 3.66092 12.9955 4.86118C11.9336 3.70292 10.5466 3 9.02774 3C5.7035 3 3 6.36428 3 10.5C3 14.6357 5.7035 18 9.02774 18C10.5466 18 11.9359 17.2971 12.9955 16.1388C14.0937 17.3413 15.492 18 16.9723 18C20.2965 18 23 14.6357 23 10.5C23 6.36428 20.2965 3 16.9723 3ZM3.68213 10.5C3.68213 6.73121 6.08095 3.66313 9.02774 3.66313C11.9745 3.66313 14.3734 6.729 14.3734 10.5C14.3734 11.2206 14.2847 11.9169 14.1232 12.569C14.0937 10.9885 13.3456 9.68877 12.1519 9.39699C10.5966 9.0168 8.86858 10.4956 8.30014 12.6927C8.03183 13.7339 8.05684 14.7838 8.37062 15.6503C8.65712 16.4439 9.15507 17.0053 9.79172 17.2639C9.54161 17.3103 9.28695 17.3347 9.03001 17.3347C6.07867 17.3369 3.68213 14.2688 3.68213 10.5ZM13.4297 15.6149C14.437 14.2732 15.0555 12.4761 15.0555 10.5C15.0555 8.52387 14.437 6.72679 13.4297 5.38506C14.4097 4.27542 15.6648 3.66313 16.9723 3.66313C19.9191 3.66313 22.3179 6.729 22.3179 10.5C22.3179 11.3112 22.2065 12.0893 22.0018 12.8121C22.0473 11.1233 21.2833 9.70424 20.0305 9.3992C18.4752 9.01901 16.7472 10.4978 16.1787 12.695C15.6467 14.7529 16.3197 16.7224 17.6862 17.275C17.452 17.3148 17.2133 17.3391 16.97 17.3391C15.6603 17.3369 14.4097 16.7268 13.4297 15.6149Z" fill="#454545"/>
                      <line x1="5.27279" y1="2" x2="22" y2="18.7272" stroke="#454545" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    <span className="text-[#454545] text-[14px] font-medium">Private</span>
                  </div>
                  <span className="[font-family:'Lato',Helvetica] font-normal text-gray-500 text-sm tracking-[0] leading-[18px]">
                    Only you can see and access this space.
                  </span>
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
              onClick={handleSubmit}
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

      {/* Arena Import Modal */}
      <ArenaImportModal
        isOpen={showArenaImport}
        onClose={() => setShowArenaImport(false)}
        onImportComplete={handleArenaImport}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={showCSVImport}
        onClose={() => setShowCSVImport(false)}
        onImportComplete={handleCSVImport}
      />
    </div>
  );
};

export default CreateSpaceModal;