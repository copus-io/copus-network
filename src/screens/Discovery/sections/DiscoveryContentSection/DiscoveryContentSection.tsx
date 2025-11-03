import React from "react";
import { useNavigate } from "react-router-dom";
import { useArticles } from "../../../../hooks/useArticles";
import { Article } from "../../../../types/article";
import { ArticleListSkeleton } from "../../../../components/ui/skeleton";
import { useToast } from "../../../../components/ui/toast";
import { useUser } from "../../../../contexts/UserContext";
import { ArticleCard, ArticleData } from "../../../../components/ArticleCard";
import { getCategoryStyle, getCategoryInlineStyle, formatDate, formatCount } from "../../../../utils/categoryStyles";
import profileDefaultAvatar from "../../../../assets/images/profile-default.svg";

export const DiscoveryContentSection = (): JSX.Element => {
  const { showToast } = useToast();
  const { user, getArticleLikeState, updateArticleLikeState, toggleLike, syncArticleStates } = useUser();
  const [localArticles, setLocalArticles] = React.useState<Article[]>([]);
  const navigate = useNavigate();

  // Set test token to ensure API authentication - temporarily disable expired token
  // React.useEffect(() => {
  //   const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYjE1MzM2NDUtYzZjOC00MmJkLTgwOTQtM2QzYjI4N2VkOWNkIiwidXNlcl90eXBlIjoidXNlciIsInVzZXJfbmFtZSI6IjE2MTEwMTEwNjE1IiwiYWNjb3VudF90eXBlIjoidGVzdCIsImV4cCI6MTcyNzY4MTc5OSwidXNlcl9yb2xlIjoidXNlciIsImlhdCI6MTcyNzU5NTM5OSwidWlkIjoiYjE1MzM2NDUtYzZjOC00MmJkLTgwOTQtM2QzYjI4N2VkOWNkIn0.QkqDnbMaXFgaZhKc0CIFNZNLfqLnGqO2XZyNKiEtXOU';
  //   localStorage.setItem('copus_token', testToken);
  //     // }, []);

  // Welcome guide display state management
  const [showWelcomeGuide, setShowWelcomeGuide] = React.useState(false);

  // Check if this is the first visit today (based on login status)
  React.useEffect(() => {
    const today = new Date().toDateString();
    // Use different storage keys for logged-in and guest users
    const storageKey = user ? `copus_last_guide_shown_${user.id}` : 'copus_last_guide_shown_guest';
    const lastVisitDate = localStorage.getItem(storageKey);

    if (lastVisitDate !== today) {
      setShowWelcomeGuide(true);
      const userType = user ? 'logged-in user' : 'guest';
    }
  }, [user]); // Depends on user state

  // Close welcome guide
  const handleCloseWelcomeGuide = () => {
    const today = new Date().toDateString();
    // Use different storage keys for logged-in and guest users
    const storageKey = user ? `copus_last_guide_shown_${user.id}` : 'copus_last_guide_shown_guest';
    localStorage.setItem(storageKey, today);
    setShowWelcomeGuide(false);
    const userType = user ? 'logged-in user' : 'guest';
  };

  const { articles, loading, error, refresh, loadMore, hasMore } = useArticles();


  // Ensure data refresh each time page is entered or regains focus
  React.useEffect(() => {
    const handleFocus = () => {
      refresh();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refresh();
      }
    };

    // Listen to window focus event
    window.addEventListener('focus', handleFocus);
    // Listen to page visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refresh]); // Add refresh dependency, but remove refresh call on page load

  // Scroll to load more logic
  React.useEffect(() => {
    const handleScroll = () => {
      // Check if scrolled near the bottom of the page
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrolledToBottom = scrollTop + windowHeight >= documentHeight - 1000; // Trigger 1000px early

      if (scrolledToBottom && hasMore && !loading) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, loading, loadMore]);

  // Render different guide content based on user login status
  const renderGuideContent = () => {
    if (user) {
      // Logged-in users: functional guidance
      return (
        <>
          <h1 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-9 whitespace-nowrap">
            Welcome to Copus!
          </h1>
          <div className="w-full max-w-[736px] flex flex-col items-start gap-3">
            <p className="text-dark-grey text-lg leading-[27px] relative self-stretch [font-family:'Lato',Helvetica] font-normal tracking-[0]">
              <span className="[font-family:'Lato',Helvetica] font-normal text-[#454545] text-lg tracking-[0] leading-[27px]">
                Discover Internet gems hand-picked by people. No algorithmic feeds here.
              </span>
            </p>
            <p className="text-dark-grey text-lg leading-[27px] relative self-stretch [font-family:'Lato',Helvetica] font-normal tracking-[0]">
              <span className="[font-family:'Lato',Helvetica] font-normal text-[#454545] text-lg tracking-[0] leading-[27px]">
                Click "Curate" (top-right) to share your finds.
              </span>
            </p>
          </div>
        </>
      );
    } else {
      // Guest users: platform introduction (using English, maintaining same styling)
      return (
        <>
          <h1 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-9 whitespace-nowrap">
            Welcome to Copus!
          </h1>
          <div className="w-full max-w-[736px] flex flex-col items-start gap-3">
            <p className="text-dark-grey text-lg leading-[27px] relative self-stretch [font-family:'Lato',Helvetica] font-normal tracking-[0]">
              <span className="[font-family:'Lato',Helvetica] font-normal text-[#454545] text-lg tracking-[0] leading-[27px]">
                Today's Internet is noisy, meaning gets lost.
              </span>
            </p>
            <p className="text-dark-grey text-lg leading-[27px] relative self-stretch [font-family:'Lato',Helvetica] font-normal tracking-[0]">
              <span className="[font-family:'Lato',Helvetica] font-normal text-[#454545] text-lg tracking-[0] leading-[27px]">
                We value human agency and power it with an x402-based economic engine that rewards quality sharing and creation.{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-[#2191FB] hover:underline cursor-pointer font-normal"
                >
                  Join us
                </button>{' '}
                to weave a new internet: our collective opus. :)
              </span>
            </p>
          </div>
        </>
      );
    }
  };

  // Sync local article state and like status
  React.useEffect(() => {
    setLocalArticles(articles);

    // Sync like status to localStorage
    if (articles.length > 0) {
      const articlesForSync = articles.map(article => ({
        id: article.id,
        uuid: article.id,
        isLiked: article.isLiked, // Use actual like status returned from server
        likeCount: article.treasureCount || 0
      }));
      syncArticleStates(articlesForSync);
    }
  }, [articles]); // Remove syncArticleStates dependency to avoid infinite loop

  // Transform article data format
  const transformArticleToCardData = (article: Article): ArticleData => {
    return {
      id: article.id,
      uuid: article.id, // Use id as uuid
      title: article.title,
      description: article.description,
      coverImage: article.coverImage,
      category: article.category,
      categoryColor: article.categoryColor,
      userName: article.userName,
      userAvatar: article.userAvatar || profileDefaultAvatar,
      userId: article.userId,
      namespace: article.namespace, // Add namespace field
      date: article.date,
      treasureCount: article.treasureCount,
      visitCount: `${article.visitCount || 0}`,
      isLiked: article.isLiked, // Use actual like status returned from server
      targetUrl: article.url,
      website: article.website,
      // x402 payment fields - pass through from article
      isPaymentRequired: article.isPaymentRequired,
      paymentPrice: article.paymentPrice
    };
  };

  // Handle like action
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

  // Handle user click
  const handleUserClick = (userId: number) => {
    // Find the corresponding user's namespace from current articles
    const article = localArticles.find(a => a.userId === userId);

    if (user && user.id === userId) {
      navigate('/my-treasury');
    } else if (article?.namespace) {
      // Prioritize using namespace to navigate to user profile page
      navigate(`/u/${article.namespace}`);
    } else {
      // Fallback to using userId
      navigate(`/user/${userId}/treasury`);
    }
  };

  const renderPostCard = (post: Article, index: number) => {
    const articleData = transformArticleToCardData(post);

    // Only show like states for logged-in users
    if (user) {
      const articleLikeState = getArticleLikeState(post.id, post.isLiked, post.treasureCount);
      // Update article like status
      articleData.isLiked = articleLikeState.isLiked;
      articleData.treasureCount = articleLikeState.likeCount;
    } else {
      // For non-logged-in users, remove like state and use original count
      articleData.isLiked = false;
      articleData.treasureCount = post.treasureCount;
    }

    // Check if this is the current user's own article
    const isOwnArticle = user && user.id === post.userId;

    return (
      <div key={post.id}>
        <ArticleCard
          article={articleData}
          layout="discovery"
          actions={{
            showTreasure: true,
            showVisits: true
          }}
          onLike={user ? handleLike : undefined} // Only pass onLike for logged-in users
          onUserClick={handleUserClick}
        />
      </div>
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
          <p className="text-red-500 mb-4">Error loading content: {error}</p>
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

  return (
    <main className="flex flex-col items-start gap-10 py-0 relative flex-1">
      {/* Welcome Guide Bar - Display different content based on login status */}
      {showWelcomeGuide && (
        <section className="pl-4 sm:pl-[30px] pr-4 py-4 sm:py-[30px] rounded-lg border-l-[3px] [border-left-style:solid] border-red shadow-[1px_1px_10px_#c5c5c5] bg-[linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] flex items-start gap-[15px] relative w-full min-h-fit overflow-hidden">
          {/* Close button - Keep in top right corner */}
          <button
            onClick={handleCloseWelcomeGuide}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 group z-20"
            aria-label="Close welcome guide"
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

          <div className="flex-1 pr-4 sm:pr-[120px] min-w-0">
            {renderGuideContent()}
          </div>

          {/* Octopus image, properly sized to ensure full visibility, positioned at bottom right edge */}
          <div className="absolute bottom-0 right-0 w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] z-10">
            <img
              className="w-full h-full object-contain object-right-bottom rounded-lg"
              alt="Red Octopus"
              src="https://c.animaapp.com/1aPszOHA/img/mask-group.png"
            />
          </div>
        </section>
      )}

      {/* Content Cards Section - Responsive Grid Layout */}
      {articles.length === 0 ? (
        <section className="flex items-center justify-center min-h-[400px] w-full px-5">
          <div className="text-center">
            <p className="text-gray-500">The space is empty and full of possibilities!</p>
          </div>
        </section>
      ) : (
        <section className="w-full pt-0 pb-[30px] min-h-screen px-2.5 lg:px-0 grid grid-cols-1 lg:grid-cols-[repeat(auto-fill,minmax(408px,1fr))] gap-4 lg:gap-8">
          {localArticles.map((post, index) => renderPostCard(post, index))}
        </section>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg text-gray-600">Loading more content...</div>
        </div>
      )}

      {/* No more content hint */}
      {!loading && !hasMore && articles.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">You've reached the bottom! No more content to load.</div>
        </div>
      )}
    </main>
  );
};