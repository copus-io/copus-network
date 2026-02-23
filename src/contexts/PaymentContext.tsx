import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useToast } from '@/components/ui/toast';
import { useUser } from '@/contexts/UserContext';
import { AuthService } from '@/services/authService';
import { X402PaymentInfo } from '@/types/article';
import { NetworkType, TokenType, getNetworkConfig, getTokenContract } from '@/config/contracts';
import { SUPPORTED_TOKENS } from '@/types/payment';
import {
  generateNonce,
  signTransferWithAuthorization,
  signTransferWithAuthorizationOKXBrowser,
  createX402PaymentHeader
} from '@/utils/x402Utils';

// 🔍 SEARCH: payment-context-types
interface PaymentState {
  // Payment modal states
  isPayConfirmOpen: boolean;
  isWalletConnected: boolean;

  // Wallet connection state
  walletAddress: string;
  walletBalance: string;
  walletProvider: any;
  walletType: string;

  // Network and currency selection
  selectedNetwork: NetworkType;
  selectedCurrency: TokenType;

  // Payment data
  x402PaymentInfo: X402PaymentInfo | null;
  okxEip712Data: any;
  unlockedUrl: string | null;
  isPaymentInProgress: boolean;
}

interface PaymentActions {
  // Modal controls
  openPaymentModal: () => void;
  closePaymentModal: () => void;

  // Wallet connection
  connectWallet: (walletType: 'metamask' | 'coinbase' | 'okx') => Promise<void>;
  disconnectWallet: () => void;

  // Payment flow
  fetchPaymentInfo: (network: NetworkType, articleUuid: string) => Promise<void>;
  executePayment: () => Promise<void>;

  // Network and currency selection
  selectNetwork: (network: NetworkType) => void;
  selectCurrency: (currency: TokenType) => void;

  // State updates
  setWalletBalance: (balance: string) => void;
  setUnlockedUrl: (url: string | null) => void;
}

type PaymentContextType = PaymentState & PaymentActions;

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

// 🔍 SEARCH: payment-provider-props
interface PaymentProviderProps {
  children: ReactNode;
}

// Helper: Get default network based on auth method
const getDefaultNetwork = (): NetworkType => {
  const authMethod = localStorage.getItem('copus_auth_method');
  return authMethod === 'okx' ? 'xlayer' : 'base-mainnet';
};

// Helper: Detect wallet provider
const detectWalletProvider = (walletType: 'metamask' | 'coinbase' | 'okx'): any => {
  if (walletType === 'okx') {
    return (window as any).okxwallet ||
           (window as any).okx?.ethereum ||
           (window as any).ethereum?.isOkxWallet ? (window as any).ethereum : null;
  }

  if ((window.ethereum as any)?.providers) {
    const providers = (window.ethereum as any).providers;
    if (walletType === 'metamask') {
      const metamaskProvider = providers.find((p: any) => {
        return p.isMetaMask && !p.isOkxWallet && !p.isCoinbaseWallet;
      });
      return metamaskProvider || providers.find((p: any) => p._metamask && p.isMetaMask);
    } else if (walletType === 'coinbase') {
      return providers.find((p: any) => p.isCoinbaseWallet);
    }
  } else {
    if (walletType === 'metamask') {
      const eth = window.ethereum as any;
      if ((window as any).okxwallet) {
        const metamaskDirect = (window as any).metamask;
        if (metamaskDirect?.isMetaMask) {
          return metamaskDirect;
        }
      }
      return eth?.isMetaMask && !eth?.isOkxWallet ? eth : null;
    } else if (walletType === 'coinbase') {
      return window.ethereum.isCoinbaseWallet ? window.ethereum : (window as any).coinbaseWalletExtension;
    }
  }

  return null;
};

// 🔍 SEARCH: payment-provider-component
export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const { user, login, fetchUserInfo } = useUser();
  const { showToast } = useToast();

  // Payment state
  const [state, setState] = useState<PaymentState>({
    isPayConfirmOpen: false,
    isWalletConnected: false,
    walletAddress: '',
    walletBalance: '0',
    walletProvider: null,
    walletType: '',
    selectedNetwork: getDefaultNetwork(),
    selectedCurrency: 'usdt',
    x402PaymentInfo: null,
    okxEip712Data: null,
    unlockedUrl: null,
    isPaymentInProgress: false,
  });

  // Helper: Connect to wallet and get address
  const connectToWallet = async (provider: any): Promise<string> => {
    await provider.request({ method: 'eth_requestAccounts' });
    const accounts = await provider.request({ method: 'eth_accounts' });
    const address = accounts[0];

    if (!address) {
      throw new Error('No account selected in wallet. Please select an account and try again.');
    }

    return address;
  };

  // Helper: Handle wallet login process
  const handleWalletLogin = async (address: string, provider: any, walletType: string) => {
    showToast('Connecting wallet...', 'info');

    const signatureDataResponse = walletType === 'okx'
      ? await AuthService.okxWalletSignature(address)
      : await AuthService.getMetamaskSignatureData(address);

    const signData = signatureDataResponse.data;
    const signature = walletType === 'okx'
      ? await signTransferWithAuthorizationOKXBrowser(signData, provider)
      : await signTransferWithAuthorization(signData, provider);

    const response = walletType === 'okx'
      ? await AuthService.okxWalletLogin(address, signature, false)
      : await AuthService.metamaskLogin(address, signature, false);

    if (!response.success) {
      throw new Error(response.message || 'Wallet login failed');
    }

    const { token, namespace } = response.data;
    const basicUser = { email: '', namespace: namespace || '', walletAddress: address };
    login(basicUser, token);
    localStorage.setItem('copus_auth_method', walletType);

    try {
      await fetchUserInfo(token);
    } catch (userInfoError) {
      console.warn('Failed to fetch user info after wallet login:', userInfoError);
    }

    setState(prev => ({ ...prev, isWalletConnected: true, walletBalance: '...' }));
    const walletName = walletType === 'metamask' ? 'MetaMask' : walletType === 'okx' ? 'OKX' : 'Coinbase';
    showToast(`${walletName} wallet connected successfully!`, 'success');
  };

  // 🔍 SEARCH: wallet-connection-logic
  const connectWallet = useCallback(async (walletType: 'metamask' | 'coinbase' | 'okx') => {
    try {
      const provider = detectWalletProvider(walletType);
      if (!provider) {
        const walletName = walletType === 'metamask' ? 'MetaMask' : walletType === 'okx' ? 'OKX Wallet' : 'Coinbase Wallet';
        showToast(`${walletName} not found. Please install ${walletName} extension.`, 'error');
        return;
      }

      const address = await connectToWallet(provider);

      setState(prev => ({
        ...prev,
        walletAddress: address,
        walletProvider: provider,
        walletType,
      }));

      if (!user) {
        await handleWalletLogin(address, provider, walletType);
      } else {
        setState(prev => ({ ...prev, isWalletConnected: true }));
        const walletName = walletType === 'metamask' ? 'MetaMask' : walletType === 'okx' ? 'OKX Wallet' : 'Coinbase Wallet';
        showToast(`${walletName} connected successfully!`, 'success');
      }
    } catch (error: any) {
      console.error('❌ Wallet connection failed:', error);
      showToast(error.message || 'Failed to connect wallet', 'error');
    }
  }, [user, showToast, login, fetchUserInfo]);

  // 🔍 SEARCH: payment-info-fetch
  const fetchPaymentInfo = useCallback(async (network: NetworkType, articleUuid: string) => {
    try {
      setState(prev => ({ ...prev, isPaymentInProgress: true }));

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const getPaymentEndpoint = (networkType: NetworkType) => {
        return networkType === 'xlayer'
          ? '/client/payment/okx/getTargetUrl'
          : '/client/payment/base/getTargetUrl';
      };

      const paymentEndpoint = getPaymentEndpoint(network);
      const urlParams = new URLSearchParams({ uuid: articleUuid });
      const fullUrl = `${apiBaseUrl}${paymentEndpoint}?${urlParams.toString()}`;

      const token = localStorage.getItem('copus_token');
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(fullUrl, { headers });
      const data = await response.json();

      if (!response.ok && response.status !== 402) {
        throw new Error(`Payment API error: ${response.status} ${response.statusText}`);
      }

      if (network === 'xlayer' && data.domain && data.message) {
        // OKX API returns EIP-712 structure for XLayer
        const addressToUse = state.walletAddress || user?.walletAddress;
        if (!addressToUse) {
          throw new Error('Please connect your wallet first');
        }

        const eip712Data = {
          domain: data.domain,
          message: { ...data.message, from: addressToUse },
          primaryType: data.primaryType || 'TransferWithAuthorization',
          types: data.types
        };

        const resourceUrl = `${apiBaseUrl}${paymentEndpoint}?${urlParams.toString()}`;
        const paymentInfo = {
          payTo: data.message.to,
          asset: data.domain.verifyingContract,
          amount: data.message.value,
          network,
          resource: resourceUrl
        };

        setState(prev => ({
          ...prev,
          okxEip712Data: eip712Data,
          x402PaymentInfo: paymentInfo,
          isPaymentInProgress: false
        }));

      } else if ((network === 'base-mainnet' || network === 'base-sepolia') && data) {
        // Base API handling
        if (data.domain && data.message) {
          const addressToUse = state.walletAddress || user?.walletAddress;
          if (!addressToUse) {
            throw new Error('Please connect your wallet first');
          }

          const eip712Data = {
            domain: data.domain,
            message: { ...data.message, from: addressToUse },
            primaryType: data.primaryType || 'TransferWithAuthorization',
            types: data.types
          };

          const resourceUrl = `${apiBaseUrl}${paymentEndpoint}?${urlParams.toString()}`;
          const paymentInfo = {
            payTo: data.message.to,
            asset: data.domain.verifyingContract,
            amount: data.message.value,
            network,
            resource: resourceUrl
          };

          setState(prev => ({
            ...prev,
            okxEip712Data: eip712Data,
            x402PaymentInfo: paymentInfo,
            isPaymentInProgress: false
          }));
        } else {
          // Fallback for string response
          const contractAddress = getTokenContract(network, state.selectedCurrency);
          if (!contractAddress) {
            throw new Error(`Contract address not found for ${network} ${state.selectedCurrency}`);
          }

          const paymentInfo = {
            payTo: 'recipient_address', // This should come from API
            asset: contractAddress,
            amount: '10000', // 0.01 USDC (6 decimals)
            network,
            resource: `${apiBaseUrl}${paymentEndpoint}?${urlParams.toString()}`
          };

          setState(prev => ({
            ...prev,
            x402PaymentInfo: paymentInfo,
            isPaymentInProgress: false
          }));
        }
      }
    } catch (error: any) {
      console.error('❌ Error fetching payment info:', error);
      setState(prev => ({ ...prev, isPaymentInProgress: false }));
      showToast(error.message || 'Failed to load payment information', 'error');
      throw error;
    }
  }, [state.walletAddress, state.selectedCurrency, user?.walletAddress, showToast]);

  // 🔍 SEARCH: payment-execution
  const executePayment = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isPaymentInProgress: true }));

      if (!state.walletAddress || !state.walletProvider) {
        throw new Error('Wallet not connected');
      }

      if (!state.x402PaymentInfo || !state.okxEip712Data) {
        throw new Error('Payment information not available');
      }

      // Sign the authorization
      const signedAuth = state.walletType === 'okx'
        ? await signTransferWithAuthorizationOKXBrowser(state.okxEip712Data, state.walletProvider)
        : await signTransferWithAuthorization(state.okxEip712Data, state.walletProvider);

      // Create X-PAYMENT header
      const paymentHeader = createX402PaymentHeader(
        signedAuth,
        state.selectedNetwork,
        SUPPORTED_TOKENS[state.selectedCurrency]
      );

      // Make payment request
      const response = await fetch(state.x402PaymentInfo.resource, {
        method: 'GET',
        headers: {
          'X-PAYMENT': paymentHeader,
          'Authorization': `Bearer ${localStorage.getItem('copus_token')}`,
        }
      });

      if (response.ok) {
        const contentUrl = response.url;
        setState(prev => ({
          ...prev,
          unlockedUrl: contentUrl,
          isPaymentInProgress: false,
          isPayConfirmOpen: false
        }));
        showToast('Payment successful! Content unlocked.', 'success');
      } else {
        throw new Error('Payment failed');
      }
    } catch (error: any) {
      console.error('❌ Payment failed:', error);
      setState(prev => ({ ...prev, isPaymentInProgress: false }));
      showToast(error.message || 'Payment failed. Please try again.', 'error');
    }
  }, [state, showToast]);

  // Action handlers
  const openPaymentModal = useCallback(() => {
    setState(prev => ({ ...prev, isPayConfirmOpen: true }));
  }, []);

  const closePaymentModal = useCallback(() => {
    setState(prev => ({ ...prev, isPayConfirmOpen: false }));
  }, []);

  const disconnectWallet = useCallback(() => {
    setState(prev => ({
      ...prev,
      isWalletConnected: false,
      walletAddress: '',
      walletBalance: '0',
      walletProvider: null,
      walletType: '',
      x402PaymentInfo: null,
      okxEip712Data: null,
      unlockedUrl: null
    }));
  }, []);

  const selectNetwork = useCallback((network: NetworkType) => {
    setState(prev => ({ ...prev, selectedNetwork: network }));
  }, []);

  const selectCurrency = useCallback((currency: TokenType) => {
    setState(prev => ({ ...prev, selectedCurrency: currency }));
  }, []);

  const setWalletBalance = useCallback((balance: string) => {
    setState(prev => ({ ...prev, walletBalance: balance }));
  }, []);

  const setUnlockedUrl = useCallback((url: string | null) => {
    setState(prev => ({ ...prev, unlockedUrl: url }));
  }, []);

  const contextValue: PaymentContextType = {
    // State
    ...state,

    // Actions
    openPaymentModal,
    closePaymentModal,
    connectWallet,
    disconnectWallet,
    fetchPaymentInfo,
    executePayment,
    selectNetwork,
    selectCurrency,
    setWalletBalance,
    setUnlockedUrl,
  };

  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
    </PaymentContext.Provider>
  );
};

// 🔍 SEARCH: use-payment-hook
export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};