import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { useUser } from "../../../contexts/UserContext";
import { useNotification } from "../../../contexts/NotificationContext";
import profileDefaultAvatar from "../../../assets/images/profile-default.svg";
import { MobileMenu } from "../MobileMenu";
import { Menu, X, Search, ChevronLeft } from "lucide-react";
import searchIcon from "../../../assets/images/icon-search.svg";
import { ArticleCard, ArticleData } from "../../ArticleCard";
import { TreasuryCard, SpaceData } from "../../ui/TreasuryCard";
import { getIconUrl } from "../../../config/icons";
import {
  searchAll,
  searchArticles,
  searchSpaces,
  searchUsers,
  SearchArticleItem,
  SearchSpaceItem,
  SearchUserItem,
  SearchResult as SearchResultData,
} from "../../../services/searchService";

interface SearchResultItem {
  id: string;
  title: string;
  type: 'article' | 'user' | 'treasury';
  // Article fields (matching ArticleData)
  description?: string;
  coverImage?: string;
  category?: string;
  categoryColor?: string;
  userName?: string;
  userAvatar?: string;
  userId?: number;
  namespace?: string;
  userNamespace?: string;
  date?: string;
  treasureCount?: number | string;
  visitCount?: string;
  isLiked?: boolean;
  website?: string;
  // User specific fields
  subtitle?: string;
  followersCount?: number;
  articlesCount?: number;
  image?: string;
  // Treasury/Space fields (matching SpaceData)
  spaceData?: SpaceData;
}

type SearchTab = 'all' | 'works' | 'treasuries' | 'users';

interface HeaderSectionProps {
  hideCreateButton?: boolean;
  showDiscoverNow?: boolean;
  hideLoginButton?: boolean;
  articleAuthorId?: string;
}

export const HeaderSection = ({ hideCreateButton = false, showDiscoverNow = false, hideLoginButton = false, articleAuthorId }: HeaderSectionProps): JSX.Element => {
  const { user, logout, isLoggedIn: userIsLoggedIn, loading } = useUser();
  const isLoggedIn = loading
    ? !!(localStorage.getItem('copus_token') || sessionStorage.getItem('copus_token'))
    : userIsLoggedIn;
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResultItem[]>([]);
  // Separate state for each search category
  const [articleResults, setArticleResults] = useState<SearchResultData<SearchArticleItem>>({ items: [], totalCount: 0, pageIndex: 1, pageSize: 10, hasMore: false });
  const [spaceResults, setSpaceResults] = useState<SearchResultData<SearchSpaceItem>>({ items: [], totalCount: 0, pageIndex: 1, pageSize: 10, hasMore: false });
  const [userResults, setUserResults] = useState<SearchResultData<SearchUserItem>>({ items: [], totalCount: 0, pageIndex: 1, pageSize: 10, hasMore: false });
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout failed:', error);
      setShowUserMenu(false);
    }
  };

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('copus_search_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setSearchHistory(parsed);
      } catch (e) {
        console.error('Failed to parse search history');
        setSearchHistory([]);
      }
    } else {
      // No default history - start with empty
      setSearchHistory([]);
    }
  }, []);

  // Auto-open search if ?search=true is in URL (triggered from browser extension)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('search') === 'true') {
      setIsSearchOpen(true);
      // Clean up the URL by removing the search param
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search]);

  // Save search history to localStorage
  const saveSearchHistory = useCallback((history: string[]) => {
    localStorage.setItem('copus_search_history', JSON.stringify(history));
    setSearchHistory(history);
  }, []);

  // Add to search history
  const addToSearchHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(h => h !== query)].slice(0, 10);
      localStorage.setItem('copus_search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  // Remove from search history
  const removeFromSearchHistory = useCallback((query: string) => {
    setSearchHistory(prev => {
      const newHistory = prev.filter(h => h !== query);
      localStorage.setItem('copus_search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const handleAvatarDoubleClick = () => {
    navigate('/setting');
    setShowUserMenu(false);
  };

  // Fetch suggestions - disabled for now, can be enabled with a separate API
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    // Suggestions disabled - search on submit only
    setSuggestions([]);
  }, []);

  // Perform search with real API calls
  const performSearch = useCallback(async (query: string, tab: SearchTab = activeTab) => {
    if (!query.trim()) return;

    addToSearchHistory(query);
    setIsSearching(true);
    setShowResults(true);

    try {
      if (tab === 'all') {
        // Call all three APIs in parallel
        const results = await searchAll({ keyword: query, pageSize: 10 });
        setArticleResults(results.articles);
        setSpaceResults(results.spaces);
        setUserResults(results.users);
      } else if (tab === 'works') {
        const results = await searchArticles({ keyword: query, pageSize: 20 });
        setArticleResults(results);
      } else if (tab === 'treasuries') {
        const results = await searchSpaces({ keyword: query, pageSize: 20 });
        setSpaceResults(results);
      } else if (tab === 'users') {
        const results = await searchUsers({ keyword: query, pageSize: 20 });
        setUserResults(results);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
      setSuggestions([]);
    }
  }, [activeTab, addToSearchHistory]);

  // Load more results for a specific category
  const loadMore = useCallback(async (category: 'works' | 'treasuries' | 'users') => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      if (category === 'works') {
        const nextPage = articleResults.pageIndex + 1;
        const results = await searchArticles({ keyword: searchQuery, pageIndex: nextPage, pageSize: 20 });
        setArticleResults(prev => ({
          ...results,
          items: [...prev.items, ...results.items],
        }));
      } else if (category === 'treasuries') {
        const nextPage = spaceResults.pageIndex + 1;
        const results = await searchSpaces({ keyword: searchQuery, pageIndex: nextPage, pageSize: 20 });
        setSpaceResults(prev => ({
          ...results,
          items: [...prev.items, ...results.items],
        }));
      } else if (category === 'users') {
        const nextPage = userResults.pageIndex + 1;
        const results = await searchUsers({ keyword: searchQuery, pageIndex: nextPage, pageSize: 20 });
        setUserResults(prev => ({
          ...results,
          items: [...prev.items, ...results.items],
        }));
      }
    } catch (error) {
      console.error('Load more failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, articleResults.pageIndex, spaceResults.pageIndex, userResults.pageIndex]);

  // Handle tab change - refetch if switching to a new category
  const handleTabChange = useCallback((newTab: SearchTab) => {
    setActiveTab(newTab);
    if (searchQuery.trim()) {
      // When switching to a specific tab from 'all', fetch more results for that category
      if (newTab !== 'all') {
        performSearch(searchQuery, newTab);
      }
    }
  }, [searchQuery, performSearch]);

  // Debounced search for suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && !showResults) {
        fetchSuggestions(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions, showResults]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        // Don't close if clicking on results or mobile search overlay
        const target = event.target as HTMLElement;
        if (!target.closest('.search-results-container') && !target.closest('.mobile-search-overlay')) {
          setIsSearchOpen(false);
          setSuggestions([]);
        }
      }
    };

    if (showUserMenu || isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, isSearchOpen]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSuggestions([]);
    setArticleResults({ items: [], totalCount: 0, pageIndex: 1, pageSize: 10, hasMore: false });
    setSpaceResults({ items: [], totalCount: 0, pageIndex: 1, pageSize: 10, hasMore: false });
    setUserResults({ items: [], totalCount: 0, pageIndex: 1, pageSize: 10, hasMore: false });
    setShowResults(false);
    setActiveTab('all');
  };

  const searchTabs: { key: SearchTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'works', label: 'Works' },
    { key: 'treasuries', label: 'Treasuries' },
    { key: 'users', label: 'Users' },
  ];

  const handleSuggestionClick = (suggestion: SearchResultItem) => {
    setSearchQuery(suggestion.title);
    performSearch(suggestion.title);
  };

  const handleResultClick = (result: SearchResultItem) => {
    if (result.type === 'article') {
      navigate(`/work/${result.id}`);
    } else if (result.type === 'user') {
      navigate(`/user/${result.namespace || result.id}`);
    } else if (result.type === 'treasury') {
      navigate(`/user/${result.namespace || result.id}`);
    }
    handleCloseSearch();
  };

  return (
    <>
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isLoggedIn={isLoggedIn}
        activeMenuItem={location.pathname === '/create' ? 'curate' : location.pathname.substring(1)}
        userAvatar={user?.faceUrl || user?.avatar}
        username={user?.username}
        userNamespace={user?.namespace}
        onSearchClick={() => setIsSearchOpen(true)}
      />

      {/* Mobile Search Full Screen */}
      {isSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col mobile-search-overlay">
          {/* Search Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <button
              onClick={handleCloseSearch}
              className="text-gray-500 flex-shrink-0"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) {
                    setShowResults(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    performSearch(searchQuery);
                  }
                }}
                placeholder="Search works, treasuries, users..."
                className="flex-1 min-w-0 bg-transparent outline-none text-sm text-dark-grey placeholder-gray-400 [font-family:'Lato',Helvetica]"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowResults(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search Results - Full Screen */}
          <div className="flex-1 overflow-y-auto">
            {/* Tab Filters */}
            {showResults && (
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 overflow-x-auto">
                {searchTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`text-[14px] [font-family:'Lato',Helvetica] px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'text-red border-red bg-[#F23A001A] font-bold'
                        : 'text-gray-500 border-gray-300 font-medium'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Empty state - when no history and no results */}
            {!showResults && searchHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-center [font-family:'Lato',Helvetica]">
                  Search for works, treasuries, and users
                </p>
              </div>
            )}

            {/* Search History (when no query) - show when search is open but no query */}
            {!showResults && searchHistory.length > 0 && (
              <div className="px-4 py-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base text-gray-600 font-medium">Recent searches</span>
                  <button
                    onClick={() => saveSearchHistory([])}
                    className="text-sm text-gray-400 hover:text-gray-600"
                  >
                    Clear all
                  </button>
                </div>
                {searchHistory.map((item, index) => (
                  <div
                    key={index}
                    onClick={async () => {
                      setSearchQuery(item);
                      // Call performSearch directly with the item
                      await performSearch(item);
                    }}
                    className="w-full px-3 py-4 text-left text-base text-dark-grey hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-5 h-5 text-gray-400" />
                      <span>{item}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newHistory = searchHistory.filter((_, i) => i !== index);
                        saveSearchHistory(newHistory);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Mobile Search Results */}
            {showResults && (
              <div className="px-4 py-4">
                {isSearching && articleResults.items.length === 0 && spaceResults.items.length === 0 && userResults.items.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-red border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-500">Searching...</p>
                  </div>
                ) : activeTab === 'all' ? (
                  <div className="space-y-6">
                    {/* Works Section */}
                    {articleResults.items.length > 0 && (
                      <div>
                        <button
                          onClick={() => handleTabChange('works')}
                          className="flex items-center mb-3"
                        >
                          <span className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-[15px]">Works</span>
                          <span className="[font-family:'Lato',Helvetica] text-gray-500 text-[12px] ml-2 flex items-center gap-1">
                            Show all ({articleResults.totalCount})
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </span>
                        </button>
                        <div className="space-y-4">
                          {articleResults.items.slice(0, 3).map((article) => (
                            <div key={article.id} onClick={() => { navigate(`/work/${article.uuid}`); handleCloseSearch(); }} className="cursor-pointer">
                              <ArticleCard article={{
                                id: article.uuid,
                                uuid: article.uuid,
                                title: article.title,
                                description: article.content,
                                coverImage: article.coverUrl,
                                category: article.categoryInfo?.name || '',
                                categoryColor: article.categoryInfo?.color,
                                userName: article.authorInfo?.username || '',
                                userAvatar: article.authorInfo?.faceUrl || '',
                                userId: article.authorInfo?.id,
                                userNamespace: article.authorInfo?.namespace,
                                date: new Date(article.createAt).toLocaleDateString(),
                                treasureCount: article.likeCount,
                                visitCount: article.viewCount?.toString() || '0',
                                isLiked: article.isLiked,
                                targetUrl: article.targetUrl,
                              }} layout="compact" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Treasuries Section */}
                    {spaceResults.items.length > 0 && (
                      <div>
                        <button
                          onClick={() => handleTabChange('treasuries')}
                          className="flex items-center mb-3"
                        >
                          <span className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-[15px]">Treasuries</span>
                          <span className="[font-family:'Lato',Helvetica] text-gray-500 text-[12px] ml-2 flex items-center gap-1">
                            Show all ({spaceResults.totalCount})
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </span>
                        </button>
                        <div className="space-y-4">
                          {spaceResults.items.slice(0, 3).map((space) => (
                            <div key={space.id} onClick={() => { navigate(`/treasury/${space.namespace}`); handleCloseSearch(); }} className="cursor-pointer">
                              <TreasuryCard space={space as SpaceData} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Users Section */}
                    {userResults.items.length > 0 && (
                      <div>
                        <button
                          onClick={() => handleTabChange('users')}
                          className="flex items-center mb-3"
                        >
                          <span className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-[15px]">Users</span>
                          <span className="[font-family:'Lato',Helvetica] text-gray-500 text-[12px] ml-2 flex items-center gap-1">
                            Show all ({userResults.totalCount})
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </span>
                        </button>
                        <div className="grid grid-cols-3 gap-3">
                          {userResults.items.slice(0, 6).map((user) => (
                            <button
                              key={user.id}
                              onClick={() => { navigate(`/u/${user.namespace}`); handleCloseSearch(); }}
                              className="rounded-[10px] px-2 py-4 shadow-[1px_1px_8px_#d5d5d5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-14 h-14 rounded-full overflow-hidden shadow-sm">
                                  <img
                                    src={user.faceUrl || profileDefaultAvatar}
                                    alt={user.username}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="text-center min-w-0 w-full">
                                  <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-[12px] truncate">
                                    {user.username}
                                  </h3>
                                  <p className="text-[10px] text-gray-400 truncate">@{user.namespace}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {articleResults.items.length === 0 && spaceResults.items.length === 0 && userResults.items.length === 0 && (
                      <div className="py-8 text-center">
                        <p className="text-gray-500">No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                ) : activeTab === 'works' ? (
                  <div className="space-y-4">
                    {articleResults.items.map((article) => (
                      <div key={article.id} onClick={() => { navigate(`/work/${article.uuid}`); handleCloseSearch(); }} className="cursor-pointer">
                        <ArticleCard article={{
                          id: article.uuid,
                          uuid: article.uuid,
                          title: article.title,
                          description: article.content,
                          coverImage: article.coverUrl,
                          category: article.categoryInfo?.name || '',
                          categoryColor: article.categoryInfo?.color,
                          userName: article.authorInfo?.username || '',
                          userAvatar: article.authorInfo?.faceUrl || '',
                          userId: article.authorInfo?.id,
                          userNamespace: article.authorInfo?.namespace,
                          date: new Date(article.createAt).toLocaleDateString(),
                          treasureCount: article.likeCount,
                          visitCount: article.viewCount?.toString() || '0',
                          isLiked: article.isLiked,
                          targetUrl: article.targetUrl,
                        }} layout="compact" />
                      </div>
                    ))}
                    {articleResults.hasMore && (
                      <button
                        onClick={() => loadMore('works')}
                        disabled={isSearching}
                        className="w-full py-3 text-sm text-red border border-red rounded-full font-medium"
                      >
                        {isSearching ? 'Loading...' : 'Load more'}
                      </button>
                    )}
                  </div>
                ) : activeTab === 'treasuries' ? (
                  <div className="space-y-4">
                    {spaceResults.items.map((space) => (
                      <div key={space.id} onClick={() => { navigate(`/treasury/${space.namespace}`); handleCloseSearch(); }} className="cursor-pointer">
                        <TreasuryCard space={space as SpaceData} />
                      </div>
                    ))}
                    {spaceResults.hasMore && (
                      <button
                        onClick={() => loadMore('treasuries')}
                        disabled={isSearching}
                        className="w-full py-3 text-sm text-red border border-red rounded-full font-medium"
                      >
                        {isSearching ? 'Loading...' : 'Load more'}
                      </button>
                    )}
                  </div>
                ) : activeTab === 'users' ? (
                  <div className="grid grid-cols-3 gap-3">
                    {userResults.items.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => { navigate(`/u/${user.namespace}`); handleCloseSearch(); }}
                        className="rounded-[10px] px-2 py-4 shadow-[1px_1px_8px_#d5d5d5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-14 h-14 rounded-full overflow-hidden shadow-sm">
                            <img
                              src={user.faceUrl || profileDefaultAvatar}
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-center min-w-0 w-full">
                            <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-[12px] truncate">
                              {user.username}
                            </h3>
                            <p className="text-[10px] text-gray-400 truncate">@{user.namespace}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                    {userResults.hasMore && (
                      <div className="col-span-3">
                        <button
                          onClick={() => loadMore('users')}
                          disabled={isSearching}
                          className="w-full py-3 text-sm text-red border border-red rounded-full font-medium"
                        >
                          {isSearching ? 'Loading...' : 'Load more'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      <header className="flex items-center justify-between px-2.5 py-[5px] lg:px-[30px] lg:py-[10px] w-full bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] fixed top-0 left-0 right-0 z-40">
        {/* Search Results Dropdown - Desktop only */}
        {showResults && (
          <div className="hidden lg:flex fixed right-[30px] top-[70px] w-[900px] max-h-[80vh] bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] rounded-2xl shadow-xl border border-gray-200 z-50 flex-col overflow-hidden">
            {/* Tab Filters */}
            <div className="flex items-center gap-3 px-[20px] py-3 border-b border-gray-100">
              {searchTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`text-[14px] [font-family:'Lato',Helvetica] px-4 py-1.5 rounded-full border transition-colors ${
                    activeTab === tab.key
                      ? 'text-red border-red bg-[#F23A001A] font-bold'
                      : 'text-gray-500 border-gray-300 hover:border-gray-400 hover:text-gray-600 font-medium'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <button
                onClick={handleCloseSearch}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Results Content - Now in dropdown */}
            <div className="search-results-container flex-1 overflow-y-auto px-[20px] py-4">
              {isSearching && articleResults.items.length === 0 && spaceResults.items.length === 0 && userResults.items.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-red border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-500">Searching...</p>
                </div>
              ) : activeTab === 'all' ? (
                /* All Tab - Sectioned Layout */
                <div className="divide-y divide-gray-200">
                  {/* Works Section */}
                  {articleResults.items.length > 0 && (
                    <div className="pb-6">
                      <button
                        onClick={() => handleTabChange('works')}
                        className="flex items-center mb-3 hover:opacity-80 transition-opacity"
                      >
                        <span className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-[14px]">
                          Works
                        </span>
                        <span className="[font-family:'Lato',Helvetica] text-gray-500 text-[12px] ml-3 flex items-center gap-1">
                          Show all ({articleResults.totalCount})
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </span>
                      </button>
                      <div className="grid gap-4 grid-cols-3 auto-rows-fr">
                        {articleResults.items.slice(0, 3).map((article) => (
                          <div key={article.id} onClick={() => { navigate(`/work/${article.uuid}`); handleCloseSearch(); }} className="cursor-pointer h-full">
                            <ArticleCard article={{
                              id: article.uuid,
                              uuid: article.uuid,
                              title: article.title,
                              description: article.content,
                              coverImage: article.coverUrl,
                              category: article.categoryInfo?.name || '',
                              categoryColor: article.categoryInfo?.color,
                              userName: article.authorInfo?.username || '',
                              userAvatar: article.authorInfo?.faceUrl || '',
                              userId: article.authorInfo?.id,
                              userNamespace: article.authorInfo?.namespace,
                              date: new Date(article.createAt).toLocaleDateString(),
                              treasureCount: article.likeCount,
                              visitCount: article.viewCount?.toString() || '0',
                              isLiked: article.isLiked,
                              targetUrl: article.targetUrl,
                            }} layout="compact" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Treasuries Section */}
                  {spaceResults.items.length > 0 && (
                    <div className="pt-6 pb-6">
                      <button
                        onClick={() => handleTabChange('treasuries')}
                        className="flex items-center mb-3 hover:opacity-80 transition-opacity"
                      >
                        <span className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-[14px]">
                          Treasuries
                        </span>
                        <span className="[font-family:'Lato',Helvetica] text-gray-500 text-[12px] ml-3 flex items-center gap-1">
                          Show all ({spaceResults.totalCount})
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </span>
                      </button>
                      <div className="grid gap-4 grid-cols-3">
                        {spaceResults.items.slice(0, 3).map((space) => (
                          <div key={space.id} onClick={() => { navigate(`/treasury/${space.namespace}`); handleCloseSearch(); }} className="cursor-pointer">
                            <TreasuryCard space={space as SpaceData} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Users Section */}
                  {userResults.items.length > 0 && (
                    <div className="pt-6">
                      <button
                        onClick={() => handleTabChange('users')}
                        className="flex items-center mb-3 hover:opacity-80 transition-opacity"
                      >
                        <span className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-[14px]">
                          Users
                        </span>
                        <span className="[font-family:'Lato',Helvetica] text-gray-500 text-[12px] ml-3 flex items-center gap-1">
                          Show all ({userResults.totalCount})
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </span>
                      </button>
                      <div className="grid gap-3 grid-cols-4">
                        {userResults.items.slice(0, 4).map((user) => (
                          <button
                            key={user.id}
                            onClick={() => { navigate(`/u/${user.namespace}`); handleCloseSearch(); }}
                            className="rounded-[10px] px-2.5 py-4 shadow-[1px_1px_8px_#d5d5d5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] hover:shadow-[2px_2px_12px_#c5c5c5] transition-shadow text-left"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm">
                                <img
                                  src={user.faceUrl || profileDefaultAvatar}
                                  alt={user.username}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="text-center min-w-0 w-full">
                                <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-[12px] truncate">
                                  {user.username}
                                </h3>
                                <p className="text-[10px] text-gray-400 truncate">@{user.namespace}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {articleResults.items.length === 0 && spaceResults.items.length === 0 && userResults.items.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              ) : activeTab === 'works' && articleResults.items.length > 0 ? (
                /* Works Tab */
                <div>
                  <div className="grid gap-4 grid-cols-3 auto-rows-fr">
                    {articleResults.items.map((article) => (
                      <div key={article.id} onClick={() => { navigate(`/work/${article.uuid}`); handleCloseSearch(); }} className="cursor-pointer h-full">
                        <ArticleCard article={{
                          id: article.uuid,
                          uuid: article.uuid,
                          title: article.title,
                          description: article.content,
                          coverImage: article.coverUrl,
                          category: article.categoryInfo?.name || '',
                          categoryColor: article.categoryInfo?.color,
                          userName: article.authorInfo?.username || '',
                          userAvatar: article.authorInfo?.faceUrl || '',
                          userId: article.authorInfo?.id,
                          userNamespace: article.authorInfo?.namespace,
                          date: new Date(article.createAt).toLocaleDateString(),
                          treasureCount: article.likeCount,
                          visitCount: article.viewCount?.toString() || '0',
                          isLiked: article.isLiked,
                          targetUrl: article.targetUrl,
                        }} layout="compact" />
                      </div>
                    ))}
                  </div>
                  {articleResults.hasMore && (
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => loadMore('works')}
                        disabled={isSearching}
                        className="px-4 py-1.5 text-sm text-red border border-red rounded-full hover:bg-[#F23A001A] transition-colors disabled:opacity-50"
                      >
                        {isSearching ? 'Loading...' : 'Load more'}
                      </button>
                    </div>
                  )}
                </div>
              ) : activeTab === 'treasuries' && spaceResults.items.length > 0 ? (
                /* Treasuries Tab */
                <div>
                  <div className="grid gap-4 grid-cols-3">
                    {spaceResults.items.map((space) => (
                      <div key={space.id} onClick={() => { navigate(`/treasury/${space.namespace}`); handleCloseSearch(); }} className="cursor-pointer">
                        <TreasuryCard space={space as SpaceData} />
                      </div>
                    ))}
                  </div>
                  {spaceResults.hasMore && (
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => loadMore('treasuries')}
                        disabled={isSearching}
                        className="px-4 py-1.5 text-sm text-red border border-red rounded-full hover:bg-[#F23A001A] transition-colors disabled:opacity-50"
                      >
                        {isSearching ? 'Loading...' : 'Load more'}
                      </button>
                    </div>
                  )}
                </div>
              ) : activeTab === 'users' && userResults.items.length > 0 ? (
                /* Users Tab */
                <div>
                  <div className="grid gap-3 grid-cols-4">
                    {userResults.items.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => { navigate(`/u/${user.namespace}`); handleCloseSearch(); }}
                        className="rounded-[10px] px-2.5 py-4 shadow-[1px_1px_8px_#d5d5d5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] hover:shadow-[2px_2px_12px_#c5c5c5] transition-shadow text-left"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm">
                            <img
                              src={user.faceUrl || profileDefaultAvatar}
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-center min-w-0 w-full">
                            <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-[12px] truncate">
                              {user.username}
                            </h3>
                            <p className="text-[10px] text-gray-400 truncate">@{user.namespace}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {userResults.hasMore && (
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => loadMore('users')}
                        disabled={isSearching}
                        className="px-4 py-1.5 text-sm text-red border border-red rounded-full hover:bg-[#F23A001A] transition-colors disabled:opacity-50"
                      >
                        {isSearching ? 'Loading...' : 'Load more'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-[15px]">
          <Link to="/" className="flex w-[22px] h-[22px] sm:w-[25px] sm:h-[25px] lg:w-[35px] lg:h-[35px] items-center justify-center rounded-full bg-red flex-shrink-0">
            <img
              className="w-[13px] h-[13px] sm:w-[15px] sm:h-[15px] lg:w-[22px] lg:h-[22px]"
              alt="Ic fractopus open"
              src="https://c.animaapp.com/mft9nppdGctUh1/img/ic-fractopus-open.svg"
            />
          </Link>

          <Link to="/" className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-[15px] sm:text-lg tracking-[0.90px] leading-[22px] sm:leading-[27px] whitespace-nowrap">
            Copus
          </Link>

          <Separator
            orientation="vertical"
            className="h-4 sm:h-6 bg-[#a8a8a8] mx-1 sm:mx-1.5 lg:mx-[8px]"
          />

          <div className="[font-family:'Lato',Helvetica] font-light text-dark-grey text-[13px] sm:text-lg leading-[18px] sm:leading-[27px] whitespace-nowrap">
            Internet Treasure Map
          </div>
        </div>

        {/* Mobile: Hamburger Menu */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden flex items-center justify-center h-[43px] cursor-pointer relative"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-dark-grey" />
          {unreadCount > 0 && (
            <div className="absolute top-2.5 -right-0.5 w-2 h-2 bg-red rounded-full" />
          )}
        </button>

        {/* Desktop: Full Navigation */}
        <div className="hidden lg:flex items-center gap-3">
        {isLoggedIn ? (
          <>
            <button
              onClick={() => {
                if (location.pathname === '/notification') {
                  // 在通知页面时，刷新通知数据
                  console.log('[HeaderSection] Refreshing notifications on current page');
                  window.location.reload();
                } else {
                  // 在其他页面时，正常跳转到通知页面
                  navigate('/notification');
                }
              }}
              className="flex items-center cursor-pointer relative focus:outline-none"
              title={location.pathname === '/notification' ? "Refresh notifications" : "Go to notifications"}
            >
              <img
                className="w-[28px] h-[28px] rotate-[12deg] hover:rotate-[17deg] transition-transform duration-200"
                alt="Notification"
                src="https://c.animaapp.com/mft4oqz6uyUKY7/img/notification.svg"
              />
              {unreadCount > 0 && (
                <div className="absolute -top-0.5 -right-0.5 bg-red text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                  {unreadCount > 99 ? '99' : unreadCount}
                </div>
              )}
            </button>

            <div className="relative flex items-center" ref={searchRef}>
              {isSearchOpen ? (
                <>
                <div className="flex items-center gap-2 bg-white rounded-full px-3 shadow-md border border-gray-200 transition-all duration-300" style={{ width: '240px', height: '35px' }}>
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (!e.target.value) {
                        setShowResults(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        performSearch(searchQuery);
                      } else if (e.key === 'Escape') {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        setShowResults(false);
                      }
                    }}
                    placeholder="Search..."
                    className="flex-1 bg-transparent outline-none text-sm text-dark-grey placeholder-gray-400 [font-family:'Lato',Helvetica]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (searchQuery) {
                        setSearchQuery('');
                        setShowResults(false);
                        searchInputRef.current?.focus();
                      } else {
                        setIsSearchOpen(false);
                      }
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Search History Dropdown */}
                {!searchQuery && !showResults && searchHistory.length > 0 && (
                  <div className="absolute top-full right-0 mt-2 w-[240px] bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="flex items-center justify-between px-3 py-1 mb-1">
                      <span className="text-xs text-gray-500">Recent searches</span>
                      <button
                        onClick={() => saveSearchHistory([])}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Clear all
                      </button>
                    </div>
                    {searchHistory.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(item);
                          performSearch(item);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-dark-grey hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Search className="w-3.5 h-3.5 text-gray-400" />
                        {item}
                      </button>
                    ))}
                  </div>
                )}
                </>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center cursor-pointer"
                  aria-label="Search"
                >
                  <img
                    className="w-[24px] h-[24px] rotate-[0deg] hover:rotate-[12deg] transition-transform duration-200"
                    alt="Search"
                    src={searchIcon}
                  />
                </button>
              )}
            </div>

            {!hideCreateButton && (
              <div className="relative group curate-container">
                <Button
                  variant="outline"
                  className="flex items-center gap-[15px] px-5 h-[35px] rounded-[50px] border-red text-red hover:bg-[#F23A001A] hover:text-red transition-all duration-300 relative overflow-hidden"
                  asChild
                >
                  <Link to="/curate" className="relative">
                    {/* 涟漪发现动效 */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* 第一层涟漪 */}
                      <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red/30 opacity-0 group-hover:animate-[ripple-1_1.5s_ease-out]"></div>
                      {/* 第二层涟漪 */}
                      <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red/20 opacity-0 group-hover:animate-[ripple-2_1.5s_ease-out_0.3s]"></div>
                      {/* 第三层涟漪 */}
                      <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red/15 opacity-0 group-hover:animate-[ripple-3_1.5s_ease-out_0.6s]"></div>
                      {/* 发现光点 */}
                      <div className="absolute w-1 h-1 bg-red/40 rounded-full opacity-0 group-hover:animate-[discover-1_1.2s_ease-out_0.2s]" style={{ top: '20%', left: '80%' }}></div>
                      <div className="absolute w-1 h-1 bg-red/30 rounded-full opacity-0 group-hover:animate-[discover-2_1.2s_ease-out_0.5s]" style={{ bottom: '25%', left: '15%' }}></div>
                      <div className="absolute w-1 h-1 bg-red/25 rounded-full opacity-0 group-hover:animate-[discover-3_1.2s_ease-out_0.8s]" style={{ top: '70%', right: '20%' }}></div>
                    </div>

                    <img
                      className="w-4 h-4 transition-all duration-300 group-hover:scale-110 relative z-10"
                      alt="Vector"
                      src="https://c.animaapp.com/mft4oqz6uyUKY7/img/vector.svg"
                    />
                    <span className="[font-family:'Lato',Helvetica] font-bold text-[16px] leading-5 text-red transition-all duration-300 relative z-10">
                      Curate
                    </span>
                  </Link>
                </Button>

                {/* 涟漪发现动效CSS */}
                <style dangerouslySetInnerHTML={{
                  __html: `
                    @keyframes ripple-1 {
                      0% {
                        transform: translate(-50%, -50%) scale(0.5);
                        opacity: 0.8;
                      }
                      100% {
                        transform: translate(-50%, -50%) scale(8);
                        opacity: 0;
                      }
                    }
                    @keyframes ripple-2 {
                      0% {
                        transform: translate(-50%, -50%) scale(0.5);
                        opacity: 0.6;
                      }
                      100% {
                        transform: translate(-50%, -50%) scale(6);
                        opacity: 0;
                      }
                    }
                    @keyframes ripple-3 {
                      0% {
                        transform: translate(-50%, -50%) scale(0.5);
                        opacity: 0.4;
                      }
                      100% {
                        transform: translate(-50%, -50%) scale(4);
                        opacity: 0;
                      }
                    }
                    @keyframes discover-1 {
                      0% {
                        opacity: 0;
                        transform: scale(0);
                      }
                      50% {
                        opacity: 1;
                        transform: scale(1.5);
                      }
                      100% {
                        opacity: 0;
                        transform: scale(0.5);
                      }
                    }
                    @keyframes discover-2 {
                      0% {
                        opacity: 0;
                        transform: scale(0);
                      }
                      50% {
                        opacity: 1;
                        transform: scale(1.2);
                      }
                      100% {
                        opacity: 0;
                        transform: scale(0.8);
                      }
                    }
                    @keyframes discover-3 {
                      0% {
                        opacity: 0;
                        transform: scale(0);
                      }
                      50% {
                        opacity: 1;
                        transform: scale(1);
                      }
                      100% {
                        opacity: 0;
                        transform: scale(0.3);
                      }
                    }
                  `
                }} />
              </div>
            )}

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                onDoubleClick={handleAvatarDoubleClick}
                className="focus:outline-none"
                title="Click to show menu, double-click to go to settings"
              >
                <Avatar className="w-[35px] h-[35px] hover:opacity-70 transition-all duration-200 cursor-pointer translate-y-[4px]">
                  <AvatarImage
                    key={user?.faceUrl || 'default'}
                    src={
                      user?.faceUrl ||
                      user?.avatar ||
                      profileDefaultAvatar
                    }
                    alt="Avatar"
                    className="object-cover w-full h-full"
                  />
                </Avatar>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-[55px] w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {user && (
                    <Link
                      to={`/u/${user.namespace}`}
                      className="block px-6 py-3 border-b border-gray-100 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <p className="text-base font-medium text-gray-900 truncate">{user.username}</p>
                      <p className="text-base text-gray-500 truncate" title={user.email}>{user.email}</p>
                    </Link>
                  )}
                  <Link
                    to="/setting"
                    className="block px-6 py-3 text-base text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-6 py-3 text-base text-red-600 hover:bg-gray-100 whitespace-nowrap"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-[15px]">
            {/* Search icon for non-logged-in users */}
            <div className="relative flex items-center" ref={searchRef}>
              {isSearchOpen ? (
                <>
                <div className="flex items-center gap-2 bg-white rounded-full px-3 shadow-md border border-gray-200 transition-all duration-300" style={{ width: '240px', height: '35px' }}>
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (!e.target.value) {
                        setShowResults(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        performSearch(searchQuery);
                      } else if (e.key === 'Escape') {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        setShowResults(false);
                      }
                    }}
                    placeholder="Search..."
                    className="flex-1 bg-transparent outline-none text-sm text-dark-grey placeholder-gray-400 [font-family:'Lato',Helvetica]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (searchQuery) {
                        setSearchQuery('');
                        setShowResults(false);
                        searchInputRef.current?.focus();
                      } else {
                        setIsSearchOpen(false);
                      }
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Search History Dropdown */}
                {!searchQuery && !showResults && searchHistory.length > 0 && (
                  <div className="absolute top-full right-0 mt-2 w-[240px] bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="flex items-center justify-between px-3 py-1 mb-1">
                      <span className="text-xs text-gray-500">Recent searches</span>
                      <button
                        onClick={() => {
                          setSearchHistory([]);
                          localStorage.removeItem('copus_search_history');
                        }}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Clear all
                      </button>
                    </div>
                    {searchHistory.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(item);
                          performSearch(item);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-dark-grey hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Search className="w-3.5 h-3.5 text-gray-400" />
                        {item}
                      </button>
                    ))}
                  </div>
                )}
                </>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center cursor-pointer"
                  aria-label="Search"
                >
                  <img
                    className="w-[24px] h-[24px] rotate-[0deg] hover:rotate-[12deg] transition-transform duration-200"
                    alt="Search"
                    src={searchIcon}
                  />
                </button>
              )}
            </div>

            {showDiscoverNow && (
              <Link to="/" className="inline-flex items-center justify-end relative flex-[0_0_auto] rounded-[10px_10px_0px_0px]">
                <div className="relative flex items-center justify-center w-fit font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] text-center tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  Discover now
                </div>
              </Link>
            )}
            {!hideLoginButton && (
              <Button
                variant="outline"
                className="inline-flex items-center justify-center gap-[15px] px-5 h-[35px] bg-white rounded-[50px] border border-solid border-[#454545] [font-family:'Lato',Helvetica] font-bold text-dark-grey text-[16px] leading-5 whitespace-nowrap hover:bg-gray-50"
                asChild
              >
                <Link to="/login">Log in / Sign up</Link>
              </Button>
            )}
          </div>
        )}
      </div>
      </header>
    </>
  );
};
