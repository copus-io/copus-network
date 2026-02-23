import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthForm } from '@/contexts/AuthFormContext';
import { useVerificationCode } from '@/hooks/useVerificationCode';
import { GemSpinner } from '@/components/ui/copus-loading';

// 🔍 SEARCH: register-form-section-component
export const RegisterFormSection: React.FC = () => {
  const {
    email,
    username,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    verificationCode,
    agreeToTerms,
    isRegisterLoading,
    emailStatus,
    setEmail,
    setUsername,
    setPassword,
    setConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    setVerificationCode,
    setAgreeToTerms,
    handleRegister,
  } = useAuthForm();

  const {
    verificationStatus,
    timeRemaining,
    sendCode,
  } = useVerificationCode();

  // 🔍 SEARCH: register-form-handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRegister();
  };

  const handleSendCode = async () => {
    if (!email.trim() || !email.includes('@')) {
      return;
    }
    await sendCode(email, 'register');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isRegisterLoading) {
      handleSubmit(e as any);
    }
  };

  const isFormValid = email.trim() &&
                     username.trim() &&
                     password.length >= 6 &&
                     password === confirmPassword &&
                     verificationCode.trim() &&
                     agreeToTerms;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="register-email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="relative">
            <Input
              id="register-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isRegisterLoading}
              className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="email"
              required
            />
            {emailStatus === 'checking' && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <GemSpinner size="xs" />
              </div>
            )}
            {emailStatus === 'available' && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            {emailStatus === 'taken' && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-red-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {emailStatus === 'taken' && (
            <p className="text-sm text-red-600">This email is already registered</p>
          )}
          {emailStatus === 'available' && (
            <p className="text-sm text-green-600">Email is available</p>
          )}
        </div>

        {/* Username Input */}
        <div className="space-y-2">
          <label htmlFor="register-username" className="text-sm font-medium text-gray-700">
            Username
          </label>
          <Input
            id="register-username"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isRegisterLoading}
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="username"
            required
          />
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label htmlFor="register-password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isRegisterLoading}
              className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="new-password"
              minLength={6}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isRegisterLoading}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                )}
              </svg>
            </button>
          </div>
          {password && password.length < 6 && (
            <p className="text-sm text-red-600">Password must be at least 6 characters</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-2">
          <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isRegisterLoading}
              className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isRegisterLoading}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showConfirmPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                )}
              </svg>
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-sm text-red-600">Passwords do not match</p>
          )}
        </div>

        {/* Verification Code */}
        <div className="space-y-2">
          <label htmlFor="verification-code" className="text-sm font-medium text-gray-700">
            Verification Code
          </label>
          <div className="flex space-x-2">
            <Input
              id="verification-code"
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              disabled={isRegisterLoading}
              className="flex-1 h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={6}
              required
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSendCode}
              disabled={!email.trim() || !email.includes('@') || verificationStatus === 'sending' || timeRemaining > 0}
              className="px-4 h-12 whitespace-nowrap"
            >
              {verificationStatus === 'sending' ? (
                <GemSpinner size="xs" />
              ) : timeRemaining > 0 ? (
                `${timeRemaining}s`
              ) : (
                'Send Code'
              )}
            </Button>
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="agree-terms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
            disabled={isRegisterLoading}
          />
          <label htmlFor="agree-terms" className="text-sm text-gray-600 leading-relaxed">
            I agree to the{' '}
            <a
              href="/terms"
              className="text-blue-600 hover:text-blue-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </a>
            {' '}and{' '}
            <a
              href="/privacy"
              className="text-blue-600 hover:text-blue-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isRegisterLoading || !isFormValid}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRegisterLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <GemSpinner size="sm" color="white" />
              <span>Creating account...</span>
            </div>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </div>
  );
};