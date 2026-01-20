import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthForm } from '@/contexts/AuthFormContext';
import { GemSpinner } from '@/components/ui/copus-loading';

// 🔍 SEARCH: login-form-section-props
interface LoginFormSectionProps {
  onForgotPassword: () => void;
}

// 🔍 SEARCH: login-form-section-component
export const LoginFormSection: React.FC<LoginFormSectionProps> = ({
  onForgotPassword
}) => {
  const {
    loginEmail,
    loginPassword,
    showLoginPassword,
    rememberMe,
    isLoginLoading,
    setLoginEmail,
    setLoginPassword,
    setShowLoginPassword,
    setRememberMe,
    handleLogin,
  } = useAuthForm();

  // 🔍 SEARCH: login-form-handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoginLoading) {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoginLoading}
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="email"
            required
          />
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <Input
              id="login-password"
              type={showLoginPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoginLoading}
              className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
              disabled={isLoginLoading}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showLoginPassword ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Remember Me and Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={isLoginLoading}
            />
            <label
              htmlFor="remember-me"
              className="text-sm text-gray-600 cursor-pointer"
            >
              Remember me
            </label>
          </div>

          <button
            type="button"
            onClick={onForgotPassword}
            disabled={isLoginLoading}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoginLoading || !loginEmail.trim() || !loginPassword.trim()}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoginLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <GemSpinner size="sm" color="white" />
              <span>Signing in...</span>
            </div>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </div>
  );
};