import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArticleCard, ArticleData } from '@/components/ArticleCard';
import { TreasuryCard, SpaceData } from '@/components/ui/TreasuryCard';
import { Search, X, ChevronLeft } from 'lucide-react';
import searchIcon from '@/assets/images/icon-search.svg';
import { debugLog } from '@/utils/debugLogger';
import { useUser } from '@/contexts/UserContext';
import {
  searchAll,
  searchArticles,
  searchSpaces,
  searchUsers,
  SearchArticleItem,
  SearchSpaceItem,
  SearchUserItem,
} from '@/services/searchService';
import { canUserViewArticle } from '@/types/article';

// 🔍 SEARCH: search-result-types
interface SearchResultItem {
  id: string;
  title: string;
  type: 'article' | 'user' | 'treasury';
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
  subtitle?: string;
  followersCount?: number;
  articlesCount?: number;
  image?: string;
  spaceName?: string;
  spaceDescription?: string;
  articleCount?: number;
  spaceCreatorName?: string;
  spaceCreatorNamespace?: string;
  profileFaceUrl?: string;
}

// 🔍 SEARCH: search-section-props
interface SearchSectionProps {
  isSearchOpen: boolean;
  onToggleSearch: () => void;
  className?: string;
}

// 🔍 SEARCH: search-section-component
export const SearchSection: React.FC<SearchSectionProps> = ({
  isSearchOpen,
  onToggleSearch,
  className = ''
}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'articles' | 'users' | 'treasuries'>('all');
  const [hasSearched, setHasSearched] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 🔍 SEARCH: search-effects
  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSearchOpen) {
        onToggleSearch();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSearchOpen, onToggleSearch]);

  // 🔍 SEARCH: search-functions
  // Filter private articles from search results using new visibility system
  const filterPrivateArticles = (articles: SearchArticleItem[]): SearchArticleItem[] => {
    return articles.filter(article => {
      // Use new visibility system with fallback to legacy isPrivate
      if (article.visibility !== undefined) {
        return canUserViewArticle(article, user?.id);
      } else {
        // Fallback to legacy isPrivate system
        return !article.isPrivate || (user && user.id === article.authorInfo.id);
      }
    });
  };

  const transformArticleToSearchResult = (article: SearchArticleItem): SearchResultItem => ({
    id: article.id.toString(),
    title: article.title,
    type: 'article',
    description: article.content,
    coverImage: article.coverUrl,
    category: article.categoryInfo?.name,
    categoryColor: article.categoryInfo?.color,
    userName: article.authorInfo?.username,
    userAvatar: article.authorInfo?.faceUrl,
    userId: article.authorInfo?.id,
    namespace: article.authorInfo?.namespace,
    userNamespace: article.authorInfo?.namespace,
    date: new Date(article.createAt * 1000).toLocaleDateString(),
    treasureCount: article.likeCount || 0,
    visitCount: `${article.viewCount || 0} Visits`,
    isLiked: false,
  });

  const transformUserToSearchResult = (user: SearchUserItem): SearchResultItem => ({
    id: user.id.toString(),
    title: user.username,
    type: 'user',
    subtitle: user.bio || 'Copus User',
    userAvatar: user.faceUrl,
    namespace: user.namespace,
    followersCount: user.followerCount || 0,
    articlesCount: user.articlesCount || 0,
    image: user.faceUrl,
  });

  const transformSpaceToSearchResult = (space: SearchSpaceItem): SearchResultItem => ({
    id: space.id.toString(),
    title: space.spaceName,
    type: 'treasury',
    spaceName: space.spaceName,
    spaceDescription: space.spaceDescription,
    articleCount: space.articleCount || 0,
    spaceCreatorName: space.spaceCreatorName,
    spaceCreatorNamespace: space.spaceCreatorNamespace,
    profileFaceUrl: space.profileFaceUrl,
    namespace: space.namespace,
  });

  const performSearch = useCallback(async (query: string, tab: 'all' | 'articles' | 'users' | 'treasuries') => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    debugLog.ui('Performing search:', { query, tab });

    try {
      let results: SearchResultItem[] = [];

      if (tab === 'all') {
        const response = await searchAll({ keyword: query, pageIndex: 1, pageSize: 20 });
        // Filter and transform articles to remove private content
        const filteredArticles = filterPrivateArticles(response.articles.items || []);
        const articles = filteredArticles.map(transformArticleToSearchResult);
        const users = (response.users.items || []).map(transformUserToSearchResult);
        const spaces = (response.spaces.items || []).map(transformSpaceToSearchResult);
        results = [...articles, ...users, ...spaces];
      } else if (tab === 'articles') {
        const response = await searchArticles({ keyword: query, pageIndex: 1, pageSize: 20 });
        // Filter private articles before transforming
        const filteredArticles = filterPrivateArticles(response.items || []);
        results = filteredArticles.map(transformArticleToSearchResult);
      } else if (tab === 'users') {
        const response = await searchUsers({ keyword: query, pageIndex: 1, pageSize: 20 });
        results = (response.items || []).map(transformUserToSearchResult);
      } else if (tab === 'treasuries') {
        const response = await searchSpaces({ keyword: query, pageIndex: 1, pageSize: 20 });
        results = (response.items || []).map(transformSpaceToSearchResult);
      }

      setSearchResults(results);
      setHasSearched(true);
      debugLog.ui('Search results:', { count: results.length, tab });

    } catch (error) {
      debugLog.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // 🔍 SEARCH: search-handlers
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Debounce search
    const timeout = setTimeout(() => {
      performSearch(query, activeTab);
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleTabChange = (tab: 'all' | 'articles' | 'users' | 'treasuries') => {
    setActiveTab(tab);
    if (searchQuery.trim()) {
      performSearch(searchQuery, tab);
    }
  };

  const handleResultClick = (result: SearchResultItem) => {
    if (result.type === 'article') {
      navigate(`/content/${result.id}`);
    } else if (result.type === 'user') {
      navigate(`/user/${result.namespace}`);
    } else if (result.type === 'treasury') {
      navigate(`/space/${result.namespace}`);
    }
    onToggleSearch();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${className}`}>
      <div className="w-full h-full bg-white">
        {/* Search Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSearch}
              className="p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex-1 relative">
              <div className="relative">
                <img
                  src={searchIcon}
                  alt="Search"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search articles, users, treasuries..."
                  value={searchQuery}
                  onChange={handleSearchInput}
                  className="w-full pl-12 pr-10 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Search Tabs */}
          <div className="flex space-x-1 mt-4">
            {(['all', 'articles', 'users', 'treasuries'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {isSearching && (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Searching...</div>
            </div>
          )}

          {!isSearching && hasSearched && searchResults.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-2">No results found</div>
              <div className="text-sm text-gray-400">
                Try different keywords or browse our categories
              </div>
            </div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div className="space-y-4">
              {searchResults.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="cursor-pointer"
                >
                  {result.type === 'article' && (
                    <ArticleCard
                      article={result as ArticleData}
                      showActions={false}
                      compact={true}
                    />
                  )}
                  {result.type === 'treasury' && (
                    <TreasuryCard
                      spaceData={result as SpaceData}
                      showArticleCount={true}
                    />
                  )}
                  {result.type === 'user' && (
                    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <img
                          src={result.image || '/default-avatar.png'}
                          alt={result.title}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{result.title}</h3>
                          <p className="text-sm text-gray-600">{result.subtitle}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>{result.followersCount} followers</span>
                            <span>{result.articlesCount} articles</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!isSearching && !hasSearched && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500 mb-2">Start typing to search</div>
              <div className="text-sm text-gray-400">
                Find articles, users, and treasuries
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};