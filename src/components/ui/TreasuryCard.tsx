import React from "react";
import { Link } from "react-router-dom";
import { SPACE_VISIBILITY } from "../../types/space";

// Types for treasury items
export interface TreasuryItem {
  id: string;
  uuid?: string;
  title: string;
  url: string;
  website?: string; // Extracted hostname for display
  coverImage: string;
}

// Space data from API
export interface SpaceData {
  id?: number;
  namespace?: string;
  name?: string;
  title?: string;
  description?: string; // 空间描述
  coverUrl?: string; // 空间封面图
  spaceType?: number; // 1 = Collections, 2 = Curations
  articleCount?: number;
  treasureCount?: number;
  visibility?: number; // Space visibility (0: public, 1: private, 2: unlisted)
  ownerInfo?: {
    username?: string;
    id?: number;
    namespace?: string;
  };
  userInfo?: {
    username?: string;
  };
  // Additional possible fields from different APIs
  user?: {
    username?: string;
  };
  author?: {
    username?: string;
  };
  creator?: {
    username?: string;
  };
  ownerName?: string;
  userName?: string;
  username?: string;
  data?: any[]; // Articles in the space
  articles?: any[];
}

// Props for TreasuryCard
export interface TreasuryCardProps {
  space: SpaceData;
  onClick?: () => void;
  onEdit?: () => void; // Edit button callback - only shown when provided (for owner's own collections)
  emptyAction?: {
    label: string;
    href: string;
    icon?: string;
    onClick?: () => void; // Optional click handler for button actions
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Get display name for a space/treasury based on spaceType
 * spaceType 1 = Treasury (default), spaceType 2 = Curations
 */
export const getSpaceDisplayName = (space: SpaceData): string => {
  // Get username from various possible fields in API response
  // Display 'Anonymous' when username is empty instead of namespace
  const username = space.ownerInfo?.username
    || space.userInfo?.username
    || space.user?.username
    || space.author?.username
    || space.creator?.username
    || space.ownerName
    || space.userName
    || space.username
    || 'Anonymous';

  // spaceType 1 = Treasury (default), spaceType 2 = Curations
  if (space.spaceType === 1) {
    return `${username}'s Treasury`;
  }
  if (space.spaceType === 2) {
    return `${username}'s Curations`;
  }
  return space.name || space.title || 'Untitled Treasury';
};

/**
 * Extract hostname from URL safely
 */
const getHostname = (url: string | undefined): string => {
  if (!url) return '';
  try {
    return new URL(url).hostname;
  } catch {
    // Invalid URL, try to extract domain manually
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || '';
  }
};

/**
 * Transform space data to treasury items for display
 * NOTE: The backend API (spacesByArticleId) currently returns only 2 preview articles
 * in the `data` array. To show 3 previews, the backend needs to be updated.
 */
export const transformSpaceToItems = (space: SpaceData): TreasuryItem[] => {
  // The API returns preview articles in the `data` field
  const articles = space.data || space.articles || [];

  return articles.slice(0, 3).map((article: any, index: number) => {
    // Use website field from API if available, otherwise extract from targetUrl
    const website = article.website || getHostname(article.targetUrl);
    return {
      id: article.uuid || article.id?.toString() || `item-${index}`,
      uuid: article.uuid,
      title: article.title || 'Untitled',
      url: article.targetUrl || '',
      website, // Extracted hostname for display
      coverImage: article.coverUrl || 'https://c.animaapp.com/V3VIhpjY/img/cover@2x.png',
    };
  });
};

/**
 * Get treasure count from space data
 */
export const getSpaceTreasureCount = (space: SpaceData): number => {
  return space.articleCount || space.treasureCount || (space.data?.length) || (space.articles?.length) || 0;
};

/**
 * Extract hostname from URL for display
 */
const getDisplayHostname = (url: string): string => {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
};

/**
 * TreasuryCard Component
 * A reusable card component for displaying treasury/space information
 * with consistent look, naming logic, and treasure count across the app
 */
export const TreasuryCard = ({
  space,
  onClick,
  onEdit,
  emptyAction,
  secondaryAction,
}: TreasuryCardProps): JSX.Element => {
  const title = getSpaceDisplayName(space);
  const treasureCount = getSpaceTreasureCount(space);
  const items = transformSpaceToItems(space);

  // Check if space is private
  const isPrivateSpace = space.visibility === SPACE_VISIBILITY.PRIVATE;

  if (items.length === 0) {
    return (
      <section
        className={`relative w-full h-fit flex flex-col items-start gap-2 ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div className={`flex items-center justify-center relative self-stretch w-full rounded-[15px] shadow-[1px_1px_10px_#c5c5c5] overflow-hidden bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] ${onClick ? 'hover:shadow-[2px_2px_15px_#b5b5b5] transition-shadow' : ''}`} style={{ aspectRatio: '16 / 9' }}>
          {emptyAction ? (
            <div className="flex items-center gap-3">
              {/* Primary action button */}
              {emptyAction.onClick ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    emptyAction.onClick?.();
                  }}
                  className="flex items-center gap-[10px] px-5 py-2.5 bg-red text-white rounded-[50px] hover:bg-red/90 transition-colors cursor-pointer"
                >
                  {/* Curate icon (plus) */}
                  {emptyAction.label === 'Curate' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                  {/* Import icon */}
                  {emptyAction.label === 'Import' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                  {/* Discover icon (eyes) */}
                  {emptyAction.label === 'Discover' && (
                    <svg className="w-5 h-5" viewBox="0 0 30 24" fill="currentColor">
                      <path d="M20.9584 0.5C18.7483 0.5 16.6439 1.51341 14.9932 3.35382C13.4004 1.57781 11.3199 0.5 9.04161 0.5C4.05525 0.5 0 5.65856 0 12C0 18.3414 4.05525 23.5 9.04161 23.5C11.3199 23.5 13.4038 22.4222 14.9932 20.6462C16.6405 22.49 18.7381 23.5 20.9584 23.5C25.9447 23.5 30 18.3414 30 12C30 5.65856 25.9447 0.5 20.9584 0.5ZM1.02319 12C1.02319 6.22119 4.62142 1.5168 9.04161 1.5168C13.4618 1.5168 17.06 6.2178 17.06 12C17.06 13.1049 16.927 14.1726 16.6849 15.1724C16.6405 12.749 15.5184 10.7561 13.7278 10.3087C11.395 9.72576 8.80286 11.9932 7.9502 15.3622C7.54775 16.9586 7.58527 18.5685 8.05593 19.8971C8.48567 21.1139 9.2326 21.9748 10.1876 22.3714C9.81241 22.4425 9.43042 22.4798 9.04502 22.4798C4.61801 22.4832 1.02319 17.7788 1.02319 12ZM15.6446 19.8429C17.1555 17.7856 18.0832 15.0301 18.0832 12C18.0832 8.96994 17.1555 6.21441 15.6446 4.15709C17.1146 2.45564 18.9973 1.5168 20.9584 1.5168C25.3786 1.5168 28.9768 6.2178 28.9768 12C28.9768 13.2439 28.8097 14.4369 28.5027 15.5452C28.5709 12.9558 27.425 10.7798 25.5457 10.3121C23.2128 9.72915 20.6207 11.9966 19.7681 15.3656C18.97 18.5211 19.9795 21.541 22.0293 22.3883C21.678 22.4493 21.3199 22.4866 20.955 22.4866C18.9904 22.4832 17.1146 21.5477 15.6446 19.8429Z"/>
                    </svg>
                  )}
                  {emptyAction.icon && (
                    <img
                      className="w-5 h-5"
                      alt={emptyAction.label}
                      src={emptyAction.icon}
                      style={{ filter: 'brightness(0) invert(1)' }}
                    />
                  )}
                  <span className="[font-family:'Lato',Helvetica] font-bold text-lg leading-5">
                    {emptyAction.label}
                  </span>
                </button>
              ) : (
                <Link
                  to={emptyAction.href}
                  className="flex items-center gap-[10px] px-5 py-2.5 bg-red text-white rounded-[50px] hover:bg-red/90 transition-colors cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Curate icon (plus) */}
                  {emptyAction.label === 'Curate' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                  {/* Import icon */}
                  {emptyAction.label === 'Import' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                  {/* Discover icon (eyes) */}
                  {emptyAction.label === 'Discover' && (
                    <svg className="w-5 h-5" viewBox="0 0 30 24" fill="currentColor">
                      <path d="M20.9584 0.5C18.7483 0.5 16.6439 1.51341 14.9932 3.35382C13.4004 1.57781 11.3199 0.5 9.04161 0.5C4.05525 0.5 0 5.65856 0 12C0 18.3414 4.05525 23.5 9.04161 23.5C11.3199 23.5 13.4038 22.4222 14.9932 20.6462C16.6405 22.49 18.7381 23.5 20.9584 23.5C25.9447 23.5 30 18.3414 30 12C30 5.65856 25.9447 0.5 20.9584 0.5ZM1.02319 12C1.02319 6.22119 4.62142 1.5168 9.04161 1.5168C13.4618 1.5168 17.06 6.2178 17.06 12C17.06 13.1049 16.927 14.1726 16.6849 15.1724C16.6405 12.749 15.5184 10.7561 13.7278 10.3087C11.395 9.72576 8.80286 11.9932 7.9502 15.3622C7.54775 16.9586 7.58527 18.5685 8.05593 19.8971C8.48567 21.1139 9.2326 21.9748 10.1876 22.3714C9.81241 22.4425 9.43042 22.4798 9.04502 22.4798C4.61801 22.4832 1.02319 17.7788 1.02319 12ZM15.6446 19.8429C17.1555 17.7856 18.0832 15.0301 18.0832 12C18.0832 8.96994 17.1555 6.21441 15.6446 4.15709C17.1146 2.45564 18.9973 1.5168 20.9584 1.5168C25.3786 1.5168 28.9768 6.2178 28.9768 12C28.9768 13.2439 28.8097 14.4369 28.5027 15.5452C28.5709 12.9558 27.425 10.7798 25.5457 10.3121C23.2128 9.72915 20.6207 11.9966 19.7681 15.3656C18.97 18.5211 19.9795 21.541 22.0293 22.3883C21.678 22.4493 21.3199 22.4866 20.955 22.4866C18.9904 22.4832 17.1146 21.5477 15.6446 19.8429Z"/>
                    </svg>
                  )}
                  {emptyAction.icon && (
                    <img
                      className="w-5 h-5"
                      alt={emptyAction.label}
                      src={emptyAction.icon}
                      style={{ filter: 'brightness(0) invert(1)' }}
                    />
                  )}
                  <span className="[font-family:'Lato',Helvetica] font-bold text-lg leading-5">
                    {emptyAction.label}
                  </span>
                </Link>
              )}
              {/* Secondary action button (icon only) */}
              {secondaryAction && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    secondaryAction.onClick();
                  }}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
                  title={secondaryAction.label}
                >
                  {/* Import icon for secondary action */}
                  {secondaryAction.label === 'Import' && (
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No treasures yet</p>
          )}
        </div>
        <header className="justify-between flex items-center relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isPrivateSpace && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#E0E0E0] rounded-[100px] flex-shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.9723 3C15.4989 3 14.096 3.66092 12.9955 4.86118C11.9336 3.70292 10.5466 3 9.02774 3C5.7035 3 3 6.36428 3 10.5C3 14.6357 5.7035 18 9.02774 18C10.5466 18 11.9359 17.2971 12.9955 16.1388C14.0937 17.3413 15.492 18 16.9723 18C20.2965 18 23 14.6357 23 10.5C23 6.36428 20.2965 3 16.9723 3ZM3.68213 10.5C3.68213 6.73121 6.08095 3.66313 9.02774 3.66313C11.9745 3.66313 14.3734 6.729 14.3734 10.5C14.3734 11.2206 14.2847 11.9169 14.1232 12.569C14.0937 10.9885 13.3456 9.68877 12.1519 9.39699C10.5966 9.0168 8.86858 10.4956 8.30014 12.6927C8.03183 13.7339 8.05684 14.7838 8.37062 15.6503C8.65712 16.4439 9.15507 17.0053 9.79172 17.2639C9.54161 17.3103 9.28695 17.3347 9.03001 17.3347C6.07867 17.3369 3.68213 14.2688 3.68213 10.5ZM13.4297 15.6149C14.437 14.2732 15.0555 12.4761 15.0555 10.5C15.0555 8.52387 14.437 6.72679 13.4297 5.38506C14.4097 4.27542 15.6648 3.66313 16.9723 3.66313C19.9191 3.66313 22.3179 6.729 22.3179 10.5C22.3179 11.3112 22.2065 12.0893 22.0018 12.8121C22.0473 11.1233 21.2833 9.70424 20.0305 9.3992C18.4752 9.01901 16.7472 10.4978 16.1787 12.695C15.6467 14.7529 16.3197 16.7224 17.6862 17.275C17.452 17.3148 17.2133 17.3391 16.97 17.3391C15.6603 17.3369 14.4097 16.7268 13.4297 15.6149Z" fill="#454545"/>
                  <line x1="5.27279" y1="2" x2="22" y2="18.7272" stroke="#454545" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <span className="text-[#454545] text-[12px] font-medium">Private</span>
              </span>
            )}
            <h2 className="relative w-fit [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-[14px] tracking-[0] leading-5 whitespace-nowrap">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <p className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-[12px] tracking-[0] leading-4 whitespace-nowrap">
              {treasureCount} {treasureCount === 1 ? 'treasure' : 'treasures'}
            </p>
            {/* Edit button - only shown for owner */}
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="Edit collection"
              >
                <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
        </header>
      </section>
    );
  }

  const [mainItem, ...sideItems] = items;

  return (
    <section
      className="relative w-full h-fit flex flex-col items-start gap-2 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center relative self-stretch w-full rounded-[15px] shadow-[1px_1px_10px_#c5c5c5] hover:shadow-[2px_2px_15px_#b5b5b5] transition-shadow overflow-hidden bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]" style={{ aspectRatio: '16 / 9' }}>
        {/* Main item on the left - takes ~65% width */}
        <article className="flex flex-col items-start justify-center gap-[5px] px-[15px] py-[15px] relative self-stretch w-[65%] flex-shrink-0 rounded-[15px_0px_0px_15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
          <div
            className="flex flex-col w-full flex-1 items-end justify-end p-2.5 relative bg-cover bg-center rounded-lg"
            style={{ backgroundImage: `url(${mainItem.coverImage})` }}
          >
            <div className="flex flex-col items-end gap-2.5 self-stretch w-full relative flex-[0_0_auto]">
              <span className="inline-flex items-start gap-[5px] px-2.5 py-[5px] relative flex-[0_0_auto] bg-[#ffffffcc] rounded-[15px] overflow-hidden">
                <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-blue text-[10px] text-right tracking-[0] leading-[13.0px] whitespace-nowrap">
                  {getDisplayHostname(mainItem.url)}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start relative w-full flex-[0_0_auto]">
            <h3 className="relative w-full mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-[12px] tracking-[0] leading-4 truncate">
              {mainItem.title}
            </h3>
          </div>
        </article>

        {/* Side items on the right - takes ~35% width */}
        {sideItems.length > 0 && (
          <div className="flex flex-col items-start justify-start gap-1 relative w-[35%] self-stretch rounded-[0px_15px_15px_0px] overflow-hidden">
            {sideItems.map((item, index) => (
              <article
                key={item.id}
                className={`${sideItems.length === 1 ? 'h-1/2' : 'flex-1'} pl-0 pr-[15px] ${index === 0 ? "pt-[15px]" : "pb-[15px]"} ${
                  index === 0
                    ? "rounded-[0px_15px_0px_0px]"
                    : "rounded-[0px_0px_15px_0px]"
                } flex flex-col items-start gap-[5px] relative self-stretch w-full min-w-0 bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]`}
              >
                <div
                  className="flex-1 p-[5px] self-stretch w-full flex flex-col items-end justify-end relative bg-cover bg-center rounded-lg"
                  style={{ backgroundImage: `url(${item.coverImage})` }}
                >
                  <div className="flex flex-col items-end gap-2.5 self-stretch w-full relative flex-[0_0_auto]">
                    <span className="inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-[#ffffffcc] rounded-[15px] overflow-hidden relative flex-[0_0_auto]">
                      <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-blue text-[10px] text-right tracking-[0] leading-[13.0px] whitespace-nowrap">
                        {getDisplayHostname(item.url)}
                      </span>
                    </span>
                  </div>
                </div>

                <div
                  className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto] min-w-0 overflow-hidden"
                >
                  <h3 className="relative w-full mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-[12px] tracking-[0] leading-4 truncate">
                    {item.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <header className="justify-between flex items-center relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isPrivateSpace && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#E0E0E0] rounded-[100px] flex-shrink-0">
              <svg className="w-3.5 h-3.5" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.9723 3C15.4989 3 14.096 3.66092 12.9955 4.86118C11.9336 3.70292 10.5466 3 9.02774 3C5.7035 3 3 6.36428 3 10.5C3 14.6357 5.7035 18 9.02774 18C10.5466 18 11.9359 17.2971 12.9955 16.1388C14.0937 17.3413 15.492 18 16.9723 18C20.2965 18 23 14.6357 23 10.5C23 6.36428 20.2965 3 16.9723 3ZM3.68213 10.5C3.68213 6.73121 6.08095 3.66313 9.02774 3.66313C11.9745 3.66313 14.3734 6.729 14.3734 10.5C14.3734 11.2206 14.2847 11.9169 14.1232 12.569C14.0937 10.9885 13.3456 9.68877 12.1519 9.39699C10.5966 9.0168 8.86858 10.4956 8.30014 12.6927C8.03183 13.7339 8.05684 14.7838 8.37062 15.6503C8.65712 16.4439 9.15507 17.0053 9.79172 17.2639C9.54161 17.3103 9.28695 17.3347 9.03001 17.3347C6.07867 17.3369 3.68213 14.2688 3.68213 10.5ZM13.4297 15.6149C14.437 14.2732 15.0555 12.4761 15.0555 10.5C15.0555 8.52387 14.437 6.72679 13.4297 5.38506C14.4097 4.27542 15.6648 3.66313 16.9723 3.66313C19.9191 3.66313 22.3179 6.729 22.3179 10.5C22.3179 11.3112 22.2065 12.0893 22.0018 12.8121C22.0473 11.1233 21.2833 9.70424 20.0305 9.3992C18.4752 9.01901 16.7472 10.4978 16.1787 12.695C15.6467 14.7529 16.3197 16.7224 17.6862 17.275C17.452 17.3148 17.2133 17.3391 16.97 17.3391C15.6603 17.3369 14.4097 16.7268 13.4297 15.6149Z" fill="#454545"/>
                <line x1="5.27279" y1="2" x2="22" y2="18.7272" stroke="#454545" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span className="text-[#454545] text-[12px] font-medium">Private</span>
            </span>
          )}
          <h2 className="relative w-fit [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-[14px] tracking-[0] leading-5 whitespace-nowrap">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <p className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-[12px] tracking-[0] leading-4 whitespace-nowrap">
            {treasureCount} {treasureCount === 1 ? 'treasure' : 'treasures'}
          </p>
          {/* Edit button - only shown for owner */}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              aria-label="Edit collection"
            >
              <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
      </header>
    </section>
  );
};

export default TreasuryCard;
