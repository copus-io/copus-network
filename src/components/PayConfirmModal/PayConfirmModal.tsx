import React, { useState } from "react";
import cbwIcon from "../../assets/images/cbw.svg";

interface PaymentDetail {
  label: string;
  value: string;
}

interface WalletOption {
  id: string;
  name: string;
  icon: string;
}

interface PayConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayNow?: () => void;
  onWalletSelect?: (walletId: string) => Promise<void>;
  walletAddress?: string;
  availableBalance?: string;
  amount?: string;
  network?: string;
  faucetLink?: string;
  isInsufficientBalance?: boolean;
  walletType?: string;
  selectedNetwork?: 'xlayer' | 'base-sepolia' | 'base-mainnet';
  selectedCurrency?: 'usdc' | 'usdt';
  onNetworkChange?: (network: string) => void;
  onCurrencyChange?: (currency: string) => void;
  isWalletConnected?: boolean;
  onDisconnectWallet?: () => void;
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

export const PayConfirmModal: React.FC<PayConfirmModalProps> = ({
  isOpen,
  onClose,
  onPayNow,
  onWalletSelect,
  walletAddress = "",
  availableBalance = "....",
  amount = "0.01",
  network = "Base",
  faucetLink = "https://app.metamask.io/buy/build-quote",
  isInsufficientBalance = false,
  walletType = "",
  selectedNetwork: propSelectedNetwork,
  selectedCurrency: propSelectedCurrency,
  onNetworkChange,
  onCurrencyChange,
  isWalletConnected = false,
  onDisconnectWallet,
}) => {
  const [showCopied, setShowCopied] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(
    propSelectedNetwork || 'base-mainnet'
  );
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(
    propSelectedCurrency || 'usdc'
  );
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(null);

  // Update network when props change
  React.useEffect(() => {
    if (propSelectedNetwork) {
      setSelectedNetwork(propSelectedNetwork);
    }
  }, [propSelectedNetwork]);

  // Update currency when props change
  React.useEffect(() => {
    if (propSelectedCurrency) {
      setSelectedCurrency(propSelectedCurrency);
    }
  }, [propSelectedCurrency]);

  // Get display currency based on network
  const displayCurrency = selectedNetwork === 'xlayer'
    ? xlayerCurrencyOptions.find(c => c.value === selectedCurrency)?.label || 'USDC'
    : 'USDC';

  const handlePayNow = () => {
    if (onPayNow) {
      onPayNow();
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

  const handleWalletClick = async (walletId: string) => {
    if (!onWalletSelect || isConnecting) return;

    setIsConnecting(true);
    setConnectingWalletId(walletId);

    try {
      await onWalletSelect(walletId);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
      setConnectingWalletId(null);
    }
  };

  const handleDisconnect = () => {
    if (onDisconnectWallet) {
      onDisconnectWallet();
    }
  };

  // Format wallet address for display (0x1234...5678)
  const formatWalletAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="flex flex-col w-[440px] items-center gap-5 p-[30px] relative bg-white rounded-[15px]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="payment-title"
        aria-describedby="payment-description"
      >
        <button
          onClick={onClose}
          className="relative self-stretch w-full flex-[0_0_auto] cursor-pointer"
          aria-label="Close payment dialog"
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
              id="payment-title"
              className="relative w-fit [font-family:'Lato',Helvetica] font-semibold text-off-black text-2xl tracking-[0] leading-9 whitespace-nowrap"
            >
              Payment required
            </h1>
          </header>

          <dl className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              {/* Network selection buttons */}
              <div className="flex items-center justify-between px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-light-grey">
                <dt className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
                  Network:
                </dt>
                <dd className="inline-flex items-center gap-2">
                  {networkOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSelectedNetwork(option.value);
                        onNetworkChange?.(option.value);
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all [font-family:'Lato',Helvetica] text-sm ${
                        selectedNetwork === option.value
                          ? 'bg-[#0052ff] text-white font-medium'
                          : 'bg-gray-100 text-off-black hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </dd>
              </div>

              {/* Wallet selection row */}
              <div className="flex items-center justify-between px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-light-grey">
                <dt className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
                  Wallet:
                </dt>
                <dd className="inline-flex items-center gap-2 relative">
                  {isWalletConnected && walletAddress ? (
                    // Show connected wallet address with disconnect button
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyAddress}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors [font-family:'Lato',Helvetica] font-medium text-off-black text-sm relative"
                        title="Click to copy address"
                      >
                        {formatWalletAddress(walletAddress)}
                        {showCopied && (
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-off-black text-white text-xs rounded whitespace-nowrap">
                            Copied!
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                        title="Change wallet"
                        aria-label="Disconnect wallet"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    // Show wallet options
                    <div className="inline-flex items-center gap-3">
                      {walletOptions.map((wallet) => (
                        <button
                          key={wallet.id}
                          type="button"
                          onClick={() => handleWalletClick(wallet.id)}
                          disabled={isConnecting}
                          className={`relative p-1.5 rounded-lg transition-all hover:bg-gray-100 ${
                            isConnecting && connectingWalletId === wallet.id ? 'opacity-50' : ''
                          } ${isConnecting && connectingWalletId !== wallet.id ? 'opacity-30' : ''}`}
                          title={`Connect ${wallet.name}`}
                          aria-label={`Connect with ${wallet.name}`}
                        >
                          <img
                            className={`w-[30px] h-[30px] object-contain ${
                              wallet.id === 'coinbase' ? 'rounded-md' : ''
                            }`}
                            alt={`${wallet.name} icon`}
                            src={wallet.icon}
                          />
                          {isConnecting && connectingWalletId === wallet.id && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </dd>
              </div>

              {/* Available balance with currency dropdown for X Layer - only show when wallet connected */}
              {isWalletConnected && walletAddress && (
                <div className="flex items-center justify-between px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-light-grey">
                  <dt className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
                    Available balance:
                  </dt>
                  <dd className="inline-flex items-center gap-2 relative">
                    <span className="[font-family:'Lato',Helvetica] font-medium text-off-black text-base tracking-[0] leading-[23px] whitespace-nowrap">
                      {availableBalance}
                    </span>
                    {selectedNetwork === 'xlayer' ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors [font-family:'Lato',Helvetica] font-medium text-off-black text-sm"
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
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[80px]">
                            {xlayerCurrencyOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  setSelectedCurrency(option.value);
                                  setIsCurrencyDropdownOpen(false);
                                  onCurrencyChange?.(option.value);
                                }}
                                className={`w-full text-left px-3 py-2 hover:bg-gray-100 [font-family:'Lato',Helvetica] text-sm first:rounded-t-lg last:rounded-b-lg ${
                                  selectedCurrency === option.value ? 'bg-gray-50 font-medium' : ''
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

              {/* Price */}
              <div className="flex items-start justify-between px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-light-grey">
                <dt className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
                  Price:
                </dt>
                <dd className="inline-flex items-center justify-center gap-[5px] relative flex-[0_0_auto]">
                  <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-medium text-off-black text-base tracking-[0] leading-[23px] whitespace-nowrap">
                    {amount}
                  </div>
                </dd>
              </div>
            </div>
          </dl>

          {isInsufficientBalance && (
            <div className="flex items-center gap-2 p-3 relative self-stretch w-full rounded-lg bg-red-50 border border-red-200">
              <svg className="w-5 h-5 flex-shrink-0" fill="#ef4444" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span style={{ color: '#ef4444' }} className="[font-family:'Lato',Helvetica] font-medium text-sm">
                Insufficient balance.
              </span>
            </div>
          )}

          <button
            onClick={handlePayNow}
            disabled={isInsufficientBalance}
            className={`all-[unset] box-border inline-flex h-[46px] items-center gap-2.5 px-[30px] py-2 relative rounded-[50px] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] transition-all ${
              isInsufficientBalance
                ? 'bg-gray-300 cursor-not-allowed opacity-60'
                : 'bg-[linear-gradient(0deg,rgba(0,82,255,0.8)_0%,rgba(0,82,255,0.8)_100%),linear-gradient(0deg,rgba(255,254,254,1)_0%,rgba(255,254,254,1)_100%)] cursor-pointer hover:bg-[linear-gradient(0deg,rgba(0,82,255,0.9)_0%,rgba(0,82,255,0.9)_100%),linear-gradient(0deg,rgba(255,254,254,1)_0%,rgba(255,254,254,1)_100%)] active:scale-95'
            }`}
            aria-label="Confirm payment"
          >
            <span className={`relative w-fit [font-family:'Lato',Helvetica] font-bold text-lg tracking-[0] leading-5 whitespace-nowrap ${
              isInsufficientBalance ? 'text-gray-500' : 'text-[#ffffff]'
            }`}>
              Pay now
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
