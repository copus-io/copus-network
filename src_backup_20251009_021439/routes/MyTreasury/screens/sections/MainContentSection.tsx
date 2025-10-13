import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../contexts/UserContext";
import { useMyCreatedArticles } from "../../../../hooks/useMyCreatedArticles";
import { AuthService } from "../../../../services/authService";
import { Avatar, AvatarImage } from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { useToast } from "../../../../components/ui/toast";
import { ArticleCard, ArticleData } from "../../../../components/ArticleCard";
import { ImagePreviewModal } from "../../../../components/ui/image-preview-modal";


const collectionItems = [
  {
    id: 1,
    category: "Art",
    categoryColor:
      "border-[#2b8649] bg-[linear-gradient(0deg,rgba(43,134,73,0.2)_0%,rgba(43,134,73,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    categoryTextColor: "text-green",
    coverImage: "https://c.animaapp.com/mftam89xRJwsqQ/img/cover.png",
    title: "Window Swap",
    description: "Explore the world through window, what's inside?",
    url: "productdesign.com",
    userImage: "https://c.animaapp.com/mftam89xRJwsqQ/img/-profile-image-1.png",
    userName: "User Name",
    date: "Nov 15, 2022",
    treasureCount: "999",
    visitCount: "999 Visits",
    cardBg: "bg-white",
  },
  {
    id: 2,
    category: "Life",
    categoryColor:
      "border-[#ea7db7] bg-[linear-gradient(0deg,rgba(234,125,183,0.2)_0%,rgba(234,125,183,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    categoryTextColor: "text-pink",
    coverImage: "https://c.animaapp.com/mftam89xRJwsqQ/img/cover-1.png",
    title: "Window Swap",
    description: "Explore the world through window, what's inside?",
    url: "productdesign.com",
    userImage: "https://c.animaapp.com/mftam89xRJwsqQ/img/-profile-image-1.png",
    userName: "User Name",
    date: "Nov 15, 2022",
    treasureCount: "999",
    visitCount: "999 Visits",
    cardBg:
      "shadow-[1px_1px_10px_#c5c5c5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
  },
];

const myShareItems = [
  {
    id: 3,
    category: "Technology",
    categoryColor:
      "border-[#2191fb] bg-[linear-gradient(0deg,rgba(33,145,251,0.2)_0%,rgba(33,145,251,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    categoryTextColor: "text-blue",
    coverImage: "https://c.animaapp.com/mft5gmofxQLTNf/img/cover-1.png",
    title: "My Shared Content",
    description: "Content I've shared with the community",
    url: "mywebsite.com",
    userImage: "https://c.animaapp.com/mft4oqz6uyUKY7/img/profile.png",
    userName: "Sophiaaaaa",
    date: "Nov 20, 2022",
    treasureCount: "156",
    visitCount: "2.1k Visits",
    cardBg: "bg-white",
  },
  {
    id: 4,
    category: "Design",
    categoryColor:
      "border-[#e19e1d] bg-[linear-gradient(0deg,rgba(225,159,29,0.2)_0%,rgba(225,159,29,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    categoryTextColor: "text-yellow",
    coverImage: "https://c.animaapp.com/mft5gmofxQLTNf/img/cover-3.png",
    title: "Design Resources",
    description: "My favorite design tools and resources",
    url: "designtools.com",
    userImage: "https://c.animaapp.com/mft4oqz6uyUKY7/img/profile.png",
    userName: "Sophiaaaaa",
    date: "Nov 18, 2022",
    treasureCount: "89",
    visitCount: "1.5k Visits",
    cardBg: "bg-white",
  },
];

export const MainContentSection = (): JSX.Element => {
  const navigate = useNavigate();
  const { user, socialLinks: socialLinksData, getArticleLikeState, toggleLike } = useUser();
  const { showToast } = useToast();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // 图片预览相关状态
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewImageAlt, setPreviewImageAlt] = useState("");

  // 获取我创作的文章数据
  const { articles: myCreatedData, loading: myCreatedLoading, error: myCreatedError, refetch: refetchMyArticles } = useMyCreatedArticles({
    pageIndex: 0,
    pageSize: 10
  });

  // 宝藏页面状态管理
  const [likedArticles, setLikedArticles] = useState<any[]>([]);
  const [treasuryLoading, setTreasuryLoading] = useState(true);
  const [treasuryError, setTreasuryError] = useState<string | null>(null);
  const [treasuryStats, setTreasuryStats] = useState({
    likedArticleCount: 0,
    articleCount: 0,
    myArticleLikedCount: 0
  });

  // 获取用户收藏的文章
  useEffect(() => {
    const fetchLikedArticles = async () => {
      console.log('🔍 宝藏页面初始化检查:');
      console.log('👤 用户状态:', user ? '已登录' : '未登录');
      console.log('👤 用户信息:', user);

      if (!user) {
        console.log('⚠️ 用户未登录，清空收藏列表');
        setLikedArticles([]);
        setTreasuryLoading(false);
        return;
      }

      try {
        setTreasuryLoading(true);
        setTreasuryError(null);
        console.log('🏆 获取用户收藏的文章...');

        // 同时获取宝藏信息和收藏文章列表
        const [treasuryInfoResponse, likedArticlesResponse] = await Promise.all([
          AuthService.getUserTreasuryInfo(),
          AuthService.getUserLikedArticles(1, 20) // 获取前20篇文章
        ]);

        console.log('🏆 用户宝藏信息响应:', treasuryInfoResponse);
        console.log('📚 用户收藏文章响应:', likedArticlesResponse);

        // 处理统计信息
        const treasuryInfo = treasuryInfoResponse.data || treasuryInfoResponse;
        if (treasuryInfo.statistics) {
          setTreasuryStats(treasuryInfo.statistics);
          console.log(`🎉 用户共收藏了 ${treasuryInfo.statistics.likedArticleCount} 篇文章`);
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

        const articles = articlesArray.map((article: any, index: number) => {
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
        }).filter(Boolean); // 过滤掉转换失败的文章

        setLikedArticles(articles);
        console.log('🎯 转换后的收藏文章:', articles);
        console.log('🎯 最终文章数量:', articles.length);

      } catch (error) {
        console.error('❌ 获取收藏文章失败:', error);
        setTreasuryError('获取收藏文章失败');
        // 暂时使用空数组，避免页面崩溃
        setLikedArticles([]);
      } finally {
        setTreasuryLoading(false);
      }
    };

    fetchLikedArticles();
  }, [user]);

  // 将API数据转换为收藏卡片格式
  const transformLikedApiToCard = (article: any): ArticleData => {
    return {
      id: article.uuid,
      uuid: article.uuid,
      title: article.title,
      description: article.description,
      coverImage: article.coverImage || 'https://c.animaapp.com/mft5gmofxQLTNf/img/cover-1.png',
      category: article.category,
      categoryColor: article.categoryColor,
      userName: article.userName,
      userAvatar: article.userAvatar,
      userId: user?.id,
      date: article.date,
      treasureCount: article.treasureCount,
      visitCount: article.visitCount,
      isLiked: article.isLiked || true,
      targetUrl: article.targetUrl,
      website: article.website
    };
  };

  // 处理点赞
  const handleLike = async (articleId: string, currentIsLiked: boolean, currentLikeCount: number) => {
    if (!user) {
      showToast('请先登录', 'error');
      return;
    }
    await toggleLike(articleId, currentIsLiked, currentLikeCount);
  };

  // 处理用户点击
  const handleUserClick = (userId: number) => {
    if (user && user.id === userId) {
      // 自己的用户页面
      return;
    }
    // 其他用户页面的导航逻辑
  };

  // 处理头像点击预览
  const handleAvatarClick = () => {
    const avatarUrl = user?.faceUrl ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'vivi'}&backgroundColor=b6e3f4&hair=longHair&hairColor=724133&eyes=happy&mouth=smile&accessories=prescription01&accessoriesColor=262e33`;

    setPreviewImageUrl(avatarUrl);
    setPreviewImageAlt(`${user?.username || '用户'} 的头像`);
    setIsImagePreviewOpen(true);
  };

  // 关闭图片预览
  const handleCloseImagePreview = () => {
    setIsImagePreviewOpen(false);
    setPreviewImageUrl("");
    setPreviewImageAlt("");
  };

  const renderCard = (card: ArticleData) => {
    const articleLikeState = getArticleLikeState(card.id, card.isLiked || true, typeof card.treasureCount === 'string' ? parseInt(card.treasureCount) || 0 : card.treasureCount);

    // 更新文章的点赞状态
    const articleData = {
      ...card,
      isLiked: articleLikeState.isLiked,
      treasureCount: articleLikeState.likeCount
    };

    return (
      <ArticleCard
        key={card.id}
        article={articleData}
        layout="treasury"
        actions={{
          showTreasure: true,
          showVisits: true,
          showWebsite: true,
          showBranchIt: true
        }}
        onLike={handleLike}
        onUserClick={handleUserClick}
      />
    );
  };

  // 将API数据转换为我的分享卡片格式
  const transformApiToCard = (article: any): ArticleData => {
    return {
      id: article.uuid,
      uuid: article.uuid,
      title: article.title,
      description: article.content,
      coverImage: article.coverUrl || 'https://c.animaapp.com/mft5gmofxQLTNf/img/cover-1.png',
      category: article.categoryInfo?.name || 'General',
      categoryColor: article.categoryInfo?.color || 'gray',
      userName: article.authorInfo?.username || user?.username || 'Anonymous',
      userAvatar: article.authorInfo?.faceUrl || user?.faceUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}&backgroundColor=b6e3f4`,
      userId: user?.id,
      date: new Date(article.createAt * 1000).toLocaleDateString(),
      treasureCount: article.likeCount || 0,
      visitCount: `${article.viewCount || 0} Visits`,
      isLiked: false,
      targetUrl: article.targetUrl,
      website: article.targetUrl ? new URL(article.targetUrl).hostname.replace('www.', '') : 'website.com'
    };
  };

  // 处理编辑
  const handleEdit = (articleId: string) => {
    console.log('编辑文章:', articleId);
    // 导航到编辑页面，传递文章ID
    navigate(`/create?edit=${articleId}`);
  };

  // 处理删除
  const handleDelete = (articleId: string) => {
    const article = myCreatedData?.data.find(a => a.uuid === articleId);
    if (article) {
      const card = transformApiToCard(article);
      console.log('🗑️ 点击删除按钮, 文章信息:', card);
      setArticleToDelete(card);
      setDeleteDialogOpen(true);
    }
  };

  // 专门用于My Share标签的卡片渲染函数，支持悬浮编辑和删除
  const renderMyShareCard = (card: ArticleData) => (
    <ArticleCard
      key={card.id}
      article={card}
      layout="treasury"
      actions={{
        showTreasure: false, // My Share不显示点赞按钮
        showVisits: true,
        showWebsite: true,
        showEdit: true,
        showDelete: true
      }}
      isHovered={hoveredCard === card.id}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onUserClick={handleUserClick}
      onMouseEnter={() => setHoveredCard(card.id)}
      onMouseLeave={() => setHoveredCard(null)}
    />
  );

  // 处理删除文章
  const handleDeleteArticle = async () => {
    if (!articleToDelete) {
      console.log('❌ 没有要删除的文章');
      return;
    }

    console.log('🚀 开始删除文章:', articleToDelete);
    setIsDeleting(true);
    try {
      // 调用删除API
      console.log('📡 调用删除API, 文章ID:', articleToDelete.id);
      const deleteResult = await AuthService.deleteArticle(articleToDelete.id);

      console.log('📋 删除API返回结果:', deleteResult);

      // 检查删除是否真正成功
      if (deleteResult.data === true) {
        console.log('✅ 删除成功，显示成功提示');
        showToast("文章已成功删除", "success");
      } else {
        console.log('⚠️ 删除API返回false，可能删除失败');
        showToast("删除失败，可能文章不存在或无权限删除", "warning");
        setDeleteDialogOpen(false);
        setArticleToDelete(null);
        setIsDeleting(false);
        return;
      }

      // 刷新文章列表
      console.log('🔄 刷新文章列表...');
      if (refetchMyArticles) {
        refetchMyArticles();
      }

      // 如果是收藏的文章，也从收藏列表中移除
      setLikedArticles(prev => prev.filter(article => article.uuid !== articleToDelete.id));

      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    } catch (error: any) {
      console.error('删除文章失败:', error);

      // 如果是因为后端接口未实现，给出特别提示
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        showToast("删除功能正在开发中，敬请期待", "warning");
      } else {
        showToast(error.message || "删除文章时出错，请稍后重试", "error");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-[30px] py-5 min-h-screen">
      <section className="flex flex-col items-start w-full">
        <div className="relative self-stretch w-full h-[200px] rounded-lg [background:url(https://c.animaapp.com/mftam89xRJwsqQ/img/banner.png)_50%_50%_/_cover]" />

        <div className="gap-6 pl-5 pr-10 py-0 mt-[-46px] flex items-start w-full">
          <Avatar
            className="w-[100px] h-[100px] border-2 border-solid border-[#ffffff] cursor-pointer hover:ring-4 hover:ring-blue-300 transition-all duration-200"
            onClick={handleAvatarClick}
            title="点击查看头像大图"
          >
            <AvatarImage
              src={
                user?.faceUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'vivi'}&backgroundColor=b6e3f4&hair=longHair&hairColor=724133&eyes=happy&mouth=smile&accessories=prescription01&accessoriesColor=262e33`
              }
              className="object-cover"
            />
          </Avatar>

          <div className="flex flex-col items-start gap-5 pt-[60px] pb-0 px-0 flex-1 grow">
            <div className="inline-flex flex-col items-start justify-center">
              <div className="inline-flex items-center gap-[15px]">
                <h1 className="mt-[-1.00px] [font-family:'Lato',Helvetica] font-medium text-off-black text-3xl tracking-[0] leading-[42px] whitespace-nowrap">
                  {user?.username || "Guest User"}
                </h1>

                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  <img
                    className="w-[38px] h-[38px]"
                    alt="Share"
                    src="https://c.animaapp.com/mfuxsdcbXwMuVe/img/share.svg"
                  />
                </Button>
              </div>

              <p className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                @{user?.namespace || 'unknown'}
              </p>
            </div>

            <div className="flex-col gap-[15px] flex items-start w-full">
              <div className="flex items-center gap-2.5 w-full">
                <p className="mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  {user?.bio || "Hello, welcome to my creative space. Design, travel, and everyday life."}
                </p>
              </div>

              <div className="inline-flex items-center gap-[30px]">
                {socialLinksData && socialLinksData.filter(link => link.linkUrl && link.linkUrl.trim()).map((link) => (
                  <a
                    key={link.id}
                    href={link.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 p-0 h-auto hover:opacity-80 transition-opacity duration-200"
                  >
                    <div className="gap-[5px] inline-flex items-center">
                      <img
                        className="w-5 h-5"
                        alt={`${link.title} logo`}
                        src={link.iconUrl || "https://c.animaapp.com/mftam89xRJwsqQ/img/logo-wrap.svg"}
                        onError={(e) => {
                          e.currentTarget.src = "https://c.animaapp.com/mftam89xRJwsqQ/img/logo-wrap.svg";
                        }}
                      />

                      <span className="mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                        {link.title}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col items-start gap-[30px] w-full mb-[-42.00px]">
        <Tabs defaultValue="collection" className="w-full">
          <TabsList className="flex items-center justify-between w-full bg-transparent h-auto p-0 rounded-none relative border-b border-[#ffffff]">
            <TabsTrigger
              value="collection"
              className="flex-1 flex items-center justify-center bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none p-0 relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-1/2 data-[state=active]:after:transform data-[state=active]:after:-translate-x-1/2 data-[state=active]:after:w-[calc(100%-30px)] data-[state=active]:after:h-[2px] data-[state=active]:after:bg-[#454545]"
            >
              <div className="inline-flex items-center justify-center px-[15px] py-2.5">
                <span className="mt-[-1.00px] [font-family:'Lato',Helvetica] data-[state=active]:font-bold font-normal text-dark-grey data-[state=active]:text-lg text-lg text-center tracking-[0] leading-[25.2px] whitespace-nowrap">
                  My collection
                </span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="share"
              className="flex-1 flex items-center justify-center bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none p-0 relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-1/2 data-[state=active]:after:transform data-[state=active]:after:-translate-x-1/2 data-[state=active]:after:w-[calc(100%-30px)] data-[state=active]:after:h-[2px] data-[state=active]:after:bg-[#454545]"
            >
              <div className="justify-center px-[15px] py-2.5 w-full flex items-center gap-2.5">
                <span className="mt-[-1.00px] [font-family:'Lato',Helvetica] data-[state=active]:font-bold font-normal text-dark-grey data-[state=active]:text-lg text-lg text-center tracking-[0] leading-[25.2px] whitespace-nowrap">
                  My share
                </span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collection" className="mt-[30px]">
            {treasuryLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-lg text-gray-600">加载收藏中...</div>
              </div>
            ) : treasuryError ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-lg text-red-600">加载失败: {treasuryError}</div>
              </div>
            ) : likedArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {likedArticles.map((article) => {
                  const card = transformLikedApiToCard(article);
                  return (
                    <div
                      key={card.id}
                      className="flex flex-col gap-6 pt-0 pb-5 flex-1 rounded-[0px_0px_25px_25px]"
                    >
                      {renderCard(card)}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex justify-center items-center py-20">
                <div className="text-lg text-gray-600">还没有收藏任何内容哦～</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="share" className="mt-[30px]">
            {myCreatedLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-lg text-gray-600">加载我的创作中...</div>
              </div>
            ) : myCreatedError ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-lg text-red-600">加载失败: {myCreatedError}</div>
              </div>
            ) : myCreatedData && myCreatedData.data.length > 0 ? (
              <div className="flex items-start gap-6 w-full">
                {myCreatedData.data.slice(0, 2).map((article) => {
                  const card = transformApiToCard(article);
                  return (
                    <div
                      key={card.id}
                      className="flex flex-col gap-6 pt-0 pb-5 flex-1 rounded-[0px_0px_25px_25px]"
                    >
                      {renderMyShareCard(card)}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex justify-center items-center py-20">
                <div className="text-lg text-gray-600">还没有创作的内容哦～</div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <div className="h-[50px]" />

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              你确定要删除文章 "{articleToDelete?.title}" 吗？
              <br />
              此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setArticleToDelete(null);
              }}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteArticle}
              disabled={isDeleting}
            >
              {isDeleting ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 图片预览模态框 */}
      <ImagePreviewModal
        isOpen={isImagePreviewOpen}
        imageUrl={previewImageUrl}
        alt={previewImageAlt}
        onClose={handleCloseImagePreview}
      />
    </div>
  );
};
