import React, { useState } from 'react';
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
  const [visibility, setVisibility] = useState(SPACE_VISIBILITY.PUBLIC);

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Import states
  const [showArenaImport, setShowArenaImport] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);

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

      // Call API to create space with visibility
      const response = await AuthService.createSpace(
        spaceName.trim(),
        description,
        coverUrl,
        faceUrl,
        visibility
      );
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
            <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
              <h2
                id="create-space-title"
                className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap"
              >
                {title}
              </h2>

              {mode === 'full' && (
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

                {/* Private Space Toggle */}
                <div className="flex items-start gap-3 relative self-stretch w-full flex-[0_0_auto]">
                  <input
                    id="private-space-checkbox"
                    type="checkbox"
                    checked={visibility === SPACE_VISIBILITY.PRIVATE}
                    onChange={(e) => setVisibility(e.target.checked ? SPACE_VISIBILITY.PRIVATE : SPACE_VISIBILITY.PUBLIC)}
                    className="mt-1 w-4 h-4 text-red bg-gray-100 border-gray-300 rounded focus:ring-red focus:ring-2 cursor-pointer"
                  />
                  <div className="flex flex-col gap-1 flex-1">
                    <label
                      htmlFor="private-space-checkbox"
                      className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[22.4px] cursor-pointer"
                    >
                      Private Space
                    </label>
                    <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-gray-500 text-sm tracking-[0] leading-[18px]">
                      Only you can see and access this space. It won't appear in public listings or search results.
                    </span>

                    {/* Show additional note for CSV imports */}
                    {visibility === SPACE_VISIBILITY.PRIVATE && spaceDescription.includes('Imported from CSV') && (
                      <div className="mt-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                        💡 CSV导入内容默认为私享，保护你的个人收藏。你可以稍后在空间设置中调整隐私选项。
                      </div>
                    )}
                  </div>
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