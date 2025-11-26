import React, { useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useToast } from "./toast";
import { useNavigate } from "react-router-dom";

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    namespace: string;
    avatar: string;
  };
  createdAt: number;
  likesCount: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface CommentSectionProps {
  articleId: string;
  className?: string;
}

const mockComments: Comment[] = [
  {
    id: "1",
    content: "这篇文章写得真不错！对AI的理解很深入，特别是关于机器学习的部分。",
    author: {
      id: "user1",
      username: "AI爱好者",
      namespace: "ai_lover",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face"
    },
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    likesCount: 12,
    isLiked: false,
    replies: [
      {
        id: "1-1",
        content: "同感！作者的观点很有启发性。",
        author: {
          id: "user2",
          username: "技术小白",
          namespace: "tech_newbie",
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5b8?w=48&h=48&fit=crop&crop=face"
        },
        createdAt: Date.now() - 1 * 60 * 60 * 1000,
        likesCount: 3,
        isLiked: true
      }
    ]
  },
  {
    id: "2",
    content: "能否推荐一些相关的学习资源？我是初学者，想要深入了解这个领域。",
    author: {
      id: "user3",
      username: "学习者",
      namespace: "learner",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face"
    },
    createdAt: Date.now() - 4 * 60 * 60 * 1000,
    likesCount: 8,
    isLiked: false
  }
];

export const CommentSection: React.FC<CommentSectionProps> = ({
  articleId,
  className = ""
}) => {
  const { user } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    return "刚刚";
  };

  // Handle user click
  const handleUserClick = (namespace: string) => {
    navigate(`/user/${namespace}`);
  };

  // Handle comment like
  const handleCommentLike = (commentId: string) => {
    if (!user) {
      showToast('请先登录', 'error', {
        action: {
          label: '登录',
          onClick: () => navigate('/login')
        }
      });
      return;
    }

    setComments(prevComments =>
      prevComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likesCount: comment.isLiked ? comment.likesCount - 1 : comment.likesCount + 1
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  isLiked: !reply.isLiked,
                  likesCount: reply.isLiked ? reply.likesCount - 1 : reply.likesCount + 1
                };
              }
              return reply;
            })
          };
        }
        return comment;
      })
    );
  };

  // Handle submit comment
  const handleSubmitComment = async () => {
    if (!user) {
      showToast('请先登录', 'error', {
        action: {
          label: '登录',
          onClick: () => navigate('/login')
        }
      });
      return;
    }

    if (!newComment.trim()) {
      showToast('请输入评论内容');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment.trim(),
      author: {
        id: user.id,
        username: user.username,
        namespace: user.namespace,
        avatar: user.faceUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face"
      },
      createdAt: Date.now(),
      likesCount: 0,
      isLiked: false
    };

    setComments(prev => [comment, ...prev]);
    setNewComment("");
    setIsSubmitting(false);
    showToast('评论发布成功！');
  };

  // Handle submit reply
  const handleSubmitReply = async (parentId: string) => {
    if (!user) {
      showToast('请先登录', 'error', {
        action: {
          label: '登录',
          onClick: () => navigate('/login')
        }
      });
      return;
    }

    if (!replyContent.trim()) {
      showToast('请输入回复内容');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const reply: Comment = {
      id: `${parentId}-${Date.now()}`,
      content: replyContent.trim(),
      author: {
        id: user.id,
        username: user.username,
        namespace: user.namespace,
        avatar: user.faceUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face"
      },
      createdAt: Date.now(),
      likesCount: 0,
      isLiked: false
    };

    setComments(prev =>
      prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply]
          };
        }
        return comment;
      })
    );

    setReplyContent("");
    setReplyingTo(null);
    setIsSubmitting(false);
    showToast('回复发布成功！');
  };

  return (
    <div className={`bg-white rounded-[10px] border border-[#E5E5E5] p-5 ${className}`}>
      <div className="mb-6">
        <h3 className="text-[18px] font-bold text-[#333333] mb-4">
          评论 ({comments.length})
        </h3>

        {/* Comment Input */}
        <div className="flex gap-3">
          {user && (
            <img
              src={user.faceUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face"}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "写下你的想法..." : "请先登录后发表评论"}
              disabled={!user}
              rows={3}
              className="w-full border border-[#E5E5E5] rounded-[6px] p-3 text-sm focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-[#999999]">
                {newComment.length}/500
              </span>
              <button
                onClick={handleSubmitComment}
                disabled={!user || !newComment.trim() || isSubmitting}
                className="px-4 py-2 bg-[#1a73e8] text-white rounded-[6px] text-sm font-medium hover:bg-[#1557b0] transition-colors disabled:bg-[#E5E5E5] disabled:text-[#999999] disabled:cursor-not-allowed"
              >
                {isSubmitting ? '发布中...' : '发布评论'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b border-[#F0F0F0] pb-4 last:border-b-0 last:pb-0">
            {/* Comment */}
            <div className="flex gap-3">
              <img
                src={comment.author.avatar}
                alt={comment.author.username}
                className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleUserClick(comment.author.namespace)}
              />
              <div className="flex-1">
                <div className="bg-[#F8F9FA] rounded-[8px] p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="font-medium text-[#333333] text-sm cursor-pointer hover:text-[#1a73e8] transition-colors"
                      onClick={() => handleUserClick(comment.author.namespace)}
                    >
                      {comment.author.username}
                    </span>
                    <span className="text-xs text-[#999999]">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-[#666666] text-sm leading-relaxed">
                    {comment.content}
                  </p>
                </div>

                {/* Comment Actions */}
                <div className="flex items-center gap-4 mt-2 text-xs text-[#999999]">
                  <button
                    onClick={() => handleCommentLike(comment.id)}
                    className={`flex items-center gap-1 hover:text-[#1a73e8] transition-colors ${
                      comment.isLiked ? 'text-[#1a73e8]' : ''
                    }`}
                  >
                    <svg className="w-4 h-4" fill={comment.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {comment.likesCount}
                  </button>
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="hover:text-[#1a73e8] transition-colors"
                  >
                    回复
                  </button>
                </div>

                {/* Reply Input */}
                {replyingTo === comment.id && (
                  <div className="flex gap-3 mt-3">
                    {user && (
                      <img
                        src={user.faceUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face"}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="写下你的回复..."
                        rows={2}
                        className="w-full border border-[#E5E5E5] rounded-[6px] p-2 text-sm focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] resize-none"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent("");
                          }}
                          className="px-3 py-1 text-[#666666] text-sm hover:text-[#333333] transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={!replyContent.trim() || isSubmitting}
                          className="px-3 py-1 bg-[#1a73e8] text-white rounded-[6px] text-sm hover:bg-[#1557b0] transition-colors disabled:bg-[#E5E5E5] disabled:text-[#999999] disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? '回复中...' : '回复'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <img
                          src={reply.author.avatar}
                          alt={reply.author.username}
                          className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleUserClick(reply.author.namespace)}
                        />
                        <div className="flex-1">
                          <div className="bg-[#F0F0F0] rounded-[8px] p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className="font-medium text-[#333333] text-sm cursor-pointer hover:text-[#1a73e8] transition-colors"
                                onClick={() => handleUserClick(reply.author.namespace)}
                              >
                                {reply.author.username}
                              </span>
                              <span className="text-xs text-[#999999]">
                                {formatTimeAgo(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-[#666666] text-sm leading-relaxed">
                              {reply.content}
                            </p>
                          </div>

                          {/* Reply Actions */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-[#999999]">
                            <button
                              onClick={() => handleCommentLike(reply.id)}
                              className={`flex items-center gap-1 hover:text-[#1a73e8] transition-colors ${
                                reply.isLiked ? 'text-[#1a73e8]' : ''
                              }`}
                            >
                              <svg className="w-4 h-4" fill={reply.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {reply.likesCount}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-[#999999]">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>还没有评论，快来发表第一条评论吧！</p>
          </div>
        )}
      </div>
    </div>
  );
};