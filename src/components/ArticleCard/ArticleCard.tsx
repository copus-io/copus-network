import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Edit2, Trash2 } from "lucide-react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { TreasureButton } from "../ui/TreasureButton";
import { ImagePreviewModal } from "../ui/image-preview-modal";
import { LazyImage } from "../ui/lazy-image";
import { getCategoryStyle, getCategoryInlineStyle, formatCount, formatDate } from "../../utils/categoryStyles";

// 通用文章数据接口
export interface ArticleData {
  id: string;
  uuid?: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  categoryColor?: string;
  userName: string;
  userAvatar: string;
  userId?: number;
  namespace?: string;
  userNamespace?: string;
  date: string;
  treasureCount: number | string;
  visitCount: string;
  isLiked?: boolean;
  targetUrl?: string;
  website?: string;
}

// 布局模式
export type LayoutMode = 'discovery' | 'treasury' | 'published' | 'compact';

// 操作按钮配置
export interface ActionConfig {
  showEdit?: boolean;
  showDelete?: boolean;
  showTreasure?: boolean;
  showVisits?: boolean;
  showBranchIt?: boolean;
  showWebsite?: boolean;
}

// 组件Props
export interface ArticleCardProps {
  article: ArticleData;
  layout?: LayoutMode;
  actions?: ActionConfig;
  isHovered?: boolean;
  onLike?: (articleId: string, currentIsLiked: boolean, currentLikeCount: number) => Promise<void>; // 现在是可选的，用于向后兼容
  onEdit?: (articleId: string) => void;
  onDelete?: (articleId: string) => void;
  onUserClick?: (userId: number | undefined, userNamespace?: string) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  layout = 'discovery',
  actions = {
    showTreasure: true,
    showVisits: true,
    showWebsite: false
  },
  isHovered = false,
  onLike,
  onEdit,
  onDelete,
  onUserClick,
  onMouseEnter,
  onMouseLeave,
  className = ""
}) => {
  const categoryStyle = getCategoryStyle(article.category, article.categoryColor);
  const categoryInlineStyle = getCategoryInlineStyle(article.categoryColor);

  // 图片预览相关状态
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewImageAlt, setPreviewImageAlt] = useState("");

  // 处理点赞
  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onLike) {
      const currentCount = typeof article.treasureCount === 'string'
        ? parseInt(article.treasureCount) || 0
        : article.treasureCount;
      await onLike(article.uuid || article.id, article.isLiked || false, currentCount);
    }
  };

  // 处理用户点击
  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onUserClick) {
      // 优先使用 namespace，如果不存在则使用 userNamespace 作为兜底
      onUserClick(article.userId, article.namespace || article.userNamespace);
    }
  };

  // 处理编辑
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(article.id);
    }
  };

  // 处理删除
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(article.id);
    }
  };

  // 处理图片预览
  const handleImagePreview = (imageUrl: string, alt: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewImageUrl(imageUrl);
    setPreviewImageAlt(alt);
    setIsImagePreviewOpen(true);
  };

  // 关闭图片预览
  const handleCloseImagePreview = () => {
    setIsImagePreviewOpen(false);
    setPreviewImageUrl("");
    setPreviewImageAlt("");
  };

  // 根据布局模式渲染不同的卡片内容
  const renderCardContent = () => {
    switch (layout) {
      case 'treasury':
        return (
          <CardContent className="flex flex-col gap-[25px] py-5 px-[30px] flex-1">
            <div className="flex flex-col gap-5 flex-1">
              <div
                className="flex flex-col h-[240px] justify-between p-[15px] rounded-lg bg-cover bg-center bg-no-repeat cursor-pointer transition-transform hover:scale-[1.02]"
                style={{ backgroundImage: `url(${article.coverImage})` }}
                onClick={handleImagePreview(article.coverImage, `${article.title} 封面图`)}
                title="点击查看大图"
              >
                {/* 分类标签 */}
                <Badge
                  variant="outline"
                  className={`inline-flex items-center gap-[5px] px-2.5 py-2 rounded-[50px] border-2 w-fit ${
                    article.categoryColor ? '' : `${categoryStyle.border} ${categoryStyle.bg}`
                  }`}
                  style={article.categoryColor ? categoryInlineStyle : undefined}
                >
                  <span
                    className={`[font-family:'Lato',Helvetica] font-semibold text-sm tracking-[0] leading-[14px] ${
                      article.categoryColor ? '' : categoryStyle.text
                    }`}
                    style={article.categoryColor ? { color: categoryInlineStyle.color } : undefined}
                  >
                    {article.category}
                  </span>
                </Badge>

                {/* 网站链接或收藏标记 */}
                <div className="flex justify-end">
                  {actions.showWebsite && article.website ? (
                    <div className="inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-[#ffffffcc] rounded-[15px] overflow-hidden">
                      <span className="[font-family:'Lato',Helvetica] font-medium text-blue text-sm text-right tracking-[0] leading-[18.2px]">
                        {article.website}
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#E19F1D] rounded-[10px]">
                      <img
                        className="w-3 h-3.5"
                        alt="Treasure icon"
                        src="https://c.animaapp.com/mft5gmofxQLTNf/img/treasure-icon.svg"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                      <span className="text-white text-xs font-medium">收藏</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-[15px] flex-1">
                <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-[36px] line-clamp-1">
                  {article.title}
                </h3>

                <div className="flex flex-col gap-[15px] px-2.5 py-[15px] rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] group-hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.45)_0%,rgba(224,224,224,0.45)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-colors">
                  <p className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[27px] line-clamp-1">
                    "{article.description}"
                  </p>

                  <div className="flex items-start justify-between">
                    <div className="inline-flex items-center gap-2.5">
                      <Avatar
                        className="w-[18px] h-[18px] cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all duration-200"
                        onClick={handleUserClick}
                        title={`查看 ${article.userName} 的宝藏`}
                      >
                        <AvatarImage src={article.userAvatar} alt="Profile image" className="object-cover" />
                      </Avatar>
                      <span
                        className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={handleUserClick}
                      >
                        {article.userName}
                      </span>
                    </div>

                    <div className="inline-flex h-[25px] items-center">
                      <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px]">
                        {formatDate(article.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮区域 */}
            <div className="flex items-center justify-between mt-auto">
              <div className="inline-flex items-center gap-[15px]">
                {/* 宝石按钮 */}
                {actions.showTreasure && (
                  <TreasureButton
                    isLiked={article.isLiked || false}
                    likesCount={typeof article.treasureCount === 'string' ? parseInt(article.treasureCount) || 0 : article.treasureCount}
                    onClick={handleLikeClick}
                    size="medium"
                  />
                )}

                {/* 访问量 */}
                {actions.showVisits && (
                  <div className="inline-flex items-center gap-2">
                    <img
                      className="w-5 h-3.5"
                      alt="Ic view"
                      src="https://c.animaapp.com/mft5gmofxQLTNf/img/ic-view.svg"
                    />
                    <span className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-base text-center tracking-[0] leading-[20.8px]">
                      {article.visitCount}
                    </span>
                  </div>
                )}
              </div>

              {/* 编辑删除按钮区域 */}
              <div className="flex items-center gap-2 min-h-[24px]">
                {isHovered && (actions.showEdit || actions.showDelete) && (
                  <>
                    {actions.showEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 h-auto hover:bg-blue-50 transition-colors"
                        onClick={handleEdit}
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </Button>
                    )}

                    {actions.showDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 h-auto hover:bg-red-50 transition-colors"
                        onClick={handleDelete}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </>
                )}

                {/* Branch It 图标 */}
                {actions.showBranchIt && !isHovered && (
                  <img
                    className="flex-shrink-0"
                    alt="Branch it"
                    src="https://c.animaapp.com/mftam89xRJwsqQ/img/branch-it.svg"
                  />
                )}
              </div>
            </div>
          </CardContent>
        );

      case 'discovery':
      default:
        return (
          <CardContent className="flex flex-col gap-[25px] py-5 px-[30px] flex-1">
            <div className="flex flex-col gap-5 flex-1">
              <div className="relative h-[240px] rounded-lg overflow-hidden bg-gray-200">
                <LazyImage
                  src={article.coverImage || ''}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  placeholder="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg=="
                />

                <div className="absolute inset-0 flex flex-col justify-between p-[15px]">
                  <Badge
                    variant="outline"
                    className={`inline-flex items-center gap-[5px] px-2.5 py-2 rounded-[50px] border-2 w-fit ${
                      article.categoryColor ? '' : `${categoryStyle.border} ${categoryStyle.bg}`
                    }`}
                    style={article.categoryColor ? categoryInlineStyle : undefined}
                  >
                    <span
                      className={`[font-family:'Lato',Helvetica] font-semibold text-sm tracking-[0] leading-[14px] ${
                        article.categoryColor ? '' : categoryStyle.text
                      }`}
                      style={article.categoryColor ? { color: categoryInlineStyle.color } : undefined}
                    >
                      {article.category}
                    </span>
                  </Badge>

                  {/* 网站链接 */}
                  <div className="flex justify-end">
                    {article.website && (
                      <div className="inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-[#ffffffcc] rounded-[15px] overflow-hidden">
                        <span className="[font-family:'Lato',Helvetica] font-medium text-blue text-sm text-right tracking-[0] leading-[18.2px]">
                          {article.website}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-[15px] flex-1">
                <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-2xl tracking-[0] leading-[36px] line-clamp-1">
                  {article.title}
                </h3>

                <div className="flex flex-col gap-[15px] px-2.5 py-[15px] rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] group-hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.45)_0%,rgba(224,224,224,0.45)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-colors">
                  <p className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[27px] line-clamp-1">
                    "{article.description}"
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <Avatar
                        className="w-[18px] h-[18px] cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all duration-200"
                        onClick={handleUserClick}
                        title={`查看 ${article.userName} 的宝藏`}
                      >
                        <AvatarImage src={article.userAvatar} alt={article.userName} className="object-cover" />
                      </Avatar>
                      <span
                        className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={handleUserClick}
                      >
                        {article.userName}
                      </span>
                    </div>
                    <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px]">
                      {formatDate(article.date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 添加点赞按钮区域 */}
            {actions.showTreasure && (
              <div className="flex items-center justify-between px-[5px]">
                <div className="inline-flex items-center gap-[15px]">
                  <TreasureButton
                    isLiked={article.isLiked || false}
                    likesCount={typeof article.treasureCount === 'string' ? parseInt(article.treasureCount) || 0 : article.treasureCount}
                    onClick={handleLikeClick}
                    size="medium"
                  />

                  {actions.showVisits && (
                    <div className="inline-flex items-center gap-2">
                      <img
                        className="w-5 h-3.5"
                        alt="Ic view"
                        src="https://c.animaapp.com/mft5gmofxQLTNf/img/ic-view.svg"
                      />
                      <span className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-base text-center tracking-[0] leading-[20.8px]">
                        {article.visitCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        );
    }
  };

  return (
    <div
      className={`w-full ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link to={`/work/${article.id}`}>
        <Card className="bg-white rounded-[8px] border shadow-none hover:shadow-[1px_1px_10px_#c5c5c5] hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-all duration-200 cursor-pointer group flex flex-col min-h-[500px]">
          {renderCardContent()}
        </Card>
      </Link>

      {/* 图片预览模态框 */}
      <ImagePreviewModal
        isOpen={isImagePreviewOpen}
        imageUrl={previewImageUrl}
        alt={previewImageAlt}
        onClose={handleCloseImagePreview}
      />
    </div>
  );
};