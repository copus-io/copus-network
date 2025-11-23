import React, { useState } from "react";

interface PaymentDetail {
  label: string;
  value: string;
}

interface PayConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayNow?: () => void;
  walletAddress?: string;
  availableBalance?: string;
  amount?: string;
  network?: string;
  faucetLink?: string;
  isInsufficientBalance?: boolean;
  walletType?: string;
  selectedNetwork?: 'xlayer' | 'base-sepolia';
  selectedCurrency?: 'usdc' | 'usdt';
  onNetworkChange?: (network: string) => void;
  onCurrencyChange?: (currency: string) => void;
}

const networkOptions = [
  { value: 'xlayer', label: 'X Layer' },
  { value: 'base-sepolia', label: 'Base Sepolia' },
];

const xlayerCurrencyOptions = [
  { value: 'usdc', label: 'USDC' },
  { value: 'usdt', label: 'USDT' },
];

export const PayConfirmModal: React.FC<PayConfirmModalProps> = ({
  isOpen,
  onClose,
  onPayNow,
  walletAddress = "OX8091....0912",
  availableBalance = "....",
  amount = "0.01",
  network = "Base",
  faucetLink = "https://app.metamask.io/buy/build-quote",
  isInsufficientBalance = false,
  walletType = "metamask",
  selectedNetwork: propSelectedNetwork,
  selectedCurrency: propSelectedCurrency,
  onNetworkChange,
  onCurrencyChange,
}) => {
  const [showCopied, setShowCopied] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(
    propSelectedNetwork || (walletType === 'okx' ? 'xlayer' : 'base-sepolia')
  );
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(
    propSelectedCurrency || 'usdc'
  );
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

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
    try {
      await navigator.clipboard.writeText(walletAddress);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
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
          <header className="flex flex-col items-center justify-center gap-[15px] relative self-stretch w-full flex-[0_0_auto]">
            <h1
              id="payment-title"
              className="relative w-fit mt-[-1.00px] font-h3 font-[number:var(--h3-font-weight)] text-off-black text-[length:var(--h3-font-size)] tracking-[var(--h3-letter-spacing)] leading-[var(--h3-line-height)] whitespace-nowrap [font-style:var(--h3-font-style)]"
            >
              Payment required
            </h1>

            <div className="flex flex-col items-center gap-[5px] relative self-stretch w-full flex-[0_0_auto]">
              <p
                id="payment-description"
                className="relative self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm text-center tracking-[0] leading-[23px]"
              >
                <span className="[font-family:'Lato',Helvetica] font-normal text-[#686868] text-sm tracking-[0] leading-[23px]">
                  Need {displayCurrency}? {walletType === 'okx' ? 'Buy on ' : 'Buy some '}
                </span>
                <a
                  href={walletType === 'okx' ? 'https://www.okx.com/web3/dex-swap' : faucetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[#686868] hover:text-off-black transition-colors"
                >
                  {walletType === 'okx' ? 'OKX DEX' : 'here'}
                </a>
                <span className="[font-family:'Lato',Helvetica] font-normal text-[#686868] text-sm tracking-[0] leading-[23px]">
                  .
                </span>
              </p>
            </div>
          </header>

          <div
            className="flex flex-col items-center gap-[5px] px-3 sm:px-4 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-light-grey-transparent cursor-pointer hover:bg-[linear-gradient(0deg,rgba(224,224,224,0.5)_0%,rgba(224,224,224,0.5)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] transition-all"
            role="button"
            aria-label="Click to copy wallet address"
            onClick={handleCopyAddress}
          >
            <div className="flex items-center justify-center gap-[5px] relative w-full overflow-hidden">
              <div className="relative w-full mt-[-1.00px] [font-family:'Lato',Helvetica] font-medium text-off-black text-base sm:text-lg md:text-xl tracking-[0] leading-[23px] break-all text-center px-2">
                {walletAddress}
              </div>
            </div>
            {showCopied && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-off-black text-white text-sm rounded-lg whitespace-nowrap [font-family:'Lato',Helvetica] shadow-lg">
                Wallet address copied
              </div>
            )}
          </div>

          <dl className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              {/* Network dropdown - at the top */}
              <div className="flex items-center justify-between px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-light-grey">
                <dt className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
                  Network:
                </dt>
                <dd className="relative">
                  <button
                    type="button"
                    onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors [font-family:'Lato',Helvetica] font-medium text-off-black text-base"
                  >
                    {networkOptions.find(n => n.value === selectedNetwork)?.label}
                    <svg
                      className={`w-4 h-4 transition-transform ${isNetworkDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isNetworkDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                      {networkOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSelectedNetwork(option.value);
                            setIsNetworkDropdownOpen(false);
                            onNetworkChange?.(option.value);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-100 [font-family:'Lato',Helvetica] text-sm first:rounded-t-lg last:rounded-b-lg ${
                            selectedNetwork === option.value ? 'bg-gray-50 font-medium' : ''
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </dd>
              </div>

              {/* Available balance with currency dropdown for X Layer */}
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

              {/* Amount */}
              <div className="flex items-start justify-between px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-light-grey">
                <dt className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
                  Amount:
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
                Insufficient balance. Please add more {displayCurrency} to your wallet.
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
            <span className={`relative w-fit [font-family:'Lato',Helvetica] font-bold text-xl tracking-[0] leading-5 whitespace-nowrap ${
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
