import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { AuthService } from "../../../../services/authService";
import { useUser } from "../../../../contexts/UserContext";
import { useToast } from "../../../../components/ui/toast";
import { formatDate } from "../../../../utils/categoryStyles";
import { ArticleCard, ArticleData } from "../../../../components/ArticleCard";

// Demo数据，用于token无效时的展示
const getDemoTreasuryData = () => ({
  treasuryStats: {
    likedArticleCount: 8,
    articleCount: 12,
    myArticleLikedCount: 145
  },
  articles: [
    {
      id: "demo-1",
      uuid: "demo-1",
      title: "探索未来Web3的创新应用",
      description: "深度解析区块链技术在社交媒体和内容创作领域的革新潜力，以及去中心化平台如何重塑创作者经济。",
      coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=240&fit=crop",
      category: "Technology",
      userName: "TechExplorer",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TechExplorer&backgroundColor=b6e3f4",
      date: "2024-12-15",
      treasureCount: 89,
      visitCount: "1.2k Visits",
      isLiked: true,
      targetUrl: "https://example.com/web3-innovation",
      website: "example.com"
    },
    {
      id: "demo-2",
      uuid: "demo-2",
      title: "设计思维在产品开发中的应用",
      description: "从用户需求出发，通过设计思维方法论，打造真正解决问题的产品。分享实战经验和案例分析。",
      coverImage: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=240&fit=crop",
      category: "Design",
      userName: "DesignGuru",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DesignGuru&backgroundColor=f4b6e3",
      date: "2024-12-14",
      treasureCount: 67,
      visitCount: "890 Visits",
      isLiked: true,
      targetUrl: "https://example.com/design-thinking",
      website: "example.com"
    },
    {
      id: "demo-3",
      uuid: "demo-3",
      title: "可持续发展：环保科技的新突破",
      description: "回顾2024年最具影响力的环保技术创新，从清洁能源到循环经济，看科技如何助力绿色未来。",
      coverImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=240&fit=crop",
      category: "Environment",
      userName: "EcoInnovator",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=EcoInnovator&backgroundColor=b6f4e3",
      date: "2024-12-13",
      treasureCount: 124,
      visitCount: "2.1k Visits",
      isLiked: true,
      targetUrl: "https://example.com/green-tech",
      website: "example.com"
    }
  ],
  socialLinks: [
    {
      id: 1,
      title: "Twitter",
      linkUrl: "https://twitter.com/copus_demo",
      iconUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg",
      sortOrder: 1,
      userId: 1
    },
    {
      id: 2,
      title: "Instagram",
      linkUrl: "https://instagram.com/copus_demo",
      iconUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
      sortOrder: 2,
      userId: 1
    }
  ]
});

interface TreasuryArticle extends ArticleData {
  // 继承ArticleData，保持类型一致性
}

export const TreasuryContentSection = (): JSX.Element => {
  const { user, articleLikeStates, socialLinks, getArticleLikeState, toggleLike } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [likedArticles, setLikedArticles] = useState<TreasuryArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [treasuryStats, setTreasuryStats] = useState({
    likedArticleCount: 0,
    articleCount: 0,
    myArticleLikedCount: 0
  });


  // 获取用户收藏的文章
  useEffect(() => {
    const fetchLikedArticles = async () => {

      if (!user) {
        setLikedArticles([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 同时获取宝藏信息和收藏文章列表
        const [treasuryInfoResponse, likedArticlesResponse] = await Promise.all([
          AuthService.getUserTreasuryInfo(),
          AuthService.getUserLikedArticles(1, 20), // 获取前20篇文章
        ]);


        // 处理统计信息
        const treasuryInfo = treasuryInfoResponse.data || treasuryInfoResponse;
        if (treasuryInfo.statistics) {
          setTreasuryStats(treasuryInfo.statistics);
        }

        // 社交链接数据直接从UserContext获取，无需额外API调用

        // 处理文章列表，转换为组件需要的格式
        const articlesData = likedArticlesResponse.data || likedArticlesResponse;

        // 尝试多种可能的数据结构
        let articlesArray = [];
        if (articlesData && Array.isArray(articlesData.data)) {
          // 标准结构：{ data: [...] }
          articlesArray = articlesData.data;
        } else if (Array.isArray(articlesData)) {
          // 直接是数组：[...]
          articlesArray = articlesData;
        } else {
          articlesArray = [];
        }


        const articles = articlesArray
          .filter((article: any) => {
            // Filter out user's own articles - users shouldn't see their own articles in collection
            return article.authorInfo?.id !== user?.id;
          })
          .sort((a: any, b: any) => {
            // Sort by creation time in descending order (newest first)
            return (b.createAt || 0) - (a.createAt || 0);
          })
          .map((article: any, index: number): TreasuryArticle => {

          try {
            return {
              id: article.uuid,
              uuid: article.uuid,
              title: article.title,
              description: article.content,
              coverImage: article.coverUrl,
              category: article.categoryInfo?.name || 'General',
              categoryColor: article.categoryInfo?.color,
              userName: article.authorInfo?.username || 'Anonymous',
              userId: article.authorInfo?.id,
              userAvatar: article.authorInfo?.faceUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.authorInfo?.username || 'user'}&backgroundColor=b6e3f4`,
              date: new Date(article.createAt * 1000).toLocaleDateString(),
              treasureCount: article.likeCount || 0,
              visitCount: `${article.viewCount || 0} Visits`,
              isLiked: article.isLiked || true, // 收藏页面的文章都是已点赞的
              targetUrl: article.targetUrl,
              website: article.targetUrl ? new URL(article.targetUrl).hostname.replace('www.', '') : 'website.com'
            };
          } catch (err) {
            console.error('❌ 转换文章数据失败:', err, article);
            return null;
          }
        }).filter(Boolean) as TreasuryArticle[]; // 过滤掉转换失败的文章

        setLikedArticles(articles);

        // Scroll to top when articles are loaded
        window.scrollTo({ top: 0, behavior: 'smooth' });

      } catch (error) {
        console.error('❌ 获取收藏文章失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取收藏文章失败';

        // 检查是否是认证相关错误
        if (errorMessage.includes('认证失败') || errorMessage.includes('重新登录') || errorMessage.includes('token')) {
          setIsDemoMode(true);
          setError(null); // 清除错误状态

          // 加载Demo数据
          const demoData = getDemoTreasuryData();
          setTreasuryStats(demoData.treasuryStats);
          setLikedArticles(demoData.articles as TreasuryArticle[]);

          showToast('😊 正在展示演示数据，登录后可查看真实宝藏', 'info');
        } else {
          setError(errorMessage);
          showToast('获取宝藏数据失败，请稍后重试', 'error');
          setLikedArticles([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLikedArticles();
  }, [user]);

  // Refresh collection when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Re-fetch collection when page becomes visible
        const fetchLikedArticles = async () => {
          try {
            const likedArticlesResponse = await AuthService.getUserLikedArticles(1, 20);
            const articlesData = likedArticlesResponse.data || likedArticlesResponse;

            let articlesArray = [];
            if (articlesData && Array.isArray(articlesData.data)) {
              articlesArray = articlesData.data;
            } else if (Array.isArray(articlesData)) {
              articlesArray = articlesData;
            }

            const articles = articlesArray
              .filter((article: any) => {
                // Filter out user's own articles
                return article.authorInfo?.id !== user?.id;
              })
              .sort((a: any, b: any) => {
                // Sort by creation time in descending order (newest first)
                return (b.createAt || 0) - (a.createAt || 0);
              })
              .map((article: any): TreasuryArticle => {
                return {
                  id: article.uuid,
                  uuid: article.uuid,
                  title: article.title,
                  description: article.content,
                  coverImage: article.coverUrl,
                  category: article.categoryInfo?.name || 'General',
                  categoryColor: article.categoryInfo?.color,
                  userName: article.authorInfo?.username || 'Anonymous',
                  userId: article.authorInfo?.id,
                  userAvatar: article.authorInfo?.faceUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.authorInfo?.username || 'user'}&backgroundColor=b6e3f4`,
                  date: new Date(article.createAt * 1000).toLocaleDateString(),
                  treasureCount: article.likeCount || 0,
                  visitCount: `${article.viewCount || 0} Visits`,
                  isLiked: article.isLiked || true,
                  targetUrl: article.targetUrl,
                  website: article.targetUrl ? new URL(article.targetUrl).hostname.replace('www.', '') : 'website.com'
                };
              });

            setLikedArticles(articles);

            // Scroll to top when collection is refreshed
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch (error) {
            console.error('Error refreshing collection:', error);
          }
        };

        fetchLikedArticles();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // 处理点赞
  const handleLike = async (articleId: string, currentIsLiked: boolean, currentLikeCount: number) => {
    if (!user) {
      showToast('请先登录', 'error');
      return;
    }

    // 使用全局toggleLike函数，包含乐观更新和API调用
    const result = await toggleLike(
      articleId,
      currentIsLiked,
      currentLikeCount,
      // 本地乐观更新回调（可选，因为全局状态已经处理了）
      (isLiked: boolean, likeCount: number) => {
        setLikedArticles(prev => prev.map(art =>
          art.id === articleId
            ? { ...art, isLiked, treasureCount: likeCount }
            : art
        ));
      }
    );

  };

  // 处理用户点击
  const handleUserClickInternal = (userId: number, userNamespace?: string) => {
    // 如果是当前用户自己的文章，跳转到我的宝藏页面
    if (user && user.id === userId) {
      navigate('/my-treasury');
    } else if (userNamespace) {
      // 如果有namespace，使用短链接格式
      navigate(`/u/${userNamespace}`);
    } else {
      // 如果没有namespace，使用userId作为降级方案
      navigate(`/user/${userId}/treasury`);
    }
  };

  // 渲染单个文章卡片
  const renderArticleCard = (article: TreasuryArticle) => {
    // 获取当前文章的点赞状态
    const articleLikeState = getArticleLikeState(article.id, article.isLiked, article.treasureCount);

    // 更新文章的点赞状态
    const articleData = {
      ...article,
      isLiked: articleLikeState.isLiked,
      treasureCount: articleLikeState.likeCount
    };

    // Check if this is the current user's own article
    const isOwnArticle = user && user.id === article.userId;

    // 创建包装函数来传递namespace信息
    const handleUserClickForArticle = (userId: number) => {
      handleUserClickInternal(userId, article.namespace || article.userNamespace);
    };

    return (
      <div key={article.id} className="flex flex-col gap-10 pt-0 pb-5 flex-1 rounded-[0px_0px_25px_25px]">
        <ArticleCard
          article={articleData}
          layout="treasury"
          actions={{
            showTreasure: true, // Show treasure button for all articles
            showVisits: true,
            showWebsite: true, // 显示网站信息
            showBranchIt: true // 显示Branch It图标
          }}
          onLike={handleLike}
          onUserClick={handleUserClickForArticle}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-start gap-[30px] py-5 min-h-screen">
        <header className="flex items-start justify-between w-full">
          <h1 className="font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] [font-style:var(--h-3-font-style)]">
            我的宝藏
          </h1>
        </header>
        <div className="flex items-center justify-center w-full h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes('认证') || error.includes('登录');

    return (
      <div className="flex flex-col items-start gap-[30px] py-5 min-h-screen">
        <header className="flex items-start justify-between w-full">
          <h1 className="font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] [font-style:var(--h-3-font-style)]">
            我的宝藏
          </h1>
        </header>
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
                重新登录
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="px-6 py-2 rounded-lg"
              >
                刷新页面
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-[30px] py-5 min-h-screen">
      <header className="flex items-start justify-between w-full">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] [font-style:var(--h-3-font-style)]">
              我的宝藏
            </h1>
            {isDemoMode && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-sm text-blue-700 font-medium">演示模式</span>
              </div>
            )}
          </div>

          {/* 社交链接显示区域（只读） */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-4 flex-wrap">
              {socialLinks
                .filter(link => link.linkUrl && link.linkUrl.trim())
                .map((link) => (
                  <a
                    key={link.id}
                    href={link.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors duration-200 group"
                    title={`访问 ${link.title}`}
                  >
                    <img
                      className="w-4 h-4 flex-shrink-0"
                      alt={`${link.title} logo`}
                      src={link.iconUrl || 'https://c.animaapp.com/w7obk4mX/img/link-icon.svg'}
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      {link.title}
                    </span>
                  </a>
                ))
              }
            </div>
          )}

          <p className="text-gray-600 text-base">
            {isDemoMode
              ? '🎭 演示数据：展示平台功能特色'
              : treasuryStats.likedArticleCount > 0
                ? `共收藏了 ${treasuryStats.likedArticleCount} 篇文章`
                : '还没有收藏任何文章'
            }
          </p>
        </div>

        {isDemoMode ? (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-10 gap-3 px-5 py-[15px] rounded-[100px] border-blue-400 text-blue-600 hover:bg-blue-50 transition-colors"
              onClick={() => showToast('演示模式下的功能预览', 'info')}
            >
              功能预览
            </Button>
            <Button
              className="h-10 gap-3 px-5 py-[15px] rounded-[100px] bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              onClick={() => { window.location.href = '/login'; }}
            >
              登录查看真实宝藏
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="h-10 gap-3 px-5 py-[15px] rounded-[100px] border-[#686868] font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] [font-style:var(--p-font-style)] hover:bg-gray-50 transition-colors"
            onClick={() => showToast('收藏管理功能开发中', 'info')}
          >
            管理收藏
          </Button>
        )}
      </header>

      {likedArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full h-64 text-center">
          <img
            className="w-16 h-16 mb-4 opacity-50"
            alt="Empty treasure"
            src="https://c.animaapp.com/mft5gmofxQLTNf/img/treasure-icon.svg"
          />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">宝藏空空如也</h3>
          <p className="text-gray-500 mb-4">点赞喜欢的文章，它们就会出现在这里</p>
          <Link
            to="/discovery"
            className="px-4 py-2 bg-yellow text-white rounded-lg hover:bg-yellow/90 transition-colors"
          >
            去发现好内容
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full px-5">
          {likedArticles.map((article) => renderArticleCard(article))}
        </div>
      )}
    </div>
  );
};
