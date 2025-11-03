import React, { useEffect } from 'react';

const OAuthRedirect: React.FC = () => {
  useEffect(() => {
    // Get current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const provider = urlParams.get('provider') || 'google'; // Default to google if not specified

    const currentOrigin = window.location.origin; // e.g., http://localhost:5177 or https://test.copus.network

    console.log('🔍 OAuthRedirect received params:', {
      code: code?.substring(0, 10) + '...',
      state,
      provider,
      currentOrigin
    });

    // Always redirect to the same environment (current origin)
    // This ensures users stay on the environment they initiated the OAuth flow from
    if (code && state) {
      // Redirect to /login on the same origin with OAuth parameters
      const redirectUrl = `/login?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&provider=${provider}`;
      console.log('🚀 Redirecting to login on same origin:', currentOrigin + redirectUrl);
      window.location.href = redirectUrl;
    } else {
      // No OAuth parameters, redirect to login
      console.log('🚀 No OAuth parameters, redirecting to login on same origin');
      window.location.href = '/login';
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