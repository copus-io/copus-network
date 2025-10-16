import React, { useState, useRef, useCallback } from 'react';
import { Button } from '../ui/button';

interface ImageCropperProps {
  image: File;
  aspectRatio?: number; // 宽高比，如 1 表示正方形，16/9 表示横向
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
  cropShape?: 'rect' | 'circle';
  type?: 'avatar' | 'banner'; // 添加类型以优化不同用途的输出
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

    // 保存当前状态
    ctx.save();

    // 应用缩放和偏移
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // 绘制图片
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 恢复状态
    ctx.restore();

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
  }, [cropShape, scale, offset]);

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
    } else {
      // 如果没有点击到调整手柄，则开始图片拖拽
      setIsDragging(true);
      setDragStart({ x, y });
      setResizeHandle(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    // 如果没有调整手柄，则处理图片拖拽
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
        // 角落手柄：按宽高比调整，优先保持用户拖拽的主要方向
        const widthChange = Math.abs(dx);
        const heightChange = Math.abs(dy);

        if (widthChange > heightChange) {
          // 主要拖拽宽度，按宽度计算高度
          newCropArea.height = newCropArea.width / aspectRatio;
        } else {
          // 主要拖拽高度，按高度计算宽度
          newCropArea.width = newCropArea.height * aspectRatio;
        }

        // 对于左侧手柄，需要调整x位置
        if (['nw', 'sw'].includes(resizeHandle)) {
          const widthDiff = newCropArea.width - originalCropArea.width;
          newCropArea.x = originalCropArea.x - widthDiff;
        }

        // 对于上方手柄，需要调整y位置
        if (['nw', 'ne'].includes(resizeHandle)) {
          const heightDiff = newCropArea.height - originalCropArea.height;
          newCropArea.y = originalCropArea.y - heightDiff;
        }
      } else if (['n', 's'].includes(resizeHandle)) {
        // 上下手柄：按高度调整宽度，居中显示
        const newWidth = newCropArea.height * aspectRatio;
        const widthDiff = newWidth - newCropArea.width;
        newCropArea.x = Math.max(0, newCropArea.x - widthDiff / 2);
        newCropArea.width = newWidth;
      } else if (['e', 'w'].includes(resizeHandle)) {
        // 左右手柄：按宽度调整高度，居中显示
        const newHeight = newCropArea.width / aspectRatio;
        const heightDiff = newHeight - newCropArea.height;
        newCropArea.y = Math.max(0, newCropArea.y - heightDiff / 2);
        newCropArea.height = newHeight;
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

  // 处理滚轮缩放
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 缩放步长
    const zoomStep = 0.1;
    const newScale = e.deltaY > 0
      ? Math.max(0.5, scale - zoomStep)  // 缩小，最小0.5x
      : Math.min(3, scale + zoomStep);   // 放大，最大3x

    if (newScale !== scale) {
      // 计算缩放中心点的偏移调整
      const scaleChange = newScale / scale;

      setScale(newScale);
      setOffset(prev => ({
        x: mouseX - (mouseX - prev.x) * scaleChange,
        y: mouseY - (mouseY - prev.y) * scaleChange
      }));

      // 重新绘制
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => drawCanvas(ctx, img, cropArea);
      img.src = imageUrl;
    }
  };

  // 处理图片拖拽（当不在调整手柄上时）
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

    // 重新绘制
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => drawCanvas(ctx, img, cropArea);
    img.src = imageUrl;
  };

  // 根据鼠标位置设置光标样式
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

    // 创建新的canvas用于输出裁切结果
    const outputCanvas = document.createElement('canvas');
    const outputCtx = outputCanvas.getContext('2d');
    if (!outputCtx) return;

    const img = new Image();
    img.onload = () => {
      // 计算原图尺寸和显示尺寸的比例
      const baseScaleX = img.width / imgDimensions.width;
      const baseScaleY = img.height / imgDimensions.height;

      // 考虑用户缩放和偏移，计算实际裁切区域
      // 需要将裁切区域坐标转换回原始图片坐标系
      const actualCrop = {
        x: (cropArea.x - offset.x) / scale * baseScaleX,
        y: (cropArea.y - offset.y) / scale * baseScaleY,
        width: cropArea.width / scale * baseScaleX,
        height: cropArea.height / scale * baseScaleY
      };

      // 确保裁切区域在图片范围内
      actualCrop.x = Math.max(0, Math.min(actualCrop.x, img.width - actualCrop.width));
      actualCrop.y = Math.max(0, Math.min(actualCrop.y, img.height - actualCrop.height));
      actualCrop.width = Math.min(actualCrop.width, img.width - actualCrop.x);
      actualCrop.height = Math.min(actualCrop.height, img.height - actualCrop.y);

      // 设置输出尺寸，保持原始宽高比
      const maxOutputSize = 1200; // 提高最大输出尺寸以获得更好的清晰度
      let outputWidth = actualCrop.width;
      let outputHeight = actualCrop.height;

      // 如果尺寸过小，需要放大以确保清晰度
      const minOutputSize = type === 'banner' ? 600 : 400; // 封面图需要更高的最小尺寸
      if (Math.max(outputWidth, outputHeight) < minOutputSize) {
        const scale = minOutputSize / Math.max(outputWidth, outputHeight);
        outputWidth *= scale;
        outputHeight *= scale;
      }

      // 如果尺寸过大，按比例缩放
      if (outputWidth > maxOutputSize || outputHeight > maxOutputSize) {
        const scale = Math.min(maxOutputSize / outputWidth, maxOutputSize / outputHeight);
        outputWidth *= scale;
        outputHeight *= scale;
      }

      outputCanvas.width = outputWidth;
      outputCanvas.height = outputHeight;

      // 调试信息
      console.log('🎯 ImageCropper输出信息:', {
        type,
        aspectRatio,
        '原始裁切区域': {
          width: actualCrop.width,
          height: actualCrop.height,
          ratio: (actualCrop.width / actualCrop.height).toFixed(2)
        },
        '输出尺寸': {
          width: outputWidth,
          height: outputHeight,
          ratio: (outputWidth / outputHeight).toFixed(2)
        },
        '比例匹配': Math.abs(aspectRatio - (outputWidth / outputHeight)) < 0.01 ? '✅' : '❌'
      });

      if (cropShape === 'circle') {
        // 圆形裁切
        outputCtx.beginPath();
        outputCtx.arc(outputWidth / 2, outputHeight / 2, Math.min(outputWidth, outputHeight) / 2, 0, 2 * Math.PI);
        outputCtx.clip();
      }

      // 绘制裁切后的图片
      outputCtx.drawImage(
        img,
        actualCrop.x, actualCrop.y, actualCrop.width, actualCrop.height,
        0, 0, outputWidth, outputHeight
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
      }, image.type, 0.95); // 提高压缩质量
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
            onWheel={handleWheel}
          />
        </div>

        <div className="text-sm text-gray-600 mb-4 text-center">
          <div>🎯 拖拽移动裁切区域</div>
          <div>🖼️ 拖拽空白区域移动图片</div>
          <div>📏 拖拽边角可调整大小</div>
          <div>🔍 滚轮滚动缩放图片</div>
          <div className="text-xs text-gray-500 mt-1">缩放范围: {scale.toFixed(1)}x (0.5x - 3.0x)</div>
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