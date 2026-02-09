import React, { useState } from 'react';
import { useToast } from '../ui/toast';

interface ArenaBlock {
  id: number;
  title?: string;
  description?: string;
  source_url?: string;
  image?: {
    original?: {
      url?: string;
    };
  };
}

interface ArenaChannel {
  id: number;
  title: string;
  description?: string;
  slug: string;
  contents: ArenaBlock[];
}

export interface ArenaImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (data: { spaceName: string; blocks: ArenaBlock[]; isPrivate: boolean }) => void;
}

export const ArenaImportModal: React.FC<ArenaImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const { showToast } = useToast();

  const [arenaUrl, setArenaUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [channelData, setChannelData] = useState<ArenaChannel | null>(null);
  const [selectedBlocks, setSelectedBlocks] = useState<Set<number>>(new Set());
  const [customSpaceName, setCustomSpaceName] = useState('');

  // Extract slug from Are.na URL
  const extractSlugFromUrl = (url: string): string | null => {
    try {
      const patterns = [
        /arena\.com\/([^\/]+)\/([^\/\?]+)/,  // arena.com/user/channel
        /api\.are\.na\/v3\/channels\/([^\/\?]+)/ // API URL
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return match[match.length - 1]; // Get the last capture group (channel slug)
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const fetchArenaChannel = async () => {
    const slug = extractSlugFromUrl(arenaUrl);
    if (!slug) {
      showToast('Please enter a valid Are.na channel URL', 'error');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`https://api.are.na/v3/channels/${slug}/contents`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch channel: ${response.status}`);
      }

      const data = await response.json();
      setChannelData(data);
      setCustomSpaceName(data.title || '');

      // Select all blocks by default
      const blockIds = new Set(data.contents.map((block: ArenaBlock) => block.id));
      setSelectedBlocks(blockIds);

      showToast(`Found ${data.contents.length} items in "${data.title}"`, 'success');
    } catch (error) {
      console.error('Failed to fetch Arena channel:', error);
      showToast('Failed to fetch Are.na channel. Please check the URL and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBlockSelection = (blockId: number) => {
    const newSelection = new Set(selectedBlocks);
    if (newSelection.has(blockId)) {
      newSelection.delete(blockId);
    } else {
      newSelection.add(blockId);
    }
    setSelectedBlocks(newSelection);
  };

  const handleImport = () => {
    if (!channelData) return;

    const selectedBlocksData = channelData.contents.filter(block =>
      selectedBlocks.has(block.id)
    );

    if (selectedBlocksData.length === 0) {
      showToast('Please select at least one item to import', 'error');
      return;
    }

    const spaceName = customSpaceName.trim() || channelData.title;

    onImportComplete({
      spaceName,
      blocks: selectedBlocksData,
      isPrivate: true // Arena导入也默认为私享空间，保护用户的收藏内容
    });

    handleClose();
  };

  const handleClose = () => {
    setArenaUrl('');
    setChannelData(null);
    setSelectedBlocks(new Set());
    setCustomSpaceName('');
    setIsLoading(false);
    onClose();
  };

  const selectAll = () => {
    if (!channelData) return;
    const allIds = new Set(channelData.contents.map(block => block.id));
    setSelectedBlocks(allIds);
  };

  const selectNone = () => {
    setSelectedBlocks(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="flex flex-col w-[700px] max-w-[90vw] max-h-[80vh] items-center gap-5 p-[30px] relative bg-white rounded-[15px] z-10"
        role="dialog"
        aria-labelledby="arena-import-title"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M1 13L13 1" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="flex flex-col items-start gap-[20px] relative self-stretch w-full flex-[0_0_auto] pt-5 overflow-hidden">
          <h2
            id="arena-import-title"
            className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap"
          >
            Import from Are.na
          </h2>

          {!channelData ? (
            /* URL Input Phase */
            <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <label
                  htmlFor="arena-url-input"
                  className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap"
                >
                  Are.na Channel URL
                </label>
                <div className="flex h-12 items-center px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                  <input
                    id="arena-url-input"
                    type="url"
                    value={arenaUrl}
                    onChange={(e) => setArenaUrl(e.target.value)}
                    placeholder="https://www.are.na/user/channel-name"
                    className="flex-1 border-none bg-transparent [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] outline-none placeholder:text-medium-dark-grey"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && arenaUrl.trim()) {
                        fetchArenaChannel();
                      }
                    }}
                  />
                </div>
                <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-gray-400 text-sm tracking-[0] leading-[18px]">
                  Enter a public Are.na channel URL to import its contents
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <button
                  className="inline-flex items-center justify-center gap-[30px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={handleClose}
                  type="button"
                >
                  <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                    Cancel
                  </span>
                </button>

                <button
                  className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[100px] bg-red cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red/90 transition-colors"
                  onClick={fetchArenaChannel}
                  disabled={isLoading || !arenaUrl.trim()}
                  type="button"
                >
                  <span className="relative w-fit [font-family:'Lato',Helvetica] font-bold text-white text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                    {isLoading ? 'Loading...' : 'Fetch Channel'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Channel Preview & Selection Phase */
            <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto] overflow-hidden">
              {/* Space Name */}
              <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <label
                  htmlFor="space-name-input"
                  className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap"
                >
                  Space Name
                </label>
                <div className="flex h-12 items-center px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                  <input
                    id="space-name-input"
                    type="text"
                    value={customSpaceName}
                    onChange={(e) => setCustomSpaceName(e.target.value)}
                    placeholder="Enter space name"
                    className="flex-1 border-none bg-transparent [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] outline-none placeholder:text-medium-dark-grey"
                  />
                </div>
              </div>

              {/* Selection Controls */}
              <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex items-center gap-2">
                  <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px]">
                    {selectedBlocks.size} of {channelData.contents.length} items selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAll}
                    className="px-3 py-1 text-sm rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                    type="button"
                  >
                    Select All
                  </button>
                  <button
                    onClick={selectNone}
                    className="px-3 py-1 text-sm rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                    type="button"
                  >
                    Select None
                  </button>
                </div>
              </div>

              {/* Content Preview */}
              <div className="flex flex-col gap-3 relative self-stretch w-full flex-1 overflow-y-auto max-h-[300px] pr-2">
                {channelData.contents.map((block) => (
                  <div
                    key={block.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedBlocks.has(block.id)
                        ? 'border-red bg-red/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleBlockSelection(block.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBlocks.has(block.id)}
                      onChange={() => toggleBlockSelection(block.id)}
                      className="mt-1 cursor-pointer"
                    />

                    {block.image?.original?.url && (
                      <img
                        src={block.image.original.url}
                        alt={block.title || 'Block image'}
                        className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-off-black truncate">
                        {block.title || 'Untitled'}
                      </h4>
                      {block.source_url && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {block.source_url}
                        </p>
                      )}
                      {block.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {block.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                <button
                  className="inline-flex items-center justify-center gap-[15px] px-4 py-2 relative flex-[0_0_auto] rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setChannelData(null)}
                  type="button"
                >
                  <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-sm tracking-[0] leading-[19.6px] whitespace-nowrap">
                    ← Back
                  </span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    className="inline-flex items-center justify-center gap-[30px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={handleClose}
                    type="button"
                  >
                    <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                      Cancel
                    </span>
                  </button>

                  <button
                    className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[100px] bg-red cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red/90 transition-colors"
                    onClick={handleImport}
                    disabled={selectedBlocks.size === 0 || !customSpaceName.trim()}
                    type="button"
                  >
                    <span className="relative w-fit [font-family:'Lato',Helvetica] font-bold text-white text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                      Import {selectedBlocks.size} Items
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArenaImportModal;