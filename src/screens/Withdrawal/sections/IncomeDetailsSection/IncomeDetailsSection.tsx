import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { useToast } from "../../../../components/ui/toast";
import { WithdrawalModal } from "../../../../components/WithdrawalModal";
import { EmailVerificationModal } from "../../../../components/EmailVerificationModal";
import { WalletBindEmailModal } from "../../../../components/WalletBindEmailModal";
// Removed useUserBalance import - now using only parent component data

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

interface IncomeDetailsSectionProps {
  userInfo?: any;
  accountInfo?: any;
  loading?: boolean;
  refreshUserInfo?: () => void;
  transactions?: any[];
}

export const IncomeDetailsSection = ({
  userInfo: propUserInfo,
  accountInfo: propAccountInfo,
  loading: propLoading,
  refreshUserInfo,
  transactions: propTransactions
}: IncomeDetailsSectionProps = {}): JSX.Element => {
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

  const { showToast } = useToast();
  const navigate = useNavigate();

  // 完全依赖父组件传递的数据，不再使用useUserBalance hook
  const userInfo = propUserInfo;
  const loading = propLoading !== undefined ? propLoading : false;
  const transactions = propTransactions || [];

  // 页面访问时的初始化，现在由父组件处理数据获取

  // 页面可见性检测现在由父组件统一处理

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
    // 调试：显示原始交易数据结构
    console.log('🔧 Formatting transaction data:', {
      originalTransaction: transaction,
      transactionType: transaction.transactionType,
      amount: transaction.amount,
      createdAt: transaction.createdAt,
      timestamp: transaction.timestamp,
      time: transaction.time,
      allFields: Object.keys(transaction)
    });

    // 根据交易类型判断是否为正值
    // 先检查实际的交易类型值
    console.log('💰 Transaction type analysis:', {
      transactionType: transaction.transactionType,
      amount: transaction.amount,
      description: transaction.description,
      rawTransaction: transaction
    });

    // 临时逻辑：根据你的描述，消费应该显示为负数
    // 让我们根据实际数据调整这个逻辑
    let isPositive;
    if (transaction.transactionType === 1) {
      // 如果 type 1 但实际是消费，应该显示负号
      isPositive = false; // 暂时改为 false 来测试
    } else if (transaction.transactionType === 2) {
      isPositive = false; // 支出
    } else {
      isPositive = true; // 其他情况默认为正
    }

    console.log('💰 Sign decision:', {
      transactionType: transaction.transactionType,
      isPositive: isPositive,
      willShowSign: isPositive ? '+' : '-'
    });

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

    // 格式化日期 - 尝试多种可能的时间戳字段
    const formatDate = (txData: any) => {
      let timestamp = txData.createdAt || txData.timestamp || txData.time || txData.createTime;

      // 如果时间戳是字符串，尝试转换
      if (typeof timestamp === 'string') {
        timestamp = Date.parse(timestamp);
      }

      // 如果时间戳太小，可能是秒而不是毫秒
      if (timestamp < 1000000000000) {
        timestamp = timestamp * 1000;
      }

      const date = new Date(timestamp);

      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '.');
    };

    // 格式化金额 - 处理可能已经包含符号的金额
    const formatAmount = (amount: any, isIncome: boolean) => {
      let numAmount = parseFloat(amount);

      // 如果金额已经是负数，取绝对值
      if (numAmount < 0) {
        numAmount = Math.abs(numAmount);
      }

      // 根据交易类型添加正确的符号
      const sign = isIncome ? '+' : '-';

      return `${sign}${numAmount}USD`;
    };

    return {
      id: transaction.id.toString(),
      type: getTransactionTitle(transaction.transactionType),
      description: transaction.description || '',
      amount: formatAmount(transaction.amount, isPositive),
      status: transaction.status === 0 ? "Completed" : "Pending",
      date: formatDate(transaction),
      isPositive
    };
  };

  // 移除静态示例数据，现在使用真实API数据和空状态

  // 基于真正的userinfo检查邮箱绑定状态
  const hasEmail = React.useMemo(() => {
    if (!userInfo) {
      console.log('📧 No userInfo available from AuthService.getUserInfo()');
      return false;
    }

    const email = userInfo.email;
    const emailExists = email && typeof email === 'string' && email.trim().length > 0;

    console.log('📧 Email binding check (from REAL userinfo):', {
      email: email,
      emailType: typeof email,
      emailLength: email ? email.length : 0,
      emailTrimmed: email ? email.trim() : '',
      emailTrimmedLength: email ? email.trim().length : 0,
      emailExists: emailExists,
      userInfo: userInfo,
      dataSource: 'AuthService.getUserInfo()',
      timestamp: new Date().toISOString()
    });

    return Boolean(emailExists);
  }, [userInfo]);

  // 强化调试日志 - 显示关键决策信息
  console.log('🚦 Button decision logic (based on REAL userinfo):', {
    hasEmail,
    loading,
    shouldShowWithdrawButton: hasEmail && !loading,
    shouldShowBindEmailButton: !hasEmail && !loading,
    userInfoExists: Boolean(userInfo),
    userInfoSource: 'parent component only',
    fullUserInfo: JSON.stringify(userInfo, null, 2)
  });

  // 调试交易列表数据
  console.log('📊 Transaction list debug:', {
    transactionsArray: transactions,
    propTransactions: propTransactions,
    // hookTransactions removed (now using parent component data),
    transactionsLength: transactions?.length || 0,
    transactionsType: typeof transactions,
    isArray: Array.isArray(transactions),
    firstTransaction: transactions?.[0],
    loading: loading,
    // error state removed (now handled by parent component),
    willShowList: !loading && transactions?.length > 0,
    willShowEmpty: !loading && (!transactions || transactions.length === 0),
    dataSource: 'parent_component'
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
      console.log('🔍 Wallet address obtained:', {
        address: address,
        length: address?.length || 0,
        isValid: address && address.length === 42 && address.startsWith('0x')
      });

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
    console.log('✅ Email binding successful, refreshing REAL userinfo...');

    try {
      // 优先使用父组件的refreshUserInfo (调用AuthService.getUserInfo)
      if (refreshUserInfo) {
        console.log('🔄 Calling refreshUserInfo from parent component (REAL userinfo API)...');
        await refreshUserInfo();
        console.log('✅ Parent refreshUserInfo completed');
      }

      // 同时刷新余额等其他数据
      console.log('🔄 Also refreshing balance and transaction data...');
      await refreshUserInfo && refreshUserInfo();
      console.log('✅ Balance data refresh completed');

      // 延迟后再次刷新确保数据同步
      setTimeout(async () => {
        if (refreshUserInfo) {
          try {
            console.log('🔄 Second refresh of REAL userinfo to ensure consistency...');
            await refreshUserInfo();
            console.log('✅ Second userinfo refresh completed');
          } catch (secondRefreshError) {
            console.warn('⚠️ Second userinfo refresh failed:', secondRefreshError);
          }
        }
      }, 2000);

      showToast('Email bound successfully! User info updated.', 'success');

    } catch (error) {
      console.error('❌ Failed to refresh user data after email binding:', error);
      showToast('Email bound, but failed to refresh user data.', 'warning');
    }
  };

  const handleVerifyEmail = (data: { amount: string; toAddress: string; network: string; chainId: number; assetName: string }) => {
    setWithdrawalData(data);
    setShowWithdrawalModal(false);
    setShowEmailVerification(true);
  };

  const handleEmailVerified = () => {
    setShowEmailVerification(false);
    setWithdrawalData(null);
    // 提现申请成功，刷新余额和交易历史
    refreshUserInfo && refreshUserInfo();
    console.log("Withdrawal request submitted successfully");
  };

  return (
    <section className="flex flex-col items-center px-4 sm:px-8 lg:pl-[60px] lg:pr-0 py-0 relative flex-1 grow">
      {/* Stats Cards */}
      <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-6 lg:gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
        {/* Total Income Card */}
        <div className="relative flex-1 grow rounded-[15px] bg-white min-w-0">
          <div className="flex flex-col items-start gap-3 sm:gap-5 px-3 sm:px-5 py-4 sm:py-[30px] w-full h-full rounded-[15px] bg-[#e0e0e0]/40">
            <h2 className="text-sm sm:text-base lg:text-lg font-medium text-gray-600">
              Total income
            </h2>

            <div className="flex items-center pb-0 sm:pb-2.5">
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500"></div>
              ) : (
                <p className="font-semibold text-lg sm:text-xl lg:text-2xl text-gray-900">
                  {propAccountInfo?.totalIncome || '0'} USD
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Withdrawable Amount Card */}
        <div className="relative flex-1 grow rounded-[15px] bg-white min-w-0">
          <div className="flex-col items-center justify-center gap-3 sm:gap-5 px-3 sm:px-5 py-4 sm:py-[30px] w-full h-full rounded-[15px] bg-[#e0e0e0]/40 flex relative">
            <div className="flex items-start relative self-stretch w-full flex-[0_0_auto]">
              <h2 className="relative w-fit mt-[-1.00px] text-sm sm:text-base lg:text-lg font-medium text-gray-600">
                Withdraw-able amount
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 pt-0 pb-0 sm:pb-2.5 px-0 relative self-stretch w-full flex-[0_0_auto]">
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500"></div>
              ) : (
                <p className="relative flex items-center justify-center w-fit mt-[-1.00px] font-semibold text-lg sm:text-xl lg:text-2xl text-gray-900">
                  {propAccountInfo?.balance || '0'} USD
                </p>
              )}

              {hasEmail ? (
                <Button
                  onClick={handleWithdrawClick}
                  className="px-3 sm:px-5 py-2 bg-red text-white rounded-[50px] hover:bg-red/90 transition-colors h-auto text-sm sm:text-base w-full sm:w-auto"
                  disabled={loading}
                >
                  Withdraw
                </Button>
              ) : (
                <Button
                  onClick={handleBindEmailClick}
                  className="px-3 sm:px-5 py-2 rounded-[50px] border border-solid border-[#f23a00] bg-transparent text-red hover:bg-red/5 transition-colors h-auto font-bold text-sm sm:text-base w-full sm:w-auto"
                  disabled={loading}
                >
                  Bind Email
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="flex items-center gap-[5px] px-3 sm:px-5 pr-0 pt-6 sm:pt-[30px] pb-2.5 relative self-stretch w-full flex-[0_0_auto]">
        <h2 className="relative w-fit mt-[-1.00px] text-base sm:text-lg font-medium text-gray-900">
          History
        </h2>
      </div>

      {/* History Table Header */}
      <div className="flex items-start gap-4 px-3 sm:px-5 py-2 sm:py-[5px] relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-gray-100">
        <div className="relative flex items-start flex-1 min-w-0 font-normal text-gray-600 text-xs sm:text-sm">
          Description
        </div>
        <div className="relative flex items-start w-20 font-normal text-gray-600 text-xs sm:text-sm">
          Amount
        </div>
        <div className="relative flex items-start w-20 font-normal text-gray-600 text-xs sm:text-sm">
          Status
        </div>
        <div className="relative flex items-start w-24 font-normal text-gray-600 text-xs sm:text-sm">
          Date
        </div>
      </div>

      {/* History Items */}
      <div className="w-full mt-4">
        {loading ? (
          <div className="flex items-center justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : transactions && transactions.length > 0 ? (
          /* Real Transaction Data */
          transactions?.map((transaction) => {
            const item = formatTransactionForDisplay(transaction);
            return (
              <article
                key={item.id}
                className="flex items-center gap-4 p-3 sm:p-5 relative self-stretch w-full flex-[0_0_auto] min-h-[80px] sm:min-h-[100px] border-b border-[#e0e0e0] last:border-b-0"
              >
                <div className="flex flex-col flex-1 min-w-0 items-start justify-center gap-1 sm:gap-[5px] relative self-stretch">
                  <h3 className="font-medium text-gray-900 text-base sm:text-lg lg:text-xl truncate max-w-full">
                    {item.type}
                  </h3>
                  {item.description && (
                    <p className="font-normal text-gray-600 text-sm sm:text-base line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex w-20 items-center justify-start">
                  <span
                    className={`font-medium text-sm sm:text-base ${
                      item.isPositive ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    {item.amount}
                  </span>
                </div>

                <div className="flex w-20 items-center justify-start">
                  <span className="font-normal text-gray-900 text-sm sm:text-base">
                    {item.status}
                  </span>
                </div>

                <div className="flex w-24 items-center justify-start">
                  <time className="text-gray-600 text-xs sm:text-sm">
                    {item.date}
                  </time>
                </div>
              </article>
            );
          })
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-6 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 sm:mb-3">No transactions yet</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 max-w-md leading-relaxed text-sm sm:text-base">
              You haven't made any transactions yet. When you earn income from content curation or make withdrawals, they will appear here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                onClick={() => navigate('/curate')}
                className="px-4 sm:px-5 py-2 bg-red text-white rounded-[50px] hover:bg-red/90 transition-colors h-auto text-sm sm:text-base w-full sm:w-auto"
              >
                Start Curating
              </Button>
              {hasEmail && (
                <Button
                  onClick={handleWithdrawClick}
                  className="px-5 py-2 rounded-[50px] border border-solid border-[#f23a00] bg-transparent text-red hover:bg-red/5 transition-colors h-auto"
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
        withdrawableAmount={propAccountInfo?.balance ? `${propAccountInfo.balance} USD` : "0 USD"}
        network="Base"
        walletAddress=""
        minimumAmount="10USD"
        serviceFee="10%"
        chainId={8453}
        assetName="USDC"
      />

      <EmailVerificationModal
        isOpen={showEmailVerification}
        onClose={() => {
          setShowEmailVerification(false);
          setWithdrawalData(null);
        }}
        email={userInfo?.email || "user@example.com"}
        onVerified={handleEmailVerified}
        withdrawalData={withdrawalData}
        chainId={8453}
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