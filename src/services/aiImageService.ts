import { apiRequest } from './api';

export interface CoverImageOption {
  id: string;
  url: string;
  style: string;
  description: string;
}

// AI个性类型对应的封面图配置
const PERSONALITY_COVER_CONFIGS = {
  deepExplorer: {
    prompts: [
      "Deep ocean exploration with mysterious glowing symbols, ancient knowledge floating in dark waters, ethereal blue and teal tones",
      "Ancient library with floating books and glowing wisdom scrolls, deep thinking atmosphere, warm golden lights",
      "Cosmic observatory with telescopes and star maps, person silhouette contemplating universe, dark purple and blue gradient"
    ],
    styles: ["Deep Exploration", "Ocean of Knowledge", "Cosmic Thinking"]
  },
  quickExecutor: {
    prompts: [
      "Lightning bolt striking through modern cityscape, fast motion blur effects, electric blue and white energy",
      "Rocket launching with dynamic speed lines, explosive orange and red colors, action-packed composition",
      "Running figure with motion trails, urban background, energetic yellow and red color scheme"
    ],
    styles: ["Lightning Speed", "Rocket Power", "Swift Action"]
  },
  creativeCatalyst: {
    prompts: [
      "Colorful paint explosion with artistic brushstrokes, rainbow palette, creative chaos and harmony",
      "Artist's studio with floating art supplies and magical creative energy, vibrant multicolored atmosphere",
      "Abstract geometric shapes morphing into creative ideas, neon colors and dynamic composition"
    ],
    styles: ["Artistic Burst", "Creative Workshop", "Imagination"]
  },
  logicArchitect: {
    prompts: [
      "Geometric blueprint patterns with mathematical equations, clean blue and white design, architectural precision",
      "3D wireframe city construction, logical grid systems, minimalist blue and gray color palette",
      "Circuit board patterns forming architectural structures, tech-inspired green and blue gradient"
    ],
    styles: ["Logic Blueprint", "Architecture Design", "System Building"]
  },
  socialConnector: {
    prompts: [
      "Network of glowing connections between diverse people silhouettes, warm orange and yellow tones",
      "Community gathering with hearts and communication bubbles, friendly pink and orange atmosphere",
      "Bridge connecting different islands with people, collaborative spirit, sunset warm colors"
    ],
    styles: ["Social Network", "Connection Bridge", "Warm Link"]
  },
  experimentalPioneer: {
    prompts: [
      "Spacecraft launching into unknown galaxy, experimental tech designs, cyan and purple space colors",
      "Laboratory with futuristic experiments and glowing innovations, sci-fi green and blue lighting",
      "Explorer with cutting-edge gear in alien landscape, adventurous teal and orange sunset"
    ],
    styles: ["Space Exploration", "Laboratory", "Frontier Adventure"]
  },
  cautiousAnalyst: {
    prompts: [
      "Magnifying glass examining detailed data charts, professional gray and blue color scheme, analytical precision",
      "Traditional desk with careful document analysis, warm brown and gold classical atmosphere",
      "Shield protecting valuable information, security-focused dark blue and silver design"
    ],
    styles: ["Detailed Analysis", "Professional Review", "Security Shield"]
  },
  intuitiveArtist: {
    prompts: [
      "Watercolor emotions flowing into beautiful abstract forms, soft pink and purple dreamy palette",
      "Artistic figure painting with flowing creative energy, romantic purple and gold atmosphere",
      "Musical notes transforming into visual art, synesthetic pink and blue magical composition"
    ],
    styles: ["Emotional Flow", "Artistic Creation", "Intuitive Magic"]
  }
};

// 生成SVG封面图的函数
const generateSVGCover = (
  gradientColors: [string, string],
  icon: string,
  title: string,
  emoji: string
) => {
  const svg = `
    <svg width="1200" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradientColors[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradientColors[1]};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="400" fill="url(#grad)"/>
      <text x="600" y="160" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="80" font-weight="bold">${emoji}</text>
      <text x="600" y="240" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="36" font-weight="600">${title}</text>
      <text x="600" y="280" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="18">${icon}</text>
      <text x="600" y="340" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="Arial, sans-serif" font-size="16">AI人格测试结果</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

// 预设的人格类型封面图设计配置
const PERSONALITY_COVER_DESIGNS = {
  deepExplorer: {
    colors: [['#1e3a8a', '#3730a3'], ['#0f172a', '#1e40af'], ['#312e81', '#1e3a8a']] as [string, string][],
    titles: ['深度探索者', '知识探索者', '智慧追寻者'],
    icons: ['🔍 深度思考 · 系统分析', '📚 知识海洋 · 深度学习', '🧠 智慧探索 · 理性分析']
  },
  quickExecutor: {
    colors: [['#dc2626', '#ea580c'], ['#f59e0b', '#d97706'], ['#ef4444', '#dc2626']] as [string, string][],
    titles: ['快速执行者', '闪电行动者', '高效执行者'],
    icons: ['⚡ 快速执行 · 立即行动', '🚀 闪电速度 · 高效完成', '🔥 激情执行 · 结果导向']
  },
  creativeCatalyst: {
    colors: [['#7c3aed', '#a855f7'], ['#ec4899', '#f472b6'], ['#06b6d4', '#0891b2']] as [string, string][],
    titles: ['创意催化剂', '创新引擎', '灵感火花'],
    icons: ['🎨 创意爆发 · 无限想象', '💡 灵感迸发 · 创新思维', '🌈 色彩创意 · 艺术表达']
  },
  logicArchitect: {
    colors: [['#374151', '#6b7280'], ['#1f2937', '#374151'], ['#4b5563', '#6b7280']] as [string, string][],
    titles: ['逻辑架构师', '理性建造者', '系统设计师'],
    icons: ['🏗️ 逻辑构建 · 系统思维', '⚙️ 精确设计 · 理性分析', '📐 架构思考 · 结构化']
  },
  socialConnector: {
    colors: [['#f59e0b', '#f97316'], ['#fb923c', '#f97316'], ['#fdba74', '#fb923c']] as [string, string][],
    titles: ['社交连接者', '人际桥梁', '沟通大师'],
    icons: ['🤝 社交连接 · 人际和谐', '💖 温暖沟通 · 友善交流', '🌟 魅力社交 · 团队协作']
  },
  experimentalPioneer: {
    colors: [['#059669', '#10b981'], ['#0d9488', '#14b8a6'], ['#047857', '#059669']] as [string, string][],
    titles: ['实验先锋', '探索先驱', '创新先锋'],
    icons: ['🧪 实验探索 · 勇于尝试', '🚀 先锋精神 · 开拓创新', '🔬 科学探索 · 前沿思维']
  },
  cautiousAnalyst: {
    colors: [['#64748b', '#94a3b8'], ['#475569', '#64748b'], ['#334155', '#475569']] as [string, string][],
    titles: ['谨慎分析师', '理性审查者', '细致观察者'],
    icons: ['🔍 谨慎分析 · 深度思考', '📊 数据分析 · 理性判断', '🛡️ 风险评估 · 稳健决策']
  },
  intuitiveArtist: {
    colors: [['#be185d', '#db2777'], ['#c026d3', '#d946ef'], ['#9333ea', '#a855f7']] as [string, string][],
    titles: ['直觉艺术家', '感性创作者', '情感表达者'],
    icons: ['🎭 直觉创作 · 情感表达', '🌸 美感体验 · 艺术灵感', '💜 感性思维 · 美学追求']
  }
};

// 预设的稳定封面图URL（使用短链接，符合数据库500字符限制）
const DEMO_COVER_IMAGES = {
  deepExplorer: [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop"
  ],
  quickExecutor: [
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop"
  ],
  creativeCatalyst: [
    "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop"
  ],
  logicArchitect: [
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop"
  ],
  socialConnector: [
    "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1573164713619-24c711fe7878?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1543269664-647b8a0de1ea?w=400&h=200&fit=crop"
  ],
  experimentalPioneer: [
    "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop"
  ],
  cautiousAnalyst: [
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop"
  ],
  intuitiveArtist: [
    "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop"
  ]
};

/**
 * 为指定的AI个性类型生成封面图选项
 * @param personalityType AI个性类型
 * @returns 3个封面图选项
 */
export const generateCoverImages = async (personalityType: string): Promise<CoverImageOption[]> => {
  try {
    const config = PERSONALITY_COVER_CONFIGS[personalityType as keyof typeof PERSONALITY_COVER_CONFIGS];
    const demoImages = DEMO_COVER_IMAGES[personalityType as keyof typeof DEMO_COVER_IMAGES];

    if (!config || !demoImages) {
      throw new Error(`Unsupported personality type: ${personalityType}`);
    }

    // 创建3个封面图选项
    const coverOptions: CoverImageOption[] = config.prompts.map((prompt, index) => ({
      id: `${personalityType}_cover_${index + 1}`,
      url: demoImages[index] || demoImages[0], // 使用对应的演示图片
      style: config.styles[index],
      description: prompt
    }));

    return coverOptions;

  } catch (error) {
    console.error('Failed to generate cover images:', error);

    // 返回默认的封面图选项
    return [
      {
        id: 'default_cover_1',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=400&fit=crop&crop=center',
        style: '经典设计',
        description: 'Classic professional design'
      },
      {
        id: 'default_cover_2',
        url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=400&fit=crop&crop=center',
        style: '创意风格',
        description: 'Creative artistic style'
      },
      {
        id: 'default_cover_3',
        url: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1200&h=400&fit=crop&crop=center',
        style: '未来科技',
        description: 'Futuristic technology style'
      }
    ];
  }
};

/**
 * 调用真实的AI图片生成API（可选实现）
 * 当有预算和API key时可以启用
 */
export const generateRealAICover = async (prompt: string, style: string): Promise<string> => {
  try {
    // 示例：调用Replicate Stable Diffusion API
    // const response = await apiRequest('/api/generate-image', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     prompt: `${prompt}, ${style} style, high quality, 1200x400 aspect ratio`,
    //     width: 1200,
    //     height: 400
    //   })
    // });

    // 目前返回占位符URL
    return `https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=400&fit=crop&crop=center`;

  } catch (error) {
    console.error('AI image generation failed:', error);
    throw error;
  }
};

export default {
  generateCoverImages,
  generateRealAICover
};