import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import { useToast } from "../../../components/ui/toast";
import { ArticleCard, ArticleData } from "../../../components/ArticleCard";
import { AuthService } from "../../../services/authService";
import profileDefaultAvatar from "../../../assets/images/profile-default.svg";

// Interface for followed space
interface FollowedSpace {
  id: number;
  name: string;
  namespace: string;
}

export const FollowingContentSection = (): JSX.Element => {
  const { showToast } = useToast();
  const { user, getArticleLikeState, toggleLike } = useUser();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("all");
  const [followedSpaces, setFollowedSpaces] = useState<FollowedSpace[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  // Fetch followed spaces
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

        // Parse the response
        let spacesArray: FollowedSpace[] = [];
        if (response?.data && Array.isArray(response.data)) {
          spacesArray = response.data;
        } else if (Array.isArray(response)) {
          spacesArray = response;
        }

        setFollowedSpaces(spacesArray);
      } catch (err) {
        console.error('Failed to fetch followed spaces:', err);
      } finally {
        setLoadingSpaces(false);
      }
    };

    fetchFollowedSpaces();
  }, [user]);

  // Fetch articles from followed spaces
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

        setArticles(articlesArray);
      } catch (err) {
        console.error('Failed to fetch followed articles:', err);
      } finally {
        setLoadingArticles(false);
      }
    };

    fetchFollowedArticles();
  }, [user]);

  // Transform article to card format
  const transformArticleToCard = (article: any): ArticleData => {
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
      date: new Date((article.createAt || article.publishAt) * 1000).toISOString(),
      treasureCount: article.likeCount || 0,
      visitCount: article.viewCount || 0,
      isLiked: article.isLiked || false,
      targetUrl: article.targetUrl,
      website: article.targetUrl ? (() => { try { return new URL(article.targetUrl).hostname; } catch { return undefined; } })() : undefined,
      isPaymentRequired: article.targetUrlIsLocked,
      paymentPrice: article.priceInfo?.price?.toString()
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
            Follow Spaces to See Content Here
          </h2>
          <p className="text-gray-500 mb-6">
            Log in to follow your favorite spaces and creators. Their latest content will appear here.
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
          {/* All button */}
          <button
            onClick={() => setSelectedTab("all")}
            className={`h-10 px-5 rounded-[100px] text-[16px] transition-colors flex items-center justify-center ${
              selectedTab === "all"
                ? "bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] text-[#454545] border border-[#a8a8a8] font-bold"
                : "bg-white text-[#454545] border border-[#a8a8a8] font-medium hover:bg-gray-50"
            }`}
          >
            All
          </button>

          {/* Followed spaces bubbles */}
          {loadingSpaces ? (
            <span className="text-gray-400 text-sm">Loading...</span>
          ) : (
            followedSpaces.map((space) => (
              <button
                key={space.id}
                onClick={() => {
                  setSelectedTab(space.id.toString());
                  // Navigate to the space page
                  navigate(`/treasury/${space.namespace}`);
                }}
                className={`h-10 px-5 rounded-[100px] text-[16px] transition-colors flex items-center justify-center ${
                  selectedTab === space.id.toString()
                    ? "bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] text-[#454545] border border-[#a8a8a8] font-bold"
                    : "bg-white text-[#454545] border border-[#a8a8a8] font-medium hover:bg-gray-50"
                }`}
              >
                {space.name}
              </button>
            ))
          )}

          {/* Show message if no followed spaces */}
          {!loadingSpaces && followedSpaces.length === 0 && (
            <span className="text-gray-400 text-sm ml-2">No spaces followed yet</span>
          )}
        </div>
      </section>

      {/* Content Cards Section */}
      <section className="w-full pt-0 pb-[30px] min-h-screen px-2.5 lg:pl-2.5 lg:pr-0">
        {loadingArticles ? (
          <div className="flex items-center justify-center w-full py-20">
            <div className="text-gray-500">Loading articles...</div>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full py-20 text-center">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles yet</h3>
            <p className="text-gray-500 mb-4">Follow spaces to see their articles here</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-red text-white rounded-full font-semibold hover:bg-red/90 transition-colors"
            >
              Discover Spaces
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fill,minmax(408px,1fr))] gap-4 lg:gap-8">
            {articles.map((article) => {
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
        )}
      </section>
    </main>
  );
};
