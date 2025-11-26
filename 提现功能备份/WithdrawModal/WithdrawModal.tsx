import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { X, Wallet, CheckCircle, AlertCircle } from "lucide-react";

// 支持的网络配置
const SUPPORTED_NETWORKS = {
  ethereum: {
    chainId: '0x1',
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    symbol: 'ETH',
    explorer: 'https://etherscan.io'
  },
  polygon: {
    chainId: '0x89',
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com/',
    symbol: 'MATIC',
    explorer: 'https://polygonscan.com'
  },
  arbitrum: {
    chainId: '0xa4b1',
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    symbol: 'ETH',
    explorer: 'https://arbiscan.io'
  },
  base: {
    chainId: '0x2105',
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    symbol: 'ETH',
    explorer: 'https://basescan.org'
  }
};

type NetworkKey = keyof typeof SUPPORTED_NETWORKS;

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  walletAddress: string;
  onConfirm: (amount: number, walletAddress: string, network?: string) => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  walletAddress,
  onConfirm
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkKey>('base');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [currentWalletAddress, setCurrentWalletAddress] = useState(walletAddress);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletConnectionError, setWalletConnectionError] = useState<string | null>(null);

  // 检查钱包连接状态
  useEffect(() => {
    if (isOpen) {
      checkWalletConnection();
    }
  }, [isOpen, walletAddress]);

  // 重置状态当弹窗关闭时
  useEffect(() => {
    if (!isOpen) {
      setWithdrawAmount('');
      setShowConfirmation(false);
      setIsSubmitting(false);
      setWalletConnectionError(null);
    }
  }, [isOpen]);

  // 检查钱包连接状态
  const checkWalletConnection = async () => {
    if (!window.ethereum) {
      setIsWalletConnected(false);
      setWalletConnectionError('请先安装 MetaMask 钱包');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0 && accounts[0].toLowerCase() === walletAddress.toLowerCase()) {
        setIsWalletConnected(true);
        setCurrentWalletAddress(accounts[0]);
        setWalletConnectionError(null);
        await checkCurrentNetwork();
      } else {
        setIsWalletConnected(false);
        setWalletConnectionError('钱包地址不匹配，请连接正确的钱包');
      }
    } catch (error) {
      console.error('检查钱包连接失败:', error);
      setIsWalletConnected(false);
      setWalletConnectionError('钱包连接检查失败');
    }
  };

  // 检查当前网络
  const checkCurrentNetwork = async () => {
    if (!window.ethereum) return;

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const currentNetwork = Object.entries(SUPPORTED_NETWORKS).find(
        ([, config]) => config.chainId === chainId
      );

      if (currentNetwork) {
        setSelectedNetwork(currentNetwork[0] as NetworkKey);
      }
    } catch (error) {
      console.error('获取网络信息失败:', error);
    }
  };

  // 连接钱包
  const connectWallet = async () => {
    if (!window.ethereum) {
      setWalletConnectionError('请先安装 MetaMask 钱包');
      return;
    }

    setIsConnectingWallet(true);
    setWalletConnectionError(null);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        if (accounts[0].toLowerCase() === walletAddress.toLowerCase()) {
          setIsWalletConnected(true);
          setCurrentWalletAddress(accounts[0]);
          await checkCurrentNetwork();
        } else {
          setWalletConnectionError(`请连接地址 ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} 的钱包`);
        }
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
      setWalletConnectionError('用户拒绝连接钱包');
    } finally {
      setIsConnectingWallet(false);
    }
  };

  // 切换网络
  const switchNetwork = async (networkKey: NetworkKey) => {
    if (!window.ethereum) return;

    const network = SUPPORTED_NETWORKS[networkKey];
    setIsConnectingWallet(true);
    setWalletConnectionError(null);

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });

      setSelectedNetwork(networkKey);
    } catch (error: any) {
      if (error.code === 4902) {
        // 网络未添加，尝试添加网络
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: network.chainId,
                chainName: network.name,
                rpcUrls: [network.rpcUrl],
                nativeCurrency: {
                  name: network.symbol,
                  symbol: network.symbol,
                  decimals: 18,
                },
                blockExplorerUrls: [network.explorer],
              },
            ],
          });
          setSelectedNetwork(networkKey);
        } catch (addError) {
          console.error('添加网络失败:', addError);
          setWalletConnectionError('添加网络失败，请手动添加');
        }
      } else {
        console.error('切换网络失败:', error);
        setWalletConnectionError('切换网络失败');
      }
    } finally {
      setIsConnectingWallet(false);
    }
  };

  if (!isOpen) return null;

  const amount = parseFloat(withdrawAmount) || 0;
  // 移除手续费，实际到账金额等于提现金额
  const actualAmount = amount;
  const minWithdrawAmount = 50; // 最小提现金额

  const isValidAmount = amount >= minWithdrawAmount && amount <= availableBalance;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 只允许数字和小数点
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setWithdrawAmount(value);
    }
  };

  const handleMaxAmount = () => {
    setWithdrawAmount(availableBalance.toString());
  };

  const handleNext = () => {
    if (isValidAmount) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(amount, currentWalletAddress, selectedNetwork);
      onClose();
    } catch (error) {
      console.error('提现失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setShowConfirmation(false);
  };

  const formatCurrency = (value: number) => {
    return `${value.toFixed(2)} USDC`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="font-h-4 font-[number:var(--h-4-font-weight)] text-off-black text-[length:var(--h-4-font-size)]">
            {showConfirmation ? '确认提现' : '申请提现'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {!showConfirmation ? (
          /* 提现金额输入界面 */
          <div className="p-6 space-y-6">
            {/* 钱包连接状态 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                钱包连接状态
              </label>
              <div className={`p-3 rounded-lg border ${
                isWalletConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isWalletConnected ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      isWalletConnected ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {isWalletConnected ? '已连接' : '未连接'}
                    </span>
                  </div>
                  {!isWalletConnected && (
                    <Button
                      onClick={connectWallet}
                      disabled={isConnectingWallet}
                      className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                      {isConnectingWallet ? '连接中...' : '连接钱包'}
                    </Button>
                  )}
                </div>
                {walletConnectionError && (
                  <div className="mt-2 text-sm text-red-600">
                    {walletConnectionError}
                  </div>
                )}
              </div>
            </div>

            {/* 钱包地址显示 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提现地址
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-gray-600" />
                  <span className="font-mono text-sm text-gray-900">
                    {`${walletAddress.slice(0, 10)}...${walletAddress.slice(-6)}`}
                  </span>
                </div>
              </div>
            </div>

            {/* 网络选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择网络
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
                  <button
                    key={key}
                    onClick={() => switchNetwork(key as NetworkKey)}
                    disabled={isConnectingWallet}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedNetwork === key
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    } ${isConnectingWallet ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="font-medium text-sm">{network.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{network.symbol}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 可用余额显示 */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">可用余额</span>
                <span className="font-semibold text-blue-900">
                  {formatCurrency(availableBalance)}
                </span>
              </div>
            </div>

            {/* 提现金额输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提现金额
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={withdrawAmount}
                  onChange={handleAmountChange}
                  placeholder="请输入提现金额"
                  className="pr-20"
                />
                <button
                  onClick={handleMaxAmount}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-red bg-red/10 rounded hover:bg-red/20 transition-colors"
                >
                  全部
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                最小提现金额: {formatCurrency(minWithdrawAmount)}
              </div>
            </div>

            {/* 提现信息 */}
            {amount > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-900 mb-3">提现信息</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">提现金额:</span>
                    <span className="text-gray-900">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">平台手续费:</span>
                    <span className="text-green-600">免费 🎉</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span className="text-gray-900">实际到账:</span>
                    <span className="text-green-600">{formatCurrency(actualAmount)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 错误提示 */}
            {amount > 0 && !isValidAmount && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">⚠️</span>
                  <span className="text-sm text-red-800">
                    {amount < minWithdrawAmount
                      ? `最小提现金额为 ${formatCurrency(minWithdrawAmount)}`
                      : '提现金额超过可用余额'
                    }
                  </span>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12"
              >
                取消
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isValidAmount || !isWalletConnected}
                className="flex-1 h-12 bg-red hover:bg-red/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一步
              </Button>
            </div>
          </div>
        ) : (
          /* 确认提现界面 */
          <div className="p-6 space-y-6">
            {/* 确认信息 */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">提现信息确认</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">提现金额:</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">平台手续费:</span>
                    <span className="text-green-600">免费 🎉</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">实际到账:</span>
                    <span className="font-medium text-green-600">{formatCurrency(actualAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">提现地址</h4>
                <div className="font-mono text-sm text-gray-600 break-all">
                  {walletAddress}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">提现网络</h4>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">
                    {SUPPORTED_NETWORKS[selectedNetwork].name}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({SUPPORTED_NETWORKS[selectedNetwork].symbol})
                  </span>
                </div>
              </div>
            </div>

            {/* 重要提示 */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">⚠️</span>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">重要提示:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 提现申请提交后无法撤销</li>
                    <li>• 预计 1-3 个工作日内到账</li>
                    <li>• 请确保钱包地址和网络选择正确无误</li>
                    <li>• 错误的网络选择可能导致资产丢失</li>
                    <li>• 当前选择网络: {SUPPORTED_NETWORKS[selectedNetwork].name}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex-1 h-12"
              >
                返回
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 h-12 bg-red hover:bg-red/90 text-white disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    处理中...
                  </div>
                ) : (
                  '确认提现'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};