import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import { useImagePreview } from "../../../contexts/ImagePreviewContext";
import { ArticleCard, ArticleData } from "../../../components/ArticleCard";
import { AuthService } from "../../../services/authService";
import { ArticleListSkeleton } from "../../../components/ui/skeleton";
import { useToast } from "../../../components/ui/toast";
import { ImageUploader } from "../../../components/ImageUploader/ImageUploader";
import profileDefaultAvatar from "../../../assets/images/profile-default.svg";

interface UserProfileContentProps {
  namespace: string;
}

export const UserProfileContent: React.FC<UserProfileContentProps> = ({ namespace }) => {
  const navigate = useNavigate();
  const { user, toggleLike, updateUser } = useUser();
  const { openPreview } = useImagePreview();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [showCoverUploader, setShowCoverUploader] = useState(false);
  const [accountExists, setAccountExists] = useState(true);

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

        // Set user info using real API data
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

        console.log('[UserProfile] User info set successfully, now fetching liked articles...');

        // Fetch user's liked articles using targetUserId
        const articlesData = await AuthService.getMyLikedArticlesCorrect(1, 20, userData.id);
        console.log('[UserProfile] Successfully fetched liked articles:', articlesData);

        // Transform API data to ArticleData format
        const transformedArticles: ArticleData[] = articlesData.data.map(article => ({
          id: article.uuid,
          title: article.title,
          content: article.content,
          cover: article.coverUrl,
          author: {
            id: article.authorInfo.id,
            name: article.authorInfo.username,
            namespace: article.authorInfo.namespace,
            avatar: article.authorInfo.faceUrl
          },
          category: article.categoryInfo.name,
          categoryColor: article.categoryInfo.color,
          categoryId: article.categoryInfo.id,
          userId: article.authorInfo.id,
          isLiked: article.isLiked,
          likeCount: article.likeCount,
          createTime: article.createAt,
          publishTime: article.publishAt,
          link: article.targetUrl,
          viewCount: article.viewCount
        }));

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

    await toggleLike(articleId, currentIsLiked, currentLikeCount);
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
    <main className="flex flex-col gap-10 px-5 py-0 relative">
      {/* User info header */}
      <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Cover image */}
        <div className="w-full h-48 overflow-hidden rounded-t-2xl bg-gradient-to-r from-blue-100 to-purple-100 relative group">
          <img
            src={userInfo.coverUrl || 'https://c.animaapp.com/w7obk4mX/img/banner.png'}
            alt="Cover"
            className={`w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300 ${
              isOwnProfile ? 'cursor-pointer' : ''
            }`}
            onClick={handleCoverClick}
          />
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
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{userInfo.username}</h1>
            <p className="text-gray-600 mb-4">@{userInfo.namespace}</p>
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

          {/* Follow button or account status (only shown when viewing other users) */}
          {user && user.namespace !== namespace && (
            <button
              className={`px-6 py-2 rounded-full transition-colors ${
                accountExists
                  ? 'bg-red text-white hover:bg-red/90'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
              disabled={!accountExists}
            >
              {accountExists ? 'Follow' : "This account doesn't exist"}
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(408px, 1fr))',
          gap: '2rem'
        }}
      >
        {articles.map((article) => {
          // Check if this is the current user's own article
          const isOwnArticle = user && user.id === article.userId;

          return (
            <ArticleCard
              key={article.id}
              article={article}
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
    </main>
  );
};