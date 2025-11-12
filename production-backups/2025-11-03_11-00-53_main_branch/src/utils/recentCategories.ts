/**
 * Utility functions for managing recently used categories
 */

const RECENT_CATEGORIES_KEY = 'copus_recent_categories';
const MAX_RECENT_CATEGORIES = 5;

export interface RecentCategory {
  id: number;
  name: string;
  timestamp: number;
}

/**
 * Get recently used categories from localStorage
 */
export const getRecentCategories = (): RecentCategory[] => {
  try {
    const stored = localStorage.getItem(RECENT_CATEGORIES_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading recent categories:', error);
    return [];
  }
};

/**
 * Add a category to recently used list
 * @param categoryId - The category ID
 * @param categoryName - The category name
 */
export const addRecentCategory = (categoryId: number, categoryName: string): void => {
  try {
    let recentCategories = getRecentCategories();

    // Remove existing entry for this category
    recentCategories = recentCategories.filter(cat => cat.id !== categoryId);

    // Add to the beginning of the list
    recentCategories.unshift({
      id: categoryId,
      name: categoryName,
      timestamp: Date.now()
    });

    // Keep only the most recent MAX_RECENT_CATEGORIES
    recentCategories = recentCategories.slice(0, MAX_RECENT_CATEGORIES);

    localStorage.setItem(RECENT_CATEGORIES_KEY, JSON.stringify(recentCategories));
  } catch (error) {
    console.error('Error saving recent category:', error);
  }
};

/**
 * Sort categories to show recently used ones first
 * @param categories - All available categories
 * @returns Sorted categories with recent ones first
 */
export const sortCategoriesByRecent = <T extends { id: number; name: string }>(
  categories: T[]
): T[] => {
  const recentCategories = getRecentCategories();
  const recentIds = new Set(recentCategories.map(cat => cat.id));

  // Split into recent and non-recent
  const recent: T[] = [];
  const others: T[] = [];

  categories.forEach(category => {
    if (recentIds.has(category.id)) {
      recent.push(category);
    } else {
      others.push(category);
    }
  });

  // Sort recent categories by their timestamp (most recent first)
  recent.sort((a, b) => {
    const aRecent = recentCategories.find(cat => cat.id === a.id);
    const bRecent = recentCategories.find(cat => cat.id === b.id);
    return (bRecent?.timestamp || 0) - (aRecent?.timestamp || 0);
  });

  // Combine: recent first, then others
  return [...recent, ...others];
};
