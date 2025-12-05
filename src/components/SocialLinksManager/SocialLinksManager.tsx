import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../components/ui/toast';
import { AuthService } from '../../services/authService';

// Social platform configuration
const SOCIAL_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    placeholder: 'Enter your Instagram username or link',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGxpbmVhckdyYWRpZW50IGlkPSJpbnN0YWdyYW0iIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjA5NDMzO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjI1JSIgc3R5bGU9InN0b3AtY29sb3I6I2VjMWQ3YTtzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmNzVhNTU7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iNzUlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmNjZjMzO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmOWE4MjU7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjxyZWN0IHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgcng9IjUuNSIgZmlsbD0idXJsKCNpbnN0YWdyYW0pIi8+CjxyZWN0IHg9IjYiIHk9IjYiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgcng9IjMiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41Ii8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41Ii8+CjxjaXJjbGUgY3g9IjE3LjUiIGN5PSI2LjUiIHI9IjEiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
    color: '#E4405F',
  },
  {
    id: 'twitter',
    name: 'X / Twitter',
    placeholder: 'Enter your X (Twitter) username or link',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iMyIgZmlsbD0iIzAwMDAwMCIvPgo8cGF0aCBkPSJNMTMuMjk4IDEwLjI5TDE5LjE4IDNIMTcuNjg2TDEyLjY3IDkuMzQ2TDguNTgzIDNINEw5LjczMyAxMS45ODJMNCAyMC4wNEg1LjQ5NEwxMC41NyAxMy4xNTJMMTQuNzcgMjAuMDRIMTkuMzUzTDEzLjI5OCAxMC4yOVpNMTEuNDA3IDEyLjIyNUwxMC44NDYgMTEuNDMzTDYuMjEgMy44NUg3Ljk2TDExLjkwOSAxMC4xMzJMMTIuNDcgMTAuOTI0TDE3LjU5NSAxOC45NzZIMTUuODQ1TDExLjQwNyAxMi4yMjVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=',
    color: '#000000',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    placeholder: 'Enter your YouTube channel link',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iMyIgZmlsbD0iI0ZGMDAwMCIvPgo8cGF0aCBkPSJNMTkuNjE1IDcuNjU0Yy0uMTg4LS43MDYtLjczNi0xLjI2Mi0xLjQzOC0xLjQ1MkMxNi45MDYgNiAxMiA2IDEyIDZzLTQuOTA2IDAtNi4xNzcuMzQ4Yy0uNzAyLjE5LTEuMjUuNzQ2LTEuNDM4IDEuNDUyQzQgOC45MjggNCA5LjI5OCA0IDEyYzAgMi43MDIgMCAzLjA3Mi4zODUgNC4zNDYuMTg4LjcwNi43MzYgMS4yNjIgMS40MzggMS40NTJDNy4wOTQgMTggMTIgMTggMTIgMThzNC45MDYgMCA2LjE3Ny0uMzQ4Yy43MDItLjE5IDEuMjUtLjc0NiAxLjQzOC0xLjQ1MkMyMCAxNS4wNzIgMjAgMTQuNzAyIDIwIDEyYzAtMi43MDIgMC0zLjA3Mi0uMzg1LTQuMzQ2eiIgZmlsbD0iI0ZGMDAwMCIvPgo8cGF0aCBkPSJNOS45ODUgMTQuOTY1VjkuMDM1TDE1LjIxMyAxMmwtNS4yMjggMi45NjV6IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=',
    color: '#FF0000',
  },
  {
    id: 'other',
    name: 'Other',
    placeholder: 'Enter your personal website, blog, or any link',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ2xvYmUiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjY2NmZmO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMzYjgyZjY7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9InVybCgjZ2xvYmUpIi8+CjxwYXRoIGQ9Ik0yIDEyaDIwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Im0yIDEyYzAtMi43NSA0LjUtNSAxMC01czEwIDIuMjUgMTAgNS00LjUgNS0xMCA1LTEwLTIuMjUtMTAtNVoiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41Ii8+CjxwYXRoIGQ9Im0yIDEyYzAgMi43NSA0LjUgNSAxMCA1czEwLTIuMjUgMTAtNS00LjUtNS0xMC01LTEwIDIuMjUtMTAgNVoiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41Ii8+CjxwYXRoIGQ9Ik0xMiAyYzIuNzUgMCA1IDQuNSA1IDEwcy0yLjI1IDEwLTUgMTAtNS00LjUtNS0xMFM5LjI1IDIgMTIgMnoiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41Ii8+Cjwvc3ZnPg==',
    color: '#6366f1',
  },
];

interface SocialLinksManagerProps {
  onClose?: () => void;
}

export const SocialLinksManager: React.FC<SocialLinksManagerProps> = ({ onClose }) => {
  const { user, socialLinks, socialLinksLoading, addSocialLink, updateSocialLink, deleteSocialLink } = useUser();
  const { showToast } = useToast();
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingTitle, setIsLoadingTitle] = useState(false);
  const [detectedTitle, setDetectedTitle] = useState<string>('');
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

  // Convert base64 to file and upload to S3
  const uploadBase64Icon = async (base64Data: string, fileName: string): Promise<string> => {
    try {
      setIsUploadingIcon(true);

      // Convert base64 to Blob
      const response = await fetch(base64Data);
      const blob = await response.blob();

      // Create File object
      const file = new File([blob], fileName, { type: blob.type || 'image/svg+xml' });

      // Upload to S3
      const uploadResult = await AuthService.uploadImage(file);

      return uploadResult.url;
    } catch (error) {
      console.error('❌ Icon upload failed:', error);
      throw error;
    } finally {
      setIsUploadingIcon(false);
    }
  };

  // Fetch page title
  const fetchPageTitle = async (url: string): Promise<string> => {
    try {
      setIsLoadingTitle(true);

      // Ensure URL format is correct
      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }

      // Use CORS proxy or try fetching directly
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(formattedUrl)}`);
      const data = await response.json();

      if (data.contents) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        const titleElement = doc.querySelector('title');
        const title = titleElement ? titleElement.textContent?.trim() : '';

        if (title) {
          return title;
        }
      }

      // If fetch fails, return domain name as title
      try {
        const urlObj = new URL(formattedUrl);
        return urlObj.hostname.replace('www.', '');
      } catch {
        return url;
      }
    } catch (error) {
      console.error('Failed to fetch page title:', error);
      // Return domain name or original URL as fallback
      try {
        const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
        return urlObj.hostname.replace('www.', '');
      } catch {
        return url;
      }
    } finally {
      setIsLoadingTitle(false);
    }
  };

  // Automatically fetch title when URL changes (only for Other platform)
  const handleUrlChange = async (newUrl: string) => {
    setLinkUrl(newUrl);

    if (selectedPlatform === 'other' && newUrl.trim() && newUrl.includes('.') && !customTitle.trim()) {
      try {
        const title = await fetchPageTitle(newUrl);
        setDetectedTitle(title);
      } catch (error) {
        console.error('Failed to fetch title:', error);
        setDetectedTitle('');
      }
    } else {
      setDetectedTitle('');
    }
  };

  // Handle adding link
  const handleAddLink = async () => {
    if (!linkUrl.trim() || !selectedPlatform) {
      showToast('Please fill in complete information', 'warning');
      return;
    }

    const platform = SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform);
    if (!platform) return;

    setIsSaving(true);
    try {
      // For "Other" platform, use custom title first, then detected title, then domain name
      let linkTitle = platform.name;
      if (selectedPlatform === 'other') {
        if (customTitle.trim()) {
          linkTitle = customTitle.trim();
        } else if (detectedTitle) {
          linkTitle = detectedTitle;
        } else {
          // If no title detected, try extracting domain from URL
          try {
            const url = linkUrl.startsWith('http') ? linkUrl : 'https://' + linkUrl;
            const urlObj = new URL(url);
            linkTitle = urlObj.hostname.replace('www.', '');
          } catch {
            linkTitle = linkUrl.trim();
          }
        }
      }

      // 🚀 New: Upload icon to S3 to get URL
      let iconUrl: string;
      try {
        const fileName = `social-icon-${selectedPlatform}-${Date.now()}.svg`;
        iconUrl = await uploadBase64Icon(platform.icon, fileName);
      } catch (error) {
        console.error('❌ Icon upload failed, using fallback:', error);
        // If upload fails, show error and abort operation
        showToast('Icon upload failed, please try again', 'error');
        return;
      }

      const success = await addSocialLink({
        title: linkTitle,
        linkUrl: linkUrl.trim(),
        iconUrl: iconUrl, // 🎯 Use uploaded URL instead of base64
        sortOrder: socialLinks.length,
      });

      if (success) {
        showToast(`${linkTitle} link added successfully! 🎉`, 'success');
        resetForm();
      } else {
        showToast('Failed to add link, please try again', 'error');
      }
    } catch (error) {
      console.error('Failed to add link:', error);
      showToast('Failed to add link, please try again', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setShowAddPopup(false);
    setShowEditPopup(false);
    setEditingLink(null);
    setSelectedPlatform('');
    setLinkUrl('');
    setCustomTitle('');
    setDetectedTitle('');
    setIsLoadingTitle(false);
    setIsUploadingIcon(false);
  };

  // Handle editing link
  const handleEditLink = (link: any) => {
    setEditingLink(link);
    setSelectedPlatform(link.title === 'Instagram' ? 'instagram' :
                      link.title === 'X / Twitter' ? 'twitter' :
                      link.title === 'YouTube' ? 'youtube' : 'other');
    setLinkUrl(link.linkUrl);
    setCustomTitle(link.title);
    setShowEditPopup(true);
  };

  // Handle updating link
  const handleUpdateLink = async () => {
    if (!linkUrl.trim() || !editingLink) {
      showToast('Please fill in complete information', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      let linkTitle = customTitle.trim();

      // If it's Other platform and no custom title, try using detected title
      if (selectedPlatform === 'other' && !linkTitle) {
        if (detectedTitle) {
          linkTitle = detectedTitle;
        } else {
          try {
            const url = linkUrl.startsWith('http') ? linkUrl : 'https://' + linkUrl;
            const urlObj = new URL(url);
            linkTitle = urlObj.hostname.replace('www.', '');
          } catch {
            linkTitle = linkUrl.trim();
          }
        }
      }

      const success = await updateSocialLink(editingLink.id, {
        title: linkTitle,
        linkUrl: linkUrl.trim(),
      });

      if (success) {
        showToast(`${linkTitle} link updated successfully! ✨`, 'success');
        resetForm();
      } else {
        showToast('Failed to update link, please try again', 'error');
      }
    } catch (error) {
      console.error('Failed to update link:', error);
      showToast('Failed to update link, please try again', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle deleting link
  const handleDeleteLink = async (linkId: number, linkTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete ${linkTitle} link?`)) return;

    try {
      const success = await deleteSocialLink(linkId);
      if (success) {
        showToast(`${linkTitle} link deleted successfully! 🗑️`, 'success');
      } else {
        showToast('Failed to delete link, please try again', 'error');
      }
    } catch (error) {
      console.error('Failed to delete link:', error);
      showToast('Failed to delete link, please try again', 'error');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please log in first to manage social links
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Close button on its own row */}
      {onClose && (
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Title - 20px below close button */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Social Links Management</h3>
        <p className="text-sm text-gray-500 mt-1">Connect your digital world, let more people find you</p>
      </div>

      {/* Loading state */}
      {socialLinksLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-500">Loading...</p>
        </div>
      )}

      {/* Links list */}
      {!socialLinksLoading && (
        <div className="space-y-3">
          {socialLinks.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No links added yet</h4>
                <p className="text-gray-500">Add your social media accounts to let more people follow you</p>
              </div>
            </div>
          ) : (
            socialLinks.map((link) => (
              <div
                key={link.id}
                className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                    <img
                      src={link.iconUrl}
                      alt={link.title}
                      className="w-7 h-7"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDEzYTUgNSAwIDAgMCA3LjU0LjU0bDMtM2E1IDUgMCAwIDAtNy4wNy03LjA3bC0xLjcyIDEuNzEiIHN0cm9rZT0iIzZiNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0ibTE0IDExYTUgNSAwIDAgMC03LjU0LS41NGwtMy0zYTUgNSAwIDAgMCA3LjA3LTcuMDdsMS43MS0xLjcxIiBzdHJva2U9IiM2YjcyODAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{link.title}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {link.linkUrl}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <a
                    href={link.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50"
                    title="Open link"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <button
                    onClick={() => handleEditLink(link)}
                    className="p-2 text-gray-400 hover:text-green-500 transition-colors rounded-lg hover:bg-green-50"
                    title={`Edit ${link.title}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteLink(link.id, link.title)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                    title={`Delete ${link.title}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add button */}
      {!socialLinksLoading && (
        <button
          onClick={() => setShowAddPopup(true)}
          className="w-full py-4 px-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-gray-600 hover:text-blue-600 font-medium flex items-center justify-center space-x-2 group"
        >
          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Social Link</span>
        </button>
      )}

      {/* Add link popup */}
      {showAddPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
            {/* Popup header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <span>Add Social Link</span>
                  </h4>
                  <p className="text-sm text-gray-600 mt-2 ml-10">Select a platform and add your link to let more people find you</p>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2.5 text-gray-400 hover:text-gray-600 transition-all duration-200 rounded-xl hover:bg-white/70 hover:shadow-sm"
                  disabled={isSaving}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Popup content */}
            <div className="p-6 space-y-6 bg-gradient-to-b from-white to-gray-50/50">
              {/* Platform selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <span>Select Platform</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      disabled={isSaving}
                      className={`p-4 border-2 rounded-xl flex items-center space-x-3 transition-all duration-300 group ${
                        selectedPlatform === platform.id
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg scale-[1.02] ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 hover:shadow-md hover:scale-[1.01]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-gray-100 group-hover:shadow-md transition-shadow">
                        <img src={platform.icon} alt={platform.name} className="w-7 h-7" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{platform.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom title input (Other platform only) */}
              {selectedPlatform === 'other' && (
                <div className="animate-in slide-in-from-top-4 duration-300">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <span>Custom Title</span>
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Enter custom title (leave blank to auto-detect)"
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md font-medium text-gray-800 placeholder-gray-500"
                    disabled={isSaving || isLoadingTitle}
                  />
                </div>
              )}

              {/* Link input */}
              {selectedPlatform && (
                <div className="animate-in slide-in-from-top-4 duration-300">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <span>Link Address</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder={SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform)?.placeholder}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 pr-12 bg-white shadow-sm hover:shadow-md group-hover:border-gray-400 font-medium text-gray-800 placeholder-gray-500"
                      disabled={isSaving || isLoadingTitle}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                  </div>
                  {/* Title fetch status display */}
                  {selectedPlatform === 'other' && linkUrl.trim() && (
                    <div className="mt-3 space-y-2">
                      {isLoadingTitle && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-700 flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                            <span>Fetching page title...</span>
                          </p>
                        </div>
                      )}
                      {!isLoadingTitle && detectedTitle && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-700 flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                            </svg>
                            <span>Detected title:</span>
                          </p>
                          <p className="text-sm text-gray-800 font-medium mt-1 ml-6">"{detectedTitle}"</p>
                        </div>
                      )}
                      {!isLoadingTitle && linkUrl.trim() && !detectedTitle && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-700 flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span>Unable to fetch page title, will use website domain</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedPlatform !== 'other' && linkUrl.trim() && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Link format is correct, ready to save!</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Popup bottom buttons */}
            <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-200 flex space-x-4">
              <button
                onClick={resetForm}
                className="flex-1 py-3.5 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                disabled={isSaving || isLoadingTitle}
              >
                Cancel
              </button>
              <button
                onClick={handleAddLink}
                disabled={!selectedPlatform || !linkUrl.trim() || isSaving || isLoadingTitle || isUploadingIcon}
                className={`flex-1 py-3.5 px-6 rounded-xl transition-all duration-300 font-semibold shadow-lg flex items-center justify-center space-x-2 transform ${
                  !selectedPlatform || !linkUrl.trim() || isSaving || isLoadingTitle || isUploadingIcon
                    ? 'bg-[#a8a8a8] text-white cursor-not-allowed shadow-sm'
                    : 'bg-[#f23a00] text-white hover:bg-[#d63300] hover:shadow-xl hover:scale-[1.02]'
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : isUploadingIcon ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading icon...</span>
                  </>
                ) : isLoadingTitle ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Fetching title...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit link popup */}
      {showEditPopup && editingLink && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
            {/* Popup header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <span>Edit Link</span>
                  </h4>
                  <p className="text-sm text-gray-600 mt-2 ml-10">Modify link information and title</p>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2.5 text-gray-400 hover:text-gray-600 transition-all duration-200 rounded-xl hover:bg-white/70 hover:shadow-sm"
                  disabled={isSaving}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Popup content */}
            <div className="p-6 space-y-6 bg-gradient-to-b from-white to-gray-50/50">
              {/* Platform display */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <span>Current Platform</span>
                </label>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-gray-100">
                    <img src={editingLink.iconUrl} alt={editingLink.title} className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform)?.name || editingLink.title}
                  </span>
                </div>
              </div>

              {/* Custom title input (Other platform only) */}
              {selectedPlatform === 'other' && (
                <div className="animate-in slide-in-from-top-4 duration-300">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <span>Custom Title</span>
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Enter custom title (leave blank to auto-detect)"
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md font-medium text-gray-800 placeholder-gray-500"
                    disabled={isSaving || isLoadingTitle}
                  />
                </div>
              )}

              {/* Link input */}
              <div className="animate-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <span>Link Address</span>
                </label>
                <div className="relative group">
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder={SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform)?.placeholder || "Enter link address"}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 pr-12 bg-white shadow-sm hover:shadow-md group-hover:border-gray-400 font-medium text-gray-800 placeholder-gray-500"
                    disabled={isSaving || isLoadingTitle}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>

                {/* Title fetch status display (Other platform only) */}
                {selectedPlatform === 'other' && linkUrl.trim() && !customTitle.trim() && (
                  <div className="mt-3 space-y-2">
                    {isLoadingTitle && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700 flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                          <span>Fetching page title...</span>
                        </p>
                      </div>
                    )}
                    {!isLoadingTitle && detectedTitle && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700 flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                          </svg>
                          <span>Detected title:</span>
                        </p>
                        <p className="text-sm text-gray-800 font-medium mt-1 ml-6">"{detectedTitle}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Popup bottom buttons */}
            <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-green-50/30 border-t border-gray-200 flex space-x-4">
              <button
                onClick={resetForm}
                className="flex-1 py-3.5 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                disabled={isSaving || isLoadingTitle}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLink}
                disabled={!linkUrl.trim() || isSaving || isLoadingTitle}
                className={`flex-1 py-3.5 px-6 rounded-xl transition-all duration-300 font-semibold shadow-lg flex items-center justify-center space-x-2 transform ${
                  !linkUrl.trim() || isSaving || isLoadingTitle
                    ? 'bg-[#a8a8a8] text-white cursor-not-allowed shadow-sm'
                    : 'bg-[#454545] text-white hover:bg-[#2a2a2a] hover:shadow-xl hover:scale-[1.02]'
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : isLoadingTitle ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Fetching title...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Update Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};