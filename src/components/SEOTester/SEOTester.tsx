import React, { useState } from 'react';
import { SEOSettingsModal } from '../SEOSettingsModal';

/**
 * SEO功能测试组件
 * 用于开发环境测试新的SEO接口集成
 */
export const SEOTester: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testArticle] = useState({
    uuid: '41d3ee9d8c622a3caba5207e563c0ffd', // 测试文章UUID
    title: '测试文章：SEO功能集成验证',
    description: '这是一个用于测试SEO功能的示例文章描述'
  });

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 只在开发环境显示
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <h3 className="font-bold text-sm mb-2">SEO功能测试</h3>
        <p className="text-xs mb-3">
          测试新的SEO设置接口集成
        </p>
        <button
          onClick={handleOpenModal}
          className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
        >
          测试SEO设置
        </button>
      </div>

      <SEOSettingsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        articleUuid={testArticle.uuid}
        articleTitle={testArticle.title}
        initialDescription={testArticle.description}
        initialKeywords="测试, SEO, API集成, 前端开发"
      />
    </div>
  );
};

export default SEOTester;