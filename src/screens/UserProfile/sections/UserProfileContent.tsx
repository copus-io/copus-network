import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import { useImagePreview } from "../../../contexts/ImagePreviewContext";
import { ArticleCard, ArticleData } from "../../../components/ArticleCard";
import { AuthService } from "../../../services/authService";
import { ArticleListSkeleton } from "../../../components/ui/skeleton";
import { useToast } from "../../../components/ui/toast";
import { ImageUploader } from "../../../components/ImageUploader/ImageUploader";
import { CollectTreasureModal } from "../../../components/CollectTreasureModal";
import profileDefaultAvatar from "../../../assets/images/profile-default.svg";
import defaultBanner from "../../../assets/images/default-banner.svg";

interface UserProfileContentProps {
  namespace: string;
}

export const UserProfileContent: React.FC<UserProfileContentProps> = ({ namespace }) => {
  const navigate = useNavigate();
  const { user, toggleLike, updateUser, getArticleLikeState, updateArticleLikeState } = useUser();
  const { openPreview } = useImagePreview();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [showCoverUploader, setShowCoverUploader] = useState(false);
  const [accountExists, setAccountExists] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const isLoadingMoreRef = useRef(false); // Ref to prevent race conditions in scroll handler
  const [bannerImageLoaded, setBannerImageLoaded] = useState(false);
  const [showBannerLoadingSpinner, setShowBannerLoadingSpinner] = useState(false);

  // Collect Treasure Modal state
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<{ uuid: string; title: string; isLiked: boolean; likeCount: number } | null>(null);

  // 智能Banner图片加载检测
  const checkBannerImageLoad = React.useCallback((imageUrl: string) => {
    if (!imageUrl || imageUrl === defaultBanner) {
      setBannerImageLoaded(true);
      setShowBannerLoadingSpinner(false);
      return;
    }

    setBannerImageLoaded(false);
    setShowBannerLoadingSpinner(false);

    let isLoaded = false;

    // 延迟300ms显示loading，如果图片快速加载完成就不显示loading
    const loadingTimer = setTimeout(() => {
      if (!isLoaded) {
        setShowBannerLoadingSpinner(true);
      }
    }, 300);

    // 创建新图片对象检测加载
    const img = new Image();
    img.onload = () => {
      isLoaded = true;
      clearTimeout(loadingTimer);
      setBannerImageLoaded(true);
      setShowBannerLoadingSpinner(false);
    };
    img.onerror = () => {
      isLoaded = true;
      clearTimeout(loadingTimer);
      setBannerImageLoaded(true); // 即使加载失败也显示，避免持续loading
      setShowBannerLoadingSpinner(false);
    };
    img.src = imageUrl;

    // 清理函数
    return () => clearTimeout(loadingTimer);
  }, []);

  // Fetch user info and articles list
  useEffect(() => {
    const fetchUserData = async () => {
      console.log('[UserProfile] Starting to fetch user data for namespace:', namespace);
      setLoading(true);
      setUserInfo(null); // Clear previous user info
      setArticles([]); // Clear previous articles
      setAccountExists(true); // Reset account exists flag

      try {
        // Call API to get user information - this endpoint does NOT require authentication
        console.log('[UserProfile] Calling getOtherUserTreasuryInfoByNamespace...');
        const userData = await AuthService.getOtherUserTreasuryInfoByNamespace(namespace);
        console.log('[UserProfile] Successfully fetched user data:', userData);
        console.log('[UserProfile] isEnabled value:', userData.isEnabled);
        console.log('[UserProfile] isEnabled type:', typeof userData.isEnabled);

        // Check if account is disabled/deleted (check both false and 0)
        if (userData.isEnabled === false || userData.isEnabled === 0) {
          console.log('[UserProfile] Account is disabled/deleted');
          setAccountExists(false);

          // Set user info with default images but keep other data
          setUserInfo({
            id: userData.id,
            username: userData.username,
            namespace: userData.namespace,
            faceUrl: profileDefaultAvatar, // Use default avatar
            bio: "This account doesn't exist",
            articlesCount: userData.statistics.articleCount,
            followersCount: 0,
            followingCount: 0,
            socialLinks: userData.socialLinks,
            statistics: userData.statistics,
            email: userData.email,
            coverUrl: 'https://c.animaapp.com/w7obk4mX/img/banner.png', // Use default banner
            walletAddress: userData.walletAddress
          });
        } else {
          // Account exists and is enabled - use actual data
          setAccountExists(true);
          setUserInfo({
            id: userData.id,
            username: userData.username,
            namespace: userData.namespace,
            faceUrl: userData.faceUrl || profileDefaultAvatar,
            bio: userData.bio || "This user is mysterious and left nothing~",
            articlesCount: userData.statistics.articleCount,
            followersCount: 0, // API doesn't provide follower data yet
            followingCount: 0, // API doesn't provide following data yet
            // Save other data from API response
            socialLinks: userData.socialLinks,
            statistics: userData.statistics,
            email: userData.email,
            coverUrl: userData.coverUrl,
            walletAddress: userData.walletAddress
          });

          // 检测banner图片加载
          const bannerUrl = userData.coverUrl || defaultBanner;
          checkBannerImageLoad(bannerUrl);
        }

        console.log('[UserProfile] User info set successfully, now fetching liked articles...');

        // Fetch user's liked articles using targetUserId
        const articlesData = await AuthService.getMyLikedArticlesCorrect(1, 20, userData.id);
        console.log('[UserProfile] Successfully fetched liked articles:', articlesData);

        // Set pagination state based on real API response
        setCurrentPage(articlesData.pageIndex || 1);
        setHasMoreArticles(articlesData.pageIndex < articlesData.pageCount);

        // Transform API data to ArticleData format
        const transformedArticles: ArticleData[] = articlesData.data.map(article => {

          return {
            id: article.uuid,
            title: article.title,
            content: article.content,
            cover: article.coverUrl,
            author: {
              id: article.authorInfo?.id,
              name: article.authorInfo?.username,
              namespace: article.authorInfo?.namespace,
              avatar: article.authorInfo?.faceUrl
            },
            category: article.categoryInfo?.name || '',
            categoryColor: article.categoryInfo?.color,
            categoryId: article.categoryInfo?.id,
            userId: article.authorInfo?.id,
            isLiked: article.isLiked,
            likeCount: article.likeCount,
            createTime: article.createAt,
            publishTime: article.publishAt,
            link: article.targetUrl,
            viewCount: article.viewCount
          };
        });

        setArticles(transformedArticles);
        console.log('[UserProfile] All data loaded successfully');
      } catch (error) {
        console.error("[UserProfile] Failed to fetch user data:", error);
        console.error("[UserProfile] Error details:", {
          message: error instanceof Error ? error.message : String(error),
          namespace: namespace
        });

        // Set account as non-existent and show default profile
        setAccountExists(false);
        setUserInfo({
          id: 0,
          username: 'Deleted Account',
          namespace: namespace,
          faceUrl: profileDefaultAvatar,
          bio: "This account doesn't exist",
          articlesCount: 0,
          followersCount: 0,
          followingCount: 0,
          socialLinks: [],
          statistics: {
            articleCount: 0,
            likedArticleCount: 0,
            myArticleLikedCount: 0
          },
          email: '',
          coverUrl: 'https://c.animaapp.com/w7obk4mX/img/banner.png',
          walletAddress: ''
        });
        setHasMoreArticles(false);

        showToast("This account doesn't exist", "error");
      } finally {
        console.log('[UserProfile] Setting loading to false');
        setLoading(false);
      }
    };

    if (namespace) {
      fetchUserData();
    } else {
      console.warn('[UserProfile] No namespace provided');
    }
  }, [namespace, showToast]);

  // Load more articles function
  const loadMoreArticles = useCallback(async () => {
    // Use ref to prevent multiple simultaneous calls
    if (!userInfo || isLoadingMoreRef.current || !hasMoreArticles) {
      return;
    }

    isLoadingMoreRef.current = true;
    setArticlesLoading(true);
    try {
      const nextPage = currentPage + 1;
      const articlesData = await AuthService.getMyLikedArticlesCorrect(nextPage, 20, userInfo.id);
      console.log(`[UserProfile] Loaded page ${nextPage} articles:`, articlesData);

      // Transform new articles
      const newTransformedArticles: ArticleData[] = articlesData.data.map(article => ({
        id: article.uuid,
        title: article.title,
        content: article.content,
        cover: article.coverUrl,
        author: {
          id: article.authorInfo?.id,
          name: article.authorInfo?.username,
          namespace: article.authorInfo?.namespace,
          avatar: article.authorInfo?.faceUrl
        },
        category: article.categoryInfo?.name || '',
        categoryColor: article.categoryInfo?.color,
        categoryId: article.categoryInfo?.id,
        userId: article.authorInfo?.id,
        isLiked: article.isLiked,
        likeCount: article.likeCount,
        createTime: article.createAt,
        publishTime: article.publishAt,
        link: article.targetUrl,
        viewCount: article.viewCount
      }));

      // Append new articles to existing ones
      setArticles(prev => [...prev, ...newTransformedArticles]);
      setCurrentPage(articlesData.pageIndex || nextPage);
      setHasMoreArticles(articlesData.pageIndex < articlesData.pageCount);

      console.log(`[UserProfile] Page ${nextPage} loaded, hasMore: ${articlesData.pageIndex < articlesData.pageCount}`);
    } catch (error) {
      console.error('[UserProfile] Failed to load more articles:', error);
      showToast('Failed to load more content', 'error');
    } finally {
      setArticlesLoading(false);
      isLoadingMoreRef.current = false;
    }
  }, [userInfo, hasMoreArticles, currentPage, showToast]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      // Skip if no more articles or already loading
      if (!hasMoreArticles || isLoadingMoreRef.current) {
        return;
      }

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrolledToBottom = scrollTop + windowHeight >= documentHeight - 1000; // Trigger 1000px early

      if (scrolledToBottom && userInfo) {
        loadMoreArticles();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMoreArticles, userInfo, loadMoreArticles]);

  // Handle like/treasure action
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

    // Always show the collect modal (whether liked or not)
    // User can uncollect from within the modal
    const article = articles.find(a => a.id === articleId);
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
    updateArticleLikeState(selectedArticle.uuid, true, newLikeCount);

    // Update selectedArticle state to reflect the change
    setSelectedArticle(prev => prev ? { ...prev, isLiked: true, likeCount: newLikeCount } : null);
  };

  // Handle user click (view other users)
  const handleUserClick = (userId: number) => {
    // Already on this user's profile page, don't navigate if clicking same user
    if (userInfo && userId === userInfo.id) {
      return;
    }
    // Navigate to other user's profile page
    navigate(`/user/${namespace}`);
  };

  // Check if viewing own profile
  const isOwnProfile = user && userInfo && user.namespace === userInfo.namespace;

  // Debug information
  console.log('UserProfile Debug:', {
    user: user ? { id: user.id, namespace: user.namespace } : null,
    userInfo: userInfo ? { id: userInfo.id, namespace: userInfo.namespace } : null,
    isOwnProfile,
    requestedNamespace: namespace
  });

  // Handle cover image click
  const handleCoverClick = () => {
    if (isOwnProfile) {
      setShowCoverUploader(true);
    }
  };

  // Handle cover image upload success
  const handleCoverUploaded = async (imageUrl: string) => {
    try {
      // Call API to update user cover image
      await AuthService.updateUserInfo({
        coverUrl: imageUrl,
        bio: userInfo.bio,
        faceUrl: userInfo.faceUrl,
        userName: userInfo.username
      });

      // Update local state
      setUserInfo({
        ...userInfo,
        coverUrl: imageUrl
      });

      // Update user info in UserContext
      if (user && updateUser) {
        updateUser({
          ...user,
          coverUrl: imageUrl
        });
      }

      setShowCoverUploader(false);
      showToast('Cover image updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to update cover image:', error);
      showToast('Failed to update cover image, please try again', 'error');
    }
  };

  // Handle cover image upload error
  const handleCoverUploadError = (error: string) => {
    showToast(error, 'error');
  };

  // Handle avatar click to preview
  const handleAvatarClick = () => {
    if (userInfo?.faceUrl) {
      openPreview(userInfo.faceUrl, `${userInfo.username}'s avatar`);
    }
  };

  // Handle share
  const handleShare = () => {
    if (userInfo?.namespace) {
      const url = `${window.location.origin}/u/${userInfo.namespace}`;
      navigator.clipboard.writeText(url);
      showToast('Profile link copied to clipboard', 'success');
    }
  };

  if (loading) {
    return <ArticleListSkeleton />;
  }

  // If no userInfo after loading, this shouldn't happen as we set default in error handler
  if (!userInfo) {
    return (
      <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            User not found
          </h1>
          <p className="text-gray-600 mb-6">
            The user you are looking for might not exist or has been removed.
          </p>
          <Link
            to="/"
            className="px-6 py-3 bg-red text-white rounded-full hover:bg-red/90 transition-colors font-medium inline-block"
          >
            Explore More Content
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-5 px-5 pt-0 pb-0 relative">
      {/* User info header */}
      <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Cover image */}
        <div className="w-full h-48 overflow-hidden rounded-t-2xl bg-gradient-to-r from-blue-100 to-purple-100 relative group">
          {userInfo.coverUrl || defaultBanner ? (
            <>
              <div
                className={`w-full h-full bg-cover bg-center bg-no-repeat hover:scale-105 transition-all duration-300 ${
                  isOwnProfile ? 'cursor-pointer' : ''
                } ${
                  bannerImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: `url(${userInfo.coverUrl || defaultBanner})`,
                  backgroundColor: '#f3f4f6'
                }}
                onClick={handleCoverClick}
              />
              {showBannerLoadingSpinner && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                </div>
              )}
            </>
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center ${
                isOwnProfile ? 'cursor-pointer' : ''
              }`}
              onClick={isOwnProfile ? handleCoverClick : undefined}
            >
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span className="text-sm font-medium">Add cover image</span>
              </div>
            </div>
          )}
          {/* Edit overlay - only shown on own profile */}
          {isOwnProfile && (
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="bg-white bg-opacity-90 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* User information */}
        <div className="p-8 mt-[-64px] relative">
          <div className="flex items-start gap-8">
            <img
              src={userInfo.faceUrl}
              alt={userInfo.username}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={handleAvatarClick}
            />
          <div className="flex-1 pt-8">
            <div className="flex items-center gap-4 mb-1">
              <h1 className="text-3xl font-bold text-gray-900">{userInfo.username}</h1>
              <button
                type="button"
                aria-label="Share profile"
                className="relative flex-[0_0_auto] hover:opacity-70 transition-opacity"
                onClick={handleShare}
              >
                <img
                  alt="Share"
                  src="https://c.animaapp.com/V3VIhpjY/img/share.svg"
                  className="w-5 h-5"
                />
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">@{userInfo.namespace}</p>
            <p className="text-gray-700 mb-6">{userInfo.bio}</p>

            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userInfo.statistics?.articleCount || 0}</div>
                <div className="text-sm text-gray-600">Articles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userInfo.statistics?.likedArticleCount || 0}</div>
                <div className="text-sm text-gray-600">Treasured</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userInfo.statistics?.myArticleLikedCount || 0}</div>
                <div className="text-sm text-gray-600">Received</div>
              </div>
            </div>
          </div>

          {/* Subscribe button or account status (only shown when viewing other users) */}
          {user && user.namespace !== namespace && (
            <button
              className={`px-6 py-2 rounded-full transition-colors ${
                accountExists
                  ? 'bg-red text-white hover:bg-red/90'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
              disabled={!accountExists}
            >
              {accountExists ? 'Subscribe' : "This account doesn't exist"}
            </button>
          )}
          </div>
        </div>
      </section>

      {/* Category tabs */}
      <section className="flex gap-4">
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
          All Articles
        </button>
        <button className="px-4 py-2 bg-red text-white rounded-full">
          Treasured
        </button>
      </section>

      {/* Articles list */}
      <section
        className="w-full"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '2rem'
        }}
      >
        {articles.map((article) => {
          // Check if this is the current user's own article
          const isOwnArticle = user && user.id === article.userId;

          // Use global state management to get correct like state, same as other components
          const articleLikeState = getArticleLikeState(article.id, article.isLiked, article.likeCount);

          // Update article data with global state like information
          const articleWithUpdatedState = {
            ...article,
            isLiked: articleLikeState.isLiked,
            likeCount: articleLikeState.likeCount
          };


          return (
            <ArticleCard
              key={article.id}
              article={articleWithUpdatedState}
              layout="treasury"
              actions={{
                showTreasure: true, // Show treasure button for all articles
                showVisits: true,
                showWebsite: true
              }}
              onLike={handleLike}
              onUserClick={handleUserClick}
            />
          );
        })}
      </section>

      {articles.length === 0 && userInfo && (
        <div className="text-center py-20">
          <p className="text-gray-500">
            {userInfo.statistics?.articleCount > 0
              ? `${userInfo.username} has created ${userInfo.statistics.articleCount} articles, not shown here yet`
              : `${userInfo.username} hasn't published any articles yet`}
          </p>
        </div>
      )}

      {/* Loading indicator for pagination */}
      {articlesLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg text-gray-600">Loading more articles...</div>
        </div>
      )}

      {/* No more content hint */}
      {!articlesLoading && !hasMoreArticles && articles.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">You've reached the bottom! No more articles to load.</div>
        </div>
      )}

      {/* Cover image upload component */}
      {showCoverUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4 text-center">Change Cover Image</h3>
            <ImageUploader
              type="banner"
              currentImage={userInfo.coverUrl}
              onImageUploaded={handleCoverUploaded}
              onError={handleCoverUploadError}
            />
            <button
              onClick={() => setShowCoverUploader(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
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