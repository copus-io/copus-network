import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../ui/toast';
import { AuthService } from '../../services/authService';
import {
  parseCSV,
  generateCSVTemplate,
  detectAndConvertEncoding,
  normalizeUrl,
  type ImportedBookmark,
  type CSVParseResult
} from '../../utils/csvUtils';

// Extended bookmark type with fetched metadata
interface EnrichedBookmark extends ImportedBookmark {
  fetchedTitle?: string;
  fetchedDescription?: string;
  fetchedCover?: string;
  isFetching?: boolean;
  isImportable?: boolean; // Has URL and title (original or fetched)
}

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (bookmarks: ImportedBookmark[]) => Promise<void>;
}

export const ImportCSVModal: React.FC<ImportCSVModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [step, setStep] = useState<'upload' | 'fetching' | 'preview' | 'importing'>('upload');
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [enrichedData, setEnrichedData] = useState<EnrichedBookmark[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [fetchProgress, setFetchProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Calculate importable items (have URL and title)
  const importableIndices = enrichedData
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      const hasUrl = item.url && item.url.trim() !== '';
      const hasTitle = (item.title && item.title.trim() !== '') ||
                       (item.fetchedTitle && item.fetchedTitle.trim() !== '');
      return hasUrl && hasTitle;
    })
    .map(({ index }) => index);

  const importableCount = importableIndices.length;
  const selectedImportableCount = Array.from(selectedItems).filter(i => importableIndices.includes(i)).length;

  // Reset state
  const resetState = () => {
    setStep('upload');
    setParseResult(null);
    setEnrichedData([]);
    setSelectedItems(new Set());
    setIsImporting(false);
    setFetchProgress({ current: 0, total: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fetch metadata for items missing title or cover
  const fetchMetadataForItems = async (data: ImportedBookmark[]) => {
    const enriched: EnrichedBookmark[] = data.map(item => ({ ...item }));

    // Find items that need metadata fetching (missing title or cover, but have URL)
    const itemsNeedingFetch = enriched
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        const hasUrl = item.url && item.url.trim() !== '';
        const needsTitle = !item.title || item.title.trim() === '';
        const needsCover = !item.cover || item.cover.trim() === '';
        return hasUrl && (needsTitle || needsCover);
      });

    if (itemsNeedingFetch.length === 0) {
      // Mark importable status
      enriched.forEach(item => {
        const hasUrl = item.url && item.url.trim() !== '';
        const hasTitle = item.title && item.title.trim() !== '';
        item.isImportable = hasUrl && hasTitle;
      });
      return enriched;
    }

    setFetchProgress({ current: 0, total: itemsNeedingFetch.length });

    // Fetch in batches of 5
    const batchSize = 5;
    for (let i = 0; i < itemsNeedingFetch.length; i += batchSize) {
      const batch = itemsNeedingFetch.slice(i, i + batchSize);

      const promises = batch.map(async ({ item, index }) => {
        try {
          const metadata = await AuthService.fetchUrlMetadata(item.url);
          return { index, metadata };
        } catch (error) {
          return { index, metadata: null };
        }
      });

      const results = await Promise.all(promises);

      results.forEach(({ index, metadata }) => {
        if (metadata) {
          // Auto-fill title if missing
          if ((!enriched[index].title || enriched[index].title.trim() === '') && metadata.title) {
            enriched[index].fetchedTitle = metadata.title.substring(0, 75);
          }
          // Auto-fill description if missing
          if ((!enriched[index].category || enriched[index].category.trim() === '') && metadata.description) {
            enriched[index].fetchedDescription = metadata.description.substring(0, 1000);
          }
          // Auto-fill cover if missing
          if ((!enriched[index].cover || enriched[index].cover.trim() === '') && metadata.ogImage) {
            enriched[index].fetchedCover = metadata.ogImage;
          }
        }
      });

      setFetchProgress({ current: Math.min(i + batchSize, itemsNeedingFetch.length), total: itemsNeedingFetch.length });
    }

    // Mark importable status
    enriched.forEach(item => {
      const hasUrl = item.url && item.url.trim() !== '';
      const hasTitle = (item.title && item.title.trim() !== '') ||
                       (item.fetchedTitle && item.fetchedTitle.trim() !== '');
      item.isImportable = hasUrl && hasTitle;
    });

    return enriched;
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await detectAndConvertEncoding(file);
      const result = parseCSV(content);

      setParseResult(result);

      if (result.success && result.data.length > 0) {
        // Move to fetching step
        setStep('fetching');

        // Fetch metadata for items
        const enriched = await fetchMetadataForItems(result.data);
        setEnrichedData(enriched);

        // Select all importable items by default
        const importable = enriched
          .map((item, index) => ({ item, index }))
          .filter(({ item }) => item.isImportable)
          .map(({ index }) => index);
        setSelectedItems(new Set(importable));

        setStep('preview');

        const notImportableCount = enriched.length - importable.length;
        if (notImportableCount > 0) {
          showToast(`${notImportableCount} items cannot be imported (missing URL or title)`, 'warning');
        }
      } else {
        showToast(`Parse failed: ${result.errors[0] || 'No data found'}`, 'error');
      }

      if (result.errors.length > 0) {
        console.warn('CSV parsing warnings:', result.errors);
      }
    } catch (error) {
      console.error('File processing failed:', error);
      showToast('File processing failed, please check file format', 'error');
    }
  };

  // Toggle selection state (only for importable items)
  const toggleItemSelection = (index: number) => {
    if (!importableIndices.includes(index)) return; // Can't select non-importable items

    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  // Select all / Deselect all (only importable items)
  const toggleSelectAll = () => {
    if (selectedImportableCount === importableCount) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(importableIndices));
    }
  };

  // Execute import
  const handleImport = async () => {
    if (!enrichedData || selectedImportableCount === 0) return;

    setIsImporting(true);
    setStep('importing');

    try {
      // Build final items with merged data
      const itemsToImport: ImportedBookmark[] = Array.from(selectedItems)
        .filter(index => importableIndices.includes(index))
        .map(index => {
          const item = enrichedData[index];
          return {
            title: item.title || item.fetchedTitle || '',
            url: normalizeUrl(item.url),
            category: item.category || item.fetchedDescription || '',
            cover: item.cover || item.fetchedCover || ''
          };
        });

      await onImport(itemsToImport);
      showToast(`Successfully imported ${itemsToImport.length} bookmarks`, 'success');
      onClose();
      resetState();
    } catch (error) {
      console.error('Import failed:', error);
      showToast(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      setStep('preview');
    } finally {
      setIsImporting(false);
    }
  };

  // Download CSV template
  const downloadTemplate = () => {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'copus-bookmarks-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('CSV template downloaded', 'success');
  };

  // Get display title for an item
  const getDisplayTitle = (item: EnrichedBookmark) => {
    if (item.title && item.title.trim() !== '') return item.title;
    if (item.fetchedTitle) return item.fetchedTitle;
    return '';
  };

  // Get display cover for an item
  const getDisplayCover = (item: EnrichedBookmark) => {
    if (item.cover && item.cover.trim() !== '') return item.cover;
    if (item.fetchedCover) return item.fetchedCover;
    return '';
  };

  // Get display recommendation for an item
  const getDisplayRecommendation = (item: EnrichedBookmark) => {
    if (item.category && item.category.trim() !== '') return item.category;
    if (item.fetchedDescription) return item.fetchedDescription;
    return '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative">
        {/* Close button */}
        <button
          onClick={() => {
            onClose();
            resetState();
          }}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer z-10"
          disabled={isImporting || step === 'fetching'}
        >
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M1 13L13 1" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Title bar */}
        <div className="flex items-center justify-between pt-10 px-6 pb-3">
          <h2 className="text-2xl font-normal text-gray-800">
            {step === 'upload' && 'Import bookmarks'}
            {step === 'fetching' && 'Fetching metadata...'}
            {step === 'preview' && 'Preview import data'}
            {step === 'importing' && 'Importing...'}
          </h2>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden">
          {step === 'upload' && (
            <div className="p-6">
              {/* Upload area */}
              <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 hover:bg-gray-50/30 transition-all duration-200 cursor-pointer group"
                   onClick={() => fileInputRef.current?.click()}>
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-gray-200 transition-colors">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-800 mb-1">Drop or click to upload</h3>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-[100px] text-base font-medium transition-colors hover:bg-red/90 bg-red"
                      style={{ color: '#ffffff' }}
                    >
                      Upload CSV file
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadTemplate();
                      }}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-[100px] text-base font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Download template
                    </button>
                  </div>
                </div>
              </div>

              {/* CSV File Format */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">CSV File Format</h4>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                  <div className="bg-white/50 p-3 rounded-lg">
                    <h6 className="font-medium text-gray-800 mb-2 text-xs uppercase tracking-wide">Supported Fields</h6>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="font-medium text-green-700">url*</span> Link (required)</div>
                      <div><span className="font-medium text-green-700">title*</span> Required (auto-fetched if blank)</div>
                      <div><span className="font-medium text-gray-500">recommendation</span> Notes (optional)</div>
                      <div><span className="font-medium text-green-700">cover*</span> Required (auto-fetched if blank)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'fetching' && (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-6 max-w-md">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-800">Fetching metadata</h3>
                  <p className="text-gray-600">
                    Getting titles and cover images from URLs...
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && enrichedData.length > 0 && (
            <div className="px-6 pt-2 pb-4 space-y-3 flex flex-col h-full overflow-hidden">
              {/* Warning messages (if any) */}
              {parseResult && parseResult.errors.length > 0 && (
                <div className="border-l-4 border-red px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(242, 58, 0, 0.05)' }}>
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-red mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="font-medium text-red text-sm mb-1">Found {parseResult.errors.length} issues</h4>
                      <div className="text-sm text-red/80 space-y-1">
                        {parseResult.errors.slice(0, 3).map((error, index) => (
                          <div key={index}>• {error}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">Note:</span> All imported items will be saved as <span className="font-semibold">private works</span>. You can change their visibility after importing.
                  </p>
                </div>
              </div>

              {/* Data preview */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm w-full">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-800">
                    Data Preview
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({importableCount} of {enrichedData.length} importable)
                    </span>
                  </h3>
                  <button
                    onClick={toggleSelectAll}
                    className="inline-flex items-center justify-center h-7 px-2.5 rounded-[15px] text-xs font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition-colors"
                  >
                    {selectedImportableCount === importableCount ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto overflow-x-hidden">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-16">Select</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">URL</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Recommendation</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-20">Cover</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {enrichedData.slice(0, 50).map((item, index) => {
                        const isImportable = importableIndices.includes(index);
                        const displayTitle = getDisplayTitle(item);
                        const displayCover = getDisplayCover(item);
                        const displayRecommendation = getDisplayRecommendation(item);
                        const isTitleFetched = !item.title && item.fetchedTitle;
                        const isCoverFetched = !item.cover && item.fetchedCover;

                        return (
                          <tr
                            key={index}
                            className={`transition-colors ${isImportable ? 'hover:bg-gray-50' : 'bg-gray-100 opacity-60'}`}
                          >
                            <td className="px-4 py-3">
                              <div
                                onClick={() => toggleItemSelection(index)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  !isImportable
                                    ? 'bg-gray-200 border-gray-300 cursor-not-allowed'
                                    : selectedItems.has(index)
                                      ? 'bg-red border-red cursor-pointer'
                                      : 'bg-white border-gray-300 hover:border-gray-400 cursor-pointer'
                                }`}
                              >
                                {selectedItems.has(index) && isImportable && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {displayTitle ? (
                                <div
                                  className={`font-medium truncate max-w-xs ${isTitleFetched ? 'text-blue-600' : 'text-gray-900'}`}
                                  title={`${displayTitle}${isTitleFetched ? ' (auto-fetched)' : ''}`}
                                >
                                  {displayTitle}
                                  {isTitleFetched && (
                                    <span className="ml-1 text-xs text-blue-500">(fetched)</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-red text-sm">Missing title</span>
                              )}
                            </td>
                            <td className="px-4 py-3 max-w-[180px]">
                              {item.url ? (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm truncate block underline"
                                  title={item.url}
                                >
                                  {item.url.length > 25 ? `${item.url.substring(0, 25)}...` : item.url}
                                </a>
                              ) : (
                                <span className="text-red text-sm">Missing URL</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {displayRecommendation ? (
                                <span
                                  className={`text-sm truncate block max-w-[150px] ${item.fetchedDescription && !item.category ? 'text-blue-600' : 'text-gray-600'}`}
                                  title={displayRecommendation}
                                >
                                  {displayRecommendation.length > 30 ? `${displayRecommendation.substring(0, 30)}...` : displayRecommendation}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">None</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {displayCover ? (
                                <div className="relative">
                                  <img
                                    src={displayCover}
                                    alt="Cover"
                                    className={`w-10 h-10 object-cover rounded border ${isCoverFetched ? 'border-blue-400' : ''}`}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                  {isCoverFetched && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" title="Auto-fetched" />
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">None</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {enrichedData.length > 50 && (
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-center">
                      <p className="text-sm text-gray-600">
                        {enrichedData.length - 50} more records not shown
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-6 max-w-md">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <svg className="w-10 h-10 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-800">Importing your bookmarks</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Importing <span className="font-semibold text-blue-600">{selectedImportableCount}</span> records to your space
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 text-sm text-blue-700">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Please do not close this window, import may take a few minutes</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {step !== 'importing' && step !== 'fetching' && (
          <div className="flex items-center justify-end gap-2.5 px-6 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                onClose();
                resetState();
              }}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <span className="[font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                Cancel
              </span>
            </button>
            {step === 'preview' && (
              <button
                onClick={handleImport}
                disabled={selectedImportableCount === 0}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-[100px] bg-red cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red/90 transition-colors"
              >
                <span className="[font-family:'Lato',Helvetica] font-normal text-white text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                  {selectedImportableCount > 0 ? `Import ${selectedImportableCount} Items` : 'No items to import'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
