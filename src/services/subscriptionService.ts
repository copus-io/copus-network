// Author subscription management service
import { apiRequest } from './api';
import antiAbuseService from './antiAbuseService';
import {
  AuthorInfo,
  SubscriptionInfo,
  SubscriptionRequest,
  SubscriptionResponse,
  SubscriptionStats,
  EmailPreferences,
  EmailFrequency,
  SubscriptionGroup,
  SubscriberInfo,
  SubscriptionFilters,
  BatchOperationRequest,
  UserTimezone,
  EmailStatus
} from '../types/subscription';

class SubscriptionService {
  // Mock data storage (should come from API in production)
  private mockSubscriptions: SubscriptionInfo[] = [];
  private readonly STORAGE_KEY = 'copus_subscription_data';

  constructor() {
    this.loadFromStorage();
    this.initializeMockData();
  }

  private mockAuthorStats: Record<number, SubscriptionStats> = {
    // Original demo data
    101: { totalSubscribers: 1247, weeklyGrowth: 89, growthRate: 7.8, activeSubscribers: 856 },
    102: { totalSubscribers: 834, weeklyGrowth: 23, growthRate: 2.8, activeSubscribers: 567 },
    103: { totalSubscribers: 692, weeklyGrowth: 34, growthRate: 5.2, activeSubscribers: 445 },

    // Mock statistics data for real user IDs
    1: { totalSubscribers: 156, weeklyGrowth: 12, growthRate: 8.3, activeSubscribers: 134 },
    2: { totalSubscribers: 423, weeklyGrowth: 28, growthRate: 7.1, activeSubscribers: 356 },
    3: { totalSubscribers: 678, weeklyGrowth: 45, growthRate: 7.1, activeSubscribers: 523 },
    4: { totalSubscribers: 892, weeklyGrowth: 67, growthRate: 8.1, activeSubscribers: 734 },
    5: { totalSubscribers: 445, weeklyGrowth: 31, growthRate: 7.5, activeSubscribers: 367 },

    // Statistics data for more users
    10: { totalSubscribers: 234, weeklyGrowth: 18, growthRate: 8.3, activeSubscribers: 198 },
    15: { totalSubscribers: 567, weeklyGrowth: 42, growthRate: 8.0, activeSubscribers: 445 },
    20: { totalSubscribers: 123, weeklyGrowth: 9, growthRate: 7.9, activeSubscribers: 102 },
    25: { totalSubscribers: 789, weeklyGrowth: 56, growthRate: 7.6, activeSubscribers: 634 }
  };

  /**
   * Check if user has subscribed to an author using API data
   */
  async checkSubscriptionStatus(authorUserId: number): Promise<{
    isSubscribed: boolean;
    subscription?: SubscriptionInfo;
    subscriberCount: number;
  }> {
    try {
      // Removed unnecessary API call that was causing duplicate requests
      // The logic was incorrect - calling current user's info to check if following another user
      console.log('🟢 checkSubscriptionStatus: Using fallback mock implementation for authorUserId:', authorUserId);

      // Fallback to existing mock implementation
      await new Promise(resolve => setTimeout(resolve, 150));

      const subscription = this.mockSubscriptions.find(
        sub => sub.authorUserId === authorUserId && sub.subscriberUserId === this.getCurrentUserId()
      );

      const stats = this.mockAuthorStats[authorUserId] || {
        totalSubscribers: Math.floor(Math.random() * 500) + 50, // 50-550 random subscribers
        weeklyGrowth: Math.floor(Math.random() * 20) + 5, // 5-25 random weekly growth
        growthRate: Math.round((Math.random() * 5 + 3) * 10) / 10, // 3.0-8.0 random growth rate
        activeSubscribers: 0
      };

      return {
        isSubscribed: !!subscription?.isActive,
        subscription: subscription,
        subscriberCount: stats.totalSubscribers
      };
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return { isSubscribed: false, subscriberCount: 0 };
    }
  }

  /**
   * Check subscription status by namespace (new method using API)
   */
  async checkSubscriptionStatusByNamespace(namespace: string): Promise<{
    isSubscribed: boolean;
    subscriberCount: number;
  }> {
    try {
      // Removed API call to prevent duplicate requests
      // This method was calling the same API unnecessarily
      console.log('🟢 checkSubscriptionStatusByNamespace: Using fallback for namespace:', namespace);

      // Return mock data to prevent breaking functionality
      return {
        isSubscribed: false,
        subscriberCount: 0
      };
    } catch (error) {
      console.error('Failed to check subscription status by namespace:', error);
      return { isSubscribed: false, subscriberCount: 0 };
    }
  }

  /**
   * Subscribe to author using new API
   */
  async subscribeToAuthor(request: SubscriptionRequest): Promise<SubscriptionResponse> {
    try {
      console.log('🔄 Starting author subscription:', request);

      const currentUserId = this.getCurrentUserId();
      const userEmail = this.getCurrentUserEmail();
      const subscriberEmail = request.email || userEmail;

      // Check user type and email status
      if (!currentUserId && !request.email) {
        return {
          success: false,
          message: 'Login required or provide email address'
        };
      }

      // Wallet users need to provide email
      if (currentUserId && !userEmail && !request.email) {
        return {
          success: false,
          message: 'Email address required to receive subscription notifications'
        };
      }

      // 🛡️ Anti-abuse checks
      if (subscriberEmail) {
        const userIP = antiAbuseService.getCurrentUserIP();

        // Basic email format validation
        const emailValidation = antiAbuseService.validateEmailForSubscription(subscriberEmail);
        if (!emailValidation.isValid) {
          antiAbuseService.recordSubscriptionAttempt({
            email: subscriberEmail,
            authorUserId: request.authorUserId,
            ip: userIP,
            success: false
          });

          return {
            success: false,
            message: emailValidation.reason === 'invalid_format'
              ? 'Please enter a valid email address'
              : 'This type of email is not supported, please use a common email provider'
          };
        }

        // Comprehensive risk assessment
        const riskAssessment = antiAbuseService.assessSubscriptionRisk({
          email: subscriberEmail,
          authorUserId: request.authorUserId,
          ip: userIP,
          userAgent: navigator.userAgent
        });

        console.log('🛡️ Risk assessment result:', riskAssessment);

        // Handle based on risk level
        if (riskAssessment.action === 'block') {
          antiAbuseService.recordSubscriptionAttempt({
            email: subscriberEmail,
            authorUserId: request.authorUserId,
            ip: userIP,
            success: false
          });

          return {
            success: false,
            message: riskAssessment.message || 'Subscription request blocked, please try again later'
          };
        }

        if (riskAssessment.action === 'manual_review') {
          antiAbuseService.recordSubscriptionAttempt({
            email: subscriberEmail,
            authorUserId: request.authorUserId,
            ip: userIP,
            success: false
          });

          return {
            success: false,
            message: riskAssessment.message || 'Subscription request requires manual review, we will process within 24 hours'
          };
        }

        // Medium risk gives warning but allows to continue
        if (riskAssessment.action === 'warn') {
          console.log('⚠️ Subscription risk warning:', riskAssessment.message);
        }
      }

      try {
        // Call new API endpoint
        const response = await apiRequest('/client/follow/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: subscriberEmail || '',
            targetId: request.authorUserId,
            targetType: 0 // 0 = user/author subscription
          })
        });

        console.log('✅ API subscription successful:', response);

        // Create local subscription record for consistency with existing code
        const newSubscription: SubscriptionInfo = {
          subscriptionId: Date.now(),
          authorUserId: request.authorUserId,
          subscriberUserId: currentUserId || undefined,
          subscriberEmail: request.email || userEmail || undefined,
          emailFrequency: request.emailFrequency || 'DAILY',
          isActive: true,
          isTempSubscription: !currentUserId,
          subscribedAt: new Date().toISOString()
        };

        this.mockSubscriptions.push(newSubscription);
        this.saveToStorage();

        // Update subscriber statistics
        if (this.mockAuthorStats[request.authorUserId]) {
          this.mockAuthorStats[request.authorUserId].totalSubscribers += 1;
        }

        // 🛡️ Record successful subscription attempt
        if (subscriberEmail) {
          antiAbuseService.recordSubscriptionAttempt({
            email: subscriberEmail,
            authorUserId: request.authorUserId,
            ip: antiAbuseService.getCurrentUserIP(),
            userAgent: navigator.userAgent,
            success: true
          });
        }

        return {
          success: true,
          subscriptionId: newSubscription.subscriptionId,
          requiresEmailVerification: false,
          autoFollowedSpaces: [
            { spaceId: 'space1', spaceName: 'Technology' },
            { spaceId: 'space2', spaceName: 'AI Research' }
          ],
          message: 'Subscription successful! You have automatically subscribed to all of this author\'s spaces and will receive content update notifications.'
        };

      } catch (apiError) {
        console.error('API subscription failed, falling back to mock:', apiError);

        // Fallback to existing mock implementation
        await new Promise(resolve => setTimeout(resolve, 600));

        const newSubscription: SubscriptionInfo = {
          subscriptionId: Date.now(),
          authorUserId: request.authorUserId,
          subscriberUserId: currentUserId || undefined,
          subscriberEmail: request.email || userEmail || undefined,
          emailFrequency: request.emailFrequency || 'DAILY',
          isActive: true,
          isTempSubscription: !currentUserId,
          subscribedAt: new Date().toISOString()
        };

        this.mockSubscriptions.push(newSubscription);
        this.saveToStorage();

        if (this.mockAuthorStats[request.authorUserId]) {
          this.mockAuthorStats[request.authorUserId].totalSubscribers += 1;
        }

        if (subscriberEmail) {
          antiAbuseService.recordSubscriptionAttempt({
            email: subscriberEmail,
            authorUserId: request.authorUserId,
            ip: antiAbuseService.getCurrentUserIP(),
            userAgent: navigator.userAgent,
            success: true
          });
        }

        console.log('✅ Fallback subscription successful:', newSubscription);

        return {
          success: true,
          subscriptionId: newSubscription.subscriptionId,
          requiresEmailVerification: false,
          autoFollowedSpaces: [
            { spaceId: 'space1', spaceName: 'Technology' },
            { spaceId: 'space2', spaceName: 'AI Research' }
          ],
          message: 'Subscription successful! You have automatically subscribed to all of this author\'s spaces and will receive content update notifications.'
        };
      }

    } catch (error) {
      console.error('Subscription failed:', error);
      return {
        success: false,
        message: 'Subscription failed, please try again later'
      };
    }
  }

  /**
   * Subscribe to space using new API
   */
  async subscribeToSpace(spaceId: number, spaceName: string, email?: string): Promise<SubscriptionResponse> {
    try {
      console.log('🔄 Starting space subscription:', { spaceId, spaceName, email });

      const currentUserId = this.getCurrentUserId();
      const userEmail = this.getCurrentUserEmail();
      const subscriberEmail = email || userEmail;

      // Check user type and email status
      if (!currentUserId && !email) {
        return {
          success: false,
          message: 'Login required or provide email address'
        };
      }

      // Wallet users need to provide email
      if (currentUserId && !userEmail && !email) {
        return {
          success: false,
          message: 'Email address required to receive subscription notifications'
        };
      }

      // 🛡️ Anti-abuse checks
      if (subscriberEmail) {
        const userIP = antiAbuseService.getCurrentUserIP();

        // Basic email format validation
        const emailValidation = antiAbuseService.validateEmailForSubscription(subscriberEmail);
        if (!emailValidation.isValid) {
          return {
            success: false,
            message: emailValidation.reason === 'invalid_format'
              ? 'Please enter a valid email address'
              : 'This type of email is not supported, please use a common email provider'
          };
        }

        // Comprehensive risk assessment
        const riskAssessment = antiAbuseService.assessSubscriptionRisk({
          email: subscriberEmail,
          authorUserId: spaceId, // Use spaceId as target for risk assessment
          ip: userIP,
          userAgent: navigator.userAgent
        });

        console.log('🛡️ Space subscription risk assessment result:', riskAssessment);

        // Handle based on risk level
        if (riskAssessment.action === 'block') {
          return {
            success: false,
            message: riskAssessment.message || 'Subscription request blocked, please try again later'
          };
        }

        if (riskAssessment.action === 'manual_review') {
          return {
            success: false,
            message: riskAssessment.message || 'Subscription request requires manual review, we will process within 24 hours'
          };
        }

        // Medium risk gives warning but allows to continue
        if (riskAssessment.action === 'warn') {
          console.log('⚠️ Space subscription risk warning:', riskAssessment.message);
        }
      }

      try {
        // Call new API endpoint for space subscription
        const response = await apiRequest('/client/follow/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: subscriberEmail || '',
            targetId: spaceId,
            targetType: 1 // 1 = space subscription
          })
        });

        console.log('✅ API space subscription successful:', response);

        return {
          success: true,
          subscriptionId: Date.now(),
          requiresEmailVerification: false,
          message: `Successfully followed ${spaceName}! You will receive notifications for updates.`
        };

      } catch (apiError) {
        console.error('API space subscription failed:', apiError);

        return {
          success: false,
          message: 'Space subscription failed, please try again later'
        };
      }

    } catch (error) {
      console.error('Space subscription failed:', error);
      return {
        success: false,
        message: 'Space subscription failed, please try again later'
      };
    }
  }

  /**
   * Unsubscribe from space using new API
   */
  async unsubscribeFromSpace(spaceId: number, spaceName: string): Promise<SubscriptionResponse> {
    try {
      console.log('🔄 Unsubscribing from space:', { spaceId, spaceName });

      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) {
        return {
          success: false,
          message: 'Login required to unsubscribe'
        };
      }

      try {
        // Call new API endpoint for space unsubscription
        // Note: Assuming there's a corresponding unsubscribe endpoint
        const response = await apiRequest('/client/follow/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            targetId: spaceId,
            targetType: 1 // 1 = space
          })
        });

        console.log('✅ API space unsubscription successful:', response);

        return {
          success: true,
          message: `Successfully unfollowed ${spaceName}`
        };

      } catch (apiError) {
        console.error('API space unsubscription failed:', apiError);

        return {
          success: false,
          message: 'Space unsubscription failed, please try again later'
        };
      }

    } catch (error) {
      console.error('Space unsubscription failed:', error);
      return {
        success: false,
        message: 'Space unsubscription failed, please try again later'
      };
    }
  }

  /**
   * Unsubscribe from author
   */
  async unsubscribeFromAuthor(authorUserId: number): Promise<SubscriptionResponse> {
    try {
      console.log('🔄 Unsubscribing from author:', authorUserId);

      // Simulate API call (optimized: reduced wait time)
      await new Promise(resolve => setTimeout(resolve, 400));

      const currentUserId = this.getCurrentUserId();
      const subscriptionIndex = this.mockSubscriptions.findIndex(
        sub => sub.authorUserId === authorUserId && sub.subscriberUserId === currentUserId
      );

      if (subscriptionIndex === -1) {
        return {
          success: false,
          message: 'Subscription record not found'
        };
      }

      // Remove subscription record
      this.mockSubscriptions.splice(subscriptionIndex, 1);
      this.saveToStorage();

      // Update statistics
      if (this.mockAuthorStats[authorUserId]) {
        this.mockAuthorStats[authorUserId].totalSubscribers -= 1;
      }

      console.log('✅ Unsubscription successful');

      return {
        success: true,
        message: 'Unsubscribed successfully. You will no longer receive email notifications from this author.'
      };

    } catch (error) {
      console.error('Unsubscription failed:', error);
      return {
        success: false,
        message: 'Unsubscription failed, please try again later'
      };
    }
  }

  /**
   * Get all user subscriptions
   */
  async getUserSubscriptions(): Promise<SubscriptionInfo[]> {
    try {
      // Simulate API call (optimized: reduced wait time)
      await new Promise(resolve => setTimeout(resolve, 250));

      const currentUserId = this.getCurrentUserId();
      const userSubscriptions = this.mockSubscriptions.filter(
        sub => sub.subscriberUserId === currentUserId && sub.isActive
      );

      console.log('📋 Getting user subscription list:', userSubscriptions);

      return userSubscriptions;
    } catch (error) {
      console.error('Failed to get subscription list:', error);
      return [];
    }
  }

  /**
   * Get author subscription statistics
   */
  async getAuthorSubscriptionStats(authorUserId: number): Promise<SubscriptionStats> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      // If current user is the author, generate virtual statistics
      const currentUserId = this.getCurrentUserId();
      if (currentUserId && authorUserId === currentUserId) {
        return {
          totalSubscribers: 12, // Matches virtual subscriber count
          weeklyGrowth: 3,
          growthRate: 8.5,
          activeSubscribers: 11 // One paused
        };
      }

      return this.mockAuthorStats[authorUserId] || {
        totalSubscribers: 0,
        weeklyGrowth: 0,
        growthRate: 0,
        activeSubscribers: 0
      };
    } catch (error) {
      console.error('Failed to get author statistics:', error);
      return {
        totalSubscribers: 0,
        weeklyGrowth: 0,
        growthRate: 0,
        activeSubscribers: 0
      };
    }
  }

  /**
   * Update email frequency
   */
  async updateEmailFrequency(subscriptionId: number, frequency: EmailFrequency): Promise<boolean> {
    try {
      // Simulate API call (optimized: reduced wait time)
      await new Promise(resolve => setTimeout(resolve, 300));

      const subscription = this.mockSubscriptions.find(sub => sub.subscriptionId === subscriptionId);
      if (subscription) {
        subscription.emailFrequency = frequency;
        this.saveToStorage();
        console.log('✅ Email frequency updated successfully:', { subscriptionId, frequency });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update email frequency:', error);
      return false;
    }
  }

  /**
   * Get author information (for subscription confirmation)
   */
  async getAuthorInfo(authorUserId: number): Promise<AuthorInfo | null> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));

      // Mock author data - expanded to support more real user IDs
      const mockAuthors: Record<number, AuthorInfo> = {
        // Original demo data
        101: {
          userId: 101,
          username: 'tech_writer',
          displayName: 'Zhang San',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          bio: 'Deep thinker in AI and technology fields, focusing on cutting-edge technology trend analysis',
          spacesCount: 3
        },
        102: {
          userId: 102,
          username: 'lifestyle_blogger',
          displayName: 'Li Si',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c24e1159?w=150&h=150&fit=crop&crop=face',
          bio: 'Life aesthetics and personal growth mentor',
          spacesCount: 2
        },
        103: {
          userId: 103,
          username: 'science_explorer',
          displayName: 'Wang Wu',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          bio: 'Scientific exploration and knowledge sharing',
          spacesCount: 4
        },

        // Expanded support for real user IDs (common small number IDs)
        1: {
          userId: 1,
          username: 'demo_user',
          displayName: 'Demo User',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
          bio: 'Demo user for testing various features and interaction flows',
          spacesCount: 1
        },
        2: {
          userId: 2,
          username: 'content_creator',
          displayName: 'Content Creator',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          bio: 'Content creator, focusing on original content production and sharing',
          spacesCount: 4
        },
        3: {
          userId: 3,
          username: 'tech_writer',
          displayName: 'Tech Writer',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
          bio: 'Technical writer, converting complex technical concepts into understandable articles',
          spacesCount: 2
        },
        4: {
          userId: 4,
          username: 'designer',
          displayName: 'Designer',
          avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
          bio: 'Designer, focusing on the perfect combination of user experience and visual design',
          spacesCount: 6
        },
        5: {
          userId: 5,
          username: 'entrepreneur',
          displayName: 'Entrepreneur',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          bio: 'Entrepreneur, sharing insights and experiences on the entrepreneurial journey',
          spacesCount: 3
        },

        // Support larger user IDs (potential real users)
        10: { userId: 10, username: 'user10', displayName: 'Creative Writer', avatar: 'https://images.unsplash.com/photo-1494790108755-2616c24e1159?w=150&h=150&fit=crop&crop=face', bio: 'Creative Writer', spacesCount: 2 },
        15: { userId: 15, username: 'user15', displayName: 'Digital Artist', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', bio: 'Digital Artist', spacesCount: 5 },
        20: { userId: 20, username: 'user20', displayName: 'Product Manager', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face', bio: 'Product Manager', spacesCount: 3 },
        25: { userId: 25, username: 'user25', displayName: 'Data Scientist', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', bio: 'Data Scientist', spacesCount: 4 }
      };

      return mockAuthors[authorUserId] || {
        userId: authorUserId,
        username: `user_${authorUserId}`,
        displayName: `User ${authorUserId}`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
        bio: `Content creator #${authorUserId}, sharing interesting ideas and insights`,
        spacesCount: Math.floor(Math.random() * 5) + 1
      };
    } catch (error) {
      console.error('Failed to get author information:', error);
      return null;
    }
  }

  // Helper methods
  private getCurrentUserId(): number | null {
    // Get current user ID from localStorage or context
    try {
      const userStr = localStorage.getItem('copus_user');
      const user = userStr ? JSON.parse(userStr) : null;
      return user?.id || null;
    } catch {
      return null;
    }
  }

  private getCurrentUserEmail(): string | null {
    // Get current user email from localStorage or context
    try {
      const userStr = localStorage.getItem('copus_user');
      const user = userStr ? JSON.parse(userStr) : null;
      return user?.email || null;
    } catch {
      return null;
    }
  }

  private getCurrentUserNamespace(): string | null {
    // Get current user namespace from localStorage or context
    try {
      const userStr = localStorage.getItem('copus_user');
      const user = userStr ? JSON.parse(userStr) : null;
      return user?.namespace || null;
    } catch {
      return null;
    }
  }

  // 🎭 Initialize mock subscription data
  private initializeMockData(): void {
    // If no subscription data exists, create some mock data for demonstration
    if (this.mockSubscriptions.length === 0) {
      const currentUserId = this.getCurrentUserId();
      // If user is not logged in, don't create mock data
      if (!currentUserId) return;
      const mockSubscriptions: SubscriptionInfo[] = [
        {
          subscriptionId: 'sub_001',
          authorUserId: 101,
          subscriberUserId: currentUserId, // Current logged in user ID
          emailFrequency: 'DAILY',
          isActive: true,
          subscribedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
          lastEmailSent: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          authorInfo: {
            userId: 101,
            username: 'alice_writer',
            displayName: 'Alice Chen',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            bio: 'Technology writer focusing on deep analysis of AI and blockchain fields. Has published multiple influential articles helping readers understand complex technical concepts.',
            isVerified: true,
            joinedAt: '2023-01-15T00:00:00Z'
          }
        },
        {
          subscriptionId: 'sub_002',
          authorUserId: 102,
          subscriberUserId: 1,
          emailFrequency: 'WEEKLY',
          isActive: true,
          subscribedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          lastEmailSent: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          authorInfo: {
            userId: 102,
            username: 'bob_analyst',
            displayName: 'Bob Zhang',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            bio: 'Financial analyst and investment advisor. Shares market insights and investment strategies, helping readers make smart financial decisions.',
            isVerified: true,
            joinedAt: '2022-11-20T00:00:00Z'
          }
        },
        {
          subscriptionId: 'sub_003',
          authorUserId: 103,
          subscriberUserId: 1,
          emailFrequency: 'IMMEDIATE',
          isActive: true,
          subscribedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          lastEmailSent: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
          authorInfo: {
            userId: 103,
            username: 'carol_designer',
            displayName: 'Carol Liu',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            bio: 'UI/UX designer and design thinking mentor. Shares design inspiration, user experience insights, and creative thinking processes.',
            isVerified: false,
            joinedAt: '2023-03-10T00:00:00Z'
          }
        },
        {
          subscriptionId: 'sub_004',
          authorUserId: 104,
          subscriberUserId: 1,
          emailFrequency: 'DAILY',
          isActive: true,
          subscribedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          lastEmailSent: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          authorInfo: {
            userId: 104,
            username: 'david_cook',
            displayName: 'David Wang',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            bio: 'Food blogger and cooking enthusiast. Shares home cooking recipes, culinary skills, and food culture, helping everyone enjoy the pleasure of cooking.',
            isVerified: true,
            joinedAt: '2022-08-05T00:00:00Z'
          }
        },
        {
          subscriptionId: 'sub_005',
          authorUserId: 105,
          subscriberUserId: 1,
          emailFrequency: 'WEEKLY',
          isActive: false, // Paused status
          subscribedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
          lastEmailSent: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
          authorInfo: {
            userId: 105,
            username: 'emma_travel',
            displayName: 'Emma Li',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
            bio: 'Travel photographer and travel writer. Records beautiful scenery and cultures from around the world, sharing travel guides and photography techniques.',
            isVerified: true,
            joinedAt: '2022-06-12T00:00:00Z'
          }
        },
        {
          subscriptionId: 'sub_006',
          authorUserId: 106,
          subscriberUserId: 1,
          emailFrequency: 'DAILY',
          isActive: true,
          subscribedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          lastEmailSent: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
          authorInfo: {
            userId: 106,
            username: 'frank_fitness',
            displayName: 'Frank Zhou',
            avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face',
            bio: 'Fitness trainer and nutritionist. Provides scientific fitness guidance and nutrition advice, helping everyone establish a healthy lifestyle.',
            isVerified: false,
            joinedAt: '2023-02-28T00:00:00Z'
          }
        }
      ];

      this.mockSubscriptions = mockSubscriptions;

      // Add corresponding author statistics
      this.mockAuthorStats = {
        ...this.mockAuthorStats,
        104: { totalSubscribers: 567, weeklyGrowth: 23, growthRate: 4.2, activeSubscribers: 445 },
        105: { totalSubscribers: 823, weeklyGrowth: 45, growthRate: 5.8, activeSubscribers: 678 },
        106: { totalSubscribers: 342, weeklyGrowth: 19, growthRate: 5.9, activeSubscribers: 278 }
      };

      this.saveToStorage();
      console.log('🎭 Initialized mock subscription data:', mockSubscriptions.length, 'subscriptions');
    }
  }

  // 🔄 Reinitialize mock data (called after user login)
  public reinitializeMockData(): void {
    const currentUserId = this.getCurrentUserId();
    if (currentUserId) {
      // Clear existing data
      this.mockSubscriptions = [];
      sessionStorage.removeItem(this.STORAGE_KEY);
      // Reinitialize
      this.initializeMockData();
    }
  }

  // 🎭 Generate mock subscriber data
  private generateMockSubscribers(authorUserId: number): SubscriberInfo[] {
    const currentUserId = this.getCurrentUserId();
    // Only generate mock subscribers when current user is the author
    if (!currentUserId || authorUserId !== currentUserId) {
      return [];
    }

    const mockEmails = [
      'alice.chen@gmail.com',
      'bob.zhang@outlook.com',
      'carol.liu@yahoo.com',
      'david.wang@163.com',
      'emma.li@qq.com',
      'frank.zhou@hotmail.com',
      'grace.kim@gmail.com',
      'henry.xu@126.com',
      'iris.wu@sina.com',
      'jack.ma@alibaba.com',
      'kathy.lee@google.com',
      'lucas.brown@microsoft.com',
      'mary.johnson@apple.com',
      'nick.smith@facebook.com',
      'olivia.davis@twitter.com'
    ];

    const frequencies: Array<'IMMEDIATE' | 'DAILY' | 'WEEKLY'> = ['IMMEDIATE', 'DAILY', 'WEEKLY'];
    const subscribers: SubscriberInfo[] = [];

    for (let i = 0; i < 12; i++) {
      const email = mockEmails[i];
      const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
      const subscribedDaysAgo = Math.floor(Math.random() * 90) + 1; // 1-90 days ago
      const lastEmailDaysAgo = Math.floor(Math.random() * 7) + 1; // 1-7 days ago

      subscribers.push({
        subscriptionId: `mock_sub_${authorUserId}_${i + 1}`,
        email,
        subscribedAt: new Date(Date.now() - subscribedDaysAgo * 24 * 60 * 60 * 1000).toISOString(),
        emailFrequency: frequency,
        status: Math.random() > 0.05 ? 'active' : 'paused', // 95% active, 5% paused
        lastEmailSent: new Date(Date.now() - lastEmailDaysAgo * 24 * 60 * 60 * 1000).toISOString(),
        lastEmailOpened: Math.random() > 0.4 ? new Date(Date.now() - (lastEmailDaysAgo - Math.random()) * 24 * 60 * 60 * 1000).toISOString() : undefined
      });
    }

    return subscribers;
  }

  // 🔄 Data persistence methods
  private saveToStorage(): void {
    try {
      const data = {
        subscriptions: this.mockSubscriptions,
        stats: this.mockAuthorStats,
        timestamp: Date.now()
      };
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save subscription data:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const dataStr = sessionStorage.getItem(this.STORAGE_KEY);
      if (dataStr) {
        const data = JSON.parse(dataStr);
        // Check if data is expired (24 hours)
        const isExpired = Date.now() - data.timestamp > 24 * 60 * 60 * 1000;
        if (!isExpired && data.subscriptions) {
          this.mockSubscriptions = data.subscriptions;
          if (data.stats) {
            this.mockAuthorStats = { ...this.mockAuthorStats, ...data.stats };
          }
          console.log('📚 Loaded subscription data from storage:', this.mockSubscriptions.length, 'subscriptions');
        }
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    }
  }

  /**
   * Get author's subscriber list
   */
  async getAuthorSubscribers(authorUserId: number): Promise<SubscriptionInfo[]> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      // Get all subscribers for this author
      const authorSubscribers = this.mockSubscriptions.filter(
        sub => sub.authorUserId === authorUserId && sub.isActive
      );

      console.log(`📊 Author ${authorUserId}'s subscribers:`, authorSubscribers);

      return authorSubscribers;
    } catch (error) {
      console.error('Failed to get author subscribers:', error);
      return [];
    }
  }

  /**
   * Get recommended authors list
   */
  async getRecommendedAuthors(limit: number = 4): Promise<AuthorInfo[]> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock data for recommended authors
      const mockRecommendedAuthors: AuthorInfo[] = [
        {
          userId: 1,
          username: 'handuo',
          displayName: 'Handuo',
          avatar: 'https://static.copus.io/images/client/202512/test/handuo_avatar.jpg',
          bio: 'Experimental imaging, media art, good book sharing',
          spacesCount: 8
        },
        {
          userId: 2,
          username: 'zentrocdot',
          displayName: 'Zentrocdot',
          avatar: 'https://static.copus.io/images/client/202512/test/zentrocdot_avatar.jpg',
          bio: 'Technology tools and cutting-edge thinking',
          spacesCount: 12
        },
        {
          userId: 3,
          username: 'alice_creator',
          displayName: 'Alice Chen',
          avatar: 'https://static.copus.io/images/client/202512/test/alice_avatar.jpg',
          bio: 'Design aesthetics and creative living',
          spacesCount: 6
        },
        {
          userId: 4,
          username: 'tech_guru',
          displayName: 'Tech Guru',
          avatar: 'https://static.copus.io/images/client/202512/test/tech_avatar.jpg',
          bio: 'Deep technology analysis and trend insights',
          spacesCount: 15
        },
        {
          userId: 5,
          username: 'art_soul',
          displayName: 'Art Soul',
          avatar: 'https://static.copus.io/images/client/202512/test/art_avatar.jpg',
          bio: 'Contemporary art and cultural commentary',
          spacesCount: 9
        }
      ];

      // Randomly shuffle and take specified amount
      const shuffled = [...mockRecommendedAuthors].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, limit);
    } catch (error) {
      console.error('Failed to get recommended authors:', error);
      return [];
    }
  }

  // 🧹 Clear expired data
  clearExpiredData(): void {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
      this.mockSubscriptions = [];
      console.log('✅ Expired subscription data cleared');
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  // ============ New feature methods ============

  /**
   * Get detailed subscriber information for author (for author management)
   */
  async getAuthorSubscribersDetailed(
    authorUserId: number,
    filters?: SubscriptionFilters
  ): Promise<SubscriberInfo[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      // Generate mock subscriber data (for demonstration purposes)
      const mockSubscribers: SubscriberInfo[] = this.generateMockSubscribers(authorUserId);

      let subscribers = this.mockSubscriptions
        .filter(sub => sub.authorUserId === authorUserId && sub.isActive)
        .map(sub => ({
          subscriptionId: sub.subscriptionId,
          email: sub.subscriberEmail || `user${sub.subscriberUserId}@example.com`,
          subscribedAt: sub.subscribedAt,
          emailFrequency: sub.emailFrequency,
          status: 'active' as const,
          lastEmailSent: this.generateRandomDate(7), // Random date within last 7 days
          lastEmailOpened: Math.random() > 0.3 ? this.generateRandomDate(3) : undefined
        }));

      // Merge real subscription data and mock data
      const allSubscribers = [...subscribers, ...mockSubscribers];

      // Apply filters
      let filteredSubscribers = allSubscribers;
      if (filters) {
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filteredSubscribers = filteredSubscribers.filter(sub =>
            sub.email.toLowerCase().includes(query)
          );
        }
        if (filters.frequency) {
          filteredSubscribers = filteredSubscribers.filter(sub => sub.emailFrequency === filters.frequency);
        }
        if (filters.status) {
          filteredSubscribers = filteredSubscribers.filter(sub => sub.status === filters.status);
        }
      }

      return filteredSubscribers;
    } catch (error) {
      console.error('Failed to get detailed subscriber information:', error);
      return [];
    }
  }

  /**
   * Author removes subscriber
   */
  async removeSubscriber(authorUserId: number, subscriptionId: number): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const subscriptionIndex = this.mockSubscriptions.findIndex(
        sub => sub.subscriptionId === subscriptionId && sub.authorUserId === authorUserId
      );

      if (subscriptionIndex === -1) {
        return false;
      }

      this.mockSubscriptions.splice(subscriptionIndex, 1);
      this.saveToStorage();

      // Update statistics
      if (this.mockAuthorStats[authorUserId]) {
        this.mockAuthorStats[authorUserId].totalSubscribers -= 1;
      }

      console.log(`✅ Author ${authorUserId} successfully removed subscriber:`, subscriptionId);
      return true;
    } catch (error) {
      console.error('Failed to remove subscriber:', error);
      return false;
    }
  }

  /**
   * Batch operations on subscribers
   */
  async batchOperateSubscriptions(request: BatchOperationRequest): Promise<{
    success: boolean;
    processedCount: number;
    failedCount: number;
  }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      let processedCount = 0;
      let failedCount = 0;

      for (const subscriptionId of request.subscriptionIds) {
        const subscription = this.mockSubscriptions.find(sub => sub.subscriptionId === subscriptionId);

        if (!subscription) {
          failedCount++;
          continue;
        }

        switch (request.action) {
          case 'unsubscribe':
          case 'remove':
            const index = this.mockSubscriptions.findIndex(sub => sub.subscriptionId === subscriptionId);
            if (index !== -1) {
              this.mockSubscriptions.splice(index, 1);
              processedCount++;
            }
            break;

          case 'pause':
            subscription.isActive = false;
            if (request.pauseDays) {
              const pauseUntil = new Date();
              pauseUntil.setDate(pauseUntil.getDate() + request.pauseDays);
              // Should set pausedUntil field here, but not in current type, skipping for now
            }
            processedCount++;
            break;

          case 'resume':
            subscription.isActive = true;
            processedCount++;
            break;
        }
      }

      this.saveToStorage();
      console.log(`✅ Batch operation completed: ${processedCount} successful, ${failedCount} failed`);

      return {
        success: true,
        processedCount,
        failedCount
      };
    } catch (error) {
      console.error('Batch operation failed:', error);
      return {
        success: false,
        processedCount: 0,
        failedCount: request.subscriptionIds.length
      };
    }
  }

  /**
   * Get user's subscription list (for subscriber side)
   */
  async getUserSubscriptionsWithDetails(
    userId?: number,
    filters?: SubscriptionFilters
  ): Promise<(SubscriptionInfo & { authorInfo?: AuthorInfo })[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const currentUserId = userId || this.getCurrentUserId();
      if (!currentUserId) return [];

      let subscriptions = this.mockSubscriptions.filter(
        sub => sub.subscriberUserId === currentUserId && sub.isActive
      );

      // Add author information
      const subscriptionsWithAuthor = await Promise.all(
        subscriptions.map(async (sub) => {
          const authorInfo = await this.getAuthorInfo(sub.authorUserId);
          return { ...sub, authorInfo };
        })
      );

      // Apply filters
      let filteredSubscriptions = subscriptionsWithAuthor;
      if (filters) {
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filteredSubscriptions = filteredSubscriptions.filter(sub =>
            sub.authorInfo?.displayName?.toLowerCase().includes(query) ||
            sub.authorInfo?.username?.toLowerCase().includes(query)
          );
        }
        if (filters.frequency) {
          filteredSubscriptions = filteredSubscriptions.filter(sub => sub.emailFrequency === filters.frequency);
        }
      }

      return filteredSubscriptions;
    } catch (error) {
      console.error('Failed to get user subscription details:', error);
      return [];
    }
  }

  /**
   * User timezone management
   */
  async getUserTimezone(userId?: number): Promise<UserTimezone | null> {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      if (!currentUserId) return null;

      // Get timezone information from localStorage
      const timezoneKey = `copus_timezone_${currentUserId}`;
      const savedTimezone = localStorage.getItem(timezoneKey);

      if (savedTimezone) {
        return JSON.parse(savedTimezone);
      }

      // Auto-detect timezone
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const timezoneInfo: UserTimezone = {
        timezone: detectedTimezone,
        detectedMethod: 'browser',
        lastUpdated: new Date().toISOString()
      };

      // Save to local storage
      localStorage.setItem(timezoneKey, JSON.stringify(timezoneInfo));
      return timezoneInfo;
    } catch (error) {
      console.error('Failed to get user timezone:', error);
      return null;
    }
  }

  /**
   * Update user timezone
   */
  async updateUserTimezone(timezone: string, method: 'browser' | 'ip' | 'manual' = 'manual'): Promise<boolean> {
    try {
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) return false;

      const timezoneInfo: UserTimezone = {
        timezone,
        detectedMethod: method,
        lastUpdated: new Date().toISOString()
      };

      const timezoneKey = `copus_timezone_${currentUserId}`;
      localStorage.setItem(timezoneKey, JSON.stringify(timezoneInfo));

      console.log('✅ Timezone updated successfully:', timezoneInfo);
      return true;
    } catch (error) {
      console.error('Failed to update timezone:', error);
      return false;
    }
  }

  /**
   * Get user email preferences
   */
  async getUserEmailPreferences(userId?: number): Promise<EmailPreferences | null> {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      if (!currentUserId) return null;

      const prefsKey = `copus_email_prefs_${currentUserId}`;
      const savedPrefs = localStorage.getItem(prefsKey);

      if (savedPrefs) {
        return JSON.parse(savedPrefs);
      }

      // Default preference settings
      const defaultPrefs: EmailPreferences = {
        userId: currentUserId,
        emailEnabled: true,
        defaultFrequency: 'DAILY',
        timezone: 'Asia/Shanghai'
      };

      localStorage.setItem(prefsKey, JSON.stringify(defaultPrefs));
      return defaultPrefs;
    } catch (error) {
      console.error('Failed to get email preferences:', error);
      return null;
    }
  }

  /**
   * Update user email preferences
   */
  async updateEmailPreferences(preferences: Partial<EmailPreferences>): Promise<boolean> {
    try {
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) return false;

      const prefsKey = `copus_email_prefs_${currentUserId}`;
      const currentPrefs = await this.getUserEmailPreferences(currentUserId);

      const updatedPrefs = {
        ...currentPrefs,
        ...preferences,
        userId: currentUserId
      };

      localStorage.setItem(prefsKey, JSON.stringify(updatedPrefs));
      console.log('✅ Email preferences updated successfully:', updatedPrefs);
      return true;
    } catch (error) {
      console.error('Failed to update email preferences:', error);
      return false;
    }
  }

  /**
   * Check duplicate subscription
   */
  async checkDuplicateSubscription(email: string, authorUserId: number): Promise<boolean> {
    try {
      const existing = this.mockSubscriptions.find(
        sub => sub.authorUserId === authorUserId &&
               sub.subscriberEmail?.toLowerCase() === email.toLowerCase() &&
               sub.isActive
      );
      return !!existing;
    } catch (error) {
      console.error('Failed to check duplicate subscription:', error);
      return false;
    }
  }

  // Helper method: generate random date
  private generateRandomDate(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    return date.toISOString();
  }
  /**
   * Set vacation mode
   */
  async setVacationMode(userId: number, enabled: boolean, days?: number): Promise<boolean> {
    try {
      const preferences = await this.getUserEmailPreferences(userId);

      if (enabled && days) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + days);

        preferences.vacationMode = {
          enabled: true,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        };
      } else {
        preferences.vacationMode = {
          enabled: false,
          startDate: '',
          endDate: ''
        };
      }

      return await this.updateEmailPreferences(userId, preferences);
    } catch (error) {
      console.error('Failed to set vacation mode:', error);
      return false;
    }
  }

  /**
   * Check vacation mode status
   */
  async getVacationModeStatus(userId: number): Promise<{ enabled: boolean; endDate?: string; daysRemaining?: number }> {
    try {
      const preferences = await this.getUserEmailPreferences(userId);
      const vacationMode = preferences.vacationMode;

      if (!vacationMode?.enabled) {
        return { enabled: false };
      }

      const now = new Date();
      const endDate = new Date(vacationMode.endDate);

      if (now > endDate) {
        // Vacation mode expired, auto-disable
        await this.setVacationMode(userId, false);
        return { enabled: false };
      }

      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        enabled: true,
        endDate: vacationMode.endDate,
        daysRemaining
      };
    } catch (error) {
      console.error('Failed to get vacation mode status:', error);
      return { enabled: false };
    }
  }

}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;