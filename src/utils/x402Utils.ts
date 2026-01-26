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

// Import OKX library dynamically to avoid early Buffer issues
// import { EthWallet, MessageTypes } from '@okxweb3/coin-ethereum';

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
  // Base Sepolia testnet - using correct backend expected configuration
  84532: {
    name: 'USDC',      // x402 backend expected configuration
    version: '2',
    chainId: 84532,
    verifyingContract: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
  },
  // X Layer mainnet - supports both USDC and USDT
  196: {
    usdc: {
      name: 'USD Coin',
      version: '2',
      chainId: 196,
      verifyingContract: '0x74b7F16337b8972027F6196A17a631aC6dE26d22'
    },
    usdt: {
      name: 'USD₮0',
      version: '1',
      chainId: 196,
      verifyingContract: '0x779ded0c9e1022225f8e0630b35a9b54be713736'
    }
  },
  // X Layer testnet (1952)
  1952: {
    usdc: {
      name: 'USD Coin',
      version: '2',
      chainId: 1952,
      verifyingContract: '0xcb8bf24c6ce16ad21d707c9505421a17f2bec79d'
    },
    usdt: {
      name: 'USD₮0',
      version: '1',
      chainId: 1952,
      verifyingContract: null // X Layer testnet USDT contract not available
    }
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
  contractAddress?: string,
  asset?: string
): Promise<SignedAuthorization> {
  console.log('📝 开始签名流程 -', asset?.toUpperCase() || 'USDC');

  // 获取当前链ID（如果未提供）
  let currentChainId = chainId;
  if (!currentChainId) {
    const chainIdHex = await signer.request({ method: 'eth_chainId' });
    currentChainId = parseInt(chainIdHex, 16);
    console.log('🔗 自动检测到链ID:', { 十六进制: chainIdHex, 十进制: currentChainId });
  } else {
    console.log('🔗 使用提供的链ID:', currentChainId);
  }

  // Determine EIP-712 domain
  let domain;
  if (contractAddress) {
    // Use network-specific domain but override the contract address
    let networkDomain;
    if (currentChainId === 196 && asset) {
      // X Layer mainnet with specific asset (USDC or USDT)
      const xlayerDomains = NETWORK_EIP712_DOMAINS[196];
      if (asset.toLowerCase() === 'usdt' && xlayerDomains.usdt) {
        networkDomain = xlayerDomains.usdt;
        console.log('🪙 使用X Layer USDT域配置');
      } else if (asset.toLowerCase() === 'usdc' && xlayerDomains.usdc) {
        networkDomain = xlayerDomains.usdc;
        console.log('🪙 使用X Layer USDC域配置');
      } else {
        // Default to USDC if asset not specified or not found
        networkDomain = xlayerDomains.usdc;
        console.log('🪙 使用X Layer USDC域配置 (默认)');
      }
    } else {
      networkDomain = NETWORK_EIP712_DOMAINS[currentChainId] || NETWORK_EIP712_DOMAINS[84532];
      console.log('🪙 使用标准网络域配置 for chain:', currentChainId);
    }
    domain = { ...networkDomain, verifyingContract: contractAddress };
    console.log('🏗️ 使用提供的合约地址覆盖域配置:', contractAddress);
  } else {
    // No contract address provided, use default network domain
    if (currentChainId === 196 && asset) {
      // X Layer mainnet with specific asset
      const xlayerDomains = NETWORK_EIP712_DOMAINS[196];
      if (asset.toLowerCase() === 'usdt' && xlayerDomains.usdt) {
        domain = xlayerDomains.usdt;
        console.log('🪙 使用X Layer USDT域配置 (无自定义合约)');
      } else if (asset.toLowerCase() === 'usdc' && xlayerDomains.usdc) {
        domain = xlayerDomains.usdc;
        console.log('🪙 使用X Layer USDC域配置 (无自定义合约)');
      } else {
        // Default to USDC if asset not specified or not found
        domain = xlayerDomains.usdc;
        console.log('🪙 使用X Layer USDC域配置 (默认，无自定义合约)');
      }
    } else {
      domain = NETWORK_EIP712_DOMAINS[currentChainId] || NETWORK_EIP712_DOMAINS[84532]; // fallback to Base Sepolia
      console.log('🪙 使用标准网络域配置 (无自定义合约) for chain:', currentChainId);
    }
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

  console.log('🔐 准备签名 -', asset?.toUpperCase() || 'USDC', '域:', typedData.domain.name);

  console.log('📤 向钱包发送签名请求...');

  // Sign using eth_signTypedData_v4
  const signature = await signer.request({
    method: 'eth_signTypedData_v4',
    params: [params.from, JSON.stringify(typedData)]
  });

  // 解析签名为v, r, s组件
  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const vHex = signature.slice(130, 132);
  const v = parseInt(vHex, 16);

  console.log('✅ 签名成功生成 -', asset?.toUpperCase() || 'USDC', 'on chain', currentChainId);

  const signedAuthorization = {
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

  console.log('✅ 最终签名授权:', signedAuthorization);
  console.log('📝 ========== 签名流程结束 ==========');

  return signedAuthorization;
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
 *   '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' // USDC on Base mainnet
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
  asset: string = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
): string {
  console.log('💳 ========== 开始创建X402支付头 ==========');
  console.log('🔍 X-PAYMENT头的输入参数:');
  console.log('  📍 网络:', network);
  console.log('  🪙 资产合约:', asset);
  console.log('  ✍️ 签名授权:', signedAuth);

  // 将签名组件(v, r, s)组合成单个十六进制字符串
  // x402官方规范要求单个签名字符串，而不是分离的组件
  const vHex = signedAuth.v.toString(16).padStart(2, '0');
  const signature = signedAuth.r + signedAuth.s.slice(2) + vHex;

  console.log('🔗 签名组合过程:');
  console.log('  r组件:', signedAuth.r);
  console.log('  s组件:', signedAuth.s, '(截取从位置2):', signedAuth.s.slice(2));
  console.log('  v组件(十进制):', signedAuth.v);
  console.log('  v组件(十六进制填充):', vHex);
  console.log('  📝 组合后的签名:', signature);

  // Create payment payload following the official x402 specification
  // Structure from: https://github.com/coinbase/x402/tree/main/examples/typescript
  const paymentPayload: any = {
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

  console.log('🏗️ 基础支付载荷结构:');
  console.log('  x402版本:', paymentPayload.x402Version);
  console.log('  方案类型:', paymentPayload.scheme);
  console.log('  网络名称:', paymentPayload.network);
  console.log('  载荷签名:', paymentPayload.payload.signature);
  console.log('  载荷授权:', paymentPayload.payload.authorization);

  // 为XLayer网络添加链索引（字符串格式）
  if (network === 'xlayer') {
    paymentPayload.payload.chainIndex = "196"; // XLayer链ID字符串格式
    console.log('🔗 为XLayer添加了链索引:', paymentPayload.payload.chainIndex);
  }

  // 编码为base64
  const jsonString = JSON.stringify(paymentPayload);
  console.log('📦 最终支付载荷(base64编码前):');
  console.log('  💰 JSON字符串长度:', jsonString.length);
  console.log('  💰 完整JSON载荷:', jsonString);
  console.log('  💰 解析JSON验证:', JSON.parse(jsonString));

  const base64Header = btoa(jsonString);
  console.log('🔐 Base64编码的X-PAYMENT头:');
  console.log('  📏 头部长度:', base64Header.length);
  console.log('  📦 头部值:', base64Header);

  // 解码并验证头部用于调试
  try {
    const decodedForVerification = JSON.parse(atob(base64Header));
    console.log('✅ 头部解码验证成功:', decodedForVerification);
  } catch (error) {
    console.error('❌ 头部解码验证失败:', error);
  }

  console.log('💳 ========== X402支付头创建结束 ==========');
  return base64Header;
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

/**
 * OKX-specific signature generation method for x402 payments (DISABLED for now).
 *
 * This function would use the @okxweb3/coin-ethereum library but is currently
 * disabled due to Buffer compatibility issues in browser environment.
 */
export async function signTransferWithAuthorizationOKX(
  params: TransferWithAuthorizationParams,
  privateKey: string,
  chainId: number,
  contractAddress: string
): Promise<SignedAuthorization> {
  throw new Error('OKX library signature method temporarily disabled due to Buffer compatibility issues');
}

/**
 * Browser-compatible OKX signing method that works with wallet providers.
 *
 * Uses the exact EIP-712 format from OKX documentation PDF but works with
 * browser wallet providers instead of requiring private keys.
 */
export async function signTransferWithAuthorizationOKXBrowser(
  params: TransferWithAuthorizationParams,
  provider: any,
  chainId: number,
  contractAddress: string,
  asset?: string
): Promise<SignedAuthorization> {
  console.log('🦊 ========== OKX SIGNING PROCESS START ==========');
  console.log('🦊 [OKX] Using OKX-compatible EIP-712 format for signing...');
  console.log('🦊 [OKX] 开始OKX签名流程 -', asset?.toUpperCase() || 'USDC');

  // Determine domain configuration based on asset and network
  let domainConfig;
  if (chainId === 196 && asset) {
    // X Layer mainnet with specific asset (USDC or USDT)
    const xlayerDomains = NETWORK_EIP712_DOMAINS[196];
    if (asset.toLowerCase() === 'usdt' && xlayerDomains.usdt) {
      domainConfig = xlayerDomains.usdt;
      console.log('🦊 [OKX] 使用X Layer USDT域配置');
    } else if (asset.toLowerCase() === 'usdc' && xlayerDomains.usdc) {
      domainConfig = xlayerDomains.usdc;
      console.log('🦊 [OKX] 使用X Layer USDC域配置');
    } else {
      // Default to USDC if asset not specified or not found
      domainConfig = xlayerDomains.usdc;
      console.log('🦊 [OKX] 使用X Layer USDC域配置 (默认)');
    }
  } else {
    // Use default USDC configuration for other networks
    domainConfig = {
      name: "USD Coin",
      version: "2",
      chainId: chainId,
      verifyingContract: contractAddress
    };
    console.log('🦊 [OKX] 使用标准USDC域配置 for chain:', chainId);
  }

  // Get the correct domain name and version based on the contract address
  const isUSDTContract = contractAddress.toLowerCase() === '0x779ded0c9e1022225f8e0630b35a9b54be713736';
  const domainName = isUSDTContract ? 'USD₮0' : 'USD Coin';

  // Get correct version from network configuration
  const networkConfig = NETWORK_EIP712_DOMAINS[chainId];
  const domainVersion = networkConfig ? networkConfig.version : '2'; // fallback to '2'

  console.log('🔍 Contract analysis:', {
    contractAddress: contractAddress.toLowerCase(),
    isUSDTContract,
    domainName,
    domainVersion,
    chainId,
    expectedUSDT: '0x779ded0c9e1022225f8e0630b35a9b54be713736'
  });

  // Construct message parameters exactly as shown in OKX PDF documentation
  const msgParams = {
    "domain": {
      "chainId": chainId, // Use number format to match uint256 type
      "name": domainConfig.name,
      "version": domainConfig.version,
      "verifyingContract": contractAddress.toLowerCase() // Ensure lowercase
    },
    "message": {
      "from": params.from.toLowerCase(),
      "to": params.to.toLowerCase(),
      "value": params.value, // Use BigInt/number to match uint256 type
      "validAfter": params.validAfter, // Use BigInt/number to match uint256 type
      "validBefore": params.validBefore, // Use BigInt/number to match uint256 type
      "nonce": params.nonce // Keep as hex string for bytes32
    },
    "primaryType": "TransferWithAuthorization",
    "types": {
      "EIP712Domain": [
        { "name": "name", "type": "string" },
        { "name": "version", "type": "string" },
        { "name": "chainId", "type": "uint256" },
        { "name": "verifyingContract", "type": "address" }
      ],
      "TransferWithAuthorization": [
        { "name": "from", "type": "address" },
        { "name": "to", "type": "address" },
        { "name": "value", "type": "uint256" },
        { "name": "validAfter", "type": "uint256" },
        { "name": "validBefore", "type": "uint256" },
        { "name": "nonce", "type": "bytes32" }
      ]
    }
  };

  console.log('🦊 [OKX] 准备签名 -', asset?.toUpperCase() || 'USDC', '域:', domainConfig.name);

  // Create the exact data structure from PDF documentation
  const messageString = JSON.stringify(msgParams);
  const data = {
    type: "TYPE_DATA_V4", // Simulating MessageTypes.TYPE_DATA_V4
    message: messageString,
  };

  console.log('🦊 [OKX] Data structure created from OKX PDF format:');
  console.log('🦊 [OKX] Data Type:', data.type);
  console.log('🦊 [OKX] Message String Length:', messageString.length);
  console.log('🦊 [OKX] Message String (first 200 chars):', messageString.substring(0, 200) + '...');
  console.log('🦊 [OKX] Complete Data Object:', {
    type: data.type,
    messageStringLength: messageString.length,
    domainInfo: {
      name: msgParams.domain.name,
      version: msgParams.domain.version,
      chainId: msgParams.domain.chainId,
      verifyingContract: msgParams.domain.verifyingContract
    },
    messagePreview: {
      domain: msgParams.domain,
      from: msgParams.message.from,
      to: msgParams.message.to,
      value: msgParams.message.value,
      validAfter: msgParams.message.validAfter,
      validBefore: msgParams.message.validBefore,
      nonce: msgParams.message.nonce
    }
  });
  console.log('🦊 [OKX] Full Message String for OKX:', messageString);

  console.log('🔍 Full EIP-712 structure as JSON:', JSON.stringify(msgParams, null, 2));

  // Try OKX-style signing first (if available)
  let signature;
  try {
    // Check if wallet supports OKX-style message signing
    if (provider.isOKXWallet) {
      console.log('🦊 [OKX] Attempting OKX wallet-specific signing method...');
      console.log('🦊 [OKX] OKX Signing Request:', {
        method: 'okx_signTypedData',
        from: params.from,
        dataObject: data
      });

      // Some OKX wallets might support this format
      signature = await provider.request({
        method: 'okx_signTypedData', // OKX-specific method if it exists
        params: [params.from, data]
      });

      console.log('🦊 [OKX] OKX-specific method succeeded:', signature);
    }
  } catch (okxError) {
    console.log('🦊 [OKX] OKX-specific method failed, using standard EIP-712:', okxError);
    console.log('🦊 [OKX] Error details:', {
      message: okxError.message,
      code: okxError.code,
      name: okxError.name
    });
  }

  // Fallback to standard EIP-712 signing with OKX-formatted data
  if (!signature) {
    console.log('🦊 [OKX] Using standard eth_signTypedData_v4 method with OKX format...');
    console.log('🦊 [OKX] Standard Signing Request:', {
      method: 'eth_signTypedData_v4',
      from: params.from,
      messageStringLength: messageString.length
    });
    console.log('🦊 [OKX] Sending to OKX wallet:', messageString);

    signature = await provider.request({
      method: 'eth_signTypedData_v4',
      params: [params.from, messageString]
    });

    console.log('🦊 [OKX] Standard method succeeded with OKX format');
  }

  // Parse signature into v, r, s components
  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const vHex = signature.slice(130, 132);
  const v = parseInt(vHex, 16);

  console.log('🦊 ✅ OKX签名成功生成 -', asset?.toUpperCase() || 'USDC', 'on chain', chainId);

  const finalResult = {
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

  console.log('🦊 [OKX] Final OKX signed authorization:', finalResult);
  console.log('🦊 ========== OKX SIGNING PROCESS END ==========');

  return finalResult;
}