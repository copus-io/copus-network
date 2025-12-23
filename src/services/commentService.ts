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
   * Convert frontend sort option to API parameter
   */
  private static convertSortByToApiParam(sortBy: CommentSortBy): string {
    switch (sortBy) {
      case 'newest':
        return 'createAt_desc'; // 按创建时间降序
      case 'oldest':
        return 'createAt_asc'; // 按创建时间升序
      case 'likes':
        return 'likeCount_desc'; // 按点赞数降序
      default:
        return 'createAt_desc';
    }
  }

  /**
   * Convert API comment to frontend comment format
   */
  private static convertApiCommentToComment(
    apiComment: ApiComment,
    targetType: 'article' | 'treasury' | 'user' | 'space',
    targetId: string,
    parentId?: string,
    requestContext?: { rootId?: number } // 🔧 新增：请求上下文，包含rootId信息
  ): Comment {

    // API comment conversion - added replyToId support for future API enhancements

    const finalComment = {
      id: String(apiComment.id),
      uuid: String(apiComment.id),
      content: apiComment.content,
      contentType: 'text',

      // 关联信息
      targetType,
      targetId,

      // 作者信息 - 简化逻辑
      authorId: apiComment.userInfo.id,
      authorName: apiComment.userInfo.username || 'Anonymous',
      authorNamespace: apiComment.userInfo.namespace,
      authorAvatar: apiComment.userInfo.faceUrl || null, // 空时设为null，让组件显示默认头像

      // 回复系统 - 🔧 利用请求上下文确定层级关系
      parentId,
      depth: parentId ? 1 : 0,
      replyToId: undefined, // API文档中没有这个字段，但我们可以通过请求上下文推断
      replyToUser: apiComment.replyToUser, // 保持完整的用户对象，让UI组件处理显示逻辑
      targetContent: (apiComment as any).targetContent, // 被引用的评论内容

      // 🔧 新增：如果是通过rootId请求获取的评论，说明这是对rootId评论的回复
      // 我们可以利用这个信息来构建更准确的引用关系
      _requestContext: requestContext,


      // 互动统计 - 根据API文档字段名
      likesCount: apiComment.likeCount || 0,
      repliesCount: apiComment.commentCount || 0,
      isLiked: apiComment.isLiked,

      // 元数据
      createdAt: new Date(apiComment.createdAt < 1e12 ? apiComment.createdAt * 1000 : apiComment.createdAt).toISOString(),
      updatedAt: new Date(apiComment.createdAt < 1e12 ? apiComment.createdAt * 1000 : apiComment.createdAt).toISOString(),
      isEdited: false,
      isDeleted: false,

      // 权限控制 (TODO: 从用户权限计算)
      canEdit: false,
      canDelete: false,

      // 图片支持 - 将逗号分隔的字符串转换为数组
      images: apiComment.imageUrls && apiComment.imageUrls.trim()
        ? apiComment.imageUrls.split(',').map(url => url.trim()).filter(url => url)
        : undefined
    };

    // 调试信息
    if (apiComment.imageUrls) {
      console.log('🔍 API评论图片数据:', {
        originalImageUrls: apiComment.imageUrls,
        convertedImages: finalComment.images,
        commentId: apiComment.id
      });
    }

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
      loadReplies?: boolean; // 新增控制是否加载回复的选项
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

    const { page = 1, limit = 20, loadReplies = false, sortBy } = options; // 默认不加载回复，改为按需加载

    try {
      // 第一步：获取所有顶级评论
      const topLevelComments = await this.fetchCommentsPage(targetId, page, limit, undefined, sortBy);

      // 如果不需要加载回复，直接返回主评论
      if (!loadReplies) {
        return topLevelComments;
      }

      // 第二步：批量获取回复优化
      const allComments = [...topLevelComments.comments];
      const commentsWithReplies = topLevelComments.comments.filter(comment => comment.repliesCount > 0);

      if (commentsWithReplies.length > 0) {
        // 🔥 优化：批量获取策略

        // 策略1：如果评论数较少，并行获取所有回复
        if (commentsWithReplies.length <= 5) {
          console.log(`📊 Loading replies in parallel for ${commentsWithReplies.length} comments`);

          const repliesPromises = commentsWithReplies.map(comment =>
            this.fetchRepliesForComment(targetId, parseInt(comment.id))
              .then(replies => ({ commentId: comment.id, replies }))
              .catch(error => {
                console.warn(`Failed to load replies for comment ${comment.id}:`, error);
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
        // 策略2：如果评论数较多，优先加载最近有回复的评论
        else {
          console.log(`📊 Loading replies for top 5 comments only (${commentsWithReplies.length} total)`);

          // 按回复数量和评论ID排序，优先加载回复多且较新的评论
          const sortedCommentsWithReplies = commentsWithReplies
            .sort((a, b) => {
              // 首先按回复数量排序（回复多的优先）
              if (b.repliesCount !== a.repliesCount) {
                return b.repliesCount - a.repliesCount;
              }
              // 回复数量相同时，按ID排序（较新的优先）
              return parseInt(b.id) - parseInt(a.id);
            });

          const topCommentsWithReplies = sortedCommentsWithReplies.slice(0, 5);
          const repliesPromises = topCommentsWithReplies.map(comment =>
            this.fetchRepliesForComment(targetId, parseInt(comment.id))
              .then(replies => ({ commentId: comment.id, replies }))
              .catch(error => {
                console.warn(`Failed to load replies for comment ${comment.id}:`, error);
                return { commentId: comment.id, replies: [] };
              })
          );

          const repliesResults = await Promise.all(repliesPromises);

          repliesResults.forEach(({ commentId, replies }) => {
            if (replies.length > 0) {
              allComments.push(...replies);
            }
          });
        }
      }

      console.log(`📊 Comment loading summary: ${topLevelComments.comments.length} main comments, ${allComments.length - topLevelComments.comments.length} replies loaded`);

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
    rootId?: number,
    sortBy?: CommentSortBy
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
      ...(rootId && { rootId: rootId.toString() }),
      // 添加排序参数 - 根据API文档可能的排序字段
      ...(sortBy && { sortBy: this.convertSortByToApiParam(sortBy) })
    });

    const url = `/client/reader/article/comment/page?${queryParams.toString()}`;

    const response: any = await apiRequest(url, {
      method: 'GET',
      requiresAuth: false // Allow non-logged users to view comments, only posting requires login
    });



    // 后端使用 {status: 1, msg: 'success'} 格式，不是 {success: true} 格式
    if (response.status !== 1) {
      throw new Error(response.msg || 'Failed to fetch comments');
    }

    const { data: items, pageCount, pageIndex, pageSize, totalCount } = response.data;

    // 根据API文档，评论数组就是data字段
    const commentsArray = items || [];


    // Convert API comments to frontend format
    const comments = commentsArray.map((apiComment, index) => {
      try {
        // 🔍 调试：检查后端返回的原始数据结构
        if (index < 3) { // Only log first 3 to avoid spam
          console.log('🔍 Raw API comment data FULL STRUCTURE:', {
            id: apiComment.id,
            commentCount: apiComment.commentCount,
            likeCount: apiComment.likeCount,
            hasRootId: 'rootId' in apiComment,
            rootId: (apiComment as any).rootId,
            hasParentId: 'parentId' in apiComment,
            parentId: (apiComment as any).parentId,
            replyToUser: apiComment.replyToUser,
            // 完整的用户信息
            userInfo: apiComment.userInfo,
            // 检查是否有其他相关字段
            replyTo: (apiComment as any).replyTo,
            replyUser: (apiComment as any).replyUser,
            targetUser: (apiComment as any).targetUser,
            replyToInfo: (apiComment as any).replyToInfo,
            replyToUserInfo: (apiComment as any).replyToUserInfo,
            allKeys: Object.keys(apiComment),
            // 完整数据
            fullData: apiComment
          });
        }

        const converted = CommentService.convertApiCommentToComment(
          apiComment,
          'article',
          targetId,
          rootId ? rootId.toString() : undefined, // 如果是获取回复，传入parentId
          { rootId } // 🔧 传入请求上下文
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
   * Made public to support lazy loading from useLoadCommentReplies hook
   */
  static async fetchRepliesForComment(targetId: string, rootId: number): Promise<Comment[]> {
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

    // 📝 新的parentId逻辑：
    // - 1级评论：不传parentId（后端会理解为0）
    // - 2级及以上评论：传递被回复的评论ID
    const requestData: ApiCreateCommentRequest = {
      articleId: data.articleId ? parseInt(data.articleId) : parseInt(data.targetId),
      content: data.content,
      id: 0, // 创建新评论时使用0
      ...(data.parentId && { parentId: parseInt(data.parentId) }),
      // 图片支持 - 检查两种可能的字段名
      ...(data.imageUrls && { imageUrls: data.imageUrls }), // 如果已经是字符串格式
      ...(data.images && data.images.length > 0 && { imageUrls: data.images.join(',') }) // 如果是数组格式
    };


    try {
      const url = '/client/reader/article/comment/createOrEdit';

      const response: any = await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(requestData),
        requiresAuth: true
      });

      // 根据API文档，后端应该使用 {success: true, comment: {...}} 格式
      // 但实际可能仍使用 {status: 1, msg: 'success'} 格式，两种都支持
      const isNewFormat = 'success' in response;
      const isOldFormat = 'status' in response;

      if (isNewFormat && !response.success) {
        throw new Error(response.errorMessage || 'Failed to create comment');
      } else if (isOldFormat && response.status !== 1) {
        throw new Error(response.msg || 'Failed to create comment');
      }

      // 检查API返回的评论数据结构 - 支持两种格式
      const commentData = response.comment || response.data?.comment || response.data;

      // 调试信息（生产环境可移除）
      console.log('🏗️ CommentService: Comment created successfully:', {
        commentId: commentData?.id,
        hasImageUrls: !!commentData?.imageUrls,
        requestImageUrls: requestData.imageUrls
      });

      const convertedComment = CommentService.convertApiCommentToComment(
        commentData,
        data.targetType,
        data.targetId,
        data.parentId
      );

      // 🔧 临时修复：确保图片数据显示（直到后端API修复）
      if (!convertedComment.images && data.imageUrls) {
        convertedComment.images = data.imageUrls.split(',').map(url => url.trim()).filter(url => url);
        console.log('🔧 Client-side image fallback applied for comment:', convertedComment.id);
      }

      // 🔧 设置回复信息（如果存在）

      if (data.replyToId) {
        convertedComment.replyToId = data.replyToId;
        if (data.replyToUser) {
          convertedComment.replyToUser = data.replyToUser;
        }
      }

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