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
    console.log('🔄 Converting API comment:', {
      apiComment,
      targetType,
      targetId,
      parentId,
      userInfoCheck: {
        hasUsername: !!apiComment.userInfo?.username,
        hasNamespace: !!apiComment.userInfo?.namespace,
        hasId: !!apiComment.userInfo?.id,
        username: apiComment.userInfo?.username,
        namespace: apiComment.userInfo?.namespace,
        id: apiComment.userInfo?.id
      }
    });

    return {
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
    console.log('🔍 CommentService.getComments called with:', { targetType, targetId, options });

    // 目前只支持article类型
    if (targetType !== 'article') {
      console.log('❌ Only article type supported, returning empty');
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
      console.log('📋 Fetched top-level comments:', topLevelComments.comments.length);

      // 第二步：获取所有有回复的评论的回复
      const allComments = [...topLevelComments.comments];

      for (const comment of topLevelComments.comments) {
        if (comment.repliesCount > 0) {
          console.log(`🔄 Fetching replies for comment ${comment.id} (${comment.repliesCount} replies)`);
          const replies = await this.fetchRepliesForComment(targetId, parseInt(comment.id));
          console.log(`📥 Fetched ${replies.length} replies for comment ${comment.id}`);
          allComments.push(...replies);
        }
      }

      console.log('✅ Successfully processed all comments:', {
        topLevelCount: topLevelComments.comments.length,
        totalWithReplies: allComments.length,
        hasMore: topLevelComments.hasMore
      });

      return {
        comments: allComments,
        totalCount: topLevelComments.totalCount,
        hasMore: topLevelComments.hasMore,
        pageCount: topLevelComments.pageCount,
        pageIndex: topLevelComments.pageIndex,
        pageSize: topLevelComments.pageSize
      };
    } catch (error) {
      console.error('💥 Failed to fetch comments - detailed error:', error);
      console.error('💥 Error name:', error?.name);
      console.error('💥 Error message:', error?.message);
      console.error('💥 Error stack:', error?.stack);

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

    console.log('📤 GET comments request data:', requestData);

    const queryParams = new URLSearchParams({
      articleId: requestData.articleId.toString(),
      pageIndex: requestData.pageIndex.toString(),
      pageSize: requestData.pageSize.toString(),
      ...(rootId && { rootId: rootId.toString() })
    });

    const url = `/client/reader/article/comment/page?${queryParams.toString()}`;
    console.log('🌐 Making GET request to:', url);

    const response: any = await apiRequest(url, {
      method: 'GET',
      requiresAuth: false // 获取评论列表不需要登录，任何人都可以查看
    });

    console.log('📥 GET comments API response:', response);

    // 后端使用 {status: 1, msg: 'success'} 格式，不是 {success: true} 格式
    if (response.status !== 1) {
      console.error('❌ API response indicates failure:', response);
      throw new Error(response.msg || 'Failed to fetch comments');
    }

    console.log('🔍 Full API response.data:', response.data);

    const { items, pageCount, pageIndex, pageSize, totalCount } = response.data;

    // 尝试不同的字段名，可能API使用了不同的字段
    const commentsArray = items || response.data.list || response.data.comments || response.data.records || [];
    console.log('📋 Comments array:', commentsArray);

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
        console.error(`💥 Error converting comment ${index}:`, error, apiComment);
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
      console.error(`💥 Failed to fetch replies for comment ${rootId}:`, error);
      return []; // 回复获取失败时返回空数组，不影响主评论显示
    }
  }

  /**
   * Create a new comment
   */
  static async createComment(data: CreateCommentRequest): Promise<Comment> {
    console.log('✍️ CommentService.createComment called with:', data);

    // 目前只支持article类型
    if (data.targetType !== 'article') {
      console.log('❌ Only article type supported for creation');
      throw new Error('Only article comments are supported currently');
    }

    const requestData: ApiCreateCommentRequest = {
      articleId: parseInt(data.targetId),
      content: data.content,
      id: 0, // 创建新评论时使用0
      parentId: data.parentId ? parseInt(data.parentId) : undefined
    };

    console.log('📤 Create comment request data:', requestData);
    console.log('📤 Is this a reply?', !!data.parentId);
    console.log('📤 Parent ID:', data.parentId);

    try {
      const url = '/client/reader/article/comment/createOrEdit';
      console.log('🌐 Making POST request to:', url);

      const response: any = await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(requestData),
        requiresAuth: true
      });

      console.log('📥 Create comment API response:', response);
      console.log('📥 Response type:', typeof response);
      console.log('📥 Response success property:', response?.success);
      console.log('📥 Response status property:', response?.status);

      // 后端使用 {status: 1, msg: 'success'} 格式，不是 {success: true} 格式
      if (response.status !== 1) {
        console.error('❌ Create comment API error:', response);
        throw new Error(response.msg || 'Failed to create comment');
      }

      console.log('✅ Comment created successfully, converting to frontend format');
      console.log('📄 Response data for conversion:', response.data);

      // 检查API返回的评论数据结构
      const commentData = response.data?.comment || response.data;

      return CommentService.convertApiCommentToComment(
        commentData,
        data.targetType,
        data.targetId,
        data.parentId
      );
    } catch (error) {
      console.error('💥 Failed to create comment - detailed error:', error);
      console.error('💥 Error name:', error?.name);
      console.error('💥 Error message:', error?.message);
      console.error('💥 Error stack:', error?.stack);
      throw error; // Re-throw for proper error handling in UI
    }
  }

  /**
   * Update an existing comment
   */
  static async updateComment(commentId: string, data: UpdateCommentRequest): Promise<Comment> {
    // TODO: 需要后端提供编辑评论接口
    // 目前使用相同的创建接口，带上id参数
    const requestData: ApiCreateCommentRequest = {
      articleId: 0, // TODO: 需要从评论获取articleId
      content: data.content,
      id: parseInt(commentId)
    };

    const response: ApiCommentResponse = await apiRequest('/client/reader/article/comment/createOrEdit', {
      method: 'POST',
      body: JSON.stringify(requestData),
      requiresAuth: true
    });

    if (!response.success) {
      throw new Error(response.errorMessage || 'Failed to update comment');
    }

    return CommentService.convertApiCommentToComment(
      response.comment,
      'article', // TODO: 从上下文获取
      '', // TODO: 从上下文获取
    );
  }

  /**
   * Delete a comment
   */
  static async deleteComment(commentId: string): Promise<void> {
    const requestData: ApiDeleteCommentRequest = {
      commentId: parseInt(commentId)
    };


    const response: any = await apiRequest('/client/reader/article/comment/delete', {
      method: 'POST',
      body: JSON.stringify(requestData),
      requiresAuth: true
    });


    // 后端使用 {status: 1, msg: 'success'} 格式，不是 {success: true} 格式
    if (response.status !== 1) {
      console.error('❌ Delete comment API error:', response);
      throw new Error(response.msg || 'Failed to delete comment');
    }

    console.log('✅ Comment deleted successfully');
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

    console.log('📥 Like comment API response:', response);
    console.log('📥 Response status property:', response?.status);

    // 后端使用 {status: 1, msg: 'success'} 格式，不是 {success: true} 格式
    if (response.status !== 1) {
      console.error('❌ Like comment API error:', response);
      throw new Error(response.msg || 'Failed to like comment');
    }

    console.log('✅ Comment like toggled successfully');

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