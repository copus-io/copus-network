import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useUser } from "../../../../contexts/UserContext";
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
  const { namespace } = useParams<{ namespace?: string }>();
  const [searchParams] = useSearchParams();
  const { user, socialLinks: socialLinksData, getArticleLikeState, toggleLike } = useUser();

  // Get tab from URL parameter, default to "collection"
  const activeTab = searchParams.get('tab') || 'collection';
  const { showToast } = useToast();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // 图片预览相关状态
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewImageAlt, setPreviewImageAlt] = useState("");

  // 统一状态管理
  const [treasuryUserInfo, setTreasuryUserInfo] = useState<any>(null);
  const [userInfoLoading, setUserInfoLoading] = useState(true);
  const [userInfoError, setUserInfoError] = useState<string | null>(null);

  // 收藏文章状态
  const [likedArticles, setLikedArticles] = useState<any[]>([]);
  const [likedArticlesLoading, setLikedArticlesLoading] = useState(false);
  const [likedArticlesError, setLikedArticlesError] = useState<string | null>(null);

  // 创作文章状态
  const [createdArticles, setCreatedArticles] = useState<any[]>([]);
  const [createdArticlesLoading, setCreatedArticlesLoading] = useState(false);
  const [createdArticlesError, setCreatedArticlesError] = useState<string | null>(null);

  const [treasuryStats, setTreasuryStats] = useState({
    likedArticleCount: 0,
    articleCount: 0,
    myArticleLikedCount: 0
  });

  // 判断是否在查看其他用户的宝藏
  const isViewingOtherUser = !!namespace;
  const targetNamespace = namespace || user?.namespace;

  // 移除对404 API的调用，改用统计信息显示

  // 调试信息
  console.log('🔍📋 宝藏页面状态调试:', {
    user: user?.username,
    namespace: user?.namespace,
    likedArticles: likedArticles.length,
    userInfoLoading,
    userInfoError,
    isViewingOtherUser,
    activeTab
  });

  // 1. 首先获取用户信息和ID
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!isViewingOtherUser && !user) {
        setTreasuryUserInfo(null);
        setUserInfoLoading(false);
        return;
      }

      if (isViewingOtherUser && !targetNamespace) {
        setUserInfoError('User namespace is invalid');
        setUserInfoLoading(false);
        return;
      }

      try {
        setUserInfoLoading(true);
        setUserInfoError(null);

        let userInfo;
        if (isViewingOtherUser && targetNamespace) {
          // 查看其他用户的信息
          userInfo = await AuthService.getUserHomeInfo(targetNamespace);
        } else if (user?.namespace) {
          // 查看自己的信息，通过namespace获取完整信息
          userInfo = await AuthService.getUserHomeInfo(user.namespace);
        } else {
          // 降级方案
          userInfo = await AuthService.getUserTreasuryInfo();
        }

        console.log('🏆📚 用户详情API响应数据:', {
          namespace: targetNamespace,
          isViewingOtherUser,
          userInfo
        });

        const processedInfo = userInfo.data || userInfo;
        setTreasuryUserInfo(processedInfo);
        if (processedInfo.statistics) {
          setTreasuryStats(processedInfo.statistics);
        }

      } catch (error) {
        console.error('❌ 获取用户信息失败:', error);
        setUserInfoError(`获取用户信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
      } finally {
        setUserInfoLoading(false);
      }
    };

    fetchUserInfo();
  }, [user, namespace, isViewingOtherUser, targetNamespace]);

  // 2. 根据当前标签页和用户信息获取相应的文章数据
  useEffect(() => {
    if (userInfoLoading || !treasuryUserInfo) {
      return; // 等待用户信息加载完成
    }

    const fetchArticleData = async () => {
      const userId = treasuryUserInfo.id || user?.id;
      if (!userId) {
        console.warn('⚠️ 无法获取用户ID，跳过文章数据加载');
        return;
      }

      try {
        if (activeTab === 'collection') {
          // 只在收藏标签页时加载收藏文章
          await fetchLikedArticles(userId);
        } else if (activeTab === 'share') {
          // 只在创作标签页时加载创作文章
          await fetchCreatedArticles(userId);
        }
      } catch (error) {
        console.error('❌ 加载文章数据失败:', error);
      }
    };

    fetchArticleData();
  }, [treasuryUserInfo, activeTab, userInfoLoading]);

  // 收藏文章加载函数
  const fetchLikedArticles = async (userId: number) => {
    setLikedArticlesLoading(true);
    setLikedArticlesError(null);

    try {
      console.log('🔄 开始加载收藏文章, 用户ID:', userId);
      const response = await AuthService.getMyLikedArticlesCorrect(1, 10, userId); // 优化加载性能

      console.log('🔍🏆📚 收藏文章API响应数据:', response);

      const articlesArray = extractArticlesFromResponse(response, '收藏');
      setLikedArticles(articlesArray);

    } catch (error) {
      console.error('❌ 获取收藏文章失败:', error);
      setLikedArticlesError(`获取收藏文章失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setLikedArticles([]);
    } finally {
      setLikedArticlesLoading(false);
    }
  };

  // 创作文章加载函数
  const fetchCreatedArticles = async (userId: number) => {
    setCreatedArticlesLoading(true);
    setCreatedArticlesError(null);

    try {
      console.log('🔄 开始加载创作文章, 用户ID:', userId);
      const response = await AuthService.getMyCreatedArticles(1, 10, userId); // 优化加载性能

      console.log('🔍✨ 创作文章API响应数据:', response);

      const articlesArray = extractArticlesFromResponse(response, '创作');
      setCreatedArticles(articlesArray);

    } catch (error) {
      console.error('❌ 获取创作文章失败:', error);
      setCreatedArticlesError(`获取创作文章失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setCreatedArticles([]);
    } finally {
      setCreatedArticlesLoading(false);
    }
  };

  // 统一的文章数据提取函数
  const extractArticlesFromResponse = (response: any, type: string) => {
    if (response?.data?.data && Array.isArray(response.data.data)) {
      console.log(`✅ ${type}文章使用嵌套结构 response.data.data:`, response.data.data.length, '条记录');
      return response.data.data;
    } else if (response?.data && Array.isArray(response.data)) {
      console.log(`✅ ${type}文章使用标准结构 response.data:`, response.data.length, '条记录');
      return response.data;
    } else if (Array.isArray(response)) {
      console.log(`✅ ${type}文章使用直接数组结构:`, response.length, '条记录');
      return response;
    } else if (response?.data === '' || response?.data === null) {
      console.log(`📭 ${type}文章API返回空数据`);
      return [];
    } else {
      console.warn(`⚠️ ${type}文章未识别的API响应结构:`, {
        type: typeof response,
        hasData: !!response?.data,
        dataType: typeof response?.data,
        keys: response ? Object.keys(response) : []
      });
      return [];
    }
  };

  // 将API数据转换为收藏卡片格式
  const transformLikedApiToCard = (article: any): ArticleData => {
    return {
      id: article.uuid,
      uuid: article.uuid,
      title: article.title,
      description: article.content,
      coverImage: article.coverUrl || 'https://c.animaapp.com/mft5gmofxQLTNf/img/cover-1.png',
      category: article.categoryInfo?.name || '未分类',
      categoryColor: article.categoryInfo?.color || '#666666',
      userName: article.authorInfo?.username || 'Anonymous',
      userAvatar: article.authorInfo?.faceUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.authorInfo?.username || 'user'}&backgroundColor=b6e3f4`,
      userId: article.authorInfo?.id,
      userNamespace: article.authorInfo?.namespace,
      date: new Date(article.createAt || article.publishAt).toLocaleDateString(),
      treasureCount: article.likeCount || 0,
      visitCount: article.viewCount || 0,
      isLiked: article.isLiked || true,
      targetUrl: article.targetUrl,
      website: article.targetUrl ? new URL(article.targetUrl).hostname : undefined
    };
  };

  // 将API数据转换为创作卡片格式（与收藏格式相同）
  const transformCreatedApiToCard = (article: any): ArticleData => {
    return {
      id: article.uuid,
      uuid: article.uuid,
      title: article.title,
      description: article.content,
      coverImage: article.coverUrl || 'https://c.animaapp.com/mft5gmofxQLTNf/img/cover-1.png',
      category: article.categoryInfo?.name || '未分类',
      categoryColor: article.categoryInfo?.color || '#666666',
      userName: article.authorInfo?.username || 'Anonymous',
      userAvatar: article.authorInfo?.faceUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.authorInfo?.username || 'user'}&backgroundColor=b6e3f4`,
      userId: article.authorInfo?.id,
      userNamespace: article.authorInfo?.namespace,
      date: new Date(article.createAt || article.publishAt).toLocaleDateString(),
      treasureCount: article.likeCount || 0,
      visitCount: article.viewCount || 0,
      isLiked: article.isLiked || false, // 创作文章的点赞状态来自API
      targetUrl: article.targetUrl,
      website: article.targetUrl ? new URL(article.targetUrl).hostname : undefined
    };
  };

  // 处理点赞
  const handleLike = async (articleId: string, currentIsLiked: boolean, currentLikeCount: number) => {
    if (!user) {
      showToast('Please login first', 'error');
      return;
    }
    await toggleLike(articleId, currentIsLiked, currentLikeCount);
  };

  // 处理用户点击 - 现在需要传递namespace
  const handleUserClick = (userId: number | undefined, userNamespace?: string) => {
    // 如果没有userId和namespace，直接返回
    if (!userId && !userNamespace) {
      return;
    }

    // 如果没有namespace，尝试从文章数据中查找
    if (!userNamespace && userId !== undefined) {
      // 在likedArticles中查找 - 这些是收藏的文章，作者信息在authorInfo中
      const likedArticle = likedArticles.find(a => a.userId === userId);
      if (likedArticle) {
        userNamespace = likedArticle.userNamespace;
      }

      // 注：之前会在myCreatedData中查找，但该API已移除
    }

    // 判断是否是当前用户
    // 优先使用namespace判断（更准确），其次才是id
    const isCurrentUser = (user && userNamespace && user.namespace === userNamespace) ||
                         (user && userId && user.id === userId && !userNamespace);

    if (isCurrentUser) {
      // 如果是点击自己，跳转到自己的宝藏页面
      navigate('/my-treasury');
    } else if (userNamespace) {
      // 跳转到其他用户的宝藏页面
      navigate(`/user/${userNamespace}/treasury`);
    } else if (userId) {
      // 如果没有namespace，使用userId作为降级方案
      navigate(`/user/${userId}/treasury`);
    }
  };

  // 处理头像点击预览
  const handleAvatarClick = () => {
    const avatarUrl = user?.faceUrl ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'vivi'}&backgroundColor=b6e3f4&hair=longHair&hairColor=724133&eyes=happy&mouth=smile&accessories=prescription01&accessoriesColor=262e33`;

    setPreviewImageUrl(avatarUrl);
    setPreviewImageAlt(`${user?.username || 'User'}'s avatar`);
    setIsImagePreviewOpen(true);
  };

  // 关闭图片预览
  const handleCloseImagePreview = () => {
    setIsImagePreviewOpen(false);
    setPreviewImageUrl("");
    setPreviewImageAlt("");
  };

  // 分享个人主页 - 复制Instagram风格短链接 ✨
  const handleShare = () => {
    const currentNamespace = isViewingOtherUser ? treasuryUserInfo?.namespace : user?.namespace;
    if (currentNamespace) {
      const shortLink = `${window.location.origin}/@${currentNamespace}`;
      navigator.clipboard.writeText(shortLink).then(() => {
        showToast('已复制专属链接到剪贴板！快去分享吧～ 🎉', 'success');
      }).catch(() => {
        showToast('复制链接失败，请手动复制: ' + shortLink, 'error');
      });
    }
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
      userId: article.authorInfo?.id || user?.id,
      userNamespace: article.authorInfo?.namespace || user?.namespace,
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
    // 导航到编辑页面，传递文章ID
    navigate(`/create?edit=${articleId}`);
  };

  // 处理删除 - 暂时禁用，因为创建文章API已移除
  const handleDelete = (articleId: string) => {
    console.log('删除功能暂时不可用，文章ID:', articleId);
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
        showEdit: !isViewingOtherUser, // 只有查看自己的页面才显示编辑
        showDelete: !isViewingOtherUser // 只有查看自己的页面才显示删除
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
      return;
    }

    setIsDeleting(true);
    try {
      // 调用删除API
      const deleteResult = await AuthService.deleteArticle(articleToDelete.id);


      // 检查删除是否真正成功
      if (deleteResult.data === true) {
        showToast("Article deleted successfully", "success");
      } else {
        showToast("Delete failed, article may not exist or no permission to delete", "warning");
        setDeleteDialogOpen(false);
        setArticleToDelete(null);
        setIsDeleting(false);
        return;
      }

      // 刷新文章列表
      const userId = treasuryUserInfo?.id || user?.id;
      if (userId) {
        await fetchCreatedArticles(userId);
      }

      // 如果是收藏的文章，也从收藏列表中移除
      setLikedArticles(prev => prev.filter(article => article.uuid !== articleToDelete.id));

      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    } catch (error: any) {
      console.error('删除文章失败:', error);

      // 如果是因为后端接口未实现，给出特别提示
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        showToast("Delete feature is under development, coming soon", "warning");
      } else {
        showToast(error.message || "Error deleting article, please try again later", "error");
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
            title="Click to view avatar in full size"
          >
            <AvatarImage
              src={
                (isViewingOtherUser ? treasuryUserInfo?.faceUrl : user?.faceUrl) ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${(isViewingOtherUser ? treasuryUserInfo?.username : user?.username) || 'vivi'}&backgroundColor=b6e3f4&hair=longHair&hairColor=724133&eyes=happy&mouth=smile&accessories=prescription01&accessoriesColor=262e33`
              }
              className="object-cover"
            />
          </Avatar>

          <div className="flex flex-col items-start gap-5 pt-[60px] pb-0 px-0 flex-1 grow">
            <div className="inline-flex flex-col items-start justify-center">
              <div className="inline-flex items-center gap-[15px]">
                <h1 className="mt-[-1.00px] [font-family:'Lato',Helvetica] font-medium text-off-black text-3xl tracking-[0] leading-[42px] whitespace-nowrap">
                  {isViewingOtherUser ? (treasuryUserInfo?.username || "Loading...") : (user?.username || "Guest User")}
                </h1>

                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto hover:scale-110 transition-transform duration-200"
                  onClick={handleShare}
                  title={`分享 @${isViewingOtherUser ? treasuryUserInfo?.namespace : user?.namespace} 的专属链接`}
                >
                  <img
                    className="w-[38px] h-[38px]"
                    alt="Share"
                    src="https://c.animaapp.com/mfuxsdcbXwMuVe/img/share.svg"
                  />
                </Button>
              </div>

              <p className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                @{isViewingOtherUser ? (treasuryUserInfo?.namespace || 'loading') : (user?.namespace || 'unknown')}
              </p>
            </div>

            <div className="flex-col gap-[15px] flex items-start w-full">
              <div className="flex items-center gap-2.5 w-full">
                <p className="mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  {isViewingOtherUser
                    ? (treasuryUserInfo?.bio || "Welcome to this user's creative space.")
                    : (user?.bio || "Hello, welcome to my creative space. Design, travel, and everyday life.")}
                </p>
              </div>

              <div className="inline-flex items-center gap-[30px]">
                {(isViewingOtherUser ? treasuryUserInfo?.socialLinks : socialLinksData) &&
                 (isViewingOtherUser ? treasuryUserInfo?.socialLinks : socialLinksData).filter(link => link.linkUrl && link.linkUrl.trim()).map((link, index) => (
                  <a
                    key={link.id || index}
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
        <Tabs value={activeTab} onValueChange={(value) => {
          // Update URL with new tab parameter
          const newSearchParams = new URLSearchParams(searchParams);
          if (value === 'collection') {
            newSearchParams.delete('tab'); // Remove tab param for default
          } else {
            newSearchParams.set('tab', value);
          }
          const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
          navigate(newUrl, { replace: true });
        }} className="w-full">
          <TabsList className="flex items-center justify-between w-full bg-transparent h-auto p-0 rounded-none relative border-b border-[#ffffff]">
            <TabsTrigger
              value="collection"
              className="flex-1 flex items-center justify-center bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none p-0 relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-1/2 data-[state=active]:after:transform data-[state=active]:after:-translate-x-1/2 data-[state=active]:after:w-[calc(100%-30px)] data-[state=active]:after:h-[2px] data-[state=active]:after:bg-[#454545]"
            >
              <div className="inline-flex items-center justify-center px-[15px] py-2.5">
                <span className="mt-[-1.00px] [font-family:'Lato',Helvetica] data-[state=active]:font-bold font-normal text-dark-grey data-[state=active]:text-lg text-lg text-center tracking-[0] leading-[25.2px] whitespace-nowrap">
                  {isViewingOtherUser ? `${treasuryUserInfo?.username || 'User'}'s collection` : 'My collection'}
                </span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="share"
              className="flex-1 flex items-center justify-center bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none p-0 relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-1/2 data-[state=active]:after:transform data-[state=active]:after:-translate-x-1/2 data-[state=active]:after:w-[calc(100%-30px)] data-[state=active]:after:h-[2px] data-[state=active]:after:bg-[#454545]"
            >
              <div className="justify-center px-[15px] py-2.5 w-full flex items-center gap-2.5">
                <span className="mt-[-1.00px] [font-family:'Lato',Helvetica] data-[state=active]:font-bold font-normal text-dark-grey data-[state=active]:text-lg text-lg text-center tracking-[0] leading-[25.2px] whitespace-nowrap">
                  {isViewingOtherUser ? `${treasuryUserInfo?.username || 'User'}'s share` : 'My share'}
                </span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collection" className="mt-[30px]">
            {likedArticlesLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-lg text-gray-600">Loading collection...</div>
              </div>
            ) : likedArticlesError ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-lg text-red-600">Loading failed: {likedArticlesError}</div>
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
              <div className="flex flex-col justify-center items-center py-20 gap-4">
                <div className="text-lg text-gray-600">
                  {isViewingOtherUser ? '该用户暂无收藏内容' : '还没有收藏任何内容哦～'}
                </div>
                <div className="text-sm text-gray-400">
                  {isViewingOtherUser ? '暂时没有公开的收藏内容' : '快去发现一些精彩内容吧！'}
                </div>
                <div className="text-xs text-gray-400">
                  💡 统计显示收藏：{treasuryUserInfo?.statistics?.likedArticleCount || 0}篇，但当前无可显示内容
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="share" className="mt-[30px]">
            {createdArticlesLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-lg text-gray-600">加载创作中...</div>
              </div>
            ) : createdArticlesError ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-lg text-red-600">加载失败: {createdArticlesError}</div>
              </div>
            ) : createdArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {createdArticles.map((article) => {
                  const card = transformCreatedApiToCard(article);
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
              <div className="flex flex-col justify-center items-center py-20 gap-4">
                <div className="text-lg text-gray-600">
                  {isViewingOtherUser ? '该用户暂无创作内容' : '还没有创作任何内容哦～'}
                </div>
                <div className="text-sm text-gray-400">
                  {isViewingOtherUser ? '暂时没有公开的创作内容' : '快去创作一些精彩内容吧！'}
                </div>
                <div className="text-xs text-gray-400">
                  💡 统计显示创作：{treasuryUserInfo?.statistics?.articleCount || 0}篇，但当前无可显示内容
                </div>
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
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the article "{articleToDelete?.title}"?
              <br />
              This action cannot be undone.
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
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteArticle}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
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
