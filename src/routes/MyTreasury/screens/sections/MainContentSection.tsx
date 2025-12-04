import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../../../contexts/UserContext";
import { AuthService } from "../../../../services/authService";
import { Button } from "../../../../components/ui/button";
import { TreasuryCard } from "../../../../components/ui/TreasuryCard";
import profileDefaultAvatar from "../../../../assets/images/profile-default.svg";
import { useToast } from "../../../../components/ui/toast";

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
