import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Share2, RefreshCw, ArrowRight, ArrowLeft, FileText, Copy } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: Array<{
    text: string;
    scores: {
      explorer: number;
      aesthetic: number;
      intellectual: number;
      social: number;
      minimalist: number;
      eclectic: number;
      trendsetter: number;
      classic: number;
    };
  }>;
}

interface TasteProfile {
  type: string;
  title: string;
  description: string;
  traits: string[];
  color: string;
  emoji: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: "当你进入一个新的艺术展览时，你最先被什么吸引？",
    options: [
      {
        text: "色彩鲜艳、风格独特的当代作品",
        scores: { explorer: 3, aesthetic: 2, intellectual: 1, social: 1, minimalist: 0, eclectic: 3, trendsetter: 2, classic: 0 }
      },
      {
        text: "技法精湛的古典绘画",
        scores: { explorer: 0, aesthetic: 3, intellectual: 2, social: 1, minimalist: 1, eclectic: 0, trendsetter: 0, classic: 3 }
      },
      {
        text: "简洁有力的极简主义作品",
        scores: { explorer: 1, aesthetic: 2, intellectual: 2, social: 0, minimalist: 3, eclectic: 0, trendsetter: 1, classic: 1 }
      },
      {
        text: "能引发思考的概念艺术",
        scores: { explorer: 2, aesthetic: 1, intellectual: 3, social: 1, minimalist: 1, eclectic: 1, trendsetter: 1, classic: 0 }
      }
    ]
  },
  {
    id: 2,
    text: "你理想的居住环境是？",
    options: [
      {
        text: "现代简约的公寓，一切都井然有序",
        scores: { explorer: 0, aesthetic: 1, intellectual: 1, social: 1, minimalist: 3, eclectic: 0, trendsetter: 2, classic: 1 }
      },
      {
        text: "充满古董和艺术品的复古住宅",
        scores: { explorer: 1, aesthetic: 3, intellectual: 2, social: 1, minimalist: 0, eclectic: 2, trendsetter: 0, classic: 3 }
      },
      {
        text: "各种风格混搭的个性空间",
        scores: { explorer: 2, aesthetic: 2, intellectual: 1, social: 2, minimalist: 0, eclectic: 3, trendsetter: 1, classic: 0 }
      },
      {
        text: "开放式的创意工作室",
        scores: { explorer: 3, aesthetic: 1, intellectual: 2, social: 2, minimalist: 1, eclectic: 1, trendsetter: 2, classic: 0 }
      }
    ]
  },
  {
    id: 3,
    text: "选择音乐时，你更倾向于？",
    options: [
      {
        text: "最新流行的热门单曲",
        scores: { explorer: 1, aesthetic: 0, intellectual: 0, social: 3, minimalist: 0, eclectic: 1, trendsetter: 3, classic: 0 }
      },
      {
        text: "经典的古典音乐或老歌",
        scores: { explorer: 0, aesthetic: 2, intellectual: 2, social: 1, minimalist: 1, eclectic: 0, trendsetter: 0, classic: 3 }
      },
      {
        text: "小众但高质量的独立音乐",
        scores: { explorer: 3, aesthetic: 2, intellectual: 2, social: 0, minimalist: 1, eclectic: 2, trendsetter: 1, classic: 1 }
      },
      {
        text: "各种风格都听，看心情",
        scores: { explorer: 2, aesthetic: 1, intellectual: 1, social: 2, minimalist: 0, eclectic: 3, trendsetter: 1, classic: 1 }
      }
    ]
  },
  {
    id: 4,
    text: "在社交媒体上，你最喜欢分享什么内容？",
    options: [
      {
        text: "精心拍摄的美食和生活照片",
        scores: { explorer: 1, aesthetic: 3, intellectual: 0, social: 2, minimalist: 1, eclectic: 1, trendsetter: 2, classic: 1 }
      },
      {
        text: "有深度的文章和思考",
        scores: { explorer: 1, aesthetic: 1, intellectual: 3, social: 1, minimalist: 2, eclectic: 1, trendsetter: 0, classic: 2 }
      },
      {
        text: "最新的趋势和热点话题",
        scores: { explorer: 2, aesthetic: 0, intellectual: 1, social: 3, minimalist: 0, eclectic: 1, trendsetter: 3, classic: 0 }
      },
      {
        text: "很少分享，更喜欢观察别人",
        scores: { explorer: 1, aesthetic: 1, intellectual: 2, social: 0, minimalist: 3, eclectic: 0, trendsetter: 0, classic: 2 }
      }
    ]
  },
  {
    id: 5,
    text: "购买衣服时，你最看重什么？",
    options: [
      {
        text: "设计师品牌和独特设计",
        scores: { explorer: 2, aesthetic: 3, intellectual: 1, social: 2, minimalist: 0, eclectic: 2, trendsetter: 2, classic: 0 }
      },
      {
        text: "质量和耐穿程度",
        scores: { explorer: 0, aesthetic: 1, intellectual: 2, social: 1, minimalist: 2, eclectic: 0, trendsetter: 0, classic: 3 }
      },
      {
        text: "当前流行趋势",
        scores: { explorer: 1, aesthetic: 1, intellectual: 0, social: 3, minimalist: 0, eclectic: 1, trendsetter: 3, classic: 0 }
      },
      {
        text: "舒适度和实用性",
        scores: { explorer: 1, aesthetic: 0, intellectual: 1, social: 1, minimalist: 3, eclectic: 0, trendsetter: 1, classic: 2 }
      }
    ]
  },
  {
    id: 6,
    text: "选择餐厅时，你最看重什么？",
    options: [
      {
        text: "网红打卡地和拍照环境",
        scores: { explorer: 1, aesthetic: 2, intellectual: 0, social: 3, minimalist: 0, eclectic: 1, trendsetter: 3, classic: 0 }
      },
      {
        text: "食物的创新和独特性",
        scores: { explorer: 3, aesthetic: 2, intellectual: 2, social: 1, minimalist: 0, eclectic: 3, trendsetter: 1, classic: 0 }
      },
      {
        text: "传统口味和经典菜式",
        scores: { explorer: 0, aesthetic: 1, intellectual: 1, social: 1, minimalist: 1, eclectic: 0, trendsetter: 0, classic: 3 }
      },
      {
        text: "简单清爽，不要太复杂",
        scores: { explorer: 0, aesthetic: 1, intellectual: 1, social: 0, minimalist: 3, eclectic: 0, trendsetter: 1, classic: 2 }
      }
    ]
  },
  {
    id: 7,
    text: "你的理想度假方式是？",
    options: [
      {
        text: "探索未知的小众目的地",
        scores: { explorer: 3, aesthetic: 1, intellectual: 2, social: 0, minimalist: 1, eclectic: 2, trendsetter: 1, classic: 0 }
      },
      {
        text: "在有历史底蕴的城市漫步",
        scores: { explorer: 1, aesthetic: 2, intellectual: 3, social: 1, minimalist: 1, eclectic: 1, trendsetter: 0, classic: 3 }
      },
      {
        text: "和朋友一起去热门旅游地",
        scores: { explorer: 1, aesthetic: 1, intellectual: 0, social: 3, minimalist: 0, eclectic: 1, trendsetter: 2, classic: 1 }
      },
      {
        text: "安静的度假村，什么都不做",
        scores: { explorer: 0, aesthetic: 1, intellectual: 1, social: 0, minimalist: 3, eclectic: 0, trendsetter: 0, classic: 2 }
      }
    ]
  },
  {
    id: 8,
    text: "看电影时，你更偏爱什么类型？",
    options: [
      {
        text: "艺术电影和独立制作",
        scores: { explorer: 2, aesthetic: 3, intellectual: 3, social: 0, minimalist: 1, eclectic: 2, trendsetter: 1, classic: 1 }
      },
      {
        text: "经典老电影",
        scores: { explorer: 0, aesthetic: 2, intellectual: 2, social: 1, minimalist: 1, eclectic: 1, trendsetter: 0, classic: 3 }
      },
      {
        text: "最新上映的大片",
        scores: { explorer: 1, aesthetic: 1, intellectual: 0, social: 3, minimalist: 0, eclectic: 1, trendsetter: 3, classic: 0 }
      },
      {
        text: "什么都看，不挑剔",
        scores: { explorer: 1, aesthetic: 1, intellectual: 1, social: 2, minimalist: 1, eclectic: 3, trendsetter: 1, classic: 1 }
      }
    ]
  },
  {
    id: 9,
    text: "选择书籍时，你更喜欢？",
    options: [
      {
        text: "哲学、心理学等思辨类书籍",
        scores: { explorer: 1, aesthetic: 1, intellectual: 3, social: 0, minimalist: 2, eclectic: 1, trendsetter: 0, classic: 2 }
      },
      {
        text: "设计、艺术类画册",
        scores: { explorer: 2, aesthetic: 3, intellectual: 1, social: 1, minimalist: 1, eclectic: 2, trendsetter: 1, classic: 1 }
      },
      {
        text: "畅销书和网络推荐",
        scores: { explorer: 0, aesthetic: 0, intellectual: 1, social: 3, minimalist: 0, eclectic: 1, trendsetter: 3, classic: 0 }
      },
      {
        text: "经典文学作品",
        scores: { explorer: 0, aesthetic: 2, intellectual: 2, social: 1, minimalist: 1, eclectic: 0, trendsetter: 0, classic: 3 }
      }
    ]
  },
  {
    id: 10,
    text: "你的工作空间通常是什么样的？",
    options: [
      {
        text: "干净整洁，只留必需品",
        scores: { explorer: 0, aesthetic: 1, intellectual: 1, social: 0, minimalist: 3, eclectic: 0, trendsetter: 1, classic: 2 }
      },
      {
        text: "充满个人收藏和装饰品",
        scores: { explorer: 1, aesthetic: 3, intellectual: 1, social: 2, minimalist: 0, eclectic: 3, trendsetter: 1, classic: 2 }
      },
      {
        text: "有很多灵感素材和参考资料",
        scores: { explorer: 3, aesthetic: 2, intellectual: 2, social: 1, minimalist: 0, eclectic: 2, trendsetter: 1, classic: 0 }
      },
      {
        text: "会根据项目需要随时调整",
        scores: { explorer: 2, aesthetic: 1, intellectual: 2, social: 2, minimalist: 1, eclectic: 2, trendsetter: 2, classic: 0 }
      }
    ]
  },
  {
    id: 11,
    text: "参加聚会时，你通常？",
    options: [
      {
        text: "主动认识新朋友，分享有趣话题",
        scores: { explorer: 2, aesthetic: 1, intellectual: 1, social: 3, minimalist: 0, eclectic: 2, trendsetter: 2, classic: 1 }
      },
      {
        text: "找几个知己深入聊天",
        scores: { explorer: 1, aesthetic: 2, intellectual: 3, social: 1, minimalist: 2, eclectic: 1, trendsetter: 0, classic: 2 }
      },
      {
        text: "观察环境和人群，默默体验",
        scores: { explorer: 2, aesthetic: 2, intellectual: 2, social: 0, minimalist: 2, eclectic: 1, trendsetter: 0, classic: 1 }
      },
      {
        text: "跟着大家的节奏，随遇而安",
        scores: { explorer: 1, aesthetic: 1, intellectual: 1, social: 2, minimalist: 1, eclectic: 3, trendsetter: 1, classic: 2 }
      }
    ]
  },
  {
    id: 12,
    text: "如果要形容你的审美风格，你会选择？",
    options: [
      {
        text: "永远在寻找新鲜感和突破",
        scores: { explorer: 3, aesthetic: 1, intellectual: 1, social: 1, minimalist: 0, eclectic: 2, trendsetter: 3, classic: 0 }
      },
      {
        text: "追求完美的美感和和谐",
        scores: { explorer: 1, aesthetic: 3, intellectual: 2, social: 1, minimalist: 2, eclectic: 0, trendsetter: 1, classic: 2 }
      },
      {
        text: "喜欢有深度和内涵的东西",
        scores: { explorer: 1, aesthetic: 2, intellectual: 3, social: 0, minimalist: 2, eclectic: 1, trendsetter: 0, classic: 3 }
      },
      {
        text: "包容性强，各种风格都能欣赏",
        scores: { explorer: 2, aesthetic: 2, intellectual: 2, social: 2, minimalist: 1, eclectic: 3, trendsetter: 1, classic: 1 }
      }
    ]
  }
];

const tasteProfiles: { [key: string]: TasteProfile } = {
  explorer: {
    type: "explorer",
    title: "探索先锋",
    description: "你是一个天生的探险家，总是在寻找未知的美好。你不满足于主流，更喜欢发掘那些被忽视的宝藏。你的品味独特而前卫，常常能够预见未来的趋势。",
    traits: ["好奇心强", "勇于尝试", "独立思考", "创新精神"],
    color: "#FF6B35",
    emoji: "🧭"
  },
  aesthetic: {
    type: "aesthetic",
    title: "美学大师",
    description: "你对美有着天生的敏感度，能够在生活的每个细节中发现美的存在。你追求精致与和谐，你的选择总是经过深思熟虑，体现出卓越的审美品味。",
    traits: ["审美敏锐", "追求精致", "注重细节", "品味高雅"],
    color: "#8E44AD",
    emoji: "🎨"
  },
  intellectual: {
    type: "intellectual",
    title: "思辨学者",
    description: "你是一个深度思考者，不仅关注表面的美，更在意背后的意义和内涵。你的选择往往带有深刻的思考，你欣赏那些能够启发思维的作品。",
    traits: ["深度思考", "理性分析", "求知欲强", "重视内涵"],
    color: "#2C3E50",
    emoji: "🤔"
  },
  social: {
    type: "social",
    title: "潮流达人",
    description: "你总是站在时代的前沿，对流行趋势有着敏锐的嗅觉。你喜欢与人分享，你的品味往往能够引领身边朋友的选择。你是社交圈中的意见领袖。",
    traits: ["潮流敏感", "社交达人", "影响力强", "乐于分享"],
    color: "#E74C3C",
    emoji: "⭐"
  },
  minimalist: {
    type: "minimalist",
    title: "极简主义者",
    description: "你信奉'少即是多'的哲学，在简单中寻找纯粹的美。你的选择精准而克制，每一样东西都有其存在的理由。你追求的是质量而非数量。",
    traits: ["简约精准", "理性克制", "注重质量", "内心平静"],
    color: "#34495E",
    emoji: "⚪"
  },
  eclectic: {
    type: "eclectic",
    title: "混搭艺术家",
    description: "你是一个开放的融合者，能够将不同风格巧妙地结合在一起。你的品味包容而多元，总能在看似冲突的元素中找到和谐的平衡点。",
    traits: ["包容多元", "创意融合", "适应性强", "个性鲜明"],
    color: "#F39C12",
    emoji: "🌈"
  },
  trendsetter: {
    type: "trendsetter",
    title: "趋势引领者",
    description: "你不仅追随潮流，更是创造潮流的人。你对新鲜事物有着天生的敏感度，总能在第一时间发现并引领新的趋势。你的选择往往成为别人模仿的对象。",
    traits: ["创新引领", "敏感度高", "影响力大", "前瞻性强"],
    color: "#9B59B6",
    emoji: "🚀"
  },
  classic: {
    type: "classic",
    title: "经典守护者",
    description: "你深深地被传统和经典所吸引，你相信真正的美是经得起时间考验的。你的品味稳重而持久，你珍视那些承载着历史和文化的美好事物。",
    traits: ["重视传统", "品味持久", "文化底蕴", "稳重可靠"],
    color: "#27AE60",
    emoji: "📚"
  }
};

export const TasteTest: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<TasteProfile | null>(null);
  const [generatedArticle, setGeneratedArticle] = useState<string | null>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [scores, setScores] = useState<{ [key: string]: number }>({
    explorer: 0,
    aesthetic: 0,
    intellectual: 0,
    social: 0,
    minimalist: 0,
    eclectic: 0,
    trendsetter: 0,
    classic: 0
  });

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
      const resultType = Object.keys(newScores).find(key => newScores[key] === maxScore) || 'eclectic';
      setResult(tasteProfiles[resultType]);
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const newAnswers = answers.slice(0, -1);
      setAnswers(newAnswers);

      // 重新计算分数
      const newScores = {
        explorer: 0,
        aesthetic: 0,
        intellectual: 0,
        social: 0,
        minimalist: 0,
        eclectic: 0,
        trendsetter: 0,
        classic: 0
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
      explorer: 0,
      aesthetic: 0,
      intellectual: 0,
      social: 0,
      minimalist: 0,
      eclectic: 0,
      trendsetter: 0,
      classic: 0
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
      .map(([type, score]) => `${tasteProfiles[type]?.title}: ${score}分`)
      .join('、');

    const articleContent = `# ${result.emoji} 我的品味测试结果：${result.title}

## 测试结果概述

经过12个精心设计的问题，我发现自己的品味类型是：**${result.title}**

${result.description}

## 我的核心特质

${result.traits.map(trait => `- ${trait}`).join('\n')}

## 测试详情回顾

在这次品味测试中，我对每个问题都进行了深入的思考：

${questionDetails}

## 得分分析

我的各项品味维度得分如下：
- 探索先锋：${scores.explorer}分
- 美学大师：${scores.aesthetic}分
- 思辨学者：${scores.intellectual}分
- 潮流达人：${scores.social}分
- 极简主义者：${scores.minimalist}分
- 混搭艺术家：${scores.eclectic}分
- 趋势引领者：${scores.trendsetter}分
- 经典守护者：${scores.classic}分

最突出的前三项特质是：${topScores}

## 对我的启发

这次测试让我更深入地了解了自己的审美偏好和生活方式。作为一个${result.title}，我在选择和决策时往往体现出${result.traits[0]}的特点。

每个人的品味都是独特的，它反映了我们的价值观、经历和内在世界。无论你是哪种品味类型，都有其独特的魅力和价值。

## 分享与思考

品味不是高低之分，而是个性的展现。希望这个测试能够帮助大家更好地了解自己，也欢迎分享你的测试结果！

---

*测试完成时间：${currentDate}*
*来试试你的品味类型：[品味测试链接]*

#品味测试 #个性分析 #自我发现 #${result.title}`;

    return articleContent;
  };

  const handleGenerateArticle = () => {
    const article = generateArticleContent();
    setGeneratedArticle(article);
    setShowArticleModal(true);
  };

  const handleCopyArticle = () => {
    if (generatedArticle) {
      navigator.clipboard.writeText(generatedArticle);
      alert('文章内容已复制到剪贴板！你可以直接粘贴到创作页面。');
    }
  };

  const handleShare = () => {
    if (result) {
      const shareText = `我刚完成了品味测试，结果是：${result.emoji} ${result.title}！${result.description} 来测测你的品味类型吧！`;
      const shareUrl = window.location.href;

      if (navigator.share) {
        navigator.share({
          title: '品味测试结果',
          text: shareText,
          url: shareUrl,
        });
      } else {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert('结果已复制到剪贴板！');
      }
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (isCompleted && result) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="text-6xl mb-4">{result.emoji}</div>
            <CardTitle className="text-2xl mb-2" style={{ color: result.color }}>
              {result.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              {result.description}
            </p>

            <div className="flex flex-wrap gap-2 justify-center">
              {result.traits.map((trait, index) => (
                <Badge key={index} variant="secondary" style={{ backgroundColor: `${result.color}20`, color: result.color }}>
                  {trait}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
              {Object.entries(scores).map(([type, score]) => (
                <div key={type} className="flex justify-between">
                  <span className="capitalize">{tasteProfiles[type]?.title || type}:</span>
                  <span className="font-medium">{score}分</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <div className="flex gap-4 justify-center">
                <Button onClick={handleShare} className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  分享结果
                </Button>
                <Button variant="outline" onClick={handleRestart} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  重新测试
                </Button>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleGenerateArticle}
                  variant="secondary"
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  <FileText className="w-4 h-4" />
                  生成文章内容
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 文章生成模态框 */}
        {showArticleModal && generatedArticle && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                生成的文章内容
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {generatedArticle}
                </pre>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleCopyArticle}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Copy className="w-4 h-4" />
                  复制文章内容
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowArticleModal(false)}
                >
                  关闭预览
                </Button>
              </div>

              <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                💡 <strong>使用提示：</strong>点击"复制文章内容"后，你可以直接前往创作页面粘贴，快速发布你的品味测试结果文章！
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">品味测试</CardTitle>
            <Badge variant="outline">
              {currentQuestion + 1} / {questions.length}
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium leading-relaxed">
              {questions[currentQuestion].text}
            </h3>

            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start h-auto py-4 px-4"
                  onClick={() => handleAnswer(index)}
                >
                  {option.text}
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
  );
};