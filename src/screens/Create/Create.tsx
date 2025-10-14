import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { UploadIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { HeaderSection } from "../../components/shared/HeaderSection/HeaderSection";
import { SideMenuSection } from "../../components/shared/SideMenuSection/SideMenuSection";
import { useUser } from "../../contexts/UserContext";
import { useCategory } from "../../contexts/CategoryContext";
import { useToast } from "../../components/ui/toast";
import { PaperPlane } from "../../components/ui/copus-loading";
import { AuthService } from "../../services/authService";
import { publishArticle, getArticleDetail } from "../../services/articleService";
import { useNavigate } from "react-router-dom";
import { getCategoryStyle, getCategoryInlineStyle } from "../../utils/categoryStyles";


export const Create = (): JSX.Element => {
  const { user, isLoggedIn } = useUser();
  const { categories, categoriesLoading } = useCategory();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  // 检查是否是编辑模式
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    link: "",
    title: "",
    recommendation: "",
    selectedTopic: "生活", // 默认选中中文分类
    selectedTopicId: 1, // 对应的ID
    coverImage: null as File | null,
  });

  const [characterCount, setCharacterCount] = useState(0);
  const [titleCharacterCount, setTitleCharacterCount] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [linkValidation, setLinkValidation] = useState({ isValid: true, message: '' });

  // Extract domain from URL for display
  const extractDomain = (url: string): string => {
    if (!url.trim()) return "your-link.com";

    // Check for IPFS links
    if (url.startsWith('ipfs://')) {
      const hash = url.replace('ipfs://', '').split('/')[0];
      return `ipfs://${hash.substring(0, 12)}...`;
    }

    // Check for Arweave links
    if (url.startsWith('ar://')) {
      const hash = url.replace('ar://', '').split('/')[0];
      return `ar://${hash.substring(0, 12)}...`;
    }

    try {
      // Add protocol if missing for standard URLs
      const urlWithProtocol = url.match(/^(https?|ipfs|ar):\/\//i) ? url : `https://${url}`;
      const urlObj = new URL(urlWithProtocol);

      if (urlObj.protocol === 'ipfs:') {
        return `ipfs://${urlObj.hostname.substring(0, 12)}...`;
      }
      if (urlObj.protocol === 'ar:') {
        return `ar://${urlObj.hostname.substring(0, 12)}...`;
      }

      return urlObj.hostname;
    } catch (error) {
      // If URL parsing fails, try to extract domain manually
      const cleaned = url.replace(/^(https?|ipfs|ar):\/\//i, '').split('/')[0].split('?')[0];
      return cleaned || "your-link.com";
    }
  };

  // URL validation function
  const validateUrl = (url: string): { isValid: boolean; message: string } => {
    if (!url.trim()) {
      return { isValid: true, message: '' }; // Empty is OK, handled by required validation
    }

    // Check for IPFS links (ipfs:// or gateway URLs)
    if (url.startsWith('ipfs://')) {
      const hash = url.replace('ipfs://', '').split('/')[0];
      // Basic IPFS hash validation (CID v0 or v1)
      if (hash.length > 0 && (hash.startsWith('Qm') || hash.startsWith('baf'))) {
        return { isValid: true, message: '' };
      }
      return { isValid: false, message: 'Please enter a valid IPFS hash' };
    }

    // Check for Arweave links
    if (url.startsWith('ar://')) {
      const hash = url.replace('ar://', '').split('/')[0];
      // Basic Arweave transaction ID validation (43 characters)
      if (hash.length >= 43) {
        return { isValid: true, message: '' };
      }
      return { isValid: false, message: 'Please enter a valid Arweave transaction ID' };
    }

    // Check if input is just numbers or obviously invalid
    const trimmedUrl = url.trim();
    if (/^\d+$/.test(trimmedUrl)) {
      return { isValid: false, message: 'Please enter a valid website address, not just numbers' };
    }

    // Check for common invalid patterns
    if (trimmedUrl.length < 3) {
      return { isValid: false, message: 'Please enter a valid website address' };
    }

    // Check if it looks like a valid domain pattern (before adding protocol)
    const urlWithoutProtocol = trimmedUrl.replace(/^https?:\/\//i, '');
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}/.test(urlWithoutProtocol) && urlWithoutProtocol !== 'localhost') {
      return { isValid: false, message: 'Please enter a valid website address (e.g., example.com)' };
    }

    try {
      // Try to create URL object - this validates basic URL structure
      const urlWithProtocol = url.match(/^https?:\/\//i) ? url : `https://${url}`;
      const urlObj = new URL(urlWithProtocol);

      // Check for valid protocols
      if (!['http:', 'https:', 'ipfs:', 'ar:'].includes(urlObj.protocol)) {
        return { isValid: false, message: 'URL must use http://, https://, ipfs://, or ar://' };
      }

      // Check for valid hostname (skip for IPFS/Arweave)
      if (['http:', 'https:'].includes(urlObj.protocol)) {
        if (!urlObj.hostname || urlObj.hostname.length < 3) {
          return { isValid: false, message: 'Please enter a valid website address' };
        }

        // Check if hostname contains at least one dot (domain structure)
        // But allow localhost for development
        if (!urlObj.hostname.includes('.') && urlObj.hostname !== 'localhost') {
          return { isValid: false, message: 'Please enter a valid website address (e.g., example.com)' };
        }

        // Additional check: ensure hostname is not just numbers
        if (/^\d+$/.test(urlObj.hostname)) {
          return { isValid: false, message: 'Please enter a valid website address, not an IP address' };
        }

        // Check for valid TLD (at least 2 characters after the last dot)
        const parts = urlObj.hostname.split('.');
        if (parts.length < 2 || parts[parts.length - 1].length < 2) {
          return { isValid: false, message: 'Please enter a valid website address with a proper domain extension' };
        }
      }

      return { isValid: true, message: '' };
    } catch (error) {
      return { isValid: false, message: 'Please enter a valid URL (http://, https://, ipfs://, or ar://)' };
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "title") {
      // Limit title to 75 characters
      if (value.length <= 75) {
        setFormData(prev => ({ ...prev, [field]: value }));
        setTitleCharacterCount(value.length);
      }
    } else if (field === "recommendation") {
      // Limit recommendation to 1000 characters
      if (value.length <= 1000) {
        setFormData(prev => ({ ...prev, [field]: value }));
        setCharacterCount(value.length);
      }
    } else if (field === "link") {
      // Limit URL to 255 characters (common database field limit)
      if (value.length <= 255) {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Validate URL as user types (with debounce effect)
        setTimeout(() => {
          const validation = validateUrl(value);
          setLinkValidation(validation);
        }, 500);
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleTopicSelect = (topicName: string, topicId: number) => {
    setFormData(prev => ({ ...prev, selectedTopic: topicName, selectedTopicId: topicId }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, coverImage: file }));
    }
  };

  const selectedCategoryData = categories.find(cat => cat.name === formData.selectedTopic) || categories[0];
  const selectedCategoryStyle = getCategoryStyle(formData.selectedTopic, selectedCategoryData?.color);

  // 生成唯一ID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // 当分类数据加载完成后，设置默认选中的分类
  useEffect(() => {
    if (categories && categories.length > 0) {
      // 如果当前选中的分类不在列表中，选择第一个
      const currentCategoryExists = categories.some(cat => cat.name === formData.selectedTopic);
      if (!currentCategoryExists) {
        setFormData(prev => ({
          ...prev,
          selectedTopic: categories[0].name,
          selectedTopicId: categories[0].id
        }));
      }
    }
  }, [categories]);

  // 编辑模式：加载文章数据
  useEffect(() => {
    const loadArticleForEdit = async () => {
      if (!isEditMode || !editId) return;

      setIsLoadingArticle(true);
      try {
        const articleData = await getArticleDetail(editId);

        // 设置文章数据
        setEditingArticle(articleData);

        // 填充表单数据
        setFormData({
          link: articleData.targetUrl || "",
          title: articleData.title || "",
          recommendation: articleData.content || "",
          selectedTopic: articleData.categoryInfo?.name || "生活",
          selectedTopicId: articleData.categoryInfo?.id || 1,
          coverImage: null, // 编辑时不直接加载图片文件
        });

        // 设置封面图片URL用于显示
        setCoverImageUrl(articleData.coverUrl || "");
        setCharacterCount(articleData.content?.length || 0);
        setTitleCharacterCount(articleData.title?.length || 0);

      } catch (error) {
        console.error('❌ 加载文章数据失败:', error);
        showToast('Failed to load article data, please try again', 'error');
        navigate('/my-treasury');
      } finally {
        setIsLoadingArticle(false);
      }
    };

    loadArticleForEdit();
  }, [isEditMode, editId, navigate, showToast]);

  // 发布文章
  const handlePublish = async () => {
    // 基本验证 - 包括封面图
    if (!formData.link || !formData.title || !formData.recommendation) {
      showToast('Please fill in all required fields (link, title, recommendation)', 'error');
      return;
    }

    // URL validation
    const urlValidation = validateUrl(formData.link);
    if (!urlValidation.isValid) {
      showToast(`Invalid URL: ${urlValidation.message}`, 'error');
      setLinkValidation(urlValidation);
      return;
    }

    // 编辑模式时，如果没有上传新图片但有原始封面URL则允许
    if (!isEditMode && !formData.coverImage) {
      showToast('Please upload a cover image', 'error');
      return;
    }

    if (isEditMode && !formData.coverImage && !coverImageUrl) {
      showToast('Please upload a cover image', 'error');
      return;
    }

    setIsPublishing(true);

    try {
      let finalCoverUrl = coverImageUrl; // 默认使用现有的封面URL（编辑模式）

      // 如果有新上传的图片，则上传到S3
      if (formData.coverImage) {
        try {
          showToast('Uploading image...', 'info');

          const uploadResult = await AuthService.uploadImage(formData.coverImage);
          finalCoverUrl = uploadResult.url;

          showToast('Image uploaded successfully!', 'success');
        } catch (uploadError) {
          console.error('❌ 图片上传失败:', uploadError);
          showToast(`Image upload failed: ${uploadError.message || 'Please try again'}`, 'error');
          setIsPublishing(false);
          return;
        }
      }

      // 准备API参数 - 智能处理URL
      const processedUrl = formData.link.trim();
      let finalUrl = processedUrl;

      // 如果URL没有协议前缀，添加https:// (但保留IPFS和Arweave协议)
      if (!/^(https?|ipfs|ar):\/\//i.test(processedUrl)) {
        finalUrl = `https://${processedUrl}`;
      }

      // Validate field lengths before sending
      const fieldValidation = {
        title: formData.title.length,
        content: formData.recommendation.length,
        targetUrl: finalUrl.length,
        coverUrl: finalCoverUrl.length
      };

      console.log('📏 Field lengths:', fieldValidation);

      // Check if any field exceeds limits
      if (formData.title.length > 75) {
        throw new Error(`Title too long: ${formData.title.length} characters (max 75)`);
      }
      if (formData.recommendation.length > 1000) {
        throw new Error(`Recommendation too long: ${formData.recommendation.length} characters (max 1000)`);
      }
      if (finalUrl.length > 255) {
        throw new Error(`URL too long: ${finalUrl.length} characters (max 255)`);
      }
      if (finalCoverUrl.length > 500) {
        throw new Error(`Cover URL too long: ${finalCoverUrl.length} characters (max 500)`);
      }

      const articleParams = {
        ...(isEditMode && editId ? { uuid: editId } : {}), // 编辑模式时添加uuid
        categoryId: formData.selectedTopicId,
        content: formData.recommendation.substring(0, 1000), // Ensure max 1000 chars
        coverUrl: finalCoverUrl.substring(0, 500), // Ensure max 500 chars
        targetUrl: finalUrl.substring(0, 255), // Ensure max 255 chars
        title: formData.title.substring(0, 75), // Ensure max 75 chars
      };

      console.log('📤 Sending article params:', articleParams);
      console.log('📤 Detailed params:', {
        title: `"${articleParams.title}" (${articleParams.title.length} chars)`,
        content: `"${articleParams.content}" (${articleParams.content.length} chars)`,
        targetUrl: `"${articleParams.targetUrl}" (${articleParams.targetUrl.length} chars)`,
        coverUrl: `"${articleParams.coverUrl}" (${articleParams.coverUrl.length} chars)`,
        categoryId: articleParams.categoryId
      });

      const response = await publishArticle(articleParams);
      console.log('✅ Publish response:', response);

      showToast(isEditMode ? 'Article updated successfully!' : 'Article published successfully!', 'success');

      // 编辑模式：返回我的宝藏页面
      // 创建模式：重置表单并跳转
      if (isEditMode) {
        setTimeout(() => {
          navigate('/my-treasury');
        }, 1500);
      } else {
        // 重置表单
        setFormData({
          link: "",
          title: "",
          recommendation: "",
          selectedTopic: categories[0]?.name || "生活",
          selectedTopicId: categories[0]?.id || 1,
          coverImage: null,
        });
        setCharacterCount(0);
        setTitleCharacterCount(0);

        // 跳转到用户的My Treasury页面的My Share标签
        navigate('/my-treasury?tab=share');
      }

    } catch (error) {
      console.error('❌ Article publishing failed:', error);

      // Extract more detailed error message
      let errorMessage = 'Article publishing failed';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      } else if (typeof error === 'object' && error !== null && 'msg' in error) {
        errorMessage = (error as any).msg;
      }

      // Show more specific error message
      showToast(errorMessage || 'Article publishing failed, please try again', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <HeaderSection isLoggedIn={isLoggedIn} hideCreateButton={true} />
      <SideMenuSection activeItem="create" />
      <div className="ml-[360px] mr-[70px] min-h-screen overflow-y-auto pt-[120px]">
        <div className="flex flex-col items-start gap-[30px] px-40 py-0 pb-[100px] w-full">
          <div className="flex items-center gap-2.5 w-full">
            <h1 className="relative w-fit mt-[-1.00px] font-h-3 font-[number:var(--h-3-font-weight)] text-[#231f20] text-[length:var(--h-3-font-size)] text-center tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
              {isEditMode ? 'Edit treasure' : 'Share treasure'}
            </h1>
            {isEditMode && (
              <span className="text-sm text-gray-500 ml-2">
                (Edit Mode)
              </span>
            )}
          </div>

          <div className="flex items-start gap-[60px] w-full">
            <div className="flex flex-col items-start gap-[30px] pl-0 pr-[60px] py-0 flex-1 border-r [border-right-style:solid] border-light-grey">
            <div className="flex flex-col items-start gap-2.5 w-full">
              <div className="flex flex-col w-[60px] h-[23px] items-start justify-center gap-2.5">
                <label className="relative flex items-center justify-center w-fit mt-[-2.00px] font-p-l font-[number:var(--p-l-font-weight)] text-transparent text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  <span className="text-[#f23a00] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] text-[length:var(--p-l-font-size)]">
                    *
                  </span>
                  <span className="text-[#686868] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] text-[length:var(--p-l-font-size)]">
                    Link
                  </span>
                </label>
              </div>

              <div className={`flex items-center px-[15px] py-2.5 w-full bg-white rounded-[15px] border border-solid transition-all ${
                !linkValidation.isValid ? 'border-red shadow-sm' :
                focusedField === 'link' ? 'border-red shadow-sm' : 'border-light-grey'
              }`}>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => handleInputChange("link", e.target.value)}
                  onFocus={() => setFocusedField('link')}
                  onBlur={() => setFocusedField(null)}
                  className="flex-1 [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-5 placeholder:text-medium-grey border-0 bg-transparent focus:outline-none"
                  placeholder="Enter or paste your link here (http://, https://, ipfs://, ar://)..."
                  aria-label="Link URL"
                  maxLength={255}
                />
              </div>

              {/* URL Validation Message */}
              {!linkValidation.isValid && formData.link && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-red text-sm">⚠</span>
                  <span className="text-red text-sm">{linkValidation.message}</span>
                </div>
              )}

              {/* URL Format Helper */}
              {linkValidation.isValid && formData.link && (
                <div className="flex items-center justify-between w-full mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-green text-sm">✓</span>
                    <span className="text-green text-sm">Valid URL</span>
                  </div>
                  <span className="text-medium-grey text-xs">{formData.link.length}/255</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-start gap-2.5 w-full">
              <div className="flex items-center justify-between w-full">
                <label className="relative w-[60px] mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-transparent text-base tracking-[0] leading-4">
                  <span className="text-[#f23a00] leading-[var(--p-line-height)] font-p [font-style:var(--p-font-style)] font-[number:var(--p-font-weight)] tracking-[var(--p-letter-spacing)] text-[length:var(--p-font-size)]">
                    *
                  </span>
                  <span className="text-[#686868] text-[length:var(--p-l-font-size)] leading-[var(--p-l-line-height)] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)]">
                    Title
                  </span>
                </label>
                <span className="[font-family:'Maven_Pro',Helvetica] font-normal text-medium-grey text-sm">
                  {titleCharacterCount}/75
                </span>
              </div>

              <div className={`flex items-start gap-[5px] px-[15px] py-2.5 w-full bg-white rounded-[15px] border border-solid transition-all ${
                focusedField === 'title' ? 'border-red shadow-sm' : 'border-light-grey'
              }`}>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  onFocus={() => setFocusedField('title')}
                  onBlur={() => setFocusedField(null)}
                  className="relative w-full mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-lg tracking-[0] leading-[23.4px] placeholder:text-medium-grey placeholder:font-normal border-0 bg-transparent focus:outline-none"
                  placeholder="Enter title..."
                  aria-label="Title"
                  maxLength={75}
                />
              </div>
            </div>

            <div className="flex flex-col items-start gap-2.5 w-full">
              <div className="flex w-[60px] items-center gap-2.5">
                <label className="items-center justify-center w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-transparent text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap relative flex [font-style:var(--p-l-font-style)]">
                  <span className="text-[#f23a00] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] text-[length:var(--p-l-font-size)]">
                    *
                  </span>
                  <span className="text-[#686868] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] text-[length:var(--p-l-font-size)]">
                    Cover
                  </span>
                </label>
              </div>

              <div
                className={`relative w-full aspect-[4/3] border border-dashed cursor-pointer transition-all rounded-lg ${
                  formData.coverImage || coverImageUrl
                    ? 'border-green-400 bg-cover bg-[50%_50%]'
                    : 'border-medium-grey hover:border-dark-grey bg-gray-50'
                }`}
                style={{
                  backgroundImage: formData.coverImage
                    ? `url(${URL.createObjectURL(formData.coverImage)})`
                    : coverImageUrl
                    ? `url(${coverImageUrl})`
                    : 'none'
                }}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      handleImageUpload({ target: { files: [file] } } as any);
                    }
                  };
                  input.click();
                }}
              >
                {!formData.coverImage && !coverImageUrl && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-medium-grey text-lg font-medium mb-2">Click to upload cover image</p>
                    <p className="text-medium-grey text-sm">Supports JPG, PNG formats</p>
                  </div>
                )}
                {isEditMode && coverImageUrl && !formData.coverImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all">
                    <div className="opacity-0 hover:opacity-100 text-white text-center">
                      <p className="text-lg font-medium">Click to change cover image</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start gap-2.5 w-full">
              <label className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-transparent text-base tracking-[0] leading-4">
                <span className="text-[#f23a00] leading-[var(--p-line-height)] font-p [font-style:var(--p-font-style)] font-[number:var(--p-font-weight)] tracking-[var(--p-letter-spacing)] text-[length:var(--p-font-size)]">
                  *
                </span>
                <span className="text-[#686868] text-[length:var(--p-l-font-size)] leading-[var(--p-l-line-height)] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)]">
                  Recommendation
                </span>
              </label>

              <div className={`flex flex-col h-44 items-start justify-between px-[15px] py-2.5 w-full bg-white rounded-[15px] border border-solid transition-all ${
                focusedField === 'recommendation' ? 'border-red shadow-sm' : 'border-light-grey'
              }`}>
                <textarea
                  value={formData.recommendation}
                  onChange={(e) => handleInputChange("recommendation", e.target.value)}
                  onFocus={() => setFocusedField('recommendation')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Please describe why you recommend this link..."
                  className="relative self-stretch flex-1 resize-none font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)] placeholder:text-medium-grey border-0 bg-transparent focus:outline-none"
                  aria-label="Recommendation"
                  maxLength={1000}
                />
                <div className="relative self-stretch [font-family:'Maven_Pro',Helvetica] font-normal text-medium-grey text-base text-right tracking-[0] leading-[25px]">
                  {characterCount}/1000
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2.5 w-full">
              <div className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-off-black text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
                Choose a topic {categoriesLoading && <span className="text-medium-grey">(Loading...)</span>}
              </div>

              <div className="gap-2.5 inline-flex items-start flex-wrap">
                {categories.map((category) => {
                  const categoryStyle = getCategoryStyle(category.name, category.color);
                  const categoryInlineStyle = getCategoryInlineStyle(category.color);
                  const isSelected = formData.selectedTopic === category.name;

                  return (
                    <Badge
                      key={category.id}
                      variant="outline"
                      className={`cursor-pointer transition-all inline-flex items-center gap-[5px] px-2.5 py-2 rounded-[50px] border-2 w-fit ${
                        category.color ? '' : `${categoryStyle.border} ${categoryStyle.bg}`
                      } ${
                        isSelected
                          ? 'ring-2 ring-offset-1' + (category.color ? ' ring-opacity-50' : ' ring-gray-400')
                          : 'hover:border-dark-grey hover:shadow-sm'
                      }`}
                      style={category.color ? categoryInlineStyle : undefined}
                      onClick={() => handleTopicSelect(category.name, category.id)}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleTopicSelect(category.name, category.id);
                        }
                      }}
                    >
                      <span
                        className={`[font-family:'Lato',Helvetica] font-semibold text-sm tracking-[0] leading-[14px] ${
                          category.color ? '' : categoryStyle.text
                        }`}
                        style={category.color ? { color: categoryInlineStyle.color } : undefined}
                      >
                        {category.name}
                      </span>
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

            <div className="inline-flex flex-col items-start gap-5">
              <div className="flex w-[60px] items-center gap-2.5">
                <div className="relative flex items-center justify-center w-fit mt-[-1.00px] mr-[-4.00px] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  Preview
                </div>
              </div>

              <div className="flex flex-col items-start gap-10 w-full">
                <div className="flex flex-col w-[374px] items-start gap-[15px] p-5 bg-white rounded-lg shadow-card-white">
                  <div className="flex flex-col items-start justify-center gap-[15px] w-full rounded-[100px]">
                    <div
                      className="flex flex-col aspect-[4/3] items-start justify-between p-2.5 w-full bg-cover bg-[50%_50%] rounded-lg relative"
                      style={{
                        backgroundImage: formData.coverImage
                          ? `url(${URL.createObjectURL(formData.coverImage)})`
                          : coverImageUrl
                          ? `url(${coverImageUrl})`
                          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                      }}
                    >
                      {!formData.coverImage && !coverImageUrl && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-gray-500 text-xs">Cover Preview</p>
                          </div>
                        </div>
                      )}
                      <Badge
                        variant="outline"
                        style={getCategoryInlineStyle(selectedCategoryData?.color)}
                      >
                        {formData.selectedTopic}
                      </Badge>

                      <div className="flex justify-end">
                        <div className="inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-white rounded-[15px] overflow-hidden">
                          <span className="[font-family:'Lato',Helvetica] font-bold text-blue text-sm text-right tracking-[0] leading-[18.2px] whitespace-nowrap">
                            {extractDomain(formData.link)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-[15px] w-full">
                      <div className="relative w-full mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-[22px] tracking-[0] leading-[30px] break-words">
                        {formData.title || "Please enter your link title"}
                      </div>

                      <div className="flex flex-col items-start gap-[15px] px-2.5 py-[15px] w-full rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                        <div className="relative w-full [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[27px] break-words">
                          "{formData.recommendation
                            ? formData.recommendation.length > 200
                              ? formData.recommendation.substring(0, 200) + "..."
                              : formData.recommendation
                            : "Please describe why you recommend this link..."}"
                        </div>

                        <div className="flex items-start justify-between w-full">
                          <div className="inline-flex items-center gap-2.5">
                            <Avatar className="w-[18px] h-[18px]">
                              <AvatarImage
                                src={
                                  user?.faceUrl ||
                                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'vivi'}&backgroundColor=b6e3f4&hair=longHair&hairColor=724133&eyes=happy&mouth=smile&accessories=prescription01&accessoriesColor=262e33`
                                }
                                alt="Profile"
                                className="object-cover"
                              />
                              <AvatarFallback>UN</AvatarFallback>
                            </Avatar>
                            <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px]">
                              {user?.username || "Guest User"}
                            </span>
                          </div>

                          <div className="inline-flex h-[25px] items-center">
                            <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px]">
                              Today
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="inline-flex items-center justify-center gap-[15px] px-10 py-[15px] bg-red rounded-[50px] cursor-pointer hover:bg-red/90 transition-colors w-full"
                    onClick={!isPublishing && formData.link && formData.title && formData.recommendation && (formData.coverImage || coverImageUrl) && linkValidation.isValid ? handlePublish : undefined}
                    style={{
                      opacity: isPublishing || !formData.link || !formData.title || !formData.recommendation || (!formData.coverImage && !coverImageUrl) || !linkValidation.isValid ? 0.5 : 1,
                      cursor: isPublishing || !formData.link || !formData.title || !formData.recommendation || (!formData.coverImage && !coverImageUrl) || !linkValidation.isValid ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <span className="[font-family:'Lato',Helvetica] font-bold text-white text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                      {isPublishing ? (
                        <span className="flex items-center space-x-2">
                          <PaperPlane />
                          <span>{isEditMode ? 'Updating...' : 'Publishing...'}</span>
                        </span>
                      ) : (
                        isEditMode ? 'Update' : 'Publish'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
