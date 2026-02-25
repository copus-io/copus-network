import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import { useToast } from "../../../components/ui/toast";
import { ArticleCard, ArticleData } from "../../../components/ArticleCard";
import { AuthService } from "../../../services/authService";
import { CollectTreasureModal } from "../../../components/CollectTreasureModal";
import profileDefaultAvatar from "../../../assets/images/profile-default.svg";

// Interface for followed space - matches updated API spec
interface FollowedSpace {
  articleCount?: number;
  coverUrl?: string;
  data?: Array<{
    coverUrl?: string;
    targetUrl?: string;
    title?: string;
  }>;
  description?: string;
  faceUrl?: string;
  followerCount?: number;
  id?: number;
  isAdmin?: boolean;
  isBind?: boolean;
  isFollowed?: boolean;
  name?: string;
  namespace?: string;
  seoDataByAi?: string;
  spaceType?: number; // 0 = normal space, 1 = Treasury, 2 = Curations
  userInfo?: {
    bio?: string;
    coverUrl?: string;
    faceUrl?: string;
    id?: number;
    namespace?: string;
    username?: string;
  };
  visibility?: number; // 0:公开 1:登录可见 2:付费可见
}

// Interface for space with resolved username
interface FollowedSpaceWithUsername extends FollowedSpace {
  resolvedUsername?: string;
}

export const FollowingContentSection = (): JSX.Element => {
  const { showToast } = useToast();
  const { user, getArticleLikeState, updateArticleLikeState, toggleLike } = useUser();
  const navigate = useNavigate();
  const [followedSpaces, setFollowedSpaces] = useState<FollowedSpaceWithUsername[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [allArticles, setAllArticles] = useState<any[]>([]); // All followed articles
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingElementRef = useRef<HTMLDivElement | null>(null);

  // Collect Treasure Modal state
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<{ uuid: string; title: string; isLiked: boolean; likeCount: number } | null>(null);


  // Load more articles function
  const loadMoreArticles = useCallback(async (page: number, isInitial = false) => {
    if (!user || (!isInitial && isLoadingMore) || !hasMoreArticles) return;

    try {
      if (isInitial) {
        setLoadingArticles(true);
      } else {
        setIsLoadingMore(true);
      }

      const pageSize = 30; // Load 30 articles per page
      const response = await AuthService.getPageMyFollowedArticle(page, pageSize);
      console.log(`Followed articles page ${page} response:`, response);

      // Parse the response - service handles data extraction
      const responseData = response?.data;
      let articlesArray: any[] = [];
      let totalCount = 0;
      let pageCount = 0;

      if (Array.isArray(response)) {
        articlesArray = response;
      } else if (responseData) {
        articlesArray = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : []);
        totalCount = responseData.totalCount || 0;
        pageCount = responseData.pageCount || 0;
      }

      console.log('✅ Articles loaded:', {
        page,
        articlesCount: articlesArray.length,
        totalCount,
        pageCount,
        hasMore: page < pageCount
      });

      if (isInitial) {
        setAllArticles(articlesArray);
      } else {
        setAllArticles(prev => [...prev, ...articlesArray]);
      }

      // Check if there are more pages
      const hasMore = pageCount > 0 ? page < pageCount : articlesArray.length === pageSize;
      setHasMoreArticles(hasMore);
      setCurrentPage(page);

    } catch (err) {
      console.error('Failed to fetch followed articles:', err);
      if (isInitial) {
        setAllArticles([]);
      }
    } finally {
      setLoadingArticles(false);
      setIsLoadingMore(false);
    }
  }, [user, isLoadingMore, hasMoreArticles]);

  // Initial load
  useEffect(() => {
    loadMoreArticles(1, true);
  }, [user]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadingElementRef.current || !hasMoreArticles) return;

    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingMore && hasMoreArticles) {
          console.log('🔄 Loading more articles, page:', currentPage + 1);
          loadMoreArticles(currentPage + 1);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px' // Start loading 200px before the element is visible
      }
    );

    // Start observing
    observerRef.current.observe(loadingElementRef.current);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [currentPage, isLoadingMore, hasMoreArticles, loadMoreArticles]);

  // Window scroll for infinite scroll (similar to Discovery page)
  useEffect(() => {
    const handleScroll = () => {
      // Check if scrolled near the bottom of the page
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrolledToBottom = scrollTop + windowHeight >= documentHeight - 1000; // Trigger 1000px early

      if (scrolledToBottom && hasMoreArticles && !isLoadingMore) {
        console.log('🔄 Window scroll loading more articles, page:', currentPage + 1);
        loadMoreArticles(currentPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMoreArticles, isLoadingMore, loadMoreArticles, currentPage]);

  // Transform article to card format
  const transformArticleToCard = (article: any): ArticleData & { spaceId?: number } => {
    return {
      id: article.uuid,
      uuid: article.uuid,
      title: article.title,
      description: article.content,
      coverImage: article.coverUrl || '', // No placeholder - empty if no cover
      category: article.categoryInfo?.name || 'General',
      categoryColor: article.categoryInfo?.color || '#666666',
      userName: article.authorInfo?.username || 'Anonymous',
      userAvatar: article.authorInfo?.faceUrl || profileDefaultAvatar,
      userId: article.authorInfo?.id,
      namespace: article.authorInfo?.namespace,
      userNamespace: article.authorInfo?.namespace,
      date: (article.createAt || article.publishAt) ? new Date((article.createAt || article.publishAt) * 1000).toISOString() : '',
      treasureCount: article.likeCount || 0,
      visitCount: article.viewCount || 0,
      commentCount: article.commentCount || 0,
      isLiked: article.isLiked || false,
      targetUrl: article.targetUrl,
      website: article.targetUrl ? (() => { try { return new URL(article.targetUrl).hostname; } catch { return undefined; } })() : undefined,
      isPaymentRequired: article.targetUrlIsLocked,
      paymentPrice: article.priceInfo?.price?.toString(),
      spaceId: article.spaceId || article.spaceInfo?.id,
      visibility: article.visibility
    };
  };

  // Get articles to display - all followed articles
  const displayedArticles = allArticles;

  // Handle like action - opens the collect modal
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

    // Find the article and open the collect modal
    const article = displayedArticles.find(a => a.uuid === articleId);
    if (article) {
      setSelectedArticle({
        uuid: articleId,
        title: article.title,
        isLiked: currentIsLiked,
        likeCount: currentLikeCount
      });
      setCollectModalOpen(true);
    }
  };

  // Handle successful collection - update local state
  const handleCollectSuccess = () => {
    if (!selectedArticle) return;

    // Update like state locally using updateArticleLikeState (same as Discovery page)
    const newLikeCount = selectedArticle.likeCount + 1;
    updateArticleLikeState(selectedArticle.uuid, true, newLikeCount);

    // Update selectedArticle state to reflect the change
    setSelectedArticle(prev => prev ? { ...prev, isLiked: true, likeCount: newLikeCount } : null);
  };

  // Handle user click
  const handleUserClick = (userId: number | undefined) => {
    // Find the corresponding user's namespace from current articles
    const article = displayedArticles.find(a => a.userId === userId);

    if (user && user.id === userId) {
      navigate('/my-treasury');
    } else if (article?.namespace) {
      // Prioritize using namespace to navigate to user profile page
      navigate(`/u/${article.namespace}`);
    } else if (userId) {
      // Fallback to using userId
      navigate(`/user/${userId}/treasury`);
    }
  };

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <main className="flex flex-col items-center justify-center gap-6 py-20 relative flex-1">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-dark-grey mb-4">
            Subscribe to Spaces to See Content Here
          </h2>
          <p className="text-gray-500 mb-6">
            Log in to subscribe to your favorite spaces and creators. Their latest content will appear here.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-red text-white rounded-full font-semibold hover:bg-red/90 transition-colors"
          >
            Log In
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-start gap-6 py-0 relative flex-1">
      {/* Followed Spaces Bubbles Section */}
      <section className="w-full px-2.5 lg:pl-2.5 lg:pr-0">
        <div className="flex items-center gap-3 flex-wrap">
          {/* All button - always active since this page shows all followed content */}
          <button
            className="h-10 px-5 rounded-[100px] text-[16px] transition-colors flex items-center justify-center bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] text-[#454545] border border-[#a8a8a8] font-bold"
          >
            All
          </button>

          {/* Followed spaces bubbles from API */}
          {loadingSpaces ? (
            <span className="text-gray-400 text-sm">Loading...</span>
          ) : (
            followedSpaces.map((space) => {
              // Check for default spaces - by spaceType or name
              const isDefaultSpace =
                space.spaceType === 1 ||
                space.spaceType === 2 ||
                space.name?.toLowerCase().includes('default');

              // Use resolvedUsername for default spaces, otherwise use space name
              const displayName = (isDefaultSpace && space.resolvedUsername)
                ? space.resolvedUsername
                : space.name;

              // Navigate to treasury page using space namespace
              const navPath = `/treasury/${space.namespace}`;

              return (
                <button
                  key={space.id}
                  onClick={() => navigate(navPath)}
                  className="h-10 px-5 rounded-[100px] text-[16px] transition-colors flex items-center justify-center bg-white text-[#454545] border border-[#a8a8a8] font-medium hover:bg-gray-50"
                >
                  {displayName}
                </button>
              );
            })
          )}

          {/* Show message if no subscribed spaces */}
          {!loadingSpaces && followedSpaces.length === 0 && (
            <span className="text-gray-400 text-sm ml-2">No subscriptions yet</span>
          )}
        </div>
      </section>

      {/* Content Cards Section */}
      {loadingArticles ? (
        <section className="w-full pt-0 pb-[30px] min-h-screen px-2.5 lg:pl-2.5 lg:pr-0 grid grid-cols-1 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 lg:gap-8">
          {Array.from({ length: 15 }).map((_, index) => (
            <div key={index} className="w-full bg-white rounded-lg animate-pulse">
              <div className="p-4">
                <div className="w-full aspect-video bg-gray-200 rounded-lg mb-4" />
                <div className="h-6 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-4 bg-gray-200 rounded mb-4 w-full" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </section>
      ) : displayedArticles.length === 0 ? (
        <section className="w-full pt-0 pb-[30px] min-h-screen px-2.5 lg:pl-2.5 lg:pr-0">
          <div className="flex flex-col items-center justify-center w-full py-20 text-center">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles yet</h3>
            <p className="text-gray-500 mb-4">Subscribe to spaces to see their articles here</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-red text-white rounded-full font-semibold hover:bg-red/90 transition-colors"
            >
              Discover Spaces
            </button>
          </div>
        </section>
      ) : (
        <section className="w-full pt-0 pb-[30px] min-h-screen px-2.5 lg:pl-2.5 lg:pr-0">
          <div className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 lg:gap-8">
            {displayedArticles.map((article) => {
              const card = transformArticleToCard(article);
              const articleLikeState = getArticleLikeState(card.id, card.isLiked, typeof card.treasureCount === 'string' ? parseInt(card.treasureCount) || 0 : card.treasureCount);

              const articleData = {
                ...card,
                isLiked: articleLikeState.isLiked,
                treasureCount: articleLikeState.likeCount
              };


              return (
                <div key={article.uuid}>
                  <ArticleCard
                    article={articleData}
                    layout="discovery"
                    actions={{
                      showTreasure: true,
                      showVisits: true
                    }}
                    onLike={handleLike}
                    onUserClick={handleUserClick}
                  />
                </div>
              );
            })}
          </div>

          {/* Infinite scroll loading indicator */}
          {hasMoreArticles && (
            <div
              ref={loadingElementRef}
              className="flex justify-center items-center py-8 mt-4"
            >
              {isLoadingMore ? (
                <div className="flex items-center gap-3 text-gray-500">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Loading more articles...</span>
                </div>
              ) : (
                <div className="text-gray-400 text-sm">
                  Scroll to load more articles
                </div>
              )}
            </div>
          )}

          {!hasMoreArticles && displayedArticles.length > 0 && (
            <div className="flex justify-center py-8 mt-4">
              <span className="text-gray-400 text-sm">You've reached the end of your followed articles</span>
            </div>
          )}
        </section>
      )}

      {/* Collect Treasure Modal */}
      {selectedArticle && (
        <CollectTreasureModal
          isOpen={collectModalOpen}
          onClose={() => {
            setCollectModalOpen(false);
            setSelectedArticle(null);
          }}
          articleId={selectedArticle.uuid}
          articleTitle={selectedArticle.title}
          isAlreadyCollected={selectedArticle.isLiked}
          onCollectSuccess={handleCollectSuccess}
        />
      )}
    </main>
  );
};
