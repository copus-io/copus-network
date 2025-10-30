/**
 * x402 Payment Protocol Utilities
 *
 * Implements ERC-3009 TransferWithAuthorization for gasless USDC payments
 * according to the official x402 protocol specification.
 *
 * @see https://x402.gitbook.io/x402/getting-started/quickstart-for-buyers
 * @see https://eips.ethereum.org/EIPS/eip-3009
 */

export interface TransferWithAuthorizationParams {
  from: string;        // User's wallet address
  to: string;          // Payment recipient address
  value: string;       // Amount in smallest unit (e.g., 1000000 for 1 USDC with 6 decimals)
  validAfter: number;  // Unix timestamp after which the authorization is valid
  validBefore: number; // Unix timestamp before which the authorization is valid
  nonce: string;       // Unique random hex string (32 bytes)
}

export interface SignedAuthorization {
  from: string;
  to: string;
  value: string;
  validAfter: number;
  validBefore: number;
  nonce: string;
  v: number;
  r: string;
  s: string;
}

/**
 * EIP-712 Domain for USDC TransferWithAuthorization
 * Note: Domain parameters vary by network. These are for Base Sepolia.
 */
const EIP712_DOMAIN = {
  name: 'USD Coin',
  version: '2',
  chainId: 84532, // Base Sepolia
  verifyingContract: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' // USDC on Base Sepolia
};

/**
 * EIP-712 Type definition for TransferWithAuthorization
 */
const TRANSFER_WITH_AUTHORIZATION_TYPE = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' }
  ]
};

/**
 * Generate a random nonce for TransferWithAuthorization
 * @returns 32-byte hex string (66 characters including '0x' prefix)
 */
export function generateNonce(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return '0x' + Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Sign a TransferWithAuthorization message using EIP-712
 *
 * This creates a gasless payment authorization that the server can execute
 * on behalf of the user, paying the gas fees.
 *
 * @param params - Transfer authorization parameters
 * @param signer - Ethereum provider (e.g., window.ethereum)
 * @returns Signed authorization with v, r, s signature components
 */
export async function signTransferWithAuthorization(
  params: TransferWithAuthorizationParams,
  signer: any
): Promise<SignedAuthorization> {
  // Construct EIP-712 typed data
  const typedData = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      ...TRANSFER_WITH_AUTHORIZATION_TYPE
    },
    primaryType: 'TransferWithAuthorization',
    domain: EIP712_DOMAIN,
    message: {
      from: params.from,
      to: params.to,
      value: params.value,
      validAfter: params.validAfter,
      validBefore: params.validBefore,
      nonce: params.nonce
    }
  };

  // Sign using eth_signTypedData_v4
  const signature = await signer.request({
    method: 'eth_signTypedData_v4',
    params: [params.from, JSON.stringify(typedData)]
  });

  // Parse signature into v, r, s components
  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return {
    from: params.from,
    to: params.to,
    value: params.value,
    validAfter: params.validAfter,
    validBefore: params.validBefore,
    nonce: params.nonce,
    v,
    r,
    s
  };
}

/**
 * Create x402 X-PAYMENT header value
 *
 * Encodes the signed authorization as base64 for the X-PAYMENT header
 * according to x402 protocol specification.
 *
 * @param signedAuth - Signed transfer authorization
 * @param network - Network name (e.g., "base-sepolia")
 * @param asset - Token contract address
 * @returns Base64-encoded payment payload for X-PAYMENT header
 */
export function createX402PaymentHeader(
  signedAuth: SignedAuthorization,
  network: string = 'base-sepolia',
  asset: string = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
): string {
  // Create the inner payment authorization payload
  const paymentPayload = {
    network,
    asset,
    scheme: 'exact',
    from: signedAuth.from,
    to: signedAuth.to,
    value: signedAuth.value,
    validAfter: signedAuth.validAfter,
    validBefore: signedAuth.validBefore,
    nonce: signedAuth.nonce,
    signature: {
      v: signedAuth.v,
      r: signedAuth.r,
      s: signedAuth.s
    }
  };

  // Wrap in x402 protocol envelope
  const x402Envelope = {
    x402Version: 1,
    payload: paymentPayload
  };

  // Encode as base64
  const jsonString = JSON.stringify(x402Envelope);
  return btoa(jsonString);
}

/**
 * Check if wallet supports ERC-3009 TransferWithAuthorization
 *
 * @param provider - Ethereum provider
 * @returns true if eth_signTypedData_v4 is supported
 */
export async function supportsTransferWithAuthorization(provider: any): Promise<boolean> {
  try {
    // Check if the provider supports eth_signTypedData_v4
    const accounts = await provider.request({ method: 'eth_accounts' });
    return accounts && accounts.length > 0;
  } catch {
    return false;
  }
}
