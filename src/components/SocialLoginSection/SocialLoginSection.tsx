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