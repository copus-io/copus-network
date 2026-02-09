import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { useToast } from '../ui/toast';
import {
  parseCSV,
  parseBookmarksHTML,
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
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // 重置状态
  const resetState = () => {
    setStep('upload');
    setParseResult(null);
    setSelectedItems(new Set());
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await detectAndConvertEncoding(file);
      let result: CSVParseResult;

      // 根据文件扩展名选择解析方式
      if (file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm')) {
        // 处理浏览器书签HTML文件
        const bookmarks = parseBookmarksHTML(content);
        result = {
          success: bookmarks.length > 0,
          data: bookmarks,
          errors: bookmarks.length === 0 ? ['未在HTML文件中找到有效的书签'] : [],
          totalRows: bookmarks.length,
          validRows: bookmarks.length
        };
      } else {
        // 处理CSV文件
        result = parseCSV(content);
      }

      setParseResult(result);

      if (result.success) {
        // 默认选中所有有效项
        setSelectedItems(new Set(Array.from({ length: result.data.length }, (_, i) => i)));
        setStep('preview');
        showToast(`成功解析 ${result.validRows} 条收藏记录`, 'success');
      } else {
        showToast(`解析失败: ${result.errors[0]}`, 'error');
      }

      // 显示警告信息
      if (result.errors.length > 0) {
        console.warn('CSV解析警告:', result.errors);
      }
    } catch (error) {
      console.error('文件处理失败:', error);
      showToast('文件处理失败，请检查文件格式', 'error');
    }
  };

  // 切换选择状态
  const toggleItemSelection = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  // 全选/全不选
  const toggleSelectAll = () => {
    if (selectedItems.size === parseResult?.data.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(Array.from({ length: parseResult?.data.length || 0 }, (_, i) => i)));
    }
  };

  // 执行导入
  const handleImport = async () => {
    if (!parseResult || selectedItems.size === 0) return;

    setIsImporting(true);
    setStep('importing');

    try {
      const itemsToImport = Array.from(selectedItems).map(index => ({
        ...parseResult.data[index],
        url: normalizeUrl(parseResult.data[index].url) // 规范化URL
      }));

      await onImport(itemsToImport);
      showToast(`成功导入 ${itemsToImport.length} 条收藏`, 'success');
      onClose();
      resetState();
    } catch (error) {
      console.error('导入失败:', error);
      showToast(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`, 'error');
      setStep('preview'); // 回到预览状态
    } finally {
      setIsImporting(false);
    }
  };

  // 下载CSV模板
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
    showToast('CSV模板已下载', 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {step === 'upload' && '导入收藏'}
            {step === 'preview' && '预览导入数据'}
            {step === 'importing' && '正在导入...'}
          </h2>
          <button
            onClick={() => {
              onClose();
              resetState();
            }}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            disabled={isImporting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto">
          {step === 'upload' && (
            <div className="p-6">
              {/* 上传区域 */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer group"
                   onClick={() => fileInputRef.current?.click()}>
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-200 transition-colors">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">拖拽或点击上传文件</h3>
                    <p className="text-gray-600">支持 CSV 文件或浏览器书签文件 (.html)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.html,.htm"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 px-8"
                    >
                      选择文件
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadTemplate();
                      }}
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      下载CSV模板
                    </Button>
                  </div>
                </div>
              </div>

              {/* 帮助按钮和折叠说明 */}
              <div className="mt-6">
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-4"
                >
                  <svg className={`w-5 h-5 transition-transform ${showHelp ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-sm font-medium">文件格式说明</span>
                </button>

                {showHelp && (
                  <div className="space-y-4 animate-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">📄</span>
                          </div>
                          <h5 className="font-semibold text-gray-800">CSV 文件</h5>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          结构化数据文件，包含标题、URL、封面等字段
                        </p>

                        <div className="bg-white/50 p-3 rounded-lg mb-4">
                          <h6 className="font-medium text-gray-800 mb-2 text-xs uppercase tracking-wide">支持字段</h6>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="font-medium text-green-700">title*</span> 标题</div>
                            <div><span className="font-medium text-green-700">url*</span> 链接</div>
                            <div><span className="font-medium text-blue-600">description</span> 描述</div>
                            <div><span className="font-medium text-blue-600">category</span> 分类</div>
                            <div><span className="font-medium text-blue-600">tags</span> 标签</div>
                            <div><span className="font-medium text-purple-600">cover</span> 封面</div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">* 必需字段</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">🌐</span>
                          </div>
                          <h5 className="font-semibold text-gray-800">浏览器书签</h5>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          从各种浏览器导出的HTML格式书签文件
                        </p>

                        <div className="bg-white/50 p-3 rounded-lg">
                          <h6 className="font-medium text-gray-800 mb-2 text-xs uppercase tracking-wide">支持浏览器</h6>
                          <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                            <div>• Chrome</div>
                            <div>• Firefox</div>
                            <div>• Safari</div>
                            <div>• Edge</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'preview' && parseResult && (
            <div className="p-6 space-y-6">
              {/* 顶部统计卡片 */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-green-800">
                        解析成功：{parseResult.validRows} 条有效记录
                      </h4>
                      <p className="text-green-600">
                        已选择 <span className="font-semibold">{selectedItems.size}</span> 条记录导入
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={toggleSelectAll}
                    className="text-green-700 border-green-300 hover:bg-green-100 font-medium"
                  >
                    {selectedItems.size === parseResult.data.length ? '全不选' : '全选'}
                  </Button>
                </div>
              </div>

              {/* 警告信息（如果有） */}
              {parseResult.errors.length > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-800 mb-2">发现 {parseResult.errors.length} 个问题</h4>
                      <div className="text-sm text-amber-700 space-y-1">
                        {parseResult.errors.slice(0, 3).map((error, index) => (
                          <div key={index}>• {error}</div>
                        ))}
                        {parseResult.errors.length > 3 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-amber-600 hover:text-amber-800 font-medium">
                              查看更多 ({parseResult.errors.length - 3} 个)
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

              {/* 数据预览 */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">数据预览</h3>
                  <p className="text-sm text-gray-600 mt-1">预览前20条记录，确认数据正确性</p>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-16">选择</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">标题</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">URL</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">分类</th>
                        {parseResult.data.some(item => item.cover) && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">封面</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parseResult.data.slice(0, 20).map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedItems.has(index)}
                              onChange={() => toggleItemSelection(index)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
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
                          <td className="px-4 py-3">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm truncate block max-w-xs underline"
                              title={item.url}
                            >
                              {item.url.length > 40 ? `${item.url.substring(0, 40)}...` : item.url}
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
                                  alt="封面"
                                  className="w-8 h-8 object-cover rounded border"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span className="text-gray-400 text-xs">无</span>
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
                        还有 {parseResult.data.length - 20} 条记录未显示
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
                  <h3 className="text-xl font-bold text-gray-800">正在导入您的收藏</h3>
                  <p className="text-gray-600 leading-relaxed">
                    正在将 <span className="font-semibold text-blue-600">{selectedItems.size}</span> 条记录导入到您的空间
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 text-sm text-blue-700">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>请勿关闭此窗口，导入过程可能需要几分钟</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        {step !== 'importing' && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                resetState();
              }}
              className="text-gray-600 border-gray-300 hover:bg-gray-100"
            >
              取消
            </Button>

            <div className="flex gap-3">
              {step === 'preview' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setStep('upload')}
                    className="text-gray-600 border-gray-300 hover:bg-gray-100"
                  >
                    重新选择
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={selectedItems.size === 0}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed px-6"
                  >
                    {selectedItems.size > 0 ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        导入 {selectedItems.size} 条记录
                      </span>
                    ) : (
                      '请选择要导入的记录'
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};