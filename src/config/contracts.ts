/**
 * 智能合约地址配置
 * 根据环境和网络返回正确的合约地址
 */

import { getCurrentEnvironment } from '../utils/envUtils';

export type NetworkType = 'xlayer' | 'base-sepolia' | 'base-mainnet';
export type TokenType = 'usdc' | 'usdt';

/**
 * 合约地址配置映射
 */
const contractAddresses = {
  // X Layer 网络
  xlayer: {
    production: {
      usdc: '0x74b7F16337b8972027F6196A17a631aC6dE26d22',
      usdt: '0x1E4a5963aBFD975d8c9021ce480b42188849D41d',
    },
    test: {
      usdc: '0x74b7F16337b8972027F6196A17a631aC6dE26d22', // X Layer mainnet USDC合约 (强制使用主网)
      usdt: '0x1E4a5963aBFD975d8c9021ce480b42188849D41d', // X Layer mainnet USDT合约 (强制使用主网)
    },
  },
  // Base Mainnet 网络 (主网)
  'base-mainnet': {
    production: {
      usdc: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // Base mainnet USDC合约
      usdt: null, // Base mainnet 没有标准USDT
    },
    test: {
      usdc: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // Base mainnet USDC合约 (强制使用主网)
      usdt: null, // Base mainnet 没有标准USDT
    },
  },
  // Base Sepolia 网络 (测试网)
  'base-sepolia': {
    production: {
      usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia始终是测试网
      usdt: null, // Base Sepolia 没有USDT
    },
    test: {
      usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia始终是测试网
      usdt: null, // Base Sepolia 没有USDT
    },
  },
};

/**
 * 网络配置
 */
export const networkConfigs = {
  xlayer: {
    chainId: '0xc4', // 196 in hex (X Layer mainnet)
    name: 'X Layer Mainnet',
    rpcUrls: ['https://rpc.xlayer.tech', 'https://xlayerrpc.okx.com'],
    blockExplorerUrls: ['https://www.oklink.com/xlayer'],
    nativeCurrency: {
      name: 'OKB',
      symbol: 'OKB',
      decimals: 18,
    },
    tokenDecimals: 6,
  },
  'base-mainnet': {
    chainId: '0x2105', // 8453 in hex (Base mainnet)
    name: 'Base Mainnet',
    rpcUrls: ['https://mainnet.base.org', 'https://developer-access-mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    tokenDecimals: 6,
  },
  'base-sepolia': {
    chainId: '0x14a34', // 84532 in hex
    name: 'Base Sepolia',
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    tokenDecimals: 6,
  },
};

/**
 * 获取代币合约地址
 */
export const getTokenContract = (
  network: NetworkType,
  token: TokenType
): string | null => {
  const { isProduction } = getCurrentEnvironment();
  const env = isProduction ? 'production' : 'test';

  return contractAddresses[network]?.[env]?.[token] || null;
};

/**
 * 获取网络配置
 */
export const getNetworkConfig = (network: NetworkType) => {
  const config = networkConfigs[network];
  if (!config) {
    throw new Error(`Unsupported network: ${network}`);
  }

  return {
    ...config,
    usdcContract: getTokenContract(network, 'usdc'),
    usdtContract: getTokenContract(network, 'usdt'),
  };
};

/**
 * 获取支持的代币列表
 */
export const getSupportedTokens = (network: NetworkType): TokenType[] => {
  const { isProduction } = getCurrentEnvironment();
  const env = isProduction ? 'production' : 'test';

  const tokens: TokenType[] = [];
  const networkContracts = contractAddresses[network]?.[env];

  if (networkContracts?.usdc) tokens.push('usdc');
  if (networkContracts?.usdt) tokens.push('usdt');

  return tokens;
};

/**
 * 验证网络和代币组合是否支持
 */
export const isTokenSupported = (
  network: NetworkType,
  token: TokenType
): boolean => {
  return getTokenContract(network, token) !== null;
};