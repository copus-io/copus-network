import React from 'react';
import { ImagePreviewModal } from './image-preview-modal';
import { useImagePreview } from '../../contexts/ImagePreviewContext';

export const GlobalImagePreview: React.FC = () => {
  const { previewState, closePreview } = useImagePreview();

  return (
    <ImagePreviewModal
      isOpen={previewState.isOpen}
      imageUrl={previewState.imageUrl}
      alt={previewState.alt}
      onClose={closePreview}
    />
  );
};