import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import subscriptionService from '../../services/subscriptionService';
import antiAbuseService from '../../services/antiAbuseService';
import { AuthorInfo, SubscribeButtonState, EmailFrequency, SPACE_TYPES } from '../../types/subscription';

interface SubscribeButtonProps {
  authorUserId: number;
  authorName?: string;
  size?: 'small' | 'medium' | 'large';
  onSubscriptionChange?: (isSubscribed: boolean) => void;
  className?: string;
  // New configuration options
  showSubscriberCount?: boolean;
  variant?: 'default' | 'minimal' | 'floating';
  position?: 'inline' | 'fixed-bottom' | 'sticky';
  // Space type check - private spaces don't show subscribe button
  spaceType?: number;
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
  size = 'medium',
  onSubscriptionChange,
  className = '',
  showSubscriberCount = true,
  variant = 'default',
  position = 'inline',
  spaceType
}) => {
  const [state, setState] = useState<SubscribeButtonState>({
    isSubscribed: false,
    isLoading: true,
    subscriberCount: 0,
    canSubscribe: true
  });

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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
    console.log('🔵 Modal state change:', { showEmailModal, showConfirmModal });
  }, [showEmailModal, showConfirmModal]);

  // Check subscription status
  useEffect(() => {
    loadSubscriptionStatus();
    loadAuthorInfo();
  }, [authorUserId]);

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

    // Users with email, directly show confirmation modal
    console.log('🔵 Logged in and has email, show confirmation modal');
    setShowConfirmModal(true);
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
        showToast(`Invalid email: ${emailValidation.reason === 'disposable_email' ? 'Disposable email not supported' : 'Email format error'}`, 'error');
        return;
      }

      if (emailValidation.risk === 'high') {
        console.log('⚠️ High-risk email, blocking subscription');
        showToast('This email has risks, please use another email', 'error');
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
        showToast(riskAssessment.message || 'Subscription request needs review, we will process within 24 hours', 'info');
        return;
      }

      if (riskAssessment.action === 'warn') {
        // Show warning but allow continue
        showToast(riskAssessment.message || 'System detected potential risk, please confirm your operation', 'warning');
      }

      // Pass all checks, continue flow
      setShowEmailModal(false);
      setShowConfirmModal(true);

    } catch (error) {
      console.error('Anti-abuse check failed:', error);
      showToast('System check failed, please try again later', 'error');
    }
  };

  const handleConfirmSubscribe = async (frequency: EmailFrequency = 'DAILY') => {
    setState(prev => ({ ...prev, isLoading: true }));
    setShowConfirmModal(false);

    try {
      const result = await subscriptionService.subscribeToAuthor({
        authorUserId,
        emailFrequency: frequency,
        email: email || undefined
      });

      if (result.success) {
        setState(prev => ({
          ...prev,
          isSubscribed: true,
          subscriberCount: prev.subscriberCount + 1,
          isLoading: false
        }));

        showToast('🎉 Subscription successful! You will receive update notifications via email.', 'success');
        onSubscriptionChange?.(true);

        // According to product requirements: subscription takes effect immediately, no email verification needed
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

        showToast('Unsubscribed', 'info');
        onSubscriptionChange?.(false);
      } else {
        showToast(result.message || 'Unsubscribe failed', 'error');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      showToast('Unsubscribe failed, please try again later', 'error');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // 🎨 Forced high contrast style system
  const getButtonStyles = () => {
    // Base styles
    const baseStyles = 'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 relative min-h-[40px] border-2 outline-none focus:outline-none';

    // Size styles
    const sizeStyles = {
      small: 'px-4 py-2 text-sm min-w-[100px]',
      medium: 'px-6 py-2.5 text-sm min-w-[120px]',
      large: 'px-8 py-3 text-base min-w-[140px]'
    };

    // Variant styles
    const variantStyles = {
      default: 'shadow-lg hover:shadow-xl',
      minimal: 'shadow-sm hover:shadow-md',
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
      fontWeight: '600',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      minHeight: '40px',
      borderWidth: '2px',
      borderStyle: 'solid',
      transition: 'all 0.2s',
      zIndex: 9999,
      position: position === 'inline' ? 'relative' : position === 'fixed-bottom' ? 'fixed' : 'sticky'
    };

    if (position === 'fixed-bottom') {
      Object.assign(baseStyles, {
        bottom: '16px',
        right: '16px'
      });
    }

    if (state.isLoading) {
      return {
        ...baseStyles,
        backgroundColor: '#4b5563', // gray-600
        color: '#ffffff',
        borderColor: '#4b5563',
        cursor: 'not-allowed'
      };
    }

    return state.isSubscribed
      ? {
          ...baseStyles,
          backgroundColor: '#059669', // emerald-600
          color: '#ffffff',
          borderColor: '#047857', // emerald-700
          cursor: 'pointer',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }
      : {
          ...baseStyles,
          backgroundColor: '#dc2626', // red-600
          color: '#ffffff',
          borderColor: '#b91c1c', // red-700
          cursor: 'pointer',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        };
  };

  // Get button content
  const getButtonContent = () => {
    if (state.isLoading) {
      return (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          Processing...
        </>
      );
    }

    if (state.isSubscribed) {
      return (
        <>
          ✅ Subscribed
          {showSubscriberCount && size !== 'small' && (
            <span className="text-xs opacity-75">({state.subscriberCount})</span>
          )}
        </>
      );
    }

    return (
      <>
        📧 Subscribe to {authorName}
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
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-[10000] ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      type === 'warning' ? 'bg-yellow-500' :
      'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, type === 'warning' ? 4000 : 3000); // 警告显示更久
  };

  // 🚫 Private spaces (Treasury) don't show subscribe button
  if (spaceType === SPACE_TYPES.TREASURY) {
    return null;
  }

  return (
    <>
      <button
        onClick={state.isSubscribed ? handleUnsubscribe : handleSubscribeClick}
        disabled={state.isLoading}
        className={`${getButtonStyles()} touch-target subscribe-button no-zoom`}
        style={getInlineStyles()}
        title={state.isSubscribed ? 'Click to unsubscribe' : 'Click to subscribe to author'}
      >
        {getButtonContent()}
      </button>

      {/* Email input modal - use Portal to ensure correct rendering */}
      {showEmailModal && createPortal(
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{
            zIndex: 99999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={(e) => {
            console.log('🔵 Modal background clicked');
            if (e.target === e.currentTarget) {
              setShowEmailModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '0.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxWidth: '28rem',
              width: '100%',
              margin: '0 1rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
              📧 Subscription requires email address
            </h3>

            <p className="text-gray-600 mb-4" style={{ color: '#6b7280' }}>
              To receive subscription notifications from <strong>{authorName}</strong>, please provide your email address
            </p>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                outline: 'none',
                fontSize: '16px' // Prevent iOS zoom
              }}
              autoFocus
            />

            {/* 🍯 Honeypot fields - invisible to users, bots might fill them */}
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
                style={{
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleEmailSubmit}
                disabled={!email.trim()}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: '2px solid #b91c1c',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1.5rem',
                  cursor: email.trim() ? 'pointer' : 'not-allowed',
                  opacity: email.trim() ? 1 : 0.5,
                  fontWeight: '600',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                Continue Subscribe
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Subscription confirmation modal */}
      {showConfirmModal && createPortal(
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{
            zIndex: 99999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowConfirmModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-lg mx-4"
            style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem' }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
              📧 Subscription Confirmation
            </h3>

            {authorInfo && (
              <div
                className="bg-gray-50 rounded-lg p-4 mb-4"
                style={{ backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={authorInfo.avatar || '/placeholder-avatar.png'}
                    alt={authorInfo.displayName}
                    className="w-12 h-12 rounded-full"
                    style={{ width: '3rem', height: '3rem', borderRadius: '50%' }}
                  />
                  <div>
                    <h4 className="font-medium" style={{ color: '#1f2937', fontWeight: '500' }}>
                      {authorInfo.displayName}
                    </h4>
                    <p className="text-sm text-gray-600" style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      {authorInfo.spacesCount} spaces
                    </p>
                  </div>
                </div>
                {authorInfo.bio && (
                  <p className="text-sm text-gray-600 mt-2" style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {authorInfo.bio}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="radio" name="frequency" value="IMMEDIATE" defaultChecked={false} />
                <div>
                  <div className="font-medium" style={{ color: '#1f2937', fontWeight: '500' }}>Immediate Notification</div>
                  <div className="text-sm text-gray-600" style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Send email immediately when new content is available
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="radio" name="frequency" value="DAILY" defaultChecked={true} />
                <div>
                  <div className="font-medium" style={{ color: '#1f2937', fontWeight: '500' }}>Daily Summary</div>
                  <div className="text-sm text-gray-600" style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Send daily summary (Recommended)
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="radio" name="frequency" value="WEEKLY" defaultChecked={false} />
                <div>
                  <div className="font-medium" style={{ color: '#1f2937', fontWeight: '500' }}>Weekly Summary</div>
                  <div className="text-sm text-gray-600" style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Send weekly summary
                  </div>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const selected = document.querySelector('input[name="frequency"]:checked') as HTMLInputElement;
                  const frequency = (selected?.value as EmailFrequency) || 'DAILY';
                  handleConfirmSubscribe(frequency);
                }}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: '2px solid #b91c1c',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1.5rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                Confirm Subscribe
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default SubscribeButton;