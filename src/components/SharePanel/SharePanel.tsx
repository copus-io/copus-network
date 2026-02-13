import React, { useState, useEffect } from 'react';
import {
  getShareStats,
  getTimeAnalytics,
  trackShareClick,
  analyticsService
} from '../../services/analyticsService';

interface SharePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SharePanel: React.FC<SharePanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'share' | 'popular'>('dashboard');
  const [analytics, setAnalytics] = useState({
    shareStats: {
      totalShares: 0,
      sharesByType: {},
      sharesByContentType: {},
      sharesByLocation: {},
      successfulShares: 0,
      failedShares: 0,
      successRate: 0,
      popularContent: [],
      timeRange: { start: 0, end: 0 }
    },
    timeAnalytics: { hourlyDistribution: {}, weeklyDistribution: {}, peakHours: [], peakDays: [] }
  });

  // Mock content data for demo
  const [currentContent] = useState({
    id: 'demo-article-123',
    title: 'Demo Article: Key Strategies for Digital Transformation',
    type: 'article' as const,
    url: window.location.href
  });

  useEffect(() => {
    if (isOpen) {
      setAnalytics({
        shareStats: getShareStats(),
        timeAnalytics: getTimeAnalytics()
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString('zh-CN');

  const tabs = [
    { id: 'dashboard', label: '数据概览', icon: '📊' },
    { id: 'share', label: '分享功能', icon: '📤' },
    { id: 'popular', label: '热门内容', icon: '🔥' }
  ];

  const shareTypes = [
    { id: 'twitter', label: 'Twitter', icon: '🐦', color: 'bg-blue-400', desc: 'Share on Twitter' },
    { id: 'facebook', label: 'Facebook', icon: '📘', color: 'bg-blue-600', desc: 'Share on Facebook' },
    { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'bg-blue-700', desc: 'Share on LinkedIn' },
    { id: 'reddit', label: 'Reddit', icon: '🤖', color: 'bg-orange-600', desc: 'Share on Reddit' },
    { id: 'telegram', label: 'Telegram', icon: '✈️', color: 'bg-blue-500', desc: 'Share on Telegram' },
    { id: 'whatsapp', label: 'WhatsApp', icon: '💬', color: 'bg-green-500', desc: 'Share on WhatsApp' },
    { id: 'link', label: 'Copy Link', icon: '🔗', color: 'bg-gray-500', desc: 'Copy page link' },
    { id: 'email', label: 'Email', icon: '📧', color: 'bg-orange-500', desc: 'Share via email' }
  ];

  const handleShare = async (shareType: string) => {
    try {
      let shareSuccess = true;

      switch (shareType) {
        case 'link':
          await navigator.clipboard.writeText(currentContent.url);
          alert('Link copied to clipboard!');
          break;
        case 'twitter':
          const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentContent.url)}&text=${encodeURIComponent(currentContent.title)}`;
          window.open(twitterUrl, '_blank', 'width=550,height=420');
          break;
        case 'facebook':
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentContent.url)}`;
          window.open(facebookUrl, '_blank', 'width=600,height=400');
          break;
        case 'linkedin':
          const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentContent.url)}`;
          window.open(linkedinUrl, '_blank', 'width=600,height=500');
          break;
        case 'reddit':
          const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(currentContent.url)}&title=${encodeURIComponent(currentContent.title)}`;
          window.open(redditUrl, '_blank');
          break;
        case 'telegram':
          const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(currentContent.url)}&text=${encodeURIComponent(currentContent.title)}`;
          window.open(telegramUrl, '_blank');
          break;
        case 'whatsapp':
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${currentContent.title} ${currentContent.url}`)}`;
          window.open(whatsappUrl, '_blank');
          break;
        case 'email':
          const mailtoUrl = `mailto:?subject=${encodeURIComponent(currentContent.title)}&body=${encodeURIComponent(`I'd like to share this article with you:\n\n${currentContent.title}\n\nLink: ${currentContent.url}`)}`;
          window.open(mailtoUrl);
          break;
        default:
          shareSuccess = false;
      }

      // 记录分享事件
      trackShareClick(
        shareType as any,
        currentContent.type,
        'floating_button',
        {
          contentId: currentContent.id,
          contentTitle: currentContent.title,
          shareSuccess
        }
      );

      // 刷新数据
      setTimeout(() => {
        setAnalytics({
          shareStats: getShareStats(),
          timeAnalytics: getTimeAnalytics()
        });
      }, 100);

    } catch (error) {
      console.error('Share failed:', error);
      trackShareClick(
        shareType as any,
        currentContent.type,
        'floating_button',
        {
          contentId: currentContent.id,
          contentTitle: currentContent.title,
          shareSuccess: false
        }
      );
    }
  };

  const getShareTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'twitter': 'Twitter',
      'facebook': 'Facebook',
      'linkedin': 'LinkedIn',
      'reddit': 'Reddit',
      'telegram': 'Telegram',
      'whatsapp': 'WhatsApp',
      'link': 'Copy Link',
      'email': 'Email',
      'other': 'Other'
    };
    return labels[type] || type;
  };

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'article': '文章',
      'profile': '个人资料',
      'treasury': '珍藏',
      'space': '空间',
      'other': '其他'
    };
    return labels[type] || type;
  };

  const getLocationLabel = (location: string) => {
    const labels: Record<string, string> = {
      'article_detail': '文章详情',
      'profile_page': '个人主页',
      'treasury_item': '珍藏项目',
      'floating_button': '浮动按钮',
      'other': '其他'
    };
    return labels[location] || location;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">分享功能与数据统计</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                analyticsService.clearEvents();
                setAnalytics({
                  shareStats: {
                    totalShares: 0,
                    sharesByType: {},
                    sharesByContentType: {},
                    sharesByLocation: {},
                    successfulShares: 0,
                    failedShares: 0,
                    successRate: 0,
                    popularContent: [],
                    timeRange: { start: 0, end: 0 }
                  },
                  timeAnalytics: { hourlyDistribution: {}, weeklyDistribution: {}, peakHours: [], peakDays: [] }
                });
              }}
              className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              清除数据
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl font-light"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b bg-gray-50 px-6">
          <nav className="flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 概览指标 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800">总分享次数</h3>
                  <p className="text-2xl font-bold text-blue-900">{analytics.shareStats.totalShares}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800">成功分享</h3>
                  <p className="text-2xl font-bold text-green-900">{analytics.shareStats.successfulShares}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-orange-800">失败分享</h3>
                  <p className="text-2xl font-bold text-orange-900">{analytics.shareStats.failedShares}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-800">成功率</h3>
                  <p className="text-2xl font-bold text-purple-900">{formatPercentage(analytics.shareStats.successRate)}</p>
                </div>
              </div>

              {/* 分享统计图表 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-4">按分享方式统计</h4>
                  <div className="space-y-3">
                    {Object.entries(analytics.shareStats.sharesByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center p-2 bg-white rounded">
                        <span>{getShareTypeLabel(type)}</span>
                        <span className="font-bold text-blue-600">{count}</span>
                      </div>
                    ))}
                    {Object.keys(analytics.shareStats.sharesByType).length === 0 && (
                      <div className="text-gray-500 text-center py-4">暂无分享数据</div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-4">按内容类型统计</h4>
                  <div className="space-y-3">
                    {Object.entries(analytics.shareStats.sharesByContentType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center p-2 bg-white rounded">
                        <span>{getContentTypeLabel(type)}</span>
                        <span className="font-bold text-green-600">{count}</span>
                      </div>
                    ))}
                    {Object.keys(analytics.shareStats.sharesByContentType).length === 0 && (
                      <div className="text-gray-500 text-center py-4">暂无内容数据</div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-4">按位置统计</h4>
                  <div className="space-y-3">
                    {Object.entries(analytics.shareStats.sharesByLocation).map(([location, count]) => (
                      <div key={location} className="flex justify-between items-center p-2 bg-white rounded">
                        <span>{getLocationLabel(location)}</span>
                        <span className="font-bold text-purple-600">{count}</span>
                      </div>
                    ))}
                    {Object.keys(analytics.shareStats.sharesByLocation).length === 0 && (
                      <div className="text-gray-500 text-center py-4">暂无位置数据</div>
                    )}
                  </div>
                </div>
              </div>

              {/* 时间范围 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">数据时间范围</h4>
                <p className="text-sm text-gray-600">
                  {analytics.shareStats.timeRange.start > 0 ? (
                    `${formatDate(analytics.shareStats.timeRange.start)} - ${formatDate(analytics.shareStats.timeRange.end)}`
                  ) : (
                    '暂无数据'
                  )}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'share' && (
            <div className="space-y-6">
              {/* 当前内容信息 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <h4 className="font-medium mb-2 text-gray-800">Current Content</h4>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{currentContent.title}</h3>
                <p className="text-sm text-gray-600 mb-4">Type: {getContentTypeLabel(currentContent.type)} | ID: {currentContent.id}</p>
                <p className="text-xs text-gray-500 break-all">{currentContent.url}</p>
              </div>

              {/* 分享按钮区域 */}
              <div>
                <h4 className="font-medium mb-4 text-gray-800">Choose Share Platform</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {shareTypes.map((shareType) => (
                    <button
                      key={shareType.id}
                      onClick={() => handleShare(shareType.id)}
                      className={`${shareType.color} hover:opacity-90 text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg`}
                    >
                      <div className="text-2xl mb-2">{shareType.icon}</div>
                      <div className="font-medium">{shareType.label}</div>
                      <div className="text-xs opacity-90 mt-1">{shareType.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 分享说明 */}
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <h5 className="font-medium text-yellow-800 mb-2">📝 Share Function Guide</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Clicking any share button will automatically track sharing data</li>
                  <li>• Data includes sharing method, content type, location, and more</li>
                  <li>• View detailed statistics in the "Data Overview" tab</li>
                  <li>• All data is stored locally for analytics demonstration</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'popular' && (
            <div className="space-y-6">
              {/* 热门内容列表 */}
              <div>
                <h4 className="font-medium mb-4">🔥 最受欢迎的分享内容</h4>
                {analytics.shareStats.popularContent.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.shareStats.popularContent.map((content, index) => (
                      <div key={content.contentId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">{content.contentTitle}</h5>
                            <p className="text-sm text-gray-600">ID: {content.contentId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{content.shareCount}</div>
                          <div className="text-xs text-gray-500">分享次数</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">📭</div>
                    <p>暂无热门内容数据</p>
                    <p className="text-sm mt-2">开始分享内容来生成统计数据</p>
                  </div>
                )}
              </div>

              {/* 分享趋势说明 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-2">📈 分享趋势分析</h5>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• 排名基于内容的总分享次数</p>
                  <p>• 包含所有分享渠道的数据</p>
                  <p>• 帮助识别最受欢迎的内容类型</p>
                  <p>• 可用于内容策略优化</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};