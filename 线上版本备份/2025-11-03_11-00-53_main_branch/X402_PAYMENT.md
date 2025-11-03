# x402 Payment Protocol Integration Guide

## Table of Contents
- [Overview](#overview)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Implementation](#implementation)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)

---

## Overview

The x402 protocol enables pay-per-view content using HTTP 402 Payment Required status codes combined with ERC-3009 gasless payment authorizations. This integration allows users to pay for premium content using USDC on Base Sepolia **without paying gas fees**.

### Key Benefits

✅ **Gasless Payments** - Users sign a message (no transaction), server pays gas
✅ **Fast** - Completes in 2-3 seconds vs 60+ seconds for regular blockchain transactions
✅ **Secure** - Uses EIP-712 typed data signatures with replay attack protection
✅ **User-Friendly** - Clear wallet signing interface, no confusing transaction details

### Tech Stack

- **Protocol**: [x402](https://x402.gitbook.io/x402)
- **Payment Standard**: [ERC-3009 TransferWithAuthorization](https://eips.ethereum.org/EIPS/eip-3009)
- **Network**: Base Sepolia (testnet)
- **Token**: USDC (0x036CbD53842c5426634e7929541eC2318f3dCF7e)
- **Signature Standard**: EIP-712 Typed Data

---

## How It Works

### Traditional Blockchain Payment vs x402

#### ❌ Traditional Payment Flow (60+ seconds):
```
1. User initiates transaction
2. MetaMask shows transaction with gas fees
3. User approves and pays gas
4. Wait for transaction to be mined (~30-60 seconds)
5. Wait for confirmations
6. Content unlocked
```

#### ✅ x402 Payment Flow (2-3 seconds):
```
1. User signs authorization message (NO GAS!)
2. Server receives signed authorization
3. Server executes transfer on-chain (server pays gas)
4. Content unlocked immediately
```

### ERC-3009 TransferWithAuthorization

ERC-3009 is an extension of the ERC-20 token standard that allows gasless token transfers through **meta-transactions**:

```solidity
function transferWithAuthorization(
    address from,
    address to,
    uint256 value,
    uint256 validAfter,
    uint256 validBefore,
    bytes32 nonce,
    uint8 v,
    bytes32 r,
    bytes32 s
) external;
```

**How it works:**
1. User signs a structured message (EIP-712) authorizing the transfer
2. Message includes: from, to, amount, validity window, and unique nonce
3. Server calls `transferWithAuthorization()` with the signature
4. USDC contract validates the signature and executes the transfer
5. Server pays the gas fees, not the user

---

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      User Browser                            │
│                                                              │
│  ┌────────────────┐     ┌─────────────────────────────┐    │
│  │  Content.tsx   │────▶│  WalletSignInModal.tsx      │    │
│  │  (Work page)   │     │  (Wallet selection)         │    │
│  └────────┬───────┘     └─────────────────────────────┘    │
│           │                                                  │
│           ▼                                                  │
│  ┌────────────────┐     ┌─────────────────────────────┐    │
│  │ MetaMask       │────▶│  PayConfirmModal.tsx        │    │
│  │ (Signature)    │     │  (Payment confirmation)     │    │
│  └────────┬───────┘     └─────────────────────────────┘    │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           x402Utils.ts                               │   │
│  │  - generateNonce()                                   │   │
│  │  - signTransferWithAuthorization()                   │   │
│  │  - createX402PaymentHeader()                         │   │
│  └────────┬────────────────────────────────────────────┘   │
└───────────┼──────────────────────────────────────────────┘
            │ X-PAYMENT: base64(signedAuth)
            ▼
┌─────────────────────────────────────────────────────────────┐
│                   x402 Backend Server                        │
│                                                              │
│  1. Validate signature                                       │
│  2. Call USDC.transferWithAuthorization()                    │
│  3. Pay gas fees                                             │
│  4. Return unlocked URL                                      │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│              Base Sepolia Blockchain                         │
│                                                              │
│  USDC Contract: 0x036CbD53842c5426634e7929541eC2318f3dCF7e │
│  - Validates EIP-712 signature                               │
│  - Executes transfer from user to seller                     │
│  - Emits Transfer event                                      │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
src/
├── screens/Content/Content.tsx              # Main payment flow
├── components/
│   ├── WalletSignInModal/                   # Wallet selection UI
│   │   └── WalletSignInModal.tsx
│   └── PayConfirmModal/                     # Payment confirmation UI
│       └── PayConfirmModal.tsx
├── utils/x402Utils.ts                       # Core x402 utilities
└── types/article.ts                         # Payment type definitions
```

---

## Implementation

### Step 1: Fetch Payment Information

When user clicks "Unlock now", fetch payment details from the x402 API:

```typescript
// GET https://api-test.copus.network/copus-node-api/api/x402/getUrl?uuid={articleId}
const response = await fetch(x402Url);
const data = await response.json();

// Response format:
{
  "accepts": [{
    "payTo": "0x95C2259343Bca2E1c1E6bd4F0CBe5b4C8ac2890F",
    "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "maxAmountRequired": "10000",
    "network": "base-sepolia",
    "resource": "https://api-test.copus.network/copus-node-api/api/x402/unlock/abc123"
  }]
}
```

### Step 2: Connect Wallet

Connect MetaMask and fetch USDC balance:

```typescript
// Request wallet connection
const accounts = await window.ethereum.request({
  method: 'eth_requestAccounts'
});
const walletAddress = accounts[0];

// Fetch USDC balance using ERC-20 balanceOf
const data = '0x70a08231' + walletAddress.slice(2).padStart(64, '0');
const balance = await window.ethereum.request({
  method: 'eth_call',
  params: [{
    to: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC
    data: data
  }, 'latest']
});
```

### Step 3: Create Payment Authorization

Generate nonce and sign the authorization:

```typescript
import {
  generateNonce,
  signTransferWithAuthorization,
  createX402PaymentHeader
} from './utils/x402Utils';

// Generate unique nonce for this authorization
const nonce = generateNonce();

// Set validity window (1 hour)
const now = Math.floor(Date.now() / 1000);
const validAfter = now;
const validBefore = now + 3600;

// Sign the authorization (user sees MetaMask popup)
const signedAuth = await signTransferWithAuthorization({
  from: walletAddress,              // User's address
  to: paymentInfo.payTo,            // Seller's address
  value: paymentInfo.amount,        // Amount in smallest unit
  validAfter,                       // When valid
  validBefore,                      // When expires
  nonce                             // Unique ID
}, window.ethereum);
```

### Step 4: Send Payment to Server

Create X-PAYMENT header and unlock content:

```typescript
// Create base64-encoded X-PAYMENT header
const paymentHeader = createX402PaymentHeader(
  signedAuth,
  'base-sepolia',
  '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
);

// Send to x402 API
const unlockResponse = await fetch(paymentInfo.resource, {
  headers: {
    'X-PAYMENT': paymentHeader
  }
});

const unlockData = await unlockResponse.json();
// unlockData.targetUrl contains the unlocked content URL
```

### X-PAYMENT Header Format

The X-PAYMENT header contains a base64-encoded JSON payload:

```json
{
  "x402Version": 1,
  "payload": {
    "network": "base-sepolia",
    "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "chainId": "84532",
    "scheme": "exact",
    "from": "0x7447debdacae3638bdbac2f4a443c5615d3f007d",
    "to": "0x95C2259343Bca2E1c1E6bd4F0CBe5b4C8ac2890F",
    "value": "10000",
    "validAfter": 1735689600,
    "validBefore": 1735693200,
    "nonce": "0x1234567890abcdef...",
    "signature": {
      "v": 27,
      "r": "0xabcd...",
      "s": "0xef01..."
    }
  }
}
```

---

## Testing

### Prerequisites

1. **MetaMask installed** with Base Sepolia network added
2. **Test USDC** on Base Sepolia
   - Get from faucet: [link to faucet]
3. **Test article** with `targetUrlIsLocked: true` and `priceInfo`

### Manual Test Flow

1. **Navigate to locked content**
   ```
   http://localhost:5177/work/{uuid}
   ```
   - Should see "Unlock now" button and x402 badge

2. **Click "Unlock now"**
   - Should show wallet selection modal
   - Select MetaMask

3. **Connect wallet**
   - MetaMask popup appears
   - Select account
   - Should show payment confirmation modal with:
     - Wallet address
     - USDC balance
     - Amount to pay
     - Network (Base Sepolia)

4. **Click "Pay now"**
   - If on wrong network: MetaMask asks to switch to Base Sepolia
   - MetaMask shows signature request (NOT transaction)
   - Should see structured data:
     ```
     from: 0x...
     to: 0x...
     value: 10000
     validAfter: 1735689600
     validBefore: 1735693200
     nonce: 0x...
     ```

5. **Sign authorization**
   - Click "Sign" in MetaMask
   - Should see "Payment authorization signed! Unlocking content..."
   - Content unlocks and opens in new tab
   - No gas fees charged!

### Test Cases

| Test Case | Expected Result |
|-----------|----------------|
| User not logged in | Redirect to login |
| Insufficient USDC balance | "Insufficient balance" error, Pay button disabled |
| User rejects signature | "Signature cancelled" toast |
| Wrong network | Prompt to switch/add Base Sepolia |
| Invalid payment info | "Payment information not available" error |
| Backend error | "Payment failed" with error details |

### Debug Logging

The payment flow includes emoji-prefixed console logs for easy debugging:

- 📥 Received payment option from API
- 💾 Storing payment info to state
- 🔍 Payment info retrieved for signing
- 📤 Sending X-PAYMENT payload to server

### Common Issues

#### "Invalid network" error
- **Cause**: `chainId` sent as number instead of string
- **Fix**: Ensure `chainId: '84532'` (string, not number)

#### Payment works but content doesn't unlock
- **Cause**: Server returned success but no `targetUrl`
- **Check**: Server response format, verify unlock logic

#### MetaMask shows raw transaction instead of typed data
- **Cause**: Using `eth_sendTransaction` instead of `eth_signTypedData_v4`
- **Fix**: Use `signTransferWithAuthorization()` from x402Utils

---

## Troubleshooting

### User Sees Gas Fees

**Problem**: User is being asked to pay gas fees
**Cause**: Code is sending a transaction instead of requesting a signature

**Solution**: Ensure you're using `eth_signTypedData_v4`, not `eth_sendTransaction`:
```typescript
// ✅ CORRECT (gasless)
const signature = await signer.request({
  method: 'eth_signTypedData_v4',
  params: [from, JSON.stringify(typedData)]
});

// ❌ WRONG (costs gas)
const txHash = await signer.request({
  method: 'eth_sendTransaction',
  params: [{ from, to, value, data }]
});
```

### Payment Fails with "Invalid network"

**Problem**: Backend returns `{"x402Version": 1, "error": "Invalid network"}`
**Cause**: Missing or incorrect `chainId` field in payload

**Solution**: Ensure `chainId` is a **string**, not a number:
```typescript
// ✅ CORRECT
chainId: '84532'

// ❌ WRONG
chainId: 84532
```

### Signature Verification Fails

**Problem**: Backend returns signature validation error
**Possible Causes**:

1. **Wrong EIP-712 domain**
   - Check `name`, `version`, `chainId`, `verifyingContract` match USDC contract

2. **Wrong nonce format**
   - Must be 32 bytes (66 chars with '0x' prefix)
   - Use `generateNonce()` from x402Utils

3. **Expired authorization**
   - Check `validBefore` timestamp hasn't passed
   - Ensure clock is synchronized

### Balance Shows $0.00 but User Has USDC

**Problem**: USDC balance shows as 0.00 despite user having funds
**Cause**: Reading balance from wrong network or contract

**Solution**: Verify you're reading from correct USDC contract on Base Sepolia:
```typescript
const usdcContractAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const chainId = await window.ethereum.request({ method: 'eth_chainId' });
// chainId should be '0x14a34' (84532 in hex)
```

---

## API Reference

### generateNonce()

Generates a cryptographically secure 32-byte random nonce.

```typescript
function generateNonce(): string
```

**Returns**: 32-byte hex string (66 characters including '0x' prefix)

**Example**:
```typescript
const nonce = generateNonce();
// "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
```

---

### signTransferWithAuthorization()

Signs a TransferWithAuthorization message using EIP-712 typed data signing.

```typescript
async function signTransferWithAuthorization(
  params: TransferWithAuthorizationParams,
  signer: any
): Promise<SignedAuthorization>
```

**Parameters**:
- `params.from` - User's wallet address (checksummed)
- `params.to` - Payment recipient address (checksummed)
- `params.value` - Amount in smallest unit (e.g., "1000000" for 1 USDC)
- `params.validAfter` - Unix timestamp (seconds) when authorization becomes valid
- `params.validBefore` - Unix timestamp (seconds) when authorization expires
- `params.nonce` - Unique 32-byte hex string from `generateNonce()`
- `signer` - Ethereum provider (e.g., `window.ethereum`)

**Returns**: `SignedAuthorization` object with signature components (v, r, s)

**Throws**: Error if user rejects signature or signer doesn't support EIP-712

**Example**:
```typescript
const signedAuth = await signTransferWithAuthorization({
  from: '0x7447debdacae3638bdbac2f4a443c5615d3f007d',
  to: '0x95C2259343Bca2E1c1E6bd4F0CBe5b4C8ac2890F',
  value: '1000000',
  validAfter: Math.floor(Date.now() / 1000),
  validBefore: Math.floor(Date.now() / 1000) + 3600,
  nonce: generateNonce()
}, window.ethereum);
```

---

### createX402PaymentHeader()

Creates base64-encoded X-PAYMENT header value for x402 protocol requests.

```typescript
function createX402PaymentHeader(
  signedAuth: SignedAuthorization,
  network?: string,
  asset?: string
): string
```

**Parameters**:
- `signedAuth` - Signed authorization from `signTransferWithAuthorization()`
- `network` - Network identifier (default: 'base-sepolia')
- `asset` - Token contract address (default: Base Sepolia USDC)

**Returns**: Base64-encoded payment payload for X-PAYMENT header

**Example**:
```typescript
const paymentHeader = createX402PaymentHeader(
  signedAuth,
  'base-sepolia',
  '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
);

const response = await fetch('https://api.example.com/unlock', {
  headers: {
    'X-PAYMENT': paymentHeader
  }
});
```

---

## Additional Resources

- [x402 Protocol Documentation](https://x402.gitbook.io/x402)
- [EIP-3009 Specification](https://eips.ethereum.org/EIPS/eip-3009)
- [EIP-712 Typed Data Signing](https://eips.ethereum.org/EIPS/eip-712)
- [Base Sepolia USDC Contract](https://sepolia.basescan.org/address/0x036CbD53842c5426634e7929541eC2318f3dCF7e)
- [Base Sepolia Explorer](https://sepolia.basescan.org)

---

## Support

For issues or questions:
- GitHub Issues: [Create an issue](https://github.com/copus-io/copus-network/issues)
- Contact: admin@server31.io
- Discord: https://discord.gg/ZtgdtbDSng
