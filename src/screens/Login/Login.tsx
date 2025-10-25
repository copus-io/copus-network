import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { useToast } from "../../components/ui/toast";
import { GemSpinner, BookFlip } from "../../components/ui/copus-loading";
import CryptoJS from 'crypto-js';
import { AuthService } from "../../services/authService";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";
import { HeaderSection } from "../../components/shared/HeaderSection/HeaderSection";
import { ResetPasswordModal } from "../../components/ResetPasswordModal";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { APP_CONFIG } from "../../config/app";
import { useVerificationCode } from '../../hooks/useVerificationCode';

const socialProviders = [
  {
    name: "Google",
    icon: "https://c.animaapp.com/mftc49qfOGKRUh/img/frame-1-3.svg",
  },
  {
    name: "X",
    icon: "https://c.animaapp.com/mftc49qfOGKRUh/img/frame-1-2.svg",
  },
  {
    name: "Metamask",
    icon: "https://c.animaapp.com/mftc49qfOGKRUh/img/frame-1.svg",
  },
];

// Helper function to extract token from various response formats
const extractTokenFromResponse = (data: any) => {
  return data.data?.token || data.token || data.access_token || data.accessToken || data.authToken || data.data?.access_token;
};

// Helper function to create a basic user object
const createBasicUser = (email: string, username: string = '', walletAddress: string = '') => ({
  id: 0,
  username: username || email.split('@')[0],
  email,
  bio: '',
  coverUrl: '',
  faceUrl: '',
  namespace: '',
  walletAddress
});

// Separate component for login form
const LoginForm: React.FC<{
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
  isLoading: boolean;
  onLogin: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onForgotPassword: () => void;
}> = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  isLoading,
  onLogin,
  onKeyPress,
  onForgotPassword
}) => {
  return (
    <div className="flex-col items-start gap-[15px] self-stretch w-full flex-[0_0_auto] flex relative">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={onKeyPress}
        className="flex items-center gap-[213px] p-[15px] relative self-stretch w-full flex-[0_0_auto] bg-white rounded-[15px] border border-solid border-[#a8a8a8] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)] h-auto"
      />

      <div className="relative self-stretch w-full">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={onKeyPress}
          className="flex items-center gap-64 p-[15px] pr-12 relative self-stretch w-full flex-[0_0_auto] bg-white rounded-[15px] border border-solid border-[#a8a8a8] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)] h-auto"
        />
        <Button
          type="button"
          variant="ghost"
          className="absolute right-[10px] top-1/2 transform -translate-y-1/2 h-auto p-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            {showPassword ? (
              <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </>
            ) : (
              <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </>
            )}
          </svg>
        </Button>
      </div>

      <div className="flex items-center justify-between pt-[5px] pb-2.5 px-0 relative self-stretch w-full flex-[0_0_auto]">
        <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            className="w-[18px] h-[18px] rounded-[9px] border border-solid border-[#231f20] data-[state=checked]:bg-button-green data-[state=checked]:border-[#231f20]"
          />

          <label
            htmlFor="remember"
            className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-off-black text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)] cursor-pointer"
          >
            Remember me
          </label>
        </div>

        <Button
          variant="ghost"
          className="h-auto p-0 hover:bg-transparent"
          onClick={onForgotPassword}
        >
          <div className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-off-black text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
            Forgot password?
          </div>
        </Button>
      </div>
    </div>
  );
};

// Separate component for registration form
const RegistrationForm: React.FC<{
  username: string;
  setUsername: (username: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  agreeToTerms: boolean;
  setAgreeToTerms: (agree: boolean) => void;
  emailStatus: 'idle' | 'checking' | 'available' | 'taken';
  onEmailChange: (value: string) => void;
  onSendCode: () => void;
  isSending: boolean;
  countdown: number;
}> = ({
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  verificationCode,
  setVerificationCode,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  agreeToTerms,
  setAgreeToTerms,
  emailStatus,
  onEmailChange,
  onSendCode,
  isSending,
  countdown
}) => {
  return (
    <div className="flex-col items-start gap-4 sm:gap-[15px] self-stretch w-full flex-[0_0_auto] flex relative">
      {/* User name */}
      <Input
        placeholder="User name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="flex items-center p-3 sm:p-[15px] relative self-stretch w-full bg-white rounded-[15px] border border-solid border-[#a8a8a8] text-medium-dark-grey h-auto"
      />

      {/* Email */}
      <div className="relative self-stretch w-full">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className={`flex items-center p-3 sm:p-[15px] pr-[40px] relative self-stretch w-full bg-white rounded-[15px] border border-solid text-medium-dark-grey h-auto ${
            emailStatus === 'taken'
              ? 'border-red-500'
              : emailStatus === 'available'
                ? 'border-green-500'
                : 'border-[#a8a8a8]'
          }`}
        />
        {/* Email status icon */}
        <div className="absolute right-[12px] top-1/2 transform -translate-y-1/2">
          {emailStatus === 'checking' && (
            <BookFlip />
          )}
          {emailStatus === 'available' && (
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {emailStatus === 'taken' && (
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        {/* Email status hint - gentler hint */}
        {emailStatus === 'taken' && (
          <div className="mt-1 text-xs text-red-400">
            This email is already registered
          </div>
        )}
        {emailStatus === 'available' && (
          <div className="mt-1 text-xs text-green-400 opacity-75">
            ✓ Email available
          </div>
        )}
      </div>

      {/* Verification code section */}
      <div className="flex items-center gap-[15px] relative self-stretch w-full">
        <Input
          placeholder="Enter verification code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          className="flex items-center p-[15px] relative flex-1 bg-white rounded-[15px] border border-solid border-[#a8a8a8] text-medium-dark-grey h-auto"
        />
        <Button
          className={`px-[15px] h-auto min-h-[50px] text-white rounded-[15px] border-0 whitespace-nowrap flex items-center justify-center transition-all ${
            countdown > 0 || isSending || emailStatus === 'taken' || emailStatus === 'checking' || !email.includes('@')
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red hover:bg-red/90'
          }`}
          onClick={onSendCode}
          disabled={countdown > 0 || isSending || emailStatus === 'taken' || emailStatus === 'checking' || !email.includes('@')}
        >
          <span className="font-['Lato',_Helvetica] font-normal text-white text-sm">
            {isSending
              ? 'Sending...'
              : countdown > 0
                ? `${countdown}s`
                : emailStatus === 'checking'
                  ? 'Checking'
                  : emailStatus === 'taken'
                    ? 'Email taken'
                    : !email.includes('@')
                      ? 'Enter email'
                      : 'Send code'
            }
          </span>
        </Button>
      </div>

      {/* Password label */}
      <div className="relative self-stretch w-full">
        <span className="font-['Lato',_Helvetica] font-normal text-off-black text-sm">
          *Password
        </span>
      </div>

      {/* Password */}
      <div className="relative self-stretch w-full">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="flex items-center p-3 sm:p-[15px] pr-[45px] relative self-stretch w-full bg-white rounded-[15px] border border-solid border-[#a8a8a8] text-medium-dark-grey h-auto"
        />
        <Button
          type="button"
          variant="ghost"
          className="absolute right-[10px] top-1/2 transform -translate-y-1/2 h-auto p-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            {showPassword ? (
              <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </>
            ) : (
              <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </>
            )}
          </svg>
        </Button>
      </div>

      {/* Confirm Password */}
      <div className="relative self-stretch w-full">
        <Input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="flex items-center p-3 sm:p-[15px] pr-[45px] relative self-stretch w-full bg-white rounded-[15px] border border-solid border-[#a8a8a8] text-medium-dark-grey h-auto"
        />
        <Button
          type="button"
          variant="ghost"
          className="absolute right-[10px] top-1/2 transform -translate-y-1/2 h-auto p-2 hover:bg-transparent"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            {showConfirmPassword ? (
              <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </>
            ) : (
              <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </>
            )}
          </svg>
        </Button>
      </div>

      {/* Terms agreement */}
      <div className="flex items-center justify-start pt-[5px] pb-2.5 px-0 relative self-stretch w-full flex-[0_0_auto]">
        <div className="inline-flex items-start gap-2.5 relative flex-[0_0_auto]">
          <Checkbox
            id="terms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
            className="w-[18px] h-[18px] rounded-[3px] border border-solid border-[#a8a8a8] data-[state=checked]:bg-button-green data-[state=checked]:border-button-green mt-1"
          />

          <label
            htmlFor="terms"
            className="relative font-['Lato',_Helvetica] font-normal text-medium-dark-grey text-sm leading-[20px] cursor-pointer"
          >
            I have read and understood <span className="underline text-medium-dark-grey">the terms</span>.
          </label>
        </div>
      </div>
    </div>
  );
};

export const Login = (): JSX.Element => {
  const { login, fetchUserInfo } = useUser();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState("login");

  // Registration form state
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [emailCheckTimeout, setEmailCheckTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Reset password modal state
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Restore remembered email when page loads
  useEffect(() => {
    const savedEmail = localStorage.getItem('copus_remembered_email');
    const savedRememberMe = localStorage.getItem('copus_remember_me_option');

    if (savedEmail) {
      setLoginEmail(savedEmail);
    }

    if (savedRememberMe !== null) {
      setRememberMe(savedRememberMe === 'true');
    }
  }, []);

  // Handle social login OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      // Check localStorage first for provider (more reliable than URL param)
      // OAuth providers like Twitter don't preserve custom query parameters
      let provider = localStorage.getItem('oauth_provider') || searchParams.get('provider');

      // Clear the localStorage value after reading it
      if (provider) {
        localStorage.removeItem('oauth_provider');
      }

      if (code && state) {
        setIsLoginLoading(true);

        try {
          let response;

          // Call different login methods based on provider type
          if (provider === 'google') {
            response = await AuthService.googleLogin(code, state, !!localStorage.getItem('copus_token'));
            
            const savedToken = localStorage.getItem('copus_token');
            const tokenToUse = response.token || savedToken;

            if (response.isBinding) {
              // Account binding mode
              showToast('Google account successfully bound! 🎉', 'success');
              await fetchUserInfo(tokenToUse);
              navigate('/setting', { replace: true });
            } else {
              // Third-party login mode
              showToast('Google login successful! Welcome back 🎉', 'success');
              
              if (!tokenToUse) {
                throw new Error('No authentication token received');
              }

              await fetchUserInfo(tokenToUse);
              
              // Sync Google profile data to Copus profile
              if (response.googleProfile) {
                try {
                  const updateData: any = {};
                  if (response.googleProfile.username) {
                    updateData.userName = response.googleProfile.username;
                  }
                  if (response.googleProfile.faceUrl) {
                    updateData.faceUrl = response.googleProfile.faceUrl;
                  }

                  if (Object.keys(updateData).length > 0) {
                    await AuthService.updateUserInfo(updateData);
                    await fetchUserInfo(tokenToUse);
                  }
                } catch (profileError) {
                  // Don't block login if profile sync fails
                }
              }
              
              navigate('/', { replace: true });
            }
          } else if (provider === 'x') {
            // X (Twitter) login handling
            response = await AuthService.xLogin(code, state, !!localStorage.getItem('copus_token'));
            
            const savedToken = localStorage.getItem('copus_token');
            const tokenToUse = response.token || savedToken;

            if (response.isBinding) {
              // Account binding mode
              showToast('X account successfully bound! 🎉', 'success');
              await fetchUserInfo(tokenToUse);
              navigate('/setting', { replace: true });
            } else {
              // Third-party login mode
              showToast('X login successful! Welcome back 🎉', 'success');
              
              if (!tokenToUse) {
                throw new Error('No authentication token received');
              }

              await fetchUserInfo(tokenToUse);
              
              // Sync X profile data to Copus profile
              if (response.xProfile) {
                try {
                  const updateData: any = {};
                  if (response.xProfile.username) {
                    updateData.userName = response.xProfile.username;
                  }
                  if (response.xProfile.faceUrl) {
                    updateData.faceUrl = response.xProfile.faceUrl;
                  }
                  if (response.xProfile.bio) {
                    updateData.bio = response.xProfile.bio;
                  }

                  if (Object.keys(updateData).length > 0) {
                    await AuthService.updateUserInfo(updateData);
                    await fetchUserInfo(tokenToUse);
                  }
                } catch (profileError) {
                  // Don't block login if profile sync fails
                }
              }
              
              navigate('/', { replace: true });
            }
          } else {
            // Default fallback (for backward compatibility)
            response = await AuthService.xLogin(code, state, !!localStorage.getItem('copus_token'));

            if (response.token || response.data?.token) {
              showToast('Login successful! Welcome back 🎉', 'success');
              const tokenToUse = response.token || response.data?.token;
              await fetchUserInfo(tokenToUse);
              navigate('/', { replace: true });
            } else {
              throw new Error('No authentication token received');
            }
          }
        } catch (error) {
          showToast(`${provider || 'X'} login failed, please try again`, 'error');
        } finally {
          setIsLoginLoading(false);
        }
      }
    };

    handleOAuthCallback();
  }, [searchParams, fetchUserInfo, navigate, showToast]);

  // Handle X (Twitter) login
  const handleXLogin = async () => {
    try {
      localStorage.setItem('oauth_provider', 'x');
      const oauthUrl = await AuthService.getXOAuthUrl();
      const urlWithProvider = oauthUrl.includes('?')
        ? `${oauthUrl}&provider=x`
        : `${oauthUrl}?provider=x`;
      window.location.href = urlWithProvider;
    } catch (error: any) {
      showToast(`X login failed: ${error.message || 'Please try again'}`, 'error');
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      localStorage.setItem('oauth_provider', 'google');
      const oauthUrl = await AuthService.getGoogleOAuthUrl();
      const urlWithProvider = oauthUrl.includes('?')
        ? `${oauthUrl}&provider=google`
        : `${oauthUrl}?provider=google`;
      window.location.href = urlWithProvider;
    } catch (error: any) {
      showToast(`Google login failed: ${error.message || 'Please try again'}`, 'error');
    }
  };

  // Handle Metamask login
  const handleMetamaskLogin = async () => {
    try {
      if (!window.ethereum) {
        showToast('Please install Metamask wallet first', 'error');
        return;
      }

      setIsLoginLoading(true);
      
      // 1. Connect Metamask to get accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('Failed to get Metamask accounts');
      }

      const address = accounts[0];
      
      // 2. Get signature data from backend
      const signatureDataResponse = await AuthService.getMetamaskSignatureData(address);
      
      // Ensure signatureData is a string
      let signatureData = signatureDataResponse;
      if (typeof signatureDataResponse !== 'string') {
        if (signatureDataResponse && typeof signatureDataResponse === 'object') {
          if (signatureDataResponse.data) {
            signatureData = signatureDataResponse.data;
          } else if (signatureDataResponse.message) {
            signatureData = signatureDataResponse.message;
          } else if (signatureDataResponse.msg) {
            signatureData = signatureDataResponse.msg;
          } else {
            signatureData = JSON.stringify(signatureDataResponse);
          }
        } else {
          signatureData = String(signatureDataResponse);
        }
      }
      
      if (!signatureData || typeof signatureData !== 'string' || signatureData.trim() === '') {
        throw new Error('Invalid signature data received from server');
      }
      
      // 3. Sign the exact message returned by backend
      let signature;
      try {
        signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [signatureData, address],
        });
      } catch (signError) {
        throw signError;
      }

      // 4. Submit login
      const response: any = await AuthService.metamaskLogin(address, signature, !!localStorage.getItem('copus_token'));
      
      if (response.status === 1) {
        const possibleToken = extractTokenFromResponse(response);
        login(createBasicUser(loginEmail, '', address), possibleToken);

        try {
          await fetchUserInfo(possibleToken);
        } catch (userInfoError) {
          // Handle error silently
        }

        showToast('Login successful! Welcome back 🎉', 'success');
        navigate('/');
      } else {
        showToast(`Metamask login failed: ${response.msg || 'Please try again'}`, 'error');
      }
    } catch (error) {
      showToast(`Metamask login failed: ${error instanceof Error ? error.message : 'Please try again'}`, 'error');
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Unified social login handler
  const handleSocialLogin = async (provider: string) => {
    switch (provider) {
      case 'X':
        await handleXLogin();
        break;
      case 'Google':
        await handleGoogleLogin();
        break;
      case 'Metamask':
        await handleMetamaskLogin();
        break;
      default:
        showToast(`Unsupported login provider: ${provider}`, 'error');
    }
  };

  // Check if email already exists
  const checkEmailExist = async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setEmailStatus('idle');
      return;
    }

    setEmailStatus('checking');

    try {
      const response = await fetch(`${APP_CONFIG.API.BASE_URL}/client/common/checkEmailExist?email=${encodeURIComponent(emailToCheck)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 1 && data.data === false) {
          setEmailStatus('available');
        } else if (data.status === 1 && data.data === true) {
          setEmailStatus('taken');
        } else {
          setEmailStatus('idle');
        }
      } else {
        setEmailStatus('idle');
      }
    } catch (error) {
      setEmailStatus('idle');
    }
  };

  // Email input handler (debounced)
  const handleEmailChange = (value: string) => {
    setEmail(value);

    // Clear previous timer
    if (emailCheckTimeout) {
      clearTimeout(emailCheckTimeout);
    }

    // Set new timer, check email after 200ms
    if (value && value.includes('@')) {
      const timeout = setTimeout(() => {
        checkEmailExist(value);
      }, 200);
      setEmailCheckTimeout(timeout);
    } else {
      setEmailStatus('idle');
    }
  };

  // Login function
  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      showToast('Please enter email and password', 'error');
      return;
    }

    setIsLoginLoading(true);

    try {
      // MD5 encrypt password
      const encryptedPassword = CryptoJS.MD5(loginPassword).toString();

      const response = await fetch(`${APP_CONFIG.API.BASE_URL}/client/common/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginEmail,
          password: encryptedPassword
        }),
      });

      const data = await response.json();

      if (data.status === 1) {
        const possibleToken = extractTokenFromResponse(data);

        login(createBasicUser(loginEmail), possibleToken);

        // If user chooses Remember me, save email to local storage
        if (rememberMe) {
          localStorage.setItem('copus_remembered_email', loginEmail);
          localStorage.setItem('copus_remember_me_option', 'true');
        } else {
          localStorage.removeItem('copus_remembered_email');
          localStorage.setItem('copus_remember_me_option', 'false');
        }

        try {
          await fetchUserInfo(possibleToken);
        } catch (userInfoError) {
          // Handle error silently
        }

        showToast('Login successful! Welcome back 🎉', 'success');
        navigate('/');
      } else {
        // Translate error messages
        let errorMessage = 'Login failed';
        if (data.msg) {
          if (data.msg.includes('错误的密码') || data.msg.includes('wrong password') || data.status === 2057) {
            errorMessage = 'Incorrect password';
          } else if (data.msg.includes('用户不存在') || data.msg.includes('user not found')) {
            errorMessage = 'Email not registered';
          } else if (data.msg.includes('账号被禁用') || data.msg.includes('account disabled')) {
            errorMessage = 'Account has been disabled';
          } else {
            errorMessage = data.msg;
          }
        }

        showToast(errorMessage, 'error');
      }
    } catch (error) {
      showToast('Login failed, please try again', 'error');
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Registration function
  const handleRegister = async () => {
    // Basic validation
    if (!username || !email || !password || !confirmPassword || !verificationCode) {
      showToast('Please fill in complete registration information', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (!agreeToTerms) {
      showToast('Please agree to the terms of service', 'error');
      return;
    }

    if (emailStatus !== 'available') {
      showToast('Please use an available email address', 'error');
      return;
    }

    setIsRegisterLoading(true);

    try {
      // MD5 encrypt password
      const encryptedPassword = CryptoJS.MD5(password).toString();

      const response = await fetch(`${APP_CONFIG.API.BASE_URL}/client/common/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: encryptedPassword,
          code: verificationCode
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 1) {
        showToast('Registration successful! Please log in', 'success');
        // Clear all registration form fields on success
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setVerificationCode('');
        setAgreeToTerms(false);
        setEmailStatus('idle');
        // Switch to login tab after successful registration
        setActiveTab("login");
      } else {
        showToast(`Registration failed: ${data.msg || data.message || 'Please try again'}`, 'error');
        // On failure, only clear verification code, keep other filled information
        setVerificationCode('');
      }
    } catch (error) {
      showToast('Registration failed, please try again', 'error');
    } finally {
      setIsRegisterLoading(false);
    }
  };

  // 使用统一的验证码hook
  const { sendCode, isSending, countdown } = useVerificationCode({
    onSendSuccess: () => {
      showToast('Verification code sent! Please check your email', 'success');
    },
    onSendError: (error) => {
      showToast(error, 'error');
    }
  });

  // Send verification code function
  const sendVerificationCode = async () => {
    // Check various conditions and provide feedback
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (emailStatus === 'taken') {
      showToast('This email is already registered', 'error');
      return;
    }

    if (emailStatus === 'checking') {
      showToast('Please wait for email validation to complete', 'info');
      return;
    }

    sendCode(email, 0); // 0 is the code type for registration
  };

  // Handle Enter key login
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.15)_0%,rgba(224,224,224,0.15)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] overflow-x-hidden">
      <HeaderSection isLoggedIn={false} hideCreateButton={true} showDiscoverNow={true} hideLoginButton={true} />
      <div className="flex w-full min-h-screen relative flex-col items-center pt-[70px] lg:pt-[120px]">
        <main className="flex items-center justify-center gap-2.5 relative flex-1 grow py-4 sm:py-10 px-4 sm:px-0">
          <Card className="w-full max-w-[480px] bg-white rounded-lg border-0 shadow-none relative z-10">
            <CardContent className="flex flex-col items-center justify-center gap-8 sm:gap-[50px] px-6 sm:px-[50px] py-8 sm:py-[60px]">
              <div className="flex flex-col items-start gap-[15px] relative self-stretch w-full flex-[0_0_auto]">
                <h1 className="relative self-stretch mt-[-1.00px] font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] text-center tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] [font-style:var(--h-3-font-style)]">
                  Join Copus
                </h1>

                <p className="relative self-stretch font-h-4 font-[number:var(--h-4-font-weight)] text-dark-grey text-[length:var(--h-4-font-size)] text-center tracking-[var(--h-4-letter-spacing)] leading-[var(--h-4-line-height)] [font-style:var(--h-4-font-style)]">
                  Discover and share valuable digital gem
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-6 sm:gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0">
                    <TabsTrigger
                      value="login"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#454545] data-[state=inactive]:border-b-0 rounded-none pb-2.5 px-3 sm:px-[15px] bg-transparent"
                    >
                      <span className="font-['Lato',_Helvetica] font-bold text-dark-grey text-lg text-center tracking-[0] leading-[25.2px] whitespace-nowrap">
                        Log in
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="signup"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#454545] data-[state=inactive]:border-b-0 rounded-none pb-2.5 px-3 sm:px-[15px] bg-transparent"
                    >
                      <span className="font-['Lato',_Helvetica] font-bold text-dark-grey text-lg text-center tracking-[0] leading-[25.2px] whitespace-nowrap">
                        Sign up
                      </span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="mt-6 sm:mt-[30px]">
                    <LoginForm
                      email={loginEmail}
                      setEmail={setLoginEmail}
                      password={loginPassword}
                      setPassword={setLoginPassword}
                      showPassword={showLoginPassword}
                      setShowPassword={setShowLoginPassword}
                      rememberMe={rememberMe}
                      setRememberMe={setRememberMe}
                      isLoading={isLoginLoading}
                      onLogin={handleLogin}
                      onKeyPress={handleKeyDown}
                      onForgotPassword={() => setShowResetPassword(true)}
                    />
                    
                    <Button
                      className="flex items-center justify-center px-8 sm:px-10 py-2.5 w-full rounded-[100px] border border-solid border-[#f23a00] bg-transparent hover:bg-red/5 mt-6 sm:mt-[30px] h-auto"
                      onClick={handleLogin}
                      disabled={isLoginLoading || !loginEmail || !loginPassword}
                    >
                      <span className="font-['Lato',_Helvetica] font-bold text-red text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                        {isLoginLoading ? (
                          <span className="flex items-center space-x-2">
                            <GemSpinner size="sm" />
                            <span>Logging in...</span>
                          </span>
                        ) : (
                          'Log in'
                        )}
                      </span>
                    </Button>
                  </TabsContent>

                  <TabsContent value="signup" className="mt-6 sm:mt-[30px]">
                    <RegistrationForm
                      username={username}
                      setUsername={setUsername}
                      email={email}
                      setEmail={setEmail}
                      password={password}
                      setPassword={setPassword}
                      confirmPassword={confirmPassword}
                      setConfirmPassword={setConfirmPassword}
                      verificationCode={verificationCode}
                      setVerificationCode={setVerificationCode}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      showConfirmPassword={showConfirmPassword}
                      setShowConfirmPassword={setShowConfirmPassword}
                      agreeToTerms={agreeToTerms}
                      setAgreeToTerms={setAgreeToTerms}
                      emailStatus={emailStatus}
                      onEmailChange={handleEmailChange}
                      onSendCode={sendVerificationCode}
                      isSending={isSending}
                      countdown={countdown}
                    />
                    
                    <Button
                      className="flex items-center justify-center px-8 sm:px-10 py-2.5 w-full rounded-[100px] border border-solid border-[#f23a00] bg-transparent hover:bg-red/5 mt-6 sm:mt-[30px] h-auto"
                      onClick={handleRegister}
                      disabled={isRegisterLoading || !username || !email || !password || !confirmPassword || !verificationCode || !agreeToTerms || emailStatus !== 'available'}
                    >
                      <span className="font-['Lato',_Helvetica] font-bold text-red text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                        {isRegisterLoading ? (
                          <span className="flex items-center space-x-2">
                            <GemSpinner size="sm" />
                            <span>Signing up...</span>
                          </span>
                        ) : (
                          'Sign up'
                        )}
                      </span>
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex flex-col items-start gap-4 sm:gap-5 self-stretch w-full relative flex-[0_0_auto]">
                <div className="gap-3 sm:gap-[15px] pt-4 sm:pt-5 pb-2.5 px-0 self-stretch w-full flex-[0_0_auto] rounded-[25px] overflow-hidden flex items-center justify-center relative">
                  <Separator className="flex-1 bg-medium-dark-grey" />

                  <div className="relative flex items-center justify-center w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-medium-dark-grey text-[length:var(--p-font-size)] text-center tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)] px-4">
                    Or sign in with
                  </div>

                  <Separator className="flex-1 bg-medium-dark-grey" />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-[10px_30px] relative self-stretch w-full flex-[0_0_auto]">
                  {socialProviders.map((provider, index) => (
                    <Button
                      key={`social-${index}`}
                      variant="ghost"
                      className="flex flex-col items-center justify-center w-16 sm:w-[70px] h-12 sm:h-[60px] gap-1 sm:gap-[8px] p-1 sm:p-2 hover:bg-transparent transition-all duration-200 hover:scale-105"
                      onClick={() => handleSocialLogin(provider.name)}
                      disabled={isLoginLoading}
                    >
                      <div className="flex items-center justify-center w-6 sm:w-[30px] h-6 sm:h-[30px] flex-shrink-0">
                        <img
                          className="w-6 sm:w-[30px] h-6 sm:h-[30px] object-contain"
                          alt={`${provider.name} icon`}
                          src={provider.icon}
                        />
                      </div>

                      <span className="font-['Lato',_Helvetica] font-normal text-off-black text-xs sm:text-sm text-center leading-[16px] whitespace-nowrap">
                        {provider.name}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reset password modal */}
          <ResetPasswordModal
            isOpen={showResetPassword}
            onClose={() => setShowResetPassword(false)}
            onSuccess={() => {
              showToast('Password reset successfully! Please log in with your new password.', 'success');
              setShowResetPassword(false);
            }}
          />
        </main>

        {/* Octopus background - positioned at bottom left of full page */}
        <img
          className="fixed bottom-0 left-[-60px] sm:left-[-70px] md:left-[-80px] lg:left-[-90px] xl:left-[-100px] 2xl:left-[-110px]
                     w-[280px] sm:w-[320px] md:w-[360px] lg:w-[400px] xl:w-[450px] 2xl:w-[500px]
                     h-auto z-0"
          alt="Ic fractopus open"
          src="https://c.animaapp.com/mftc49qfOGKRUh/img/ic-fractopus-open.svg"
        />
      </div>
    </div>
  );
};