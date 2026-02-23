import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/ui/toast';
import { AuthService } from '@/services/authService';
import { useVerificationCode } from '@/hooks/useVerificationCode';
import { debugLog } from '@/utils/debugLogger';
import CryptoJS from 'crypto-js';
import * as storage from '@/utils/storage';

// 🔍 SEARCH: auth-form-types
interface AuthFormState {
  // Tab state
  activeTab: 'login' | 'register';

  // Login form state
  loginEmail: string;
  loginPassword: string;
  showLoginPassword: boolean;
  rememberMe: boolean;
  isLoginLoading: boolean;

  // Register form state
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  verificationCode: string;
  agreeToTerms: boolean;
  isRegisterLoading: boolean;

  // Email validation
  emailStatus: 'idle' | 'checking' | 'available' | 'taken';
  emailCheckTimeout: ReturnType<typeof setTimeout> | null;

  // Modal states
  isResetPasswordModalOpen: boolean;
}

interface AuthFormActions {
  // Tab management
  setActiveTab: (tab: 'login' | 'register') => void;

  // Login form actions
  setLoginEmail: (email: string) => void;
  setLoginPassword: (password: string) => void;
  setShowLoginPassword: (show: boolean) => void;
  setRememberMe: (remember: boolean) => void;
  handleLogin: () => Promise<void>;

  // Register form actions
  setEmail: (email: string) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  setVerificationCode: (code: string) => void;
  setAgreeToTerms: (agree: boolean) => void;
  handleRegister: () => Promise<void>;
  checkEmailAvailability: (email: string) => void;

  // Social auth
  handleSocialAuth: (provider: string) => Promise<void>;

  // Modal management
  openResetPasswordModal: () => void;
  closeResetPasswordModal: () => void;

  // Utilities
  validateForm: (type: 'login' | 'register') => boolean;
}

type AuthFormContextType = AuthFormState & AuthFormActions;

const AuthFormContext = createContext<AuthFormContextType | undefined>(undefined);

// Helper functions
const extractTokenFromResponse = (data: any) => {
  return data.data?.token || data.token || data.access_token || data.accessToken || data.authToken || data.data?.access_token;
};

const createBasicUser = (email: string, username: string = '', walletAddress: string = '') => ({
  id: undefined,
  email,
  username: username || email.split('@')[0],
  namespace: username || email.split('@')[0],
  profileDesc: '',
  faceUrl: '',
  walletAddress,
  bio: '',
  isFollowed: false,
  followerCount: 0,
  followingCount: 0,
});

// 🔍 SEARCH: auth-form-provider
interface AuthFormProviderProps {
  children: ReactNode;
}

export const AuthFormProvider: React.FC<AuthFormProviderProps> = ({ children }) => {
  const { login, fetchUserInfo } = useUser();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  // Form state
  const [state, setState] = useState<AuthFormState>({
    activeTab: 'login',
    loginEmail: '',
    loginPassword: '',
    showLoginPassword: false,
    rememberMe: true,
    isLoginLoading: false,
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
    verificationCode: '',
    agreeToTerms: false,
    isRegisterLoading: false,
    emailStatus: 'idle',
    emailCheckTimeout: null,
    isResetPasswordModalOpen: false,
  });

  // Verification code hook
  const {
    verificationStatus,
    timeRemaining,
    sendCode,
    verifyCode,
    resetTimer,
  } = useVerificationCode();

  // 🔍 SEARCH: auth-form-actions
  const setActiveTab = useCallback((tab: 'login' | 'register') => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const setLoginEmail = useCallback((email: string) => {
    setState(prev => ({ ...prev, loginEmail: email }));
  }, []);

  const setLoginPassword = useCallback((password: string) => {
    setState(prev => ({ ...prev, loginPassword: password }));
  }, []);

  const setShowLoginPassword = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showLoginPassword: show }));
  }, []);

  const setRememberMe = useCallback((remember: boolean) => {
    setState(prev => ({ ...prev, rememberMe: remember }));
  }, []);

  const setEmail = useCallback((email: string) => {
    setState(prev => ({ ...prev, email }));
    // Auto-check email availability
    checkEmailAvailability(email);
  }, []);

  const setUsername = useCallback((username: string) => {
    setState(prev => ({ ...prev, username }));
  }, []);

  const setPassword = useCallback((password: string) => {
    setState(prev => ({ ...prev, password }));
  }, []);

  const setConfirmPassword = useCallback((password: string) => {
    setState(prev => ({ ...prev, confirmPassword: password }));
  }, []);

  const setShowPassword = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showPassword: show }));
  }, []);

  const setShowConfirmPassword = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showConfirmPassword: show }));
  }, []);

  const setVerificationCode = useCallback((code: string) => {
    setState(prev => ({ ...prev, verificationCode: code }));
  }, []);

  const setAgreeToTerms = useCallback((agree: boolean) => {
    setState(prev => ({ ...prev, agreeToTerms: agree }));
  }, []);

  // 🔍 SEARCH: email-validation
  const checkEmailAvailability = useCallback((email: string) => {
    if (!email || !email.includes('@')) {
      setState(prev => ({ ...prev, emailStatus: 'idle' }));
      return;
    }

    // Clear previous timeout
    if (state.emailCheckTimeout) {
      clearTimeout(state.emailCheckTimeout);
    }

    setState(prev => ({ ...prev, emailStatus: 'checking' }));

    // Debounce email check
    const timeout = setTimeout(async () => {
      try {
        const response = await AuthService.checkEmailAvailability(email);
        const isAvailable = response.data?.available || false;
        setState(prev => ({
          ...prev,
          emailStatus: isAvailable ? 'available' : 'taken',
          emailCheckTimeout: null
        }));
      } catch (error) {
        debugLog.error('Email availability check failed:', error);
        setState(prev => ({ ...prev, emailStatus: 'idle', emailCheckTimeout: null }));
      }
    }, 500);

    setState(prev => ({ ...prev, emailCheckTimeout: timeout }));
  }, [state.emailCheckTimeout]);

  // 🔍 SEARCH: form-validation
  const validateForm = useCallback((type: 'login' | 'register') => {
    if (type === 'login') {
      if (!state.loginEmail.trim()) {
        showToast('Please enter your email', 'error');
        return false;
      }
      if (!state.loginPassword.trim()) {
        showToast('Please enter your password', 'error');
        return false;
      }
      return true;
    }

    if (type === 'register') {
      if (!state.email.trim() || !state.email.includes('@')) {
        showToast('Please enter a valid email address', 'error');
        return false;
      }
      if (!state.username.trim()) {
        showToast('Please enter a username', 'error');
        return false;
      }
      if (state.password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return false;
      }
      if (state.password !== state.confirmPassword) {
        showToast('Passwords do not match', 'error');
        return false;
      }
      if (!state.verificationCode.trim()) {
        showToast('Please enter the verification code', 'error');
        return false;
      }
      if (!state.agreeToTerms) {
        showToast('Please agree to the terms of service', 'error');
        return false;
      }
      return true;
    }

    return false;
  }, [state, showToast]);

  // 🔍 SEARCH: login-handler
  const handleLogin = useCallback(async () => {
    if (!validateForm('login')) return;

    setState(prev => ({ ...prev, isLoginLoading: true }));

    try {
      debugLog.auth('Attempting login for:', state.loginEmail);

      const response = await AuthService.login(state.loginEmail, state.loginPassword);

      if (response.success && response.data) {
        const token = extractTokenFromResponse(response.data);

        if (!token) {
          throw new Error('No authentication token received');
        }

        const basicUser = createBasicUser(state.loginEmail);
        login(basicUser, token);

        // Remember login if checked
        if (state.rememberMe) {
          storage.setItem('rememberedEmail', state.loginEmail);
          const hashedPassword = CryptoJS.SHA256(state.loginPassword).toString();
          storage.setItem('rememberedPasswordHash', hashedPassword);
        }

        // Fetch user info
        try {
          await fetchUserInfo(token);
        } catch (userInfoError) {
          debugLog.error('Failed to fetch user info after login:', userInfoError);
        }

        showToast('Login successful!', 'success');

        // Navigate to redirect URL or home
        const redirectTo = searchParams.get('redirect') || '/';
        navigate(redirectTo);

      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      debugLog.error('Login failed:', error);
      showToast(error.message || 'Login failed. Please try again.', 'error');
    } finally {
      setState(prev => ({ ...prev, isLoginLoading: false }));
    }
  }, [state, validateForm, login, fetchUserInfo, navigate, searchParams, showToast]);

  // 🔍 SEARCH: register-handler
  const handleRegister = useCallback(async () => {
    if (!validateForm('register')) return;

    setState(prev => ({ ...prev, isRegisterLoading: true }));

    try {
      debugLog.auth('Attempting registration for:', state.email);

      // Verify code first
      const isCodeValid = await verifyCode(state.email, state.verificationCode);
      if (!isCodeValid) {
        throw new Error('Invalid verification code');
      }

      const response = await AuthService.register({
        email: state.email,
        username: state.username,
        password: state.password,
        verificationCode: state.verificationCode,
      });

      if (response.success && response.data) {
        const token = extractTokenFromResponse(response.data);

        if (!token) {
          throw new Error('No authentication token received');
        }

        const basicUser = createBasicUser(state.email, state.username);
        login(basicUser, token);

        // Fetch user info
        try {
          await fetchUserInfo(token);
        } catch (userInfoError) {
          debugLog.error('Failed to fetch user info after registration:', userInfoError);
        }

        showToast('Registration successful! Welcome to Copus!', 'success');

        // Navigate to redirect URL or home
        const redirectTo = searchParams.get('redirect') || '/';
        navigate(redirectTo);

      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      debugLog.error('Registration failed:', error);
      showToast(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setState(prev => ({ ...prev, isRegisterLoading: false }));
    }
  }, [state, validateForm, verifyCode, login, fetchUserInfo, navigate, searchParams, showToast]);

  // 🔍 SEARCH: social-auth-handler
  const handleSocialAuth = useCallback(async (provider: string) => {
    try {
      debugLog.auth('Attempting social auth with:', provider);

      // TODO: Implement social authentication
      showToast(`${provider} authentication will be available soon`, 'info');

    } catch (error: any) {
      debugLog.error('Social auth failed:', error);
      showToast(error.message || 'Social authentication failed', 'error');
    }
  }, [showToast]);

  // Modal management
  const openResetPasswordModal = useCallback(() => {
    setState(prev => ({ ...prev, isResetPasswordModalOpen: true }));
  }, []);

  const closeResetPasswordModal = useCallback(() => {
    setState(prev => ({ ...prev, isResetPasswordModalOpen: false }));
  }, []);

  const contextValue: AuthFormContextType = {
    // State
    ...state,

    // Actions
    setActiveTab,
    setLoginEmail,
    setLoginPassword,
    setShowLoginPassword,
    setRememberMe,
    handleLogin,
    setEmail,
    setUsername,
    setPassword,
    setConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    setVerificationCode,
    setAgreeToTerms,
    handleRegister,
    checkEmailAvailability,
    handleSocialAuth,
    openResetPasswordModal,
    closeResetPasswordModal,
    validateForm,
  };

  return (
    <AuthFormContext.Provider value={contextValue}>
      {children}
    </AuthFormContext.Provider>
  );
};

// 🔍 SEARCH: use-auth-form-hook
export const useAuthForm = (): AuthFormContextType => {
  const context = useContext(AuthFormContext);
  if (context === undefined) {
    throw new Error('useAuthForm must be used within an AuthFormProvider');
  }
  return context;
};