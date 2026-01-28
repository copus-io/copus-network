import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../../../contexts/UserContext";
import { AuthService } from "../../../../services/authService";
import { Button } from "../../../../components/ui/button";
import { TreasuryCard } from "../../../../components/ui/TreasuryCard";
import profileDefaultAvatar from "../../../../assets/images/profile-default.svg";
import defaultBanner from "../../../../assets/images/default-banner.svg";
import { useToast } from "../../../../components/ui/toast";
import { ImageUploader } from "../../../../components/ImageUploader/ImageUploader";

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
  onEdit,
  isOwnProfile = false,
  onCoverUpload,
  onCreate,
}: {
  username: string;
  namespace: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  socialLinks: SocialLink[];
  onShare?: () => void;
  onEdit?: () => void;
  isOwnProfile?: boolean;
  onCoverUpload?: (imageUrl: string) => void;
  onCreate?: () => void;
}): JSX.Element => {
  const [bannerImageLoaded, setBannerImageLoaded] = useState(false);
  const [showBannerLoadingSpinner, setShowBannerLoadingSpinner] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);

  // Handle copy link
  const handleCopyLink = () => {
    const profileUrl = `${window.location.origin}/u/${namespace}`;
    navigator.clipboard.writeText(profileUrl);
    setShowShareDropdown(false);
  };

  // Handle share on X
  const handleShareOnX = () => {
    const profileUrl = `${window.location.origin}/u/${namespace}`;
    const text = `Check out ${username}'s profile on Copus!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`;
    window.open(twitterUrl, '_blank');
    setShowShareDropdown(false);
  };

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
      {/* Cover image - only show if user has a cover image */}
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

          {/* Edit and Share buttons - positioned at top right when cover exists */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                aria-label="Edit profile"
                className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:opacity-70 transition-opacity"
                onClick={onEdit}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}

            {onShare && (
              <div className="relative">
                <button
                  type="button"
                  aria-label="Share profile"
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
            )}
          </div>

          {/* Create new collection button - positioned at bottom right */}
          {onCreate && isOwnProfile && (
            <button
              onClick={onCreate}
              className="absolute bottom-3 right-3 z-10 flex items-center gap-2 px-4 py-2 bg-red hover:bg-red/90 text-white rounded-[50px] shadow-lg transition-colors [font-family:'Lato',Helvetica] font-bold text-sm"
            >
              <img
                src="https://c.animaapp.com/eANMvAF7/img/plus.svg"
                alt="Add"
                className="w-4 h-4 brightness-0 invert"
              />
              Create new collection
            </button>
          )}
        </div>
      )}

      {/* User information - centered layout */}
      <div className={`relative flex flex-col items-center text-center w-full ${coverUrl ? 'mt-[-40px]' : ''}`}>
        {/* Avatar */}
        <img
          className="w-20 h-20 rounded-full object-cover shadow-lg border-4 border-white mb-3"
          src={avatarUrl || profileDefaultAvatar}
          alt={`${username} profile`}
        />

        {/* Username */}
        <h1 className="[font-family:'Lato',Helvetica] font-normal text-off-black text-2xl tracking-[0] leading-[1.4] mb-2">
          {username}
        </h1>

        {/* Namespace */}
        <div className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[1.4] mb-2">
          @{namespace}
        </div>

        {/* Bio */}
        {bio && (
          <p className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-[22.4px] mb-1 max-w-md">
            {bio}
          </p>
        )}

        {/* Social links */}
        {socialLinks.length > 0 && (
          <nav
            className="flex items-center justify-center gap-[30px] flex-wrap"
            aria-label="Social media links"
          >
            {socialLinks
              .filter(link => link.linkUrl && link.linkUrl.trim())
              .map((link) => (
                <a
                  key={link.id}
                  href={link.linkUrl}
                  className="inline-flex items-center gap-[5px] hover:opacity-70 transition-opacity"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    className="w-4 h-4"
                    alt=""
                    src={link.iconUrl || 'https://c.animaapp.com/w7obk4mX/img/link-icon.svg'}
                  />
                  <span className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                    {link.title}
                  </span>
                </a>
              ))}
          </nav>
        )}

        {/* Action buttons - Create new collection, Edit, Share - shown when no cover */}
        {!coverUrl && (
          <div className="flex items-center gap-3 mt-4">
            {/* Create new collection button */}
            {onCreate && isOwnProfile && (
              <button
                onClick={onCreate}
                className="flex items-center gap-2 px-4 py-2 bg-red hover:bg-red/90 text-white rounded-[50px] shadow-lg transition-colors [font-family:'Lato',Helvetica] font-bold text-sm"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 0V12M0 6H12" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Create new collection
              </button>
            )}

            {/* Edit button */}
            {onEdit && (
              <button
                type="button"
                aria-label="Edit profile"
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:opacity-70 transition-opacity"
                onClick={onEdit}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}

            {/* Share button */}
            {onShare && (
              <div className="relative">
                <button
                  type="button"
                  aria-label="Share profile"
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
            )}
          </div>
        )}
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

  // Create Space Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSpaceName, setCreateSpaceName] = useState("");
  const [createSpaceDescription, setCreateSpaceDescription] = useState("");
  const [createSpaceCoverUrl, setCreateSpaceCoverUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false); // 图片上传状态

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

  // Handle create new space
  const handleCreateSpace = async () => {
    if (!createSpaceName.trim()) {
      showToast('Please enter a space name', 'error');
      return;
    }

    if (!user) {
      showToast('Please log in to create a space', 'error');
      return;
    }

    try {
      setIsCreating(true);

      // Prepare optional fields
      const description = createSpaceDescription.trim() || undefined;
      const coverUrl = createSpaceCoverUrl.trim() || undefined;

      // Call API to create space
      const response = await AuthService.createSpace(createSpaceName.trim(), description, coverUrl);
      console.log('Create space response:', response);

      // Add the new space to the local state
      const newSpace = response.data || response;
      if (newSpace) {
        setSpaces(prev => [newSpace, ...prev]);
      }

      showToast('Space created successfully', 'success');
      setShowCreateModal(false);

      // Reset form
      setCreateSpaceName("");
      setCreateSpaceDescription("");
      setCreateSpaceCoverUrl("");
      setIsImageUploading(false); // 重置图片上传状态

      // Navigate to the new space if we have its namespace
      if (newSpace?.namespace) {
        navigate(`/treasury/${newSpace.namespace}`);
      }
    } catch (err) {
      console.error('Failed to create space:', err);
      showToast('Failed to create space', 'error');
    } finally {
      setIsCreating(false);
    }
  };

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
        onEdit={!isViewingOtherUser ? () => navigate('/setting') : undefined}
        isOwnProfile={!isViewingOtherUser}
        onCoverUpload={handleCoverUpload}
        onCreate={() => setShowCreateModal(true)}
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
                ownerInfo: space.ownerInfo || { username: displayUser?.username || 'Anonymous' },
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

      {/* Create Space Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowCreateModal(false);
              setCreateSpaceName("");
              setCreateSpaceDescription("");
              setCreateSpaceCoverUrl("");
              setIsImageUploading(false); // 重置图片上传状态
            }}
          />

          {/* Modal */}
          <div
            className="flex flex-col w-[582px] max-w-[90vw] items-center gap-5 p-[30px] relative bg-white rounded-[15px] z-10"
            role="dialog"
            aria-labelledby="create-space-title"
            aria-modal="true"
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowCreateModal(false);
                setCreateSpaceName("");
                setCreateSpaceDescription("");
                setCreateSpaceCoverUrl("");
                setIsImageUploading(false); // 重置图片上传状态
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close dialog"
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L13 13M1 13L13 1" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="flex flex-col items-start gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
                <h2
                  id="create-space-title"
                  className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap"
                >
                  Create new collection
                </h2>

                {/* Space Name */}
                <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                  <label
                    htmlFor="create-space-name-input"
                    className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap"
                  >
                    Name
                  </label>

                  <div className="flex h-12 items-center px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                    <input
                      id="create-space-name-input"
                      type="text"
                      value={createSpaceName}
                      onChange={(e) => setCreateSpaceName(e.target.value)}
                      placeholder="Enter space name"
                      className="flex-1 border-none bg-transparent [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] outline-none placeholder:text-medium-dark-grey"
                      aria-required="true"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Space Description */}
                <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                  <label
                    htmlFor="create-space-description-input"
                    className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap"
                  >
                    Description (Optional)
                  </label>

                  <div className="flex items-start px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                    <textarea
                      id="create-space-description-input"
                      value={createSpaceDescription}
                      onChange={(e) => setCreateSpaceDescription(e.target.value)}
                      placeholder="Describe your space (optional)"
                      className="flex-1 border-none bg-transparent [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] outline-none placeholder:text-medium-dark-grey resize-none"
                      rows={3}
                      maxLength={200}
                    />
                  </div>
                  <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-gray-400 text-sm tracking-[0] leading-[18px]">
                    {createSpaceDescription.length}/200 characters
                  </span>
                </div>

                {/* Cover Image Upload */}
                <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                  <div className="flex flex-col gap-2 relative self-stretch w-full flex-[0_0_auto]">
                    <ImageUploader
                      type="banner"
                      currentImage={createSpaceCoverUrl}
                      onImageUploaded={(url) => {
                        console.log('🔥🔥🔥 SPACE CREATE: Received image URL:', url);
                        setCreateSpaceCoverUrl(url);
                        console.log('🔥🔥🔥 SPACE CREATE: State updated with URL:', url);
                      }}
                      onError={(error) => showToast(error, 'error')}
                      onUploadStatusChange={(uploading) => {
                        console.log('🔥🔥🔥 SPACE CREATE: Image upload status changed:', uploading);
                        setIsImageUploading(uploading);
                      }}
                    />
                    <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-gray-400 text-sm tracking-[0] leading-[18px]">
                      Recommended size: 1200x200px (6:1 ratio)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end relative self-stretch w-full flex-[0_0_auto]">
                {/* Cancel and Create buttons */}
                <div className="flex items-center gap-2.5">
                  <button
                    className="inline-flex items-center justify-center gap-[30px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateSpaceName("");
                      setCreateSpaceDescription("");
                      setCreateSpaceCoverUrl("");
                      setIsImageUploading(false); // 重置图片上传状态
                    }}
                    type="button"
                  >
                    <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                      Cancel
                    </span>
                  </button>

                  <button
                    className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[100px] bg-red cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red/90 transition-colors"
                    onClick={handleCreateSpace}
                    disabled={isCreating || !createSpaceName.trim() || isImageUploading}
                    type="button"
                  >
                    <span className="relative w-fit [font-family:'Lato',Helvetica] font-bold text-white text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                      {isImageUploading ? 'Uploading image...' : (isCreating ? 'Creating...' : 'Create')}
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
