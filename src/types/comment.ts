// Comment types for Copus platform

// 用户信息类型 (从API返回)
export interface UserInfo {
  id: number;
  username: string;
  namespace: string;
  faceUrl: string;
}

// API返回的评论数据结构
export interface ApiComment {
  id: number;
  content: string;
  createdAt: number; // 时间戳
  isLiked: boolean;
  likeCount: number;
  commentCount: number; // 回复数量
  userInfo: UserInfo;
  replyToUser?: UserInfo;
  imageUrls?: string; // 图片URL字符串，多张图片用逗号分隔
  targetContent?: string; // 目标内容
}

// API创建评论请求
export interface ApiCreateCommentRequest {
  articleId: number;
  content: string;
  id?: number; // 编辑时使用
  parentId?: number; // 回复时使用
  imageUrls?: string; // 图片URL字符串，多张图片用逗号分隔
}

// API删除评论请求
export interface ApiDeleteCommentRequest {
  commentId: number;
}

// API点赞评论请求
export interface ApiLikeCommentRequest {
  commentId: number;
}

// API点赞评论响应
export interface ApiLikeCommentResponse {
  success: boolean;
  errorMessage?: string;
  likeCount: number;
}

// API响应结构
export interface ApiCommentResponse {
  success: boolean;
  errorMessage?: string;
  comment: ApiComment;
}

// API分页获取评论请求
export interface ApiGetCommentsRequest {
  articleId: number;
  pageIndex: number;
  pageSize: number;
  rootId?: number; // 获取特定顶级评论的回复，不传则获取所有顶级评论
}

// API分页获取评论响应
export interface ApiGetCommentsResponse {
  success: boolean;
  errorMessage?: string;
  data: {
    items: ApiComment[];
    pageCount: number;
    pageIndex: number;
    pageSize: number;
    totalCount: number;
  };
}

// 前端使用的评论数据结构 (适配后)
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

  // 图片支持
  images?: string[]; // 评论中的图片URL数组
}

// 创建评论的请求类型 (前端使用)
export interface CreateCommentRequest {
  content: string;
  targetType: 'article' | 'treasury' | 'user' | 'space';
  targetId: string;
  articleId?: string; // 新增：数字ID，用于API调用
  parentId?: string; // 回复评论时使用
  replyToId?: string; // @回复特定用户的评论ID
  replyToUser?: string; // @回复特定用户的用户名
  contentType?: 'text' | 'markdown';
  images?: string[]; // 评论中的图片URL数组
}

// 更新评论的请求类型
export interface UpdateCommentRequest {
  content: string;
  contentType?: 'text' | 'markdown';
  articleId?: string; // 编辑时需要的articleId
}

// 评论列表响应类型
export interface CommentsResponse {
  comments: Comment[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
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