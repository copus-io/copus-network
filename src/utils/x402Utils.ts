/**
 * x402 Payment Protocol Utilities
 *
 * Implements ERC-3009 TransferWithAuthorization for gasless USDC payments
 * according to the official x402 protocol specification.
 *
 * ## Overview
 * The x402 protocol uses HTTP 402 Payment Required status codes along with
 * ERC-3009 gasless payment authorizations. Users sign a message (no gas fees)
 * and the server executes the actual transfer on their behalf.
 *
 * ## Key Benefits
 * - No gas fees for users (server pays)
 * - Fast authorization (2-3 seconds vs 60+ seconds for transactions)
 * - Better UX with clear wallet signing interface
 * - Secure with EIP-712 typed signatures
 *
 * @see https://x402.gitbook.io/x402/getting-started/quickstart-for-buyers
 * @see https://eips.ethereum.org/EIPS/eip-3009
 * @module x402Utils
 */

/**
 * Parameters for creating a TransferWithAuthorization signature.
 *
 * @interface TransferWithAuthorizationParams
 * @property {string} from - User's wallet address (must be checksummed)
 * @property {string} to - Payment recipient address (must be checksummed)
 * @property {string} value - Amount in smallest unit (e.g., "1000000" for 1 USDC with 6 decimals)
 * @property {number} validAfter - Unix timestamp (seconds) after which the authorization is valid
 * @property {number} validBefore - Unix timestamp (seconds) before which the authorization is valid
 * @property {string} nonce - Unique random hex string (32 bytes, 66 chars with '0x' prefix)
 *
 * @example
 * ```typescript
 * const params: TransferWithAuthorizationParams = {
 *   from: '0x7447debdacae3638bdbac2f4a443c5615d3f007d',
 *   to: '0x95C2259343Bca2E1c1E6bd4F0CBe5b4C8ac2890F',
 *   value: '1000000', // 1 USDC (6 decimals)
 *   validAfter: Math.floor(Date.now() / 1000),
 *   validBefore: Math.floor(Date.now() / 1000) + 3600, // 1 hour validity
 *   nonce: generateNonce()
 * };
 * ```
 */
export interface TransferWithAuthorizationParams {
  from: string;
  to: string;
  value: string;
  validAfter: number;
  validBefore: number;
  nonce: string;
}

/**
 * Complete signed authorization including EIP-712 signature components.
 * This is returned from signTransferWithAuthorization() and used to create
 * the X-PAYMENT header.
 *
 * @interface SignedAuthorization
 * @property {string} from - User's wallet address
 * @property {string} to - Payment recipient address
 * @property {string} value - Amount in smallest unit
 * @property {number} validAfter - Unix timestamp after which authorization is valid
 * @property {number} validBefore - Unix timestamp before which authorization is valid
 * @property {string} nonce - Unique random hex string (32 bytes)
 * @property {number} v - ECDSA recovery parameter (27 or 28)
 * @property {string} r - ECDSA signature component r (32 bytes hex)
 * @property {string} s - ECDSA signature component s (32 bytes hex)
 *
 * @example
 * ```typescript
 * const signedAuth: SignedAuthorization = {
 *   from: '0x7447debdacae3638bdbac2f4a443c5615d3f007d',
 *   to: '0x95C2259343Bca2E1c1E6bd4F0CBe5b4C8ac2890F',
 *   value: '1000000',
 *   validAfter: 1735689600,
 *   validBefore: 1735693200,
 *   nonce: '0x...',
 *   v: 27,
 *   r: '0x...',
 *   s: '0x...'
 * };
 * ```
 */
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
 * EIP-712 Domain for USDC TransferWithAuthorization on Base mainnet.
 *
 * **CRITICAL:** All domain parameters must EXACTLY match the USDC contract's EIP-712 domain.
 * Backend uses 'USDC' as the domain name (confirmed from x402 error response).
 * These values are for Base mainnet production use.
 *
 * @constant
 * @type {Object}
 * @property {string} name - Token name ('USDC' - matches backend configuration)
 * @property {string} version - EIP-712 version (must match contract)
 * @property {number} chainId - Base mainnet chain ID (8453 = 0x2105)
 * @property {string} verifyingContract - USDC contract address on Base mainnet
 *
 * @see https://basescan.org/address/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
 */
/**
 * Get EIP-712 Domain for specific network and contract
 */
const getEIP712Domain = (chainId: number, contractAddress: string) => {
  return {
    name: 'USD Coin', // Standard USDC EIP-712 name
    version: '2',
    chainId: chainId,
    verifyingContract: contractAddress
  };
};

/**
 * Network-specific EIP-712 domain configurations
 */
const NETWORK_EIP712_DOMAINS: Record<number, any> = {
  // Base mainnet
  8453: {
    name: 'USD Coin',
    version: '2',
    chainId: 8453,
    verifyingContract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  },
  // Base Sepolia testnet - 使用正确的后端期望配置
  84532: {
    name: 'USDC',      // x402后端期望的配置
    version: '2',
    chainId: 84532,
    verifyingContract: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
  },
  // X Layer mainnet
  196: {
    name: 'USD Coin',
    version: '2',
    chainId: 196,
    verifyingContract: '0x74b7F16337b8972027F6196A17a631aC6dE26d22'
  }
};

// Legacy export for backward compatibility
const EIP712_DOMAIN = NETWORK_EIP712_DOMAINS[84532]; // Default to Base Sepolia config

/**
 * EIP-712 Type definition for TransferWithAuthorization.
 *
 * Defines the structure of the TransferWithAuthorization message that users sign.
 * This is part of the EIP-3009 standard for gasless token transfers.
 *
 * @constant
 * @type {Object}
 *
 * @see https://eips.ethereum.org/EIPS/eip-3009
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
 * Generate a cryptographically secure random nonce for TransferWithAuthorization.
 *
 * Each authorization requires a unique nonce to prevent replay attacks. The nonce
 * must be 32 bytes and should be generated fresh for each new authorization.
 *
 * @returns {string} A 32-byte hex string (66 characters including '0x' prefix)
 *
 * @example
 * ```typescript
 * const nonce = generateNonce();
 * // Example output: '0x1234567890abcdef...' (66 chars total)
 * console.log(nonce.length); // 66
 * console.log(nonce.startsWith('0x')); // true
 * ```
 *
 * @throws {Error} If crypto.getRandomValues is not available
 */
export function generateNonce(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return '0x' + Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Sign a TransferWithAuthorization message using EIP-712 typed data signing.
 *
 * This is the core function for creating gasless payment authorizations. The user
 * signs a structured message (not a transaction), and the server later executes
 * the actual transfer on their behalf, paying the gas fees.
 *
 * ## How It Works
 * 1. Constructs EIP-712 typed data structure
 * 2. Requests signature from wallet using eth_signTypedData_v4
 * 3. Parses signature into v, r, s components
 * 4. Returns complete authorization ready for server submission
 *
 * ## Security Notes
 * - User sees clear, structured data in wallet (not raw hex)
 * - Nonce prevents replay attacks
 * - Validity window limits authorization timeframe
 * - No gas fees charged to user
 *
 * @param {TransferWithAuthorizationParams} params - Transfer authorization parameters
 * @param {any} signer - Ethereum provider (e.g., window.ethereum from MetaMask)
 * @returns {Promise<SignedAuthorization>} Complete signed authorization with signature components
 *
 * @throws {Error} If user rejects signature or signer doesn't support eth_signTypedData_v4
 *
 * @example
 * ```typescript
 * const signedAuth = await signTransferWithAuthorization({
 *   from: '0x7447debdacae3638bdbac2f4a443c5615d3f007d',
 *   to: '0x95C2259343Bca2E1c1E6bd4F0CBe5b4C8ac2890F',
 *   value: '1000000', // 1 USDC
 *   validAfter: Math.floor(Date.now() / 1000),
 *   validBefore: Math.floor(Date.now() / 1000) + 3600,
 *   nonce: generateNonce()
 * }, window.ethereum);
 *
 * console.log('Signature v:', signedAuth.v); // 27 or 28
 * console.log('Signature r:', signedAuth.r); // 0x...
 * console.log('Signature s:', signedAuth.s); // 0x...
 * ```
 */
export async function signTransferWithAuthorization(
  params: TransferWithAuthorizationParams,
  signer: any,
  chainId?: number,
  contractAddress?: string
): Promise<SignedAuthorization> {
  // Get current chain ID if not provided
  let currentChainId = chainId;
  if (!currentChainId) {
    const chainIdHex = await signer.request({ method: 'eth_chainId' });
    currentChainId = parseInt(chainIdHex, 16);
  }

  // Determine EIP-712 domain
  let domain;
  if (contractAddress) {
    // Use network-specific domain but override the contract address
    const networkDomain = NETWORK_EIP712_DOMAINS[currentChainId] || NETWORK_EIP712_DOMAINS[84532];
    domain = { ...networkDomain, verifyingContract: contractAddress };
  } else {
    domain = NETWORK_EIP712_DOMAINS[currentChainId] || NETWORK_EIP712_DOMAINS[84532]; // fallback to Base Sepolia
  }


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
    domain: domain,
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
 * Create X-PAYMENT header value for x402 protocol requests.
 *
 * Takes a signed authorization and encodes it as base64 for the X-PAYMENT HTTP header.
 * The header is sent with the API request to unlock paid content.
 *
 * ## Payload Structure
 * The function wraps the signed authorization in the x402 protocol envelope:
 * ```json
 * {
 *   "x402Version": 1,
 *   "payload": {
 *     "network": "base",
 *     "asset": "0x036CbD...",
 *     "scheme": "exact",
 *     "from": "0x...",
 *     "to": "0x...",
 *     "value": "1000000",
 *     "validAfter": 1735689600,
 *     "validBefore": 1735693200,
 *     "nonce": "0x...",
 *     "signature": { "v": 27, "r": "0x...", "s": "0x..." }
 *   }
 * }
 * ```
 *
 * @param {SignedAuthorization} signedAuth - Signed transfer authorization from signTransferWithAuthorization()
 * @param {string} [network='base'] - Network identifier (default: 'base')
 * @param {string} [asset='0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'] - Token contract address (default: Base mainnet USDC)
 * @returns {string} Base64-encoded payment payload for X-PAYMENT header
 *
 * @example
 * ```typescript
 * // After getting signed authorization
 * const signedAuth = await signTransferWithAuthorization(params, window.ethereum);
 *
 * // Create X-PAYMENT header
 * const paymentHeader = createX402PaymentHeader(
 *   signedAuth,
 *   'base',
 *   '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
 * );
 *
 * // Use in fetch request
 * const response = await fetch('https://api.example.com/unlock', {
 *   headers: {
 *     'X-PAYMENT': paymentHeader
 *   }
 * });
 * ```
 *
 * @see https://x402.gitbook.io/x402/getting-started/quickstart-for-buyers
 */
export function createX402PaymentHeader(
  signedAuth: SignedAuthorization,
  network: string = 'base',
  asset: string = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
): string {
  // Combine signature components (v, r, s) into a single hex string
  // The official x402 spec expects a single signature string, not separate components
  const signature = signedAuth.r + signedAuth.s.slice(2) + signedAuth.v.toString(16).padStart(2, '0');

  // Create payment payload following the official x402 specification
  // Structure from: https://github.com/coinbase/x402/tree/main/examples/typescript
  const paymentPayload = {
    x402Version: 1,
    scheme: 'exact',
    network,
    payload: {
      signature,
      authorization: {
        from: signedAuth.from,
        to: signedAuth.to,
        value: signedAuth.value,
        validAfter: signedAuth.validAfter.toString(),
        validBefore: signedAuth.validBefore.toString(),
        nonce: signedAuth.nonce
      }
    }
  };

  // Encode as base64
  const jsonString = JSON.stringify(paymentPayload);
  return btoa(jsonString);
}


/**
 * Check if wallet provider supports ERC-3009 TransferWithAuthorization.
 *
 * Validates that the wallet has connected accounts. This is a basic check to ensure
 * the wallet is available before attempting to sign authorizations.
 *
 * **Note:** This function only checks for connected accounts, not specifically for
 * eth_signTypedData_v4 support. Most modern wallets (MetaMask, Coinbase Wallet, etc.)
 * support EIP-712 typed data signing.
 *
 * @param {any} provider - Ethereum provider (e.g., window.ethereum)
 * @returns {Promise<boolean>} True if wallet has connected accounts, false otherwise
 *
 * @example
 * ```typescript
 * if (await supportsTransferWithAuthorization(window.ethereum)) {
 *   // Proceed with payment authorization
 *   const signedAuth = await signTransferWithAuthorization(params, window.ethereum);
 * } else {
 *   console.error('Wallet not connected or not supported');
 * }
 * ```
 */
export async function supportsTransferWithAuthorization(provider: any): Promise<boolean> {
  try {
    // Check if the provider has connected accounts
    const accounts = await provider.request({ method: 'eth_accounts' });
    return accounts && accounts.length > 0;
  } catch {
    return false;
  }
}