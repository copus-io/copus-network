import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  // Fetch user info and articles list
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Call API to get user information
        const userData = await AuthService.getOtherUserTreasuryInfoByNamespace(namespace);
        console.log('Fetched user data:', userData);

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

        // Fetch user's liked articles using targetUserId
        const articlesData = await AuthService.getMyLikedArticlesCorrect(1, 20, userData.id);
        console.log('Fetched liked articles:', articlesData);

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
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        showToast("Unable to load user information", "error");
      } finally {
        setLoading(false);
      }
    };

    if (namespace) {
      fetchUserData();
    }
  }, [namespace, showToast]);

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

  // 处理用户点击（查看其他用户）
  const handleUserClick = (userId: number) => {
    // 这里已经在用户的个人主页了，点击同一个用户不做跳转
    if (userInfo && userId === userInfo.id) {
      return;
    }
    // 跳转到其他用户的主页
    navigate(`/user/${namespace}`);
  };

  // 检查是否是当前用户自己的资料页
  const isOwnProfile = user && userInfo && user.namespace === userInfo.namespace;

  // 调试信息
  console.log('UserProfile Debug:', {
    user: user ? { id: user.id, namespace: user.namespace } : null,
    userInfo: userInfo ? { id: userInfo.id, namespace: userInfo.namespace } : null,
    isOwnProfile,
    requestedNamespace: namespace
  });

  // 处理封面图点击事件
  const handleCoverClick = () => {
    if (isOwnProfile) {
      setShowCoverUploader(true);
    }
  };

  // 处理封面图上传成功
  const handleCoverUploaded = async (imageUrl: string) => {
    try {
      // 调用API更新用户封面图
      await AuthService.updateUserInfo({
        coverUrl: imageUrl
      });

      // 更新本地状态
      setUserInfo({
        ...userInfo,
        coverUrl: imageUrl
      });

      // 更新UserContext中的用户信息
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

  // 处理封面图上传错误
  const handleCoverUploadError = (error: string) => {
    showToast(error, 'error');
  };

  // 处理头像点击预览
  const handleAvatarClick = () => {
    if (userInfo?.faceUrl) {
      openPreview(userInfo.faceUrl, `${userInfo.username}'s avatar`);
    }
  };

  if (loading) {
    return <ArticleListSkeleton />;
  }

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">User Not Found</h2>
          <p className="text-gray-500 mb-4">Could not find profile for @{namespace}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-red text-white rounded-lg hover:bg-red/90 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-10 px-5 py-0 relative">
      {/* 用户信息头部 */}
      <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* 封面图片 */}
        <div className="w-full h-48 overflow-hidden rounded-t-2xl bg-gradient-to-r from-blue-100 to-purple-100 relative group">
          <img
            src={userInfo.coverUrl || 'https://c.animaapp.com/w7obk4mX/img/banner.png'}
            alt="Cover"
            className={`w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300 ${
              isOwnProfile ? 'cursor-pointer' : ''
            }`}
            onClick={handleCoverClick}
          />
          {/* 编辑提示覆盖层 - 仅在自己的资料页时显示 */}
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

        {/* 用户信息 */}
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

          {/* Follow button (only shown when viewing other users) */}
          {user && user.namespace !== namespace && (
            <button className="px-6 py-2 bg-red text-white rounded-full hover:bg-red/90 transition-colors">
              Follow
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

      {/* 文章列表 */}
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
              ? `${userInfo.username} 已创作 ${userInfo.statistics.articleCount} 篇文章，暂未在此展示`
              : `${userInfo.username} 还没有发布任何文章`}
          </p>
        </div>
      )}

      {/* 封面图片上传组件 */}
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