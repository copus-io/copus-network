import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import subscriptionService from '../../services/subscriptionService';
import antiAbuseService from '../../services/antiAbuseService';
import { AuthService } from '../../services/authService';
import { AuthorInfo, SubscribeButtonState, EmailFrequency, SPACE_TYPES } from '../../types/subscription';

interface SubscribeButtonProps {
  authorUserId?: number;
  authorName?: string;
  spaceId?: number;
  spaceName?: string;
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
  spaceId,
  spaceName = 'Space',
  size = 'medium',
  onSubscriptionChange,
  onSubscriberCountLoaded,
  className = '',
  showSubscriberCount = false,
  variant = 'default',
  position = 'inline',
  spaceType,
  subscriptionType = 'author'
}) => {
  const [state, setState] = useState<SubscribeButtonState>({
    isSubscribed: false,
    isLoading: true,
    subscriberCount: 0,
    canSubscribe: true
  });

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showUnsubDropdown, setShowUnsubDropdown] = useState(false);
  const [email, setEmail] = useState('');
  const [authorInfo, setAuthorInfo] = useState<AuthorInfo | null>(null);

  // 🍯 Honeypot fields - used to detect bots
  const [honeypotFields, setHoneypotFields] = useState({
    website: '',
    phone: '',
    company: ''
  });

  // Debug: Monitor state changes
  useEffect(() => {
    console.log('🔵 Modal state change:', { showEmailModal });
  }, [showEmailModal]);

  // Check subscription status
  useEffect(() => {
    loadSubscriptionStatus();
    if (subscriptionType === 'author') {
      loadAuthorInfo();
    }
  }, [authorUserId, spaceId, subscriptionType]);

  const loadSubscriptionStatus = async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const status = await subscriptionService.checkSubscriptionStatus(authorUserId);
      setState(prev => ({
        ...prev,
        isSubscribed: status.isSubscribed,
        subscriberCount: status.subscriberCount,
        isLoading: false
      }));
      onSubscriberCountLoaded?.(status.subscriberCount);
    } catch (error) {
      console.error('Failed to load subscription status:', error);
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

    if (!currentUser.email) {
      // Wallet user, needs to enter email
      console.log('🔵 Wallet user has no email, show email modal');
      setShowEmailModal(true);
      return;
    }

    // Users with email, directly subscribe
    console.log('🔵 Logged in and has email, directly subscribe');
    await handleConfirmSubscribe();
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) return;

    // 🛡️ Anti-abuse checks
    try {
      // 1. Honeypot check - if hidden fields have values, possibly a bot
      const isBot = !antiAbuseService.checkHoneypot({
        website: honeypotFields.website,
        phone: honeypotFields.phone,
        company: honeypotFields.company
      });

      if (isBot) {
        console.log('🤖 Honeypot detected bot behavior, blocking subscription');
        showToast('Subscription failed, please try again later', 'error');
        return;
      }

      // 2. Email validation
      const emailValidation = antiAbuseService.validateEmailForSubscription(email);
      if (!emailValidation.isValid) {
        console.log('❌ Email validation failed:', emailValidation.reason);
        showToast(`Invalid email: ${emailValidation.reason === 'disposable_email' ? 'Temporary email not supported' : 'Invalid email format'}`, 'error');
        return;
      }

      if (emailValidation.risk === 'high') {
        console.log('⚠️ High-risk email, blocking subscription');
        showToast('This email has security risks, please use another email', 'error');
        return;
      }

      // 3. Comprehensive risk assessment
      const userIP = antiAbuseService.getCurrentUserIP();
      const riskAssessment = antiAbuseService.assessSubscriptionRisk({
        email,
        authorUserId,
        ip: userIP,
        userAgent: navigator.userAgent
      });

      console.log('🔍 Risk assessment result:', riskAssessment);

      if (riskAssessment.action === 'block') {
        showToast(riskAssessment.message || 'Subscription request blocked, please try again later', 'error');
        return;
      }

      if (riskAssessment.action === 'manual_review') {
        showToast(riskAssessment.message || 'Subscription request requires review, we will process it within 24 hours', 'info');
        return;
      }

      if (riskAssessment.action === 'warn') {
        // Show warning but allow continue
        showToast(riskAssessment.message || 'System detected potential risks, please confirm your operation', 'warning');
      }

      // Pass all checks, continue flow
      setShowEmailModal(false);
      // 直接订阅，不显示推送频率确认
      await handleConfirmSubscribe();

    } catch (error) {
      console.error('Anti-abuse check failed:', error);
      showToast('System check failed, please try again later', 'error');
    }
  };

  const handleConfirmSubscribe = async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await subscriptionService.subscribeToAuthor({
        authorUserId,
        emailFrequency: 'DAILY', // 默认使用每日摘要
        email: email || undefined
      });

      if (result.success) {
        setState(prev => ({
          ...prev,
          isSubscribed: true,
          subscriberCount: prev.subscriberCount + 1,
          isLoading: false
        }));

        showToast('Successfully subscribed! You will receive email notifications for updates.', 'success');
        onSubscriptionChange?.(true);

        // Auto-follow all of the author's treasuries
        if (authorUserId) {
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
        showToast(result.message || 'Subscription failed, please try again later', 'error');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      showToast('Subscription failed, please try again later', 'error');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleUnsubscribe = async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await subscriptionService.unsubscribeFromAuthor(authorUserId);

      if (result.success) {
        setState(prev => ({
          ...prev,
          isSubscribed: false,
          subscriberCount: Math.max(0, prev.subscriberCount - 1),
          isLoading: false
        }));

        showToast('Successfully unsubscribed', 'info');
        onSubscriptionChange?.(false);
      } else {
        showToast(result.message || 'Failed to unsubscribe', 'error');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      showToast('Failed to unsubscribe, please try again later', 'error');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // 🎨 Forced high contrast style system
  const getButtonStyles = () => {
    // Base styles - matching "Create new treasury" button
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

    return state.isSubscribed
      ? {
          ...baseStyles,
          backgroundColor: '#ffffff',
          color: '#059669',
          border: '1px solid #059669',
          cursor: 'pointer'
        }
      : {
          ...baseStyles,
          backgroundColor: 'rgba(5, 150, 105, 0.08)',
          color: '#059669',
          border: '1px solid #059669',
          cursor: 'pointer'
        };
  };

  // Get button content
  const getButtonContent = () => {
    if (state.isSubscribed) {
      return (
        <>
          Subscribed
          {showSubscriberCount && size !== 'small' && (
            <span className="text-xs opacity-75">({state.subscriberCount})</span>
          )}
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </>
      );
    }

    return (
      <>
        <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.6967 13.0467C15.1618 13.0467 17.1671 11.0411 17.1671 8.57603C17.1671 6.11099 15.1618 4.10566 12.6967 4.10566C10.2317 4.10566 8.22603 6.11099 8.22603 8.57603C8.22603 11.0411 10.2317 13.0467 12.6967 13.0467ZM12.6967 4.80566C14.7759 4.80566 16.4671 6.49688 16.4671 8.57603C16.4671 10.6552 14.7759 12.3467 12.6967 12.3467C10.6176 12.3467 8.92603 10.6552 8.92603 8.57603C8.92603 6.49688 10.6176 4.80566 12.6967 4.80566Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
          <path d="M25.2021 14.8904C25.3276 14.1689 25.3935 13.432 25.3935 12.6967C25.3935 5.6957 19.6978 0 12.6967 0C5.6957 0 0 5.6957 0 12.6967C0 19.6978 5.6957 25.3935 12.6967 25.3935C13.4323 25.3935 14.1695 25.328 14.8906 25.2024C16.238 26.9034 18.3166 28 20.65 28C24.7027 28 28 24.7027 28 20.65C28 18.3165 26.9033 16.2378 25.2021 14.8904ZM12.6967 0.7C19.3119 0.7 24.6935 6.08159 24.6935 12.6967C24.6935 13.2802 24.6495 13.8647 24.5657 14.4409C23.4305 13.7224 22.09 13.3 20.65 13.3C18.8694 13.3 17.2353 13.9372 15.962 14.9946C14.9104 14.6529 13.8131 14.4754 12.6967 14.4754C8.76307 14.4754 5.13302 16.7004 3.32408 20.1724C1.68397 18.1203 0.7 15.522 0.7 12.6967C0.7 6.08159 6.08159 0.7 12.6967 0.7ZM12.6967 24.6935C9.17831 24.6935 6.00907 23.1709 3.81268 20.7502C5.45388 17.3611 8.92765 15.1754 12.6967 15.1754C13.6074 15.1754 14.5029 15.306 15.3694 15.5496C14.0911 16.8727 13.3 18.6694 13.3 20.65C13.3 22.0899 13.7223 23.4303 14.4408 24.5655C13.8649 24.6492 13.2804 24.6935 12.6967 24.6935ZM20.65 27.3C16.9832 27.3 14 24.3168 14 20.65C14 16.9832 16.9832 14 20.65 14C24.3168 14 27.3 16.9832 27.3 20.65C27.3 24.3168 24.3168 27.3 20.65 27.3Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
          <path d="M23.236 17.5383C22.4608 17.2009 21.4129 17.2672 20.65 18.0879C19.8871 17.2672 18.8392 17.2006 18.064 17.5383C17.1603 17.9313 16.3998 18.9441 16.7371 20.3215C17.3028 22.6293 20.3554 24.2836 20.4849 24.353C20.5365 24.3807 20.5933 24.3944 20.65 24.3944C20.7067 24.3944 20.7635 24.3807 20.8151 24.353C20.9446 24.2836 23.9976 22.6293 24.5629 20.3215C24.9002 18.9441 24.1397 17.9313 23.236 17.5383ZM23.8827 20.1547C23.4609 21.8781 21.2724 23.2747 20.65 23.6414C20.0276 23.2747 17.8394 21.8781 17.4173 20.1547C17.1767 19.1734 17.7088 18.456 18.3432 18.1802C18.5312 18.0981 18.7523 18.0465 18.9854 18.0465C19.4537 18.0465 19.9695 18.2554 20.3574 18.8467C20.4866 19.0442 20.8134 19.0442 20.9426 18.8467C21.5236 17.9611 22.3904 17.9331 22.9568 18.1802C23.5912 18.456 24.1233 19.1734 23.8827 20.1547Z" fill="currentColor" stroke="currentColor" strokeWidth="0.3"/>
        </svg>
        Subscribe
        {showSubscriberCount && size !== 'small' && state.subscriberCount > 0 && (
          <span className="text-xs opacity-90">({state.subscriberCount})</span>
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

  return (
    <>
      <div className="relative">
        <button
          onClick={state.isSubscribed ? () => setShowUnsubDropdown(!showUnsubDropdown) : handleSubscribeClick}
          disabled={state.isLoading}
          className={`${getButtonStyles()} touch-target subscribe-button no-zoom`}
          style={getInlineStyles()}
          title={state.isSubscribed ? 'Click to manage subscription' : 'Click to subscribe'}
        >
          {getButtonContent()}
        </button>

        {/* Unsubscribe dropdown */}
        {showUnsubDropdown && (
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

      {/* Email input modal - use Portal to ensure correct rendering */}
      {showEmailModal && createPortal(
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEmailModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-xl w-full max-w-md overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="flex justify-end px-5 pt-4">
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-5 pb-5">
              <h3 className="[font-family:'Lato',Helvetica] font-medium text-off-black text-2xl tracking-[0] leading-[33.6px] mb-4">
                Subscribe
              </h3>

              <p className="[font-family:'Lato',Helvetica] text-[14px] text-gray-600 mb-2 leading-relaxed">
                Please <a href="/login" className="text-red underline hover:opacity-80 font-semibold">log in</a> or enter your email address to subscribe to <strong>{subscriptionType === 'space' ? spaceName : authorName}</strong>.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="[font-family:'Lato',Helvetica] w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-300"
                autoFocus
              />
              <p className="[font-family:'Lato',Helvetica] text-xs text-gray-400 mt-2 leading-relaxed">
                You'll receive an email notification when {subscriptionType === 'space' ? spaceName : authorName} publishes new treasures.
              </p>

              {/* Honeypot fields */}
              <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  value={honeypotFields.website}
                  onChange={(e) => setHoneypotFields(prev => ({...prev, website: e.target.value}))}
                  tabIndex={-1}
                  autoComplete="off"
                />
                <input
                  type="tel"
                  name="phone"
                  value={honeypotFields.phone}
                  onChange={(e) => setHoneypotFields(prev => ({...prev, phone: e.target.value}))}
                  tabIndex={-1}
                  autoComplete="off"
                />
                <input
                  type="text"
                  name="company"
                  value={honeypotFields.company}
                  onChange={(e) => setHoneypotFields(prev => ({...prev, company: e.target.value}))}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="[font-family:'Lato',Helvetica] font-normal text-sm rounded-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmailSubmit}
                  disabled={!email.trim()}
                  className="[font-family:'Lato',Helvetica] font-normal text-sm rounded-full px-4 py-2 bg-red text-white hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </>
  );
};

export default SubscribeButton;