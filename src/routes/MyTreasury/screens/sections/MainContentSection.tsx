import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useUser } from "../../../../contexts/UserContext";
import { AuthService } from "../../../../services/authService";
import { Button } from "../../../../components/ui/button";
import { ArticleCard, ArticleData } from "../../../../components/ArticleCard";
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

interface Collection {
  category: string;
  originalCategory?: string; // Original category name for editing
  items: CollectionItem[];
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

  const [likedArticles, setLikedArticles] = useState<any[]>([]);
  const [curatedArticles, setCuratedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [treasuryUserInfo, setTreasuryUserInfo] = useState<any>(null);

  // Edit treasury modal state
  const [showEditTreasuryModal, setShowEditTreasuryModal] = useState(false);
  const [editingTreasury, setEditingTreasury] = useState<{ id: string; name: string } | null>(null);
  const [editTreasuryName, setEditTreasuryName] = useState("");

  // Track renamed categories (maps original category name to new name)
  const [renamedCategories, setRenamedCategories] = useState<Map<string, string>>(new Map());

  // Determine if viewing other user
  const isViewingOtherUser = !!namespace && namespace !== user?.namespace;
  const targetNamespace = namespace || user?.namespace;

  // Fetch user info and liked articles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Reset data when fetching for a new user
        setLikedArticles([]);
        setCuratedArticles([]);

        // Fetch user info
        let processedInfo;
        console.log('Fetching user info for:', { isViewingOtherUser, targetNamespace, namespace, userNamespace: user?.namespace });
        if (isViewingOtherUser && targetNamespace) {
          // Use getOtherUserTreasuryInfoByNamespace for viewing other users
          // This method is proven to work correctly in UserProfileContent.tsx
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

        // Fetch liked articles - use the viewed user's ID, not the logged-in user
        const userId = processedInfo.id;
        console.log('Using userId for fetch:', userId, 'isViewingOtherUser:', isViewingOtherUser);
        if (userId) {
          const likedResponse = await AuthService.getMyLikedArticlesCorrect(1, 100, userId);

          let articlesArray = [];
          if (likedResponse?.data?.data && Array.isArray(likedResponse.data.data)) {
            articlesArray = likedResponse.data.data;
          } else if (likedResponse?.data && Array.isArray(likedResponse.data)) {
            articlesArray = likedResponse.data;
          } else if (Array.isArray(likedResponse)) {
            articlesArray = likedResponse;
          }

          console.log('Liked articles for user', userId, ':', articlesArray.length, articlesArray);
          setLikedArticles(articlesArray);

          // Fetch curated (created) articles
          try {
            const curatedResponse = await AuthService.getMyCreatedArticles(1, 100, userId);
            console.log('Curated articles response:', curatedResponse);
            console.log('Curated articles response type:', typeof curatedResponse);
            console.log('Curated articles response keys:', curatedResponse ? Object.keys(curatedResponse) : 'null');

            let curatedArray: any[] = [];
            // Handle different response structures
            if (curatedResponse?.data?.data && Array.isArray(curatedResponse.data.data)) {
              console.log('Using curatedResponse.data.data');
              curatedArray = curatedResponse.data.data;
            } else if (curatedResponse?.data && Array.isArray(curatedResponse.data)) {
              console.log('Using curatedResponse.data');
              curatedArray = curatedResponse.data;
            } else if (Array.isArray(curatedResponse)) {
              console.log('Using curatedResponse directly');
              curatedArray = curatedResponse;
            } else if (curatedResponse && typeof curatedResponse === 'object') {
              // Try to find the data array in the response
              console.log('Response is object, looking for data array');
              if ('data' in curatedResponse) {
                const dataField = (curatedResponse as any).data;
                if (Array.isArray(dataField)) {
                  curatedArray = dataField;
                } else if (dataField && typeof dataField === 'object' && 'data' in dataField) {
                  curatedArray = dataField.data;
                }
              }
            }

            console.log('Curated articles array:', curatedArray);
            console.log('Curated articles count:', curatedArray.length);
            setCuratedArticles(curatedArray);
          } catch (curatedErr) {
            console.error('Failed to fetch curated articles:', curatedErr);
            setCuratedArticles([]);
          }
        }

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

  // Handle opening edit treasury modal
  const handleEditTreasury = (treasuryId: string, treasuryName: string) => {
    setEditingTreasury({ id: treasuryId, name: treasuryName });
    setEditTreasuryName(treasuryName);
    setShowEditTreasuryModal(true);
  };

  // Handle saving treasury name
  const handleSaveTreasuryName = () => {
    if (!editTreasuryName.trim()) {
      showToast('Please enter a treasury name', 'error');
      return;
    }

    if (!editingTreasury) {
      showToast('No treasury selected', 'error');
      return;
    }

    // Update the renamed categories map
    const newRenamedCategories = new Map(renamedCategories);
    newRenamedCategories.set(editingTreasury.id, editTreasuryName.trim());
    setRenamedCategories(newRenamedCategories);

    // TODO: Call API to update treasury name when available
    showToast(`Treasury renamed to "${editTreasuryName.trim()}"`, 'success');

    // Close modal
    setShowEditTreasuryModal(false);
    setEditingTreasury(null);
    setEditTreasuryName("");
  };

  // Group articles by category
  const getCollectionsByCategory = (): Collection[] => {
    const categoryMap = new Map<string, { originalCategory: string; items: CollectionItem[] }>();

    likedArticles.forEach(article => {
      const originalCategory = article.categoryInfo?.name || 'General';
      if (!categoryMap.has(originalCategory)) {
        categoryMap.set(originalCategory, { originalCategory, items: [] });
      }
      categoryMap.get(originalCategory)!.items.push({
        id: article.uuid,
        uuid: article.uuid,
        title: article.title,
        url: article.targetUrl || 'copus.network',
        coverImage: article.coverUrl || 'https://c.animaapp.com/V3VIhpjY/img/cover@2x.png',
      });
    });

    return Array.from(categoryMap.entries()).map(([originalCategory, data]) => {
      // Use renamed category if available, otherwise use original
      const displayName = renamedCategories.get(originalCategory) || originalCategory;
      return {
        category: displayName,
        originalCategory: originalCategory, // Keep track of original for editing
        items: data.items,
      };
    });
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

  // Transform curated article to ArticleCard format
  const transformCuratedArticle = (article: any): ArticleData => {
    return {
      id: article.uuid,
      uuid: article.uuid,
      title: article.title,
      description: article.content,
      coverImage: article.coverUrl || 'https://c.animaapp.com/mft5gmofxQLTNf/img/cover-1.png',
      category: article.categoryInfo?.name || 'General',
      categoryColor: article.categoryInfo?.color || '#666666',
      userName: article.authorInfo?.username || 'Anonymous',
      userAvatar: article.authorInfo?.faceUrl || profileDefaultAvatar,
      userId: article.authorInfo?.id,
      userNamespace: article.authorInfo?.namespace,
      date: new Date((article.createAt || article.publishAt) * 1000).toISOString(),
      treasureCount: article.likeCount || 0,
      visitCount: (article.viewCount || 0).toString(),
      isLiked: article.isLiked || false,
      targetUrl: article.targetUrl,
      website: article.targetUrl ? new URL(article.targetUrl).hostname : undefined,
    };
  };

  // Handle user click
  const handleUserClick = (userId: number | undefined, userNamespace?: string) => {
    if (userNamespace) {
      navigate(`/u/${userNamespace}`);
    } else if (userId) {
      navigate(`/user/${userId}/treasury`);
    }
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

  const collections = getCollectionsByCategory();
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

      {/* Collections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[30px] w-full pt-[10px]">
        {/* Default Treasury Space Card */}
        <CollectionCard
          title={`${displayUser?.username || 'User'}'s treasury`}
          treasureCount={likedArticles.length}
          items={likedArticles.slice(0, 3).map(article => ({
            id: article.uuid,
            uuid: article.uuid,
            title: article.title,
            url: article.targetUrl || 'copus.network',
            coverImage: article.coverUrl || 'https://c.animaapp.com/V3VIhpjY/img/cover@2x.png',
          }))}
          onClick={() => navigate(`/space/${encodeURIComponent(`${displayUser?.username || 'User'}'s treasury`)}`)}
          emptyAction={{
            label: 'Discover',
            href: '/',
          }}
        />

        {/* Default Curations Space Card */}
        <CollectionCard
          title={`${displayUser?.username || 'User'}'s curations`}
          treasureCount={curatedArticles.length}
          items={curatedArticles.slice(0, 3).map(article => ({
            id: article.uuid,
            uuid: article.uuid,
            title: article.title,
            url: article.targetUrl || 'copus.network',
            coverImage: article.coverUrl || 'https://c.animaapp.com/V3VIhpjY/img/cover@2x.png',
          }))}
          onClick={() => navigate(`/space/${encodeURIComponent(`${displayUser?.username || 'User'}'s curations`)}`)}
          emptyAction={{
            label: 'Curate',
            href: '/create',
            icon: 'https://c.animaapp.com/mft4oqz6uyUKY7/img/vector.svg',
          }}
        />

        {/* Category-based Collection Cards */}
        {collections.map((collection) => (
          <CollectionCard
            key={collection.originalCategory || collection.category}
            title={collection.category}
            treasureCount={collection.items.length}
            items={collection.items}
            onClick={() => navigate(`/space/${encodeURIComponent(collection.originalCategory || collection.category)}`)}
            isEditable={!isViewingOtherUser}
            onEdit={() => handleEditTreasury(collection.originalCategory || collection.category, collection.category)}
          />
        ))}
      </div>

      {/* Edit Treasury Modal */}
      {showEditTreasuryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowEditTreasuryModal(false);
              setEditingTreasury(null);
              setEditTreasuryName("");
            }}
          />

          {/* Modal */}
          <div
            className="flex flex-col w-[582px] max-w-[90vw] items-center gap-5 p-[30px] relative bg-white rounded-[15px] z-10"
            role="dialog"
            aria-labelledby="edit-treasury-title"
            aria-modal="true"
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowEditTreasuryModal(false);
                setEditingTreasury(null);
                setEditTreasuryName("");
              }}
              className="relative self-stretch w-full flex-[0_0_auto] cursor-pointer"
              aria-label="Close dialog"
              type="button"
            >
              <img
                className="w-full"
                alt=""
                src="https://c.animaapp.com/RWdJi6d2/img/close.svg"
              />
            </button>

            <div className="flex flex-col items-start gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
                <h2
                  id="edit-treasury-title"
                  className="relative w-fit [font-family:'Lato',Helvetica] font-semibold text-off-black text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap"
                >
                  Edit treasury
                </h2>

                <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                  <label
                    htmlFor="edit-treasury-name-input"
                    className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap"
                  >
                    Name
                  </label>

                  <div className="flex h-12 items-center px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                    <input
                      id="edit-treasury-name-input"
                      type="text"
                      value={editTreasuryName}
                      onChange={(e) => setEditTreasuryName(e.target.value)}
                      placeholder="Enter treasury name"
                      className="flex-1 border-none bg-transparent [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] outline-none placeholder:text-medium-dark-grey"
                      aria-required="true"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveTreasuryName();
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                {/* Delete button on the left */}
                <button
                  className="inline-flex items-center gap-2 px-3 py-2.5 relative flex-[0_0_auto] rounded-[15px] cursor-pointer hover:bg-red/10 transition-colors"
                  onClick={() => {
                    // TODO: Implement delete treasury API call
                    showToast(`Treasury "${editingTreasury?.name}" deleted`, 'success');
                    setShowEditTreasuryModal(false);
                    setEditingTreasury(null);
                    setEditTreasuryName("");
                  }}
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

                {/* Cancel and Save buttons on the right */}
                <div className="flex items-center gap-2.5">
                  <button
                    className="inline-flex items-center justify-center gap-[30px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setShowEditTreasuryModal(false);
                      setEditingTreasury(null);
                      setEditTreasuryName("");
                    }}
                    type="button"
                  >
                    <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                      Cancel
                    </span>
                  </button>

                  <button
                    className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[100px] bg-red cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red/90 transition-colors"
                    onClick={handleSaveTreasuryName}
                    disabled={!editTreasuryName.trim()}
                    type="button"
                  >
                    <span className="relative w-fit [font-family:'Lato',Helvetica] font-bold text-white text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                      Save
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
