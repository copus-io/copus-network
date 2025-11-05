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
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1101.64 196.79'%3E%3Cpath fill='%230052FF' d='M222.34,54.94c-40.02,0-71.29,30.38-71.29,71.05s30.48,70.79,71.29,70.79c40.81,0,71.82-30.64,71.82-71.05C294.16,85.58,263.68,54.94,222.34,54.94z M222.61,167.47c-22.79,0-39.49-17.7-39.49-41.47c0-24.04,16.43-41.73,39.22-41.73c23.06,0,39.75,17.96,39.75,41.73S245.4,167.47,222.61,167.47z M302.9,85.85h19.88v108.3h31.8V57.58H302.9V85.85z M71.02,84.26c16.7,0,29.95,10.3,34.98,25.62h33.66c-6.1-32.75-33.13-54.94-68.37-54.94C31.27,54.94,0,85.32,0,126s30.48,70.79,71.29,70.79c34.45,0,62.01-22.19,68.11-55.21H106c-4.77,15.32-18.02,25.89-34.72,25.89c-23.06,0-39.22-17.7-39.22-41.47C32.07,101.96,47.97,84.26,71.02,84.26z M907.12,112.79l-23.32-3.43c-11.13-1.58-19.08-5.28-19.08-14c0-9.51,10.34-14.26,24.38-14.26c15.37,0,25.18,6.6,27.3,17.43h30.74c-3.45-27.47-24.65-43.58-57.24-43.58c-33.66,0-55.92,17.17-55.92,41.47c0,23.24,14.58,36.72,43.99,40.94l23.32,3.43c11.4,1.58,17.76,6.08,17.76,14.53c0,10.83-11.13,15.32-26.5,15.32c-18.82,0-29.42-7.66-31.01-19.28h-31.27c2.92,26.68,23.85,45.43,62.01,45.43c34.72,0,57.77-15.85,57.77-43.06C950.05,129.43,933.36,116.75,907.12,112.79z M338.68,1.32c-11.66,0-20.41,8.45-20.41,20.07s8.74,20.07,20.41,20.07c11.66,0,20.41-8.45,20.41-20.07S350.34,1.32,338.68,1.32z M805.36,104.34c0-29.58-18.02-49.39-56.18-49.39c-36.04,0-56.18,18.23-60.16,46.23h31.54c1.59-10.83,10.07-19.81,28.09-19.81c16.17,0,24.12,7.13,24.12,15.85c0,11.36-14.58,14.26-32.6,16.11c-24.38,2.64-54.59,11.09-54.59,42.79c0,24.57,18.29,40.41,47.44,40.41c22.79,0,37.1-9.51,44.26-24.57c1.06,13.47,11.13,22.19,25.18,22.19h18.55v-28.26h-15.64V104.34z M774.09,138.68c0,18.23-15.9,31.7-35.25,31.7c-11.93,0-22-5.02-22-15.58c0-13.47,16.17-17.17,31.01-18.75c14.31-1.32,22.26-4.49,26.24-10.57V138.68z M605.28,54.94c-17.76,0-32.6,7.4-43.2,19.81V0h-31.8v194.15h31.27v-17.96c10.6,12.94,25.71,20.6,43.73,20.6c38.16,0,67.05-30.11,67.05-70.79S642.91,54.94,605.28,54.94z M600.51,167.47c-22.79,0-39.49-17.7-39.49-41.47s16.96-41.73,39.75-41.73c23.06,0,39.22,17.7,39.22,41.73C639.99,149.77,623.3,167.47,600.51,167.47z M454.22,54.94c-20.67,0-34.19,8.45-42.14,20.34v-17.7h-31.54v136.56h31.8v-74.22c0-20.87,13.25-35.66,32.86-35.66c18.29,0,29.68,12.94,29.68,31.7v78.19h31.8v-80.56C506.69,79.24,488.94,54.94,454.22,54.94z M1101.64,121.51c0-39.09-28.62-66.56-67.05-66.56c-40.81,0-70.76,30.64-70.76,71.05c0,42.53,32.07,70.79,71.29,70.79c33.13,0,59.1-19.55,65.72-47.28h-33.13c-4.77,12.15-16.43,19.02-32.07,19.02c-20.41,0-35.78-12.68-39.22-34.87h105.21V121.51z M998.28,110.94c5.04-19.02,19.35-28.26,35.78-28.26c18.02,0,31.8,10.3,34.98,28.26H998.28z'/%3E%3C/svg%3E",
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
        className="flex flex-col w-[400px] items-center justify-center gap-5 p-[30px] relative bg-white rounded-[15px]"
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

        <div className="flex flex-col w-full items-center justify-center gap-5 px-0 pt-2 pb-5 relative flex-[0_0_auto] bg-white rounded-lg">
          <div className="flex flex-col items-start gap-[30px] self-stretch w-full relative flex-[0_0_auto]">
            <h1
              className="relative self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-off-black text-2xl text-center tracking-[0] leading-9"
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

                  <span className="relative flex items-center justify-center w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-sm text-center tracking-[0] leading-[19.6px] whitespace-nowrap">
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
