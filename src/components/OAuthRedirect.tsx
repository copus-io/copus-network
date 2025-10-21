import React, { useEffect } from 'react';
import { APP_CONFIG } from '../config/app';

const OAuthRedirect: React.FC = () => {
  useEffect(() => {
    // Get current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const provider = urlParams.get('provider') || 'google'; // Default to google if not specified

    const currentUrl = window.location.origin; // e.g., http://localhost:5177 or https://test.copus.network
    const appUrl = APP_CONFIG.APP_URL; // From environment variable

    console.log('🔍 OAuthRedirect received params:', {
      code: code?.substring(0, 10) + '...',
      state,
      provider,
      currentUrl,
      appUrl,
      isSameOrigin: currentUrl === appUrl
    });

    // If we have OAuth parameters, redirect appropriately
    if (code && state) {
      let redirectUrl: string;

      if (currentUrl === appUrl) {
        // Already on the target domain, use relative path
        redirectUrl = `/login?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&provider=${provider}`;
        console.log('🚀 Already on target domain, redirecting to:', redirectUrl);
      } else {
        // On different domain (e.g., test.copus.io callback), redirect to configured app URL
        redirectUrl = `${appUrl}/login?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&provider=${provider}`;
        console.log('🚀 Redirecting to configured app URL:', redirectUrl);
      }

      window.location.href = redirectUrl;
    } else {
      // No OAuth parameters, redirect to login
      const redirectUrl = currentUrl === appUrl ? '/login' : `${appUrl}/login`;
      console.log('🚀 No OAuth parameters, redirecting to login:', redirectUrl);
      window.location.href = redirectUrl;
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-lg">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthRedirect;