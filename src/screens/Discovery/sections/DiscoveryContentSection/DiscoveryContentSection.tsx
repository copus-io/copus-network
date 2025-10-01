import React from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent } from "../../../../components/ui/card";
import { useArticles } from "../../../../hooks/useArticles";
import { Article } from "../../../../types/article";
import { getCategoryStyle, formatCount, formatDate } from "../../../../utils/categoryStyles";
import { ArticleListSkeleton } from "../../../../components/ui/skeleton";
import { AuthService } from "../../../../services/authService";
import { useToast } from "../../../../components/ui/toast";
import { useUser } from "../../../../contexts/UserContext";

export const DiscoveryContentSection = (): JSX.Element => {
  const { showToast } = useToast();
  const { user, getArticleLikeState, updateArticleLikeState, toggleLike } = useUser();
  const [localArticles, setLocalArticles] = React.useState<Article[]>([]);

  // 设置测试token以确保API认证 - 临时禁用过期token
  // React.useEffect(() => {
  //   const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYjE1MzM2NDUtYzZjOC00MmJkLTgwOTQtM2QzYjI4N2VkOWNkIiwidXNlcl90eXBlIjoidXNlciIsInVzZXJfbmFtZSI6IjE2MTEwMTEwNjE1IiwiYWNjb3VudF90eXBlIjoidGVzdCIsImV4cCI6MTcyNzY4MTc5OSwidXNlcl9yb2xlIjoidXNlciIsImlhdCI6MTcyNzU5NTM5OSwidWlkIjoiYjE1MzM2NDUtYzZjOC00MmJkLTgwOTQtM2QzYjI4N2VkOWNkIn0.QkqDnbMaXFgaZhKc0CIFNZNLfqLnGqO2XZyNKiEtXOU';
  //   localStorage.setItem('copus_token', testToken);
  //   console.log('🔐 Set test token for API authentication');
  // }, []);

  // 引导栏显示状态管理
  const [showWelcomeGuide, setShowWelcomeGuide] = React.useState(false);

  // 检查今天是否第一次访问
  React.useEffect(() => {
    const today = new Date().toDateString();
    const lastVisitDate = localStorage.getItem('copus_last_guide_shown');

    if (lastVisitDate !== today) {
      setShowWelcomeGuide(true);
      console.log('😊 显示今日首次欢迎引导栏');
    }
  }, []);

  // 关闭引导栏
  const handleCloseWelcomeGuide = () => {
    const today = new Date().toDateString();
    localStorage.setItem('copus_last_guide_shown', today);
    setShowWelcomeGuide(false);
    console.log('👋 引导栏已关闭，今日不再显示');
  };

  const { articles, loading, error, refresh } = useArticles();

  // 同步本地文章状态
  React.useEffect(() => {
    setLocalArticles(articles);
  }, [articles]);

  // 将文章分为两列显示
  const leftColumnPosts = localArticles.filter((_, index) => index % 2 === 0);
  const rightColumnPosts = localArticles.filter((_, index) => index % 2 === 1);

  const renderPostCard = (post: Article, index: number) => {
    const categoryStyle = getCategoryStyle(post.category);

    // 从全局状态获取最新的点赞信息
    const articleLikeState = getArticleLikeState(post.id, post.isLiked, post.treasureCount);
    const currentIsLiked = articleLikeState.isLiked;
    const currentLikeCount = articleLikeState.likeCount;

    // 点赞处理函数 - 使用全局状态管理
    const handleLikeClick = async (e: React.MouseEvent, articleId: string) => {
      e.preventDefault(); // 阻止Link跳转
      e.stopPropagation(); // 阻止事件冒泡

      if (!user) {
        showToast('请先登录', 'error');
        return;
      }

      // 使用全局toggleLike函数，包含乐观更新和API调用
      const result = await toggleLike(
        articleId,
        currentIsLiked,
        currentLikeCount,
        // 本地乐观更新回调（可选，因为全局状态已经处理了）
        (isLiked: boolean, likeCount: number) => {
          setLocalArticles(prev => prev.map(article =>
            article.id === articleId
              ? { ...article, isLiked, treasureCount: likeCount }
              : article
          ));
        }
      );

      console.log('🔄 点赞操作结果:', result);
    };

    // 图片URL验证和fallback
    const getValidImageUrl = (imageUrl: string | undefined): string => {
      if (!imageUrl || imageUrl.trim() === '') {
        console.warn('Empty or undefined coverImage for post:', post.id, post.title);
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
      }

      // 检查是否是blob URL（来自文件上传）- 这些URL在新会话中不会工作
      if (imageUrl.startsWith('blob:')) {
        console.warn('Blob URL detected (will fail in new session):', imageUrl);
        // 返回占位符，因为blob URL在刷新页面后无效
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5VcGxvYWRlZCBJbWFnZTwvdGV4dD48L3N2Zz4=';
      }

      // 检查是否是有效的HTTP/HTTPS URL
      try {
        const url = new URL(imageUrl);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          return imageUrl;
        } else {
          console.warn('Non-HTTP URL for post:', post.id, imageUrl);
          return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbnZhbGlkIFVSTDwvdGV4dD48L3N2Zz4=';
        }
      } catch (error) {
        console.warn('Invalid coverImage URL for post:', post.id, imageUrl);
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbnZhbGlkIFVSTDwvdGV4dD48L3N2Zz4=';
      }
    };

    const validImageUrl = getValidImageUrl(post.coverImage);
    console.log('🖼️ Post image processing:', {
      id: post.id,
      title: post.title,
      originalCoverImage: post.coverImage,
      validImageUrl,
      isEmpty: !post.coverImage || post.coverImage.trim() === '',
      isBlob: post.coverImage?.startsWith('blob:'),
      hasValidUrl: post.coverImage && (post.coverImage.startsWith('http://') || post.coverImage.startsWith('https://'))
    });

    return (
      <Link key={post.id} to={`/content/${post.id}`}>
        <Card className="bg-white rounded-lg border-0 shadow-none hover:shadow-[1px_1px_10px_#c5c5c5] hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-all duration-200 cursor-pointer group">
          <CardContent className="flex flex-col gap-[25px] p-[30px]">
            <div className="flex flex-col gap-5">
              <div className="relative h-60 rounded-lg overflow-hidden bg-gray-200">
                {/* 使用img标签替代backgroundImage，以便更好地处理错误 */}
                <img
                  src={validImageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.error('Image failed to load:', validImageUrl);
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2FkIEZhaWxlZDwvdGV4dD48L3N2Zz4=';
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', validImageUrl);
                  }}
                />

                {/* 覆盖内容 */}
                <div className="absolute inset-0 flex flex-col justify-between p-[15px]">
                  <Badge
                    variant="outline"
                    className={`inline-flex items-center gap-[5px] px-2.5 py-2 rounded-[50px] border border-solid ${categoryStyle.border} ${categoryStyle.bg} w-fit`}
                  >
                    <span
                      className={`[font-family:'Lato',Helvetica] font-semibold text-sm tracking-[0] leading-[14px] ${categoryStyle.text}`}
                    >
                      {post.category}
                    </span>
                  </Badge>

                  <div className="flex justify-end">
                    <div className="inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-[#ffffffcc] rounded-[15px] overflow-hidden">
                      <span className="[font-family:'Lato',Helvetica] font-bold text-blue text-sm text-right tracking-[0] leading-[18.2px]">
                        {post.website}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-[15px]">
                <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-9">
                  {post.title}
                </h3>

                <div className="flex flex-col gap-[15px] px-2.5 py-[15px] rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] group-hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.45)_0%,rgba(224,224,224,0.45)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-colors">
                  <p className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[27px]">
                    &quot;{post.description}&quot;
                  </p>

                  <div className="flex items-start justify-between">
                    <div className="inline-flex items-center gap-2.5">
                      <Avatar className="w-[18px] h-[18px]">
                        <AvatarImage src={post.userAvatar} alt="Profile image" className="object-cover" />
                        <AvatarFallback>UN</AvatarFallback>
                      </Avatar>
                      <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px]">
                        {post.userName}
                      </span>
                    </div>

                    <div className="inline-flex h-[25px] items-center">
                      <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px]">
                        {formatDate(post.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-[15px]">
                {/* 可点击的宝石按钮 */}
                <button
                  className="inline-flex items-center gap-2 hover:bg-gray-100 rounded-lg p-1 transition-all duration-200 group/like z-10 relative"
                  onClick={(e) => handleLikeClick(e, post.id)}
                  aria-label={`${currentIsLiked ? '取消点赞' : '点赞'} ${post.title}`}
                  title={currentIsLiked ? '取消点赞' : '点赞这篇文章'}
                >
                  <div className="relative">
                    {/* 黄色填充背景层 */}
                    {currentIsLiked && (
                      <div
                        className="absolute inset-0 w-[13px] h-5 transition-all duration-200"
                        style={{
                          background: '#E19F1D',
                          clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                          transform: 'scale(0.8)'
                        }}
                      />
                    )}
                    <img
                      className={`w-[13px] h-5 transition-all duration-200 group-hover/like:scale-110 relative z-10 ${
                        currentIsLiked
                          ? 'brightness-110 drop-shadow-sm transform scale-110'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                      alt="Treasure icon"
                      src="https://c.animaapp.com/mft5gmofxQLTNf/img/treasure-icon.svg"
                    />
                  </div>
                  <span className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-base text-center tracking-[0] leading-[20.8px]">
                    {formatCount(currentLikeCount)}
                  </span>
                </button>

                <div className="inline-flex items-center gap-2">
                  <img
                    className="w-5 h-3.5"
                    alt="Ic view"
                    src="https://c.animaapp.com/mft5gmofxQLTNf/img/ic-view.svg"
                  />
                  <span className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-base text-center tracking-[0] leading-[20.8px]">
                    {formatCount(post.visitCount)} Visits
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  // Loading state
  if (loading && articles.length === 0) {
    return (
      <section className="px-5">
        <ArticleListSkeleton />
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="flex items-center justify-center min-h-screen px-5">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading articles: {error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // Empty state
  if (articles.length === 0) {
    return (
      <section className="flex items-center justify-center min-h-screen px-5">
        <div className="text-center">
          <p className="text-gray-500">No articles found.</p>
        </div>
      </section>
    );
  }

  return (
    <main className="flex flex-col items-start gap-10 px-5 py-0 relative flex-1">
      {/* Welcome Guide Bar - 只在每日首次访问时显示 */}
      {showWelcomeGuide && (
        <section className="pl-[30px] pr-4 py-[30px] rounded-[0px_8px_8px_0px] border-l-[3px] [border-left-style:solid] border-red shadow-[1px_1px_10px_#c5c5c5] bg-[linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] flex items-start gap-[15px] relative w-full">
          {/* 关闭按钮 */}
          <button
            onClick={handleCloseWelcomeGuide}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 group z-20"
            aria-label="关闭欢迎引导"
          >
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="inline-flex flex-col items-start gap-[15px] relative flex-[0_0_auto]">
            <h1 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-9 whitespace-nowrap">
              Welcome to Copus
            </h1>

            <div className="w-[736px] h-[120px] flex flex-col items-start gap-3">
              <p className="text-dark-grey text-lg leading-[27px] relative self-stretch [font-family:'Lato',Helvetica] font-normal tracking-[0]">
                <span className="[font-family:'Lato',Helvetica] font-normal text-[#454545] text-lg tracking-[0] leading-[27px]">
                  Discover high-quality content recommended by real users. Here,
                  there are no algorithmic recommendations, only knowledge sharing
                  between people.
                </span>
              </p>

              <p className="text-dark-grey text-lg leading-[27px] relative self-stretch [font-family:'Lato',Helvetica] font-normal tracking-[0]">
                <span className="[font-family:'Lato',Helvetica] font-normal text-[#454545] text-lg tracking-[0] leading-[27px]">
                  Start exploring content that interests you, or click the +
                  button in the lower right corner to share your treasured finds.
                </span>
              </p>
            </div>
          </div>

          <div className="absolute bottom-2 right-2 w-[180px] h-[180px] z-10">
            <img
              className="w-full h-full object-contain object-right-bottom"
              alt="Red Octopus"
              src="https://c.animaapp.com/1aPszOHA/img/mask-group.png"
            />
          </div>
        </section>
      )}

      {/* Content Cards Section */}
      <section className="flex items-start gap-[60px] pt-0 pb-[30px] min-h-screen w-full">
        <div className="flex flex-col gap-10 pt-0 pb-5 flex-1 rounded-[0px_0px_25px_25px]">
          {leftColumnPosts.map((post, index) => renderPostCard(post, index))}
        </div>

        <div className="flex flex-col gap-10 pt-0 pb-5 flex-1 rounded-[0px_0px_25px_25px]">
          {rightColumnPosts.map((post, index) => renderPostCard(post, index))}
        </div>
      </section>
    </main>
  );
};