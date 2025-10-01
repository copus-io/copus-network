import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { HeaderSection } from "../../components/shared/HeaderSection/HeaderSection";
import { useUser } from "../../contexts/UserContext";
import { useToast } from "../../components/ui/toast";
import { ContentPageSkeleton } from "../../components/ui/skeleton";
import { useArticleDetail } from "../../hooks/useArticleDetail";
import { getCategoryStyle } from "../../utils/categoryStyles";
import { AuthService } from "../../services/authService";


// 图片URL验证和fallback函数
const getValidDetailImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl || imageUrl.trim() === '') {
    console.warn('Empty or undefined coverImage for detail page');
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }

  // 检查是否是blob URL（来自文件上传）- 这些URL在新会话中不会工作
  if (imageUrl.startsWith('blob:')) {
    console.warn('Blob URL detected in detail page (will fail in new session):', imageUrl);
    // 返回占位符，因为blob URL在刷新页面后无效
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5VcGxvYWRlZCBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }

  // 检查是否是有效的HTTP/HTTPS URL
  try {
    const url = new URL(imageUrl);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return imageUrl;
    } else {
      console.warn('Non-HTTP URL in detail page:', imageUrl);
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbnZhbGlkIFVSTDwvdGV4dD48L3N2Zz4=';
    }
  } catch (error) {
    console.warn('Invalid coverImage URL in detail page:', imageUrl);
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbnZhbGlkIFVSTDwvdGV4dD48L3N2Zz4=';
  }
};

export const Content = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, getArticleLikeState, updateArticleLikeState } = useUser();
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // 使用新的文章详情API hook
  const { article, loading, error } = useArticleDetail(id || '');

  // 转换API数据为页面需要的格式
  const content = article ? {
    id: article.uuid,
    title: article.title,
    description: article.content,
    coverImage: article.coverUrl,
    url: article.targetUrl,
    category: article.categoryInfo?.name || 'General',
    categoryColor: `${getCategoryStyle(article.categoryInfo?.name || 'General').border} ${getCategoryStyle(article.categoryInfo?.name || 'General').bg}`,
    categoryTextColor: getCategoryStyle(article.categoryInfo?.name || 'General').text,
    userName: article.authorInfo?.username || 'Anonymous',
    userAvatar: article.authorInfo?.faceUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.authorInfo?.username || 'user'}&backgroundColor=b6e3f4&hair=longHair&hairColor=724133&eyes=happy&mouth=smile&accessories=prescription01&accessoriesColor=262e33`,
    date: new Date(article.createAt * 1000).toLocaleDateString(),
    treasureCount: article.likeCount || 0,
    visitCount: `${article.viewCount || 0} Visits`,
    likes: article.likeCount || 0,
    isLiked: article.isLiked || false,
    website: article.targetUrl ? new URL(article.targetUrl).hostname.replace('www.', '') : 'website.com',
  } : null;

  // 当获取到文章数据时，设置点赞状态
  useEffect(() => {
    if (content && article) {
      console.log('🎯 转换后的content数据:', content);
      console.log('🖼️ 转换后的封面图:', content.coverImage);
      console.log('📝 转换后的描述:', content.description);

      // 获取全局状态或使用API数据
      const globalState = getArticleLikeState(article.uuid, content.isLiked, content.likes);
      setIsLiked(globalState.isLiked);
      setLikesCount(globalState.likeCount);
    }
  }, [content, article, getArticleLikeState]);

  if (loading) {
    return <ContentPageSkeleton />;
  }

  if (error || (!loading && !content)) {
    return (
      <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            {error || 'Content not found'}
          </h1>
          <Link to="/discovery" className="text-blue hover:underline">
            Back to Discovery
          </Link>
        </div>
      </div>
    );
  }

  const handleLike = async () => {
    if (!content || !user || !article) {
      showToast('请先登录', 'error');
      return;
    }

    try {
      const newIsLiked = !isLiked;
      const newLikesCount = newIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

      // 立即更新本地状态
      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);

      // 同时更新全局状态
      updateArticleLikeState(article.uuid, newIsLiked, newLikesCount);

      // 调用API
      console.log('💖 正在点赞文章，UUID:', article.uuid);
      await AuthService.likeArticle(article.uuid);
      showToast(newIsLiked ? '已点赞 💖' : '已取消点赞', 'success');

    } catch (error) {
      // API失败时回滚状态
      const originalIsLiked = !isLiked;
      const originalLikesCount = originalIsLiked ? likesCount - 1 : likesCount + 1;

      setIsLiked(originalIsLiked);
      setLikesCount(originalLikesCount);
      updateArticleLikeState(article.uuid, originalIsLiked, originalLikesCount);

      console.error('点赞操作失败:', error);
      showToast('操作失败，请重试', 'error');
    }
  };


  const handleShare = () => {
    navigator.share?.({
      title: content.title,
      text: content.description,
      url: window.location.href,
    }).catch(() => {
      navigator.clipboard.writeText(window.location.href);
    });
  };

  return (
    <div
      className="min-h-screen w-full flex justify-center overflow-hidden bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
      data-model-id="9091:54529"
    >
      <div className="flex mt-0 w-full min-h-screen ml-0 relative flex-col items-start">
        <HeaderSection isLoggedIn={!!user} />

        <main className="flex flex-col items-start gap-[30px] pt-[120px] pb-10 px-4 relative flex-1 w-full max-w-[1040px] mx-auto grow">
          <article className="flex flex-col items-start justify-between pt-0 pb-[30px] px-0 relative flex-1 self-stretch w-full grow border-b-2 [border-bottom-style:solid] border-[#E0E0E0]">
            <div className="flex flex-col items-start gap-[30px] self-stretch w-full relative flex-[0_0_auto]">
              <div className="flex flex-col lg:flex-row items-start gap-[40px] pt-0 pb-[30px] px-0 relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex flex-col lg:h-[205px] items-start justify-start relative flex-1 grow gap-6">
                  <div className="inline-flex justify-center rounded-[50px] items-center relative flex-[0_0_auto] bg-yellow/10 px-4 py-2 border border-yellow/30">
                    <span className="relative flex items-center justify-center w-fit [font-family:'Lato',Helvetica] font-medium text-yellow text-sm text-center tracking-[0.5px] leading-4 whitespace-nowrap uppercase">
                      {content.category}
                    </span>
                  </div>

                  <h1 className="relative self-stretch [font-family:'Lato',Helvetica] font-semibold text-[#231f20] text-[36px] lg:text-[40px] tracking-[-0.5px] leading-[44px] lg:leading-[50px] mt-2">
                    {content.title}
                  </h1>
                </div>

                <div className="relative w-full lg:w-[364px] h-[205px] rounded-lg aspect-[1.78] bg-[url(https://c.animaapp.com/5EW1c9Rn/img/image@2x.png)] bg-cover bg-[50%_50%]"
                     style={{
                       backgroundImage: `url(${getValidDetailImageUrl(content.coverImage)})`
                     }}
                />
              </div>

              <blockquote className="flex flex-col items-start gap-5 p-[30px] relative self-stretch w-full flex-[0_0_auto] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                <div className="flex items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
                  <div className="w-fit whitespace-nowrap relative mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-red text-[50px] tracking-[0] leading-[80.0px]">
                    &quot;
                  </div>

                  <p className="relative flex-1 mt-[-1.00px] [font-family:'Lato',Helvetica] font-light text-off-black text-xl tracking-[0] leading-[32.0px]">
                    {content.description}
                  </p>

                  <div className="flex items-end justify-center self-stretch w-5 relative mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-red text-[50px] tracking-[0] leading-[80.0px]">
                    &quot;
                  </div>
                </div>

                <cite className="inline-flex items-center gap-2.5 relative flex-[0_0_auto] not-italic">
                  <img
                    className="w-[25px] h-[25px] object-cover relative aspect-[1]"
                    alt="Profile image"
                    src={content.userAvatar}
                  />

                  <span className="relative w-fit [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                    {content.userName}
                  </span>
                </cite>
              </blockquote>
            </div>

            <div className="flex h-[25px] items-center justify-between relative self-stretch w-full">
              <time className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-[23px] whitespace-nowrap">
                {content.date}
              </time>

              <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
                <div className="inline-flex items-center gap-[5px] relative flex-[0_0_auto]">
                  <img
                    className="relative w-[21px] h-[15px] aspect-[1.4]"
                    alt="Ic view"
                    src="https://c.animaapp.com/5EW1c9Rn/img/ic-view.svg"
                  />

                  <span className="mt-[-1.00px] relative w-fit [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg text-center tracking-[0] leading-5 whitespace-nowrap">
                    {article?.viewCount || 0}
                  </span>
                </div>

                <img
                  className="relative w-6 h-6"
                  alt="Arweave ar logo"
                  src="https://c.animaapp.com/5EW1c9Rn/img/arweave-ar-logo-1.svg"
                />
              </div>
            </div>
          </article>

          <div className="flex justify-between self-stretch w-full items-center relative flex-[0_0_auto]">
            <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
              <button
                onClick={handleLike}
                className={`all-[unset] box-border inline-flex items-center justify-center gap-[10px] px-[15px] py-2 w-[86px] h-[38px] rounded-[50px] border border-solid relative transition-all duration-200 ${
                  isLiked
                    ? 'bg-[#E19F1D] border-[#E19F1D]'
                    : 'bg-[#e19e1d1a] border-[#E19F1D]'
                }`}
              >
                <img
                  className={`relative w-3.5 h-[22px] aspect-[0.65] transition-all duration-200 ${
                    isLiked ? 'filter brightness-0 invert' : ''
                  }`}
                  alt="Treasure icon"
                  src="https://c.animaapp.com/5EW1c9Rn/img/treasure-icon.svg"
                />

                <span className={`relative w-fit [font-family:'Lato',Helvetica] font-normal text-lg text-center tracking-[0] leading-5 whitespace-nowrap transition-colors duration-200 ${
                  isLiked ? 'text-white' : 'text-[#454545]'
                }`}>
                  {likesCount}
                </span>
              </button>

              <button
                onClick={handleShare}
                className="all-[unset] box-border aspect-[1] relative self-stretch"
              >
                <img
                  className="w-full h-full"
                  alt="Share"
                  src="https://c.animaapp.com/5EW1c9Rn/img/share.svg"
                />
              </button>
            </div>

            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-[15px] px-[30px] py-2 relative flex-[0_0_auto] bg-red rounded-[100px] border border-solid border-red no-underline"
            >
              <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-white text-xl tracking-[0] leading-[30px] whitespace-nowrap">
                Visit
              </span>

              <img
                className="relative w-[31px] h-[14.73px] mr-[-1.00px]"
                alt="Arrow"
                src="https://c.animaapp.com/5EW1c9Rn/img/arrow-1.svg"
              />
            </a>
          </div>
        </main>
      </div>
    </div>
  );
};