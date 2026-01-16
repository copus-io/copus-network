import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../../../contexts/UserContext";
import { AuthService } from "../../../../services/authService";
import { Button } from "../../../../components/ui/button";
import { TreasuryCard } from "../../../../components/ui/TreasuryCard";
import profileDefaultAvatar from "../../../../assets/images/profile-default.svg";
import defaultBanner from "../../../../assets/images/default-banner.svg";
import { useToast } from "../../../../components/ui/toast";

// Module-level cache to prevent duplicate fetches across StrictMode remounts
// Key: fetchKey (e.g., "user:123")
// Value: { timestamp, inProgress, data } - stores actual fetch results
interface FetchCacheEntry {
  timestamp: number;
  inProgress: boolean;
  data?: { userInfo: any; spaces: any[] };
}
const fetchCache: Map<string, FetchCacheEntry> = new Map();
const CACHE_TTL = 5000; // 5 seconds - prevents duplicate fetches during mount cycles and redirects

// Separate cache for social links fetch
let socialLinksFetchCache: { timestamp: number; inProgress: boolean; userId?: number } = { timestamp: 0, inProgress: false };
const SOCIAL_LINKS_CACHE_TTL = 5000; // 5 seconds

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
  coverUrl,
  socialLinks,
  onShare,
  isOwnProfile = false,
  onCoverUpload,
}: {
  username: string;
  namespace: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  socialLinks: SocialLink[];
  onShare?: () => void;
  isOwnProfile?: boolean;
  onCoverUpload?: (imageUrl: string) => void;
}): JSX.Element => {
  const [bannerImageLoaded, setBannerImageLoaded] = useState(false);
  const [showBannerLoadingSpinner, setShowBannerLoadingSpinner] = useState(false);

  // 智能Banner图片加载检测
  const checkBannerImageLoad = useCallback((imageUrl: string) => {
    if (!imageUrl || imageUrl === defaultBanner) {
      setBannerImageLoaded(true);
      setShowBannerLoadingSpinner(false);
      return;
    }

    setBannerImageLoaded(false);
    setShowBannerLoadingSpinner(false);

    let isLoaded = false;

    // 延迟300ms显示loading，如果图片快速加载完成就不显示loading
    const loadingTimer = setTimeout(() => {
      if (!isLoaded) {
        setShowBannerLoadingSpinner(true);
      }
    }, 300);

    // 创建新图片对象检测加载
    const img = new Image();
    img.onload = () => {
      isLoaded = true;
      clearTimeout(loadingTimer);
      setBannerImageLoaded(true);
      setShowBannerLoadingSpinner(false);
    };
    img.onerror = () => {
      isLoaded = true;
      clearTimeout(loadingTimer);
      setBannerImageLoaded(true); // 即使加载失败也显示，避免持续loading
      setShowBannerLoadingSpinner(false);
    };
    img.src = imageUrl;

    // 清理函数
    return () => clearTimeout(loadingTimer);
  }, []);

  // 检测封面图片加载
  useEffect(() => {
    const bannerUrl = coverUrl || defaultBanner;
    checkBannerImageLoad(bannerUrl);
  }, [coverUrl, checkBannerImageLoad]);


  return (
    <header className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto] pb-5">
      {/* Cover image - only show if user has a cover */}
      {coverUrl && (
        <div className="w-full h-48 overflow-hidden rounded-t-2xl bg-gradient-to-r from-blue-100 to-purple-100 relative">
          <div
            className={`w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-300 ${
              bannerImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${coverUrl})`,
              backgroundColor: '#f3f4f6'
            }}
          />
          {showBannerLoadingSpinner && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}

      <div className={`gap-4 lg:gap-6 px-0 py-0 flex flex-row items-start relative self-stretch w-full flex-[0_0_auto] ${coverUrl ? 'mt-[-60px] px-4 lg:pl-5 lg:pr-10 py-8' : ''}`}>
        <img
          className={`relative w-20 h-20 rounded-full object-cover shadow-lg z-10 ${coverUrl ? 'border-4 border-white' : ''}`}
          src={avatarUrl || profileDefaultAvatar}
          alt={`${username} profile`}
        />

        <div className="flex flex-col items-start gap-2.5 relative flex-1 grow">
          <div className={`inline-flex flex-col items-start justify-center relative flex-[0_0_auto] gap-0.5 ${coverUrl ? 'pt-8' : 'pt-0'}`}>
            <div className="inline-flex items-center gap-[15px] relative flex-[0_0_auto]">
              <h1 className="relative w-fit [font-family:'Lato',Helvetica] font-medium text-off-black text-2xl tracking-[0] leading-[1.4] whitespace-nowrap">
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

            <div className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[1.4]">
              @{namespace}
            </div>
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

// Main Content Section
export const MainContentSection = (): JSX.Element => {
  const navigate = useNavigate();
  const { namespace } = useParams<{ namespace?: string }>();
  const { user, socialLinks: socialLinksData, fetchSocialLinks, updateUser } = useUser();
  const { showToast } = useToast();

  // Determine if viewing other user early
  const isViewingOtherUserCheck = !!namespace && namespace !== user?.namespace;

  // Fetch social links when viewing own treasury (since we don't fetch them globally anymore)
  useEffect(() => {
    if (user && !isViewingOtherUserCheck) {
      // Check cache to prevent duplicate fetches
      const now = Date.now();
      const isSameUser = socialLinksFetchCache.userId === user.id;
      const isCacheValid = (now - socialLinksFetchCache.timestamp) < SOCIAL_LINKS_CACHE_TTL;

      if (isSameUser && (isCacheValid || socialLinksFetchCache.inProgress)) {
        console.log('Skipping duplicate social links fetch for user:', user.id);
        return;
      }

      // Mark as in progress
      socialLinksFetchCache = { timestamp: now, inProgress: true, userId: user.id };

      fetchSocialLinks().finally(() => {
        // Mark as complete
        socialLinksFetchCache = { ...socialLinksFetchCache, inProgress: false };
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, namespace]);

  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [treasuryUserInfo, setTreasuryUserInfo] = useState<any>(null);

  // Determine if viewing other user
  const isViewingOtherUser = !!namespace && namespace !== user?.namespace;
  const targetNamespace = namespace || user?.namespace;

  // Fetch user info and spaces using pageMySpaces API
  useEffect(() => {
    const fetchData = async () => {
      // For logged-in user viewing their own treasury, we can use user.id directly
      // For viewing other users, we need to fetch their info by namespace
      if (!user?.id && !namespace) {
        console.log('No user ID and no namespace, cannot fetch treasury');
        setLoading(false);
        return;
      }

      // Create a unique key for this fetch target to prevent duplicates
      // Important: Use user.id as key when viewing own treasury (whether via /my-treasury or /u/:namespace)
      // This prevents duplicate fetches during redirect from /my-treasury to /u/:namespace
      const isOwnTreasury = !namespace || namespace === user?.namespace;
      const fetchKey = isOwnTreasury && user?.id ? `user:${user.id}` : `namespace:${namespace}`;

      // Check module-level cache to prevent duplicate fetches (survives StrictMode remounts)
      const now = Date.now();
      const cached = fetchCache.get(fetchKey);

      // If we have cached data, use it immediately
      if (cached && cached.data && (now - cached.timestamp < CACHE_TTL)) {
        console.log('Using cached data for:', fetchKey);
        setTreasuryUserInfo(cached.data.userInfo);
        setSpaces(cached.data.spaces);
        setLoading(false);
        return;
      }

      // If fetch is in progress, wait a bit and try again (the first fetch will update the cache)
      if (cached && cached.inProgress) {
        console.log('Fetch in progress for:', fetchKey, '- waiting for cache update');
        // Wait for the in-progress fetch to complete, then use its result
        const waitForCache = async () => {
          for (let i = 0; i < 50; i++) { // Wait up to 5 seconds
            await new Promise(resolve => setTimeout(resolve, 100));
            const updated = fetchCache.get(fetchKey);
            if (updated && updated.data && !updated.inProgress) {
              console.log('Cache updated, using cached data for:', fetchKey);
              setTreasuryUserInfo(updated.data.userInfo);
              setSpaces(updated.data.spaces);
              setLoading(false);
              return;
            }
          }
          // Timeout - fetch failed or took too long, clear loading state
          console.log('Cache wait timeout for:', fetchKey);
          setLoading(false);
        };
        waitForCache();
        return;
      }

      // Mark as in progress immediately to prevent race conditions
      fetchCache.set(fetchKey, { timestamp: now, inProgress: true });

      try {
        setLoading(true);
        setError(null);
        setSpaces([]);

        // Determine target user ID
        let targetUserId: number | undefined;
        let processedInfo: any = null;

        console.log('Fetching treasury for:', { isViewingOtherUser, targetNamespace, namespace, userId: user?.id, userNamespace: user?.namespace });

        // Priority: If user is logged in, always use their ID first
        // Only fetch other user info if explicitly viewing another user AND we don't have a logged-in user
        if (user?.id) {
          // User is logged in - check if viewing own treasury or another's
          if (isViewingOtherUser && namespace) {
            // Viewing another user's treasury - fetch their info by namespace
            try {
              console.log('Fetching other user info by namespace:', namespace);
              processedInfo = await AuthService.getOtherUserTreasuryInfoByNamespace(namespace);
              targetUserId = processedInfo?.id;
              console.log('Other user info:', processedInfo, 'userId:', targetUserId);

              // If we couldn't get other user's ID, fall back to logged-in user
              if (!targetUserId) {
                console.warn('Could not get other user ID, falling back to logged-in user');
                processedInfo = user;
                targetUserId = user.id;
              }
            } catch (err) {
              console.warn('Failed to fetch other user info, falling back to logged-in user:', err);
              // Fall back to logged-in user instead of showing error
              processedInfo = user;
              targetUserId = user.id;
            }
          } else {
            // Viewing own treasury - use logged-in user's info
            processedInfo = user;
            targetUserId = user.id;
            console.log('Using logged-in user info, userId:', targetUserId);
          }
        } else if (namespace) {
          // Not logged in but have namespace - fetch that user's info
          try {
            console.log('Not logged in, fetching user info by namespace:', namespace);
            processedInfo = await AuthService.getOtherUserTreasuryInfoByNamespace(namespace);
            targetUserId = processedInfo?.id;
            console.log('User info:', processedInfo, 'userId:', targetUserId);

            if (!targetUserId) {
              console.warn('User not found for namespace:', namespace);
              setError('User not found. Please check the URL or log in to view your treasury.');
              setLoading(false);
              return;
            }
          } catch (err) {
            console.warn('Failed to fetch user info:', err);
            setError('User not found. Please check the URL or log in to view your treasury.');
            setLoading(false);
            return;
          }
        } else {
          // Not logged in and no namespace - show login prompt
          console.warn('Not logged in and no namespace provided');
          setError('Please log in to view your treasury.');
          setLoading(false);
          return;
        }

        setTreasuryUserInfo(processedInfo);

        if (!targetUserId) {
          console.warn('No target user ID available');
          setError('Unable to load treasury. Please try logging in.');
          setLoading(false);
          return;
        }

        // Fetch spaces using pageMySpaces API (paginated)
        // This API may not exist on production yet, so we handle 404 gracefully
        console.log('Fetching spaces for targetUserId:', targetUserId);
        try {
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

          // Use spaces directly from pageMySpaces API
          // The API may include article previews in the response (check for data/articles fields)
          // If not, TreasuryCard will display based on articleCount
          setSpaces(spacesArray);

          // Store in cache for reuse during redirects
          fetchCache.set(fetchKey, {
            timestamp: Date.now(),
            inProgress: false,
            data: { userInfo: processedInfo, spaces: spacesArray }
          });
        } catch (spacesErr: any) {
          // If pageMySpaces API returns 404, it means the API doesn't exist yet
          // Show empty state instead of error
          console.warn('pageMySpaces API not available, showing empty state:', spacesErr.message);
          setSpaces([]);

          // Store empty result in cache
          fetchCache.set(fetchKey, {
            timestamp: Date.now(),
            inProgress: false,
            data: { userInfo: processedInfo, spaces: [] }
          });
        }

      } catch (err) {
        console.error('Failed to fetch treasury data:', err);
        setError('Failed to load treasury data');
        showToast('Failed to fetch treasury data, please try again', 'error');
        // Clear cache on error so user can retry
        fetchCache.delete(fetchKey);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.namespace, namespace]);

  // Navigate to a specific space/treasury
  const handleSpaceClick = (space: any) => {
    if (space.namespace) {
      const targetPath = `/treasury/${space.namespace}`;
      navigate(targetPath);
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

  if (loading) {
    return (
      <main className="flex flex-col items-start px-4 lg:px-0 pt-0 pb-[30px] relative min-h-screen">
        <div className="flex items-center justify-center w-full h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-start px-4 lg:px-0 pt-0 pb-[30px] relative min-h-screen">
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

  // Handle cover image upload
  const handleCoverUpload = async (imageUrl: string) => {
    if (!user) return;

    try {
      // Call API to update user cover image
      await AuthService.updateUserInfo({
        coverUrl: imageUrl,
        bio: user.bio,
        faceUrl: user.faceUrl,
        userName: user.username
      });

      // Update local state
      if (isViewingOtherUser) {
        setTreasuryUserInfo({
          ...treasuryUserInfo,
          coverUrl: imageUrl
        });
      }

      // Update user info in UserContext if viewing own profile
      if (!isViewingOtherUser && user && updateUser) {
        updateUser({
          ...user,
          coverUrl: imageUrl
        });
      }

      showToast('Cover image updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to update cover image:', error);
      showToast('Failed to update cover image, please try again', 'error');
    }
  };

  return (
    <main className="flex flex-col items-start px-4 lg:px-0 pt-0 pb-[30px] relative min-h-screen">
      {/* Header Section */}
      <TreasuryHeaderSection
        username={displayUser?.username || 'Anonymous'}
        namespace={displayUser?.namespace || 'user'}
        bio={displayUser?.bio || ''}
        avatarUrl={displayUser?.faceUrl || profileDefaultAvatar}
        coverUrl={displayUser?.coverUrl}
        socialLinks={displaySocialLinks}
        onShare={handleShare}
        isOwnProfile={!isViewingOtherUser}
        onCoverUpload={handleCoverUpload}
      />

      {/* Spaces Grid - auto-fill columns with min 360px, flexible max */}
      <div className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-4 lg:gap-8 w-full pt-[10px] px-2.5 lg:pl-2.5 lg:pr-0">
        {spaces.length === 0 ? (
          /* Empty state - show create treasury prompt */
          <TreasuryCard
            space={{
              name: 'Create your first treasury',
              articleCount: 0,
            }}
            emptyAction={{
              label: 'Discover',
              href: '/',
            }}
          />
        ) : (
          /* Render all spaces from pageMySpaces API */
          spaces.map((space) => (
            <TreasuryCard
              key={space.id || space.namespace}
              space={{
                ...space,
                // Add owner username for display name generation
                ownerInfo: space.ownerInfo || { username: displayUser?.username || 'User' },
              }}
              onClick={() => handleSpaceClick(space)}
              isEditable={!isViewingOtherUser}
              onEdit={() => {
                // Navigate to edit page or open edit modal for custom spaces (spaceType 0)
                if (space.namespace) {
                  navigate(`/treasury/${space.namespace}`);
                }
              }}
            />
          ))
        )}
      </div>
    </main>
  );
};
