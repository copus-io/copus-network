import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ImagePreviewState {
  isOpen: boolean;
  imageUrl: string;
  alt: string;
}

interface ImagePreviewContextType {
  previewState: ImagePreviewState;
  openPreview: (imageUrl: string, alt?: string) => void;
  closePreview: () => void;
}

const ImagePreviewContext = createContext<ImagePreviewContextType | undefined>(undefined);

interface ImagePreviewProviderProps {
  children: ReactNode;
}

export const ImagePreviewProvider: React.FC<ImagePreviewProviderProps> = ({ children }) => {
  const [previewState, setPreviewState] = useState<ImagePreviewState>({
    isOpen: false,
    imageUrl: '',
    alt: ''
  });

  const openPreview = (imageUrl: string, alt: string = 'Preview image') => {
    setPreviewState({
      isOpen: true,
      imageUrl,
      alt
    });
  };

  const closePreview = () => {
    setPreviewState({
      isOpen: false,
      imageUrl: '',
      alt: ''
    });
  };

  return (
    <ImagePreviewContext.Provider value={{ previewState, openPreview, closePreview }}>
      {children}
    </ImagePreviewContext.Provider>
  );
};

export const useImagePreview = () => {
  const context = useContext(ImagePreviewContext);
  if (context === undefined) {
    throw new Error('useImagePreview must be used within an ImagePreviewProvider');
  }
  return context;
};