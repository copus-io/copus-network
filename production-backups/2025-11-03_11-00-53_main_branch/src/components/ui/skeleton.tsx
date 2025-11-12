import React from 'react';

// 基础骨架屏组件
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded ${className}`}
    />
  );
};

// 文章详情页骨架屏
export const ContentPageSkeleton: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      {/* Header placeholder */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4">
        <Skeleton className="h-8 w-32" />
        <div className="ml-auto flex space-x-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back button skeleton */}
        <Skeleton className="h-10 w-20 mb-6" />

        {/* Main content skeleton */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Cover image skeleton */}
          <Skeleton className="w-full h-64 md:h-80" />

          <div className="p-6">
            {/* Category badge */}
            <Skeleton className="h-6 w-20 rounded-full mb-4" />

            {/* Title skeleton */}
            <div className="mb-4">
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-8 w-3/4" />
            </div>

            {/* Description skeleton */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-5/6 mb-2" />
              <Skeleton className="h-6 w-4/5" />
            </div>

            {/* Author and meta info skeleton */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-20" />
            </div>

            {/* Action buttons skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-16" />
              </div>
              <Skeleton className="h-12 w-24 rounded-full" />
            </div>

            {/* Website info skeleton */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 文章卡片骨架屏 - 模仿首页卡片设计
export const ArticleCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border-0 shadow-none transition-all duration-200 cursor-wait animate-pulse">
      <div className="flex flex-col gap-[25px] p-[30px]">
        <div className="flex flex-col gap-5">
          {/* 封面图片骨架屏 - 模仿真实卡片的背景图样式 */}
          <div className="flex flex-col h-60 justify-between p-[15px] rounded-lg bg-gray-200 relative overflow-hidden">
            {/* 闪烁动画 */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>

            {/* Category badge skeleton */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-[5px] px-2.5 py-2 rounded-[50px] border border-solid border-gray-300 bg-white/80 w-fit">
                <Skeleton className="h-[14px] w-16" />
              </div>
            </div>

            {/* Website tag skeleton */}
            <div className="flex justify-end relative z-10">
              <div className="inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-[#ffffffcc] rounded-[15px] overflow-hidden">
                <Skeleton className="h-[18px] w-20" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[15px]">
            {/* Title skeleton - 模仿真实标题的字体大小 */}
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-4/5" />
            </div>

            {/* 描述区域骨架屏 - 模仿带背景的描述框 */}
            <div className="flex flex-col gap-[15px] px-2.5 py-[15px] rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
              {/* 引用描述 */}
              <div className="space-y-2">
                <Skeleton className="h-[27px] w-full" />
                <Skeleton className="h-[27px] w-5/6" />
                <Skeleton className="h-[27px] w-3/4" />
              </div>

              {/* 作者和日期信息 */}
              <div className="flex items-start justify-between">
                <div className="inline-flex items-center gap-2.5">
                  <Skeleton className="w-[18px] h-[18px] rounded-full" />
                  <Skeleton className="h-[22.4px] w-20" />
                </div>
                <div className="inline-flex h-[25px] items-center">
                  <Skeleton className="h-[23px] w-16" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部统计和操作区域 */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-[15px]">
            {/* 宝箱统计 */}
            <div className="inline-flex items-center gap-2">
              <div className="w-[13px] h-5 bg-gray-300 rounded animate-pulse"></div>
              <Skeleton className="h-[20.8px] w-8" />
            </div>

            {/* 访问统计 */}
            <div className="inline-flex items-center gap-2">
              <div className="w-5 h-3.5 bg-gray-300 rounded animate-pulse"></div>
              <Skeleton className="h-[20.8px] w-16" />
            </div>
          </div>

          {/* 分享按钮 */}
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 文章列表骨架屏 - 模仿首页的两列布局
export const ArticleListSkeleton: React.FC = () => {
  // 创建6个骨架屏卡片，分为两列显示
  const skeletonCards = Array.from({ length: 6 }).map((_, index) => (
    <ArticleCardSkeleton key={index} />
  ));

  // 分为左右两列
  const leftColumnCards = skeletonCards.filter((_, index) => index % 2 === 0);
  const rightColumnCards = skeletonCards.filter((_, index) => index % 2 === 1);

  return (
    <section className="flex items-start gap-[60px] pt-5 pb-[30px] min-h-screen px-5">
      {/* 左列 */}
      <div className="flex flex-col gap-10 pt-0 pb-5 flex-1 rounded-[0px_0px_25px_25px]">
        {leftColumnCards}
      </div>

      {/* 右列 */}
      <div className="flex flex-col gap-10 pt-0 pb-5 flex-1 rounded-[0px_0px_25px_25px]">
        {rightColumnCards}
      </div>
    </section>
  );
};