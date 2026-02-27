import React, { useState, useEffect } from 'react';
import { useToast } from '../ui/toast';
import { apiRequest } from '../../services/api';

interface TasteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  namespace: string;
  username: string;
  totalWorks?: number; // Total curations + collections
  isTasteVisible?: boolean; // Current visibility from backend
  onVisibilityChange?: (isVisible: boolean) => void;
  userBio?: string;
  userFaceUrl?: string;
  userCoverUrl?: string;
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
  totalWorks = 0,
  isTasteVisible = true,
  onVisibilityChange,
  userBio,
  userFaceUrl,
  userCoverUrl
}) => {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'md' | 'csv' | null>(null);
  const [isPublic, setIsPublic] = useState(isTasteVisible);
  const [isToggling, setIsToggling] = useState(false);

  // Sync with prop when modal opens
  useEffect(() => {
    if (isOpen) setIsPublic(isTasteVisible);
  }, [isOpen, isTasteVisible]);

  const tasteProfileUrl = `https://copus.network/api/taste/${namespace}.json`;
  const isUnlocked = totalWorks >= 10;

  const handleToggleVisibility = async () => {
    setIsToggling(true);
    try {
      // IMPORTANT: Must include existing profile fields because the backend
      // updateUser endpoint overwrites ALL fields, not just the ones provided.
      // Sending only isTasteVisible would wipe bio, faceUrl, coverUrl.
      await apiRequest('/client/user/updateUser', {
        method: 'POST',
        body: JSON.stringify({
          isTasteVisible: !isPublic,
          userName: username,
          bio: userBio || '',
          faceUrl: userFaceUrl || '',
          coverUrl: userCoverUrl || '',
        }),
        requiresAuth: true
      });
      const newValue = !isPublic;
      setIsPublic(newValue);
      onVisibilityChange?.(newValue);
      showToast(`Taste profile is now ${newValue ? 'public' : 'private'}`, 'success');
    } catch (error) {
      showToast('Failed to update visibility', 'error');
    } finally {
      setIsToggling(false);
    }
  };

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
        <div className="mb-5">
          <h2 className="[font-family:'Lato',Helvetica] font-normal text-off-black text-2xl tracking-[0] leading-[33.6px]">Your Taste Profile</h2>
          <p className="text-sm text-gray-500 mt-1">A machine-readable database of your taste, built from everything you curate and belongs to you.</p>
        </div>

        {/* Content */}
        <div className="space-y-5">
          {/* Explainer — what this is */}
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 leading-relaxed">
            Every piece you save builds this profile. Paste the link below into ChatGPT, Claude, or any AI, and it will understand your interests and give you personalized answers. You own this data. Export it, share it, or keep it private.
          </div>

          {/* Locked state */}
          {!isUnlocked && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
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

          {/* API URL */}
          {isUnlocked && (
            <div>
              <label className="block [font-family:'Lato',Helvetica] font-medium text-off-black text-sm mb-2">
                Taste API
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm text-gray-600 truncate">
                  {tasteProfileUrl}
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="flex-shrink-0 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  title="Copy URL"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Make private — matches extension curation page design */}
          {isUnlocked && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleVisibility}
                disabled={isToggling}
                className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-200 ${!isPublic ? 'bg-[#F23A00] border-[#F23A00]' : 'border-gray-300 hover:border-gray-400'} ${isToggling ? 'opacity-50' : ''}`}
                aria-label={isPublic ? 'Make private' : 'Make public'}
                type="button"
              >
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" className={`transition-opacity duration-200 ${!isPublic ? 'opacity-100' : 'opacity-0'}`}>
                  <path d="M2 5L4.5 7.5L8 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={handleToggleVisibility}
                disabled={isToggling}
                className={`inline-flex items-center gap-1 cursor-pointer transition-opacity duration-200 hover:opacity-80 ${isToggling ? 'opacity-50' : ''}`}
                type="button"
              >
                <svg width="14" height="14" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.9723 3C15.4989 3 14.096 3.66092 12.9955 4.86118C11.9336 3.70292 10.5466 3 9.02774 3C5.7035 3 3 6.36428 3 10.5C3 14.6357 5.7035 18 9.02774 18C10.5466 18 11.9359 17.2971 12.9955 16.1388C14.0937 17.3413 15.492 18 16.9723 18C20.2965 18 23 14.6357 23 10.5C23 6.36428 20.2965 3 16.9723 3ZM3.68213 10.5C3.68213 6.73121 6.08095 3.66313 9.02774 3.66313C11.9745 3.66313 14.3734 6.729 14.3734 10.5C14.3734 11.2206 14.2847 11.9169 14.1232 12.569C14.0937 10.9885 13.3456 9.68877 12.1519 9.39699C10.5966 9.0168 8.86858 10.4956 8.30014 12.6927C8.03183 13.7339 8.05684 14.7838 8.37062 15.6503C8.65712 16.4439 9.15507 17.0053 9.79172 17.2639C9.54161 17.3103 9.28695 17.3347 9.03001 17.3347C6.07867 17.3369 3.68213 14.2688 3.68213 10.5ZM13.4297 15.6149C14.437 14.2732 15.0555 12.4761 15.0555 10.5C15.0555 8.52387 14.437 6.72679 13.4297 5.38506C14.4097 4.27542 15.6648 3.66313 16.9723 3.66313C19.9191 3.66313 22.3179 6.729 22.3179 10.5C22.3179 11.3112 22.2065 12.0893 22.0018 12.8121C22.0473 11.1233 21.2833 9.70424 20.0305 9.3992C18.4752 9.01901 16.7472 10.4978 16.1787 12.695C15.6467 14.7529 16.3197 16.7224 17.6862 17.275C17.452 17.3148 17.2133 17.3391 16.97 17.3391C15.6603 17.3369 14.4097 16.7268 13.4297 15.6149Z" fill="#454545"/>
                  <line x1="5.27279" y1="2" x2="22" y2="18.7272" stroke="#454545" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <span className="[font-family:'Lato',Helvetica] font-medium text-sm text-[#454545]">Make private</span>
              </button>
            </div>
          )}

          {/* Export Section */}
          {isUnlocked && (
            <div className="flex items-center justify-end gap-2.5 self-stretch w-full pt-1">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default TasteProfileModal;
