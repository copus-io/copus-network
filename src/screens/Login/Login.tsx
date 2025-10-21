import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { APP_CONFIG } from "../../config/app";

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

export const Login = (): JSX.Element => {
  const { login, fetchUserInfo } = useUser();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true); // Remember both login state and account email
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
  const [isCodeSending, setIsCodeSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [emailCheckTimeout, setEmailCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);

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

      console.log('🔍 OAuth callback - provider:', provider, 'code:', code ? 'exists' : 'none', 'state:', state ? 'exists' : 'none');

      if (code && state) {
        setIsLoginLoading(true);

        try {
          let response;

          // Call different login methods based on provider type
          if (provider === 'google') {
            const token = localStorage.getItem('copus_token');
            const hasToken = !!token;

            console.log('🔍 Google login - hasToken:', hasToken);
            response = await AuthService.googleLogin(code, state, hasToken);
            console.log('✅ Google login response:', response);

            // The token should already be saved by AuthService.googleLogin
            // Check localStorage for the token
            const savedToken = localStorage.getItem('copus_token');
            console.log('💾 Token saved in localStorage:', savedToken ? 'YES' : 'NO');

            if (response.isBinding) {
              // Account binding mode
              showToast('Google account successfully bound! 🎉', 'success');

              // Google binding may return new token, re-fetch user info
              const tokenToUse = response.token || savedToken || token;
              console.log('🔐 Using token for fetchUserInfo:', tokenToUse?.substring(0, 20) + '...');
              await fetchUserInfo(tokenToUse);

              // Navigate to settings immediately
              navigate('/setting', { replace: true });
            } else {
              // Third-party login mode - sync Google profile to Copus
              showToast('Google login successful! Welcome back 🎉', 'success');

              // Get user info - use token from response or localStorage
              const tokenToUse = response.token || savedToken;
              console.log('🔐 Using token for fetchUserInfo:', tokenToUse?.substring(0, 20) + '...');

              if (!tokenToUse) {
                console.error('❌ No token available after Google login!');
                throw new Error('No authentication token received');
              }

              await fetchUserInfo(tokenToUse);
              console.log('✅ User info fetched successfully');

              // Sync Google profile data to Copus profile (profile data is already in response)
              if (response.googleProfile) {
                try {
                  console.log('🔄 Syncing Google profile data to Copus...');
                  console.log('📸 Google profile data from login response:', response.googleProfile);

                  // Update Copus profile with Google data
                  const updateData: any = {};
                  if (response.googleProfile.username) {
                    updateData.userName = response.googleProfile.username;
                  }
                  if (response.googleProfile.faceUrl) {
                    // Use faceUrl as profile image
                    updateData.faceUrl = response.googleProfile.faceUrl;
                  }

                  if (Object.keys(updateData).length > 0) {
                    console.log('📝 Updating Copus profile with:', updateData);
                    await AuthService.updateUserInfo(updateData);
                    console.log('✅ Profile synced successfully');

                    // Re-fetch user info to get updated profile
                    await fetchUserInfo(tokenToUse);
                    console.log('✅ User info refreshed after sync');
                  } else {
                    console.log('⚠️ No Google profile data to sync');
                  }
                } catch (profileError) {
                  console.error('⚠️ Failed to sync Google profile (non-fatal):', profileError);
                  // Don't block login if profile sync fails
                }
              } else {
                console.log('⚠️ No Google profile data in login response');
              }

              // Navigate to home immediately (replace history to avoid back button going to login)
              navigate('/', { replace: true });
            }
          } else if (provider === 'x') {
            // X (Twitter) login handling
            const token = localStorage.getItem('copus_token');
            const hasToken = !!token;

            console.log('🔍 X login - hasToken:', hasToken);
            response = await AuthService.xLogin(code, state, hasToken);
            console.log('✅ X login response:', response);

            // The token should already be saved by AuthService.xLogin
            // Check localStorage for the token
            const savedToken = localStorage.getItem('copus_token');
            console.log('💾 Token saved in localStorage:', savedToken ? 'YES' : 'NO');

            if (response.isBinding) {
              // Account binding mode
              showToast('X account successfully bound! 🎉', 'success');

              // X binding may return new token, re-fetch user info
              const tokenToUse = response.token || savedToken || token;
              console.log('🔐 Using token for fetchUserInfo:', tokenToUse?.substring(0, 20) + '...');
              await fetchUserInfo(tokenToUse);

              // Navigate to settings immediately
              navigate('/setting', { replace: true });
            } else {
              // Third-party login mode - sync X profile to Copus
              showToast('X login successful! Welcome back 🎉', 'success');

              // Get user info - use token from response or localStorage
              const tokenToUse = response.token || savedToken;
              console.log('🔐 Using token for fetchUserInfo:', tokenToUse?.substring(0, 20) + '...');

              if (!tokenToUse) {
                console.error('❌ No token available after X login!');
                throw new Error('No authentication token received');
              }

              await fetchUserInfo(tokenToUse);
              console.log('✅ User info fetched successfully');

              // Sync X profile data to Copus profile (profile data is already in response)
              if (response.xProfile) {
                try {
                  console.log('🔄 Syncing X profile data to Copus...');
                  console.log('📸 X profile data from login response:', response.xProfile);

                  // Update Copus profile with X data
                  const updateData: any = {};
                  if (response.xProfile.username) {
                    updateData.userName = response.xProfile.username;
                  }
                  if (response.xProfile.faceUrl) {
                    // Use faceUrl as profile image
                    updateData.faceUrl = response.xProfile.faceUrl;
                  }
                  if (response.xProfile.bio) {
                    updateData.bio = response.xProfile.bio;
                  }

                  if (Object.keys(updateData).length > 0) {
                    console.log('📝 Updating Copus profile with:', updateData);
                    await AuthService.updateUserInfo(updateData);
                    console.log('✅ Profile synced successfully');

                    // Re-fetch user info to get updated profile
                    await fetchUserInfo(tokenToUse);
                    console.log('✅ User info refreshed after sync');
                  } else {
                    console.log('⚠️ No X profile data to sync');
                  }
                } catch (profileError) {
                  console.error('⚠️ Failed to sync X profile (non-fatal):', profileError);
                  // Don't block login if profile sync fails
                }
              } else {
                console.log('⚠️ No X profile data in login response');
              }

              // Navigate to home immediately (replace history to avoid back button going to login)
              navigate('/', { replace: true });
            }
          } else {
            // Default fallback (for backward compatibility)
            console.log('⚠️ Unknown provider or no provider specified, attempting X login...');
            const token = localStorage.getItem('copus_token');
            const hasToken = !!token;
            response = await AuthService.xLogin(code, state, hasToken);

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
          console.error(`❌ ${provider || 'X'} login failed:`, error);
          showToast(`${provider || 'X'} login failed, please try again`, 'error');
        } finally {
          setIsLoginLoading(false);
        }
      }
    };

    handleOAuthCallback();
  }, [searchParams, fetchUserInfo, navigate, showToast]);

  // Handle social login
  const handleSocialLogin = async (provider: string) => {

    if (provider === 'X') {
      try {
        console.log('🔍 Starting X OAuth process...');

        // Save provider to localStorage (OAuth callback will read this)
        // This is more reliable than URL params because Twitter doesn't preserve them
        localStorage.setItem('oauth_provider', 'x');

        // Try to get X OAuth URL - this should work for both login and binding
        const oauthUrl = await AuthService.getXOAuthUrl();

        console.log('✅ Got X OAuth URL:', oauthUrl);
        console.log('💾 Saved provider to localStorage: x');

        // Add provider parameter for callback identification (backup method)
        const urlWithProvider = oauthUrl.includes('?')
          ? `${oauthUrl}&provider=x`
          : `${oauthUrl}?provider=x`;

        console.log('🚀 Redirecting to:', urlWithProvider);
        window.location.href = urlWithProvider;
      } catch (error) {
        console.error('❌ X OAuth handling failed:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ Full error:', error);
        showToast(`X login failed: ${error.message || 'Please try again'}`, 'error');
      }
    } else if (provider === 'Google') {
      try {
        console.log('🔍 Starting Google OAuth process...');

        // Save provider to localStorage (OAuth callback will read this)
        localStorage.setItem('oauth_provider', 'google');

        // Try to get Google OAuth URL - this should work for both login and binding
        const oauthUrl = await AuthService.getGoogleOAuthUrl();

        console.log('✅ Got Google OAuth URL:', oauthUrl);
        console.log('💾 Saved provider to localStorage: google');

        // Don't replace redirect_uri for localhost - use the OAuthRedirect flow instead
        // Flow: Google -> test.copus.io/callback -> OAuthRedirect -> localhost/login
        // This ensures the backend can verify the code with the same redirect_uri it used

        // Add provider parameter for callback identification
        const urlWithProvider = oauthUrl.includes('?')
          ? `${oauthUrl}&provider=google`
          : `${oauthUrl}?provider=google`;

        console.log('🚀 Final redirect URL:', urlWithProvider);
        window.location.href = urlWithProvider;
      } catch (error) {
        console.error('❌ Google OAuth handling failed:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ Full error:', error);
        showToast(`Google login failed: ${error.message || 'Please try again'}`, 'error');
      }
    } else if (provider === 'Metamask') {
      try {
        // Check if Metamask is installed
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

        // 2. Get signature data
        const signatureData = await AuthService.getMetamaskSignatureData(address);

        // 3. User signature (adjust according to actual API response data format)
        const messageToSign = `Welcome to Copus! Please sign this message to authenticate your wallet: ${signatureData}`;

        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [messageToSign, address],
        });


        // 4. Submit login
        const token = localStorage.getItem('copus_token');
        const hasToken = !!token;

        const response = await AuthService.metamaskLogin(address, signature, hasToken);

        if (response.isBinding) {
          // Account binding mode
          showToast('Metamask account binding successful! 🎉', 'success');

          // Re-fetch user info after binding
          await fetchUserInfo(response.token || token);

          // Navigate to settings page
          setTimeout(() => {
            navigate('/setting');
          }, 1000);
        } else {
          // Third-party login mode
          showToast('Metamask login successful! Welcome back 🎉', 'success');

          // Get user info
          await fetchUserInfo(response.token);

          // Navigate to home
          setTimeout(() => {
            navigate('/');
          }, 1000);
        }
      } catch (error) {
        console.error('❌ Metamask login failed:', error);
        showToast(`Metamask login failed: ${error instanceof Error ? error.message : 'Please try again'}`, 'error');
      } finally {
        setIsLoginLoading(false);
      }
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
        // API response format: {"status":1,"msg":"success","data":false}
        // data=true means email already exists, false means available
        if (data.status === 1 && data.data === false) {
          setEmailStatus('available');
        } else if (data.status === 1 && data.data === true) {
          setEmailStatus('taken');
        } else {
          setEmailStatus('idle');
        }
      } else {
        console.error('Email check request failed:', response.status);
        setEmailStatus('idle');
      }
    } catch (error) {
      console.error('Check email failed:', error);
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

      console.log('Login info:', {
        username: loginEmail,
        password: '***MD5 encrypted***'
      });

      const response = await fetch(`${APP_CONFIG.API.BASE_URL}/client/common/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginEmail, // API expects username field, we pass email as username
          password: encryptedPassword // Send MD5 encrypted password
        }),
      });

      console.log('Response info:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login success data:', {
          token: data.token,
          access_token: data.access_token,
          accessToken: data.accessToken,
          authToken: data.authToken,
          'data.token': data.data?.token,
          'data.access_token': data.data?.access_token
        });

        // Try to get token from different possible fields
        const possibleToken = data.data?.token || data.token || data.access_token || data.accessToken || data.authToken || data.data?.access_token;

        // Save token to global state
        if (data.user) {
          login(data.user, possibleToken);
        } else {
          // If API doesn't return user info, create a basic user object and save token
          login({
            id: data.id || 0,
            username: data.username || loginEmail.split('@')[0],
            email: loginEmail,
            bio: '',
            coverUrl: '',
            faceUrl: '',
            namespace: '',
            walletAddress: ''
          }, possibleToken);
        }

        // Get complete user info, pass the token just obtained
        try {
          await fetchUserInfo(possibleToken);
        } catch (userInfoError) {
        }

        // If user chooses Remember me, save email to local storage
        if (rememberMe) {
          localStorage.setItem('copus_remembered_email', loginEmail);
          localStorage.setItem('copus_remember_me_option', 'true');
        } else {
          // If not remember, clear previously saved email
          localStorage.removeItem('copus_remembered_email');
          localStorage.setItem('copus_remember_me_option', 'false');
        }

        showToast('Login successful! Welcome back 🎉', 'success');

        // Navigate to home page
        navigate('/copus');
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        showToast('Login failed, please check email and password', 'error');
      }
    } catch (error) {
      console.error('Login request failed:', error);
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

      console.log('Registration info:', {
        username: username,
        email: email,
        password: '***MD5 encrypted***',
        code: verificationCode
      });

      const response = await fetch(`${APP_CONFIG.API.BASE_URL}/client/common/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: encryptedPassword, // Send MD5 encrypted password
          code: verificationCode
        }),
      });

      console.log('registration response info:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();

      // Determine if registration was truly successful
      // response.ok means HTTP status code 2xx, data.status=1 means business logic success
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
        console.error('Registration failed:', data);
        showToast(`Registration failed: ${data.msg || data.message || 'Please try again'}`, 'error');
        // On failure, only clear verification code, keep other filled information
        setVerificationCode('');
      }
    } catch (error) {
      console.error('Registration request failed:', error);
      showToast('Registration failed, please try again', 'error');
    } finally {
      setIsRegisterLoading(false);
    }
  };

  // Send verification code function
  const sendVerificationCode = async () => {
    // Silently check various conditions, don't show toast
    if (!email || !email.includes('@') || emailStatus === 'taken' || emailStatus === 'checking' || countdown > 0) {
      return;
    }

    setIsCodeSending(true);

    try {
      const response = await fetch(`${APP_CONFIG.API.BASE_URL}/client/common/getVerificationCode?codeType=0&email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Successfully sent, start countdown
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // No longer show toast, user can see from button state that it's sent
      } else {
        // Silently handle error, don't show toast
      }
    } catch (error) {
      console.error('Send verification code failed:', error);
      // Silently handle network error
    } finally {
      setIsCodeSending(false);
    }
  };

  // Handle Enter key login
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  // Forgot password function - send verification code
  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setIsForgotPasswordLoading(true);

    try {

      // Send forgot password verification code (codeType=1)
      const response = await fetch(`${APP_CONFIG.API.BASE_URL}/client/common/getVerificationCode?codeType=1&email=${encodeURIComponent(forgotPasswordEmail)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('forgot password response info:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();

      if (response.ok && data.status === 1) {
        showToast('Password reset verification code sent, please check your email', 'success');
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
      } else {
        showToast(`Send failed: ${data.msg || data.message || 'Please try again'}`, 'error');
      }
    } catch (error) {
      console.error('Forgot password verification code send failed:', error);
      showToast('Send failed, please try again', 'error');
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.15)_0%,rgba(224,224,224,0.15)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] overflow-x-hidden">
      <HeaderSection isLoggedIn={false} hideCreateButton={true} showDiscoverNow={true} hideLoginButton={true} />
      <div className="flex w-full min-h-screen relative flex-col items-center pt-[70px] lg:pt-[120px]">{/* 添加顶部间距以适应fixed header */}

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
                    <div className="flex-col items-start gap-[15px] self-stretch w-full flex-[0_0_auto] flex relative">
                      <Input
                        type="email"
                        placeholder="Email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex items-center gap-[213px] p-[15px] relative self-stretch w-full flex-[0_0_auto] bg-white rounded-[15px] border border-solid border-[#a8a8a8] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)] h-auto"
                      />

                      <Input
                        type="password"
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex items-center gap-64 p-[15px] relative self-stretch w-full flex-[0_0_auto] bg-white rounded-[15px] border border-solid border-[#a8a8a8] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)] h-auto"
                      />

                      <div className="flex items-center justify-between pt-[5px] pb-2.5 px-0 relative self-stretch w-full flex-[0_0_auto]">
                        <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
                          <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={setRememberMe}
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
                          onClick={() => setShowForgotPassword(true)}
                        >
                          <div className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-off-black text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
                            Forgot password?
                          </div>
                        </Button>
                      </div>
                    </div>

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
                          onChange={(e) => handleEmailChange(e.target.value)}
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
                            countdown > 0 || isCodeSending || emailStatus === 'taken' || emailStatus === 'checking' || !email.includes('@')
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-red hover:bg-red/90'
                          }`}
                          onClick={sendVerificationCode}
                          disabled={countdown > 0 || isCodeSending || emailStatus === 'taken' || emailStatus === 'checking' || !email.includes('@')}
                        >
                          <span className="font-['Lato',_Helvetica] font-normal text-white text-sm">
                            {isCodeSending
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
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            ) : (
                              <>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
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
                              <path d="M17.94 17.94A10.07 17.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            ) : (
                              <>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
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
                            onCheckedChange={setAgreeToTerms}
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

          {/* Forgot password modal */}
          {showForgotPassword && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
                <p className="text-gray-600 mb-6 text-center">
                  Please enter your email address, we will send you a password reset link
                </p>

                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg"
                  />

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <Button
                      onClick={() => setShowForgotPassword(false)}
                      variant="outline"
                      className="flex-1 py-3 w-full sm:w-auto"
                      disabled={isForgotPasswordLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleForgotPassword}
                      className="flex-1 py-3 bg-red hover:bg-red/90 text-white w-full sm:w-auto"
                      disabled={isForgotPasswordLoading || !forgotPasswordEmail.includes('@')}
                    >
{isForgotPasswordLoading ? (
                        <span className="flex items-center space-x-2">
                          <BookFlip />
                          <span>Sending...</span>
                        </span>
                      ) : (
                        'Send Reset Email'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
