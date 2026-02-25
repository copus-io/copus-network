import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import { useToast } from "../../../components/ui/toast";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import SubscribeButton from "../../../components/SubscribeButton/SubscribeButton";
import { ArticleCard } from "../../../components/ArticleCard";
import type { ArticleData } from "../../../components/ArticleCard";
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
  namespace?: string; // Add namespace for proper routing
}


interface FollowingAuthorSectionProps {
  showSubscriptionsPopup: boolean;
  setShowSubscriptionsPopup: (show: boolean) => void;
}

export const FollowingAuthorSection = ({ showSubscriptionsPopup, setShowSubscriptionsPopup }: FollowingAuthorSectionProps): JSX.Element => {
  const { showToast } = useToast();
  const { user } = useUser();
  const navigate = useNavigate();
  const [subscribedAuthors, setSubscribedAuthors] = useState<SubscribedAuthor[]>([]);
  const [followedSpaces, setFollowedSpaces] = useState<any[]>([]);
  const [followedArticles, setFollowedArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [popupTab, setPopupTab] = useState<'curator' | 'treasuries'>('curator');
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<SubscribedAuthor | null>(null);
  const [selectedAuthorArticles, setSelectedAuthorArticles] = useState<ArticleData[]>([]);
  const [loadingAuthorArticles, setLoadingAuthorArticles] = useState(false);
  const [authorCurrentPage, setAuthorCurrentPage] = useState(1);
  const [authorHasMoreArticles, setAuthorHasMoreArticles] = useState(true);
  const [isLoadingMoreAuthor, setIsLoadingMoreAuthor] = useState(false);
  const authorLoadingElementRef = useRef<HTMLDivElement | null>(null);
  const authorObserverRef = useRef<IntersectionObserver | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingElementRef = useRef<HTMLDivElement | null>(null);
  const [treasuriesLoading, setTreasuriesLoading] = useState(false);

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

  // Fetch all followed data from APIs
  useEffect(() => {
    const fetchFollowedData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch followed users
        // 🔍 SEARCH: api-followed-users-fix-needed
        // NOTE: API should not return current user in followed users list
        // This is a temporary client-side fix until API is corrected
        const followedUsers = await AuthService.getFollowedUsers();

        // Fetch followed spaces
        const followedSpacesData = await AuthService.getFollowedSpaces();
        console.log('✅ Fetched followed spaces from API:', followedSpacesData);
        setFollowedSpaces(followedSpacesData);

        // Load initial articles with pagination support
        await loadFollowedArticles(1, true);

        // Transform followed users to SubscribedAuthor format
        // Filter out current user (defensive programming)
        const filteredUsers = followedUsers.filter((followedUser) => {
          // Convert both to numbers for comparison to handle string vs number type issues
          const followedUserId = Number(followedUser?.id);
          const currentUserId = Number(user?.id);

          const hasValidData = followedUser?.id && followedUser?.username;
          const isNotCurrentUser = followedUserId !== currentUserId;
          return hasValidData && isNotCurrentUser;
        });

        const authorsArray: SubscribedAuthor[] = filteredUsers
          .map((user) => ({
            userId: user.id!,
            username: user.username!,
            displayName: user.username!,
            avatar: user.faceUrl || profileDefaultAvatar,
            bio: user.bio || '',
            spacesCount: 0, // Will be updated when we fetch their spaces
            totalArticles: 0, // Will be calculated if needed
            newArticlesSinceLastVisit: 0,
            lastUpdated: new Date().toISOString(),
            emailFrequency: 'DAILY' as const,
            subscriptionInfo: {
              subscriptionId: `api_${user.id}`,
              authorUserId: user.id!,
              emailFrequency: 'DAILY' as const,
              isActive: true,
              subscribedAt: new Date().toISOString(),
            } as SubscriptionInfo,
            spaces: [],
            namespace: user.namespace, // Store namespace from API for routing
          }));

        console.log('✅ Transformed authors array:', authorsArray);

        // No need to fetch spaces for each author - removed unnecessary API calls
        setSubscribedAuthors(authorsArray);
      } catch (error) {
        console.error('Failed to fetch followed data:', error);
        showToast('Failed to load followed content', 'error');
        // Set empty arrays on error - no fallback to mock data
        setSubscribedAuthors([]);
        setFollowedSpaces([]);
        setFollowedArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowedData();
  }, [user?.id, showToast, refreshTrigger]);

  // Load followed articles with pagination
  const loadFollowedArticles = useCallback(async (page: number, isInitial = false) => {
    if (!user?.id || (!isInitial && isLoadingMore) || (!isInitial && !hasMoreArticles)) return;

    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const pageSize = 30; // Load 30 articles per page
      const response = await AuthService.getPageMyFollowedArticle(page, pageSize, undefined, user.id);
      console.log(`✅ Fetched followed articles page ${page}:`, response);

      // Transform API data to ArticleData format
      const responseData = response?.data;
      let articleData: any[] = [];
      let totalCount = 0;
      let pageCount = 0;

      if (Array.isArray(response)) {
        articleData = response;
      } else if (responseData) {
        articleData = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : []);
        totalCount = responseData.totalCount || 0;
        pageCount = responseData.pageCount || 0;
      }

      if (Array.isArray(articleData)) {
        const transformedArticles: ArticleData[] = articleData.map((article: any) => ({
          id: article.id?.toString() || article.uuid || `article_${Date.now()}_${Math.random()}`,
          uuid: article.uuid,
          title: article.title || 'Untitled',
          description: article.content || '',
          coverImage: article.coverUrl || '',
          category: 'General',
          categoryColor: '#666666',
          userName: article.authorInfo?.username || 'Unknown Author',
          userAvatar: article.authorInfo?.faceUrl || '',
          userId: article.authorInfo?.id,
          userNamespace: article.authorInfo?.namespace,
          date: new Date((article.publishAt || article.createAt || Date.now()) * 1000).toISOString(),
          treasureCount: article.likeCount || 0,
          visitCount: article.viewCount || 0,
          commentCount: article.commentCount || 0,
          isLiked: article.isLiked || false,
          targetUrl: article.targetUrl,
          website: article.targetUrl ? (() => {
            try {
              return new URL(article.targetUrl).hostname;
            } catch {
              return undefined;
            }
          })() : undefined,
          isPaymentRequired: article.targetUrlIsLocked || false,
          paymentPrice: article.priceInfo?.price?.toString(),
          visibility: article.visibility
        }));

        console.log('✅ Transformed articles:', {
          page,
          articlesCount: transformedArticles.length,
          totalCount,
          pageCount,
          hasMore: pageCount > 0 ? page < pageCount : transformedArticles.length === pageSize
        });

        if (isInitial) {
          setFollowedArticles(transformedArticles);
        } else {
          setFollowedArticles(prev => [...prev, ...transformedArticles]);
        }

        // Check if there are more pages
        const hasMore = pageCount > 0 ? page < pageCount : transformedArticles.length === pageSize;
        setHasMoreArticles(hasMore);
        setCurrentPage(page);
      } else {
        console.log('❌ No article data found in response');
        if (isInitial) {
          setFollowedArticles([]);
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch followed articles:', error);
      if (isInitial) {
        setFollowedArticles([]);
      }
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [user?.id, isLoadingMore, hasMoreArticles]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadingElementRef.current || !hasMoreArticles || selectedAuthorFilter) return;

    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingMore && hasMoreArticles && !selectedAuthorFilter) {
          console.log('🔄 Loading more author articles, page:', currentPage + 1);
          loadFollowedArticles(currentPage + 1);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px'
      }
    );

    // Start observing
    observerRef.current.observe(loadingElementRef.current);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [currentPage, isLoadingMore, hasMoreArticles, selectedAuthorFilter, loadFollowedArticles]);

  const handleAuthorClick = (author: SubscribedAuthor) => {
    // Use namespace for routing if available, otherwise fallback to username
    if (author.namespace) {
      navigate(`/u/${author.namespace}`);
    } else if (author.username) {
      navigate(`/u/${author.username}`);
    } else {
      navigate(`/user/${author.userId}`);
    }
  };

  // Handle author filter click - call API to get author's articles
  const handleAuthorFilterClick = async (author: SubscribedAuthor) => {
    // If clicking the same author, deselect
    if (selectedAuthorFilter?.userId === author.userId) {
      setSelectedAuthorFilter(null);
      setSelectedAuthorArticles([]);
      return;
    }

    // Select new author and fetch their articles
    setSelectedAuthorFilter(author);
    if (!user?.id) return;

    try {
      setLoadingAuthorArticles(true);
      console.log('🔍 Fetching articles for author:', author.displayName, 'userId:', author.userId);

      // Reset pagination for new author
      setAuthorCurrentPage(1);
      setAuthorHasMoreArticles(true);

      // Load first page of author's articles
      await loadAuthorArticles(author, 1, true);
    } catch (error) {
      console.error('❌ Failed to fetch author articles:', error);
      setSelectedAuthorArticles([]);
      setAuthorHasMoreArticles(false);
    } finally {
      setLoadingAuthorArticles(false);
    }
  };

  // Load author articles with pagination
  const loadAuthorArticles = useCallback(async (author: SubscribedAuthor, page: number, isInitial = false) => {
    if (!user?.id || (!isInitial && isLoadingMoreAuthor) || (!isInitial && !authorHasMoreArticles)) return;

    try {
      if (isInitial) {
        setLoadingAuthorArticles(true);
      } else {
        setIsLoadingMoreAuthor(true);
      }

      const pageSize = 30; // Same as general articles
      const response = await AuthService.getPageMyFollowedArticle(page, pageSize, undefined, author.userId);
      console.log(`✅ Author ${author.displayName} articles page ${page}:`, response);

      // Transform API response to ArticleData format
      const responseData = response?.data;
      let articleData: any[] = [];
      let totalCount = 0;
      let pageCount = 0;

      if (Array.isArray(response)) {
        articleData = response;
      } else if (responseData) {
        articleData = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : []);
        totalCount = responseData.totalCount || 0;
        pageCount = responseData.pageCount || 0;
      }

      if (Array.isArray(articleData)) {
        const transformedArticles: ArticleData[] = articleData.map((article: any) => ({
          id: article.id?.toString() || article.uuid || `article_${Date.now()}_${Math.random()}`,
          uuid: article.uuid,
          title: article.title || 'Untitled',
          description: article.content || '',
          coverImage: article.coverUrl || '',
          category: 'General',
          categoryColor: '#666666',
          userName: article.authorInfo?.username || 'Unknown Author',
          userAvatar: article.authorInfo?.faceUrl || '',
          userId: article.authorInfo?.id,
          userNamespace: article.authorInfo?.namespace,
          date: new Date((article.publishAt || article.createAt || Date.now()) * 1000).toISOString(),
          treasureCount: article.likeCount || 0,
          visitCount: article.viewCount || 0,
          commentCount: article.commentCount || 0,
          isLiked: article.isLiked || false,
          targetUrl: article.targetUrl,
          website: article.targetUrl ? (() => {
            try {
              return new URL(article.targetUrl).hostname;
            } catch {
              return undefined;
            }
          })() : undefined,
          isPaymentRequired: article.targetUrlIsLocked || false,
          paymentPrice: article.priceInfo?.price?.toString(),
          visibility: article.visibility
        }));

        console.log('✅ Author articles transformed:', {
          page,
          articlesCount: transformedArticles.length,
          totalCount,
          pageCount,
          hasMore: pageCount > 0 ? page < pageCount : transformedArticles.length === pageSize
        });

        if (isInitial) {
          setSelectedAuthorArticles(transformedArticles);
        } else {
          setSelectedAuthorArticles(prev => [...prev, ...transformedArticles]);
        }

        // Check if there are more pages for this author
        const hasMore = pageCount > 0 ? page < pageCount : transformedArticles.length === pageSize;
        setAuthorHasMoreArticles(hasMore);
        setAuthorCurrentPage(page);
      } else {
        console.log('❌ No author articles found in response');
        if (isInitial) {
          setSelectedAuthorArticles([]);
        }
        setAuthorHasMoreArticles(false);
      }
    } catch (error) {
      console.error('❌ Failed to fetch author articles:', error);
      if (isInitial) {
        setSelectedAuthorArticles([]);
      }
      setAuthorHasMoreArticles(false);
    } finally {
      setLoadingAuthorArticles(false);
      setIsLoadingMoreAuthor(false);
    }
  }, [user?.id, isLoadingMoreAuthor, authorHasMoreArticles]);

  // Intersection Observer for author articles infinite scroll
  useEffect(() => {
    if (!authorLoadingElementRef.current || !authorHasMoreArticles || !selectedAuthorFilter) return;

    // Disconnect previous observer
    if (authorObserverRef.current) {
      authorObserverRef.current.disconnect();
    }

    // Create new observer for author articles
    authorObserverRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingMoreAuthor && authorHasMoreArticles && selectedAuthorFilter) {
          console.log('🔄 Loading more author articles, page:', authorCurrentPage + 1);
          loadAuthorArticles(selectedAuthorFilter, authorCurrentPage + 1);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px'
      }
    );

    // Start observing
    authorObserverRef.current.observe(authorLoadingElementRef.current);

    // Cleanup
    return () => {
      if (authorObserverRef.current) {
        authorObserverRef.current.disconnect();
      }
    };
  }, [selectedAuthorFilter, authorCurrentPage, isLoadingMoreAuthor, authorHasMoreArticles, loadAuthorArticles]);

  // Handle switching to treasuries tab and fetch fresh data
  const handleTreasuriesTabClick = async () => {
    setPopupTab('treasuries');
    if (!user?.id) return;

    try {
      setTreasuriesLoading(true);
      console.log('🔍 Fetching fresh followed spaces for Treasuries tab...');
      const freshFollowedSpaces = await AuthService.getFollowedSpaces();
      console.log('✅ Fresh followed spaces loaded:', freshFollowedSpaces);
      setFollowedSpaces(freshFollowedSpaces);
    } catch (error) {
      console.error('❌ Failed to fetch fresh followed spaces:', error);
    } finally {
      setTreasuriesLoading(false);
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
            <h3 className="text-lg font-normal text-medium-grey mb-4 [font-family:'Lato',Helvetica]">
              No subscribed curators or treasuries yet
            </h3>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="lg"
              className="px-6 py-3 rounded-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Discovery
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
            {/* Removed "My profile card" - users shouldn't see themselves in their following list */}

            {/* Subscribed author cards */}
            {subscribedAuthors.map((author) => (
              <Card
                key={author.userId}
                className={`w-44 flex-shrink-0 cursor-pointer transition-colors ${
                  selectedAuthorFilter?.userId === author.userId
                    ? 'bg-gray-100 border-gray-400'
                    : 'bg-white border border-gray-200'
                }`}
                onClick={() => handleAuthorFilterClick(author)}
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
                      {(author.namespace || author.username) && (
                        <span className="[font-family:'Lato',Helvetica] text-gray-500 text-xs truncate block">
                          @{author.namespace || author.username}
                        </span>
                      )}
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

      {/* Grey divider - only show when there are authors */}
      {!loading && subscribedAuthors.length > 0 && (
        <div className="w-full px-2.5 lg:pl-2.5 lg:pr-0 my-6">
          <div className="border-t border-gray-200" />
        </div>
      )}

      {/* Content section - only show when there are authors */}
      {!loading && subscribedAuthors.length > 0 && (
      <section className="w-full px-2.5 lg:pl-2.5 lg:pr-0">
        {selectedAuthorFilter && (
          <div className="flex items-center gap-2 mb-4">
            <span className="[font-family:'Lato',Helvetica] text-sm text-gray-500">
              Showing content from <span className="font-semibold text-gray-900">{selectedAuthorFilter.displayName}</span>
            </span>
            <button
              onClick={() => {
                setSelectedAuthorFilter(null);
                setSelectedAuthorArticles([]);
                setAuthorCurrentPage(1);
                setAuthorHasMoreArticles(true);
                // Disconnect author observer when clearing filter
                if (authorObserverRef.current) {
                  authorObserverRef.current.disconnect();
                }
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        {loadingAuthorArticles ? (
          <div className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 lg:gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="w-full bg-white rounded-lg animate-pulse">
                <div className="p-4">
                  <div className="w-full aspect-video bg-gray-200 rounded-lg mb-4" />
                  <div className="h-6 bg-gray-200 rounded mb-2 w-3/4" />
                  <div className="h-4 bg-gray-200 rounded mb-4 w-full" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : selectedAuthorFilter ? (
          // Show selected author's articles
          selectedAuthorArticles.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-normal text-medium-grey mb-2 [font-family:'Lato',Helvetica]">
                  No articles from {selectedAuthorFilter.displayName}
                </h3>
                <p className="text-medium-grey text-sm mb-6 [font-family:'Lato',Helvetica]">
                  This author hasn't published any articles in your followed content yet
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 lg:gap-8">
                {selectedAuthorArticles.map((article) => (
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

              {/* Infinite scroll loading indicator for author articles */}
              {selectedAuthorFilter && authorHasMoreArticles && (
                <div
                  ref={authorLoadingElementRef}
                  className="flex justify-center items-center py-8 mt-4"
                >
                  {isLoadingMoreAuthor ? (
                    <div className="flex items-center gap-3 text-gray-500">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      <span>Loading more articles from {selectedAuthorFilter.displayName}...</span>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      Scroll to load more from {selectedAuthorFilter.displayName}
                    </div>
                  )}
                </div>
              )}

              {selectedAuthorFilter && !authorHasMoreArticles && selectedAuthorArticles.length > 0 && (
                <div className="flex justify-center py-8 mt-4">
                  <span className="text-gray-400 text-sm">You've seen all articles from {selectedAuthorFilter.displayName}</span>
                </div>
              )}
            </>
          )
        ) : followedArticles.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-normal text-medium-grey mb-2 [font-family:'Lato',Helvetica]">
                No followed articles yet
              </h3>
              <p className="text-medium-grey text-sm mb-6 [font-family:'Lato',Helvetica]">
                Follow some authors and spaces to see their latest articles here
              </p>
              <Button
                onClick={() => navigate('/')}
                variant="copus"
                size="lg"
                className="px-6 py-3 rounded-full"
              >
                Discover Content
              </Button>
            </div>
          </div>
        ) : (
          // Show all followed articles when no author is selected
          <>
            <div className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 lg:gap-8">
              {followedArticles.map((article) => (
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

            {/* Infinite scroll loading indicator for general articles */}
            {!selectedAuthorFilter && hasMoreArticles && (
              <div
                ref={loadingElementRef}
                className="flex justify-center items-center py-8 mt-4"
              >
                {isLoadingMore ? (
                  <div className="flex items-center gap-3 text-gray-500">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>Loading more articles...</span>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">
                    Scroll to load more articles
                  </div>
                )}
              </div>
            )}

            {!selectedAuthorFilter && !hasMoreArticles && followedArticles.length > 0 && (
              <div className="flex justify-center py-8 mt-4">
                <span className="text-gray-400 text-sm">You've reached the end of your followed articles</span>
              </div>
            )}
          </>
        )}
      </section>
      )}

      {/* My Subscriptions Popup */}
      {showSubscriptionsPopup && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSubscriptionsPopup(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-lg h-[70vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="flex justify-end px-5 pt-4">
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

            {/* Popup header */}
            <div className="px-5 pb-1">
              <h2 className="[font-family:'Lato',Helvetica] font-medium text-off-black text-2xl tracking-[0] leading-[33.6px]">
                My Subscriptions
              </h2>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 px-5 pt-1 pb-1.5">
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
                onClick={handleTreasuriesTabClick}
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
            <div className="overflow-y-auto px-5 py-3 flex flex-col gap-2 flex-1">
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
                        {(author.namespace || author.username) && (
                          <span className="[font-family:'Lato',Helvetica] text-gray-500 text-xs truncate block">
                            @{author.namespace || author.username}
                          </span>
                        )}
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <SubscribeButton
                          authorUserId={author.userId}
                          authorName={author.displayName}
                          size="medium"
                          initialIsSubscribed={true} // Since this is the followed users list
                          onSubscriptionChange={() => {
                            // Refresh data when subscription status changes
                            setRefreshTrigger(prev => prev + 1);
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Show message if no followed authors */}
                  {subscribedAuthors.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="[font-family:'Lato',Helvetica] text-sm text-gray-400">
                        No followed authors yet
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Loading state for treasuries */}
                  {treasuriesLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="[font-family:'Lato',Helvetica] text-sm text-gray-400">
                        Loading treasuries...
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Real followed spaces */}
                      {followedSpaces.map((space) => (
                    <div
                      key={space.id || space.namespace}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setShowSubscriptionsPopup(false);
                        navigate(`/treasury/${space.namespace}`);
                      }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {(space.faceUrl || space.coverUrl) ? (
                          <img
                            src={space.faceUrl || space.coverUrl}
                            alt={`${space.name} avatar`}
                            className="w-full h-full rounded-lg object-cover"
                            onError={(e) => {
                              const svgFallback = (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                </svg>
                              );
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = e.target.parentElement;
                              if (parent) {
                                parent.innerHTML = svgFallback;
                              }
                            }}
                          />
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="[font-family:'Lato',Helvetica] font-semibold text-gray-900 text-sm truncate">
                          {space.name || space.namespace}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {space.followerCount !== undefined && (
                            <span className="[font-family:'Lato',Helvetica]">
                              {space.followerCount} followers
                            </span>
                          )}
                          {space.articleCount !== undefined && (
                            <span className="[font-family:'Lato',Helvetica]">
                              {space.articleCount} articles
                            </span>
                          )}
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <SubscribeButton
                          spaceId={space.id}
                          spaceName={space.name}
                          spaceNamespace={space.namespace}
                          size="medium"
                          subscriptionType="space"
                          initialIsSubscribed={true} // Since this is the followed spaces list
                          initialSubscriberCount={space.followerCount || 0} // Use API data to prevent extra calls
                          onSubscriptionChange={() => {
                            // Refresh data when subscription status changes
                            setRefreshTrigger(prev => prev + 1);
                          }}
                        />
                      </div>
                    </div>
                  ))}

                      {/* Show message if no followed spaces */}
                      {followedSpaces.length === 0 && (
                        <div className="flex-1 flex items-center justify-center">
                          <p className="[font-family:'Lato',Helvetica] text-sm text-gray-400">
                            No followed treasuries yet
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
