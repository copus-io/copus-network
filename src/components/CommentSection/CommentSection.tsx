// Main comment section component - NetEase Cloud Music style

import React, { useState, useEffect } from 'react';
import { useComments } from '../../hooks/queries/useComments';
import { CommentSortBy } from '../../types/comment';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { CommentSkeleton } from './CommentSkeleton';
import { useUser } from '../../contexts/UserContext';

interface CommentSectionProps {
  targetType: 'article' | 'treasury' | 'user' | 'space';
  targetId: string;
  className?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  targetType,
  targetId,
  className = ''
}) => {
  const [sortBy, setSortBy] = useState<CommentSortBy>('newest');
  const [showPrototypeComments, setShowPrototypeComments] = useState(false);

  const { user } = useUser();
  const { data: commentsData, isLoading, error } = useComments(targetType, targetId, {
    sortBy,
    limit: 20
  });

  // If user is logged in, automatically show prototype comments
  useEffect(() => {
    if (user) {
      setShowPrototypeComments(true);
    }
  }, [user]);

  // Mock data for prototype
  const mockComments = [
    {
      id: '1',
      uuid: '1',
      content: '这篇文章写得真不错！特别是关于技术实现的部分，让我学到了很多。希望作者能多写一些这样的技术分享文章。',
      targetType: targetType as 'article',
      targetId: targetId,
      authorId: 1,
      authorName: '技术爱好者',
      parentId: undefined,
      depth: 0,
      likesCount: 12,
      repliesCount: 2,
      isLiked: false,
      createdAt: '2024-12-16T10:30:00Z',
      canEdit: false,
      canDelete: false
    },
    {
      id: '2',
      uuid: '2',
      content: '同意楼上的观点，作者的技术深度确实很不错。我想问一下，文章中提到的解决方案在生产环境中的性能表现如何？',
      targetType: targetType as 'article',
      targetId: targetId,
      authorId: 2,
      authorName: '代码小王子',
      parentId: '1',
      depth: 1,
      likesCount: 5,
      repliesCount: 0,
      isLiked: true,
      createdAt: '2024-12-16T11:15:00Z',
      canEdit: true,
      canDelete: true
    },
    {
      id: '3',
      uuid: '3',
      content: '@代码小王子 根据我们团队的实际使用经验，性能表现还是很不错的，建议你可以先在测试环境跑跑看。',
      targetType: targetType as 'article',
      targetId: targetId,
      authorId: 1,
      authorName: '技术爱好者',
      parentId: '1',
      depth: 1,
      likesCount: 8,
      repliesCount: 0,
      isLiked: false,
      createdAt: '2024-12-16T12:45:00Z',
      canEdit: false,
      canDelete: false
    },
    {
      id: '4',
      uuid: '4',
      content: '感谢分享！我正好在做类似的项目，这个方案给了我很多启发。👍',
      targetType: targetType as 'article',
      targetId: targetId,
      authorId: 3,
      authorName: '产品经理Alice',
      parentId: undefined,
      depth: 0,
      likesCount: 3,
      repliesCount: 0,
      isLiked: false,
      createdAt: '2024-12-16T14:20:00Z',
      canEdit: false,
      canDelete: false
    }
  ];

  const mockCommentsData = {
    comments: mockComments,
    totalCount: 4,
    hasMore: false
  };

  const displayCommentsData = showPrototypeComments ? mockCommentsData : commentsData;
  const totalComments = displayCommentsData?.totalCount || 0;


  return (
    <div className={`w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[600px] ${className}`}>
      {/* Comment header with stats and sort options */}
      <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 text-xl">
                评论讨论
              </span>
              <span className="text-sm text-gray-600">
                共 {totalComments} 条评论
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as CommentSortBy)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="newest">最新评论</option>
              <option value="likes">最热评论</option>
              <option value="oldest">最早评论</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Comment form */}
        <CommentForm
          targetType={targetType}
          targetId={targetId}
          onLoadComments={() => {
            setShowPrototypeComments(!showPrototypeComments);
          }}
          showingPrototypeComments={showPrototypeComments}
        />

        {/* Comment list */}
        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 3 }, (_, i) => (
                <CommentSkeleton key={i} />
              ))}
            </div>
          ) : (
            <CommentList
              comments={displayCommentsData?.comments || []}
              targetType={targetType}
              targetId={targetId}
              hasMore={displayCommentsData?.hasMore || false}
              totalCount={totalComments}
            />
          )}
        </div>
      </div>
    </div>
  );
};