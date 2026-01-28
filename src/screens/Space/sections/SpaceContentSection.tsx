import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import { AuthService } from "../../../services/authService";
import { removeArticleFromSpace } from "../../../services/articleService";
import { Button } from "../../../components/ui/button";
import { useToast } from "../../../components/ui/toast";
import profileDefaultAvatar from "../../../assets/images/profile-default.svg";
import { ArticleCard, ArticleData } from "../../../components/ArticleCard";
import { CollectTreasureModal } from "../../../components/CollectTreasureModal";
import { ImageUploader } from "../../../components/ImageUploader/ImageUploader";
import { devLog } from "../../../utils/devLogger";
import { ErrorHandler } from "../../../utils/errorHandler";
import { API_ENDPOINTS } from "../../../config/apiEndpoints";
import { spaceShortcuts, eventHandlers } from "../../../utils/devShortcuts";

// Add debug logging for Space component
console.log('📍 SpaceContentSection module loaded');

// Module-level cache to prevent duplicate fetches across StrictMode remounts
interface SpaceFetchCacheEntry {
  timestamp: number;
  inProgress: boolean;
  data?: { spaceInfo: any; articles: any[]; totalCount: number; spaceId: number | null; isFollowing: boolean };
}
const spaceFetchCache: Map<string, SpaceFetchCacheEntry> = new Map();
const SPACE_CACHE_TTL = 5000; // 5 seconds - prevents duplicate fetches during mount cycles

// Space Info Section Component - Styled similar to Profile page
const SpaceInfoSection = ({
  spaceName,
  treasureCount,
  authorName,
  authorAvatar,
  authorNamespace,
  spaceDescription,
  spaceCoverUrl,
  firstArticleCover,
  isFollowing,
  isOwner,
  spaceType,
  onFollow,
  onUnfollow,
  onShare,
  onAuthorClick,
  onEdit,
}: {
  spaceName: string;
  treasureCount: number;
  authorName: string;
  authorAvatar?: string;
  authorNamespace?: string;
  spaceDescription?: string;
  spaceCoverUrl?: string;
  firstArticleCover?: string;
  isFollowing: boolean;
  isOwner: boolean;
  spaceType?: number;
  onFollow: () => void;
  onUnfollow: () => void;
  onShare: () => void;
  onAuthorClick: () => void;
  onEdit?: () => void;
}): JSX.Element => {
  const canEdit = isOwner;
  const [showUnfollowDropdown, setShowUnfollowDropdown] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const { showToast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
      setShowShareDropdown(false);
    } catch (error) {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleShareOnX = () => {
    const encodedUrl = encodeURIComponent(window.location.href);
    const encodedText = encodeURIComponent(spaceName);
    window.open(
      `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      '_blank',
      'noopener,noreferrer'
    );
    setShowShareDropdown(false);
  };

  return (
    <section className="w-full">
      {/* Cover image - only show if there's a cover */}
      {spaceCoverUrl && (
        <div className="w-full h-48 rounded-t-2xl bg-gradient-to-r from-blue-100 to-purple-100 relative group">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat rounded-t-2xl overflow-hidden"
            style={{
              backgroundImage: `url(${spaceCoverUrl})`,
              backgroundColor: '#f3f4f6'
            }}
          />
          {/* Edit and Share buttons - positioned at top right */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            {canEdit && (
              <button
                type="button"
                aria-label="Edit space"
                className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:opacity-70 transition-opacity"
                onClick={onEdit}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}

            {/* Share button */}
            <div className="relative">
              <button
                type="button"
                aria-label="Share space"
                className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:opacity-70 transition-opacity"
                onClick={() => setShowShareDropdown(!showShareDropdown)}
              >
                <img
                  alt="Share"
                  src="https://c.animaapp.com/V3VIhpjY/img/share.svg"
                  className="w-4 h-4"
                />
              </button>
              {showShareDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowShareDropdown(false)} />
                  <div className="absolute top-full right-0 mt-1 w-[183px] bg-white rounded-[15px] shadow-[0px_4px_10px_rgba(0,0,0,0.15)] z-20">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-4 pl-5 pr-5 py-4 w-full text-left rounded-t-[15px] transition-colors hover:bg-[rgba(224,224,224,0.25)]"
                    >
                      <svg className="w-[18px] h-[18px]" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 10.5C7.89782 11.0052 8.40206 11.4133 8.97664 11.6955C9.55121 11.9777 10.1815 12.1267 10.8214 12.1321C11.4613 12.1375 12.094 12.0992 12.6729 11.8202C13.2518 11.5412 13.7627 11.1286 14.1675 10.6125L16.4175 8.3625C17.1977 7.53784 17.6309 6.44599 17.6221 5.31271C17.6133 4.17943 17.163 3.09441 16.3705 2.28195C15.578 1.46948 14.503 1.01919 13.3797 1.01039C12.2564 1.00159 11.1746 1.43483 10.35 2.215L9.1125 3.4525" stroke="#454545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.5 7.5C10.1022 6.99475 9.59794 6.58669 9.02336 6.30453C8.44879 6.02237 7.81854 5.87331 7.17863 5.86789C6.53872 5.86247 5.90598 5.90083 5.32709 6.17978C4.7482 6.45873 4.23726 6.87144 3.8325 7.3875L1.5825 9.6375C0.802299 10.4622 0.369062 11.554 0.377857 12.6873C0.386652 13.8206 0.836948 14.9056 1.62948 15.718C2.422 16.5305 3.49702 16.9808 4.62031 16.9896C5.74359 16.9984 6.82543 16.5652 7.65 15.785L8.8875 14.5475" stroke="#454545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-base">Copy link</span>
                    </button>
                    <button
                      onClick={handleShareOnX}
                      className="flex items-center gap-4 pl-5 pr-5 py-4 w-full text-left rounded-b-[15px] transition-colors hover:bg-[rgba(224,224,224,0.25)] border-t border-[#e0e0e0]"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#454545"/>
                      </svg>
                      <span className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-base">Share on X</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Subscribe button - positioned at bottom right (only for non-owners) */}
          {!isOwner && (
            <div className="absolute bottom-3 right-3 z-10">
              {isFollowing ? (
                <div className="relative">
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] border border-solid border-green cursor-pointer hover:opacity-80 transition-all bg-white shadow-lg"
                    aria-label="Subscription options"
                    type="button"
                    onClick={() => setShowUnfollowDropdown(!showUnfollowDropdown)}
                  >
                    <span className="[font-family:'Lato',Helvetica] font-medium text-sm tracking-[0] leading-[22.4px] whitespace-nowrap text-green">
                      Subscribed
                    </span>
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {showUnfollowDropdown && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowUnfollowDropdown(false)} />
                      <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-[50px] shadow-lg z-30 min-w-[120px]">
                        <button
                          className="w-full px-4 py-2 text-center text-red hover:bg-gray-50 rounded-[50px] [font-family:'Lato',Helvetica] font-medium text-sm"
                          onClick={() => {
                            setShowUnfollowDropdown(false);
                            onUnfollow();
                          }}
                        >
                          Unsubscribe
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] border border-solid border-green cursor-pointer hover:opacity-80 transition-all shadow-lg"
                  style={{ background: 'linear-gradient(0deg, rgba(43, 134, 73, 0.1) 0%, rgba(43, 134, 73, 0.1) 100%), #FFFFFF' }}
                  aria-label="Subscribe to space"
                  type="button"
                  onClick={onFollow}
                >
                  <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green">
                    <path d="M12.6967 13.0467C15.1618 13.0467 17.1671 11.0411 17.1671 8.57603C17.1671 6.11099 15.1618 4.10566 12.6967 4.10566C10.2317 4.10566 8.22603 6.11099 8.22603 8.57603C8.22603 11.0411 10.2317 13.0467 12.6967 13.0467ZM12.6967 4.80566C14.7759 4.80566 16.4671 6.49688 16.4671 8.57603C16.4671 10.6552 14.7759 12.3467 12.6967 12.3467C10.6176 12.3467 8.92603 10.6552 8.92603 8.57603C8.92603 6.49688 10.6176 4.80566 12.6967 4.80566Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
                    <path d="M25.2021 14.8904C25.3276 14.1689 25.3935 13.432 25.3935 12.6967C25.3935 5.6957 19.6978 0 12.6967 0C5.6957 0 0 5.6957 0 12.6967C0 19.6978 5.6957 25.3935 12.6967 25.3935C13.4323 25.3935 14.1695 25.328 14.8906 25.2024C16.238 26.9034 18.3166 28 20.65 28C24.7027 28 28 24.7027 28 20.65C28 18.3165 26.9033 16.2378 25.2021 14.8904ZM12.6967 0.7C19.3119 0.7 24.6935 6.08159 24.6935 12.6967C24.6935 13.2802 24.6495 13.8647 24.5657 14.4409C23.4305 13.7224 22.09 13.3 20.65 13.3C18.8694 13.3 17.2353 13.9372 15.962 14.9946C14.9104 14.6529 13.8131 14.4754 12.6967 14.4754C8.76307 14.4754 5.13302 16.7004 3.32408 20.1724C1.68397 18.1203 0.7 15.522 0.7 12.6967C0.7 6.08159 6.08159 0.7 12.6967 0.7ZM12.6967 24.6935C9.17831 24.6935 6.00907 23.1709 3.81268 20.7502C5.45388 17.3611 8.92765 15.1754 12.6967 15.1754C13.6074 15.1754 14.5029 15.306 15.3694 15.5496C14.0911 16.8727 13.3 18.6694 13.3 20.65C13.3 22.0899 13.7223 23.4303 14.4408 24.5655C13.8649 24.6492 13.2804 24.6935 12.6967 24.6935ZM20.65 27.3C16.9832 27.3 14 24.3168 14 20.65C14 16.9832 16.9832 14 20.65 14C24.3168 14 27.3 16.9832 27.3 20.65C27.3 24.3168 24.3168 27.3 20.65 27.3Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
                    <path d="M23.236 17.5383C22.4608 17.2009 21.4129 17.2672 20.65 18.0879C19.8871 17.2672 18.8392 17.2006 18.064 17.5383C17.1603 17.9313 16.3998 18.9441 16.7371 20.3215C17.3028 22.6293 20.3554 24.2836 20.4849 24.353C20.5365 24.3807 20.5933 24.3944 20.65 24.3944C20.7067 24.3944 20.7635 24.3807 20.8151 24.353C20.9446 24.2836 23.9976 22.6293 24.5629 20.3215C24.9002 18.9441 24.1397 17.9313 23.236 17.5383ZM23.8827 20.1547C23.4609 21.8781 21.2724 23.2747 20.65 23.6414C20.0276 23.2747 17.8394 21.8781 17.4173 20.1547C17.1767 19.1734 17.7088 18.456 18.3432 18.1802C18.5312 18.0981 18.7523 18.0465 18.9854 18.0465C19.4537 18.0465 19.9695 18.2554 20.3574 18.8467C20.4866 19.0442 20.8134 19.0442 20.9426 18.8467C21.5236 17.9611 22.3904 17.9331 22.9568 18.1802C23.5912 18.456 24.1233 19.1734 23.8827 20.1547Z" fill="currentColor" stroke="currentColor" strokeWidth="0.3"/>
                  </svg>
                  <span className="[font-family:'Lato',Helvetica] font-medium text-sm tracking-[0] leading-[22.4px] whitespace-nowrap text-green">
                    Subscribe
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Space information */}
      <div className={`relative flex flex-col items-center text-center ${spaceCoverUrl ? 'mt-[-40px]' : ''}`}>
        {/* Space avatar - use author avatar for default spaces, first article cover for custom */}
        {(() => {
          const isDefaultSpace = spaceType === 1 || spaceType === 2;
          const avatarImage = isDefaultSpace ? authorAvatar : firstArticleCover;
          const firstLetter = spaceName?.charAt(0)?.toUpperCase() || 'S';

          return avatarImage ? (
            <img
              src={avatarImage}
              alt={spaceName}
              className="w-20 h-20 rounded-full object-cover mb-3 border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-3 border-4 border-white shadow-lg">
              <span className="text-2xl font-medium text-gray-600">{firstLetter}</span>
            </div>
          );
        })()}

        {/* Space name */}
        <h1 className="[font-family:'Lato',Helvetica] font-normal text-off-black text-2xl tracking-[0] leading-[1.4] mb-3">{spaceName}</h1>

        {/* Treasure count and author info */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-gray-500">{treasureCount} treasures</span>
          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-500">By</span>
          <button
            onClick={onAuthorClick}
            className="inline-flex items-center gap-1.5 hover:opacity-70 transition-opacity cursor-pointer"
          >
            <img
              src={authorAvatar || profileDefaultAvatar}
              alt={authorName}
              className="w-4 h-4 rounded-full object-cover"
            />
            <span className="text-sm text-gray-500 hover:text-gray-700">{authorName}</span>
          </button>
        </div>

        {/* Description */}
        {spaceDescription && spaceDescription.trim() && (
          <p className="text-gray-700 text-base leading-relaxed mb-3">{spaceDescription}</p>
        )}

        {/* Action buttons - show below description when no cover */}
        {!spaceCoverUrl && (
          <div className="flex items-center gap-3 mt-1">
            {canEdit && (
              <button
                type="button"
                aria-label="Edit space"
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:opacity-70 transition-opacity"
                onClick={onEdit}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}

            {/* Subscribe button (only for non-owners) */}
            {!isOwner && (
              isFollowing ? (
                <div className="relative">
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] border border-solid border-green cursor-pointer hover:opacity-80 transition-all bg-white"
                    aria-label="Subscription options"
                    type="button"
                    onClick={() => setShowUnfollowDropdown(!showUnfollowDropdown)}
                  >
                    <span className="[font-family:'Lato',Helvetica] font-medium text-sm tracking-[0] leading-[22.4px] whitespace-nowrap text-green">
                      Subscribed
                    </span>
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {showUnfollowDropdown && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowUnfollowDropdown(false)} />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-[50px] shadow-lg z-30 min-w-[120px]">
                        <button
                          className="w-full px-4 py-2 text-center text-red hover:bg-gray-50 rounded-[50px] [font-family:'Lato',Helvetica] font-medium text-sm"
                          onClick={() => {
                            setShowUnfollowDropdown(false);
                            onUnfollow();
                          }}
                        >
                          Unsubscribe
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] border border-solid border-green cursor-pointer hover:opacity-80 transition-all"
                  style={{ background: 'linear-gradient(0deg, rgba(43, 134, 73, 0.1) 0%, rgba(43, 134, 73, 0.1) 100%), #FFFFFF' }}
                  aria-label="Subscribe to space"
                  type="button"
                  onClick={onFollow}
                >
                  <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green">
                    <path d="M12.6967 13.0467C15.1618 13.0467 17.1671 11.0411 17.1671 8.57603C17.1671 6.11099 15.1618 4.10566 12.6967 4.10566C10.2317 4.10566 8.22603 6.11099 8.22603 8.57603C8.22603 11.0411 10.2317 13.0467 12.6967 13.0467ZM12.6967 4.80566C14.7759 4.80566 16.4671 6.49688 16.4671 8.57603C16.4671 10.6552 14.7759 12.3467 12.6967 12.3467C10.6176 12.3467 8.92603 10.6552 8.92603 8.57603C8.92603 6.49688 10.6176 4.80566 12.6967 4.80566Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
                    <path d="M25.2021 14.8904C25.3276 14.1689 25.3935 13.432 25.3935 12.6967C25.3935 5.6957 19.6978 0 12.6967 0C5.6957 0 0 5.6957 0 12.6967C0 19.6978 5.6957 25.3935 12.6967 25.3935C13.4323 25.3935 14.1695 25.328 14.8906 25.2024C16.238 26.9034 18.3166 28 20.65 28C24.7027 28 28 24.7027 28 20.65C28 18.3165 26.9033 16.2378 25.2021 14.8904ZM12.6967 0.7C19.3119 0.7 24.6935 6.08159 24.6935 12.6967C24.6935 13.2802 24.6495 13.8647 24.5657 14.4409C23.4305 13.7224 22.09 13.3 20.65 13.3C18.8694 13.3 17.2353 13.9372 15.962 14.9946C14.9104 14.6529 13.8131 14.4754 12.6967 14.4754C8.76307 14.4754 5.13302 16.7004 3.32408 20.1724C1.68397 18.1203 0.7 15.522 0.7 12.6967C0.7 6.08159 6.08159 0.7 12.6967 0.7ZM12.6967 24.6935C9.17831 24.6935 6.00907 23.1709 3.81268 20.7502C5.45388 17.3611 8.92765 15.1754 12.6967 15.1754C13.6074 15.1754 14.5029 15.306 15.3694 15.5496C14.0911 16.8727 13.3 18.6694 13.3 20.65C13.3 22.0899 13.7223 23.4303 14.4408 24.5655C13.8649 24.6492 13.2804 24.6935 12.6967 24.6935ZM20.65 27.3C16.9832 27.3 14 24.3168 14 20.65C14 16.9832 16.9832 14 20.65 14C24.3168 14 27.3 16.9832 27.3 20.65C27.3 24.3168 24.3168 27.3 20.65 27.3Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
                    <path d="M23.236 17.5383C22.4608 17.2009 21.4129 17.2672 20.65 18.0879C19.8871 17.2672 18.8392 17.2006 18.064 17.5383C17.1603 17.9313 16.3998 18.9441 16.7371 20.3215C17.3028 22.6293 20.3554 24.2836 20.4849 24.353C20.5365 24.3807 20.5933 24.3944 20.65 24.3944C20.7067 24.3944 20.7635 24.3807 20.8151 24.353C20.9446 24.2836 23.9976 22.6293 24.5629 20.3215C24.9002 18.9441 24.1397 17.9313 23.236 17.5383ZM23.8827 20.1547C23.4609 21.8781 21.2724 23.2747 20.65 23.6414C20.0276 23.2747 17.8394 21.8781 17.4173 20.1547C17.1767 19.1734 17.7088 18.456 18.3432 18.1802C18.5312 18.0981 18.7523 18.0465 18.9854 18.0465C19.4537 18.0465 19.9695 18.2554 20.3574 18.8467C20.4866 19.0442 20.8134 19.0442 20.9426 18.8467C21.5236 17.9611 22.3904 17.9331 22.9568 18.1802C23.5912 18.456 24.1233 19.1734 23.8827 20.1547Z" fill="currentColor" stroke="currentColor" strokeWidth="0.3"/>
                  </svg>
                  <span className="[font-family:'Lato',Helvetica] font-medium text-sm tracking-[0] leading-[22.4px] whitespace-nowrap text-green">
                    Subscribe
                  </span>
                </button>
              )
            )}

            {/* Share button */}
            <div className="relative">
              <button
                type="button"
                aria-label="Share space"
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:opacity-70 transition-opacity"
                onClick={() => setShowShareDropdown(!showShareDropdown)}
              >
                <img
                  alt="Share"
                  src="https://c.animaapp.com/V3VIhpjY/img/share.svg"
                  className="w-4 h-4"
                />
              </button>
              {showShareDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowShareDropdown(false)} />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[183px] bg-white rounded-[15px] shadow-[0px_4px_10px_rgba(0,0,0,0.15)] z-20">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-4 pl-5 pr-5 py-4 w-full text-left rounded-t-[15px] transition-colors hover:bg-[rgba(224,224,224,0.25)]"
                    >
                      <svg className="w-[18px] h-[18px]" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 10.5C7.89782 11.0052 8.40206 11.4133 8.97664 11.6955C9.55121 11.9777 10.1815 12.1267 10.8214 12.1321C11.4613 12.1375 12.094 12.0992 12.6729 11.8202C13.2518 11.5412 13.7627 11.1286 14.1675 10.6125L16.4175 8.3625C17.1977 7.53784 17.6309 6.44599 17.6221 5.31271C17.6133 4.17943 17.163 3.09441 16.3705 2.28195C15.578 1.46948 14.503 1.01919 13.3797 1.01039C12.2564 1.00159 11.1746 1.43483 10.35 2.215L9.1125 3.4525" stroke="#454545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.5 7.5C10.1022 6.99475 9.59794 6.58669 9.02336 6.30453C8.44879 6.02237 7.81854 5.87331 7.17863 5.86789C6.53872 5.86247 5.90598 5.90083 5.32709 6.17978C4.7482 6.45873 4.23726 6.87144 3.8325 7.3875L1.5825 9.6375C0.802299 10.4622 0.369062 11.554 0.377857 12.6873C0.386652 13.8206 0.836948 14.9056 1.62948 15.718C2.422 16.5305 3.49702 16.9808 4.62031 16.9896C5.74359 16.9984 6.82543 16.5652 7.65 15.785L8.8875 14.5475" stroke="#454545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-base">Copy link</span>
                    </button>
                    <button
                      onClick={handleShareOnX}
                      className="flex items-center gap-4 pl-5 pr-5 py-4 w-full text-left rounded-b-[15px] transition-colors hover:bg-[rgba(224,224,224,0.25)] border-t border-[#e0e0e0]"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#454545"/>
                      </svg>
                      <span className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-base">Share on X</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// Main Space Content Section
export const SpaceContentSection = (): JSX.Element => {
  const navigate = useNavigate();
  const { category, namespace } = useParams<{ category?: string; namespace?: string }>();
  // Support both /space/:category and /treasury/:namespace routes
  const spaceIdentifier = namespace || category;

  const { user, getArticleLikeState, toggleLike } = useUser();
  const { showToast } = useToast();

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spaceInfo, setSpaceInfo] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArticleCount, setTotalArticleCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false); // Track if we've loaded all articles
  const isLoadingMoreRef = useRef(false); // Ref to prevent race conditions in scroll handler
  const PAGE_SIZE = 20;

  // Edit space modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSpaceName, setEditSpaceName] = useState("");
  const [editSpaceDescription, setEditSpaceDescription] = useState("");
  const [editSpaceCoverUrl, setEditSpaceCoverUrl] = useState("");
  const [displaySpaceName, setDisplaySpaceName] = useState("");
  const [spaceId, setSpaceId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false); // 跟踪图片上传状态

  // Collect Treasure Modal state
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<{ uuid: string; title: string; isLiked: boolean; likeCount: number } | null>(null);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch space data
  useEffect(() => {
    const fetchSpaceData = async () => {
      if (!spaceIdentifier) {
        setError('Invalid space');
        setLoading(false);
        return;
      }

      const decodedIdentifier = decodeURIComponent(spaceIdentifier);

      // Create a unique cache key for this space
      const cacheKey = namespace ? `namespace:${decodedIdentifier}` : `category:${decodedIdentifier}`;

      // Check module-level cache to prevent duplicate fetches (survives StrictMode remounts)
      const now = Date.now();
      const cached = spaceFetchCache.get(cacheKey);

      // If we have cached data and it's still valid, use it immediately
      if (cached && cached.data && (now - cached.timestamp < SPACE_CACHE_TTL)) {
        console.log('[Space] Using cached data for:', cacheKey);
        setSpaceInfo(cached.data.spaceInfo);
        setArticles(cached.data.articles);
        setTotalArticleCount(cached.data.totalCount);
        if (cached.data.spaceId) setSpaceId(cached.data.spaceId);
        if (cached.data.isFollowing !== undefined) setIsFollowing(cached.data.isFollowing);
        setLoading(false);
        return;
      }

      // If fetch is already in progress, skip to prevent duplicate calls
      if (cached && cached.inProgress) {
        console.log('[Space] Fetch already in progress for:', cacheKey, '- skipping');
        return;
      }

      // Mark as in progress immediately to prevent race conditions
      spaceFetchCache.set(cacheKey, { timestamp: now, inProgress: true });

      try {
        setLoading(true);
        setError(null);

        // Check if this is a namespace route (from /treasury/:namespace)
        const isNamespaceRoute = !!namespace;

        let articlesArray: any[] = [];
        let fetchedSpaceInfo: any = null;
        let fetchedSpaceId: number | null = null;
        let fetchedTotalCount = 0;

        if (isNamespaceRoute) {
          // Fetch space info by namespace using getSpaceInfo API
          console.log('[Space] Fetching space info by namespace:', decodedIdentifier);
          const spaceInfoResponse = await AuthService.getSpaceInfo(decodedIdentifier);
          console.log('[Space] Space info API response:', spaceInfoResponse);
          console.log('🔥🔥🔥 SPACE COVERURL DEBUG: Raw API response:', JSON.stringify(spaceInfoResponse, null, 2));

          // Extract space info from response.data
          const spaceData = spaceInfoResponse?.data || spaceInfoResponse;
          console.log('🔥🔥🔥 SPACE COVERURL DEBUG: Extracted space data:', JSON.stringify(spaceData, null, 2));

          // Get author username for display name with comprehensive fallback chain
          // Note: Do NOT fall back to logged-in user's username - use API data only
          // Display 'Anonymous' when username is empty instead of namespace
          const authorUsername = spaceData?.userInfo?.username
            || spaceData?.ownerInfo?.username
            || spaceData?.authorInfo?.username
            || spaceData?.user?.username
            || spaceData?.author?.username
            || spaceData?.creator?.username
            || spaceData?.ownerName
            || spaceData?.userName
            || spaceData?.username
            || 'Anonymous';

          // Determine display name based on spaceType (same logic as Treasury list)
          // spaceType 1 = Treasury, spaceType 2 = Curations
          let displayName = spaceData?.name || decodedIdentifier;
          if (spaceData?.spaceType === 1) {
            displayName = `${authorUsername}'s Treasury`;
          } else if (spaceData?.spaceType === 2) {
            displayName = `${authorUsername}'s Curations`;
          }

          // Build space info object
          // Note: Do NOT fall back to logged-in user's avatar/namespace - always show the space creator's info
          fetchedSpaceInfo = {
            name: displayName,
            authorName: authorUsername,
            authorAvatar: spaceData?.userInfo?.faceUrl || profileDefaultAvatar,
            authorNamespace: spaceData?.userInfo?.namespace,
            spaceType: spaceData?.spaceType,
            description: spaceData?.description, // Add space description
            coverUrl: spaceData?.coverUrl, // Add space cover image
          };

          // Store spaceId for later use (edit functionality)
          fetchedSpaceId = spaceData?.id || null;

          // Store the total article count from space info
          fetchedTotalCount = spaceData?.articleCount || 0;

          // Set follow status from space data
          const followStatus = spaceData?.isFollowed || spaceData?.followed || false;
          setIsFollowing(followStatus);
          console.log('[Space] Setting follow status:', followStatus);

          // Fetch articles using spaceId from the space info
          if (fetchedSpaceId) {
            console.log('[Space] Fetching articles for spaceId:', fetchedSpaceId, 'page:', 1, 'pageSize:', PAGE_SIZE);
            const articlesResponse = await AuthService.getSpaceArticles(fetchedSpaceId, 1, PAGE_SIZE);
            console.log('[Space] Space articles API response:', articlesResponse);

            // Extract articles from paginated response
            if (articlesResponse?.data && Array.isArray(articlesResponse.data)) {
              articlesArray = articlesResponse.data;
            } else if (articlesResponse?.data?.data && Array.isArray(articlesResponse.data.data)) {
              articlesArray = articlesResponse.data.data;
            }

            // 添加原始文章数据的调试信息
            console.log('🔥 DEBUG: Raw articles from API:', {
              count: articlesArray.length,
              firstArticleSample: articlesArray[0] ? {
                id: articlesArray[0].id,
                uuid: articlesArray[0].uuid,
                title: articlesArray[0].title,
                keys: Object.keys(articlesArray[0])
              } : 'no articles'
            });
          }

          // Set all states
          setSpaceInfo(fetchedSpaceInfo);
          if (fetchedSpaceId) setSpaceId(fetchedSpaceId);
          setTotalArticleCount(fetchedTotalCount);
          setArticles(articlesArray);
          setCurrentPage(1);
          setReachedEnd(false); // Reset reached end state for new space

          // Store in cache for reuse
          spaceFetchCache.set(cacheKey, {
            timestamp: Date.now(),
            inProgress: false,
            data: { spaceInfo: fetchedSpaceInfo, articles: articlesArray, totalCount: fetchedTotalCount, spaceId: fetchedSpaceId, isFollowing: followStatus }
          });
        } else {
          // Old category-based route (for backwards compatibility)
          setSpaceInfo({
            name: decodedIdentifier,
            authorName: user?.username || 'Anonymous',
            authorAvatar: user?.faceUrl || profileDefaultAvatar,
            authorNamespace: user?.namespace,
            description: undefined, // No description available for old category routes
            coverUrl: undefined, // No cover available for old category routes
          });

          // For old routes, assume not following (since no API to check)
          setIsFollowing(false);

          // Fetch articles for this category/space
          const userId = user?.id;
          if (userId) {
            // Check if this is a special space (treasury or curations)
            const isTreasurySpace = decodedIdentifier.endsWith("'s treasury");
            const isCurationsSpace = decodedIdentifier.endsWith("'s curations");

            if (isCurationsSpace) {
              // Fetch created/curated articles for curations space
              console.log('Fetching curated articles for user:', userId);
              const curatedResponse = await AuthService.getMyCreatedArticles(1, 100, userId);

              if (curatedResponse?.data?.data && Array.isArray(curatedResponse.data.data)) {
                articlesArray = curatedResponse.data.data;
              } else if (curatedResponse?.data && Array.isArray(curatedResponse.data)) {
                articlesArray = curatedResponse.data;
              } else if (Array.isArray(curatedResponse)) {
                articlesArray = curatedResponse;
              }

              setArticles(articlesArray);
            } else if (isTreasurySpace) {
              // Fetch liked/treasured articles for treasury space
              const likedResponse = await AuthService.getMyLikedArticlesCorrect(1, 100, userId);

              if (likedResponse?.data?.data && Array.isArray(likedResponse.data.data)) {
                articlesArray = likedResponse.data.data;
              } else if (likedResponse?.data && Array.isArray(likedResponse.data)) {
                articlesArray = likedResponse.data;
              } else if (Array.isArray(likedResponse)) {
                articlesArray = likedResponse;
              }

              setArticles(articlesArray);
            } else {
              // Regular category-based space - fetch liked articles and filter
              const likedResponse = await AuthService.getMyLikedArticlesCorrect(1, 100, userId);

              if (likedResponse?.data?.data && Array.isArray(likedResponse.data.data)) {
                articlesArray = likedResponse.data.data;
              } else if (likedResponse?.data && Array.isArray(likedResponse.data)) {
                articlesArray = likedResponse.data;
              } else if (Array.isArray(likedResponse)) {
                articlesArray = likedResponse;
              }

              // Filter articles by category
              const filteredArticles = articlesArray.filter(
                (article: any) => article.categoryInfo?.name === decodedIdentifier
              );

              setArticles(filteredArticles);
            }
          }
        }

      } catch (err) {
        console.error('[Space] Failed to fetch space data:', err);
        setError('Failed to load space data');
        showToast('Failed to fetch space data, please try again', 'error');
        // Clear cache on error so user can retry
        spaceFetchCache.delete(cacheKey);
      } finally {
        setLoading(false);
        // Mark as no longer in progress (but keep cached data if successful)
        const existingCache = spaceFetchCache.get(cacheKey);
        if (existingCache && existingCache.inProgress) {
          spaceFetchCache.set(cacheKey, { ...existingCache, inProgress: false });
        }
      }
    };

    fetchSpaceData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceIdentifier, namespace, user?.id, user?.username, user?.faceUrl, user?.namespace]);

  // Transform article to card format
  const transformArticleToCard = (article: any): ArticleData => {
    // Extract website hostname from targetUrl if not already provided
    let website = article.website;
    if (!website && article.targetUrl) {
      try {
        website = new URL(article.targetUrl).hostname.replace('www.', '');
      } catch {
        // Invalid URL, leave website undefined
      }
    }

    const transformedArticle = {
      id: article.uuid,
      uuid: article.uuid,
      numericId: article.id, // 保存数字ID，用于移除接口
      title: article.title,
      description: article.content,
      coverImage: article.coverUrl || 'https://c.animaapp.com/mft5gmofxQLTNf/img/cover-1.png',
      category: article.categoryInfo?.name || 'General',
      categoryColor: article.categoryInfo?.color || '#666666',
      userName: article.authorInfo?.username || 'Anonymous',
      userAvatar: article.authorInfo?.faceUrl || profileDefaultAvatar,
      userId: article.authorInfo?.id,
      userNamespace: article.authorInfo?.namespace,
      date: (article.createAt || article.publishAt) ? new Date((article.createAt || article.publishAt) * 1000).toISOString() : '',
      treasureCount: article.likeCount || 0,
      visitCount: article.viewCount || 0,
      commentCount: article.commentCount || 0,
      isLiked: article.isLiked || false,
      targetUrl: article.targetUrl,
      website,
      isPaymentRequired: article.targetUrlIsLocked,
      paymentPrice: article.priceInfo?.price?.toString()
    };

    // 添加调试信息
    console.log('🔥 DEBUG: Transformed article:', {
      originalId: article.id,
      uuid: article.uuid,
      numericId: transformedArticle.numericId,
      transformedKeys: Object.keys(transformedArticle)
    });

    return transformedArticle;
  };

  // Handle like/unlike - opens the collect modal
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

    // Find the article and open the collect modal
    const article = articles.find(a => a.uuid === articleId);
    if (article) {
      setSelectedArticle({
        uuid: articleId,
        title: article.title,
        isLiked: currentIsLiked,
        likeCount: currentLikeCount
      });
      setCollectModalOpen(true);
    }
  };

  // Handle successful collection - update local state
  const handleCollectSuccess = () => {
    if (!selectedArticle) return;

    // Update like state locally
    const newLikeCount = selectedArticle.likeCount + 1;
    toggleLike(selectedArticle.uuid, false, selectedArticle.likeCount);

    // Update selectedArticle state to reflect the change
    setSelectedArticle(prev => prev ? { ...prev, isLiked: true, likeCount: newLikeCount } : null);
  };

  // Handle user click
  const handleUserClick = (userId: number | undefined, userNamespace?: string) => {
    if (userNamespace) {
      navigate(`/u/${userNamespace}`);
    } else if (userId) {
      navigate(`/user/${userId}/treasury`);
    }
  };

  // Handle subscribe
  const handleFollow = async () => {
    if (!user) {
      showToast('Please login to subscribe', 'error');
      return;
    }
    if (!spaceId) {
      showToast('Space ID not available', 'error');
      return;
    }
    try {
      await AuthService.followSpace(spaceId);
      setIsFollowing(true);
      showToast('Subscribed to space', 'success');

      // Update cache with new subscription status
      const cacheKey = namespace ? `namespace:${decodeURIComponent(spaceIdentifier || '')}` : `category:${decodeURIComponent(spaceIdentifier || '')}`;
      const cached = spaceFetchCache.get(cacheKey);
      if (cached && cached.data) {
        spaceFetchCache.set(cacheKey, {
          ...cached,
          data: { ...cached.data, isFollowing: true }
        });
      }
    } catch (err) {
      console.error('Failed to subscribe to space:', err);
      showToast('Failed to subscribe to space', 'error');
    }
  };

  // Handle unsubscribe
  const handleUnfollow = async () => {
    if (!user) {
      showToast('Please login to unsubscribe', 'error');
      return;
    }
    if (!spaceId) {
      showToast('Space ID not available', 'error');
      return;
    }
    try {
      await AuthService.followSpace(spaceId); // Same API toggles subscribe/unsubscribe
      setIsFollowing(false);
      showToast('Unsubscribed from space', 'success');

      // Update cache with new subscription status
      const cacheKey = namespace ? `namespace:${decodeURIComponent(spaceIdentifier || '')}` : `category:${decodeURIComponent(spaceIdentifier || '')}`;
      const cached = spaceFetchCache.get(cacheKey);
      if (cached && cached.data) {
        spaceFetchCache.set(cacheKey, {
          ...cached,
          data: { ...cached.data, isFollowing: false }
        });
      }
    } catch (err) {
      console.error('Failed to unsubscribe from space:', err);
      showToast('Failed to unsubscribe from space', 'error');
    }
  };

  // Handle share
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard', 'success');
  };

  // Check if there are more articles to load
  const hasMoreArticles = !reachedEnd && articles.length < totalArticleCount;

  // Handle load more articles
  const handleLoadMore = useCallback(async () => {
    // Use ref to prevent multiple simultaneous calls
    if (!spaceId || isLoadingMoreRef.current || !hasMoreArticles) return;

    isLoadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      console.log('Loading more articles, page:', nextPage);

      const articlesResponse = await AuthService.getSpaceArticles(spaceId, nextPage, PAGE_SIZE);
      console.log('Load more response:', articlesResponse);

      let newArticles: any[] = [];
      if (articlesResponse?.data && Array.isArray(articlesResponse.data)) {
        newArticles = articlesResponse.data;
      } else if (articlesResponse?.data?.data && Array.isArray(articlesResponse.data.data)) {
        newArticles = articlesResponse.data.data;
      }

      if (newArticles.length > 0) {
        setArticles(prev => [...prev, ...newArticles]);
        setCurrentPage(nextPage);
      } else {
        // No more articles returned - mark as reached end
        setReachedEnd(true);
      }

      // Also check if we got less than a full page
      if (newArticles.length < PAGE_SIZE) {
        setReachedEnd(true);
      }
    } catch (err) {
      console.error('Failed to load more articles:', err);
      showToast('Failed to load more articles', 'error');
    } finally {
      setLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [spaceId, hasMoreArticles, currentPage, showToast]);

  // Auto-load more on scroll (same as Discovery page)
  useEffect(() => {
    const handleScroll = () => {
      // Skip if no more articles or already loading
      if (!hasMoreArticles || isLoadingMoreRef.current) {
        return;
      }

      // Check if scrolled near the bottom of the page
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrolledToBottom = scrollTop + windowHeight >= documentHeight - 1000; // Trigger 1000px early

      if (scrolledToBottom && spaceId) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMoreArticles, spaceId, handleLoadMore]);

  // Handle author click - navigate to treasury page
  const handleAuthorClick = () => {
    if (spaceInfo?.authorNamespace) {
      navigate(`/user/${spaceInfo.authorNamespace}/treasury`);
    }
  };

  // Handle edit space
  // 🔍 SEARCH: space-edit-restrictions-logic-rapid
  // Use rapid development system for space permissions (2-second modification)
  const spaceSetup = spaceShortcuts.setupSpaceEdit(spaceInfo, user?.id);
  const { canEditName: canEditSpaceName, canDelete: canDeleteSpace } = spaceSetup.permissions;
  const spaceHandlers = eventHandlers.createSpaceEditHandler(spaceInfo, 'SpaceContentSection');

  const handleEditSpace = () => {
    const currentName = displaySpaceName || spaceInfo?.name || decodeURIComponent(category || '');
    const currentDescription = spaceInfo?.description || '';
    const currentCoverUrl = spaceInfo?.coverUrl || '';

    console.log('🔥🔥🔥 SPACE EDIT MODAL DEBUG:', {
      spaceInfo: spaceInfo,
      spaceInfoKeys: spaceInfo ? Object.keys(spaceInfo) : 'null',
      currentCoverUrl: currentCoverUrl,
      coverUrlFromSpaceInfo: spaceInfo?.coverUrl,
      allSpaceData: JSON.stringify(spaceInfo, null, 2)
    });

    setEditSpaceName(currentName);
    setEditSpaceDescription(currentDescription);
    setEditSpaceCoverUrl(currentCoverUrl);

    console.log('🔥🔥🔥 SPACE EDIT: Setting edit states:', {
      editSpaceName: currentName,
      editSpaceDescription: currentDescription,
      editSpaceCoverUrl: currentCoverUrl
    });

    setShowEditModal(true);
    setIsImageUploading(false); // 重置图片上传状态
    console.log('🔥🔥🔥 SPACE EDIT: Modal opened');

    // 🔍 SEARCH: dev-log-space-edit-modal
    devLog.userAction('open-space-edit-modal', {
      spaceType: spaceInfo?.spaceType,
      canEditName: canEditSpaceName,
      canDelete: canDeleteSpace
    }, {
      component: 'SpaceContentSection',
      action: 'edit-modal-open'
    });
  };

  // 🔍 SEARCH: space-save-function-with-restrictions
  // Handle save space details - with name editing restrictions for default spaces
  const handleSaveSpaceName = async () => {
    // Only validate space name if name editing is allowed
    if (canEditSpaceName && !editSpaceName.trim()) {
      showToast('Please enter a space name', 'error');
      devLog.userAction('save-space-validation-failed', { reason: 'empty-name' }, {
        component: 'SpaceContentSection',
        action: 'validation-error'
      });
      return;
    }

    if (!spaceId) {
      showToast('Space ID not available', 'error');
      return;
    }

    try {
      setIsSaving(true);

      // Prepare optional fields
      const description = editSpaceDescription.trim() || undefined;
      const coverUrl = editSpaceCoverUrl.trim() || undefined;

      // 🔍 SEARCH: space-name-handling-for-restricted-spaces
      // Use current displayed name if name editing is not allowed
      const nameToUse = canEditSpaceName ? editSpaceName.trim() : (displaySpaceName || spaceInfo?.name || '');

      devLog.apiCall(API_ENDPOINTS.SPACE.UPDATE, {
        spaceId,
        name: nameToUse,
        description,
        coverUrl,
        canEditName: canEditSpaceName
      }, {
        component: 'SpaceContentSection',
        action: 'update-space-with-restrictions'
      });

      // Call API to update space with all fields
      await AuthService.updateSpace(spaceId, nameToUse, description, coverUrl);

      // 立即更新本地状态，避免等待页面刷新
      setSpaceInfo(prev => prev ? {
        ...prev,
        name: nameToUse,
        description: description,
        coverUrl: coverUrl
      } : null);

      // Only update display name if name editing was allowed
      if (canEditSpaceName) {
        setDisplaySpaceName(nameToUse);
      }

      console.log('🚀 SPACE EDIT: Local state updated immediately with new coverUrl:', coverUrl);
      showToast('Space updated successfully', 'success');
      setShowEditModal(false);

      // Reset form fields
      setEditSpaceName("");
      setEditSpaceDescription("");
      setEditSpaceCoverUrl("");

      // 移除页面刷新，改为依赖本地状态更新
      // 这样可以避免测试环境中的网络延迟问题
      console.log('🚀 SPACE EDIT: Skipping page reload, using immediate state update');
    } catch (err) {
      const errorMessage = ErrorHandler.handleApiError(err, {
        component: 'SpaceContentSection',
        action: 'update-space',
        endpoint: API_ENDPOINTS.SPACE.UPDATE,
        additionalData: { spaceId, canEditName: canEditSpaceName }
      }, 'Failed to update space');
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete space
  const handleDeleteSpace = async () => {
    if (!spaceId) {
      showToast('Space ID not available', 'error');
      return;
    }

    try {
      setIsSaving(true);
      await AuthService.deleteSpace(spaceId);
      showToast('Treasury deleted', 'success');
      setShowEditModal(false);
      navigate('/my-treasury');
    } catch (err) {
      console.error('Failed to delete space:', err);
      showToast('Failed to delete treasury', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Check if current user is the owner of this space
  const isOwner = !!user && spaceInfo?.authorNamespace === user?.namespace;

  // Check if this is a curations space
  // spaceType 2 = Curations, or fallback to category name check for old routes
  const isCurationsSpace = spaceInfo?.spaceType === 2 ||
    (category ? decodeURIComponent(category).endsWith("'s curations") : false);

  // Track hovered card ID
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Handle edit article
  const handleEditArticle = (articleId: string) => {
    navigate(`/curate?edit=${articleId}`);
  };

  // Handle delete article - shows confirmation modal
  const handleDeleteArticle = (articleId: string) => {
    setArticleToDelete(articleId);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete/remove article based on space type
  const confirmDeleteArticle = async () => {
    if (!articleToDelete) return;

    try {
      setIsDeleting(true);

      if (isCurationsSpace) {
        // In Curations space: Delete the article permanently
        await AuthService.deleteArticle(articleToDelete);
        showToast('Article deleted successfully', 'success');
      } else {
        // In other spaces: Remove from space using unbind API
        if (!spaceId) {
          showToast('Space ID not available', 'error');
          return;
        }

        // Find the article to get its numeric ID
        const article = articles.find(a => a.uuid === articleToDelete);
        console.log('🔥 DEBUG: Found article for deletion:', {
          articleToDelete,
          foundArticle: article,
          allArticles: articles.map(a => ({ uuid: a.uuid, numericId: a.numericId, id: a.id })),
          articleKeys: article ? Object.keys(article) : 'article not found'
        });

        if (!article) {
          showToast('Article not found', 'error');
          return;
        }

        // 尝试获取数字 ID，优先使用 numericId，其次使用 id
        const articleNumericId = article.numericId || article.id;
        console.log('🔥 DEBUG: Article ID resolution:', {
          numericId: article.numericId,
          id: article.id,
          finalId: articleNumericId
        });

        if (!articleNumericId) {
          showToast('Article numeric ID not available', 'error');
          console.error('🔥 ERROR: No valid article ID found:', article);
          return;
        }

        console.log('🔥 Removing article from space:', {
          articleId: articleNumericId,
          spaceId: spaceId,
          articleUuid: articleToDelete
        });

        await removeArticleFromSpace({
          articleId: articleNumericId,
          spaceId: spaceId
        });

        showToast('Article removed from space', 'success');
      }

      // Remove the article from local state
      setArticles(prev => prev.filter(a => a.uuid !== articleToDelete));
      setTotalArticleCount(prev => Math.max(0, prev - 1));
      setDeleteConfirmOpen(false);
      setArticleToDelete(null);
    } catch (err) {
      console.error('Failed to delete article:', err);
      showToast('Failed to delete article', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Render article card
  const renderCard = (article: any) => {
    const card = transformArticleToCard(article);
    const articleLikeState = getArticleLikeState(card.id, card.isLiked, typeof card.treasureCount === 'string' ? parseInt(card.treasureCount) || 0 : card.treasureCount);

    const articleData = {
      ...card,
      isLiked: articleLikeState.isLiked,
      treasureCount: articleLikeState.likeCount
    };

    // Check if current user is the author of this article
    const isArticleAuthor = !!user && (article.authorInfo?.id === user.id || article.authorInfo?.namespace === user.namespace);

    // Show edit/delete buttons for articles created by the current user or space owner
    const canEditArticle = isArticleAuthor;
    const canDeleteArticle = isArticleAuthor || isOwner; // Space owners can also delete/remove articles

    return (
      <ArticleCard
        key={card.id}
        article={articleData}
        layout="discovery"
        actions={{
          showTreasure: true,
          showVisits: true,
          showEdit: canEditArticle,
          showDelete: canDeleteArticle
        }}
        isHovered={hoveredCardId === card.id}
        onLike={handleLike}
        onUserClick={handleUserClick}
        onEdit={canEditArticle ? handleEditArticle : undefined}
        onDelete={canDeleteArticle ? handleDeleteArticle : undefined}
        onMouseEnter={() => setHoveredCardId(card.id)}
        onMouseLeave={() => setHoveredCardId(null)}
      />
    );
  };

  if (loading) {
    return (
      <main className="flex flex-col items-start gap-5 px-4 lg:px-2.5 pt-0 pb-[30px] relative min-h-screen">
        <div className="flex items-center justify-center w-full h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-start gap-5 px-4 lg:px-2.5 pt-0 pb-[30px] relative min-h-screen">
        <div className="flex flex-col items-center justify-center w-full h-64 text-center gap-4">
          <div className="text-red-500">{error}</div>
          <Button
            onClick={() => navigate('/my-treasury')}
            className="bg-red hover:bg-red/90 text-white px-6 py-2 rounded-lg"
          >
            Back to Treasury
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-start gap-2 px-4 lg:px-2.5 pt-0 pb-[30px] relative min-h-screen">
      {/* Space Info Section */}
      <SpaceInfoSection
        spaceName={displaySpaceName || spaceInfo?.name || category || 'Space'}
        treasureCount={totalArticleCount || articles.length}
        authorName={spaceInfo?.authorName || 'Anonymous'}
        authorAvatar={spaceInfo?.authorAvatar}
        authorNamespace={spaceInfo?.authorNamespace}
        spaceDescription={spaceInfo?.description}
        spaceCoverUrl={spaceInfo?.coverUrl}
        firstArticleCover={articles[0]?.cover || articles[0]?.coverUrl}
        isFollowing={isFollowing}
        isOwner={isOwner}
        spaceType={spaceInfo?.spaceType}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        onShare={handleShare}
        onAuthorClick={handleAuthorClick}
        onEdit={handleEditSpace}
      />

      {/* Articles Grid */}
      <div className="w-full mt-2">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full h-64 text-center">
            <h3 className="text-[24px] font-[450] text-gray-600 mb-4 [font-family:'Lato',Helvetica]">No treasures yet — this collection is just getting started.</h3>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-[15px] px-5 py-2.5 bg-red text-white rounded-[50px] hover:bg-red/90 transition-colors [font-family:'Lato',Helvetica] font-bold text-lg leading-5"
            >
              Discover
            </button>
          </div>
        ) : (
          <>
            <div className="w-full grid grid-cols-1 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
              {articles.map((article) => renderCard(article))}
            </div>

            {/* Loading indicator for infinite scroll */}
            {loadingMore && (
              <div className="flex justify-center mt-8">
                <div className="text-gray-500">Loading more...</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Space Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowEditModal(false);
              setEditSpaceName("");
              setEditSpaceDescription("");
              setEditSpaceCoverUrl("");
            }}
          />

          {/* Modal */}
          <div
            className="flex flex-col w-[582px] max-w-[90vw] items-center gap-5 p-[30px] relative bg-white rounded-[15px] z-10"
            role="dialog"
            aria-labelledby="edit-space-title"
            aria-modal="true"
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditSpaceName("");
                setEditSpaceDescription("");
                setEditSpaceCoverUrl("");
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close dialog"
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L13 13M1 13L13 1" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="flex flex-col items-start gap-[30px] relative self-stretch w-full flex-[0_0_auto] pt-5">
              <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
                <h2
                  id="edit-space-title"
                  className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap"
                >
                  Edit collection
                </h2>

                {/* Space Name */}
                <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                  <label
                    htmlFor="edit-space-name-input"
                    className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap"
                  >
                    Name
                  </label>

                  <div className="flex h-12 items-center px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                    <input
                      id="edit-space-name-input"
                      type="text"
                      value={editSpaceName}
                      onChange={canEditSpaceName ? (e) => setEditSpaceName(e.target.value) : undefined}
                      placeholder={canEditSpaceName ? "Enter space name" : "Space name cannot be edited (default space)"}
                      disabled={!canEditSpaceName}
                      className={`flex-1 border-none bg-transparent [font-family:'Lato',Helvetica] font-normal text-base tracking-[0] leading-[23px] outline-none ${!canEditSpaceName ? 'text-gray-500 cursor-not-allowed' : 'text-medium-dark-grey placeholder:text-medium-dark-grey'}`}
                      aria-required={canEditSpaceName}
                      autoFocus={canEditSpaceName}
                    />
                  </div>
                </div>

                {/* Space Description */}
                <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                  <label
                    htmlFor="edit-space-description-input"
                    className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap"
                  >
                    Description (Optional)
                  </label>

                  <div className="flex items-start px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                    <textarea
                      id="edit-space-description-input"
                      value={editSpaceDescription}
                      onChange={(e) => setEditSpaceDescription(e.target.value)}
                      placeholder="Describe your space (optional)"
                      className="flex-1 border-none bg-transparent [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] outline-none placeholder:text-medium-dark-grey resize-none"
                      rows={3}
                      maxLength={200}
                    />
                  </div>
                  <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-gray-400 text-sm tracking-[0] leading-[18px]">
                    {editSpaceDescription.length}/200 characters
                  </span>
                </div>

                {/* Cover Image Upload */}
                <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                  <div className="flex flex-col gap-2 relative self-stretch w-full flex-[0_0_auto]">
                    <ImageUploader
                      type="banner"
                      currentImage={editSpaceCoverUrl || spaceInfo?.coverUrl}
                      key={`image-uploader-${showEditModal}-${editSpaceCoverUrl || spaceInfo?.coverUrl}`} // 强制重新渲染
                      onUploadStatusChange={(uploading) => {
                        console.log('🔄 SPACE EDIT: Image upload status changed:', uploading);
                        setIsImageUploading(uploading);
                      }}
                      onImageUploaded={async (url) => {
                        console.log('🔥🔥🔥 SPACE EDIT: Received image URL:', url);
                        setEditSpaceCoverUrl(url);
                        console.log('🔥🔥🔥 SPACE EDIT: State updated with URL:', url);

                        // 当图片被删除时（url为空），自动保存删除操作
                        if (!url && (editSpaceCoverUrl || spaceInfo?.coverUrl)) {
                          console.log('🔥🔥🔥 SPACE EDIT: Auto-saving cover image removal...');

                          if (!spaceId) {
                            showToast('Space ID not available', 'error');
                            return;
                          }

                          try {
                            const currentName = displaySpaceName || spaceInfo?.name || decodeURIComponent(category || '');
                            const currentDescription = spaceInfo?.description || '';

                            // 立即保存删除操作到服务器
                            await AuthService.updateSpace(spaceId, currentName, currentDescription, ''); // 传入空字符串删除封面图

                            showToast('Cover image removed successfully', 'success');

                            // 更新本地 spaceInfo 状态
                            setSpaceInfo(prev => prev ? { ...prev, coverUrl: '' } : null);

                            console.log('🔥🔥🔥 SPACE EDIT: Cover image removal saved successfully');
                          } catch (error) {
                            console.error('🔥🔥🔥 SPACE EDIT: Failed to save cover image removal:', error);
                            showToast('Failed to remove cover image', 'error');
                            // 回滚状态
                            setEditSpaceCoverUrl(spaceInfo?.coverUrl || '');
                          }
                        }
                      }}
                      onError={(error) => showToast(error, 'error')}
                    />
                    <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-gray-400 text-sm tracking-[0] leading-[18px]">
                      Recommended size: 1200x200px (6:1 ratio)
                    </span>
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                {/* 🔍 SEARCH: space-delete-button-conditional */}
                {/* Delete button on the left - only show for custom spaces (spaceType === 0 or undefined) */}
                {canDeleteSpace && (
                  <button
                    className="inline-flex items-center gap-2 px-3 py-2.5 relative flex-[0_0_auto] rounded-[15px] cursor-pointer hover:bg-red/10 transition-colors"
                    onClick={handleDeleteSpace}
                    type="button"
                    aria-label="Delete treasury"
                  >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21" stroke="#F23A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#F23A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 11V17" stroke="#F23A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 11V17" stroke="#F23A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="[font-family:'Lato',Helvetica] font-normal text-red text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                    Delete
                  </span>
                  </button>
                )}

                {/* Show message when delete is not allowed */}
                {!canDeleteSpace && (
                  <div className="text-xs text-gray-500 px-3 py-2">
                    Delete unavailable (default space)
                  </div>
                )}

                {/* Cancel and Save buttons on the right */}
                <div className="flex items-center gap-2.5">
                  <button
                    className="inline-flex items-center justify-center gap-[30px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditSpaceName("");
                      setEditSpaceDescription("");
                      setEditSpaceCoverUrl("");
                    }}
                    type="button"
                  >
                    <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                      Cancel
                    </span>
                  </button>

                  <button
                    className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[100px] bg-red cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red/90 transition-colors"
                    onClick={handleSaveSpaceName}
                    disabled={isSaving || isImageUploading || (canEditSpaceName && !editSpaceName.trim())}
                    type="button"
                  >
                    <span className="relative w-fit [font-family:'Lato',Helvetica] font-bold text-white text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                      {isSaving ? 'Saving...' : isImageUploading ? 'Uploading image...' : 'Save'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collect Treasure Modal */}
      {selectedArticle && (
        <CollectTreasureModal
          isOpen={collectModalOpen}
          onClose={() => {
            setCollectModalOpen(false);
            setSelectedArticle(null);
          }}
          articleId={selectedArticle.uuid}
          articleTitle={selectedArticle.title}
          isAlreadyCollected={selectedArticle.isLiked}
          onCollectSuccess={handleCollectSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!isDeleting) {
                setDeleteConfirmOpen(false);
                setArticleToDelete(null);
              }
            }}
          />

          {/* Modal */}
          <div
            className="flex flex-col w-[400px] max-w-[90vw] items-center gap-5 p-[30px] relative bg-white rounded-[15px] z-10"
            role="dialog"
            aria-labelledby="delete-confirm-title"
            aria-modal="true"
          >
            {/* Warning icon */}
            <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21" stroke="#F23A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#F23A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <h2
                id="delete-confirm-title"
                className="[font-family:'Lato',Helvetica] font-semibold text-off-black text-xl tracking-[0] leading-[28px]"
              >
                {isCurationsSpace ? 'Delete Article' : 'Remove from Space'}
              </h2>
              <p className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px]">
                {isCurationsSpace
                  ? 'Are you sure you want to permanently delete this article? This action cannot be undone.'
                  : 'Are you sure you want to remove this article from the space? The article will remain available elsewhere.'
                }
              </p>
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                className="flex-1 px-5 py-2.5 rounded-[15px] border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setArticleToDelete(null);
                }}
                disabled={isDeleting}
                type="button"
              >
                <span className="[font-family:'Lato',Helvetica] font-medium text-off-black text-base tracking-[0] leading-[22.4px]">
                  Cancel
                </span>
              </button>

              <button
                className="flex-1 px-5 py-2.5 rounded-[15px] bg-red cursor-pointer hover:bg-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={confirmDeleteArticle}
                disabled={isDeleting}
                type="button"
              >
                <span className="[font-family:'Lato',Helvetica] font-bold text-white text-base tracking-[0] leading-[22.4px]">
                  {isDeleting
                    ? (isCurationsSpace ? 'Deleting...' : 'Removing...')
                    : (isCurationsSpace ? 'Delete' : 'Remove')
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default SpaceContentSection;
