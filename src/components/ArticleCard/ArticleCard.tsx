import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { TreasureButton } from "../ui/TreasureButton";
import { ImagePreviewModal } from "../ui/image-preview-modal";
import { LazyImage } from "../ui/lazy-image";
import { getCategoryStyle, getCategoryInlineStyle, formatCount, formatDate } from "../../utils/categoryStyles";

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
  isLiked?: boolean;
  targetUrl?: string;
  website?: string;
  // x402 payment fields
  paymentPrice?: string; // Price in USDC (e.g., "0.01")
  isPaymentRequired?: boolean; // Whether content requires payment
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
  onEdit?: (articleId: string) => void;
  onDelete?: (articleId: string) => void;
  onUserClick?: (userId: number | undefined, userNamespace?: string) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  layout = 'discovery',
  actions = {
    showTreasure: true,
    showVisits: true,
    showWebsite: false
  },
  isHovered = false,
  onLike,
  onEdit,
  onDelete,
  onUserClick,
  onMouseEnter,
  onMouseLeave,
  className = ""
}) => {
  const categoryStyle = getCategoryStyle(article.category, article.categoryColor);
  const categoryInlineStyle = getCategoryInlineStyle(article.categoryColor);

  // Debug: Log payment data for this card
  React.useEffect(() => {
    console.log(`💳 Card payment data for "${article.title.substring(0, 30)}...":`, {
      isPaymentRequired: article.isPaymentRequired,
      paymentPrice: article.paymentPrice,
      hasPaymentData: !!(article.isPaymentRequired && article.paymentPrice)
    });
  }, [article.title, article.isPaymentRequired, article.paymentPrice]);

  // Image preview related state
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewImageAlt, setPreviewImageAlt] = useState("");

  // Handle like action
  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onLike) {
      const currentCount = typeof article.treasureCount === 'string'
        ? parseInt(article.treasureCount) || 0
        : article.treasureCount;
      await onLike(article.uuid || article.id, article.isLiked || false, currentCount);
    }
  };

  // Handle user click
  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onUserClick) {
      // Prefer namespace, fall back to userNamespace if not available
      onUserClick(article.userId, article.namespace || article.userNamespace);
    }
  };

  // Handle edit
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(article.id);
    }
  };

  // Handle delete
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(article.id);
    }
  };

  // Handle image preview
  const handleImagePreview = (imageUrl: string, alt: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewImageUrl(imageUrl);
    setPreviewImageAlt(alt);
    setIsImagePreviewOpen(true);
  };

  // Close image preview
  const handleCloseImagePreview = () => {
    setIsImagePreviewOpen(false);
    setPreviewImageUrl("");
    setPreviewImageAlt("");
  };

  // Render different card content based on layout mode
  const renderCardContent = () => {
    switch (layout) {
      case 'preview':
        return (
          <CardContent className="flex flex-col items-start gap-[15px] p-5">
            <div className="flex flex-col items-start justify-center gap-[15px] w-full">
              <div
                className="flex flex-col items-start p-2.5 w-full bg-cover bg-[50%_50%] rounded-lg relative"
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

                <Badge
                  variant="outline"
                  className={`inline-flex items-center gap-[5px] px-2.5 py-2 rounded-[50px] border w-fit ${
                    article.categoryColor ? '' : `${categoryStyle.border} ${categoryStyle.bg}`
                  }`}
                  style={article.categoryColor ? categoryInlineStyle : undefined}
                >
                  <span
                    className={`[font-family:'Lato',Helvetica] font-semibold text-sm tracking-[0] leading-[14px] ${
                      article.categoryColor ? '' : categoryStyle.text
                    }`}
                    style={article.categoryColor ? { color: categoryInlineStyle.color } : undefined}
                  >
                    {article.category}
                  </span>
                </Badge>

                <div className="absolute bottom-2.5 right-2.5">
                  <div className="inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-white rounded-[15px] overflow-hidden">
                    <span className="[font-family:'Lato',Helvetica] font-normal text-blue text-sm text-right tracking-[0] leading-[18.2px] whitespace-nowrap">
                      {article.website || 'example.com'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-[15px] w-full">
                {/* Title with x402 payment badge */}
                <div className="relative min-h-[72px] w-full overflow-hidden">
                  {article.isPaymentRequired && article.paymentPrice && (
                    <div className="float-left h-[36px] px-1.5 py-[8px] mr-[5px] mb-[5px] border-[#0052ff] bg-[linear-gradient(0deg,rgba(0,82,255,0.8)_0%,rgba(0,82,255,0.8)_100%),linear-gradient(0deg,rgba(255,254,254,1)_0%,rgba(255,254,254,1)_100%)] rounded-[50px] inline-flex items-center gap-[3px] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] border border-solid">
                      <img
                        className="relative w-[21px] h-5 aspect-[1.09]"
                        alt="x402 payment"
                        src="https://c.animaapp.com/ikGVr3RO/img/x402-icon-blue-1@2x.png"
                      />
                      <span className="[font-family:'Lato',Helvetica] font-light text-[#ffffff] text-base tracking-[0] leading-4 whitespace-nowrap">
                        {article.paymentPrice}
                      </span>
                    </div>
                  )}
                  <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-[36px] break-words line-clamp-2">
                    {article.title || 'Enter a title...'}
                  </h3>
                </div>

                <div className="flex flex-col gap-[15px] px-2.5 py-[15px] w-full rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                  <p className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[27px] line-clamp-2 break-words overflow-hidden">
                    "{article.description || 'Write your recommendation...'}"
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-[18px] h-[18px]">
                        <AvatarImage src={article.userAvatar} alt={article.userName} className="object-cover" />
                      </Avatar>
                      <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px]">
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
          <CardContent className="flex flex-col gap-[25px] py-5 px-[30px] flex-1">
            <div className="flex flex-col gap-5 flex-1">
              <div
                className="flex flex-col w-full justify-between p-[15px] rounded-lg bg-cover bg-center bg-no-repeat cursor-pointer transition-transform hover:scale-[1.02]"
                style={{
                  backgroundImage: `url(${article.coverImage})`,
                  aspectRatio: '16 / 9'
                }}
                title="Click to view content details"
              >
                {/* Category badge */}
                <Badge
                  variant="outline"
                  className={`inline-flex items-center gap-[5px] px-2.5 py-2 rounded-[50px] border w-fit ${
                    article.categoryColor ? '' : `${categoryStyle.border} ${categoryStyle.bg}`
                  }`}
                  style={article.categoryColor ? categoryInlineStyle : undefined}
                >
                  <span
                    className={`[font-family:'Lato',Helvetica] font-semibold text-sm tracking-[0] leading-[14px] ${
                      article.categoryColor ? '' : categoryStyle.text
                    }`}
                    style={article.categoryColor ? { color: categoryInlineStyle.color } : undefined}
                  >
                    {article.category}
                  </span>
                </Badge>

                {/* Website link */}
                <div className="flex justify-end">
                  {actions.showWebsite && article.website && (
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
                    <div className="float-left h-[36px] px-1.5 py-[8px] mr-[5px] mb-[5px] border-[#0052ff] bg-[linear-gradient(0deg,rgba(0,82,255,0.8)_0%,rgba(0,82,255,0.8)_100%),linear-gradient(0deg,rgba(255,254,254,1)_0%,rgba(255,254,254,1)_100%)] rounded-[50px] inline-flex items-center gap-[3px] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] border border-solid">
                      <img
                        className="relative w-[21px] h-5 aspect-[1.09]"
                        alt="x402 payment"
                        src="https://c.animaapp.com/ikGVr3RO/img/x402-icon-blue-1@2x.png"
                      />
                      <span className="[font-family:'Lato',Helvetica] font-light text-[#ffffff] text-base tracking-[0] leading-4 whitespace-nowrap">
                        {article.paymentPrice}
                      </span>
                    </div>
                  )}
                  <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-[36px] break-words line-clamp-2">
                    {article.title}
                  </h3>
                </div>

                <div className="flex flex-col gap-[15px] px-2.5 py-[15px] rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] group-hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.45)_0%,rgba(224,224,224,0.45)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-colors">
                  <p
                    className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[27px] break-all overflow-hidden min-h-[54px]"
                    style={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                      wordBreak: 'break-all',
                      overflowWrap: 'break-word'
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
                        {article.userName}
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
              {/* Left side: Treasure button */}
              {actions.showTreasure && (
                <TreasureButton
                  isLiked={article.isLiked || false}
                  likesCount={typeof article.treasureCount === 'string' ? parseInt(article.treasureCount) || 0 : article.treasureCount}
                  onClick={handleLikeClick}
                  size="large"
                />
              )}

              {/* Right side: Visit count and Edit/Delete buttons */}
              <div className="flex items-center gap-4">
                {/* Visit count */}
                {actions.showVisits && (
                  <div className="flex items-center gap-2">
                    <img
                      className="w-5 h-3.5"
                      alt="Ic view"
                      src="https://c.animaapp.com/mft5gmofxQLTNf/img/ic-view.svg"
                      style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(0%) saturate(0%)' }}
                    />
                    <span className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-center tracking-[0] leading-[20.8px]" style={{ fontSize: '1.125rem' }}>
                      {article.visitCount}
                    </span>
                  </div>
                )}

                {/* Edit and delete buttons area */}
                {isHovered && (actions.showEdit || actions.showDelete) && (
                  <div className="flex items-center gap-2 min-h-[24px]">
                    {actions.showEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 h-auto hover:bg-gray-100 transition-colors"
                        onClick={handleEdit}
                      >
                        <img
                          className="w-5 h-3.5"
                          alt="Edit"
                          src="https://c.animaapp.com/w7obk4mX/img/edit-1.svg"
                          style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(0%) saturate(0%)' }}
                        />
                      </Button>
                    )}

                    {actions.showDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 h-auto hover:bg-gray-100 transition-colors"
                        onClick={handleDelete}
                      >
                        <img
                          className="w-5 h-3.5"
                          alt="Delete"
                          src="https://c.animaapp.com/mft4oqz6uyUKY7/img/delete-1.svg"
                          style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(0%) saturate(0%)' }}
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
                    src="https://c.animaapp.com/mftam89xRJwsqQ/img/branch-it.svg"
                  />
                )}
              </div>
            </div>
          </CardContent>
        );

      case 'discovery':
      default:
        return (
          <CardContent className="flex flex-col gap-[25px] py-5 px-[30px] flex-1">
            <div className="flex flex-col gap-5 flex-1">
              <div
                className="flex flex-col w-full justify-between p-[15px] rounded-lg bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: article.coverImage
                    ? `url(${article.coverImage})`
                    : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  aspectRatio: '16 / 9'
                }}
              >
                {/* Category badge */}
                <Badge
                  variant="outline"
                  className={`inline-flex items-center gap-[5px] px-2.5 py-2 rounded-[50px] border w-fit ${
                    article.categoryColor ? '' : `${categoryStyle.border} ${categoryStyle.bg}`
                  }`}
                  style={article.categoryColor ? categoryInlineStyle : undefined}
                >
                  <span
                    className={`[font-family:'Lato',Helvetica] font-semibold text-sm tracking-[0] leading-[14px] ${
                      article.categoryColor ? '' : categoryStyle.text
                    }`}
                    style={article.categoryColor ? { color: categoryInlineStyle.color } : undefined}
                  >
                    {article.category}
                  </span>
                </Badge>

                {/* Website link */}
                <div className="flex justify-end">
                  {article.website && (
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
                    <div className="float-left h-[36px] px-1.5 py-[8px] mr-[5px] mb-[5px] border-[#0052ff] bg-[linear-gradient(0deg,rgba(0,82,255,0.8)_0%,rgba(0,82,255,0.8)_100%),linear-gradient(0deg,rgba(255,254,254,1)_0%,rgba(255,254,254,1)_100%)] rounded-[50px] inline-flex items-center gap-[3px] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] border border-solid">
                      <img
                        className="relative w-[21px] h-5 aspect-[1.09]"
                        alt="x402 payment"
                        src="https://c.animaapp.com/ikGVr3RO/img/x402-icon-blue-1@2x.png"
                      />
                      <span className="[font-family:'Lato',Helvetica] font-light text-[#ffffff] text-base tracking-[0] leading-4 whitespace-nowrap">
                        {article.paymentPrice}
                      </span>
                    </div>
                  )}
                  <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-[36px] break-words line-clamp-2">
                    {article.title}
                  </h3>
                </div>

                <div className="flex flex-col gap-[15px] px-2.5 py-[15px] rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] group-hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.45)_0%,rgba(224,224,224,0.45)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-colors">
                  <p
                    className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[27px] break-all overflow-hidden min-h-[54px]"
                    style={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                      wordBreak: 'break-all',
                      overflowWrap: 'break-word'
                    }}
                  >
                    "{article.description}"
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <Avatar
                        className="w-[18px] h-[18px] cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all duration-200"
                        onClick={handleUserClick}
                        title={`View ${article.userName}'s treasures`}
                      >
                        <AvatarImage src={article.userAvatar} alt={article.userName} className="object-cover" />
                      </Avatar>
                      <span
                        className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={handleUserClick}
                      >
                        {article.userName}
                      </span>
                    </div>
                    <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px]">
                      {formatDate(article.date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons area */}
            <div className="flex items-center justify-between -mx-[30px] px-[30px]">
              {/* Left side: Treasure button */}
              <div className="flex items-center gap-4">
                {actions.showTreasure && (
                  <TreasureButton
                    isLiked={article.isLiked || false}
                    likesCount={typeof article.treasureCount === 'string' ? parseInt(article.treasureCount) || 0 : article.treasureCount}
                    onClick={handleLikeClick}
                    size="large"
                  />
                )}
              </div>

              {/* Right side: Visit count and Edit/Delete buttons */}
              <div className="flex items-center gap-4">
                {actions.showVisits && (
                  <div className="inline-flex items-center gap-2">
                    <img
                      className="w-5 h-3.5"
                      alt="Ic view"
                      src="https://c.animaapp.com/mft5gmofxQLTNf/img/ic-view.svg"
                      style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(0%) saturate(0%)' }}
                    />
                    <span className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-center tracking-[0] leading-[20.8px]" style={{ fontSize: '1.125rem' }}>
                      {article.visitCount}
                    </span>
                  </div>
                )}

                {isHovered && (actions.showEdit || actions.showDelete) && (
                  <div className="flex items-center gap-2">
                    {actions.showEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 h-auto hover:bg-gray-100 transition-colors"
                        onClick={handleEdit}
                      >
                        <img
                          className="w-5 h-3.5"
                          alt="Edit"
                          src="https://c.animaapp.com/w7obk4mX/img/edit-1.svg"
                          style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(0%) saturate(0%)' }}
                        />
                      </Button>
                    )}

                    {actions.showDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 h-auto hover:bg-gray-100 transition-colors"
                        onClick={handleDelete}
                      >
                        <img
                          className="w-5 h-3.5"
                          alt="Delete"
                          src="https://c.animaapp.com/mft4oqz6uyUKY7/img/delete-1.svg"
                          style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(0%) saturate(0%)' }}
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

  const cardClasses = layout === 'preview'
    ? "bg-white rounded-lg shadow-card-white border-0"
    : "bg-white rounded-[8px] border shadow-none hover:shadow-[1px_1px_10px_#c5c5c5] hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-all duration-200 cursor-pointer group flex flex-col min-h-[500px]";

  const cardContent = (
    <Card className={cardClasses}>
      {renderCardContent()}
    </Card>
  );

  return (
    <div
      className={`${layout === 'preview' ? 'w-[500px]' : 'w-full'} ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {layout === 'preview' ? (
        cardContent
      ) : (
        <Link to={`/work/${article.id}`}>
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