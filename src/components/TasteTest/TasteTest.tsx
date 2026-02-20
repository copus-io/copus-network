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
    category: "Information Processing",
    text: "When asking AI complex questions, what kind of response do you prefer?",
    options: [
      {
        text: "Concise and direct key points, quick problem solving",
        scores: { deepExplorer: 0, quickExecutor: 3, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 1, experimentalPioneer: 1, cautiousAnalyst: 0, intuitiveArtist: 0 }
      },
      {
        text: "Detailed comprehensive analysis with various perspectives and possibilities",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 0, experimentalPioneer: 1, cautiousAnalyst: 3, intuitiveArtist: 0 }
      },
      {
        text: "Structured logical framework with clear hierarchical relationships",
        scores: { deepExplorer: 2, quickExecutor: 1, creativeCatalyst: 0, logicArchitect: 3, socialConnector: 0, experimentalPioneer: 0, cautiousAnalyst: 2, intuitiveArtist: 0 }
      },
      {
        text: "Inspirational creative ideas that spark new thinking directions",
        scores: { deepExplorer: 1, quickExecutor: 0, creativeCatalyst: 3, logicArchitect: 0, socialConnector: 1, experimentalPioneer: 2, cautiousAnalyst: 0, intuitiveArtist: 3 }
      }
    ]
  },
  {
    id: 2,
    category: "Decision Making",
    text: "When facing multiple choices, how do you usually make decisions?",
    options: [
      {
        text: "Quick intuitive judgment, trust first instinct",
        scores: { deepExplorer: 0, quickExecutor: 3, creativeCatalyst: 2, logicArchitect: 0, socialConnector: 1, experimentalPioneer: 2, cautiousAnalyst: 0, intuitiveArtist: 3 }
      },
      {
        text: "Gather extensive information, analyze each option thoroughly",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 0, logicArchitect: 2, socialConnector: 0, experimentalPioneer: 1, cautiousAnalyst: 3, intuitiveArtist: 0 }
      },
      {
        text: "Establish decision framework, evaluate according to logical rules",
        scores: { deepExplorer: 2, quickExecutor: 1, creativeCatalyst: 0, logicArchitect: 3, socialConnector: 0, experimentalPioneer: 0, cautiousAnalyst: 2, intuitiveArtist: 0 }
      },
      {
        text: "Seek others' opinions, consider social impact",
        scores: { deepExplorer: 1, quickExecutor: 0, creativeCatalyst: 1, logicArchitect: 0, socialConnector: 3, experimentalPioneer: 0, cautiousAnalyst: 1, intuitiveArtist: 1 }
      }
    ]
  },
  {
    id: 3,
    category: "Learning Preferences",
    text: "When learning new knowledge, which approach do you prefer?",
    options: [
      {
        text: "Learn through hands-on practice and experimentation",
        scores: { deepExplorer: 1, quickExecutor: 2, creativeCatalyst: 2, logicArchitect: 1, socialConnector: 1, experimentalPioneer: 3, cautiousAnalyst: 0, intuitiveArtist: 2 }
      },
      {
        text: "Systematically read theories and literature",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 0, logicArchitect: 3, socialConnector: 0, experimentalPioneer: 1, cautiousAnalyst: 2, intuitiveArtist: 0 }
      },
      {
        text: "Understand through discussion and communication",
        scores: { deepExplorer: 1, quickExecutor: 1, creativeCatalyst: 2, logicArchitect: 1, socialConnector: 3, experimentalPioneer: 1, cautiousAnalyst: 1, intuitiveArtist: 2 }
      },
      {
        text: "Combine multiple approaches, adjust flexibly",
        scores: { deepExplorer: 2, quickExecutor: 2, creativeCatalyst: 3, logicArchitect: 2, socialConnector: 2, experimentalPioneer: 2, cautiousAnalyst: 1, intuitiveArtist: 1 }
      }
    ]
  },
  {
    id: 4,
    category: "Problem Solving",
    text: "When facing difficulties, what's your first reaction?",
    options: [
      {
        text: "Take immediate action, adjust as you go",
        scores: { deepExplorer: 0, quickExecutor: 3, creativeCatalyst: 2, logicArchitect: 0, socialConnector: 1, experimentalPioneer: 3, cautiousAnalyst: 0, intuitiveArtist: 2 }
      },
      {
        text: "Research deeply, find the root cause",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 0, experimentalPioneer: 1, cautiousAnalyst: 3, intuitiveArtist: 0 }
      },
      {
        text: "Seek help, listen to multiple perspectives",
        scores: { deepExplorer: 1, quickExecutor: 1, creativeCatalyst: 1, logicArchitect: 1, socialConnector: 3, experimentalPioneer: 0, cautiousAnalyst: 2, intuitiveArtist: 1 }
      },
      {
        text: "Try innovative methods, think outside the box",
        scores: { deepExplorer: 1, quickExecutor: 1, creativeCatalyst: 3, logicArchitect: 0, socialConnector: 1, experimentalPioneer: 3, cautiousAnalyst: 0, intuitiveArtist: 3 }
      }
    ]
  },
  {
    id: 5,
    category: "Communication Style",
    text: "When collaborating with others, what communication style do you prefer?",
    options: [
      {
        text: "Detailed documentation and clear timelines",
        scores: { deepExplorer: 2, quickExecutor: 1, creativeCatalyst: 0, logicArchitect: 3, socialConnector: 1, experimentalPioneer: 0, cautiousAnalyst: 3, intuitiveArtist: 0 }
      },
      {
        text: "Face-to-face instant discussions and feedback",
        scores: { deepExplorer: 1, quickExecutor: 2, creativeCatalyst: 2, logicArchitect: 1, socialConnector: 3, experimentalPioneer: 2, cautiousAnalyst: 0, intuitiveArtist: 2 }
      },
      {
        text: "Concise key point summaries and action plans",
        scores: { deepExplorer: 0, quickExecutor: 3, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 1, experimentalPioneer: 1, cautiousAnalyst: 1, intuitiveArtist: 0 }
      },
      {
        text: "Creative visual presentations and storytelling",
        scores: { deepExplorer: 0, quickExecutor: 0, creativeCatalyst: 3, logicArchitect: 0, socialConnector: 2, experimentalPioneer: 2, cautiousAnalyst: 0, intuitiveArtist: 3 }
      }
    ]
  },
  {
    id: 6,
    category: "Creative Expression",
    text: "When creating, where do you usually start?",
    options: [
      {
        text: "Clear goals and detailed planning",
        scores: { deepExplorer: 1, quickExecutor: 2, creativeCatalyst: 0, logicArchitect: 3, socialConnector: 1, experimentalPioneer: 0, cautiousAnalyst: 3, intuitiveArtist: 0 }
      },
      {
        text: "Sudden bursts of inspiration and ideas",
        scores: { deepExplorer: 0, quickExecutor: 1, creativeCatalyst: 3, logicArchitect: 0, socialConnector: 1, experimentalPioneer: 2, cautiousAnalyst: 0, intuitiveArtist: 3 }
      },
      {
        text: "Random attempts and experimentation",
        scores: { deepExplorer: 1, quickExecutor: 2, creativeCatalyst: 2, logicArchitect: 0, socialConnector: 0, experimentalPioneer: 3, cautiousAnalyst: 0, intuitiveArtist: 2 }
      },
      {
        text: "Deep research and data collection",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 0, experimentalPioneer: 1, cautiousAnalyst: 2, intuitiveArtist: 1 }
      }
    ]
  },
  {
    id: 7,
    category: "Aesthetic Preferences",
    text: "In artistic works, what attracts you most easily?",
    options: [
      {
        text: "Colorful works with strong visual impact",
        scores: { deepExplorer: 1, quickExecutor: 2, creativeCatalyst: 3, logicArchitect: 0, socialConnector: 2, experimentalPioneer: 3, cautiousAnalyst: 0, intuitiveArtist: 3 }
      },
      {
        text: "Minimalist works with clean lines and balanced composition",
        scores: { deepExplorer: 2, quickExecutor: 2, creativeCatalyst: 1, logicArchitect: 3, socialConnector: 1, experimentalPioneer: 0, cautiousAnalyst: 3, intuitiveArtist: 1 }
      },
      {
        text: "Classic traditional works with historical depth",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 0, logicArchitect: 2, socialConnector: 1, experimentalPioneer: 0, cautiousAnalyst: 3, intuitiveArtist: 2 }
      },
      {
        text: "Contemporary works with profound concepts that provoke thought",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 2, logicArchitect: 2, socialConnector: 0, experimentalPioneer: 1, cautiousAnalyst: 2, intuitiveArtist: 1 }
      }
    ]
  },
  {
    id: 8,
    category: "Lifestyle Preferences",
    text: "When choosing a living environment, what do you value most?",
    options: [
      {
        text: "Modern minimalist design with strong functionality",
        scores: { deepExplorer: 1, quickExecutor: 3, creativeCatalyst: 1, logicArchitect: 3, socialConnector: 1, experimentalPioneer: 1, cautiousAnalyst: 2, intuitiveArtist: 0 }
      },
      {
        text: "Spaces filled with artworks and personalized decorations",
        scores: { deepExplorer: 2, quickExecutor: 0, creativeCatalyst: 3, logicArchitect: 0, socialConnector: 2, experimentalPioneer: 2, cautiousAnalyst: 0, intuitiveArtist: 3 }
      },
      {
        text: "Natural materials with warm and comfortable atmosphere",
        scores: { deepExplorer: 2, quickExecutor: 1, creativeCatalyst: 1, logicArchitect: 1, socialConnector: 2, experimentalPioneer: 1, cautiousAnalyst: 2, intuitiveArtist: 3 }
      },
      {
        text: "High-tech environment with strong technological feel",
        scores: { deepExplorer: 1, quickExecutor: 2, creativeCatalyst: 2, logicArchitect: 3, socialConnector: 1, experimentalPioneer: 3, cautiousAnalyst: 1, intuitiveArtist: 0 }
      }
    ]
  },
  {
    id: 9,
    category: "Shopping Habits",
    text: "When shopping, how do you usually make choices?",
    options: [
      {
        text: "Research product reviews and user feedback in depth",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 0, logicArchitect: 2, socialConnector: 1, experimentalPioneer: 0, cautiousAnalyst: 3, intuitiveArtist: 0 }
      },
      {
        text: "Quickly compare core features, choose the best value for money",
        scores: { deepExplorer: 0, quickExecutor: 3, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 1, experimentalPioneer: 1, cautiousAnalyst: 1, intuitiveArtist: 0 }
      },
      {
        text: "Choose products with unique design that stand out",
        scores: { deepExplorer: 1, quickExecutor: 1, creativeCatalyst: 3, logicArchitect: 0, socialConnector: 1, experimentalPioneer: 3, cautiousAnalyst: 0, intuitiveArtist: 3 }
      },
      {
        text: "Consider friend recommendations and social reviews",
        scores: { deepExplorer: 1, quickExecutor: 1, creativeCatalyst: 1, logicArchitect: 1, socialConnector: 3, experimentalPioneer: 0, cautiousAnalyst: 2, intuitiveArtist: 1 }
      }
    ]
  },
  {
    id: 10,
    category: "Musical Taste",
    text: "What type of music do you prefer to listen to?",
    options: [
      {
        text: "Classical music or traditional folk music",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 0, experimentalPioneer: 0, cautiousAnalyst: 3, intuitiveArtist: 2 }
      },
      {
        text: "Pop songs and popular charts",
        scores: { deepExplorer: 0, quickExecutor: 2, creativeCatalyst: 1, logicArchitect: 1, socialConnector: 3, experimentalPioneer: 1, cautiousAnalyst: 0, intuitiveArtist: 2 }
      },
      {
        text: "Electronic music or experimental music",
        scores: { deepExplorer: 1, quickExecutor: 1, creativeCatalyst: 3, logicArchitect: 2, socialConnector: 1, experimentalPioneer: 3, cautiousAnalyst: 0, intuitiveArtist: 2 }
      },
      {
        text: "Listen to various styles, choose based on mood",
        scores: { deepExplorer: 2, quickExecutor: 2, creativeCatalyst: 2, logicArchitect: 1, socialConnector: 2, experimentalPioneer: 2, cautiousAnalyst: 1, intuitiveArtist: 3 }
      }
    ]
  },
  {
    id: 11,
    category: "Social Expression",
    text: "In social situations, how do you usually express yourself?",
    options: [
      {
        text: "Deep conversations, share insights and thoughts",
        scores: { deepExplorer: 3, quickExecutor: 0, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 2, experimentalPioneer: 0, cautiousAnalyst: 2, intuitiveArtist: 1 }
      },
      {
        text: "Concise expression, directly state the key points",
        scores: { deepExplorer: 0, quickExecutor: 3, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 1, experimentalPioneer: 1, cautiousAnalyst: 1, intuitiveArtist: 0 }
      },
      {
        text: "Express creative ideas through stories and metaphors",
        scores: { deepExplorer: 1, quickExecutor: 0, creativeCatalyst: 3, logicArchitect: 0, socialConnector: 2, experimentalPioneer: 2, cautiousAnalyst: 0, intuitiveArtist: 3 }
      },
      {
        text: "Listen more, ask key questions at the right time",
        scores: { deepExplorer: 2, quickExecutor: 1, creativeCatalyst: 1, logicArchitect: 2, socialConnector: 2, experimentalPioneer: 0, cautiousAnalyst: 3, intuitiveArtist: 1 }
      }
    ]
  },
  {
    id: 12,
    category: "Risk Preference",
    text: "What's your attitude when facing new opportunities?",
    options: [
      {
        text: "Carefully assess all risks and benefits",
        scores: { deepExplorer: 2, quickExecutor: 0, creativeCatalyst: 0, logicArchitect: 3, socialConnector: 1, experimentalPioneer: 0, cautiousAnalyst: 3, intuitiveArtist: 0 }
      },
      {
        text: "Make quick judgments, seize opportunities to act",
        scores: { deepExplorer: 0, quickExecutor: 3, creativeCatalyst: 2, logicArchitect: 1, socialConnector: 1, experimentalPioneer: 2, cautiousAnalyst: 0, intuitiveArtist: 1 }
      },
      {
        text: "Like to try novel and interesting possibilities",
        scores: { deepExplorer: 1, quickExecutor: 1, creativeCatalyst: 3, logicArchitect: 0, socialConnector: 1, experimentalPioneer: 3, cautiousAnalyst: 0, intuitiveArtist: 2 }
      },
      {
        text: "First observe others' reactions and results",
        scores: { deepExplorer: 2, quickExecutor: 0, creativeCatalyst: 0, logicArchitect: 2, socialConnector: 2, experimentalPioneer: 0, cautiousAnalyst: 3, intuitiveArtist: 1 }
      }
    ]
  }
];

const aiPersonalityProfiles: { [key: string]: AIPersonalityProfile } = {
  deepExplorer: {
    type: "deepExplorer",
    title: "Deep Explorer",
    description: "You are a thinker who seeks deep understanding. When interacting with AI, you need comprehensive and detailed information to make optimal decisions. You excel at extracting essence from complex information and building deep knowledge connections. Aesthetically, you prefer works with depth and substance, pursuing historical heritage and cultural value.",
    traits: ["Deep Thinking", "Systematic Analysis", "Pursuit of Completeness", "Attention to Detail", "Love for Classic Traditions"],
    color: "#2E8B57",
    emoji: "🔍",
    aiInteractionStyle: {
      preferredResponseLength: "Detailed and complete, including background information and multi-angle analysis",
      decisionMakingStyle: "Deep analysis based on comprehensive information",
      learningPreference: "Systematic learning, building knowledge networks",
      communicationStyle: "Detailed discussion, in-depth exploration",
      problemSolvingApproach: "Comprehensive research, finding root causes"
    },
    idealAIBehaviors: [
      "Provide detailed background information and context",
      "List multiple possibilities and alternative solutions",
      "Explain reasoning processes and logical chains",
      "Cite reliable sources and supporting evidence",
      "Provide deep analysis rather than surface-level answers"
    ],
    workingStyle: "Enjoys deep research, needs ample time to think, values quality over speed",
    creativityPattern: "Generates innovative ideas through deep learning and knowledge integration"
  },
  quickExecutor: {
    type: "quickExecutor",
    title: "Quick Executor",
    description: "You are a practical person who focuses on efficiency and action. When interacting with AI, you need concise, direct answers and immediately actionable suggestions. You excel at making quick decisions and like to rapidly transform ideas into action. In lifestyle preferences, you lean toward modern minimalist, highly functional choices.",
    traits: ["Efficient Execution", "Goal-Oriented", "Strong Action Drive", "Quick Decision Making", "Simple and Practical"],
    color: "#E74C3C",
    emoji: "⚡",
    aiInteractionStyle: {
      preferredResponseLength: "Concise and clear, directly provide key points and actionable suggestions",
      decisionMakingStyle: "Quick judgment based on core information",
      learningPreference: "Learn through practice, adjust while doing",
      communicationStyle: "Direct communication with highlighted key points",
      problemSolvingApproach: "Immediate action, rapid iteration"
    },
    idealAIBehaviors: [
      "Provide concise and clear answers",
      "Give immediately executable steps",
      "Highlight the most important information",
      "Avoid lengthy explanations",
      "Provide quick solutions"
    ],
    workingStyle: "Fast-paced work, values efficiency, likes to see immediate results",
    creativityPattern: "Inspire ideas through action, find optimal solutions through rapid trial and error"
  },
  creativeCatalyst: {
    type: "creativeCatalyst",
    title: "Creative Catalyst",
    description: "You are an innovative thinking catalyst who excels at merging different ideas to create new possibilities. When interacting with AI, you need inspirational answers and innovative approaches to help you break out of conventional thinking frameworks. In artistic taste, you're attracted to colorful works with strong visual impact, enjoying experimental and avant-garde expressions.",
    traits: ["Innovative Thinking", "Cross-Boundary Integration", "Rich Inspiration", "Breaking Conventions", "Artistic Sensitivity"],
    color: "#9B59B6",
    emoji: "🎨",
    aiInteractionStyle: {
      preferredResponseLength: "Inspirational content with innovative angles and associations",
      decisionMakingStyle: "Creative thinking, seeking breakthrough solutions",
      learningPreference: "Learn through exploration and experimentation",
      communicationStyle: "Inspirational dialogue that sparks innovative thinking",
      problemSolvingApproach: "Think outside the box, seek innovative solutions"
    },
    idealAIBehaviors: [
      "Provide innovative thinking perspectives",
      "Suggest unexpected solutions",
      "Inspire new creative directions",
      "Provide cross-domain inspiration connections",
      "Encourage experimental attempts"
    ],
    workingStyle: "Needs an inspiring environment, enjoys finding pleasure in creation",
    creativityPattern: "Generate innovative ideas through cross-boundary thinking and random associations"
  },
  logicArchitect: {
    type: "logicArchitect",
    title: "Logic Architect",
    description: "You are a systematic thinking builder who excels at breaking down complex problems into clear logical structures. When interacting with AI, you need well-organized frameworks and rigorous analytical steps. You prefer minimalist design and high-tech environments, pursuing the beauty of rationality and order.",
    traits: ["Rigorous Logic", "Strong Systematization", "Clear Framework", "Rational Analysis", "Tech-Savvy"],
    color: "#3498DB",
    emoji: "🏗️",
    aiInteractionStyle: {
      preferredResponseLength: "Structured and complete logical framework with clear hierarchy",
      decisionMakingStyle: "Systematic decision-making based on logical reasoning",
      learningPreference: "Build knowledge systems, combine theory with practice",
      communicationStyle: "Clear structured expression",
      problemSolvingApproach: "Break down problems, solve step by step"
    },
    idealAIBehaviors: [
      "Provide clear logical frameworks",
      "Organize information hierarchically",
      "Give structured analytical steps",
      "Establish causal relationship chains",
      "Provide verifiable reasoning processes"
    ],
    workingStyle: "Systematic work methods, emphasis on planning and execution",
    creativityPattern: "Generate innovation through logical reorganization and system optimization"
  },
  socialConnector: {
    type: "socialConnector",
    title: "Social Connector",
    description: "You are a natural socializer who excels at building interpersonal relationships and promoting team collaboration. When interacting with AI, you hope to receive suggestions that help you better communicate and collaborate with others. You follow popular trends, enjoy sharing with friends, and are an active member of social circles.",
    traits: ["Social Sensitivity", "Strong Communication Skills", "Team Collaboration", "Trend Awareness", "Sharing Spirit"],
    color: "#E67E22",
    emoji: "🤝",
    aiInteractionStyle: {
      preferredResponseLength: "Moderate length, easy to share and discuss",
      decisionMakingStyle: "Consider others' opinions, seek consensus",
      learningPreference: "Learn through communication and interaction",
      communicationStyle: "Friendly and approachable, easy to understand",
      problemSolvingApproach: "Seek cooperation, brainstorm together"
    },
    idealAIBehaviors: [
      "Provide shareable information",
      "Consider social impact and interpersonal relationships",
      "Give advice that benefits team collaboration",
      "Provide communication skills and social strategies",
      "Focus on group interests and harmony"
    ],
    workingStyle: "Values team collaboration, good at integrating resources",
    creativityPattern: "Inspire creativity through collective wisdom and social networks"
  },
  experimentalPioneer: {
    type: "experimentalPioneer",
    title: "Experimental Pioneer",
    description: "You are a brave explorer and adventurer who is passionate about trying new things and challenging unknown territories. When interacting with AI, you hope to receive advice that encourages experimentation and innovation. You enjoy cutting-edge technology and experimental art, always being the first to try new trends.",
    traits: ["Exploratory Spirit", "Courage to Try", "Innovation Awareness", "Risk Acceptance", "Frontier Sensitivity"],
    color: "#1ABC9C",
    emoji: "🚀",
    aiInteractionStyle: {
      preferredResponseLength: "Encouraging content with experimental suggestions",
      decisionMakingStyle: "Dare to try, learn from failures",
      learningPreference: "Learn through experimentation and exploration",
      communicationStyle: "Inspiring and full of possibilities",
      problemSolvingApproach: "Innovative experimentation, rapid iteration"
    },
    idealAIBehaviors: [
      "Encourage innovative experimentation",
      "Provide cutting-edge information and trends",
      "Support risk-taking and attempts",
      "Offer diverse possibilities",
      "Inspire exploratory spirit"
    ],
    workingStyle: "Dares to take risks, quickly adapts to changes",
    creativityPattern: "Discover new opportunities through experimentation and exploration"
  },
  cautiousAnalyst: {
    type: "cautiousAnalyst",
    title: "Cautious Analyst",
    description: "You are a meticulous analyzer who carefully evaluates all risks and opportunities before making decisions. When interacting with AI, you need comprehensive risk analysis and prudent advice. You prefer classic traditional choices, valuing stability and reliability.",
    traits: ["Careful and Meticulous", "Risk Awareness", "Steady and Reliable", "Deep Analysis", "Traditional Values"],
    color: "#7F8C8D",
    emoji: "🔍",
    aiInteractionStyle: {
      preferredResponseLength: "Detailed analysis including risk assessment",
      decisionMakingStyle: "Careful evaluation, risk avoidance",
      learningPreference: "In-depth research, verify reliability",
      communicationStyle: "Objective and rational, evidence-supported",
      problemSolvingApproach: "Comprehensive analysis, prudent solutions"
    },
    idealAIBehaviors: [
      "Provide detailed risk analysis",
      "Give prudent solutions",
      "Analyze various possibilities and consequences",
      "Provide reliable data support",
      "Consider long-term impacts"
    ],
    workingStyle: "Values quality and stability, pursues perfection",
    creativityPattern: "Generate reliable solutions through deep research and careful thinking"
  },
  intuitiveArtist: {
    type: "intuitiveArtist",
    title: "Intuitive Artist",
    description: "You are an artistic and sensitive thinker who can keenly perceive subtle changes in beauty and emotion. When interacting with AI, you hope to receive responses rich in emotional color and aesthetic value. Your choices are often based on intuition and emotion, pursuing personalized aesthetic experiences.",
    traits: ["Artistic Sensitivity", "Rich Emotions", "Sharp Intuition", "Personal Expression", "Aesthetic Pursuit"],
    color: "#E91E63",
    emoji: "🎭",
    aiInteractionStyle: {
      preferredResponseLength: "Rich in emotional color, including aesthetic thinking",
      decisionMakingStyle: "Choices based on intuition and emotion",
      learningPreference: "Learn through feeling and experience",
      communicationStyle: "Emotional expression, rich in beauty",
      problemSolvingApproach: "Creative intuitive solutions"
    },
    idealAIBehaviors: [
      "Provide aesthetically beautiful expressions",
      "Focus on emotions and feelings",
      "Give personalized suggestions",
      "Inspire artistic creativity",
      "Respect intuition and emotional judgment"
    ],
    workingStyle: "Focus on feelings and experiences, pursue beautiful expression",
    creativityPattern: "Create through intuitive feelings and artistic inspiration"
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

  // Publish-related state
  const [coverOptions, setCoverOptions] = useState<CoverImageOption[]>([]);
  const [selectedCover, setSelectedCover] = useState<CoverImageOption | null>(null);
  const [isGeneratingCovers, setIsGeneratingCovers] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishedArticleId, setPublishedArticleId] = useState<string | null>(null);

  // User login state
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
      // Calculate results
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

      // Recalculate scores
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

    const currentDate = new Date().toLocaleDateString('en-US');
    const questionDetails = answers.map((answerIndex, questionIndex) => {
      const question = questions[questionIndex];
      const selectedOption = question.options[answerIndex];
      return `**${question.text}**\nMy choice: ${selectedOption.text}`;
    }).join('\n\n');

    const topScores = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, score]) => `${aiPersonalityProfiles[type]?.title}: ${score} points`)
      .join('、');

    // Generate engaging titles
    const engagingTitles = {
      deepExplorer: [
        "I tested as a Deep Explorer - no wonder AI thinks I ask too many questions...",
        "Finally know why my ChatGPT conversations last 3 hours! I'm a Deep Explorer",
        "Deep Explorer personality revealed: I might be the most demanding AI user"
      ],
      quickExecutor: [
        "Shocking test result: I'm a Quick Executor, but why do I still procrastinate?",
        "As a Quick Executor, why are AI answers still too verbose for me?",
        "Turns out I'm a Quick Executor! No wonder I hate it when AI gives long-winded answers"
      ],
      creativeCatalyst: [
        "I'm a Creative Catalyst? No wonder even AI can't keep up with my wild ideas",
        "Test result: Creative Catalyst. AI, are you ready for my brilliant brainstorms?",
        "Creative Catalyst personality confirmed: I finally found the right way to work with AI"
      ],
      logicArchitect: [
        "Logic Architect? No wonder AI's messy answers drive me crazy",
        "Test revealed: I'm a Logic Architect, AI can you keep up with my pace?",
        "Logic Architect's dilemma: Why does AI always give irrelevant answers?"
      ],
      socialConnector: [
        "Social Connector? I actually want to be friends with AI...",
        "Test results in: Social Connector. Am I too nice to AI?",
        "Social Connector personality: I might be the gentlest AI user ever"
      ],
      experimentalPioneer: [
        "Experimental Pioneer? No wonder I'm always first to try new AI features",
        "Test confirmed: I'm an Experimental Pioneer, I need to try every AI feature",
        "Experimental Pioneer personality revealed: I might be the ultimate AI beta tester"
      ],
      cautiousAnalyst: [
        "Cautious Analyst? No wonder I never trust AI's first answer",
        "Test revealed: Cautious Analyst, I'm the skeptic expert of AI world",
        "Cautious Analyst confirmed: Now I know why I verify AI answers three times"
      ],
      intuitiveArtist: [
        "Intuitive Artist? No wonder my AI conversations are always so poetic",
        "Test result: Intuitive Artist. AI, do you understand my romance?",
        "Intuitive Artist personality: I might be the most emotional AI user"
      ]
    };

    const randomTitle = engagingTitles[result.type as keyof typeof engagingTitles]?.[
      Math.floor(Math.random() * 3)
    ] || `${result.emoji} My AI Personality Test Result: ${result.title}`;

    const articleContent = `# ${randomTitle}

My AI Personality Test Result: **${result.title}**

## 📋 AI Usage Guide (Copy this to your AI)

\`\`\`
I am a ${result.title} type user, here are my characteristics:

【Core Traits】
${result.traits.slice(0,3).map(trait => `• ${trait}`).join('\n')}

【Communication Preferences】
• Response Length: ${result.aiInteractionStyle.preferredResponseLength}
• Communication Style: ${result.aiInteractionStyle.communicationStyle}
• Decision Making: ${result.aiInteractionStyle.decisionMakingStyle}

【Best Collaboration Methods】
${result.idealAIBehaviors.slice(0,4).map(behavior => `• ${behavior}`).join('\n')}

【Highest Scoring Traits】
${topScores}

Please adjust your response style based on these characteristics to make our conversations more efficient!
\`\`\`

## 🎯 Test Results Details

**My Type:** ${result.title} ${result.emoji}

**Personality Description:** ${result.description}

**Working Style:** ${result.workingStyle}

**Creativity Pattern:** ${result.creativityPattern}

**My Ideal AI Interaction Methods:**
- 💬 Response Length: ${result.aiInteractionStyle.preferredResponseLength}
- 🧠 Decision Style: ${result.aiInteractionStyle.decisionMakingStyle}
- 📚 Learning Preference: ${result.aiInteractionStyle.learningPreference}
- 🔧 Problem Solving: ${result.aiInteractionStyle.problemSolvingApproach}

## 📊 Detailed Scores

${Object.entries(scores)
  .sort(([,a], [,b]) => b - a)
  .map(([type, score]) => `• ${aiPersonalityProfiles[type]?.title}: ${score} points`)
  .join('\n')}

---

💡 **Usage Tip:** Copy the "AI Usage Guide" above to ChatGPT, Claude, and other AI tools to help them better understand your needs!

📅 Test Date: ${currentDate}`;

    return articleContent;
  };

  const handleGenerateArticle = async () => {
    if (!result) {
      alert('Error: No test result data');
      return;
    }

    if (!isLoggedIn) {
      showToast('Please login first to publish articles', 'warning');
      navigate('/login', { state: { from: { pathname: '/taste-test' } } });
      return;
    }

    try {
      // Generate article content
      const article = generateArticleContent();
      setGeneratedArticle(article);

      // Generate cover image options
      setIsGeneratingCovers(true);
      const covers = await generateCoverImages(result.type);
      setCoverOptions(covers);
      setSelectedCover(covers[0]); // Default select first one

      setShowPublishModal(true);
    } catch (error) {
      console.error('Error generating article or cover images:', error);
      alert('Error generating content, please try again');
    } finally {
      setIsGeneratingCovers(false);
    }
  };

  // One-click publish to Copus
  // Generate unique ID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handlePublishToCopus = async () => {
    console.log('🚀 Starting to publish article to Copus...');
    console.log('User login status:', isLoggedIn);
    console.log('User info:', user);
    console.log('generatedArticle exists:', !!generatedArticle);
    console.log('selectedCover exists:', !!selectedCover);
    console.log('result exists:', !!result);

    if (!generatedArticle || !selectedCover || !result) {
      alert('Missing required information, cannot publish');
      return;
    }

    if (!isLoggedIn || !user) {
      showToast('Please login first before publishing', 'warning');
      navigate('/login', { state: { from: { pathname: '/taste-test' } } });
      return;
    }

    setIsPublishing(true);

    try {
      // Build article data
      const title = generatePracticalTitle();
      const newUuid = generateUUID();
      const articleData = {
        title: title,
        content: generatedArticle,
        coverUrl: selectedCover.url,
        targetUrl: `${window.location.origin}/taste-test`, // Current environment taste test page URL
        categoryId: 1, // Default category ID
        uuid: newUuid, // Generate new UUID
        visibility: 0, // Public article
      };

      console.log('📝 Publishing data:', {
        title: title,
        contentLength: generatedArticle.length,
        coverUrl: selectedCover.url,
        userId: user.id
      });

      // Publish article
      console.log('📤 Calling publishArticle API...');
      const response = await publishArticle(articleData);

      console.log('✅ Published successfully, response:', response);

      if (response.uuid) {
        setPublishedArticleId(response.uuid);
        setPublishSuccess(true);
        console.log('✅ Article ID set successfully:', response.uuid);
      } else {
        console.error('❌ Missing uuid field in publish response:', response);
        showToast('Published successfully but missing article ID, please contact administrator', 'warning');
        setPublishSuccess(true); // Still show success page, but buttons will be disabled
      }

    } catch (error) {
      console.error('❌ Failed to publish article:', error);

      let errorMessage = 'Publish failed, please try again';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
      }

      console.log('Error details:', {
        errorType: typeof error,
        errorMessage: errorMessage,
        errorObject: error
      });

      alert(`Publish failed: ${errorMessage}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // Helper function to generate practical AI collaboration guide titles
  const generatePracticalTitle = (): string => {
    if (!result) return 'AI Personality Test Result';

    const practicalTitles = {
      deepExplorer: [
        "Deep Explorer AI Usage Guide: Getting AI to Explain Every Step in Detail",
        "AI Personality Manual: I'm a Deep Explorer, I Need Comprehensive Analysis",
        "AI Collaboration Efficiency: Deep Explorer's Exclusive Interaction Method"
      ],
      quickExecutor: [
        "Quick Executor AI Settings: Give Me Conclusions Directly, Skip Lengthy Explanations",
        "AI Efficiency Guide: I'm a Quick Executor, I Want Concise and Powerful Answers",
        "AI Collaboration Optimization: Quick Executor's High-Efficiency Interaction Mode"
      ],
      creativeCatalyst: [
        "Creative Catalyst AI Collaboration Manual: How to Spark AI's Innovative Thinking",
        "Creative Guide for AI: I'm a Creative Catalyst, Let's Brainstorm Together",
        "AI Creative Partnership Guide: Creative Catalyst's Personalized Interaction Method"
      ],
      logicArchitect: [
        "Logic Architect AI User Manual: Requiring Structured Responses from AI",
        "Logical Instructions for AI: I'm an Architect, Please Reply in a Clear and Organized Way",
        "AI Collaboration Standards: Logic Architect's Systematic Interaction Guide"
      ],
      socialConnector: [
        "Social Connector AI Communication Guide: Building Friendly AI Collaboration",
        "Communication Tips for AI: I'm a Social Connector, I Prefer Gentle Interactions",
        "AI Humanized Communication: Social Connector's Personalized Collaboration Method"
      ],
      experimentalPioneer: [
        "Experimental Pioneer AI Exploration Guide: How to Try Innovative Solutions with AI",
        "Experimental Instructions for AI: I'm a Pioneer, Let's Explore New Possibilities Together",
        "AI Innovation Collaboration: Experimental Pioneer's Cutting-Edge Interaction Mode"
      ],
      cautiousAnalyst: [
        "Cautious Analyst AI Usage Standards: Requiring Verifiable Answers from AI",
        "Analytical Guidance for AI: I'm a Cautious Analyst, I Need Data Support",
        "AI Reliable Collaboration: Cautious Analyst's Rigorous Interaction Method"
      ],
      intuitiveArtist: [
        "Intuitive Artist AI Creation Guide: Helping AI Understand Your Emotional Thinking",
        "Artistic Guidance for AI: I'm an Intuitive Artist, Let's Communicate Emotionally",
        "AI Aesthetic Collaboration: Intuitive Artist's Creative Interaction Mode"
      ]
    };

    const titles = practicalTitles[result.type as keyof typeof practicalTitles];
    return titles?.[Math.floor(Math.random() * titles.length)] || `${result.emoji} My AI Personality Test Result: ${result.title}`;
  };


  const handleShare = () => {
    if (result) {
      const shareTexts = [
        `I'm a ${result.emoji} ${result.title}! Only ${Math.floor(Math.random() * 15) + 8}% of people are this type... What type do you think you are?`,
        `Shocking test result: I'm actually a ${result.title}! No wonder AI is always ${result.traits[0]}... Come test your AI personality!`,
        `${result.emoji} ${result.title} confirmed! I finally know why my AI conversations are so special... Want to try it?`,
        `AI personality test results revealed: ${result.title}! I might be the rare ${Math.floor(Math.random() * 15) + 8}% type... Do you dare to challenge?`
      ];

      const randomShareText = shareTexts[Math.floor(Math.random() * shareTexts.length)];
      const shareUrl = window.location.href;

      if (navigator.share) {
        navigator.share({
          title: `I'm ${result.title}, what about you?`,
          text: randomShareText,
          url: shareUrl,
        });
      } else {
        navigator.clipboard.writeText(`${randomShareText} ${shareUrl}`);
        alert('Interesting share content copied to clipboard! Go challenge your friends! 🎯');
      }
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (isCompleted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <HeaderSection />
        <div className="max-w-4xl mx-auto p-6 space-y-8 pt-12">

        {/* Copus Brand Header - Enhanced */}
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-slate-900">

          <CardContent className="p-8 text-white text-center">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-400 mb-4">
                <span className="text-4xl">🎉</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                Test Complete!
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Congratulations! You've discovered your unique AI interaction style and gained your personalized collaboration guide
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results Card - Enhanced */}
        <Card className="border border-white shadow-xl bg-white relative overflow-hidden">
          {/* Background Decoration - Optimized transparency and position */}
          <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-12 -translate-y-12 opacity-5 rounded-full blur-sm"
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
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-3">💡 AI Interaction Suggestions</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  {result.idealAIBehaviors.map((behavior, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{behavior}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-3">⚡ Working Style</h4>
                <p className="text-sm text-gray-700">{result.workingStyle}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-3">🎨 Creativity Pattern</h4>
                <p className="text-sm text-gray-700">{result.creativityPattern}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                {Object.entries(scores).map(([type, score]) => (
                  <div key={type} className="flex justify-between text-gray-700">
                    <span className="capitalize">{aiPersonalityProfiles[type]?.title || type}:</span>
                    <span className="font-medium text-blue-600">{score} points</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 mt-8">
              {/* Main Action Button */}
              <div className="flex justify-center">
                <Button
                  onClick={isLoggedIn ? handleGenerateArticle : () => {
                    showToast('Please login first to publish articles', 'warning');
                    navigate('/login', { state: { from: { pathname: '/taste-test' } } });
                  }}
                  size="lg"
                  className={`relative px-8 py-4 border-0 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold ${
                    isLoggedIn
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500'
                      : 'bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500'
                  }`}
                  style={{ color: '#1f2937' }}
                  disabled={isLoggedIn && (!result || isGeneratingCovers)}
                >
                  {isGeneratingCovers ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-800" />
                  ) : (
                    <FileText className="w-4 h-4 text-gray-800" />
                  )}
                  {isLoggedIn ? (
                    isGeneratingCovers ? 'Preparing to publish...' : '🚀 One-Click Publish to Copus'
                  ) : (
                    '🔑 Login to Publish Article'
                  )}
                </Button>
              </div>

              {/* Secondary Buttons */}
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="px-6 py-3 border-2 border-[#f23a00] text-[#f23a00] bg-white hover:bg-[#f23a00]/5 hover:border-[#f23a00] transition-all duration-200 rounded-[50px] font-bold"
                >
                  <Share2 className="w-4 h-4 mr-2 text-[#f23a00]" />
                  Share Results
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRestart}
                  className="px-6 py-3 border-2 border-gray-400 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-500 transition-all duration-200 rounded-[50px] font-bold"
                >
                  <RefreshCw className="w-4 h-4 mr-2 text-gray-700" />
                  Retake Test
                </Button>
              </div>
            </div>
            </div>
          </CardContent>
        </Card>

        {/* One-Click Publish Modal - Enhanced */}
        {showPublishModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-white">
              {/* Modal Header - Clean */}
              <div className="bg-white p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-dark-grey">
                      {publishSuccess ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <FileText className="w-6 h-6" />
                      )}
                      {publishSuccess ? '🎉 Article Published Successfully!' : '🚀 One-Click Publish to Copus'}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {publishSuccess
                        ? 'Your AI personality test results have been published to Copus, go check it out!'
                        : 'Select a cover image and confirm publishing your AI personality test results'
                      }
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPublishModal(false)}
                    className="text-gray-500 hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-120px)] bg-white">
                {!publishSuccess ? (
                  <>
                    {/* Title Preview */}
                    <div className="bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">📝 Article Title Preview</h3>
                      <p className="text-dark-grey">{generatePracticalTitle()}</p>
                    </div>

                    {/* Cover Image Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                        <Image className="w-5 h-5" />
                        🎨 Choose AI-Generated Cover Image
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {coverOptions.map((cover, index) => (
                          <div
                            key={cover.id}
                            className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                              selectedCover?.id === cover.id
                                ? 'border-[#f23a00] shadow-lg scale-105'
                                : 'border-gray-200 hover:border-[#f23a00]/50'
                            }`}
                            onClick={() => setSelectedCover(cover)}
                          >
                            <img
                              src={cover.url}
                              alt={cover.style}
                              className="w-full h-32 object-cover"
                            />
                            <div className="p-3 bg-white">
                              <p className="text-sm font-medium text-dark-grey">{cover.style}</p>
                              <p className="text-xs text-gray-600 mt-1">{cover.description.slice(0, 60)}...</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Article Content Preview (Collapsible) */}
                    <details className="bg-gray-50 border border-gray-200 rounded-lg">
                      <summary className="p-4 cursor-pointer font-medium text-gray-700">
                        📄 Preview Article Content (Click to expand)
                      </summary>
                      <div className="p-4 pt-0 max-h-60 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-xs text-gray-600">
                          {generatedArticle?.slice(0, 500)}...
                        </pre>
                      </div>
                    </details>

                    {/* Publish Button */}
                    <div className="flex gap-4 justify-center pt-4 border-t border-gray-200">
                      <Button
                        onClick={handlePublishToCopus}
                        disabled={isPublishing || !selectedCover}
                        className="flex items-center gap-2 bg-[#f23a00] hover:bg-[#f23a00]/90 text-white px-8 py-3 rounded-[50px] font-bold"
                      >
                        {isPublishing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                        {isPublishing ? 'Publishing...' : 'Confirm Publish to Copus'}
                      </Button>


                      <Button
                        variant="outline"
                        onClick={() => setShowPublishModal(false)}
                        className="border-[#f23a00] text-[#f23a00] bg-transparent hover:bg-[#f23a00]/10 rounded-[50px] px-6 font-bold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  /* Publish Success Page */
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-dark-grey mb-2">Published Successfully!</h3>
                      <p className="text-gray-600">Your AI personality test result article has been successfully published to Copus</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800">
                        <strong>Article ID:</strong> {publishedArticleId}
                      </p>
                      <p className="text-green-700 mt-2">
                        The article will appear on the discovery page within a few minutes. You can also view it in "My Creations".
                      </p>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={() => {
                          if (!publishedArticleId) {
                            console.error('❌ publishedArticleId is empty, cannot navigate');
                            showToast('Article ID is invalid, please try again', 'error');
                            return;
                          }
                          console.log('🔗 Navigating to article:', publishedArticleId);
                          console.log('🔗 Full URL:', `/work/${publishedArticleId}`);
                          // Use React Router navigation to ensure HeaderSection displays properly
                          navigate(`/work/${publishedArticleId}`);
                        }}
                        className="bg-[#f23a00] hover:bg-[#f23a00]/90 text-white rounded-[50px] px-6 py-2 font-bold"
                        disabled={!publishedArticleId}
                      >
                        📖 View Published Article
                      </Button>

                      <Button
                        onClick={() => window.open('/', '_blank')}
                        variant="outline"
                        className="border-[#f23a00] text-[#f23a00] bg-transparent hover:bg-[#f23a00]/10 rounded-[50px] px-6 font-bold"
                      >
                        Go to Discovery Page
                      </Button>

                      <Button
                        onClick={() => setShowPublishModal(false)}
                        variant="outline"
                        className="border-gray-400 text-gray-600 bg-transparent hover:bg-gray-50 rounded-[50px] px-6 font-bold"
                      >
                        Close
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
    <div className="min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <HeaderSection />
      <div className="max-w-4xl mx-auto p-6 space-y-8 pt-12">

        {/* Test Introduction Card - Enhanced */}
        <Card className="relative overflow-hidden border border-white shadow-xl bg-white">

          <CardContent className="p-8 text-dark-grey">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400 mb-2">
                  <span className="text-3xl">🧠</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-dark-grey">
                  Copus AI Personality Test
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Discover your unique AI interaction style and get personalized AI collaboration guides for more effective conversations
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-[linear-gradient(0deg,rgba(224,224,224,0.3)_0%,rgba(224,224,224,0.3)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] border border-gray-200">
                  <span className="text-2xl">🎯</span>
                  <span className="font-bold text-[#f23a00]">12 Curated Questions</span>
                  <span className="text-sm font-medium text-gray-600">Scientific analysis of your AI usage habits</span>
                </div>
                <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-[linear-gradient(0deg,rgba(224,224,224,0.3)_0%,rgba(224,224,224,0.3)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] border border-gray-200">
                  <span className="text-2xl">⚡</span>
                  <span className="font-bold text-[#f23a00]">3 Minutes to Complete</span>
                  <span className="text-sm font-medium text-gray-600">Quick insights into your interaction style</span>
                </div>
                <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-[linear-gradient(0deg,rgba(224,224,224,0.3)_0%,rgba(224,224,224,0.3)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] border border-gray-200">
                  <span className="text-2xl">🚀</span>
                  <span className="font-bold text-[#f23a00]">One-Click Publish Results</span>
                  <span className="text-sm font-medium text-gray-600">Generate your personalized AI collaboration guide</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Card - Enhanced */}
        <Card className="border border-white shadow-xl bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-[50px] bg-[#f23a00] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{currentQuestion + 1}</span>
                </div>
                <CardTitle className="text-xl text-dark-grey">Question {currentQuestion + 1}</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] text-[#f23a00] px-3 py-1 border border-gray-200">
                {currentQuestion + 1} / {questions.length}
              </Badge>
            </div>
            <Progress
              value={progress}
              className="w-full h-2 bg-gray-200"
              style={{"--progress-foreground": "#f23a00"} as any}
            />
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold leading-relaxed text-dark-grey text-center">
                {questions[currentQuestion].text}
              </h3>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start h-auto py-5 px-6 border-2 border-gray-200 hover:border-[#f23a00] hover:bg-[#f23a00]/5 transition-all duration-200 group rounded-[15px]"
                    onClick={() => handleAnswer(index)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-[#f23a00] flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-500 group-hover:text-[#f23a00]">
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
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 border-gray-400 text-gray-600 hover:bg-gray-50 hover:border-gray-500 rounded-[50px] px-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="text-sm text-gray-600">
              {questions.length - currentQuestion - 1} questions remaining
            </div>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};