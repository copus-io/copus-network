import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";

interface EmailVerificationProps {
  email: string;
  onVerify: (code: string) => Promise<boolean>;
  onResend: () => Promise<boolean>;
  onCancel: () => void;
  isVerifying: boolean;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerify,
  onResend,
  onCancel,
  isVerifying
}) => {
  const [code, setCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 倒计时逻辑
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  // 自动聚焦第一个输入框
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // 只允许数字输入
    if (!/^\d*$/.test(value)) return;

    const newCode = code.split('');
    newCode[index] = value;
    const updatedCode = newCode.join('');
    setCode(updatedCode);
    setError('');

    // 自动跳转到下一个输入框
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // 如果输入了6位数字，自动验证
    if (updatedCode.length === 6) {
      handleVerify(updatedCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // 如果当前输入框为空且按下删除键，跳转到前一个输入框
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setCode(pastedData);

    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (verificationCode: string) => {
    if (verificationCode.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    try {
      const result = await onVerify(verificationCode);
      if (result) {
        setSuccess(true);
        setError('');
      } else {
        setAttempts(prev => prev + 1);
        setError(`验证码错误，剩余尝试次数：${2 - attempts}`);
        setCode('');

        // 清空所有输入框并聚焦第一个
        inputRefs.current.forEach(input => {
          if (input) input.value = '';
        });
        inputRefs.current[0]?.focus();

        if (attempts >= 2) {
          setError('验证失败次数过多，请重新发送验证码');
          setAttempts(0);
          setResendCountdown(60);
          setCanResend(false);
        }
      }
    } catch (error) {
      setError('验证失败，请重试');
      setCode('');
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    try {
      const result = await onResend();
      if (result) {
        setResendCountdown(60);
        setCanResend(false);
        setAttempts(0);
        setError('');
        setCode('');

        // 清空输入框并聚焦第一个
        inputRefs.current.forEach(input => {
          if (input) input.value = '';
        });
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('发送失败，请稍后重试');
    } finally {
      setIsResending(false);
    }
  };

  const formatEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    const maskedUsername = username.slice(0, 2) + '***' + username.slice(-1);
    return `${maskedUsername}@${domain}`;
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-green-800 mb-1">✅ 邮箱验证成功</h3>
          <p className="text-sm text-green-600">正在处理您的提现请求...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 头部说明 */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">📧 邮箱验证</h2>
        <p className="text-sm text-gray-600 mb-1">
          我们已向 <span className="font-medium text-blue-600">{formatEmail(email)}</span> 发送验证码
        </p>
        <p className="text-xs text-gray-500">请在10分钟内输入6位验证码</p>
      </div>

      {/* 验证码输入框 */}
      <div className="flex justify-center gap-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={code[index] || ''}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
              error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
            }`}
            disabled={isVerifying}
          />
        ))}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="text-center">
          <p className="text-red-600 text-sm flex items-center justify-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}

      {/* 重发按钮 */}
      <div className="text-center">
        {canResend ? (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
          >
            {isResending ? '发送中...' : '🔄 重新发送验证码'}
          </button>
        ) : (
          <p className="text-gray-500 text-sm">
            {resendCountdown}秒后可重新发送
          </p>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1"
          disabled={isVerifying}
        >
          取消
        </Button>
        <Button
          onClick={() => handleVerify(code)}
          disabled={code.length !== 6 || isVerifying}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          {isVerifying ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              验证中...
            </>
          ) : (
            '验证'
          )}
        </Button>
      </div>

      {/* 提示信息 */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>💡 支持直接粘贴6位验证码</p>
        <p>📱 验证码有效期10分钟，最多尝试3次</p>
      </div>
    </div>
  );
};