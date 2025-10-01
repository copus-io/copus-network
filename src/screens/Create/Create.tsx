import React, { useState } from "react";
import { Link } from "react-router-dom";
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
import { useToast } from "../../components/ui/toast";
import { PaperPlane } from "../../components/ui/copus-loading";
import { AuthService } from "../../services/authService";
import { publishArticle } from "../../services/articleService";
import { useNavigate } from "react-router-dom";

const topicData = [
  {
    label: "Life",
    color:
      "border-[#ea7db7] bg-[linear-gradient(0deg,rgba(234,125,183,0.2)_0%,rgba(234,125,183,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    textColor: "text-pink",
  },
  {
    label: "Art",
    color: "border-[#2b8649] bg-[linear-gradient(0deg,rgba(43,134,73,0.2)_0%,rgba(43,134,73,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    textColor: "text-green",
  },
  {
    label: "Design",
    color: "border-[#2191fb] bg-[linear-gradient(0deg,rgba(33,145,251,0.2)_0%,rgba(33,145,251,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    textColor: "text-blue",
  },
  {
    label: "Technology",
    color: "border-[#c9b71f] bg-[linear-gradient(0deg,rgba(201,183,31,0.2)_0%,rgba(201,183,31,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    textColor: "text-[#c9b71f]",
  },
];

export const Create = (): JSX.Element => {
  const { user, isLoggedIn } = useUser();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    link: "",
    title: "",
    recommendation: "",
    selectedTopic: "Life",
    coverImage: null as File | null,
  });

  const [characterCount, setCharacterCount] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "recommendation") {
      setCharacterCount(value.length);
    }
  };

  const handleTopicSelect = (topic: string) => {
    setFormData(prev => ({ ...prev, selectedTopic: topic }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, coverImage: file }));
    }
  };

  const selectedTopicData = topicData.find(topic => topic.label === formData.selectedTopic) || topicData[0];

  // 生成唯一ID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // 映射topic到categoryId
  const getCategoryId = (topic: string): number => {
    const categoryMap: Record<string, number> = {
      "Life": 1,
      "Art": 2,
      "Design": 3,
      "Technology": 4,
    };
    return categoryMap[topic] || 0;
  };

  // 发布文章
  const handlePublish = async () => {
    // 基本验证 - 包括封面图
    if (!formData.link || !formData.title || !formData.recommendation) {
      showToast('请填写完整的文章信息（链接、标题、推荐理由）', 'error');
      return;
    }

    if (!formData.coverImage) {
      showToast('请上传封面图片', 'error');
      return;
    }

    setIsPublishing(true);

    try {
      let coverUrl = "";

      // 上传封面图片到S3 - 必须成功
      try {
        console.log('📤 开始上传封面图片到S3...');
        showToast('正在上传图片...', 'info');

        const uploadResult = await AuthService.uploadImage(formData.coverImage);
        coverUrl = uploadResult.url;

        console.log('✅ 图片上传成功，URL:', coverUrl);
        showToast('图片上传成功！', 'success');
      } catch (uploadError) {
        console.error('❌ 图片上传失败:', uploadError);
        showToast(`图片上传失败：${uploadError.message || '请重试'}`, 'error');
        setIsPublishing(false);
        return;
      }

      // 准备API参数
      const articleParams = {
        categoryId: getCategoryId(formData.selectedTopic),
        content: formData.recommendation,
        coverUrl: coverUrl,
        targetUrl: formData.link.startsWith('http') ? formData.link : `http://${formData.link}`,
        title: formData.title,
      };

      console.log('🚀 准备发布文章:', articleParams);

      const response = await publishArticle(articleParams);
      console.log('✅ 文章发布成功:', response);

      showToast('文章发布成功！', 'success');

      // 重置表单
      setFormData({
        link: "",
        title: "",
        recommendation: "",
        selectedTopic: "Life",
        coverImage: null,
      });
      setCharacterCount(0);

      // 跳转到发现页面或个人页面
      navigate('/discovery');

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
        <div className="flex flex-col items-start gap-[30px] px-40 py-0 w-full">
          <div className="flex items-center gap-2.5 w-full">
            <h1 className="relative w-fit mt-[-1.00px] font-h-3 font-[number:var(--h-3-font-weight)] text-[#231f20] text-[length:var(--h-3-font-size)] text-center tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
              Share treasure
            </h1>
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

              <div className="flex items-center px-[15px] py-2.5 w-full bg-white rounded-[15px] border border-solid border-light-grey">
                <div className="inline-flex items-center justify-center gap-2.5 px-0 py-[5px] rounded-[15px]">
                  <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-lg tracking-[0] leading-5 whitespace-nowrap">
                    http://
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => handleInputChange("link", e.target.value)}
                  className="flex-1 ml-2 [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-5 placeholder:text-medium-grey border-0 bg-transparent focus:outline-none"
                  placeholder="Enter your link here..."
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

              <div className="flex items-start gap-[5px] px-[15px] py-2.5 w-full bg-white rounded-[15px] border border-solid border-light-grey">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
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
                className="relative w-full h-[260px] border border-dashed border-medium-grey bg-cover bg-[50%_50%] cursor-pointer hover:border-dark-grey transition-colors rounded-lg"
                style={{
                  backgroundImage: formData.coverImage
                    ? `url(${URL.createObjectURL(formData.coverImage)})`
                    : 'url(https://c.animaapp.com/qjmVjlpe/img/preview-image.svg)'
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
                role="button"
                tabIndex={0}
                aria-label="Upload cover image"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    (e.target as HTMLElement).click();
                  }
                }}
              />
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

              <div className="flex flex-col h-44 items-start justify-between px-[15px] py-2.5 w-full bg-white rounded-[15px] border border-solid border-light-grey">
                <textarea
                  value={formData.recommendation}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 1000) {
                      handleInputChange("recommendation", value);
                      setCharacterCount(value.length);
                    }
                  }}
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
                Choose a topic
              </div>

              <div className="gap-2.5 inline-flex items-start flex-wrap">
                {topicData.map((topic, index) => (
                  <div
                    key={index}
                    className={`inline-flex items-center gap-[5px] px-2.5 py-2 rounded-[50px] border border-solid cursor-pointer transition-all ${
                      formData.selectedTopic === topic.label
                        ? topic.color
                        : 'border-medium-grey bg-white hover:border-dark-grey'
                    }`}
                    onClick={() => handleTopicSelect(topic.label)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={formData.selectedTopic === topic.label}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleTopicSelect(topic.label);
                      }
                    }}
                  >
                    <div
                      className={`font-semibold relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] ${
                        formData.selectedTopic === topic.label ? topic.textColor : 'text-medium-dark-grey'
                      } text-sm tracking-[0] leading-[14px] whitespace-nowrap`}
                    >
                      {topic.label}
                    </div>
                  </div>
                ))}
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
                      className="flex flex-col h-[156px] items-start justify-between p-2.5 w-full bg-cover bg-[50%_50%] rounded-lg"
                      style={{
                        backgroundImage: formData.coverImage
                          ? `url(${URL.createObjectURL(formData.coverImage)})`
                          : 'url(https://c.animaapp.com/qjmVjlpe/img/preview-image.svg)'
                      }}
                    >
                      <div className={`inline-flex items-center gap-[5px] px-2.5 py-2 rounded-[50px] border border-solid w-fit ${selectedTopicData.color}`}>
                        <span className={`font-semibold [font-family:'Lato',Helvetica] ${selectedTopicData.textColor} text-sm tracking-[0] leading-[14px] whitespace-nowrap`}>
                          {formData.selectedTopic}
                        </span>
                      </div>

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
                    onClick={!isPublishing && formData.link && formData.title && formData.recommendation && formData.coverImage ? handlePublish : undefined}
                    style={{
                      opacity: isPublishing || !formData.link || !formData.title || !formData.recommendation || !formData.coverImage ? 0.5 : 1,
                      cursor: isPublishing || !formData.link || !formData.title || !formData.recommendation || !formData.coverImage ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <span className="[font-family:'Lato',Helvetica] font-bold text-white text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                      {isPublishing ? (
                        <span className="flex items-center space-x-2">
                          <PaperPlane />
                          <span>Publishing...</span>
                        </span>
                      ) : (
                        'Publish'
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
