import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../../../contexts/UserContext";
import { AuthService } from "../../../../services/authService";
import { Button } from "../../../../components/ui/button";
import { TreasuryCard } from "../../../../components/ui/TreasuryCard";
import profileDefaultAvatar from "../../../../assets/images/profile-default.svg";
import { useToast } from "../../../../components/ui/toast";

// Module-level cache to prevent duplicate fetches across StrictMode remounts
// Key: fetchKey (e.g., "user:123" or "namespace:username")
// Value: { timestamp: number, promise?: Promise } - timestamp for cache expiry
const fetchCache: Map<string, { timestamp: number; inProgress: boolean }> = new Map();
const CACHE_TTL = 2000; // 2 seconds - prevents duplicate fetches during mount cycles

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
      const fetchKey = namespace ? `namespace:${namespace}` : `user:${user?.id}`;

      // Check module-level cache to prevent duplicate fetches (survives StrictMode remounts)
      const now = Date.now();
      const cached = fetchCache.get(fetchKey);
      if (cached && (now - cached.timestamp < CACHE_TTL || cached.inProgress)) {
        console.log('Skipping duplicate fetch for:', fetchKey, cached.inProgress ? '(in progress)' : '(recently fetched)');
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
        } catch (spacesErr: any) {
          // If pageMySpaces API returns 404, it means the API doesn't exist yet
          // Show empty state instead of error
          console.warn('pageMySpaces API not available, showing empty state:', spacesErr.message);
          setSpaces([]);
        }

      } catch (err) {
        console.error('Failed to fetch treasury data:', err);
        setError('Failed to load treasury data');
        showToast('Failed to fetch treasury data, please try again', 'error');
        // Clear cache on error so user can retry
        fetchCache.delete(fetchKey);
      } finally {
        setLoading(false);
        // Mark as no longer in progress (keep timestamp for TTL)
        const existing = fetchCache.get(fetchKey);
        if (existing) {
          fetchCache.set(fetchKey, { ...existing, inProgress: false });
        }
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-[30px] w-full pt-[10px]">
        {spaces.length === 0 ? (
          /* Empty state - show create treasury prompt */
          <div className="max-w-[400px]">
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
          </div>
        ) : (
          /* Render all spaces from pageMySpaces API */
          spaces.map((space) => (
            <div key={space.id || space.namespace} className="max-w-[380px]">
              <TreasuryCard
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
            </div>
          ))
        )}
      </div>
    </main>
  );
};
