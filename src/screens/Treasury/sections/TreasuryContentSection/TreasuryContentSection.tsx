import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { AuthService } from "../../../../services/authService";
import { useUser } from "../../../../contexts/UserContext";
import { useToast } from "../../../../components/ui/toast";
import { TreasuryHeaderSection } from "../TreasuryHeaderSection";
import { NavigationTabsSection } from "../NavigationTabsSection";
import { CollectionSection, CollectionItem } from "../CollectionSection";
import profileDefaultAvatar from "../../../../assets/images/profile-default.svg";

interface TreasuryArticle {
  id: string;
  uuid: string;
  title: string;
  coverImage: string;
  targetUrl: string;
  category?: string;
}

export const TreasuryContentSection = (): JSX.Element => {
  const { user, socialLinks, fetchSocialLinks } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"collections" | "curations">("collections");

  // Fetch social links when page loads (since we don't fetch them globally anymore)
  useEffect(() => {
    if (user) {
      fetchSocialLinks();
    }
  }, [user, fetchSocialLinks]);
  const [likedArticles, setLikedArticles] = useState<TreasuryArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [treasuryStats, setTreasuryStats] = useState({
    likedArticleCount: 0,
    articleCount: 0,
    myArticleLikedCount: 0
  });

  // Fetch user's liked articles
  useEffect(() => {
    const fetchLikedArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        const [treasuryInfoResponse, likedArticlesResponse] = await Promise.all([
          AuthService.getUserTreasuryInfo(),
          AuthService.getUserLikedArticles(1, 20),
        ]);
        console.log('Treasury - treasuryInfoResponse:', treasuryInfoResponse);
        console.log('Treasury - likedArticlesResponse:', likedArticlesResponse);

        // Process stats
        const treasuryInfo = treasuryInfoResponse.data || treasuryInfoResponse;
        if (treasuryInfo.statistics) {
          setTreasuryStats(treasuryInfo.statistics);
        }

        // Process articles list - handle null response (no token case)
        if (!likedArticlesResponse) {
          console.log('Treasury - likedArticlesResponse is null (no token?)');
          setLikedArticles([]);
          setLoading(false);
          return;
        }

        const articlesData = likedArticlesResponse?.data || likedArticlesResponse;
        console.log('Treasury - Raw likedArticlesResponse:', likedArticlesResponse);
        console.log('Treasury - articlesData:', articlesData);

        let articlesArray = [];
        if (articlesData && Array.isArray(articlesData.data)) {
          articlesArray = articlesData.data;
        } else if (Array.isArray(articlesData)) {
          articlesArray = articlesData;
        }
        console.log('Treasury - articlesArray length:', articlesArray.length);
        console.log('Treasury - current user id:', user?.id);

        const articles = articlesArray
          .filter((article: any) => {
            const keep = !user || article.authorInfo?.id !== user?.id;
            if (!keep) {
              console.log('Treasury - Filtering out article (author is current user):', article.title, article.authorInfo?.id);
            }
            return keep;
          })
          .sort((a: any, b: any) => (b.createAt || 0) - (a.createAt || 0))
          .map((article: any): TreasuryArticle => ({
            id: article.uuid,
            uuid: article.uuid,
            title: article.title,
            coverImage: article.coverUrl,
            targetUrl: article.targetUrl || '',
            category: article.categoryInfo?.name || 'General',
          }));

        setLikedArticles(articles);
        window.scrollTo({ top: 0, behavior: 'smooth' });

      } catch (error) {
        console.error('Failed to fetch liked articles:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch liked articles';
        setError(errorMessage);
        showToast('Failed to fetch treasury data, please try again', 'error');
        setLikedArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedArticles();
  }, []);

  // Handle share
  const handleShare = () => {
    if (user?.namespace) {
      const url = `${window.location.origin}/u/${user.namespace}`;
      navigator.clipboard.writeText(url);
      showToast('Profile link copied to clipboard', 'success');
    }
  };

  // Handle edit - navigate to settings
  const handleEdit = () => {
    navigate('/setting');
  };

  // Group articles by category for collections view
  const getCollectionsByCategory = (): { title: string; items: CollectionItem[] }[] => {
    const categoryMap = new Map<string, TreasuryArticle[]>();

    likedArticles.forEach(article => {
      const category = article.category || 'General';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(article);
    });

    return Array.from(categoryMap.entries()).map(([category, articles]) => ({
      title: category,
      items: articles.map(article => {
        // Extract hostname from targetUrl if available
        let website = '';
        if (article.targetUrl) {
          try {
            website = new URL(article.targetUrl).hostname.replace('www.', '');
          } catch {
            website = '';
          }
        }
        return {
          id: article.id,
          title: article.title,
          url: article.targetUrl || '',
          website, // Extracted hostname for display
          coverImage: article.coverImage,
        };
      }),
    }));
  };

  if (loading) {
    return (
      <main className="flex flex-col items-start gap-5 pl-[60px] pr-10 pt-0 pb-[30px] relative min-h-screen">
        <div className="flex items-center justify-center w-full h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </main>
    );
  }

  if (error) {
    const isAuthError = error.includes('auth') || error.includes('login');

    return (
      <main className="flex flex-col items-start gap-5 pl-[60px] pr-10 pt-0 pb-[30px] relative min-h-screen">
        <div className="flex flex-col items-center justify-center w-full h-64 text-center gap-4">
          <div className={isAuthError ? "text-yellow-600" : "text-red-500"}>
            {error}
          </div>
          {isAuthError && (
            <div className="flex gap-3">
              <Button
                onClick={() => { window.location.href = '/login'; }}
                className="bg-red hover:bg-red/90 text-white px-6 py-2 rounded-lg"
              >
                Login Again
              </Button>
              <Link to="/">
                <Button variant="outline" className="px-6 py-2 rounded-lg">
                  Back to Home
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    );
  }

  const collections = getCollectionsByCategory();

  return (
    <main className="flex flex-col items-start gap-5 px-0 pt-0 pb-[30px] relative min-h-screen">
      {/* Header Section */}
      <TreasuryHeaderSection
        username={user?.username || 'Anonymous'}
        namespace={user?.namespace || 'user'}
        bio={user?.bio || ''}
        avatarUrl={user?.faceUrl || profileDefaultAvatar}
        socialLinks={socialLinks}
        onShare={handleShare}
        onEdit={handleEdit}
      />

      {/* Navigation Tabs and Content */}
      <div className="flex flex-col items-start gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
        <NavigationTabsSection
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === "collections" ? (
          <div className="w-full">
            {collections.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full h-64 text-center">
                <img
                  className="w-16 h-16 mb-4 opacity-50"
                  alt="Empty treasure"
                  src="https://c.animaapp.com/mft5gmofxQLTNf/img/treasure-icon.svg"
                />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Your treasury is empty</h3>
                <p className="text-gray-500 mb-4">Like articles you enjoy and they will appear here</p>
                <Link
                  to="/"
                  className="px-4 py-2 bg-red text-white rounded-lg hover:bg-red/90 transition-colors"
                >
                  Discover Content
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 w-full">
                {collections.map((collection, index) => (
                  <CollectionSection
                    key={collection.title}
                    title={collection.title}
                    treasureCount={collection.items.length}
                    items={collection.items}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-64 text-center">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Curations coming soon</h3>
            <p className="text-gray-500">Create and share your own curated collections</p>
          </div>
        )}
      </div>
    </main>
  );
};
