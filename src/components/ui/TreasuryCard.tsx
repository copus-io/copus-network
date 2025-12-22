import React from "react";
import { Link } from "react-router-dom";

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
  spaceType?: number; // 1 = Collections, 2 = Curations
  articleCount?: number;
  treasureCount?: number;
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
  // Falls back to namespace (always available) before generic 'User'
  const username = space.ownerInfo?.username
    || space.userInfo?.username
    || space.user?.username
    || space.author?.username
    || space.creator?.username
    || space.ownerName
    || space.userName
    || space.username
    || space.ownerInfo?.namespace
    || space.namespace
    || 'User';

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

  if (items.length === 0) {
    return (
      <section
        className={`relative w-full h-fit flex flex-col items-start gap-[15px] ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div className={`flex items-center justify-center relative self-stretch w-full rounded-[15px] shadow-[1px_1px_10px_#c5c5c5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] ${onClick ? 'hover:shadow-[2px_2px_15px_#b5b5b5] transition-shadow' : ''}`} style={{ aspectRatio: '16 / 9' }}>
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
          <h2 className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-dark-grey text-[18px] tracking-[0] leading-7 whitespace-nowrap">
            {title}
          </h2>
          <p className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-[16px] tracking-[0] leading-6 whitespace-nowrap">
            {treasureCount} {treasureCount === 1 ? 'treasure' : 'treasures'}
          </p>
        </header>
      </section>
    );
  }

  const [mainItem, ...sideItems] = items;

  return (
    <section
      className="relative w-full h-fit flex flex-col items-start gap-[15px] cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center relative self-stretch w-full rounded-[15px] shadow-[1px_1px_10px_#c5c5c5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] hover:shadow-[2px_2px_15px_#b5b5b5] transition-shadow overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
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

          <div className="flex flex-col items-start gap-[15px] relative w-full flex-[0_0_auto]">
            <h3 className="relative w-full mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-6 truncate">
              {mainItem.title}
            </h3>
          </div>
        </article>

        {/* Side items on the right - takes ~35% width */}
        {sideItems.length > 0 && (
          <div className="flex flex-col items-start justify-center gap-1 relative w-[35%] self-stretch rounded-[0px_15px_15px_0px] overflow-hidden">
            {sideItems.map((item, index) => (
              <article
                key={item.id}
                className={`flex-1 pl-0 pr-[15px] ${index === 0 ? "pt-[15px]" : "pb-[15px]"} ${
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
                  <h3 className="relative w-full mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-6 truncate">
                    {item.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <header className="justify-between flex items-center relative self-stretch w-full flex-[0_0_auto]">
        <h2 className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-dark-grey text-[18px] tracking-[0] leading-7 whitespace-nowrap">
          {title}
        </h2>
        <p className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-[16px] tracking-[0] leading-6 whitespace-nowrap">
          {treasureCount} {treasureCount === 1 ? 'treasure' : 'treasures'}
        </p>
      </header>
    </section>
  );
};

export default TreasuryCard;
