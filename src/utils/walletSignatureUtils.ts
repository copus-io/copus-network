/**
 * Wallet Signature Utilities for Account Deletion
 *
 * Provides secure signature verification for wallet-based account deletion.
 * Users must sign a specific message to prove ownership of their wallet.
 */

/**
 * Parameters for wallet signature verification during account deletion
 */
export interface WalletDeleteSignatureParams {
  walletAddress: string;
  timestamp: number;
  reason?: string;
}

/**
 * Result of wallet signature verification
 */
export interface WalletSignatureResult {
  signature: string;
  message: string;
  timestamp: number;
  walletAddress: string;
}

/**
 * Generate a standardized message for wallet signature during account deletion.
 *
 * The message includes:
 * - Clear intent (account deletion)
 * - Wallet address
 * - Timestamp to prevent replay attacks
 * - Optional reason
 *
 * @param params - Signature parameters
 * @returns Standardized message string
 */
export function generateDeleteAccountMessage(params: WalletDeleteSignatureParams): string {
  const { walletAddress, timestamp, reason } = params;

  let message = `I want to delete my Copus account associated with wallet ${walletAddress}.\n\n`;
  message += `Timestamp: ${timestamp}\n`;
  message += `Date: ${new Date(timestamp * 1000).toISOString()}\n`;

  if (reason && reason.trim()) {
    message += `\nReason: ${reason.trim()}`;
  }

  message += `\n\nThis action is irreversible and will permanently delete all my data.`;

  return message;
}

/**
 * Request wallet signature for account deletion verification.
 *
 * This function:
 * 1. Generates a standardized deletion message
 * 2. Requests signature from the user's wallet
 * 3. Returns the signature and message for backend verification
 *
 * @param params - Signature parameters
 * @param provider - Ethereum provider (e.g., window.ethereum)
 * @returns Promise with signature result
 * @throws Error if user rejects signature or wallet is not available
 */
export async function signDeleteAccountMessage(
  params: WalletDeleteSignatureParams,
  provider: any
): Promise<WalletSignatureResult> {
  if (!provider) {
    throw new Error('Wallet provider not available');
  }

  // Generate the standardized message
  const message = generateDeleteAccountMessage(params);

  console.log('📝 Requesting signature for account deletion message:', message);

  try {
    // Request signature using personal_sign
    // This method is widely supported and shows the message clearly to the user
    const signature = await provider.request({
      method: 'personal_sign',
      params: [message, params.walletAddress]
    });

    console.log('✅ Account deletion signature obtained:', signature);

    return {
      signature,
      message,
      timestamp: params.timestamp,
      walletAddress: params.walletAddress
    };
  } catch (error: any) {
    console.error('❌ Failed to get account deletion signature:', error);

    if (error.code === 4001) {
      throw new Error('Signature rejected by user');
    } else {
      throw new Error('Failed to get wallet signature: ' + error.message);
    }
  }
}

/**
 * Verify if a wallet provider supports personal_sign method.
 *
 * @param provider - Ethereum provider to check
 * @returns Promise<boolean> - True if provider supports signing
 */
export async function supportsWalletSigning(provider: any): Promise<boolean> {
  try {
    if (!provider) return false;

    // Check if wallet is connected
    const accounts = await provider.request({ method: 'eth_accounts' });
    return accounts && accounts.length > 0;
  } catch {
    return false;
  }
}

/**
 * Get signature data from server for wallet verification.
 *
 * @param address - Wallet address
 * @returns Promise<any> - Signature data from server
 */
export async function getWalletSignatureData(address: string): Promise<any> {
  // Import apiRequest function
  const { apiRequest } = await import('../services/api');

  const endpoint = `/client/common/getSnowflake?address=${encodeURIComponent(address)}`;

  try {
    const response = await apiRequest<any>(endpoint, {
      method: 'GET',
      requiresAuth: false
    });

    console.log('✅ Got wallet signature data from server:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to get wallet signature data:', error);
    throw error;
  }
}