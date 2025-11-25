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

  // Clear timer
  const clearTimer = useCallback(() => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
  }, [timerId]);

  // Send verification code
  const sendCode = useCallback(
    async (email: string, codeType: number) => {
      // If countdown is active or sending is in progress, don't process
      if (countdown > 0 || isSending) {
        return false;
      }

      // Basic email validation
      if (!email || !email.includes('@')) {
        props?.onSendError?.('Please enter a valid email address');
        return false;
      }

      setIsSending(true);

      try {
        const success = await AuthService.sendVerificationCode({
          email,
          codeType
        });

        if (success) {
          // Start countdown (60 seconds)
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
          props?.onSendError?.('Verification code sending failed, please try again later');
          return false;
        }
      } catch (error) {
        console.error('Failed to send verification code:', error);
        props?.onSendError?.('Network error, please check your network connection and try again');
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [countdown, isSending, props, clearTimer]
  );

  // Reset state
  const reset = useCallback(() => {
    clearTimer();
    setCountdown(0);
    setIsSending(false);
  }, [clearTimer]);

  // Cleanup on component unmount
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