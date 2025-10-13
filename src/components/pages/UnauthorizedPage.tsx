import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { HeaderSection } from '../shared/HeaderSection/HeaderSection';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <HeaderSection isLoggedIn={false} />

      <div className="flex items-center justify-center min-h-screen pt-[120px]">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-lg">
          {/* 图标 */}
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          {/* 标题 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            需要登录才能访问
          </h1>

          {/* 描述 */}
          <p className="text-gray-600 mb-6">
            这个页面需要登录后才能查看。请先登录您的账户，开启您的 Copus 探索之旅。
          </p>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-red hover:bg-red/90 text-white py-3 rounded-lg transition-colors"
            >
              立即登录
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/signup')}
              className="w-full border-red text-red hover:bg-red/5 py-3 rounded-lg transition-colors"
            >
              注册新账户
            </Button>

            <Link
              to="/discovery"
              className="block w-full text-gray-500 hover:text-gray-700 py-2 transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};