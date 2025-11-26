/**
 * Smart contract address configuration
 * Returns correct contract addresses based on environment and network
 */

import { getCurrentEnvironment } from '../utils/envUtils';

export type NetworkType = 'xlayer' | 'base-sepolia' | 'base-mainnet';
export type TokenType = 'usdc' | 'usdt';

/**
 * Contract address configuration mapping
 */
const contractAddresses = {
  // X Layer Network
  xlayer: {
    production: {
      usdc: '0x74b7F16337b8972027F6196A17a631aC6dE26d22',
      usdt: '0x779ded0c9e1022225f8e0630b35a9b54be713736',
    },
    test: {
      usdc: '0x74b7F16337b8972027F6196A17a631aC6dE26d22', // X Layer mainnet USDC contract (forced mainnet)
      usdt: '0x779ded0c9e1022225f8e0630b35a9b54be713736', // X Layer mainnet USDT contract (forced mainnet)
    },
  },
  // Base Mainnet Network
  'base-mainnet': {
    production: {
      usdc: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // Base mainnet USDC contract
      usdt: null, // Base mainnet has no standard USDT
    },
    test: {
      usdc: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // Base mainnet USDC contract (forced mainnet)
      usdt: null, // Base mainnet has no standard USDT
    },
  },
  // Base Sepolia Network (testnet)
  'base-sepolia': {
    production: {
      usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia is always testnet
      usdt: null, // Base Sepolia has no USDT
    },
    test: {
      usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia is always testnet
      usdt: null, // Base Sepolia has no USDT
    },
  },
};

/**
 * Network configuration
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
 * Get token contract address
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
 * Get network configuration
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
 * Get supported token list
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
 * Validate if network and token combination is supported
 */
export const isTokenSupported = (
  network: NetworkType,
  token: TokenType
): boolean => {
  return getTokenContract(network, token) !== null;
};