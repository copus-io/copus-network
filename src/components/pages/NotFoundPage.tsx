import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { HeaderSection } from '../shared/HeaderSection/HeaderSection';
import { useUser } from '../../contexts/UserContext';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <HeaderSection isLoggedIn={!!user} />

      <div className="flex items-center justify-center min-h-screen pt-[120px]">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-lg">
          {/* 404图标 */}
          <div className="w-20 h-20 mx-auto mb-6 bg-red/10 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m6-6v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2z"
              />
            </svg>
          </div>

          {/* 标题 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            404
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            404 – Page Not Found
          </h2>

          {/* 描述 */}
          <p className="text-gray-600 mb-6">
            Sorry, we can't find that page. It may have been moved or deleted, or the link might be incorrect.
          </p>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/copus')}
              className="w-full bg-red hover:bg-red/90 text-white py-3 rounded-lg transition-colors"
            >
              Go to Home
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full border-red text-red hover:bg-red/5 py-3 rounded-lg transition-colors"
            >
              Go Back
            </Button>

            {user ? (
              <Link
                to="/my-treasury"
                className="block w-full text-gray-500 hover:text-gray-700 py-2 transition-colors"
              >
                My Treasures
              </Link>
            ) : (
              <Link
                to="/login"
                className="block w-full text-gray-500 hover:text-gray-700 py-2 transition-colors"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};