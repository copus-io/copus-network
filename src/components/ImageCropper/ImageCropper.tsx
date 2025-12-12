import React, { useState, useRef, useCallback } from 'react';
import { Button } from '../ui/button';

interface ImageCropperProps {
  image: File;
  aspectRatio?: number; // Aspect ratio, e.g., 1 for square, 16/9 for landscape
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
  cropShape?: 'rect' | 'circle';
  type?: 'avatar' | 'banner'; // Type to optimize output for different purposes
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move';

export const ImageCropper: React.FC<ImageCropperProps> = ({
  image,
  aspectRatio = 1,
  onCrop,
  onCancel,
  cropShape = 'rect',
  type = 'avatar'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [originalCropArea, setOriginalCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const url = URL.createObjectURL(image);
    setImageUrl(url);

    // Load image and set initial crop area
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Calculate appropriate display size
      const maxWidth = 400;
      const maxHeight = 400;
      let displayWidth = img.width;
      let displayHeight = img.height;

      if (displayWidth > maxWidth || displayHeight > maxHeight) {
        const scale = Math.min(maxWidth / displayWidth, maxHeight / displayHeight);
        displayWidth *= scale;
        displayHeight *= scale;
      }

      canvas.width = displayWidth;
      canvas.height = displayHeight;

      setImgDimensions({ width: displayWidth, height: displayHeight });

      // Store the loaded image for reuse
      loadedImageRef.current = img;

      // Set initial crop area
      let cropWidth, cropHeight, cropX, cropY;

      if (cropShape === 'rect' && type === 'banner') {
        // For banner/rect mode: start with full width
        cropWidth = displayWidth;
        cropHeight = displayWidth / aspectRatio;

        // If calculated height exceeds image height, adjust to fit
        if (cropHeight > displayHeight) {
          cropHeight = displayHeight;
          cropWidth = displayHeight * aspectRatio;
        }

        // Center the crop area
        cropX = (displayWidth - cropWidth) / 2;
        cropY = (displayHeight - cropHeight) / 2;
      } else {
        // For avatar/circle mode: use 80% of smaller dimension (existing logic)
        const cropSize = Math.min(displayWidth, displayHeight) * 0.8;
        cropWidth = aspectRatio >= 1 ? cropSize : cropSize * aspectRatio;
        cropHeight = aspectRatio >= 1 ? cropSize / aspectRatio : cropSize;
        cropX = (displayWidth - cropWidth) / 2;
        cropY = (displayHeight - cropHeight) / 2;
      }

      const initialCrop = {
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight
      };

      setCropArea(initialCrop);
      drawCanvas(ctx, img, initialCrop);
    };

    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [image, aspectRatio]);

  const drawCanvas = useCallback((ctx: CanvasRenderingContext2D, img: HTMLImageElement, crop: CropArea) => {
    const canvas = ctx.canvas;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save current state
    ctx.save();

    // Apply scale and offset
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Restore state
    ctx.restore();

    // Draw overlay only OUTSIDE the crop area (not inside)
    if (cropShape === 'circle') {
      // For circle crop: save image portion first, then draw overlay, then redraw image in circle
      const centerX = crop.x + crop.width / 2;
      const centerY = crop.y + crop.height / 2;
      const radius = Math.min(crop.width, crop.height) / 2;

      // Create temporary canvas to save the circular image area
      const tempCanvas = document.createElement('canvas');
      const tempSize = radius * 2 + 4; // Add padding
      tempCanvas.width = tempSize;
      tempCanvas.height = tempSize;
      const tempCtx = tempCanvas.getContext('2d');

      if (tempCtx) {
        // Copy the circular portion of the image
        tempCtx.drawImage(
          canvas,
          centerX - radius - 2, centerY - radius - 2, tempSize, tempSize,
          0, 0, tempSize, tempSize
        );

        // Draw overlay on entire canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Redraw the circular image area on top
        ctx.drawImage(
          tempCanvas,
          0, 0, tempSize, tempSize,
          centerX - radius - 2, centerY - radius - 2, tempSize, tempSize
        );
      }
    } else {
      // For rectangle crop, draw overlay in 4 rectangles around the crop area
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      // Top rectangle
      ctx.fillRect(0, 0, canvas.width, crop.y);
      // Left rectangle
      ctx.fillRect(0, crop.y, crop.x, crop.height);
      // Right rectangle
      ctx.fillRect(crop.x + crop.width, crop.y, canvas.width - (crop.x + crop.width), crop.height);
      // Bottom rectangle
      ctx.fillRect(0, crop.y + crop.height, canvas.width, canvas.height - (crop.y + crop.height));
    }

    // Draw crop frame border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    if (cropShape === 'circle') {
      ctx.beginPath();
      ctx.arc(
        crop.x + crop.width / 2,
        crop.y + crop.height / 2,
        Math.min(crop.width, crop.height) / 2,
        0,
        2 * Math.PI
      );
      ctx.stroke();
    } else {
      ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);

      // Draw resize handles (only shown in rectangle mode)
      const handleSize = 8;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;

      // 8 resize handle positions
      const handles = [
        { x: crop.x - handleSize/2, y: crop.y - handleSize/2 }, // nw
        { x: crop.x + crop.width/2 - handleSize/2, y: crop.y - handleSize/2 }, // n
        { x: crop.x + crop.width - handleSize/2, y: crop.y - handleSize/2 }, // ne
        { x: crop.x + crop.width - handleSize/2, y: crop.y + crop.height/2 - handleSize/2 }, // e
        { x: crop.x + crop.width - handleSize/2, y: crop.y + crop.height - handleSize/2 }, // se
        { x: crop.x + crop.width/2 - handleSize/2, y: crop.y + crop.height - handleSize/2 }, // s
        { x: crop.x - handleSize/2, y: crop.y + crop.height - handleSize/2 }, // sw
        { x: crop.x - handleSize/2, y: crop.y + crop.height/2 - handleSize/2 }, // w
      ];

      handles.forEach(handle => {
        ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
        ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
      });
    }
  }, [cropShape, scale, offset]);

  // Detect which resize handle was clicked
  const getResizeHandle = (x: number, y: number): ResizeHandle | null => {
    if (cropShape === 'circle') return null;

    const handleSize = 8;
    const tolerance = 4; // Increase click tolerance

    // Detect each handle
    const handles = [
      { type: 'nw' as ResizeHandle, x: cropArea.x - handleSize/2, y: cropArea.y - handleSize/2 },
      { type: 'n' as ResizeHandle, x: cropArea.x + cropArea.width/2 - handleSize/2, y: cropArea.y - handleSize/2 },
      { type: 'ne' as ResizeHandle, x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y - handleSize/2 },
      { type: 'e' as ResizeHandle, x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y + cropArea.height/2 - handleSize/2 },
      { type: 'se' as ResizeHandle, x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2 },
      { type: 's' as ResizeHandle, x: cropArea.x + cropArea.width/2 - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2 },
      { type: 'sw' as ResizeHandle, x: cropArea.x - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2 },
      { type: 'w' as ResizeHandle, x: cropArea.x - handleSize/2, y: cropArea.y + cropArea.height/2 - handleSize/2 },
    ];

    for (const handle of handles) {
      if (x >= handle.x - tolerance && x <= handle.x + handleSize + tolerance &&
          y >= handle.y - tolerance && y <= handle.y + handleSize + tolerance) {
        return handle.type;
      }
    }

    // Detect if click is inside crop area (for moving)
    if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
        y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      return 'move';
    }

    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const handle = getResizeHandle(x, y);
    if (handle) {
      setResizeHandle(handle);
      setIsDragging(true);
      setDragStart({ x, y });
      setOriginalCropArea({ ...cropArea });
    } else {
      // If not clicking on resize handle, start image dragging
      setIsDragging(true);
      setDragStart({ x, y });
      setResizeHandle(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    // If no resize handle, handle image dragging
    if (!resizeHandle) {
      handleImageDrag(e);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    let newCropArea = { ...originalCropArea };

    // Adjust crop area based on drag handle type
    switch (resizeHandle) {
      case 'move':
        newCropArea.x = Math.max(0, Math.min(originalCropArea.x + dx, imgDimensions.width - originalCropArea.width));
        newCropArea.y = Math.max(0, Math.min(originalCropArea.y + dy, imgDimensions.height - originalCropArea.height));
        break;

      case 'nw':
        newCropArea.x = Math.max(0, originalCropArea.x + dx);
        newCropArea.y = Math.max(0, originalCropArea.y + dy);
        newCropArea.width = Math.max(50, originalCropArea.width - dx);
        newCropArea.height = Math.max(50, originalCropArea.height - dy);
        break;

      case 'n':
        newCropArea.y = Math.max(0, originalCropArea.y + dy);
        newCropArea.height = Math.max(50, originalCropArea.height - dy);
        break;

      case 'ne':
        newCropArea.y = Math.max(0, originalCropArea.y + dy);
        newCropArea.width = Math.max(50, Math.min(originalCropArea.width + dx, imgDimensions.width - originalCropArea.x));
        newCropArea.height = Math.max(50, originalCropArea.height - dy);
        break;

      case 'e':
        newCropArea.width = Math.max(50, Math.min(originalCropArea.width + dx, imgDimensions.width - originalCropArea.x));
        break;

      case 'se':
        newCropArea.width = Math.max(50, Math.min(originalCropArea.width + dx, imgDimensions.width - originalCropArea.x));
        newCropArea.height = Math.max(50, Math.min(originalCropArea.height + dy, imgDimensions.height - originalCropArea.y));
        break;

      case 's':
        newCropArea.height = Math.max(50, Math.min(originalCropArea.height + dy, imgDimensions.height - originalCropArea.y));
        break;

      case 'sw':
        newCropArea.x = Math.max(0, originalCropArea.x + dx);
        newCropArea.width = Math.max(50, originalCropArea.width - dx);
        newCropArea.height = Math.max(50, Math.min(originalCropArea.height + dy, imgDimensions.height - originalCropArea.y));
        break;

      case 'w':
        newCropArea.x = Math.max(0, originalCropArea.x + dx);
        newCropArea.width = Math.max(50, originalCropArea.width - dx);
        break;
    }

    // If aspect ratio is locked, adjust size to maintain proportions
    if (aspectRatio && resizeHandle !== 'move') {
      if (['nw', 'ne', 'se', 'sw'].includes(resizeHandle)) {
        // Corner handles: adjust by aspect ratio, prioritize user's main drag direction
        const widthChange = Math.abs(dx);
        const heightChange = Math.abs(dy);

        if (widthChange > heightChange) {
          // Primarily dragging width, calculate height from width
          newCropArea.height = newCropArea.width / aspectRatio;
        } else {
          // Primarily dragging height, calculate width from height
          newCropArea.width = newCropArea.height * aspectRatio;
        }

        // For left-side handles, need to adjust x position
        if (['nw', 'sw'].includes(resizeHandle)) {
          const widthDiff = newCropArea.width - originalCropArea.width;
          newCropArea.x = originalCropArea.x - widthDiff;
        }

        // For top handles, need to adjust y position
        if (['nw', 'ne'].includes(resizeHandle)) {
          const heightDiff = newCropArea.height - originalCropArea.height;
          newCropArea.y = originalCropArea.y - heightDiff;
        }
      } else if (['n', 's'].includes(resizeHandle)) {
        // Top/bottom handles: adjust width by height, center horizontally
        const newWidth = newCropArea.height * aspectRatio;
        const widthDiff = newWidth - newCropArea.width;
        newCropArea.x = Math.max(0, newCropArea.x - widthDiff / 2);
        newCropArea.width = newWidth;
      } else if (['e', 'w'].includes(resizeHandle)) {
        // Left/right handles: adjust height by width, center vertically
        const newHeight = newCropArea.width / aspectRatio;
        const heightDiff = newHeight - newCropArea.height;
        newCropArea.y = Math.max(0, newCropArea.y - heightDiff / 2);
        newCropArea.height = newHeight;
      }
    }

    // Ensure crop area stays within image bounds
    newCropArea.x = Math.max(0, Math.min(newCropArea.x, imgDimensions.width - newCropArea.width));
    newCropArea.y = Math.max(0, Math.min(newCropArea.y, imgDimensions.height - newCropArea.height));
    newCropArea.width = Math.min(newCropArea.width, imgDimensions.width - newCropArea.x);
    newCropArea.height = Math.min(newCropArea.height, imgDimensions.height - newCropArea.y);

    setCropArea(newCropArea);

    // Redraw canvas using cached image
    const ctx = canvas.getContext('2d');
    if (!ctx || !loadedImageRef.current) return;

    drawCanvas(ctx, loadedImageRef.current, newCropArea);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setResizeHandle(null);
  };

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom step size
    const zoomStep = 0.1;
    const newScale = e.deltaY > 0
      ? Math.max(0.5, scale - zoomStep)  // Zoom out, minimum 0.5x
      : Math.min(3, scale + zoomStep);   // Zoom in, maximum 3x

    if (newScale !== scale) {
      // Calculate offset adjustment for zoom center point
      const scaleChange = newScale / scale;

      setScale(newScale);
      setOffset(prev => ({
        x: mouseX - (mouseX - prev.x) * scaleChange,
        y: mouseY - (mouseY - prev.y) * scaleChange
      }));

      // Redraw canvas using cached image
      const ctx = canvas.getContext('2d');
      if (!ctx || !loadedImageRef.current) return;

      drawCanvas(ctx, loadedImageRef.current, cropArea);
    }
  };

  // Handle image dragging (when not on a resize handle)
  const handleImageDrag = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || resizeHandle) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    setOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));

    setDragStart({ x, y });

    // Redraw canvas using cached image
    const ctx = canvas.getContext('2d');
    if (!ctx || !loadedImageRef.current) return;

    drawCanvas(ctx, loadedImageRef.current, cropArea);
  };

  // Set cursor style based on mouse position
  const handleMouseHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor = resizeHandle ? 'grabbing' : 'grabbing';
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const handle = getResizeHandle(x, y);

    const cursors: Record<ResizeHandle, string> = {
      'nw': 'nw-resize',
      'n': 'n-resize',
      'ne': 'ne-resize',
      'e': 'e-resize',
      'se': 'se-resize',
      's': 's-resize',
      'sw': 'sw-resize',
      'w': 'w-resize',
      'move': 'move'
    };

    canvas.style.cursor = handle ? cursors[handle] : 'grab';
  };

  const handleCrop = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create new canvas for output crop result
    const outputCanvas = document.createElement('canvas');
    const outputCtx = outputCanvas.getContext('2d');
    if (!outputCtx) return;

    const img = new Image();
    img.onload = () => {
      // Calculate ratio between original image size and display size
      const baseScaleX = img.width / imgDimensions.width;
      const baseScaleY = img.height / imgDimensions.height;

      // Calculate actual crop area considering user zoom and offset
      // Need to convert crop area coordinates back to original image coordinate system
      const actualCrop = {
        x: (cropArea.x - offset.x) / scale * baseScaleX,
        y: (cropArea.y - offset.y) / scale * baseScaleY,
        width: cropArea.width / scale * baseScaleX,
        height: cropArea.height / scale * baseScaleY
      };

      // Ensure crop area stays within image bounds
      actualCrop.x = Math.max(0, Math.min(actualCrop.x, img.width - actualCrop.width));
      actualCrop.y = Math.max(0, Math.min(actualCrop.y, img.height - actualCrop.height));
      actualCrop.width = Math.min(actualCrop.width, img.width - actualCrop.x);
      actualCrop.height = Math.min(actualCrop.height, img.height - actualCrop.y);

      // Set output size, maintain original aspect ratio
      const maxOutputSize = 1200; // Increased max output size for better clarity
      let outputWidth = actualCrop.width;
      let outputHeight = actualCrop.height;

      // If size is too small, scale up to ensure clarity
      const minOutputSize = type === 'banner' ? 600 : 400; // Banners need higher minimum size
      if (Math.max(outputWidth, outputHeight) < minOutputSize) {
        const scale = minOutputSize / Math.max(outputWidth, outputHeight);
        outputWidth *= scale;
        outputHeight *= scale;
      }

      // If size is too large, scale down proportionally
      if (outputWidth > maxOutputSize || outputHeight > maxOutputSize) {
        const scale = Math.min(maxOutputSize / outputWidth, maxOutputSize / outputHeight);
        outputWidth *= scale;
        outputHeight *= scale;
      }

      outputCanvas.width = outputWidth;
      outputCanvas.height = outputHeight;

      // Debug information
      console.log('🎯 ImageCropper Output Info:', {
        type,
        aspectRatio,
        'Original Crop Area': {
          width: actualCrop.width,
          height: actualCrop.height,
          ratio: (actualCrop.width / actualCrop.height).toFixed(2)
        },
        'Output Size': {
          width: outputWidth,
          height: outputHeight,
          ratio: (outputWidth / outputHeight).toFixed(2)
        },
        'Ratio Match': Math.abs(aspectRatio - (outputWidth / outputHeight)) < 0.01 ? '✅' : '❌'
      });

      if (cropShape === 'circle') {
        // Circle crop
        outputCtx.beginPath();
        outputCtx.arc(outputWidth / 2, outputHeight / 2, Math.min(outputWidth, outputHeight) / 2, 0, 2 * Math.PI);
        outputCtx.clip();
      }

      // Draw cropped image
      outputCtx.drawImage(
        img,
        actualCrop.x, actualCrop.y, actualCrop.width, actualCrop.height,
        0, 0, outputWidth, outputHeight
      );

      // Convert to File object
      outputCanvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], image.name, {
            type: image.type,
            lastModified: Date.now(),
          });
          onCrop(croppedFile);
        }
      }, image.type, 0.95); // Improved compression quality
    };

    img.src = imageUrl;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Crop Image</h3>

        <div className="flex justify-center mb-4">
          <canvas
            ref={canvasRef}
            className="border border-gray-300"
            onMouseDown={handleMouseDown}
            onMouseMove={(e) => {
              handleMouseHover(e);
              handleMouseMove(e);
            }}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
        </div>

        <div className="flex justify-end gap-5">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-[50px] hover:bg-gray-100 transition-colors cursor-pointer [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCrop}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-red rounded-[50px] hover:bg-red/90 transition-colors cursor-pointer [font-family:'Lato',Helvetica] font-semibold text-white text-base"
          >
            Confirm Crop
          </button>
        </div>
      </div>
    </div>
  );
};