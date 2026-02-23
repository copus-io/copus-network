import React, { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import { AuthService } from "../../services/authService";
import { useToast } from "../ui/toast";
import { BindableSpace } from "../../types/space";
import { CreateSpaceModal } from "../CreateSpaceModal/CreateSpaceModal";

interface ChooseTreasuriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedSpaces: SelectedSpace[]) => void; // Return selected spaces to parent
  initialSelectedIds?: number[]; // Optional: pre-selected space IDs
  articleId?: number; // Optional: article ID for edit mode to get existing bindings
}

export interface SelectedSpace {
  id: number;
  name: string;
  namespace?: string;
  spaceType?: number;
  visibility?: number; // New visibility system (0: public, 1: private, 2: unlisted)
}

// BindableSpace type imported from types/space.ts

interface Collection {
  id: string;
  numericId: number;
  name: string;
  image: string;
  isSelected: boolean;
  wasOriginallyBound: boolean; // Track if this was already bound when modal opened
  spaceType?: number;
  visibility?: number; // New visibility system (0: public, 1: private, 2: unlisted)
  namespace?: string;
  firstLetter: string; // First letter of space name for avatar fallback
}

export const ChooseTreasuriesModal: React.FC<ChooseTreasuriesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSelectedIds = [],
  articleId,
}) => {
  const { user } = useUser();
  const { showToast } = useToast();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user's bindable spaces
  useEffect(() => {
    const fetchCollections = async () => {
      if (!isOpen || !user?.id) return;

      try {
        setLoading(true);

        // Use the bindableSpaces API - pass articleId in edit mode to get isBind status
        const bindableResponse = await AuthService.getBindableSpaces(articleId);
        console.log('Bindable spaces response (Choose):', bindableResponse, 'articleId:', articleId);

        // Parse the response
        let spacesArray: BindableSpace[] = [];
        if (bindableResponse?.data && Array.isArray(bindableResponse.data)) {
          spacesArray = bindableResponse.data;
        } else if (Array.isArray(bindableResponse)) {
          spacesArray = bindableResponse;
        }

        console.log('Spaces array (full):', JSON.stringify(spacesArray, null, 2));
        console.log('User info for display name:', { username: user.username, userId: user.id });

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
            displayName = `${user.username || 'Anonymous'}'s Treasury`;
          } else if (spaceTypeNum === 2) {
            displayName = `${user.username || 'Anonymous'}'s Curations`;
          } else {
            displayName = space.name || 'Untitled Treasury';
          }

          console.log('Space display name for', space.name, ':', displayName, 'spaceType:', spaceTypeNum);

          // For default Treasury/Curations (spaceType 1 & 2), use user's profile image
          // For custom spaces, use space's faceUrl (avatar) if available, fallback to first article's cover image
          const isDefaultSpace = spaceTypeNum === 1 || spaceTypeNum === 2;
          const coverImage = isDefaultSpace
            ? (user.faceUrl || '')
            : (space.faceUrl || space.data?.[0]?.coverUrl || '');

          // Get first letter of space name (not display name which may have username)
          const spaceName = space.name || displayName;
          const firstLetter = spaceName.charAt(0).toUpperCase();

          // Pre-select if: articleId provided and space.isBind is true (existing binding),
          // OR initialSelectedIds contains this space
          const wasOriginallyBound = !!(articleId && space.isBind);
          const shouldBeSelected = wasOriginallyBound || initialSelectedIds.includes(space.id);

          return {
            id: space.id.toString(),
            numericId: space.id,
            name: displayName,
            image: coverImage,
            isSelected: shouldBeSelected,
            wasOriginallyBound, // Track original binding state
            spaceType: spaceTypeNum,
            visibility: space.visibility, // Include visibility from API
            namespace: space.namespace,
            firstLetter,
          };
        });

        // Sort: spaceType 1 (Treasury) first, then spaceType 2 (Curations), then by ID descending (newest first)
        const sortedCollections = collectionOptions.sort((a, b) => {
          if (a.spaceType === 1 && b.spaceType !== 1) return -1;
          if (a.spaceType !== 1 && b.spaceType === 1) return 1;
          if (a.spaceType === 2 && b.spaceType !== 2) return -1;
          if (a.spaceType !== 2 && b.spaceType === 2) return 1;
          // Then sort by numeric ID descending (higher ID = more recently created)
          return b.numericId - a.numericId;
        });

        console.log('Sorted collections order:', sortedCollections.map(c => ({ name: c.name, spaceType: c.spaceType, id: c.numericId })));

        // Note: No auto-select for this modal (unlike CollectTreasureModal)
        setCollections(sortedCollections);
      } catch (err) {
        console.error('Failed to fetch bindable spaces:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [isOpen, user?.id, user?.username, user?.faceUrl, initialSelectedIds, articleId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setShowCreateNew(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // Toggle selection for a collection
  const handleToggleSelection = (collectionId: string) => {
    setCollections(prev =>
      prev.map(c => c.id === collectionId ? { ...c, isSelected: !c.isSelected } : c)
    );
  };

  // Handle save - return selected spaces to parent and call bindArticles if in edit mode
  const handleSave = async () => {
    const selectedSpaces: SelectedSpace[] = collections
      .filter(c => c.isSelected)
      .map(c => ({
        id: c.numericId,
        name: c.name,
        namespace: c.namespace,
        spaceType: c.spaceType,
        visibility: c.visibility, // Include visibility field
      }));

    // SECURITY: Only bind to the current user's own treasuries
    // - getBindableSpaces() only returns spaces owned by the current user
    // - collections state only contains the current user's spaces
    // - We only send IDs from collections, never external IDs
    // - Backend should also validate space ownership (defense in depth)
    if (articleId) {
      // Find treasuries that are newly selected (not originally bound but now selected)
      // These are guaranteed to be the current user's spaces since they come from collections
      const newlySelectedSpaces = collections
        .filter(c => c.isSelected && !c.wasOriginallyBound)
        .map(c => c.numericId);

      // Additional safety: verify all IDs are in our collections (user's own spaces)
      const validSpaceIds = new Set(collections.map(c => c.numericId));
      const safeSpaceIds = newlySelectedSpaces.filter(id => validSpaceIds.has(id));

      if (safeSpaceIds.length > 0) {
        try {
          setIsSubmitting(true);
          console.log('📦 Binding article to NEW treasuries only (user-owned):', safeSpaceIds);
          await AuthService.bindArticles(articleId, safeSpaceIds);
          console.log('✅ Treasury bindings updated successfully');
          showToast('Treasury updated', 'success');
        } catch (error) {
          console.error('❌ Failed to update treasury bindings:', error);
          showToast('Failed to update treasury', 'error');
          setIsSubmitting(false);
          return; // Don't close modal on error
        } finally {
          setIsSubmitting(false);
        }
      }
    }

    onSave(selectedSpaces);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleTreasuryCreated = (createdSpace: any) => {
    // Add the new treasury to collections list and select it
    const treasuryName = createdSpace.name;
    setCollections(prev => [...prev, {
      id: createdSpace.id.toString(),
      numericId: createdSpace.id,
      name: treasuryName,
      image: '', // No cover image for new treasury
      isSelected: true, // Auto-select the newly created treasury
      wasOriginallyBound: false, // New treasury is not originally bound
      spaceType: createdSpace.spaceType || 0,
      visibility: createdSpace.visibility, // Include visibility from created space
      namespace: createdSpace.namespace,
      firstLetter: treasuryName.charAt(0).toUpperCase(),
    }]);

    setShowCreateNew(false);
  };

  // Filter collections by search query
  const filteredCollections = collections.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get count of selected
  const selectedCount = collections.filter(c => c.isSelected).length;

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
        className="flex flex-col w-[582px] max-w-[90vw] items-center gap-5 pt-[30px] px-[30px] pb-4 relative bg-white rounded-[15px] overflow-hidden z-10 h-[500px]"
        role="dialog"
        aria-labelledby="choose-dialog-title"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-5 right-5 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer z-20"
          aria-label="Close dialog"
          type="button"
        >
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M1 13L13 1" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* No inline create form - using unified CreateSpaceModal */}
        {!showCreateNew && (
          // Collection List View
          <div className="flex flex-col items-start relative self-stretch w-full flex-1 min-h-0 pt-5">
            <div className="flex flex-col items-start justify-center gap-5 relative self-stretch w-full flex-[0_0_auto]">
              {/* Title and New Treasury on same line */}
              <div className="flex items-center justify-between w-full">
                <h2
                  id="choose-dialog-title"
                  className="relative w-fit [font-family:'Lato',Helvetica] font-medium text-off-black text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap"
                >
                  Choose treasuries
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
                  <div className="text-gray-500">Loading treasuries...</div>
                </div>
              ) : filteredCollections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 w-full text-center">
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? 'No treasuries found' : 'No treasuries yet'}
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
                        {/* Round Checkbox */}
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
                        <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
                          <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-lg tracking-[0] leading-[23.4px] whitespace-nowrap">
                            {collection.name}
                          </span>
                          {collection.visibility === 1 && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#E0E0E0] rounded-[100px]">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16.9723 3C15.4989 3 14.096 3.66092 12.9955 4.86118C11.9336 3.70292 10.5466 3 9.02774 3C5.7035 3 3 6.36428 3 10.5C3 14.6357 5.7035 18 9.02774 18C10.5466 18 11.9359 17.2971 12.9955 16.1388C14.0937 17.3413 15.492 18 16.9723 18C20.2965 18 23 14.6357 23 10.5C23 6.36428 20.2965 3 16.9723 3ZM3.68213 10.5C3.68213 6.73121 6.08095 3.66313 9.02774 3.66313C11.9745 3.66313 14.3734 6.729 14.3734 10.5C14.3734 11.2206 14.2847 11.9169 14.1232 12.569C14.0937 10.9885 13.3456 9.68877 12.1519 9.39699C10.5966 9.0168 8.86858 10.4956 8.30014 12.6927C8.03183 13.7339 8.05684 14.7838 8.37062 15.6503C8.65712 16.4439 9.15507 17.0053 9.79172 17.2639C9.54161 17.3103 9.28695 17.3347 9.03001 17.3347C6.07867 17.3369 3.68213 14.2688 3.68213 10.5ZM13.4297 15.6149C14.437 14.2732 15.0555 12.4761 15.0555 10.5C15.0555 8.52387 14.437 6.72679 13.4297 5.38506C14.4097 4.27542 15.6648 3.66313 16.9723 3.66313C19.9191 3.66313 22.3179 6.729 22.3179 10.5C22.3179 11.3112 22.2065 12.0893 22.0018 12.8121C22.0473 11.1233 21.2833 9.70424 20.0305 9.3992C18.4752 9.01901 16.7472 10.4978 16.1787 12.695C15.6467 14.7529 16.3197 16.7224 17.6862 17.275C17.452 17.3148 17.2133 17.3391 16.97 17.3391C15.6603 17.3369 14.4097 16.7268 13.4297 15.6149Z" fill="#454545"/>
                                <line x1="5.27279" y1="2" x2="22" y2="18.7272" stroke="#454545" strokeWidth="1.8" strokeLinecap="round"/>
                              </svg>
                              <span className="text-[#454545] text-[12px] font-medium">Private</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Save and Cancel Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 relative z-10 self-stretch w-full">
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
                  {selectedCount > 0 ? `Save (${selectedCount})` : 'Save'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Unified CreateSpaceModal */}
      <CreateSpaceModal
        isOpen={showCreateNew}
        onClose={() => setShowCreateNew(false)}
        onSuccess={handleTreasuryCreated}
        mode="full"
        title="New treasury"
        nameLabel="Name"
        namePlaceholder='Like "Place to go"'
        submitLabel="Create"
      />
    </div>
  );
};

export default ChooseTreasuriesModal;
