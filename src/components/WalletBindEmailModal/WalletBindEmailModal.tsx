import React, { useState } from "react";
import { Button } from "../ui/button";
import { useToast } from "../ui/toast";
import { WithdrawalService, WalletBindEmailRequest } from "../../services/withdrawalService";

interface WalletBindEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  walletAddress: string;
}

export const WalletBindEmailModal = ({
  isOpen,
  onClose,
  onSuccess,
  walletAddress
}: WalletBindEmailModalProps): JSX.Element => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "verification">("email");
  const { showToast } = useToast();

  const handleSendCode = async () => {
    if (!email) {
      showToast('Please enter email address', 'error');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      console.log('📧 Sending verification code to:', email);
      // 直接发送验证码，不进行钱包登录
      // 钱包签名和token刷新将在绑定时进行
      await WithdrawalService.sendBindingVerificationCode(email);
      console.log('✅ Verification code sent successfully');
      showToast('Verification code sent to your email', 'success');
      setStep("verification");
    } catch (error: any) {
      console.error('❌ Failed to send verification code:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack
      });

      // 如果是token过期错误，提示用户在绑定时会自动刷新token
      let errorMessage = 'Failed to send verification code, please try again';
      if (error.message) {
        if (error.message.includes('CORS') || error.message.includes('network')) {
          errorMessage = 'Network connection error, please check your internet connection';
        } else if (error.message.includes('401') || error.message.includes('403') || error.message.includes('LastLoginTime')) {
          errorMessage = 'Session expired. Please proceed to bind email - the system will refresh your session automatically.';
        } else if (error.message.includes('API error')) {
          errorMessage = error.message;
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }

      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 简化版校验和地址转换（EIP-55）
  const toChecksumAddress = (address: string): string => {
    if (!address || !address.startsWith('0x')) return address;

    // 确保地址是42个字符的标准格式
    if (address.length !== 42) return address;

    // 简化处理：如果是已经是校验和格式就直接返回，否则转为小写
    // 对于API测试，我们先尝试转换为小写
    return address.toLowerCase();
  };

  const generateSignature = async (): Promise<string> => {
    if (!window.ethereum) {
      throw new Error('No wallet provider found');
    }

    // 确保钱包连接到正确的X Layer网络
    await ensureXLayerNetwork();

    // 使用校验和格式的地址
    const checksumAddress = toChecksumAddress(walletAddress);
    console.log('🔧 Address conversion:', {
      original: walletAddress,
      checksum: checksumAddress
    });

    try {
      // 使用类似钱包登录的流程 - 先获取服务器的签名数据
      console.log('🔍 Getting signature data from server...');

      // 获取签名数据
      const { apiRequest } = await import('../../services/api');
      const endpoint = `/client/common/getSnowflake?address=${encodeURIComponent(checksumAddress)}`;

      const signatureData = await apiRequest(endpoint, {
        method: 'GET',
        requiresAuth: false
      });

      console.log('📥 Signature data received:', signatureData);

      // 提取签名消息
      const message = signatureData?.data || signatureData?.message || checksumAddress;

      console.log('🔐 Signing message on X Layer:', {
        message: message,
        address: checksumAddress,
        network: 'X Layer',
        walletType: window.ethereum.isOkxWallet ? 'OKX' : (window.ethereum.isMetaMask ? 'MetaMask' : 'Unknown')
      });

      // Request signature from wallet
      // OKX钱包可能需要特殊处理
      let signature;
      try {
        signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, checksumAddress],
        });
        console.log('✅ personal_sign successful');
      } catch (personalSignError) {
        console.warn('⚠️ personal_sign failed, trying eth_signTypedData_v4:', personalSignError);

        // 为OKX钱包尝试备用签名方法
        if (window.ethereum.isOkxWallet) {
          try {
            // 尝试使用 eth_sign 作为后备
            const messageHash = window.ethereum.utils?.keccak256(message) || message;
            signature = await window.ethereum.request({
              method: 'eth_sign',
              params: [checksumAddress, messageHash],
            });
            console.log('✅ eth_sign successful as fallback');
          } catch (ethSignError) {
            console.error('❌ Both signing methods failed:', ethSignError);
            throw personalSignError; // 抛出原始错误
          }
        } else {
          throw personalSignError;
        }
      }

      console.log('🔐 X Layer signature details:', {
        message: message,
        address: checksumAddress,
        signature: signature,
        signatureLength: signature.length,
        network: 'X Layer'
      });

      return signature;
    } catch (error) {
      console.error('X Layer signature failed:', error);
      throw new Error('Failed to sign message on X Layer network');
    }
  };

  // 确保钱包连接到X Layer网络
  const ensureXLayerNetwork = async (): Promise<void> => {
    if (!window.ethereum) return;

    try {
      // 检查当前网络
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('🌐 Current network:', { chainId });

      // X Layer主网 Chain ID: 196 (0xC4)
      // X Layer测试网 Chain ID: 1952 (0x7A0)
      const XLAYER_MAINNET_CHAIN_ID = '0xc4';
      const XLAYER_TESTNET_CHAIN_ID = '0x7a0';

      if (chainId !== XLAYER_MAINNET_CHAIN_ID && chainId !== XLAYER_TESTNET_CHAIN_ID) {
        console.log('🔄 Switching to X Layer network...');
        showToast('Please switch to X Layer network in your wallet', 'info');

        try {
          // 尝试切换到X Layer主网
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: XLAYER_MAINNET_CHAIN_ID }],
          });
          console.log('✅ Successfully switched to X Layer mainnet');
        } catch (switchError: any) {
          // 如果网络不存在，尝试添加X Layer网络
          if (switchError.code === 4902) {
            console.log('➕ Adding X Layer network to wallet...');
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: XLAYER_MAINNET_CHAIN_ID,
                chainName: 'X Layer',
                nativeCurrency: {
                  name: 'OKB',
                  symbol: 'OKB',
                  decimals: 18
                },
                rpcUrls: ['https://rpc.xlayer.tech'],
                blockExplorerUrls: ['https://www.okx.com/web3/explorer/xlayer']
              }],
            });
            console.log('✅ X Layer network added to wallet');
          } else {
            throw switchError;
          }
        }
      } else {
        console.log('✅ Already on X Layer network');
      }
    } catch (error) {
      console.error('❌ Failed to ensure X Layer network:', error);
      throw new Error('Please manually switch to X Layer network in your wallet');
    }
  };

  const handleBindEmail = async () => {
    if (!verificationCode) {
      showToast('Please enter verification code', 'error');
      return;
    }

    if (!walletAddress) {
      showToast('Wallet address not found', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // 邮箱绑定流程 - 始终需要钱包签名
      console.log('🔐 Starting email binding process');
      showToast('Please sign the message in your wallet...', 'info');

      // 检查当前token是否有效，决定是否需要钱包登录
      console.log('🔍 Checking current login status...');
      const currentToken = localStorage.getItem('copus_token');
      let needsWalletLogin = false;

      const { apiRequest } = await import('../../services/api');
      const checksumAddress = toChecksumAddress(walletAddress);

      if (currentToken) {
        try {
          // 测试当前token是否有效
          const testResponse = await apiRequest('/client/account/info', {
            method: 'GET',
            requiresAuth: true
          });

          if (testResponse && testResponse.status !== 403) {
            console.log('✅ Current token is valid, but still need signature for email binding');
            needsWalletLogin = false;
          } else {
            console.log('⚠️ Current token is expired, need wallet login');
            needsWalletLogin = true;
          }
        } catch (tokenError) {
          console.log('⚠️ Current token is invalid, need wallet login');
          needsWalletLogin = true;
        }
      } else {
        console.log('⚠️ No token found, need wallet login');
        needsWalletLogin = true;
      }

      // 始终生成签名（邮箱绑定API需要）
      const signature = await generateSignature();
      console.log('✅ Signature generated for email binding');

      // 如果需要钱包登录，使用签名进行登录
      if (needsWalletLogin) {
        const loginResponse = await apiRequest('/client/common/metamask/login', {
          method: 'POST',
          body: JSON.stringify({
            address: checksumAddress,
            signature: signature
          }),
          requiresAuth: false
        });

        console.log('📥 Wallet login response:', loginResponse);

        if (loginResponse.status !== 1) {
          throw new Error(`Wallet login failed: ${loginResponse.msg}`);
        }

        // 更新token
        localStorage.setItem('copus_token', loginResponse.data.token);
        console.log('🔑 Token updated via wallet login');
      }

      // 准备绑定请求数据
      // 包含验证码、邮箱和签名（必需字段）
      const bindRequest: WalletBindEmailRequest = {
        code: verificationCode,
        email: email,
        signature: signature // 必需的签名字段
      };

      console.log('📤 Sending wallet binding request:', {
        email: bindRequest.email,
        code: bindRequest.code,
        codeLength: bindRequest.code?.length || 0,
        signature: bindRequest.signature,
        signatureLength: bindRequest.signature?.length || 0,
        walletAddress: walletAddress,
        walletAddressValid: walletAddress && walletAddress.length === 42 && walletAddress.startsWith('0x'),
        loginMethod: needsWalletLogin ? 'Fresh wallet login' : 'Existing token + signature',
        timestamp: new Date().toISOString()
      });

      // Call bind API
      const result = await WithdrawalService.bindWalletEmail(bindRequest);
      console.log('📥 Wallet binding response:', result);

      // Check if the response indicates success
      // For this API, we need to check the status field in the response
      if (result && typeof result === 'object' && 'status' in result) {
        const apiResult = result as any;
        if (apiResult.status === 1) {
          console.log('✅ Email successfully bound to wallet');
          showToast('Email successfully bound to wallet!', 'success');

          // 立即调用onSuccess回调，通知父组件更新数据
          onSuccess();
          handleClose();

          // 绑定成功后刷新页面以确保所有组件都获得最新状态
          console.log('📄 Refreshing page in 2 seconds to update all components...');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          console.log('❌ Wallet binding failed:', apiResult.msg || 'Unknown error');
          showToast(apiResult.msg || 'Failed to bind email to wallet. Please try again.', 'error');
        }
      } else if (result === true) {
        console.log('✅ Email successfully bound to wallet');
        showToast('Email successfully bound to wallet!', 'success');
        onSuccess();
        handleClose();

        // 绑定成功后刷新页面以更新用户状态
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.log('❌ Wallet binding returned false or invalid response');
        showToast('Failed to bind email to wallet. Please try again.', 'error');
      }
    } catch (error: any) {
      console.error('❌ Email binding failed:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        response: error.response
      });
      if (error.code === 4001) {
        showToast('Signature cancelled by user', 'info');
      } else {
        showToast(error.message || 'Failed to bind email, please try again', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setVerificationCode("");
    setStep("email");
    onClose();
  };

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="inline-flex flex-col items-center gap-5 p-[30px] relative bg-white rounded-[15px] shadow-xl max-w-md w-full mx-4"
        role="dialog"
        aria-labelledby="bind-title"
        aria-describedby="bind-description"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-[30px] right-[30px] text-gray-400 hover:text-gray-600"
          aria-label="Close modal"
        >
          <svg className="w-[12px] h-[12px]" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-[15px] relative flex-[0_0_auto] mt-5">
          <h2
            id="bind-title"
            className="relative w-fit font-semibold text-gray-900 text-xl text-center"
          >
            Bind email to wallet
          </h2>

          <p
            id="bind-description"
            className="relative max-w-[280px] text-gray-600 text-sm text-center"
          >
            {step === "email"
              ? "To enable withdrawals, please bind an email address to your wallet"
              : "Enter the verification code sent to your email"
            }
          </p>
        </div>

        {/* Wallet address display */}
        <div className="flex items-center gap-[15px] p-4 relative self-stretch w-full bg-gray-50 rounded-lg">
          <div className="flex flex-col w-full">
            <label className="text-xs text-gray-500 mb-1">Wallet Address</label>
            <div className="relative flex-1 text-gray-700 text-sm font-mono break-all">
              {walletAddress}
            </div>
          </div>
        </div>

        {step === "email" ? (
          // Step 1: Email input
          <>
            <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full">
              <label htmlFor="email-input" className="text-sm font-medium text-gray-700">
                Email Address
              </label>

              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-[15px] relative self-stretch w-full">
              <Button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-[50px] bg-transparent text-gray-600 hover:bg-gray-100 transition-colors h-auto shadow-none"
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                onClick={handleSendCode}
                className="px-5 py-2.5 bg-red hover:bg-red/90 text-white rounded-[50px] transition-colors h-auto"
                disabled={!email || isLoading}
              >
                {isLoading ? "Sending..." : "Send Code"}
              </Button>
            </div>
          </>
        ) : (
          // Step 2: Verification code input
          <>
            {/* Email display */}
            <div className="flex items-center gap-[15px] p-4 relative self-stretch w-full bg-blue-50 rounded-lg">
              <div className="flex flex-col">
                <label className="text-xs text-blue-600 mb-1">Email Address</label>
                <div className="relative flex-1 text-blue-700 text-sm">
                  {email}
                </div>
              </div>
            </div>

            {/* Verification code input */}
            <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full">
              <label htmlFor="verification-code" className="text-sm font-medium text-gray-700">
                Verification Code
              </label>

              <input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={6}
              />
            </div>

            {/* Back to email button */}
            <Button
              onClick={() => setStep("email")}
              className="self-stretch rounded-[50px] border border-solid border-gray-300 bg-transparent text-gray-600 hover:bg-gray-50 transition-colors h-auto py-2"
              disabled={isLoading}
            >
              Change Email Address
            </Button>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-[15px] relative self-stretch w-full">
              <Button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-[50px] bg-transparent text-gray-600 hover:bg-gray-100 transition-colors h-auto shadow-none"
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                onClick={handleBindEmail}
                className="px-5 py-2.5 bg-red hover:bg-red/90 text-white rounded-[50px] transition-colors h-auto"
                disabled={!verificationCode || isLoading}
              >
                {isLoading ? "Binding..." : "Bind Email"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};