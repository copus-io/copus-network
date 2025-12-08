import React, { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import { AuthService } from "../../services/authService";
import { getArticleDetail } from "../../services/articleService";
import { useToast } from "../ui/toast";

interface CollectTreasureModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string; // UUID
  articleNumericId?: number; // Optional: Numeric ID for bindArticles API (if already known)
  articleTitle: string;
  isAlreadyCollected?: boolean;
  onCollectSuccess?: () => void; // Callback after successful collection
}

interface BindableSpace {
  articleCount: number;
  data: Array<{
    coverUrl: string;
    targetUrl: string;
    title: string;
  }>;
  id: number;
  isBind: boolean;
  name: string;
  namespace: string;
  spaceType: number;
  userId: number;
}

interface Collection {
  id: string;
  numericId: number;
  name: string;
  image: string;
  isSelected: boolean; // Current selection state in modal
  wasOriginallyBound: boolean; // Was bound when modal opened
  spaceType?: number;
  namespace?: string;
  firstLetter: string; // First letter of space name for avatar fallback
}

export const CollectTreasureModal: React.FC<CollectTreasureModalProps> = ({
  isOpen,
  onClose,
  articleId,
  articleNumericId,
  articleTitle,
  isAlreadyCollected = false,
  onCollectSuccess,
}) => {
  const { user } = useUser();
  const { showToast } = useToast();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newTreasuryName, setNewTreasuryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolvedArticleId, setResolvedArticleId] = useState<number | null>(null);
  const [curationsSpaceId, setCurationsSpaceId] = useState<number | null>(null); // Store Curations space ID to always include in save

  // Fetch user's bindable spaces using the bindableSpaces API
  useEffect(() => {
    const fetchCollections = async () => {
      if (!isOpen || !user?.id) return;

      try {
        setLoading(true);

        // Resolve the numeric article ID
        let numericId = articleNumericId;
        if (!numericId || numericId <= 0) {
          // Fetch article detail to get the numeric ID
          console.log('Fetching article detail to get numeric ID for:', articleId);
          const articleDetail = await getArticleDetail(articleId);
          numericId = articleDetail.id;
          console.log('Got numeric article ID:', numericId);
        }
        setResolvedArticleId(numericId);

        // Use the bindableSpaces API with articleId to get binding status
        const bindableResponse = await AuthService.getBindableSpaces(numericId);

        // Parse the response - handle different possible formats
        let spacesArray: BindableSpace[] = [];
        if (bindableResponse?.data && Array.isArray(bindableResponse.data)) {
          spacesArray = bindableResponse.data;
        } else if (Array.isArray(bindableResponse)) {
          spacesArray = bindableResponse;
        }

        // Transform spaces to collection format
        const collectionOptions: Collection[] = spacesArray.map((space) => {
          // The bindableSpaces API doesn't return spaceType, so we need to detect it by name
          // "Default Collections Space" = Treasury (spaceType 1)
          // "Default Curations Space" = Curations (spaceType 2)
          let spaceTypeNum = space.spaceType;
          if (spaceTypeNum === undefined || spaceTypeNum === null) {
            if (space.name === 'Default Collections Space') {
              spaceTypeNum = 1;
            } else if (space.name === 'Default Curations Space') {
              spaceTypeNum = 2;
            } else {
              spaceTypeNum = 0; // Custom space
            }
          } else if (typeof spaceTypeNum === 'string') {
            spaceTypeNum = parseInt(spaceTypeNum, 10);
          }

          // For default spaces, show "Username's Treasury" or "Username's Curations"
          let displayName: string;
          if (spaceTypeNum === 1) {
            displayName = `${user.username || 'User'}'s Treasury`;
          } else if (spaceTypeNum === 2) {
            displayName = `${user.username || 'User'}'s Curations`;
          } else {
            displayName = space.name || 'Untitled Treasury';
          }

          // For default Treasury/Curations (spaceType 1 & 2), use user's profile image
          // For custom spaces, use the first article's cover image from this collection
          const isDefaultSpace = spaceTypeNum === 1 || spaceTypeNum === 2;
          const coverImage = isDefaultSpace
            ? (user.faceUrl || '')
            : (space.data?.[0]?.coverUrl || '');

          // Get first letter of space name for avatar fallback
          const spaceName = space.name || displayName;
          const firstLetter = spaceName.charAt(0).toUpperCase();

          return {
            id: space.id.toString(),
            numericId: space.id,
            name: displayName,
            image: coverImage,
            isSelected: space.isBind, // Initially selected if already bound
            wasOriginallyBound: space.isBind,
            spaceType: spaceTypeNum,
            namespace: space.namespace,
            firstLetter,
          };
        });

        // Find Curations space (spaceType 2) - backend now properly handles it
        const curationsSpace = collectionOptions.find(c => c.spaceType === 2);
        if (curationsSpace) {
          setCurationsSpaceId(curationsSpace.numericId);
        }

        // Filter out Curations space (spaceType 2) from the UI - curations are managed separately
        // and should not be toggled by the user in the collect modal
        const filteredCollections = collectionOptions.filter(c => c.spaceType !== 2);

        // Sort collections: bound spaces first, then spaceType 1 (Treasury), then by ID descending
        const sortedCollections = filteredCollections.sort((a, b) => {
          // Already bound spaces come first (these have the red check mark)
          if (a.wasOriginallyBound && !b.wasOriginallyBound) return -1;
          if (!a.wasOriginallyBound && b.wasOriginallyBound) return 1;
          // Then spaceType 1 (Treasury) comes first - this is the user's default treasury
          if (a.spaceType === 1 && b.spaceType !== 1) return -1;
          if (a.spaceType !== 1 && b.spaceType === 1) return 1;
          // Then sort by numeric ID descending (higher ID = more recently created)
          return b.numericId - a.numericId;
        });

        // Auto-select the Treasury space (spaceType 1) by default if not already bound
        const collectionsWithDefault = sortedCollections.map(c => {
          if (c.spaceType === 1 && !c.wasOriginallyBound) {
            return { ...c, isSelected: true };
          }
          return c;
        });

        setCollections(collectionsWithDefault);
      } catch (err) {
        console.error('Failed to fetch bindable spaces:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [isOpen, user?.id, user?.username, user?.faceUrl, articleId, articleNumericId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setShowCreateNew(false);
      setNewTreasuryName("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Toggle selection for a collection
  const handleToggleSelection = (collectionId: string) => {
    setCollections(prev =>
      prev.map(c => c.id === collectionId ? { ...c, isSelected: !c.isSelected } : c)
    );
  };

  // Handle save - call bindArticles API with all selected spaces
  const handleSave = async () => {
    if (!resolvedArticleId) {
      showToast('Article ID not available. Please try again.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      // Get all selected space IDs
      let selectedSpaceIds = collections
        .filter(c => c.isSelected)
        .map(c => c.numericId);

      // IMPORTANT: Always include Curations space if it exists
      // This prevents removing articles from curations when saving to other treasuries
      // The bindArticles API replaces all bindings, so we must preserve curations
      if (curationsSpaceId && !selectedSpaceIds.includes(curationsSpaceId)) {
        selectedSpaceIds = [curationsSpaceId, ...selectedSpaceIds];
      }

      // Call bindArticles API with the resolved numeric article ID
      await AuthService.bindArticles(resolvedArticleId, selectedSpaceIds);

      // Count only user-selected spaces (excluding auto-included Curations)
      const userSelectedCount = collections.filter(c => c.isSelected).length;
      if (userSelectedCount > 0) {
        showToast(`Saved to ${userSelectedCount} treasury${userSelectedCount > 1 ? 's' : ''}`, 'success');
      } else {
        showToast('Removed from all treasuries', 'success');
      }

      // Call success callback if provided
      if (onCollectSuccess) {
        onCollectSuccess();
      }

      onClose();
    } catch (err) {
      console.error('Failed to save:', err);
      showToast('Failed to save', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel - just close without saving
  const handleCancel = () => {
    onClose();
  };

  const handleCreateNewTreasury = async () => {
    if (!newTreasuryName.trim()) {
      showToast('Please enter a treasury name', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      // Call the createSpace API to create a new treasury
      const createResponse = await AuthService.createSpace(newTreasuryName.trim());
      console.log('Create space response:', createResponse);

      // Extract the created space from response
      const createdSpace = createResponse?.data || createResponse;

      if (!createdSpace?.id) {
        throw new Error('Failed to create treasury - no ID returned');
      }

      showToast(`Created "${newTreasuryName.trim()}"`, 'success');

      // Add the new treasury to collections list and select it
      // Use empty string for image to trigger firstLetter fallback (custom treasuries don't use profile image)
      const treasuryName = createdSpace.name || newTreasuryName.trim();
      setCollections(prev => [...prev, {
        id: createdSpace.id.toString(),
        numericId: createdSpace.id,
        name: treasuryName,
        image: '', // Empty to trigger firstLetter fallback
        isSelected: true, // Auto-select the newly created treasury
        wasOriginallyBound: false,
        spaceType: createdSpace.spaceType || 0,
        namespace: createdSpace.namespace,
        firstLetter: treasuryName.charAt(0).toUpperCase(),
      }]);

      setShowCreateNew(false);
      setNewTreasuryName("");
    } catch (err) {
      console.error('Failed to create treasury:', err);
      showToast('Failed to create treasury', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter collections by search query
  const filteredCollections = collections.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if there are any changes from original state
  const hasChanges = collections.some(c => c.isSelected !== c.wasOriginallyBound);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div
        className={`flex flex-col w-[582px] max-w-[90vw] items-center gap-5 pt-[30px] px-[30px] pb-4 relative bg-white rounded-[15px] z-10 ${showCreateNew ? '' : 'h-[500px]'}`}
        role="dialog"
        aria-labelledby="collect-dialog-title"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-[20px] right-[20px] p-2.5 cursor-pointer hover:opacity-70 transition-opacity z-20"
          aria-label="Close dialog"
          type="button"
        >
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#686868"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {showCreateNew ? (
          // Create New Treasury View
          <div className="flex flex-col items-start gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
              <h2
                id="collect-dialog-title"
                className="relative w-fit [font-family:'Lato',Helvetica] font-semibold text-off-black text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap"
              >
                New treasury
              </h2>

              <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <label
                  htmlFor="treasury-name"
                  className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap"
                >
                  Name
                </label>

                <div className="flex h-12 items-center px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                  <input
                    id="treasury-name"
                    type="text"
                    value={newTreasuryName}
                    onChange={(e) => setNewTreasuryName(e.target.value)}
                    placeholder="Like &quot;Place to go&quot;"
                    className="flex-1 border-none bg-transparent [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] outline-none placeholder:text-medium-dark-grey"
                    aria-required="true"
                    autoFocus
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
              <button
                className="inline-flex items-center justify-center gap-[30px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setShowCreateNew(false)}
                type="button"
              >
                <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                  Cancel
                </span>
              </button>

              <button
                className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[100px] bg-red cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red/90 transition-colors"
                onClick={handleCreateNewTreasury}
                disabled={!newTreasuryName.trim() || isSubmitting}
                type="button"
              >
                <span className="relative w-fit [font-family:'Lato',Helvetica] font-bold text-white text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                  {isSubmitting ? 'Creating...' : 'Create'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          // Collection List View
          <div className="flex flex-col items-start relative self-stretch w-full flex-1 min-h-0 pt-5">
            <div className="flex flex-col items-start justify-center gap-5 relative self-stretch w-full flex-[0_0_auto]">
              {/* Title and New Treasury on same line */}
              <div className="flex items-center justify-between w-full">
                <h2
                  id="collect-dialog-title"
                  className="relative w-fit [font-family:'Lato',Helvetica] font-medium text-off-black text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap"
                >
                  Collect treasures
                </h2>

                <button
                  className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
                  type="button"
                  onClick={() => setShowCreateNew(true)}
                  aria-label="Create new treasury"
                >
                  <img
                    className="relative w-6 h-6"
                    alt="Add"
                    src="https://c.animaapp.com/eANMvAF7/img/plus.svg"
                    aria-hidden="true"
                  />
                  <span className="[font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                    New treasury
                  </span>
                </button>
              </div>

              {/* Search Input */}
              <div className="flex h-12 items-center gap-2.5 px-5 py-2.5 relative self-stretch w-full rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                <img
                  className="relative w-[22px] h-[22px]"
                  alt="Search"
                  src="https://c.animaapp.com/eANMvAF7/img/icon-search.svg"
                  aria-hidden="true"
                />
                <input
                  className="flex-1 border-none bg-transparent [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] outline-none placeholder:text-medium-dark-grey"
                  placeholder="Search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search collections"
                />
              </div>
            </div>

            {/* Collections List - scrollbar hidden until hover */}
            <div
              className="flex flex-col items-start gap-0 relative self-stretch w-full flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.scrollbarColor = '#d1d5db transparent'; }}
              onMouseLeave={(e) => { e.currentTarget.style.scrollbarColor = 'transparent transparent'; }}
            >
              {loading ? (
                <div className="flex items-center justify-center w-full py-8">
                  <div className="text-gray-500">Loading collections...</div>
                </div>
              ) : filteredCollections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 w-full text-center">
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? 'No collections found' : 'No collections yet'}
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col items-center justify-center self-stretch w-full relative flex-[0_0_auto]">
                  {filteredCollections.map((collection) => (
                    <li
                      key={collection.id}
                      className="flex items-center justify-between px-0 py-4 self-stretch w-full bg-white border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleToggleSelection(collection.id)}
                    >
                      <div className="inline-flex items-center gap-4 relative flex-[0_0_auto]">
                        {/* Round Checkbox on the left */}
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            collection.isSelected
                              ? 'bg-red border-red'
                              : 'bg-white border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {collection.isSelected && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>

                        {collection.image ? (
                          <img
                            className="relative w-12 h-12 object-cover rounded-full"
                            alt={collection.name}
                            src={collection.image}
                          />
                        ) : (
                          <div className="relative w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-lg font-medium text-gray-600">
                              {collection.firstLetter}
                            </span>
                          </div>
                        )}
                        <div className="inline-flex flex-col items-start justify-center gap-1 relative flex-[0_0_auto]">
                          <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-lg tracking-[0] leading-[23.4px] whitespace-nowrap">
                            {collection.name}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Save and Cancel Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 relative z-10 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]" style={{ marginLeft: '-30px', marginRight: '-30px', paddingLeft: '30px', paddingRight: '30px', width: 'calc(100% + 60px)' }}>
              <button
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={handleCancel}
                type="button"
                disabled={isSubmitting}
              >
                <span className="[font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[22.4px]">
                  Cancel
                </span>
              </button>

              <button
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-[100px] bg-red cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red/90 transition-colors"
                onClick={handleSave}
                disabled={isSubmitting}
                type="button"
              >
                <span className="[font-family:'Lato',Helvetica] font-bold text-white text-base tracking-[0] leading-[22.4px]">
                  {isSubmitting ? 'Saving...' : 'Save'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectTreasureModal;
