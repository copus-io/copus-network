// React Query hooks for comments

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CommentService } from '../../services/commentService';
import { Comment, CreateCommentRequest, UpdateCommentRequest, CommentSortBy } from '../../types/comment';
import { useToast } from '../../components/ui/toast';

// Get comments for a target
export const useComments = (
  targetType: string,
  targetId: string,
  options: {
    sortBy?: CommentSortBy;
    page?: number;
    limit?: number;
  } = {}
) => {
  console.log('🎯 useComments hook called with:', { targetType, targetId, options });

  const result = useQuery({
    queryKey: ['comments', targetType, targetId, options],
    queryFn: () => {
      console.log('🎯 useComments queryFn executing for:', { targetType, targetId, options });
      return CommentService.getComments(targetType, targetId, options);
    },
    staleTime: 1000 * 60 * 2, // 2分钟内认为数据新鲜
    enabled: !!(targetType && targetId), // 只有在有target信息时才启用查询
  });

  console.log('🎯 useComments hook result:', {
    isLoading: result.isLoading,
    isError: result.isError,
    data: result.data,
    error: result.error
  });

  return result;
};

// Create comment mutation
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: CommentService.createComment,
    onSuccess: (newComment, variables) => {
      // 更新评论列表缓存
      queryClient.setQueriesData(
        { queryKey: ['comments', variables.targetType, variables.targetId] },
        (old: any) => {
          if (!old) return { comments: [newComment], totalCount: 1, hasMore: false };

          // 总是将新评论添加到列表中（无论是顶级评论还是回复）
          const updatedComments = [...old.comments, newComment];

          // 如果是回复，还需要更新父评论的回复数量
          if (variables.parentId) {
            const commentsWithUpdatedReplies = updatedComments.map((comment: Comment) =>
              comment.id === variables.parentId
                ? { ...comment, repliesCount: comment.repliesCount + 1 }
                : comment
            );

            return {
              ...old,
              comments: commentsWithUpdatedReplies,
              totalCount: old.totalCount + 1,
            };
          }

          return {
            ...old,
            comments: updatedComments,
            totalCount: old.totalCount + 1,
          };
        }
      );

      showToast('Comment posted successfully', 'success');

      // 强制刷新评论列表以确保包含新的回复
      console.log('🔄 Comment/reply created, invalidating queries to fetch latest data');
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.targetType, variables.targetId]
      });
    },
    onError: (error) => {
      console.error('Failed to create comment:', error);
      showToast('Failed to post comment, please try again', 'error');
    },
  });
};

// Update comment mutation
export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateCommentRequest }) =>
      CommentService.updateComment(commentId, data),
    onSuccess: (updatedComment) => {
      // 更新评论列表中的特定评论
      queryClient.setQueriesData(
        { queryKey: ['comments'] },
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            comments: old.comments.map((comment: Comment) =>
              comment.id === updatedComment.id
                ? { ...updatedComment, isEdited: true }
                : comment
            ),
          };
        }
      );
      showToast('Comment updated successfully', 'success');
    },
    onError: (error) => {
      console.error('Failed to update comment:', error);
      showToast('Failed to update comment, please try again', 'error');
    },
  });
};

// Delete comment mutation
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: CommentService.deleteComment,
    onSuccess: (_, commentId) => {
      // 从评论列表中移除已删除的评论
      queryClient.setQueriesData(
        { queryKey: ['comments'] },
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            comments: old.comments.filter((comment: Comment) => comment.id !== commentId),
            totalCount: Math.max(0, old.totalCount - 1),
          };
        }
      );
      showToast('Comment deleted successfully', 'success');
    },
    onError: (error) => {
      console.error('Failed to delete comment:', error);
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
  } = {}
) => {
  return useQuery({
    queryKey: ['replies', commentId, options],
    queryFn: () => CommentService.getReplies(commentId, options),
    staleTime: 1000 * 60 * 2,
    enabled: !!commentId,
  });
};