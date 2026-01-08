import React, { useState } from 'react';
import { MainFrame } from '../MainFrame/MainFrame';
import { SEO } from '../../components/SEO/SEO';
import { SEOSettingsModal } from '../../components/SEOSettingsModal';
import { getArticleDetail } from '../../services/articleService';
import { ArticleDetailResponse } from '../../types/article';
import { useToast } from '../../components/ui/toast';

/**
 * SEO设置页面 - 管理员工具
 * 通过文章链接设置特定文章的SEO
 */
export const SEOSet: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState({
    uuid: '',
    title: '',
    description: '',
    keywords: ''
  });
  const [articleUrl, setArticleUrl] = useState('');
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<ArticleDetailResponse | null>(null);
  const { showToast } = useToast();

  // 从文章链接中提取UUID
  const extractUuidFromUrl = (url: string): string | null => {
    try {
      // 支持多种链接格式:
      // https://copus.network/work/uuid
      // http://localhost:5173/work/uuid
      // /work/uuid
      // 直接的uuid

      // 如果是完整的UUID格式，直接返回
      const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
      if (uuidRegex.test(url.replace(/-/g, ''))) {
        return url;
      }

      // 从URL中提取UUID
      const urlObj = new URL(url.startsWith('http') ? url : `https://example.com${url}`);
      const pathParts = urlObj.pathname.split('/');
      const workIndex = pathParts.indexOf('work');

      if (workIndex !== -1 && workIndex + 1 < pathParts.length) {
        const uuid = pathParts[workIndex + 1];
        if (uuidRegex.test(uuid.replace(/-/g, ''))) {
          return uuid;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  // 从链接加载文章信息
  const handleLoadArticleFromUrl = async () => {
    const uuid = extractUuidFromUrl(articleUrl.trim());

    if (!uuid) {
      showToast('无效的文章链接格式，请检查URL', 'error');
      return;
    }

    try {
      setIsLoadingArticle(true);
      const article = await getArticleDetail(uuid);
      setCurrentArticle(article);
      showToast('文章加载成功', 'success');
    } catch (error) {
      console.error('Failed to load article:', error);
      showToast('文章加载失败，请检查链接是否正确', 'error');
      setCurrentArticle(null);
    } finally {
      setIsLoadingArticle(false);
    }
  };

  // 打开SEO设置弹窗
  const handleOpenSEOModal = () => {
    if (!currentArticle) {
      showToast('请先加载文章', 'error');
      return;
    }

    setSelectedArticle({
      uuid: currentArticle.uuid,
      title: currentArticle.title,
      description: currentArticle.content?.substring(0, 160) || '',
      keywords: ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle({ uuid: '', title: '', description: '', keywords: '' });
  };

  // 清空当前文章
  const handleClearArticle = () => {
    setCurrentArticle(null);
    setArticleUrl('');
  };

  // 格式化日期
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* SEO标签设置 */}
      <SEO
        title="SEO设置"
        description="配置文章SEO设置，优化搜索引擎收录和展示效果"
        noIndex={true}
      />

      <MainFrame>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 页面标题 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 mb-4">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                管理员工具
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                文章SEO管理
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                管理平台文章的SEO设置，优化搜索引擎收录和社交媒体分享效果
              </p>
            </div>

            {/* 文章链接输入区域 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                🔗 文章链接输入
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    文章链接或UUID
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={articleUrl}
                      onChange={(e) => setArticleUrl(e.target.value)}
                      placeholder="粘贴文章链接，例如: https://copus.network/work/uuid 或直接输入UUID"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoadingArticle}
                    />
                    <button
                      onClick={handleLoadArticleFromUrl}
                      disabled={!articleUrl.trim() || isLoadingArticle}
                      className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      {isLoadingArticle ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          加载中
                        </div>
                      ) : '加载文章'}
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    支持格式：完整链接、相对路径(/work/uuid)、或直接的UUID
                  </div>
                </div>
              </div>
            </div>

            {/* 当前文章信息显示 */}
            {currentArticle && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      文章已加载
                    </h3>
                    <button
                      onClick={handleClearArticle}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {currentArticle.title}
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-3">
                        {currentArticle.content.substring(0, 200)}...
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span>UUID: <code className="bg-gray-100 px-2 py-1 rounded">{currentArticle.uuid}</code></span>
                        <span>发布时间：{formatDate(currentArticle.createAt)}</span>
                        <span>浏览：{currentArticle.viewCount}</span>
                        <span>点赞：{currentArticle.likeCount}</span>
                      </div>
                    </div>
                    <div className="ml-6 flex-shrink-0">
                      <button
                        onClick={handleOpenSEOModal}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <svg className="-ml-1 mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                        </svg>
                        配置SEO设置
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 管理说明 */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-medium text-orange-900 mb-3">
                <svg className="inline w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                管理员工具说明
              </h3>
              <div className="text-sm text-orange-700 space-y-2">
                <p>• <strong>内部工具</strong>：此页面仅供管理员使用，无用户界面入口</p>
                <p>• <strong>访问方式</strong>：直接通过 /seoSet 路径访问</p>
                <p>• <strong>操作流程</strong>：复制文章链接 → 粘贴到输入框 → 加载文章 → 配置SEO</p>
                <p>• <strong>支持格式</strong>：</p>
                <div className="ml-4 space-y-1">
                  <p>- 完整链接：<code className="bg-orange-100 px-1 rounded">https://copus.network/work/uuid</code></p>
                  <p>- 相对路径：<code className="bg-orange-100 px-1 rounded">/work/uuid</code></p>
                  <p>- 直接UUID：<code className="bg-orange-100 px-1 rounded">41d3ee9d8c622a3caba5207e563c0ffd</code></p>
                </div>
                <p>• <strong>技术格式</strong>：数据以JSON字符串格式提交给后端API</p>
              </div>
            </div>
          </div>
        </div>
      </MainFrame>

      {/* SEO设置弹窗 */}
      <SEOSettingsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        articleUuid={selectedArticle.uuid}
        articleTitle={selectedArticle.title}
        initialDescription={selectedArticle.description}
        initialKeywords={selectedArticle.keywords}
      />
    </>
  );
};

export default SEOSet;