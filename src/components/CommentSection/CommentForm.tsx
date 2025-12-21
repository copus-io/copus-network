// Comment form component

import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCreateComment } from '../../hooks/queries/useComments';
import { useUser } from '../../contexts/UserContext';
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
          displayName = activeReplyUser.username || 'Anonymous';
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
        const displayName = activeReplyUser.username || 'Anonymous';
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
      <div className={`py-6 border-b border-gray-100 ${className}`}>
        <div className="text-center py-4">
          <p className="text-gray-500 mb-3 [font-family:'Lato',Helvetica]">
            <Link
              to="/login"
              className="text-red hover:text-red/80 underline cursor-pointer"
            >
              Log in
            </Link>
            {' '}to join the discussion
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-1 ${className}`}>
      <div className="flex gap-4">
        {/* Comment input */}
        <div className="flex-1">
          <div className="bg-white rounded-lg transition-all">
            {/* 显示回复提示 */}
            {isReplying && (
              <div className="px-6 pt-3 pb-1">
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 rounded-full px-3 py-1 w-fit">
                  <span>💬</span>
                  <span>Replying to {getReplyDisplayText()}</span>
                  <button
                    onClick={handleCancel}
                    className="text-blue-400 hover:text-blue-600 ml-1"
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
              className="w-full px-6 py-3 bg-transparent border-0 rounded-lg resize-none text-gray-900 placeholder-gray-500 [font-family:'Lato',Helvetica] text-base"
              style={{ outline: 'none' }}
              rows={2}
              disabled={isSubmitting}
            />

            {/* Action bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-white rounded-b-lg">
              <div className="text-sm text-gray-500 [font-family:'Lato',Helvetica]">
                {content.length > 0 && (
                  <span className={content.length > 500 ? 'text-red' : ''}>
                    {content.length}/500
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {(onCancel || isReplying) && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all [font-family:'Lato',Helvetica]"
                    style={{ outline: 'none' }}
                    disabled={isSubmitting}
                  >
                    {isReplying ? 'Cancel Reply' : 'Cancel'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!content.trim() || isSubmitting || content.length > 500}
                  className="px-6 py-2 bg-red text-white rounded-full text-sm font-medium hover:bg-red/90 disabled:bg-[#E0E0E0]/40 disabled:text-[#A9A9A9] disabled:cursor-not-allowed transition-all [font-family:'Lato',Helvetica]"
                  style={{ outline: 'none' }}
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