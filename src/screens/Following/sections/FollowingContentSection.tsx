import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import { useToast } from "../../../components/ui/toast";
import { ArticleCard, ArticleData } from "../../../components/ArticleCard";
import profileDefaultAvatar from "../../../assets/images/profile-default.svg";

// Placeholder treasury tabs (spaces the user follows)
const placeholderTabs = [
  { id: "all", label: "All" },
  { id: "tech", label: "Tech" },
  { id: "education", label: "Education" },
  { id: "food", label: "Food" },
];

// Placeholder data for demonstration
const placeholderArticles: ArticleData[] = [
  {
    id: "1",
    uuid: "placeholder-1",
    title: "Welcome to Following",
    description: "This page will show content from spaces you follow. Start following spaces to see their content here!",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    category: "Technology",
    userName: "Copus Team",
    userAvatar: profileDefaultAvatar,
    date: new Date().toISOString(),
    treasureCount: 42,
    visitCount: "128",
    isLiked: false,
  },
  {
    id: "2",
    uuid: "placeholder-2",
    title: "Discover Amazing Spaces",
    description: "Explore the Discovery page to find interesting spaces and creators to follow.",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
    category: "Art",
    userName: "Explorer",
    userAvatar: profileDefaultAvatar,
    date: new Date().toISOString(),
    treasureCount: 36,
    visitCount: "95",
    isLiked: false,
  },
  {
    id: "3",
    uuid: "placeholder-3",
    title: "Build Your Feed",
    description: "Follow your favorite creators and spaces to curate a personalized content feed.",
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
    category: "Life",
    userName: "Community",
    userAvatar: profileDefaultAvatar,
    date: new Date().toISOString(),
    treasureCount: 28,
    visitCount: "67",
    isLiked: false,
  },
];

export const FollowingContentSection = (): JSX.Element => {
  const { showToast } = useToast();
  const { user } = useUser();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("all");

  // Handle like action
  const handleLike = async (articleId: string, currentIsLiked: boolean, currentLikeCount: number) => {
    if (!user) {
      showToast('Please log in to treasure this content', 'error', {
        action: {
          label: 'Login',
          onClick: () => navigate('/login')
        }
      });
      return;
    }

    // Placeholder - actual implementation would call API
    showToast('This is placeholder content', 'info');
  };

  // Handle user click
  const handleUserClick = (userId: number | undefined, userNamespace?: string) => {
    // Placeholder - would navigate to user profile
  };

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <main className="flex flex-col items-center justify-center gap-6 py-20 relative flex-1">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-dark-grey mb-4">
            Follow Spaces to See Content Here
          </h2>
          <p className="text-gray-500 mb-6">
            Log in to follow your favorite spaces and creators. Their latest content will appear here.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-red text-white rounded-full font-semibold hover:bg-red/90 transition-colors"
          >
            Log In
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-start gap-6 py-0 relative flex-1">
      {/* Treasury Tabs Section */}
      <section className="w-full px-2.5 lg:pl-2.5 lg:pr-0">
        <div className="flex items-center gap-3 flex-wrap">
          {placeholderTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`h-10 px-5 rounded-[100px] text-[16px] transition-colors flex items-center justify-center ${
                selectedTab === tab.id
                  ? "bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] text-[#454545] border border-[#a8a8a8] font-bold"
                  : "bg-white text-[#454545] border border-[#a8a8a8] font-medium hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Content Cards Section */}
      <section className="w-full pt-0 pb-[30px] min-h-screen px-2.5 lg:pl-2.5 lg:pr-0 grid grid-cols-1 lg:grid-cols-[repeat(auto-fill,minmax(408px,1fr))] gap-4 lg:gap-8">
        {placeholderArticles.map((article) => (
          <div key={article.id}>
            <ArticleCard
              article={article}
              layout="discovery"
              actions={{
                showTreasure: true,
                showVisits: true
              }}
              onLike={handleLike}
              onUserClick={handleUserClick}
            />
          </div>
        ))}
      </section>
    </main>
  );
};
