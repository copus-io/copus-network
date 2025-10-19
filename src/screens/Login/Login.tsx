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
  const [rememberMe, setRememberMe] = useState(true); // 既记住登录状态，也记住账号邮箱
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

  // 页面加载时恢复记住的邮箱
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

  // 处理社交登录OAuth回调
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const provider = searchParams.get('provider'); // 识别登录提供商


      if (code && state) {
        setIsLoginLoading(true);

        try {
          let response;

          // 根据提供商类型调用不同的登录方法
          if (provider === 'google') {
            const token = localStorage.getItem('copus_token');
            const hasToken = !!token;

            response = await AuthService.googleLogin(code, state, hasToken);

            if (response.isBinding) {
              // 账号绑定模式
              showToast('Google 账号绑定成功！🎉', 'success');

              // Google绑定后可能会返回新的token，重新获取用户信息
              await fetchUserInfo(response.token || token);

              // 跳转到设置页面
              setTimeout(() => {
                navigate('/setting');
              }, 1000);
            } else {
              // Third-party login mode
              showToast('Google login successful! Welcome back 🎉', 'success');

              // Get user info
              await fetchUserInfo(response.token);

              // Navigate to home
              setTimeout(() => {
                navigate('/');
              }, 1000);
            }
          } else if (provider === 'x') {
            // X (Twitter) login handling
            console.log('🔍 Processing X OAuth callback...');
            response = await AuthService.xLogin(code, state);
            console.log('✅ X login response:', response);

            showToast('X login successful! Welcome back 🎉', 'success');

            // Get user info
            const token = response.data?.token || response.token;
            await fetchUserInfo(token);

            // Navigate to home
            setTimeout(() => {
              navigate('/');
            }, 1000);
          } else {
            // Default fallback (for backward compatibility)
            console.log('⚠️ Unknown provider or no provider specified, attempting X login...');
            response = await AuthService.xLogin(code, state);

            if (response.data?.token || response.token) {
              showToast('Login successful! Welcome back 🎉', 'success');
              await fetchUserInfo(response.data?.token || response.token);
              setTimeout(() => {
                navigate('/');
              }, 1000);
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

  // 处理社交登录
  const handleSocialLogin = async (provider: string) => {

    if (provider === 'X') {
      try {
        console.log('🔍 Starting X OAuth process...');

        // Try to get X OAuth URL - this should work for both login and binding
        const oauthUrl = await AuthService.getXOAuthUrl();

        console.log('✅ Got X OAuth URL:', oauthUrl);

        // Add provider parameter for callback identification (same as Google)
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

        // Try to get Google OAuth URL - this should work for both login and binding
        const oauthUrl = await AuthService.getGoogleOAuthUrl();

        console.log('✅ Got Google OAuth URL:', oauthUrl);

        // Add provider parameter for callback identification
        const urlWithProvider = oauthUrl.includes('?')
          ? `${oauthUrl}&provider=google`
          : `${oauthUrl}?provider=google`;

        console.log('🚀 Redirecting to:', urlWithProvider);
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

  // 检查邮箱是否已存在
  const checkEmailExist = async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setEmailStatus('idle');
      return;
    }

    setEmailStatus('checking');

    try {
      const response = await fetch(`https://api-test.copus.network/client/common/checkEmailExist?email=${encodeURIComponent(emailToCheck)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // API返回格式: {"status":1,"msg":"success","data":false}
        // data为true表示邮箱已存在，false表示可用
        if (data.status === 1 && data.data === false) {
          setEmailStatus('available');
        } else if (data.status === 1 && data.data === true) {
          setEmailStatus('taken');
        } else {
          setEmailStatus('idle');
        }
      } else {
        console.error('邮箱检查请求失败:', response.status);
        setEmailStatus('idle');
      }
    } catch (error) {
      console.error('检查邮箱失败:', error);
      setEmailStatus('idle');
    }
  };

  // 邮箱输入处理函数（防抖）
  const handleEmailChange = (value: string) => {
    setEmail(value);

    // 清除之前的定时器
    if (emailCheckTimeout) {
      clearTimeout(emailCheckTimeout);
    }

    // 设置新的定时器，200ms后检查邮箱
    if (value && value.includes('@')) {
      const timeout = setTimeout(() => {
        checkEmailExist(value);
      }, 200);
      setEmailCheckTimeout(timeout);
    } else {
      setEmailStatus('idle');
    }
  };

  // 登录函数
  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      showToast('Please enter email and password', 'error');
      return;
    }

    setIsLoginLoading(true);

    try {
      // MD5加密密码
      const encryptedPassword = CryptoJS.MD5(loginPassword).toString();

      console.log('登录信息:', {
        username: loginEmail,
        password: '***MD5加密***'
      });

      const response = await fetch('https://api-test.copus.network/client/common/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginEmail, // API期望username字段，我们传入邮箱作为用户名
          password: encryptedPassword // 发送MD5加密后的密码
        }),
      });

      console.log('响应信息:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (response.ok) {
        const data = await response.json();
        console.log('登录成功数据:', {
          token: data.token,
          access_token: data.access_token,
          accessToken: data.accessToken,
          authToken: data.authToken,
          'data.token': data.data?.token,
          'data.access_token': data.data?.access_token
        });

        // 尝试从不同可能的字段获取token
        const possibleToken = data.data?.token || data.token || data.access_token || data.accessToken || data.authToken || data.data?.access_token;

        // 保存token到全局状态
        if (data.user) {
          login(data.user, possibleToken);
        } else {
          // 如果API没有返回用户信息，创建一个基本的用户对象并保存token
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

        // 获取完整的用户信息，传递刚刚获得的token
        try {
          await fetchUserInfo(possibleToken);
        } catch (userInfoError) {
        }

        // 如果用户选择Remember me，保存邮箱到本地存储
        if (rememberMe) {
          localStorage.setItem('copus_remembered_email', loginEmail);
          localStorage.setItem('copus_remember_me_option', 'true');
        } else {
          // 如果不记住，清除之前保存的邮箱
          localStorage.removeItem('copus_remembered_email');
          localStorage.setItem('copus_remember_me_option', 'false');
        }

        showToast('Login successful! Welcome back 🎉', 'success');

        // 跳转到首页
        navigate('/copus');
      } else {
        const errorData = await response.json();
        console.error('登录失败:', errorData);
        showToast('Login failed, please check email and password', 'error');
      }
    } catch (error) {
      console.error('登录请求失败:', error);
      showToast('Login failed, please try again', 'error');
    } finally {
      setIsLoginLoading(false);
    }
  };

  // 注册函数
  const handleRegister = async () => {
    // 基本验证
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
      // MD5加密密码
      const encryptedPassword = CryptoJS.MD5(password).toString();

      console.log('注册信息:', {
        username: username,
        email: email,
        password: '***MD5加密***',
        code: verificationCode
      });

      const response = await fetch('https://api-test.copus.network/client/common/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: encryptedPassword, // 发送MD5加密后的密码
          code: verificationCode
        }),
      });

      console.log('registration response info:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();

      // 判断注册是否真正成功
      // response.ok表示HTTP状态码2xx，data.status=1表示业务逻辑成功
      if (response.ok && data.status === 1) {
        showToast('Registration successful! Please log in', 'success');
        // 成功时清空所有注册表单
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setVerificationCode('');
        setAgreeToTerms(false);
        setEmailStatus('idle');
        // 注册成功后切换到登录tab
        setActiveTab("login");
      } else {
        console.error('注册失败:', data);
        showToast(`Registration failed: ${data.msg || data.message || 'Please try again'}`, 'error');
        // 失败时只清空验证码，保留其他已填写的信息
        setVerificationCode('');
      }
    } catch (error) {
      console.error('注册请求失败:', error);
      showToast('Registration failed, please try again', 'error');
    } finally {
      setIsRegisterLoading(false);
    }
  };

  // 发送验证码函数
  const sendVerificationCode = async () => {
    // 静默检查各种条件，不显示弹窗
    if (!email || !email.includes('@') || emailStatus === 'taken' || emailStatus === 'checking' || countdown > 0) {
      return;
    }

    setIsCodeSending(true);

    try {
      const response = await fetch(`https://api-test.copus.network/client/common/getVerificationCode?codeType=0&email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // 成功发送，开始倒计时
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

        // 不再显示弹窗，用户能从按钮状态看出已发送
      } else {
        // 静默处理错误，不显示弹窗
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
      // 静默处理网络错误
    } finally {
      setIsCodeSending(false);
    }
  };

  // 处理Enter键登录
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  // 忘记密码功能 - 发送验证码
  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setIsForgotPasswordLoading(true);

    try {

      // 发送忘记密码验证码 (codeType=1)
      const response = await fetch(`https://api-test.copus.network/client/common/getVerificationCode?codeType=1&email=${encodeURIComponent(forgotPasswordEmail)}`, {
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
      console.error('忘记密码验证码发送失败:', error);
      showToast('Send failed, please try again', 'error');
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.15)_0%,rgba(224,224,224,0.15)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] overflow-x-hidden">
      <HeaderSection isLoggedIn={false} hideCreateButton={true} showDiscoverNow={true} hideLoginButton={true} />
      <div className="flex w-full min-h-screen relative flex-col items-center pt-[120px]">{/* 添加顶部间距以适应fixed header */}

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
                        {/* 邮箱状态图标 */}
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
                        {/* 邮箱状态提示 - 更温和的提示 */}
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

          {/* 忘记密码弹窗 */}
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
