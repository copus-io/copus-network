import React from "react";
import { useNavigate } from "react-router-dom";
import { useArticles } from "../../../../hooks/queries";
import { Article } from "../../../../types/article";
import { ArticleListSkeleton } from "../../../../components/ui/skeleton";
import { useToast } from "../../../../components/ui/toast";
import { useUser } from "../../../../contexts/UserContext";
import { ArticleCard, ArticleData } from "../../../../components/ArticleCard";
import { getCategoryStyle, getCategoryInlineStyle, formatDate, formatCount } from "../../../../utils/categoryStyles";

export const DiscoveryContentSection = (): JSX.Element => {
  const { showToast } = useToast();
  const { user, getArticleLikeState, updateArticleLikeState, toggleLike, syncArticleStates } = useUser();
  const [localArticles, setLocalArticles] = React.useState<Article[]>([]);
  const navigate = useNavigate();

  // 设置测试token以确保API认证 - 临时禁用过期token
  // React.useEffect(() => {
  //   const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYjE1MzM2NDUtYzZjOC00MmJkLTgwOTQtM2QzYjI4N2VkOWNkIiwidXNlcl90eXBlIjoidXNlciIsInVzZXJfbmFtZSI6IjE2MTEwMTEwNjE1IiwiYWNjb3VudF90eXBlIjoidGVzdCIsImV4cCI6MTcyNzY4MTc5OSwidXNlcl9yb2xlIjoidXNlciIsImlhdCI6MTcyNzU5NTM5OSwidWlkIjoiYjE1MzM2NDUtYzZjOC00MmJkLTgwOTQtM2QzYjI4N2VkOWNkIn0.QkqDnbMaXFgaZhKc0CIFNZNLfqLnGqO2XZyNKiEtXOU';
  //   localStorage.setItem('copus_token', testToken);
  //     // }, []);

  // 引导栏显示状态管理
  const [showWelcomeGuide, setShowWelcomeGuide] = React.useState(false);

  // 检查今天是否第一次访问（根据登录状态）
  React.useEffect(() => {
    const today = new Date().toDateString();
    // 为登录和未登录用户使用不同的存储键
    const storageKey = user ? `copus_last_guide_shown_${user.id}` : 'copus_last_guide_shown_guest';
    const lastVisitDate = localStorage.getItem(storageKey);

    if (lastVisitDate !== today) {
      setShowWelcomeGuide(true);
      const userType = user ? '登录用户' : '访客';
    }
  }, [user]); // 依赖于用户状态

  // 关闭引导栏
  const handleCloseWelcomeGuide = () => {
    const today = new Date().toDateString();
    // 为登录和未登录用户使用不同的存储键
    const storageKey = user ? `copus_last_guide_shown_${user.id}` : 'copus_last_guide_shown_guest';
    localStorage.setItem(storageKey, today);
    setShowWelcomeGuide(false);
    const userType = user ? '登录用户' : '访客';
  };

  const { articles, loading, error, refresh } = useArticles();

  // 根据用户登录状态渲染不同的引导内容
  const renderGuideContent = () => {
    if (user) {
      // 已登录用户：功能性引导
      return (
        <>
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
        </>
      );
    } else {
      // 未登录用户：平台介绍（使用英文，保持相同样式）
      return (
        <>
          <h1 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-9 whitespace-nowrap">
            Welcome to Copus
          </h1>
          <div className="w-[736px] h-[120px] flex flex-col items-start gap-3">
            <p className="text-dark-grey text-lg leading-[27px] relative self-stretch [font-family:'Lato',Helvetica] font-normal tracking-[0]">
              <span className="[font-family:'Lato',Helvetica] font-normal text-[#454545] text-lg tracking-[0] leading-[27px]">
                Discover a new way to share and explore knowledge. Copus is a community-driven platform where real people curate and share high-quality content they find valuable.
              </span>
            </p>
            <p className="text-dark-grey text-lg leading-[27px] relative self-stretch [font-family:'Lato',Helvetica] font-normal tracking-[0]">
              <span className="[font-family:'Lato',Helvetica] font-normal text-[#454545] text-lg tracking-[0] leading-[27px]">
                <strong>Human-curated content</strong> with no algorithms, just genuine recommendations from our community.
                <button
                  onClick={() => navigate('/login')}
                  className="inline-block ml-1 font-semibold text-red hover:text-red/80 transition-colors underline cursor-pointer"
                >
                  Join us
                </button> to build your personal treasure trove of discoveries.
              </span>
            </p>
          </div>
        </>
      );
    }
  };

  // 同步本地文章状态和点赞状态
  React.useEffect(() => {
    setLocalArticles(articles);

    // 同步点赞状态到localStorage
    if (articles.length > 0) {
      const articlesForSync = articles.map(article => ({
        id: article.id,
        uuid: article.id,
        isLiked: article.isLiked, // 使用服务器返回的真实点赞状态
        likeCount: article.treasureCount || 0
      }));
      syncArticleStates(articlesForSync);
    }
  }, [articles, syncArticleStates]);

  // 转换文章数据格式
  const transformArticleToCardData = (article: Article): ArticleData => {
    return {
      id: article.id,
      uuid: article.id, // 使用id作为uuid
      title: article.title,
      description: article.description,
      coverImage: article.coverImage,
      category: article.category,
      categoryColor: article.categoryColor,
      userName: article.userName,
      userAvatar: article.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.userName}&backgroundColor=b6e3f4`,
      userId: article.userId,
      namespace: article.namespace, // 添加namespace字段
      date: article.date,
      treasureCount: article.treasureCount,
      visitCount: `${article.visitCount || 0} Visits`,
      isLiked: article.isLiked, // 使用服务器返回的真实点赞状态
      targetUrl: article.url,
      website: article.website
    };
  };

  // 处理点赞
  const handleLike = async (articleId: string, currentIsLiked: boolean, currentLikeCount: number) => {
    if (!user) {
      showToast('Please log in to treasure this content', 'error', {
        action: {
          label: 'Login',
          onClick: () => navigate('/login')
        }
      });
      return;
    }

    await toggleLike(articleId, currentIsLiked, currentLikeCount);
  };

  // 处理用户点击
  const handleUserClick = (userId: number) => {
    // 从当前文章中找到对应用户的namespace
    const article = localArticles.find(a => a.userId === userId);

    if (user && user.id === userId) {
      navigate('/my-treasury');
    } else if (article?.namespace) {
      // 优先使用namespace跳转到用户个人页面
      navigate(`/user/${article.namespace}`);
    } else {
      // 兜底使用userId
      navigate(`/user/${userId}/treasury`);
    }
  };

  // 将文章分为两列显示
  const leftColumnPosts = localArticles.filter((_, index) => index % 2 === 0);
  const rightColumnPosts = localArticles.filter((_, index) => index % 2 === 1);

  const renderPostCard = (post: Article, index: number) => {
    const articleData = transformArticleToCardData(post);
    const articleLikeState = getArticleLikeState(post.id, false, post.treasureCount);

    // 更新文章的点赞状态
    articleData.isLiked = articleLikeState.isLiked;
    articleData.treasureCount = articleLikeState.likeCount;

    return (
      <ArticleCard
        key={post.id}
        article={articleData}
        layout="discovery"
        actions={{
          showTreasure: true,
          showVisits: true
        }}
        onLike={handleLike}
        onUserClick={handleUserClick}
        />
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
    <main className="flex flex-col items-start gap-10 px-5 py-0 relative flex-1 w-full max-w-none">
      {/* Welcome Guide Bar - 根据登录状态显示不同内容 */}
      {showWelcomeGuide && (
        <section className="pl-[30px] pr-4 py-[30px] rounded-lg border-l-[3px] [border-left-style:solid] border-red shadow-[1px_1px_10px_#c5c5c5] bg-[linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] flex items-start gap-[15px] relative w-full">
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
            {renderGuideContent()}
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
      <section className="flex items-start gap-8 pt-0 pb-[30px] min-h-screen w-full max-w-none">
        <div className="flex flex-col gap-8 pt-0 pb-5 w-1/2">
          {leftColumnPosts.map((post, index) => renderPostCard(post, index))}
        </div>

        <div className="flex flex-col gap-8 pt-0 pb-5 w-1/2">
          {rightColumnPosts.map((post, index) => renderPostCard(post, index))}
        </div>
      </section>
    </main>
  );
};