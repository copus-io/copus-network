// 回复评论弹窗组件

import React, { useRef, useEffect } from 'react';
import { Comment } from '../../types/comment';
import { CommentForm, CommentFormRef } from './CommentForm';

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetComment: Comment | null; // 被回复的评论
  targetType: 'article' | 'treasury' | 'user' | 'space';
  targetId: string;
  articleId?: string;
  replyState?: {
    isReplying: boolean;
    parentId?: string;
    replyToId?: string;
    replyToUser?: string;
  };
  onReplyComplete?: () => void;
}

export const ReplyModal: React.FC<ReplyModalProps> = ({
  isOpen,
  onClose,
  targetComment,
  targetType,
  targetId,
  articleId,
  replyState,
  onReplyComplete
}) => {
  const commentFormRef = useRef<CommentFormRef>(null);

  // 自动聚焦到输入框
  useEffect(() => {
    if (isOpen && commentFormRef.current) {
      setTimeout(() => {
        const textarea = document.querySelector('.reply-modal textarea') as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
        }
      }, 300); // 等待动画完成
    }
  }, [isOpen]);

  // 格式化时间
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleReplyComplete = () => {
    onReplyComplete?.();
    onClose();
  };

  if (!isOpen || !targetComment) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative w-full max-w-2xl transform transition-all duration-300 scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗主体 */}
            <div
              className="rounded-2xl shadow-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.95) 100%)',
                backdropFilter: 'blur(20px) brightness(1.08) saturate(1.1) contrast(1.02)',
                WebkitBackdropFilter: 'blur(20px) brightness(1.08) saturate(1.1) contrast(1.02)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: `
                  0 25px 50px rgba(0, 0, 0, 0.15),
                  0 10px 30px rgba(0, 0, 0, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.9),
                  inset 0 0 30px rgba(255, 255, 255, 0.3)
                `,
              }}
            >
              {/* 弹窗头部 */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 [font-family:'Lato',Helvetica]">
                    Reply to comment
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Quoted comment */}
              <div className="px-6 py-4">
                <div className="flex gap-3">
                  {/* 头像 */}
                  <img
                    src={targetComment.authorAvatar || "data:image/svg+xml,%3csvg%20width='100'%20height='100'%20viewBox='0%200%20100%20100'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='100'%20height='100'%20rx='50'%20fill='white'/%3e%3crect%20width='100'%20height='100'%20rx='50'%20fill='%23E0E0E0'%20fill-opacity='0.4'/%3e%3cpath%20d='M73.9643%2060.6618V60.9375C73.9643%2074.2269%2063.2351%2085%2050%2085C36.7649%2085%2026.0357%2074.2269%2026.0357%2060.9375V60.6618C22.2772%2059.6905%2019.5%2056.2646%2019.5%2052.1875C19.5%2048.1104%2022.2772%2044.6845%2026.0357%2043.7132V39.0625C26.0357%2025.7731%2036.7649%2015%2050%2015C63.2351%2015%2073.9643%2025.7731%2073.9643%2039.0625V43.7132C77.7228%2044.6845%2080.5%2048.1104%2080.5%2052.1875C80.5%2056.2646%2077.7228%2059.6905%2073.9643%2060.6618ZM69.6071%2043.4375H67.2192C62.2208%2043.4375%2057.8638%2040.0217%2056.6515%2035.1527L56.5357%2034.6875L48.85%2038.5461C43.0934%2041.4362%2036.8058%2043.0815%2030.3929%2043.3858V60.9375C30.3929%2071.8106%2039.1713%2080.625%2050%2080.625C60.8287%2080.625%2069.6071%2071.8106%2069.6071%2060.9375V43.4375ZM39.1071%2050C39.1071%2048.7919%2040.0825%2047.8125%2041.2857%2047.8125C42.4889%2047.8125%2043.4643%2048.7919%2043.4643%2050V54.375C43.4643%2055.5831%2042.4889%2056.5625%2041.2857%2056.5625C40.0825%2056.5625%2039.1071%2055.5831%2039.1071%2054.375V50ZM56.5357%2050C56.5357%2048.7919%2057.5111%2047.8125%2058.7143%2047.8125C59.9175%2047.8125%2060.8929%2048.7919%2060.8929%2050V54.375C60.8929%2055.5831%2059.9175%2056.5625%2058.7143%2056.5625C57.5111%2056.5625%2056.5357%2055.5831%2056.5357%2054.375V50ZM41.9964%2071.3039C41.1073%2070.4899%2041.0438%2069.1064%2041.8544%2068.2136C42.6651%2067.3209%2044.0431%2067.2571%2044.9321%2068.0711C46.0649%2069.1081%2047.4581%2069.6875%2048.8886%2069.6875C50.3722%2069.6875%2051.7728%2069.1187%2052.8779%2068.0924C53.7612%2067.2721%2055.1396%2067.3261%2055.9565%2068.2131C56.7735%2069.1%2056.7197%2070.484%2055.8364%2071.3043C53.9384%2073.0668%2051.4869%2074.0625%2048.8886%2074.0625C46.3342%2074.0625%2043.907%2073.0532%2041.9964%2071.3039ZM23.8571%2052.1875C23.8571%2053.8069%2024.7334%2055.2207%2026.0357%2055.9772V48.3978C24.7334%2049.1543%2023.8571%2050.5681%2023.8571%2052.1875ZM76.1429%2052.1875C76.1429%2050.5681%2075.2666%2049.1543%2073.9643%2048.3978V55.9772C75.2666%2055.2207%2076.1429%2053.8069%2076.1429%2052.1875Z'%20fill='black'/%3e%3c/svg%3e"}
                    alt={targetComment.authorName}
                    className="w-8 h-8 rounded-full object-cover"
                  />

                  <div className="flex-1">
                    {/* 用户信息 */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-blue-900 text-sm [font-family:'Lato',Helvetica]">
                        {targetComment.authorName}
                      </span>
                      <span className="text-xs text-blue-600 [font-family:'Lato',Helvetica]">
                        {formatTimeAgo(targetComment.createdAt)}
                      </span>
                    </div>

                    {/* 评论内容 */}
                    <div className="text-blue-800 text-sm leading-relaxed [font-family:'Lato',Helvetica] font-light">
                      {targetComment.content === 'Reply comment' ? (
                        <span className="italic text-gray-500">Replying to @{targetComment.authorName}</span>
                      ) : (
                        targetComment.content.split('\n').map((line, index) => (
                          <React.Fragment key={index}>
                            {line}
                            {index < targetComment.content.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        ))
                      )}
                    </div>

                    {/* 图片预览 */}
                    {targetComment.images && targetComment.images.length > 0 && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {targetComment.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt="Comment image"
                            className="w-12 h-12 object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 回复输入区域 */}
              <div className="px-6 py-6 reply-modal">
                <CommentForm
                  ref={commentFormRef}
                  targetType={targetType}
                  targetId={targetId}
                  articleId={articleId}
                  replyState={replyState}
                  onReplyComplete={handleReplyComplete}
                  placeholder={`Replying to ${targetComment.authorName}...`}
                  hideReplyCancel={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};