import React, { useState } from "react";
import { Button } from "../ui/button";
import { useToast } from "../ui/toast";
import { WithdrawalService } from "../../services/withdrawalService";
import { WithdrawalRequest } from "../../types/withdrawal";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  onVerified: () => void;
  withdrawalData?: {
    amount: string;
    toAddress: string;
    network?: string;
    chainId?: number;
    assetName?: string;
  };
  chainId?: number;
  assetName?: string;
}

export const EmailVerificationModal = ({
  isOpen,
  onClose,
  email = "XX@gmail.com",
  onVerified,
  withdrawalData,
  chainId = 8453, // Base mainnet chainId
  assetName = "USDC"
}: EmailVerificationModalProps): JSX.Element => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // 邮箱掩码函数
  const maskEmail = (email: string): string => {
    if (!email || !email.includes('@')) return email;

    const [localPart, domain] = email.split('@');

    if (localPart.length <= 3) {
      // 如果本地部分太短，只显示第一个字符和星号
      return `${localPart[0]}***@${domain}`;
    } else {
      // 显示前2个字符，中间用星号替换，显示最后1个字符
      const firstPart = localPart.slice(0, 2);
      const lastPart = localPart.slice(-1);
      const masked = `${firstPart}***${lastPart}@${domain}`;
      return masked;
    }
  };

  const handleSendCode = async () => {
    setIsLoading(true);
    try {
      await WithdrawalService.sendVerificationCode(email);
      showToast('验证码已发送到您的邮箱', 'success');
    } catch (error) {
      console.error('发送验证码失败:', error);
      showToast('发送验证码失败，请稍后重试', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      showToast('请输入验证码', 'error');
      return;
    }

    if (!withdrawalData) {
      showToast('提现数据缺失，请重新操作', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const withdrawalRequest: WithdrawalRequest = {
        amount: withdrawalData.amount,
        assetName: withdrawalData.assetName || assetName,
        chainId: withdrawalData.chainId || chainId,
        code: verificationCode,
        toAddress: withdrawalData.toAddress
      };

      console.log('🚀 提现请求详情:', {
        withdrawalRequest,
        email,
        rawWithdrawalData: withdrawalData,
        timestamp: new Date().toISOString()
      });

      const response = await WithdrawalService.submitWithdrawal(withdrawalRequest);

      console.log('📥 提现API响应:', {
        response,
        status: response?.status,
        message: response?.message,
        orderId: response?.orderId,
        timestamp: new Date().toISOString()
      });

      // 检查API调用是否成功
      if (response.status === 1) {
        // API调用成功，检查业务逻辑结果
        if (response.data && response.data.status === 0) {
          console.log('✅ 提现成功，订单号:', response.data.orderId);
          showToast(`提现申请提交成功！订单号: ${response.data.orderId}`, 'success');
          onVerified();
        } else {
          // 业务逻辑失败
          const errorMessage = response.data?.message || response.msg || '提现申请失败';
          console.log('❌ 提现失败，业务状态:', response.data?.status, '错误信息:', errorMessage);
          showToast(errorMessage, 'error');
        }
      } else {
        // API调用失败
        const errorMessage = response.msg || response.message || '提现申请失败';
        console.log('❌ API调用失败，状态:', response.status, '错误信息:', errorMessage);
        showToast(errorMessage, 'error');
      }
    } catch (error: any) {
      console.error('💥 提现申请异常:', {
        error,
        errorMessage: error.message,
        errorStack: error.stack,
        withdrawalData,
        timestamp: new Date().toISOString()
      });
      showToast(error.message || '提现申请失败，请稍后重试', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setVerificationCode("");
    onClose();
  };

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="inline-flex flex-col items-center gap-5 p-[30px] relative bg-white rounded-[15px] shadow-xl max-w-md w-full mx-4"
        role="dialog"
        aria-labelledby="verify-title"
        aria-describedby="verify-description"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-[15px] relative flex-[0_0_auto]">
          <h2
            id="verify-title"
            className="relative w-fit font-semibold text-gray-900 text-xl text-center"
          >
            Email verification
          </h2>

          <p
            id="verify-description"
            className="relative w-fit text-gray-600 text-sm text-center"
          >
            Enter the verification code sent to your email address
          </p>
        </div>

        {/* Email display */}
        <div className="flex items-center gap-[15px] p-4 relative self-stretch w-full bg-gray-50 rounded-lg">
          <div className="relative flex-1 text-gray-700 text-center">
            {maskEmail(email)}
          </div>
        </div>

        {/* Verification code input */}
        <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full">
          <label htmlFor="verification-code" className="text-sm font-medium text-gray-700">
            Verification code
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

        {/* Send code button */}
        <Button
          onClick={handleSendCode}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="self-stretch"
        >
          {isLoading ? "Sending..." : "Send verification code"}
        </Button>

        {/* Action buttons */}
        <div className="flex items-center gap-[15px] relative self-stretch w-full">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>

          <button
            onClick={handleVerify}
            disabled={!verificationCode || isLoading}
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg [font-family:'Lato',Helvetica] font-bold text-lg transition-all ${
              !verificationCode || isLoading
                ? 'bg-gray-300 cursor-not-allowed opacity-60 text-gray-500'
                : 'bg-[linear-gradient(0deg,rgba(0,82,255,0.8)_0%,rgba(0,82,255,0.8)_100%),linear-gradient(0deg,rgba(255,254,254,1)_0%,rgba(255,254,254,1)_100%)] cursor-pointer hover:bg-[linear-gradient(0deg,rgba(0,82,255,0.9)_0%,rgba(0,82,255,0.9)_100%),linear-gradient(0deg,rgba(255,254,254,1)_0%,rgba(255,254,254,1)_100%)] active:scale-95 text-[#ffffff]'
            }`}
            aria-label="Verify email code"
          >
            <span className={`relative w-fit tracking-[0] leading-5 whitespace-nowrap ${
              !verificationCode || isLoading ? 'text-gray-500' : 'text-[#ffffff]'
            }`}>
              {isLoading ? "Verifying..." : "Verify"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};