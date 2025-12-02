import React, { useState } from "react";
import { Button } from "../ui/button";

export interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  walletAddress?: string;
  onConfirm: (amount: number, address: string, network: string, currency: string) => void;
  onWalletSelect: (walletId: string) => void;
  onDisconnectWallet: () => void;
  isWalletConnected: boolean;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  walletAddress,
  onConfirm,
  onWalletSelect,
  onDisconnectWallet,
  isWalletConnected
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [targetAddress, setTargetAddress] = useState(walletAddress || "");
  const [selectedNetwork, setSelectedNetwork] = useState("Base");
  const [selectedCurrency, setSelectedCurrency] = useState("USDC");

  if (!isOpen) return null;

  const handleConfirm = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount >= 10 && amount <= availableBalance && targetAddress) {
      onConfirm(amount, targetAddress, selectedNetwork, selectedCurrency);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">💸 提现到钱包</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* 可提现余额显示 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-700 mb-1">可提现余额</div>
            <div className="text-xl font-bold text-green-900">
              {availableBalance.toFixed(2)} USDC
            </div>
          </div>

          {/* 提现金额 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              提现金额
            </label>
            <div className="relative">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="最低 10 USDC"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="10"
                max={availableBalance}
              />
              <span className="absolute right-3 top-2 text-gray-500">USDC</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              手续费: 1 USDC，实际到账: {Math.max(0, parseFloat(withdrawAmount) - 1 || 0).toFixed(2)} USDC
            </div>
          </div>

          {/* 钱包地址 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              钱包地址
            </label>
            <input
              type="text"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              placeholder="请输入钱包地址"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 网络选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              网络
            </label>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Base">Base Network</option>
              <option value="Ethereum">Ethereum</option>
              <option value="Polygon">Polygon</option>
            </select>
          </div>

          {/* 钱包连接状态 */}
          {!isWalletConnected ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-600 mb-2">选择钱包连接</div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => onWalletSelect("metamask")}
                  className="flex items-center justify-center gap-2 py-3"
                >
                  🦊 MetaMask
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onWalletSelect("walletconnect")}
                  className="flex items-center justify-center gap-2 py-3"
                >
                  🔗 WalletConnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-700">
                已连接钱包: {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : ''}
              </div>
              <button
                onClick={onDisconnectWallet}
                className="text-xs text-blue-600 hover:underline mt-1"
              >
                断开连接
              </button>
            </div>
          )}

          {/* 提现规则说明 */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="text-sm text-orange-800">
              <div className="font-medium mb-1">⚠️ 提现规则</div>
              <div className="space-y-1">
                <div>• 最低提现金额: 10 USDC</div>
                <div>• 手续费: 1 USDC</div>
                <div>• 预计到账时间: 1-3分钟</div>
                <div>• 确认后无法撤销，请仔细检查</div>
              </div>
            </div>
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              !withdrawAmount ||
              parseFloat(withdrawAmount) < 10 ||
              parseFloat(withdrawAmount) > availableBalance ||
              !targetAddress ||
              !isWalletConnected
            }
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            确认提现
          </Button>
        </div>
      </div>
    </div>
  );
};