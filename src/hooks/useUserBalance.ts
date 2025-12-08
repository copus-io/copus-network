import { useState, useEffect } from 'react';
import { WithdrawalService, UserAccountInfo, TransactionHistory, TransactionHistoryResponse } from '../services/withdrawalService';

export const useUserBalance = () => {
  const [accountInfo, setAccountInfo] = useState<UserAccountInfo | null>(null);
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccountInfo = async () => {
    try {
      setLoading(true);
      const accountData = await WithdrawalService.getUserAccountInfo();
      setAccountInfo(accountData);
      setError(null);
    } catch (err: any) {
      console.error('获取账户信息失败:', err);
      setError(err.message || '获取账户信息失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const transactionResponse = await WithdrawalService.getTransactionHistory({
        pageIndex: 1,
        pageSize: 20,
        flowType: 0 // 获取所有类型的交易
      });
      setTransactions(transactionResponse.data);
    } catch (err: any) {
      console.error('获取交易历史失败:', err);
      // 不设置error，因为交易历史失败不应该阻止余额显示
    }
  };

  const refreshData = async () => {
    await Promise.all([fetchAccountInfo(), fetchTransactions()]);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return {
    accountInfo,
    transactions,
    loading,
    error,
    refreshData
  };
};