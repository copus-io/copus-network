import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { HeaderSection } from "../../components/shared/HeaderSection/HeaderSection";
import { useUser } from "../../contexts/UserContext";
import { useToast } from "../../components/ui/toast";
import { ContentPageSkeleton } from "../../components/ui/skeleton";
import { useArticleDetail } from "../../hooks/queries";
import { getCategoryStyle } from "../../utils/categoryStyles";
import { AuthService } from "../../services/authService";
import { TreasureButton } from "../../components/ui/TreasureButton";
import { ShareDropdown } from "../../components/ui/ShareDropdown";
import profileDefaultAvatar from "../../assets/images/profile-default.svg";


// Image URL validation and fallback function
const getValidDetailImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl || imageUrl.trim() === '') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }

  // Check if it's a blob URL (from file upload) - these URLs don't work in new sessions
  if (imageUrl.startsWith('blob:')) {
    // Return placeholder as blob URLs are invalid after page refresh
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5VcGxvYWRlZCBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }

  // Check if it's a valid HTTP/HTTPS URL
  try {
    const url = new URL(imageUrl);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return imageUrl;
    } else {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbnZhbGlkIFVSTDwvdGV4dD48L3N2Zz4=';
    }
  } catch (error) {
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

  // Use new article detail API hook
  const { article, loading, error } = useArticleDetail(id || '');

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Debug: Log article data to check arChainId
  useEffect(() => {
    if (article) {
      console.log('📄 Article data:', article);
      console.log('🔗 arChainId:', article.arChainId);
    }
  }, [article]);

  // Convert API data to format needed by page
  const content = article ? {
    id: article.uuid,
    title: article.title,
    description: article.content,
    coverImage: article.coverUrl,
    url: article.targetUrl,
    category: article.categoryInfo?.name || 'General',
    categoryColor: `${getCategoryStyle(article.categoryInfo?.name || 'General', article.categoryInfo?.color).border} ${getCategoryStyle(article.categoryInfo?.name || 'General', article.categoryInfo?.color).bg}`,
    categoryTextColor: getCategoryStyle(article.categoryInfo?.name || 'General', article.categoryInfo?.color).text,
    userName: article.authorInfo?.username || 'Anonymous',
    userId: article.authorInfo?.id,
    userNamespace: article.authorInfo?.namespace,
    userAvatar: article.authorInfo?.faceUrl && article.authorInfo.faceUrl.trim() !== '' ? article.authorInfo.faceUrl : profileDefaultAvatar,
    date: new Date(article.createAt * 1000).toLocaleDateString(),
    treasureCount: article.likeCount || 0,
    visitCount: `${article.viewCount || 0} Visits`,
    likes: article.likeCount || 0,
    isLiked: article.isLiked || false,
    website: article.targetUrl ? new URL(article.targetUrl).hostname.replace('www.', '') : 'website.com',
  } : null;

  // Debug: Log author info
  if (article) {
    console.log('[Content] Author info:', {
      username: article.authorInfo?.username,
      faceUrl: article.authorInfo?.faceUrl,
      faceUrlLength: article.authorInfo?.faceUrl?.length,
      faceUrlIsEmpty: article.authorInfo?.faceUrl === '',
      namespace: article.authorInfo?.namespace,
      finalAvatar: content?.userAvatar
    });
  }

  // Set like state when article data is fetched
  useEffect(() => {
    if (content && article) {

      // Get global state or use API data
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
          <Link to="/copus" className="text-blue hover:underline">
            Back to Discovery
          </Link>
        </div>
      </div>
    );
  }

  const handleLike = async () => {
    if (!content || !article) return;

    if (!user) {
      showToast('Please log in to treasure this content', 'error', {
        action: {
          label: 'Login',
          onClick: () => navigate('/login')
        }
      });
      return;
    }

    try {
      const newIsLiked = !isLiked;
      const newLikesCount = newIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

      // Update local state immediately
      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);

      // Update global state simultaneously
      updateArticleLikeState(article.uuid, newIsLiked, newLikesCount);

      // Call API
      await AuthService.likeArticle(article.uuid);
      showToast(newIsLiked ? 'Treasured 💖' : 'Untreasured', 'success');

    } catch (error) {
      // Rollback state on API failure
      const originalIsLiked = !isLiked;
      const originalLikesCount = originalIsLiked ? likesCount - 1 : likesCount + 1;

      setIsLiked(originalIsLiked);
      setLikesCount(originalLikesCount);
      updateArticleLikeState(article.uuid, originalIsLiked, originalLikesCount);

      console.error('Like operation failed:', error);
      showToast('Operation failed, please try again', 'error');
    }
  };


  const handleUserClick = () => {
    if (!content?.userNamespace) return;

    // If logged in and it's the current user's own article, navigate to my treasury page
    if (user && user.id === content.userId) {
      navigate('/my-treasury');
    } else {
      // Navigate to the user's profile page using short link format
      navigate(`/u/${content.userNamespace}`);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex justify-center overflow-hidden bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
      data-model-id="9091:54529"
    >
      <div className="flex mt-0 w-full min-h-screen ml-0 relative flex-col items-start">
        <HeaderSection isLoggedIn={!!user} />

        <main className="flex flex-col items-start gap-[30px] pt-[70px] lg:pt-[120px] pb-[100px] px-4 relative flex-1 w-full max-w-[1040px] mx-auto grow">
          <article className="flex flex-col items-start justify-between pt-0 pb-[30px] px-0 relative flex-1 self-stretch w-full grow border-b-2 [border-bottom-style:solid] border-[#E0E0E0]">
            <div className="flex flex-col items-start gap-[30px] self-stretch w-full relative flex-[0_0_auto]">
              <div className="flex flex-col lg:flex-row items-start gap-[40px] pt-0 pb-[30px] px-0 relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex flex-col lg:h-[205px] items-start justify-start relative flex-1 grow gap-6">
                  <span className="relative flex items-center justify-center w-fit [font-family:'Lato',Helvetica] font-medium text-yellow text-sm text-center tracking-[0.5px] leading-4 whitespace-nowrap capitalize">
                    {content.category}
                  </span>

                  <h1
                    className="relative self-stretch [font-family:'Lato',Helvetica] font-semibold text-[#231f20] text-[36px] lg:text-[40px] tracking-[-0.5px] leading-[44px] lg:leading-[50px] mt-2 break-all overflow-hidden"
                    style={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                      wordBreak: 'break-all',
                      overflowWrap: 'break-word'
                    }}
                  >
                    {content.title}
                  </h1>
                </div>

                <div className="relative w-full lg:w-[364px] h-[205px] rounded-lg aspect-[1.78] bg-[url(https://c.animaapp.com/5EW1c9Rn/img/image@2x.png)] bg-cover bg-[50%_50%]"
                     style={{
                       backgroundImage: `url(${getValidDetailImageUrl(content.coverImage)})`
                     }}
                />
              </div>

              <blockquote className="flex flex-col items-start gap-5 p-5 lg:p-[30px] relative self-stretch w-full flex-[0_0_auto] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                <div className="flex items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
                  <div className="w-fit whitespace-nowrap relative mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-red text-[50px] tracking-[0] leading-[80.0px]">
                    &quot;
                  </div>

                  <p
                    className="relative flex-1 mt-[-1.00px] [font-family:'Lato',Helvetica] font-light text-off-black text-xl tracking-[0] leading-[32.0px]"
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {content.description}
                  </p>

                  <div className="flex items-end justify-center self-stretch w-5 relative mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-red text-[50px] tracking-[0] leading-[80.0px]">
                    &quot;
                  </div>
                </div>

                <cite
                  className="inline-flex items-center gap-2.5 relative flex-[0_0_auto] not-italic cursor-pointer hover:opacity-80 transition-opacity duration-200"
                  onClick={handleUserClick}
                  title={`View ${content.userName}'s profile`}
                >
                  <img
                    className="w-[25px] h-[25px] object-cover relative aspect-[1] rounded-full"
                    alt="Profile image"
                    src={content.userAvatar}
                  />

                  <span className="relative w-fit [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap hover:text-blue-600 transition-colors duration-200">
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

                {/* Arweave onchain storage link - Always show as clickable */}
                <div
                  className="relative w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity"
                  title={article?.arChainId ? "View on Arweave" : "Arweave storage not available"}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('🔍 Arweave icon clicked');
                    console.log('📦 Article object:', article);
                    console.log('🔗 arChainId value:', article?.arChainId);

                    if (!article?.arChainId) {
                      console.warn('⚠️ No arChainId available for this article - cannot redirect to Arweave');
                      console.log('💡 Full article data:', JSON.stringify(article, null, 2));
                    } else {
                      const arweaveUrl = `https://arseed.web3infra.dev/${article.arChainId}`;
                      console.log('✅ Opening Arweave URL in new tab:', arweaveUrl);
                      window.open(arweaveUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  <img
                    className="w-full h-full"
                    alt="Arweave ar logo"
                    src="https://c.animaapp.com/5EW1c9Rn/img/arweave-ar-logo-1.svg"
                  />
                </div>
              </div>
            </div>
          </article>

          <div className="flex justify-between self-stretch w-full items-center relative flex-[0_0_auto]">
            <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
              {/* Use unified treasure button component - large size suitable for detail page */}
              <TreasureButton
                isLiked={isLiked}
                likesCount={likesCount}
                onClick={handleLike}
                size="large"
              />

              {/* Share dropdown menu */}
              <ShareDropdown
                title={content.title}
                url={window.location.href}
              />
            </div>

            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-[15px] px-5 lg:px-[30px] py-2 relative flex-[0_0_auto] bg-red rounded-[100px] border border-solid border-red no-underline"
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