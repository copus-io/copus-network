// 分类颜色映射
const categoryStyleMap: Record<string, { bg: string; text: string; border: string }> = {
  // 英文分类
  Art: {
    bg: "bg-[linear-gradient(0deg,rgba(43,134,73,0.2)_0%,rgba(43,134,73,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    text: "text-green-600",
    border: "border-[#2b8649]"
  },
  Sports: {
    bg: "bg-[linear-gradient(0deg,rgba(33,145,251,0.2)_0%,rgba(33,145,251,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    text: "text-blue-600",
    border: "border-[#2191fb]"
  },
  Technology: {
    bg: "bg-[linear-gradient(0deg,rgba(201,139,20,0.2)_0%,rgba(201,139,20,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    text: "text-yellow-600",
    border: "border-[#e19e1d]"
  },
  Life: {
    bg: "bg-[linear-gradient(0deg,rgba(234,125,183,0.2)_0%,rgba(234,125,183,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    text: "text-pink-600",
    border: "border-[#ea7db7]"
  },
  // 中文分类
  "科技": {
    bg: "bg-[linear-gradient(0deg,rgba(201,139,20,0.2)_0%,rgba(201,139,20,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    text: "text-yellow-600",
    border: "border-[#e19e1d]"
  },
  "艺术": {
    bg: "bg-[linear-gradient(0deg,rgba(43,134,73,0.2)_0%,rgba(43,134,73,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    text: "text-green-600",
    border: "border-[#2b8649]"
  },
  "体育": {
    bg: "bg-[linear-gradient(0deg,rgba(33,145,251,0.2)_0%,rgba(33,145,251,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    text: "text-blue-600",
    border: "border-[#2191fb]"
  },
  "生活": {
    bg: "bg-[linear-gradient(0deg,rgba(234,125,183,0.2)_0%,rgba(234,125,183,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    text: "text-pink-600",
    border: "border-[#ea7db7]"
  },
  // 默认样式
  default: {
    bg: "bg-[linear-gradient(0deg,rgba(156,163,175,0.2)_0%,rgba(156,163,175,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    text: "text-gray-600",
    border: "border-gray-400"
  }
};

export const getCategoryStyle = (category: string) => {
  return categoryStyleMap[category] || categoryStyleMap.default;
};

// 格式化访问数量
export const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return Math.floor(count / 1000000) + 'M';
  }
  if (count >= 1000) {
    return Math.floor(count / 1000) + 'K';
  }
  return count.toString();
};

// 格式化日期
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};