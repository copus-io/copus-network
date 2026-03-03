import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import { AuthService } from "../../../services/authService";
import { removeArticleFromSpace, bindArticles, moveArticlesToSpace } from "../../../services/articleService";
import { Button } from "../../../components/ui/button";
import { useToast } from "../../../components/ui/toast";
import profileDefaultAvatar from "../../../assets/images/profile-default.svg";
import { ArticleCard, ArticleData } from "../../../components/ArticleCard";
import { CollectTreasureModal } from "../../../components/CollectTreasureModal";
import { ImageUploader } from "../../../components/ImageUploader/ImageUploader";
import { devLog } from "../../../utils/devLogger";
import { ErrorHandler } from "../../../utils/errorHandler";
import { API_ENDPOINTS } from "../../../config/apiEndpoints";
import { spaceShortcuts, eventHandlers } from "../../../utils/devShortcuts";
import { getIconUrl } from "../../../config/icons";
import { ImportCSVModal } from "../../../components/ImportCSVModal";
import { type ImportedBookmark } from "../../../utils/csvUtils";
import { useCategory } from "../../../contexts/CategoryContext";
import { NoAccessPermission } from "../../../components/NoAccessPermission/NoAccessPermission";
import { SEO } from "../../../components/SEO/SEO";
import SubscribeButton from "../../../components/SubscribeButton/SubscribeButton";
import { TreasuryCard, type SpaceData } from "../../../components/ui/TreasuryCard";
import { CreateSpaceModal } from "../../../components/CreateSpaceModal/CreateSpaceModal";


// Module-level cache to prevent duplicate fetches across StrictMode remounts
interface SpaceFetchCacheEntry {
  timestamp: number;
  inProgress: boolean;
  data?: { spaceInfo: any; articles: any[]; totalCount: number; spaceId: number | null; isFollowing: boolean; followerCount: number };
}
const spaceFetchCache: Map<string, SpaceFetchCacheEntry> = new Map();
const SPACE_CACHE_TTL = 5000; // 5 seconds - prevents duplicate fetches during mount cycles

// Space Info Section Component - Styled similar to Profile page
const SpaceInfoSection = ({
  spaceName,
  treasureCount,
  subscriberCount,
  authorName,
  authorAvatar,
  authorNamespace,
  spaceNamespace,
  spaceDescription,
  spaceCoverUrl,
  spaceFaceUrl,
  firstArticleCover,
  isFollowing,
  isOwner,
  spaceType,
  visibility,
  spaceId,
  onFollow,
  onUnfollow,
  onShare,
  onAuthorClick,
  onEdit,
  onOrganize,
  organizeMode,
  onCreateSubTreasury,
  onImportCSV,
  onSubscriberCountLoaded,
  onSubscriptionChange,
  parentSpaceName,
  isSubTreasury,
  parentSpaceInfo,
  navigate,
  spaceInfo,
}: {
  spaceName: string;
  treasureCount: number;
  subscriberCount?: number;
  authorName: string;
  authorAvatar?: string;
  authorNamespace?: string;
  spaceNamespace?: string;
  spaceDescription?: string;
  spaceCoverUrl?: string;
  spaceFaceUrl?: string;
  firstArticleCover?: string;
  isFollowing: boolean;
  isOwner: boolean;
  spaceType?: number;
  visibility?: number;
  spaceId?: number | null;
  onFollow: () => void;
  onUnfollow: () => void;
  onShare: () => void;
  onAuthorClick: () => void;
  onEdit?: () => void;
  onOrganize?: () => void;
  organizeMode?: boolean;
  onCreateSubTreasury?: () => void;
  onImportCSV?: () => void;
  onSubscriberCountLoaded?: (count: number) => void;
  onSubscriptionChange?: (isSubscribed: boolean) => void;
  parentSpaceName?: string;
  isSubTreasury?: boolean;
  parentSpaceInfo?: { name: string; namespace?: string; id?: number } | null;
  navigate?: (path: string | number) => void;
  spaceInfo?: any;
}): JSX.Element => {
  const canEdit = isOwner;
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const { showToast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
      setShowShareDropdown(false);
    } catch (error) {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleShareOnX = () => {
    const encodedUrl = encodeURIComponent(window.location.href);
    const encodedText = encodeURIComponent(spaceName);
    window.open(
      `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      '_blank',
      'noopener,noreferrer'
    );
    setShowShareDropdown(false);
  };

  return (
    <section className="w-full">
      {/* Cover image - only show if there's a cover */}
      {spaceCoverUrl && (
        <div className="w-full h-48 rounded-t-2xl bg-gradient-to-r from-blue-100 to-purple-100 relative group">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat rounded-t-2xl overflow-hidden"
            style={{
              backgroundImage: `url(${spaceCoverUrl})`,
              backgroundColor: '#f3f4f6'
            }}
          />
        </div>
      )}

      {/* Space information */}
      <div className={`relative flex flex-col items-center text-center ${spaceCoverUrl ? 'mt-[-40px]' : ''}`}>
        {/* Space avatar - priority: space's own faceUrl > author avatar for default spaces > first article cover > initials */}
        {(() => {
          const isDefaultSpace = spaceType === 1 || spaceType === 2;
          // Priority order for avatar image
          const avatarImage = spaceFaceUrl || (isDefaultSpace ? authorAvatar : firstArticleCover);
          const firstLetter = spaceName?.charAt(0)?.toUpperCase() || 'S';

          return avatarImage ? (
            <img
              src={avatarImage}
              alt={spaceName}
              className="w-20 h-20 rounded-full object-cover mb-3 border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-3 border-4 border-white shadow-lg">
              <span className="text-2xl font-medium text-gray-600">{firstLetter}</span>
            </div>
          );
        })()}

        {/* Private pill - overlaps with avatar */}
        {visibility === 1 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E0E0E0] rounded-[100px] -mt-5 mb-1">
            <svg className="w-4 h-4" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.9723 3C15.4989 3 14.096 3.66092 12.9955 4.86118C11.9336 3.70292 10.5466 3 9.02774 3C5.7035 3 3 6.36428 3 10.5C3 14.6357 5.7035 18 9.02774 18C10.5466 18 11.9359 17.2971 12.9955 16.1388C14.0937 17.3413 15.492 18 16.9723 18C20.2965 18 23 14.6357 23 10.5C23 6.36428 20.2965 3 16.9723 3ZM3.68213 10.5C3.68213 6.73121 6.08095 3.66313 9.02774 3.66313C11.9745 3.66313 14.3734 6.729 14.3734 10.5C14.3734 11.2206 14.2847 11.9169 14.1232 12.569C14.0937 10.9885 13.3456 9.68877 12.1519 9.39699C10.5966 9.0168 8.86858 10.4956 8.30014 12.6927C8.03183 13.7339 8.05684 14.7838 8.37062 15.6503C8.65712 16.4439 9.15507 17.0053 9.79172 17.2639C9.54161 17.3103 9.28695 17.3347 9.03001 17.3347C6.07867 17.3369 3.68213 14.2688 3.68213 10.5ZM13.4297 15.6149C14.437 14.2732 15.0555 12.4761 15.0555 10.5C15.0555 8.52387 14.437 6.72679 13.4297 5.38506C14.4097 4.27542 15.6648 3.66313 16.9723 3.66313C19.9191 3.66313 22.3179 6.729 22.3179 10.5C22.3179 11.3112 22.2065 12.0893 22.0018 12.8121C22.0473 11.1233 21.2833 9.70424 20.0305 9.3992C18.4752 9.01901 16.7472 10.4978 16.1787 12.695C15.6467 14.7529 16.3197 16.7224 17.6862 17.275C17.452 17.3148 17.2133 17.3391 16.97 17.3391C15.6603 17.3369 14.4097 16.7268 13.4297 15.6149Z" fill="#454545"/>
              <line x1="5.27279" y1="2" x2="22" y2="18.7272" stroke="#454545" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span className="text-[#454545] text-sm font-medium">Private</span>
          </span>
        )}

        {/* Space name - clickable to go back to main treasury page */}
        {(isSubTreasury && parentSpaceName) || (spaceInfo?.parentSpace) ? (
          <>
            <h1
              onClick={() => {
                // Priority 1: Use API parentSpace info (most reliable)
                if (spaceInfo?.parentSpace?.namespace) {
                  navigate(`/treasury/${spaceInfo.parentSpace.namespace}`);
                } else if (parentSpaceInfo?.namespace) {
                  // Priority 2: Use navigation state parentSpaceInfo
                  navigate(`/treasury/${parentSpaceInfo.namespace}`);
                } else {
                  // Fallback: Browser back
                  navigate(-1);
                }
              }}
              className="[font-family:'Lato',Helvetica] font-normal text-off-black text-2xl tracking-[0] leading-[1.4] mb-0 cursor-pointer hover:text-gray-400 transition-colors duration-200"
            >
              {parentSpaceName || spaceInfo?.parentSpace?.name}
            </h1>
            <h2 className="[font-family:'Lato',Helvetica] font-normal text-gray-500 text-base tracking-[0] leading-[1.4] mb-1">{spaceName}</h2>
          </>
        ) : (
          <h1
            className="[font-family:'Lato',Helvetica] font-normal text-off-black text-2xl tracking-[0] leading-[1.4] mb-1"
          >
            {spaceName}
          </h1>
        )}

        {/* Treasure count and author info */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-gray-500">{treasureCount} treasures</span>
          {!!subscriberCount && subscriberCount > 0 && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-500">{subscriberCount} subscribers</span>
            </>
          )}
          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-500">By</span>
          <button
            onClick={onAuthorClick}
            className="inline-flex items-center gap-1.5 hover:opacity-70 transition-opacity cursor-pointer"
          >
            <img
              src={authorAvatar || profileDefaultAvatar}
              alt={authorName}
              className="w-4 h-4 rounded-full object-cover"
            />
            <span className="text-sm text-gray-500 hover:text-gray-700">{authorName}</span>
          </button>
        </div>

        {/* Description */}
        {spaceDescription && spaceDescription.trim() && (
          <p className="text-gray-700 text-sm leading-relaxed mb-1">{spaceDescription}</p>
        )}

        {/* Action buttons - always show below description */}
        <div className="flex items-center gap-3 mt-1.5">
          {/* Edit button */}
          {canEdit && (
            <button
              type="button"
              aria-label="Edit space"
              title="Edit"
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:opacity-70 transition-opacity"
              onClick={onEdit}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Organize button */}
          {canEdit && onOrganize && (
            <button
              type="button"
              aria-label="Organize"
              title="Organize"
              disabled={treasureCount === 0}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-opacity ${
                treasureCount === 0 ? 'bg-gray-50 opacity-40 cursor-not-allowed' :
                organizeMode ? 'bg-red/10' : 'bg-gray-100 hover:opacity-70'
              }`}
              onClick={treasureCount === 0 ? undefined : onOrganize}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={organizeMode ? '#f23a00' : '#686868'} strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={organizeMode ? '#f23a00' : '#686868'} strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={organizeMode ? '#f23a00' : '#686868'} strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5" stroke={organizeMode ? '#f23a00' : '#686868'} strokeWidth="2"/>
              </svg>
            </button>
          )}

          {/* Create sub-treasury button */}
          {canEdit && onCreateSubTreasury && (
            <button
              type="button"
              aria-label="Create sub-treasury"
              title="Create Sub-treasury"
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:opacity-70 transition-opacity"
              onClick={onCreateSubTreasury}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Import button */}
          {canEdit && onImportCSV && (
            <button
              type="button"
              aria-label="Import bookmarks"
              title="Import Bookmarks"
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:opacity-70 transition-opacity"
              onClick={onImportCSV}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Subscribe button (only for non-owners and not sub-spaces) - using unified SubscribeButton component */}
          {!isOwner && spaceId && !isSubTreasury && (
            <SubscribeButton
              spaceId={spaceId}
              spaceName={spaceName}
              spaceNamespace={spaceNamespace}
              size="medium"
              variant="default"
              subscriptionType="space"
              initialIsSubscribed={isFollowing}
              initialSubscriberCount={subscriberCount}
              onSubscriberCountLoaded={onSubscriberCountLoaded}
              onSubscriptionChange={onSubscriptionChange}
            />
          )}

          {/* Share button */}
          <div className="relative">
            <button
              type="button"
              aria-label="Share space"
              title="Share"
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
        </div>
      </div>
    </section>
  );
};

// Main Space Content Section
export const SpaceContentSection = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { category, namespace } = useParams<{ category?: string; namespace?: string }>();
  // Support both /space/:category and /treasury/:namespace routes
  const spaceIdentifier = namespace || category;

  // Detect if this is a sub-treasury page (passed via navigation state)
  const navState = location.state as {
    isSubTreasury?: boolean;
    parentSpaceName?: string;
    parentSpaceInfo?: { name: string; namespace?: string; id?: number };
    spaceData?: any;
  } | null;
  const isSubTreasury = navState?.isSubTreasury || false;
  const parentSpaceName = navState?.parentSpaceName || '';
  const parentSpaceInfo = navState?.parentSpaceInfo || null;

  const { user, getArticleLikeState, toggleLike } = useUser();
  const { showToast } = useToast();
  const { categories } = useCategory();

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spaceInfo, setSpaceInfo] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArticleCount, setTotalArticleCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false); // Track if we've loaded all articles
  const isLoadingMoreRef = useRef(false); // Ref to prevent race conditions in scroll handler
  const PAGE_SIZE = 20;

  // Edit space modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [displaySpaceName, setDisplaySpaceName] = useState("");
  const [spaceId, setSpaceId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false); // 跟踪图片上传状态

  // Collect Treasure Modal state
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<{ uuid: string; title: string; isLiked: boolean; likeCount: number } | null>(null);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Space delete confirmation state
  const [deleteSpaceConfirmOpen, setDeleteSpaceConfirmOpen] = useState(false);

  // Import CSV state
  const [showImportModal, setShowImportModal] = useState(false);

  // Sub-treasury state
  const [subTreasuries, setSubTreasuries] = useState<SpaceData[]>([]);
  const [showCreateSubTreasury, setShowCreateSubTreasury] = useState(false);

  // Loading states for operations
  const [operationLoading, setOperationLoading] = useState<{
    createSubSpace: boolean;
    editSpace: boolean;
    deleteSpace: boolean;
    copyArticles: boolean;
    deleteArticle: boolean;
    loadingSubSpaces: boolean;
  }>({
    createSubSpace: false,
    editSpace: false,
    deleteSpace: false,
    copyArticles: false,
    deleteArticle: false,
    loadingSubSpaces: false,
  });

  // Organize mode state
  const [organizeMode, setOrganizeMode] = useState(false);
  const [selectedArticleIds, setSelectedArticleIds] = useState<Set<string>>(new Set());
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showOrganizeSubTreasury, setShowOrganizeSubTreasury] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showMoveOutConfirm, setShowMoveOutConfirm] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bindableSpaces, setBindableSpaces] = useState<any[]>([]);
  const [selectedMoveTarget, setSelectedMoveTarget] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [loadingMoveSpaces, setLoadingMoveSpaces] = useState(false);


  // Fetch space data
  useEffect(() => {
    const fetchSpaceData = async () => {
      if (!spaceIdentifier) {
        setError('Invalid space');
        setLoading(false);
        return;
      }

      const decodedIdentifier = decodeURIComponent(spaceIdentifier);

      // Create a unique cache key for this space
      const cacheKey = namespace ? `namespace:${decodedIdentifier}` : `category:${decodedIdentifier}`;

      // Check module-level cache to prevent duplicate fetches (survives StrictMode remounts)
      const now = Date.now();
      const cached = spaceFetchCache.get(cacheKey);

      // If we have cached data and it's still valid, use it immediately
      if (cached && cached.data && (now - cached.timestamp < SPACE_CACHE_TTL)) {
        setSpaceInfo(cached.data.spaceInfo);
        setArticles(cached.data.articles);
        setTotalArticleCount(cached.data.totalCount);
        if (cached.data.spaceId) setSpaceId(cached.data.spaceId);
        if (cached.data.isFollowing !== undefined) setIsFollowing(cached.data.isFollowing);
        if (cached.data.followerCount !== undefined) setSubscriberCount(cached.data.followerCount);
        setLoading(false);
        return;
      }

      // If fetch is already in progress, skip to prevent duplicate calls
      if (cached && cached.inProgress) {
        return;
      }

      // Mark as in progress immediately to prevent race conditions
      spaceFetchCache.set(cacheKey, { timestamp: now, inProgress: true });

      try {
        setLoading(true);
        setError(null);

        // Check if this is a namespace route (from /treasury/:namespace)
        const isNamespaceRoute = !!namespace;

        let articlesArray: any[] = [];
        let fetchedSpaceInfo: any = null;
        let fetchedSpaceId: number | null = null;
        let fetchedTotalCount = 0;

        if (isNamespaceRoute) {
          // Check if identifier is a numeric ID (fallback for spaces without namespace)
          const isNumericId = /^\d+$/.test(decodedIdentifier);
          const navigationState = location.state as { spaceData?: any } | null;

          if (isNumericId && navigationState?.spaceData) {
            // Numeric ID with space data passed via navigation state
            const space = navigationState.spaceData;
            const numericSpaceId = parseInt(decodedIdentifier, 10);

            fetchedSpaceInfo = {
              name: space.name || 'Treasury',
              authorName: space.ownerInfo?.username || space.userInfo?.username || user?.username || 'Anonymous',
              authorAvatar: space.ownerInfo?.faceUrl || space.userInfo?.faceUrl || user?.faceUrl || profileDefaultAvatar,
              authorNamespace: space.ownerInfo?.namespace || space.userInfo?.namespace || user?.namespace,
              spaceType: space.spaceType,
              description: space.description,
              coverUrl: space.coverUrl,
              faceUrl: space.faceUrl,
              visibility: space.visibility,
            };

            fetchedSpaceId = numericSpaceId;
            fetchedTotalCount = space.articleCount || 0;

            // Fetch articles using spaceId
            const articlesResponse = await AuthService.getSpaceArticles(numericSpaceId, 1, PAGE_SIZE);
            if (articlesResponse?.data && Array.isArray(articlesResponse.data)) {
              articlesArray = articlesResponse.data;
            } else if (articlesResponse?.data?.data && Array.isArray(articlesResponse.data.data)) {
              articlesArray = articlesResponse.data.data;
            }

            setSpaceInfo(fetchedSpaceInfo);
            setSpaceId(numericSpaceId);
            setTotalArticleCount(fetchedTotalCount);
            setArticles(articlesArray);
            setCurrentPage(1);
            setReachedEnd(false);

            spaceFetchCache.set(cacheKey, {
              timestamp: Date.now(),
              inProgress: false,
              data: { spaceInfo: fetchedSpaceInfo, articles: articlesArray, totalCount: fetchedTotalCount, spaceId: numericSpaceId, isFollowing: false, followerCount: 0 }
            });
          } else if (isNumericId) {
            // Numeric ID without navigation state — try fetching articles directly
            const numericSpaceId = parseInt(decodedIdentifier, 10);

            fetchedSpaceInfo = {
              name: 'Treasury',
              authorName: user?.username || 'Anonymous',
              authorAvatar: user?.faceUrl || profileDefaultAvatar,
              authorNamespace: user?.namespace,
            };

            fetchedSpaceId = numericSpaceId;

            const articlesResponse = await AuthService.getSpaceArticles(numericSpaceId, 1, PAGE_SIZE);
            if (articlesResponse?.data && Array.isArray(articlesResponse.data)) {
              articlesArray = articlesResponse.data;
            } else if (articlesResponse?.data?.data && Array.isArray(articlesResponse.data.data)) {
              articlesArray = articlesResponse.data.data;
            }

            setSpaceInfo(fetchedSpaceInfo);
            setSpaceId(numericSpaceId);
            setTotalArticleCount(articlesArray.length);
            setArticles(articlesArray);
            setCurrentPage(1);
            setReachedEnd(articlesArray.length < PAGE_SIZE);

            spaceFetchCache.set(cacheKey, {
              timestamp: Date.now(),
              inProgress: false,
              data: { spaceInfo: fetchedSpaceInfo, articles: articlesArray, totalCount: articlesArray.length, spaceId: numericSpaceId, isFollowing: false, followerCount: 0 }
            });
          } else {

          // Fetch space info by namespace using getSpaceInfo API
          const spaceInfoResponse = await AuthService.getSpaceInfo(decodedIdentifier);

          // Check for 2104 status code in response
          if (spaceInfoResponse?.status === 2104) {
            setError('2104 - You do not have access permission');
            setLoading(false);
            return;
          }

          // Extract space info from response - faceUrl is now at root level
          const spaceData = spaceInfoResponse?.data || spaceInfoResponse;

          // Get author username for display name with comprehensive fallback chain
          // Note: Do NOT fall back to logged-in user's username - use API data only
          // Display 'Anonymous' when username is empty instead of namespace
          const authorUsername = spaceData?.userInfo?.username
            || spaceData?.ownerInfo?.username
            || spaceData?.authorInfo?.username
            || spaceData?.user?.username
            || spaceData?.author?.username
            || spaceData?.creator?.username
            || spaceData?.ownerName
            || spaceData?.userName
            || spaceData?.username
            || 'Anonymous';

          // Determine display name based on spaceType (same logic as Treasury list)
          // spaceType 1 = Treasury, spaceType 2 = Curations
          let displayName = spaceData?.name || decodedIdentifier;
          if (spaceData?.spaceType === 1) {
            displayName = `${authorUsername}'s Treasury`;
          } else if (spaceData?.spaceType === 2) {
            displayName = `${authorUsername}'s Curations`;
          }

          // Build space info object
          // Note: Do NOT fall back to logged-in user's avatar/namespace - always show the space creator's info
          fetchedSpaceInfo = {
            name: displayName,
            authorName: authorUsername,
            authorAvatar: spaceData?.userInfo?.faceUrl || profileDefaultAvatar,
            authorNamespace: spaceData?.userInfo?.namespace,
            spaceType: spaceData?.spaceType,
            description: spaceData?.description, // Add space description
            coverUrl: spaceData?.coverUrl, // Add space cover image
            faceUrl: spaceInfoResponse?.faceUrl || spaceData?.faceUrl, // Get faceUrl from root level or fallback to nested
            visibility: spaceData?.visibility, // Add visibility for private pill
            pid: spaceData?.pid, // Parent ID from API
            parentSpace: spaceData?.parentSpace, // Parent space info from API
          };

          // Store spaceId for later use (edit functionality)
          fetchedSpaceId = spaceData?.id || null;

          // Store the total article count from space info
          fetchedTotalCount = spaceData?.articleCount || 0;

          // Set follow status from space data
          const followStatus = spaceData?.isFollowed || spaceData?.followed || false;
          setIsFollowing(followStatus);
          // Set follower count from space data
          const followerCount = spaceData?.followerCount || 0;
          setSubscriberCount(followerCount);

          // Fetch articles using spaceId from the space info
          if (fetchedSpaceId) {
            const articlesResponse = await AuthService.getSpaceArticles(fetchedSpaceId, 1, PAGE_SIZE);

            // Extract articles from paginated response
            if (articlesResponse?.data && Array.isArray(articlesResponse.data)) {
              articlesArray = articlesResponse.data;
            } else if (articlesResponse?.data?.data && Array.isArray(articlesResponse.data.data)) {
              articlesArray = articlesResponse.data.data;
            }
          }

          // Set all states
          setSpaceInfo(fetchedSpaceInfo);
          if (fetchedSpaceId) setSpaceId(fetchedSpaceId);
          setTotalArticleCount(fetchedTotalCount);
          setArticles(articlesArray);
          setCurrentPage(1);
          setReachedEnd(false); // Reset reached end state for new space

          // Store in cache for reuse
          spaceFetchCache.set(cacheKey, {
            timestamp: Date.now(),
            inProgress: false,
            data: { spaceInfo: fetchedSpaceInfo, articles: articlesArray, totalCount: fetchedTotalCount, spaceId: fetchedSpaceId, isFollowing: followStatus, followerCount: followerCount }
          });
          }
        } else {
          // Old category-based route (for backwards compatibility)
          setSpaceInfo({
            name: decodedIdentifier,
            authorName: user?.username || 'Anonymous',
            authorAvatar: user?.faceUrl || profileDefaultAvatar,
            authorNamespace: user?.namespace,
            description: undefined, // No description available for old category routes
            coverUrl: undefined, // No cover available for old category routes
            faceUrl: undefined, // No face URL available for old category routes
          });

          // For old routes, assume not following (since no API to check)
          setIsFollowing(false);

          // Fetch articles for this category/space
          const userId = user?.id;
          if (userId) {
            // Check if this is a special space (treasury or curations)
            const isTreasurySpace = decodedIdentifier.endsWith("'s treasury");
            const isCurationsSpace = decodedIdentifier.endsWith("'s curations");

            if (isCurationsSpace) {
              // Fetch created/curated articles for curations space
              const curatedResponse = await AuthService.getMyCreatedArticles(1, 100, userId);

              if (curatedResponse?.data?.data && Array.isArray(curatedResponse.data.data)) {
                articlesArray = curatedResponse.data.data;
              } else if (curatedResponse?.data && Array.isArray(curatedResponse.data)) {
                articlesArray = curatedResponse.data;
              } else if (Array.isArray(curatedResponse)) {
                articlesArray = curatedResponse;
              }

              setArticles(articlesArray);
            } else if (isTreasurySpace) {
              // Fetch liked/treasured articles for treasury space
              const likedResponse = await AuthService.getMyLikedArticlesCorrect(1, 100, userId);

              if (likedResponse?.data?.data && Array.isArray(likedResponse.data.data)) {
                articlesArray = likedResponse.data.data;
              } else if (likedResponse?.data && Array.isArray(likedResponse.data)) {
                articlesArray = likedResponse.data;
              } else if (Array.isArray(likedResponse)) {
                articlesArray = likedResponse;
              }

              setArticles(articlesArray);
            } else {
              // Regular category-based space - fetch liked articles and filter
              const likedResponse = await AuthService.getMyLikedArticlesCorrect(1, 100, userId);

              if (likedResponse?.data?.data && Array.isArray(likedResponse.data.data)) {
                articlesArray = likedResponse.data.data;
              } else if (likedResponse?.data && Array.isArray(likedResponse.data)) {
                articlesArray = likedResponse.data;
              } else if (Array.isArray(likedResponse)) {
                articlesArray = likedResponse;
              }

              // Filter articles by category
              const filteredArticles = articlesArray.filter(
                (article: any) => article.categoryInfo?.name === decodedIdentifier
              );

              setArticles(filteredArticles);
            }
          }
        }

      } catch (err: any) {
        console.error('[Space] Failed to fetch space data:', err);

        // Check if this is a 2104 no access permission error
        let errorMessage = 'Failed to load space data';
        if (err?.status === 2104 || err?.response?.status === 2104 || err?.response?.data?.status === 2104) {
          errorMessage = '2104 - You do not have access permission';
        } else if (err?.message?.includes('2104')) {
          errorMessage = '2104 - You do not have access permission';
        }

        setError(errorMessage);
        showToast('Failed to fetch space data, please try again', 'error');
        // Clear cache on error so user can retry
        spaceFetchCache.delete(cacheKey);
      } finally {
        setLoading(false);
        // Mark as no longer in progress (but keep cached data if successful)
        const existingCache = spaceFetchCache.get(cacheKey);
        if (existingCache && existingCache.inProgress) {
          spaceFetchCache.set(cacheKey, { ...existingCache, inProgress: false });
        }
      }
    };

    fetchSpaceData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceIdentifier, namespace, user?.id, user?.username, user?.faceUrl, user?.namespace]);

  // Load existing sub-treasuries from user's spaces
  useEffect(() => {
    const loadSubTreasuries = async () => {
      if (!user?.id || !spaceId) return;

      setOperationLoading(prev => ({ ...prev, loadingSubSpaces: true }));

      try {
        console.log('🔍 Loading sub-treasuries for space:', spaceId, 'user:', user.id);
        // Call pageMySpaces API with pid parameter to get sub-spaces
        const response = await AuthService.getMySpaces(user.id, 1, 100, spaceId);
        console.log('🔍 Raw API response:', response);

        const subSpaces = response?.data?.data || response?.data || response || [];
        console.log('🔍 Extracted sub-treasuries:', subSpaces);
        console.log('🔍 Sub-treasuries count:', Array.isArray(subSpaces) ? subSpaces.length : 'not array');

        setSubTreasuries(Array.isArray(subSpaces) ? subSpaces : []);
      } catch (error) {
        console.error('🔍 Failed to load sub-treasuries:', error);
        setSubTreasuries([]); // Reset to empty array on error
      } finally {
        setOperationLoading(prev => ({ ...prev, loadingSubSpaces: false }));
      }
    };

    loadSubTreasuries();
  }, [user?.id, spaceId, displaySpaceName]);

  // Click outside to exit organize mode
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only handle clicks when organize mode is active
      if (!organizeMode) return;

      // Get the clicked element
      const target = event.target as Element;

      // Don't exit if clicking on organize controls, modals, article cards, or interactive elements
      if (
        target.closest('.organize-controls') || // Organize action buttons
        target.closest('[role="dialog"]') ||    // Modals
        target.closest('.article-card') ||      // Article cards (for selection)
        target.closest('.space-info-section') || // Space header area
        target.closest('button') ||             // Any button
        target.closest('.dropdown') ||          // Dropdowns
        target.closest('input') ||              // Form inputs
        target.closest('textarea') ||           // Form textareas
        target.closest('select')                // Form selects
      ) {
        return;
      }

      console.log('📋 Clicked outside organize area - exiting organize mode');
      setOrganizeMode(false);
      setSelectedArticleIds(new Set());
    };

    // Add event listener when organize mode is active
    if (organizeMode) {
      document.addEventListener('mousedown', handleClickOutside);
      console.log('📋 Added click-outside listener for organize mode');
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (organizeMode) {
        console.log('📋 Removed click-outside listener for organize mode');
      }
    };
  }, [organizeMode]);

  // Sub-treasuries are managed via local state + basic API loading
  // Full parent-child relationship API support is still pending

  // Transform article to card format
  const transformArticleToCard = (article: any): ArticleData => {
    // Extract website hostname from targetUrl if not already provided
    let website = article.website;
    if (!website && article.targetUrl) {
      try {
        website = new URL(article.targetUrl).hostname.replace('www.', '');
      } catch {
        // Invalid URL, leave website undefined
      }
    }

    const transformedArticle = {
      id: article.uuid,
      uuid: article.uuid,
      numericId: article.id, // 保存数字ID，用于移除接口
      title: article.title,
      description: article.content,
      coverImage: article.coverUrl || '', // No placeholder - empty if no cover
      category: article.categoryInfo?.name || 'General',
      categoryColor: article.categoryInfo?.color || '#666666',
      userName: article.authorInfo?.username || 'Anonymous',
      userAvatar: article.authorInfo?.faceUrl || profileDefaultAvatar,
      userId: article.authorInfo?.id,
      userNamespace: article.authorInfo?.namespace,
      date: (article.createAt || article.publishAt) ? new Date((article.createAt || article.publishAt) * 1000).toISOString() : '',
      treasureCount: article.likeCount || 0,
      visitCount: article.viewCount || 0,
      commentCount: article.commentCount || 0,
      isLiked: article.isLiked || false,
      targetUrl: article.targetUrl,
      website,
      isPaymentRequired: article.targetUrlIsLocked,
      paymentPrice: article.priceInfo?.price?.toString(),
      // Privacy field - article visibility (0: public, 1: private, 2: unlisted)
      visibility: article.visibility
    };

    return transformedArticle;
  };

  // Handle like/unlike - opens the collect modal
  const handleLike = async (articleId: string, currentIsLiked: boolean, currentLikeCount: number) => {
    if (!user) {
      showToast('Please log in to treasure this content', 'error', {
        action: {
          label: 'Login',
          onClick: () => navigate('/login')
        }
      });
      return;
    }

    // Find the article and open the collect modal
    const article = articles.find(a => a.uuid === articleId);
    if (article) {
      setSelectedArticle({
        uuid: articleId,
        title: article.title,
        isLiked: currentIsLiked,
        likeCount: currentLikeCount
      });
      setCollectModalOpen(true);
    }
  };

  // Handle successful collection - update local state
  const handleCollectSuccess = () => {
    if (!selectedArticle) return;

    // Update like state locally
    const newLikeCount = selectedArticle.likeCount + 1;
    toggleLike(selectedArticle.uuid, false, selectedArticle.likeCount);

    // Update selectedArticle state to reflect the change
    setSelectedArticle(prev => prev ? { ...prev, isLiked: true, likeCount: newLikeCount } : null);
  };

  // Enhanced callback that handles article addition to current space
  const handleSaveComplete = async (isCollected: boolean, collectionCount: number) => {
    console.log('🎯 handleSaveComplete called with:', {
      isCollected,
      collectionCount,
      selectedArticle: selectedArticle?.uuid,
      currentSpaceId: spaceId,
      spaceName
    });

    if (!selectedArticle) {
      console.log('🎯 No selectedArticle, exiting handleSaveComplete');
      return;
    }

    console.log('🎯 Collection completed:', {
      articleId: selectedArticle.uuid,
      isCollected,
      collectionCount,
      currentSpaceId: spaceId,
      spaceName
    });

    // Update like state locally
    toggleLike(selectedArticle.uuid, false, selectedArticle.likeCount);
    setSelectedArticle(prev => prev ? {
      ...prev,
      isLiked: isCollected,
      likeCount: collectionCount
    } : null);

    // If article was collected and we're in a space, check if it was collected to current space
    if (isCollected && spaceId) {
      try {
        console.log('🔍 Checking if article was collected to current space...');

        // Get the article's current bindings to check if it includes current space
        const spaceBindings = await AuthService.getSpacesByArticleId(selectedArticle.numericId || 0);
        const currentSpaceBinding = spaceBindings?.find((binding: any) =>
          binding.id === parseInt(spaceId) || binding.spaceId === parseInt(spaceId)
        );

        if (currentSpaceBinding) {
          console.log('🎉 Article was collected to current space - adding to article list!');

          // Add article to the beginning of the articles list
          setArticles(prev => [selectedArticle, ...prev]);
          setTotalArticleCount(prev => prev + 1);

          showToast(`Article collected to "${spaceName}"!`, 'success');
        }
      } catch (error) {
        console.error('🔍 Error checking space bindings:', error);
      }
    }
  };

  // Handle user click
  const handleUserClick = (userId: number | undefined, userNamespace?: string) => {
    if (userNamespace) {
      navigate(`/u/${userNamespace}`);
    } else if (userId) {
      navigate(`/user/${userId}/treasury`);
    }
  };

  // Handle subscribe
  const handleFollow = async () => {
    if (!user) {
      showToast('Please login to subscribe', 'error');
      return;
    }
    if (!spaceId) {
      showToast('Space ID not available', 'error');
      return;
    }
    try {
      // Get user's email for subscription
      const userInfo = await AuthService.getUserInfo();

      if (!userInfo.email || userInfo.email.trim() === '') {
        showToast('Please set your email in profile to subscribe to spaces', 'error');
        return;
      }

      // Use new email subscription API for spaces
      const success = await AuthService.emailSubscribe({
        email: userInfo.email,
        targetId: spaceId,
        targetType: 2 // 2 for space
      });

      if (success) {
        setIsFollowing(true);
        showToast(`Successfully subscribed to space! Notifications will be sent to ${userInfo.email}`, 'success');

        // Update cache with new subscription status
        const cacheKey = namespace ? `namespace:${decodeURIComponent(spaceIdentifier || '')}` : `category:${decodeURIComponent(spaceIdentifier || '')}`;
        const cached = spaceFetchCache.get(cacheKey);
        if (cached && cached.data) {
          spaceFetchCache.set(cacheKey, {
            ...cached,
            data: { ...cached.data, isFollowing: true }
          });
        }
      } else {
        showToast('Failed to subscribe to space', 'error');
      }
    } catch (err) {
      console.error('Failed to subscribe to space:', err);
      showToast('Failed to subscribe to space', 'error');
    }
  };

  // Handle unsubscribe
  const handleUnfollow = async () => {
    if (!user) {
      showToast('Please login to unsubscribe', 'error');
      return;
    }
    if (!spaceId) {
      showToast('Space ID not available', 'error');
      return;
    }
    try {
      // TODO: Implement unsubscribe API when backend provides it
      // For now, we'll use the same emailSubscribe API if it toggles
      const userInfo = await AuthService.getUserInfo();

      if (!userInfo.email || userInfo.email.trim() === '') {
        showToast('Unable to unsubscribe - email not found', 'error');
        return;
      }

      // Try using the same API - if it toggles, this should unsubscribe
      const success = await AuthService.emailSubscribe({
        email: userInfo.email,
        targetId: spaceId,
        targetType: 2 // 2 for space
      });

      if (success) {
        setIsFollowing(false);
        showToast('Unsubscribed from space', 'success');

        // Update cache with new subscription status
        const cacheKey = namespace ? `namespace:${decodeURIComponent(spaceIdentifier || '')}` : `category:${decodeURIComponent(spaceIdentifier || '')}`;
        const cached = spaceFetchCache.get(cacheKey);
        if (cached && cached.data) {
          spaceFetchCache.set(cacheKey, {
            ...cached,
            data: { ...cached.data, isFollowing: false }
          });
        }
      } else {
        showToast('Failed to unsubscribe from space', 'error');
      }
    } catch (err) {
      console.error('Failed to unsubscribe from space:', err);
      showToast('Failed to unsubscribe from space', 'error');
    }
  };

  // Handle share
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard', 'success');
  };

  // Check if there are more articles to load
  const hasMoreArticles = !reachedEnd && articles.length < totalArticleCount;

  // Handle load more articles
  const handleLoadMore = useCallback(async () => {
    // Use ref to prevent multiple simultaneous calls
    if (!spaceId || isLoadingMoreRef.current || !hasMoreArticles) return;

    isLoadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const articlesResponse = await AuthService.getSpaceArticles(spaceId, nextPage, PAGE_SIZE);

      let newArticles: any[] = [];
      if (articlesResponse?.data && Array.isArray(articlesResponse.data)) {
        newArticles = articlesResponse.data;
      } else if (articlesResponse?.data?.data && Array.isArray(articlesResponse.data.data)) {
        newArticles = articlesResponse.data.data;
      }

      if (newArticles.length > 0) {
        setArticles(prev => [...prev, ...newArticles]);
        setCurrentPage(nextPage);
      } else {
        // No more articles returned - mark as reached end
        setReachedEnd(true);
      }

      // Also check if we got less than a full page
      if (newArticles.length < PAGE_SIZE) {
        setReachedEnd(true);
      }
    } catch (err) {
      console.error('Failed to load more articles:', err);
      showToast('Failed to load more articles', 'error');
    } finally {
      setLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [spaceId, hasMoreArticles, currentPage, showToast]);

  // Auto-load more on scroll (same as Discovery page)
  useEffect(() => {
    const handleScroll = () => {
      // Skip if no more articles or already loading
      if (!hasMoreArticles || isLoadingMoreRef.current) {
        return;
      }

      // Check if scrolled near the bottom of the page
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrolledToBottom = scrollTop + windowHeight >= documentHeight - 1000; // Trigger 1000px early

      if (scrolledToBottom && spaceId) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMoreArticles, spaceId, handleLoadMore]);

  // Handle author click - navigate to treasury page
  const handleAuthorClick = () => {
    if (spaceInfo?.authorNamespace) {
      navigate(`/user/${spaceInfo.authorNamespace}/treasury`);
    }
  };

  // Handle edit space
  // 🔍 SEARCH: space-edit-restrictions-logic-rapid
  // Use rapid development system for space permissions (2-second modification)
  const spaceSetup = spaceShortcuts.setupSpaceEdit(spaceInfo, user?.id);
  const { canEditName: canEditSpaceName, canDelete: canDeleteSpace } = spaceSetup.permissions;
  const spaceHandlers = eventHandlers.createSpaceEditHandler(spaceInfo, 'SpaceContentSection');

  const handleEditSpace = () => {
    setShowEditModal(true);

    // 🔍 SEARCH: dev-log-space-edit-modal
    devLog.userAction('open-space-edit-modal', {
      spaceType: spaceInfo?.spaceType,
      canEditName: canEditSpaceName,
      canDelete: canDeleteSpace
    }, {
      component: 'SpaceContentSection',
      action: 'edit-modal-open'
    });
  };


  // Handle delete space
  const handleDeleteSpace = async () => {
    if (!spaceId) {
      showToast('Space ID not available', 'error');
      return;
    }

    setOperationLoading(prev => ({ ...prev, deleteSpace: true }));

    try {
      console.log('🗑️ Delete space - Current spaceInfo:', spaceInfo);
      console.log('🗑️ Delete space - isSubTreasury:', isSubTreasury);
      console.log('🗑️ Delete space - parentSpaceName:', parentSpaceName);
      console.log('🗑️ Delete space - navState:', navState);

      await AuthService.deleteSpace(spaceId);

      if (isSubTreasury) {
        showToast(`Sub-treasury "${spaceInfo?.name || 'Treasury'}" deleted successfully`, 'success');
      } else {
        showToast(`Treasury "${spaceInfo?.name || 'Treasury'}" deleted successfully`, 'success');
      }

      setDeleteSpaceConfirmOpen(false);

      // Check if this is a sub-treasury deletion
      // Method 1: Check spaceInfo.pid (if API returns it)
      // Method 2: Check isSubTreasury flag from navigation state (more reliable)
      // Simple navigation after deletion
      if (isSubTreasury) {
        console.log('🔄 This is a sub-treasury, navigating back to previous page');
        // For sub-treasury deletion, simply go back to the previous page
        navigate(-1);
      } else {
        console.log('🏠 This is a main space, going to my-treasury');
        // For main spaces, go to my-treasury
        navigate('/my-treasury');
      }
    } catch (err) {
      console.error('Failed to delete space:', err);
      const message = ErrorHandler.handleApiError(err, {
        component: 'SpaceContentSection',
        action: 'delete-space',
        endpoint: API_ENDPOINTS.SPACE.DELETE
      });
      showToast(message, 'error');
    } finally {
      setOperationLoading(prev => ({ ...prev, deleteSpace: false }));
    }
  };

  // Handle move out to parent space
  const handleMoveOut = async () => {
    if (!parentSpaceInfo?.id && !parentSpaceInfo?.namespace) {
      showToast('Parent space information not available', 'error');
      setShowMoveOutConfirm(false);
      return;
    }

    if (selectedArticleIds.size === 0) {
      showToast('Please select articles to move out', 'error');
      setShowMoveOutConfirm(false);
      return;
    }

    setOperationLoading(prev => ({ ...prev, copyArticles: true }));

    try {
      const selectedUuids = Array.from(selectedArticleIds);
      console.log(`📤 Moving out ${selectedUuids.length} articles from sub-space back to parent space`);

      // Use dedicated Move API for Move Out
      const parentSpaceId = parentSpaceInfo.id;

      // Collect article IDs for batch move
      const articleIds: number[] = [];
      for (const uuid of selectedUuids) {
        const article = articles.find(a => a.uuid === uuid);
        const numericId = article?.numericId || article?.id;
        if (numericId) {
          articleIds.push(numericId);
        } else {
          console.error(`📤 No numeric ID found for article: ${uuid}`);
        }
      }

      let successCount = 0;
      if (articleIds.length > 0 && spaceId) {
        try {
          // Use dedicated Move API for batch operation
          await moveArticlesToSpace({
            articleIds,
            fromSpaceId: parseInt(spaceId),
            toSpaceId: parentSpaceId
          });
          successCount = articleIds.length;
          console.log(`📤 Successfully moved out ${successCount} articles using dedicated Move API`);
        } catch (error) {
          console.error('📤 Failed to move out articles:', error);
        }
      }

      // Update local state - only remove successfully moved articles
      const movedUuids = selectedUuids.slice(0, successCount);
      setArticles(prev => prev.filter(article => !movedUuids.includes(article.uuid)));
      setTotalArticleCount(prev => Math.max(0, prev - successCount));
      setSelectedArticleIds(new Set());

      // Show appropriate feedback
      if (successCount === selectedUuids.length && successCount > 0) {
        showToast(`Moved ${successCount} article${successCount !== 1 ? 's' : ''} to parent space`, 'success');
      } else if (successCount > 0) {
        showToast(`Moved ${successCount} of ${selectedUuids.length} articles to parent space (${selectedUuids.length - successCount} failed)`, 'warning');
      } else {
        showToast(`Failed to move articles to parent space`, 'error');
      }

      setShowMoveOutConfirm(false);
      setOrganizeMode(false); // Exit organize mode after successful move

      // Check if sub-space is now empty after successful moves
      const remainingArticleCount = articles.length - successCount;
      if (remainingArticleCount === 0) {
        console.log('📤 Sub-space is now empty, navigating to parent space');

        // Get correct parent space namespace dynamically
        try {
          if (parentSpaceInfo?.id) {
            const userSpaces = await AuthService.getMySpaces(user?.id || 0, 1, 100);
            const spaces = userSpaces?.data?.data || userSpaces?.data || userSpaces || [];
            const correctParentSpace = spaces.find((space: any) => space.id === parentSpaceInfo.id);

            if (correctParentSpace?.namespace) {
              console.log(`📤 Navigating to correct parent space: ${correctParentSpace.namespace}`);
              navigate(`/treasury/${correctParentSpace.namespace}`, {
                state: {
                  fromSubSpace: true,
                  movedOutCount: successCount,
                  subSpaceEmptied: true
                }
              });
            } else {
              console.log('📤 Could not find correct parent namespace, staying in current page');
            }
          }
        } catch (error) {
          console.error('📤 Error getting correct parent namespace:', error);
        }
      } else {
        console.log(`📤 Sub-space still has ${remainingArticleCount} articles, staying in current space`);
      }
    } catch (error) {
      console.error('📤 Failed to move out articles:', error);
      const message = ErrorHandler.handleApiError(error, {
        component: 'SpaceContentSection',
        action: 'move-out-articles',
        endpoint: 'moveArticlesToSpace'
      });
      showToast(message, 'error');
    } finally {
      setOperationLoading(prev => ({ ...prev, copyArticles: false }));
    }
  };

  // Check if current user is the owner of this space
  const isOwner = !!user && spaceInfo?.authorNamespace === user?.namespace;

  // Check if this is a curations space
  // spaceType 2 = Curations, or fallback to category name check for old routes
  const isCurationsSpace = spaceInfo?.spaceType === 2 ||
    (category ? decodeURIComponent(category).endsWith("'s curations") : false);

  // Track hovered card ID
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Handle edit article
  const handleEditArticle = (articleId: string) => {
    navigate(`/curate?edit=${articleId}`);
  };

  // Handle delete article - shows confirmation modal
  const handleDeleteArticle = (articleId: string) => {
    setArticleToDelete(articleId);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete/remove article based on space type
  const confirmDeleteArticle = async () => {
    if (!articleToDelete) return;

    setOperationLoading(prev => ({ ...prev, deleteArticle: true }));

    try {
      // Find the article to get its details for better feedback
      const article = articles.find(a => a.uuid === articleToDelete);
      const articleTitle = article?.title || 'Article';

      if (isCurationsSpace) {
        // In Curations space: Delete the article permanently
        await AuthService.deleteArticle(articleToDelete);
        showToast(`Article "${articleTitle}" deleted permanently`, 'success');
      } else {
        // In other spaces: Remove from space using unbind API
        if (!spaceId) {
          showToast('Space ID not available', 'error');
          return;
        }

        if (!article) {
          showToast('Article not found', 'error');
          return;
        }

        // 尝试获取数字 ID，优先使用 numericId，其次使用 id
        const articleNumericId = article.numericId || article.id;

        if (!articleNumericId) {
          showToast('Article ID not available', 'error');
          return;
        }

        await removeArticleFromSpace({
          articleId: articleNumericId,
          spaceId: spaceId
        });

        if (isSubTreasury) {
          showToast(`Article "${articleTitle}" removed from sub-treasury`, 'success');
        } else {
          showToast(`Article "${articleTitle}" removed from treasury`, 'success');
        }
      }

      // Remove the article from local state
      setArticles(prev => prev.filter(a => a.uuid !== articleToDelete));
      setTotalArticleCount(prev => Math.max(0, prev - 1));
      setDeleteConfirmOpen(false);
      setArticleToDelete(null);
    } catch (err) {
      console.error('Failed to delete article:', err);
      const message = ErrorHandler.handleApiError(err, {
        component: 'SpaceContentSection',
        action: 'delete-article',
        endpoint: isCurationsSpace ? API_ENDPOINTS.ARTICLE.DELETE : 'removeArticleFromSpace'
      });
      showToast(message, 'error');
    } finally {
      setOperationLoading(prev => ({ ...prev, deleteArticle: false }));
    }
  };

  // Render article card
  const renderCard = (article: any) => {
    const card = transformArticleToCard(article);
    const articleLikeState = getArticleLikeState(card.id, card.isLiked, typeof card.treasureCount === 'string' ? parseInt(card.treasureCount) || 0 : card.treasureCount);

    const articleData = {
      ...card,
      isLiked: articleLikeState.isLiked,
      treasureCount: articleLikeState.likeCount
    };

    // Check if current user is the author of this article
    const isArticleAuthor = !!user && (article.authorInfo?.id === user.id || article.authorInfo?.namespace === user.namespace);

    // Show edit/delete buttons for articles created by the current user or space owner
    const canEditArticle = isArticleAuthor;
    const canDeleteArticle = isArticleAuthor || isOwner; // Space owners can also delete/remove articles

    return (
      <ArticleCard
        key={card.id}
        article={articleData}
        layout="discovery"
        actions={{
          showTreasure: !organizeMode,
          showVisits: !organizeMode,
          showEdit: !organizeMode && canEditArticle,
          showDelete: !organizeMode && canDeleteArticle
        }}
        isHovered={hoveredCardId === card.id}
        onLike={organizeMode ? undefined : handleLike}
        onUserClick={organizeMode ? undefined : handleUserClick}
        onEdit={!organizeMode && canEditArticle ? handleEditArticle : undefined}
        onDelete={!organizeMode && canDeleteArticle ? handleDeleteArticle : undefined}
        onMouseEnter={() => setHoveredCardId(card.id)}
        onMouseLeave={() => setHoveredCardId(null)}
        className={organizeMode ? 'border-2 border-gray-300 rounded-xl p-[2px]' : ''}
        isSelectable={organizeMode}
        isSelected={selectedArticleIds.has(card.id)}
        onSelect={(articleId) => {
          setSelectedArticleIds(prev => {
            const next = new Set(prev);
            if (next.has(articleId)) {
              next.delete(articleId);
            } else {
              next.add(articleId);
            }
            return next;
          });
        }}
      />
    );
  };

  if (loading) {
    return (
      <main className="flex flex-col items-start gap-5 px-4 lg:px-2.5 pt-0 pb-[30px] relative min-h-screen">
        <SEO />
        <div className="flex items-center justify-center w-full h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </main>
    );
  }

  // Check for 2104 no access permission error
  const isNoAccessPermission = error && (error.includes('2104') || error.includes('You do not have access permission') || error.includes('无权限') || error.includes('私享'));

  if (error) {
    if (isNoAccessPermission) {
      return (
        <main className="flex flex-col items-start gap-5 px-4 lg:px-2.5 pt-0 pb-[30px] relative min-h-screen">
          <NoAccessPermission
            message="该空间为作者私享内容，仅作者本人可查看"
            onBackToHome={() => navigate('/my-treasury')}
          />
        </main>
      );
    }

    return (
      <main className="flex flex-col items-start gap-5 px-4 lg:px-2.5 pt-0 pb-[30px] relative min-h-screen">
        <SEO />
        <div className="flex flex-col items-center justify-center w-full h-64 text-center gap-4">
          <div className="text-red-500">{error}</div>
          <Button
            onClick={() => navigate('/my-treasury')}
            className="bg-red hover:bg-red/90 text-white px-6 py-2 rounded-lg"
          >
            Back to Treasury
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-start gap-2 px-4 lg:px-2.5 pt-0 pb-[30px] relative min-h-screen">
      <SEO title={displaySpaceName || spaceInfo?.name || category || 'Treasury'} />
      {/* Space Info Section */}
      <div className="space-info-section w-full">
        <SpaceInfoSection
        spaceName={displaySpaceName || spaceInfo?.name || category || 'Space'}
        treasureCount={totalArticleCount || articles.length}
        subscriberCount={subscriberCount}
        authorName={spaceInfo?.authorName || 'Anonymous'}
        authorAvatar={spaceInfo?.authorAvatar}
        authorNamespace={spaceInfo?.authorNamespace}
        spaceNamespace={namespace || spaceIdentifier}
        spaceDescription={spaceInfo?.description}
        spaceCoverUrl={spaceInfo?.coverUrl}
        spaceFaceUrl={spaceInfo?.faceUrl}
        firstArticleCover={articles[0]?.cover || articles[0]?.coverUrl}
        isFollowing={isFollowing}
        isOwner={isOwner}
        spaceType={spaceInfo?.spaceType}
        visibility={spaceInfo?.visibility}
        spaceId={spaceId}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        onShare={handleShare}
        onAuthorClick={handleAuthorClick}
        onEdit={handleEditSpace}
        onOrganize={isOwner ? () => {
          setOrganizeMode(prev => !prev);
          setSelectedArticleIds(new Set());
        } : undefined}
        organizeMode={organizeMode}
        onCreateSubTreasury={isOwner && !isSubTreasury && !(spaceInfo?.pid && spaceInfo.pid > 0) && !spaceInfo?.parentSpace ? () => setShowCreateSubTreasury(true) : undefined}
        onImportCSV={isOwner ? () => setShowImportModal(true) : undefined}
        isSubTreasury={isSubTreasury}
        parentSpaceName={parentSpaceName}
        parentSpaceInfo={parentSpaceInfo}
        navigate={navigate}
        spaceInfo={spaceInfo}
        onSubscriberCountLoaded={setSubscriberCount}
        onSubscriptionChange={(isSubscribed) => {
          // Update local state only - SubscribeButton already handled the API call
          setIsFollowing(isSubscribed);
          if (isSubscribed) {
            setSubscriberCount(prev => (prev || 0) + 1);
          } else {
            setSubscriberCount(prev => Math.max((prev || 0) - 1, 0));
          }
        }}
      />
      </div>

      {/* Sub-treasury Cards (hidden on sub-treasury pages) */}
      {!isSubTreasury && (operationLoading.loadingSubSpaces || subTreasuries.length > 0) && (
        <div className="w-full mt-4 mb-6">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {operationLoading.loadingSubSpaces ? (
              // Loading skeleton for sub-treasuries
              Array.from({ length: 3 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl h-48 w-full mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))
            ) : (
              subTreasuries.map((subSpace) => (
                <div key={subSpace.id}>
                <TreasuryCard
                  space={subSpace}
                  onClick={() => {
                    const parentName = displaySpaceName || spaceInfo?.name || '';
                    const parentInfo = {
                      name: parentName,
                      namespace: spaceInfo?.authorNamespace || namespace,
                      id: spaceId
                    };
                    if (subSpace.namespace) {
                      navigate(`/treasury/${subSpace.namespace}`, {
                        state: {
                          isSubTreasury: true,
                          parentSpaceName: parentName,
                          parentSpaceInfo: parentInfo,
                          spaceData: subSpace
                        }
                      });
                    } else if (subSpace.id) {
                      navigate(`/treasury/${subSpace.id}`, {
                        state: {
                          isSubTreasury: true,
                          parentSpaceName: parentName,
                          parentSpaceInfo: parentInfo,
                          spaceData: subSpace
                        }
                      });
                    }
                  }}
                />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Sub-treasury Modal (hidden on sub-treasury pages) */}
      {!isSubTreasury && <CreateSpaceModal
        isOpen={showCreateSubTreasury}
        onClose={() => setShowCreateSubTreasury(false)}
        title="Create sub-treasury"
        submitLabel="Add"
        mode="full"
        parentSpaceId={isOwner ? spaceId : undefined} // Only pass parent ID if user owns this space
        onSuccess={(newSpace) => {
          console.log('✅ Sub-treasury created successfully:', newSpace);
          console.log('📋 Current spaceId (parent):', spaceId);
          console.log('📋 User is owner:', isOwner);
          setSubTreasuries(prev => {
            console.log('📋 Current sub-treasuries before update:', prev);
            const updated = [...prev, newSpace];
            console.log('📋 Updated sub-treasuries after adding new one:', updated);
            return updated;
          });

          // Close the modal first
          setShowCreateSubTreasury(false);

          // Navigate to the newly created sub-treasury
          const currentSpaceName = displaySpaceName || spaceInfo?.name || '';
          const parentInfo = {
            name: currentSpaceName,
            namespace: spaceInfo?.namespace,
            id: parseInt(spaceId)
          };

          if (newSpace?.namespace) {
            console.log('🚀 Navigating to new sub-treasury:', newSpace.namespace);
            navigate(`/treasury/${newSpace.namespace}`, {
              state: {
                isSubTreasury: true,
                parentSpaceName: currentSpaceName,
                parentSpaceInfo: parentInfo,
                spaceData: newSpace
              }
            });
          } else if (newSpace?.id) {
            console.log('🚀 Navigating to new sub-treasury (by ID):', newSpace.id);
            navigate(`/treasury/${newSpace.id}`, {
              state: {
                isSubTreasury: true,
                parentSpaceName: currentSpaceName,
                parentSpaceInfo: parentInfo,
                spaceData: newSpace
              }
            });
          }

          showToast(`Sub-treasury "${newSpace?.name || 'New Sub-treasury'}" created successfully`, 'success');
        }}
      />}


      {/* Articles Grid */}
      <div className="w-full mt-2">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full h-64 text-center">
            {/* Different messages based on whether this space has sub-treasuries */}
            {!isSubTreasury && subTreasuries.length > 0 ? (
              // Parent space with sub-treasuries - organized space
              <>
                <h3 className="text-[24px] font-[450] text-gray-600 mb-4 [font-family:'Lato',Helvetica]">
                  Your treasures are organized into sub-treasuries above.
                </h3>
                <p className="text-gray-500 text-base mb-4 [font-family:'Lato',Helvetica] max-w-md">
                  All articles have been sorted into categories. Add new treasures to continue organizing your collection.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-[15px] px-5 h-[35px] bg-white text-red border border-red rounded-[50px] hover:bg-[#F23A001A] transition-all duration-300 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 30 24" fill="currentColor">
                    <path d="M20.9584 0.5C18.7483 0.5 16.6439 1.51341 14.9932 3.35382C13.4004 1.57781 11.3199 0.5 9.04161 0.5C4.05525 0.5 0 5.65856 0 12C0 18.3414 4.05525 23.5 9.04161 23.5C11.3199 23.5 13.4038 22.4222 14.9932 20.6462C16.6405 22.49 18.7381 23.5 20.9584 23.5C25.9447 23.5 30 18.3414 30 12C30 5.65856 25.9447 0.5 20.9584 0.5ZM1.02319 12C1.02319 6.22119 4.62142 1.5168 9.04161 1.5168C13.4618 1.5168 17.06 6.2178 17.06 12C17.06 13.1049 16.927 14.1726 16.6849 15.1724C16.6405 12.749 15.5184 10.7561 13.7278 10.3087C11.395 9.72576 8.80286 11.9932 7.9502 15.3622C7.54775 16.9586 7.58527 18.5685 8.05593 19.8971C8.48567 21.1139 9.2326 21.9748 10.1876 22.3714C9.81241 22.4425 9.43042 22.4798 9.04502 22.4798C4.61801 22.4832 1.02319 17.7788 1.02319 12ZM15.6446 19.8429C17.1555 17.7856 18.0832 15.0301 18.0832 12C18.0832 8.96994 17.1555 6.21441 15.6446 4.15709C17.1146 2.45564 18.9973 1.5168 20.9584 1.5168C25.3786 1.5168 28.9768 6.2178 28.9768 12C28.9768 13.2439 28.8097 14.4369 28.5027 15.5452C28.5709 12.9558 27.425 10.7798 25.5457 10.3121C23.2128 9.72915 20.6207 11.9966 19.7681 15.3656C18.97 18.5211 19.9795 21.541 22.0293 22.3883C21.678 22.4493 21.3199 22.4866 20.955 22.4866C18.9904 22.4832 17.1146 21.5477 15.6446 19.8429Z"/>
                  </svg>
                  <span className="[font-family:'Lato',Helvetica] font-bold text-[16px] leading-5">
                    Discover More
                  </span>
                </button>
              </>
            ) : (
              // Regular empty space (no sub-treasuries or sub-treasury itself)
              <>
                <h3 className="text-[24px] font-[450] text-gray-600 mb-4 [font-family:'Lato',Helvetica]">
                  No treasures yet — this collection is just getting started.
                </h3>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-[15px] px-5 h-[35px] bg-white text-red border border-red rounded-[50px] hover:bg-[#F23A001A] transition-all duration-300 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 30 24" fill="currentColor">
                    <path d="M20.9584 0.5C18.7483 0.5 16.6439 1.51341 14.9932 3.35382C13.4004 1.57781 11.3199 0.5 9.04161 0.5C4.05525 0.5 0 5.65856 0 12C0 18.3414 4.05525 23.5 9.04161 23.5C11.3199 23.5 13.4038 22.4222 14.9932 20.6462C16.6405 22.49 18.7381 23.5 20.9584 23.5C25.9447 23.5 30 18.3414 30 12C30 5.65856 25.9447 0.5 20.9584 0.5ZM1.02319 12C1.02319 6.22119 4.62142 1.5168 9.04161 1.5168C13.4618 1.5168 17.06 6.2178 17.06 12C17.06 13.1049 16.927 14.1726 16.6849 15.1724C16.6405 12.749 15.5184 10.7561 13.7278 10.3087C11.395 9.72576 8.80286 11.9932 7.9502 15.3622C7.54775 16.9586 7.58527 18.5685 8.05593 19.8971C8.48567 21.1139 9.2326 21.9748 10.1876 22.3714C9.81241 22.4425 9.43042 22.4798 9.04502 22.4798C4.61801 22.4832 1.02319 17.7788 1.02319 12ZM15.6446 19.8429C17.1555 17.7856 18.0832 15.0301 18.0832 12C18.0832 8.96994 17.1555 6.21441 15.6446 4.15709C17.1146 2.45564 18.9973 1.5168 20.9584 1.5168C25.3786 1.5168 28.9768 6.2178 28.9768 12C28.9768 13.2439 28.8097 14.4369 28.5027 15.5452C28.5709 12.9558 27.425 10.7798 25.5457 10.3121C23.2128 9.72915 20.6207 11.9966 19.7681 15.3656C18.97 18.5211 19.9795 21.541 22.0293 22.3883C21.678 22.4493 21.3199 22.4866 20.955 22.4866C18.9904 22.4832 17.1146 21.5477 15.6446 19.8429Z"/>
                  </svg>
                  <span className="[font-family:'Lato',Helvetica] font-bold text-[16px] leading-5">
                    Discover
                  </span>
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="w-full grid grid-cols-1 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
              {articles.map((article, index) => (
                <div
                  key={article.uuid || article.id}
                  draggable={organizeMode}
                  onDragStart={organizeMode ? (e) => {
                    setDragIndex(index);
                    e.dataTransfer.effectAllowed = 'move';
                    // Make drag preview semi-transparent
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = '0.5';
                    }
                  } : undefined}
                  onDragEnd={organizeMode ? (e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.opacity = '1';
                    }
                    setDragIndex(null);
                    setDragOverIndex(null);
                  } : undefined}
                  onDragOver={organizeMode ? (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragIndex !== null && dragIndex !== index) {
                      setDragOverIndex(index);
                    }
                  } : undefined}
                  onDragLeave={organizeMode ? () => {
                    setDragOverIndex(null);
                  } : undefined}
                  onDrop={organizeMode ? (e) => {
                    e.preventDefault();
                    if (dragIndex !== null && dragIndex !== index) {
                      setArticles(prev => {
                        const updated = [...prev];
                        const [dragged] = updated.splice(dragIndex, 1);
                        updated.splice(index, 0, dragged);
                        return updated;
                      });
                    }
                    setDragIndex(null);
                    setDragOverIndex(null);
                  } : undefined}
                  className={`article-card transition-transform ${organizeMode ? 'cursor-grab active:cursor-grabbing' : ''} ${dragOverIndex === index ? 'scale-105 ring-2 ring-red/30 rounded-xl' : ''}`}
                >
                  {renderCard(article)}
                </div>
              ))}
            </div>

            {/* Loading indicator for infinite scroll */}
            {loadingMore && (
              <div className="flex justify-center mt-8">
                <div className="text-gray-500">Loading more...</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Organize Mode Floating Action Bar */}
      {organizeMode && (
        <div className="organize-controls fixed bottom-4 sm:bottom-8 z-40 bg-white rounded-full shadow-xl border border-gray-200 px-4 sm:px-8 py-3 flex items-center gap-3 sm:gap-8 max-w-[90vw] left-1/2 -translate-x-1/2 lg:left-[calc(310px+(100vw-310px-40px)/2)] lg:-translate-x-1/2">
          <span className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">{selectedArticleIds.size > 0 ? `${selectedArticleIds.size} selected` : 'Select'}</span>
          {/* Move button */}
          <button
            className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
            onClick={() => {
              console.log('📁 Move button clicked');

              // Show modal immediately with loading state
              setSelectedMoveTarget(null);
              setLoadingMoveSpaces(true);
              setBindableSpaces([]); // Clear previous data
              setShowMoveModal(true);

              // Load only sub-spaces within current parent space
              const loadRestrictedSpaces = async () => {
                try {
                  const userId = user?.id;
                  if (!userId) {
                    console.error('📁 No user ID available');
                    setBindableSpaces([]);
                    return;
                  }

                  console.log('📁 Loading spaces with parent-child restrictions...');
                  console.log(`📁 Debug: isSubTreasury=${isSubTreasury}, parentSpaceName="${parentSpaceName}", parentSpaceInfo:`, parentSpaceInfo);
                  console.log(`📁 Debug: spaceInfo.pid=${spaceInfo?.pid}, spaceInfo:`, spaceInfo);

                  const availableSpaces = [];

                  // Enhanced detection: Check if this is a sub-space from API data or navigation state
                  const isActuallySubSpace = isSubTreasury || (spaceInfo?.pid && spaceInfo.pid > 0);
                  const actualParentInfo = parentSpaceInfo || (spaceInfo?.pid ? { id: spaceInfo.pid } : null);

                  console.log(`📁 Enhanced detection: isActuallySubSpace=${isActuallySubSpace}, actualParentInfo:`, actualParentInfo);

                  // Fixed move logic: Focus on core sibling spaces functionality
                  if (isActuallySubSpace && (parentSpaceName || actualParentInfo)) {
                    // Current is a sub-space - load sibling sub-spaces only
                    console.log(`📁 Current is sub-space "${spaceInfo?.name || 'Unknown'}" with parent "${parentSpaceName}"`);
                    console.log('📁 Loading sibling sub-spaces...');

                    // IMPORTANT: Try actualParentInfo.id FIRST - this should be the primary method!

                    if (actualParentInfo?.id) {
                      console.log(`📁 ✨ PRIMARY METHOD: Using actualParentInfo.id: ${actualParentInfo.id} to get siblings`);
                      try {
                        const correctSiblingsResponse = await AuthService.getMySpaces(userId, 1, 100, actualParentInfo.id);
                        const correctSiblings = correctSiblingsResponse?.data?.data || correctSiblingsResponse?.data || correctSiblingsResponse || [];
                        console.log(`📁 ✨ Found ${correctSiblings.length} spaces under parent ID ${actualParentInfo.id}`);
                        console.log('📁 ✨ Raw siblings:', correctSiblings);

                        const filteredCorrectSiblings = correctSiblings.filter((s: any) => s.id !== spaceId);
                        availableSpaces.push(...filteredCorrectSiblings);
                        console.log(`📁 ✨ SUCCESS: Added ${filteredCorrectSiblings.length} correct siblings`);
                        filteredCorrectSiblings.forEach((s: any) => {
                          console.log(`📁 ✨ - "${s.name}" (ID: ${s.id})`);
                        });
                      } catch (correctError) {
                        console.log('📁 ❗ PRIMARY METHOD failed:', correctError);
                        // Continue to fallback method if PRIMARY fails
                      }
                    } else {
                      console.log('📁 ❌ PRIMARY METHOD skipped: actualParentInfo.id not available');
                    }

                    // Fallback method: Only use if PRIMARY method failed or parentSpaceInfo.id not available
                    if (availableSpaces.length === 0) {
                      console.log('📁 🔄 PRIMARY METHOD did not return results, using fallback method...');

                      try {
                        // Get all top-level spaces to find parent
                        const topLevelResponse = await AuthService.getMySpaces(userId, 1, 100);
                        const topLevelSpaces = topLevelResponse?.data?.data || topLevelResponse?.data || topLevelResponse || [];
                        console.log(`📁 Found ${topLevelSpaces.length} top-level spaces`);

                        // Find parent space by name (try exact match first, then contains)
                        let parentSpace = topLevelSpaces.find((s: any) => s.name === parentSpaceName);

                        // If exact match fails, try partial match
                        if (!parentSpace) {
                          parentSpace = topLevelSpaces.find((s: any) =>
                            s.name && parentSpaceName && (
                              s.name.includes(parentSpaceName) ||
                              parentSpaceName.includes(s.name) ||
                              s.name.replace(/'/g, "'").includes(parentSpaceName) ||
                              parentSpaceName.replace(/'/g, "'").includes(s.name)
                            )
                          );
                          if (parentSpace) {
                            console.log(`📁 Found parent space via partial match: "${parentSpace.name}" for search "${parentSpaceName}"`);
                          }
                        }

                        if (parentSpace) {
                          console.log(`📁 Found parent space: "${parentSpace.name}" (ID: ${parentSpace.id})`);

                          // Get all sub-spaces under this parent
                          const siblingsResponse = await AuthService.getMySpaces(userId, 1, 100, parentSpace.id);
                          const allSiblings = siblingsResponse?.data?.data || siblingsResponse?.data || siblingsResponse || [];
                          console.log(`📁 Raw siblings response:`, allSiblings);

                          // Filter out current space from siblings
                          const siblings = allSiblings.filter((s: any) => {
                            const isDifferent = s.id !== spaceId;
                            console.log(`📁 Checking sibling: "${s.name}" (ID: ${s.id}) - isDifferent: ${isDifferent}`);
                            return isDifferent;
                          });

                          availableSpaces.push(...siblings);
                          console.log(`📁 Final available siblings: ${siblings.length}`);
                          siblings.forEach((s: any) => {
                            console.log(`📁 - "${s.name}" (ID: ${s.id})`);
                          });
                        } else {
                          console.log(`📁 Could not find parent space with name: "${parentSpaceName}"`);
                          console.log('📁 Available top-level spaces:');
                          topLevelSpaces.forEach((s: any) => {
                            console.log(`📁 - "${s.name}" (ID: ${s.id})`);
                          });

                          // Final fallback: If parent not found, show all user spaces as options
                          console.log(`📁 Fallback: Since parent space not found, showing all other user spaces as move options`);
                          const otherSpaces = topLevelSpaces.filter((s: any) => s.id !== spaceId);
                          availableSpaces.push(...otherSpaces);
                          console.log(`📁 Fallback: Added ${otherSpaces.length} other spaces as move targets`);
                        }
                      } catch (error) {
                        console.error('📁 Failed to load sibling spaces:', error);
                      }
                    }
                  } else {
                    // Current is a parent space - show its sub-spaces only
                    console.log('📁 Current is parent space, loading sub-spaces...');

                    if (subTreasuries && subTreasuries.length > 0) {
                      availableSpaces.push(...subTreasuries);
                      console.log(`📁 Found ${subTreasuries.length} sub-spaces`);
                    } else {
                      console.log('📁 No sub-spaces available in current parent space');
                    }
                  }

                  console.log(`📁 Total available spaces for move: ${availableSpaces.length} (enhanced)`);
                  console.log('📁 Final bindableSpaces data:');
                  availableSpaces.forEach((s: any, index: number) => {
                    console.log(`📁 [${index}] Name: "${s.name}" | ID: ${s.id} | Type: ${s.spaceType || 'undefined'} | DisplayName: ${s.displayName || 'none'}`);
                  });
                  setBindableSpaces(availableSpaces);
                  setLoadingMoveSpaces(false); // Loading completed

                  // Show debug message if no spaces available (but still show modal for debugging)
                  if (availableSpaces.length === 0) {
                    if (isActuallySubSpace) {
                      console.log('📁 No target spaces available for move from sub-treasury');
                      console.log(`📁 Debug info: isActuallySubSpace=${isActuallySubSpace}, parentSpaceName="${parentSpaceName}", spaceId=${spaceId}`);
                    } else {
                      console.log('📁 No target spaces available - create sub-spaces or other treasuries first');
                    }
                    // Don't close modal immediately - let user see debug info
                  }

                } catch (error) {
                  console.error('📁 Failed to load restricted spaces:', error);
                  setBindableSpaces([]);
                  setLoadingMoveSpaces(false); // Loading failed, stop loading state
                }
              };

              // Run restricted loading
              loadRestrictedSpaces();
            }}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xs text-gray-600 hidden sm:block">Move</span>
          </button>
          {/* Move Out button - only show in sub-treasuries */}
          {isSubTreasury && (
            <button
              className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
              onClick={() => {
                if (selectedArticleIds.size === 0) {
                  showToast('Please select articles to move out', 'error');
                  return;
                }
                setShowMoveOutConfirm(true);
              }}
              disabled={operationLoading.copyArticles}
              title="Move selected articles to parent space"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H8M17 7V16" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xs text-blue-600 hidden sm:block">Move Out</span>
            </button>
          )}
          {/* Add Sub-treasury button - only show on parent spaces, not in sub-treasuries */}
          {!isSubTreasury && (
            <button
              className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
              onClick={() => setShowOrganizeSubTreasury(true)}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xs text-gray-600 hidden sm:block">Sub-treasury</span>
            </button>
          )}
        </div>
      )}

      {/* Edit Space Modal */}
      <CreateSpaceModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit treasury"
        submitLabel="Save"
        mode="full"
        editMode={true}
        editSpaceId={spaceId}
        initialData={{
          name: spaceInfo?.name || '',
          description: spaceInfo?.description || '',
          coverUrl: spaceInfo?.coverUrl || '',
          faceUrl: spaceInfo?.faceUrl || '',
          visibility: spaceInfo?.visibility || 0
        }}
        onSuccess={(updatedSpace) => {
          console.log('✅ Treasury updated successfully:', updatedSpace);
          // Update local space info
          if (updatedSpace) {
            setSpaceInfo(prev => prev ? {
              ...prev,
              name: updatedSpace.name || prev.name,
              description: updatedSpace.description || prev.description,
              coverUrl: updatedSpace.coverUrl || prev.coverUrl,
              faceUrl: updatedSpace.faceUrl || prev.faceUrl,
              visibility: updatedSpace.visibility !== undefined ? updatedSpace.visibility : prev.visibility
            } : null);
            setDisplaySpaceName(updatedSpace.name || '');
          }
          // Refresh page to show updated data
          window.location.reload();
        }}
        onDelete={canDeleteSpace ? () => {
          setShowEditModal(false);
          setDeleteSpaceConfirmOpen(true);
        } : undefined}
      />

      {/* Collect Treasure Modal */}
      {selectedArticle && (
        <CollectTreasureModal
          isOpen={collectModalOpen}
          onClose={() => {
            setCollectModalOpen(false);
            setSelectedArticle(null);
          }}
          articleId={selectedArticle.uuid}
          articleNumericId={selectedArticle.numericId}
          articleTitle={selectedArticle.title}
          isAlreadyCollected={selectedArticle.isLiked}
          onCollectSuccess={handleCollectSuccess}
          onSaveComplete={handleSaveComplete}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!isDeleting) {
                setDeleteConfirmOpen(false);
                setArticleToDelete(null);
              }
            }}
          />

          {/* Modal */}
          <div
            className="flex flex-col w-[400px] max-w-[90vw] items-center gap-5 p-[30px] relative bg-white rounded-[15px] z-10"
            role="dialog"
            aria-labelledby="delete-confirm-title"
            aria-modal="true"
          >
            {/* Warning icon */}
            <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center">
              <img className="w-6 h-6" alt="Delete" src={getIconUrl('DELETE')} style={{ filter: 'brightness(0) saturate(100%) invert(28%) sepia(93%) saturate(1479%) hue-rotate(6deg) brightness(97%) contrast(106%)' }} />
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <h2
                id="delete-confirm-title"
                className="[font-family:'Lato',Helvetica] font-semibold text-off-black text-xl tracking-[0] leading-[28px]"
              >
                {isCurationsSpace ? 'Delete Article' : 'Remove from Space'}
              </h2>
              <p className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px]">
                {isCurationsSpace
                  ? 'Are you sure you want to permanently delete this article? This action cannot be undone.'
                  : 'Are you sure you want to remove this article from the space? The article will remain available elsewhere.'
                }
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 w-full">
              <button
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setArticleToDelete(null);
                }}
                disabled={isDeleting}
                type="button"
              >
                <span className="[font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[22.4px]">
                  Cancel
                </span>
              </button>

              <button
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-[100px] bg-red cursor-pointer hover:bg-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={confirmDeleteArticle}
                disabled={operationLoading.deleteArticle}
                type="button"
              >
                <span className="[font-family:'Lato',Helvetica] font-bold text-white text-base tracking-[0] leading-[22.4px]">
                  {operationLoading.deleteArticle
                    ? (isCurationsSpace ? 'Deleting...' : 'Removing...')
                    : (isCurationsSpace ? 'Delete' : 'Remove')
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Space Confirmation Modal */}
      {deleteSpaceConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!operationLoading.deleteSpace) setDeleteSpaceConfirmOpen(false);
            }}
          />
          <div
            className="flex flex-col w-[400px] max-w-[90vw] items-center gap-5 p-[30px] relative bg-white rounded-[15px] z-10"
            role="dialog"
            aria-labelledby="delete-space-confirm-title"
            aria-modal="true"
          >
            <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center">
              <img className="w-6 h-6" alt="Delete" src={getIconUrl('DELETE')} style={{ filter: 'brightness(0) saturate(100%) invert(28%) sepia(93%) saturate(1479%) hue-rotate(6deg) brightness(97%) contrast(106%)' }} />
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <h2
                id="delete-space-confirm-title"
                className="[font-family:'Lato',Helvetica] font-semibold text-off-black text-xl tracking-[0] leading-[28px]"
              >
                Delete Treasury
              </h2>
              <p className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px]">
                Are you sure you want to delete this treasury? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 w-full">
              <button
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setDeleteSpaceConfirmOpen(false)}
                disabled={isSaving}
                type="button"
              >
                <span className="[font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[22.4px]">
                  Cancel
                </span>
              </button>
              <button
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-[100px] bg-red cursor-pointer hover:bg-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  setDeleteSpaceConfirmOpen(false);
                  handleDeleteSpace();
                }}
                disabled={operationLoading.deleteSpace}
                type="button"
              >
                <span className="[font-family:'Lato',Helvetica] font-bold text-white text-base tracking-[0] leading-[22.4px]">
                  {operationLoading.deleteSpace ? 'Deleting...' : 'Delete'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <ImportCSVModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={async (bookmarks: ImportedBookmark[]) => {
            try {
              if (!spaceId) {
                throw new Error('Space ID not available');
              }

              if (!user?.id) {
                throw new Error('User not logged in');
              }

              // Items are already validated and enriched by ImportCSVModal
              // Transform bookmarks to articles format for batch import
              const articles = bookmarks.map(bookmark => ({
                title: bookmark.title || '',
                content: bookmark.category || '', // Use category (recommendation field from CSV)
                targetUrl: bookmark.url,
                coverUrl: bookmark.cover || ''
              }));

              // Use new batch import API
              const importResponse = await AuthService.importArticles(spaceId, articles);

              if (importResponse && (importResponse.status === 1 || importResponse.success === true || importResponse.code === 200)) {
                showToast(`Successfully imported ${articles.length} bookmarks to space`, 'success');

                // Refresh the page to show the new articles
                setTimeout(() => {
                  window.location.reload();
                }, 1500);
              } else {
                const errorMsg = importResponse?.msg || importResponse?.message || 'Unknown import error';
                throw new Error(`Import failed: ${errorMsg}`);
              }
            } catch (error) {
              throw error;
            }
          }}
        />
      )}

      {/* Move to Treasury Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!isBulkProcessing && !loadingMoveSpaces) {
                setShowMoveModal(false);
                setLoadingMoveSpaces(false);
              }
            }}
          />
          <div
            className="flex flex-col w-[582px] max-w-[90vw] h-[70vh] items-center gap-5 p-[30px] relative bg-white rounded-[15px] z-10"
            role="dialog"
            aria-labelledby="move-modal-title"
            aria-modal="true"
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowMoveModal(false);
                setLoadingMoveSpaces(false);
              }}
              className="absolute top-5 right-5 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer z-20"
              aria-label="Close dialog"
              type="button"
              disabled={isBulkProcessing || loadingMoveSpaces}
            >
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L13 13M1 13L13 1" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-1 min-h-0 pt-5">
              <h2
                id="move-modal-title"
                className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap"
              >
                Move to sub-treasury
              </h2>

              <div className="flex-1 overflow-y-auto w-full min-h-0">
                {loadingMoveSpaces ? (
                  // Loading state
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="w-8 h-8 border-2 border-red border-t-transparent rounded-full animate-spin"></div>
                    <p className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base text-center">Loading available spaces...</p>
                  </div>
                ) : bindableSpaces.length === 0 ? (
                  // No spaces available
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4" />
                      </svg>
                    </div>
                    <p className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base text-center">No sub-treasuries available</p>
                    <button
                      className="inline-flex items-center justify-center px-5 py-2 rounded-[100px] bg-red cursor-pointer hover:bg-red/90 transition-colors"
                      type="button"
                      onClick={() => {
                        setShowMoveModal(false);
                        setShowOrganizeSubTreasury(true);
                      }}
                    >
                      <span className="[font-family:'Lato',Helvetica] font-normal text-white text-sm tracking-[0] leading-[20px]">Create Sub-treasury</span>
                    </button>
                  </div>
                ) : (
                  <ul className="flex flex-col w-full">
                    {bindableSpaces.map((space: any) => {
                      const spaceImage = space.faceUrl || space.coverUrl || '';
                      const firstLetter = (space.name || 'U').charAt(0).toUpperCase();
                      return (
                        <li
                          key={space.id}
                          className={`flex items-center px-0 py-4 w-full border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedMoveTarget === space.id ? 'bg-red/5' : ''
                          }`}
                          onClick={() => setSelectedMoveTarget(space.id)}
                        >
                          <div className="inline-flex items-center gap-4 flex-[0_0_auto]">
                            {/* Radio circle */}
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                selectedMoveTarget === space.id
                                  ? 'bg-red border-red'
                                  : 'bg-white border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {selectedMoveTarget === space.id && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            {/* Profile image */}
                            <div className="relative">
                              {spaceImage ? (
                                <img className="w-12 h-12 object-cover rounded-full" alt={space.name} src={spaceImage} />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-lg font-medium text-gray-600">{firstLetter}</span>
                                </div>
                              )}
                            </div>
                            {/* Name */}
                            <span className="[font-family:'Lato',Helvetica] font-normal text-off-black text-lg tracking-[0] leading-[23.4px] whitespace-nowrap">
                              {space.name || 'Untitled'}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 w-full">
                <button
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    setShowMoveModal(false);
                    setLoadingMoveSpaces(false);
                  }}
                  disabled={isBulkProcessing || loadingMoveSpaces}
                  type="button"
                >
                  <span className="[font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[22.4px]">
                    Cancel
                  </span>
                </button>
                <button
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-[100px] bg-red cursor-pointer hover:bg-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedMoveTarget || isBulkProcessing || loadingMoveSpaces}
                  type="button"
                  onClick={async () => {
                    if (!selectedMoveTarget || !spaceId) return;

                    setOperationLoading(prev => ({ ...prev, copyArticles: true }));
                    setIsBulkProcessing(true);

                    try {
                      const selectedUuids = Array.from(selectedArticleIds);
                      const targetSpace = bindableSpaces.find(space => space.id === selectedMoveTarget);
                      const targetSpaceName = targetSpace?.name || 'sub-treasury';

                      console.log('🚚 Moving articles to target space (dedicated Move API)...', {
                        targetSpaceId: selectedMoveTarget,
                        targetSpaceName,
                        articleCount: selectedUuids.length,
                        fromSpaceId: spaceId
                      });

                      // Collect article IDs for batch move
                      const articleIds: number[] = [];
                      for (const uuid of selectedUuids) {
                        const article = articles.find(a => a.uuid === uuid);
                        const numericId = article?.numericId || article?.id;
                        if (numericId) {
                          articleIds.push(numericId);
                        } else {
                          console.error(`🚚 No numeric ID found for article: ${uuid}`);
                        }
                      }

                      let successCount = 0;
                      if (articleIds.length > 0 && spaceId) {
                        try {
                          // Use dedicated Move API for batch operation
                          await moveArticlesToSpace({
                            articleIds,
                            fromSpaceId: parseInt(spaceId),
                            toSpaceId: selectedMoveTarget
                          });
                          successCount = articleIds.length;
                          console.log(`🚚 Successfully moved ${successCount} articles using dedicated Move API`);
                        } catch (error) {
                          console.error('🚚 Failed to move articles:', error);
                        }
                      }

                      // Remove moved articles from current space UI
                      const movedUuids = selectedUuids.slice(0, successCount);
                      setArticles(prev => prev.filter(article => !movedUuids.includes(article.uuid)));
                      setTotalArticleCount(prev => Math.max(0, prev - successCount));

                      // Clear selection and close modal
                      setSelectedArticleIds(new Set());
                      setShowMoveModal(false);
                      setOrganizeMode(false);

                      // Show enhanced success message with target space name
                      if (successCount === selectedUuids.length) {
                        showToast(`Successfully moved ${successCount} article${successCount > 1 ? 's' : ''} to "${targetSpaceName}"`, 'success');
                      } else if (successCount > 0) {
                        showToast(`Moved ${successCount} of ${selectedUuids.length} articles to "${targetSpaceName}" (${selectedUuids.length - successCount} failed)`, 'warning');
                      } else {
                        showToast(`Failed to move articles to "${targetSpaceName}"`, 'error');
                      }

                      console.log(`🚚 Move operation completed: ${successCount}/${selectedUuids.length} successful`);


                      // Enhanced feedback with navigation option for sub-spaces
                      if (successCount === selectedUuids.length && successCount > 0) {
                        // Check if we're moving to a sub-space (when we have subTreasuries data)
                        if (subTreasuries && subTreasuries.length > 0) {
                          const targetSubSpace = subTreasuries.find((sub: any) => sub.id === selectedMoveTarget);

                          if (targetSubSpace) {
                            // This means we're moving to a sub-space
                            const shouldNavigate = window.confirm(
                              `Successfully moved ${successCount} article${successCount > 1 ? 's' : ''} to "${targetSpaceName}".\n\nWould you like to view the sub-space now?`
                            );
                            if (shouldNavigate && targetSubSpace.namespace) {
                              console.log(`🚚 Navigating to sub-space: ${targetSubSpace.namespace}`);
                              navigate(`/treasury/${targetSubSpace.namespace}`, {
                                state: {
                                  fromParentSpace: true,
                                  movedArticlesCount: successCount
                                }
                              });
                            }
                          }
                        }
                      }
                    } catch (err) {
                      console.error('Failed to move articles:', err);
                      const message = ErrorHandler.handleApiError(err, {
                        component: 'SpaceContentSection',
                        action: 'move-articles',
                        endpoint: 'moveArticlesToSpace'
                      });
                      showToast(message, 'error');
                    } finally {
                      setOperationLoading(prev => ({ ...prev, copyArticles: false }));
                      setIsBulkProcessing(false);
                    }
                  }}
                >
                  <span className="[font-family:'Lato',Helvetica] font-bold text-white text-base tracking-[0] leading-[22.4px]">
                    {isBulkProcessing ? 'Moving...' : 'Move'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Organize: Create Sub-treasury + bind selected articles */}
      <CreateSpaceModal
        isOpen={showOrganizeSubTreasury}
        onClose={() => setShowOrganizeSubTreasury(false)}
        title="Create sub-treasury"
        submitLabel="Add"
        mode="full"
        parentSpaceId={isOwner ? spaceId : undefined} // Only pass parent ID if user owns this space
        onSuccess={async (newSpace) => {
          const newSpaceId = newSpace?.id || newSpace?.data?.id;
          if (newSpaceId) {
            // Bind selected articles to the new sub-treasury
            const selectedUuids = Array.from(selectedArticleIds);
            let bindCount = 0;
            for (const uuid of selectedUuids) {
              const article = articles.find(a => a.uuid === uuid);
              const numericId = article?.numericId || article?.id;
              if (numericId) {
                try {
                  await bindArticles({ articleId: numericId, spaceIds: [newSpaceId] });
                  bindCount++;
                } catch (err) {
                  console.error('Failed to bind article to sub-treasury:', err);
                }
              }
            }
            // Add selected articles' covers to the new space for card preview
            const selectedArticles = selectedUuids
              .map(uuid => articles.find(a => a.uuid === uuid))
              .filter(Boolean);
            const previewData = selectedArticles.slice(0, 3).map(a => ({
              coverUrl: a?.cover || a?.coverUrl || '',
              title: a?.title || '',
              targetUrl: a?.targetUrl || '',
            }));
            const spaceWithData = { ...newSpace, data: previewData, articleCount: bindCount };
            setSubTreasuries(prev => [...prev, spaceWithData]);
            setSelectedArticleIds(new Set());
            showToast(`Created sub-treasury "${newSpace?.name || 'New Sub-treasury'}" and copied ${bindCount} article${bindCount !== 1 ? 's' : ''}`, 'success');
          }
        }}
      />

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => { if (!isBulkProcessing) setShowBulkDeleteConfirm(false); }}
          />
          <div
            className="flex flex-col w-[400px] max-w-[90vw] items-center gap-5 p-[30px] relative bg-white rounded-[15px] z-10"
            role="dialog"
            aria-labelledby="bulk-delete-title"
            aria-modal="true"
          >
            {/* Warning icon */}
            <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center">
              <img className="w-6 h-6" alt="Delete" src={getIconUrl('DELETE')} style={{ filter: 'brightness(0) saturate(100%) invert(28%) sepia(93%) saturate(1479%) hue-rotate(6deg) brightness(97%) contrast(106%)' }} />
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <h2
                id="bulk-delete-title"
                className="[font-family:'Lato',Helvetica] font-semibold text-off-black text-xl tracking-[0] leading-[28px]"
              >
                Remove {selectedArticleIds.size} {selectedArticleIds.size === 1 ? 'treasure' : 'treasures'}
              </h2>
              <p className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px]">
                Are you sure you want to remove {selectedArticleIds.size === 1 ? 'this treasure' : 'these treasures'} from the space? The {selectedArticleIds.size === 1 ? 'article' : 'articles'} will remain available elsewhere.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 w-full">
              <button
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={isBulkProcessing}
                type="button"
              >
                <span className="[font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[22.4px]">
                  Cancel
                </span>
              </button>
              <button
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-[100px] bg-red cursor-pointer hover:bg-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isBulkProcessing}
                type="button"
                onClick={async () => {
                  console.log('🗑️ Starting bulk delete process...');
                  setIsBulkProcessing(true);
                  try {
                    const selectedUuids = Array.from(selectedArticleIds);
                    const isCurationsSpace = spaceInfo?.spaceType === 2;
                    console.log('🗑️ Selected UUIDs:', selectedUuids);
                    console.log('🗑️ Is Curations Space:', isCurationsSpace);
                    console.log('🗑️ Space ID:', spaceId);
                    for (const uuid of selectedUuids) {
                      const article = articles.find(a => a.uuid === uuid);
                      const numericId = article?.numericId || article?.id;
                      if (numericId) {
                        console.log(`🗑️ Processing article: ${uuid} (numericId: ${numericId})`);
                        if (isCurationsSpace) {
                          console.log('🗑️ Deleting article permanently...');
                          await AuthService.deleteArticle(uuid);
                        } else {
                          console.log('🗑️ Removing article from space...');
                          await removeArticleFromSpace({ articleId: numericId, spaceId: spaceId! });
                        }
                        console.log(`✅ Successfully processed article: ${uuid}`);
                      } else {
                        console.error(`❌ No numeric ID found for article: ${uuid}`);
                      }
                    }
                    setArticles(prev => prev.filter(a => !selectedArticleIds.has(a.uuid)));
                    setTotalArticleCount(prev => Math.max(0, prev - selectedUuids.length));
                    setSelectedArticleIds(new Set());
                    setShowBulkDeleteConfirm(false);
                    showToast(`Removed ${selectedUuids.length} treasures`, 'success');
                  } catch (err) {
                    console.error('Failed to remove articles:', err);
                    showToast('Failed to remove some articles', 'error');
                  } finally {
                    setIsBulkProcessing(false);
                  }
                }}
              >
                <span className="[font-family:'Lato',Helvetica] font-bold text-white text-base tracking-[0] leading-[22.4px]">
                  {isBulkProcessing ? 'Removing...' : 'Remove'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Out Confirmation Modal */}
      {showMoveOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => { if (!operationLoading.copyArticles) setShowMoveOutConfirm(false); }}
          />
          <div
            className="flex flex-col w-[400px] max-w-[90vw] items-center gap-5 p-[30px] relative bg-white rounded-[15px] z-10"
            role="dialog"
            aria-labelledby="move-out-title"
            aria-modal="true"
          >
            {/* Move out icon */}
            <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17L17 7M17 7H8M17 7V16" stroke="#f23a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <h2
                id="move-out-title"
                className="[font-family:'Lato',Helvetica] font-semibold text-off-black text-xl tracking-[0] leading-[28px]"
              >
                Move {selectedArticleIds.size} {selectedArticleIds.size === 1 ? 'treasure' : 'treasures'} to main treasury?
              </h2>
              <p className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px]">
                {selectedArticleIds.size === 1 ? 'This treasure' : 'These treasures'} will be moved to "{parentSpaceInfo?.name || 'main treasury'}" and removed from the current sub-treasury.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 w-full">
              <button
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowMoveOutConfirm(false)}
                disabled={operationLoading.copyArticles}
                type="button"
              >
                <span className="[font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[22.4px]">
                  Cancel
                </span>
              </button>
              <button
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-[100px] bg-red cursor-pointer hover:bg-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                onClick={handleMoveOut}
                disabled={operationLoading.copyArticles}
              >
                <span className="[font-family:'Lato',Helvetica] font-normal text-white text-base tracking-[0] leading-[22.4px]">
                  {operationLoading.copyArticles ? 'Moving...' : 'Move to main treasury'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
};

export default SpaceContentSection;
