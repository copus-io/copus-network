import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import { useToast } from "../../../components/ui/toast";
import { Card, CardContent } from "../../../components/ui/card";
import SubscribeButton from "../../../components/SubscribeButton/SubscribeButton";
import { ArticleCard } from "../../../components/ArticleCard";
import type { ArticleData } from "../../../components/ArticleCard";
// OPTIMIZATION: Lazy load heavy components
const CollectTreasureModal = React.lazy(() => import("../../../components/CollectTreasureModal").then(module => ({ default: module.CollectTreasureModal })));
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
  const { user, getArticleLikeState, updateArticleLikeState } = useUser();
  const navigate = useNavigate();
  const [subscribedAuthors, setSubscribedAuthors] = useState<SubscribedAuthor[]>([]);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [followedSpaces, setFollowedSpaces] = useState<any[]>([]);
  const [treasuriesLoading, setTreasuriesLoading] = useState(false);
  const [spacesCache, setSpacesCache] = useState<{data: any[], timestamp: number} | null>(null);

  // Collect Treasure Modal state
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<{ uuid: string; title: string; isLiked: boolean; likeCount: number } | null>(null);

  // Handle article like/treasure functionality
  const handleLike = useCallback((uuid: string, currentLikeState: boolean, currentLikeCount: number, title?: string) => {
    if (!user) {
      showToast('Please log in to collect treasures', 'error');
      return;
    }

    setSelectedArticle({
      uuid,
      title: title || '',
      isLiked: currentLikeState,
      likeCount: currentLikeCount
    });
    setCollectModalOpen(true);
  }, [user, showToast]);

  // Handle user click navigation
  const handleUserClick = useCallback((userId?: number, userNamespace?: string, userName?: string) => {
    if (!userId && !userNamespace && !userName) return;

    // Use namespace for routing if available (preferred)
    if (userNamespace) {
      navigate(`/u/${userNamespace}`);
    } else if (userName) {
      navigate(`/u/${userName}`);
    } else {
      navigate(`/user/${userId}`);
    }
  }, [navigate]);

  // OPTIMIZATION: Memoized skeleton component for better performance
  const SubscriptionsSkeleton = useMemo(() => {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex space-x-4 items-center p-4">
              <div className="rounded-full bg-gray-300 h-10 w-10"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, []);

  // Handle collect success callback
  const handleCollectSuccess = useCallback((uuid: string, newLikeState: boolean, newLikeCount: number) => {
    // Update both followedArticles and selectedAuthorArticles if applicable
    setFollowedArticles(prevArticles =>
      prevArticles.map(article =>
        article.uuid === uuid
          ? { ...article, isLiked: newLikeState, treasureCount: newLikeCount }
          : article
      )
    );

    if (selectedAuthorFilter) {
      setSelectedAuthorArticles(prevArticles =>
        prevArticles.map(article =>
          article.uuid === uuid
            ? { ...article, isLiked: newLikeState, treasureCount: newLikeCount }
            : article
        )
      );
    }

    // Update user state for consistency
    updateArticleLikeState?.(uuid, newLikeState, newLikeCount);
  }, [selectedAuthorFilter, updateArticleLikeState]);

  // Unified space name processing logic - same as ChooseTreasuriesModal
  const getSpaceDisplayName = useCallback((space: any, spaceOwnerUsername?: string) => {
    let spaceTypeNum = space.spaceType;
    if (spaceTypeNum === undefined || spaceTypeNum === null) {
      if (space.name === 'Default Collections Space') {
        spaceTypeNum = 1;
      } else if (space.name === 'Default Curations Space') {
        spaceTypeNum = 2;
      } else {
        spaceTypeNum = 0; // Custom space
      }
    } else if (typeof spaceTypeNum === 'string') {
      spaceTypeNum = parseInt(spaceTypeNum, 10);
    }

    // For default spaces, show "Username's Treasury" or "Username's Curations"
    if (spaceTypeNum === 1) {
      return `${spaceOwnerUsername || 'Anonymous'}'s Treasury`;
    } else if (spaceTypeNum === 2) {
      return `${spaceOwnerUsername || 'Anonymous'}'s Curations`;
    } else {
      return space.name || space.namespace || 'Untitled Treasury';
    }
  }, []);

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

  // Fetch all followed data from APIs - OPTIMIZED: Parallel requests
  useEffect(() => {
    const controller = new AbortController();

    const fetchFollowedData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // OPTIMIZATION: Parallel API calls instead of serial
        const [followedUsers] = await Promise.all([
          AuthService.getFollowedUsers(),
          loadFollowedArticles(1, true)
        ]);

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
        setFollowedArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowedData();

    // Cleanup function
    return () => {
      controller.abort();
    };
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
      const response = await AuthService.getPageMyFollowedArticle(page, pageSize);
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
        setHasMoreArticles(false);
      }
    } catch (error) {
      console.error('❌ Failed to fetch followed articles:', error);
      if (isInitial) {
        setFollowedArticles([]);
      }
      setHasMoreArticles(false);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [user?.id, isLoadingMore, hasMoreArticles]);

  // Scroll to load more logic - same as Discovery page
  useEffect(() => {
    const handleScroll = () => {
      // Only trigger for general articles (not when filtering by author)
      if (selectedAuthorFilter) return;

      // Check if scrolled near the bottom of the page
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrolledToBottom = scrollTop + windowHeight >= documentHeight - 1000; // Trigger 1000px early - same as Discovery

      if (scrolledToBottom && hasMoreArticles && !isLoadingMore) {
        console.log('🔄 Loading more articles, page:', currentPage + 1);
        loadFollowedArticles(currentPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMoreArticles, isLoadingMore, loadFollowedArticles, currentPage, selectedAuthorFilter]);

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
      // Call API with userId to filter by author on server side
      const response = await AuthService.getPageMyFollowedArticle(page, pageSize, undefined, author.userId);
      console.log(`✅ Author articles page ${page} (server-side filtered for ${author.displayName}):`, response);

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

  // Scroll to load more logic for author articles - same as Discovery page
  useEffect(() => {
    const handleAuthorScroll = () => {
      // Only trigger when filtering by author
      if (!selectedAuthorFilter) return;

      // Check if scrolled near the bottom of the page
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrolledToBottom = scrollTop + windowHeight >= documentHeight - 1000; // Trigger 1000px early - same as Discovery

      if (scrolledToBottom && authorHasMoreArticles && !isLoadingMoreAuthor && selectedAuthorFilter) {
        console.log('🔄 Loading more author articles, page:', authorCurrentPage + 1);
        loadAuthorArticles(selectedAuthorFilter, authorCurrentPage + 1);
      }
    };

    window.addEventListener('scroll', handleAuthorScroll);
    return () => {
      window.removeEventListener('scroll', handleAuthorScroll);
    };
  }, [selectedAuthorFilter, authorCurrentPage, isLoadingMoreAuthor, authorHasMoreArticles, loadAuthorArticles]);

  // Handle switching to treasuries tab - OPTIMIZED: With caching
  const handleTreasuriesTabClick = async () => {
    setPopupTab('treasuries');

    // Load followed spaces data when switching to treasuries tab
    if (!user?.id || treasuriesLoading) return;

    // OPTIMIZATION: Use cache if data is less than 5 minutes old
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    if (spacesCache && (now - spacesCache.timestamp) < CACHE_DURATION) {
      console.log('✅ Using cached spaces data');
      setFollowedSpaces(spacesCache.data);
      return;
    }

    try {
      setTreasuriesLoading(true);
      const response = await AuthService.getFollowedSpaces();
      console.log('✅ Fetched followed spaces:', response);

      // Parse response
      let spacesArray: any[] = [];
      if (Array.isArray(response)) {
        spacesArray = response;
      } else if (response?.data && Array.isArray(response.data)) {
        spacesArray = response.data;
      }

      // OPTIMIZATION: Cache the data
      setSpacesCache({ data: spacesArray, timestamp: now });
      setFollowedSpaces(spacesArray);
    } catch (error) {
      console.error('❌ Failed to fetch followed spaces:', error);
      showToast('Failed to load followed treasuries', 'error');
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
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-red text-white rounded-full font-semibold hover:bg-red/90 transition-colors [font-family:'Lato',Helvetica]"
          >
            Login Now
          </button>
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
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-[15px] px-5 h-[35px] bg-white text-red border border-red rounded-[50px] hover:bg-[#F23A001A] transition-all duration-300 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 30 24" fill="currentColor">
                <path d="M20.9584 0.5C18.7483 0.5 16.6439 1.51341 14.9932 3.35382C13.4004 1.57781 11.3199 0.5 9.04161 0.5C4.05525 0.5 0 5.65856 0 12C0 18.3414 4.05525 23.5 9.04161 23.5C11.3199 23.5 13.4038 22.4222 14.9932 20.6462C16.6405 22.49 18.7381 23.5 20.9584 23.5C25.9447 23.5 30 18.3414 30 12C30 5.65856 25.9447 0.5 20.9584 0.5ZM1.02319 12C1.02319 6.22119 4.62142 1.5168 9.04161 1.5168C13.4618 1.5168 17.06 6.2178 17.06 12C17.06 13.1049 16.927 14.1726 16.6849 15.1724C16.6405 12.749 15.5184 10.7561 13.7278 10.3087C11.395 9.72576 8.80286 11.9932 7.9502 15.3622C7.54775 16.9586 7.58527 18.5685 8.05593 19.8971C8.48567 21.1139 9.2326 21.9748 10.1876 22.3714C9.81241 22.4425 9.43042 22.4798 9.04502 22.4798C4.61801 22.4832 1.02319 17.7788 1.02319 12ZM15.6446 19.8429C17.1555 17.7856 18.0832 15.0301 18.0832 12C18.0832 8.96994 17.1555 6.21441 15.6446 4.15709C17.1146 2.45564 18.9973 1.5168 20.9584 1.5168C25.3786 1.5168 28.9768 6.2178 28.9768 12C28.9768 13.2439 28.8097 14.4369 28.5027 15.5452C28.5709 12.9558 27.425 10.7798 25.5457 10.3121C23.2128 9.72915 20.6207 11.9966 19.7681 15.3656C18.97 18.5211 19.9795 21.541 22.0293 22.3883C21.678 22.4493 21.3199 22.4866 20.955 22.4866C18.9904 22.4832 17.1146 21.5477 15.6446 19.8429Z"/>
              </svg>
              <span className="[font-family:'Lato',Helvetica] font-bold text-[16px] leading-5">
                Discover
              </span>
            </button>
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
                  No treasures from {selectedAuthorFilter.displayName}
                </h3>
                <p className="text-medium-grey text-sm mb-6 [font-family:'Lato',Helvetica]">
                  This author hasn't published any treasures in your subscribed content yet
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
                    onLike={handleLike}
                    onUserClick={handleUserClick}
                  />
                ))}
              </div>

              {/* Loading indicator - same style as Discovery page */}
              {isLoadingMoreAuthor && (
                <div className="flex justify-center items-center py-8">
                  <div className="text-lg text-gray-600">Loading more content...</div>
                </div>
              )}

              {/* No more content hint - same style as Discovery page */}
              {selectedAuthorFilter && !isLoadingMoreAuthor && !authorHasMoreArticles && selectedAuthorArticles.length > 0 && (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-500">You've reached the bottom! No more content to load.</div>
                </div>
              )}
            </>
          )
        ) : followedArticles.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-normal text-medium-grey mb-2 [font-family:'Lato',Helvetica]">
                No subscribed treasures yet
              </h3>
              <p className="text-medium-grey text-sm mb-6 [font-family:'Lato',Helvetica]">
                Subscribe to some authors and treasuries to see their latest treasures here
              </p>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-[15px] px-5 h-[35px] bg-white text-red border border-red rounded-[50px] hover:bg-[#F23A001A] transition-all duration-300 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 30 24" fill="currentColor">
                  <path d="M20.9584 0.5C18.7483 0.5 16.6439 1.51341 14.9932 3.35382C13.4004 1.57781 11.3199 0.5 9.04161 0.5C4.05525 0.5 0 5.65856 0 12C0 18.3414 4.05525 23.5 9.04161 23.5C11.3199 23.5 13.4038 22.4222 14.9932 20.6462C16.6405 22.49 18.7381 23.5 20.9584 23.5C25.9447 23.5 30 18.3414 30 12C30 5.65856 25.9447 0.5 20.9584 0.5ZM1.02319 12C1.02319 6.22119 4.62142 1.5168 9.04161 1.5168C13.4618 1.5168 17.06 6.2178 17.06 12C17.06 13.1049 16.927 14.1726 16.6849 15.1724C16.6405 12.749 15.5184 10.7561 13.7278 10.3087C11.395 9.72576 8.80286 11.9932 7.9502 15.3622C7.54775 16.9586 7.58527 18.5685 8.05593 19.8971C8.48567 21.1139 9.2326 21.9748 10.1876 22.3714C9.81241 22.4425 9.43042 22.4798 9.04502 22.4798C4.61801 22.4832 1.02319 17.7788 1.02319 12ZM15.6446 19.8429C17.1555 17.7856 18.0832 15.0301 18.0832 12C18.0832 8.96994 17.1555 6.21441 15.6446 4.15709C17.1146 2.45564 18.9973 1.5168 20.9584 1.5168C25.3786 1.5168 28.9768 6.2178 28.9768 12C28.9768 13.2439 28.8097 14.4369 28.5027 15.5452C28.5709 12.9558 27.425 10.7798 25.5457 10.3121C23.2128 9.72915 20.6207 11.9966 19.7681 15.3656C18.97 18.5211 19.9795 21.541 22.0293 22.3883C21.678 22.4493 21.3199 22.4866 20.955 22.4866C18.9904 22.4832 17.1146 21.5477 15.6446 19.8429Z"/>
                </svg>
                <span className="[font-family:'Lato',Helvetica] font-bold text-[16px] leading-5">
                  Discover
                </span>
              </button>
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
                  onLike={handleLike}
                  onUserClick={handleUserClick}
                />
              ))}
            </div>

            {/* Loading indicator - same style as Discovery page */}
            {isLoadingMore && (
              <div className="flex justify-center items-center py-8">
                <div className="text-lg text-gray-600">Loading more content...</div>
              </div>
            )}

            {/* No more content hint - same style as Discovery page */}
            {!selectedAuthorFilter && !isLoadingMore && !hasMoreArticles && followedArticles.length > 0 && (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">You've reached the bottom! No more content to load.</div>
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
                        No subscribed curators yet
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
                          {getSpaceDisplayName(space, space.userInfo?.username)}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {space.followerCount !== undefined && (
                            <span className="[font-family:'Lato',Helvetica]">
                              {space.followerCount} subscribers
                            </span>
                          )}
                          {space.articleCount !== undefined && (
                            <span className="[font-family:'Lato',Helvetica]">
                              {space.articleCount} treasures
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
                            No subscribed treasuries yet
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

      {/* Collect Treasure Modal - OPTIMIZED: Lazy loaded */}
      {collectModalOpen && (
        <React.Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="text-white">Loading...</div></div>}>
          <CollectTreasureModal
            isOpen={collectModalOpen}
            onClose={() => {
              setCollectModalOpen(false);
              setSelectedArticle(null);
            }}
            articleUuid={selectedArticle?.uuid || ''}
            articleTitle={selectedArticle?.title || ''}
            initialIsLiked={selectedArticle?.isLiked || false}
            initialLikeCount={selectedArticle?.likeCount || 0}
            onSuccess={handleCollectSuccess}
          />
        </React.Suspense>
      )}

    </div>
  );
};
