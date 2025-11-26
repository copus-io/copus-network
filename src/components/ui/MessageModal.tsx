import React, { useState } from "react";
import { Button } from "./button";
import { useUser } from "../../contexts/UserContext";
import { useToast } from "./toast";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientUser: {
    id: string;
    username: string;
    namespace: string;
    avatar: string;
  };
}

export const MessageModal = ({ isOpen, onClose, recipientUser }: MessageModalProps): JSX.Element | null => {
  const { user } = useUser();
  const { showToast } = useToast();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async () => {
    if (!user) {
      showToast('请先登录', 'error');
      return;
    }

    if (!message.trim()) {
      showToast('请输入消息内容', 'warning');
      return;
    }

    setIsSending(true);

    try {
      // 模拟发送私信
      await new Promise(resolve => setTimeout(resolve, 1000));

      showToast(`私信已发送给 ${recipientUser.username}`, 'success');
      setMessage("");
      onClose();
    } catch (error) {
      showToast('发送失败，请重试', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-[10px] shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#F0F0F0]">
          <div className="flex items-center space-x-3">
            <img
              src={recipientUser.avatar}
              alt={recipientUser.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-[#333333] text-lg">
                发送私信
              </h3>
              <p className="text-sm text-[#666666]">
                给 {recipientUser.username}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#999999] hover:text-[#666666] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#333333] mb-2">
              消息内容
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入你想说的话..."
              className="w-full h-32 px-3 py-2 border border-[#E5E5E5] rounded-[6px] text-[#333333] placeholder-[#CCCCCC] resize-none focus:border-[#1a73e8] focus:outline-none focus:ring-1 focus:ring-[#1a73e8] transition-colors"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-[#999999]">
                {message.length}/500
              </span>
              {message.length > 450 && (
                <span className="text-xs text-[#F59E0B]">
                  字数即将达到上限
                </span>
              )}
            </div>
          </div>

          {/* Quick Templates */}
          <div className="mb-6">
            <p className="text-sm font-medium text-[#333333] mb-2">快捷模板</p>
            <div className="flex flex-wrap gap-2">
              {[
                "你好，很高兴认识你！",
                "想和你交流一下关于...",
                "看了你的文章，很有启发",
                "希望能够互相关注学习"
              ].map((template, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(template)}
                  className="px-3 py-1 bg-[#F5F5F5] text-[#666666] text-xs rounded-[4px] hover:bg-[#E5E5E5] hover:text-[#1a73e8] transition-colors"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-[#F5F5F5] text-[#666666] hover:bg-[#EEEEEE] py-2 rounded-[6px] font-medium transition-colors"
            >
              取消
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
              className="flex-1 bg-[#1a73e8] text-white hover:bg-[#1557b0] disabled:bg-[#CCCCCC] disabled:cursor-not-allowed py-2 rounded-[6px] font-medium transition-colors"
            >
              {isSending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>发送中...</span>
                </div>
              ) : (
                "发送私信"
              )}
            </Button>
          </div>

          {/* Privacy Notice */}
          <div className="mt-4 p-3 bg-[#F5F5F5] rounded-[6px]">
            <p className="text-xs text-[#666666] flex items-start space-x-2">
              <svg className="w-4 h-4 text-[#999999] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                请友善交流，遵守社区规范。私信内容会被加密保护，但恶意内容可能被举报。
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};