// Copus Design System - 统一设计规范

export const colors = {
  // 主色调
  primary: '#1a73e8',
  primaryHover: '#1557b0',
  primaryLight: '#e8f0fe',

  // 文字颜色
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textPlaceholder: '#CCCCCC',

  // 背景颜色
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary: '#EEEEEE',
  backgroundGray: '#F0F0F0',

  // 边框颜色
  border: '#E5E5E5',
  borderLight: '#F0F0F0',
  borderFocus: '#1a73e8',

  // 状态颜色
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // 特殊颜色
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
  '4xl': '2.5rem',  // 40px
  '5xl': '3rem',    // 48px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px - 标签
  md: '0.375rem',   // 6px - 按钮
  lg: '0.5rem',     // 8px
  xl: '0.625rem',   // 10px - 卡片
  '2xl': '1rem',    // 16px
  full: '9999px',   // 圆形
} as const;

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  hover: '0 4px 12px rgba(0, 0, 0, 0.15)', // 悬停状态
  focus: '0 0 0 3px rgba(26, 115, 232, 0.1)', // 焦点状态
} as const;

export const typography = {
  fontFamily: {
    sans: ['Lato', 'Helvetica', 'Arial', 'sans-serif'],
    mono: ['Fira Code', 'Monaco', 'Cascadia Code', 'Segoe UI Mono', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
  },
} as const;

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',
} as const;

// 预定义的组件样式类
export const componentStyles = {
  // 卡片样式
  card: {
    base: `bg-white rounded-xl border border-[${colors.border}] transition-all duration-200`,
    hover: `hover:shadow-[${shadows.hover}]`,
    interactive: `cursor-pointer hover:shadow-[${shadows.hover}] transition-all duration-200`,
  },

  // 按钮样式
  button: {
    base: `rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2`,
    primary: `bg-[${colors.primary}] text-white hover:bg-[${colors.primaryHover}] focus:ring-[${colors.primary}]`,
    secondary: `bg-[${colors.backgroundSecondary}] text-[${colors.textSecondary}] hover:bg-[${colors.backgroundTertiary}]`,
    ghost: `bg-transparent text-[${colors.textSecondary}] hover:bg-[${colors.backgroundSecondary}]`,
  },

  // 输入框样式
  input: {
    base: `w-full rounded-md border border-[${colors.border}] px-3 py-2 text-[${colors.textPrimary}] placeholder-[${colors.textPlaceholder}] focus:border-[${colors.borderFocus}] focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]`,
  },

  // 标签样式
  tag: {
    base: `inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium`,
    default: `bg-[${colors.backgroundSecondary}] text-[${colors.textSecondary}]`,
    active: `bg-[${colors.primaryLight}] text-[${colors.primary}]`,
    interactive: `cursor-pointer hover:bg-[${colors.backgroundTertiary}] hover:text-[${colors.primary}] transition-colors`,
  },

  // 头像样式
  avatar: {
    sm: 'w-8 h-8 rounded-full object-cover',
    md: 'w-12 h-12 rounded-full object-cover',
    lg: 'w-16 h-16 rounded-full object-cover',
    xl: 'w-20 h-20 rounded-full object-cover',
    interactive: 'cursor-pointer hover:opacity-80 transition-opacity',
  },

  // 文本样式
  text: {
    heading1: `text-[${colors.textPrimary}] text-3xl font-bold`,
    heading2: `text-[${colors.textPrimary}] text-2xl font-bold`,
    heading3: `text-[${colors.textPrimary}] text-xl font-bold`,
    heading4: `text-[${colors.textPrimary}] text-lg font-semibold`,
    body: `text-[${colors.textSecondary}] text-base`,
    bodyLarge: `text-[${colors.textSecondary}] text-lg`,
    caption: `text-[${colors.textTertiary}] text-sm`,
    label: `text-[${colors.textPrimary}] text-sm font-medium`,
  },
} as const;

// 布局相关
export const layout = {
  container: {
    padding: 'px-4 sm:px-6 lg:px-8',
    maxWidth: 'max-w-7xl mx-auto',
  },
  grid: {
    cols1: 'grid-cols-1',
    cols2: 'grid-cols-1 md:grid-cols-2',
    cols3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    gap: 'gap-5',
  },
  sidebar: {
    width: 'w-[300px]',
    marginLeft: 'lg:ml-[360px]',
    marginRight: 'lg:mr-[40px]',
    padding: 'pt-[70px] lg:pt-[120px] pb-[100px]',
  },
} as const;

// 响应式断点
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// 动画和过渡
export const animations = {
  fadeIn: 'animate-fadeIn',
  slideUp: 'animate-slideUp',
  slideDown: 'animate-slideDown',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
} as const;

// 实用工具类
export const utils = {
  truncate: 'truncate',
  lineClamp2: 'line-clamp-2',
  lineClamp3: 'line-clamp-3',
  srOnly: 'sr-only',
  visuallyHidden: 'absolute w-px h-px p-0 -m-px overflow-hidden clip-[rect(0,0,0,0)] whitespace-nowrap border-0',
} as const;

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  transitions,
  componentStyles,
  layout,
  breakpoints,
  animations,
  utils,
};