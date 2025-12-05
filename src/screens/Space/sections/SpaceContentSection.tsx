import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import { AuthService } from "../../../services/authService";
import { Button } from "../../../components/ui/button";
import { useToast } from "../../../components/ui/toast";
import profileDefaultAvatar from "../../../assets/images/profile-default.svg";
import { ArticleCard, ArticleData } from "../../../components/ArticleCard";
import { CollectTreasureModal } from "../../../components/CollectTreasureModal";

// Space Info Section Component
const SpaceInfoSection = ({
  spaceName,
  treasureCount,
  authorName,
  authorAvatar,
  authorNamespace,
  isFollowing,
  isOwner,
  spaceType,
  onFollow,
  onUnfollow,
  onShare,
  onAuthorClick,
  onEdit,
}: {
  spaceName: string;
  treasureCount: number;
  authorName: string;
  authorAvatar?: string;
  authorNamespace?: string;
  isFollowing: boolean;
  isOwner: boolean;
  spaceType?: number;
  onFollow: () => void;
  onUnfollow: () => void;
  onShare: () => void;
  onAuthorClick: () => void;
  onEdit?: () => void;
}): JSX.Element => {
  // Hide edit button for default treasuries (spaceType 1 = Collections, 2 = Curations)
  const canEdit = isOwner && spaceType !== 1 && spaceType !== 2;
  const [showUnfollowDropdown, setShowUnfollowDropdown] = useState(false);
  return (
    <section className="flex flex-col items-start gap-[15px] relative self-stretch w-full flex-[0_0_auto] px-4 lg:px-0">
      <header className="flex items-center relative self-stretch w-full flex-[0_0_auto]">
        <h1 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-medium text-off-black text-3xl tracking-[0] leading-[42.0px] whitespace-nowrap">
          {spaceName}
        </h1>
      </header>

      <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
        <p className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap">
          {treasureCount} treasures
        </p>

        <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
          <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap">
            By
          </span>

          <button
            onClick={onAuthorClick}
            className="inline-flex items-center gap-[5px] relative flex-[0_0_auto] hover:opacity-70 transition-opacity cursor-pointer"
          >
            <img
              className="relative w-5 h-5 rounded-full object-cover"
              alt={`${authorName}'s profile`}
              src={authorAvatar || profileDefaultAvatar}
            />
            <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-lg tracking-[0] leading-[25.2px] whitespace-nowrap hover:text-dark-grey">
              {authorName}
            </span>
          </button>
        </div>
      </div>

      <div className="inline-flex items-center gap-5 pt-2.5 pb-0 px-0 relative flex-[0_0_auto]">
        {canEdit ? (
          // Edit button for owner (hidden for default Collections/Curations spaces)
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] border border-solid border-medium-grey cursor-pointer hover:bg-gray-50 transition-colors"
            aria-label="Edit space"
            type="button"
            onClick={onEdit}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="[font-family:'Lato',Helvetica] font-medium text-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
              Edit
            </span>
          </button>
        ) : !isOwner && (
          // Follow/Following button for non-owner
          isFollowing ? (
            // Following state with dropdown - white background
            <div className="relative">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] border border-solid border-green cursor-pointer hover:opacity-80 transition-all bg-white"
                aria-label="Following options"
                type="button"
                onClick={() => setShowUnfollowDropdown(!showUnfollowDropdown)}
              >
                <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green">
                  <path d="M12.6967 13.0467C15.1618 13.0467 17.1671 11.0411 17.1671 8.57603C17.1671 6.11099 15.1618 4.10566 12.6967 4.10566C10.2317 4.10566 8.22603 6.11099 8.22603 8.57603C8.22603 11.0411 10.2317 13.0467 12.6967 13.0467ZM12.6967 4.80566C14.7759 4.80566 16.4671 6.49688 16.4671 8.57603C16.4671 10.6552 14.7759 12.3467 12.6967 12.3467C10.6176 12.3467 8.92603 10.6552 8.92603 8.57603C8.92603 6.49688 10.6176 4.80566 12.6967 4.80566Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
                  <path d="M25.2021 14.8904C25.3276 14.1689 25.3935 13.432 25.3935 12.6967C25.3935 5.6957 19.6978 0 12.6967 0C5.6957 0 0 5.6957 0 12.6967C0 19.6978 5.6957 25.3935 12.6967 25.3935C13.4323 25.3935 14.1695 25.328 14.8906 25.2024C16.238 26.9034 18.3166 28 20.65 28C24.7027 28 28 24.7027 28 20.65C28 18.3165 26.9033 16.2378 25.2021 14.8904ZM12.6967 0.7C19.3119 0.7 24.6935 6.08159 24.6935 12.6967C24.6935 13.2802 24.6495 13.8647 24.5657 14.4409C23.4305 13.7224 22.09 13.3 20.65 13.3C18.8694 13.3 17.2353 13.9372 15.962 14.9946C14.9104 14.6529 13.8131 14.4754 12.6967 14.4754C8.76307 14.4754 5.13302 16.7004 3.32408 20.1724C1.68397 18.1203 0.7 15.522 0.7 12.6967C0.7 6.08159 6.08159 0.7 12.6967 0.7ZM12.6967 24.6935C9.17831 24.6935 6.00907 23.1709 3.81268 20.7502C5.45388 17.3611 8.92765 15.1754 12.6967 15.1754C13.6074 15.1754 14.5029 15.306 15.3694 15.5496C14.0911 16.8727 13.3 18.6694 13.3 20.65C13.3 22.0899 13.7223 23.4303 14.4408 24.5655C13.8649 24.6492 13.2804 24.6935 12.6967 24.6935ZM20.65 27.3C16.9832 27.3 14 24.3168 14 20.65C14 16.9832 16.9832 14 20.65 14C24.3168 14 27.3 16.9832 27.3 20.65C27.3 24.3168 24.3168 27.3 20.65 27.3Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
                  <path d="M23.236 17.5383C22.4608 17.2009 21.4129 17.2672 20.65 18.0879C19.8871 17.2672 18.8392 17.2006 18.064 17.5383C17.1603 17.9313 16.3998 18.9441 16.7371 20.3215C17.3028 22.6293 20.3554 24.2836 20.4849 24.353C20.5365 24.3807 20.5933 24.3944 20.65 24.3944C20.7067 24.3944 20.7635 24.3807 20.8151 24.353C20.9446 24.2836 23.9976 22.6293 24.5629 20.3215C24.9002 18.9441 24.1397 17.9313 23.236 17.5383ZM23.8827 20.1547C23.4609 21.8781 21.2724 23.2747 20.65 23.6414C20.0276 23.2747 17.8394 21.8781 17.4173 20.1547C17.1767 19.1734 17.7088 18.456 18.3432 18.1802C18.5312 18.0981 18.7523 18.0465 18.9854 18.0465C19.4537 18.0465 19.9695 18.2554 20.3574 18.8467C20.4866 19.0442 20.8134 19.0442 20.9426 18.8467C21.5236 17.9611 22.3904 17.9331 22.9568 18.1802C23.5912 18.456 24.1233 19.1734 23.8827 20.1547Z" fill="currentColor" stroke="currentColor" strokeWidth="0.3"/>
                </svg>
                <span className="[font-family:'Lato',Helvetica] font-medium text-base tracking-[0] leading-[22.4px] whitespace-nowrap text-green">
                  Following
                </span>
                {/* Down arrow */}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Dropdown menu */}
              {showUnfollowDropdown && (
                <>
                  {/* Backdrop to close dropdown when clicking outside */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUnfollowDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[120px]">
                    <button
                      className="w-full px-4 py-2 text-left text-red hover:bg-gray-50 rounded-lg [font-family:'Lato',Helvetica] font-medium text-base"
                      onClick={() => {
                        setShowUnfollowDropdown(false);
                        onUnfollow();
                      }}
                    >
                      Unfollow
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            // Follow button - transparent green background
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] border border-solid border-green cursor-pointer hover:opacity-80 transition-all bg-green/10"
              aria-label="Follow space"
              type="button"
              onClick={onFollow}
            >
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green">
                <path d="M12.6967 13.0467C15.1618 13.0467 17.1671 11.0411 17.1671 8.57603C17.1671 6.11099 15.1618 4.10566 12.6967 4.10566C10.2317 4.10566 8.22603 6.11099 8.22603 8.57603C8.22603 11.0411 10.2317 13.0467 12.6967 13.0467ZM12.6967 4.80566C14.7759 4.80566 16.4671 6.49688 16.4671 8.57603C16.4671 10.6552 14.7759 12.3467 12.6967 12.3467C10.6176 12.3467 8.92603 10.6552 8.92603 8.57603C8.92603 6.49688 10.6176 4.80566 12.6967 4.80566Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
                <path d="M25.2021 14.8904C25.3276 14.1689 25.3935 13.432 25.3935 12.6967C25.3935 5.6957 19.6978 0 12.6967 0C5.6957 0 0 5.6957 0 12.6967C0 19.6978 5.6957 25.3935 12.6967 25.3935C13.4323 25.3935 14.1695 25.328 14.8906 25.2024C16.238 26.9034 18.3166 28 20.65 28C24.7027 28 28 24.7027 28 20.65C28 18.3165 26.9033 16.2378 25.2021 14.8904ZM12.6967 0.7C19.3119 0.7 24.6935 6.08159 24.6935 12.6967C24.6935 13.2802 24.6495 13.8647 24.5657 14.4409C23.4305 13.7224 22.09 13.3 20.65 13.3C18.8694 13.3 17.2353 13.9372 15.962 14.9946C14.9104 14.6529 13.8131 14.4754 12.6967 14.4754C8.76307 14.4754 5.13302 16.7004 3.32408 20.1724C1.68397 18.1203 0.7 15.522 0.7 12.6967C0.7 6.08159 6.08159 0.7 12.6967 0.7ZM12.6967 24.6935C9.17831 24.6935 6.00907 23.1709 3.81268 20.7502C5.45388 17.3611 8.92765 15.1754 12.6967 15.1754C13.6074 15.1754 14.5029 15.306 15.3694 15.5496C14.0911 16.8727 13.3 18.6694 13.3 20.65C13.3 22.0899 13.7223 23.4303 14.4408 24.5655C13.8649 24.6492 13.2804 24.6935 12.6967 24.6935ZM20.65 27.3C16.9832 27.3 14 24.3168 14 20.65C14 16.9832 16.9832 14 20.65 14C24.3168 14 27.3 16.9832 27.3 20.65C27.3 24.3168 24.3168 27.3 20.65 27.3Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
                <path d="M23.236 17.5383C22.4608 17.2009 21.4129 17.2672 20.65 18.0879C19.8871 17.2672 18.8392 17.2006 18.064 17.5383C17.1603 17.9313 16.3998 18.9441 16.7371 20.3215C17.3028 22.6293 20.3554 24.2836 20.4849 24.353C20.5365 24.3807 20.5933 24.3944 20.65 24.3944C20.7067 24.3944 20.7635 24.3807 20.8151 24.353C20.9446 24.2836 23.9976 22.6293 24.5629 20.3215C24.9002 18.9441 24.1397 17.9313 23.236 17.5383ZM23.8827 20.1547C23.4609 21.8781 21.2724 23.2747 20.65 23.6414C20.0276 23.2747 17.8394 21.8781 17.4173 20.1547C17.1767 19.1734 17.7088 18.456 18.3432 18.1802C18.5312 18.0981 18.7523 18.0465 18.9854 18.0465C19.4537 18.0465 19.9695 18.2554 20.3574 18.8467C20.4866 19.0442 20.8134 19.0442 20.9426 18.8467C21.5236 17.9611 22.3904 17.9331 22.9568 18.1802C23.5912 18.456 24.1233 19.1734 23.8827 20.1547Z" fill="currentColor" stroke="currentColor" strokeWidth="0.3"/>
              </svg>
              <span className="[font-family:'Lato',Helvetica] font-medium text-base tracking-[0] leading-[22.4px] whitespace-nowrap text-green">
                Follow
              </span>
            </button>
          )
        )}

        <button
          className="relative w-[38px] h-[38px] cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="Share space"
          type="button"
          onClick={onShare}
        >
          <img
            className="w-full h-full"
            alt="Share"
            src="https://c.animaapp.com/iU3q4Rrw/img/share-1.svg"
          />
        </button>
      </div>
    </section>
  );
};

// Main Space Content Section
export const SpaceContentSection = (): JSX.Element => {
  const navigate = useNavigate();
  const { category, namespace } = useParams<{ category?: string; namespace?: string }>();
  // Support both /space/:category and /treasury/:namespace routes
  const spaceIdentifier = namespace || category;
  const { user, getArticleLikeState, toggleLike } = useUser();
  const { showToast } = useToast();

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spaceInfo, setSpaceInfo] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Edit space modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSpaceName, setEditSpaceName] = useState("");
  const [displaySpaceName, setDisplaySpaceName] = useState("");
  const [spaceId, setSpaceId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Collect Treasure Modal state
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<{ uuid: string; title: string; isLiked: boolean; likeCount: number } | null>(null);

  // Fetch space data
  useEffect(() => {
    const fetchSpaceData = async () => {
      if (!spaceIdentifier) {
        setError('Invalid space');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const decodedIdentifier = decodeURIComponent(spaceIdentifier);

        // Check if this is a namespace route (from /treasury/:namespace)
        const isNamespaceRoute = !!namespace;

        let articlesArray: any[] = [];

        if (isNamespaceRoute) {
          // Fetch space info by namespace using getSpaceInfo API
          console.log('Fetching space info by namespace:', decodedIdentifier);
          const spaceInfoResponse = await AuthService.getSpaceInfo(decodedIdentifier);
          console.log('Space info API response:', spaceInfoResponse);

          // Extract space info from response.data
          const spaceData = spaceInfoResponse?.data || spaceInfoResponse;

          // Get author username for display name
          const authorUsername = spaceData?.userInfo?.username || user?.username || 'User';

          // Determine display name based on spaceType (same logic as Treasury list)
          // spaceType 1 = Collections, spaceType 2 = Curations
          let displayName = spaceData?.name || decodedIdentifier;
          if (spaceData?.spaceType === 1) {
            displayName = `${authorUsername}'s Collections`;
          } else if (spaceData?.spaceType === 2) {
            displayName = `${authorUsername}'s Curations`;
          }

          // Set space info from API response
          setSpaceInfo({
            name: displayName,
            authorName: authorUsername,
            authorAvatar: spaceData?.userInfo?.faceUrl || user?.faceUrl || profileDefaultAvatar,
            authorNamespace: spaceData?.userInfo?.namespace || user?.namespace,
            spaceType: spaceData?.spaceType,
          });

          // Store spaceId for later use (edit functionality)
          const spaceIdFromResponse = spaceData?.id;
          if (spaceIdFromResponse) {
            setSpaceId(spaceIdFromResponse);
          }

          // Fetch articles using spaceId from the space info
          const spaceId = spaceIdFromResponse;
          if (spaceId) {
            console.log('Fetching articles for spaceId:', spaceId);
            const articlesResponse = await AuthService.getSpaceArticles(spaceId);
            console.log('Space articles API response:', articlesResponse);

            // Extract articles from paginated response
            if (articlesResponse?.data && Array.isArray(articlesResponse.data)) {
              articlesArray = articlesResponse.data;
            } else if (articlesResponse?.data?.data && Array.isArray(articlesResponse.data.data)) {
              articlesArray = articlesResponse.data.data;
            }
          }

          setArticles(articlesArray);
        } else {
          // Old category-based route (for backwards compatibility)
          setSpaceInfo({
            name: decodedIdentifier,
            authorName: user?.username || 'Anonymous',
            authorAvatar: user?.faceUrl || profileDefaultAvatar,
            authorNamespace: user?.namespace,
          });

          // Fetch articles for this category/space
          const userId = user?.id;
          if (userId) {
            // Check if this is a special space (treasury or curations)
            const isTreasurySpace = decodedIdentifier.endsWith("'s treasury");
            const isCurationsSpace = decodedIdentifier.endsWith("'s curations");

            if (isCurationsSpace) {
              // Fetch created/curated articles for curations space
              console.log('Fetching curated articles for user:', userId);
              const curatedResponse = await AuthService.getMyCreatedArticles(1, 100, userId);

              if (curatedResponse?.data?.data && Array.isArray(curatedResponse.data.data)) {
                articlesArray = curatedResponse.data.data;
              } else if (curatedResponse?.data && Array.isArray(curatedResponse.data)) {
                articlesArray = curatedResponse.data;
              } else if (Array.isArray(curatedResponse)) {
                articlesArray = curatedResponse;
              }

              setArticles(articlesArray);
            } else if (isTreasurySpace) {
              // Fetch liked/treasured articles for treasury space
              const likedResponse = await AuthService.getMyLikedArticlesCorrect(1, 100, userId);

              if (likedResponse?.data?.data && Array.isArray(likedResponse.data.data)) {
                articlesArray = likedResponse.data.data;
              } else if (likedResponse?.data && Array.isArray(likedResponse.data)) {
                articlesArray = likedResponse.data;
              } else if (Array.isArray(likedResponse)) {
                articlesArray = likedResponse;
              }

              setArticles(articlesArray);
            } else {
              // Regular category-based space - fetch liked articles and filter
              const likedResponse = await AuthService.getMyLikedArticlesCorrect(1, 100, userId);

              if (likedResponse?.data?.data && Array.isArray(likedResponse.data.data)) {
                articlesArray = likedResponse.data.data;
              } else if (likedResponse?.data && Array.isArray(likedResponse.data)) {
                articlesArray = likedResponse.data;
              } else if (Array.isArray(likedResponse)) {
                articlesArray = likedResponse;
              }

              // Filter articles by category
              const filteredArticles = articlesArray.filter(
                (article: any) => article.categoryInfo?.name === decodedIdentifier
              );

              setArticles(filteredArticles);
            }
          }
        }

      } catch (err) {
        console.error('Failed to fetch space data:', err);
        setError('Failed to load space data');
        showToast('Failed to fetch space data, please try again', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSpaceData();
  }, [spaceIdentifier, namespace, user]);

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
      date: (article.createAt || article.publishAt) ? new Date((article.createAt || article.publishAt) * 1000).toISOString() : '',
      treasureCount: article.likeCount || 0,
      visitCount: article.viewCount || 0,
      isLiked: article.isLiked || false,
      targetUrl: article.targetUrl,
      website: article.targetUrl ? new URL(article.targetUrl).hostname : undefined,
      isPaymentRequired: article.targetUrlIsLocked,
      paymentPrice: article.priceInfo?.price?.toString()
    };
  };

  // Handle like/unlike - opens the collect modal
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
    const article = articles.find(a => a.uuid === articleId);
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

  // Handle follow
  const handleFollow = async () => {
    if (!user) {
      showToast('Please login to follow', 'error');
      return;
    }
    if (!spaceId) {
      showToast('Space ID not available', 'error');
      return;
    }
    try {
      await AuthService.followSpace(spaceId);
      setIsFollowing(true);
      showToast('Following space', 'success');
    } catch (err) {
      console.error('Failed to follow space:', err);
      showToast('Failed to follow space', 'error');
    }
  };

  // Handle unfollow
  const handleUnfollow = async () => {
    if (!user) {
      showToast('Please login to unfollow', 'error');
      return;
    }
    if (!spaceId) {
      showToast('Space ID not available', 'error');
      return;
    }
    try {
      await AuthService.followSpace(spaceId); // Same API toggles follow/unfollow
      setIsFollowing(false);
      showToast('Unfollowed space', 'success');
    } catch (err) {
      console.error('Failed to unfollow space:', err);
      showToast('Failed to unfollow space', 'error');
    }
  };

  // Handle share
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard', 'success');
  };

  // Handle author click
  const handleAuthorClick = () => {
    if (spaceInfo?.authorNamespace) {
      navigate(`/u/${spaceInfo.authorNamespace}`);
    }
  };

  // Handle edit space
  const handleEditSpace = () => {
    const currentName = displaySpaceName || spaceInfo?.name || decodeURIComponent(category || '');
    setEditSpaceName(currentName);
    setShowEditModal(true);
  };

  // Handle save space name
  const handleSaveSpaceName = async () => {
    if (!editSpaceName.trim()) {
      showToast('Please enter a space name', 'error');
      return;
    }

    if (!spaceId) {
      showToast('Space ID not available', 'error');
      return;
    }

    try {
      setIsSaving(true);

      // Call API to update space name
      await AuthService.updateSpace(spaceId, editSpaceName.trim());

      setDisplaySpaceName(editSpaceName.trim());
      showToast(`Space renamed to "${editSpaceName.trim()}"`, 'success');
      setShowEditModal(false);
      setEditSpaceName("");
    } catch (err) {
      console.error('Failed to update space name:', err);
      showToast('Failed to update space name', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete space
  const handleDeleteSpace = () => {
    // TODO: Call API to delete space when available
    showToast('Space deleted', 'success');
    setShowEditModal(false);
    navigate('/my-treasury');
  };

  // Check if current user is the owner of this space
  const isOwner = !!user && spaceInfo?.authorNamespace === user?.namespace;

  // Check if this is a curations space
  const isCurationsSpace = category ? decodeURIComponent(category).endsWith("'s curations") : false;

  // Track hovered card ID
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Handle edit article
  const handleEditArticle = (articleId: string) => {
    navigate(`/create?edit=${articleId}`);
  };

  // Render article card
  const renderCard = (article: any) => {
    const card = transformArticleToCard(article);
    const articleLikeState = getArticleLikeState(card.id, card.isLiked, typeof card.treasureCount === 'string' ? parseInt(card.treasureCount) || 0 : card.treasureCount);

    const articleData = {
      ...card,
      isLiked: articleLikeState.isLiked,
      treasureCount: articleLikeState.likeCount
    };

    // Show edit button for owner's curated content
    const canEdit = isOwner && isCurationsSpace;

    return (
      <ArticleCard
        key={card.id}
        article={articleData}
        layout="discovery"
        actions={{
          showTreasure: true,
          showVisits: true,
          showEdit: canEdit
        }}
        isHovered={hoveredCardId === card.id}
        onLike={handleLike}
        onUserClick={handleUserClick}
        onEdit={canEdit ? handleEditArticle : undefined}
        onMouseEnter={() => setHoveredCardId(card.id)}
        onMouseLeave={() => setHoveredCardId(null)}
      />
    );
  };

  if (loading) {
    return (
      <main className="flex flex-col items-start gap-5 px-4 lg:pl-[60px] lg:pr-10 pt-0 pb-[30px] relative min-h-screen">
        <div className="flex items-center justify-center w-full h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-start gap-5 px-4 lg:pl-[60px] lg:pr-10 pt-0 pb-[30px] relative min-h-screen">
        <div className="flex flex-col items-center justify-center w-full h-64 text-center gap-4">
          <div className="text-red-500">{error}</div>
          <Button
            onClick={() => navigate('/my-treasury')}
            className="bg-red hover:bg-red/90 text-white px-6 py-2 rounded-lg"
          >
            Back to Treasury
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-start gap-5 px-4 lg:pl-[60px] lg:pr-10 pt-0 pb-[30px] relative min-h-screen">
      {/* Space Info Section */}
      <SpaceInfoSection
        spaceName={displaySpaceName || spaceInfo?.name || category || 'Space'}
        treasureCount={articles.length}
        authorName={spaceInfo?.authorName || 'Anonymous'}
        authorAvatar={spaceInfo?.authorAvatar}
        authorNamespace={spaceInfo?.authorNamespace}
        isFollowing={isFollowing}
        isOwner={isOwner}
        spaceType={spaceInfo?.spaceType}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        onShare={handleShare}
        onAuthorClick={handleAuthorClick}
        onEdit={handleEditSpace}
      />

      {/* Articles Grid */}
      <div className="w-full mt-5">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full h-64 text-center">
            <img
              className="w-16 h-16 mb-4 opacity-50"
              alt="Empty space"
              src="https://c.animaapp.com/mft5gmofxQLTNf/img/treasure-icon.svg"
            />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">This space is empty</h3>
            <p className="text-gray-500 mb-4">No articles in this category yet</p>
            <Button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-red text-white rounded-lg hover:bg-red/90 transition-colors"
            >
              Discover Content
            </Button>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {articles.map((article) => renderCard(article))}
          </div>
        )}
      </div>

      {/* Edit Space Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowEditModal(false);
              setEditSpaceName("");
            }}
          />

          {/* Modal */}
          <div
            className="flex flex-col w-[582px] max-w-[90vw] items-center gap-5 p-[30px] relative bg-white rounded-[15px] z-10"
            role="dialog"
            aria-labelledby="edit-space-title"
            aria-modal="true"
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditSpaceName("");
              }}
              className="relative self-stretch w-full flex-[0_0_auto] cursor-pointer"
              aria-label="Close dialog"
              type="button"
            >
              <img
                className="w-full"
                alt=""
                src="https://c.animaapp.com/RWdJi6d2/img/close.svg"
              />
            </button>

            <div className="flex flex-col items-start gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
                <h2
                  id="edit-space-title"
                  className="relative w-fit [font-family:'Lato',Helvetica] font-semibold text-off-black text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap"
                >
                  Edit treasury
                </h2>

                <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                  <label
                    htmlFor="edit-space-name-input"
                    className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap"
                  >
                    Name
                  </label>

                  <div className="flex h-12 items-center px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                    <input
                      id="edit-space-name-input"
                      type="text"
                      value={editSpaceName}
                      onChange={(e) => setEditSpaceName(e.target.value)}
                      placeholder="Enter treasury name"
                      className="flex-1 border-none bg-transparent [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] outline-none placeholder:text-medium-dark-grey"
                      aria-required="true"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveSpaceName();
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                {/* Delete button on the left */}
                <button
                  className="inline-flex items-center gap-2 px-3 py-2.5 relative flex-[0_0_auto] rounded-[15px] cursor-pointer hover:bg-red/10 transition-colors"
                  onClick={handleDeleteSpace}
                  type="button"
                  aria-label="Delete treasury"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21" stroke="#F23A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#F23A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 11V17" stroke="#F23A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 11V17" stroke="#F23A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="[font-family:'Lato',Helvetica] font-normal text-red text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                    Delete
                  </span>
                </button>

                {/* Cancel and Save buttons on the right */}
                <div className="flex items-center gap-2.5">
                  <button
                    className="inline-flex items-center justify-center gap-[30px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditSpaceName("");
                    }}
                    type="button"
                  >
                    <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                      Cancel
                    </span>
                  </button>

                  <button
                    className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[100px] bg-red cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red/90 transition-colors"
                    onClick={handleSaveSpaceName}
                    disabled={!editSpaceName.trim() || isSaving}
                    type="button"
                  >
                    <span className="relative w-fit [font-family:'Lato',Helvetica] font-bold text-white text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                      {isSaving ? 'Saving...' : 'Save'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
