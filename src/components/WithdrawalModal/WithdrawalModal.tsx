import React, { useState } from "react";
import { Button } from "../ui/button";
import { useToast } from "../ui/toast";
import { WithdrawalService } from "../../services/withdrawalService";
import { WithdrawalRequest } from "../../types/withdrawal";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifyEmail: (data: { amount: string; toAddress: string; network: string; chainId: number }) => void;
  withdrawableAmount?: string;
  network?: string;
  walletAddress?: string;
  minimumAmount?: string;
  serviceFee?: string;
  chainId?: number;
  assetName?: string;
}

const networkOptions = [
  { value: 'base-sepolia', label: 'Base Sepolia', chainId: 84532 },
  { value: 'xlayer', label: 'X Layer', chainId: 196 },
];

export const WithdrawalModal = ({
  isOpen,
  onClose,
  onVerifyEmail,
  withdrawableAmount = "100.2 USDC",
  network = "Base Sepolia",
  walletAddress = "0DUSKFL...UEO",
  minimumAmount = "0.1USD",
  serviceFee = "10%",
  chainId = 84532, // Base Sepolia chainId
  assetName = "USDC"
}: WithdrawalModalProps): JSX.Element => {
  const [withdrawAmount, setWithdrawAmount] = useState<string>("0");
  const [toAddress, setToAddress] = useState<string>(walletAddress || "");
  const [selectedNetwork, setSelectedNetwork] = useState("base-sepolia");
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleClose = () => {
    setWithdrawAmount("0");
    setToAddress(walletAddress || "");
    onClose();
  };

  const handleCancel = () => {
    handleClose();
  };

  const handleVerify = () => {
    const amount = Number.parseFloat(withdrawAmount);
    const minAmount = Number.parseFloat(minimumAmount?.replace(/[^\d.]/g, '') || "0.1");

    if (amount <= 0) {
      showToast('请输入有效的提现金额', 'error');
      return;
    }

    if (amount < minAmount) {
      showToast(`提现金额不能少于 ${minimumAmount}`, 'error');
      return;
    }

    if (!toAddress || toAddress.length < 10) {
      showToast('请输入有效的钱包地址', 'error');
      return;
    }

    // 获取选中的网络信息
    const selectedNetworkInfo = networkOptions.find(n => n.value === selectedNetwork);

    // 将数据传递给邮箱验证组件
    onVerifyEmail({
      amount: withdrawAmount,
      toAddress: toAddress,
      network: selectedNetworkInfo?.label || "Base Sepolia",
      chainId: selectedNetworkInfo?.chainId || 84532
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric input
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setWithdrawAmount(value);
    }
  };

  const handleAllAmount = () => {
    // 从 withdrawableAmount 中提取数字部分
    // 例如 "100.2 USDC" -> "100.2"
    const amountMatch = withdrawableAmount.match(/[\d.]+/);
    if (amountMatch) {
      setWithdrawAmount(amountMatch[0]);
    }
  };

  const isVerifyDisabled = !withdrawAmount || Number.parseFloat(withdrawAmount) === 0;

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[15px] shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Withdraw
          </h2>

          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Withdrawal info */}
        <div className="space-y-4 mb-6">
          {/* Available amount */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Withdraw-able amount</span>
            <span className="font-medium text-gray-900">{withdrawableAmount}</span>
          </div>

          {/* Network selection */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Network</span>
            <div className="inline-flex items-center gap-2">
              {networkOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedNetwork(option.value)}
                  className={`px-3 py-1.5 rounded-lg transition-all [font-family:'Lato',Helvetica] text-sm ${
                    selectedNetwork === option.value
                      ? 'bg-[#0052ff] text-white font-medium'
                      : 'bg-gray-100 text-off-black hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Wallet address input */}
          <div className="space-y-2">
            <label htmlFor="wallet-address" className="block text-sm font-medium text-gray-700">
              To Address
            </label>
            <div className="relative">
              <input
                id="wallet-address"
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="输入钱包地址"
                className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-3 pr-10 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
              {toAddress && (
                <button
                  type="button"
                  onClick={() => setToAddress("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Clear address"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <label htmlFor="withdraw-amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <div className="relative">
              <input
                id="withdraw-amount"
                type="text"
                value={withdrawAmount}
                onChange={handleAmountChange}
                placeholder="0"
                className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-3 pr-16 py-2 text-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAllAmount}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
              >
                All
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Min: {minimumAmount} • Service fee: {serviceFee}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>

          <button
            onClick={handleVerify}
            disabled={isVerifyDisabled}
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg [font-family:'Lato',Helvetica] font-bold text-lg transition-all ${
              isVerifyDisabled
                ? 'bg-gray-300 cursor-not-allowed opacity-60 text-gray-500'
                : 'bg-[linear-gradient(0deg,rgba(0,82,255,0.8)_0%,rgba(0,82,255,0.8)_100%),linear-gradient(0deg,rgba(255,254,254,1)_0%,rgba(255,254,254,1)_100%)] cursor-pointer hover:bg-[linear-gradient(0deg,rgba(0,82,255,0.9)_0%,rgba(0,82,255,0.9)_100%),linear-gradient(0deg,rgba(255,254,254,1)_0%,rgba(255,254,254,1)_100%)] active:scale-95 text-[#ffffff]'
            }`}
            aria-label="Verify withdrawal"
          >
            <span className={`relative w-fit tracking-[0] leading-5 whitespace-nowrap ${
              isVerifyDisabled ? 'text-gray-500' : 'text-[#ffffff]'
            }`}>
              Verify
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};