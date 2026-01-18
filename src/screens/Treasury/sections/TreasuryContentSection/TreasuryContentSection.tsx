import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { AuthService } from "../../../../services/authService";
import { useUser } from "../../../../contexts/UserContext";
import { useImagePreview } from "../../../../contexts/ImagePreviewContext";
import { useToast } from "../../../../components/ui/toast";
import { ImageUploader } from "../../../../components/ImageUploader/ImageUploader";
import { NavigationTabsSection } from "../NavigationTabsSection";
import { CollectionSection, CollectionItem } from "../CollectionSection";
import profileDefaultAvatar from "../../../../assets/images/profile-default.svg";
import defaultBanner from "../../../../assets/images/default-banner.svg";

interface TreasuryArticle {
  id: string;
  uuid: string;
  title: string;
  coverImage: string;
  targetUrl: string;
  category?: string;
}

export const TreasuryContentSection = (): JSX.Element => {
  const { user, socialLinks, fetchSocialLinks, updateUser } = useUser();
  const { openPreview } = useImagePreview();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"collections" | "curations">("collections");

  // Cover image states
  const [showCoverUploader, setShowCoverUploader] = useState(false);
  const [bannerImageLoaded, setBannerImageLoaded] = useState(false);
  const [showBannerLoadingSpinner, setShowBannerLoadingSpinner] = useState(false);

  // Fetch social links when page loads (since we don't fetch them globally anymore)
  useEffect(() => {
    if (user) {
      fetchSocialLinks();
    }
  }, [user, fetchSocialLinks]);
  const [likedArticles, setLikedArticles] = useState<TreasuryArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [treasuryStats, setTreasuryStats] = useState({
    likedArticleCount: 0,
    articleCount: 0,
    myArticleLikedCount: 0
  });

  // Smart Banner image load detection
  const checkBannerImageLoad = useCallback((imageUrl: string) => {
    if (!imageUrl || imageUrl === defaultBanner) {
      setBannerImageLoaded(true);
      setShowBannerLoadingSpinner(false);
      return;
    }

    setBannerImageLoaded(false);
    setShowBannerLoadingSpinner(false);

    let isLoaded = false;

    // Delay 300ms to show loading, if image loads quickly don't show loading
    const loadingTimer = setTimeout(() => {
      if (!isLoaded) {
        setShowBannerLoadingSpinner(true);
      }
    }, 300);

    // Create new image object to detect load
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
      setBannerImageLoaded(true);
      setShowBannerLoadingSpinner(false);
    };
    img.src = imageUrl;

    return () => clearTimeout(loadingTimer);
  }, []);

  // Check banner image load when user data is available
  useEffect(() => {
    if (user?.coverUrl) {
      checkBannerImageLoad(user.coverUrl);
    } else {
      setBannerImageLoaded(true);
    }
  }, [user?.coverUrl, checkBannerImageLoad]);

  // Fetch user's liked articles
  useEffect(() => {
    const fetchLikedArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        const [treasuryInfoResponse, likedArticlesResponse] = await Promise.all([
          AuthService.getUserTreasuryInfo(),
          AuthService.getUserLikedArticles(1, 20),
        ]);
        console.log('Treasury - treasuryInfoResponse:', treasuryInfoResponse);
        console.log('Treasury - likedArticlesResponse:', likedArticlesResponse);

        // Process stats
        const treasuryInfo = treasuryInfoResponse.data || treasuryInfoResponse;
        if (treasuryInfo.statistics) {
          setTreasuryStats(treasuryInfo.statistics);
        }

        // Process articles list - handle null response (no token case)
        if (!likedArticlesResponse) {
          console.log('Treasury - likedArticlesResponse is null (no token?)');
          setLikedArticles([]);
          setLoading(false);
          return;
        }

        const articlesData = likedArticlesResponse?.data || likedArticlesResponse;
        console.log('Treasury - Raw likedArticlesResponse:', likedArticlesResponse);
        console.log('Treasury - articlesData:', articlesData);

        let articlesArray = [];
        if (articlesData && Array.isArray(articlesData.data)) {
          articlesArray = articlesData.data;
        } else if (Array.isArray(articlesData)) {
          articlesArray = articlesData;
        }
        console.log('Treasury - articlesArray length:', articlesArray.length);
        console.log('Treasury - current user id:', user?.id);

        const articles = articlesArray
          .filter((article: any) => {
            const keep = !user || article.authorInfo?.id !== user?.id;
            if (!keep) {
              console.log('Treasury - Filtering out article (author is current user):', article.title, article.authorInfo?.id);
            }
            return keep;
          })
          .sort((a: any, b: any) => (b.createAt || 0) - (a.createAt || 0))
          .map((article: any): TreasuryArticle => ({
            id: article.uuid,
            uuid: article.uuid,
            title: article.title,
            coverImage: article.coverUrl,
            targetUrl: article.targetUrl || '',
            category: article.categoryInfo?.name || 'General',
          }));

        setLikedArticles(articles);
        window.scrollTo({ top: 0, behavior: 'smooth' });

      } catch (error) {
        console.error('Failed to fetch liked articles:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch liked articles';
        setError(errorMessage);
        showToast('Failed to fetch treasury data, please try again', 'error');
        setLikedArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedArticles();
  }, []);

  // Handle share
  const handleShare = () => {
    if (user?.namespace) {
      const url = `${window.location.origin}/u/${user.namespace}`;
      navigator.clipboard.writeText(url);
      showToast('Profile link copied to clipboard', 'success');
    }
  };

  // Handle cover image click
  const handleCoverClick = () => {
    setShowCoverUploader(true);
  };

  // Handle cover image upload success
  const handleCoverUploaded = async (imageUrl: string) => {
    try {
      await AuthService.updateUserInfo({
        coverUrl: imageUrl,
        bio: user?.bio || '',
        faceUrl: user?.faceUrl || '',
        userName: user?.username || ''
      });

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
    if (user?.faceUrl) {
      openPreview(user.faceUrl, `${user.username}'s avatar`);
    }
  };

  // Group articles by category for collections view
  const getCollectionsByCategory = (): { title: string; items: CollectionItem[] }[] => {
    const categoryMap = new Map<string, TreasuryArticle[]>();

    likedArticles.forEach(article => {
      const category = article.category || 'General';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(article);
    });

    return Array.from(categoryMap.entries()).map(([category, articles]) => ({
      title: category,
      items: articles.map(article => {
        // Extract hostname from targetUrl if available
        let website = '';
        if (article.targetUrl) {
          try {
            website = new URL(article.targetUrl).hostname.replace('www.', '');
          } catch {
            website = '';
          }
        }
        return {
          id: article.id,
          title: article.title,
          url: article.targetUrl || '',
          website, // Extracted hostname for display
          coverImage: article.coverImage,
        };
      }),
    }));
  };

  if (loading) {
    return (
      <main className="flex flex-col items-start gap-5 pl-[60px] pr-10 pt-0 pb-[30px] relative min-h-screen">
        <div className="flex items-center justify-center w-full h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </main>
    );
  }

  if (error) {
    const isAuthError = error.includes('auth') || error.includes('login');

    return (
      <main className="flex flex-col items-start gap-5 pl-[60px] pr-10 pt-0 pb-[30px] relative min-h-screen">
        <div className="flex flex-col items-center justify-center w-full h-64 text-center gap-4">
          <div className={isAuthError ? "text-yellow-600" : "text-red-500"}>
            {error}
          </div>
          {isAuthError && (
            <div className="flex gap-3">
              <Button
                onClick={() => { window.location.href = '/login'; }}
                className="bg-red hover:bg-red/90 text-white px-6 py-2 rounded-lg"
              >
                Login Again
              </Button>
              <Link to="/">
                <Button variant="outline" className="px-6 py-2 rounded-lg">
                  Back to Home
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    );
  }

  const collections = getCollectionsByCategory();

  return (
    <main className="flex flex-col gap-5 px-5 py-0 relative">
      {/* User info header - matching UserProfileContent layout */}
      <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Cover image */}
        <div className="w-full h-48 overflow-hidden rounded-t-2xl bg-gradient-to-r from-blue-100 to-purple-100 relative group">
          {user?.coverUrl || defaultBanner ? (
            <>
              <div
                className={`w-full h-full bg-cover bg-center bg-no-repeat hover:scale-105 transition-all duration-300 cursor-pointer ${
                  bannerImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: `url(${user?.coverUrl || defaultBanner})`,
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
              className="w-full h-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center cursor-pointer"
              onClick={handleCoverClick}
            >
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span className="text-sm font-medium">Add cover image</span>
              </div>
            </div>
          )}
          {/* Edit overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white bg-opacity-90 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* User information */}
        <div className="p-8 mt-[-64px] relative">
          <div className="flex items-start gap-8">
            <img
              src={user?.faceUrl || profileDefaultAvatar}
              alt={user?.username || 'User'}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={handleAvatarClick}
            />
            <div className="flex-1 pt-8">
              <div className="flex items-center gap-4 mb-1">
                <h1 className="text-3xl font-bold text-gray-900">{user?.username || 'Anonymous'}</h1>
                <button
                  type="button"
                  aria-label="Share profile"
                  className="relative flex-[0_0_auto] hover:opacity-70 transition-opacity"
                  onClick={handleShare}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 6.667a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM15 18.333a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM7.158 11.258l5.692 3.317M12.842 5.425l-5.684 3.317" stroke="#686868" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-4">@{user?.namespace || 'user'}</p>
              {user?.bio && <p className="text-gray-700 mb-6">{user.bio}</p>}

              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{treasuryStats.articleCount || 0}</div>
                  <div className="text-sm text-gray-600">Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{treasuryStats.likedArticleCount || 0}</div>
                  <div className="text-sm text-gray-600">Treasured</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{treasuryStats.myArticleLikedCount || 0}</div>
                  <div className="text-sm text-gray-600">Received</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs and Content */}
      <div className="flex flex-col items-start gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
        <NavigationTabsSection
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === "collections" ? (
          <div className="w-full">
            {collections.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full h-64 text-center">
                <img
                  className="w-16 h-16 mb-4 opacity-50"
                  alt="Empty treasure"
                  src="https://c.animaapp.com/mft5gmofxQLTNf/img/treasure-icon.svg"
                />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Your treasury is empty</h3>
                <p className="text-gray-500 mb-4">Like articles you enjoy and they will appear here</p>
                <Link
                  to="/"
                  className="px-4 py-2 bg-red text-white rounded-lg hover:bg-red/90 transition-colors"
                >
                  Discover Content
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 w-full">
                {collections.map((collection, index) => (
                  <CollectionSection
                    key={collection.title}
                    title={collection.title}
                    treasureCount={collection.items.length}
                    items={collection.items}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-64 text-center">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Curations coming soon</h3>
            <p className="text-gray-500">Create and share your own curated collections</p>
          </div>
        )}
      </div>

      {/* Cover image upload component */}
      {showCoverUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4 text-center">Change Cover Image</h3>
            <ImageUploader
              type="banner"
              currentImage={user?.coverUrl}
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
    </main>
  );
};
