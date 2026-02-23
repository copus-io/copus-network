// Individual comment item component

import React, { useState, useEffect, useRef, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Comment } from '../../types/comment';
import { useToggleCommentLike, useDeleteComment, useUpdateComment, useLoadCommentReplies } from '../../hooks/queries/useComments';
import { CommentForm } from './CommentForm';
import { useUser } from '../../contexts/UserContext';
import CommentImageGallery from './CommentImageGallery';
import CommentImageUploaderV2, { CommentImageUploaderRef } from './CommentImageUploaderV2';

// 评论图片接口 (和CommentForm保持一致)
interface CommentImage {
  id: string;
  file: File;
  previewUrl: string;
  uploadUrl?: string;
  isUploading?: boolean;
  error?: string;
}

// 编辑评论图片接口
interface EditCommentImage {
  id: string;
  file?: File; // 新上传的文件
  previewUrl: string;
  uploadUrl?: string;
  isUploading?: boolean;
  error?: string;
  isExisting?: boolean; // 是否为已存在的图片
}

// Edit comment form component
interface EditCommentFormProps {
  initialContent: string;
  initialImages?: string[]; // 初始图片URL数组
  onSubmit: (content: string, images: string[]) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isSubmitting?: boolean;
  isDeleting?: boolean;
}

const EditCommentForm: React.FC<EditCommentFormProps> = ({
  initialContent,
  initialImages = [],
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting = false,
  isDeleting = false
}) => {
  const [content, setContent] = useState(initialContent);
  const [images, setImages] = useState<EditCommentImage[]>([]);
  const [imageUploadError, setImageUploadError] = useState<string>('');
  const imageUploaderRef = useRef<CommentImageUploaderRef>(null);

  // 初始化现有图片
  useEffect(() => {
    if (initialImages.length > 0) {
      const existingImages: EditCommentImage[] = initialImages.map((url, index) => ({
        id: `existing-${index}`,
        previewUrl: url,
        uploadUrl: url,
        isExisting: true
      }));
      setImages(existingImages);
    }
  }, [initialImages]);

  const handleSubmit = () => {
    if (!content.trim()) return;

    // 提取所有成功上传的图片URL
    const imageUrls = images
      .filter(img => img.uploadUrl && !img.error)
      .map(img => img.uploadUrl!);

    onSubmit(content.trim(), imageUrls);
  };

  // 处理图片变化
  const handleImagesChange = (newImages: CommentImage[]) => {
    // 转换为编辑用的图片格式
    const editImages: EditCommentImage[] = newImages.map(img => ({
      id: img.id,
      file: img.file,
      previewUrl: img.previewUrl,
      uploadUrl: img.uploadUrl,
      isUploading: img.isUploading,
      error: img.error,
      isExisting: false
    }));

    // 合并现有图片和新图片
    const existingImages = images.filter(img => img.isExisting);
    setImages([...existingImages, ...editImages]);
    setImageUploadError('');
  };

  // 处理图片上传错误
  const handleImageUploadError = (error: string) => {
    setImageUploadError(error);
  };

  // 删除图片
  const handleRemoveImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));

    // 如果删除的是新上传的图片，也要从上传组件中移除
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove && !imageToRemove.isExisting) {
      imageUploaderRef.current?.removeImage(imageId);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Edit your comment..."
        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent [font-family:'Lato',Helvetica]"
        rows={3}
        disabled={isSubmitting}
      />

      {/* 图片编辑区域 */}
      <div className="mt-3">
        {/* 已有图片预览 */}
        {images.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {images.map((image) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.previewUrl}
                    alt="Comment image"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  {/* 删除按钮 */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    ×
                  </button>
                  {/* 上传状态指示器 */}
                  {image.isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {image.error && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-80 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">!</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 图片上传组件 */}
        <CommentImageUploaderV2
          ref={imageUploaderRef}
          onImagesChange={handleImagesChange}
          onUploadError={handleImageUploadError}
          disabled={isSubmitting}
          maxImages={9 - images.filter(img => img.isExisting).length} // 减去已有图片数量
        />

        {/* 图片上传错误提示 */}
        {imageUploadError && (
          <div className="mt-2 text-red-500 text-sm">
            {imageUploadError}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-3">
        {/* Delete button on the left */}
        {onDelete && (
          <button
            onClick={onDelete}
            disabled={isSubmitting || isDeleting}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-red hover:opacity-80 transition-colors duration-200 [font-family:'Lato',Helvetica]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        )}
        {!onDelete && <div></div>}

        {/* Cancel and Save buttons on the right */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 [font-family:'Lato',Helvetica]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            className="px-5 py-2 bg-red text-white rounded-[100px] hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 [font-family:'Lato',Helvetica]"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface CommentItemProps {
  comment: Comment;
  replies?: Comment[];
  targetType: 'article' | 'treasury' | 'user' | 'space';
  targetId: string;
  articleId?: string; // 新增：数字ID，用于API调用
  className?: string;
  onReplyClick?: (commentId: string, userName: string, parentId?: string) => void;
}

// Helper component for replies with new content format
const ReplyItemComponent: React.FC<{
  reply: Comment;
  toggleLikeMutation: any;
  targetId: string;
  targetType: 'article' | 'treasury' | 'user' | 'space';
  parentComment: Comment;
  allReplies: Comment[]; // 添加完整的回复列表，用于查找被回复的评论
  articleId?: string; // 新增：数字ID，用于API调用
  onReplyClick?: (commentId: string, userName: string, parentId?: string) => void;
}> = ({ reply, toggleLikeMutation, targetId, targetType, parentComment, allReplies, articleId, onReplyClick }) => {
  const navigate = useNavigate();
  const deleteCommentMutation = useDeleteComment();
  const updateCommentMutation = useUpdateComment();
  const { user } = useUser();
  const [replyIsLiked, setReplyIsLiked] = useState(reply.isLiked);
  const [replyLikesCount, setReplyLikesCount] = useState(reply.likesCount);
  const [showEditForm, setShowEditForm] = useState(false);

  // Check if current user is the reply author
  const isReplyAuthor = user && user.id === reply.authorId;

  // Handle user click to navigate to profile page
  const handleUserClick = (comment: Comment) => {
    if (comment.authorNamespace) {
      startTransition(() => navigate(`/u/${comment.authorNamespace}`));
    } else if (comment.authorId) {
      startTransition(() => navigate(`/user/${comment.authorId}/treasury`));
    }
  };

  const handleReplyLike = () => {
    if (!user) {
      alert('Please log in first');
      return;
    }

    const newIsLiked = !replyIsLiked;
    setReplyIsLiked(newIsLiked);
    setReplyLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
    toggleLikeMutation.mutate(reply.id);
  };

  const handleReplyToReply = () => {
    if (!user) {
      alert('Please log in first');
      return;
    }
    // 使用统一回复系统，传递parentId以便正确构建回复层级
    onReplyClick?.(reply.id, reply.authorName, parentComment.id);
  };

  const handleReplyDelete = () => {
    if (window.confirm('Are you sure you want to delete this reply?')) {
      deleteCommentMutation.mutate({ commentId: reply.id, articleId: articleId || targetId });
    }
  };

  const handleReplyEdit = () => {
    if (!user) {
      alert('Please log in first');
      return;
    }
    setShowEditForm(!showEditForm);
  };

  const handleReplyEditSubmit = (content: string, images: string[]) => {
    updateCommentMutation.mutate(
      { commentId: reply.id, data: { content, articleId: targetId, images } },
      {
        onSuccess: () => {
          setShowEditForm(false);
        }
      }
    );
  };

  // Check if current user can delete this reply
  const canDeleteReply = user && (reply.canDelete || user.id === reply.authorId);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 新的内容格式：实现3级评论视觉效果
  const formatReplyContent = () => {
    // 最高优先级：新的引用显示逻辑
    // 当 replyToUser 对象存在时，显示引用样式
    if (reply.replyToUser && typeof reply.replyToUser === 'object') {
      // 获取用户显示名称
      const getUserDisplayName = (userObj) => {
        if (!userObj) return '';
        return userObj.username || 'Anonymous';
      };

      const displayUserName = getUserDisplayName(reply.replyToUser);
      const quoteContent = (reply as any).targetContent;

      if (displayUserName) {
        return (
          <div className="space-y-1">
            {/* 简洁的网易云风格回复引用 */}
            <div className="text-sm text-gray-500 leading-relaxed">
              <span className="text-blue-400">@{displayUserName}</span>
              <span className="mx-1 text-gray-400">:</span>
              <span className="italic text-gray-400">"{quoteContent || 'Original comment'}"</span>
            </div>

            {/* 用户的实际回复内容 */}
            <div className="text-gray-900 leading-relaxed">
              {reply.content}
            </div>
          </div>
        );
      }
    }

    // 辅助函数：格式化用户名
    const formatUsername = (comment) => {
      return comment.authorName || 'Anonymous';
    };

    // 辅助函数：智能截断内容
    const truncateContent = (content, maxLength = 40) => {
      if (content.length <= maxLength) return content;
      return content.substring(0, maxLength).trim() + '...';
    };

    // 优先级0：检查localStorage恢复的引用信息（最高优先级）
    if (reply.replyToId && reply.replyToUser) {
      // 在所有回复中查找目标评论（包括主评论和其他回复）
      const allComments = [parentComment, ...allReplies];
      const targetComment = allComments.find(c =>
        c.id.toString() === reply.replyToId.toString()
      );

      if (targetComment) {
        // 🔧 3级评论逻辑：只有当 replyToUser 有值时才显示引用（表示3级评论）
        // 2级评论（直接回复1级）的 replyToUser 为空，不显示引用信息
        const shouldShowReply = reply.replyToUser &&
                               (reply.replyToUser.username || 'Anonymous');

        return (
          <div>
            {shouldShowReply && (
              <div className="space-y-1">
                {/* 简洁的网易云风格回复引用 */}
                <div className="text-sm text-gray-500 leading-relaxed">
                  <span className="text-blue-400">@{formatUsername(targetComment)}</span>
                  <span className="mx-1 text-gray-400">:</span>
                  <span className="italic text-gray-400">"{truncateContent(targetComment.content)}"</span>
                </div>

                {/* 用户的实际回复内容 */}
                <div className="text-gray-900 leading-relaxed">
                  {reply.content}
                </div>
              </div>
            )}
            {!shouldShowReply && <div>{reply.content}</div>}
          </div>
        );
      }
    }

    // 优先级1：检查请求上下文 - 如果这个回复是通过rootId获取的，说明它回复了rootId评论或其子评论
    const requestContext = (reply as any)._requestContext;

    if (requestContext?.rootId) {
      // 核心逻辑：
      // 1. rootId告诉我们这是对某个评论线程的回复
      // 2. 如果有replyToUser，通过时间顺序找到具体的目标评论
      // 3. 如果没有replyToUser，默认回复主评论（rootId评论）

      let targetComment = null;

      // 策略：因为后端不提供replyToUser，我们需要智能推断
      // 如果这个回复时间是最新的，可能是刚创建的，检查localStorage
      const currentReplyTime = new Date(reply.createdAt).getTime();
      const now = Date.now();
      const isRecentReply = (now - currentReplyTime) < 60000; // 1分钟内的回复

      if (isRecentReply) {
        // 这可能是刚创建的回复，检查localStorage中是否有引用信息
        // 注意：此时localStorage可能已经被清理了，所以我们需要其他方法
      }

      // 策略：如果线程中只有主评论，默认回复主评论
      if (allReplies.length === 0) {
        targetComment = parentComment;
      }
      // 策略：如果线程中有其他回复，默认回复最近的那条回复
      else {
        const sortedReplies = allReplies
          .filter(r => {
            const isBeforeCurrentReply = new Date(r.createdAt).getTime() < currentReplyTime;
            const isNotSameComment = r.id !== reply.id;
            return isBeforeCurrentReply && isNotSameComment;
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (sortedReplies.length > 0) {
          targetComment = sortedReplies[0]; // 最近的其他回复
        } else {
          targetComment = parentComment; // 回退到主评论
        }
      }

      // 展示找到的引用结果
      if (targetComment) {
        const targetUser = reply.replyToUser || formatUsername(targetComment);

        // 🔧 3级评论逻辑：只有当 replyToUser 有值时才显示引用（表示3级评论）
        // 2级评论（直接回复1级）的 replyToUser 为空，不显示引用信息
        const shouldShowReply = reply.replyToUser &&
                               (reply.replyToUser.username || 'Anonymous');

        return (
          <div>
            {shouldShowReply && (
              <div className="space-y-1">
                {/* 简洁的网易云风格回复引用 */}
                <div className="text-sm text-gray-500 leading-relaxed">
                  <span className="text-blue-400">@{targetUser}</span>
                  <span className="mx-1 text-gray-400">:</span>
                  <span className="italic text-gray-400">"{truncateContent(targetComment.content)}"</span>
                </div>

                {/* 用户的实际回复内容 */}
                <div className="text-gray-900 leading-relaxed">
                  {reply.content}
                </div>
              </div>
            )}
            {!shouldShowReply && <div>{reply.content}</div>}
          </div>
        );
      }
    }

    // 优先级2：检查是否有准确的replyToId（来自前端创建的回复）
    if (reply.replyToId) {
      const targetComment = allReplies.find(r => r.id === reply.replyToId) ||
                           (parentComment.id === reply.replyToId ? parentComment : null);

      if (targetComment) {
        const targetUser = reply.replyToUser || targetComment.authorName || targetComment.authorNamespace;
        // 🔧 3级评论逻辑：只有当 replyToUser 有值时才显示引用（表示3级评论）
        // 2级评论（直接回复1级）的 replyToUser 为空，不显示引用信息
        const shouldShowReply = reply.replyToUser &&
                               (reply.replyToUser.username || 'Anonymous');

        return (
          <div className="space-y-1">
            <div>{reply.content}</div>
            {shouldShowReply && (
              <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border-l-2 border-blue-200">
                <span className="text-blue-600 font-medium">@{targetUser}</span>
                <span className="text-gray-500 mx-1">：</span>
                <span className="italic">"{truncateContent(targetComment.content)}"</span>
              </div>
            )}
          </div>
        );
      }
    }

    // 优先级2：根据API文档，使用replyToUser字段显示引用 + 智能时间匹配
    if (reply.replyToUser) {
      // 智能算法：基于时间序列 + 用户信息精确匹配被回复的评论
      const currentReplyTime = new Date(reply.createdAt).getTime();

      // 策略1：查找同一用户在此时间之前的最近一条评论
      const candidateComments = allReplies
        .filter(r => {
          const matchesUser = r.authorName === reply.replyToUser || r.authorNamespace === reply.replyToUser;
          const isBeforeCurrentReply = new Date(r.createdAt).getTime() < currentReplyTime;
          const isNotSameComment = r.id !== reply.id;
          return matchesUser && isBeforeCurrentReply && isNotSameComment;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // 策略2：检查是否回复主评论作者
      const isReplyingToMainComment = parentComment.authorName === reply.replyToUser ||
                                     parentComment.authorNamespace === reply.replyToUser;

      let targetComment = null;
      let targetContent = "Replied comment";

      if (candidateComments.length > 0) {
        // 找到了候选评论，选择最近的一条
        targetComment = candidateComments[0];
        targetContent = `"${truncateContent(targetComment.content)}"`;
      } else if (isReplyingToMainComment) {
        // 如果没找到2级评论，但回复的是主评论作者，则指向主评论
        targetComment = parentComment;
        targetContent = `"${truncateContent(parentComment.content)}"`;
      }

      // 🔧 检查是否应该显示引用信息：如果 replyToUser 对象为空则完全不显示引用信息
      const shouldShowReply = reply.replyToUser &&
                             (reply.replyToUser.username || 'Anonymous');

      return (
        <div className="space-y-1">
          <div>{reply.content}</div>
          {shouldShowReply && (
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border-l-2 border-blue-200">
              <span className="text-blue-600 font-medium">@{reply.replyToUser.username || 'Anonymous'}</span>
              <span className="text-gray-500 mx-1">：</span>
              <span className="italic">{targetContent}</span>
            </div>
          )}
        </div>
      );
    }

    // 🔄 回退到智能推理逻辑（当没有准确的replyToId时）
    const currentUser = reply.authorName || reply.authorNamespace || `用户${reply.authorId}`;
    const replyIndex = allReplies.findIndex(r => r.id === reply.id);

    // 获取时间排序的回复列表（最新的在前）
    const sortedReplies = [...allReplies].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const sortedIndex = sortedReplies.findIndex(r => r.id === reply.id);

    // 策略1：如果当前回复作者就是主评论作者，很可能是在回应其他人
    if (reply.authorId === parentComment.authorId && allReplies.length > 1) {
      // 找到最近的非主评论作者的回复
      const otherReplies = sortedReplies.filter(r =>
        r.id !== reply.id && r.authorId !== parentComment.authorId
      );

      if (otherReplies.length > 0) {
        const targetReply = otherReplies[0]; // 最新的其他人的回复
        // Author responding to community feedback
        return (
          <div className="space-y-1">
            <div>{reply.content}</div>
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border-l-2 border-blue-200">
              <span className="text-blue-600 font-medium">@{formatUsername(targetReply)}</span>
              <span className="text-gray-500 mx-1">：</span>
              <span className="italic">"{truncateContent(targetReply.content)}"</span>
            </div>
          </div>
        );
      }
    }

    // 策略2：时间序列推断 - 找到发布时间最接近且在此之前的不同作者回复
    if (allReplies.length > 1) {
      const currentTime = new Date(reply.createdAt).getTime();

      // 找到发布时间在当前回复之前的回复，按时间倒序排列
      const beforeReplies = allReplies.filter(r => {
        const replyTime = new Date(r.createdAt).getTime();
        return replyTime < currentTime && r.authorId !== reply.authorId;
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // 如果没有之前的不同作者回复，回复主评论
      if (beforeReplies.length === 0) {
        // First different author - replying to main comment
        return (
          <div className="space-y-1">
            <div>{reply.content}</div>
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border-l-2 border-blue-200">
              <span className="text-blue-600 font-medium">@{formatUsername(parentComment)}</span>
              <span className="text-gray-500 mx-1">：</span>
              <span className="italic">"{truncateContent(parentComment.content)}"</span>
            </div>
          </div>
        );
      }

      // 回复最近的不同作者
      const targetReply = beforeReplies[0];
      // Continuing conversation with different author
      return (
        <div className="space-y-1">
          <div>{reply.content}</div>
          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border-l-2 border-blue-200">
            <span className="text-blue-600 font-medium">@{formatUsername(targetReply)}</span>
            <span className="text-gray-500 mx-1">：</span>
            <span className="italic">"{truncateContent(targetReply.content)}"</span>
          </div>
        </div>
      );
    }

    // 策略3：单个回复 - 很明显是回复主评论
    if (allReplies.length === 1) {
      // Single reply - clearly responding to main comment
      return (
        <div className="space-y-1">
          <div>{reply.content}</div>
          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border-l-2 border-blue-200">
            <span className="text-blue-600 font-medium">@{formatUsername(parentComment)}</span>
            <span className="text-gray-500 mx-1">：</span>
            <span className="italic">"{truncateContent(parentComment.content)}"</span>
          </div>
        </div>
      );
    }

    // Default: Unable to determine reply context
    return reply.content;
  };

  return (
    <div className="flex gap-3" id={`comment-${reply.id}`}>
      {/* Reply Avatar */}
      <div className="flex-shrink-0">
        <img
          src={reply.authorAvatar || "data:image/svg+xml,%3csvg%20width='100'%20height='100'%20viewBox='0%200%20100%20100'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='100'%20height='100'%20rx='50'%20fill='white'/%3e%3crect%20width='100'%20height='100'%20rx='50'%20fill='%23E0E0E0'%20fill-opacity='0.4'/%3e%3cpath%20d='M73.9643%2060.6618V60.9375C73.9643%2074.2269%2063.2351%2085%2050%2085C36.7649%2085%2026.0357%2074.2269%2026.0357%2060.9375V60.6618C22.2772%2059.6905%2019.5%2056.2646%2019.5%2052.1875C19.5%2048.1104%2022.2772%2044.6845%2026.0357%2043.7132V39.0625C26.0357%2025.7731%2036.7649%2015%2050%2015C63.2351%2015%2073.9643%2025.7731%2073.9643%2039.0625V43.7132C77.7228%2044.6845%2080.5%2048.1104%2080.5%2052.1875C80.5%2056.2646%2077.7228%2059.6905%2073.9643%2060.6618ZM69.6071%2043.4375H67.2192C62.2208%2043.4375%2057.8638%2040.0217%2056.6515%2035.1527L56.5357%2034.6875L48.85%2038.5461C43.0934%2041.4362%2036.8058%2043.0815%2030.3929%2043.3858V60.9375C30.3929%2071.8106%2039.1713%2080.625%2050%2080.625C60.8287%2080.625%2069.6071%2071.8106%2069.6071%2060.9375V43.4375ZM39.1071%2050C39.1071%2048.7919%2040.0825%2047.8125%2041.2857%2047.8125C42.4889%2047.8125%2043.4643%2048.7919%2043.4643%2050V54.375C43.4643%2055.5831%2042.4889%2056.5625%2041.2857%2056.5625C40.0825%2056.5625%2039.1071%2055.5831%2039.1071%2054.375V50ZM56.5357%2050C56.5357%2048.7919%2057.5111%2047.8125%2058.7143%2047.8125C59.9175%2047.8125%2060.8929%2048.7919%2060.8929%2050V54.375C60.8929%2055.5831%2059.9175%2056.5625%2058.7143%2056.5625C57.5111%2056.5625%2056.5357%2055.5831%2056.5357%2054.375V50ZM41.9964%2071.3039C41.1073%2070.4899%2041.0438%2069.1064%2041.8544%2068.2136C42.6651%2067.3209%2044.0431%2067.2571%2044.9321%2068.0711C46.0649%2069.1081%2047.4581%2069.6875%2048.8886%2069.6875C50.3722%2069.6875%2051.7728%2069.1187%2052.8779%2068.0924C53.7612%2067.2721%2055.1396%2067.3261%2055.9565%2068.2131C56.7735%2069.1%2056.7197%2070.484%2055.8364%2071.3043C53.9384%2073.0668%2051.4869%2074.0625%2048.8886%2074.0625C46.3342%2074.0625%2043.907%2073.0532%2041.9964%2071.3039ZM23.8571%2052.1875C23.8571%2053.8069%2024.7334%2055.2207%2026.0357%2055.9772V48.3978C24.7334%2049.1543%2023.8571%2050.5681%2023.8571%2052.1875ZM76.1429%2052.1875C76.1429%2050.5681%2075.2666%2049.1543%2073.9643%2048.3978V55.9772C75.2666%2055.2207%2076.1429%2053.8069%2076.1429%2052.1875Z'%20fill='black'/%3e%3c/svg%3e"}
          alt={reply.authorName}
          onClick={() => handleUserClick(reply)}
          className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
        />
      </div>

      <div className="flex-1">
        {/* Reply user info */}
        <div className="flex items-center gap-2 mb-2">
          <span
            onClick={() => handleUserClick(reply)}
            className="text-gray-900 [font-family:'Lato',Helvetica] cursor-pointer hover:text-blue-600 transition-colors"
            style={{ fontSize: '16px', fontWeight: 450 }}
          >
            {reply.authorName}
          </span>
          <span className="text-sm text-gray-500 [font-family:'Lato',Helvetica]">
            {formatTimeAgo(reply.createdAt)}
          </span>
        </div>

        {/* Reply content with new format */}
        <div className="text-gray-800 text-base leading-relaxed mb-3 [font-family:'Lato',Helvetica] font-light">
          {formatReplyContent()}
        </div>

        {/* Reply images */}
        {reply.images && reply.images.length > 0 && (
          <CommentImageGallery images={reply.images} className="mb-3" />
        )}

        {/* Reply actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReplyLike}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium transition-all duration-200 [font-family:'Lato',Helvetica] ${
              replyIsLiked
                ? 'text-red bg-red-50 hover:bg-red-100'
                : 'text-gray-500 hover:text-red hover:bg-red-50'
            }`}
            style={{ outline: 'none' }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={replyIsLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{replyLikesCount}</span>
          </button>

          <button
            onClick={handleReplyToReply}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium text-gray-500 hover:text-red hover:bg-red-50 transition-all duration-200 [font-family:'Lato',Helvetica]"
            style={{ outline: 'none' }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
            </svg>
            <span>Reply</span>
          </button>

          {/* Edit button - only for reply author */}
          {isReplyAuthor && (
            <button
              onClick={handleReplyEdit}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium text-gray-500 hover:text-red hover:bg-red-50 transition-all duration-200 [font-family:'Lato',Helvetica]"
              style={{ outline: 'none' }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span>Edit</span>
            </button>
          )}
        </div>

        {/* Edit form for reply */}
        {showEditForm && (
          <div className="mt-3">
            <EditCommentForm
              initialContent={reply.content}
              initialImages={reply.images}
              onSubmit={handleReplyEditSubmit}
              onCancel={() => setShowEditForm(false)}
              onDelete={canDeleteReply ? handleReplyDelete : undefined}
              isSubmitting={updateCommentMutation.isPending}
              isDeleting={deleteCommentMutation.isPending}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  replies = [],
  targetType,
  targetId,
  articleId,
  className = '',
  onReplyClick
}) => {
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [repliesExpanded, setRepliesExpanded] = useState(false); // 控制回复展开/折叠
  const [repliesVisible, setRepliesVisible] = useState(true); // 默认显示回复
  const [smallRepliesHidden, setSmallRepliesHidden] = useState(false); // 控制少量回复的隐藏/显示
  const commentRef = useRef<HTMLDivElement>(null);
  const toggleLikeMutation = useToggleCommentLike();
  const deleteCommentMutation = useDeleteComment();
  const updateCommentMutation = useUpdateComment();
  const { user } = useUser();

  // Handle user click to navigate to profile page
  const handleUserClick = (comment: Comment) => {
    if (comment.authorNamespace) {
      startTransition(() => navigate(`/u/${comment.authorNamespace}`));
    } else if (comment.authorId) {
      startTransition(() => navigate(`/user/${comment.authorId}/treasury`));
    }
  };

  // 页面加载后检查是否需要滚动到此评论，同时恢复引用信息
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const newCommentId = urlParams.get('newComment');
    const hash = window.location.hash;

    // 检查是否是新创建的评论需要滚动到
    const shouldScrollTo = newCommentId === comment.id.toString() ||
                          hash === `#comment-${comment.id}`;

    if (shouldScrollTo && commentRef.current) {
      // 检查并恢复引用信息
      const storedContext = localStorage.getItem('pendingReplyContext');

      if (storedContext) {
        try {
          const replyContext = JSON.parse(storedContext);

          // 检查是否是同一个target的评论，且时间在5分钟内
          const isValidContext = replyContext.targetType === targetType &&
                                replyContext.targetId === targetId &&
                                (Date.now() - replyContext.timestamp) < 5 * 60 * 1000;

          if (isValidContext) {
            // 为新评论添加引用信息
            (comment as any).replyToId = replyContext.replyToId;
            (comment as any).replyToUser = replyContext.replyToUser;
          }

          // 清理localStorage
          localStorage.removeItem('pendingReplyContext');
        } catch (error) {
          localStorage.removeItem('pendingReplyContext');
        }
      }

      setTimeout(() => {
        commentRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

        // 高亮显示新评论
        if (commentRef.current) {
          commentRef.current.style.backgroundColor = '#f0f9ff';
          commentRef.current.style.border = '2px solid #3b82f6';
          commentRef.current.style.borderRadius = '8px';

          // 3秒后移除高亮
          setTimeout(() => {
            if (commentRef.current) {
              commentRef.current.style.backgroundColor = '';
              commentRef.current.style.border = '';
              commentRef.current.style.borderRadius = '';
            }
          }, 3000);
        }

      }, 100);

      // 清理 URL 参数，避免刷新时再次滚动
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('newComment');
      newUrl.hash = '';
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [comment.id, targetType, targetId]);

  // 设置回复折叠的阈值 - 当回复超过此数量时显示展开/折叠按钮
  const REPLY_COLLAPSE_THRESHOLD = 3;

  // 按需加载评论回复
  // 仅在用户点击展开按钮时才加载回复，优化性能
  const { data: repliesData, isLoading: repliesLoading } = useLoadCommentReplies(
    targetType,
    targetId,
    comment.id,
    {
      enabled: repliesVisible, // 只在用户主动展开时才加载
      articleId: articleId // 传递数字ID
    }
  );

  // 使用懒加载的回复数据，如果没有则使用传入的replies作为后备
  const actualReplies = repliesData?.replies || replies || [];

  const handleLike = () => {
    if (!user) {
      // Show login prompt for non-logged users clicking like
      alert('Please log in first');
      return;
    }

    // Toggle like state locally
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

    // Call API mutation
    toggleLikeMutation.mutate(comment.id);
  };


  const handleEdit = () => {
    if (!user) {
      // Show login prompt for non-logged users clicking edit
      alert('Please log in first');
      return;
    }
    setShowEditForm(!showEditForm);
  };

  const handleEditSubmit = (content: string, images: string[]) => {
    updateCommentMutation.mutate(
      { commentId: comment.id, data: { content, articleId: targetId, images } },
      {
        onSuccess: () => {
          setShowEditForm(false);
        }
      }
    );
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate({ commentId: comment.id, articleId: targetId });
    }
  };

  // Check if current user can delete this comment
  const canDelete = user && (comment.canDelete || user.id === comment.authorId);

  // Check if current user is the comment author
  const isCommentAuthor = user && user.id === comment.authorId;


  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Removed getAvatarGradient function as we now use default SVG avatar

  // Check if this is a temporary comment being submitted
  const isTemporary = (comment as any)._isTemporary;
  const isNew = (comment as any)._isNew;

  return (
    <div
      ref={commentRef}
      id={`comment-${comment.id}`}
      className={`${className} ${isTemporary ? 'opacity-60 bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3' : ''} ${isNew ? 'bg-green-50 border border-green-200 rounded-lg p-3 animate-pulse' : ''}`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={comment.authorAvatar || "data:image/svg+xml,%3csvg%20width='100'%20height='100'%20viewBox='0%200%20100%20100'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='100'%20height='100'%20rx='50'%20fill='white'/%3e%3crect%20width='100'%20height='100'%20rx='50'%20fill='%23E0E0E0'%20fill-opacity='0.4'/%3e%3cpath%20d='M73.9643%2060.6618V60.9375C73.9643%2074.2269%2063.2351%2085%2050%2085C36.7649%2085%2026.0357%2074.2269%2026.0357%2060.9375V60.6618C22.2772%2059.6905%2019.5%2056.2646%2019.5%2052.1875C19.5%2048.1104%2022.2772%2044.6845%2026.0357%2043.7132V39.0625C26.0357%2025.7731%2036.7649%2015%2050%2015C63.2351%2015%2073.9643%2025.7731%2073.9643%2039.0625V43.7132C77.7228%2044.6845%2080.5%2048.1104%2080.5%2052.1875C80.5%2056.2646%2077.7228%2059.6905%2073.9643%2060.6618ZM69.6071%2043.4375H67.2192C62.2208%2043.4375%2057.8638%2040.0217%2056.6515%2035.1527L56.5357%2034.6875L48.85%2038.5461C43.0934%2041.4362%2036.8058%2043.0815%2030.3929%2043.3858V60.9375C30.3929%2071.8106%2039.1713%2080.625%2050%2080.625C60.8287%2080.625%2069.6071%2071.8106%2069.6071%2060.9375V43.4375ZM39.1071%2050C39.1071%2048.7919%2040.0825%2047.8125%2041.2857%2047.8125C42.4889%2047.8125%2043.4643%2048.7919%2043.4643%2050V54.375C43.4643%2055.5831%2042.4889%2056.5625%2041.2857%2056.5625C40.0825%2056.5625%2039.1071%2055.5831%2039.1071%2054.375V50ZM56.5357%2050C56.5357%2048.7919%2057.5111%2047.8125%2058.7143%2047.8125C59.9175%2047.8125%2060.8929%2048.7919%2060.8929%2050V54.375C60.8929%2055.5831%2059.9175%2056.5625%2058.7143%2056.5625C57.5111%2056.5625%2056.5357%2055.5831%2056.5357%2054.375V50ZM41.9964%2071.3039C41.1073%2070.4899%2041.0438%2069.1064%2041.8544%2068.2136C42.6651%2067.3209%2044.0431%2067.2571%2044.9321%2068.0711C46.0649%2069.1081%2047.4581%2069.6875%2048.8886%2069.6875C50.3722%2069.6875%2051.7728%2069.1187%2052.8779%2068.0924C53.7612%2067.2721%2055.1396%2067.3261%2055.9565%2068.2131C56.7735%2069.1%2056.7197%2070.484%2055.8364%2071.3043C53.9384%2073.0668%2051.4869%2074.0625%2048.8886%2074.0625C46.3342%2074.0625%2043.907%2073.0532%2041.9964%2071.3039ZM23.8571%2052.1875C23.8571%2053.8069%2024.7334%2055.2207%2026.0357%2055.9772V48.3978C24.7334%2049.1543%2023.8571%2050.5681%2023.8571%2052.1875ZM76.1429%2052.1875C76.1429%2050.5681%2075.2666%2049.1543%2073.9643%2048.3978V55.9772C75.2666%2055.2207%2076.1429%2053.8069%2076.1429%2052.1875Z'%20fill='black'/%3e%3c/svg%3e"}
            alt={comment.authorName}
            onClick={() => handleUserClick(comment)}
            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
          />
        </div>

        <div className="flex-1">
          {/* User info and time */}
          <div className="flex items-center gap-2 mb-2">
            <span
              onClick={() => handleUserClick(comment)}
              className="text-gray-900 [font-family:'Lato',Helvetica] cursor-pointer hover:text-blue-600 transition-colors"
              style={{ fontSize: '16px', fontWeight: 450 }}
            >
              {comment.authorName}
            </span>
            <span className="text-sm text-gray-500 [font-family:'Lato',Helvetica]">
              {isTemporary ? (
                <span className="inline-flex items-center gap-1 text-orange-500">
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Posting...
                </span>
              ) : isNew ? (
                <span className="inline-flex items-center gap-1 text-green-500 font-medium">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  刚刚发布
                </span>
              ) : (
                formatTimeAgo(comment.createdAt)
              )}
            </span>
          </div>

          {/* Comment content */}
          <div className="text-gray-800 text-base leading-relaxed mb-3 [font-family:'Lato',Helvetica] font-light">
            {comment.content.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < comment.content.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>

          {/* Comment images */}
          {comment.images && comment.images.length > 0 && (
            <CommentImageGallery images={comment.images} className="mb-3" />
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={toggleLikeMutation.isPending}
              className={`inline-flex items-center gap-1 text-sm transition-all duration-200 [font-family:'Lato',Helvetica] ${
                isLiked
                  ? 'text-red'
                  : 'text-gray-400 hover:text-red'
              }`}
              style={{ outline: 'none' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{likesCount}</span>
            </button>

            {/* Reply button - 永远用于回复该评论 */}
            <button
              onClick={() => {
                // 如果用户未登录，提示登录
                if (!user) {
                  alert('Please log in first');
                  return;
                }

                // 统一回复系统：直接回复该评论（创建2级评论）
                onReplyClick?.(comment.id, comment.authorName);
              }}
              className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition-all duration-200 [font-family:'Lato',Helvetica]"
              style={{ outline: 'none' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
              </svg>
              <span>Reply</span>
            </button>



            {/* Edit button - only for comment author */}
            {isCommentAuthor && (
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-red transition-all duration-200 [font-family:'Lato',Helvetica]"
                style={{ outline: 'none' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>Edit</span>
              </button>
            )}

                      </div>


          {/* Edit form */}
          {showEditForm && (
            <div className="mt-4">
              <EditCommentForm
                initialContent={comment.content}
                initialImages={comment.images}
                onSubmit={handleEditSubmit}
                onCancel={() => setShowEditForm(false)}
                onDelete={canDelete ? handleDelete : undefined}
                isSubmitting={updateCommentMutation.isPending}
                isDeleting={deleteCommentMutation.isPending}
              />
            </div>
          )}

          {/* Replies Section */}
          {actualReplies.length > 0 && repliesVisible && (
            <div className="mt-4">
              {/* 显示回复内容 */}
              <div className="ml-0 lg:ml-8 space-y-4 pl-3 lg:pl-6 border-l border-[#f0f0f0]">
                  {repliesLoading ? (
                    // 加载状态 - 简洁风格
                    <div className="py-8 text-center">
                      <div className="inline-flex items-center gap-3 text-sm text-gray-500 [font-family:'Lato',Helvetica] font-medium">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading replies...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* 决定显示哪些回复 */}
                      {(() => {
                        const shouldCollapse = actualReplies.length > REPLY_COLLAPSE_THRESHOLD;
                        let visibleReplies;

                        if (shouldCollapse) {
                          // 多条回复：使用展开/折叠逻辑
                          visibleReplies = repliesExpanded
                            ? actualReplies
                            : actualReplies.slice(0, REPLY_COLLAPSE_THRESHOLD);
                        } else {
                          // 少量回复：使用隐藏/显示逻辑
                          visibleReplies = smallRepliesHidden ? [] : actualReplies;
                        }

                        return (
                          <>
                            {visibleReplies.map((reply) => (
                              <ReplyItemComponent
                                key={reply.id}
                                reply={reply}
                                toggleLikeMutation={toggleLikeMutation}
                                targetId={targetId}
                                targetType={targetType}
                                parentComment={comment}
                                allReplies={actualReplies}
                                articleId={articleId}
                                onReplyClick={onReplyClick}
                              />
                            ))}

                            {/* 展开/折叠按钮或隐藏回复按钮 */}
                            {actualReplies.length > 0 && (
                              <div className="">
                                <button
                                  onClick={shouldCollapse ? () => setRepliesExpanded(!repliesExpanded) : () => setSmallRepliesHidden(!smallRepliesHidden)}
                                  className="group inline-flex items-center gap-2 py-1 text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200 [font-family:'Lato',Helvetica] font-medium"
                                  style={{ outline: 'none' }}
                                >
                                  {shouldCollapse ? (
                                    // 对于多条回复：显示展开/折叠逻辑
                                    repliesExpanded ? (
                                      <>
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <polyline points="18,15 12,9 6,15"></polyline>
                                        </svg>
                                        <span>Show less</span>
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <polyline points="6,9 12,15 18,9"></polyline>
                                        </svg>
                                        <span>Expand {actualReplies.length - REPLY_COLLAPSE_THRESHOLD} {actualReplies.length - REPLY_COLLAPSE_THRESHOLD === 1 ? 'comment' : 'comments'}</span>
                                      </>
                                    )
                                  ) : (
                                    // 对于少量回复：显示隐藏/显示回复逻辑
                                    smallRepliesHidden ? (
                                      <>
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <polyline points="6,9 12,15 18,9"></polyline>
                                        </svg>
                                        <span>Show {actualReplies.length === 1 ? 'reply' : 'replies'}</span>
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <polyline points="18,15 12,9 6,15"></polyline>
                                        </svg>
                                        <span>Hide {actualReplies.length === 1 ? 'reply' : 'replies'}</span>
                                      </>
                                    )
                                  )}
                                </button>
                              </div>
                            )}

                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};