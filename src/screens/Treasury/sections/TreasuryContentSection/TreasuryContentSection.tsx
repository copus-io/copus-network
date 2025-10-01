import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { AuthService } from "../../../../services/authService";
import { useUser } from "../../../../contexts/UserContext";
import { useToast } from "../../../../components/ui/toast";
import { getCategoryStyle, formatCount, formatDate } from "../../../../utils/categoryStyles";
import { Article } from "../../../../types/article";

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

interface TreasuryArticle {
  id: string;
  uuid: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  userName: string;
  userAvatar: string;
  date: string;
  treasureCount: number;
  visitCount: string;
  isLiked: boolean;
  targetUrl: string;
  website: string;
}

export const TreasuryContentSection = (): JSX.Element => {
  const { user, articleLikeStates } = useUser();
  const { showToast } = useToast();
  const [likedArticles, setLikedArticles] = useState<TreasuryArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [treasuryStats, setTreasuryStats] = useState({
    likedArticleCount: 0,
    articleCount: 0,
    myArticleLikedCount: 0
  });

  // 用户社交链接数据（只读显示）
  const [socialLinksData, setSocialLinksData] = useState<Array<{
    iconUrl: string;
    id: number;
    linkUrl: string;
    sortOrder: number;
    title: string;
    userId: number;
  }>>([]);

  // 获取用户收藏的文章
  useEffect(() => {
    const fetchLikedArticles = async () => {
      console.log('🔍 宝藏页面初始化检查:');
      console.log('👤 用户状态:', user ? '已登录' : '未登录');
      console.log('👤 用户信息:', user);

      if (!user) {
        console.log('⚠️ 用户未登录，清空收藏列表');
        setLikedArticles([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('🏆 获取用户收藏的文章...');

        // 同时获取宝藏信息、收藏文章列表和社交链接
        const [treasuryInfoResponse, likedArticlesResponse, socialLinksResponse] = await Promise.all([
          AuthService.getUserTreasuryInfo(),
          AuthService.getUserLikedArticles(1, 20), // 获取前20篇文章
          AuthService.getUserSocialLinks() // 获取社交链接
        ]);

        console.log('🏆 用户宝藏信息响应:', treasuryInfoResponse);
        console.log('📚 用户收藏文章响应:', likedArticlesResponse);
        console.log('🔗 用户社交链接响应:', socialLinksResponse);

        // 处理统计信息
        const treasuryInfo = treasuryInfoResponse.data || treasuryInfoResponse;
        if (treasuryInfo.statistics) {
          setTreasuryStats(treasuryInfo.statistics);
          console.log(`🎉 用户共收藏了 ${treasuryInfo.statistics.likedArticleCount} 篇文章`);
        }

        // 处理社交链接数据
        const socialLinksArray = socialLinksResponse.data || socialLinksResponse || [];
        if (Array.isArray(socialLinksArray)) {
          setSocialLinksData(socialLinksArray);
          console.log(`🔗 用户共有 ${socialLinksArray.length} 个社交链接`);
        } else {
          console.log('⚠️ 社交链接数据格式异常:', socialLinksArray);
        }

        // 处理文章列表，转换为组件需要的格式
        const articlesData = likedArticlesResponse.data || likedArticlesResponse;
        console.log('📝 原始文章数据结构:', articlesData);
        console.log('📝 文章数据类型:', typeof articlesData);
        console.log('📝 是否有data字段:', 'data' in articlesData);

        // 尝试多种可能的数据结构
        let articlesArray = [];
        if (articlesData && Array.isArray(articlesData.data)) {
          // 标准结构：{ data: [...] }
          articlesArray = articlesData.data;
          console.log('✅ 使用标准结构 articlesData.data');
        } else if (Array.isArray(articlesData)) {
          // 直接是数组：[...]
          articlesArray = articlesData;
          console.log('✅ 使用数组结构 articlesData');
        } else {
          console.warn('⚠️ 未识别的数据结构:', articlesData);
          articlesArray = [];
        }

        console.log('📊 找到的文章数量:', articlesArray.length);

        const articles = articlesArray.map((article: any, index: number): TreasuryArticle => {
          console.log(`📝 处理第${index + 1}篇文章:`, article.title);

          try {
            return {
              id: article.uuid,
              uuid: article.uuid,
              title: article.title,
              description: article.content,
              coverImage: article.coverUrl,
              category: article.categoryInfo?.name || 'General',
              userName: article.authorInfo?.username || 'Anonymous',
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
        console.log('🎯 转换后的收藏文章:', articles);
        console.log('🎯 最终文章数量:', articles.length);

      } catch (error) {
        console.error('❌ 获取收藏文章失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取收藏文章失败';

        // 检查是否是认证相关错误
        if (errorMessage.includes('认证失败') || errorMessage.includes('重新登录') || errorMessage.includes('token')) {
          console.log('🎭 认证失败，切换到Demo模式');
          setIsDemoMode(true);
          setError(null); // 清除错误状态

          // 加载Demo数据
          const demoData = getDemoTreasuryData();
          setTreasuryStats(demoData.treasuryStats);
          setSocialLinksData(demoData.socialLinks);
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

  // 监听全局点赞状态变化，动态更新收藏列表
  useEffect(() => {
    if (Object.keys(articleLikeStates).length > 0) {
      console.log('🔄 检测到全局点赞状态变化，更新宝藏页面');
      // 这里可以添加逻辑来实时同步新点赞的文章
    }
  }, [articleLikeStates]);

  // 渲染单个文章卡片
  const renderArticleCard = (article: TreasuryArticle) => {
    const categoryStyle = getCategoryStyle(article.category);

    return (
      <div key={article.id} className="flex flex-col gap-10 pt-0 pb-5 flex-1 rounded-[0px_0px_25px_25px]">
        <Link to={`/content/${article.id}`}>
          <Card className="bg-white rounded-lg border-0 shadow-none hover:shadow-[1px_1px_10px_#c5c5c5] hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-all duration-200 cursor-pointer group">
            <CardContent className="flex flex-col gap-[25px] p-[30px]">
              <div className="flex flex-col gap-5">
                <div className="relative h-48 rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={article.coverImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 flex flex-col justify-between p-[15px]">
                    <Badge
                      variant="outline"
                      className={`inline-flex items-center gap-[5px] px-2.5 py-2 rounded-[50px] border border-solid ${categoryStyle.border} ${categoryStyle.bg} w-fit`}
                    >
                      <span className={`[font-family:'Lato',Helvetica] font-semibold text-sm tracking-[0] leading-[14px] ${categoryStyle.text}`}>
                        {article.category}
                      </span>
                    </Badge>

                    {/* 宝藏标记 */}
                    <div className="flex justify-end">
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#E19F1D] rounded-[10px]">
                        <img
                          className="w-3 h-3.5"
                          alt="Treasure icon"
                          src="https://c.animaapp.com/mft5gmofxQLTNf/img/treasure-icon.svg"
                          style={{ filter: 'brightness(0) invert(1)' }}
                        />
                        <span className="text-white text-xs font-medium">收藏</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-[15px]">
                  <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-xl tracking-[0] leading-7">
                    {article.title}
                  </h3>

                  <div className="flex flex-col gap-[15px] px-2.5 py-[15px] rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] group-hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.45)_0%,rgba(224,224,224,0.45)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-colors">
                    <p className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-[24px] line-clamp-2">
                      "{article.description}"
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          className="w-4 h-4 rounded-full object-cover"
                          src={article.userAvatar}
                          alt={article.userName}
                        />
                        <span className="[font-family:'Lato',Helvetica] font-medium text-medium-dark-grey text-sm tracking-[0] leading-[20px]">
                          {article.userName}
                        </span>
                      </div>
                      <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm tracking-[0] leading-[20px]">
                        {formatDate(article.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
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
                onClick={() => window.location.href = '/login'}
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
          {socialLinksData.length > 0 && (
            <div className="flex items-center gap-4 flex-wrap">
              {socialLinksData
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
              onClick={() => window.location.href = '/login'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[60px] w-full px-5">
          {likedArticles.map((article) => renderArticleCard(article))}
        </div>
      )}
    </div>
  );
};
