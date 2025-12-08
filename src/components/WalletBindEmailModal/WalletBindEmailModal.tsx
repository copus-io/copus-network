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
      // Send verification code for email binding
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

      // 提供更详细的错误信息给用户
      let errorMessage = 'Failed to send verification code, please try again';
      if (error.message) {
        if (error.message.includes('CORS') || error.message.includes('network')) {
          errorMessage = 'Network connection error, please check your internet connection';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = 'Authentication error, please login again';
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

  const generateSignature = async (): Promise<string> => {
    if (!window.ethereum) {
      throw new Error('No wallet provider found');
    }

    // Create a message to sign - combining wallet address and email
    const message = `Bind email ${email} to wallet ${walletAddress}`;

    try {
      // Request signature from wallet
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });

      return signature;
    } catch (error) {
      console.error('Signature failed:', error);
      throw new Error('Failed to sign message');
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
      // Generate signature
      console.log('🔐 Starting signature generation process');
      showToast('Please sign the message in your wallet...', 'info');
      const signature = await generateSignature();
      console.log('✅ Signature generated successfully');

      // Prepare request data
      const bindRequest: WalletBindEmailRequest = {
        code: verificationCode,
        email: email,
        signature: signature
      };

      console.log('📤 Sending wallet binding request:', {
        email: bindRequest.email,
        code: bindRequest.code,
        signatureLength: bindRequest.signature.length
      });

      // Call bind API
      const result = await WithdrawalService.bindWalletEmail(bindRequest);
      console.log('📥 Wallet binding response:', result);

      if (result) {
        console.log('✅ Email successfully bound to wallet');
        showToast('Email successfully bound to wallet!', 'success');
        onSuccess();
        handleClose();
      } else {
        console.log('❌ Wallet binding returned false');
        showToast('Failed to bind email to wallet', 'error');
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
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-[15px] relative flex-[0_0_auto]">
          <h2
            id="bind-title"
            className="relative w-fit font-semibold text-gray-900 text-xl text-center"
          >
            Bind Email to Wallet
          </h2>

          <p
            id="bind-description"
            className="relative w-fit text-gray-600 text-sm text-center"
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
            <div className="flex items-center gap-[15px] relative self-stretch w-full">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                onClick={handleSendCode}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0"
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                }}
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
              variant="outline"
              size="sm"
              className="self-stretch"
              disabled={isLoading}
            >
              Change Email Address
            </Button>

            {/* Action buttons */}
            <div className="flex items-center gap-[15px] relative self-stretch w-full">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                onClick={handleBindEmail}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0"
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                }}
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