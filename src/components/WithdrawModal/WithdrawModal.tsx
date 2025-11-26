import React, { useState } from "react";
import { Button } from "../ui/button";

// Import cbw icon inline to avoid import issues
const cbwIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024'%3E%3Cpath fill='%230052FF' d='M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0z'/%3E%3Cpath fill='white' d='M512 682.7c-94.1 0-170.7-76.6-170.7-170.7s76.6-170.7 170.7-170.7S682.7 417.9 682.7 512 606.1 682.7 512 682.7zm0-283.4c-62.1 0-112.7 50.6-112.7 112.7s50.6 112.7 112.7 112.7 112.7-50.6 112.7-112.7-50.6-112.7-112.7-112.7z'/%3E%3C/svg%3E";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
}

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  walletAddress?: string;
  onConfirm: (amount: number, address: string, network: string, currency: string) => void;
  onWalletSelect: (walletId: string) => void;
  onDisconnectWallet: () => void;
  isWalletConnected: boolean;
}

const walletOptions: WalletOption[] = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 318.6 318.6'%3E%3Cpath fill='%23e2761b' stroke='%23e2761b' d='M274.1 35.5l-99.5 73.9L193 65.8z'/%3E%3Cg fill='%23e4761b' stroke='%23e4761b'%3E%3Cpath d='M44.4 35.5l98.7 74.6-17.5-44.3zm193.9 171.3l-26.5 40.6 56.7 15.6 16.3-55.3zm-204.4.9L50.1 263l56.7-15.6-26.5-40.6z'/%3E%3Cpath d='M103.6 138.2l-15.8 23.9 56.3 2.5-2-60.5zm111.3 0l-39-34.8-1.3 61.2 56.2-2.5zM106.8 247.4l33.8-16.5-29.2-22.8zm71.1-16.5l33.9 16.5-4.7-39.3z'/%3E%3C/g%3E%3Cg fill='%23d7c1b3' stroke='%23d7c1b3'%3E%3Cpath d='M211.8 247.4l-33.9-16.5 2.7 22.1-.3 9.3zm-105 0l31.5 14.9-.2-9.3 2.5-22.1z'/%3E%3C/g%3E%3Cpath fill='%23233447' stroke='%23233447' d='M138.8 193.5l-28.2-8.3 19.9-9.1zm40.9 0l8.3-17.4 20 9.1z'/%3E%3Cg fill='%23cd6116' stroke='%23cd6116'%3E%3Cpath d='M106.8 247.4l4.8-40.6-31.3.9zM207 206.8l4.8 40.6 26.5-39.7zm23.8-44.7l-56.2 2.5 5.2 28.9 8.3-17.4 20 9.1zm-120.2 23.1l20-9.1 8.2 17.4 5.3-28.9-56.3-2.5z'/%3E%3C/g%3E%3Cg fill='%23e4751f' stroke='%23e4751f'%3E%3Cpath d='M87.8 162.1l23.6 46-.8-22.9zm120.3 23.1l-1 22.9 23.7-46zm-64-20.6l-5.3 28.9 6.6 34.1 1.5-44.9zm30.5 0l-2.7 18 1.2 45 6.7-34.1z'/%3E%3C/g%3E%3Cpath fill='%23f6851b' stroke='%23f6851b' d='M179.8 193.5l-6.7 34.1 4.8 3.3 29.2-22.8 1-22.9zm-69.2-8.3l.8 22.9 29.2 22.8 4.8-3.3-6.6-34.1z'/%3E%3Cpath fill='%23c0ad9e' stroke='%23c0ad9e' d='M180.3 262.3l.3-9.3-2.5-2.2h-37.7l-2.3 2.2.2 9.3-31.5-14.9 11 9 22.3 15.5h38.3l22.4-15.5 11-9z'/%3E%3Cpath fill='%23161616' stroke='%23161616' d='M177.9 230.9l-4.8-3.3h-27.7l-4.8 3.3-2.5 22.1 2.3-2.2h37.7l2.5 2.2z'/%3E%3Cg fill='%23763d16' stroke='%23763d16'%3E%3Cpath d='M278.3 114.2l8.5-40.8-12.7-37.9-96.2 71.4 37 31.3 52.3 15.3 11.6-13.5-5-3.6 8-7.3-6.2-4.8 8-6.1zM31.8 73.4l8.5 40.8-5.4 4 8 6.1-6.1 4.8 8 7.3-5 3.6 11.5 13.5 52.3-15.3 37-31.3-96.2-71.4z'/%3E%3C/g%3E%3Cpath fill='%23f6851b' stroke='%23f6851b' d='M267.2 153.5l-52.3-15.3 15.9 23.9-23.7 46 31.2-.4h46.5zm-163.6-15.3l-52.3 15.3-17.4 54.2h46.4l31.1.4-23.6-46zm71 26.4l3.3-57.7 15.2-41.1h-67.5l15 41.1 3.5 57.7 1.2 18.2.1 44.8h27.7l.2-44.8z'/%3E%3C/svg%3E",
  },
  {
    id: "okx",
    name: "OKX",
    icon: "https://lh3.googleusercontent.com/2bBevW79q6gRZTFdm42CzUetuEKndq4fn41HQGknMpKMF_d-Ae2sJJzgfFUAVb1bJKCBb4ptZ9EAPp-QhWYIvc35yw=s120",
  },
  {
    id: "coinbase",
    name: "Coinbase",
    icon: cbwIcon,
  },
];

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
}) => {
  const [amount, setAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState(walletAddress || "");
  const [selectedNetwork, setSelectedNetwork] = useState("xlayer");
  const [selectedCurrency, setSelectedCurrency] = useState("usdc");
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(null);
  const [showCopied, setShowCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [amountError, setAmountError] = useState<string>('');
  const [addressError, setAddressError] = useState<string>('');

  React.useEffect(() => {
    if (walletAddress) {
      setWithdrawAddress(walletAddress);
    }
  }, [walletAddress]);

  // Get display currency based on network
  const displayCurrency = selectedNetwork === 'xlayer'
    ? xlayerCurrencyOptions.find(c => c.value === selectedCurrency)?.label || 'USDC'
    : 'USDC';

  const isValidAmount = amount && parseFloat(amount) > 0 && parseFloat(amount) <= availableBalance;
  const isValidAddress = withdrawAddress && withdrawAddress.length > 0;
  const isMinimumAmount = amount && parseFloat(amount) >= 5;

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
    setAmount(availableBalance.toString());
  };

  const handleWalletConnect = async (walletId: string) => {
    setIsConnecting(true);
    setConnectingWalletId(walletId);

    try {
      // 模拟真实钱包连接延迟
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      await onWalletSelect(walletId);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
      setConnectingWalletId(null);
    }
  };

  const handleCopyAddress = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const formatWalletAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConfirm = async () => {
    if (!isValidAmount || !isValidAddress || !isMinimumAmount) return;

    setIsSubmitting(true);
    setAmountError('');
    setAddressError('');

    try {
      // 模拟提现处理延迟
      await new Promise(resolve => setTimeout(resolve, 2000));

      onConfirm(
        parseFloat(amount),
        withdrawAddress,
        selectedNetwork,
        selectedCurrency
      );

      // 显示成功状态
      setWithdrawSuccess(true);

      // 3秒后自动关闭
      setTimeout(() => {
        setWithdrawSuccess(false);
        setAmount('');
        setWithdrawAddress('');
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Withdrawal failed:', error);
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
        className="flex flex-col w-[440px] items-center gap-5 p-[30px] relative bg-white rounded-[15px]"
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

        <div className="flex flex-col w-[438px] items-center gap-[25px] px-10 py-0 relative flex-[0_0_auto] ml-[-29.00px] mr-[-29.00px]">
          <header className="flex flex-col items-center justify-center relative self-stretch w-full flex-[0_0_auto]">
            <h1
              id="withdraw-title"
              className="relative w-fit [font-family:'Lato',Helvetica] font-semibold text-off-black text-2xl tracking-[0] leading-9 whitespace-nowrap"
            >
              💸 提现申请
            </h1>
          </header>

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
                <dt className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
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
                  <dt className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
                    提现地址:
                  </dt>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">钱包快填</span>
                    {isWalletConnected && walletAddress ? (
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setWithdrawAddress(walletAddress)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors border border-blue-700"
                          title="填入当前钱包地址"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          使用
                        </button>
                        <button
                          type="button"
                          onClick={onDisconnectWallet}
                          className="p-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors border border-gray-700"
                          title="切换钱包"
                          aria-label="Disconnect wallet"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1">
                        {walletOptions.map((wallet) => (
                          <button
                            key={wallet.id}
                            type="button"
                            onClick={() => handleWalletConnect(wallet.id)}
                            disabled={isConnecting}
                            className={`relative p-1.5 bg-white border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded transition-all ${
                              isConnecting && connectingWalletId === wallet.id ? 'border-blue-400 bg-blue-50' : ''
                            } ${isConnecting && connectingWalletId !== wallet.id ? 'opacity-30' : ''}`}
                            title={`连接 ${wallet.name}`}
                            aria-label={`Connect with ${wallet.name}`}
                          >
                            <img
                              className={`w-[20px] h-[20px] object-contain ${
                                wallet.id === 'coinbase' ? 'rounded-sm' : ''
                              }`}
                              alt={`${wallet.name} icon`}
                              src={wallet.icon}
                            />
                            {isConnecting && connectingWalletId === wallet.id && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded">
                                <div className="w-2 h-2 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
                      placeholder="0x1234567890123456789012345678901234567890"
                      className={`w-full px-4 py-3 text-sm border-2 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 font-mono ${
                        addressError ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 bg-white focus:shadow-lg'
                      }`}
                      rows={2}
                      autoComplete="off"
                      spellCheck={false}
                      onFocus={() => setAddressError('')}
                      style={{
                        wordBreak: 'break-all',
                        lineHeight: '1.4'
                      }}
                    />
                    {isWalletConnected && walletAddress && walletAddress !== withdrawAddress && (
                      <button
                        onClick={() => setWithdrawAddress(walletAddress)}
                        className="absolute right-2 top-2 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors border border-blue-700"
                      >
                        使用钱包地址
                      </button>
                    )}
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
                    <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      地址格式正确
                    </p>
                  )}
                  {!withdrawAddress && (
                    <p className="text-gray-500 text-xs mt-2">请输入您的钱包地址，或使用右上角的钱包快填功能</p>
                  )}
                </dd>
              </div>

              {/* Available balance with currency dropdown for X Layer - only show when wallet connected */}
              {isWalletConnected && walletAddress && (
                <div className="flex items-center justify-between px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-light-grey">
                  <dt className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
                    余额:
                  </dt>
                  <dd className="inline-flex items-center gap-2 relative">
                    <span className="[font-family:'Lato',Helvetica] font-medium text-off-black text-base tracking-[0] leading-[23px] whitespace-nowrap">
                      {availableBalance.toFixed(2)}
                    </span>
                    {selectedNetwork === 'xlayer' ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-md transition-colors [font-family:'Lato',Helvetica] font-medium text-gray-700 text-sm"
                        >
                          {displayCurrency}
                          <svg
                            className={`w-3 h-3 transition-transform ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isCurrencyDropdownOpen && (
                          <div className="absolute right-0 top-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-xl z-10 min-w-[80px]">
                            {xlayerCurrencyOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  setSelectedCurrency(option.value);
                                  setIsCurrencyDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 [font-family:'Lato',Helvetica] text-sm first:rounded-t-md last:rounded-b-md transition-colors ${
                                  selectedCurrency === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="[font-family:'Lato',Helvetica] font-medium text-off-black text-base">
                        USDC
                      </span>
                    )}
                  </dd>
                </div>
              )}


              {/* Withdraw amount */}
              <div className="flex items-center justify-between px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto]">
                <dt className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
                  金额:
                </dt>
                <dd className="flex-1 ml-4">
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
          const value = e.target.value;
          setAmount(value);

          // 实时验证
          if (value && parseFloat(value) > availableBalance) {
            setAmountError('金额超过可用余额');
          } else if (value && parseFloat(value) < 5 && parseFloat(value) > 0) {
            setAmountError(`最低提现 5 ${displayCurrency}`);
          } else {
            setAmountError('');
          }
        }}
                      placeholder="0.00"
                      min="5"
                      max={availableBalance}
                      step="0.01"
                      className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 [font-family:'Lato',Helvetica] pr-16 ${
                        amountError ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:shadow-lg'
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
                        className="px-2 py-0.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors border border-green-700"
                      >
                        全部
                      </button>
                      <span className="text-xs text-gray-500">{displayCurrency}</span>
                    </div>
                  </div>
                  {amountError && (
                    <p className="text-red-500 text-xs mt-1 animate-pulse">{amountError}</p>
                  )}
                  {!amountError && amount && parseFloat(amount) >= 5 && parseFloat(amount) <= availableBalance && (
                    <p className="text-green-600 text-xs mt-1">✓ 金额有效</p>
                  )}
                </dd>
              </div>
            </div>
          </dl>

          {/* Information notice */}
          <div className="flex items-start gap-2 p-3 relative self-stretch w-full rounded-lg bg-blue-50 border border-blue-200">
            <span className="text-blue-600 mt-0.5">ℹ️</span>
            <div className="text-xs text-blue-800 [font-family:'Lato',Helvetica]">
              <div className="font-medium mb-1">提现说明</div>
              <div className="space-y-0.5">
                <div>• 免手续费提现，1-3分钟到账</div>
                <div>• 请确认地址正确，错误地址将导致资产丢失</div>
                <div>• 最低提现: 5 {displayCurrency}，当日最高: 10,000 {displayCurrency}</div>
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
                <h3 className="text-lg font-bold text-green-800">🎉 提现申请成功！</h3>
                <p className="text-sm text-green-600 mt-1">{amount} {displayCurrency} 将在1-3分钟内到账</p>
                <p className="text-xs text-gray-500 mt-2">窗口将在3秒后自动关闭</p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={!isValidAmount || !isValidAddress || !isMinimumAmount || isSubmitting || !!amountError || !!addressError}
              className={`all-[unset] box-border inline-flex h-[46px] items-center gap-2.5 px-[30px] py-2 relative rounded-[50px] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] transition-all border-2 ${
                !isValidAmount || !isValidAddress || !isMinimumAmount || isSubmitting || !!amountError || !!addressError
                  ? 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-red to-red/90 hover:from-red/90 hover:to-red border-red cursor-pointer active:scale-95 transform hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
              aria-label="Confirm withdrawal"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span className={`relative w-fit [font-family:'Lato',Helvetica] font-bold text-lg tracking-[0] leading-5 whitespace-nowrap ${
                !isValidAmount || !isValidAddress || !isMinimumAmount || isSubmitting || !!amountError || !!addressError ? 'text-gray-500' : 'text-[#ffffff]'
              }`}>
                {isSubmitting ? "处理中..." :
                 !isValidAmount ? "请输入有效金额" :
                 !isValidAddress ? "请输入提现地址" :
                 !isMinimumAmount ? `最低提现 5 ${displayCurrency}` :
                 amountError || addressError ? "请检查输入" :
                 `确认提现 ${amount} ${displayCurrency}`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};