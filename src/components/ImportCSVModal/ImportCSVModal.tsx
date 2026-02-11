import React, { useState, useRef } from 'react';
import { useToast } from '../ui/toast';
import {
  parseCSV,
  generateCSVTemplate,
  detectAndConvertEncoding,
  normalizeUrl,
  type ImportedBookmark,
  type CSVParseResult
} from '../../utils/csvUtils';

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
  const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Reset state
  const resetState = () => {
    setStep('upload');
    setParseResult(null);
    setSelectedItems(new Set());
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await detectAndConvertEncoding(file);
      const result = parseCSV(content);

      setParseResult(result);

      if (result.success) {
        // Select all valid items by default
        setSelectedItems(new Set(Array.from({ length: result.data.length }, (_, i) => i)));
        setStep('preview');
        showToast(`Successfully parsed ${result.validRows} bookmarks`, 'success');
      } else {
        showToast(`Parse failed: ${result.errors[0]}`, 'error');
      }

      // Show warning messages
      if (result.errors.length > 0) {
        console.warn('CSV parsing warnings:', result.errors);
      }
    } catch (error) {
      console.error('File processing failed:', error);
      showToast('File processing failed, please check file format', 'error');
    }
  };

  // Toggle selection state
  const toggleItemSelection = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  // Select all / Deselect all
  const toggleSelectAll = () => {
    if (selectedItems.size === parseResult?.data.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(Array.from({ length: parseResult?.data.length || 0 }, (_, i) => i)));
    }
  };

  // Execute import
  const handleImport = async () => {
    if (!parseResult || selectedItems.size === 0) return;

    setIsImporting(true);
    setStep('importing');

    try {
      const itemsToImport = Array.from(selectedItems).map(index => ({
        ...parseResult.data[index],
        url: normalizeUrl(parseResult.data[index].url) // Normalize URL
      }));

      await onImport(itemsToImport);
      showToast(`Successfully imported ${itemsToImport.length} bookmarks`, 'success');
      onClose();
      resetState();
    } catch (error) {
      console.error('Import failed:', error);
      showToast(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      setStep('preview'); // Return to preview state
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
          disabled={isImporting}
        >
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M1 13L13 1" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Title bar */}
        <div className="flex items-center justify-between pt-10 px-6 pb-3">
          <h2 className="text-2xl font-normal text-gray-800">
            {step === 'upload' && 'Import bookmarks'}
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
                    <p className="text-sm text-gray-500">Supports CSV files only</p>
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
                      Select File
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadTemplate();
                      }}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-[100px] text-base font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Download CSV Template
                    </button>
                  </div>
                </div>
              </div>

              {/* File Format Guide */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">File Format Guide</h4>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📄</span>
                    </div>
                    <h5 className="font-semibold text-gray-800">CSV File Format</h5>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Structured data file with title, URL, and optional fields
                  </p>

                  <div className="bg-white/50 p-3 rounded-lg">
                    <h6 className="font-medium text-gray-800 mb-2 text-xs uppercase tracking-wide">Supported Fields</h6>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="font-medium text-green-700">title*</span> Title</div>
                      <div><span className="font-medium text-green-700">url*</span> Link</div>
                      <div><span className="font-medium text-gray-500">recommendation</span> Recommendation/notes (optional)</div>
                      <div><span className="font-medium text-gray-500">cover</span> Cover image URL (optional)</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">* Required fields</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && parseResult && (
            <div className="px-6 pt-2 pb-4 space-y-3 flex flex-col h-full overflow-hidden">
              {/* Top statistics card */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-3 rounded-lg border" style={{ borderColor: '#22c55e' }}>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h4 className="text-base font-bold text-green-800">
                    Successfully parsed: {parseResult.validRows} valid records
                  </h4>
                </div>
              </div>

              {/* Warning messages (if any) */}
              {parseResult.errors.length > 0 && (
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
                        {parseResult.errors.length > 3 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-red hover:text-red/80 font-medium">
                              View more ({parseResult.errors.length - 3})
                            </summary>
                            <div className="mt-2 space-y-1">
                              {parseResult.errors.slice(3).map((error, index) => (
                                <div key={index + 3}>• {error}</div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data preview */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm w-full">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-800">Data Preview</h3>
                  <button
                    onClick={toggleSelectAll}
                    className="inline-flex items-center justify-center h-7 px-2.5 rounded-[15px] text-xs font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition-colors"
                  >
                    {selectedItems.size === parseResult.data.length ? 'Deselect All' : 'Select All'}
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
                        {parseResult.data.some(item => item.cover) && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Cover</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parseResult.data.slice(0, 20).map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div
                              onClick={() => toggleItemSelection(index)}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                                selectedItems.has(index)
                                  ? 'bg-red border-red'
                                  : 'bg-white border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {selectedItems.has(index) && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900 truncate max-w-xs" title={item.title}>
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs mt-1" title={item.description}>
                                {item.description}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 max-w-[180px]">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm truncate block underline"
                              title={item.url}
                            >
                              {item.url.length > 25 ? `${item.url.substring(0, 25)}...` : item.url}
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600">
                              {item.category ? (
                                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">{item.category}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </span>
                          </td>
                          {parseResult.data.some(item => item.cover) && (
                            <td className="px-4 py-3">
                              {item.cover ? (
                                <img
                                  src={item.cover}
                                  alt="Cover"
                                  className="w-8 h-8 object-cover rounded border"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span className="text-gray-400 text-xs">None</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {parseResult.data.length > 20 && (
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-center">
                      <p className="text-sm text-gray-600">
                        {parseResult.data.length - 20} more records not shown
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
                    Importing <span className="font-semibold text-blue-600">{selectedItems.size}</span> records to your space
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
        {step !== 'importing' && (
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
                disabled={selectedItems.size === 0}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-[100px] bg-red cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red/90 transition-colors"
              >
                <span className="[font-family:'Lato',Helvetica] font-normal text-white text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                  {selectedItems.size > 0 ? `Import ${selectedItems.size} Items` : 'Select items to import'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
