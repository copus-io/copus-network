import React, { useState } from "react";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
}

interface WalletSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletSelect?: (walletId: string) => void;
}

export const WalletSignInModal: React.FC<WalletSignInModalProps> = ({
  isOpen,
  onClose,
  onWalletSelect,
}) => {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  // Only show MetaMask and Coinbase Wallet
  const walletOptions: WalletOption[] = [
    {
      id: "metamask",
      name: "MetaMask",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 318.6 318.6'%3E%3Cpath fill='%23e2761b' stroke='%23e2761b' d='M274.1 35.5l-99.5 73.9L193 65.8z'/%3E%3Cg fill='%23e4761b' stroke='%23e4761b'%3E%3Cpath d='M44.4 35.5l98.7 74.6-17.5-44.3zm193.9 171.3l-26.5 40.6 56.7 15.6 16.3-55.3zm-204.4.9L50.1 263l56.7-15.6-26.5-40.6z'/%3E%3Cpath d='M103.6 138.2l-15.8 23.9 56.3 2.5-2-60.5zm111.3 0l-39-34.8-1.3 61.2 56.2-2.5zM106.8 247.4l33.8-16.5-29.2-22.8zm71.1-16.5l33.9 16.5-4.7-39.3z'/%3E%3C/g%3E%3Cg fill='%23d7c1b3' stroke='%23d7c1b3'%3E%3Cpath d='M211.8 247.4l-33.9-16.5 2.7 22.1-.3 9.3zm-105 0l31.5 14.9-.2-9.3 2.5-22.1z'/%3E%3C/g%3E%3Cpath fill='%23233447' stroke='%23233447' d='M138.8 193.5l-28.2-8.3 19.9-9.1zm40.9 0l8.3-17.4 20 9.1z'/%3E%3Cg fill='%23cd6116' stroke='%23cd6116'%3E%3Cpath d='M106.8 247.4l4.8-40.6-31.3.9zM207 206.8l4.8 40.6 26.5-39.7zm23.8-44.7l-56.2 2.5 5.2 28.9 8.3-17.4 20 9.1zm-120.2 23.1l20-9.1 8.2 17.4 5.3-28.9-56.3-2.5z'/%3E%3C/g%3E%3Cg fill='%23e4751f' stroke='%23e4751f'%3E%3Cpath d='M87.8 162.1l23.6 46-.8-22.9zm120.3 23.1l-1 22.9 23.7-46zm-64-20.6l-5.3 28.9 6.6 34.1 1.5-44.9zm30.5 0l-2.7 18 1.2 45 6.7-34.1z'/%3E%3C/g%3E%3Cpath fill='%23f6851b' stroke='%23f6851b' d='M179.8 193.5l-6.7 34.1 4.8 3.3 29.2-22.8 1-22.9zm-69.2-8.3l.8 22.9 29.2 22.8 4.8-3.3-6.6-34.1z'/%3E%3Cpath fill='%23c0ad9e' stroke='%23c0ad9e' d='M180.3 262.3l.3-9.3-2.5-2.2h-37.7l-2.3 2.2.2 9.3-31.5-14.9 11 9 22.3 15.5h38.3l22.4-15.5 11-9z'/%3E%3Cpath fill='%23161616' stroke='%23161616' d='M177.9 230.9l-4.8-3.3h-27.7l-4.8 3.3-2.5 22.1 2.3-2.2h37.7l2.5 2.2z'/%3E%3Cg fill='%23763d16' stroke='%23763d16'%3E%3Cpath d='M278.3 114.2l8.5-40.8-12.7-37.9-96.2 71.4 37 31.3 52.3 15.3 11.6-13.5-5-3.6 8-7.3-6.2-4.8 8-6.1zM31.8 73.4l8.5 40.8-5.4 4 8 6.1-6.1 4.8 8 7.3-5 3.6 11.5 13.5 52.3-15.3 37-31.3-96.2-71.4z'/%3E%3C/g%3E%3Cpath fill='%23f6851b' stroke='%23f6851b' d='M267.2 153.5l-52.3-15.3 15.9 23.9-23.7 46 31.2-.4h46.5zm-163.6-15.3l-52.3 15.3-17.4 54.2h46.4l31.1.4-23.6-46zm71 26.4l3.3-57.7 15.2-41.1h-67.5l15 41.1 3.5 57.7 1.2 18.2.1 44.8h27.7l.2-44.8z'/%3E%3C/svg%3E",
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      icon: "data:image/svg+xml,%3Csvg width='1024' height='1024' viewBox='0 0 1024 1024' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1024' height='1024' fill='%230052FF'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M152 512C152 710.823 313.177 872 512 872C710.823 872 872 710.823 872 512C872 313.177 710.823 152 512 152C313.177 152 152 313.177 152 512ZM420 396C406.745 396 396 406.745 396 420V604C396 617.255 406.745 628 420 628H604C617.255 628 628 617.255 628 604V420C628 406.745 617.255 396 604 396H420Z' fill='white'/%3E%3C/svg%3E",
    },
  ];

  const handleWalletSelect = (walletId: string) => {
    setSelectedWallet(walletId);
    if (onWalletSelect) {
      onWalletSelect(walletId);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="flex flex-col w-[500px] items-center justify-center gap-5 p-[30px] relative bg-white rounded-[15px]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="signin-title"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="relative self-stretch w-full flex-[0_0_auto] cursor-pointer"
          aria-label="Close wallet dialog"
        >
          <img
            className="w-full"
            alt=""
            src="https://c.animaapp.com/RWdJi6d2/img/close.svg"
          />
        </button>

        <div className="flex flex-col w-[360px] items-center justify-center gap-5 px-0 py-5 relative flex-[0_0_auto] bg-white rounded-lg">
          <div className="flex flex-col items-start gap-5 self-stretch w-full relative flex-[0_0_auto]">
            <h1
              className="relative self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-2xl text-center tracking-[0] leading-9"
              id="signin-title"
            >
              Connect wallet
            </h1>

            <div
              className="flex flex-wrap items-start justify-center gap-[20px_30px] relative self-stretch w-full flex-[0_0_auto]"
              role="group"
              aria-label="Wallet options"
            >
              {walletOptions.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleWalletSelect(wallet.id)}
                  className={`inline-flex flex-col gap-[5px] items-center justify-center relative flex-[0_0_auto] cursor-pointer hover:opacity-80 transition-opacity ${
                    selectedWallet === wallet.id ? "opacity-100" : "opacity-100"
                  }`}
                  aria-label={`Connect with ${wallet.name}`}
                  aria-pressed={selectedWallet === wallet.id}
                >
                  <img
                    className="relative flex-[0_0_auto] w-[30px] h-[30px] object-contain"
                    alt={`${wallet.name} icon`}
                    src={wallet.icon}
                  />

                  <span className="relative flex items-center justify-center w-fit [font-family:'Maven_Pro',Helvetica] font-normal text-off-black text-sm text-center tracking-[0] leading-[19.6px] whitespace-nowrap">
                    {wallet.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
