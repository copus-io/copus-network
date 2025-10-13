import React, { useState, useRef, useCallback } from 'react';
import { Button } from '../ui/button';

interface ImageCropperProps {
  image: File;
  aspectRatio?: number; // 宽高比，如 1 表示正方形，16/9 表示横向
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
  cropShape?: 'rect' | 'circle';
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
  cropShape = 'rect'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [originalCropArea, setOriginalCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });

  React.useEffect(() => {
    const url = URL.createObjectURL(image);
    setImageUrl(url);

    // 加载图片并设置初始裁切区域
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 计算合适的显示尺寸
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

      // 设置初始裁切区域（居中）
      const cropSize = Math.min(displayWidth, displayHeight) * 0.8;
      const cropWidth = aspectRatio >= 1 ? cropSize : cropSize * aspectRatio;
      const cropHeight = aspectRatio >= 1 ? cropSize / aspectRatio : cropSize;

      setCropArea({
        x: (displayWidth - cropWidth) / 2,
        y: (displayHeight - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight
      });

      drawCanvas(ctx, img, {
        x: (displayWidth - cropWidth) / 2,
        y: (displayHeight - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight
      });
    };

    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [image, aspectRatio]);

  const drawCanvas = useCallback((ctx: CanvasRenderingContext2D, img: HTMLImageElement, crop: CropArea) => {
    const canvas = ctx.canvas;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制图片
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 绘制遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 清除裁切区域的遮罩
    ctx.globalCompositeOperation = 'destination-out';
    if (cropShape === 'circle') {
      ctx.beginPath();
      ctx.arc(
        crop.x + crop.width / 2,
        crop.y + crop.height / 2,
        Math.min(crop.width, crop.height) / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    } else {
      ctx.fillRect(crop.x, crop.y, crop.width, crop.height);
    }

    // 重置合成模式
    ctx.globalCompositeOperation = 'source-over';

    // 绘制裁切框边框
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

      // 绘制调整手柄（只在矩形模式下显示）
      const handleSize = 8;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;

      // 8个调整手柄的位置
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
  }, [cropShape]);

  // 检测点击了哪个调整手柄
  const getResizeHandle = (x: number, y: number): ResizeHandle | null => {
    if (cropShape === 'circle') return null;

    const handleSize = 8;
    const tolerance = 4; // 增加点击容差

    // 检测各个手柄
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

    // 检测是否在裁切区域内（移动）
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
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !resizeHandle) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    let newCropArea = { ...originalCropArea };

    // 根据拖拽手柄类型调整裁切区域
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

    // 如果有宽高比限制，调整尺寸保持比例
    if (aspectRatio && resizeHandle !== 'move') {
      if (['nw', 'ne', 'se', 'sw'].includes(resizeHandle)) {
        // 角落手柄：按宽高比调整
        const newWidth = newCropArea.height * aspectRatio;
        const newHeight = newCropArea.width / aspectRatio;

        if (['nw', 'sw'].includes(resizeHandle)) {
          // 左侧手柄：调整x位置
          const widthDiff = newWidth - newCropArea.width;
          newCropArea.x = Math.max(0, newCropArea.x - widthDiff);
          newCropArea.width = newWidth;
        } else {
          // 右侧手柄：保持x位置
          newCropArea.width = Math.min(newWidth, imgDimensions.width - newCropArea.x);
          newCropArea.height = newCropArea.width / aspectRatio;
        }
      }
    }

    // 确保裁切区域不超出图片边界
    newCropArea.x = Math.max(0, Math.min(newCropArea.x, imgDimensions.width - newCropArea.width));
    newCropArea.y = Math.max(0, Math.min(newCropArea.y, imgDimensions.height - newCropArea.height));
    newCropArea.width = Math.min(newCropArea.width, imgDimensions.width - newCropArea.x);
    newCropArea.height = Math.min(newCropArea.height, imgDimensions.height - newCropArea.y);

    setCropArea(newCropArea);

    // 重新绘制
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => drawCanvas(ctx, img, newCropArea);
    img.src = imageUrl;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setResizeHandle(null);
  };

  // 根据鼠标位置设置光标样式
  const handleMouseHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return;

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

    canvas.style.cursor = handle ? cursors[handle] : 'default';
  };

  const handleCrop = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 创建新的canvas用于输出裁切结果
    const outputCanvas = document.createElement('canvas');
    const outputCtx = outputCanvas.getContext('2d');
    if (!outputCtx) return;

    const img = new Image();
    img.onload = () => {
      // 计算原图尺寸和显示尺寸的比例
      const scaleX = img.width / imgDimensions.width;
      const scaleY = img.height / imgDimensions.height;

      // 计算实际裁切区域
      const actualCrop = {
        x: cropArea.x * scaleX,
        y: cropArea.y * scaleY,
        width: cropArea.width * scaleX,
        height: cropArea.height * scaleY
      };

      // 设置输出尺寸
      const outputSize = 400; // 固定输出尺寸
      outputCanvas.width = outputSize;
      outputCanvas.height = outputSize;

      if (cropShape === 'circle') {
        // 圆形裁切
        outputCtx.beginPath();
        outputCtx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, 2 * Math.PI);
        outputCtx.clip();
      }

      // 绘制裁切后的图片
      outputCtx.drawImage(
        img,
        actualCrop.x, actualCrop.y, actualCrop.width, actualCrop.height,
        0, 0, outputSize, outputSize
      );

      // 转换为File对象
      outputCanvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], image.name, {
            type: image.type,
            lastModified: Date.now(),
          });
          onCrop(croppedFile);
        }
      }, image.type, 0.9);
    };

    img.src = imageUrl;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">裁切图片</h3>

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
          />
        </div>

        <div className="text-sm text-gray-600 mb-4 text-center">
          <div>🎯 拖拽移动裁切区域</div>
          <div>📏 拖拽边角可调整大小</div>
          {aspectRatio !== 1 && <div>🔒 保持 {aspectRatio > 1 ? `${aspectRatio}:1` : `1:${(1/aspectRatio).toFixed(1)}`} 宽高比</div>}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button onClick={handleCrop}>
            确定裁切
          </Button>
        </div>
      </div>
    </div>
  );
};