import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { debugLog } from '@/utils/debugLogger';

// 🔍 SEARCH: social-providers-config
const socialProviders = [
  {
    name: 'Google',
    icon: 'https://c.animaapp.com/mftc49qfOGKRUh/img/frame-1-3.svg',
    bgColor: 'bg-white',
    textColor: 'text-gray-700',
    hoverColor: 'hover:bg-gray-50',
  },
  {
    name: 'X',
    icon: 'https://c.animaapp.com/mftc49qfOGKRUh/img/frame-1-2.svg',
    bgColor: 'bg-black',
    textColor: 'text-white',
    hoverColor: 'hover:bg-gray-800',
  },
  {
    name: 'Metamask',
    icon: 'https://c.animaapp.com/mftc49qfOGKRUh/img/frame-1.svg',
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
    hoverColor: 'hover:bg-orange-600',
  },
  {
    name: 'Coinbase',
    icon: 'data:image/svg+xml,%3Csvg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="1024" height="1024" fill="%230052FF"/%3E%3Cpath fill-rule="evenodd" clip-rule="evenodd" d="M152 512C152 710.823 313.177 872 512 872C710.823 872 872 710.823 872 512C872 313.177 710.823 152 512 152C313.177 152 152 313.177 152 512ZM420 396C406.745 396 396 406.745 396 420V604C396 617.255 406.745 628 420 628H604C617.255 628 628 617.255 628 604V420C628 406.745 617.255 396 604 396H420Z" fill="white"/%3E%3C/svg%3E',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    hoverColor: 'hover:bg-blue-700',
  },
  {
    name: 'OKX Wallet',
    icon: 'https://lh3.googleusercontent.com/2bBevW79q6gRZTFdm42CzUetuEKndq4fn41HQGknMpKMF_d-Ae2sJJzgfFUAVb1bJKCBb4ptZ9EAPp-QhWYIvc35yw=s120',
    bgColor: 'bg-gray-900',
    textColor: 'text-white',
    hoverColor: 'hover:bg-gray-800',
  },
  {
    name: 'Kite',
    icon: "data:image/png;base64,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",
    bgColor: 'bg-[#1a1a2e]',
    textColor: 'text-white',
    hoverColor: 'hover:bg-[#16213e]',
  },
];

// 🔍 SEARCH: social-login-props
interface SocialLoginSectionProps {
  onSocialLogin: (provider: string) => Promise<void>;
  isLoading?: boolean;
  showDivider?: boolean;
  title?: string;
}

// 🔍 SEARCH: social-login-component
export const SocialLoginSection: React.FC<SocialLoginSectionProps> = ({
  onSocialLogin,
  isLoading = false,
  showDivider = true,
  title = 'Or continue with'
}) => {
  // 🔍 SEARCH: social-login-handlers
  const handleSocialClick = async (providerName: string) => {
    if (isLoading) return;

    try {
      debugLog.auth('Social login attempt:', providerName);
      await onSocialLogin(providerName);
    } catch (error) {
      debugLog.error('Social login failed:', error);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Divider */}
      {showDivider && (
        <div className="relative">
          <Separator className="my-4" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white px-4 text-sm text-gray-500">
              {title}
            </div>
          </div>
        </div>
      )}

      {/* Social login buttons */}
      <div className="grid grid-cols-1 gap-3">
        {socialProviders.map((provider) => (
          <Button
            key={provider.name}
            type="button"
            variant="outline"
            onClick={() => handleSocialClick(provider.name)}
            disabled={isLoading}
            className={`
              w-full h-12 flex items-center justify-center gap-3
              border border-gray-200 rounded-lg transition-all duration-200
              ${provider.bgColor} ${provider.textColor} ${provider.hoverColor}
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
            `}
          >
            <img
              src={provider.icon}
              alt={`${provider.name} icon`}
              className="w-5 h-5 object-contain"
              onError={(e) => {
                debugLog.error('Failed to load social provider icon:', provider.name);
                // Fallback to text if image fails
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="font-medium">
              Continue with {provider.name}
            </span>
          </Button>
        ))}
      </div>

      {/* Additional info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          By continuing, you agree to our{' '}
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
        </p>
      </div>
    </div>
  );
};