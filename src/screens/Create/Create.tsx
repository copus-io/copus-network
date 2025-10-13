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
  const [isPublishing, setIsPublishing] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "recommendation") {
      setCharacterCount(value.length);
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

      } catch (error) {
        console.error('❌ 加载文章数据失败:', error);
        showToast('加载文章数据失败，请重试', 'error');
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
      showToast('请填写完整的文章信息（链接、标题、推荐理由）', 'error');
      return;
    }

    // 编辑模式时，如果没有上传新图片但有原始封面URL则允许
    if (!isEditMode && !formData.coverImage) {
      showToast('请上传封面图片', 'error');
      return;
    }

    if (isEditMode && !formData.coverImage && !coverImageUrl) {
      showToast('请上传封面图片', 'error');
      return;
    }

    setIsPublishing(true);

    try {
      let finalCoverUrl = coverImageUrl; // 默认使用现有的封面URL（编辑模式）

      // 如果有新上传的图片，则上传到S3
      if (formData.coverImage) {
        try {
          showToast('正在上传图片...', 'info');

          const uploadResult = await AuthService.uploadImage(formData.coverImage);
          finalCoverUrl = uploadResult.url;

          showToast('图片上传成功！', 'success');
        } catch (uploadError) {
          console.error('❌ 图片上传失败:', uploadError);
          showToast(`图片上传失败：${uploadError.message || '请重试'}`, 'error');
          setIsPublishing(false);
          return;
        }
      }

      // 准备API参数 - 智能处理URL
      const processedUrl = formData.link.trim();
      let finalUrl = processedUrl;

      // 如果URL没有协议前缀，添加https://
      if (!/^https?:\/\//i.test(processedUrl)) {
        finalUrl = `https://${processedUrl}`;
      }

      const articleParams = {
        ...(isEditMode && editId ? { uuid: editId } : {}), // 编辑模式时添加uuid
        categoryId: formData.selectedTopicId,
        content: formData.recommendation,
        coverUrl: finalCoverUrl,
        targetUrl: finalUrl,
        title: formData.title,
      };


      const response = await publishArticle(articleParams);

      showToast(isEditMode ? '文章更新成功！' : '文章发布成功！', 'success');

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

        // 跳转到Published成功页面
        navigate('/published');
      }

    } catch (error) {
      console.error('❌ 文章发布失败:', error);
      showToast('文章发布失败，请重试', 'error');
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
                (编辑模式)
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
                focusedField === 'link' ? 'border-red shadow-sm' : 'border-light-grey'
              }`}>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => handleInputChange("link", e.target.value)}
                  onFocus={() => setFocusedField('link')}
                  onBlur={() => setFocusedField(null)}
                  className="flex-1 [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-5 placeholder:text-medium-grey border-0 bg-transparent focus:outline-none"
                  placeholder="Enter or paste your link here..."
                  aria-label="Link URL"
                />
              </div>
            </div>

            <div className="flex flex-col items-start gap-2.5 w-full">
              <label className="relative w-[60px] mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-transparent text-base tracking-[0] leading-4">
                <span className="text-[#f23a00] leading-[var(--p-line-height)] font-p [font-style:var(--p-font-style)] font-[number:var(--p-font-weight)] tracking-[var(--p-letter-spacing)] text-[length:var(--p-font-size)]">
                  *
                </span>
                <span className="text-[#686868] text-[length:var(--p-l-font-size)] leading-[var(--p-l-line-height)] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)]">
                  Title
                </span>
              </label>

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
                className={`relative w-full h-[260px] border border-dashed cursor-pointer transition-all rounded-lg ${
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
                    <p className="text-medium-grey text-lg font-medium mb-2">点击上传封面图片</p>
                    <p className="text-medium-grey text-sm">支持 JPG、PNG 格式</p>
                  </div>
                )}
                {isEditMode && coverImageUrl && !formData.coverImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all">
                    <div className="opacity-0 hover:opacity-100 text-white text-center">
                      <p className="text-lg font-medium">点击更换封面图片</p>
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
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 1000) {
                      handleInputChange("recommendation", value);
                      setCharacterCount(value.length);
                    }
                  }}
                  onFocus={() => setFocusedField('recommendation')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Please describe why you recommend this link..."
                  className="relative self-stretch flex-1 resize-none font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)] placeholder:text-medium-grey border-0 bg-transparent focus:outline-none"
                  aria-label="Recommendation"
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
                      className="flex flex-col h-[156px] items-start justify-between p-2.5 w-full bg-cover bg-[50%_50%] rounded-lg relative"
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
                            <p className="text-gray-500 text-xs">封面预览</p>
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
                            {formData.link ? formData.link.replace(/^https?:\/\//, '') : "your-link.com"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-[15px] w-full">
                      <div className="relative w-full mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-[22px] tracking-[0] leading-[33px]">
                        {formData.title || "Please enter your link title"}
                      </div>

                      <div className="flex flex-col items-start gap-[15px] px-2.5 py-[15px] w-full rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                        <div className="relative w-full [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[27px]">
                          "{formData.recommendation || "Please describe why you recommend this link..."}"
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
                    onClick={!isPublishing && formData.link && formData.title && formData.recommendation && (formData.coverImage || coverImageUrl) ? handlePublish : undefined}
                    style={{
                      opacity: isPublishing || !formData.link || !formData.title || !formData.recommendation || (!formData.coverImage && !coverImageUrl) ? 0.5 : 1,
                      cursor: isPublishing || !formData.link || !formData.title || !formData.recommendation || (!formData.coverImage && !coverImageUrl) ? 'not-allowed' : 'pointer'
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
