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
  return useQuery({
    queryKey: ['comments', targetType, targetId, options],
    queryFn: () => CommentService.getComments(targetType, targetId, options),
    staleTime: 1000 * 60 * 2, // 2分钟内认为数据新鲜
    enabled: !!(targetType && targetId), // 只有在有target信息时才启用查询
  });
};

// Create comment mutation
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: CommentService.createComment,
    onSuccess: (newComment, variables) => {
      // 更新评论列表缓存
      queryClient.setQueryData(
        ['comments', variables.targetType, variables.targetId],
        (old: any) => {
          if (!old) return { comments: [newComment], totalCount: 1, hasMore: false };

          return {
            ...old,
            comments: [newComment, ...old.comments],
            totalCount: old.totalCount + 1,
          };
        }
      );

      // 如果是回复，更新父评论的回复数
      if (variables.parentId) {
        queryClient.setQueryData(
          ['comments', variables.targetType, variables.targetId],
          (old: any) => {
            if (!old) return old;

            return {
              ...old,
              comments: old.comments.map((comment: Comment) =>
                comment.id === variables.parentId
                  ? { ...comment, repliesCount: comment.repliesCount + 1 }
                  : comment
              ),
            };
          }
        );
      }

      showToast('评论发布成功', 'success');
    },
    onError: (error) => {
      console.error('Failed to create comment:', error);
      showToast('发布评论失败，请重试', 'error');
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
      showToast('评论更新成功', 'success');
    },
    onError: (error) => {
      console.error('Failed to update comment:', error);
      showToast('更新评论失败，请重试', 'error');
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
      showToast('评论删除成功', 'success');
    },
    onError: (error) => {
      console.error('Failed to delete comment:', error);
      showToast('删除评论失败，请重试', 'error');
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
      showToast('操作失败，请重试', 'error');
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