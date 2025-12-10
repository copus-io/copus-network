import React, { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { useToast } from "../../../../components/ui/toast";
import { WithdrawalModal } from "../../../../components/WithdrawalModal";
import { EmailVerificationModal } from "../../../../components/EmailVerificationModal";
import { WalletBindEmailModal } from "../../../../components/WalletBindEmailModal";
import { useUserBalance } from "../../../../hooks/useUserBalance";

// Interface for displaying formatted transaction data
interface DisplayTransaction {
  id: string;
  type: string;
  description?: string;
  amount: string;
  status: string;
  date: string;
  isPositive?: boolean;
}

export const IncomeDetailsSection = (): JSX.Element => {
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showWalletBindEmail, setShowWalletBindEmail] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [withdrawalData, setWithdrawalData] = useState<{
    amount: string;
    toAddress: string;
    network: string;
    chainId: number;
  } | null>(null);

  const { accountInfo, transactions, loading, error, refreshData } = useUserBalance();
  const { showToast } = useToast();

  // 获取钱包地址
  const getWalletAddress = async (): Promise<string> => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });
        if (accounts.length > 0) {
          return accounts[0];
        }
        // 如果没有连接的账户，请求连接
        const requestAccounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        return requestAccounts[0] || '';
      } catch (error) {
        console.error('Failed to get wallet address:', error);
        return '';
      }
    }
    return '';
  };

  // 转换交易数据格式用于显示
  const formatTransactionForDisplay = (transaction: any): DisplayTransaction => {
    // 根据交易类型判断是否为正值
    const isPositive = transaction.transactionType === 1; // 1为流入

    // 根据交易类型显示不同的标题
    const getTransactionTitle = (type: number) => {
      switch (type) {
        case 1:
          return "Curation income";
        case 2:
          return "Withdraw";
        default:
          return "Transaction";
      }
    };

    // 格式化日期
    const formatDate = (timestamp: number) => {
      const date = new Date(timestamp);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '.');
    };

    return {
      id: transaction.id.toString(),
      type: getTransactionTitle(transaction.transactionType),
      description: transaction.description || '',
      amount: `${isPositive ? '+' : '-'}${transaction.amount}USDC`,
      status: transaction.status === 0 ? "Completed" : "Pending",
      date: formatDate(transaction.createdAt),
      isPositive
    };
  };

  // 移除静态示例数据，现在使用真实API数据和空状态

  // 检查用户是否已经绑定了邮箱
  const hasEmail = accountInfo?.email && accountInfo.email.trim().length > 0;

  // 添加调试日志
  console.log('📧 Email check debug:', {
    accountInfo,
    email: accountInfo?.email,
    hasEmail,
    loading
  });

  const handleWithdrawClick = async () => {
    try {
      // 首先获取钱包地址
      const address = await getWalletAddress();
      if (!address) {
        showToast('Please connect your wallet first', 'error');
        return;
      }
      setWalletAddress(address);

      // 检查用户是否已经绑定了邮箱
      if (!hasEmail) {
        // 如果用户还没有绑定邮箱，显示绑定邮箱模态框
        setShowWalletBindEmail(true);
      } else {
        // 如果已经绑定了邮箱，直接显示提现模态框
        setShowWithdrawalModal(true);
      }
    } catch (error) {
      console.error('Failed to initiate withdrawal:', error);
      showToast('Failed to connect wallet, please try again', 'error');
    }
  };

  const handleBindEmailClick = async () => {
    try {
      // 首先获取钱包地址
      const address = await getWalletAddress();
      if (!address) {
        showToast('Please connect your wallet first', 'error');
        return;
      }
      setWalletAddress(address);

      // 显示绑定邮箱模态框
      setShowWalletBindEmail(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      showToast('Failed to connect wallet, please try again', 'error');
    }
  };

  const handleWalletEmailBound = async () => {
    setShowWalletBindEmail(false);
    // 邮箱绑定成功后，刷新用户账户信息获取最新的邮箱数据
    await refreshData();
    // 然后显示提现模态框
    setShowWithdrawalModal(true);
  };

  const handleVerifyEmail = (data: { amount: string; toAddress: string; network: string; chainId: number }) => {
    setWithdrawalData(data);
    setShowWithdrawalModal(false);
    setShowEmailVerification(true);
  };

  const handleEmailVerified = () => {
    setShowEmailVerification(false);
    setWithdrawalData(null);
    // 提现申请成功，刷新余额和交易历史
    refreshData();
    console.log("Withdrawal request submitted successfully");
  };

  return (
    <section className="flex flex-col items-center pl-[60px] pr-0 py-0 relative flex-1 grow">
      {/* Stats Cards */}
      <div className="flex items-center gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
        {/* Total Income Card */}
        <div className="flex flex-col items-center gap-5 p-5 relative flex-1 self-stretch grow rounded-[15px] bg-white/80 backdrop-blur-sm border border-gray-200">
          <div className="flex h-[25px] items-center gap-[3px] relative self-stretch w-full">
            <h2 className="relative w-fit mt-[-1.00px] text-lg font-medium text-gray-600">
              Total income
            </h2>
          </div>

          <div className="items-start gap-[5px] pt-0 pb-2.5 px-0 self-stretch w-full flex-[0_0_auto] flex relative">
            {loading ? (
              <div className="flex items-center justify-center w-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <p className="relative flex items-center justify-center w-fit mt-[-1.00px] font-semibold text-2xl text-gray-900">
                {accountInfo?.totalIncome || '0'} USDC
              </p>
            )}
          </div>
        </div>

        {/* Withdrawable Amount Card */}
        <div className="flex-col items-center justify-center gap-5 px-5 py-[30px] flex-1 grow rounded-[15px] bg-white/80 backdrop-blur-sm border border-gray-200 flex relative">
          <div className="flex items-start relative self-stretch w-full flex-[0_0_auto]">
            <h2 className="relative w-fit mt-[-1.00px] text-lg font-medium text-gray-600">
              Withdraw-able amount
            </h2>
          </div>

          <div className="flex items-center justify-between pt-0 pb-2.5 px-0 relative self-stretch w-full flex-[0_0_auto]">
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            ) : (
              <p className="relative flex items-center justify-center w-fit mt-[-1.00px] font-semibold text-2xl text-gray-900">
                {accountInfo?.balance || '0'} USDC
              </p>
            )}

            {hasEmail ? (
              <Button
                onClick={handleWithdrawClick}
                variant="outline"
                size="sm"
                className="bg-transparent border-blue-500 text-blue-500 hover:bg-blue-50"
                disabled={loading}
              >
                Withdraw
              </Button>
            ) : (
              <Button
                onClick={handleBindEmailClick}
                variant="outline"
                size="sm"
                className="bg-transparent border-orange-500 text-orange-500 hover:bg-orange-50"
                disabled={loading}
              >
                Bind Email
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="flex items-center gap-[5px] pl-5 pr-0 pt-[30px] pb-2.5 relative self-stretch w-full flex-[0_0_auto]">
        <h2 className="relative w-fit mt-[-1.00px] text-lg font-medium text-gray-900">
          History
        </h2>
      </div>

      {/* History Table Header */}
      <div className="flex items-start gap-[60px] px-5 py-[5px] relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-gray-100">
        <div className="relative flex items-start w-[440px] mt-[-1.00px] font-normal text-gray-600 text-sm">
          Description
        </div>
        <div className="relative flex items-start w-[117px] mt-[-1.00px] font-normal text-gray-600 text-sm">
          Amount
        </div>
        <div className="relative flex items-start w-[180px] mt-[-1.00px] font-normal text-gray-600 text-sm">
          Status
        </div>
        <div className="relative flex items-start w-[119px] mt-[-1.00px] font-normal text-gray-600 text-sm">
          Date
        </div>
      </div>

      {/* History Items */}
      <div className="w-full bg-white rounded-[15px] border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load transaction history</h3>
            <p className="text-gray-600 mb-4 max-w-md">
              We couldn't retrieve your transaction history. Please check your connection and try again.
            </p>
            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              Try Again
            </Button>
          </div>
        ) : transactions.length > 0 ? (
          /* Real Transaction Data */
          transactions.map((transaction) => {
            const item = formatTransactionForDisplay(transaction);
            return (
              <article
                key={item.id}
                className="flex items-center gap-[60px] p-5 relative self-stretch w-full flex-[0_0_auto] min-h-[100px] border-b border-gray-100 last:border-b-0"
              >
                <div className="flex flex-col w-[440px] items-start justify-center gap-[5px] relative self-stretch">
                  <h3 className="relative w-fit mt-[-1.00px] font-medium text-gray-900 text-xl">
                    {item.type}
                  </h3>
                  {item.description && (
                    <p className="relative self-stretch font-normal text-gray-600 text-base">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex w-[117px] items-center gap-[5px] relative">
                  <span
                    className={`relative flex items-center justify-center w-fit mt-[-1.00px] font-medium text-lg ${
                      item.isPositive ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    {item.amount}
                  </span>
                </div>

                <div className="flex flex-col w-[180px] items-start justify-center gap-2.5 relative self-stretch">
                  <span className="relative flex items-center justify-center w-fit font-normal text-gray-900 text-lg text-right">
                    {item.status}
                  </span>
                </div>

                <time className="relative flex items-center justify-center w-fit text-gray-600 text-sm">
                  {item.date}
                </time>
              </article>
            );
          })
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">No transactions yet</h3>
            <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
              You haven't made any transactions yet. When you earn income from content curation or make withdrawals, they will appear here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {/* Navigate to treasury or discovery */}}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                Start Curating
              </Button>
              {hasEmail && (
                <Button
                  onClick={handleWithdrawClick}
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  Test Withdrawal
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        onVerifyEmail={handleVerifyEmail}
        withdrawableAmount={accountInfo ? `${accountInfo.balance} USDC` : "0 USDC"}
        network="Base Sepolia"
        walletAddress=""
        minimumAmount="10USD"
        serviceFee="1USD"
        chainId={84532}
        assetName="USDC"
      />

      <EmailVerificationModal
        isOpen={showEmailVerification}
        onClose={() => {
          setShowEmailVerification(false);
          setWithdrawalData(null);
        }}
        email="user@gmail.com"
        onVerified={handleEmailVerified}
        withdrawalData={withdrawalData}
        chainId={84532}
        assetName="USDC"
      />

      <WalletBindEmailModal
        isOpen={showWalletBindEmail}
        onClose={() => setShowWalletBindEmail(false)}
        onSuccess={handleWalletEmailBound}
        walletAddress={walletAddress}
      />
    </section>
  );
};