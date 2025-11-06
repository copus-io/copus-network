import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { Input } from "../../../components/ui/input";
import { Card, CardContent } from "../../../components/ui/card";
import { AuthService, CODE_TYPES } from "../../../services/authService";
import { useUser } from "../../../contexts/UserContext";
import { HeaderSection } from "../../../components/shared/HeaderSection/HeaderSection";
import { useVerificationCode } from "../../../hooks/useVerificationCode";
import { useToast } from "../../../components/ui/toast";
import {
  signDeleteAccountMessage,
  getWalletSignatureData,
  WalletSignatureResult
} from "../../../utils/walletSignatureUtils";

export const DeleteAccount = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const { showToast } = useToast();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Wallet verification state
  const [isWalletVerified, setIsWalletVerified] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletSignatureResult, setWalletSignatureResult] = useState<WalletSignatureResult | null>(null);
  const [isRequestingSignature, setIsRequestingSignature] = useState(false);

  // Determine if user logged in with wallet
  const authMethod = typeof localStorage !== 'undefined' ? localStorage.getItem('copus_auth_method') : null;
  const isWalletUser = !!(user?.walletAddress && (authMethod === 'metamask' || authMethod === 'coinbase'));
  
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const {
    isSending: isSendingCode,
    countdown,
    sendCode,
    cleanup: cleanupVerificationCode
  } = useVerificationCode({
    onSendSuccess: () => showToast('Verification code sent to your email', 'success'),
    onSendError: (error) => showToast(error, 'error')
  });

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanupVerificationCode();
    };
  }, [cleanupVerificationCode]);

  const reminderItems = [
    "After account deletion, all your data including personal information, published content, and saved records will be permanently deleted and cannot be recovered.",
    "You will lose all purchased services and benefits.",
    "Your username will be released and may be used by other users.",
    "If you only wish to take a temporary break, please consider logging out instead of deleting your account.",
  ];

  const handleSendCode = async () => {
    if (!user?.email) {
      showToast('无法获取用户邮箱地址', 'error');
      return;
    }

    await sendCode(user.email, CODE_TYPES.DELETE_ACCOUNT);
  };

  // Handle wallet connection and signature for verification
  const handleConnectWallet = async () => {
    if (!user?.walletAddress) {
      showToast('No wallet address found', 'error');
      return;
    }

    setIsConnectingWallet(true);

    try {
      // Check if wallet provider is available
      if (!window.ethereum) {
        showToast('No wallet found. Please install MetaMask or Coinbase Wallet', 'error');
        setIsConnectingWallet(false);
        return;
      }

      // Determine which provider to use
      let provider = window.ethereum;

      if (authMethod === 'metamask' && window.ethereum.providers) {
        // Multiple wallets installed - find MetaMask
        provider = window.ethereum.providers.find((p: any) => p.isMetaMask) || window.ethereum;
      } else if (authMethod === 'coinbase' && window.ethereum.providers) {
        // Multiple wallets installed - find Coinbase Wallet
        provider = window.ethereum.providers.find((p: any) => p.isCoinbaseWallet) || window.ethereum;
      }

      // Request account access
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const connectedAddress = accounts[0].toLowerCase();
      const userAddress = user.walletAddress.toLowerCase();

      // Verify the connected wallet matches the user's registered wallet
      if (connectedAddress === userAddress) {
        setIsWalletVerified(true);

        // Now request signature for account deletion verification
        setIsRequestingSignature(true);
        try {
          // Get proper signature data from server (using same method as login flow)
          const signatureDataResponse = await getWalletSignatureData(user.walletAddress);

          // Process signature data the same way as login flow does
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

          console.log('📝 Using signature data for account deletion:', signatureData);

          // Sign the message directly using personal_sign (same as login flow)
          const signature = await provider.request({
            method: 'personal_sign',
            params: [signatureData, user.walletAddress],
          });

          console.log('✅ Account deletion signature obtained:', signature);

          // Create signature result object
          const signatureResult = {
            signature,
            message: signatureData,
            timestamp: Math.floor(Date.now() / 1000),
            walletAddress: user.walletAddress
          };

          setWalletSignatureResult(signatureResult);
          showToast('Wallet signature obtained successfully', 'success');
        } catch (signatureError: any) {
          console.error('Signature error:', signatureError);
          if (signatureError.message.includes('rejected')) {
            showToast('Signature rejected. Account deletion requires wallet signature.', 'error');
          } else {
            showToast('Failed to get wallet signature: ' + signatureError.message, 'error');
          }
          setIsWalletVerified(false);
        } finally {
          setIsRequestingSignature(false);
        }
      } else {
        showToast('Connected wallet does not match your registered wallet', 'error');
        setIsWalletVerified(false);
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      if (error.code === 4001) {
        showToast('Wallet connection rejected', 'error');
      } else {
        showToast('Failed to connect wallet', 'error');
      }
      setIsWalletVerified(false);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleShowConfirmation = () => {
    // Validate before showing confirmation popup
    if (isWalletUser) {
      if (!isConfirmed || !isWalletVerified || !walletSignatureResult) {
        showToast('Please confirm and complete wallet signature verification', 'error');
        return;
      }
    } else {
      if (!isConfirmed || !verificationCode.trim()) {
        showToast('请确认并输入验证码', 'error');
        return;
      }
    }

    // Show confirmation popup
    setShowSuccessPopup(true);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      const deleteParams = isWalletUser
        ? {
            accountType: 1, // 钱包账户
            code: walletSignatureResult!.signature, // 钱包签名结果
            reason: deleteReason.trim()
          }
        : {
            accountType: 0, // 邮箱账户
            code: verificationCode.trim(), // 验证码
            reason: deleteReason.trim()
          };

      const success = await AuthService.deleteAccount(deleteParams);

      if (success) {
        // After successful deletion, log out and redirect
        await logout();
        navigate('/');
      } else {
        showToast(isWalletUser ? 'Account deletion failed' : '账户删除失败，请检查验证码是否正确', 'error');
        setShowSuccessPopup(false);
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      showToast(isWalletUser ? 'Account deletion failed, please try again' : '账户删除失败，请稍后重试', 'error');
      setShowSuccessPopup(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Validation logic: wallet users need wallet verification and signature, email users need verification code
  const isFormValid = isWalletUser
    ? (isConfirmed && isWalletVerified && walletSignatureResult !== null)
    : (isConfirmed && verificationCode.trim() !== "");

  return (
    <div className="min-h-screen flex bg-[linear-gradient(0deg,rgba(224,224,224,0.15)_0%,rgba(224,224,224,0.15)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <HeaderSection hideCreateButton={true} />
      <div className="flex w-full min-h-screen flex-col items-center pt-[110px]">{/* 增加顶部间距适配HeaderSection */}

        <main className="flex flex-col w-[540px] items-center pt-5 pb-10 px-0">
          <div className="flex flex-col items-center gap-10 w-full">
            <div className="flex flex-col items-center gap-5 w-full">
              <img
                className="w-[50px] h-[50px]"
                alt="Question"
                src="https://c.animaapp.com/mfv9qqz8KPkAx8/img/question.svg"
              />

              <h1 className="font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] text-center tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] [font-style:var(--h-3-font-style)]">
                Delete your account
              </h1>
            </div>

            <div className="flex flex-col items-center justify-center gap-5 w-full">
              <div className="font-p-l font-[number:var(--p-l-font-weight)] text-off-black text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)] w-full">
                Important reminder:
              </div>

              <div className="flex flex-col items-start gap-[15px] w-full">
                {reminderItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 w-full"
                  >
                    <span className="[font-family:'Lato',Helvetica] font-normal text-[#231f20] text-lg tracking-[0] leading-[25.2px] flex-shrink-0">
                      •
                    </span>
                    <span className="[font-family:'Lato',Helvetica] font-normal text-[#231f20] text-lg tracking-[0] leading-[25.2px]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Section - Email or Wallet */}
            <div className="flex flex-col items-start gap-5 pt-0 pb-[30px] px-0 w-full border-b border-solid border-[#ffffff]">
              <div className="flex flex-col items-start justify-center">
                <h2 className="font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
                  {isWalletUser ? 'Wallet verification' : 'Email verification'}
                </h2>
              </div>

              {isWalletUser ? (
                // Wallet Verification UI
                <div className="flex flex-col items-start gap-5 w-full">
                  <div className="flex flex-col gap-2">
                    <div className="font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)]">
                      {user?.walletAddress || 'Loading...'}
                    </div>
                    {isWalletVerified && !walletSignatureResult && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Wallet connected - signature required</span>
                      </div>
                    )}
                    {walletSignatureResult && (
                      <div className="flex items-center gap-2 text-green-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Wallet signature verified</span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleConnectWallet}
                    disabled={isConnectingWallet || isRequestingSignature || walletSignatureResult !== null}
                    className="h-auto bg-red px-[30px] py-2.5 rounded-[15px] shadow-[0px_2px_5px_#00000040] [font-family:'Lato',Helvetica] font-normal text-white text-lg text-center tracking-[0] leading-[25.2px] whitespace-nowrap hover:bg-red/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnectingWallet
                      ? 'Connecting...'
                      : isRequestingSignature
                        ? 'Requesting Signature...'
                        : walletSignatureResult
                          ? 'Signature Complete'
                          : authMethod === 'metamask'
                            ? 'Connect & Sign with MetaMask'
                            : 'Connect & Sign with Coinbase Wallet'}
                  </Button>
                </div>
              ) : (
                // Email Verification UI
                <div className="flex flex-col items-start gap-5 w-full">
                  <div className="flex items-center gap-5">
                    <div className="font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                      {user?.email || 'Loading...'}
                    </div>
                  </div>

                  <div className="flex items-start gap-5 w-full">
                    <Input
                      placeholder="Enter verification code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="flex-1 bg-white rounded-[15px] border border-solid border-[#a8a8a8] shadow-[0px_2px_5px_#00000040] px-[15px] py-2.5 [font-family:'Lato',Helvetica] font-normal text-[#a9a9a9] text-lg tracking-[0] leading-[25.2px] h-auto placeholder:text-[#a9a9a9]"
                    />

                    <Button
                      onClick={handleSendCode}
                      disabled={isSendingCode || !user?.email || countdown > 0}
                      className="h-auto bg-red px-[15px] py-2.5 rounded-[15px] shadow-[0px_2px_5px_#00000040] [font-family:'Lato',Helvetica] font-normal text-white text-lg text-center tracking-[0] leading-[25.2px] whitespace-nowrap hover:bg-red/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSendingCode ? 'Sending...' : countdown > 0 ? `${countdown}s` : 'Send code'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-start gap-5 pt-0 pb-[30px] px-0 w-full border-b border-solid border-[#ffffff]">
              <div className="flex flex-col items-start justify-center">
                <h2 className="font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
                  Delete reason (optional)
                </h2>
              </div>

              <Input
                placeholder="Tell us why you want to delete your account"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-[500px] h-[45px] bg-white border border-solid border-[#a8a8a8] px-[15px] py-2.5 rounded-[15px] shadow-[0px_2px_5px_#00000040] [font-family:'Lato',Helvetica] font-normal text-[#a9a9a9] text-lg text-left tracking-[0] leading-[25.2px] placeholder:text-[#a9a9a9]"
              />
            </div>
          </div>

          <div className="flex items-start gap-2.5 px-0 py-5 w-full">
            <div className="relative w-[18px] h-[18px]">
              <Checkbox
                checked={isConfirmed}
                onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
                className="w-[18px] h-[18px] rounded-[9px] border border-solid border-[#231f20] data-[state=checked]:bg-button-green data-[state=checked]:border-[#231f20]"
              />
            </div>

            <div className="flex-1 font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)]">
              I have read and understood all the consequences of account
              deletion and confirm that I wish to proceed with deleting my
              account.
            </div>
          </div>

          <div className="flex w-[500px] items-center justify-center gap-[30px] px-5 py-[30px]">
            <Button
              variant="ghost"
              className="h-auto h-[45px] px-5 py-[15px] rounded-[15px] font-h-4 font-[number:var(--h-4-font-weight)] text-dark-grey text-[length:var(--h-4-font-size)] tracking-[var(--h-4-letter-spacing)] leading-[var(--h-4-line-height)] [font-style:var(--h-4-font-style)] hover:bg-transparent"
              onClick={() => navigate('/setting')}
            >
              <span className="relative w-fit mt-[-3.50px] font-h-4 font-[number:var(--h-4-font-weight)] text-dark-grey text-[length:var(--h-4-font-size)] tracking-[var(--h-4-letter-spacing)] leading-[var(--h-4-line-height)] whitespace-nowrap [font-style:var(--h-4-font-style)]">
                Cancel
              </span>
            </Button>

            <Button
              className={`h-auto h-[45px] px-5 py-[15px] rounded-[15px] font-h-4 font-[number:var(--h-4-font-weight)] text-white text-[length:var(--h-4-font-size)] tracking-[var(--h-4-letter-spacing)] leading-[var(--h-4-line-height)] whitespace-nowrap [font-style:var(--h-4-font-style)] ${
                isFormValid && !isLoading
                  ? "bg-red hover:bg-red/90"
                  : "bg-medium-grey hover:bg-medium-grey/90"
              }`}
              disabled={!isFormValid || isLoading}
              onClick={handleShowConfirmation}
            >
              <span className="relative w-fit mt-[-3.50px] mb-[-0.50px] font-h-4 font-[number:var(--h-4-font-weight)] text-white text-[length:var(--h-4-font-size)] tracking-[var(--h-4-letter-spacing)] leading-[var(--h-4-line-height)] whitespace-nowrap [font-style:var(--h-4-font-style)]">
                Delete
              </span>
            </Button>
          </div>
        </main>

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative w-[500px]">
              <Card className="relative bg-white">
                <CardContent className="flex flex-col items-center gap-[30px] p-[30px]">
                  <button
                    onClick={() => setShowSuccessPopup(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="sr-only">Close</span>
                  </button>

                  <div className="inline-flex flex-col items-center justify-center gap-[25px] relative flex-[0_0_auto] mt-6">
                    <h1 className="relative w-[400px] mt-[-1.00px] font-h3-s font-[number:var(--h3-s-font-weight)] text-off-black text-[length:var(--h3-s-font-size)] text-center tracking-[var(--h3-s-letter-spacing)] leading-[var(--h3-s-line-height)] [font-style:var(--h3-s-font-style)]">
                      Are you sure to delete your account?
                    </h1>
                  </div>

                  <div className="inline-flex items-center justify-center gap-[15px] relative flex-[0_0_auto]">
                    <Button
                      variant="ghost"
                      className="inline-flex h-[45px] items-center justify-center gap-[30px] px-[30px] py-2.5 relative flex-[0_0_auto] rounded-[15px] h-auto hover:bg-transparent"
                      onClick={() => setShowSuccessPopup(false)}
                    >
                      <span className="relative w-fit mt-[-3.50px] font-h-4 font-[number:var(--h-4-font-weight)] text-dark-grey text-[length:var(--h-4-font-size)] tracking-[var(--h-4-letter-spacing)] leading-[var(--h-4-line-height)] whitespace-nowrap [font-style:var(--h-4-font-style)]">
                        Cancel
                      </span>
                    </Button>

                    <Button
                      variant="outline"
                      className="inline-flex h-[45px] items-center justify-center gap-[15px] px-[30px] py-2.5 relative flex-[0_0_auto] rounded-[50px] border border-solid border-[#f23a00] bg-transparent text-red hover:bg-red hover:text-white h-auto transition-colors"
                      onClick={handleConfirmDelete}
                      disabled={isLoading}
                    >
                      <span className="relative w-fit mt-[-2.50px] mb-[-0.50px] [font-family:'Lato',Helvetica] font-normal text-xl tracking-[0] leading-7 whitespace-nowrap">
                        {isLoading ? 'Deleting...' : 'Yes'}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};