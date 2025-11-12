import React from "react";

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
}

export const PayConfirmModal: React.FC<PayConfirmModalProps> = ({
  isOpen,
  onClose,
  onPayNow,
  walletAddress = "OX8091....0912",
  availableBalance = "....USDC",
  amount = "0.01 USDC",
  network = "Base Sepolia",
  faucetLink = "#",
  isInsufficientBalance = false,
}) => {
  const paymentDetails: PaymentDetail[] = [
    { label: "Available balance:", value: availableBalance },
    { label: "Amount:", value: amount },
    { label: "Network:", value: network },
  ];

  const handlePayNow = () => {
    if (onPayNow) {
      onPayNow();
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
                  Need Base Sepolia USDC? Get some{" "}
                </span>
                <a
                  href={faucetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[#686868] hover:text-off-black transition-colors"
                >
                  here
                </a>
                <span className="[font-family:'Lato',Helvetica] font-normal text-[#686868] text-sm tracking-[0] leading-[23px]">
                  .
                </span>
              </p>
            </div>
          </header>

          <div
            className="flex flex-col items-center gap-[5px] px-3 sm:px-4 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-light-grey-transparent"
            role="region"
            aria-label="Wallet address"
          >
            <div className="flex items-center justify-center gap-[5px] relative w-full overflow-hidden">
              <div className="relative w-full mt-[-1.00px] [font-family:'Lato',Helvetica] font-medium text-off-black text-base sm:text-lg md:text-xl tracking-[0] leading-[23px] break-all text-center px-2">
                {walletAddress}
              </div>
            </div>
          </div>

          <dl className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              {paymentDetails.map((detail, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between px-0 py-[15px] relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-light-grey"
                >
                  <dt className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
                    {detail.label}
                  </dt>
                  <dd className="inline-flex items-center justify-center gap-[5px] relative flex-[0_0_auto]">
                    <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-medium text-off-black text-base tracking-[0] leading-[23px] whitespace-nowrap">
                      {detail.value}
                    </div>
                  </dd>
                </div>
              ))}
            </div>
          </dl>

          {isInsufficientBalance && (
            <div className="flex items-center gap-2 p-3 relative self-stretch w-full rounded-lg bg-red-50 border border-red-200">
              <svg className="w-5 h-5 flex-shrink-0" fill="#ef4444" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span style={{ color: '#ef4444' }} className="[font-family:'Lato',Helvetica] font-medium text-sm">
                Insufficient balance. Please add more USDC to your wallet.
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
