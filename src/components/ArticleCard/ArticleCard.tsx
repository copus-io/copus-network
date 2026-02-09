import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { TreasureButton } from "../ui/TreasureButton";
import { ImagePreviewModal } from "../ui/image-preview-modal";
import { LazyImage } from "../ui/lazy-image";
import { getCategoryStyle, getCategoryInlineStyle, formatCount, formatDate } from "../../utils/categoryStyles";
import { getIconUrl, getIconStyle } from "../../config/icons";
import commentIcon from "../../assets/images/comment.svg";
import { convertVisibilityToLegacyPrivate } from "../../types/article";

// Generic article data interface
export interface ArticleData {
  id: string;
  uuid?: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  categoryColor?: string;
  userName: string;
  userAvatar: string;
  userId?: number;
  namespace?: string;
  userNamespace?: string;
  date: string;
  treasureCount: number | string;
  visitCount: string;
  commentCount?: number;
  isLiked?: boolean;
  targetUrl?: string;
  website?: string;
  // x402 payment fields
  paymentPrice?: string; // Price in USDC (e.g., "0.01")
  isPaymentRequired?: boolean; // Whether content requires payment
  // Article visibility status (0: public, 1: private, 2: unlisted)
  visibility?: number;
}

// Layout mode
export type LayoutMode = 'discovery' | 'treasury' | 'published' | 'compact' | 'preview';

// Action button configuration
export interface ActionConfig {
  showEdit?: boolean;
  showDelete?: boolean;
  showTreasure?: boolean;
  showVisits?: boolean;
  showBranchIt?: boolean;
  showWebsite?: boolean;
}

// Component Props
export interface ArticleCardProps {
  article: ArticleData;
  layout?: LayoutMode;
  actions?: ActionConfig;
  isHovered?: boolean;
  onLike?: (articleId: string, currentIsLiked: boolean, currentLikeCount: number) => Promise<void>; // Now optional for backward compatibility
  onComment?: (articleId: string, articleUuid?: string) => void; // Comment button callback
  onEdit?: (articleId: string) => void;
  onDelete?: (articleId: string) => void;
  onUserClick?: (userId: number | undefined, userNamespace?: string) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
}

const ArticleCardComponent: React.FC<ArticleCardProps> = ({
  article,
  layout = 'discovery',
  actions = {
    showTreasure: true,
    showVisits: true,
    showWebsite: false
  },
  isHovered = false,
  onLike,
  onComment,
  onEdit,
  onDelete,
  onUserClick,
  onMouseEnter,
  onMouseLeave,
  className = ""
}) => {
  const navigate = useNavigate();

  // Helper function to check if article is private using visibility system
  const isArticlePrivate = (): boolean => {
    return article.visibility === 1; // ARTICLE_VISIBILITY.PRIVATE
  };
  const categoryStyle = getCategoryStyle(article.category, article.categoryColor);
  const categoryInlineStyle = getCategoryInlineStyle(article.categoryColor);

  // Debug: Log payment data for this card (only in development)
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`💳 Card payment data for "${article.title.substring(0, 30)}...":`, {
        isPaymentRequired: article.isPaymentRequired,
        paymentPrice: article.paymentPrice,
        hasPaymentData: !!(article.isPaymentRequired && article.paymentPrice)
      });
    }
  }, [article.title, article.isPaymentRequired, article.paymentPrice]);

  // Image preview related state
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewImageAlt, setPreviewImageAlt] = useState("");

  // Handle like action
  const handleLikeClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Do nothing if no onLike callback (user not logged in)
    if (!onLike) {
      return;
    }

    const currentCount = typeof article.treasureCount === 'string'
      ? parseInt(article.treasureCount) || 0
      : article.treasureCount;
    await onLike(article.uuid || article.id, article.isLiked || false, currentCount);
  }, [onLike, article.uuid, article.id, article.isLiked, article.treasureCount]);

  // Handle comment click
  const handleCommentClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onComment) {
      onComment(article.uuid || article.id, article.uuid);
    } else {
      // Fallback: navigate directly to the article with comment parameter
      navigate(`/work/${article.uuid || article.id}?comments=open`);
    }
  }, [onComment, article.uuid, article.id, navigate]);

  // Handle user click
  const handleUserClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onUserClick) {
      // Prefer namespace, fall back to userNamespace if not available
      onUserClick(article.userId, article.namespace || article.userNamespace);
    }
  }, [onUserClick, article.userId, article.namespace, article.userNamespace]);

  // Handle edit
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(article.uuid || article.id);
    }
  }, [onEdit, article.uuid, article.id]);

  // Handle delete
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(article.uuid || article.id);
    }
  }, [onDelete, article.uuid, article.id]);

  // Handle image preview
  const handleImagePreview = useCallback((imageUrl: string, alt: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewImageUrl(imageUrl);
    setPreviewImageAlt(alt);
    setIsImagePreviewOpen(true);
  }, []);

  // Close image preview
  const handleCloseImagePreview = useCallback(() => {
    setIsImagePreviewOpen(false);
    setPreviewImageUrl("");
    setPreviewImageAlt("");
  }, []);

  // Render different card content based on layout mode
  const renderCardContent = () => {
    switch (layout) {
      case 'preview':
        return (
          <CardContent className="flex flex-col items-start gap-[20px] py-5 px-[30px] w-full">
            <div className="flex flex-col items-start justify-center gap-[15px] w-full min-w-0 max-w-full">
              <div
                className="flex flex-col items-end justify-end p-2.5 w-full bg-cover bg-[50%_50%] rounded-lg relative"
                style={{
                  backgroundImage: article.coverImage
                    ? `url(${article.coverImage})`
                    : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  aspectRatio: '16 / 9'
                }}
              >
                {!article.coverImage && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-base">Cover Preview</p>
                    </div>
                  </div>
                )}

                {/* Hide website link for paid/locked content */}
                {!article.isPaymentRequired && (
                  <div className="inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-white rounded-[15px] overflow-hidden">
                    <span className="[font-family:'Lato',Helvetica] font-normal text-blue text-sm text-right tracking-[0] leading-[18.2px] whitespace-nowrap">
                      {article.website || 'Visit content'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-start gap-[15px] w-full min-w-0 max-w-full">
                {/* Title with x402 payment badge - Same line */}
                <div className="w-full min-h-[72px] overflow-hidden">
                  {article.isPaymentRequired && article.paymentPrice && (
                    <div className="float-left h-[36px] px-1.5 mr-[5px] mb-[10px] border-[#0052ff] bg-[linear-gradient(0deg,rgba(0,82,255,0.8)_0%,rgba(0,82,255,0.8)_100%),linear-gradient(0deg,rgba(255,254,254,1)_0%,rgba(255,254,254,1)_100%)] rounded-[50px] inline-flex items-center justify-center gap-[3px] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] border border-solid">
                      <img
                        className="w-[21px] h-5 flex-shrink-0"
                        alt="x402 payment"
                        src={getIconUrl('X402_PAYMENT')}
                      />
                      <span className="[font-family:'Lato',Helvetica] font-light text-[#ffffff] text-base tracking-[0] leading-4 whitespace-nowrap">
                        {article.paymentPrice}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 w-full">
                    <div className="flex items-start gap-2 flex-1">
                      {isArticlePrivate() && (
                        <div className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 bg-red/8 rounded-md border border-red/15 mt-1">
                          <svg className="w-3 h-3 text-red" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-red text-xs font-medium leading-none">私享</span>
                        </div>
                      )}
                      <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-[36px] break-words line-clamp-2 flex-1 min-w-0">
                        {article.title || 'Enter a title...'}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-[15px] px-2.5 py-[15px] w-full rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                  <p
                    className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[27px] overflow-hidden min-h-[54px]"
                    style={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    "{article.description || 'Write your recommendation...'}"
                  </p>

                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 min-w-0 max-w-[60%]">
                      <Avatar className="w-[18px] h-[18px] flex-shrink-0">
                        <AvatarImage src={article.userAvatar} alt={article.userName} className="object-cover" />
                      </Avatar>
                      <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] truncate">
                        {article.userName}
                      </span>
                    </div>
                    <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px]">
                      Preview
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        );

      case 'treasury':
        return (
          <CardContent className="flex flex-col gap-[20px] py-5 px-[30px] flex-1">
            <div className="flex flex-col gap-5 flex-1">
              <div
                className="flex flex-col w-full justify-end p-[15px] rounded-lg bg-cover bg-center bg-no-repeat cursor-pointer transition-transform hover:scale-[1.02]"
                style={{
                  backgroundImage: `url(${article.coverImage})`,
                  aspectRatio: '16 / 9'
                }}
                title="Click to view content details"
              >
                {/* Website link - hide for paid content */}
                <div className="flex justify-end">
                  {actions.showWebsite && article.website && !article.isPaymentRequired && (
                    <div className="inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-[#ffffffcc] rounded-[15px] overflow-hidden">
                      <span className="[font-family:'Lato',Helvetica] font-medium text-blue text-sm text-right tracking-[0] leading-[18.2px]">
                        {article.website}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-[15px] flex-1">
                {/* Title with x402 payment badge */}
                <div className="relative min-h-[72px] overflow-hidden">
                  {article.isPaymentRequired && article.paymentPrice && (
                    <div className="float-left h-[36px] px-1.5 mr-[5px] mb-[10px] border-[#0052ff] bg-[linear-gradient(0deg,rgba(0,82,255,0.8)_0%,rgba(0,82,255,0.8)_100%),linear-gradient(0deg,rgba(255,254,254,1)_0%,rgba(255,254,254,1)_100%)] rounded-[50px] inline-flex items-center justify-center gap-[3px] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] border border-solid">
                      <img
                        className="w-[21px] h-5 flex-shrink-0"
                        alt="x402 payment"
                        src={getIconUrl('X402_PAYMENT')}
                      />
                      <span className="[font-family:'Lato',Helvetica] font-light text-[#ffffff] text-base tracking-[0] leading-4 whitespace-nowrap">
                        {article.paymentPrice}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 w-full">
                    <div className="flex items-start gap-2 flex-1">
                      {isArticlePrivate() && (
                        <div className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 bg-red/8 rounded-md border border-red/15 mt-0.5">
                          <svg className="w-3 h-3 text-red" fill="currentColor" stroke="none" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-red text-xs font-medium leading-none">私享</span>
                        </div>
                      )}
                      <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-[18px] tracking-[0] leading-[27px] break-words line-clamp-2 flex-1 min-w-0">
                        {article.title}
                      </h3>
                    </div>
                    {isArticlePrivate() && (
                      <div className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 bg-red/8 rounded-md border border-red/15 mt-0.5">
                        <svg className="w-3 h-3 text-red" fill="currentColor" stroke="none" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red text-xs font-medium leading-none">私享</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-[15px] px-2.5 py-[15px] rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] group-hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.45)_0%,rgba(224,224,224,0.45)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-colors">
                  <p
                    className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-[14px] tracking-[0] leading-[21px] overflow-hidden min-h-[42px]"
                    style={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    "{article.description}"
                  </p>

                  <div className="flex items-start justify-between">
                    <div className="inline-flex items-center gap-2.5">
                      <Avatar
                        className="w-[18px] h-[18px] cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all duration-200"
                        onClick={handleUserClick}
                        title={`View ${article.userName}'s treasures`}
                      >
                        <AvatarImage src={article.userAvatar} alt="Profile image" className="object-cover" />
                      </Avatar>
                      <span
                        className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={handleUserClick}
                      >
                        {(article.userName && article.userName.trim() !== '') ? article.userName : 'Anonymous'}
                      </span>
                    </div>

                    <div className="inline-flex h-[25px] items-center">
                      <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px]">
                        {formatDate(article.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons area */}
            <div className="flex items-center justify-between mt-auto -mx-[30px] px-[30px]">
              {/* Left side: Treasure button, comment count, and view count */}
              <div className="flex items-center gap-3">
                {actions.showTreasure && (
                  <TreasureButton
                    isLiked={(() => {
                      const hasCallback = !!onLike;
                      const isLikedValue = hasCallback ? (article.isLiked || false) : false;


                      return isLikedValue;
                    })()} // Always false when no onLike callback
                    likesCount={typeof article.treasureCount === 'string' ? parseInt(article.treasureCount) || 0 : article.treasureCount}
                    onClick={handleLikeClick}
                    size="medium"
                    disabled={!onLike} // Disable when no onLike callback (user not logged in)
                  />
                )}
                {/* Comment count */}
                <div
                  className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 rounded-lg transition-all duration-200"
                  onClick={handleCommentClick}
                  title="View comments"
                >
                  <img
                    className="w-4 h-4 transition-all duration-200"
                    alt="Comments"
                    src={commentIcon}
                    style={{ filter: 'brightness(0) saturate(100%) invert(44%) sepia(0%) saturate(0%) hue-rotate(186deg) brightness(94%) contrast(88%)' }}
                  />
                  <span className="[font-family:'Lato',Helvetica] font-bold text-[#696969] text-center tracking-[0] leading-[16px] text-[13px] transition-colors duration-200">
                    {article.commentCount || 0}
                  </span>
                </div>
                {/* View count - moved to left side */}
                {actions.showVisits && (
                  <div className="flex items-center gap-1.5">
                    <img
                      className="w-4 h-4"
                      alt="Ic view"
                      src={getIconUrl('VIEW')}
                      style={{ filter: 'brightness(0) saturate(100%) invert(44%) sepia(0%) saturate(0%) hue-rotate(186deg) brightness(94%) contrast(88%)' }}
                    />
                    <span className="[font-family:'Lato',Helvetica] font-normal text-[#696969] text-center tracking-[0] leading-[16px] text-[13px]">
                      {article.visitCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Right side: Edit/Delete buttons */}
              <div className="flex items-center gap-3">
                {/* Edit and delete buttons area */}
                {(actions.showEdit || actions.showDelete) && (
                  <div className="flex items-center gap-3 min-h-[24px]">
                    {actions.showEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto hover:bg-gray-100 transition-colors"
                        onClick={handleEdit}
                      >
                        <img
                          className="w-5 h-5"
                          alt="Edit"
                          src={getIconUrl('EDIT')}
                          style={{ filter: getIconStyle('ICON_FILTER_DARK_GREY') }}
                        />
                      </Button>
                    )}

                    {actions.showDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto hover:bg-gray-100 transition-colors"
                        onClick={handleDelete}
                      >
                        <img
                          className="w-5 h-5"
                          alt="Delete"
                          src={getIconUrl('DELETE')}
                          style={{ filter: getIconStyle('ICON_FILTER_DARK_GREY') }}
                        />
                      </Button>
                    )}
                  </div>
                )}

                {/* Branch It icon */}
                {actions.showBranchIt && !isHovered && (
                  <img
                    className="flex-shrink-0"
                    alt="Branch it"
                    src={getIconUrl('BRANCH_IT')}
                  />
                )}
              </div>
            </div>
          </CardContent>
        );

      case 'compact':
        return (
          <CardContent className="flex flex-col gap-[10px] py-3 px-4 flex-1 h-full">
            <div className="flex flex-col gap-2.5 flex-1 h-full">
              <div
                className="flex flex-col w-full justify-end p-2 rounded-lg bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: article.coverImage
                    ? `url(${article.coverImage})`
                    : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  aspectRatio: '16 / 9'
                }}
              >
                {/* Website link - hide for paid content */}
                <div className="flex justify-end">
                  {article.website && !article.isPaymentRequired && (
                    <div className="inline-flex items-start gap-[3px] px-2 py-1 bg-[#ffffffcc] rounded-[10px] overflow-hidden">
                      <span className="[font-family:'Lato',Helvetica] font-medium text-blue text-[10px] text-right tracking-[0] leading-[13px]">
                        {article.website}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                {/* Title with x402 payment badge */}
                <div className="relative overflow-hidden min-h-[40px]">
                  {article.isPaymentRequired && article.paymentPrice && (
                    <div className="float-left h-[24px] px-1 mr-1 mb-1 border-[#0052ff] bg-[linear-gradient(0deg,rgba(0,82,255,0.8)_0%,rgba(0,82,255,0.8)_100%),linear-gradient(0deg,rgba(255,254,254,1)_0%,rgba(255,254,254,1)_100%)] rounded-[50px] inline-flex items-center justify-center gap-[2px] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] border border-solid">
                      <img
                        className="w-[14px] h-[13px] flex-shrink-0"
                        alt="x402 payment"
                        src={getIconUrl('X402_PAYMENT')}
                      />
                      <span className="[font-family:'Lato',Helvetica] font-light text-[#ffffff] text-[11px] tracking-[0] leading-[11px] whitespace-nowrap">
                        {article.paymentPrice}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-1.5 w-full">
                    {isArticlePrivate() && (
                      <div className="flex-shrink-0 flex items-center gap-1 px-1 py-0.5 bg-red/8 rounded border border-red/15 mt-0.5">
                        <svg className="w-2 h-2 text-red" fill="currentColor" stroke="none" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red text-[10px] font-medium leading-none">私享</span>
                      </div>
                    )}
                    <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-[14px] tracking-[0] leading-[20px] break-words line-clamp-2 flex-1">
                      {article.title}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 px-2 py-2 rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] group-hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.45)_0%,rgba(224,224,224,0.45)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-colors flex-1">
                  <p
                    className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-[12px] tracking-[0] leading-[16px] overflow-hidden min-h-[32px]"
                    style={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    "{article.description}"
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <Avatar
                        className="w-[14px] h-[14px] flex-shrink-0"
                        onClick={handleUserClick}
                      >
                        <AvatarImage src={article.userAvatar} alt={article.userName} className="object-cover" />
                      </Avatar>
                      <span
                        className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-[11px] tracking-[0] leading-[14px] truncate"
                        onClick={handleUserClick}
                      >
                        {(article.userName && article.userName.trim() !== '') ? article.userName : 'Anonymous'}
                      </span>
                    </div>
                    <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-[11px] tracking-[0] leading-[14px] flex-shrink-0 ml-2">
                      {formatDate(article.date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        );

      case 'discovery':
      default:
        return (
          <CardContent className="flex flex-col gap-[15px] 3xl:gap-[18px] 4xl:gap-[20px] py-4 px-[20px] 3xl:px-[24px] 4xl:px-[28px] flex-1">
            <div className="flex flex-col gap-3 3xl:gap-3.5 4xl:gap-4 flex-1">
              <div
                className="flex flex-col w-full justify-end p-2.5 3xl:p-3 4xl:p-4 rounded-lg bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: article.coverImage
                    ? `url(${article.coverImage})`
                    : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  aspectRatio: '16 / 9'
                }}
              >
                {/* Website link - hide for paid content */}
                <div className="flex justify-end">
                  {article.website && !article.isPaymentRequired && (
                    <div className="inline-flex items-start gap-[5px] px-2 py-1 3xl:px-2.5 3xl:py-1.5 4xl:px-3 4xl:py-2 bg-[#ffffffcc] rounded-[12px] overflow-hidden">
                      <span className="[font-family:'Lato',Helvetica] font-medium text-blue text-xs 3xl:text-sm 4xl:text-base text-right tracking-[0] leading-[16px] 3xl:leading-[18px] 4xl:leading-[20px]">
                        {article.website}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2.5 3xl:gap-3 4xl:gap-3.5 flex-1">
                {/* Title with x402 payment badge */}
                <div className="relative min-h-[52px] 3xl:min-h-[58px] 4xl:min-h-[64px] overflow-hidden">
                  {article.isPaymentRequired && article.paymentPrice && (
                    <div className="float-left h-[28px] 3xl:h-[32px] 4xl:h-[36px] px-1.5 3xl:px-2 4xl:px-2.5 mr-[5px] mb-[5px] border-[#0052ff] bg-[linear-gradient(0deg,rgba(0,82,255,0.8)_0%,rgba(0,82,255,0.8)_100%),linear-gradient(0deg,rgba(255,254,254,1)_0%,rgba(255,254,254,1)_100%)] rounded-[50px] inline-flex items-center justify-center gap-[3px] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] border border-solid">
                      <img
                        className="w-[16px] h-[15px] 3xl:w-[18px] 3xl:h-[17px] 4xl:w-[20px] 4xl:h-[19px] flex-shrink-0"
                        alt="x402 payment"
                        src={getIconUrl('X402_PAYMENT')}
                      />
                      <span className="[font-family:'Lato',Helvetica] font-light text-[#ffffff] text-[13px] 3xl:text-[14px] 4xl:text-[15px] tracking-[0] leading-[13px] 3xl:leading-[14px] 4xl:leading-[15px] whitespace-nowrap">
                        {article.paymentPrice}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 w-full">
                    {isArticlePrivate() && (
                      <div className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 bg-red/8 rounded-md border border-red/15 mt-0.5">
                        <svg className="w-3 h-3 text-red" fill="currentColor" stroke="none" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red text-xs font-medium leading-none">私享</span>
                      </div>
                    )}
                    <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-[18px] 3xl:text-[20px] 4xl:text-[22px] tracking-[0] leading-[27px] 3xl:leading-[30px] 4xl:leading-[33px] break-words line-clamp-2 flex-1 min-w-0">
                      {article.title}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-col gap-2 3xl:gap-2.5 4xl:gap-3 px-2 py-2.5 3xl:px-2.5 3xl:py-3 4xl:px-3 4xl:py-3.5 rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] group-hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.45)_0%,rgba(224,224,224,0.45)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-colors">
                  <p
                    className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-[14px] 3xl:text-[15px] 4xl:text-[16px] tracking-[0] leading-[21px] 3xl:leading-[22px] 4xl:leading-[24px] overflow-hidden min-h-[42px] 3xl:min-h-[44px] 4xl:min-h-[48px]"
                    style={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    "{article.description}"
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5">
                      <Avatar
                        className="w-[16px] h-[16px] cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all duration-200"
                        onClick={handleUserClick}
                        title={`View ${article.userName}'s treasures`}
                      >
                        <AvatarImage src={article.userAvatar} alt={article.userName} className="object-cover" />
                      </Avatar>
                      <span
                        className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-[12px] 3xl:text-[13px] 4xl:text-[14px] tracking-[0] leading-[16px] 3xl:leading-[17px] 4xl:leading-[18px] cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={handleUserClick}
                      >
                        {(article.userName && article.userName.trim() !== '') ? article.userName : 'Anonymous'}
                      </span>
                    </div>
                    <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-[12px] 3xl:text-[13px] 4xl:text-[14px] tracking-[0] leading-[16px] 3xl:leading-[17px] 4xl:leading-[18px]">
                      {formatDate(article.date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons area */}
            <div className="flex items-center justify-between -mx-[20px] 3xl:-mx-[24px] 4xl:-mx-[28px] px-[20px] 3xl:px-[24px] 4xl:px-[28px]">
              {/* Left side: Treasure button, comment count, and view count */}
              <div className="flex items-center gap-3 3xl:gap-3.5 4xl:gap-4">
                {actions.showTreasure && (
                  <TreasureButton
                    isLiked={(() => {
                      const hasCallback = !!onLike;
                      const isLikedValue = hasCallback ? (article.isLiked || false) : false;


                      return isLikedValue;
                    })()} // Always false when no onLike callback
                    likesCount={typeof article.treasureCount === 'string' ? parseInt(article.treasureCount) || 0 : article.treasureCount}
                    onClick={handleLikeClick}
                    size="medium"
                    disabled={!onLike} // Disable when no onLike callback (user not logged in)
                  />
                )}
                {/* Comment count */}
                <div
                  className="inline-flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 rounded-lg transition-all duration-200"
                  onClick={handleCommentClick}
                  title="View comments"
                >
                  <img
                    className="w-4 h-4 transition-all duration-200"
                    alt="Comments"
                    src={commentIcon}
                    style={{ filter: 'brightness(0) saturate(100%) invert(44%) sepia(0%) saturate(0%) hue-rotate(186deg) brightness(94%) contrast(88%)' }}
                  />
                  <span className="[font-family:'Lato',Helvetica] font-bold text-[#696969] text-center tracking-[0] leading-[16px] text-[13px] transition-colors duration-200">
                    {article.commentCount || 0}
                  </span>
                </div>
                {/* View count - moved to left side */}
                {actions.showVisits && (
                  <div className="inline-flex items-center gap-1.5">
                    <img
                      className="w-4 h-4"
                      alt="Ic view"
                      src={getIconUrl('VIEW')}
                      style={{ filter: 'brightness(0) saturate(100%) invert(44%) sepia(0%) saturate(0%) hue-rotate(186deg) brightness(94%) contrast(88%)' }}
                    />
                    <span className="[font-family:'Lato',Helvetica] font-normal text-[#696969] text-center tracking-[0] leading-[16px] text-[13px]">
                      {article.visitCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Right side: Edit/Delete buttons */}
              <div className="flex items-center gap-3">
                {(actions.showEdit || actions.showDelete) && (
                  <div className="flex items-center gap-3">
                    {actions.showEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto hover:bg-gray-100 transition-colors"
                        onClick={handleEdit}
                      >
                        <img
                          className="w-5 h-3.5"
                          alt="Edit"
                          src={getIconUrl('EDIT')}
                          style={{ filter: getIconStyle('ICON_FILTER_DARK_GREY') }}
                        />
                      </Button>
                    )}

                    {actions.showDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto hover:bg-gray-100 transition-colors"
                        onClick={handleDelete}
                      >
                        <img
                          className="w-5 h-3.5"
                          alt="Delete"
                          src={getIconUrl('DELETE')}
                          style={{ filter: getIconStyle('ICON_FILTER_DARK_GREY') }}
                        />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        );
    }
  };

  // Base classes for different layouts
  const getBaseClasses = (layout: LayoutMode) => {
    if (layout === 'preview') {
      return "rounded-lg border-0 w-full shadow-sm lg:shadow-card-white flex flex-col";
    }
    if (layout === 'compact') {
      return "rounded-[8px] border-0 shadow-[1px_1px_8px_#d5d5d5] hover:shadow-[1px_1px_10px_#c5c5c5] transition-all duration-200 cursor-pointer group flex flex-col h-full";
    }
    return "rounded-[8px] border-0 shadow-none hover:shadow-[1px_1px_10px_#c5c5c5] transition-all duration-200 cursor-pointer group flex flex-col min-h-[380px]";
  };

  // Private article styling
  const getPrivateStyles = (isPrivate: boolean, layout: LayoutMode) => {
    if (!isPrivate) return "";

    if (layout === 'preview') {
      return "border-2 border-red/20 bg-gradient-to-br from-red/5 to-red/10";
    }
    if (layout === 'compact') {
      return "border-2 border-red/20 bg-gradient-to-br from-red/5 to-red/10 hover:border-red/30 hover:from-red/8 hover:to-red/15";
    }
    return "border-2 border-red/20 bg-gradient-to-br from-red/5 to-red/10 hover:border-red/30 hover:from-red/8 hover:to-red/15";
  };

  // Regular styling for non-private articles
  const getRegularStyles = (layout: LayoutMode) => {
    if (layout === 'preview') {
      return "bg-white";
    }
    if (layout === 'compact') {
      return "bg-white hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]";
    }
    return "bg-white hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]";
  };

  const isPrivate = isArticlePrivate();

  // Debug: Check if this is the "阿瑟地方" article
  if (article.title.includes('阿瑟地方')) {
    console.log('🔍 阿瑟地方 Article Debug:', {
      title: article.title,
      visibility: article.visibility,
      calculated_isPrivate: isPrivate,
      layout: layout,
      fullArticle: article
    });
  }

  const cardClasses = `${getBaseClasses(layout)} ${isPrivate ? getPrivateStyles(true, layout) : getRegularStyles(layout)}`;

  const cardContent = (
    <Card className={`${cardClasses} relative overflow-hidden`}>
      {/* Private article corner badge */}
      {isPrivate && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[0px] border-r-[30px] border-t-[30px] border-b-[0px] border-r-transparent border-t-red/30 z-10">
          <div className="absolute -top-[28px] -right-[26px] w-6 h-6 flex items-center justify-center">
            <svg className="w-3 h-3 text-red rotate-45" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
      {renderCardContent()}
    </Card>
  );

  return (
    <div
      className={`w-full ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {layout === 'preview' ? (
        cardContent
      ) : (
        <Link to={`/work/${article.uuid || article.id}`}>
          {cardContent}
        </Link>
      )}

      {/* Image preview modal */}
      <ImagePreviewModal
        isOpen={isImagePreviewOpen}
        imageUrl={previewImageUrl}
        alt={previewImageAlt}
        onClose={handleCloseImagePreview}
      />
    </div>
  );
};

// Memoized export for performance optimization
export const ArticleCard = React.memo(ArticleCardComponent, (prevProps, nextProps) => {
  // For preview layout, always re-render to show live updates
  if (prevProps.layout === 'preview' || nextProps.layout === 'preview') {
    return false; // false means "re-render"
  }

  // Custom comparison function to prevent unnecessary re-renders for other layouts
  return (
    prevProps.article.id === nextProps.article.id &&
    prevProps.article.isLiked === nextProps.article.isLiked &&
    prevProps.article.treasureCount === nextProps.article.treasureCount &&
    prevProps.layout === nextProps.layout &&
    prevProps.isHovered === nextProps.isHovered
  );
});