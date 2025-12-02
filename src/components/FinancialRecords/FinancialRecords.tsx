import React, { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { exportFinancialRecordsToCSV, generateFinancialSummary } from "../../utils/exportUtils";

// 财务记录类型定义
export interface FinancialRecord {
  id: string;
  type: 'income' | 'expense' | 'withdrawal';
  amount: number;
  currency: 'USDC' | 'USD';
  description: string;
  category: string;
  date: string;
  time: string;
  status: 'completed' | 'pending' | 'failed';
  relatedContent?: string; // 关联的文章标题等
  transactionId?: string;
  fee?: number; // 手续费
}

interface FinancialRecordsProps {
  records?: FinancialRecord[];
  onExport?: () => void;
}

// 模拟数据
const mockRecords: FinancialRecord[] = [
  {
    id: '1',
    type: 'income',
    amount: 45.80,
    currency: 'USDC',
    description: '文章收益分成',
    category: '创作收益',
    date: '2024-11-28',
    time: '14:23',
    status: 'completed',
    relatedContent: '《区块链技术深度解析》',
    transactionId: 'TXN_001'
  },
  {
    id: '2',
    type: 'income',
    amount: 32.50,
    currency: 'USDC',
    description: '策展收益',
    category: '策展收益',
    date: '2024-11-28',
    time: '11:45',
    status: 'completed',
    relatedContent: '推荐优质内容',
    transactionId: 'TXN_002'
  },
  {
    id: '3',
    type: 'withdrawal',
    amount: 156.50,
    currency: 'USDC',
    description: '提现到钱包',
    category: '提现',
    date: '2024-11-27',
    time: '16:20',
    status: 'completed',
    transactionId: 'WD_001',
    fee: 1.00
  },
  {
    id: '4',
    type: 'expense',
    amount: 1.00,
    currency: 'USDC',
    description: '提现手续费',
    category: '手续费',
    date: '2024-11-27',
    time: '16:20',
    status: 'completed',
    transactionId: 'FEE_001'
  },
  {
    id: '5',
    type: 'income',
    amount: 67.20,
    currency: 'USDC',
    description: '内容打赏收益',
    category: '打赏收益',
    date: '2024-11-26',
    time: '09:15',
    status: 'completed',
    relatedContent: '《Web3未来趋势分析》',
    transactionId: 'TXN_003'
  },
  {
    id: '6',
    type: 'income',
    amount: 89.30,
    currency: 'USDC',
    description: '月度活跃奖励',
    category: '平台奖励',
    date: '2024-11-25',
    time: '00:01',
    status: 'completed',
    transactionId: 'RWD_001'
  },
  {
    id: '7',
    type: 'withdrawal',
    amount: 234.20,
    currency: 'USDC',
    description: '提现到钱包',
    category: '提现',
    date: '2024-11-24',
    time: '14:30',
    status: 'completed',
    transactionId: 'WD_002',
    fee: 1.00
  },
  {
    id: '8',
    type: 'expense',
    amount: 1.00,
    currency: 'USDC',
    description: '提现手续费',
    category: '手续费',
    date: '2024-11-24',
    time: '14:30',
    status: 'completed',
    transactionId: 'FEE_002'
  }
];

export const FinancialRecords: React.FC<FinancialRecordsProps> = ({
  records = mockRecords,
  onExport
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense' | 'withdrawal'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [searchTerm, setSearchTerm] = useState('');

  // 筛选和搜索逻辑
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // 类型筛选
      if (activeFilter !== 'all' && record.type !== activeFilter) {
        return false;
      }

      // 搜索筛选
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          record.description.toLowerCase().includes(searchLower) ||
          record.category.toLowerCase().includes(searchLower) ||
          (record.relatedContent && record.relatedContent.toLowerCase().includes(searchLower)) ||
          record.transactionId?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    }).sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());
  }, [records, activeFilter, searchTerm]);

  // 统计信息
  const stats = useMemo(() => {
    const totalIncome = records
      .filter(r => r.type === 'income' && r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalExpense = records
      .filter(r => r.type === 'expense' && r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalWithdrawal = records
      .filter(r => r.type === 'withdrawal' && r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0);

    return { totalIncome, totalExpense, totalWithdrawal };
  }, [records]);

  // 获取类型图标和颜色
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'income':
        return { icon: '📈', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
      case 'expense':
        return { icon: '💸', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
      case 'withdrawal':
        return { icon: '🏦', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
      default:
        return { icon: '📄', color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
    }
  };

  // 获取状态信息
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { text: '已完成', color: 'text-green-600', dot: 'bg-green-500' };
      case 'pending':
        return { text: '处理中', color: 'text-yellow-600', dot: 'bg-yellow-500 animate-pulse' };
      case 'failed':
        return { text: '失败', color: 'text-red-600', dot: 'bg-red-500' };
      default:
        return { text: '未知', color: 'text-gray-600', dot: 'bg-gray-500' };
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USDC') => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  // 处理导出
  const handleExport = () => {
    try {
      exportFinancialRecordsToCSV(filteredRecords);
      // 同时在控制台显示摘要
      console.log(generateFinancialSummary(filteredRecords));
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-6"
      data-financial-records
    >
      {/* 标题和操作栏 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">📊 财务记录</h3>
          <p className="text-sm text-gray-600">完整的收益、支出和提现记录</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              handleExport();
              onExport?.();
            }}
            className="px-4 py-2 text-sm"
          >
            📥 导出记录
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600">📈</span>
            <span className="text-sm font-medium text-green-800">总收益</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {formatCurrency(stats.totalIncome)}
          </div>
          <div className="text-xs text-green-600 mt-1">累计收入</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-600">🏦</span>
            <span className="text-sm font-medium text-blue-800">总提现</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {formatCurrency(stats.totalWithdrawal)}
          </div>
          <div className="text-xs text-blue-600 mt-1">已提现金额</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-orange-600">💸</span>
            <span className="text-sm font-medium text-orange-800">总支出</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {formatCurrency(stats.totalExpense)}
          </div>
          <div className="text-xs text-orange-600 mt-1">手续费等</div>
        </div>
      </div>

      {/* 筛选和搜索栏 */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          {(['all', 'income', 'expense', 'withdrawal'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeFilter === filter
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {filter === 'all' && '📋 全部'}
              {filter === 'income' && '📈 收益'}
              {filter === 'expense' && '💸 支出'}
              {filter === 'withdrawal' && '🏦 提现'}
            </button>
          ))}
        </div>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索交易记录、描述、交易ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <svg className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 记录列表 */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📝</div>
            <h4 className="text-lg font-medium mb-2">暂无记录</h4>
            <p className="text-sm">
              {searchTerm ? '没有找到匹配的记录，试试其他关键词' : '还没有任何财务记录'}
            </p>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const typeInfo = getTypeInfo(record.type);
            const statusInfo = getStatusInfo(record.status);

            return (
              <div
                key={record.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${typeInfo.bgColor} ${typeInfo.borderColor} hover:scale-[1.01]`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* 类型图标 */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${typeInfo.bgColor} border-2 ${typeInfo.borderColor}`}>
                    <span className="text-xl">{typeInfo.icon}</span>
                  </div>

                  {/* 交易信息 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-gray-900">{record.description}</h4>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                        {record.category}
                      </span>
                    </div>

                    {record.relatedContent && (
                      <div className="text-sm text-gray-600 mb-1">
                        关联: {record.relatedContent}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📅 {record.date} {record.time}</span>
                      {record.transactionId && (
                        <span className="font-mono">🔗 {record.transactionId}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 金额和状态 */}
                <div className="text-right">
                  <div className={`text-lg font-bold ${typeInfo.color} mb-1`}>
                    {record.type === 'expense' ? '-' : '+'}
                    {formatCurrency(record.amount, record.currency)}
                  </div>

                  {record.fee && (
                    <div className="text-xs text-red-600 mb-1">
                      手续费: {formatCurrency(record.fee)}
                    </div>
                  )}

                  <div className="flex items-center gap-1 justify-end">
                    <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></span>
                    <span className={`text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 显示统计信息 */}
      {filteredRecords.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
          显示 {filteredRecords.length} 条记录
          {activeFilter !== 'all' && (
            <span className="ml-2">
              · 筛选条件: {activeFilter === 'income' ? '收益' : activeFilter === 'expense' ? '支出' : '提现'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};