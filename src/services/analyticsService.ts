/**
 * Analytics service for tracking user interactions
 */

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  timestamp: number;
  page: string;
  userAgent: string;
  sessionId: string;
}

interface PublishButtonClickEvent extends AnalyticsEvent {
  buttonLocation: 'header' | 'mobile_menu' | 'withdrawal_page' | 'other';
  userType: 'logged_in' | 'guest';
}

interface CurateProgressEvent extends AnalyticsEvent {
  step: 'page_load' | 'title_input' | 'content_input' | 'category_select' | 'publish_attempt' | 'publish_success';
  progressPercent?: number;
  timeOnStep?: number;
}

interface UserJourneyEvent extends AnalyticsEvent {
  source: 'discovery' | 'treasury' | 'profile' | 'direct' | 'external' | 'search' | 'notification';
  referrerUrl?: string;
  isReturningUser: boolean;
  daysSinceLastVisit?: number;
}

interface ShareButtonClickEvent extends AnalyticsEvent {
  shareType: 'wechat' | 'weibo' | 'qq' | 'link' | 'qrcode' | 'email' | 'other';
  contentType: 'article' | 'profile' | 'treasury' | 'space' | 'other';
  contentId?: string;
  contentTitle?: string;
  shareLocation: 'article_detail' | 'profile_page' | 'treasury_item' | 'floating_button' | 'other';
  shareSuccess: boolean;
}

class AnalyticsService {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadStoredEvents();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadStoredEvents(): void {
    try {
      const stored = localStorage.getItem('copus_analytics_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load stored analytics events:', error);
      this.events = [];
    }
  }

  private saveEvents(): void {
    try {
      // Keep only last 100 events in localStorage to prevent overflow
      const eventsToSave = this.events.slice(-100);
      localStorage.setItem('copus_analytics_events', JSON.stringify(eventsToSave));
    } catch (error) {
      console.warn('Failed to save analytics events:', error);
    }
  }

  /**
   * Track publish button click
   */
  trackPublishButtonClick(
    buttonLocation: 'header' | 'mobile_menu' | 'withdrawal_page' | 'other',
    userType: 'logged_in' | 'guest',
    additionalData: { label?: string } = {}
  ): void {
    const event: PublishButtonClickEvent = {
      event: 'click',
      category: 'publish_button',
      action: 'click',
      label: additionalData.label || buttonLocation,
      buttonLocation,
      userType,
      timestamp: Date.now(),
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      userId: this.getUserId(),
    };

    this.events.push(event);
    this.saveEvents();

    // Log in development mode
    if (import.meta.env.DEV) {
      console.log('📊 Analytics: Publish button clicked', event);
    }

    // Send to backend in production
    if (import.meta.env.PROD) {
      this.sendEventToBackend(event);
    }
  }

  /**
   * Track page navigation
   */
  trackPageView(page: string): void {
    const event: AnalyticsEvent = {
      event: 'page_view',
      category: 'navigation',
      action: 'view',
      label: page,
      timestamp: Date.now(),
      page,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      userId: this.getUserId(),
    };

    this.events.push(event);
    this.saveEvents();
  }

  /**
   * Track curate page access with detailed source tracking
   */
  trackCuratePageAccess(source?: string): void {
    const referrerUrl = document.referrer;
    const isReturningUser = this.isReturningUser();
    const daysSinceLastVisit = this.getDaysSinceLastVisit();

    const event: UserJourneyEvent = {
      event: 'page_access',
      category: 'curate',
      action: 'access',
      label: source || this.detectSource(referrerUrl),
      source: (source as any) || this.detectSource(referrerUrl),
      referrerUrl,
      isReturningUser,
      daysSinceLastVisit,
      timestamp: Date.now(),
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      userId: this.getUserId(),
    };

    this.events.push(event);
    this.saveEvents();
    this.updateLastVisit();

    if (import.meta.env.DEV) {
      console.log('📊 Analytics: Curate page accessed', event);
    }

    if (import.meta.env.PROD) {
      this.sendEventToBackend(event);
    }
  }

  /**
   * Track user progress through the creation process
   */
  trackCurateProgress(step: CurateProgressEvent['step'], metadata: {
    progressPercent?: number;
    timeOnStep?: number;
    contentLength?: number;
    category?: string;
  } = {}): void {
    const event: CurateProgressEvent = {
      event: 'curate_progress',
      category: 'curate',
      action: 'progress',
      label: step,
      step,
      progressPercent: metadata.progressPercent,
      timeOnStep: metadata.timeOnStep,
      value: metadata.contentLength,
      timestamp: Date.now(),
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      userId: this.getUserId(),
    };

    this.events.push(event);
    this.saveEvents();

    if (import.meta.env.DEV) {
      console.log('📊 Analytics: Curate progress', event);
    }

    if (import.meta.env.PROD) {
      this.sendEventToBackend(event);
    }
  }

  /**
   * Track content publication with metadata
   */
  trackContentPublished(metadata: {
    category: string;
    contentLength: number;
    hasImages: boolean;
    hasLinks: boolean;
    timeToComplete: number;
  }): void {
    const event: AnalyticsEvent = {
      event: 'content_published',
      category: 'curate',
      action: 'publish_success',
      label: metadata.category,
      value: metadata.contentLength,
      timestamp: Date.now(),
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      userId: this.getUserId(),
    };

    this.events.push(event);
    this.saveEvents();

    if (import.meta.env.DEV) {
      console.log('📊 Analytics: Content published', event, metadata);
    }

    if (import.meta.env.PROD) {
      this.sendEventToBackend(event);
    }
  }

  /**
   * Track share button click
   */
  trackShareButtonClick(
    shareType: ShareButtonClickEvent['shareType'],
    contentType: ShareButtonClickEvent['contentType'],
    shareLocation: ShareButtonClickEvent['shareLocation'],
    options: {
      contentId?: string;
      contentTitle?: string;
      shareSuccess?: boolean;
    } = {}
  ): void {
    const event: ShareButtonClickEvent = {
      event: 'click',
      category: 'share_button',
      action: 'share',
      label: `${shareType}_${contentType}`,
      shareType,
      contentType,
      contentId: options.contentId,
      contentTitle: options.contentTitle,
      shareLocation,
      shareSuccess: options.shareSuccess ?? true,
      timestamp: Date.now(),
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      userId: this.getUserId(),
    };

    this.events.push(event);
    this.saveEvents();

    if (import.meta.env.DEV) {
      console.log('📊 Analytics: Share button clicked', event);
    }

    if (import.meta.env.PROD) {
      this.sendEventToBackend(event);
    }
  }

  /**
   * Get click-through rate for publish buttons
   */
  getPublishButtonStats(): {
    totalClicks: number;
    clicksByLocation: Record<string, number>;
    clicksByUserType: Record<string, number>;
    uniqueSessions: number;
    timeRange: { start: number; end: number };
  } {
    const publishEvents = this.events.filter(
      (event): event is PublishButtonClickEvent =>
        event.category === 'publish_button' && event.action === 'click'
    );

    const clicksByLocation: Record<string, number> = {};
    const clicksByUserType: Record<string, number> = {};
    const uniqueSessions = new Set<string>();

    publishEvents.forEach(event => {
      clicksByLocation[event.buttonLocation] = (clicksByLocation[event.buttonLocation] || 0) + 1;
      clicksByUserType[event.userType] = (clicksByUserType[event.userType] || 0) + 1;
      uniqueSessions.add(event.sessionId);
    });

    const timestamps = publishEvents.map(e => e.timestamp);

    return {
      totalClicks: publishEvents.length,
      clicksByLocation,
      clicksByUserType,
      uniqueSessions: uniqueSessions.size,
      timeRange: {
        start: Math.min(...timestamps, Date.now()),
        end: Math.max(...timestamps, Date.now())
      }
    };
  }

  /**
   * Get conversion rate (clicks vs page access)
   */
  getConversionRate(): {
    buttonClicks: number;
    pageAccess: number;
    conversionRate: number;
  } {
    const buttonClicks = this.events.filter(
      event => event.category === 'publish_button' && event.action === 'click'
    ).length;

    const pageAccess = this.events.filter(
      event => event.category === 'curate' && event.action === 'access'
    ).length;

    return {
      buttonClicks,
      pageAccess,
      conversionRate: buttonClicks > 0 ? (pageAccess / buttonClicks) * 100 : 0
    };
  }

  /**
   * Get creation funnel analytics
   */
  getCreationFunnel(): {
    pageLoads: number;
    titleInputs: number;
    contentInputs: number;
    categorySelects: number;
    publishAttempts: number;
    publishSuccess: number;
    dropOffRates: Record<string, number>;
  } {
    const progressEvents = this.events.filter(
      event => event.category === 'curate' && event.action === 'progress'
    ) as CurateProgressEvent[];

    const publishedEvents = this.events.filter(
      event => event.category === 'curate' && event.action === 'publish_success'
    );

    const stepCounts = {
      pageLoads: progressEvents.filter(e => e.step === 'page_load').length,
      titleInputs: progressEvents.filter(e => e.step === 'title_input').length,
      contentInputs: progressEvents.filter(e => e.step === 'content_input').length,
      categorySelects: progressEvents.filter(e => e.step === 'category_select').length,
      publishAttempts: progressEvents.filter(e => e.step === 'publish_attempt').length,
      publishSuccess: publishedEvents.length,
    };

    const dropOffRates = {
      titleInput: stepCounts.pageLoads > 0 ? ((stepCounts.pageLoads - stepCounts.titleInputs) / stepCounts.pageLoads) * 100 : 0,
      contentInput: stepCounts.titleInputs > 0 ? ((stepCounts.titleInputs - stepCounts.contentInputs) / stepCounts.titleInputs) * 100 : 0,
      categorySelect: stepCounts.contentInputs > 0 ? ((stepCounts.contentInputs - stepCounts.categorySelects) / stepCounts.contentInputs) * 100 : 0,
      publishAttempt: stepCounts.categorySelects > 0 ? ((stepCounts.categorySelects - stepCounts.publishAttempts) / stepCounts.categorySelects) * 100 : 0,
      publishSuccess: stepCounts.publishAttempts > 0 ? ((stepCounts.publishAttempts - stepCounts.publishSuccess) / stepCounts.publishAttempts) * 100 : 0,
    };

    return {
      ...stepCounts,
      dropOffRates,
    };
  }

  /**
   * Get user journey analytics
   */
  getUserJourney(): {
    sourceBreakdown: Record<string, number>;
    returningUsers: number;
    newUsers: number;
    avgDaysBetweenVisits: number;
  } {
    const journeyEvents = this.events.filter(
      event => event.category === 'curate' && event.action === 'access'
    ) as UserJourneyEvent[];

    const sourceBreakdown: Record<string, number> = {};
    let returningUsers = 0;
    let totalDaysBetweenVisits = 0;
    let returningUserCount = 0;

    journeyEvents.forEach(event => {
      const source = event.source || 'direct';
      sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1;

      if (event.isReturningUser) {
        returningUsers++;
        if (event.daysSinceLastVisit) {
          totalDaysBetweenVisits += event.daysSinceLastVisit;
          returningUserCount++;
        }
      }
    });

    return {
      sourceBreakdown,
      returningUsers,
      newUsers: journeyEvents.length - returningUsers,
      avgDaysBetweenVisits: returningUserCount > 0 ? totalDaysBetweenVisits / returningUserCount : 0,
    };
  }

  /**
   * Get share button analytics
   */
  getShareButtonStats(): {
    totalShares: number;
    sharesByType: Record<string, number>;
    sharesByContentType: Record<string, number>;
    sharesByLocation: Record<string, number>;
    successfulShares: number;
    failedShares: number;
    successRate: number;
    popularContent: Array<{ contentId: string; contentTitle: string; shareCount: number }>;
    timeRange: { start: number; end: number };
  } {
    const shareEvents = this.events.filter(
      (event): event is ShareButtonClickEvent =>
        event.category === 'share_button' && event.action === 'share'
    );

    const sharesByType: Record<string, number> = {};
    const sharesByContentType: Record<string, number> = {};
    const sharesByLocation: Record<string, number> = {};
    const contentShares: Record<string, { title: string; count: number }> = {};
    let successfulShares = 0;
    let failedShares = 0;

    shareEvents.forEach(event => {
      sharesByType[event.shareType] = (sharesByType[event.shareType] || 0) + 1;
      sharesByContentType[event.contentType] = (sharesByContentType[event.contentType] || 0) + 1;
      sharesByLocation[event.shareLocation] = (sharesByLocation[event.shareLocation] || 0) + 1;

      if (event.shareSuccess) {
        successfulShares++;
      } else {
        failedShares++;
      }

      if (event.contentId && event.contentTitle) {
        if (!contentShares[event.contentId]) {
          contentShares[event.contentId] = { title: event.contentTitle, count: 0 };
        }
        contentShares[event.contentId].count++;
      }
    });

    const popularContent = Object.entries(contentShares)
      .map(([contentId, data]) => ({
        contentId,
        contentTitle: data.title,
        shareCount: data.count
      }))
      .sort((a, b) => b.shareCount - a.shareCount)
      .slice(0, 10);

    const timestamps = shareEvents.map(e => e.timestamp);

    return {
      totalShares: shareEvents.length,
      sharesByType,
      sharesByContentType,
      sharesByLocation,
      successfulShares,
      failedShares,
      successRate: shareEvents.length > 0 ? (successfulShares / shareEvents.length) * 100 : 0,
      popularContent,
      timeRange: {
        start: Math.min(...timestamps, Date.now()),
        end: Math.max(...timestamps, Date.now())
      }
    };
  }

  /**
   * Get time-based analytics
   */
  getTimeAnalytics(): {
    hourlyDistribution: Record<number, number>;
    weeklyDistribution: Record<number, number>;
    peakHours: number[];
    peakDays: number[];
  } {
    const allEvents = this.events.filter(
      event => event.category === 'publish_button' || event.category === 'curate' || event.category === 'share_button'
    );

    const hourlyDistribution: Record<number, number> = {};
    const weeklyDistribution: Record<number, number> = {};

    allEvents.forEach(event => {
      const date = new Date(event.timestamp);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();

      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
      weeklyDistribution[dayOfWeek] = (weeklyDistribution[dayOfWeek] || 0) + 1;
    });

    // Find peak hours (top 3)
    const peakHours = Object.entries(hourlyDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Find peak days (top 3)
    const peakDays = Object.entries(weeklyDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => parseInt(day));

    return {
      hourlyDistribution,
      weeklyDistribution,
      peakHours,
      peakDays,
    };
  }

  // Helper methods
  private detectSource(referrerUrl: string): 'discovery' | 'treasury' | 'profile' | 'direct' | 'external' | 'search' | 'notification' {
    if (!referrerUrl) return 'direct';

    if (referrerUrl.includes('copus.network') || referrerUrl.includes('localhost')) {
      if (referrerUrl.includes('/home') || referrerUrl.includes('/copus') || referrerUrl.includes('/discovery')) {
        return 'discovery';
      } else if (referrerUrl.includes('/treasury') || referrerUrl.includes('/user/')) {
        return 'treasury';
      } else if (referrerUrl.includes('/u/')) {
        return 'profile';
      } else if (referrerUrl.includes('/notification')) {
        return 'notification';
      } else if (referrerUrl.includes('search')) {
        return 'search';
      }
      return 'discovery'; // Default for internal pages
    }

    return 'external';
  }

  private isReturningUser(): boolean {
    const lastVisit = localStorage.getItem('copus_analytics_last_visit');
    return !!lastVisit;
  }

  private getDaysSinceLastVisit(): number | undefined {
    const lastVisit = localStorage.getItem('copus_analytics_last_visit');
    if (!lastVisit) return undefined;

    const lastVisitTime = parseInt(lastVisit);
    const daysDiff = Math.floor((Date.now() - lastVisitTime) / (1000 * 60 * 60 * 24));
    return daysDiff;
  }

  private updateLastVisit(): void {
    localStorage.setItem('copus_analytics_last_visit', Date.now().toString());
  }

  /**
   * Clear all stored events (for testing)
   */
  clearEvents(): void {
    this.events = [];
    localStorage.removeItem('copus_analytics_events');
  }

  /**
   * Export events for analysis
   */
  exportEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  private getUserId(): string {
    try {
      const user = localStorage.getItem('copus_user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.id?.toString() || 'unknown';
      }
    } catch (error) {
      console.warn('Failed to get user ID:', error);
    }
    return 'guest';
  }

  private async sendEventToBackend(event: AnalyticsEvent): Promise<void> {
    try {
      // TODO: 实现发送到后端的逻辑
      // await fetch('/api/analytics/events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();

// Global analytics functions for easy use
export const trackPublishClick = (
  location: 'header' | 'mobile_menu' | 'withdrawal_page' | 'other',
  isLoggedIn: boolean,
  label?: string
) => {
  analyticsService.trackPublishButtonClick(
    location,
    isLoggedIn ? 'logged_in' : 'guest',
    { label }
  );
};

export const trackCurateAccess = (source?: string) => {
  analyticsService.trackCuratePageAccess(source);
};

export const trackCurateProgress = (
  step: CurateProgressEvent['step'],
  metadata?: { progressPercent?: number; timeOnStep?: number; contentLength?: number; category?: string }
) => {
  analyticsService.trackCurateProgress(step, metadata);
};

export const trackContentPublished = (metadata: {
  category: string;
  contentLength: number;
  hasImages: boolean;
  hasLinks: boolean;
  timeToComplete: number;
}) => {
  analyticsService.trackContentPublished(metadata);
};

export const trackShareClick = (
  shareType: ShareButtonClickEvent['shareType'],
  contentType: ShareButtonClickEvent['contentType'],
  shareLocation: ShareButtonClickEvent['shareLocation'],
  options?: {
    contentId?: string;
    contentTitle?: string;
    shareSuccess?: boolean;
  }
) => {
  analyticsService.trackShareButtonClick(shareType, contentType, shareLocation, options);
};

export const getPublishStats = () => analyticsService.getPublishButtonStats();
export const getShareStats = () => analyticsService.getShareButtonStats();
export const getConversionRate = () => analyticsService.getConversionRate();
export const getCreationFunnel = () => analyticsService.getCreationFunnel();
export const getUserJourney = () => analyticsService.getUserJourney();
export const getTimeAnalytics = () => analyticsService.getTimeAnalytics();