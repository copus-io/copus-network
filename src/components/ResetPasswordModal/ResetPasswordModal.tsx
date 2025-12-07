import { EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import CryptoJS from 'crypto-js';
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { useToast } from "../ui/toast";
import { AuthService, CODE_TYPES } from "../../services/authService";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ResetPasswordModal = ({ isOpen, onClose, onSuccess }: ResetPasswordModalProps): JSX.Element | null => {
  const { showToast } = useToast();

  // All form state in one view
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    setIsSendingCode(true);
    try {
      // First check if email exists
      // API response format: {"status":1,"msg":"success","data":true/false}
      // data=true means email exists, false means email doesn't exist
      const emailCheckResult = await AuthService.checkEmailExist({ email });

      console.log('Email check result:', emailCheckResult);

      // Check if email exists (data should be true for existing email)
      if (emailCheckResult.status === 1 && emailCheckResult.data === false) {
        showToast("This email doesn't exist, please sign up or check again.", "error");
        setIsSendingCode(false);
        return;
      }

      // Email exists, proceed to send verification code
      const success = await AuthService.sendVerificationCode({
        email: email,
        codeType: CODE_TYPES.FindBackEmailPsw
      });
      if (success) {
        showToast("Verification code sent to your email", "success");
        setIsCodeSent(true);
      } else {
        showToast("Failed to send verification code, please try again", "error");
      }
    } catch (error) {
      console.error("Failed to send verification code:", error);
      showToast("Failed to send verification code, please try again", "error");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleResetPassword = async () => {
    // Validate all fields
    if (!email || !email.includes('@')) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    if (!verificationCode.trim()) {
      showToast("Please enter verification code", "error");
      return;
    }

    if (!newPassword || !confirmPassword) {
      showToast("Please fill in all password fields", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setIsSaving(true);
    try {
      // MD5 encrypt password before sending
      const encryptedPassword = CryptoJS.MD5(newPassword).toString();

      // Call reset password API with email, verification code, and encrypted password
      const params = {
        email: email,
        code: verificationCode,
        password: encryptedPassword
      };

      console.log('Reset password request params:', {
        email: params.email,
        code: params.code,
        password: '***MD5 encrypted***'
      });

      const result = await AuthService.resetPassword(params);

      console.log('Reset password API result:', result);

      if (result.success) {
        showToast("Password reset successfully! Please log in with your new password.", "success");
        onSuccess?.();
        onClose();
      } else {
        // Show the actual API error message
        showToast(result.message || "Failed to reset password, please try again", "error");
      }
    } catch (error: any) {
      console.error("Failed to reset password:", error);
      console.error("Error message:", error?.message);
      console.error("Error response:", error?.response);
      showToast(`Failed to reset password: ${error?.message || 'Please try again later'}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Reset all state
    setEmail("");
    setVerificationCode("");
    setIsCodeSent(false);
    setIsSendingCode(false);
    setShowPassword1(false);
    setShowPassword2(false);
    setNewPassword("");
    setConfirmPassword("");
    setIsSaving(false);
    onClose();
  };

  const isFormValid = email.includes('@') && verificationCode.trim() && newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 6;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card
        className="w-[600px] bg-white rounded-[20px] shadow-xl"
      >
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="[font-family:'Lato',Helvetica] font-bold text-off-black text-2xl tracking-[0] leading-[28px]">
              Reset Password
            </h2>
            <button onClick={handleClose} className="hover:bg-gray-100 p-1 rounded-full transition-colors">
              <XIcon className="w-3 h-3 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          <div className="space-y-6">
            <p className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base leading-6">
              Enter your email address and we'll send you a verification code to reset your password.
            </p>

              {/* Email field with send code button */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-dark-grey">Email Address</label>
                <div className="relative">
                  <Input
                    type="email"
                    className="w-full h-12 px-4 pr-[130px] bg-gray-50 rounded-lg border border-gray-200 focus:border-red focus:ring-1 focus:ring-red focus-visible:ring-1 focus-visible:ring-red"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 h-8 bg-red hover:bg-red/90 text-white rounded-[50px] font-semibold transition-colors text-sm"
                    onClick={handleSendCode}
                    disabled={isSendingCode || !email.includes('@')}
                  >
                    {isSendingCode ? "Sending..." : "Send code"}
                  </Button>
                </div>
              </div>

            {/* Verification code input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-grey">Verification Code</label>
              <Input
                className="w-full h-12 px-4 bg-gray-50 rounded-lg border border-gray-200 focus:border-red focus:ring-1 focus:ring-red focus-visible:ring-1 focus-visible:ring-red"
                placeholder="Enter 6-digit code from your email"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
              {isCodeSent && (
                <p className="text-sm text-green-600">✓ Verification code sent to your email</p>
              )}
            </div>

            {/* New password input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-grey">New Password</label>
              <div className="relative">
                <Input
                  type={showPassword1 ? "text" : "password"}
                  placeholder="Enter your new password"
                  className="w-full h-12 px-4 pr-12 bg-gray-50 rounded-lg border border-gray-200 focus:border-red focus:ring-1 focus:ring-red focus-visible:ring-1 focus-visible:ring-red"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto p-1 hover:bg-gray-100 rounded"
                  onClick={() => setShowPassword1(!showPassword1)}
                >
                  {showPassword1 ? (
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <EyeOffIcon className="w-5 h-5 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirm password input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-grey">Confirm New Password</label>
              <div className="relative">
                <Input
                  type={showPassword2 ? "text" : "password"}
                  placeholder="Enter your new password again"
                  className="w-full h-12 px-4 pr-12 bg-gray-50 rounded-lg border border-gray-200 focus:border-red focus:ring-1 focus:ring-red focus-visible:ring-1 focus-visible:ring-red"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto p-1 hover:bg-gray-100 rounded"
                  onClick={() => setShowPassword2(!showPassword2)}
                >
                  {showPassword2 ? (
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <EyeOffIcon className="w-5 h-5 text-gray-400" />
                  )}
                </Button>
              </div>
              {confirmPassword && (
                <div className={`text-sm flex items-center gap-1 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                  {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
            </div>

            {/* Password requirements */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-medium-dark-grey mb-2 font-medium">Password requirements:</p>
              <ul className="text-sm text-medium-dark-grey space-y-1">
                <li className={`flex items-center gap-2 ${newPassword.length >= 6 ? 'text-green-600' : ''}`}>
                  <span className="w-1 h-1 bg-current rounded-full"></span>
                  Minimum 6 characters
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-current rounded-full"></span>
                  Mix of letters, numbers, and symbols recommended
                </li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="ghost"
                className="px-6 py-2 h-auto rounded-lg hover:bg-gray-50 transition-colors"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                disabled={!isFormValid || isSaving}
                className={`px-6 py-2 h-auto rounded-[50px] font-semibold transition-colors ${
                  isFormValid && !isSaving
                    ? "bg-red hover:bg-red/90 text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                onClick={handleResetPassword}
              >
                {isSaving ? "Resetting..." : "Reset password"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
