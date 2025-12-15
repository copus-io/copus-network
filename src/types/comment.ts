// Comment types for Copus platform

export interface Comment {
  id: string;
  uuid: string;
  content: string;
  contentType?: 'text' | 'markdown';

  // 关联信息
  targetType: 'article' | 'treasury' | 'user' | 'space';
  targetId: string;
  targetUuid?: string;

  // 作者信息
  authorId: number;
  authorUuid?: string;
  authorName: string;
  authorNamespace?: string;
  authorAvatar?: string;

  // 回复系统 - 简化版 (1级回复)
  parentId?: string; // 顶级评论为空，回复评论指向父评论ID
  replyToId?: string; // 回复特定用户的评论ID
  replyToUser?: string; // 回复的用户名
  depth: number; // 0为顶级评论，1为回复

  // 互动统计
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean; // 当前用户是否点赞

  // 元数据
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  isDeleted: boolean;

  // 权限控制
  canEdit: boolean;
  canDelete: boolean;
}

// 创建评论的请求类型
export interface CreateCommentRequest {
  content: string;
  targetType: 'article' | 'treasury' | 'user' | 'space';
  targetId: string;
  parentId?: string; // 回复评论时使用
  replyToId?: string; // @回复特定用户
  contentType?: 'text' | 'markdown';
}

// 更新评论的请求类型
export interface UpdateCommentRequest {
  content: string;
  contentType?: 'text' | 'markdown';
}

// 评论列表响应类型
export interface CommentsResponse {
  comments: Comment[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

// 评论统计信息
export interface CommentStats {
  totalComments: number;
  topCommenters: Array<{
    userId: number;
    username: string;
    avatar?: string;
    commentCount: number;
  }>;
}

// 点赞响应类型
export interface CommentLikeResponse {
  isLiked: boolean;
  likesCount: number;
}

// 评论排序选项
export type CommentSortBy = 'newest' | 'oldest' | 'likes';