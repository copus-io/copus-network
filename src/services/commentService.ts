// Comment service for Copus platform

import { apiRequest } from './api';
import {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentsResponse,
  CommentStats,
  CommentLikeResponse,
  CommentSortBy
} from '../types/comment';

export class CommentService {
  /**
   * Get comments for a target (article, treasury, etc.)
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
    const params = new URLSearchParams({
      targetType,
      targetId,
      page: String(options.page || 1),
      limit: String(options.limit || 20),
      sortBy: options.sortBy || 'newest',
      ...(options.cursor && { cursor: options.cursor })
    });

    return apiRequest(`/comments?${params}`);
  }

  /**
   * Create a new comment
   */
  static async createComment(data: CreateCommentRequest): Promise<Comment> {
    return apiRequest('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing comment
   */
  static async updateComment(commentId: string, data: UpdateCommentRequest): Promise<Comment> {
    return apiRequest(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a comment
   */
  static async deleteComment(commentId: string): Promise<void> {
    return apiRequest(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Toggle like/unlike a comment
   */
  static async toggleCommentLike(commentId: string): Promise<CommentLikeResponse> {
    return apiRequest(`/comments/${commentId}/like`, {
      method: 'POST',
    });
  }

  /**
   * Get comment statistics
   */
  static async getCommentStats(targetType: string, targetId: string): Promise<CommentStats> {
    return apiRequest(`/comments/stats?targetType=${targetType}&targetId=${targetId}`);
  }

  /**
   * Report a comment for moderation
   */
  static async reportComment(commentId: string, reason: string): Promise<void> {
    return apiRequest(`/comments/${commentId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  /**
   * Get replies for a specific comment
   */
  static async getReplies(
    commentId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: CommentSortBy;
    } = {}
  ): Promise<CommentsResponse> {
    const params = new URLSearchParams({
      page: String(options.page || 1),
      limit: String(options.limit || 10),
      sortBy: options.sortBy || 'newest',
    });

    return apiRequest(`/comments/${commentId}/replies?${params}`);
  }
}