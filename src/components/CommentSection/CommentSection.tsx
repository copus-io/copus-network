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
      content: 'This article is really well-written! I especially learned a lot from the technical implementation section. Hope the author can share more technical articles like this.',
      targetType: targetType as 'article',
      targetId: targetId,
      authorId: 1,
      authorName: 'TechEnthusiast',
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
      content: 'I agree with the point above, the author\'s technical depth is impressive. I\'d like to ask, how does the solution mentioned in the article perform in a production environment?',
      targetType: targetType as 'article',
      targetId: targetId,
      authorId: 2,
      authorName: 'CodePrince',
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
      content: '@CodePrince Based on our team\'s practical experience, the performance is quite good. I suggest you could try it in a test environment first.',
      targetType: targetType as 'article',
      targetId: targetId,
      authorId: 1,
      authorName: 'TechEnthusiast',
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
      content: 'Thanks for sharing! I\'m working on a similar project, and this approach has given me a lot of inspiration. 👍',
      targetType: targetType as 'article',
      targetId: targetId,
      authorId: 3,
      authorName: 'ProductManagerAlice',
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
    <div className={`w-full overflow-hidden min-h-[600px] ${className}`}>
      {/* Comment header with stats and sort options */}
      <div className="px-0 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="[font-family:'Lato',Helvetica] font-[450] text-[#231f20] text-2xl">
                Comments
              </span>
              <span className="[font-family:'Lato',Helvetica] text-base text-dark-grey">
                {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as CommentSortBy)}
              className="pl-4 pr-10 py-2 border border-[#D3D3D3] rounded-full text-sm text-dark-grey bg-white transition-all [font-family:'Lato',Helvetica] hover:border-medium-grey appearance-none cursor-pointer"
              style={{
                outline: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23686868' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center'
              }}
            >
              <option value="newest">Newest</option>
              <option value="likes">Most liked</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-0 pt-4 pb-0">
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