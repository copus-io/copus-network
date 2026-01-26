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
      console.log('🔄 Fetching account info...', {
        timestamp: new Date().toISOString(),
        currentToken: localStorage.getItem('copus_token') ? 'exists' : 'missing'
      });

      const accountData = await WithdrawalService.getUserAccountInfo();

      console.log('📥 Account data received:', {
        rawData: accountData,
        hasEmail: Boolean(accountData?.email),
        emailValue: accountData?.email,
        emailType: typeof accountData?.email,
        emailLength: accountData?.email?.length || 0,
        emailTrimmedLength: accountData?.email?.trim?.()?.length || 0,
        balance: accountData?.balance,
        totalIncome: accountData?.totalIncome,
        userId: accountData?.userId,
        timestamp: new Date().toISOString()
      });

      setAccountInfo(accountData);
      setError(null);

      // 额外日志，帮助调试email状态
      const emailStatus = accountData?.email && typeof accountData.email === 'string' && accountData.email.trim().length > 0;
      console.log('📧 Email status check:', {
        emailExists: Boolean(accountData?.email),
        emailIsString: typeof accountData?.email === 'string',
        emailNotEmpty: accountData?.email ? accountData.email.trim().length > 0 : false,
        finalEmailStatus: emailStatus,
        shouldShowWithdrawButton: emailStatus
      });

    } catch (err: any) {
      console.error('获取账户信息失败:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        response: err.response
      });
      setError(err.message || '获取账户信息失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      console.log('🔄 Fetching transaction history...');
      const transactionResponse = await WithdrawalService.getTransactionHistory({
        pageIndex: 1,
        pageSize: 20,
        flowType: 0 // 获取所有类型的交易
      });

      console.log('📥 Transaction API response:', {
        fullResponse: transactionResponse,
        dataArray: transactionResponse.data,
        dataLength: transactionResponse.data?.length || 0,
        pageInfo: {
          pageIndex: transactionResponse.pageIndex,
          pageSize: transactionResponse.pageSize,
          totalCount: transactionResponse.totalCount,
          pageCount: transactionResponse.pageCount
        }
      });

      setTransactions(transactionResponse.data || []);
      console.log('✅ Transactions set in state:', transactionResponse.data?.length || 0, 'items');

    } catch (err: any) {
      console.error('获取交易历史失败:', err);
      console.error('Transaction fetch error details:', {
        message: err.message,
        status: err.status,
        response: err.response
      });
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