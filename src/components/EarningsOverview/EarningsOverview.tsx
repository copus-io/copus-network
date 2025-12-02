import React, { useState } from "react";
import { Button } from "../ui/button";
import { WithdrawModal } from "../WithdrawModal/WithdrawModal";
import { useUser } from "../../contexts/UserContext";

export interface EarningsData {
  totalEarnings: number;
  availableBalance: number;
  withdrawnAmount: number;
  lastWithdrawDate?: string;
}

// 交易记录类型定义
interface TransactionRecord {
  id: string;
  type: string;
  amount: string;
  status: string;
  time: string;
  icon: string;
  color: string;
  category: 'income' | 'expense';
}

interface EarningsOverviewProps {
  earnings: EarningsData;
  walletAddress?: string;
  onWithdraw?: (amount: number, walletAddress: string) => void;
  onViewRecords?: () => void; // 新增：查看记录回调
}

export const EarningsOverview: React.FC<EarningsOverviewProps> = ({
  earnings,
  walletAddress,
  onWithdraw,
  onViewRecords
}) => {

  // 完整的交易数据（收益 + 支出）
  const allTransactions: TransactionRecord[] = [
    { id: '1', type: '策展收益', amount: '+89.50', status: '已完成', time: '2024-11-28 14:23', icon: '🎯', color: 'text-green-600', category: 'income' },
    { id: '2', type: '策展收益', amount: '+73.20', status: '已完成', time: '2024-11-28 11:45', icon: '🎯', color: 'text-green-600', category: 'income' },
    { id: '3', type: '提现', amount: '-156.50', status: '已完成', time: '2024-11-27 16:20', icon: '🏦', color: 'text-red-600', category: 'expense' },
    { id: '4', type: '手续费', amount: '-1.00', status: '已完成', time: '2024-11-27 16:20', icon: '💸', color: 'text-red-600', category: 'expense' },
    { id: '5', type: '策展收益', amount: '+67.80', status: '已完成', time: '2024-11-26 15:30', icon: '🎯', color: 'text-green-600', category: 'income' },
    { id: '6', type: '策展收益', amount: '+78.90', status: '已完成', time: '2024-11-25 09:15', icon: '🎯', color: 'text-green-600', category: 'income' },
    { id: '7', type: '提现', amount: '-89.00', status: '已完成', time: '2024-11-24 18:45', icon: '🏦', color: 'text-red-600', category: 'expense' },
    { id: '8', type: '手续费', amount: '-1.00', status: '已完成', time: '2024-11-24 18:45', icon: '💸', color: 'text-red-600', category: 'expense' }
  ];

  // 当前筛选的数据
  const [transactions, setTransactions] = useState(allTransactions);
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense'>('all');

  // 筛选交易记录
  const filterTransactions = (filterType: 'all' | 'income' | 'expense') => {
    setActiveFilter(filterType);

    if (filterType === 'all') {
      setTransactions(allTransactions);
    } else {
      setTransactions(allTransactions.filter(t => t.category === filterType));
    }
  };

  // 临时测试函数
  const testViewRecords = () => {
    console.log('🧪 测试跳转函数执行');

    // 跳转到独立的收益统计页面
    const createTestTarget = () => {
      console.log('🎯 正在打开收益统计页面...');

      // 打开新的收益统计页面
      const baseUrl = window.location.origin;
      const earningsPageUrl = `${baseUrl}/earnings-stats.html`;

      // 在新标签页打开
      const newWindow = window.open(earningsPageUrl, '_blank');

      if (newWindow) {
        console.log('✅ 已在新标签页打开收益统计页面:', earningsPageUrl);

        // 显示成功提示
        const notification = document.createElement('div');
        notification.innerHTML = '🎯 正在打开收益统计页面...';
        notification.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #3b82f6;
          color: white;
          padding: 16px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          z-index: 10000;
          pointer-events: none;
          animation: fadeInOut 2s ease-in-out forwards;
        `;

        // 添加动画
        const style = document.createElement('style');
        style.textContent = `
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            20%, 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notification);

        // 2秒后移除提示
        setTimeout(() => {
          if (notification && notification.parentElement) {
            notification.remove();
          }
          if (style && style.parentElement) {
            style.remove();
          }
        }, 2000);
      } else {
        console.warn('❌ 无法打开新窗口，可能被浏览器阻止');
        alert('🎯 收益统计页面\n\n请手动访问：' + earningsPageUrl + '\n\n或者允许此网站打开弹窗窗口。');
      }

      return newWindow;
    };

    // 尝试查找现有元素
    const selectors = [
      '[data-financial-records]',
      '[data-financial-records-test]',
      '.financial-records'
    ];

    console.log('🔍 当前页面所有元素:', document.querySelectorAll('*').length);

    let foundElement = null;
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      console.log(`🔍 选择器 "${selector}":`, element);
      if (element) {
        foundElement = element;
        break;
      }
    }

    if (foundElement) {
      console.log('✅ 找到财务记录元素，执行滚动');
      foundElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.log('🎯 未找到目标元素，创建动态跳转提示');
      createTestTarget();
    }
  };

  const { user } = useUser();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [animatedEarnings, setAnimatedEarnings] = useState({
    totalEarnings: 0,
    availableBalance: 0
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
        availableBalance: earnings.availableBalance * easeOut
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* 总收益 */}
        <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 rounded-lg p-4 hover:shadow-lg transition-all duration-300 group hover:scale-105 relative border-2 border-transparent hover:border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-600">📊</span>
            <span className="text-sm text-blue-700 font-medium">总收益</span>
            <span className="ml-auto text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full group-hover:bg-indigo-200 transition-colors">累计</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mb-1 group-hover:text-indigo-700 transition-colors">
            {formatCurrency(animatedEarnings.totalEarnings)}
          </div>
          <div className="text-xs text-blue-600">
            <span>累计获得收益</span>
          </div>
        </div>

        {/* 可提现金额 */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 hover:shadow-lg transition-all duration-300 group hover:scale-105 relative overflow-hidden">
          {/* 闪烁动画背景 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[300%] transition-transform duration-1000"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-600 group-hover:animate-bounce">💸</span>
              <span className="text-sm text-green-700 font-medium">可提现</span>
              {earnings.availableBalance >= 10 && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
            </div>
            <div className="text-2xl font-bold text-green-900 mb-1 group-hover:text-green-700 transition-colors">
              {formatCurrency(animatedEarnings.availableBalance)}
            </div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <span>可立即提现</span>
              {earnings.availableBalance >= 10 && <span className="text-emerald-600 font-medium">✓ 可提现</span>}
              {earnings.availableBalance < 10 && <span className="text-orange-600 font-medium">! 需满10USD</span>}
            </div>
          </div>
        </div>


      </div>

      {/* 提现按钮 */}
      <div className="flex items-center justify-center gap-4 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200">
        <div className="flex items-center gap-4 w-full">
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
              💰 可提现金额
              {earnings.availableBalance >= 10 && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
            </div>
            <div className="text-xl font-bold text-green-600 transition-all duration-200">
              {formatCurrency(earnings.availableBalance)}
            </div>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <span>🚀 最低10 USD，手续费1 USD</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="text-blue-600">1-3分钟到账</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleWithdrawClick}
              disabled={earnings.availableBalance < 10}
              className={`h-14 px-10 py-4 font-semibold text-lg rounded-[100px] transition-all duration-300 shadow-lg active:scale-95 relative overflow-hidden ${
                earnings.availableBalance < 10
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-red via-red-500 to-red/90 hover:from-red/90 hover:to-red text-white hover:shadow-xl hover:scale-105 group'
              }`}
            >
              {earnings.availableBalance < 10 ? (
                <span>💸 金额不足</span>
              ) : (
                <>
                  <span className="relative z-10 flex items-center gap-2">
                    💸 立即提现
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[300%] transition-transform duration-700"></div>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>


      {/* 交易记录 - 去掉所有跳转按钮 */}
      <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-gray-900">💳 交易记录</h3>

            {/* 筛选按钮组 - 保留筛选功能，去掉跳转按钮 */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => filterTransactions('all')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeFilter === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📋 全部
              </button>
              <button
                onClick={() => filterTransactions('income')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeFilter === 'income'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📈 收益
              </button>
              <button
                onClick={() => filterTransactions('expense')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeFilter === 'expense'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                💸 支出
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{tx.icon}</span>
                      <span className="font-medium text-gray-900">{tx.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-bold ${tx.color}`}>{tx.amount} USDC</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 筛选结果统计 */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {activeFilter === 'all'
                ? `显示全部 ${transactions.length} 条记录`
                : activeFilter === 'income'
                ? `显示 ${transactions.length} 条收益记录 📈`
                : `显示 ${transactions.length} 条支出记录 💸`
              }
            </span>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>收益记录</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>支出记录</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 收益分配说明 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 mt-0.5">ℹ️</span>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-2">收益分配规则</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>• 创作者收益：45%（<span className="text-orange-700 font-medium">平台代持，暂不可提现</span>）</div>
              <div>• 策展人收益：45%（<span className="text-green-700 font-medium">可提现收益</span>）</div>
              <div>• 平台服务费：10%（维护运营成本）</div>
              <div className="pt-2 border-t border-blue-200">
                <div className="text-green-700 mb-1 font-medium">
                  • <strong>当前版本</strong>：仅支持策展收益提现 ✅
                </div>
                <div className="text-gray-600 mb-1 text-xs">
                  • 活跃奖励、推荐奖励功能暂未开放
                </div>
                <div className="text-orange-700">
                  • <strong>提现规则</strong>：最低 10 USD，收取 1 USD 手续费 🔐💰
                </div>
              </div>
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