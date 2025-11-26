/**
 * Payment API interfaces for OKX integration
 */

/**
 * Request interface for OKX payment getTargetUrl endpoint
 */
export interface OKXPaymentRequest {
  /**
   * Article UUID
   */
  uuid: string;
  [property: string]: any;
}

/**
 * Token information for EIP-712 signing
 */
export interface TokenInfo {
  /**
   * Token name for display purposes
   */
  name: string;
  /**
   * Smart contract address for signature verification
   */
  verifyingContract: string;
}

/**
 * Supported tokens configuration
 */
export const SUPPORTED_TOKENS = {
  usdc: {
    name: 'USD Coin',
    verifyingContract: '0x74b7f16337b8972027f6196a17a631ac6de26d22'
  },
  usdt: {
    name: 'USDT',
    verifyingContract: '0x779ded0c9e1022225f8e0630b35a9b54be713736'
  }
} as const;

export type SupportedTokenType = keyof typeof SUPPORTED_TOKENS;