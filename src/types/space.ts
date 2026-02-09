/**
 * Space/Treasury related types for Copus Network
 */

/**
 * Space visibility constants (same as article visibility)
 */
export const SPACE_VISIBILITY = {
  PUBLIC: 0,   // 公开 - 所有人可见
  PRIVATE: 1,  // 私享 - 仅创建者可见
  UNLISTED: 2  // 未列出 - 仅通过直链访问
} as const;

export type SpaceVisibility = typeof SPACE_VISIBILITY[keyof typeof SPACE_VISIBILITY];

/**
 * Request interface for bindableSpaces API
 */
export interface BindableSpacesRequest {
  /**
   * 主键id - Article ID to check binding status
   */
  id: number;
  [property: string]: any;
}

/**
 * Space article data structure
 */
export interface SpaceArticleData {
  coverUrl: string;
  targetUrl: string;
  title: string;
}

/**
 * User info structure within space response
 */
export interface SpaceUserInfo {
  bio: string;
  coverUrl: string;
  faceUrl: string;
  id: number;
  namespace: string;
  username: string;
}

/**
 * Bindable space response interface
 */
export interface BindableSpace {
  /**
   * Article count in this space
   */
  articleCount: number;
  /**
   * Space cover image URL
   */
  coverUrl: string;
  /**
   * Article data array
   */
  data: SpaceArticleData[];
  /**
   * Space description
   */
  description: string;
  /**
   * Space avatar/face URL
   */
  faceUrl: string;
  /**
   * Follower count for this space
   */
  followerCount: number;
  /**
   * Space unique ID
   */
  id: number;
  /**
   * Whether current user is admin of this space
   */
  isAdmin: boolean;
  /**
   * Whether article is already bound to this space
   */
  isBind: boolean;
  /**
   * Whether current user is following this space
   */
  isFollowed: boolean;
  /**
   * Space name/title
   */
  name: string;
  /**
   * Space namespace/slug
   */
  namespace: string;
  /**
   * Space type (0 = default space, 1 = custom space)
   */
  spaceType: number;
  /**
   * Space visibility status
   * 0: Public (公开) - visible to everyone
   * 1: Private (私享) - only visible to owner
   * 2: Unlisted (未列出) - accessible via direct link but not in public feeds
   */
  visibility: number;
  /**
   * Space owner user information
   */
  userInfo: SpaceUserInfo;
}

/**
 * API Response type for bindableSpaces endpoint
 */
export type BindableSpacesResponse = BindableSpace[];

/**
 * Utility functions for space visibility
 */

/**
 * Check if a space is private
 */
export const isSpacePrivate = (space: { visibility?: number } | BindableSpace): boolean => {
  return space.visibility === SPACE_VISIBILITY.PRIVATE;
};

/**
 * Check if a space is public
 */
export const isSpacePublic = (space: { visibility?: number } | BindableSpace): boolean => {
  return space.visibility === SPACE_VISIBILITY.PUBLIC;
};

/**
 * Check if a space is unlisted
 */
export const isSpaceUnlisted = (space: { visibility?: number } | BindableSpace): boolean => {
  return space.visibility === SPACE_VISIBILITY.UNLISTED;
};

/**
 * Check if a user can view a space based on visibility and ownership
 */
export const canUserViewSpace = (
  space: { visibility?: number; userInfo?: { id: number }; isAdmin?: boolean },
  userId?: number
): boolean => {
  // Public spaces are always visible
  if (space.visibility === SPACE_VISIBILITY.PUBLIC) {
    return true;
  }

  // Private spaces are only visible to the owner/admin
  if (space.visibility === SPACE_VISIBILITY.PRIVATE) {
    return userId !== undefined && (space.userInfo?.id === userId || space.isAdmin);
  }

  // Unlisted spaces are visible via direct link (assume yes if checking)
  if (space.visibility === SPACE_VISIBILITY.UNLISTED) {
    return true;
  }

  // Default to public if visibility is not set
  return true;
};

/**
 * Convert visibility number to legacy isPrivate boolean for spaces (backward compatibility)
 */
export const convertSpaceVisibilityToLegacyPrivate = (visibility?: number): boolean => {
  return visibility === SPACE_VISIBILITY.PRIVATE;
};