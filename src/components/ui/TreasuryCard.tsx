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
  emptyAction?: {
    label: string;
    href: string;
    icon?: string;
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
  emptyAction,
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
        {/* Private space corner badge */}
        {isPrivateSpace && (
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[0px] border-r-[30px] border-t-[30px] border-b-[0px] border-r-transparent border-t-red/30 z-20">
            <div className="absolute -top-[28px] -right-[26px] w-6 h-6 flex items-center justify-center">
              <svg className="w-3 h-3 text-red rotate-45" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
        <div className={`flex items-center justify-center relative self-stretch w-full rounded-[15px] shadow-[1px_1px_10px_#c5c5c5] overflow-hidden ${
          isPrivateSpace
            ? 'border-2 border-red/20 bg-gradient-to-br from-red/5 to-red/10'
            : 'bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]'
        } ${onClick ? 'hover:shadow-[2px_2px_15px_#b5b5b5] transition-shadow' : ''}`} style={{ aspectRatio: '16 / 9' }}>
          {emptyAction ? (
            <Link
              to={emptyAction.href}
              className="flex items-center gap-[15px] px-5 py-2.5 bg-red text-white rounded-[50px] hover:bg-red/90 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
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
          ) : (
            <p className="text-gray-500">No treasures yet</p>
          )}
        </div>
        <header className="justify-between flex items-center relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h2 className="relative w-fit [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-[14px] tracking-[0] leading-5 whitespace-nowrap">
              {title}
            </h2>
            {isPrivateSpace && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red/8 rounded-md border border-red/15 flex-shrink-0">
                <svg className="w-3 h-3 text-red" fill="currentColor" stroke="none" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-red text-xs font-medium leading-none">私享</span>
              </div>
            )}
          </div>
          <p className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-[12px] tracking-[0] leading-4 whitespace-nowrap flex-shrink-0">
            {treasureCount} {treasureCount === 1 ? 'treasure' : 'treasures'}
          </p>
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
      {/* Private space corner badge */}
      {isPrivateSpace && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[0px] border-r-[30px] border-t-[30px] border-b-[0px] border-r-transparent border-t-red/30 z-20">
          <div className="absolute -top-[28px] -right-[26px] w-6 h-6 flex items-center justify-center">
            <svg className="w-3 h-3 text-red rotate-45" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
      <div className={`flex items-center relative self-stretch w-full rounded-[15px] shadow-[1px_1px_10px_#c5c5c5] hover:shadow-[2px_2px_15px_#b5b5b5] transition-shadow overflow-hidden ${
        isPrivateSpace
          ? 'border-2 border-red/20 bg-gradient-to-br from-red/5 to-red/10 hover:border-red/30 hover:from-red/8 hover:to-red/15'
          : 'bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]'
      }`} style={{ aspectRatio: '16 / 9' }}>
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
          <h2 className="relative w-fit [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-[14px] tracking-[0] leading-5 whitespace-nowrap">
            {title}
          </h2>
          {isPrivateSpace && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red/8 rounded-md border border-red/15 flex-shrink-0">
              <svg className="w-3 h-3 text-red" fill="currentColor" stroke="none" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-red text-xs font-medium leading-none">私享</span>
            </div>
          )}
        </div>
        <p className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-[12px] tracking-[0] leading-4 whitespace-nowrap flex-shrink-0">
          {treasureCount} {treasureCount === 1 ? 'treasure' : 'treasures'}
        </p>
      </header>
    </section>
  );
};

export default TreasuryCard;
