import React, { useState } from "react";
import { Button } from "../ui/button";
import { EmailVerification } from "../EmailVerification/EmailVerification";
import { emailVerificationService } from "../../services/emailVerificationService";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  walletAddress?: string;
  onConfirm: (amount: number, address: string, network: string, currency: string) => void;
  onWalletSelect: (walletId: string) => void;
  onDisconnectWallet: () => void;
  isWalletConnected: boolean;
  userEmail?: string; // 用户邮箱，用于验证
}

const networkOptions = [
  { value: 'xlayer', label: 'X Layer' },
  { value: 'base-mainnet', label: 'Base Mainnet' },
];

const xlayerCurrencyOptions = [
  { value: 'usdc', label: 'USDC' },
  { value: 'usdt', label: 'USDT' },
];

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  walletAddress,
  onConfirm,
  onWalletSelect,
  onDisconnectWallet,
  isWalletConnected,
  userEmail = "user@example.com", // 默认邮箱，实际应从用户状态获取
}) => {
  const [amount, setAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState(walletAddress || "");
  const [selectedNetwork, setSelectedNetwork] = useState("xlayer");
  const [selectedCurrency, setSelectedCurrency] = useState("usdc");
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [amountError, setAmountError] = useState<string>('');
  const [addressError, setAddressError] = useState<string>('');

  // 邮箱验证相关状态
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailVerificationLoading, setEmailVerificationLoading] = useState(false);
  const [pendingWithdrawData, setPendingWithdrawData] = useState<{
    amount: number;
    address: string;
    network: string;
    currency: string;
  } | null>(null);

  // 每日提现限制相关状态
  const [lastWithdrawDate, setLastWithdrawDate] = useState<string>('');
  const [canWithdrawToday, setCanWithdrawToday] = useState(true);
  const [nextWithdrawTime, setNextWithdrawTime] = useState<string>('');

  React.useEffect(() => {
    if (walletAddress) {
      setWithdrawAddress(walletAddress);
    }
  }, [walletAddress]);

  // 检查每日提现限制
  React.useEffect(() => {
    const checkDailyWithdrawLimit = () => {
      // 模拟从localStorage获取上次提现日期
      const lastWithdraw = localStorage.getItem('lastWithdrawDate');
      const today = new Date().toDateString();

      if (lastWithdraw === today) {
        setCanWithdrawToday(false);
        setLastWithdrawDate(lastWithdraw);

        // 计算下次可提现时间（明天凌晨）
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        setNextWithdrawTime(tomorrow.toLocaleString('zh-CN'));
      } else {
        setCanWithdrawToday(true);
        setLastWithdrawDate('');
        setNextWithdrawTime('');
      }
    };

    checkDailyWithdrawLimit();
  }, [isOpen]);

  // Get display currency based on network
  const displayCurrency = selectedNetwork === 'xlayer'
    ? xlayerCurrencyOptions.find(c => c.value === selectedCurrency)?.label || 'USDC'
    : 'USDC';

  // 提现费用配置
  const WITHDRAWAL_FEE = 1; // 固定手续费 1 USD
  const MIN_WITHDRAWAL_AMOUNT = 10; // 最低提现金额 10 USD

  // 计算实际到账金额 (用户输入金额 - 手续费)
  const actualReceiveAmount = amount ? Math.max(0, parseFloat(amount) - WITHDRAWAL_FEE) : 0;

  // 验证逻辑
  const isValidAmount = amount && parseFloat(amount) > 0 && parseFloat(amount) <= availableBalance;
  const isValidAddress = withdrawAddress && withdrawAddress.length > 0;
  const isMinimumAmount = amount && parseFloat(amount) >= MIN_WITHDRAWAL_AMOUNT;
  const canProcessWithdraw = canWithdrawToday && isValidAmount && isValidAddress && isMinimumAmount;

  // Close dropdown when clicking outside or pressing Escape
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isCurrencyDropdownOpen) {
        setIsCurrencyDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isCurrencyDropdownOpen) {
          setIsCurrencyDropdownOpen(false);
        } else {
          onClose();
        }
      }
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        if (!isSubmitting && isValidAmount && isValidAddress && isMinimumAmount && !amountError && !addressError) {
          handleConfirm();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCurrencyDropdownOpen, isSubmitting, isValidAmount, isValidAddress, isMinimumAmount, amountError, addressError, onClose]);

  if (!isOpen) return null;

  const handleMaxClick = () => {
    // 设置最大可提现金额（包含手续费）
    // 用户最多能提现全部余额，但需要支付1 USD手续费
    setAmount(availableBalance.toString());
  };

  // 发送邮箱验证码
  const handleSendEmailCode = async (): Promise<boolean> => {
    try {
      const result = await emailVerificationService.sendVerificationCode(userEmail);
      if (result.success) {
        console.log('验证码发送成功:', result.message);
        return true;
      } else {
        console.error('验证码发送失败:', result.message);
        return false;
      }
    } catch (error) {
      console.error('发送邮箱验证码失败:', error);
      return false;
    }
  };

  // 验证邮箱验证码
  const handleVerifyEmailCode = async (code: string): Promise<boolean> => {
    try {
      setEmailVerificationLoading(true);
      const result = await emailVerificationService.verifyCode(userEmail, code);

      if (result.success) {
        console.log('邮箱验证成功');
        // 验证成功后执行实际提现
        await executeWithdrawal();
        return true;
      } else {
        console.error('邮箱验证失败:', result.message);
        return false;
      }
    } catch (error) {
      console.error('邮箱验证出错:', error);
      return false;
    } finally {
      setEmailVerificationLoading(false);
    }
  };

  // 执行实际的提现操作
  const executeWithdrawal = async () => {
    if (!pendingWithdrawData) return;

    try {
      // 模拟提现处理延迟
      await new Promise(resolve => setTimeout(resolve, 2000));

      onConfirm(
        pendingWithdrawData.amount,
        pendingWithdrawData.address,
        pendingWithdrawData.network,
        pendingWithdrawData.currency
      );

      // 记录今日已提现
      const today = new Date().toDateString();
      localStorage.setItem('lastWithdrawDate', today);
      setCanWithdrawToday(false);
      setLastWithdrawDate(today);

      // 计算下次可提现时间
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      setNextWithdrawTime(tomorrow.toLocaleString('zh-CN'));

      // 显示成功状态
      setWithdrawSuccess(true);
      setShowEmailVerification(false);

      // 3秒后自动关闭
      setTimeout(() => {
        setWithdrawSuccess(false);
        setAmount('');
        setWithdrawAddress('');
        setPendingWithdrawData(null);
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  // 取消邮箱验证
  const handleCancelEmailVerification = () => {
    setShowEmailVerification(false);
    setPendingWithdrawData(null);
    setIsSubmitting(false);
  };




  const handleConfirm = async () => {
    setAmountError('');
    setAddressError('');

    // 提交时验证
    if (!amount || parseFloat(amount) < MIN_WITHDRAWAL_AMOUNT) {
      setAmountError(`最低提现 ${MIN_WITHDRAWAL_AMOUNT} ${displayCurrency}`);
      return;
    }

    if (parseFloat(amount) > availableBalance) {
      setAmountError('金额超过可用余额');
      return;
    }

    if (!withdrawAddress) {
      setAddressError('请输入提现地址');
      return;
    }

    if (!canProcessWithdraw) return;

    // 保存提现数据，等待邮箱验证通过后执行
    setPendingWithdrawData({
      amount: parseFloat(amount),
      address: withdrawAddress,
      network: selectedNetwork,
      currency: selectedCurrency
    });

    setIsSubmitting(true);

    // 发送邮箱验证码
    try {
      const emailSent = await handleSendEmailCode();
      if (emailSent) {
        setShowEmailVerification(true);
      } else {
        alert('发送验证码失败，请稍后重试');
      }
    } catch (error) {
      console.error('发送验证码错误:', error);
      alert('发送验证码失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="flex flex-col w-[520px] items-center gap-5 p-[30px] relative bg-white rounded-[15px]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="withdraw-title"
        aria-describedby="withdraw-description"
      >
        <button
          onClick={onClose}
          className="relative self-stretch w-full flex-[0_0_auto] cursor-pointer"
          aria-label="Close withdraw dialog"
        >
          <img
            className="w-full"
            alt=""
            src="https://c.animaapp.com/RWdJi6d2/img/close.svg"
          />
        </button>

        <div className="flex flex-col w-[518px] items-center gap-[25px] px-8 py-0 relative flex-[0_0_auto] ml-[-29.00px] mr-[-29.00px]">
          <header className="flex flex-col items-center justify-center relative self-stretch w-full flex-[0_0_auto]">
            <h1
              id="withdraw-title"
              className="relative w-fit [font-family:'Lato',Helvetica] font-semibold text-gray-900 text-2xl tracking-[0] leading-9 whitespace-nowrap"
            >
              {showEmailVerification ? "📧 邮箱验证" : "💸 提现申请"}
            </h1>
          </header>

          {/* 邮箱验证界面 */}
          {showEmailVerification && (
            <EmailVerification
              email={userEmail}
              onVerify={handleVerifyEmailCode}
              onResend={handleSendEmailCode}
              onCancel={handleCancelEmailVerification}
              isVerifying={emailVerificationLoading}
            />
          )}

          {/* 提现表单界面 */}
          {!showEmailVerification && (
          <dl className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">

              {/* Available balance display */}
              <div className="flex items-center justify-between px-4 py-[15px] relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-light-grey bg-gradient-to-r from-green-50 to-green-100 rounded-lg mb-3">
                <dt className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-green-700 text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)] font-medium">
                  可提现余额:
                </dt>
                <dd className="inline-flex items-center gap-2">
                  <span className="[font-family:'Lato',Helvetica] font-bold text-green-800 text-xl tracking-[0] leading-[28px] whitespace-nowrap">
                    {availableBalance.toFixed(2)} USDC
                  </span>
                </dd>
              </div>

              {/* Network selection */}
              <div className="flex items-center justify-between px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-light-grey">
                <dt className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-gray-700 text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
                  网络:
                </dt>
                <dd className="inline-flex items-center gap-2">
                  {networkOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSelectedNetwork(option.value);
                        if (option.value !== 'xlayer') {
                          setSelectedCurrency('usdc'); // Base只支持USDC
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all [font-family:'Lato',Helvetica] text-sm border-2 ${
                        selectedNetwork === option.value
                          ? 'bg-[#0052ff] text-white font-medium border-[#0052ff]'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </dd>
              </div>

              {/* Withdraw address - Primary input method */}
              <div className="flex flex-col px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-light-grey">
                <div className="flex items-center justify-between mb-3">
                  <dt className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-gray-700 text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
                    提现地址:
                  </dt>
                </div>
                <dd className="w-full">
                  <div className="relative">
                    <textarea
                      value={withdrawAddress}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s+/g, ''); // Remove all spaces
                        setWithdrawAddress(value);

                        // Real-time address format validation
                        if (value && !/^0x[a-fA-F0-9]{40}$/.test(value)) {
                          setAddressError('请输入有效的钱包地址 (0x开头的42位地址)');
                        } else {
                          setAddressError('');
                        }
                      }}
                      placeholder="请输入完整的钱包地址\n例如: 0x1234567890123456789012345678901234567890"
                      className={`w-full text-sm border-2 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 font-mono min-h-[100px] overflow-auto ${
                        addressError ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 bg-white focus:shadow-lg'
                      }`}
                      rows={4}
                      autoComplete="off"
                      spellCheck={false}
                      onFocus={() => setAddressError('')}
                      style={{
                        wordBreak: 'break-all',
                        lineHeight: '1.6',
                        wordWrap: 'break-word',
                        letterSpacing: '0.5px',
                        fontSize: '12px',
                        fontFamily: 'Monaco, "SF Mono", "Consolas", "Courier New", monospace',
                        padding: '16px',
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                        textAlign: 'left',
                        direction: 'ltr'
                      }}
                      title={withdrawAddress ? `完整地址: ${withdrawAddress}` : '请输入完整的钱包地址'}
                    />
                  </div>
                  {addressError && (
                    <p className="text-red-600 text-xs mt-2 flex items-center gap-1 animate-pulse">
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {addressError}
                    </p>
                  )}
                  {!addressError && withdrawAddress && /^0x[a-fA-F0-9]{40}$/.test(withdrawAddress) && (
                    <div className="mt-2 space-y-1">
                      <p className="text-green-600 text-xs flex items-center gap-1">
                        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        地址格式正确
                      </p>
                      <div className="bg-gray-50 p-2 rounded border text-xs">
                        <div className="text-gray-600 mb-1">完整地址:</div>
                        <div className="font-mono text-gray-800 break-all select-all" style={{ letterSpacing: '0.5px' }}>
                          {withdrawAddress}
                        </div>
                      </div>
                    </div>
                  )}
                  {!withdrawAddress && (
                    <p className="text-gray-500 text-xs mt-2">请输入您的钱包地址 (0x开头的42位地址)</p>
                  )}
                </dd>
              </div>



              {/* Withdraw amount */}
              <div className="flex items-center justify-between px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto]">
                <dt className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-gray-700 text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
                  <div className="flex flex-col">
                    <span>金额:</span>
                    <span className="text-xs text-gray-500 font-normal mt-1">
                      最低 {MIN_WITHDRAWAL_AMOUNT} USD, 手续费 {WITHDRAWAL_FEE} USD
                    </span>
                  </div>
                </dt>
                <dd className="flex-1 ml-4">
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
          const value = e.target.value;
          setAmount(value);
          setAmountError(''); // 清除之前的错误信息
        }}
                      placeholder="10.00"
                      min={MIN_WITHDRAWAL_AMOUNT.toString()}
                      max={availableBalance}
                      step="0.01"
                      className={`w-full px-3 py-1.5 text-sm border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 [font-family:'Lato',Helvetica] pr-16 text-gray-900 ${
                        amountError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white focus:shadow-lg hover:border-gray-400'
                      }`}
                      autoComplete="off"
                      onFocus={() => setAmountError('')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (isValidAmount && isValidAddress && isMinimumAmount && !amountError && !addressError) {
                            handleConfirm();
                          }
                        }
                      }}
                    />
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                      <button
                        onClick={handleMaxClick}
                        className="px-2 py-0.5 text-xs rounded font-medium transition-colors"
                        style={{
                          backgroundColor: '#16a34a',
                          color: 'white',
                          border: '1px solid #15803d'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#15803d';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#16a34a';
                        }}
                      >
                        全部
                      </button>
                      <span className="text-xs text-gray-500">{displayCurrency}</span>
                    </div>
                  </div>
                  {amountError && (
                    <p className="text-red-500 text-xs mt-1 animate-pulse">{amountError}</p>
                  )}

                  {/* 手续费明细显示 */}
                  {amount && parseFloat(amount) >= MIN_WITHDRAWAL_AMOUNT && parseFloat(amount) <= availableBalance && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-gray-600">提现金额:</span>
                        <span className="text-gray-900 font-medium">{parseFloat(amount).toFixed(2)} {displayCurrency}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-gray-600">手续费:</span>
                        <span className="text-red-600 font-medium">-{WITHDRAWAL_FEE.toFixed(2)} {displayCurrency}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-semibold pt-1 border-t border-blue-300">
                        <span className="text-blue-700">实际到账:</span>
                        <span className="text-blue-800">{actualReceiveAmount.toFixed(2)} {displayCurrency}</span>
                      </div>
                    </div>
                  )}

                </dd>
              </div>
            </div>
          </dl>

          {/* 每日限制提示 */}
          {!canWithdrawToday && (
            <div className="flex items-start gap-2 p-3 relative self-stretch w-full rounded-lg bg-amber-50 border border-amber-200 mb-3">
              <span className="text-amber-600 mt-0.5">⏰</span>
              <div className="text-xs text-amber-800 [font-family:'Lato',Helvetica]">
                <div className="font-medium mb-1">今日已提现</div>
                <div className="space-y-0.5">
                  <div>• 每日可提现一次，比传统平台快30倍</div>
                  <div>• 下次可提现: {nextWithdrawTime}</div>
                  <div>• 收益持续累积，明日可继续提现</div>
                </div>
              </div>
            </div>
          )}

          {/* Information notice */}
          <div className="flex items-start gap-2 p-3 relative self-stretch w-full rounded-lg bg-blue-50 border border-blue-200">
            <span className="text-blue-600 mt-0.5">🚀</span>
            <div className="text-xs text-blue-800 [font-family:'Lato',Helvetica]">
              <div className="font-medium mb-1">快速提现优势</div>
              <div className="space-y-0.5">
                <div>• 每日快速提现，免手续费，1-3分钟到账</div>
                <div>• 比YouTube快30倍，比微信公众号快7倍</div>
                <div>• 最低提现: 5 {displayCurrency}，当日最高: 10,000 {displayCurrency}</div>
                <div>• 请确认地址正确，错误地址将导致资产丢失</div>
              </div>
            </div>
          </div>

          {withdrawSuccess ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full animate-bounce">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-green-800">🚀 快速提现成功！</h3>
                <p className="text-sm text-green-600 mt-1">{amount} {displayCurrency} 将在1-3分钟内到账</p>
                <p className="text-xs text-green-600 mt-1">比传统平台快30倍，明日可继续提现</p>
                <p className="text-xs text-gray-500 mt-2">窗口将在3秒后自动关闭</p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={!canProcessWithdraw || isSubmitting || !!amountError || !!addressError}
              className={`all-[unset] box-border inline-flex h-[46px] items-center gap-2.5 px-[30px] py-2 relative rounded-[50px] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] transition-all border-2 ${
                !canProcessWithdraw || isSubmitting || !!amountError || !!addressError
                  ? 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-red to-red/90 hover:from-red/90 hover:to-red border-red cursor-pointer active:scale-95 transform hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
              aria-label="Confirm withdrawal"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span className={`relative w-fit [font-family:'Lato',Helvetica] font-bold text-lg tracking-[0] leading-5 whitespace-nowrap ${
                !canProcessWithdraw || isSubmitting || !!amountError || !!addressError ? 'text-gray-700' : 'text-[#ffffff]'
              }`}>
                {isSubmitting ? "处理中..." :
                 !canWithdrawToday ? "今日已提现" :
                 !isValidAmount ? "请输入有效金额" :
                 !isValidAddress ? "请输入提现地址" :
                 !isMinimumAmount ? `最低提现 5 ${displayCurrency}` :
                 amountError || addressError ? "请检查输入" :
                 `🚀 快速提现 ${amount} ${displayCurrency}`}
              </span>
            </button>
          )}
          )}
        </div>
      </div>
    </div>
  );
};