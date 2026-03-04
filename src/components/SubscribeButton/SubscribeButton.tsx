import React, { useState, useEffect } from 'react';
// createPortal no longer needed - email input is inline
import subscriptionService from '../../services/subscriptionService';
import { AuthService } from '../../services/authService';
import { AuthorInfo, SubscribeButtonState, EmailFrequency, SPACE_TYPES } from '../../types/subscription';

interface SubscribeButtonProps {
  authorUserId?: number;
  authorName?: string;
  authorNamespace?: string; // Add namespace for real subscription status
  spaceId?: number;
  spaceName?: string;
  spaceNamespace?: string; // Add space namespace for space subscription status
  size?: 'small' | 'medium' | 'large';
  onSubscriptionChange?: (isSubscribed: boolean) => void;
  onSubscriberCountLoaded?: (count: number) => void;
  className?: string;
  // New configuration options
  showSubscriberCount?: boolean;
  variant?: 'default' | 'minimal' | 'floating';
  position?: 'inline' | 'fixed-bottom' | 'sticky';
  // Space type check - private spaces don't show subscribe button
  spaceType?: number;
  // Subscription type
  subscriptionType?: 'author' | 'space';
  // Initial subscription state from parent component
  initialIsSubscribed?: boolean;
  initialSubscriberCount?: number;
  // Compact mode: show just button, expand to email input on click
  compact?: boolean;
}

/**
 * Subscribe Button Component V2 - Full Version
 *
 * Features:
 * - 💪 Forced high contrast styles, ensuring visibility on any background
 * - 🎨 Multiple visual variants and sizes
 * - 📧 Complete email input and subscription confirmation flow
 * - 👥 Supports all user types (email, wallet, anonymous)
 * - 📊 Real-time subscriber count display
 * - 🔧 Highly customizable configuration options
 */
const SubscribeButton: React.FC<SubscribeButtonProps> = ({
  authorUserId,
  authorName = 'Author',
  authorNamespace,
  spaceId,
  spaceName = 'Space',
  spaceNamespace,
  size = 'medium',
  onSubscriptionChange,
  onSubscriberCountLoaded,
  className = '',
  showSubscriberCount = false,
  variant = 'default',
  position = 'inline',
  spaceType,
  subscriptionType = 'author',
  initialIsSubscribed,
  initialSubscriberCount,
  compact = false
}) => {
  const [state, setState] = useState<SubscribeButtonState>({
    isSubscribed: initialIsSubscribed ?? false,
    isLoading: initialIsSubscribed === undefined, // Only loading if no initial value provided
    subscriberCount: initialSubscriberCount ?? 0,
    canSubscribe: true
  });


  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showUnsubDropdown, setShowUnsubDropdown] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [authorInfo, setAuthorInfo] = useState<AuthorInfo | null>(null);

  // Check if logged-in user has email
  const [loggedInUserHasEmail, setLoggedInUserHasEmail] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('copus_user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (userData.email && userData.email.trim()) {
          setLoggedInUserHasEmail(true);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Check subscription status
  useEffect(() => {
    loadSubscriptionStatus();
    if (subscriptionType === 'author') {
      loadAuthorInfo();
    }
  }, [authorUserId, authorNamespace, spaceId, spaceNamespace, subscriptionType]);

  const loadSubscriptionStatus = async () => {
    // If we already have initial values, don't load again
    if (initialIsSubscribed !== undefined && initialSubscriberCount !== undefined) {
      onSubscriberCountLoaded?.(initialSubscriberCount);
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      if (subscriptionType === 'space' && spaceNamespace) {
        // Use space/info API to get space subscription status
        const response = await AuthService.getSpaceInfo(spaceNamespace);
        const spaceInfo = response.data || response; // Handle both wrapped and unwrapped response
        setState(prev => ({
          ...prev,
          isSubscribed: spaceInfo.isFollowed || false,
          subscriberCount: spaceInfo.followerCount || 0,
          isLoading: false
        }));
        onSubscriberCountLoaded?.(spaceInfo.followerCount || 0);
      } else if (subscriptionType === 'author' && authorNamespace) {
        // Use real API to get user subscription status
        const userInfo = await AuthService.getOtherUserTreasuryInfoByNamespace(authorNamespace);
        setState(prev => ({
          ...prev,
          isSubscribed: userInfo.isFollowed || false,
          subscriberCount: userInfo.followerCount || 0,
          isLoading: false
        }));
        onSubscriberCountLoaded?.(userInfo.followerCount || 0);
      } else {
        console.warn('SubscribeButton: Missing required parameters for subscription status check', {
          subscriptionType,
          spaceNamespace,
          authorNamespace,
          spaceId,
          authorUserId
        });
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('🔥 Failed to load subscription status:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadAuthorInfo = async () => {
    try {
      const info = await subscriptionService.getAuthorInfo(authorUserId);
      setAuthorInfo(info);
    } catch (error) {
      console.error('Failed to load author info:', error);
    }
  };

  const handleSubscribeClick = async () => {
    console.log('🔵 Subscribe button clicked', { loading: state.isLoading });
    if (state.isLoading) return;

    // Check if user needs to enter email
    const currentUser = getCurrentUser();
    console.log('🔵 Current user status:', currentUser);

    if (!currentUser) {
      // Unregistered user, needs to enter email
      console.log('🔵 Not logged in, force show email modal');

      // Force ensure state update
      setTimeout(() => {
        console.log('🔵 Delayed email modal state setting');
        setShowEmailModal(true);
        console.log('🔵 Email modal state set to true');
      }, 0);

      return;
    }

    // For logged in users, check their latest email info from server
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Get fresh user info from server to check email status
      const userInfo = await AuthService.getUserInfo();
      console.log('🔵 Fresh user info from server:', { hasEmail: !!userInfo.email });

      if (!userInfo.email || userInfo.email.trim() === '') {
        // User has no email set, show email modal
        console.log('🔵 User has no email, show email modal');
        setState(prev => ({ ...prev, isLoading: false }));
        setShowEmailModal(true);
        return;
      }

      // User has email, use direct email subscribe API
      console.log('🔵 User has email, using email subscription API');
      await performEmailSubscribe(userInfo.email);

    } catch (error) {
      console.error('🔥 Failed to get user info:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      // Fall back to email modal if API fails
      setShowEmailModal(true);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) return;

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    // Continue with subscription
    try {
      setShowEmailModal(false);
      await performEmailSubscribe(email.trim());
    } catch (error) {
      console.error('Subscription failed:', error);
      showToast('Subscription failed, please try again later', 'error');
    }
  };

  // 核心订阅/取消订阅函数 - 统一的API调用入口
  const performEmailSubscribe = async (userEmail: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Determine target ID and type based on subscription type
      const targetId = subscriptionType === 'space' ? spaceId : authorUserId;
      const targetType = subscriptionType === 'space' ? 2 : 1; // 1 for user, 2 for space

      if (!targetId) {
        throw new Error(`Invalid subscription target: ${subscriptionType}`);
      }

      console.log('🔵 Performing email subscribe/unsubscribe:', {
        email: userEmail.substring(0, 3) + '***',
        targetId,
        targetType,
        subscriptionType
      });

      // Call the unified email subscription API - backend determines subscribe/unsubscribe
      const success = await AuthService.emailSubscribe({
        email: userEmail.trim(),
        targetId,
        targetType
      });

      if (success) {
        // 判断当前是订阅还是取消订阅操作（根据之前的状态）
        const wasSubscribed = state.isSubscribed;
        const newSubscribedState = !wasSubscribed;

        // Remember the email used for subscription (needed for non-logged-in unsubscribe)
        if (newSubscribedState) {
          setSubscribedEmail(userEmail);
        } else {
          setSubscribedEmail('');
        }

        setState(prev => ({
          ...prev,
          isSubscribed: newSubscribedState,
          subscriberCount: newSubscribedState ? prev.subscriberCount + 1 : prev.subscriberCount - 1,
          isLoading: false
        }));

        const successMessage = newSubscribedState
          ? (subscriptionType === 'space'
              ? `Successfully subscribed to ${spaceName}! You will receive email notifications for updates.`
              : `🎉 Successfully subscribed to ${authorName}! You will receive email notifications for updates.`)
          : (subscriptionType === 'space'
              ? `Successfully unsubscribed from ${spaceName}`
              : 'Successfully unsubscribed');

        showToast(successMessage, newSubscribedState ? 'success' : 'info');
        onSubscriptionChange?.(newSubscribedState);

        // Auto-follow all of the author's treasuries if subscribing to an author (logged-in only, requires auth)
        if (newSubscribedState && subscriptionType === 'author' && authorUserId && getCurrentUser()) {
          try {
            const spacesResponse = await AuthService.getMySpaces(authorUserId);
            const spaces = spacesResponse?.data || spacesResponse?.records || spacesResponse || [];
            if (Array.isArray(spaces) && spaces.length > 0) {
              const followPromises = spaces.map((space: any) => {
                if (space.id) {
                  return AuthService.followSpace(space.id).catch(err => {
                    console.warn(`Failed to auto-follow space ${space.id}:`, err);
                  });
                }
                return Promise.resolve();
              });
              await Promise.all(followPromises);
              console.log(`Auto-followed ${spaces.length} treasuries for author ${authorUserId}`);
            }
          } catch (err) {
            console.warn('Failed to auto-follow author treasuries:', err);
          }
        }

      } else {
        showToast('Operation failed, please try again later', 'error');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('🔥 Email subscription operation failed:', error);
      console.error('🔥 Error context:', {
        subscriptionType,
        targetId: subscriptionType === 'space' ? spaceId : authorUserId,
        targetType: subscriptionType === 'space' ? 2 : 1,
        userEmail: userEmail ? userEmail.substring(0, 3) + '***' : 'empty',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Show more specific error message if possible
      let errorMessage = 'Operation failed, please try again later';
      if (error instanceof Error && error.message) {
        if (error.message.includes('401')) {
          errorMessage = 'Please log in to continue';
        } else if (error.message.includes('403')) {
          errorMessage = 'Permission denied, please try again';
        } else if (error.message.includes('400')) {
          errorMessage = 'Invalid request, please check your input';
        }
      }

      showToast(errorMessage, 'error');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleUnsubscribe = async () => {
    // Try to get user email from multiple sources
    try {
      // 1. Try logged-in user API
      const userInfo = await AuthService.getUserInfo();
      const userEmail = userInfo.email?.trim();

      if (userEmail) {
        await performEmailSubscribe(userEmail);
        return;
      }
    } catch {
      // Not logged in or API failed, try fallbacks
    }

    // 2. Use the email they subscribed with
    if (subscribedEmail) {
      await performEmailSubscribe(subscribedEmail);
      return;
    }

    // 3. Use the email still in the input field
    if (email.trim()) {
      await performEmailSubscribe(email.trim());
      return;
    }

    showToast('Please enter your email to unsubscribe', 'error');
  };

  // 🎨 Forced high contrast style system
  const getButtonStyles = () => {
    // Base styles - matching "Create new treasury" button with improved accessibility
    const baseStyles = "[font-family:'Lato',Helvetica] font-normal text-sm leading-none rounded-[50px] transition-colors flex items-center justify-center gap-1.5 relative outline-none focus:outline-none";

    // Size styles
    const sizeStyles = {
      small: 'px-2.5 h-7',
      medium: 'px-3 h-8',
      large: 'px-5 h-10'
    };

    // Variant styles
    const variantStyles = {
      default: '',
      minimal: '',
      floating: 'shadow-2xl hover:shadow-3xl'
    };

    // Position styles
    const positionStyles = {
      inline: 'static',
      'fixed-bottom': 'fixed bottom-4 right-4 z-[9999]',
      'sticky': 'sticky top-4 z-50'
    };

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${positionStyles[position]} ${className}`.trim();
  };

  // 🔥 Forced inline styles - ensure 100% visibility
  const getInlineStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      fontFamily: "'Lato', Helvetica, sans-serif",
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '1',
      borderRadius: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      transition: 'color 0.15s, background-color 0.15s',
      position: position === 'inline' ? 'relative' : position === 'fixed-bottom' ? 'fixed' : 'sticky'
    };

    if (position === 'fixed-bottom') {
      Object.assign(baseStyles, {
        bottom: '16px',
        right: '16px',
        zIndex: 9999
      });
    }

    if (state.isLoading) {
      return {
        ...baseStyles,
        backgroundColor: '#f3f4f6',
        color: '#6b7280',
        border: '1px solid #d1d5db',
        cursor: 'not-allowed'
      };
    }

    return {
          ...baseStyles,
          backgroundColor: '#ffffff',
          color: '#2B8649',
          border: '1px solid #2B8649',
          cursor: 'pointer'
        };
  };

  // Get button content
  const getButtonContent = () => {
    if (state.isLoading) {
      return (
        <>
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </>
      );
    }

    if (state.isSubscribed) {
      const subscribedText = subscriptionType === 'space' ? 'Subscribed' : 'Subscribed';

      return (
        <>
          {subscribedText}
          {showSubscriberCount && size !== 'small' && (
            <span className="text-xs opacity-75">({state.subscriberCount})</span>
          )}
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="#2B8649" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </>
      );
    }

    const targetName = subscriptionType === 'space' ? spaceName : authorName;
    const subscribeText = subscriptionType === 'space' ? 'Subscribe' : 'Subscribe';

    return (
      <>
        <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.6967 13.0467C15.1618 13.0467 17.1671 11.0411 17.1671 8.57603C17.1671 6.11099 15.1618 4.10566 12.6967 4.10566C10.2317 4.10566 8.22603 6.11099 8.22603 8.57603C8.22603 11.0411 10.2317 13.0467 12.6967 13.0467ZM12.6967 4.80566C14.7759 4.80566 16.4671 6.49688 16.4671 8.57603C16.4671 10.6552 14.7759 12.3467 12.6967 12.3467C10.6176 12.3467 8.92603 10.6552 8.92603 8.57603C8.92603 6.49688 10.6176 4.80566 12.6967 4.80566Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
          <path d="M25.2021 14.8904C25.3276 14.1689 25.3935 13.432 25.3935 12.6967C25.3935 5.6957 19.6978 0 12.6967 0C5.6957 0 0 5.6957 0 12.6967C0 19.6978 5.6957 25.3935 12.6967 25.3935C13.4323 25.3935 14.1695 25.328 14.8906 25.2024C16.238 26.9034 18.3166 28 20.65 28C24.7027 28 28 24.7027 28 20.65C28 18.3165 26.9033 16.2378 25.2021 14.8904ZM12.6967 0.7C19.3119 0.7 24.6935 6.08159 24.6935 12.6967C24.6935 13.2802 24.6495 13.8647 24.5657 14.4409C23.4305 13.7224 22.09 13.3 20.65 13.3C18.8694 13.3 17.2353 13.9372 15.962 14.9946C14.9104 14.6529 13.8131 14.4754 12.6967 14.4754C8.76307 14.4754 5.13302 16.7004 3.32408 20.1724C1.68397 18.1203 0.7 15.522 0.7 12.6967C0.7 6.08159 6.08159 0.7 12.6967 0.7ZM12.6967 24.6935C9.17831 24.6935 6.00907 23.1709 3.81268 20.7502C5.45388 17.3611 8.92765 15.1754 12.6967 15.1754C13.6074 15.1754 14.5029 15.306 15.3694 15.5496C14.0911 16.8727 13.3 18.6694 13.3 20.65C13.3 22.0899 13.7223 23.4303 14.4408 24.5655C13.8649 24.6492 13.2804 24.6935 12.6967 24.6935ZM20.65 27.3C16.9832 27.3 14 24.3168 14 20.65C14 16.9832 16.9832 14 20.65 14C24.3168 14 27.3 16.9832 27.3 20.65C27.3 24.3168 24.3168 27.3 20.65 27.3Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
          <path d="M23.236 17.5383C22.4608 17.2009 21.4129 17.2672 20.65 18.0879C19.8871 17.2672 18.8392 17.2006 18.064 17.5383C17.1603 17.9313 16.3998 18.9441 16.7371 20.3215C17.3028 22.6293 20.3554 24.2836 20.4849 24.353C20.5365 24.3807 20.5933 24.3944 20.65 24.3944C20.7067 24.3944 20.7635 24.3807 20.8151 24.353C20.9446 24.2836 23.9976 22.6293 24.5629 20.3215C24.9002 18.9441 24.1397 17.9313 23.236 17.5383ZM23.8827 20.1547C23.4609 21.8781 21.2724 23.2747 20.65 23.6414C20.0276 23.2747 17.8394 21.8781 17.4173 20.1547C17.1767 19.1734 17.7088 18.456 18.3432 18.1802C18.5312 18.0981 18.7523 18.0465 18.9854 18.0465C19.4537 18.0465 19.9695 18.2554 20.3574 18.8467C20.4866 19.0442 20.8134 19.0442 20.9426 18.8467C21.5236 17.9611 22.3904 17.9331 22.9568 18.1802C23.5912 18.456 24.1233 19.1734 23.8827 20.1547Z" fill="currentColor" stroke="currentColor" strokeWidth="0.3"/>
        </svg>
        {subscribeText}
        {showSubscriberCount && size !== 'small' && state.subscriberCount > 0 && (
          <span className="text-xs opacity-90">({state.subscriberCount} subscribers)</span>
        )}
      </>
    );
  };

  // Helper functions
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('copus_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const styleMap = {
      success: { bg: '#f0fdf4', border: '#86efac', text: '#16a34a' },
      error: { bg: '#fdf2f2', border: '#fbb6b6', text: '#e53e3e' },
      warning: { bg: '#fffbeb', border: '#fcd34d', text: '#d97706' },
      info: { bg: '#eff6ff', border: '#93c5fd', text: '#2563eb' },
    };
    const s = styleMap[type];
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:10000;padding:12px 24px;background:${s.bg};border:1px solid ${s.border};color:${s.text};border-radius:9999px;font-size:14px;font-weight:500;font-family:'Lato',Helvetica,sans-serif;white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,0.05);`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, type === 'warning' ? 4000 : 3000);
  };

  // 🚫 Private spaces (Treasury) don't show subscribe button
  if (spaceType === SPACE_TYPES.TREASURY) {
    return null;
  }

  // Already subscribed state
  const isLoggedIn = !!getCurrentUser();
  if (state.isSubscribed) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={isLoggedIn ? () => setShowUnsubDropdown(!showUnsubDropdown) : undefined}
          disabled={state.isLoading}
          className="flex items-center gap-1.5 px-3 h-8 rounded-[50px] border border-[#2B8649] bg-white [font-family:'Lato',Helvetica] font-normal text-sm text-[#2B8649] transition-colors hover:bg-[#2B8649]/5"
          style={{ cursor: isLoggedIn ? 'pointer' : 'default' }}
        >
          Subscribed
          {showSubscriberCount && size !== 'small' && (
            <span className="text-xs opacity-75">({state.subscriberCount})</span>
          )}
          {isLoggedIn && (
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="#2B8649" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {isLoggedIn && showUnsubDropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowUnsubDropdown(false)} />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-[50px] shadow-[0px_4px_10px_rgba(0,0,0,0.15)] z-20">
              <button
                onClick={() => {
                  setShowUnsubDropdown(false);
                  handleUnsubscribe();
                }}
                className="flex items-center justify-center px-4 h-8 rounded-[50px] transition-colors hover:bg-[rgba(224,224,224,0.25)] [font-family:'Lato',Helvetica] font-normal text-sm text-red whitespace-nowrap"
              >
                Unsubscribe
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Logged-in user with email — old-style subscribe button
  if (loggedInUserHasEmail) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={handleSubscribeClick}
          disabled={state.isLoading}
          className={`${getButtonStyles()} touch-target subscribe-button no-zoom`}
          style={getInlineStyles()}
          title="Click to subscribe"
        >
          {getButtonContent()}
        </button>
      </div>
    );
  }

  // Not logged in or no email — compact: just button, expands on click; default: inline email input
  if (compact && !expanded) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setExpanded(true)}
          disabled={state.isLoading}
          className={`${getButtonStyles()} touch-target subscribe-button no-zoom`}
          style={getInlineStyles()}
          title="Click to subscribe"
        >
          {getButtonContent()}
        </button>
      </div>
    );
  }

  return (
    <div className={`relative hidden sm:block ${className}`}>
      <div className="flex items-center rounded-[50px] border border-[#2B8649] overflow-hidden w-full">
        <input
          type="email"
          name="email"
          autoComplete="email"
          autoFocus={compact && expanded}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (email.trim()) {
                handleEmailSubmit();
              } else {
                showToast('Please enter your email address', 'warning');
              }
            }
            if (e.key === 'Escape' && compact) {
              setExpanded(false);
            }
          }}
          placeholder="Type your email..."
          className="[font-family:'Lato',Helvetica] flex-1 min-w-0 w-[150px] px-3 py-2 text-sm text-off-black bg-white border-none outline-none placeholder:text-gray-400"
        />
        <button
          onClick={() => {
            if (email.trim()) {
              handleEmailSubmit();
            } else {
              showToast('Please enter your email address', 'warning');
            }
          }}
          disabled={state.isLoading}
          className="flex-shrink-0 px-3 py-2 bg-[#2B8649] [font-family:'Lato',Helvetica] font-normal text-white text-sm cursor-pointer hover:bg-[#2B8649]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {state.isLoading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>
    </div>
  );
};

export default SubscribeButton;