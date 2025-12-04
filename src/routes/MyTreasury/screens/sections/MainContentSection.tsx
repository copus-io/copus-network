import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../../../contexts/UserContext";
import { AuthService } from "../../../../services/authService";
import { Button } from "../../../../components/ui/button";
import profileDefaultAvatar from "../../../../assets/images/profile-default.svg";
import { useToast } from "../../../../components/ui/toast";

// Types
interface CollectionItem {
  id: string;
  uuid: string;
  title: string;
  url: string;
  coverImage: string;
}

interface SocialLink {
  id: number;
  title: string;
  linkUrl: string;
  iconUrl?: string;
}

// Header Section Component
const TreasuryHeaderSection = ({
  username,
  namespace,
  bio,
  avatarUrl,
  socialLinks,
  onShare,
}: {
  username: string;
  namespace: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks: SocialLink[];
  onShare?: () => void;
}): JSX.Element => {
  return (
    <header className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
      <div className="gap-6 lg:gap-10 px-4 lg:pl-5 lg:pr-10 py-0 flex flex-col lg:flex-row items-start relative self-stretch w-full flex-[0_0_auto]">
        <img
          className="relative w-20 h-20 rounded-full border-2 border-solid border-white object-cover"
          src={avatarUrl || profileDefaultAvatar}
          alt={`${username} profile`}
        />

        <div className="flex flex-col items-start gap-2.5 relative flex-1 grow">
          <div className="inline-flex flex-col items-start justify-center relative flex-[0_0_auto]">
            <div className="inline-flex items-center gap-[15px] relative flex-[0_0_auto]">
              <h1 className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-medium text-off-black text-3xl tracking-[0] leading-[42.0px] whitespace-nowrap">
                {username}
              </h1>

              {onShare && (
                <button
                  type="button"
                  aria-label="Share profile"
                  className="relative flex-[0_0_auto] hover:opacity-70 transition-opacity"
                  onClick={onShare}
                >
                  <img
                    alt="Share"
                    src="https://c.animaapp.com/V3VIhpjY/img/share.svg"
                    className="w-5 h-5"
                  />
                </button>
              )}
            </div>

            <p className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
              @{namespace}
            </p>
          </div>

          <div className="flex-col gap-[5px] flex items-start relative self-stretch w-full flex-[0_0_auto]">
            {bio && (
              <div className="flex items-center gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <p className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-[22.4px]">
                  {bio}
                </p>
              </div>
            )}

            {socialLinks.length > 0 && (
              <nav
                className="inline-flex items-center gap-[30px] relative flex-[0_0_auto] mt-1"
                aria-label="Social media links"
              >
                {socialLinks
                  .filter(link => link.linkUrl && link.linkUrl.trim())
                  .map((link) => (
                    <a
                      key={link.id}
                      href={link.linkUrl}
                      className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto] hover:opacity-70 transition-opacity"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="inline-flex items-center gap-[5px] relative flex-[0_0_auto]">
                        <img
                          className="relative flex-[0_0_auto] w-4 h-4"
                          alt=""
                          src={link.iconUrl || 'https://c.animaapp.com/w7obk4mX/img/link-icon.svg'}
                        />
                        <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                          {link.title}
                        </span>
                      </div>
                    </a>
                  ))}
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};


// Collection Card Component
const CollectionCard = ({
  title,
  treasureCount,
  items,
  onClick,
  emptyAction,
  isEditable,
  onEdit,
}: {
  title: string;
  treasureCount: number;
  items: CollectionItem[];
  onClick?: () => void;
  emptyAction?: {
    label: string;
    href: string;
    icon?: string;
  };
  isEditable?: boolean;
  onEdit?: () => void;
}): JSX.Element => {
  const [isHovered, setIsHovered] = useState(false);

  if (items.length === 0) {
    return (
      <section
        className="relative w-full h-fit flex flex-col items-start gap-[15px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex h-[300px] items-center justify-center relative self-stretch w-full rounded-[15px] shadow-[1px_1px_10px_#c5c5c5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
          {emptyAction ? (
            <Link
              to={emptyAction.href}
              className="flex items-center gap-[15px] px-5 py-2.5 bg-red text-white rounded-[50px] hover:bg-red/90 transition-colors"
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
            <p className="text-gray-500">No items in this collection</p>
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
  }

  const [mainItem, ...sideItems] = items.slice(0, 3);

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
              >
                <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-blue text-[10px] text-right tracking-[0] leading-[13.0px] whitespace-nowrap">
                  {mainItem.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}
                </span>
              </a>
            </div>
          </div>

          <div className="flex flex-col items-start gap-[15px] relative self-stretch w-full flex-[0_0_auto]">
            <h3 className="relative self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-6 line-clamp-1">
              {mainItem.title}
            </h3>
          </div>
        </article>

        {/* Side items on the right */}
        {sideItems.length > 0 && (
          <div className="flex flex-col items-start justify-center gap-1 relative flex-1 self-stretch grow rounded-[0px_15px_15px_0px]">
            {sideItems.map((item, index) => (
              <article
                key={item.id}
                className={`${
                  index === 0 ? "h-[153px]" : "flex-1 grow"
                } pl-0 pr-[15px] ${index === 0 ? "py-[15px]" : "py-0"} ${
                  index === 0
                    ? "rounded-[0px_15px_0px_0px]"
                    : "rounded-[0px_0px_15px_0px]"
                } flex flex-col items-start gap-[5px] relative self-stretch w-full bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]`}
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
                  } relative self-stretch w-full flex-[0_0_auto]`}
                >
                  <h3 className="relative self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-6 line-clamp-1">
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

// Main Content Section
export const MainContentSection = (): JSX.Element => {
  const navigate = useNavigate();
  const { namespace } = useParams<{ namespace?: string }>();
  const { user, socialLinks: socialLinksData } = useUser();
  const { showToast } = useToast();

  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [treasuryUserInfo, setTreasuryUserInfo] = useState<any>(null);

  // Edit treasury modal state - removed as we're now using spaces

  // Determine if viewing other user
  const isViewingOtherUser = !!namespace && namespace !== user?.namespace;
  const targetNamespace = namespace || user?.namespace;

  // Fetch user info and spaces using pageMySpaces API
  useEffect(() => {
    const fetchData = async () => {
      if (!targetNamespace) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setSpaces([]);

        // Fetch user info
        let processedInfo;
        console.log('Fetching user info for:', { isViewingOtherUser, targetNamespace, namespace, userNamespace: user?.namespace });
        if (isViewingOtherUser && targetNamespace) {
          console.log('Calling getOtherUserTreasuryInfoByNamespace with namespace:', targetNamespace);
          processedInfo = await AuthService.getOtherUserTreasuryInfoByNamespace(targetNamespace);
          console.log('Raw API response for other user:', processedInfo);
        } else if (user?.namespace) {
          const userInfo = await AuthService.getUserHomeInfo(user.namespace);
          processedInfo = userInfo.data || userInfo;
        } else {
          const userInfo = await AuthService.getUserTreasuryInfo();
          processedInfo = userInfo.data || userInfo;
        }

        console.log('Processed user info:', processedInfo);
        setTreasuryUserInfo(processedInfo);

        // Get target user ID for pageMySpaces API
        const targetUserId = processedInfo?.id || processedInfo?.userId || user?.id;
        if (!targetUserId) {
          console.error('No target user ID available');
          setError('Failed to load treasury data - user ID not found');
          return;
        }

        // Fetch spaces using pageMySpaces API (paginated)
        console.log('Fetching spaces for targetUserId:', targetUserId);
        const spacesResponse = await AuthService.getMySpaces(targetUserId);
        console.log('Spaces API response:', spacesResponse);

        // Handle paginated response - data array is at response.data.data
        let spacesArray: any[] = [];
        if (spacesResponse?.data?.data && Array.isArray(spacesResponse.data.data)) {
          spacesArray = spacesResponse.data.data;
        } else if (spacesResponse?.data && Array.isArray(spacesResponse.data)) {
          spacesArray = spacesResponse.data;
        } else if (Array.isArray(spacesResponse)) {
          spacesArray = spacesResponse;
        }

        console.log('Spaces array length:', spacesArray.length);
        setSpaces(spacesArray);

      } catch (err) {
        console.error('Failed to fetch treasury data:', err);
        setError('Failed to load treasury data');
        showToast('Failed to fetch treasury data, please try again', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, namespace, isViewingOtherUser, targetNamespace]);

  // Navigate to a specific space/treasury
  const handleSpaceClick = (space: any) => {
    if (space.namespace) {
      navigate(`/treasury/${space.namespace}`);
    }
  };

  // Handle share
  const handleShare = () => {
    const currentNamespace = isViewingOtherUser ? treasuryUserInfo?.namespace : user?.namespace;
    if (currentNamespace) {
      const url = `${window.location.origin}/u/${currentNamespace}`;
      navigator.clipboard.writeText(url);
      showToast('Profile link copied to clipboard', 'success');
    }
  };

  // Get display name for space based on spaceType
  const getSpaceDisplayName = (space: any, username: string): string => {
    // spaceType 1 = Collections, spaceType 2 = Curations
    if (space.spaceType === 1) {
      return `${username}'s Collections`;
    }
    if (space.spaceType === 2) {
      return `${username}'s Curations`;
    }
    return space.name || space.title || 'Untitled Treasury';
  };

  // Transform space to collection items format for CollectionCard
  const transformSpaceToCollectionItems = (space: any): CollectionItem[] => {
    // If space has data array (articles), transform them to collection items
    if (space.data && Array.isArray(space.data)) {
      return space.data.slice(0, 3).map((article: any, index: number) => ({
        id: article.uuid || article.id?.toString() || `${space.id}-${index}`,
        uuid: article.uuid || article.id?.toString() || `${space.id}-${index}`,
        title: article.title || 'Untitled',
        url: article.targetUrl || 'copus.network',
        coverImage: article.coverUrl || 'https://c.animaapp.com/V3VIhpjY/img/cover@2x.png',
      }));
    }
    // If space has coverUrl, use it as the first item
    if (space.coverUrl) {
      return [{
        id: space.id?.toString() || space.namespace,
        uuid: space.id?.toString() || space.namespace,
        title: space.name || 'Untitled',
        url: 'copus.network',
        coverImage: space.coverUrl,
      }];
    }
    return [];
  };

  if (loading) {
    return (
      <main className="flex flex-col items-start gap-5 px-4 lg:pl-[60px] lg:pr-10 pt-0 pb-[30px] relative min-h-screen">
        <div className="flex items-center justify-center w-full h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-start gap-5 px-4 lg:pl-[60px] lg:pr-10 pt-0 pb-[30px] relative min-h-screen">
        <div className="flex flex-col items-center justify-center w-full h-64 text-center gap-4">
          <div className="text-red-500">{error}</div>
          <Button
            onClick={() => navigate('/')}
            className="bg-red hover:bg-red/90 text-white px-6 py-2 rounded-lg"
          >
            Back to Home
          </Button>
        </div>
      </main>
    );
  }

  const displayUser = isViewingOtherUser ? treasuryUserInfo : user;
  const displaySocialLinks = isViewingOtherUser ? (treasuryUserInfo?.socialLinks || []) : (socialLinksData || []);

  return (
    <main className="flex flex-col items-start gap-5 px-4 lg:pl-[60px] lg:pr-10 pt-0 pb-[30px] relative min-h-screen">
      {/* Header Section */}
      <TreasuryHeaderSection
        username={displayUser?.username || 'Anonymous'}
        namespace={displayUser?.namespace || 'user'}
        bio={displayUser?.bio || ''}
        avatarUrl={displayUser?.faceUrl || profileDefaultAvatar}
        socialLinks={displaySocialLinks}
        onShare={handleShare}
      />

      {/* Spaces Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[30px] w-full pt-[10px]">
        {spaces.length === 0 ? (
          /* Empty state - show create treasury prompt */
          <CollectionCard
            title="Create your first treasury"
            treasureCount={0}
            items={[]}
            emptyAction={{
              label: 'Discover',
              href: '/',
            }}
          />
        ) : (
          /* Render all spaces from pageMySpaces API */
          spaces.map((space) => (
            <CollectionCard
              key={space.id || space.namespace}
              title={getSpaceDisplayName(space, displayUser?.username || 'User')}
              treasureCount={space.articleCount || space.treasureCount || 0}
              items={transformSpaceToCollectionItems(space)}
              onClick={() => handleSpaceClick(space)}
            />
          ))
        )}
      </div>
    </main>
  );
};
