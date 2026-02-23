import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import { useToast } from "../../../components/ui/toast";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import SubscribeButton from "../../../components/SubscribeButton/SubscribeButton";
import { ArticleCard } from "../../../components/ArticleCard";
import type { ArticleData } from "../../../components/ArticleCard";
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
  spaces: any[];
}

// Sample content cards data
const sampleArticles: ArticleData[] = [
  {
    id: 'sample-1',
    title: 'The Future of Decentralized Content Creation',
    description: 'Exploring how blockchain technology is reshaping the way creators publish and monetize their work in the digital age.',
    coverImage: '',
    category: 'Technology',
    userName: 'Alex Chen',
    userAvatar: '',
    date: new Date().toISOString(),
    treasureCount: 42,
    visitCount: '1.2k',
    commentCount: 8,
  },
  {
    id: 'sample-2',
    title: 'A Guide to Digital Art Curation',
    description: 'How to build meaningful collections that tell a story and connect communities through shared aesthetic values.',
    coverImage: '',
    category: 'Art',
    userName: 'Maya Johnson',
    userAvatar: '',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    treasureCount: 28,
    visitCount: '856',
    commentCount: 5,
  },
  {
    id: 'sample-3',
    title: 'Web3 Communities: Building Trust in the Digital Age',
    description: 'Understanding the social dynamics that drive successful decentralized communities and creator economies.',
    coverImage: '',
    category: 'Technology',
    userName: 'Sam Rivera',
    userAvatar: '',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    treasureCount: 67,
    visitCount: '2.3k',
    commentCount: 12,
  },
  {
    id: 'sample-4',
    title: 'The Rise of Creator Economies in Southeast Asia',
    description: 'A deep dive into how creators across the region are building sustainable businesses through digital platforms.',
    coverImage: '',
    category: 'Life',
    userName: 'Jordan Lee',
    userAvatar: '',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    treasureCount: 35,
    visitCount: '1.5k',
    commentCount: 6,
  },
  {
    id: 'sample-5',
    title: 'Photography as a Medium for Social Change',
    description: 'How visual storytelling is being used to raise awareness and drive meaningful conversations around the world.',
    coverImage: '',
    category: 'Art',
    userName: 'Taylor Kim',
    userAvatar: '',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    treasureCount: 51,
    visitCount: '980',
    commentCount: 9,
  },
  {
    id: 'sample-6',
    title: 'Understanding Smart Contract Security',
    description: 'Essential best practices for auditing and securing smart contracts before deploying to production.',
    coverImage: '',
    category: 'Technology',
    userName: 'Chris Zhang',
    userAvatar: '',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    treasureCount: 89,
    visitCount: '3.1k',
    commentCount: 15,
  },
  {
    id: 'sample-7',
    title: 'Minimalist Design Principles for Web Apps',
    description: 'Less is more — applying minimalist thinking to create clean, intuitive user interfaces that users love.',
    coverImage: '',
    category: 'Art',
    userName: 'Emma Wilson',
    userAvatar: '',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    treasureCount: 44,
    visitCount: '1.8k',
    commentCount: 7,
  },
  {
    id: 'sample-8',
    title: 'Building a Personal Brand as a Creator',
    description: 'Practical strategies for establishing your unique voice and growing an engaged audience online.',
    coverImage: '',
    category: 'Life',
    userName: 'David Park',
    userAvatar: '',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    treasureCount: 31,
    visitCount: '720',
    commentCount: 4,
  },
  {
    id: 'sample-9',
    title: 'The Evolution of Digital Collectibles',
    description: 'From early NFTs to curated digital treasuries — tracing the journey of collectible culture on the internet.',
    coverImage: '',
    category: 'Technology',
    userName: 'Olivia Martinez',
    userAvatar: '',
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    treasureCount: 73,
    visitCount: '2.7k',
    commentCount: 11,
  },
];

// Sample profile cards to fill the row
const sampleProfiles = [
  { userId: -1, displayName: 'Alex Chen', username: 'alexchen', avatar: '', spaces: [] },
  { userId: -2, displayName: 'Maya Johnson', username: 'mayaj', avatar: '', spaces: [] },
  { userId: -3, displayName: 'Sam Rivera', username: 'samrivera', avatar: '', spaces: [] },
  { userId: -4, displayName: 'Jordan Lee', username: 'jordanlee', avatar: '', spaces: [] },
  { userId: -5, displayName: 'Taylor Kim', username: 'taylork', avatar: '', spaces: [] },
  { userId: -6, displayName: 'Chris Zhang', username: 'chrisz', avatar: '', spaces: [] },
  { userId: -7, displayName: 'Emma Wilson', username: 'emmaw', avatar: '', spaces: [] },
  { userId: -8, displayName: 'David Park', username: 'davidp', avatar: '', spaces: [] },
  { userId: -9, displayName: 'Olivia Martinez', username: 'oliviam', avatar: '', spaces: [] },
  { userId: -10, displayName: 'Noah Thompson', username: 'noaht', avatar: '', spaces: [] },
];

// Sample subscribed treasuries
const sampleTreasuries = [
  { id: -1, name: 'Digital Art Collection', namespace: 'digital-art', authorName: 'Alex Chen', authorUsername: 'alexchen' },
  { id: -2, name: 'Web3 Research Hub', namespace: 'web3-research', authorName: 'Maya Johnson', authorUsername: 'mayaj' },
  { id: -3, name: 'Tech Innovation Weekly', namespace: 'tech-innovation', authorName: 'Sam Rivera', authorUsername: 'samrivera' },
  { id: -4, name: 'Creative Writing Corner', namespace: 'creative-writing', authorName: 'Jordan Lee', authorUsername: 'jordanlee' },
  { id: -5, name: 'Photography Showcase', namespace: 'photo-showcase', authorName: 'Taylor Kim', authorUsername: 'taylork' },
  { id: -6, name: 'AI & Machine Learning', namespace: 'ai-ml', authorName: 'Chris Zhang', authorUsername: 'chrisz' },
  { id: -7, name: 'Design Patterns', namespace: 'design-patterns', authorName: 'Emma Wilson', authorUsername: 'emmaw' },
  { id: -8, name: 'Startup Insights', namespace: 'startup-insights', authorName: 'David Park', authorUsername: 'davidp' },
];

interface FollowingAuthorSectionProps {
  showSubscriptionsPopup: boolean;
  setShowSubscriptionsPopup: (show: boolean) => void;
}

export const FollowingAuthorSection = ({ showSubscriptionsPopup, setShowSubscriptionsPopup }: FollowingAuthorSectionProps): JSX.Element => {
  const { showToast } = useToast();
  const { user } = useUser();
  const navigate = useNavigate();
  const [subscribedAuthors, setSubscribedAuthors] = useState<SubscribedAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [popupTab, setPopupTab] = useState<'curator' | 'treasuries'>('curator');

  // Check scroll state
  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const amount = 340; // slightly more than card width
    el.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  // Update scroll arrows when authors or loading changes
  useEffect(() => {
    // Small delay to let DOM render
    const timer = setTimeout(updateScrollState, 100);
    return () => clearTimeout(timer);
  }, [subscribedAuthors, loading, updateScrollState]);


  // Fetch subscribed authors and their spaces
  useEffect(() => {
    const fetchSubscribedAuthors = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        subscriptionService.reinitializeMockData();
        const subscriptions = await subscriptionService.getUserSubscriptionsWithDetails(user.id);

        const authorsMap = new Map<number, SubscribedAuthor>();
        for (const subscription of subscriptions) {
          if (subscription.authorUserId && subscription.authorInfo) {
            const authorId = subscription.authorUserId;
            if (authorsMap.has(authorId)) {
              const existing = authorsMap.get(authorId)!;
              existing.spacesCount += 1;
            } else {
              authorsMap.set(authorId, {
                userId: authorId,
                username: subscription.authorInfo.username || '',
                displayName: subscription.authorInfo.displayName || subscription.authorInfo.username || 'Unknown Author',
                avatar: subscription.authorInfo.avatar || profileDefaultAvatar,
                bio: subscription.authorInfo.bio || '',
                spacesCount: 1,
                totalArticles: Math.floor(Math.random() * 50) + 10,
                newArticlesSinceLastVisit: Math.floor(Math.random() * 8),
                lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                emailFrequency: subscription.emailFrequency,
                subscriptionInfo: subscription,
                spaces: [],
              });
            }
          }
        }

        const authorsArray = Array.from(authorsMap.values());

        // Fetch spaces for each author
        for (const author of authorsArray) {
          try {
            const response = await AuthService.getMySpaces(author.userId, 1, 2);
            const spacesData = response?.data?.data && Array.isArray(response.data.data)
              ? response.data.data
              : response?.data && Array.isArray(response.data)
              ? response.data
              : [];
            author.spaces = spacesData;
          } catch {
            author.spaces = [];
          }
        }

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

  const handleAuthorClick = (author: SubscribedAuthor) => {
    if (author.username) {
      navigate(`/u/${author.username}`);
    } else {
      navigate(`/user/${author.userId}`);
    }
  };

  // If user is not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-normal text-off-black mb-4 [font-family:'Lato',Helvetica]">
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
    <div className="flex flex-col gap-0 py-0">

      {/* Subscribed Profiles Row */}
      {loading ? (
        <section className="w-full px-2.5 lg:pl-2.5 lg:pr-0">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 animate-pulse p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-1 w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="flex gap-1">
                    <div className="flex-1 h-14 bg-gray-200 rounded" />
                    <div className="flex-1 h-14 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : subscribedAuthors.length === 0 ? (
        <section className="w-full px-2.5 lg:pl-2.5 lg:pr-0">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h3 className="text-lg font-normal text-medium-grey mb-2 [font-family:'Lato',Helvetica]">
              No authors subscribed yet
            </h3>
            <p className="text-medium-grey text-sm mb-6 [font-family:'Lato',Helvetica]">
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
        <section className="w-full px-2.5 lg:pl-2.5 lg:pr-0 relative">
          {/* Left scroll arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scrollBy('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={updateScrollState}
          >
            {/* My profile card */}
            {user && (
              <Card
                className="w-44 flex-shrink-0 bg-white border border-gray-200 cursor-pointer"
                onClick={() => navigate(user.namespace ? `/u/${user.namespace}` : `/user/${user.id}`)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.faceUrl || user.avatar || profileDefaultAvatar}
                      alt="My avatar"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = profileDefaultAvatar;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="[font-family:'Lato',Helvetica] font-semibold text-gray-900 text-sm truncate">
                        {user.username || 'Me'}
                      </h4>
                      {user.namespace && (
                        <span className="[font-family:'Lato',Helvetica] text-gray-500 text-xs truncate block">
                          @{user.namespace}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscribed author cards */}
            {subscribedAuthors.map((author) => (
              <Card
                key={author.userId}
                className="w-44 flex-shrink-0 bg-white border border-gray-200 cursor-pointer"
                onClick={() => handleAuthorClick(author)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={author.avatar || profileDefaultAvatar}
                      alt={`${author.displayName}'s avatar`}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = profileDefaultAvatar;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4
                        className="[font-family:'Lato',Helvetica] font-semibold text-gray-900 text-sm truncate"
                        title={author.displayName}
                      >
                        {author.displayName}
                      </h4>
                      {author.username && (
                        <span className="[font-family:'Lato',Helvetica] text-gray-500 text-xs truncate block">
                          @{author.username}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Sample profile cards to fill the row */}
            {sampleProfiles.map((profile) => (
              <Card
                key={profile.userId}
                className="w-44 flex-shrink-0 bg-white border border-gray-200 cursor-pointer"
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={profileDefaultAvatar}
                      alt={`${profile.displayName}'s avatar`}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="[font-family:'Lato',Helvetica] font-semibold text-gray-900 text-sm truncate">
                        {profile.displayName}
                      </h4>
                      <span className="[font-family:'Lato',Helvetica] text-gray-500 text-xs truncate block">
                        @{profile.username}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right scroll arrow */}
          {canScrollRight && (
            <button
              onClick={() => scrollBy('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </section>
      )}

      {/* Grey divider */}
      <div className="w-full px-2.5 lg:pl-2.5 lg:pr-0 my-6">
        <div className="border-t border-gray-200" />
      </div>

      {/* Content section */}
      <section className="w-full px-2.5 lg:pl-2.5 lg:pr-0">
        <div className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 lg:gap-8">
          {sampleArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              layout="discovery"
              actions={{
                showTreasure: true,
                showVisits: true,
              }}
            />
          ))}
        </div>
      </section>

      {/* My Subscriptions Popup */}
      {showSubscriptionsPopup && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSubscriptionsPopup(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-200">
              <h2 className="[font-family:'Lato',Helvetica] text-lg font-semibold text-gray-900">
                My Subscriptions
              </h2>
              <button
                onClick={() => setShowSubscriptionsPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 px-5 pt-3 pb-1.5">
              <button
                onClick={() => setPopupTab('curator')}
                className={`text-[12px] [font-family:'Lato',Helvetica] px-3 py-1 rounded-full border transition-colors ${
                  popupTab === 'curator'
                    ? 'text-gray-900 border-gray-300 bg-gray-100 font-semibold'
                    : 'text-gray-500 border-gray-300 hover:border-gray-400 hover:text-gray-600 font-medium'
                }`}
              >
                Curator
              </button>
              <button
                onClick={() => setPopupTab('treasuries')}
                className={`text-[12px] [font-family:'Lato',Helvetica] px-3 py-1 rounded-full border transition-colors ${
                  popupTab === 'treasuries'
                    ? 'text-gray-900 border-gray-300 bg-gray-100 font-semibold'
                    : 'text-gray-500 border-gray-300 hover:border-gray-400 hover:text-gray-600 font-medium'
                }`}
              >
                Treasuries
              </button>
            </div>

            {/* Popup content - scrollable list */}
            <div className="overflow-y-auto px-5 py-3 flex flex-col gap-2">
              {popupTab === 'curator' ? (
                <>
                  {/* Real subscribed authors */}
                  {subscribedAuthors.map((author) => (
                    <div
                      key={author.userId}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setShowSubscriptionsPopup(false);
                        handleAuthorClick(author);
                      }}
                    >
                      <img
                        src={author.avatar || profileDefaultAvatar}
                        alt={`${author.displayName}'s avatar`}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = profileDefaultAvatar;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="[font-family:'Lato',Helvetica] font-semibold text-gray-900 text-sm truncate">
                          {author.displayName}
                        </h4>
                        {author.username && (
                          <span className="[font-family:'Lato',Helvetica] text-gray-500 text-xs truncate block">
                            @{author.username}
                          </span>
                        )}
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <SubscribeButton
                          authorUserId={author.userId}
                          authorName={author.displayName}
                          size="medium"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Sample curator accounts */}
                  {sampleProfiles.map((profile) => (
                    <div
                      key={profile.userId}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <img
                        src={profileDefaultAvatar}
                        alt={`${profile.displayName}'s avatar`}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="[font-family:'Lato',Helvetica] font-semibold text-gray-900 text-sm truncate">
                          {profile.displayName}
                        </h4>
                        <span className="[font-family:'Lato',Helvetica] text-gray-500 text-xs truncate block">
                          @{profile.username}
                        </span>
                      </div>
                      <button
                        className="[font-family:'Lato',Helvetica] font-normal text-sm leading-none rounded-[50px] px-3 h-8 flex items-center justify-center gap-1.5 transition-colors flex-shrink-0"
                        style={{ backgroundColor: '#ffffff', color: '#059669', border: '1px solid #059669' }}
                      >
                        Subscribed
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {/* Treasuries list */}
                  {sampleTreasuries.map((treasury) => (
                    <div
                      key={treasury.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setShowSubscriptionsPopup(false);
                        navigate(`/treasury/${treasury.namespace}`);
                      }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="[font-family:'Lato',Helvetica] font-semibold text-gray-900 text-sm truncate">
                          {treasury.name}
                        </h4>
                        <span className="[font-family:'Lato',Helvetica] text-gray-500 text-xs truncate block">
                          by @{treasury.authorUsername}
                        </span>
                      </div>
                      <button
                        className="[font-family:'Lato',Helvetica] font-normal text-sm leading-none rounded-[50px] px-3 h-8 flex items-center justify-center gap-1.5 transition-colors flex-shrink-0"
                        style={{ backgroundColor: '#ffffff', color: '#059669', border: '1px solid #059669' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Subscribed
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
