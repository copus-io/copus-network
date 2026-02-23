// Author subscription feature type definitions

export interface AuthorInfo {
  userId: number;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  spacesCount: number;
}

export interface SubscriptionInfo {
  subscriptionId: number;
  authorUserId: number;
  subscriberUserId?: number;
  subscriberEmail?: string;
  emailFrequency: EmailFrequency;
  isActive: boolean;
  isTempSubscription: boolean;
  subscribedAt: string;
  author?: AuthorInfo;
}

export type EmailFrequency = 'IMMEDIATE' | 'DAILY' | 'WEEKLY';

// Space type constants
export const SPACE_TYPES = {
  TREASURY: 1,    // Private/collection space - not in subscription scope
  CURATIONS: 2,   // Default curation space
  CUSTOM: 0       // Custom space
} as const;

export interface SubscriptionRequest {
  authorUserId: number;
  emailFrequency?: EmailFrequency;
  email?: string; // Required for wallet users or temporary users
}

export interface SubscriptionResponse {
  success: boolean;
  subscriptionId?: number;
  requiresEmailVerification?: boolean;
  autoFollowedSpaces?: Array<{
    spaceId: string;
    spaceName: string;
  }>;
  message?: string;
}

export interface SubscriptionStats {
  totalSubscribers: number;
  weeklyGrowth: number;
  growthRate: number;
  activeSubscribers: number;
}

export interface EmailPreferences {
  userId: number;
  emailEnabled: boolean;
  defaultFrequency: EmailFrequency;
  customSendTime?: string; // '21:00'
  timezone?: string;
  quietHours?: {
    start: string;
    end: string;
  };
  vacationMode?: {
    enabled: boolean;
    startDate: string;
    endDate: string;
  };
  globalFrequency?: EmailFrequency; // Override frequency for all subscriptions
}

// New: User timezone information
export interface UserTimezone {
  timezone: string; // "Asia/Shanghai", "America/New_York"
  detectedMethod: 'browser' | 'ip' | 'manual';
  lastUpdated: string;
}

// New: Email status management
export interface EmailStatus {
  subscriptionId: number;
  email: string;
  status: 'active' | 'soft_bounced' | 'hard_bounced' | 'spam_complaint';
  bounceCount: number;
  lastBounceDate?: string;
  lastSentDate?: string;
  lastOpenedDate?: string;
}

// New: Subscriber management related
export interface SubscriberInfo {
  subscriptionId: number;
  email: string;
  subscribedAt: string;
  emailFrequency: EmailFrequency;
  status: 'active' | 'paused' | 'unsubscribed';
  pausedUntil?: string;
  lastEmailSent?: string;
  lastEmailOpened?: string;
}

// New: Search and filter parameters
export interface SubscriptionFilters {
  searchQuery?: string;
  frequency?: EmailFrequency;
  status?: 'active' | 'paused' | 'unsubscribed';
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

// New: Batch operations
export interface BatchOperationRequest {
  subscriptionIds: number[];
  action: 'unsubscribe' | 'remove' | 'pause' | 'resume';
  pauseDays?: number; // Number of days to pause
}

export interface SubscriptionGroup {
  id: number;
  userId: number;
  groupName: string;
  groupType: 'AUTO' | 'CUSTOM';
  autoCategory?: string;
  sortOrder: number;
  subscriptionCount: number;
}

// UI state types
export interface SubscribeButtonState {
  isSubscribed: boolean;
  isLoading: boolean;
  subscriberCount: number;
  canSubscribe: boolean;
}

export interface SubscriptionModalData {
  isOpen: boolean;
  type: 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'EMAIL_INPUT';
  author?: AuthorInfo;
  currentSubscription?: SubscriptionInfo;
}