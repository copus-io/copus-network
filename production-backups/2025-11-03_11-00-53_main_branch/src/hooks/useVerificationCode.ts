import { useState, useCallback } from 'react';
import { AuthService } from '../services/authService';

interface UseVerificationCodeProps {
  onSendSuccess?: () => void;
  onSendError?: (error: string) => void;
}

export const useVerificationCode = (props?: UseVerificationCodeProps) => {
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  // 清理定时器
  const clearTimer = useCallback(() => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
  }, [timerId]);

  // 发送验证码
  const sendCode = useCallback(
    async (email: string, codeType: number) => {
      // 如果正在倒计时或正在发送，则不处理
      if (countdown > 0 || isSending) {
        return false;
      }

      // 基本邮箱验证
      if (!email || !email.includes('@')) {
        props?.onSendError?.('请输入有效的邮箱地址');
        return false;
      }

      setIsSending(true);

      try {
        const success = await AuthService.sendVerificationCode({
          email,
          codeType
        });

        if (success) {
          // 开始倒计时 (60秒)
          setCountdown(60);
          const newTimerId = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearTimer();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          setTimerId(newTimerId);
          
          props?.onSendSuccess?.();
          return true;
        } else {
          props?.onSendError?.('验证码发送失败，请稍后重试');
          return false;
        }
      } catch (error) {
        console.error('发送验证码失败:', error);
        props?.onSendError?.('网络错误，请检查网络连接后重试');
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [countdown, isSending, props, clearTimer]
  );

  // 重置状态
  const reset = useCallback(() => {
    clearTimer();
    setCountdown(0);
    setIsSending(false);
  }, [clearTimer]);

  // 组件卸载时清理
  const cleanup = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  return {
    isSending,
    countdown,
    sendCode,
    reset,
    cleanup,
    canSend: countdown === 0 && !isSending
  };
};