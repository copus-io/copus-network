// React Query hooks for comments

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CommentService } from '../../services/commentService';
import { Comment, CreateCommentRequest, UpdateCommentRequest, CommentSortBy } from '../../types/comment';
import { useToast } from '../../components/ui/toast';
import { useUser } from '../../contexts/UserContext';

// Get comments for a target
export const useComments = (
  targetType: string,
  targetId: string,
  options: {
    sortBy?: CommentSortBy;
    page?: number;
    limit?: number;
    enabled?: boolean;
    loadReplies?: boolean; // 新增：是否加载回复
  } = {}
) => {
  const { enabled = true, ...queryOptions } = options;

  const result = useQuery({
    queryKey: ['comments', targetType, targetId, queryOptions],
    queryFn: () => CommentService.getComments(targetType, targetId, queryOptions),
    staleTime: 1000 * 60 * 5, // 5分钟内认为数据新鲜，减少重复请求
    gcTime: 1000 * 60 * 10, // 缓存时间10分钟
    enabled: enabled && !!(targetType && targetId), // 只有在启用且有target信息时才启用查询
    refetchOnWindowFocus: false, // 减少不必要的重新获取
  });

  return result;
};

// 新增：优化的评论加载hook，减少API调用
export const useOptimizedComments = (
  targetType: string,
  targetId: string,
  options: {
    sortBy?: CommentSortBy;
    page?: number;
    limit?: number;
    enabled?: boolean;
  } = {}
) => {
  const { enabled = true, ...queryOptions } = options;

  const result = useQuery({
    queryKey: ['optimizedComments', targetType, targetId, queryOptions],
    queryFn: () => CommentService.getComments(targetType, targetId, {
      ...queryOptions,
      loadReplies: false // 改为 false，使用懒加载模式
    }),
    staleTime: 1000 * 30, // 30秒内认为数据新鲜，平衡实时性和性能
    gcTime: 1000 * 60 * 5, // 缓存时间5分钟
    enabled: enabled && !!(targetType && targetId),
    refetchOnWindowFocus: false, // 减少不必要的重新获取
    retry: (failureCount, error) => {
      // 优化重试逻辑
      if (failureCount >= 2) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // 指数退避，最大5秒
  });

  return result;
};

// Create comment mutation with optimistic updates and real-time refresh
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: CommentService.createComment,
    onMutate: async (variables) => {
      console.log('🚀 Starting optimistic update for comment creation:', variables);

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['articleWithComments'] });
      await queryClient.cancelQueries({ queryKey: ['optimizedComments'] });

      // Snapshot the previous value
      const previousArticleData = queryClient.getQueryData(['articleWithComments', variables.targetId]);
      const previousCommentsData = queryClient.getQueryData(['optimizedComments', variables.targetType, variables.targetId]);

      // Create optimistic comment
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`, // Temporary ID
        content: variables.content,
        contentType: 'text',
        targetType: variables.targetType,
        targetId: variables.targetId,
        authorId: 0, // Will be filled by server response
        authorName: 'You', // Placeholder
        authorNamespace: '',
        authorAvatar: '',
        parentId: variables.parentId,
        depth: variables.parentId ? 1 : 0,
        replyToId: variables.replyToId,
        replyToUser: variables.replyToUser,
        targetContent: undefined,
        _requestContext: undefined,
        likesCount: 0,
        repliesCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEdited: false,
        isDeleted: false
      };

      // Optimistically update article comments if it's an article
      if (variables.targetType === 'article' && previousArticleData) {
        queryClient.setQueryData(['articleWithComments', variables.targetId], (old: any) => {
          if (!old) return old;

          // If this is a top-level comment (no parentId), add to main list
          if (!variables.parentId) {
            return {
              ...old,
              comments: old.comments ? [optimisticComment, ...old.comments] : [optimisticComment],
              totalComments: (old.totalComments || 0) + 1
            };
          }

          // If this is a reply, we don't add it to the main comments list
          // The reply will be handled by the reply loading system
          return {
            ...old,
            totalComments: (old.totalComments || 0) + 1
          };
        });
      }

      // Optimistically update regular comments
      if (previousCommentsData) {
        queryClient.setQueryData(['optimizedComments', variables.targetType, variables.targetId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            comments: old.comments ? [optimisticComment, ...old.comments] : [optimisticComment],
            totalCount: (old.totalCount || 0) + 1
          };
        });
      }

      // Handle optimistic updates for replies
      if (variables.parentId) {
        console.log('🔧 Handling optimistic update for reply to parent:', variables.parentId);

        // Find the root comment ID for this reply thread
        const findRootCommentId = () => {
          // For nested replies, we need to find which root comment this belongs to
          // This could be complex, so for now, let's invalidate the reply queries
          return variables.parentId;
        };

        const rootCommentId = findRootCommentId();

        // Update the specific reply query cache if it exists
        const replyQueryKey = ['commentReplies', variables.targetType, variables.targetId, rootCommentId];
        const existingRepliesData = queryClient.getQueryData(replyQueryKey);

        if (existingRepliesData) {
          console.log('🔧 Adding optimistic reply to existing replies cache');
          queryClient.setQueryData(replyQueryKey, (old: any) => {
            if (!old) return old;
            return {
              ...old,
              replies: old.replies ? [...old.replies, optimisticComment] : [optimisticComment],
              totalCount: (old.totalCount || 0) + 1
            };
          });
        }
      }

      return { previousArticleData, previousCommentsData, optimisticComment };
    },
    onSuccess: (newComment, variables, context) => {
      console.log('✅ Comment created successfully:', { newComment, variables });
      console.log('🔍 检查新评论的图片数据:', {
        commentId: newComment?.id,
        images: newComment?.images,
        hasImages: newComment?.images && newComment.images.length > 0
      });

      showToast('Comment posted successfully', 'success');

      // Update with real server data
      if (variables.targetType === 'article') {
        queryClient.setQueryData(['articleWithComments', variables.targetId], (old: any) => {
          if (!old) return old;
          const updatedComments = old.comments?.map((comment: Comment) =>
            comment.id === context?.optimisticComment.id ? newComment : comment
          ) || [newComment];

          return {
            ...old,
            comments: updatedComments,
            totalComments: old.totalComments // Keep the optimistic count
          };
        });
      }

      // For replies, immediately refresh the reply data to show the new comment
      if (variables.parentId) {
        console.log('🔄 Reply created, refreshing reply queries for parent:', variables.parentId);

        // Find and refresh the relevant reply query
        queryClient.invalidateQueries({
          queryKey: ['commentReplies'],
          exact: false
        });

        // Also refresh the main comment to update reply count
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['articleWithComments'] });
          queryClient.invalidateQueries({ queryKey: ['optimizedComments'] });
        }, 100);
      } else {
        // For top-level comments, do normal invalidation
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['articleWithComments'] });
          queryClient.invalidateQueries({ queryKey: ['optimizedComments'] });
        }, 100);
      }

      // Scroll to new comment
      setTimeout(() => {
        const commentElement = document.getElementById(`comment-${newComment.id}`);
        if (commentElement) {
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    },
    onError: (error, variables, context) => {
      console.error('❌ Failed to create comment:', error);

      // Rollback optimistic updates
      if (context?.previousArticleData) {
        queryClient.setQueryData(['articleWithComments', variables.targetId], context.previousArticleData);
      }
      if (context?.previousCommentsData) {
        queryClient.setQueryData(['optimizedComments', variables.targetType, variables.targetId], context.previousCommentsData);
      }

      // 提供更友好的错误提示
      const errorMessage = error instanceof Error ? error.message : '';
      let toastMessage = 'Failed to post comment, please try again';

      // 根据错误类型提供更具体的提示
      if (errorMessage.includes('content') || errorMessage.includes('required')) {
        toastMessage = 'Please add some text or images to your comment';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toastMessage = 'Network error. Please check your connection and try again';
      } else if (errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
        toastMessage = 'Please log in to post comments';
      } else if (errorMessage.includes('image') || errorMessage.includes('upload')) {
        toastMessage = 'Image upload failed. Please try again or use smaller images';
      }

      showToast(toastMessage, 'error');
    },
  });
};

// Update comment mutation with optimistic updates
export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateCommentRequest }) =>
      CommentService.updateComment(commentId, data),
    onMutate: async ({ commentId, data }) => {
      console.log('✏️ Starting optimistic update for comment:', commentId);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['articleWithComments'] });
      await queryClient.cancelQueries({ queryKey: ['optimizedComments'] });
      await queryClient.cancelQueries({ queryKey: ['comments'] });

      // Snapshot the previous values
      const previousArticleData = queryClient.getQueryData(['articleWithComments']);
      const previousCommentsQueries = queryClient.getQueriesData({ queryKey: ['comments'] });
      const previousOptimizedQueries = queryClient.getQueriesData({ queryKey: ['optimizedComments'] });

      // Optimistically update in all relevant queries
      const updateComment = (old: any) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments?.map((comment: Comment) =>
            comment.id.toString() === commentId.toString()
              ? {
                  ...comment,
                  content: data.content,
                  images: data.images, // 包含图片数据
                  isEdited: true,
                  updatedAt: new Date().toISOString()
                }
              : comment
          ),
        };
      };

      queryClient.setQueriesData({ queryKey: ['articleWithComments'] }, updateComment);
      queryClient.setQueriesData({ queryKey: ['comments'] }, updateComment);
      queryClient.setQueriesData({ queryKey: ['optimizedComments'] }, updateComment);

      return { previousArticleData, previousCommentsQueries, previousOptimizedQueries };
    },
    onSuccess: (updatedComment) => {
      console.log('✅ Comment updated successfully:', updatedComment);
      showToast('Comment updated successfully', 'success');

      // Update with real server data
      const updateWithServerData = (old: any) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments?.map((comment: Comment) =>
            comment.id === updatedComment.id
              ? { ...updatedComment, isEdited: true }
              : comment
          ),
        };
      };

      queryClient.setQueriesData({ queryKey: ['articleWithComments'] }, updateWithServerData);
      queryClient.setQueriesData({ queryKey: ['comments'] }, updateWithServerData);
      queryClient.setQueriesData({ queryKey: ['optimizedComments'] }, updateWithServerData);
    },
    onError: (error, { commentId }, context) => {
      console.error('❌ Failed to update comment:', error);

      // Rollback optimistic updates
      if (context?.previousArticleData) {
        queryClient.setQueryData(['articleWithComments'], context.previousArticleData);
      }
      if (context?.previousCommentsQueries) {
        context.previousCommentsQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousOptimizedQueries) {
        context.previousOptimizedQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      showToast('Failed to update comment, please try again', 'error');
    },
  });
};

// Delete comment mutation with optimistic updates
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ commentId, articleId }: { commentId: string; articleId: string }) =>
      CommentService.deleteComment(commentId, articleId),
    onMutate: async ({ commentId, articleId }) => {
      console.log('🗑️ Starting optimistic delete for comment:', commentId);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['articleWithComments'] });
      await queryClient.cancelQueries({ queryKey: ['optimizedComments'] });
      await queryClient.cancelQueries({ queryKey: ['comments'] });
      await queryClient.cancelQueries({ queryKey: ['commentReplies'] }); // 新增：取消回复查询

      // Snapshot the previous values
      const previousArticleData = queryClient.getQueryData(['articleWithComments']);
      const previousCommentsQueries = queryClient.getQueriesData({ queryKey: ['comments'] });
      const previousOptimizedQueries = queryClient.getQueriesData({ queryKey: ['optimizedComments'] });
      const previousReplyQueries = queryClient.getQueriesData({ queryKey: ['commentReplies'] }); // 新增：快照回复查询

      // Optimistically remove comment from articleWithComments
      queryClient.setQueriesData(
        { queryKey: ['articleWithComments'] },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            comments: old.comments?.filter((comment: Comment) => comment.id.toString() !== commentId.toString()),
            totalComments: Math.max(0, (old.totalComments || 0) - 1)
          };
        }
      );

      // Optimistically remove from all comment queries
      queryClient.setQueriesData(
        { queryKey: ['comments'] },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            comments: old.comments?.filter((comment: Comment) => comment.id.toString() !== commentId.toString()),
            totalCount: Math.max(0, (old.totalCount || 0) - 1)
          };
        }
      );

      // Optimistically remove from optimized comment queries
      queryClient.setQueriesData(
        { queryKey: ['optimizedComments'] },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            comments: old.comments?.filter((comment: Comment) => comment.id.toString() !== commentId.toString()),
            totalCount: Math.max(0, (old.totalCount || 0) - 1)
          };
        }
      );

      // 🔥 新增：专门处理嵌套回复的删除（重要！）
      // 删除 commentReplies 查询中的回复
      queryClient.setQueriesData(
        { queryKey: ['commentReplies'] },
        (old: any) => {
          if (!old || !old.replies) return old;

          console.log('🔧 Removing reply from commentReplies cache:', {
            commentId,
            totalBefore: old.replies.length
          });

          const filteredReplies = old.replies.filter((reply: Comment) =>
            reply.id.toString() !== commentId.toString()
          );

          console.log('🔧 After filtering replies:', {
            totalAfter: filteredReplies.length,
            removed: old.replies.length - filteredReplies.length
          });

          return {
            ...old,
            replies: filteredReplies,
            totalCount: Math.max(0, filteredReplies.length)
          };
        }
      );

      return {
        previousArticleData,
        previousCommentsQueries,
        previousOptimizedQueries,
        previousReplyQueries // 新增：返回回复查询快照以便回滚
      };
    },
    onSuccess: (_, { commentId }) => {
      console.log('✅ Comment deleted successfully:', commentId);
      showToast('Comment deleted successfully', 'success');

      // Invalidate to ensure consistency
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['articleWithComments'] });
        queryClient.invalidateQueries({ queryKey: ['comments'] });
        queryClient.invalidateQueries({ queryKey: ['optimizedComments'] });
        queryClient.invalidateQueries({ queryKey: ['commentReplies'] }); // 新增：无效化回复查询
      }, 100);
    },
    onError: (error, { commentId }, context) => {
      console.error('❌ Failed to delete comment:', error);

      // Rollback optimistic updates
      if (context?.previousArticleData) {
        queryClient.setQueryData(['articleWithComments'], context.previousArticleData);
      }
      if (context?.previousCommentsQueries) {
        context.previousCommentsQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousOptimizedQueries) {
        context.previousOptimizedQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      // 新增：回滚回复查询
      if (context?.previousReplyQueries) {
        context.previousReplyQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      showToast('Failed to delete comment, please try again', 'error');
    },
  });
};

// Toggle comment like mutation
export const useToggleCommentLike = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: CommentService.toggleCommentLike,
    onMutate: async (commentId) => {
      // 乐观更新：立即更新UI
      await queryClient.cancelQueries({ queryKey: ['comments'] });

      const previousData = queryClient.getQueriesData({ queryKey: ['comments'] });

      queryClient.setQueriesData(
        { queryKey: ['comments'] },
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            comments: old.comments.map((comment: Comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    isLiked: !comment.isLiked,
                    likesCount: comment.isLiked
                      ? Math.max(0, comment.likesCount - 1)
                      : comment.likesCount + 1
                  }
                : comment
            ),
          };
        }
      );

      return { previousData };
    },
    onSuccess: (result, commentId) => {
      // 用服务器返回的实际数据更新
      queryClient.setQueriesData(
        { queryKey: ['comments'] },
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            comments: old.comments.map((comment: Comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    isLiked: result.isLiked,
                    likesCount: result.likesCount
                  }
                : comment
            ),
          };
        }
      );
    },
    onError: (error, commentId, context) => {
      // 回滚乐观更新
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Failed to toggle comment like:', error);
      // No toast notification for like errors - UI already updated optimistically
    },
  });
};

// Get comment stats
export const useCommentStats = (targetType: string, targetId: string) => {
  return useQuery({
    queryKey: ['commentStats', targetType, targetId],
    queryFn: () => CommentService.getCommentStats(targetType, targetId),
    staleTime: 1000 * 60 * 5, // 5分钟内认为数据新鲜
    enabled: !!(targetType && targetId),
  });
};

// Get replies for a comment
export const useReplies = (
  commentId: string,
  options: {
    sortBy?: CommentSortBy;
    page?: number;
    limit?: number;
    enabled?: boolean;
  } = {}
) => {
  const { enabled = true, ...queryOptions } = options;

  return useQuery({
    queryKey: ['replies', commentId, queryOptions],
    queryFn: () => CommentService.getReplies(commentId, queryOptions),
    staleTime: 1000 * 60 * 2,
    enabled: enabled && !!commentId,
  });
};

// 专门用于按需加载单个评论回复的钩子
export const useLoadCommentReplies = (
  targetType: string,
  targetId: string,
  commentId: string,
  options: {
    enabled?: boolean;
    articleId?: string; // 新增：数字ID，用于API调用
  } = {}
) => {
  const { enabled = false, articleId } = options;

  return useQuery({
    queryKey: ['commentReplies', targetType, targetId, commentId],
    queryFn: async () => {
      // 优先使用 articleId，回退到 targetId
      const apiTargetId = articleId || targetId;
      const replies = await CommentService.fetchRepliesForComment(apiTargetId, parseInt(commentId));
      return {
        commentId,
        replies,
        totalCount: replies.length
      };
    },
    staleTime: 1000 * 60 * 10, // 10分钟缓存，回复变化较少
    gcTime: 1000 * 60 * 15, // 缓存时间15分钟
    enabled: enabled && !!commentId && !!targetId,
    refetchOnWindowFocus: false, // 减少不必要的重新获取
    retry: 1, // 回复失败只重试1次
    retryDelay: 1000, // 固定1秒延迟
  });
};