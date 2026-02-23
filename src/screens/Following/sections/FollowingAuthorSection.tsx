import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import { useToast } from "../../../components/ui/toast";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import SubscribeButton from "../../../components/SubscribeButton/SubscribeButton";
import subscriptionService from "../../../services/subscriptionService";
import { AuthService } from "../../../services/authService";
import { SubscriptionInfo, AuthorInfo } from "../../../types/subscription";
import profileDefaultAvatar from "../../../assets/images/profile-default.svg";

// Interface for subscribed author with enhanced data
interface SubscribedAuthor extends AuthorInfo {
  subscriptionInfo: SubscriptionInfo;
  spacesCount: number;
  totalArticles: number;
  newArticlesSinceLastVisit: number;
  lastUpdated: string;
  emailFrequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY';
}

/**
 * Following page author card display component
 *
 * Features:
 * - 👤 Author-based display following subscription logic
 * - 📊 Shows author's space count and article statistics
 * - 🔔 Displays unread article count and latest update time
 * - ⚙️ Direct management of individual author subscriptions
 * - 🎨 Consistent with Copus design standards
 */
export const FollowingAuthorSection = (): JSX.Element => {
  const { showToast } = useToast();
  const { user } = useUser();
  const navigate = useNavigate();
  const [subscribedAuthors, setSubscribedAuthors] = useState<SubscribedAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'recently-updated'>('all');

  // Fetch subscribed authors
  useEffect(() => {
    const fetchSubscribedAuthors = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 🎭 Reinitialize mock data for demo purposes
        subscriptionService.reinitializeMockData();

        // Get all user subscriptions
        const subscriptions = await subscriptionService.getUserSubscriptionsWithDetails(user.id);
        console.log('User subscription list:', subscriptions);

        // Convert subscriptions to author card data
        const authorsMap = new Map<number, SubscribedAuthor>();

        for (const subscription of subscriptions) {
          if (subscription.authorUserId && subscription.authorInfo) {
            const authorId = subscription.authorUserId;

            if (authorsMap.has(authorId)) {
              // If author already exists, update statistics
              const existing = authorsMap.get(authorId)!;
              existing.spacesCount += 1;
            } else {
              // Create new author record
              const authorData: SubscribedAuthor = {
                userId: authorId,
                username: subscription.authorInfo.username || '',
                displayName: subscription.authorInfo.displayName || subscription.authorInfo.username || 'Unknown Author',
                avatar: subscription.authorInfo.avatar || profileDefaultAvatar,
                bio: subscription.authorInfo.bio || '',
                spacesCount: 1,
                totalArticles: Math.floor(Math.random() * 50) + 10, // Mock data
                newArticlesSinceLastVisit: Math.floor(Math.random() * 8),
                lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                emailFrequency: subscription.emailFrequency,
                subscriptionInfo: subscription
              };
              authorsMap.set(authorId, authorData);
            }
          }
        }

        const authorsArray = Array.from(authorsMap.values());
        setSubscribedAuthors(authorsArray);

      } catch (error) {
        console.error('Failed to fetch subscribed authors:', error);
        showToast('Failed to get subscription list', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribedAuthors();
  }, [user?.id, showToast]);

  // Filter authors based on selected filter
  const filteredAuthors = subscribedAuthors.filter(author => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'active') return author.newArticlesSinceLastVisit > 0;
    if (selectedFilter === 'recently-updated') {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      return new Date(author.lastUpdated).getTime() > threeDaysAgo;
    }
    return true;
  });

  // Handle author click - navigate to author's treasury
  const handleAuthorClick = (author: SubscribedAuthor) => {
    if (author.username) {
      navigate(`/u/${author.username}`);
    } else {
      navigate(`/user/${author.userId}`);
    }
  };

  // Handle unsubscribe
  const handleUnsubscribe = async (author: SubscribedAuthor, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!confirm(`Confirm unsubscribe from ${author.displayName}? You will no longer receive update notifications from this author.`)) {
      return;
    }

    try {
      const result = await subscriptionService.unsubscribeFromAuthor(author.userId);
      if (result.success) {
        setSubscribedAuthors(prev => prev.filter(a => a.userId !== author.userId));
        showToast(`Unsubscribed from ${author.displayName}`, 'info');
      } else {
        showToast('Failed to unsubscribe, please try again', 'error');
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      showToast('Operation failed, please try again later', 'error');
    }
  };

  // Get filter counts
  const filterCounts = {
    all: subscribedAuthors.length,
    active: subscribedAuthors.filter(a => a.newArticlesSinceLastVisit > 0).length,
    recentlyUpdated: subscribedAuthors.filter(a => {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      return new Date(a.lastUpdated).getTime() > threeDaysAgo;
    }).length
  };

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-off-black mb-4 [font-family:'Lato',Helvetica]">
            Subscribe to Authors, Discover Quality Content
          </h2>
          <p className="text-medium-grey mb-6 [font-family:'Lato',Helvetica]">
            Log in to subscribe to authors you're interested in and get their latest work updates
          </p>
          <Button
            onClick={() => navigate('/login')}
            variant="copus"
            size="lg"
            className="px-6 py-3 rounded-full"
          >
            Login Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-0">
      {/* Filter Tabs */}
      <section className="w-full px-2.5 lg:pl-2.5 lg:pr-0">
        <div className="flex items-center gap-3 flex-wrap mb-6">
          <Button
            onClick={() => setSelectedFilter('all')}
            variant={selectedFilter === 'all' ? 'copus-secondary' : 'copus-ghost'}
            size="sm"
            className="h-10 px-5 rounded-[100px]"
          >
            All Authors ({filterCounts.all})
          </Button>

          <Button
            onClick={() => setSelectedFilter('active')}
            variant={selectedFilter === 'active' ? 'copus-secondary' : 'copus-ghost'}
            size="sm"
            className="h-10 px-5 rounded-[100px]"
          >
            🔥 New Content ({filterCounts.active})
          </Button>

          <Button
            onClick={() => setSelectedFilter('recently-updated')}
            variant={selectedFilter === 'recently-updated' ? 'copus-secondary' : 'copus-ghost'}
            size="sm"
            className="h-10 px-5 rounded-[100px]"
          >
            ⏰ Recently Updated ({filterCounts.recentlyUpdated})
          </Button>
        </div>
      </section>

      {/* Authors Grid */}
      {loading ? (
        <section className="w-full px-2.5 lg:pl-2.5 lg:pr-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 animate-pulse p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1 w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </section>
      ) : filteredAuthors.length === 0 ? (
        <section className="w-full px-2.5 lg:pl-2.5 lg:pr-0">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-medium-grey mb-2 [font-family:'Lato',Helvetica]">
              {selectedFilter === 'all' ? 'No authors subscribed yet' :
               selectedFilter === 'active' ? 'No active authors' : 'No recent author updates'}
            </h3>
            <p className="text-medium-grey mb-6 [font-family:'Lato',Helvetica]">
              Go to the discovery page to find interesting authors and subscribe to their content
            </p>
            <Button
              onClick={() => navigate('/')}
              variant="copus"
              size="lg"
              className="px-6 py-3 rounded-full"
            >
              Discover Authors
            </Button>
          </div>
        </section>
      ) : (
        <section className="w-full px-2.5 lg:pl-2.5 lg:pr-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filteredAuthors.map((author) => (
            <Card
              key={author.userId}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200 relative w-80 bg-white border border-gray-200 shadow-lg"
              onClick={() => handleAuthorClick(author)}
            >
              <CardContent className="p-4">
                {/* New Content Badge */}
                {author.newArticlesSinceLastVisit > 0 && (
                  <div className="absolute top-3 right-3 bg-red text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                    {author.newArticlesSinceLastVisit} New
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {/* Author Avatar */}
                  <img
                    src={author.avatar || profileDefaultAvatar}
                    alt={`${author.displayName}'s avatar`}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0 cursor-pointer hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = profileDefaultAvatar;
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    {/* Author Name and Username */}
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className="[font-family:'Lato',Helvetica] font-semibold text-gray-900 text-base cursor-pointer hover:text-blue-600 transition-colors duration-200 truncate"
                        title={author.displayName}
                      >
                        {author.displayName}
                      </h4>
                      {author.username && (
                        <span className="[font-family:'Lato',Helvetica] text-gray-500 text-sm truncate">
                          @{author.username}
                        </span>
                      )}
                    </div>

                    {/* Author Bio */}
                    {author.bio && author.bio.trim() && (
                      <p className="[font-family:'Lato',Helvetica] text-gray-600 text-sm leading-snug overflow-hidden"
                         style={{
                           display: '-webkit-box',
                           WebkitLineClamp: 2,
                           WebkitBoxOrient: 'vertical'
                         }}>
                        {author.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Subscribe Button - centered with margin top */}
                <div className="flex justify-center mt-3">
                  <SubscribeButton
                    authorUserId={author.userId}
                    authorName={author.displayName}
                    size="small"
                    variant="minimal"
                    showSubscriberCount={true}
                    onSubscriptionChange={(isSubscribed) => {
                      if (!isSubscribed) {
                        setSubscribedAuthors(prev => prev.filter(a => a.userId !== author.userId));
                      }
                    }}
                  />
                </div>

                {/* Subscription Statistics - matching UserCard's treasuries section */}
                {author.spacesCount > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="[font-family:'Lato',Helvetica] text-xs font-medium text-gray-700">
                        Statistics
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 [font-family:'Lato',Helvetica] space-y-1">
                      <div className="flex items-center justify-between">
                        <span>🏷️ Spaces: {author.spacesCount}</span>
                        <span>📄 Articles: {author.totalArticles}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>
                          {author.emailFrequency === 'IMMEDIATE' ? 'Immediate' :
                           author.emailFrequency === 'DAILY' ? 'Daily Digest' : 'Weekly Digest'}
                        </span>
                        <span>
                          {new Date(author.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </section>
      )}

    </div>
  );
};