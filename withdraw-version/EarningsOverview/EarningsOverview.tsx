import React, { useState } from "react";
import { Button } from "../ui/button";
import { WithdrawModal } from "../WithdrawModal/WithdrawModal";

export interface EarningsData {
  totalEarnings: number;
  availableBalance: number;
  pendingAmount: number;
  withdrawnAmount: number;
  lastWithdrawDate?: string;
}

interface EarningsOverviewProps {
  earnings: EarningsData;
  walletAddress?: string;
  onWithdraw?: (amount: number, walletAddress: string) => void;
}

export const EarningsOverview: React.FC<EarningsOverviewProps> = ({
  earnings,
  walletAddress,
  onWithdraw
}) => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [animatedEarnings, setAnimatedEarnings] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingAmount: 0
  });

  // 数字动画效果
  React.useEffect(() => {
    const duration = 1500; // 1.5秒动画
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 使用缓动函数创建平滑动画
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedEarnings({
        totalEarnings: earnings.totalEarnings * easeOut,
        availableBalance: earnings.availableBalance * easeOut,
        pendingAmount: earnings.pendingAmount * easeOut
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [earnings]);

  const handleWithdrawClick = () => {
    setShowWithdrawModal(true);
  };

  const handleConfirmWithdraw = (amount: number, address: string, network: string, currency: string) => {
    onWithdraw?.(amount, address);
    setShowWithdrawModal(false);
  };

  // 模拟钱包连接功能
  const handleWalletSelect = async (walletId: string) => {
    console.log('连接钱包:', walletId);
    // 这里可以添加实际的钱包连接逻辑
  };

  const handleDisconnectWallet = () => {
    console.log('断开钱包连接');
    // 这里可以添加实际的钱包断开逻辑
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} USDC`;
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6 mb-6">
      {/* 头部标题 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-h-4 font-[number:var(--h-4-font-weight)] text-off-black text-[length:var(--h-4-font-size)] tracking-[var(--h-4-letter-spacing)] leading-[var(--h-4-line-height)]">
          💰 我的收益
        </h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-sm text-gray-600">实时更新</span>
        </div>
      </div>

      {/* 主要收益卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* 总收益 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 group">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-600 group-hover:animate-pulse">📊</span>
            <span className="text-sm text-blue-700 font-medium">总收益</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mb-1">
            {formatCurrency(animatedEarnings.totalEarnings)}
          </div>
          <div className="text-xs text-blue-600">累计获得收益</div>
        </div>

        {/* 可提现金额 */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 group">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600 group-hover:animate-bounce">💸</span>
            <span className="text-sm text-green-700 font-medium">可提现</span>
          </div>
          <div className="text-2xl font-bold text-green-900 mb-1">
            {formatCurrency(animatedEarnings.availableBalance)}
          </div>
          <div className="text-xs text-green-600">可立即提现</div>
        </div>

        {/* 待结算金额 */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 group">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-600 group-hover:animate-spin">⏳</span>
            <span className="text-sm text-yellow-700 font-medium">待结算</span>
          </div>
          <div className="text-2xl font-bold text-yellow-900 mb-1">
            {formatCurrency(animatedEarnings.pendingAmount)}
          </div>
          <div className="text-xs text-yellow-600">7天后可提现</div>
        </div>
      </div>

      {/* 钱包信息和提现按钮 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">🔗</span>
            <span className="text-sm text-gray-700">钱包地址</span>
          </div>
          <div className="text-sm text-gray-900 font-mono bg-white px-3 py-1 rounded border">
            {walletAddress ?
              `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` :
              '未绑定钱包'
            }
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-gray-600">可提现金额</div>
            <div className="text-lg font-semibold text-green-600 transition-all duration-200">
              {formatCurrency(earnings.availableBalance)}
            </div>
            <div className="text-xs text-green-500">免手续费提现 🎉</div>
          </div>

          <Button
            onClick={handleWithdrawClick}
            disabled={earnings.availableBalance <= 0}
            className="h-12 px-8 py-3 bg-gradient-to-r from-red to-red/90 hover:from-red/90 hover:to-red text-white rounded-[100px] font-medium transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            💸 提现
          </Button>
        </div>
      </div>

      {/* 收益分配说明 */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 mt-0.5">ℹ️</span>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-2">收益分配规则</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>• 创作者收益：45%（您的创作收入）</div>
              <div>• 策展人收益：45%（平台代管分配）</div>
              <div>• 平台服务费：10%（维护运营成本）</div>
              <div className="pt-1 border-t border-blue-200 text-green-700">• 提现免手续费 🎉</div>
            </div>
          </div>
        </div>
      </div>

      {/* 提现弹窗 */}
      {showWithdrawModal && (
        <WithdrawModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          availableBalance={earnings.availableBalance}
          walletAddress={walletAddress}
          onConfirm={handleConfirmWithdraw}
          onWalletSelect={handleWalletSelect}
          onDisconnectWallet={handleDisconnectWallet}
          isWalletConnected={!!walletAddress}
        />
      )}
    </div>
  );
};