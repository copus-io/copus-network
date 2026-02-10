import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import { useToast } from "../../../components/ui/toast";
import { ArticleCard, ArticleData } from "../../../components/ArticleCard";
import { AuthService } from "../../../services/authService";
import { CollectTreasureModal } from "../../../components/CollectTreasureModal";
import profileDefaultAvatar from "../../../assets/images/profile-default.svg";

// Interface for followed space
interface FollowedSpace {
  id: number;
  name: string;
  namespace: string;
  spaceType?: number; // 1 = Treasury, 2 = Curations (default spaces)
  userId?: number;
  ownerInfo?: {
    id?: number;
    username?: string;
    namespace?: string;
  };
  authorInfo?: {
    id?: number;
    username?: string;
  };
}

// Interface for space with resolved username
interface FollowedSpaceWithUsername extends FollowedSpace {
  resolvedUsername?: string;
}

export const FollowingContentSection = (): JSX.Element => {
  const { showToast } = useToast();
  const { user, getArticleLikeState, toggleLike } = useUser();
  const navigate = useNavigate();
  const [followedSpaces, setFollowedSpaces] = useState<FollowedSpaceWithUsername[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [allArticles, setAllArticles] = useState<any[]>([]); // All followed articles
  const [loadingArticles, setLoadingArticles] = useState(true);

  // Collect Treasure Modal state
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<{ uuid: string; title: string; isLiked: boolean; likeCount: number } | null>(null);

  // Fetch followed spaces from API
  useEffect(() => {
    const fetchFollowedSpaces = async () => {
      if (!user) {
        setLoadingSpaces(false);
        return;
      }

      try {
        setLoadingSpaces(true);
        const response = await AuthService.getFollowedSpaces();
        console.log('Followed spaces response:', response);

        // Parse the response - handle different response formats
        let spacesArray: FollowedSpace[] = [];
        if (response?.data?.data && Array.isArray(response.data.data)) {
          spacesArray = response.data.data;
        } else if (response?.data && Array.isArray(response.data)) {
          spacesArray = response.data;
        } else if (Array.isArray(response)) {
          spacesArray = response;
        }

        // Resolve display names for default spaces using existing data (no extra API calls)
        const spacesWithDisplayNames = spacesArray.map(space => {
          const isDefaultSpace =
            space.spaceType === 1 ||
            space.spaceType === 2 ||
            space.name?.toLowerCase().includes('default');

          if (isDefaultSpace) {
            // Try to get username from various possible fields in the response
            const username = space.ownerInfo?.username
              || space.authorInfo?.username
              || (space as any).userInfo?.username
              || (space as any).userName
              || (space as any).ownerName;

            if (username) {
              let displayName: string;
              if (space.spaceType === 2 || space.name?.toLowerCase().includes('curation')) {
                displayName = `${username}'s Curations`;
              } else {
                displayName = `${username}'s Treasury`;
              }
              return { ...space, resolvedUsername: displayName };
            }
          }
          return space;
        });

        setFollowedSpaces(spacesWithDisplayNames);
      } catch (err) {
        console.error('Failed to fetch followed spaces:', err);
      } finally {
        setLoadingSpaces(false);
      }
    };

    fetchFollowedSpaces();
  }, [user]);

  // Fetch all articles from followed spaces (for "All" tab)
  useEffect(() => {
    const fetchFollowedArticles = async () => {
      if (!user) {
        setLoadingArticles(false);
        return;
      }

      try {
        setLoadingArticles(true);
        const response = await AuthService.getFollowedArticles(1, 50);
        console.log('Followed articles response:', response);

        // Parse the response
        let articlesArray: any[] = [];
        if (response?.data?.data && Array.isArray(response.data.data)) {
          articlesArray = response.data.data;
        } else if (response?.data && Array.isArray(response.data)) {
          articlesArray = response.data;
        } else if (Array.isArray(response)) {
          articlesArray = response;
        }

        setAllArticles(articlesArray);
      } catch (err) {
        console.error('Failed to fetch followed articles:', err);
      } finally {
        setLoadingArticles(false);
      }
    };

    fetchFollowedArticles();
  }, [user]);

  // Transform article to card format
  const transformArticleToCard = (article: any): ArticleData & { spaceId?: number } => {
    return {
      id: article.uuid,
      uuid: article.uuid,
      title: article.title,
      description: article.content,
      coverImage: article.coverUrl || 'https://c.animaapp.com/mft5gmofxQLTNf/img/cover-1.png',
      category: article.categoryInfo?.name || 'General',
      categoryColor: article.categoryInfo?.color || '#666666',
      userName: article.authorInfo?.username || 'Anonymous',
      userAvatar: article.authorInfo?.faceUrl || profileDefaultAvatar,
      userId: article.authorInfo?.id,
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

    // Update like state locally
    const newLikeCount = selectedArticle.likeCount + 1;
    toggleLike(selectedArticle.uuid, false, selectedArticle.likeCount);

    // Update selectedArticle state to reflect the change
    setSelectedArticle(prev => prev ? { ...prev, isLiked: true, likeCount: newLikeCount } : null);
  };

  // Handle user click
  const handleUserClick = (userId: number | undefined, userNamespace?: string) => {
    if (userNamespace) {
      navigate(`/u/${userNamespace}`);
    } else if (userId) {
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
        <section className="w-full pt-0 pb-[30px] min-h-screen px-2.5 lg:pl-2.5 lg:pr-0 grid grid-cols-1 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 lg:gap-8">
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
