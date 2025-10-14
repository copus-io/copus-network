import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import { ArticleCard, ArticleData } from "../../../components/ArticleCard";
import { AuthService } from "../../../services/authService";
import { ArticleListSkeleton } from "../../../components/ui/skeleton";
import { useToast } from "../../../components/ui/toast";

interface UserProfileContentProps {
  namespace: string;
}

export const UserProfileContent: React.FC<UserProfileContentProps> = ({ namespace }) => {
  const navigate = useNavigate();
  const { user, toggleLike } = useUser();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [articles, setArticles] = useState<ArticleData[]>([]);

  // 获取用户信息和文章列表
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // 调用真实API获取用户信息
        const userData = await AuthService.getOtherUserTreasuryInfoByNamespace(namespace);
        console.log('获取到的用户数据:', userData);

        // 设置用户信息，使用API返回的真实数据
        setUserInfo({
          id: userData.id,
          username: userData.username,
          namespace: userData.namespace,
          faceUrl: userData.faceUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}&backgroundColor=b6e3f4`,
          bio: userData.bio || "这个用户很神秘，什么都没留下~",
          articlesCount: userData.statistics.articleCount,
          followersCount: 0, // API暂不提供关注者数据
          followingCount: 0, // API暂不提供关注数据
          // 额外保存API返回的其他数据
          socialLinks: userData.socialLinks,
          statistics: userData.statistics,
          email: userData.email,
          coverUrl: userData.coverUrl,
          walletAddress: userData.walletAddress
        });

        // TODO: 获取用户创建的文章列表 (目前API可能还不支持通过namespace获取用户文章)
        // 暂时显示空列表，但保留用户统计信息展示
        setArticles([]);
      } catch (error) {
        console.error("获取用户数据失败:", error);
        showToast("无法加载用户信息", "error");
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

  if (loading) {
    return <ArticleListSkeleton />;
  }

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">用户不存在</h2>
          <p className="text-gray-500 mb-4">未找到 @{namespace} 的个人主页</p>
          <button
            onClick={() => navigate('/discovery')}
            className="px-4 py-2 bg-red text-white rounded-lg hover:bg-red/90 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-10 px-5 py-0 relative">
      {/* 用户信息头部 */}
      <section className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-start gap-8">
          <img
            src={userInfo.faceUrl}
            alt={userInfo.username}
            className="w-32 h-32 rounded-full border-4 border-gray-100"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{userInfo.username}</h1>
            <p className="text-gray-600 mb-4">@{userInfo.namespace}</p>
            <p className="text-gray-700 mb-6">{userInfo.bio}</p>

            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userInfo.statistics?.articleCount || 0}</div>
                <div className="text-sm text-gray-600">创作文章</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userInfo.statistics?.likedArticleCount || 0}</div>
                <div className="text-sm text-gray-600">收藏文章</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userInfo.statistics?.myArticleLikedCount || 0}</div>
                <div className="text-sm text-gray-600">获得收藏</div>
              </div>
            </div>
          </div>

          {/* 关注按钮（仅在查看其他用户时显示） */}
          {user && user.namespace !== namespace && (
            <button className="px-6 py-2 bg-red text-white rounded-full hover:bg-red/90 transition-colors">
              关注
            </button>
          )}
        </div>
      </section>

      {/* 分类标签 */}
      <section className="flex gap-4">
        <button className="px-4 py-2 bg-red text-white rounded-full">
          全部文章
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
          收藏的文章
        </button>
      </section>

      {/* 文章列表 */}
      <section className="grid grid-cols-2 gap-8">
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
    </main>
  );
};