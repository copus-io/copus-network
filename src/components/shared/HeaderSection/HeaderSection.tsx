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

interface SearchResult {
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
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
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

  // Mock search function - replace with actual API call
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    // TODO: Replace with actual API call
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Mock suggestions
    const mockSuggestions: SearchResult[] = [
      { id: '1', title: `Article about "${query}"`, type: 'article', subtitle: 'By John Doe' },
      { id: '2', title: `${query} tutorials`, type: 'article', subtitle: 'By Jane Smith' },
      { id: '3', title: `User: ${query}`, type: 'user', subtitle: '@username' },
    ];

    setSuggestions(mockSuggestions);
  }, []);

  // Mock search function - replace with actual API call
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    addToSearchHistory(query);
    setIsSearching(true);
    setShowResults(true);

    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock results
    const mockResults: SearchResult[] = [
      // Works (articles) - matching ArticleData format
      { id: '1', title: `Pets Love Art Images`, type: 'article', coverImage: 'https://picsum.photos/seed/1/400/300', description: 'Love art style images of pets', userName: 'zentrocool', userAvatar: 'https://picsum.photos/seed/u1/50/50', namespace: 'zentrocool', category: 'Art', categoryColor: '#4CAF50', treasureCount: 42, visitCount: '156', date: '2024-12-20', website: 'example.com' },
      { id: '2', title: `【Gallavich】Summer Love`, type: 'article', coverImage: 'https://picsum.photos/seed/2/400/300', description: '这是我2月看完，却拖到3月发后才算完成的故事', userName: 'agallavich', userAvatar: 'https://picsum.photos/seed/u2/50/50', namespace: 'agallavich', category: 'Life', categoryColor: '#E91E63', treasureCount: 64, visitCount: '230', date: '2024-12-18' },
      { id: '3', title: `Love Cat`, type: 'article', coverImage: 'https://picsum.photos/seed/3/400/300', description: 'Adorable cat photos collection', userName: 'zentrocool', userAvatar: 'https://picsum.photos/seed/u1/50/50', namespace: 'zentrocool', category: 'Art', categoryColor: '#4CAF50', treasureCount: 28, visitCount: '89', date: '2024-12-15' },
      { id: '4', title: `My Love My Lord My Destiny`, type: 'article', coverImage: 'https://picsum.photos/seed/4/400/300', description: 'Puppet in a box and doll images', userName: 'zentrocool', userAvatar: 'https://picsum.photos/seed/u1/50/50', namespace: 'zentrocool', category: 'Art', categoryColor: '#4CAF50', treasureCount: 15, visitCount: '67', date: '2024-12-10' },
      // Treasuries (with SpaceData)
      {
        id: '5',
        title: `${query} Collection`,
        type: 'treasury',
        namespace: 'treasurehunter',
        spaceData: {
          id: 5,
          namespace: 'treasurehunter',
          spaceType: 1,
          articleCount: 24,
          ownerInfo: { username: 'treasurehunter', namespace: 'treasurehunter' },
          data: [
            { uuid: 't1-1', title: 'Amazing Discovery', coverUrl: 'https://picsum.photos/seed/t1a/400/300', targetUrl: 'https://example.com/1' },
            { uuid: 't1-2', title: 'Hidden Gems', coverUrl: 'https://picsum.photos/seed/t1b/400/300', targetUrl: 'https://medium.com/2' },
            { uuid: 't1-3', title: 'Best Finds', coverUrl: 'https://picsum.photos/seed/t1c/400/300', targetUrl: 'https://blog.com/3' },
          ]
        }
      },
      {
        id: '6',
        title: `Best of ${query}`,
        type: 'treasury',
        namespace: 'curator',
        spaceData: {
          id: 6,
          namespace: 'curator',
          spaceType: 1,
          articleCount: 18,
          ownerInfo: { username: 'curator', namespace: 'curator' },
          data: [
            { uuid: 't2-1', title: 'Top Picks 2024', coverUrl: 'https://picsum.photos/seed/t2a/400/300', targetUrl: 'https://news.com/1' },
            { uuid: 't2-2', title: 'Must Read', coverUrl: 'https://picsum.photos/seed/t2b/400/300', targetUrl: 'https://tech.com/2' },
            { uuid: 't2-3', title: 'Community Favorites', coverUrl: 'https://picsum.photos/seed/t2c/400/300', targetUrl: 'https://art.com/3' },
          ]
        }
      },
      {
        id: '9',
        title: `${query} Favorites`,
        type: 'treasury',
        namespace: 'artlover',
        spaceData: {
          id: 9,
          namespace: 'artlover',
          spaceType: 1,
          articleCount: 36,
          ownerInfo: { username: 'artlover', namespace: 'artlover' },
          data: [
            { uuid: 't3-1', title: 'Art Inspiration', coverUrl: 'https://picsum.photos/seed/t3a/400/300', targetUrl: 'https://art.com/1' },
            { uuid: 't3-2', title: 'Creative Works', coverUrl: 'https://picsum.photos/seed/t3b/400/300', targetUrl: 'https://design.com/2' },
            { uuid: 't3-3', title: 'Visual Stories', coverUrl: 'https://picsum.photos/seed/t3c/400/300', targetUrl: 'https://gallery.com/3' },
          ]
        }
      },
      {
        id: '10',
        title: `My ${query} Journey`,
        type: 'treasury',
        namespace: 'explorer',
        spaceData: {
          id: 10,
          namespace: 'explorer',
          spaceType: 1,
          articleCount: 42,
          ownerInfo: { username: 'explorer', namespace: 'explorer' },
          data: [
            { uuid: 't4-1', title: 'Adventures', coverUrl: 'https://picsum.photos/seed/t4a/400/300', targetUrl: 'https://travel.com/1' },
            { uuid: 't4-2', title: 'Discoveries', coverUrl: 'https://picsum.photos/seed/t4b/400/300', targetUrl: 'https://explore.com/2' },
            { uuid: 't4-3', title: 'Hidden Places', coverUrl: 'https://picsum.photos/seed/t4c/400/300', targetUrl: 'https://world.com/3' },
          ]
        }
      },
      {
        id: '11',
        title: `${query} Essentials`,
        type: 'treasury',
        namespace: 'collector',
        spaceData: {
          id: 11,
          namespace: 'collector',
          spaceType: 1,
          articleCount: 29,
          ownerInfo: { username: 'collector', namespace: 'collector' },
          data: [
            { uuid: 't5-1', title: 'Must Haves', coverUrl: 'https://picsum.photos/seed/t5a/400/300', targetUrl: 'https://shop.com/1' },
            { uuid: 't5-2', title: 'Top Rated', coverUrl: 'https://picsum.photos/seed/t5b/400/300', targetUrl: 'https://review.com/2' },
            { uuid: 't5-3', title: 'Editor Picks', coverUrl: 'https://picsum.photos/seed/t5c/400/300', targetUrl: 'https://picks.com/3' },
          ]
        }
      },
      {
        id: '12',
        title: `Ultimate ${query}`,
        type: 'treasury',
        namespace: 'master',
        spaceData: {
          id: 12,
          namespace: 'master',
          spaceType: 1,
          articleCount: 55,
          ownerInfo: { username: 'master', namespace: 'master' },
          data: [
            { uuid: 't6-1', title: 'Best Ever', coverUrl: 'https://picsum.photos/seed/t6a/400/300', targetUrl: 'https://best.com/1' },
            { uuid: 't6-2', title: 'All Time Greats', coverUrl: 'https://picsum.photos/seed/t6b/400/300', targetUrl: 'https://great.com/2' },
            { uuid: 't6-3', title: 'Legendary', coverUrl: 'https://picsum.photos/seed/t6c/400/300', targetUrl: 'https://legend.com/3' },
          ]
        }
      },
      // Users
      { id: '7', title: `${query}master`, type: 'user', image: 'https://picsum.photos/seed/u5/200/200', subtitle: 'Digital artist & content creator', namespace: 'lovemaster', followersCount: 1250, articlesCount: 45 },
      { id: '8', title: `i_love_${query}`, type: 'user', image: 'https://picsum.photos/seed/u6/200/200', subtitle: 'Passionate about sharing knowledge', namespace: 'ilovelove', followersCount: 892, articlesCount: 32 },
      { id: '13', title: `${query}_fan`, type: 'user', image: 'https://picsum.photos/seed/u7/200/200', subtitle: 'Enthusiast', namespace: 'lovefan', followersCount: 567, articlesCount: 28 },
      { id: '14', title: `the_${query}_guy`, type: 'user', image: 'https://picsum.photos/seed/u8/200/200', subtitle: 'Content creator', namespace: 'theloveguy', followersCount: 2340, articlesCount: 67 },
      { id: '15', title: `${query}seeker`, type: 'user', image: 'https://picsum.photos/seed/u9/200/200', subtitle: 'Explorer', namespace: 'loveseeker', followersCount: 445, articlesCount: 19 },
      { id: '16', title: `daily_${query}`, type: 'user', image: 'https://picsum.photos/seed/u10/200/200', subtitle: 'Daily updates', namespace: 'dailylove', followersCount: 3200, articlesCount: 156 },
      { id: '17', title: `${query}_addict`, type: 'user', image: 'https://picsum.photos/seed/u11/200/200', subtitle: 'Obsessed', namespace: 'loveaddict', followersCount: 780, articlesCount: 41 },
      { id: '18', title: `pure_${query}`, type: 'user', image: 'https://picsum.photos/seed/u12/200/200', subtitle: 'Authentic content', namespace: 'purelove', followersCount: 1890, articlesCount: 73 },
    ];

    setSearchResults(mockResults);
    setIsSearching(false);
    setSuggestions([]);
  }, []);

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
    setSearchResults([]);
    setShowResults(false);
    setActiveTab('all');
  };

  const searchTabs: { key: SearchTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'works', label: 'Works' },
    { key: 'treasuries', label: 'Treasuries' },
    { key: 'users', label: 'Users' },
  ];

  const filteredResults = searchResults.filter(result => {
    if (activeTab === 'all') return true;
    if (activeTab === 'works') return result.type === 'article';
    if (activeTab === 'treasuries') return result.type === 'treasury';
    if (activeTab === 'users') return result.type === 'user';
    return true;
  });

  const handleSuggestionClick = (suggestion: SearchResult) => {
    setSearchQuery(suggestion.title);
    performSearch(suggestion.title);
  };

  const handleResultClick = (result: SearchResult) => {
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
          <div className="fixed inset-x-0 top-0 h-screen lg:h-[80vh] bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] z-50 flex flex-col shadow-lg lg:rounded-b-2xl" ref={searchRef}>
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
                    onClick={() => setActiveTab(tab.key)}
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
                {isSearching ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-red border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-500">Searching...</p>
                  </div>
                ) : activeTab === 'all' ? (
                  /* All Tab - Sectioned Layout */
                  <div className="space-y-10">
                    {/* Works Section */}
                    {searchResults.filter(r => r.type === 'article').length > 0 && (
                      <div>
                        <button
                          onClick={() => setActiveTab('works')}
                          className="flex items-center mb-3 hover:opacity-80 transition-opacity"
                        >
                          <span className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-[16px]">
                            Works
                          </span>
                          <span className="[font-family:'Lato',Helvetica] text-gray-500 text-[14px] ml-4 flex items-center gap-1">
                            Show all
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </span>
                        </button>
                        <div className="flex flex-col sm:flex-row gap-4 overflow-x-clip overflow-y-visible pt-2 pb-2 -mt-2 -mb-2">
                          {searchResults.filter(r => r.type === 'article').slice(0, 4).map((result) => (
                            <div key={result.id} className="w-full sm:w-[calc(25%-12px)] sm:min-w-[280px] flex-shrink-0 transform origin-top scale-100 sm:scale-[0.85] xl:scale-100">
                              <ArticleCard
                                article={{
                                  id: result.id,
                                  title: result.title,
                                  description: result.description || '',
                                  coverImage: result.coverImage || '',
                                  category: result.category || '',
                                  categoryColor: result.categoryColor,
                                  userName: result.userName || '',
                                  userAvatar: result.userAvatar || '',
                                  namespace: result.namespace,
                                  date: result.date || '',
                                  treasureCount: result.treasureCount || 0,
                                  visitCount: result.visitCount || '0',
                                  isLiked: result.isLiked,
                                  website: result.website,
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
                    {searchResults.filter(r => r.type === 'treasury').length > 0 && (
                      <div>
                        <button
                          onClick={() => setActiveTab('treasuries')}
                          className="flex items-center mb-3 hover:opacity-80 transition-opacity"
                        >
                          <span className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-[16px]">
                            Treasuries
                          </span>
                          <span className="[font-family:'Lato',Helvetica] text-gray-500 text-[14px] ml-4 flex items-center gap-1">
                            Show all
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </span>
                        </button>
                        <div className="flex flex-col sm:flex-row gap-4 overflow-x-clip overflow-y-visible pt-2 pb-2 -mt-2 -mb-2">
                          {searchResults.filter(r => r.type === 'treasury').slice(0, 5).map((result) => (
                            result.spaceData && (
                              <div key={result.id} className="w-full sm:w-[calc(25%-12px)] sm:min-w-[280px] flex-shrink-0" onClick={() => handleResultClick(result)}>
                                <TreasuryCard space={result.spaceData} />
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Users Section */}
                    {searchResults.filter(r => r.type === 'user').length > 0 && (
                      <div>
                        <button
                          onClick={() => setActiveTab('users')}
                          className="flex items-center mb-3 hover:opacity-80 transition-opacity"
                        >
                          <span className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-[16px]">
                            Users
                          </span>
                          <span className="[font-family:'Lato',Helvetica] text-gray-500 text-[14px] ml-4 flex items-center gap-1">
                            Show all
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </span>
                        </button>
                        <div className="flex flex-col sm:flex-row gap-4 overflow-x-clip overflow-y-visible pt-2 pb-2 -mt-2 -mb-2">
                          {searchResults.filter(r => r.type === 'user').slice(0, 6).map((result) => (
                            <button
                              key={result.id}
                              onClick={() => handleResultClick(result)}
                              className="w-full sm:w-[calc((100%-80px)/6)] sm:min-w-[150px] flex-shrink-0 bg-white rounded-lg overflow-hidden hover:shadow-[1px_1px_10px_#c5c5c5] transition-all duration-200 text-left"
                            >
                              <div className="p-4 flex flex-col items-center text-center">
                                <div className="w-14 h-14 rounded-full overflow-hidden mb-2 ring-2 ring-gray-100">
                                  <img
                                    src={result.image || 'https://via.placeholder.com/80'}
                                    alt={result.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-base mb-1">
                                  {result.title}
                                </h3>
                                <p className="text-sm text-gray-400 mb-2">@{result.namespace}</p>
                                {result.articlesCount !== undefined && (
                                  <div className="text-xs text-gray-500">
                                    <strong className="text-dark-grey text-sm">{result.articlesCount}</strong> works
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.length === 0 && (
                      <div className="py-8 text-center">
                        <p className="text-gray-500">No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                ) : filteredResults.length > 0 ? (
                  /* Individual Tab Layout */
                  <div className={`grid gap-4 ${
                    activeTab === 'users'
                      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'
                      : activeTab === 'treasuries'
                        ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  }`}>
                    {filteredResults.map((result) => (
                      <div key={result.id}>
                        {/* Article/Work Card - Using ArticleCard component */}
                        {result.type === 'article' && (
                          <div className="transform origin-top scale-[0.85] xl:scale-100">
                            <ArticleCard
                              article={{
                                id: result.id,
                                title: result.title,
                                description: result.description || '',
                                coverImage: result.coverImage || '',
                                category: result.category || '',
                                categoryColor: result.categoryColor,
                                userName: result.userName || '',
                                userAvatar: result.userAvatar || '',
                                namespace: result.namespace,
                                date: result.date || '',
                                treasureCount: result.treasureCount || 0,
                                visitCount: result.visitCount || '0',
                                isLiked: result.isLiked,
                                website: result.website,
                              }}
                              layout="discovery"
                              actions={{ showTreasure: true, showVisits: true }}
                            />
                          </div>
                        )}

                        {/* Treasury Card - Using TreasuryCard component */}
                        {result.type === 'treasury' && result.spaceData && (
                          <div onClick={() => handleResultClick(result)}>
                            <TreasuryCard
                              space={result.spaceData}
                            />
                          </div>
                        )}

                        {/* User Card */}
                        {result.type === 'user' && (
                          <button
                            onClick={() => handleResultClick(result)}
                            className="w-full max-w-[200px] mx-auto bg-white rounded-lg overflow-hidden hover:shadow-[1px_1px_10px_#c5c5c5] transition-all duration-200 text-left"
                          >
                            <div className="p-4 flex flex-col items-center text-center">
                              <div className="w-14 h-14 rounded-full overflow-hidden mb-2 ring-2 ring-gray-100">
                                <img
                                  src={result.image || 'https://via.placeholder.com/80'}
                                  alt={result.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-base mb-1">
                                {result.title}
                              </h3>
                              <p className="text-sm text-gray-400 mb-2">@{result.namespace}</p>
                              {result.articlesCount !== undefined && (
                                <div className="text-xs text-gray-500">
                                  <strong className="text-dark-grey text-sm">{result.articlesCount}</strong> works
                                </div>
                              )}
                            </div>
                          </button>
                        )}
                      </div>
                    ))}
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
                    <div className="px-6 py-3 border-b border-gray-100">
                      <p className="text-base font-medium text-gray-900 truncate">{user.username}</p>
                      <p className="text-base text-gray-500 truncate" title={user.email}>{user.email}</p>
                    </div>
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
