import React, { useState, useEffect } from 'react';
import { useSEOSettings } from '../../hooks/useSEOSettings';
import { SEOSettings } from '../../types/article';

interface SEOSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleUuid: string;
  initialDescription?: string;
  initialKeywords?: string;
  articleTitle?: string;
}

export const SEOSettingsModal: React.FC<SEOSettingsModalProps> = ({
  isOpen,
  onClose,
  articleUuid,
  initialDescription = '',
  initialKeywords = '',
  articleTitle = '',
}) => {
  const [description, setDescription] = useState(initialDescription);
  const [keywords, setKeywords] = useState(initialKeywords);

  const { updateSEO, isLoading } = useSEOSettings({
    onSuccess: () => {
      onClose();
    },
  });

  useEffect(() => {
    if (isOpen) {
      setDescription(initialDescription);
      setKeywords(initialKeywords);
    }
  }, [isOpen, initialDescription, initialKeywords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      alert('Please enter an SEO description');
      return;
    }

    const seoData: SEOSettings = {
      uuid: articleUuid,
      description: description.trim(),
      keywords: keywords.trim(),
    };

    await updateSEO(seoData);
  };

  const handleKeywordInput = (value: string) => {
    // 自动处理关键词格式：用逗号分隔
    setKeywords(value);
  };

  const suggestKeywords = () => {
    if (articleTitle) {
      // 基于文章标题生成建议关键词
      const titleWords = articleTitle
        .split(/[\s,，。、]+/)
        .filter(word => word.length > 1)
        .slice(0, 5);

      const suggestions = titleWords.join(', ');
      setKeywords(prev => prev ? `${prev}, ${suggestions}` : suggestions);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">SEO Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={isLoading}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SEO Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Description
                <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#f23a00] focus:border-transparent resize-none"
                rows={3}
                maxLength={160}
                placeholder="Enter SEO description for the article (recommended under 150 characters)"
                disabled={isLoading}
                required
              />
              <div className="text-sm text-gray-500 mt-1">
                {description.length}/160 characters
              </div>
            </div>

            {/* SEO Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Keywords
              </label>
              <div className="space-y-2">
                <textarea
                  value={keywords}
                  onChange={(e) => handleKeywordInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#f23a00] focus:border-transparent resize-none"
                  rows={2}
                  placeholder="Enter keywords separated by commas (e.g., technology, frontend, React)"
                  disabled={isLoading}
                />
                {articleTitle && (
                  <button
                    type="button"
                    onClick={suggestKeywords}
                    className="text-sm text-[#f23a00] hover:underline"
                    disabled={isLoading}
                  >
                    Generate keyword suggestions from title
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                We recommend adding 3-8 related keywords, separated by commas
              </div>
            </div>

            {/* Preview */}
            {(description || keywords) && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Title: </span>
                    <span>{articleTitle || 'Article title'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Description: </span>
                    <span className="text-gray-600">{description || 'No description'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Keywords: </span>
                    <span className="text-gray-600">{keywords || 'No keywords'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#f23a00] text-white rounded-md hover:bg-[#e03400] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !description.trim()}
              >
                {isLoading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};