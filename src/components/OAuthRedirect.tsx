import React, { useEffect } from 'react';

const OAuthRedirect: React.FC = () => {
  useEffect(() => {
    // Get current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const provider = urlParams.get('provider') || 'google'; // Default to google if not specified

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    console.log('🔍 OAuthRedirect received params:', {
      code: code?.substring(0, 10) + '...',
      state,
      provider,
      hostname: window.location.hostname,
      isLocalhost
    });

    // If we have OAuth parameters, redirect appropriately
    if (code && state) {
      let redirectUrl: string;

      if (isLocalhost) {
        // Already on localhost, just redirect to /login (relative path)
        redirectUrl = `/login?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&provider=${provider}`;
        console.log('🚀 Already on localhost, redirecting to:', redirectUrl);
      } else {
        // On test.copus.io, redirect to localhost (absolute URL)
        redirectUrl = `http://localhost:5177/login?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&provider=${provider}`;
        console.log('🚀 Redirecting to local server:', redirectUrl);
      }

      window.location.href = redirectUrl;
    } else {
      // No OAuth parameters, redirect to login
      const redirectUrl = isLocalhost ? '/login' : 'http://localhost:5177/login';
      console.log('🚀 No OAuth parameters, redirecting to login:', redirectUrl);
      window.location.href = redirectUrl;
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-lg">Redirecting to local development server...</p>
      </div>
    </div>
  );
};

export default OAuthRedirect;