import { useState, useCallback } from 'react';
import { AuthService, CODE_TYPES } from '../services/authService';
import { FormValidator, VALIDATION_RULES, ValidationError } from '../utils/validation';

interface AuthFormState {
  // 表单字段
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  verificationCode: string;

  // UI状态
  showPassword: boolean;
  showConfirmPassword: boolean;
  rememberMe: boolean;
  agreeToTerms: boolean;

  // 邮箱验证状态
  emailStatus: 'idle' | 'checking' | 'available' | 'taken';
  isCodeSending: boolean;
  countdown: number;

  // 表单验证
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export const useAuthForm = () => {
  const [state, setState] = useState<AuthFormState>({
    // 表单字段
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',

    // UI状态
    showPassword: false,
    showConfirmPassword: false,
    rememberMe: true,
    agreeToTerms: false,

    // 邮箱验证状态
    emailStatus: 'idle',
    isCodeSending: false,
    countdown: 0,

    // 表单验证
    errors: {},
    touched: {},
  });

  // 更新字段值
  const updateField = useCallback((field: keyof AuthFormState, value: any) => {
    setState(prev => ({
      ...prev,
      [field]: value,
      touched: { ...prev.touched, [field]: true }
    }));
  }, []);

  // 验证表单
  const validateForm = useCallback((mode: 'login' | 'register') => {
    const rules = mode === 'register'
      ? {
          username: VALIDATION_RULES.USERNAME,
          email: VALIDATION_RULES.EMAIL,
          password: VALIDATION_RULES.PASSWORD,
          confirmPassword: VALIDATION_RULES.CONFIRM_PASSWORD(),
          verificationCode: VALIDATION_RULES.VERIFICATION_CODE,
        }
      : {
          email: VALIDATION_RULES.EMAIL,
          password: { required: true },
        };

    const validationErrors = FormValidator.validateForm(
      {
        username: state.username,
        email: state.email,
        password: state.password,
        confirmPassword: state.confirmPassword,
        verificationCode: state.verificationCode,
      },
      rules
    );

    const errorMap: Record<string, string> = {};
    validationErrors.forEach(error => {
      errorMap[error.field] = error.message;
    });

    setState(prev => ({ ...prev, errors: errorMap }));
    return validationErrors.length === 0;
  }, [state]);

  // 检查邮箱是否已存在
  const checkEmailExist = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) {
      setState(prev => ({ ...prev, emailStatus: 'idle' }));
      return;
    }

    setState(prev => ({ ...prev, emailStatus: 'checking' }));

    try {
      const result = await AuthService.checkEmailExist({ email });
      setState(prev => ({
        ...prev,
        emailStatus: result.exists ? 'taken' : 'available'
      }));
    } catch (error) {
      console.error('检查邮箱失败:', error);
      setState(prev => ({ ...prev, emailStatus: 'idle' }));
    }
  }, []);

  // 发送验证码
  const sendVerificationCode = useCallback(async () => {
    if (!state.email ||
        !state.email.includes('@') ||
        state.emailStatus === 'taken' ||
        state.emailStatus === 'checking' ||
        state.countdown > 0) {
      return false;
    }

    setState(prev => ({ ...prev, isCodeSending: true }));

    try {
      await AuthService.sendVerificationCode({
        email: state.email,
        codeType: CODE_TYPES.REGISTER
      });

      // 开始倒计时
      setState(prev => ({ ...prev, countdown: 60 }));
      const timer = setInterval(() => {
        setState(prev => {
          if (prev.countdown <= 1) {
            clearInterval(timer);
            return { ...prev, countdown: 0 };
          }
          return { ...prev, countdown: prev.countdown - 1 };
        });
      }, 1000);

      return true;
    } catch (error) {
      console.error('发送验证码失败:', error);
      return false;
    } finally {
      setState(prev => ({ ...prev, isCodeSending: false }));
    }
  }, [state.email, state.emailStatus, state.countdown]);

  // 注册
  const register = useCallback(async () => {
    if (!validateForm('register')) {
      return { success: false, message: 'Please check form information' };
    }

    if (!state.agreeToTerms) {
      return { success: false, message: 'Please agree to the terms of service' };
    }

    try {
      const result = await AuthService.register({
        username: state.username,
        email: state.email,
        password: state.password,
        verificationCode: state.verificationCode,
      });

      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: 'Registration failed, please try again' };
    }
  }, [state, validateForm]);

  // 登录
  const login = useCallback(async () => {
    if (!validateForm('login')) {
      return { success: false, message: 'Please check form information' };
    }

    try {
      const result = await AuthService.login({
        email: state.email,
        password: state.password,
        rememberMe: state.rememberMe,
      });

      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: 'Login failed, please check email and password' };
    }
  }, [state, validateForm]);

  return {
    // 状态
    ...state,

    // 方法
    updateField,
    checkEmailExist,
    sendVerificationCode,
    register,
    login,
    validateForm,

    // 计算属性
    canSendCode: state.email.includes('@') &&
                 state.emailStatus === 'available' &&
                 state.countdown === 0 &&
                 !state.isCodeSending,

    isFormValid: (mode: 'login' | 'register') => {
      return Object.keys(state.errors).length === 0 &&
             (mode === 'login' || state.agreeToTerms);
    }
  };
};