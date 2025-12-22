// Comment form component

import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCreateComment } from '../../hooks/queries/useComments';
import { useUser } from '../../contexts/UserContext';
import { getUserDisplayName } from './utils';
import { CreateCommentRequest } from '../../types/comment';

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
    onReplyComplete
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useUser();
  const createCommentMutation = useCreateComment();

  // 响应外部回复状态变化
  useEffect(() => {
    if (replyState?.isReplying) {
      setCurrentReplyInfo({
        parentId: replyState.parentId,
        replyToId: replyState.replyToId,
        replyToUser: replyState.replyToUser
      });
    } else {
      setCurrentReplyInfo({});
    }
  }, [replyState]);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    focusAndSetReply: (replyInfo) => {
      console.log('🎯 CommentForm focusAndSetReply called:', replyInfo);
      setCurrentReplyInfo(replyInfo);
      // 聚焦到文本框
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }), []);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (!user) {
      alert('Please log in first');
      return;
    }

    setIsSubmitting(true);

    // 使用当前回复信息或props传入的信息
    const activeReplyInfo = {
      parentId: currentReplyInfo.parentId || parentId,
      replyToId: currentReplyInfo.replyToId || replyToId,
      replyToUser: currentReplyInfo.replyToUser || replyToUser
    };

    console.log('🔥🔥🔥 CommentForm 提交数据检查:', {
      activeReplyInfo,
      hasParentId: !!activeReplyInfo.parentId,
      hasReplyToId: !!activeReplyInfo.replyToId,
      hasReplyToUser: !!activeReplyInfo.replyToUser,
      replyToUserValue: activeReplyInfo.replyToUser,
      parentIdValue: activeReplyInfo.parentId,
      replyToIdValue: activeReplyInfo.replyToId
    });

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
    };

    // 🔧 存储引用信息到localStorage，页面刷新后可以恢复
    console.log('🔥🔥🔥 最终发送给后端的commentData:', commentData);

    if (activeReplyInfo.replyToId && activeReplyInfo.replyToUser) {
      const replyContext = {
        replyToId: activeReplyInfo.replyToId,
        replyToUser: activeReplyInfo.replyToUser,
        targetType,
        targetId,
        timestamp: Date.now()
      };
      localStorage.setItem('pendingReplyContext', JSON.stringify(replyContext));
      console.log('💾 Stored reply context to localStorage:', replyContext);

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
      console.log('📝 Submitting comment:', commentData);
      await createCommentMutation.mutateAsync(commentData);
      console.log('✅ Comment submitted successfully');
      setContent('');
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
    setCurrentReplyInfo({}); // 清除回复状态
    onReplyComplete?.(); // 通知父组件回复取消
    onCancel?.();
  };

  // 决定显示的占位符和回复信息
  const getPlaceholderText = () => {
    const activeParentId = currentReplyInfo.parentId || parentId;
    const activeReplyUser = currentReplyInfo.replyToUser || replyToUser;

    if (activeParentId) {
      if (activeReplyUser) {
        // 3级评论：回复特定用户
        let displayName = activeReplyUser;
        if (typeof activeReplyUser === 'object') {
          displayName = getUserDisplayName(activeReplyUser);
        }
        return `Reply to @${displayName}...`;
      } else {
        // 2级评论：直接回复主评论
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
            {/* Apple-style reply indicator */}
            {isReplying && (
              <div className="px-6 pt-4 pb-2">
                <div
                  className="flex items-center gap-2 text-sm rounded-full px-4 py-2 w-fit transition-all duration-200"
                  style={{
                    color: 'rgba(0, 122, 255, 0.9)',
                    background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(0, 122, 255, 0.12) 100%)',
                    border: '1px solid rgba(0, 122, 255, 0.15)',
                    boxShadow: '0 1px 3px rgba(0, 122, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <span>💬</span>
                  <span>Replying to {getReplyDisplayText()}</span>
                  <button
                    onClick={handleCancel}
                    className="ml-1 hover:scale-110 transition-transform duration-200"
                    style={{ color: 'rgba(0, 122, 255, 0.7)' }}
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
              onChange={(e) => setContent(e.target.value)}
              placeholder={getPlaceholderText()}
              className="w-full px-6 py-4 bg-transparent border-0 resize-none [font-family:'Lato',Helvetica] text-base transition-colors duration-200 rounded-2xl"
              style={{
                outline: 'none',
                color: 'rgba(0, 0, 0, 0.9)',
                fontSize: '16px',
                lineHeight: '1.5',
                minHeight: '80px',
              }}
              placeholder-style={{
                color: 'rgba(0, 0, 0, 0.5)',
              }}
              rows={3}
              disabled={isSubmitting}
            />

            {/* Apple-style action bar */}
            <div
              className="flex items-center justify-between px-6 py-4 rounded-b-[20px]"
              style={{
                background: 'transparent',
              }}
            >
              <div
                className="text-sm [font-family:'Lato',Helvetica] font-medium"
                style={{ color: 'rgba(0, 0, 0, 0.6)' }}
              >
                {content.length > 0 && (
                  <span className={content.length > 500 ? 'text-red' : ''}>
                    {content.length}/500
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                {(onCancel || isReplying) && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200 [font-family:'Lato',Helvetica] hover:scale-105 active:scale-95 hover:bg-opacity-80"
                    style={{
                      outline: 'none',
                      color: 'rgba(71, 85, 105, 0.75)',
                      background: 'transparent',
                      border: '1px solid rgba(203, 213, 225, 0.5)',
                      boxShadow: 'none',
                    }}
                    disabled={isSubmitting}
                  >
                    {isReplying ? 'Cancel Reply' : 'Cancel'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!content.trim() || isSubmitting || content.length > 500}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 [font-family:'Lato',Helvetica] hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    outline: 'none',
                    background: !content.trim() || isSubmitting || content.length > 500
                      ? 'linear-gradient(135deg, rgba(148, 163, 184, 0.4) 0%, rgba(120, 113, 108, 0.3) 100%)'
                      : 'linear-gradient(135deg, #ff7849 0%, #f23a00 85%, #e03200 100%)',
                    color: !content.trim() || isSubmitting || content.length > 500
                      ? 'rgba(100, 116, 139, 0.7)'
                      : 'rgba(255, 255, 255, 0.98)',
                    boxShadow: !content.trim() || isSubmitting || content.length > 500
                      ? '0 1px 2px rgba(0, 0, 0, 0.05)'
                      : `0 4px 14px rgba(242, 58, 0, 0.25),
                         0 2px 6px rgba(242, 58, 0, 0.15),
                         inset 0 1px 0 rgba(255, 255, 255, 0.3),
                         inset 0 -1px 0 rgba(0, 0, 0, 0.1)`,
                    border: !content.trim() || isSubmitting || content.length > 500
                      ? '1px solid rgba(203, 213, 225, 0.4)'
                      : '1px solid rgba(239, 68, 68, 0.3)',
                    textShadow: !content.trim() || isSubmitting || content.length > 500
                      ? 'none'
                      : '0 1px 2px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {isSubmitting ? 'Posting...' : 'Post comment'}
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