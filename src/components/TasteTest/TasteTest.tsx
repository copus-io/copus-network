import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Share2, RefreshCw, ArrowRight, ArrowLeft, FileText, Image, CheckCircle, Loader2, X } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../ui/toast';
import { publishArticle } from '../../services/articleService';
import { generateCoverImages, CoverImageOption } from '../../services/aiImageService';
import { HeaderSection } from '../shared/HeaderSection/HeaderSection';

interface Question {
  id: number;
  text: string;
  category: string;
  options: Array<{
    text: string;
    scores: {
      deepExplorer: number;
      quickExecutor: number;
      creativeCatalyst: number;
      logicArchitect: number;
      socialConnector: number;
      experimentalPioneer: number;
      cautiousAnalyst: number;
      intuitiveArtist: number;
    };
  }>;
}

interface AIPersonalityProfile {
  type: string;
  title: string;
  description: string;
  traits: string[];
  color: string;
  emoji: string;
  aiInteractionStyle: {
    preferredResponseLength: string;
    decisionMakingStyle: string;
    learningPreference: string;
    communicationStyle: string;
    problemSolvingApproach: string;
  };
  idealAIBehaviors: string[];
  workingStyle: string;
  creativityPattern: string;
}

interface AIPersonalityScores {
  deepExplorer: number;
  quickExecutor: number;
  creativeCatalyst: number;
  logicArchitect: number;
  socialConnector: number;
  experimentalPioneer: number;
  cautiousAnalyst: number;
  intuitiveArtist: number;
}

const questions: Question[] = [
  {
    id: 1,
    category: "信息处理",
    text: "当你向AI询问复杂问题时，你希望得到什么样的回答？",
    options: [
      {
        text: "简洁直接的核心要点，快速解决问题",
        scores: { deepExplorer: 0, quickExecutor: 3, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 1, experimentalPioneer: 1, cautiousAnalyst: 0, intuitiveArtist: 0 }
      },
      {
        text: "详细全面的分析，包含各种角度和可能性",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 0, experimentalPioneer: 1, cautiousAnalyst: 3, intuitiveArtist: 0 }
      },
      {
        text: "结构化的逻辑框架，条理清晰的层级关系",
        scores: { deepExplorer: 2, quickExecutor: 1, creativeCatalyst: 0, logicArchitect: 3, socialConnector: 0, experimentalPioneer: 0, cautiousAnalyst: 2, intuitiveArtist: 0 }
      },
      {
        text: "启发性的创意想法，激发新的思考方向",
        scores: { deepExplorer: 1, quickExecutor: 0, creativeCatalyst: 3, logicArchitect: 0, socialConnector: 1, experimentalPioneer: 2, cautiousAnalyst: 0, intuitiveArtist: 3 }
      }
    ]
  },
  {
    id: 2,
    category: "决策方式",
    text: "面对多个选择时，你通常如何做决定？",
    options: [
      {
        text: "快速直觉判断，相信第一感觉",
        scores: { deepExplorer: 0, quickExecutor: 3, creativeCatalyst: 2, logicArchitect: 0, socialConnector: 1, experimentalPioneer: 2, cautiousAnalyst: 0, intuitiveArtist: 3 }
      },
      {
        text: "收集大量信息，深入分析每个选项",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 0, logicArchitect: 2, socialConnector: 0, experimentalPioneer: 1, cautiousAnalyst: 3, intuitiveArtist: 0 }
      },
      {
        text: "建立决策框架，按照逻辑规则评估",
        scores: { deepExplorer: 2, quickExecutor: 1, creativeCatalyst: 0, logicArchitect: 3, socialConnector: 0, experimentalPioneer: 0, cautiousAnalyst: 2, intuitiveArtist: 0 }
      },
      {
        text: "征求他人意见，考虑社会影响",
        scores: { deepExplorer: 1, quickExecutor: 0, creativeCatalyst: 1, logicArchitect: 0, socialConnector: 3, experimentalPioneer: 0, cautiousAnalyst: 1, intuitiveArtist: 1 }
      }
    ]
  },
  {
    id: 3,
    category: "学习偏好",
    text: "学习新知识时，你更喜欢哪种方式？",
    options: [
      {
        text: "通过实际操作和实验来学习",
        scores: { deepExplorer: 1, quickExecutor: 2, creativeCatalyst: 2, logicArchitect: 1, socialConnector: 1, experimentalPioneer: 3, cautiousAnalyst: 0, intuitiveArtist: 2 }
      },
      {
        text: "系统性地阅读理论和文献",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 0, logicArchitect: 3, socialConnector: 0, experimentalPioneer: 1, cautiousAnalyst: 2, intuitiveArtist: 0 }
      },
      {
        text: "通过讨论和交流来理解",
        scores: { deepExplorer: 1, quickExecutor: 1, creativeCatalyst: 2, logicArchitect: 1, socialConnector: 3, experimentalPioneer: 1, cautiousAnalyst: 1, intuitiveArtist: 2 }
      },
      {
        text: "结合多种方式，灵活调整",
        scores: { deepExplorer: 2, quickExecutor: 2, creativeCatalyst: 3, logicArchitect: 2, socialConnector: 2, experimentalPioneer: 2, cautiousAnalyst: 1, intuitiveArtist: 1 }
      }
    ]
  },
  {
    id: 4,
    category: "问题解决",
    text: "遇到困难时，你的第一反应是？",
    options: [
      {
        text: "立即行动，边做边调整",
        scores: { deepExplorer: 0, quickExecutor: 3, creativeCatalyst: 2, logicArchitect: 0, socialConnector: 1, experimentalPioneer: 3, cautiousAnalyst: 0, intuitiveArtist: 2 }
      },
      {
        text: "深入研究，找出根本原因",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 0, experimentalPioneer: 1, cautiousAnalyst: 3, intuitiveArtist: 0 }
      },
      {
        text: "寻求帮助，听取多方意见",
        scores: { deepExplorer: 1, quickExecutor: 1, creativeCatalyst: 1, logicArchitect: 1, socialConnector: 3, experimentalPioneer: 0, cautiousAnalyst: 2, intuitiveArtist: 1 }
      },
      {
        text: "尝试创新方法，跳出常规思路",
        scores: { deepExplorer: 1, quickExecutor: 1, creativeCatalyst: 3, logicArchitect: 0, socialConnector: 1, experimentalPioneer: 3, cautiousAnalyst: 0, intuitiveArtist: 3 }
      }
    ]
  },
  {
    id: 5,
    category: "沟通风格",
    text: "与他人协作时，你更喜欢哪种沟通方式？",
    options: [
      {
        text: "详细的文档和清晰的时间线",
        scores: { deepExplorer: 2, quickExecutor: 1, creativeCatalyst: 0, logicArchitect: 3, socialConnector: 1, experimentalPioneer: 0, cautiousAnalyst: 3, intuitiveArtist: 0 }
      },
      {
        text: "面对面的即时讨论和反馈",
        scores: { deepExplorer: 1, quickExecutor: 2, creativeCatalyst: 2, logicArchitect: 1, socialConnector: 3, experimentalPioneer: 2, cautiousAnalyst: 0, intuitiveArtist: 2 }
      },
      {
        text: "简洁的要点总结和行动计划",
        scores: { deepExplorer: 0, quickExecutor: 3, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 1, experimentalPioneer: 1, cautiousAnalyst: 1, intuitiveArtist: 0 }
      },
      {
        text: "创意性的视觉展示和故事",
        scores: { deepExplorer: 0, quickExecutor: 0, creativeCatalyst: 3, logicArchitect: 0, socialConnector: 2, experimentalPioneer: 2, cautiousAnalyst: 0, intuitiveArtist: 3 }
      }
    ]
  },
  {
    id: 6,
    category: "创造表达",
    text: "进行创作时，你通常从哪里开始？",
    options: [
      {
        text: "明确的目标和详细规划",
        scores: { deepExplorer: 1, quickExecutor: 2, creativeCatalyst: 0, logicArchitect: 3, socialConnector: 1, experimentalPioneer: 0, cautiousAnalyst: 3, intuitiveArtist: 0 }
      },
      {
        text: "灵感突现的瞬间想法",
        scores: { deepExplorer: 0, quickExecutor: 1, creativeCatalyst: 3, logicArchitect: 0, socialConnector: 1, experimentalPioneer: 2, cautiousAnalyst: 0, intuitiveArtist: 3 }
      },
      {
        text: "随机尝试和实验",
        scores: { deepExplorer: 1, quickExecutor: 2, creativeCatalyst: 2, logicArchitect: 0, socialConnector: 0, experimentalPioneer: 3, cautiousAnalyst: 0, intuitiveArtist: 2 }
      },
      {
        text: "深度研究和资料收集",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 0, experimentalPioneer: 1, cautiousAnalyst: 2, intuitiveArtist: 1 }
      }
    ]
  },
  {
    id: 7,
    category: "审美偏好",
    text: "在艺术作品中，你最容易被什么吸引？",
    options: [
      {
        text: "色彩丰富、视觉冲击力强的作品",
        scores: { deepExplorer: 1, quickExecutor: 2, creativeCatalyst: 3, logicArchitect: 0, socialConnector: 2, experimentalPioneer: 3, cautiousAnalyst: 0, intuitiveArtist: 3 }
      },
      {
        text: "线条简洁、构图平衡的极简作品",
        scores: { deepExplorer: 2, quickExecutor: 2, creativeCatalyst: 1, logicArchitect: 3, socialConnector: 1, experimentalPioneer: 0, cautiousAnalyst: 3, intuitiveArtist: 1 }
      },
      {
        text: "富有历史感的经典传统作品",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 0, logicArchitect: 2, socialConnector: 1, experimentalPioneer: 0, cautiousAnalyst: 3, intuitiveArtist: 2 }
      },
      {
        text: "概念深刻、引人思考的当代作品",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 2, logicArchitect: 2, socialConnector: 0, experimentalPioneer: 1, cautiousAnalyst: 2, intuitiveArtist: 1 }
      }
    ]
  },
  {
    id: 8,
    category: "生活品味",
    text: "选择居住环境时，你最看重什么？",
    options: [
      {
        text: "现代简约，功能性强的设计",
        scores: { deepExplorer: 1, quickExecutor: 3, creativeCatalyst: 1, logicArchitect: 3, socialConnector: 1, experimentalPioneer: 1, cautiousAnalyst: 2, intuitiveArtist: 0 }
      },
      {
        text: "充满艺术品和个性装饰的空间",
        scores: { deepExplorer: 2, quickExecutor: 0, creativeCatalyst: 3, logicArchitect: 0, socialConnector: 2, experimentalPioneer: 2, cautiousAnalyst: 0, intuitiveArtist: 3 }
      },
      {
        text: "自然材质，温馨舒适的氛围",
        scores: { deepExplorer: 2, quickExecutor: 1, creativeCatalyst: 1, logicArchitect: 1, socialConnector: 2, experimentalPioneer: 1, cautiousAnalyst: 2, intuitiveArtist: 3 }
      },
      {
        text: "智能化程度高，科技感强的环境",
        scores: { deepExplorer: 1, quickExecutor: 2, creativeCatalyst: 2, logicArchitect: 3, socialConnector: 1, experimentalPioneer: 3, cautiousAnalyst: 1, intuitiveArtist: 0 }
      }
    ]
  },
  {
    id: 9,
    category: "消费习惯",
    text: "购物时，你通常如何做选择？",
    options: [
      {
        text: "深入研究产品评测和用户反馈",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 0, logicArchitect: 2, socialConnector: 1, experimentalPioneer: 0, cautiousAnalyst: 3, intuitiveArtist: 0 }
      },
      {
        text: "快速比较核心功能，选择性价比最高的",
        scores: { deepExplorer: 0, quickExecutor: 3, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 1, experimentalPioneer: 1, cautiousAnalyst: 1, intuitiveArtist: 0 }
      },
      {
        text: "选择设计独特、与众不同的产品",
        scores: { deepExplorer: 1, quickExecutor: 1, creativeCatalyst: 3, logicArchitect: 0, socialConnector: 1, experimentalPioneer: 3, cautiousAnalyst: 0, intuitiveArtist: 3 }
      },
      {
        text: "参考朋友推荐和社会评价",
        scores: { deepExplorer: 1, quickExecutor: 1, creativeCatalyst: 1, logicArchitect: 1, socialConnector: 3, experimentalPioneer: 0, cautiousAnalyst: 2, intuitiveArtist: 1 }
      }
    ]
  },
  {
    id: 10,
    category: "音乐品味",
    text: "你更倾向于听什么类型的音乐？",
    options: [
      {
        text: "古典音乐或传统民族音乐",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 0, experimentalPioneer: 0, cautiousAnalyst: 3, intuitiveArtist: 2 }
      },
      {
        text: "流行歌曲和热门排行榜",
        scores: { deepExplorer: 0, quickExecutor: 2, creativeCatalyst: 1, logicArchitect: 1, socialConnector: 3, experimentalPioneer: 1, cautiousAnalyst: 0, intuitiveArtist: 2 }
      },
      {
        text: "电子音乐或实验性音乐",
        scores: { deepExplorer: 1, quickExecutor: 1, creativeCatalyst: 3, logicArchitect: 2, socialConnector: 1, experimentalPioneer: 3, cautiousAnalyst: 0, intuitiveArtist: 2 }
      },
      {
        text: "各种风格都听，根据情绪选择",
        scores: { deepExplorer: 2, quickExecutor: 2, creativeCatalyst: 2, logicArchitect: 1, socialConnector: 2, experimentalPioneer: 2, cautiousAnalyst: 1, intuitiveArtist: 3 }
      }
    ]
  },
  {
    id: 11,
    category: "社交表达",
    text: "在社交场合，你通常如何表达自己？",
    options: [
      {
        text: "深度对话，分享见解和思考",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 2, experimentalPioneer: 0, cautiousAnalyst: 2, intuitiveArtist: 1 }
      },
      {
        text: "简洁表达，直接说出要点",
        scores: { deepExplorer: 0, quickExecutor: 3, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 1, experimentalPioneer: 1, cautiousAnalyst: 1, intuitiveArtist: 0 }
      },
      {
        text: "用故事和比喻表达创意想法",
        scores: { deepExplorer: 1, quickExecutor: 0, creativeCatalyst: 3, logicArchitect: 0, socialConnector: 2, experimentalPioneer: 2, cautiousAnalyst: 0, intuitiveArtist: 3 }
      },
      {
        text: "多倾听，适时提出关键问题",
        scores: { deepExplorer: 2, quickExecutor: 1, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 2, experimentalPioneer: 0, cautiousAnalyst: 3, intuitiveArtist: 1 }
      }
    ]
  },
  {
    id: 12,
    category: "风险偏好",
    text: "面对新机会时，你的态度是？",
    options: [
      {
        text: "谨慎评估所有风险和收益",
        scores: { deepExplorer: 2, quickExecutor: 0, creativeCatalyst: 0, logicArchitect: 3, socialConnector: 1, experimentalPioneer: 0, cautiousAnalyst: 3, intuitiveArtist: 0 }
      },
      {
        text: "快速判断，抓住时机行动",
        scores: { deepExplorer: 0, quickExecutor: 3, creativeCatalyst: 2, logicArchitect: 1, socialConnector: 1, experimentalPioneer: 2, cautiousAnalyst: 0, intuitiveArtist: 1 }
      },
      {
        text: "喜欢尝试新奇有趣的可能性",
        scores: { deepExplorer: 1, quickExecutor: 1, creativeCatalyst: 3, logicArchitect: 0, socialConnector: 1, experimentalPioneer: 3, cautiousAnalyst: 0, intuitiveArtist: 2 }
      },
      {
        text: "先观察别人的反应和结果",
        scores: { deepExplorer: 2, quickExecutor: 0, creativeCatalyst: 0, logicArchitect: 2, socialConnector: 2, experimentalPioneer: 0, cautiousAnalyst: 3, intuitiveArtist: 1 }
      }
    ]
  }
];

const aiPersonalityProfiles: { [key: string]: AIPersonalityProfile } = {
  deepExplorer: {
    type: "deepExplorer",
    title: "深度探索者",
    description: "你是一个寻求深度理解的思考者。与AI交互时，你需要全面、详细的信息来做出最佳决策。你擅长从复杂的信息中提炼精华，建立深层的知识联系。在审美方面，你偏爱有深度和内涵的作品，追求历史底蕴和文化价值。",
    traits: ["深度思考", "系统分析", "追求完整性", "注重细节", "喜欢经典传统"],
    color: "#2E8B57",
    emoji: "🔍",
    aiInteractionStyle: {
      preferredResponseLength: "详细完整，包含背景信息和多角度分析",
      decisionMakingStyle: "基于全面信息的深度分析",
      learningPreference: "系统性学习，建立知识网络",
      communicationStyle: "详细讨论，深入探讨",
      problemSolvingApproach: "全面研究，寻找根本原因"
    },
    idealAIBehaviors: [
      "提供详细的背景信息和上下文",
      "列出多种可能性和替代方案",
      "解释推理过程和逻辑链条",
      "引用可靠来源和证据支持",
      "提供深度分析而非表面回答"
    ],
    workingStyle: "喜欢深入研究，需要充足时间思考，重视质量过于速度",
    creativityPattern: "通过深度学习和知识整合产生创新想法"
  },
  quickExecutor: {
    type: "quickExecutor",
    title: "快速执行者",
    description: "你是一个注重效率和行动力的实干家。与AI交互时，你需要简洁直接的答案和可立即执行的建议。你擅长快速决策，喜欢将想法迅速转化为行动。在生活品味上，你偏向现代简约、功能性强的选择。",
    traits: ["高效执行", "目标导向", "行动力强", "决策迅速", "简约实用"],
    color: "#E74C3C",
    emoji: "⚡",
    aiInteractionStyle: {
      preferredResponseLength: "简洁明确，直接给出要点和行动建议",
      decisionMakingStyle: "快速判断，基于核心信息",
      learningPreference: "实践中学习，边做边调整",
      communicationStyle: "直接沟通，重点突出",
      problemSolvingApproach: "立即行动，快速迭代"
    },
    idealAIBehaviors: [
      "提供简洁明确的答案",
      "给出可立即执行的步骤",
      "突出最重要的信息",
      "避免冗长的解释",
      "提供快速解决方案"
    ],
    workingStyle: "快节奏工作，重视效率，喜欢看到立即的成果",
    creativityPattern: "在行动中激发灵感，通过快速试错寻找最佳方案"
  },
  creativeCatalyst: {
    type: "creativeCatalyst",
    title: "创意催化剂",
    description: "你是一个创新思维的激发者，擅长将不同的想法融合出新的可能性。与AI交互时，你需要启发性的回答和创新的思路，帮助你跳出常规思维框架。在艺术品味上，你被色彩丰富、视觉冲击力强的作品吸引，喜欢实验性和前卫的表达。",
    traits: ["创新思维", "跨界融合", "灵感丰富", "突破常规", "艺术敏感"],
    color: "#9B59B6",
    emoji: "🎨",
    aiInteractionStyle: {
      preferredResponseLength: "富有启发性，包含创新角度和联想",
      decisionMakingStyle: "创造性思考，寻找突破性方案",
      learningPreference: "通过探索和实验学习",
      communicationStyle: "启发性对话，激发创新思维",
      problemSolvingApproach: "跳出框架，寻找创新解决方案"
    },
    idealAIBehaviors: [
      "提供创新的思考角度",
      "建议意想不到的解决方案",
      "激发新的创意方向",
      "提供跨领域的灵感连接",
      "鼓励实验性的尝试"
    ],
    workingStyle: "需要灵感刺激的环境，喜欢在创造中找到乐趣",
    creativityPattern: "通过跨界思考和随机联想产生创新想法"
  },
  logicArchitect: {
    type: "logicArchitect",
    title: "逻辑架构师",
    description: "你是一个系统性思维的建构者，善于将复杂问题分解为清晰的逻辑结构。与AI交互时，你需要条理分明的框架和严谨的分析步骤。你偏爱极简设计和高科技环境，追求理性与秩序的美感。",
    traits: ["逻辑严密", "系统性强", "框架清晰", "理性分析", "科技感"],
    color: "#3498DB",
    emoji: "🏗️",
    aiInteractionStyle: {
      preferredResponseLength: "结构化完整，层次分明的逻辑框架",
      decisionMakingStyle: "基于逻辑推理的系统性决策",
      learningPreference: "建立知识体系，理论与实践结合",
      communicationStyle: "清晰的结构化表达",
      problemSolvingApproach: "分解问题，逐步解决"
    },
    idealAIBehaviors: [
      "提供清晰的逻辑框架",
      "按层次组织信息",
      "给出结构化的分析步骤",
      "建立因果关系链条",
      "提供可验证的推理过程"
    ],
    workingStyle: "系统化工作方法，注重规划和执行",
    creativityPattern: "通过逻辑重组和系统优化产生创新"
  },
  socialConnector: {
    type: "socialConnector",
    title: "社交连接者",
    description: "你是一个天生的社交家，擅长建立人际关系和促进团队合作。与AI交互时，你希望得到能够帮助你更好与他人沟通和协作的建议。你关注流行趋势，喜欢与朋友分享，是社交圈中的活跃分子。",
    traits: ["社交敏感", "沟通能力强", "团队合作", "趋势关注", "分享精神"],
    color: "#E67E22",
    emoji: "🤝",
    aiInteractionStyle: {
      preferredResponseLength: "适中长度，便于分享和讨论",
      decisionMakingStyle: "考虑他人意见，寻求共识",
      learningPreference: "通过交流互动学习",
      communicationStyle: "友好亲近，便于理解",
      problemSolvingApproach: "寻求合作，集思广益"
    },
    idealAIBehaviors: [
      "提供便于分享的信息",
      "考虑社会影响和人际关系",
      "给出有利于团队合作的建议",
      "提供沟通技巧和社交策略",
      "关注群体利益和和谐"
    ],
    workingStyle: "重视团队协作，善于整合资源",
    creativityPattern: "通过群体智慧和社交网络激发创意"
  },
  experimentalPioneer: {
    type: "experimentalPioneer",
    title: "实验先锋",
    description: "你是一个勇于探索的冒险家，热衷于尝试新事物和挑战未知领域。与AI交互时，你希望获得鼓励实验和创新的建议。你喜欢前沿的科技和实验性的艺术，总是第一个尝试新趋势。",
    traits: ["探索精神", "勇于尝试", "创新意识", "风险接受", "前沿敏感"],
    color: "#1ABC9C",
    emoji: "🚀",
    aiInteractionStyle: {
      preferredResponseLength: "鼓励性内容，包含实验建议",
      decisionMakingStyle: "勇于尝试，从失败中学习",
      learningPreference: "通过实验和探索学习",
      communicationStyle: "激励性，充满可能性",
      problemSolvingApproach: "创新实验，快速迭代"
    },
    idealAIBehaviors: [
      "鼓励创新实验",
      "提供前沿信息和趋势",
      "支持风险承担和尝试",
      "给出多元化的可能性",
      "激发探索精神"
    ],
    workingStyle: "敢于冒险，快速适应变化",
    creativityPattern: "通过实验和探索发现新机会"
  },
  cautiousAnalyst: {
    type: "cautiousAnalyst",
    title: "谨慎分析师",
    description: "你是一个细致入微的分析者，在做决定前会仔细评估所有风险和机会。与AI交互时，你需要全面的风险分析和稳妥的建议。你偏爱经典传统的选择，重视稳定性和可靠性。",
    traits: ["谨慎细致", "风险意识", "稳重可靠", "深度分析", "传统价值"],
    color: "#7F8C8D",
    emoji: "🔍",
    aiInteractionStyle: {
      preferredResponseLength: "详细分析，包含风险评估",
      decisionMakingStyle: "谨慎评估，避免风险",
      learningPreference: "深入研究，验证可靠性",
      communicationStyle: "客观理性，证据支撑",
      problemSolvingApproach: "全面分析，稳妥解决"
    },
    idealAIBehaviors: [
      "提供详细的风险分析",
      "给出稳妥的解决方案",
      "分析各种可能性和后果",
      "提供可靠的数据支撑",
      "考虑长远影响"
    ],
    workingStyle: "重视质量和稳定性，追求完美",
    creativityPattern: "通过深度研究和谨慎思考产生可靠方案"
  },
  intuitiveArtist: {
    type: "intuitiveArtist",
    title: "直觉艺术家",
    description: "你是一个富有艺术气质的感性思考者，能够敏锐地感知美和情感的微妙变化。与AI交互时，你希望得到富有感性色彩和美学价值的回应。你的选择往往基于直觉和情感，追求个性化的美学体验。",
    traits: ["艺术敏感", "情感丰富", "直觉敏锐", "个性表达", "美学追求"],
    color: "#E91E63",
    emoji: "🎭",
    aiInteractionStyle: {
      preferredResponseLength: "富有感性色彩，包含美学思考",
      decisionMakingStyle: "基于直觉和情感的选择",
      learningPreference: "通过感受和体验学习",
      communicationStyle: "感性表达，富有美感",
      problemSolvingApproach: "创造性直觉解决"
    },
    idealAIBehaviors: [
      "提供富有美感的表达",
      "关注情感和感受",
      "给出个性化的建议",
      "激发艺术灵感",
      "尊重直觉和感性判断"
    ],
    workingStyle: "注重感受和体验，追求美的表达",
    creativityPattern: "通过直觉感受和艺术灵感创造"
  }
};

export const TasteTest: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<AIPersonalityProfile | null>(null);
  const [generatedArticle, setGeneratedArticle] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [scores, setScores] = useState<AIPersonalityScores>({
    deepExplorer: 0,
    quickExecutor: 0,
    creativeCatalyst: 0,
    logicArchitect: 0,
    socialConnector: 0,
    experimentalPioneer: 0,
    cautiousAnalyst: 0,
    intuitiveArtist: 0
  });

  // 新增发布相关状态
  const [coverOptions, setCoverOptions] = useState<CoverImageOption[]>([]);
  const [selectedCover, setSelectedCover] = useState<CoverImageOption | null>(null);
  const [isGeneratingCovers, setIsGeneratingCovers] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishedArticleId, setPublishedArticleId] = useState<string | null>(null);

  // 用户登录状态
  const { user, isLoggedIn } = useUser();
  const { showToast } = useToast();


  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    const selectedOption = questions[currentQuestion].options[optionIndex];
    const newScores = { ...scores };
    Object.keys(selectedOption.scores).forEach(key => {
      newScores[key] += selectedOption.scores[key as keyof typeof selectedOption.scores];
    });
    setScores(newScores);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 计算结果
      const maxScore = Math.max(...Object.values(newScores));
      const resultType = Object.keys(newScores).find(key => newScores[key] === maxScore) || 'creativeCatalyst';
      setResult(aiPersonalityProfiles[resultType]);
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const newAnswers = answers.slice(0, -1);
      setAnswers(newAnswers);

      // 重新计算分数
      const newScores: AIPersonalityScores = {
        deepExplorer: 0,
        quickExecutor: 0,
        creativeCatalyst: 0,
        logicArchitect: 0,
        socialConnector: 0,
        experimentalPioneer: 0,
        cautiousAnalyst: 0,
        intuitiveArtist: 0
      };

      newAnswers.forEach((answerIndex, questionIndex) => {
        const selectedOption = questions[questionIndex].options[answerIndex];
        Object.keys(selectedOption.scores).forEach(key => {
          newScores[key] += selectedOption.scores[key as keyof typeof selectedOption.scores];
        });
      });

      setScores(newScores);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setIsCompleted(false);
    setResult(null);
    setScores({
      deepExplorer: 0,
      quickExecutor: 0,
      creativeCatalyst: 0,
      logicArchitect: 0,
      socialConnector: 0,
      experimentalPioneer: 0,
      cautiousAnalyst: 0,
      intuitiveArtist: 0
    });
  };

  const generateArticleContent = () => {
    if (!result) return '';

    const currentDate = new Date().toLocaleDateString('zh-CN');
    const questionDetails = answers.map((answerIndex, questionIndex) => {
      const question = questions[questionIndex];
      const selectedOption = question.options[answerIndex];
      return `**${question.text}**\n我的选择：${selectedOption.text}`;
    }).join('\n\n');

    const topScores = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, score]) => `${aiPersonalityProfiles[type]?.title}: ${score}分`)
      .join('、');

    // 生成有争议性的标题
    const controversialTitles = {
      deepExplorer: [
        "我测出来是深度探索者，难怪AI总觉得我问题太多...",
        "终于知道为什么我和ChatGPT聊天要3小时了！我是深度探索者",
        "深度探索者人格曝光：我可能是最难搞的AI用户"
      ],
      quickExecutor: [
        "测试结果震惊：我竟然是快速执行者，但为什么还这么拖延？",
        "快速执行者的我，为什么AI给的答案还是太啰嗦？",
        "原来我是快速执行者！难怪我最烦AI说废话"
      ],
      creativeCatalyst: [
        "我是创意催化剂？难怪我的脑洞连AI都跟不上",
        "测试结果：创意催化剂。AI，准备好接受我的奇思妙想了吗？",
        "创意催化剂人格确认：我终于找到和AI正确的相处方式了"
      ],
      logicArchitect: [
        "逻辑架构师？难怪我看不惯AI的混乱回答",
        "测试揭秘：我是逻辑架构师，AI你能跟上我的节奏吗？",
        "逻辑架构师的烦恼：为什么AI总是答非所问？"
      ],
      socialConnector: [
        "社交连接者？我竟然想和AI做朋友...",
        "测试结果出炉：社交连接者。我是不是对AI太友好了？",
        "社交连接者人格：我可能是最温柔的AI用户"
      ],
      experimentalPioneer: [
        "实验先锋？难怪我总是第一个尝试AI新功能",
        "测试确认：我是实验先锋，AI的新功能我都要试一遍",
        "实验先锋人格曝光：我可能是AI产品的最佳测试员"
      ],
      cautiousAnalyst: [
        "谨慎分析师？难怪我从不相信AI的第一个答案",
        "测试揭秘：谨慎分析师，我是AI世界的质疑专家",
        "谨慎分析师确认：我终于知道为什么AI答案都要验证三遍了"
      ],
      intuitiveArtist: [
        "直觉艺术家？难怪我和AI的对话总是很有诗意",
        "测试结果：直觉艺术家。AI，你懂我的浪漫吗？",
        "直觉艺术家人格：我可能是最感性的AI用户"
      ]
    };

    const randomTitle = controversialTitles[result.type as keyof typeof controversialTitles]?.[
      Math.floor(Math.random() * 3)
    ] || `${result.emoji} 我的AI个性测试结果：${result.title}`;

    const articleContent = `# ${randomTitle}

我的AI个性测试结果：**${result.title}**

## 📋 AI使用说明书（复制给AI使用）

\`\`\`
我是 ${result.title} 类型的用户，以下是我的特点：

【核心特质】
${result.traits.slice(0,3).map(trait => `• ${trait}`).join('\n')}

【沟通偏好】
• 回应长度：${result.aiInteractionStyle.preferredResponseLength}
• 沟通风格：${result.aiInteractionStyle.communicationStyle}
• 决策方式：${result.aiInteractionStyle.decisionMakingStyle}

【最佳配合方式】
${result.idealAIBehaviors.slice(0,4).map(behavior => `• ${behavior}`).join('\n')}

【得分最高的特质】
${topScores}

请根据我的这些特点来调整你的回应风格，这样我们的对话会更高效！
\`\`\`

## 🎯 测试结果详情

**我的类型：** ${result.title} ${result.emoji}

**个性描述：** ${result.description}

**工作风格：** ${result.workingStyle}

**创意模式：** ${result.creativityPattern}

**适合我的AI交互方式：**
- 💬 回应长度：${result.aiInteractionStyle.preferredResponseLength}
- 🧠 决策风格：${result.aiInteractionStyle.decisionMakingStyle}
- 📚 学习偏好：${result.aiInteractionStyle.learningPreference}
- 🔧 问题解决：${result.aiInteractionStyle.problemSolvingApproach}

## 📊 详细得分

${Object.entries(scores)
  .sort(([,a], [,b]) => b - a)
  .map(([type, score]) => `• ${aiPersonalityProfiles[type]?.title}: ${score}分`)
  .join('\n')}

---

💡 **使用建议：** 将上方的"AI使用说明书"复制给ChatGPT、Claude等AI，让它们更好地理解你的需求！

📅 测试时间：${currentDate}`;

    return articleContent;
  };

  const handleGenerateArticle = async () => {
    if (!result) {
      alert('错误：没有测试结果数据');
      return;
    }

    if (!isLoggedIn) {
      showToast('请先登录后再发布文章', 'warning');
      navigate('/login', { state: { from: { pathname: '/taste-test' } } });
      return;
    }

    try {
      // 生成文章内容
      const article = generateArticleContent();
      setGeneratedArticle(article);

      // 生成封面图选项
      setIsGeneratingCovers(true);
      const covers = await generateCoverImages(result.type);
      setCoverOptions(covers);
      setSelectedCover(covers[0]); // 默认选择第一个

      setShowPublishModal(true);
    } catch (error) {
      console.error('生成文章或封面图时出错:', error);
      alert('生成内容时出错，请重试');
    } finally {
      setIsGeneratingCovers(false);
    }
  };

  // 一键发布到Copus
  // Generate unique ID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handlePublishToCopus = async () => {
    console.log('🚀 开始发布文章到Copus...');
    console.log('用户登录状态:', isLoggedIn);
    console.log('用户信息:', user);
    console.log('generatedArticle存在:', !!generatedArticle);
    console.log('selectedCover存在:', !!selectedCover);
    console.log('result存在:', !!result);

    if (!generatedArticle || !selectedCover || !result) {
      alert('缺少必要信息，无法发布');
      return;
    }

    if (!isLoggedIn || !user) {
      showToast('请先登录后再发布', 'warning');
      navigate('/login', { state: { from: { pathname: '/taste-test' } } });
      return;
    }

    setIsPublishing(true);

    try {
      // 构建文章数据
      const title = generatePracticalTitle();
      const newUuid = generateUUID();
      const articleData = {
        title: title,
        content: generatedArticle,
        coverUrl: selectedCover.url,
        targetUrl: `${window.location.origin}/taste-test`, // 当前环境的味觉测试页面URL
        categoryId: 1, // 默认分类ID
        uuid: newUuid, // 生成新的UUID
        visibility: 0, // 公开文章
      };

      console.log('📝 发布数据:', {
        title: title,
        contentLength: generatedArticle.length,
        coverUrl: selectedCover.url,
        userId: user.id
      });

      // 发布文章
      console.log('📤 调用publishArticle API...');
      const response = await publishArticle(articleData);

      console.log('✅ 发布成功，响应:', response);

      if (response.uuid) {
        setPublishedArticleId(response.uuid);
        setPublishSuccess(true);
        console.log('✅ 设置文章ID成功:', response.uuid);
      } else {
        console.error('❌ 发布响应中缺少uuid字段:', response);
        showToast('发布成功但缺少文章ID，请联系管理员', 'warning');
        setPublishSuccess(true); // 仍然显示成功页面，但按钮会被禁用
      }

    } catch (error) {
      console.error('❌ 发布文章失败:', error);

      let errorMessage = '发布失败，请重试';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
      }

      console.log('错误详情:', {
        errorType: typeof error,
        errorMessage: errorMessage,
        errorObject: error
      });

      alert(`发布失败: ${errorMessage}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // 生成实用性AI协作指南标题的辅助函数
  const generatePracticalTitle = (): string => {
    if (!result) return 'AI个性测试结果';

    const practicalTitles = {
      deepExplorer: [
        "深度探索者AI使用指南：让AI详细解释每个步骤",
        "给AI的个性说明书：我是深度探索者，需要全面分析",
        "AI协作效率提升：深度探索者的专属交互方式"
      ],
      quickExecutor: [
        "快速执行者AI设置：请直接给结论，跳过冗长解释",
        "给AI的效率指南：我是快速执行者，要简洁有力的答案",
        "AI协作优化：快速执行者的高效交互模式"
      ],
      creativeCatalyst: [
        "创意催化剂AI协作手册：如何激发AI的创新思维",
        "给AI的创意指导：我是创意催化剂，一起头脑风暴吧",
        "AI创意合作指南：创意催化剂的个性化交互方式"
      ],
      logicArchitect: [
        "逻辑架构师AI使用手册：要求AI提供结构化回答",
        "给AI的逻辑指令：我是架构师，请用条理清晰的方式回复",
        "AI协作规范：逻辑架构师的系统化交互指南"
      ],
      socialConnector: [
        "社交连接者AI交流指南：建立友好的AI协作关系",
        "给AI的沟通提示：我是社交连接者，喜欢温和的互动",
        "AI人性化交流：社交连接者的个性化协作方式"
      ],
      experimentalPioneer: [
        "实验先锋AI探索指南：如何与AI尝试创新方案",
        "给AI的实验说明：我是先锋者，我们一起探索新可能",
        "AI创新协作：实验先锋的前沿交互模式"
      ],
      cautiousAnalyst: [
        "谨慎分析师AI使用规范：要求AI提供可验证的答案",
        "给AI的分析指导：我是谨慎分析师，需要数据支撑",
        "AI可靠协作：谨慎分析师的严谨交互方式"
      ],
      intuitiveArtist: [
        "直觉艺术家AI创作指南：让AI理解你的感性思维",
        "给AI的艺术指导：我是直觉艺术家，用感性方式交流",
        "AI美感协作：直觉艺术家的创意交互模式"
      ]
    };

    const titles = practicalTitles[result.type as keyof typeof practicalTitles];
    return titles?.[Math.floor(Math.random() * titles.length)] || `${result.emoji} 我的AI个性测试结果：${result.title}`;
  };


  const handleShare = () => {
    if (result) {
      const shareTexts = [
        `我是${result.emoji} ${result.title}！据说只有${Math.floor(Math.random() * 15) + 8}%的人是这种类型...你猜你是什么类型？`,
        `测试结果震惊：我竟然是${result.title}！难怪AI总是${result.traits[0]}... 快来测测你的AI个性吧！`,
        `${result.emoji} ${result.title}确认！我终于知道为什么我和AI的对话这么特别了...你也来试试？`,
        `AI个性测试结果出炉：${result.title}！我可能是${Math.floor(Math.random() * 15) + 8}%的稀有类型...你敢挑战吗？`
      ];

      const randomShareText = shareTexts[Math.floor(Math.random() * shareTexts.length)];
      const shareUrl = window.location.href;

      if (navigator.share) {
        navigator.share({
          title: `我是${result.title}，你呢？`,
          text: randomShareText,
          url: shareUrl,
        });
      } else {
        navigator.clipboard.writeText(`${randomShareText} ${shareUrl}`);
        alert('有趣的分享内容已复制到剪贴板！快去挑战你的朋友们吧 🎯');
      }
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (isCompleted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <HeaderSection />
        <div className="max-w-4xl mx-auto p-6 space-y-8 pt-12">

        {/* Copus品牌头部 - 升级版 */}
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-slate-900">

          <CardContent className="p-8 text-yellow-400 text-center">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-400 mb-4">
                <span className="text-4xl">🎉</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                测试完成！
              </h1>
              <p className="text-lg text-yellow-300 max-w-2xl mx-auto">
                恭喜！你已经发现了自己独特的AI交互风格，现在获得了专属的协作指南
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 结果卡片 - 升级版 */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16 opacity-10"
               style={{ backgroundColor: result.color }}>
          </div>

          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4"
                   style={{ backgroundColor: `${result.color}20` }}>
                <span className="text-6xl">{result.emoji}</span>
              </div>
              <div className="space-y-3">
                <CardTitle className="text-3xl md:text-4xl font-bold" style={{ color: result.color }}>
                  {result.title}
                </CardTitle>
                <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                  {result.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center mt-6">
                {result.traits.map((trait, index) => (
                  <Badge key={index}
                         className="px-4 py-2 text-base font-medium rounded-full border-2"
                         style={{
                           backgroundColor: `${result.color}15`,
                           color: result.color,
                           borderColor: `${result.color}40`
                         }}>
                    {trait}
                  </Badge>
                ))}
              </div>

            <div className="space-y-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg border">
                <h4 className="font-medium text-blue-800 mb-3">💡 AI交互建议</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  {result.idealAIBehaviors.map((behavior, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>{behavior}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border">
                <h4 className="font-medium text-purple-800 mb-3">⚡ 工作风格</h4>
                <p className="text-sm text-purple-700">{result.workingStyle}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border">
                <h4 className="font-medium text-green-800 mb-3">🎨 创意模式</h4>
                <p className="text-sm text-green-700">{result.creativityPattern}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                {Object.entries(scores).map(([type, score]) => (
                  <div key={type} className="flex justify-between">
                    <span className="capitalize">{aiPersonalityProfiles[type]?.title || type}:</span>
                    <span className="font-medium">{score}分</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 mt-8">
              {/* 主要行动按钮 */}
              <div className="flex justify-center">
                <Button
                  onClick={isLoggedIn ? handleGenerateArticle : () => {
                    showToast('请先登录后再发布文章', 'warning');
                    navigate('/login', { state: { from: { pathname: '/taste-test' } } });
                  }}
                  size="lg"
                  className={`relative px-8 py-4 text-white border-0 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                    isLoggedIn
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                  }`}
                  disabled={isLoggedIn && (!result || isGeneratingCovers)}
                >
                  {isGeneratingCovers ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  {isLoggedIn ? (
                    isGeneratingCovers ? '正在准备发布...' : '🚀 一键发布到Copus'
                  ) : (
                    '🔑 登录后发布文章'
                  )}
                </Button>
              </div>

              {/* 次要按钮 */}
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="px-6 py-3 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 rounded-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  分享结果
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRestart}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新测试
                </Button>
              </div>
            </div>
            </div>
          </CardContent>
        </Card>

        {/* 一键发布模态框 - 升级版 */}
        {showPublishModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden border">
              {/* 模态框头部 - 升级版 */}
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="absolute inset-0 opacity-15"
                     style={{
                       backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.2'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20s-20-8.954-20-20 8.954-20 20-20 20 8.954 20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                     }}></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      {publishSuccess ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <FileText className="w-6 h-6" />
                      )}
                      {publishSuccess ? '🎉 文章发布成功！' : '🚀 一键发布到Copus'}
                    </h2>
                    <p className="text-white/80 mt-1">
                      {publishSuccess
                        ? '你的AI个性测试结果已经发布到Copus，快去查看吧！'
                        : '选择封面图并确认发布你的AI个性测试结果'
                      }
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPublishModal(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-120px)]">
                {!publishSuccess ? (
                  <>
                    {/* 标题预览 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">📝 文章标题预览</h3>
                      <p className="text-blue-700">{generatePracticalTitle()}</p>
                    </div>

                    {/* 封面图选择 */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Image className="w-5 h-5" />
                        🎨 选择AI生成的封面图
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {coverOptions.map((cover, index) => (
                          <div
                            key={cover.id}
                            className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                              selectedCover?.id === cover.id
                                ? 'border-green-500 shadow-lg scale-105'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                            onClick={() => setSelectedCover(cover)}
                          >
                            <img
                              src={cover.url}
                              alt={cover.style}
                              className="w-full h-32 object-cover"
                            />
                            <div className="p-3 bg-white">
                              <p className="text-sm font-medium text-gray-800">{cover.style}</p>
                              <p className="text-xs text-gray-600 mt-1">{cover.description.slice(0, 60)}...</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 文章内容预览（可折叠） */}
                    <details className="bg-gray-50 border rounded-lg">
                      <summary className="p-4 cursor-pointer font-medium text-gray-700">
                        📄 预览文章内容（点击展开）
                      </summary>
                      <div className="p-4 pt-0 max-h-60 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-xs text-gray-600">
                          {generatedArticle?.slice(0, 500)}...
                        </pre>
                      </div>
                    </details>

                    {/* 发布按钮 */}
                    <div className="flex gap-4 justify-center pt-4 border-t">
                      <Button
                        onClick={handlePublishToCopus}
                        disabled={isPublishing || !selectedCover}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3"
                      >
                        {isPublishing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                        {isPublishing ? '正在发布...' : '确认发布到Copus'}
                      </Button>


                      <Button
                        variant="outline"
                        onClick={() => setShowPublishModal(false)}
                      >
                        取消
                      </Button>
                    </div>
                  </>
                ) : (
                  /* 发布成功页面 */
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">发布成功！</h3>
                      <p className="text-gray-600">你的AI个性测试结果文章已经成功发布到Copus</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800">
                        <strong>文章ID:</strong> {publishedArticleId}
                      </p>
                      <p className="text-green-700 mt-2">
                        文章将在几分钟内在发现页面显示，你也可以在"我的创作"中查看。
                      </p>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={() => {
                          if (!publishedArticleId) {
                            console.error('❌ publishedArticleId为空，无法导航');
                            showToast('文章ID无效，请重试', 'error');
                            return;
                          }
                          console.log('🔗 导航到文章:', publishedArticleId);
                          console.log('🔗 完整URL:', `/work/${publishedArticleId}`);
                          // 使用React Router导航，确保HeaderSection正常显示
                          navigate(`/work/${publishedArticleId}`);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={!publishedArticleId}
                      >
                        📖 查看发布的文章
                      </Button>

                      <Button
                        onClick={() => window.open('/', '_blank')}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        去发现页面
                      </Button>

                      <Button
                        onClick={() => setShowPublishModal(false)}
                        variant="outline"
                      >
                        关闭
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <HeaderSection />
      <div className="max-w-4xl mx-auto p-6 space-y-8 pt-12">

        {/* 测试介绍卡片 - 升级版 */}
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-slate-900">

          <CardContent className="p-8 text-yellow-400">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400 mb-2">
                  <span className="text-3xl">🧠</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Copus AI个性测试
                </h1>
                <p className="text-lg text-yellow-300 max-w-2xl mx-auto leading-relaxed">
                  发现你与AI交互的独特风格，获得专属的AI协作指南，让每次对话都更高效
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-yellow-400 text-slate-900">
                  <span className="text-2xl">🎯</span>
                  <span className="font-bold">12道精选问题</span>
                  <span className="text-sm font-medium">科学分析你的AI使用习惯</span>
                </div>
                <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-yellow-400 text-slate-900">
                  <span className="text-2xl">⚡</span>
                  <span className="font-bold">3分钟完成</span>
                  <span className="text-sm font-medium">快速了解你的交互风格</span>
                </div>
                <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-yellow-400 text-slate-900">
                  <span className="text-2xl">🚀</span>
                  <span className="font-bold">一键发布结果</span>
                  <span className="text-sm font-medium">生成专属AI协作指南</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 问题卡片 - 升级版 */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{currentQuestion + 1}</span>
                </div>
                <CardTitle className="text-xl text-gray-800">第 {currentQuestion + 1} 题</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                {currentQuestion + 1} / {questions.length}
              </Badge>
            </div>
            <Progress
              value={progress}
              className="w-full h-2 bg-gray-200"
              style={{"--progress-foreground": "linear-gradient(to right, #3b82f6, #8b5cf6)"} as any}
            />
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold leading-relaxed text-gray-800 text-center">
                {questions[currentQuestion].text}
              </h3>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start h-auto py-5 px-6 border-2 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                    onClick={() => handleAnswer(index)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-blue-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600">
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      <span className="text-base leading-relaxed">{option.text}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              上一题
            </Button>

            <div className="text-sm text-gray-500">
              还有 {questions.length - currentQuestion - 1} 题
            </div>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};