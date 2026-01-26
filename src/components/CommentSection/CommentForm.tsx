// Comment form component

import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCreateComment } from '../../hooks/queries/useComments';
import { useUser } from '../../contexts/UserContext';
import { getUserDisplayName } from './utils';
import { CreateCommentRequest } from '../../types/comment';
import CommentImageUploaderV2, { CommentImageUploaderRef } from './CommentImageUploaderV2';
import { AuthService } from '../../services/authService';
import { useImagePreview } from '../../contexts/ImagePreviewContext';
import { revokeImagePreview } from '../../utils/imageUtils';
import { useToast } from '../ui/toast'; // Toast hook for notifications

// 评论图片接口
interface CommentImage {
  id: string;
  file: File;
  previewUrl: string;
  uploadUrl?: string;
  isUploading?: boolean;
  error?: string;
}

interface CommentFormProps {
  targetType: 'article' | 'treasury' | 'user' | 'space';
  targetId: string;
  articleId?: string; // 新增：数字ID，用于API调用
  parentId?: string;
  replyToId?: string;
  replyToUser?: string;
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  replyState?: {
    isReplying: boolean;
    parentId?: string;
    replyToId?: string;
    replyToUser?: string;
  };
  onReplyComplete?: () => void;
  hideReplyCancel?: boolean; // 新增：隐藏回复指示器中的取消按钮
}

// 暴露给父组件的方法
export interface CommentFormRef {
  focusAndSetReply: (replyInfo: {
    parentId: string;
    replyToId: string;
    replyToUser: string;
  }) => void;
}

export const CommentForm = forwardRef<CommentFormRef, CommentFormProps>((
  {
    targetType,
    targetId,
    articleId,
    parentId,
    replyToId,
    replyToUser,
    onSubmitSuccess,
    onCancel,
    placeholder = 'Share your thoughts on this link...',
    className = '',
    replyState,
    onReplyComplete,
    hideReplyCancel = false
  },
  ref
) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentReplyInfo, setCurrentReplyInfo] = useState<{
    parentId?: string;
    replyToId?: string;
    replyToUser?: string;
  }>({});
  const [images, setImages] = useState<CommentImage[]>([]);
  const [imageUploadError, setImageUploadError] = useState<string>('');
  const [formError, setFormError] = useState<string>(''); // 新增：表单验证错误
  const { openPreview } = useImagePreview();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageUploaderRef = useRef<CommentImageUploaderRef>(null);
  const { user } = useUser();
  const { showToast } = useToast();
  const createCommentMutation = useCreateComment();

  // 响应外部回复状态变化
  useEffect(() => {
    if (replyState?.isReplying) {
      console.log('🔄 开始回复模式:', {
        parentId: replyState.parentId,
        replyToId: replyState.replyToId,
        replyToUser: replyState.replyToUser,
        currentImagesCount: images.length
      });
      setCurrentReplyInfo({
        parentId: replyState.parentId,
        replyToId: replyState.replyToId,
        replyToUser: replyState.replyToUser
      });
      // 清除图片状态，确保回复时从干净状态开始
      setImages([]);
      imageUploaderRef.current?.clearImages(); // 清除组件内部的图片缓存
      setImageUploadError('');
    } else {
      console.log('🔄 退出回复模式');
      setCurrentReplyInfo({});
    }
  }, [replyState]);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    focusAndSetReply: (replyInfo) => {
      console.log('🎯 CommentForm focusAndSetReply called:', replyInfo);
      setCurrentReplyInfo(replyInfo);
      // 开始回复时清理图片状态
      setImages([]);
      imageUploaderRef.current?.clearImages();
      setImageUploadError('');
      // 聚焦到文本框
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }), []);

  // 处理图片变化
  const handleImagesChange = (newImages: CommentImage[]) => {
    console.log('📸 图片状态变化:', {
      oldCount: images.length,
      newCount: newImages.length,
      isReply: !!(currentReplyInfo.parentId || parentId),
      replyInfo: {
        parentId: currentReplyInfo.parentId || parentId,
        replyToId: currentReplyInfo.replyToId || replyToId
      }
    });
    setImages(newImages);
    setImageUploadError('');
    setFormError(''); // 清除表单错误
  };

  // 处理图片上传错误
  const handleImageUploadError = (error: string) => {
    setImageUploadError(error);
  };

  const handleSubmit = async () => {
    // 清除之前的错误
    setFormError('');
    setImageUploadError('');

    // 前端验证：检查内容和图片
    if (!content.trim() && images.length === 0) {
      const errorMsg = '请添加评论内容或图片';
      setFormError(errorMsg);
      showToast('Please add some text or images to your comment before posting', 'error');
      return;
    }

    if (!user) {
      const errorMsg = '请先登录';
      setFormError(errorMsg);
      showToast('Please log in to post comments. Refresh the page if already logged in', 'error');
      return;
    }

    // 检查是否有图片上传错误
    const hasImageErrors = images.some(img => img.error || img.status === 'error');
    if (hasImageErrors) {
      const errorMsg = '请先处理图片上传错误';
      setFormError(errorMsg);
      showToast('Please fix image upload errors first', 'error');
      return;
    }

    setIsSubmitting(true);

    // 上传图片到服务器
    let imageUrls: string[] = [];
    if (images.length > 0) {
      console.log('📸 开始上传图片:', {
        imageCount: images.length,
        isReply: !!(currentReplyInfo.parentId || parentId),
        replyInfo: {
          parentId: currentReplyInfo.parentId || parentId,
          replyToId: currentReplyInfo.replyToId || replyToId
        }
      });

      try {
        const files = images.map(img => img.file);
        imageUrls = await AuthService.uploadCommentImages(files);
        console.log('📸 图片上传成功:', {
          uploadedUrls: imageUrls,
          count: imageUrls.length
        });
      } catch (error) {
        console.error('📸 图片上传失败:', error);
        const errorMsg = error instanceof Error ? error.message : '';
        if (errorMsg.includes('size') || errorMsg.includes('large')) {
          showToast('Images are too large. Please use images smaller than 10MB', 'error');
        } else if (errorMsg.includes('format') || errorMsg.includes('type')) {
          showToast('Invalid image format. Please use JPG, PNG, GIF, or WebP images', 'error');
        } else {
          showToast('Image upload failed. Please check your images and try again', 'error');
        }
        setImageUploadError('Image upload failed');
        setIsSubmitting(false);
        return;
      }
    }

    // 使用当前回复信息或props传入的信息
    const activeReplyInfo = {
      parentId: currentReplyInfo.parentId || parentId,
      replyToId: currentReplyInfo.replyToId || replyToId,
      replyToUser: currentReplyInfo.replyToUser || replyToUser
    };


    // 📝 新的parentId逻辑处理
    // - 如果没有parentId或replyToId，说明是1级评论，不传parentId（或传0）
    // - 如果有parentId，说明是回复评论，传递对应的parentId
    const isReplyComment = !!(activeReplyInfo.parentId && activeReplyInfo.replyToId);

    const commentData: CreateCommentRequest = {
      content: content.trim(),
      targetType,
      targetId,
      ...(articleId && { articleId }), // 添加数字ID
      ...(isReplyComment && { parentId: activeReplyInfo.parentId }),
      ...(activeReplyInfo.replyToId && { replyToId: activeReplyInfo.replyToId }),
      // 📝 重要：对于2级评论（直接回复1级），replyToUser 应该是 undefined/null
      // 只有3级评论（回复2级）才传递 replyToUser
      ...(activeReplyInfo.replyToUser && { replyToUser: activeReplyInfo.replyToUser }),
      // 添加图片URLs - 转换为后端需要的格式（逗号分隔的字符串）
      ...(imageUrls.length > 0 && { imageUrls: imageUrls.join(',') }),
    };

    // 🔧 存储引用信息到localStorage，页面刷新后可以恢复

    if (activeReplyInfo.replyToId && activeReplyInfo.replyToUser) {
      const replyContext = {
        replyToId: activeReplyInfo.replyToId,
        replyToUser: activeReplyInfo.replyToUser,
        targetType,
        targetId,
        timestamp: Date.now()
      };
      localStorage.setItem('pendingReplyContext', JSON.stringify(replyContext));
      // 验证存储是否成功
      const verifyStored = localStorage.getItem('pendingReplyContext');
      console.log('✅ Verified localStorage storage:', {
        stored: !!verifyStored,
        content: verifyStored
      });
    } else {
      console.log('📭 No reply context to store (not a reply or missing info)');
    }

    try {
      console.log('📝 Submitting comment:', {
        ...commentData,
        hasImages: !!imageUrls.length,
        imageUrlsCount: imageUrls.length,
        isReply: isReplyComment
      });
      const result = await createCommentMutation.mutateAsync(commentData);
      console.log('✅ Comment submitted successfully:', {
        commentId: result?.id,
        hasImages: !!result?.images?.length,
        imagesCount: result?.images?.length || 0
      });
      setContent('');
      setImages([]); // 清除CommentForm的图片状态
      imageUploaderRef.current?.clearImages(); // 清除组件内部的图片缓存
      setImageUploadError('');
      setFormError(''); // 清除表单错误
      setCurrentReplyInfo({}); // 清除回复状态
      onReplyComplete?.(); // 通知父组件回复完成
      onSubmitSuccess?.();
    } catch (error) {
      console.error('❌ Failed to create comment:', error);
      // 如果提交失败，清理存储的引用信息
      localStorage.removeItem('pendingReplyContext');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    setImages([]); // 清除图片
    setImageUploadError('');
    setFormError(''); // 清除表单错误
    setCurrentReplyInfo({}); // 清除回复状态
    imageUploaderRef.current?.clearImages(); // 清除图片组件状态
    onReplyComplete?.(); // 通知父组件回复取消
    onCancel?.();
  };

  // Determine placeholder text
  const getPlaceholderText = () => {
    // When in modal (hideReplyCancel is true), use simple placeholder
    if (hideReplyCancel) {
      return placeholder;
    }

    const activeParentId = currentReplyInfo.parentId || parentId;
    const activeReplyUser = currentReplyInfo.replyToUser || replyToUser;

    if (activeParentId) {
      if (activeReplyUser) {
        let displayName = activeReplyUser;
        if (typeof activeReplyUser === 'object') {
          displayName = getUserDisplayName(activeReplyUser);
        }
        return `Reply to @${displayName}...`;
      } else {
        return 'Reply to this comment...';
      }
    }
    return placeholder;
  };

  // 检查是否正在回复
  const isReplying = !!(currentReplyInfo.replyToId || replyToId || currentReplyInfo.parentId || parentId);

  // 获取回复显示文本
  const getReplyDisplayText = () => {
    const activeReplyUser = currentReplyInfo.replyToUser || replyToUser;
    if (activeReplyUser) {
      // 处理用户对象
      if (typeof activeReplyUser === 'object') {
        const displayName = getUserDisplayName(activeReplyUser);
        return `@${displayName}`;
      }
      // 处理字符串（向后兼容）
      return `@${activeReplyUser}`;
    } else {
      return 'this comment';
    }
  };

  // User avatar with gradient
  const getAvatarGradient = () => {
    if (!user?.id) return 'bg-gray-400';
    const gradients = [
      'bg-gradient-to-br from-purple-500 to-pink-500',
      'bg-gradient-to-br from-blue-500 to-cyan-500',
      'bg-gradient-to-br from-green-500 to-teal-500',
      'bg-gradient-to-br from-yellow-500 to-orange-500',
      'bg-gradient-to-br from-indigo-500 to-purple-500',
    ];
    return gradients[user.id % gradients.length];
  };

  if (!user) {
    return (
      <div className={`py-4 ${className}`}>
        <div className="rounded-[20px] transition-all duration-300 ease-out ring-1 ring-black/[0.02] hover:ring-black/[0.04]" style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.9) 100%)',
          backdropFilter: 'blur(20px) brightness(1.08) saturate(1.1) contrast(1.02)',
          WebkitBackdropFilter: 'blur(20px) brightness(1.08) saturate(1.1) contrast(1.02)',
          border: '2px solid transparent',
          backgroundImage: `
            linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.9) 100%),
            linear-gradient(135deg, rgba(203, 213, 225, 0.4) 0%, rgba(148, 163, 184, 0.3) 25%, rgba(191, 219, 254, 0.2) 50%, rgba(148, 163, 184, 0.3) 75%, rgba(203, 213, 225, 0.4) 100%)
          `,
          backgroundOrigin: 'border-box',
          backgroundClip: 'content-box, border-box',
          boxShadow: `
            0 4px 20px rgba(0, 0, 0, 0.04),
            0 1px 4px rgba(0, 0, 0, 0.02),
            inset 0 1px 0 rgba(255, 255, 255, 0.8),
            inset 0 0 20px rgba(255, 255, 255, 0.1)
          `,
        }}>
          <div className="text-center py-8 px-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-600 [font-family:'Lato',Helvetica] text-base font-medium">
                Want to join the conversation?
              </p>
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #ff7849 0%, #f23a00 85%, #e03200 100%)',
                  boxShadow: `
                    0 8px 24px rgba(242, 58, 0, 0.3),
                    0 3px 12px rgba(242, 58, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                  `,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ff8c5c 0%, #f23a00 75%, #d62f00 100%)';
                  e.currentTarget.style.boxShadow = `
                    0 12px 32px rgba(242, 58, 0, 0.4),
                    0 4px 16px rgba(242, 58, 0, 0.25),
                    inset 0 1px 0 rgba(255, 255, 255, 0.35),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.12)
                  `;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ff7849 0%, #f23a00 85%, #e03200 100%)';
                  e.currentTarget.style.boxShadow = `
                    0 8px 24px rgba(242, 58, 0, 0.3),
                    0 3px 12px rgba(242, 58, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                  `;
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign in to comment
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-1 ${className}`}>
      <div className="flex gap-4">
        {/* Apple-style comment input with enhanced contrast */}
        <div className="flex-1">
          <div
            className="rounded-[20px] transition-all duration-300 ease-out ring-1 ring-black/[0.02] hover:ring-black/[0.04] focus-within:ring-2 focus-within:ring-blue-500/25"
            style={{
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.9) 100%)',
              backdropFilter: 'blur(20px) brightness(1.08) saturate(1.1) contrast(1.02)',
              WebkitBackdropFilter: 'blur(20px) brightness(1.08) saturate(1.1) contrast(1.02)',
              border: '2px solid transparent',
              backgroundImage: `
                linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.9) 100%),
                linear-gradient(135deg, rgba(203, 213, 225, 0.4) 0%, rgba(148, 163, 184, 0.3) 25%, rgba(191, 219, 254, 0.2) 50%, rgba(148, 163, 184, 0.3) 75%, rgba(203, 213, 225, 0.4) 100%)
              `,
              backgroundOrigin: 'border-box',
              backgroundClip: 'content-box, border-box',
              boxShadow: `
                0 4px 20px rgba(0, 0, 0, 0.04),
                0 1px 4px rgba(0, 0, 0, 0.02),
                inset 0 1px 0 rgba(255, 255, 255, 0.8),
                inset 0 0 20px rgba(255, 255, 255, 0.1)
              `,
            }}
          >
            {/* Reply indicator - only show when not in modal */}
            {isReplying && !hideReplyCancel && (
              <div className="px-3 sm:px-6 pt-4 pb-2">
                <div className="px-2 py-1 text-sm text-blue-700 [font-family:'Lato',Helvetica] bg-blue-50 rounded-lg border-l-4 border-blue-400 flex items-center justify-between">
                  <span>Replying to {getReplyDisplayText()}</span>
                  <button
                    onClick={handleCancel}
                    className="ml-2 hover:scale-110 transition-transform duration-200"
                    style={{ color: 'rgba(59, 130, 246, 0.7)' }}
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (formError) setFormError('');
                if (imageUploadError) setImageUploadError('');
              }}
              placeholder={getPlaceholderText()}
              className="w-full px-3 sm:px-6 py-3 bg-transparent border-0 resize-none [font-family:'Lato',Helvetica] text-base transition-colors duration-200 rounded-2xl"
              style={{
                outline: 'none',
                color: 'rgba(0, 0, 0, 0.9)',
                fontSize: '16px',
                lineHeight: '1.5',
                minHeight: '60px',
              }}
              rows={2}
              disabled={isSubmitting}
            />

            {/* 图片上传组件 */}
            <div className="px-3 sm:px-6 pb-2">
              <CommentImageUploaderV2
                ref={imageUploaderRef}
                maxImages={9}
                onImagesChange={handleImagesChange}
                onError={handleImageUploadError}
                disabled={isSubmitting}
              />

              {/* 错误提示 */}
              {(imageUploadError || formError) && (
                <div className="mt-2 space-y-1">
                  {formError && (
                    <div className="text-sm text-red-500 [font-family:'Lato',Helvetica] bg-red-50 px-3 py-2 rounded-md border-l-3 border-red-400">
                      {formError}
                    </div>
                  )}
                  {imageUploadError && (
                    <div className="text-sm text-red-500 [font-family:'Lato',Helvetica] bg-red-50 px-3 py-2 rounded-md border-l-3 border-red-400">
                      {imageUploadError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Apple-style action bar */}
            <div
              className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 rounded-b-[20px]"
              style={{
                background: 'transparent',
              }}
            >
              <div className="flex items-center gap-3">
                {/* 图片上传按钮 - 无图片时显示 */}
                {images.length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      // 触发CommentImageUploaderV2的文件选择
                      imageUploaderRef.current?.triggerFileSelect();
                    }}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-full transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)',
                      border: '1px solid rgba(203, 213, 225, 0.6)',
                      backdropFilter: 'blur(8px)',
                      color: 'rgba(100, 116, 139, 0.8)'
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Image
                  </button>
                )}

                {/* 图片网格 - 有图片时显示 */}
                {images.length > 0 && (
                  <div className="flex items-center">
                    <div className="grid grid-cols-4 gap-1.5 w-fit">
                      {images.map((image) => (
                        <div
                          key={image.id}
                          className="relative w-16 h-16 rounded-md overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-200"
                          style={{
                            background: 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)',
                            border: '1px solid rgba(226, 232, 240, 0.6)'
                          }}
                        >
                          <img
                            src={image.previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            onClick={() => {
                              openPreview(image.previewUrl, 'Image preview');
                            }}
                          />

                          {/* 删除按钮 */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('🗑️ 删除图片:', image.id);
                              const imageToRemove = images.find(img => img.id === image.id);
                              if (imageToRemove?.previewUrl) {
                                revokeImagePreview(imageToRemove.previewUrl);
                              }
                              const updatedImages = images.filter(img => img.id !== image.id);
                              setImages(updatedImages);

                              // 同步通知图片上传组件状态变化（如果有内部状态需要同步）
                              handleImagesChange(updatedImages);
                            }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-10"
                            title="Delete image"
                          >
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}

                      {/* 添加按钮 - 在网格中 */}
                      {images.length < 9 && !isSubmitting && (
                        <button
                          onClick={() => {
                            imageUploaderRef.current?.triggerFileSelect();
                          }}
                          disabled={isSubmitting}
                          className="w-16 h-16 rounded-md flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.7) 100%)',
                            border: '2px dashed rgba(156, 163, 175, 0.5)',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <svg className="w-4 h-4 text-gray-500 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="text-xs text-gray-600 font-medium">Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div
                  className="text-sm [font-family:'Lato',Helvetica] font-medium flex items-center gap-2"
                  style={{ color: 'rgba(0, 0, 0, 0.6)' }}
                >
                  {content.length > 0 && (
                    <span className={content.length > 500 ? 'text-red' : ''}>
                      {content.length}/500
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                {(onCancel || isReplying) && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2 text-base rounded-[100px] transition-all duration-200 [font-family:'Lato',Helvetica] hover:bg-gray-100 active:scale-95 bg-transparent text-[#454545]"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={(!content.trim() && images.length === 0) || isSubmitting || content.length > 500}
                  className="px-5 py-2 text-base rounded-[100px] transition-all duration-200 [font-family:'Lato',Helvetica] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 border border-[#f23a00] text-white"
                  style={{
                    backgroundColor: (!content.trim() && images.length === 0) || isSubmitting || content.length > 500
                      ? '#ccc'
                      : '#f23a00',
                    borderColor: (!content.trim() && images.length === 0) || isSubmitting || content.length > 500
                      ? '#ccc'
                      : '#f23a00',
                  }}
                >
                  {isSubmitting ? 'Commenting...' : 'Comment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CommentForm.displayName = 'CommentForm';