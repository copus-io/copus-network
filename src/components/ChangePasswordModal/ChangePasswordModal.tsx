import { EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { useUser } from "../../contexts/UserContext";
import { useToast } from "../ui/toast";
import { AuthService } from "../../services/authService";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangePasswordModal = ({ isOpen, onClose, onSuccess }: ChangePasswordModalProps): JSX.Element | null => {
  const { user } = useUser();
  const { showToast } = useToast();

  // 步骤状态：'verify' | 'newPassword'
  const [step, setStep] = useState<'verify' | 'newPassword'>('verify');

  // 验证码步骤状态
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  // 新密码步骤状态
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  if (!isOpen) return null;

  const handleSendCode = async () => {
    if (!user?.email) {
      showToast("用户邮箱信息不可用", "error");
      return;
    }

    setIsSendingCode(true);
    try {
      const success = await AuthService.sendVerificationCode(user.email);
      if (success) {
        showToast("验证码已发送到您的邮箱", "success");
        setIsCodeSent(true);
      } else {
        showToast("发送验证码失败，请重试", "error");
      }
    } catch (error) {
      console.error("发送验证码失败:", error);
      showToast("发送验证码失败，请重试", "error");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      showToast("请输入验证码", "error");
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await AuthService.verifyCode(user?.email || "", verificationCode);
      if (isValid) {
        showToast("验证成功！", "success");
        setStep('newPassword');
      } else {
        showToast("验证码错误，请重新输入", "error");
      }
    } catch (error) {
      console.error("验证码验证失败:", error);
      showToast("验证失败，请重试", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSavePassword = async () => {
    if (!newPassword || !confirmPassword) {
      showToast("请填写所有密码字段", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("两次输入的密码不一致", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("密码长度至少为6位", "error");
      return;
    }

    setIsChanging(true);
    try {
      const result = await AuthService.updatePassword(newPassword);

      if (result) {
        showToast("密码修改成功！", "success");
        onSuccess?.();
        onClose();
      } else {
        showToast("密码修改失败，请重试", "error");
      }
    } catch (error) {
      console.error("修改密码失败:", error);
      showToast("密码修改失败，请稍后重试", "error");
    } finally {
      setIsChanging(false);
    }
  };

  const handleClose = () => {
    // 重置所有状态
    setStep('verify');
    setVerificationCode("");
    setIsCodeSent(false);
    setIsVerifying(false);
    setIsSendingCode(false);
    setShowPassword1(false);
    setShowPassword2(false);
    setNewPassword("");
    setConfirmPassword("");
    setIsChanging(false);
    onClose();
  };

  const isFormValid = newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 6;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
      <Card
        className="w-[600px] bg-white rounded-[20px] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h2 className="[font-family:'Lato',Helvetica] font-bold text-off-black text-2xl tracking-[0] leading-[28px]">
                Change Password
              </h2>
              {step === 'newPassword' && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red rounded-full"></div>
                  <span className="text-sm text-medium-dark-grey">Step 2 of 2</span>
                </div>
              )}
              {step === 'verify' && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red rounded-full"></div>
                  <span className="text-sm text-medium-dark-grey">Step 1 of 2</span>
                </div>
              )}
            </div>
            <button onClick={handleClose} className="hover:bg-gray-100 p-1 rounded-full transition-colors">
              <XIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          {step === 'verify' && (
            <div className="space-y-6">
              <p className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base leading-6">
                For security, we need to verify your identity before changing your password.
              </p>

              {/* Email field with send code button */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-dark-grey">Email Address</label>
                <div className="flex gap-3">
                  <Input
                    className="flex-1 h-12 px-4 bg-gray-50 rounded-lg border border-gray-200 focus:border-red focus:ring-1 focus:ring-red focus-visible:ring-1 focus-visible:ring-red"
                    value={user?.email || "user@example.com"}
                    readOnly
                  />
                  <Button
                    className="px-6 h-12 bg-red hover:bg-red/90 text-white rounded-lg font-semibold transition-colors"
                    onClick={handleSendCode}
                    disabled={isSendingCode}
                  >
                    {isSendingCode ? "Sending..." : "Send Code"}
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
                  disabled={!verificationCode.trim() || isVerifying}
                  className={`px-6 py-2 h-auto rounded-lg font-semibold transition-colors ${
                    verificationCode.trim() && !isVerifying
                      ? "bg-red hover:bg-red/90 text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={handleVerifyCode}
                >
                  {isVerifying ? "Verifying..." : "Verify & Continue"}
                </Button>
              </div>
            </div>
          )}

          {step === 'newPassword' && (
            <div className="space-y-6">
              <p className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base leading-6">
                Create a new password for your account.
              </p>

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
                      <EyeOffIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-400" />
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
                      <EyeOffIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-400" />
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
                  onClick={() => setStep('verify')}
                >
                  Back
                </Button>
                <Button
                  disabled={!isFormValid || isChanging}
                  className={`px-6 py-2 h-auto rounded-lg font-semibold transition-colors ${
                    isFormValid && !isChanging
                      ? "bg-red hover:bg-red/90 text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={handleSavePassword}
                >
                  {isChanging ? "Saving..." : "Save New Password"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};