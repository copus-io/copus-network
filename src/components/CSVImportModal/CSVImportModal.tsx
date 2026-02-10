import React, { useState } from 'react';
import { useToast } from '../ui/toast';

interface CSVRecord {
  id?: string;
  title?: string;
  note?: string;
  excerpt?: string;
  url?: string;
  tags?: string;
  created?: string;
  cover?: string;
  highlights?: string;
  favorite?: string;
}

interface ParsedCSVItem {
  id: string;
  title: string;
  description: string;
  url: string;
  coverUrl?: string;
  tags?: string[];
  created?: Date;
  highlights?: string;
  favorite: boolean;
}

export interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (data: { spaceName: string; items: ParsedCSVItem[]; isPrivate: boolean }) => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const { showToast } = useToast();

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedCSVItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [spaceName, setSpaceName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // Parse CSV content
  const parseCSV = (content: string): CSVRecord[] => {
    const lines = content.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const records: CSVRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV parsing (handles basic quotes but not all edge cases)
      const values = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const record: CSVRecord = {};
      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          record[header as keyof CSVRecord] = values[index].replace(/"/g, '');
        }
      });

      records.push(record);
    }

    return records;
  };

  // Transform CSV records to our format
  const transformCSVRecords = (records: CSVRecord[]): ParsedCSVItem[] => {
    return records
      .filter(record => record.url && record.url.trim()) // Must have URL
      .map(record => ({
        id: record.id || Math.random().toString(36).substr(2, 9),
        title: record.title?.trim() || 'Untitled',
        description: record.note?.trim() || record.excerpt?.trim() || '',
        url: record.url!.trim(),
        coverUrl: record.cover?.trim() || undefined,
        tags: record.tags ? record.tags.split(',').map(t => t.trim()).filter(t => t) : undefined,
        created: record.created ? new Date(record.created) : undefined,
        highlights: record.highlights?.trim() || undefined,
        favorite: record.favorite === 'true'
      }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      showToast('Please select a CSV file', 'error');
      return;
    }

    // File size limit: 10MB
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showToast('File too large, please select a CSV file smaller than 10MB', 'error');
      return;
    }

    try {
      setIsLoading(true);
      setCsvFile(file);

      const content = await file.text();
      const csvRecords = parseCSV(content);
      const transformedItems = transformCSVRecords(csvRecords);

      if (transformedItems.length === 0) {
        showToast('No valid entries found. Please ensure the CSV file contains title and url columns with at least one valid row.', 'error');
        return;
      }

      // 验证解析的数据质量
      const validItems = transformedItems.filter(item => {
        try {
          new URL(item.url); // 验证URL格式
          return item.title.length > 0;
        } catch {
          return false;
        }
      });

      if (validItems.length !== transformedItems.length) {
        showToast(`Parsed ${transformedItems.length} entries, ${validItems.length} are valid. Invalid URLs have been filtered out.`, 'success');
      }

      // 限制每次导入数量（防止性能问题）
      const maxItems = 1000;
      const finalItems = transformedItems.length > maxItems
        ? transformedItems.slice(0, maxItems)
        : transformedItems;

      if (transformedItems.length > maxItems) {
        showToast(`File contains ${transformedItems.length} entries, limited to first ${maxItems} for performance.`, 'success');
      }

      setParsedItems(finalItems);

      // Select all items by default
      const allIds = new Set(finalItems.map(item => item.id));
      setSelectedItems(allIds);

      // Generate default space name from file
      const defaultName = file.name.replace('.csv', '').replace(/[_-]/g, ' ');
      setSpaceName(defaultName.charAt(0).toUpperCase() + defaultName.slice(1));

      showToast(`Parsed ${transformedItems.length} items from CSV`, 'success');
    } catch (error) {
      console.error('Failed to parse CSV:', error);
      showToast('Failed to parse CSV file. Please check the format.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const selectAll = () => {
    const allIds = new Set(parsedItems.map(item => item.id));
    setSelectedItems(allIds);
  };

  const selectNone = () => {
    setSelectedItems(new Set());
  };

  const handleImport = () => {
    const selectedItemsData = parsedItems.filter(item =>
      selectedItems.has(item.id)
    );

    if (selectedItemsData.length === 0) {
      showToast('Please select at least one item to import', 'error');
      return;
    }

    if (!spaceName.trim()) {
      showToast('Please enter a space name', 'error');
      return;
    }

    onImportComplete({
      spaceName: spaceName.trim(),
      items: selectedItemsData,
      isPrivate: isPrivate
    });

    handleClose();
  };

  const handleClose = () => {
    setCsvFile(null);
    setParsedItems([]);
    setSelectedItems(new Set());
    setSpaceName('');
    setIsPrivate(false);
    setIsLoading(false);
    onClose();
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
        aria-labelledby="csv-import-title"
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
            id="csv-import-title"
            className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap"
          >
            Import from CSV
          </h2>

          {parsedItems.length === 0 ? (
            /* File Upload Phase */
            <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <label
                  htmlFor="csv-file-input"
                  className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap"
                >
                  Select CSV File
                </label>

                <div className="flex flex-col gap-3 relative self-stretch w-full flex-[0_0_auto]">
                  <div className="flex h-24 items-center justify-center px-5 py-4 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
                    <label htmlFor="csv-file-input" className="cursor-pointer text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                        <span className="text-sm font-medium text-gray-600">
                          Click to upload CSV file or drag and drop
                        </span>
                      </div>
                    </label>

                    <input
                      id="csv-file-input"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="text-sm text-gray-500">
                    <p className="font-medium mb-1">Expected CSV format:</p>
                    <p>• Required: <code className="bg-gray-100 px-1 rounded">title</code>, <code className="bg-gray-100 px-1 rounded">url</code></p>
                    <p>• Optional: <code className="bg-gray-100 px-1 rounded">note</code>, <code className="bg-gray-100 px-1 rounded">excerpt</code>, <code className="bg-gray-100 px-1 rounded">cover</code>, <code className="bg-gray-100 px-1 rounded">tags</code></p>
                  </div>
                </div>
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
              </div>
            </div>
          ) : (
            /* Preview & Selection Phase */
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
                    value={spaceName}
                    onChange={(e) => setSpaceName(e.target.value)}
                    placeholder="Enter space name"
                    className="flex-1 border-none bg-transparent [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] outline-none placeholder:text-medium-dark-grey"
                  />
                </div>
              </div>

              {/* Private Toggle */}
              <div className="flex items-center gap-3 w-full">
                <div
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                    isPrivate
                      ? 'bg-red border-red'
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {isPrivate && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Private</span>
                  <span className="text-xs text-gray-500">Only you can see this space</span>
                </div>
              </div>

              {/* Selection Controls */}
              <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex items-center gap-2">
                  <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px]">
                    {selectedItems.size} of {parsedItems.length} items selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAll}
                    className="px-3 py-1 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                    type="button"
                  >
                    Select All
                  </button>
                  <button
                    onClick={selectNone}
                    className="px-3 py-1 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                    type="button"
                  >
                    Select None
                  </button>
                </div>
              </div>

              {/* Content Preview */}
              <div className="flex flex-col gap-3 relative self-stretch w-full flex-1 overflow-y-auto max-h-[300px] pr-2">
                {parsedItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedItems.has(item.id)
                        ? 'border-red bg-red/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleItemSelection(item.id)}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                        selectedItems.has(item.id)
                          ? 'bg-red border-red'
                          : 'bg-white border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {selectedItems.has(item.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {item.coverUrl && (
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-off-black truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {item.url}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="inline-block bg-gray-100 text-gray-600 text-xs px-1 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="text-xs text-gray-400">+{item.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {item.favorite && (
                      <div className="flex-shrink-0">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                <button
                  className="inline-flex items-center justify-center gap-[15px] px-4 py-2 relative flex-[0_0_auto] rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setParsedItems([]);
                    setSelectedItems(new Set());
                    setCsvFile(null);
                  }}
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
                    disabled={selectedItems.size === 0 || !spaceName.trim()}
                    type="button"
                  >
                    <span className="relative w-fit [font-family:'Lato',Helvetica] font-bold text-white text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                      Import {selectedItems.size} Items
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red mx-auto mb-2"></div>
                <span className="text-sm text-gray-600">Parsing CSV...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;