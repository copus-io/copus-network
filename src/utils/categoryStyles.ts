// 颜色名称到十六进制的映射（根据实际后端返回调整）
const colorNameToHex: Record<string, string> = {
  red: '#f23a00',     // 科技 - 红色（与项目主色调一致）
  green: '#2b8649',   // 艺术 - 绿色
  blue: '#2191fb',    // 体育 - 蓝色
  pink: '#ea7db7',    // 生活 - 粉色
  // 备用颜色
  yellow: '#e19e1d',
  purple: '#8b5cf6',
  orange: '#f97316',
  gray: '#6b7280',
};

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

// 根据分类名称和颜色获取样式
export const getCategoryStyle = (category: string, apiColor?: string) => {
  // 如果有API返回的颜色，返回颜色值，让调用方决定如何使用
  if (apiColor) {
    // 确保颜色格式正确（添加 # 如果没有）
    const color = apiColor.startsWith('#') ? apiColor : `#${apiColor}`;
    return {
      color: color,
      // 仍然提供备用的静态类
      bg: categoryStyleMap[category]?.bg || categoryStyleMap.default.bg,
      text: categoryStyleMap[category]?.text || categoryStyleMap.default.text,
      border: categoryStyleMap[category]?.border || categoryStyleMap.default.border
    };
  }

  // 降级到本地映射
  return categoryStyleMap[category] || categoryStyleMap.default;
};

// 新增：获取分类内联样式（用于动态颜色）
export const getCategoryInlineStyle = (apiColor?: string) => {
  if (!apiColor) return {};

  // 处理颜色：可能是颜色名称（如 "green"）或十六进制值（如 "#2b8649"）
  let color: string;
  if (apiColor.startsWith('#')) {
    // 已经是十六进制颜色
    color = apiColor;
  } else if (colorNameToHex[apiColor.toLowerCase()]) {
    // 是颜色名称，转换为十六进制
    color = colorNameToHex[apiColor.toLowerCase()];
  } else {
    // 未知颜色，尝试作为十六进制处理（添加#）
    color = `#${apiColor}`;
  }

  // 将十六进制颜色转换为带透明度的RGBA
  const hexToRgba = (hex: string, alpha: number) => {
    try {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (error) {
      console.error('Invalid color format:', hex);
      return `rgba(107, 114, 128, ${alpha})`; // 默认灰色
    }
  };

  return {
    // 背景渐变样式
    background: `linear-gradient(0deg, ${hexToRgba(color, 0.2)}, ${hexToRgba(color, 0.2)}), #FFFFFF`,

    // 边框样式
    border: `1px solid ${color}`,
    borderRadius: '50px',

    // 文字颜色
    color: color
  };
};

// 兼容旧版本，只传分类名称
export const getCategoryStyleLegacy = (category: string) => {
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

  // Calculate different time units
  const diffSeconds = Math.floor(diffTime / 1000);
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Just now (less than 10 seconds)
  if (diffSeconds < 10) return 'just now';

  // Seconds ago
  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;

  // Minutes ago
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  }

  // Hours ago
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }

  // Days ago
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;

  // Months ago
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  // More than a year - show full date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};