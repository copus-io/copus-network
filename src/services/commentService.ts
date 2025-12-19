// Comment service for Copus platform

import { apiRequest } from './api';
import {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentsResponse,
  CommentStats,
  CommentLikeResponse,
  CommentSortBy,
  ApiComment,
  ApiCreateCommentRequest,
  ApiCommentResponse,
  ApiDeleteCommentRequest,
  ApiLikeCommentRequest,
  ApiLikeCommentResponse,
  ApiGetCommentsRequest,
  ApiGetCommentsResponse,
  UserInfo
} from '../types/comment';

export class CommentService {
  /**
   * Convert API comment to frontend comment format
   */
  private static convertApiCommentToComment(
    apiComment: ApiComment,
    targetType: 'article' | 'treasury' | 'user' | 'space',
    targetId: string,
    parentId?: string
  ): Comment {

    const finalComment = {
      id: String(apiComment.id),
      uuid: String(apiComment.id),
      content: apiComment.content,
      contentType: 'text',

      // 关联信息
      targetType,
      targetId,

      // 作者信息
      authorId: apiComment.userInfo.id,
      authorName: apiComment.userInfo.username || apiComment.userInfo.namespace || `用户${apiComment.userInfo.id}`,
      authorNamespace: apiComment.userInfo.namespace,
      authorAvatar: apiComment.userInfo.faceUrl,

      // 回复系统
      parentId,
      depth: parentId ? 1 : 0,
      replyToUser: apiComment.replyToUser?.username,

      // 互动统计
      likesCount: apiComment.likeCount,
      repliesCount: apiComment.commentCount,
      isLiked: apiComment.isLiked,

      // 元数据
      createdAt: new Date(apiComment.createdAt < 1e12 ? apiComment.createdAt * 1000 : apiComment.createdAt).toISOString(),
      updatedAt: new Date(apiComment.createdAt < 1e12 ? apiComment.createdAt * 1000 : apiComment.createdAt).toISOString(),
      isEdited: false,
      isDeleted: false,

      // 权限控制 (TODO: 从用户权限计算)
      canEdit: false,
      canDelete: false
    };


    return finalComment;
  }

  /**
   * Get comments for an article with replies
   * Note: 目前只支持article类型，其他类型需要后端提供相应接口
   */
  static async getComments(
    targetType: string,
    targetId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: CommentSortBy;
      cursor?: string;
    } = {}
  ): Promise<CommentsResponse> {

    // 目前只支持article类型
    if (targetType !== 'article') {
      return {
        comments: [],
        totalCount: 0,
        hasMore: false
      };
    }

    const { page = 1, limit = 20 } = options;

    try {
      // 第一步：获取所有顶级评论
      const topLevelComments = await this.fetchCommentsPage(targetId, page, limit);

      // 第二步：并行获取所有有回复的评论的回复
      const allComments = [...topLevelComments.comments];

      const commentsWithReplies = topLevelComments.comments.filter(comment => comment.repliesCount > 0);

      if (commentsWithReplies.length > 0) {

        // 并行获取所有回复，而不是串行
        const repliesPromises = commentsWithReplies.map(comment =>
          this.fetchRepliesForComment(targetId, parseInt(comment.id))
            .then(replies => ({ commentId: comment.id, replies }))
            .catch(error => {
              return { commentId: comment.id, replies: [] };
            })
        );

        const repliesResults = await Promise.all(repliesPromises);

        // 将所有回复添加到评论列表中
        repliesResults.forEach(({ commentId, replies }) => {
          if (replies.length > 0) {
            allComments.push(...replies);
          }
        });
      }


      return {
        comments: allComments,
        totalCount: topLevelComments.totalCount,
        hasMore: topLevelComments.hasMore,
        pageCount: topLevelComments.pageCount,
        pageIndex: topLevelComments.pageIndex,
        pageSize: topLevelComments.pageSize
      };
    } catch (error) {
      console.error('Failed to fetch comments:', error);

      // Return empty result on error instead of throwing
      return {
        comments: [],
        totalCount: 0,
        hasMore: false
      };
    }
  }

  /**
   * Fetch a single page of comments (top-level or replies)
   */
  private static async fetchCommentsPage(
    targetId: string,
    page: number,
    limit: number,
    rootId?: number
  ): Promise<CommentsResponse> {
    const requestData: ApiGetCommentsRequest = {
      articleId: parseInt(targetId),
      pageIndex: page,
      pageSize: limit,
      ...(rootId && { rootId })
    };

    const queryParams = new URLSearchParams({
      articleId: requestData.articleId.toString(),
      pageIndex: requestData.pageIndex.toString(),
      pageSize: requestData.pageSize.toString(),
      ...(rootId && { rootId: rootId.toString() })
    });

    const url = `/client/reader/article/comment/page?${queryParams.toString()}`;

    const response: any = await apiRequest(url, {
      method: 'GET',
      requiresAuth: false // 获取评论列表不需要登录，任何人都可以查看
    });

    // 后端使用 {status: 1, msg: 'success'} 格式，不是 {success: true} 格式
    if (response.status !== 1) {
      throw new Error(response.msg || 'Failed to fetch comments');
    }

    const { items, pageCount, pageIndex, pageSize, totalCount } = response.data;

    // 尝试不同的字段名，可能API使用了不同的字段
    const commentsArray = items || response.data.list || response.data.comments || response.data.records || [];

    // Convert API comments to frontend format
    const comments = commentsArray.map((apiComment, index) => {
      try {
        const converted = CommentService.convertApiCommentToComment(
          apiComment,
          'article',
          targetId,
          rootId ? rootId.toString() : undefined // 如果是获取回复，传入parentId
        );
        return converted;
      } catch (error) {
        console.error(`Error converting comment ${index}:`, error);
        return null; // Skip invalid comments
      }
    }).filter(comment => comment !== null);

    return {
      comments,
      totalCount,
      hasMore: pageIndex < pageCount,
      pageCount,
      pageIndex,
      pageSize
    };
  }

  /**
   * Fetch all replies for a specific comment
   */
  private static async fetchRepliesForComment(targetId: string, rootId: number): Promise<Comment[]> {
    try {
      const repliesResponse = await this.fetchCommentsPage(targetId, 1, 100, rootId); // 获取最多100条回复
      return repliesResponse.comments;
    } catch (error) {
      console.error(`Failed to fetch replies for comment ${rootId}:`, error);
      return []; // 回复获取失败时返回空数组，不影响主评论显示
    }
  }

  /**
   * Create a new comment
   */
  static async createComment(data: CreateCommentRequest): Promise<Comment> {
    // 目前只支持article类型
    if (data.targetType !== 'article') {
      throw new Error('Only article comments are supported currently');
    }

    const requestData: ApiCreateCommentRequest = {
      articleId: parseInt(data.targetId),
      content: data.content,
      id: 0, // 创建新评论时使用0
      parentId: data.parentId ? parseInt(data.parentId) : undefined
    };


    try {
      const url = '/client/reader/article/comment/createOrEdit';

      const response: any = await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(requestData),
        requiresAuth: true
      });

      // 后端使用 {status: 1, msg: 'success'} 格式，不是 {success: true} 格式
      if (response.status !== 1) {
        throw new Error(response.msg || 'Failed to create comment');
      }

      // 检查API返回的评论数据结构
      const commentData = response.data?.comment || response.data;

      const convertedComment = CommentService.convertApiCommentToComment(
        commentData,
        data.targetType,
        data.targetId,
        data.parentId
      );


      return convertedComment;
    } catch (error) {
      console.error('Failed to create comment:', error);
      throw error; // Re-throw for proper error handling in UI
    }
  }

  /**
   * Update an existing comment
   */
  static async updateComment(commentId: string, data: UpdateCommentRequest): Promise<Comment> {
    try {
      // 使用相同的创建/编辑接口，带上id参数表示编辑
      const requestData: ApiCreateCommentRequest = {
        articleId: data.articleId ? parseInt(data.articleId) : 0,
        content: data.content,
        id: parseInt(commentId)
      };

      console.log('Update comment request data:', requestData);

      const response: any = await apiRequest('/client/reader/article/comment/createOrEdit', {
        method: 'POST',
        body: JSON.stringify(requestData),
        requiresAuth: true
      });

      console.log('Update comment API response:', response);

      // 后端使用 {status: 1, msg: 'success'} 格式，不是 {success: true} 格式
      if (response.status !== 1) {
        throw new Error(response.msg || 'Failed to update comment');
      }

      // 检查API返回的评论数据结构
      const commentData = response.data?.comment || response.data;

      return CommentService.convertApiCommentToComment(
        commentData,
        'article', // 目前只支持article类型
        data.articleId || '', // 使用传入的articleId
      );
    } catch (error) {
      console.error('Failed to update comment:', error);
      throw error; // Re-throw for proper error handling in UI
    }
  }

  /**
   * Delete a comment
   */
  static async deleteComment(commentId: string, articleId?: string): Promise<void> {
    // Try using 'commentId' as the parameter name
    const requestData: any = {
      commentId: parseInt(commentId)  // Use 'commentId' instead of 'id'
    };

    // If articleId is provided, add it to the request
    if (articleId) {
      requestData.articleId = parseInt(articleId);
    }

    const requestOptions = {
      method: 'POST',
      body: JSON.stringify(requestData),
      requiresAuth: true
    };

    try {
      const response: any = await apiRequest('/client/reader/article/comment/delete', requestOptions);

      // 后端使用 {status: 1, msg: 'success'} 格式，不是 {success: true} 格式
      if (response.status !== 1) {
        throw new Error(response.msg || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    }
  }

  /**
   * Toggle like/unlike a comment
   */
  static async toggleCommentLike(commentId: string): Promise<CommentLikeResponse> {
    const requestData: ApiLikeCommentRequest = {
      commentId: parseInt(commentId)
    };

    const response: any = await apiRequest('/client/reader/article/comment/like', {
      method: 'POST',
      body: JSON.stringify(requestData),
      requiresAuth: true
    });

    // 后端使用 {status: 1, msg: 'success'} 格式，不是 {success: true} 格式
    if (response.status !== 1) {
      throw new Error(response.msg || 'Failed to like comment');
    }

    // Note: API 只返回 likeCount，不返回 isLiked 状态
    // 前端需要自己维护 isLiked 状态
    return {
      isLiked: true, // 假设操作成功就是点赞了，前端自己切换状态
      likesCount: response.data?.likeCount || response.likeCount || 0
    };
  }

  /**
   * Get comment statistics
   */
  static async getCommentStats(targetType: string, targetId: string): Promise<CommentStats> {
    // TODO: 需要后端提供统计接口
    return {
      totalComments: 0,
      topCommenters: []
    };
  }
}