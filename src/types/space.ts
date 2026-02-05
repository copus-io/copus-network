/**
 * Space/Treasury related types for Copus Network
 */

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
   * Space owner user information
   */
  userInfo: SpaceUserInfo;
}

/**
 * API Response type for bindableSpaces endpoint
 */
export type BindableSpacesResponse = BindableSpace[];