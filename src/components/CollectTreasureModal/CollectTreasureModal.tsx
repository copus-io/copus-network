import React, { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import { AuthService } from "../../services/authService";
import { useToast } from "../ui/toast";

interface CollectTreasureModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
  articleTitle: string;
  isAlreadyCollected?: boolean;
  onCollect: (articleId: string, spaceCategory: string, isNewSpace: boolean) => Promise<void>;
  onUncollect?: (articleId: string) => Promise<void>;
}

interface Collection {
  id: string;
  name: string;
  image: string;
  isSaved: boolean;
}

export const CollectTreasureModal: React.FC<CollectTreasureModalProps> = ({
  isOpen,
  onClose,
  articleId,
  articleTitle,
  isAlreadyCollected = false,
  onCollect,
  onUncollect,
}) => {
  const { user } = useUser();
  const { showToast } = useToast();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newTreasuryName, setNewTreasuryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCollectedOnce, setHasCollectedOnce] = useState(false);

  // Fetch user's existing collections (categories)
  useEffect(() => {
    const fetchCollections = async () => {
      if (!isOpen || !user?.id) return;

      try {
        setLoading(true);
        const likedResponse = await AuthService.getMyLikedArticlesCorrect(1, 100, user.id);

        let articlesArray: any[] = [];
        if (likedResponse?.data?.data && Array.isArray(likedResponse.data.data)) {
          articlesArray = likedResponse.data.data;
        } else if (likedResponse?.data && Array.isArray(likedResponse.data)) {
          articlesArray = likedResponse.data;
        } else if (Array.isArray(likedResponse)) {
          articlesArray = likedResponse;
        }

        // Check if this article is already in the user's liked articles
        const isArticleAlreadySaved = articlesArray.some(
          (article: any) => article.uuid === articleId
        );

        // Group by category with first article's cover image
        const categoryMap = new Map<string, { count: number; image: string }>();
        articlesArray.forEach((article: any) => {
          const category = article.categoryInfo?.name || 'General';
          if (!categoryMap.has(category)) {
            categoryMap.set(category, {
              count: 1,
              image: article.coverUrl || 'https://c.animaapp.com/eANMvAF7/img/ellipse-55-3@2x.png'
            });
          } else {
            const existing = categoryMap.get(category)!;
            categoryMap.set(category, { ...existing, count: existing.count + 1 });
          }
        });

        // Add user's treasury as first option - mark as saved if article is already in treasury
        const collectionOptions: Collection[] = [{
          id: 'treasury',
          name: `${user.username || 'My'}'s treasury`,
          image: user.faceUrl || 'https://c.animaapp.com/eANMvAF7/img/ellipse-55-3@2x.png',
          isSaved: isAlreadyCollected || isArticleAlreadySaved,
        }];

        // Add category-based collections
        Array.from(categoryMap.entries()).forEach(([category, data]) => {
          collectionOptions.push({
            id: category,
            name: category,
            image: data.image,
            isSaved: false,
          });
        });

        setCollections(collectionOptions);
        setHasCollectedOnce(isAlreadyCollected || isArticleAlreadySaved);
      } catch (err) {
        console.error('Failed to fetch collections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [isOpen, user?.id, user?.username, user?.faceUrl, articleId, isAlreadyCollected]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setShowCreateNew(false);
      setNewTreasuryName("");
      setIsSubmitting(false);
      setHasCollectedOnce(false);
    }
  }, [isOpen]);

  const handleToggleSave = async (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    // If already saved, toggle off (uncollect)
    if (collection.isSaved) {
      // Only allow uncollect from treasury (the main collection)
      if (collectionId === 'treasury' && onUncollect) {
        try {
          setIsSubmitting(true);
          await onUncollect(articleId);
          setCollections(prev =>
            prev.map(c => c.id === collectionId ? { ...c, isSaved: false } : c)
          );
          setHasCollectedOnce(false);
          showToast('Removed from treasury', 'success');
        } catch (err) {
          console.error('Failed to uncollect:', err);
          showToast('Failed to remove', 'error');
        } finally {
          setIsSubmitting(false);
        }
      } else {
        // For other collections, just toggle visually
        setCollections(prev =>
          prev.map(c => c.id === collectionId ? { ...c, isSaved: false } : c)
        );
      }
      return;
    }

    // Save to this collection
    try {
      setIsSubmitting(true);

      // Update UI immediately
      setCollections(prev =>
        prev.map(c => c.id === collectionId ? { ...c, isSaved: true } : c)
      );

      // Perform the actual save (only call API if not already collected)
      if (!hasCollectedOnce) {
        await onCollect(articleId, collection.name, false);
        setHasCollectedOnce(true);
      }

      showToast(`Saved to "${collection.name}"`, 'success');
      // Don't close modal - allow user to save to multiple places
    } catch (err) {
      console.error('Failed to save:', err);
      // Revert UI on error
      setCollections(prev =>
        prev.map(c => c.id === collectionId ? { ...c, isSaved: false } : c)
      );
      showToast('Failed to save', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNewTreasury = async () => {
    if (!newTreasuryName.trim()) {
      showToast('Please enter a treasury name', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      if (!hasCollectedOnce) {
        await onCollect(articleId, newTreasuryName.trim(), true);
        setHasCollectedOnce(true);
      }

      showToast(`Created and saved to "${newTreasuryName.trim()}"`, 'success');

      // Add the new treasury to collections list
      setCollections(prev => [...prev, {
        id: newTreasuryName.trim(),
        name: newTreasuryName.trim(),
        image: 'https://c.animaapp.com/eANMvAF7/img/ellipse-55-3@2x.png',
        isSaved: true,
      }]);

      setShowCreateNew(false);
      setNewTreasuryName("");
      // Don't close modal
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="flex flex-col w-[582px] max-w-[90vw] items-center gap-5 p-[30px] relative bg-white rounded-[15px] z-10 max-h-[80vh]"
        role="dialog"
        aria-labelledby="collect-dialog-title"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          onClick={onClose}
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
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex flex-col items-start justify-center gap-5 relative self-stretch w-full flex-[0_0_auto]">
              <h2
                id="collect-dialog-title"
                className="relative w-fit mt-2 [font-family:'Lato',Helvetica] font-semibold text-off-black text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap"
              >
                Collect treasures
              </h2>

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

            {/* Collections List */}
            <div className="flex flex-col items-start gap-0 relative self-stretch w-full flex-[0_0_auto] max-h-[320px] overflow-y-auto">
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
                      className="flex items-center justify-between px-0 py-5 self-stretch w-full bg-white border-b [border-bottom-style:solid] border-light-grey"
                    >
                      <div className="inline-flex items-center justify-center gap-[15px] relative flex-[0_0_auto]">
                        <img
                          className="relative w-12 h-12 object-cover rounded-full"
                          alt={collection.name}
                          src={collection.image}
                        />
                        <div className="inline-flex flex-col items-start justify-center gap-2 relative flex-[0_0_auto]">
                          <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-lg tracking-[0] leading-[23.4px] whitespace-nowrap">
                            {collection.name}
                          </span>
                        </div>
                      </div>

                      <button
                        className="inline-flex items-center gap-2.5 relative flex-[0_0_auto] cursor-pointer disabled:opacity-50"
                        onClick={() => handleToggleSave(collection.id)}
                        type="button"
                        disabled={isSubmitting}
                        aria-pressed={collection.isSaved}
                        aria-label={
                          collection.isSaved
                            ? `Remove from ${collection.name}`
                            : `Save to ${collection.name}`
                        }
                      >
                        {collection.isSaved ? (
                          <div className="inline-flex items-center justify-center gap-1.5 px-[15px] py-[5px] relative flex-[0_0_auto] bg-red rounded-[100px]">
                            <span className="relative flex items-center justify-center w-fit [font-family:'Lato',Helvetica] font-bold text-white text-sm tracking-[0] leading-[23px] whitespace-nowrap">
                              Saved
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center gap-1.5 px-[15px] py-[5px] relative flex-[0_0_auto] rounded-[100px] border border-solid border-dark-grey hover:bg-gray-50 transition-colors">
                            <span className="relative flex items-center justify-center w-fit [font-family:'Lato',Helvetica] font-medium text-dark-grey text-sm tracking-[0] leading-[23px] whitespace-nowrap">
                              Save
                            </span>
                          </div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* New Treasury Button - Fixed at bottom */}
            <div className="flex w-full items-center gap-[15px] py-[15px] bg-white border-t border-light-grey mt-2">
              <button
                className="flex items-center gap-[15px] cursor-pointer hover:opacity-70 transition-opacity"
                type="button"
                onClick={() => setShowCreateNew(true)}
                aria-label="Create new treasury"
              >
                <img
                  className="relative w-9 h-9"
                  alt="Add"
                  src="https://c.animaapp.com/eANMvAF7/img/plus.svg"
                  aria-hidden="true"
                />
                <div className="inline-flex flex-col items-start justify-center gap-2 relative flex-[0_0_auto]">
                  <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-lg tracking-[0] leading-[23.4px] whitespace-nowrap">
                    New treasury
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectTreasureModal;
