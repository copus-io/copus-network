import React, { useState } from 'react';
import { useToast } from '../ui/toast';

interface TasteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  namespace: string;
  username: string;
  totalWorks?: number; // Total curations + collections
}

interface TasteProfileData {
  name: string;
  namespace: string;
  url: string;
  bio: string | null;
  stats: {
    curationsCreated: number;
    publicWorks: number;
    privateWorks: number;
    itemsCollected: number;
    collectionsReceived: number;
  };
  summary: string;
  treasuries: Array<{
    name: string;
    namespace: string;
    url: string;
    articleCount: number;
    articles: Array<{
      title: string;
      uuid: string;
      url: string;
      curationNote: string | null;
      originalUrl: string | null;
      format: string;
      category: string | null;
      tags: string[];
      keywords: string | string[];
      keyTakeaways: string[];
      treasureCount: number;
      curatedAt: string | null;
    }>;
  }>;
  fetchedAt: string;
}

export const TasteProfileModal: React.FC<TasteProfileModalProps> = ({
  isOpen,
  onClose,
  namespace,
  username,
  totalWorks = 0
}) => {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'md' | 'csv' | null>(null);

  const tasteProfileUrl = `https://copus.network/api/taste/${namespace}.json`;
  const isUnlocked = totalWorks >= 10;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(tasteProfileUrl);
      showToast('Taste profile URL copied to clipboard', 'success');
    } catch (error) {
      showToast('Failed to copy URL', 'error');
    }
  };

  const fetchTasteProfile = async (): Promise<TasteProfileData | null> => {
    try {
      const response = await fetch(tasteProfileUrl);
      if (!response.ok) throw new Error('Failed to fetch taste profile');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch taste profile:', error);
      showToast('Failed to fetch taste profile', 'error');
      return null;
    }
  };

  const generateMarkdown = (data: TasteProfileData): string => {
    const lines: string[] = [];

    // Header
    lines.push(`# ${data.name}'s Taste Profile`);
    lines.push('');
    lines.push(`**Profile:** [${data.url}](${data.url})`);
    lines.push(`**Namespace:** @${data.namespace}`);
    if (data.bio) {
      lines.push(`**Bio:** ${data.bio}`);
    }
    lines.push(`**Generated:** ${new Date(data.fetchedAt).toLocaleString()}`);
    lines.push('');

    // Stats
    lines.push('## Statistics');
    lines.push('');
    lines.push(`- **Curations Created:** ${data.stats.curationsCreated}`);
    lines.push(`- **Public Works:** ${data.stats.publicWorks}`);
    lines.push(`- **Private Works:** ${data.stats.privateWorks}`);
    lines.push(`- **Items Collected:** ${data.stats.itemsCollected}`);
    lines.push(`- **Collections Received:** ${data.stats.collectionsReceived}`);
    lines.push('');

    // Summary
    if (data.summary) {
      lines.push('## Summary');
      lines.push('');
      lines.push(data.summary);
      lines.push('');
    }

    // Treasuries
    lines.push('## Treasuries & Curations');
    lines.push('');

    for (const treasury of data.treasuries) {
      lines.push(`### ${treasury.name}`);
      lines.push('');
      lines.push(`**Treasury URL:** [${treasury.url}](${treasury.url})`);
      lines.push(`**Total Items:** ${treasury.articleCount}`);
      lines.push('');

      if (treasury.articles && treasury.articles.length > 0) {
        for (const article of treasury.articles) {
          lines.push(`#### ${article.title}`);
          lines.push('');
          lines.push(`- **Copus URL:** [${article.url}](${article.url})`);
          if (article.originalUrl) {
            lines.push(`- **Original URL:** [${article.originalUrl}](${article.originalUrl})`);
          }
          if (article.curationNote) {
            lines.push(`- **Curation Note:** ${article.curationNote.replace(/\n/g, ' ')}`);
          }
          if (article.category) {
            lines.push(`- **Category:** ${article.category}`);
          }
          if (article.format) {
            lines.push(`- **Format:** ${article.format}`);
          }
          if (article.tags && article.tags.length > 0) {
            lines.push(`- **Tags:** ${article.tags.join(', ')}`);
          }
          if (article.keywords) {
            const keywordsStr = Array.isArray(article.keywords)
              ? article.keywords.join(', ')
              : article.keywords;
            if (keywordsStr) {
              lines.push(`- **Keywords:** ${keywordsStr}`);
            }
          }
          if (article.keyTakeaways && article.keyTakeaways.length > 0) {
            lines.push(`- **Key Takeaways:**`);
            for (const takeaway of article.keyTakeaways) {
              lines.push(`  - ${takeaway}`);
            }
          }
          lines.push(`- **Treasured by:** ${article.treasureCount} people`);
          if (article.curatedAt) {
            lines.push(`- **Curated:** ${new Date(article.curatedAt).toLocaleDateString()}`);
          }
          lines.push('');
        }
      }
    }

    // Footer
    lines.push('---');
    lines.push('');
    lines.push(`*This taste profile was exported from [Copus](https://copus.network) - an open-web curation network.*`);
    lines.push(`*Share this with any AI to help it understand ${data.name}'s preferences and interests.*`);

    return lines.join('\n');
  };

  const generateCSV = (data: TasteProfileData): string => {
    const rows: string[][] = [];

    // Header row
    rows.push([
      'Treasury',
      'Title',
      'Curation Note',
      'Original URL',
      'Copus URL',
      'Category',
      'Format',
      'Tags',
      'Keywords',
      'Key Takeaways',
      'Treasure Count',
      'Curated At'
    ]);

    // Data rows
    for (const treasury of data.treasuries) {
      if (treasury.articles && treasury.articles.length > 0) {
        for (const article of treasury.articles) {
          rows.push([
            treasury.name,
            article.title,
            article.curationNote ? article.curationNote.replace(/\n/g, ' ').replace(/"/g, '""') : '',
            article.originalUrl || '',
            article.url,
            article.category || '',
            article.format || '',
            article.tags ? article.tags.join('; ') : '',
            Array.isArray(article.keywords) ? article.keywords.join('; ') : (article.keywords || ''),
            article.keyTakeaways ? article.keyTakeaways.join('; ') : '',
            String(article.treasureCount || 0),
            article.curatedAt ? new Date(article.curatedAt).toLocaleDateString() : ''
          ]);
        }
      }
    }

    // Convert to CSV string with proper escaping
    return rows.map(row =>
      row.map(cell => {
        // Escape cells that contain commas, quotes, or newlines
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    ).join('\n');
  };

  const handleExport = async (format: 'md' | 'csv') => {
    setIsExporting(true);
    setExportType(format);

    try {
      const data = await fetchTasteProfile();
      if (!data) {
        setIsExporting(false);
        setExportType(null);
        return;
      }

      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'md') {
        content = generateMarkdown(data);
        filename = `${namespace}-taste-profile.md`;
        mimeType = 'text/markdown';
      } else {
        content = generateCSV(data);
        filename = `${namespace}-taste-profile.csv`;
        mimeType = 'text/csv';
      }

      // Create and download file
      const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Taste profile exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Failed to export taste profile', 'error');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[15px] max-w-lg w-full shadow-xl z-10 p-[30px]">
        {/* Close button - top right */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
          type="button"
        >
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M1 13L13 1" stroke="#686868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="[font-family:'Lato',Helvetica] font-normal text-off-black text-2xl tracking-[0] leading-[33.6px]">Your Taste Profile</h2>
          <p className="text-sm text-gray-500">Your taste, made queryable.</p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* API URL */}
          <div>
            <label className="block [font-family:'Lato',Helvetica] font-medium text-off-black text-sm mb-2">
              Taste API
            </label>

            {/* Locked state overlay */}
            {!isUnlocked && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-sm font-medium text-amber-800">
                    Curate or collect 10 works to unlock your Taste API
                  </p>
                </div>
              </div>
            )}

            <div className="relative">
              {/* Blur overlay when locked */}
              {!isUnlocked && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-lg z-10" />
              )}

              <div className={`flex items-center gap-2 ${!isUnlocked ? 'select-none' : ''}`}>
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm text-gray-600 truncate">
                  {tasteProfileUrl}
                </div>
                {isUnlocked && (
                  <button
                    onClick={handleCopyUrl}
                    className="flex-shrink-0 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Copy URL"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-3">
              Share this link with any AI to help it understand your preferences. Every work you curate or collect enriches this profile.
            </p>
          </div>

          {/* Export Section */}
          <div className="mt-2">
            <div className="flex items-center justify-end gap-2.5 self-stretch w-full">
              <button
                onClick={() => handleExport('md')}
                disabled={isExporting}
                className="inline-flex items-center justify-center gap-2 pl-[30px] pr-[30px] py-2.5 rounded-[100px] bg-red text-white [font-family:'Lato',Helvetica] font-bold text-sm hover:bg-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isExporting && exportType === 'md' ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
                Export .md
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="inline-flex items-center justify-center gap-2 pl-[30px] pr-[30px] py-2.5 rounded-[100px] border border-gray-300 text-off-black [font-family:'Lato',Helvetica] font-normal text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isExporting && exportType === 'csv' ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
                Export .csv
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasteProfileModal;
