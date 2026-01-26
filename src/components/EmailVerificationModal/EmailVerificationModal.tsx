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

  // Email masking function
  const maskEmail = (email: string): string => {
    if (!email || !email.includes('@')) return email;

    const [localPart, domain] = email.split('@');

    if (localPart.length <= 3) {
      // If local part is too short, only show first character and asterisks
      return `${localPart[0]}***@${domain}`;
    } else {
      // Show first 2 characters, replace middle with asterisks, show last 1 character
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
      showToast('Verification code sent to your email', 'success');
    } catch (error) {
      console.error('Failed to send verification code:', error);
      showToast('Failed to send verification code, please try again later', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      showToast('Please enter verification code', 'error');
      return;
    }

    if (!withdrawalData) {
      showToast('Withdrawal data missing, please try again', 'error');
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

      console.log('🚀 Withdrawal request details:', {
        withdrawalRequest,
        email,
        rawWithdrawalData: withdrawalData,
        timestamp: new Date().toISOString()
      });

      const response = await WithdrawalService.submitWithdrawal(withdrawalRequest);

      console.log('📥 Withdrawal API response:', {
        response,
        status: response?.status,
        message: response?.message,
        orderId: response?.orderId,
        timestamp: new Date().toISOString()
      });

      // Check if API call was successful
      if (response.status === 1) {
        // API call successful, check business logic result
        if (response.data && response.data.status === 0) {
          console.log('✅ Withdrawal successful, order ID:', response.data.orderId);
          showToast(`Withdrawal request submitted successfully! Order ID: ${response.data.orderId}`, 'success');
          onVerified();
        } else {
          // Business logic failed
          const errorMessage = response.data?.message || response.msg || 'Withdrawal request failed';
          console.log('❌ Withdrawal failed, business status:', response.data?.status, 'Error message:', errorMessage);
          showToast(errorMessage, 'error');
        }
      } else {
        // API call failed
        const errorMessage = response.msg || response.message || 'Withdrawal request failed';
        console.log('❌ API call failed, status:', response.status, 'Error message:', errorMessage);
        showToast(errorMessage, 'error');
      }
    } catch (error: any) {
      console.error('💥 Withdrawal request exception:', {
        error,
        errorMessage: error.message,
        errorStack: error.stack,
        withdrawalData,
        timestamp: new Date().toISOString()
      });
      showToast(error.message || 'Withdrawal request failed, please try again later', 'error');
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