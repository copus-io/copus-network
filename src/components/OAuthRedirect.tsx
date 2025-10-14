import React, { useEffect } from 'react';

const OAuthRedirect: React.FC = () => {
  useEffect(() => {
    // Get current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');


    // If we have OAuth parameters, redirect to local login with those parameters
    if (code && state) {
      const localUrl = `http://localhost:5177/login?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&provider=google`;
      console.log('🚀 Redirecting to local server:', localUrl);
      window.location.href = localUrl;
    } else {
      // No OAuth parameters, just redirect to local login
      console.log('🚀 No OAuth parameters, redirecting to local login');
      window.location.href = 'http://localhost:5177/login';
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