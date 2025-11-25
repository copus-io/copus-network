// Color name to hexadecimal mapping (adjust according to actual backend return)
const colorNameToHex: Record<string, string> = {
  red: '#f23a00',     // Technology - red (consistent with project main color)
  green: '#2b8649',   // Art - green
  blue: '#2191fb',    // Sports - blue
  pink: '#ea7db7',    // Life - pink
  // Backup colors
  yellow: '#e19e1d',
  purple: '#8b5cf6',
  orange: '#f97316',
  gray: '#6b7280',
};

// Category color mapping
const categoryStyleMap: Record<string, { bg: string; text: string; border: string }> = {
  // English categories
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
  // Chinese categories
  "Technology": {
    bg: "bg-[linear-gradient(0deg,rgba(201,139,20,0.2)_0%,rgba(201,139,20,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    text: "text-yellow-600",
    border: "border-[#e19e1d]"
  },
  "Art": {
    bg: "bg-[linear-gradient(0deg,rgba(43,134,73,0.2)_0%,rgba(43,134,73,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    text: "text-green-600",
    border: "border-[#2b8649]"
  },
  "Sports": {
    bg: "bg-[linear-gradient(0deg,rgba(33,145,251,0.2)_0%,rgba(33,145,251,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    text: "text-blue-600",
    border: "border-[#2191fb]"
  },
  "Life": {
    bg: "bg-[linear-gradient(0deg,rgba(234,125,183,0.2)_0%,rgba(234,125,183,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    text: "text-pink-600",
    border: "border-[#ea7db7]"
  },
  // Default style
  default: {
    bg: "bg-[linear-gradient(0deg,rgba(156,163,175,0.2)_0%,rgba(156,163,175,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    text: "text-gray-600",
    border: "border-gray-400"
  }
};

// Get style based on category name and color
export const getCategoryStyle = (category: string, apiColor?: string) => {
  // If API returns color, return color value and let caller decide how to use it
  if (apiColor) {
    // Ensure color format is correct (add # if missing)
    const color = apiColor.startsWith('#') ? apiColor : `#${apiColor}`;
    return {
      color: color,
      // Still provide fallback static classes
      bg: categoryStyleMap[category]?.bg || categoryStyleMap.default.bg,
      text: categoryStyleMap[category]?.text || categoryStyleMap.default.text,
      border: categoryStyleMap[category]?.border || categoryStyleMap.default.border
    };
  }

  // Fallback to local mapping
  return categoryStyleMap[category] || categoryStyleMap.default;
};

// New: Get category inline style (for dynamic colors)
export const getCategoryInlineStyle = (apiColor?: string) => {
  if (!apiColor) return {};

  // Handle color: may be color name (like "green") or hex value (like "#2b8649")
  let color: string;
  if (apiColor.startsWith('#')) {
    // Already a hex color
    color = apiColor;
  } else if (colorNameToHex[apiColor.toLowerCase()]) {
    // Is a color name, convert to hex
    color = colorNameToHex[apiColor.toLowerCase()];
  } else {
    // Unknown color, try to treat as hex (add #)
    color = `#${apiColor}`;
  }

  // Convert hex color to RGBA with transparency
  const hexToRgba = (hex: string, alpha: number) => {
    try {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (error) {
      console.error('Invalid color format:', hex);
      return `rgba(107, 114, 128, ${alpha})`; // Default gray
    }
  };

  return {
    // Background gradient style
    background: `linear-gradient(0deg, ${hexToRgba(color, 0.2)}, ${hexToRgba(color, 0.2)}), #FFFFFF`,

    // Border style
    border: `1px solid ${color}`,
    borderRadius: '50px',

    // Text color
    color: color
  };
};

// Legacy compatibility, only pass category name
export const getCategoryStyleLegacy = (category: string) => {
  return categoryStyleMap[category] || categoryStyleMap.default;
};

// Format visit count
export const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return Math.floor(count / 1000000) + 'M';
  }
  if (count >= 1000) {
    return Math.floor(count / 1000) + 'K';
  }
  return count.toString();
};

// Format date
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