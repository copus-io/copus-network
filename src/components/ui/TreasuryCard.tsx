import React, { useState } from "react";
import { Link } from "react-router-dom";

// Types for treasury items
export interface TreasuryItem {
  id: string;
  uuid?: string;
  title: string;
  url: string;
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
  isEditable?: boolean;
  onEdit?: () => void;
}

/**
 * Get display name for a space/treasury based on spaceType
 * spaceType 1 = Treasury (default), spaceType 2 = Curations
 */
export const getSpaceDisplayName = (space: SpaceData): string => {
  // Get username from various possible fields in API response
  const username = space.ownerInfo?.username
    || space.userInfo?.username
    || space.user?.username
    || space.author?.username
    || space.creator?.username
    || space.ownerName
    || space.userName
    || space.username
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
 * Transform space data to treasury items for display
 */
export const transformSpaceToItems = (space: SpaceData): TreasuryItem[] => {
  const articles = space.data || space.articles || [];
  return articles.slice(0, 3).map((article: any, index: number) => ({
    id: article.uuid || article.id?.toString() || `item-${index}`,
    uuid: article.uuid,
    title: article.title || 'Untitled',
    url: article.targetUrl || 'copus.network',
    coverImage: article.coverUrl || 'https://c.animaapp.com/V3VIhpjY/img/cover@2x.png',
  }));
};

/**
 * Get treasure count from space data
 */
export const getSpaceTreasureCount = (space: SpaceData): number => {
  return space.articleCount || space.treasureCount || (space.data?.length) || (space.articles?.length) || 0;
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
  isEditable,
  onEdit,
}: TreasuryCardProps): JSX.Element => {
  const [isHovered, setIsHovered] = useState(false);

  const title = getSpaceDisplayName(space);
  const treasureCount = getSpaceTreasureCount(space);
  const items = transformSpaceToItems(space);

  // Hide edit button for default treasury types (spaceType 1 = Collections, 2 = Curations)
  const canEdit = isEditable && space.spaceType !== 1 && space.spaceType !== 2;

  if (items.length === 0) {
    return (
      <section
        className={`relative w-full h-fit flex flex-col items-start gap-[15px] ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`flex h-[300px] items-center justify-center relative self-stretch w-full rounded-[15px] shadow-[1px_1px_10px_#c5c5c5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] ${onClick ? 'hover:shadow-[2px_2px_15px_#b5b5b5] transition-shadow' : ''}`}>
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
          <h2 className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-dark-grey text-xl tracking-[0] leading-7 whitespace-nowrap">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <p className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-[16px] tracking-[0] leading-6 whitespace-nowrap">
              {treasureCount} treasures
            </p>
            {canEdit && isHovered && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Edit treasury name"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
      className="relative w-full h-fit flex flex-col items-start gap-[15px] cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex h-[300px] items-center relative self-stretch w-full rounded-[15px] shadow-[1px_1px_10px_#c5c5c5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] hover:shadow-[2px_2px_15px_#b5b5b5] transition-shadow">
        {/* Main item on the left */}
        <article className="inline-flex flex-col items-start justify-center gap-[5px] px-[15px] py-0 relative self-stretch flex-[0_0_auto] rounded-[15px_0px_0px_15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
          <div
            className="flex flex-col w-[320px] h-60 items-end justify-end p-2.5 relative bg-cover bg-center rounded-lg"
            style={{ backgroundImage: `url(${mainItem.coverImage})` }}
          >
            <div className="flex flex-col items-end gap-2.5 self-stretch w-full relative flex-[0_0_auto]">
              <a
                href={mainItem.url.startsWith('http') ? mainItem.url : `https://${mainItem.url}`}
                className="inline-flex items-start gap-[5px] px-2.5 py-[5px] relative flex-[0_0_auto] bg-[#ffffffcc] rounded-[15px] overflow-hidden"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-blue text-[10px] text-right tracking-[0] leading-[13.0px] whitespace-nowrap">
                  {mainItem.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}
                </span>
              </a>
            </div>
          </div>

          <div className="flex flex-col items-start gap-[15px] relative w-[320px] flex-[0_0_auto]">
            <h3 className="relative w-[320px] mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-6 truncate">
              {mainItem.title}
            </h3>
          </div>
        </article>

        {/* Side items on the right */}
        {sideItems.length > 0 && (
          <div className="flex flex-col items-start justify-center gap-1 relative flex-1 self-stretch grow rounded-[0px_15px_15px_0px] overflow-hidden">
            {sideItems.map((item, index) => (
              <article
                key={item.id}
                className={`${
                  index === 0 ? "h-[153px]" : "flex-1 grow"
                } pl-0 pr-[15px] ${index === 0 ? "py-[15px]" : "py-0"} ${
                  index === 0
                    ? "rounded-[0px_15px_0px_0px]"
                    : "rounded-[0px_0px_15px_0px]"
                } flex flex-col items-start gap-[5px] relative self-stretch w-full min-w-0 bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]`}
              >
                <div
                  className="h-[98px] p-[5px] self-stretch w-full flex flex-col items-end justify-end relative bg-cover bg-center rounded-lg"
                  style={{ backgroundImage: `url(${item.coverImage})` }}
                >
                  <div className="flex flex-col items-end gap-2.5 self-stretch w-full relative flex-[0_0_auto]">
                    <a
                      href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                      className="inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-[#ffffffcc] rounded-[15px] overflow-hidden relative flex-[0_0_auto]"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-blue text-[10px] text-right tracking-[0] leading-[13.0px] whitespace-nowrap">
                        {item.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}
                      </span>
                    </a>
                  </div>
                </div>

                <div
                  className={`flex flex-col items-start gap-[15px] ${
                    index === 0 ? "mb-[-4.00px]" : ""
                  } relative self-stretch w-full flex-[0_0_auto] min-w-0 overflow-hidden`}
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
        <h2 className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-dark-grey text-xl tracking-[0] leading-7 whitespace-nowrap">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <p className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-[16px] tracking-[0] leading-6 whitespace-nowrap">
            {treasureCount} treasures
          </p>
          {isEditable && isHovered && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Edit treasury name"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </header>
    </section>
  );
};

export default TreasuryCard;
