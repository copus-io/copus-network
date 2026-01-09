import React from 'react';

// Base skeleton component
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

// Article card skeleton - Match current homepage card design
export const ArticleCardSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-lg border-0 shadow-none transition-all duration-200 cursor-wait animate-pulse">
      <div className="flex flex-col gap-[20px] py-4 px-4 lg:px-5 flex-1">
        <div className="flex flex-col gap-5 flex-1">
          {/* Cover image skeleton - match discovery layout style */}
          <div
            className="flex flex-col w-full justify-between p-[15px] rounded-lg bg-gray-200 relative overflow-hidden"
            style={{ aspectRatio: '16 / 9' }}
          >
            {/* Shimmer animation */}
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

          <div className="flex flex-col gap-[15px] flex-1">
            {/* Title skeleton with x402 payment badge area */}
            <div className="relative min-h-[72px] overflow-hidden">
              {/* Optional payment badge skeleton */}
              <div className="float-left h-[36px] px-1.5 py-[8px] mr-[5px] mb-[5px] rounded-[50px] bg-gray-200 w-20 animate-pulse"></div>
              <div className="space-y-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-4/5" />
              </div>
            </div>

            {/* Description area skeleton - match the styled background */}
            <div className="flex flex-col gap-[15px] px-2.5 py-[15px] rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
              {/* Quote description skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-[27px] w-full" />
                <Skeleton className="h-[27px] w-5/6" />
              </div>

              {/* Author and date info skeleton */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-[18px] h-[18px] rounded-full" />
                  <Skeleton className="h-[22.4px] w-20" />
                </div>
                <Skeleton className="h-[23px] w-16" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats and action area */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-[15px]">
            {/* Treasure count skeleton */}
            <div className="inline-flex items-center gap-2">
              <div className="w-[13px] h-5 bg-gray-300 rounded animate-pulse"></div>
              <Skeleton className="h-[20.8px] w-8" />
            </div>

            {/* Visit count skeleton */}
            <div className="inline-flex items-center gap-2">
              <div className="w-5 h-3.5 bg-gray-300 rounded animate-pulse"></div>
              <Skeleton className="h-[20.8px] w-16" />
            </div>
          </div>

          {/* Share button skeleton */}
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Article list skeleton - Match current homepage responsive grid layout
export const ArticleListSkeleton: React.FC = () => {
  // Create 8 skeleton cards to better fill the screen on larger displays
  const skeletonCards = Array.from({ length: 8 }).map((_, index) => (
    <ArticleCardSkeleton key={index} />
  ));

  return (
    <section className="w-full pt-0 pb-[30px] min-h-screen px-2.5 lg:pl-2.5 lg:pr-0 grid grid-cols-1 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 lg:gap-8">
      {skeletonCards}
    </section>
  );
};