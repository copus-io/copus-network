import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../components/ui/toast';
import { AuthService } from '../../services/authService';

// 社交平台配置
const SOCIAL_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    placeholder: '输入您的 Instagram 用户名或链接',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGxpbmVhckdyYWRpZW50IGlkPSJpbnN0YWdyYW0iIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjA5NDMzO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjI1JSIgc3R5bGU9InN0b3AtY29sb3I6I2VjMWQ3YTtzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmNzVhNTU7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iNzUlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmNjZjMzO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmOWE4MjU7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjxyZWN0IHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgcng9IjUuNSIgZmlsbD0idXJsKCNpbnN0YWdyYW0pIi8+CjxyZWN0IHg9IjYiIHk9IjYiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgcng9IjMiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41Ii8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41Ii8+CjxjaXJjbGUgY3g9IjE3LjUiIGN5PSI2LjUiIHI9IjEiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
    color: '#E4405F',
  },
  {
    id: 'twitter',
    name: 'X / Twitter',
    placeholder: '输入您的 X (Twitter) 用户名或链接',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iMyIgZmlsbD0iIzAwMDAwMCIvPgo8cGF0aCBkPSJNMTMuMjk4IDEwLjI5TDE5LjE4IDNIMTcuNjg2TDEyLjY3IDkuMzQ2TDguNTgzIDNINEw5LjczMyAxMS45ODJMNCAyMC4wNEg1LjQ5NEwxMC41NyAxMy4xNTJMMTQuNzcgMjAuMDRIMTkuMzUzTDEzLjI5OCAxMC4yOVpNMTEuNDA3IDEyLjIyNUwxMC44NDYgMTEuNDMzTDYuMjEgMy44NUg3Ljk2TDExLjkwOSAxMC4xMzJMMTIuNDcgMTAuOTI0TDE3LjU5NSAxOC45NzZIMTUuODQ1TDExLjQwNyAxMi4yMjVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=',
    color: '#000000',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    placeholder: '输入您的 YouTube 频道链接',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iMyIgZmlsbD0iI0ZGMDAwMCIvPgo8cGF0aCBkPSJNMTkuMjkzIDhzLS4xOTItMS4zODctLjc4OC0xLjk5N2MtLjc1NC0uODE1LTEuNTk4LS44MTktMi4wMDUtLjg2N0MxMy40ODggNS4wODUgMTIuNzUgNS4wODMgMTIgNS4wODNjLS43NSAwLTEuNDg4LjAwMi0zLjUuMDUzLS40MDYuMDQ4LTEuMjUuMDUyLTIuMDA0Ljg2N0M1LjkgNi42MTMgNS43MDcgOCA1LjcwNyA4cy0uMTkzIDEuNjY3LS4xOTMgMy4zMzN2MS41ODRjMCAxLjY2Ni4xOTMgMy4zMzMuMTkzIDMuMzMzczEuMDkyIDEuMzg3IDEuNjkgMS45OTdjLjc1My44MTQgMS41OTcuODE5IDIuMDA0Ljg2N0MxMCA1LjkxNyAxMiA1LjkxNyAxMiA1LjkxN3MxMCAuMDA0IDExIDEuMTY2YzEuNTA4LjA0OCAxLjY5Ni0xLjk5NyAxLjY5Ni0xLjk5N3MuMTkzLTEuNjY3LjE5My0zLjMzM3YtMS41ODRDMTkuNDg2IDkuNjY3IDE5LjI5MyA4IDE5LjI5MyA4eiIgZmlsbD0iI0ZGMDAwMCIvPgo8cGF0aCBkPSJNOS45NTEgMTQuODhWOVYxMS4yNDVsMy4wNDkgMS44MzVMMTMgMTMuMDhsLTMuMDQ5IDEuOCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
    color: '#FF0000',
  },
  {
    id: 'other',
    name: '其他',
    placeholder: '输入您的个人网站、博客或任何链接',
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

  // 将base64转换为文件并上传到S3
  const uploadBase64Icon = async (base64Data: string, fileName: string): Promise<string> => {
    try {
      setIsUploadingIcon(true);

      // 将base64转换为Blob
      const response = await fetch(base64Data);
      const blob = await response.blob();

      // 创建File对象
      const file = new File([blob], fileName, { type: blob.type || 'image/svg+xml' });

      // 上传到S3
      const uploadResult = await AuthService.uploadImage(file);

      return uploadResult.url;
    } catch (error) {
      console.error('❌ 图标上传失败:', error);
      throw error;
    } finally {
      setIsUploadingIcon(false);
    }
  };

  // 获取网页标题
  const fetchPageTitle = async (url: string): Promise<string> => {
    try {
      setIsLoadingTitle(true);

      // 确保URL格式正确
      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }

      // 使用CORS代理或者直接尝试获取
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

      // 如果获取失败，返回域名作为标题
      try {
        const urlObj = new URL(formattedUrl);
        return urlObj.hostname.replace('www.', '');
      } catch {
        return url;
      }
    } catch (error) {
      console.error('获取页面标题失败:', error);
      // 返回域名或原URL作为备选
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

  // 当URL变化时自动获取标题（仅限其他平台）
  const handleUrlChange = async (newUrl: string) => {
    setLinkUrl(newUrl);

    if (selectedPlatform === 'other' && newUrl.trim() && newUrl.includes('.') && !customTitle.trim()) {
      try {
        const title = await fetchPageTitle(newUrl);
        setDetectedTitle(title);
      } catch (error) {
        console.error('获取标题失败:', error);
        setDetectedTitle('');
      }
    } else {
      setDetectedTitle('');
    }
  };

  // 处理添加链接
  const handleAddLink = async () => {
    if (!linkUrl.trim() || !selectedPlatform) {
      showToast('请填写完整信息', 'warning');
      return;
    }

    const platform = SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform);
    if (!platform) return;

    setIsSaving(true);
    try {
      // 对于"其他"平台，优先使用自定义标题，然后是检测到的标题，最后是域名
      let linkTitle = platform.name;
      if (selectedPlatform === 'other') {
        if (customTitle.trim()) {
          linkTitle = customTitle.trim();
        } else if (detectedTitle) {
          linkTitle = detectedTitle;
        } else {
          // 如果没有检测到标题，尝试从URL提取域名
          try {
            const url = linkUrl.startsWith('http') ? linkUrl : 'https://' + linkUrl;
            const urlObj = new URL(url);
            linkTitle = urlObj.hostname.replace('www.', '');
          } catch {
            linkTitle = linkUrl.trim();
          }
        }
      }

      // 🚀 新增：上传图标到S3获取URL
      let iconUrl: string;
      try {
        const fileName = `social-icon-${selectedPlatform}-${Date.now()}.svg`;
        iconUrl = await uploadBase64Icon(platform.icon, fileName);
      } catch (error) {
        console.error('❌ 图标上传失败，使用备用方案:', error);
        // 如果上传失败，显示错误并终止操作
        showToast('图标上传失败，请重试', 'error');
        return;
      }

      const success = await addSocialLink({
        title: linkTitle,
        linkUrl: linkUrl.trim(),
        iconUrl: iconUrl, // 🎯 使用上传后的URL而不是base64
        sortOrder: socialLinks.length,
      });

      if (success) {
        showToast(`${linkTitle} 链接添加成功！🎉`, 'success');
        resetForm();
      } else {
        showToast('添加链接失败，请重试', 'error');
      }
    } catch (error) {
      console.error('添加链接失败:', error);
      showToast('添加链接失败，请重试', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 重置表单
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

  // 处理编辑链接
  const handleEditLink = (link: any) => {
    setEditingLink(link);
    setSelectedPlatform(link.title === 'Instagram' ? 'instagram' :
                      link.title === 'X / Twitter' ? 'twitter' :
                      link.title === 'YouTube' ? 'youtube' : 'other');
    setLinkUrl(link.linkUrl);
    setCustomTitle(link.title);
    setShowEditPopup(true);
  };

  // 处理更新链接
  const handleUpdateLink = async () => {
    if (!linkUrl.trim() || !editingLink) {
      showToast('请填写完整信息', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      let linkTitle = customTitle.trim();

      // 如果是其他平台且没有自定义标题，尝试使用检测到的标题
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
        showToast(`${linkTitle} 链接更新成功！✨`, 'success');
        resetForm();
      } else {
        showToast('更新链接失败，请重试', 'error');
      }
    } catch (error) {
      console.error('更新链接失败:', error);
      showToast('更新链接失败，请重试', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 处理删除链接
  const handleDeleteLink = async (linkId: number, linkTitle: string) => {
    if (!window.confirm(`确定要删除 ${linkTitle} 链接吗？`)) return;

    try {
      const success = await deleteSocialLink(linkId);
      if (success) {
        showToast(`${linkTitle} 链接删除成功！🗑️`, 'success');
      } else {
        showToast('删除链接失败，请重试', 'error');
      }
    } catch (error) {
      console.error('删除链接失败:', error);
      showToast('删除链接失败，请重试', 'error');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8 text-gray-500">
        请先登录以管理社交链接
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">社交链接管理</h3>
          <p className="text-sm text-gray-500 mt-1">连接你的数字世界，让更多人找到你</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            title="关闭"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 加载状态 */}
      {socialLinksLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-500">加载中...</p>
        </div>
      )}

      {/* 链接列表 */}
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
                <h4 className="text-lg font-medium text-gray-900 mb-2">还没有添加任何链接</h4>
                <p className="text-gray-500">添加你的社交媒体账号，让更多人关注你</p>
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
                      className="w-6 h-6"
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
                    title="打开链接"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <button
                    onClick={() => handleEditLink(link)}
                    className="p-2 text-gray-400 hover:text-green-500 transition-colors rounded-lg hover:bg-green-50"
                    title={`编辑 ${link.title}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteLink(link.id, link.title)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                    title={`删除 ${link.title}`}
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

      {/* 添加按钮 */}
      {!socialLinksLoading && (
        <button
          onClick={() => setShowAddPopup(true)}
          className="w-full py-4 px-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-gray-600 hover:text-blue-600 font-medium flex items-center justify-center space-x-2 group"
        >
          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>添加社交链接</span>
        </button>
      )}

      {/* 添加链接弹窗 */}
      {showAddPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
            {/* 弹窗头部 */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <span>添加社交链接</span>
                  </h4>
                  <p className="text-sm text-gray-600 mt-2 ml-10">选择平台并添加您的链接，让更多人找到您</p>
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

            {/* 弹窗内容 */}
            <div className="p-6 space-y-6 bg-gradient-to-b from-white to-gray-50/50">
              {/* 平台选择 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <span>选择平台</span>
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
                      <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center border border-gray-100 group-hover:shadow-md transition-shadow">
                        <img src={platform.icon} alt={platform.name} className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{platform.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 自定义标题输入（仅限其他平台） */}
              {selectedPlatform === 'other' && (
                <div className="animate-in slide-in-from-top-4 duration-300">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <span>自定义标题</span>
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="输入自定义标题（留空将自动检测）"
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md font-medium text-gray-800 placeholder-gray-500"
                    disabled={isSaving || isLoadingTitle}
                  />
                </div>
              )}

              {/* 链接输入 */}
              {selectedPlatform && (
                <div className="animate-in slide-in-from-top-4 duration-300">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <span>链接地址</span>
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
                  {/* 标题获取状态显示 */}
                  {selectedPlatform === 'other' && linkUrl.trim() && (
                    <div className="mt-3 space-y-2">
                      {isLoadingTitle && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-700 flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                            <span>正在获取页面标题...</span>
                          </p>
                        </div>
                      )}
                      {!isLoadingTitle && detectedTitle && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-700 flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                            </svg>
                            <span>检测到标题：</span>
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
                            <span>无法获取页面标题，将使用网站域名</span>
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
                        <span>链接格式正确，准备保存！</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 弹窗底部按钮 */}
            <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-200 flex space-x-4">
              <button
                onClick={resetForm}
                className="flex-1 py-3.5 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                disabled={isSaving || isLoadingTitle}
              >
                取消
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
                    <span>保存中...</span>
                  </>
                ) : isUploadingIcon ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>上传图标中...</span>
                  </>
                ) : isLoadingTitle ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>获取标题中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>保存链接</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑链接弹窗 */}
      {showEditPopup && editingLink && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
            {/* 弹窗头部 */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <span>编辑链接</span>
                  </h4>
                  <p className="text-sm text-gray-600 mt-2 ml-10">修改链接信息和标题</p>
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

            {/* 弹窗内容 */}
            <div className="p-6 space-y-6 bg-gradient-to-b from-white to-gray-50/50">
              {/* 平台显示 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <span>当前平台</span>
                </label>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center border border-gray-100">
                    <img src={editingLink.iconUrl} alt={editingLink.title} className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform)?.name || editingLink.title}
                  </span>
                </div>
              </div>

              {/* 自定义标题输入（仅限其他平台） */}
              {selectedPlatform === 'other' && (
                <div className="animate-in slide-in-from-top-4 duration-300">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <span>自定义标题</span>
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="输入自定义标题（留空将自动检测）"
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md font-medium text-gray-800 placeholder-gray-500"
                    disabled={isSaving || isLoadingTitle}
                  />
                </div>
              )}

              {/* 链接输入 */}
              <div className="animate-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <span>链接地址</span>
                </label>
                <div className="relative group">
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder={SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform)?.placeholder || "输入链接地址"}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 pr-12 bg-white shadow-sm hover:shadow-md group-hover:border-gray-400 font-medium text-gray-800 placeholder-gray-500"
                    disabled={isSaving || isLoadingTitle}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>

                {/* 标题获取状态显示（仅其他平台） */}
                {selectedPlatform === 'other' && linkUrl.trim() && !customTitle.trim() && (
                  <div className="mt-3 space-y-2">
                    {isLoadingTitle && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700 flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                          <span>正在获取页面标题...</span>
                        </p>
                      </div>
                    )}
                    {!isLoadingTitle && detectedTitle && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700 flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                          </svg>
                          <span>检测到标题：</span>
                        </p>
                        <p className="text-sm text-gray-800 font-medium mt-1 ml-6">"{detectedTitle}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 弹窗底部按钮 */}
            <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-green-50/30 border-t border-gray-200 flex space-x-4">
              <button
                onClick={resetForm}
                className="flex-1 py-3.5 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                disabled={isSaving || isLoadingTitle}
              >
                取消
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
                    <span>保存中...</span>
                  </>
                ) : isLoadingTitle ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>获取标题中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>更新链接</span>
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