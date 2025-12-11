import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../ui/button";
import { useToast } from "../ui/toast";
import { WithdrawalService } from "../../services/withdrawalService";
import { WithdrawalRequest } from "../../types/withdrawal";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifyEmail: (data: { amount: string; toAddress: string; network: string; chainId: number; assetName: string }) => void;
  withdrawableAmount?: string;
  network?: string;
  walletAddress?: string;
  minimumAmount?: string;
  serviceFee?: string;
  chainId?: number;
  assetName?: string;
}

const networkOptions = [
  {
    value: 'base',
    label: 'Base',
    chainId: 8453,
    assets: [{ value: 'USDC', label: 'USDC' }]
  },
  {
    value: 'xlayer',
    label: 'X Layer',
    chainId: 196,
    assets: [
      { value: 'USDC', label: 'USDC' },
      { value: 'USDT', label: 'USDT' }
    ]
  },
];

export const WithdrawalModal = ({
  isOpen,
  onClose,
  onVerifyEmail,
  withdrawableAmount = "100.2 USDC",
  network = "Base",
  walletAddress = "0DUSKFL...UEO",
  minimumAmount = "10USD",
  serviceFee = "10%",
  chainId = 8453, // Base mainnet chainId
  assetName = "USDC"
}: WithdrawalModalProps): JSX.Element => {
  const [withdrawAmount, setWithdrawAmount] = useState<string>("0");
  const [toAddress, setToAddress] = useState<string>(walletAddress || "");
  const [selectedNetwork, setSelectedNetwork] = useState("base");
  const [selectedAsset, setSelectedAsset] = useState("USDC");
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // Get current network config and available assets
  const currentNetworkConfig = networkOptions.find(n => n.value === selectedNetwork);
  const availableAssets = currentNetworkConfig?.assets || [];

  // Handle network change and reset asset if not available
  const handleNetworkChange = (networkValue: string) => {
    setSelectedNetwork(networkValue);
    const newNetworkConfig = networkOptions.find(n => n.value === networkValue);
    const newAvailableAssets = newNetworkConfig?.assets || [];

    // If current asset is not available in new network, select first available
    if (!newAvailableAssets.some(asset => asset.value === selectedAsset)) {
      setSelectedAsset(newAvailableAssets[0]?.value || 'USDC');
    }
  };

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
    const minAmount = Number.parseFloat(minimumAmount?.replace(/[^\d.]/g, '') || "10");

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
      network: selectedNetworkInfo?.label || "Base",
      chainId: selectedNetworkInfo?.chainId || 8453,
      assetName: selectedAsset
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

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-[15px] shadow-xl max-w-md w-full mx-4 p-[30px] relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-[30px] right-[30px] text-gray-400 hover:text-gray-600"
          aria-label="Close modal"
        >
          <svg className="w-[12px] h-[12px]" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-[15px] mb-6 mt-5">
          <h2 className="text-xl font-semibold text-gray-900 text-center">
            Withdraw
          </h2>
        </div>

        {/* Withdrawal info */}
        <div className="space-y-4 mb-6">
          {/* Network selection */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Network</span>
            <div className="inline-flex items-center gap-2">
              {networkOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleNetworkChange(option.value)}
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

          {/* Asset selection - only show if multiple assets available */}
          {availableAssets.length > 1 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Asset</span>
              <div className="inline-flex items-center gap-2">
                {availableAssets.map((asset) => (
                  <button
                    key={asset.value}
                    type="button"
                    onClick={() => setSelectedAsset(asset.value)}
                    className={`px-3 py-1.5 rounded-lg transition-all [font-family:'Lato',Helvetica] text-sm ${
                      selectedAsset === asset.value
                        ? 'bg-[#0052ff] text-white font-medium'
                        : 'bg-gray-100 text-off-black hover:bg-gray-200'
                    }`}
                  >
                    {asset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Available amount */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Withdraw-able amount</span>
            <span className="font-medium text-gray-900">{withdrawableAmount}</span>
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
                placeholder="Enter wallet address"
                className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-3 pr-10 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [font-family:'Lato',Helvetica]"
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
        <div className="flex items-center justify-center gap-[15px]">
          <Button
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-[50px] bg-transparent text-gray-600 hover:bg-gray-100 transition-colors h-auto shadow-none"
          >
            Cancel
          </Button>

          <Button
            onClick={handleVerify}
            disabled={isVerifyDisabled}
            className={`px-5 py-2.5 rounded-[50px] transition-colors h-auto ${
              isVerifyDisabled
                ? 'bg-gray-300 cursor-not-allowed opacity-60 text-gray-500'
                : 'bg-red hover:bg-red/90 text-white'
            }`}
            aria-label="Verify withdrawal"
          >
            Verify
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};