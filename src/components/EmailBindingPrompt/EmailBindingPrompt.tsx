import React, { useState } from 'react';
import { Button } from '../ui/button';

interface EmailBindingPromptProps {
  currentEmail: string;
  isEmailVerified: boolean;
  onVerifyEmail: () => Promise<boolean>;
  onUpdateEmail: (newEmail: string) => Promise<boolean>;
  onCancel: () => void;
}

export const EmailBindingPrompt: React.FC<EmailBindingPromptProps> = ({
  currentEmail,
  isEmailVerified,
  onVerifyEmail,
  onUpdateEmail,
  onCancel,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [showEmailUpdate, setShowEmailUpdate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleVerifyEmail = async () => {
    setIsVerifying(true);
    try {
      const success = await onVerifyEmail();
      if (success) {
        // 验证成功后会自动更新用户状态，组件会重新渲染
      } else {
        alert('邮箱验证失败，请稍后重试');
      }
    } catch (error) {
      console.error('邮箱验证错误:', error);
      alert('邮箱验证出现错误');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      alert('请输入新的邮箱地址');
      return;
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      alert('请输入有效的邮箱格式');
      return;
    }

    setIsUpdating(true);
    try {
      const success = await onUpdateEmail(newEmail);
      if (success) {
        setNewEmail('');
        setShowEmailUpdate(false);
        alert('邮箱更新成功，请查收验证邮件');
      } else {
        alert('邮箱更新失败，请稍后重试');
      }
    } catch (error) {
      console.error('邮箱更新错误:', error);
      alert('邮箱更新出现错误');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    const maskedUsername = username.slice(0, 2) + '***' + username.slice(-1);
    return `${maskedUsername}@${domain}`;
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-md mx-auto">
      {!isEmailVerified ? (
        <>
          {/* 未验证邮箱提示 */}
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              🔐 需要验证绑定邮箱
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              为了您的资金安全，提现前需要验证您的绑定邮箱
            </p>
          </div>

          {/* 当前邮箱信息 */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <span className="text-gray-600">📧</span>
              <div className="flex-1">
                <div className="text-sm text-gray-600">当前绑定邮箱</div>
                <div className="font-medium text-gray-900">{formatEmail(currentEmail)}</div>
              </div>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                未验证
              </span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleVerifyEmail}
              disabled={isVerifying}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  发送验证中...
                </>
              ) : (
                '📧 发送验证邮件'
              )}
            </Button>

            <button
              onClick={() => setShowEmailUpdate(!showEmailUpdate)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showEmailUpdate ? '取消更换邮箱' : '🔄 更换绑定邮箱'}
            </button>
          </div>

          {/* 更换邮箱表单 */}
          {showEmailUpdate && (
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3">更换绑定邮箱</h3>
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="输入新的邮箱地址"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <Button
                  onClick={handleUpdateEmail}
                  disabled={isUpdating || !newEmail}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  {isUpdating ? '更新中...' : '确认更换'}
                </Button>
              </div>
            </div>
          )}

          {/* 提示信息 */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 mt-0.5">💡</span>
              <div className="text-sm text-blue-800 space-y-1">
                <div className="font-medium">邮箱验证说明</div>
                <div>• 验证邮件将发送到您的绑定邮箱</div>
                <div>• 验证后即可正常使用提现功能</div>
                <div>• 如需更换邮箱，新邮箱也需要重新验证</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* 已验证状态 */}
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              ✅ 邮箱验证完成
            </h2>
            <p className="text-green-600 text-sm mb-4">
              您的邮箱已验证，可以继续提现操作
            </p>
          </div>
        </>
      )}

      {/* 底部操作 */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          返回
        </Button>
      </div>
    </div>
  );
};