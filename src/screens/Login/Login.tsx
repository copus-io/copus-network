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
    name: "Facebook",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='24' viewBox='0 0 24 24' fill='%231877f2'%3E%3Cpath d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'/%3E%3C/svg%3E",
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
  // 登录表单状态
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true); // 既记住登录状态，也记住账号邮箱
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  // Tab状态
  const [activeTab, setActiveTab] = useState("login");

  // 注册表单状态
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

  // 忘记密码状态
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
          if (provider === 'facebook') {
            const token = localStorage.getItem('copus_token');
            const hasToken = !!token;

            response = await AuthService.facebookLogin(code, state, hasToken);

            if (response.isBinding) {
              // 账号绑定模式
              showToast('Facebook 账号绑定成功！🎉', 'success');

              // Facebook绑定后可能会返回新的token，重新获取用户信息
              await fetchUserInfo(response.token || token);

              // 跳转到设置页面
              setTimeout(() => {
                navigate('/setting');
              }, 1000);
            } else {
              // 第三方登录模式
              showToast('Facebook 登录成功！欢迎回来 🎉', 'success');

              // 获取用户信息
              await fetchUserInfo(response.token);

              // 跳转到首页
              setTimeout(() => {
                navigate('/');
              }, 1000);
            }
          } else if (provider === 'google') {
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
              // 第三方登录模式
              showToast('Google 登录成功！欢迎回来 🎉', 'success');

              // 获取用户信息
              await fetchUserInfo(response.token);

              // 跳转到首页
              setTimeout(() => {
                navigate('/');
              }, 1000);
            }
          } else {
            // 默认处理为X登录（兼容之前的实现）
            response = await AuthService.xLogin(code, state);
            showToast('X 登录成功！欢迎回来 🎉', 'success');

            // 获取用户信息
            await fetchUserInfo(response.data?.token);

            // 跳转到首页
            setTimeout(() => {
              navigate('/');
            }, 1000);
          }
        } catch (error) {
          console.error(`❌ ${provider || 'X'} 登录失败:`, error);
          showToast(`${provider || 'X'} 登录失败，请重试`, 'error');
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
        // 检查用户是否已登录
        const token = localStorage.getItem('copus_token');

        if (token) {
          // 已登录用户，使用API获取OAuth URL（账号绑定）
          const oauthUrl = await AuthService.getXOAuthUrl();
          window.location.href = oauthUrl;
        } else {
          // 未登录用户，使用手动构建的OAuth URL（第三方登录）
          const CLIENT_ID = 'YOUR_X_CLIENT_ID'; // 需要替换为实际的 X 客户端 ID
          const REDIRECT_URI = encodeURIComponent(window.location.origin + '/login');
          const STATE = Math.random().toString(36).substring(7); // 生成随机 state 防止 CSRF

          // 构建 X OAuth URL
          const xOAuthUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=tweet.read%20users.read%20follows.read&state=${STATE}&code_challenge=challenge&code_challenge_method=plain`;

          // 跳转到 X 授权页面
          window.location.href = xOAuthUrl;
        }
      } catch (error) {
        console.error('❌ X OAuth处理失败:', error);
        showToast('X登录失败，请重试', 'error');
      }
    } else if (provider === 'Facebook') {
      try {
        // 检查用户是否已登录
        const token = localStorage.getItem('copus_token');

        if (token) {
          // 已登录用户，使用API获取OAuth URL（账号绑定）
          const oauthUrl = await AuthService.getFacebookOAuthUrl();
          // 添加provider参数以便回调时识别
          const urlWithProvider = oauthUrl.includes('?')
            ? `${oauthUrl}&provider=facebook`
            : `${oauthUrl}?provider=facebook`;
          window.location.href = urlWithProvider;
        } else {
          // 未登录用户，使用手动构建的OAuth URL（第三方登录）
          const CLIENT_ID = 'YOUR_FACEBOOK_CLIENT_ID'; // 需要替换为实际的 Facebook 客户端 ID
          const REDIRECT_URI = encodeURIComponent(window.location.origin + '/login?provider=facebook');
          const STATE = Math.random().toString(36).substring(7); // 生成随机 state 防止 CSRF

          // 构建 Facebook OAuth URL
          const facebookOAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}&scope=email,public_profile&response_type=code`;

          // 跳转到 Facebook 授权页面
          window.location.href = facebookOAuthUrl;
        }
      } catch (error) {
        console.error('❌ Facebook OAuth处理失败:', error);
        showToast('Facebook登录失败，请重试', 'error');
      }
    } else if (provider === 'Google') {
      try {
        // 检查用户是否已登录
        const token = localStorage.getItem('copus_token');

        if (token) {
          // 已登录用户，使用API获取OAuth URL（账号绑定）
          const oauthUrl = await AuthService.getGoogleOAuthUrl();
          // 添加provider参数以便回调时识别
          const urlWithProvider = oauthUrl.includes('?')
            ? `${oauthUrl}&provider=google`
            : `${oauthUrl}?provider=google`;
          window.location.href = urlWithProvider;
        } else {
          // 未登录用户，使用手动构建的OAuth URL（第三方登录）
          const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // 需要替换为实际的 Google 客户端 ID
          const REDIRECT_URI = encodeURIComponent(window.location.origin + '/login?provider=google');
          const STATE = Math.random().toString(36).substring(7); // 生成随机 state 防止 CSRF

          // 构建 Google OAuth URL
          const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}&scope=email%20profile&response_type=code&access_type=offline`;

          // 跳转到 Google 授权页面
          window.location.href = googleOAuthUrl;
        }
      } catch (error) {
        console.error('❌ Google OAuth处理失败:', error);
        showToast('Google登录失败，请重试', 'error');
      }
    } else if (provider === 'Metamask') {
      try {
        // 检查Metamask是否安装
        if (!window.ethereum) {
          showToast('请先安装Metamask钱包', 'error');
          return;
        }

        setIsLoginLoading(true);

        // 1. 连接Metamask获取账户
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) {
          throw new Error('未能获取Metamask账户');
        }

        const address = accounts[0];

        // 2. 获取签名数据
        const signatureData = await AuthService.getMetamaskSignatureData(address);

        // 3. 用户签名（这里需要根据API返回的实际数据格式调整）
        const messageToSign = `Welcome to Copus! Please sign this message to authenticate your wallet: ${signatureData}`;

        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [messageToSign, address],
        });


        // 4. 提交登录
        const token = localStorage.getItem('copus_token');
        const hasToken = !!token;

        const response = await AuthService.metamaskLogin(address, signature, hasToken);

        if (response.isBinding) {
          // 账号绑定模式
          showToast('Metamask 账号绑定成功！🎉', 'success');

          // 绑定后重新获取用户信息
          await fetchUserInfo(response.token || token);

          // 跳转到设置页面
          setTimeout(() => {
            navigate('/setting');
          }, 1000);
        } else {
          // 第三方登录模式
          showToast('Metamask 登录成功！欢迎回来 🎉', 'success');

          // 获取用户信息
          await fetchUserInfo(response.token);

          // 跳转到首页
          setTimeout(() => {
            navigate('/');
          }, 1000);
        }
      } catch (error) {
        console.error('❌ Metamask登录失败:', error);
        showToast(`Metamask登录失败: ${error instanceof Error ? error.message : '请重试'}`, 'error');
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
      showToast('请输入邮箱和密码', 'error');
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

        showToast('登录成功！欢迎回来～ 🎉', 'success');

        // 跳转到首页
        navigate('/discovery');
      } else {
        const errorData = await response.json();
        console.error('登录失败:', errorData);
        showToast('登录失败，请检查邮箱和密码', 'error');
      }
    } catch (error) {
      console.error('登录请求失败:', error);
      showToast('登录失败，请重试', 'error');
    } finally {
      setIsLoginLoading(false);
    }
  };

  // 注册函数
  const handleRegister = async () => {
    // 基本验证
    if (!username || !email || !password || !confirmPassword || !verificationCode) {
      showToast('请填写完整的注册信息', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('两次输入的密码不一致', 'error');
      return;
    }

    if (!agreeToTerms) {
      showToast('请同意服务条款', 'error');
      return;
    }

    if (emailStatus !== 'available') {
      showToast('请使用可用的邮箱地址', 'error');
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
        showToast('注册成功！请登录', 'success');
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
        showToast(`注册失败：${data.msg || data.message || '请重试'}`, 'error');
        // 失败时只清空验证码，保留其他已填写的信息
        setVerificationCode('');
      }
    } catch (error) {
      console.error('注册请求失败:', error);
      showToast('注册失败，请重试', 'error');
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
      showToast('请输入有效的邮箱地址', 'error');
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
        showToast('重置密码验证码已发送，请查收邮箱', 'success');
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
      } else {
        showToast(`发送失败：${data.msg || data.message || '请重试'}`, 'error');
      }
    } catch (error) {
      console.error('忘记密码验证码发送失败:', error);
      showToast('发送失败，请重试', 'error');
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.15)_0%,rgba(224,224,224,0.15)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <div className="flex w-full min-h-screen relative flex-col items-center">
        <header className="flex items-start justify-between px-[30px] py-5 relative w-full flex-[0_0_auto] bg-transparent">
          <Link to="/discovery" className="flex w-[45px] h-[45px] items-center justify-center gap-2.5 p-2.5 relative bg-red rounded-[100px]">
            <img
              className="relative w-7 h-7 mt-[-1.50px] mb-[-1.50px] ml-[-1.50px] mr-[-1.50px]"
              alt="Ic fractopus open"
              src="https://c.animaapp.com/mftc49qfOGKRUh/img/ic-fractopus-open-1.svg"
            />
          </Link>

          <Link to="/discovery" className="inline-flex items-center justify-end relative flex-[0_0_auto] rounded-[10px_10px_0px_0px]">
            <div className="relative flex items-center justify-center w-fit font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] text-center tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
              Discover now
            </div>
          </Link>
        </header>

        <main className="flex items-center justify-center gap-2.5 relative flex-1 grow py-10">
          <Card className="w-[480px] bg-white rounded-lg border-0 shadow-none">
            <CardContent className="flex flex-col items-center justify-center gap-[50px] px-[50px] py-[60px]">
              <div className="flex flex-col items-start gap-[15px] relative self-stretch w-full flex-[0_0_auto]">
                <h1 className="relative self-stretch mt-[-1.00px] font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] text-center tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] [font-style:var(--h-3-font-style)]">
                  Join Copus
                </h1>

                <p className="relative self-stretch font-h-4 font-[number:var(--h-4-font-weight)] text-dark-grey text-[length:var(--h-4-font-size)] text-center tracking-[var(--h-4-letter-spacing)] leading-[var(--h-4-line-height)] [font-style:var(--h-4-font-style)]">
                  Discover and share valuable digital gem
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0">
                    <TabsTrigger
                      value="login"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#454545] data-[state=inactive]:border-b-0 rounded-none pb-2.5 px-[15px] bg-transparent"
                    >
                      <span className="font-['Lato',_Helvetica] font-bold text-dark-grey text-lg text-center tracking-[0] leading-[25.2px] whitespace-nowrap">
                        Log in
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="signup"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#454545] data-[state=inactive]:border-b-0 rounded-none pb-2.5 px-[15px] bg-transparent"
                    >
                      <span className="font-['Lato',_Helvetica] font-bold text-dark-grey text-lg text-center tracking-[0] leading-[25.2px] whitespace-nowrap">
                        Sign up
                      </span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="mt-[30px]">
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
                      className="flex items-center justify-center px-10 py-2.5 w-full rounded-[100px] border border-solid border-[#f23a00] bg-transparent hover:bg-red/5 mt-[30px] h-auto"
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

                  <TabsContent value="signup" className="mt-[30px]">
                    <div className="flex-col items-start gap-[15px] self-stretch w-full flex-[0_0_auto] flex relative">
                      {/* User name */}
                      <Input
                        placeholder="User name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="flex items-center p-[15px] relative self-stretch w-full bg-white rounded-[15px] border border-solid border-[#a8a8a8] text-medium-dark-grey h-auto"
                      />

                      {/* Email */}
                      <div className="relative self-stretch w-full">
                        <Input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          className={`flex items-center p-[15px] pr-[40px] relative self-stretch w-full bg-white rounded-[15px] border border-solid text-medium-dark-grey h-auto ${
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
                            此邮箱已被注册
                          </div>
                        )}
                        {emailStatus === 'available' && (
                          <div className="mt-1 text-xs text-green-400 opacity-75">
                            ✓ 邮箱可用
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
                              ? '发送中...'
                              : countdown > 0
                                ? `${countdown}s`
                                : emailStatus === 'checking'
                                  ? '检查中'
                                  : emailStatus === 'taken'
                                    ? '邮箱已占用'
                                    : !email.includes('@')
                                      ? '请输入邮箱'
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
                          className="flex items-center p-[15px] pr-[45px] relative self-stretch w-full bg-white rounded-[15px] border border-solid border-[#a8a8a8] text-medium-dark-grey h-auto"
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
                          className="flex items-center p-[15px] pr-[45px] relative self-stretch w-full bg-white rounded-[15px] border border-solid border-[#a8a8a8] text-medium-dark-grey h-auto"
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
                      className="flex items-center justify-center px-10 py-2.5 w-full rounded-[100px] border border-solid border-[#f23a00] bg-transparent hover:bg-red/5 mt-[30px] h-auto"
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

              <div className="flex flex-col items-start gap-5 self-stretch w-full relative flex-[0_0_auto]">
                <div className="gap-[15px] pt-5 pb-2.5 px-0 self-stretch w-full flex-[0_0_auto] rounded-[25px] overflow-hidden flex items-center justify-center relative">
                  <Separator className="flex-1 bg-medium-dark-grey" />

                  <div className="relative flex items-center justify-center w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-medium-dark-grey text-[length:var(--p-font-size)] text-center tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)] px-4">
                    Or sign in with
                  </div>

                  <Separator className="flex-1 bg-medium-dark-grey" />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-[10px_30px] relative self-stretch w-full flex-[0_0_auto]">
                  {socialProviders.map((provider, index) => (
                    <Button
                      key={`social-${index}`}
                      variant="ghost"
                      className="flex flex-col items-center justify-center w-[70px] h-[60px] gap-[8px] p-2 hover:bg-transparent transition-all duration-200 hover:scale-105"
                      onClick={() => handleSocialLogin(provider.name)}
                      disabled={isLoginLoading}
                    >
                      <div className="flex items-center justify-center w-[30px] h-[30px] flex-shrink-0">
                        <img
                          className="w-[30px] h-[30px] object-contain"
                          alt={`${provider.name} icon`}
                          src={provider.icon}
                        />
                      </div>

                      <span className="font-['Lato',_Helvetica] font-normal text-off-black text-sm text-center leading-[16px] whitespace-nowrap">
                        {provider.name}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <img
            className="absolute top-[350px] left-[-480px] w-[399px] h-[493px]"
            alt="Ic fractopus open"
            src="https://c.animaapp.com/mftc49qfOGKRUh/img/ic-fractopus-open.svg"
          />

          {/* 忘记密码弹窗 */}
          {showForgotPassword && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold mb-4 text-center">重置密码</h2>
                <p className="text-gray-600 mb-6 text-center">
                  请输入您的邮箱地址，我们将发送重置密码链接
                </p>

                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="请输入邮箱地址"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />

                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowForgotPassword(false)}
                      variant="outline"
                      className="flex-1 py-3"
                      disabled={isForgotPasswordLoading}
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleForgotPassword}
                      className="flex-1 py-3 bg-red hover:bg-red/90 text-white"
                      disabled={isForgotPasswordLoading || !forgotPasswordEmail.includes('@')}
                    >
{isForgotPasswordLoading ? (
                        <span className="flex items-center space-x-2">
                          <BookFlip />
                          <span>发送中...</span>
                        </span>
                      ) : (
                        '发送重置邮件'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
