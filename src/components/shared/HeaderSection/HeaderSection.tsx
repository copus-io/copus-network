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

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('copus_search_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (parsed.length > 0) {
          setSearchHistory(parsed);
        } else {
          // Add some default history items for demo
          setSearchHistory(['art', 'technology', 'love', 'design']);
        }
      } catch (e) {
        console.error('Failed to parse search history');
        setSearchHistory(['art', 'technology', 'love', 'design']);
      }
    } else {
      // Add some default history items for demo
      setSearchHistory(['art', 'technology', 'love', 'design']);
    }
  }, []);

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
        // Don't close if clicking on results
        const target = event.target as HTMLElement;
        if (!target.closest('.search-results-container')) {
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
      />

      <header className="flex items-center justify-between px-2.5 py-[5px] lg:px-[30px] lg:pt-[20px] lg:pb-[20px] w-full bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] fixed top-0 left-0 right-0 z-40">
        {/* Search Overlay - 100% on mobile, 80% on desktop */}
        {isSearchOpen && (
          <div className={`fixed inset-x-0 top-0 ${showResults ? 'h-screen lg:h-[80vh]' : 'h-auto'} bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] z-50 flex flex-col shadow-lg lg:rounded-b-2xl`} ref={searchRef}>
            {/* Search Header */}
            <div className="flex items-center gap-3 px-[30px] pt-4 pb-1">
              <button
                type="button"
                onClick={handleCloseSearch}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center">
                <div className="flex-1 flex items-center bg-white rounded-[15px] px-4 py-2">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
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
                    placeholder="Search..."
                    className="flex-1 bg-transparent outline-none text-base text-dark-grey placeholder-gray-400 [font-family:'Lato',Helvetica]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSuggestions([]);
                        setShowResults(false);
                        searchInputRef.current?.focus();
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="ml-4 text-gray-600 hover:text-dark-grey font-medium [font-family:'Lato',Helvetica]"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Search History Bubbles */}
            {!searchQuery && !showResults && searchHistory.length > 0 && (
              <div className="px-[30px] py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 [font-family:'Lato',Helvetica]">Recent searches</span>
                  <button
                    onClick={() => saveSearchHistory([])}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Clear all"
                  >
                    <img
                      src={getIconUrl('DELETE')}
                      alt="Clear all"
                      className="w-4 h-4 opacity-50 hover:opacity-100"
                    />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      <span
                        onClick={() => {
                          setSearchQuery(item);
                          performSearch(item);
                        }}
                        className="text-sm text-dark-grey [font-family:'Lato',Helvetica]"
                      >
                        {item}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromSearchHistory(item);
                        }}
                        className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Filters */}
            {showResults && (
              <div className="flex items-center gap-3 px-[30px] py-2">
                {searchTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`text-sm [font-family:'Lato',Helvetica] px-4 py-1.5 rounded-full border transition-colors ${
                      activeTab === tab.key
                        ? 'text-red border-red bg-[#F23A001A] font-bold'
                        : 'text-gray-500 border-gray-300 hover:border-gray-400 hover:text-gray-600 font-medium'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && !showResults && (
              <div className="flex-1 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-[30px] py-3 flex items-center gap-3 hover:bg-gray-50 text-left"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-dark-grey">{suggestion.title}</p>
                      {suggestion.subtitle && (
                        <p className="text-xs text-gray-500">{suggestion.subtitle}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Search Results */}
            {showResults && (
              <div className="search-results-container flex-1 overflow-y-auto px-[30px] pt-2 pb-4">
                {isSearching && articleResults.items.length === 0 && spaceResults.items.length === 0 && userResults.items.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-red border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-500">Searching...</p>
                  </div>
                ) : activeTab === 'all' ? (
                  /* All Tab - Sectioned Layout */
                  <div className="space-y-10">
                    {/* Works Section */}
                    {articleResults.items.length > 0 && (
                      <div>
                        <button
                          onClick={() => handleTabChange('works')}
                          className="flex items-center mb-3 hover:opacity-80 transition-opacity"
                        >
                          <span className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-[16px]">
                            Works
                          </span>
                          <span className="[font-family:'Lato',Helvetica] text-gray-500 text-[14px] ml-4 flex items-center gap-1">
                            Show all ({articleResults.totalCount})
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </span>
                        </button>
                        <div className="flex flex-col sm:flex-row gap-4 overflow-x-clip overflow-y-visible pt-2 pb-2 -mt-2 -mb-2">
                          {articleResults.items.slice(0, 4).map((article) => (
                            <div key={article.uuid} className="w-full sm:w-[calc(25%-12px)] sm:min-w-[280px] flex-shrink-0 transform origin-top scale-100 sm:scale-[0.85] xl:scale-100">
                              <ArticleCard
                                article={{
                                  id: article.uuid,
                                  title: article.title,
                                  description: article.content || '',
                                  coverImage: article.coverUrl || '',
                                  category: article.categoryInfo?.name || '',
                                  categoryColor: article.categoryInfo?.color,
                                  userName: article.authorInfo?.username || '',
                                  userAvatar: article.authorInfo?.faceUrl || '',
                                  namespace: article.authorInfo?.namespace,
                                  date: article.createAt ? new Date(article.createAt * 1000).toLocaleDateString() : '',
                                  treasureCount: article.likeCount || 0,
                                  visitCount: String(article.viewCount || 0),
                                  isLiked: article.isLiked,
                                  website: article.targetUrl ? new URL(article.targetUrl).hostname.replace('www.', '') : '',
                                }}
                                layout="discovery"
                                actions={{ showTreasure: true, showVisits: true }}
                              />
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
                          className="flex items-center mb-3 hover:opacity-80 transition-opacity"
                        >
                          <span className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-[16px]">
                            Treasuries
                          </span>
                          <span className="[font-family:'Lato',Helvetica] text-gray-500 text-[14px] ml-4 flex items-center gap-1">
                            Show all ({spaceResults.totalCount})
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </span>
                        </button>
                        <div className="flex flex-col sm:flex-row gap-4 overflow-x-clip overflow-y-visible pt-2 pb-2 -mt-2 -mb-2">
                          {spaceResults.items.slice(0, 5).map((space) => (
                            <div key={space.id} className="w-full sm:w-[calc(25%-12px)] sm:min-w-[280px] flex-shrink-0" onClick={() => navigate(`/treasury/${space.namespace}`)}>
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
                          className="flex items-center mb-3 hover:opacity-80 transition-opacity"
                        >
                          <span className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-[16px]">
                            Users
                          </span>
                          <span className="[font-family:'Lato',Helvetica] text-gray-500 text-[14px] ml-4 flex items-center gap-1">
                            Show all ({userResults.totalCount})
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </span>
                        </button>
                        <div className="flex flex-col sm:flex-row gap-4 overflow-x-clip overflow-y-visible pt-2 pb-2 -mt-2 -mb-2">
                          {userResults.items.slice(0, 6).map((user) => (
                            <button
                              key={user.id}
                              onClick={() => navigate(`/user/${user.namespace}`)}
                              className="w-full sm:w-[calc((100%-80px)/6)] sm:min-w-[150px] flex-shrink-0 bg-white rounded-lg overflow-hidden hover:shadow-[1px_1px_10px_#c5c5c5] transition-all duration-200 text-left"
                            >
                              <div className="p-4 flex flex-col items-center text-center">
                                <div className="w-14 h-14 rounded-full overflow-hidden mb-2 ring-2 ring-gray-100">
                                  <img
                                    src={user.faceUrl || profileDefaultAvatar}
                                    alt={user.username}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-base mb-1">
                                  {user.username}
                                </h3>
                                <p className="text-sm text-gray-400 mb-2">@{user.namespace}</p>
                                {user.articleCount !== undefined && (
                                  <div className="text-xs text-gray-500">
                                    <strong className="text-dark-grey text-sm">{user.articleCount}</strong> works
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {articleResults.items.length === 0 && spaceResults.items.length === 0 && userResults.items.length === 0 && !isSearching && (
                      <div className="py-8 text-center">
                        <p className="text-gray-500">No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                ) : activeTab === 'works' && articleResults.items.length > 0 ? (
                  /* Works Tab */
                  <div>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {articleResults.items.map((article) => (
                        <div key={article.uuid} className="transform origin-top scale-[0.85] xl:scale-100">
                          <ArticleCard
                            article={{
                              id: article.uuid,
                              title: article.title,
                              description: article.content || '',
                              coverImage: article.coverUrl || '',
                              category: article.categoryInfo?.name || '',
                              categoryColor: article.categoryInfo?.color,
                              userName: article.authorInfo?.username || '',
                              userAvatar: article.authorInfo?.faceUrl || '',
                              namespace: article.authorInfo?.namespace,
                              date: article.createAt ? new Date(article.createAt * 1000).toLocaleDateString() : '',
                              treasureCount: article.likeCount || 0,
                              visitCount: String(article.viewCount || 0),
                              isLiked: article.isLiked,
                              website: article.targetUrl ? new URL(article.targetUrl).hostname.replace('www.', '') : '',
                            }}
                            layout="discovery"
                            actions={{ showTreasure: true, showVisits: true }}
                          />
                        </div>
                      ))}
                    </div>
                    {articleResults.hasMore && (
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={() => loadMore('works')}
                          disabled={isSearching}
                          className="px-6 py-2 text-red border border-red rounded-full hover:bg-[#F23A001A] transition-colors disabled:opacity-50"
                        >
                          {isSearching ? 'Loading...' : 'Load more'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : activeTab === 'treasuries' && spaceResults.items.length > 0 ? (
                  /* Treasuries Tab */
                  <div>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                      {spaceResults.items.map((space) => (
                        <div key={space.id} onClick={() => navigate(`/treasury/${space.namespace}`)}>
                          <TreasuryCard space={space as SpaceData} />
                        </div>
                      ))}
                    </div>
                    {spaceResults.hasMore && (
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={() => loadMore('treasuries')}
                          disabled={isSearching}
                          className="px-6 py-2 text-red border border-red rounded-full hover:bg-[#F23A001A] transition-colors disabled:opacity-50"
                        >
                          {isSearching ? 'Loading...' : 'Load more'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : activeTab === 'users' && userResults.items.length > 0 ? (
                  /* Users Tab */
                  <div>
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                      {userResults.items.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => navigate(`/user/${user.namespace}`)}
                          className="w-full max-w-[200px] mx-auto bg-white rounded-lg overflow-hidden hover:shadow-[1px_1px_10px_#c5c5c5] transition-all duration-200 text-left"
                        >
                          <div className="p-4 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-full overflow-hidden mb-2 ring-2 ring-gray-100">
                              <img
                                src={user.faceUrl || profileDefaultAvatar}
                                alt={user.username}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-base mb-1">
                              {user.username}
                            </h3>
                            <p className="text-sm text-gray-400 mb-2">@{user.namespace}</p>
                            {user.articleCount !== undefined && (
                              <div className="text-xs text-gray-500">
                                <strong className="text-dark-grey text-sm">{user.articleCount}</strong> works
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    {userResults.hasMore && (
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={() => loadMore('users')}
                          disabled={isSearching}
                          className="px-6 py-2 text-red border border-red rounded-full hover:bg-[#F23A001A] transition-colors disabled:opacity-50"
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
            )}
          </div>
        )}

        <div className="flex items-center gap-2.5 lg:gap-[15px]">
          <Link to="/" className="flex w-[25px] h-[25px] lg:w-[35px] lg:h-[35px] items-center justify-center rounded-full bg-red">
            <img
              className="w-[15px] h-[15px] lg:w-[22px] lg:h-[22px]"
              alt="Ic fractopus open"
              src="https://c.animaapp.com/mft9nppdGctUh1/img/ic-fractopus-open.svg"
            />
          </Link>

          <Link to="/" className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-lg tracking-[0.90px] leading-[27px] whitespace-nowrap">
            Copus
          </Link>

          <Separator
            orientation="vertical"
            className="h-6 bg-[#a8a8a8] mx-1.5 lg:mx-[8px]"
          />

          <div className="[font-family:'Lato',Helvetica] font-light text-dark-grey text-lg leading-[27px] whitespace-nowrap">
            Internet Treasure Map
          </div>
        </div>

        {/* Mobile: Hamburger Menu */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden flex items-center justify-center h-[43px] cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-dark-grey" />
        </button>

        {/* Desktop: Full Navigation */}
        <div className="hidden lg:flex items-center gap-3">
        {isLoggedIn ? (
          <>
        {!hideCreateButton && (
          <Button
            variant="outline"
            className="flex items-center gap-[15px] px-5 h-[35px] rounded-[50px] border-red text-red hover:bg-[#F23A001A] hover:text-red transition-colors duration-200"
            asChild
          >
            <Link to="/curate">
              <img
                className="w-5 h-5"
                alt="Vector"
                src="https://c.animaapp.com/mft4oqz6uyUKY7/img/vector.svg"
              />
              <span className="[font-family:'Lato',Helvetica] font-bold text-[16px] leading-5 text-red">
                Curate
              </span>
            </Link>
          </Button>
        )}

            <Link to="/notification" className="flex items-center cursor-pointer relative">
              <img
                className="w-[35px] h-[35px] rotate-[12deg] hover:rotate-[17deg] transition-transform duration-200"
                alt="Notification"
                src="https://c.animaapp.com/mft4oqz6uyUKY7/img/notification.svg"
              />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99' : unreadCount}
                </div>
              )}
            </Link>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center cursor-pointer"
              aria-label="Search"
            >
              <img
                className="w-[30px] h-[30px] hover:scale-110 transition-transform duration-200"
                alt="Search"
                src={searchIcon}
              />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                onDoubleClick={handleAvatarDoubleClick}
                className="focus:outline-none"
                title="Click to show menu, double-click to go to settings"
              >
                <Avatar className="w-[35px] h-[35px] hover:ring-2 hover:ring-red hover:scale-110 transition-all duration-200 cursor-pointer">
                  <AvatarImage
                    src={
                      user?.faceUrl ||
                      user?.avatar ||
                      profileDefaultAvatar
                    }
                    alt="Avatar"
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
                className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 h-auto bg-white rounded-[50px] border border-solid border-[#454545] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-lg tracking-[0] leading-[27px] whitespace-nowrap hover:bg-gray-50"
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
