import { useCallback } from 'react';
import { usePayment as usePaymentContext } from '@/contexts/PaymentContext';
import { NetworkType, TokenType } from '@/config/contracts';

/**
 * 🎯 PURPOSE: Simplified payment hook for components
 * 🔗 CONTEXT: Uses PaymentContext for state management
 * 🛠️ USED_IN: Content.tsx, PaymentModal.tsx, etc.
 */
export const usePayment = () => {
  const context = usePaymentContext();

  // 🔍 SEARCH: payment-workflow-helpers
  const paymentWorkflow = {
    /**
     * Initialize payment process for an article
     */
    initializePayment: useCallback(async (articleUuid: string, network?: NetworkType) => {
      const targetNetwork = network || context.selectedNetwork;

      try {
        context.openPaymentModal();

        // Fetch payment info if not already loaded for this network
        if (!context.x402PaymentInfo || context.x402PaymentInfo.network !== targetNetwork) {
          await context.fetchPaymentInfo(targetNetwork, articleUuid);
        }
      } catch (error) {
        console.error('Failed to initialize payment:', error);
        throw error;
      }
    }, [context]),

    /**
     * Complete the payment flow
     */
    completePayment: useCallback(async () => {
      if (!context.isWalletConnected) {
        throw new Error('Please connect your wallet first');
      }

      if (!context.x402PaymentInfo) {
        throw new Error('Payment information not available');
      }

      await context.executePayment();
    }, [context]),

    /**
     * Setup wallet for payment
     */
    setupWallet: useCallback(async (walletType: 'metamask' | 'coinbase' | 'okx') => {
      await context.connectWallet(walletType);
    }, [context]),

    /**
     * Check if payment is ready
     */
    isPaymentReady: useCallback(() => {
      return (
        context.isWalletConnected &&
        context.x402PaymentInfo !== null &&
        !context.isPaymentInProgress
      );
    }, [context]),

    /**
     * Get payment summary
     */
    getPaymentSummary: useCallback(() => {
      if (!context.x402PaymentInfo) return null;

      return {
        amount: context.x402PaymentInfo.amount,
        currency: context.selectedCurrency,
        network: context.selectedNetwork,
        recipient: context.x402PaymentInfo.payTo,
        walletBalance: context.walletBalance
      };
    }, [context]),
  };

  // 🔍 SEARCH: wallet-helpers
  const walletHelpers = {
    /**
     * Check if wallet is available
     */
    isWalletAvailable: useCallback((walletType: 'metamask' | 'coinbase' | 'okx') => {
      const checkWallet = () => {
        switch (walletType) {
          case 'metamask':
            return !!(window as any).ethereum?.isMetaMask;
          case 'coinbase':
            return !!(window as any).ethereum?.isCoinbaseWallet;
          case 'okx':
            return !!(window as any).okxwallet || !!(window as any).okx;
          default:
            return false;
        }
      };
      return checkWallet();
    }, []),

    /**
     * Get connected wallet info
     */
    getWalletInfo: useCallback(() => {
      return {
        address: context.walletAddress,
        type: context.walletType,
        balance: context.walletBalance,
        isConnected: context.isWalletConnected
      };
    }, [context]),

    /**
     * Format wallet address for display
     */
    formatAddress: useCallback((address?: string) => {
      const addr = address || context.walletAddress;
      if (!addr) return '';
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }, [context.walletAddress]),
  };

  // 🔍 SEARCH: network-currency-helpers
  const networkHelpers = {
    /**
     * Switch to different network
     */
    switchNetwork: useCallback((network: NetworkType) => {
      context.selectNetwork(network);
      // Clear cached payment info when network changes
      context.setUnlockedUrl(null);
    }, [context]),

    /**
     * Switch currency
     */
    switchCurrency: useCallback((currency: TokenType) => {
      context.selectCurrency(currency);
    }, [context]),

    /**
     * Get available networks
     */
    getAvailableNetworks: useCallback((): NetworkType[] => {
      return ['base-mainnet', 'base-sepolia', 'xlayer'];
    }, []),

    /**
     * Get available currencies for current network
     */
    getAvailableCurrencies: useCallback((): TokenType[] => {
      // Base networks support USDC, XLayer supports USDT
      return context.selectedNetwork === 'xlayer' ? ['usdt'] : ['usdc'];
    }, [context.selectedNetwork]),
  };

  return {
    // State from context
    state: {
      isPayConfirmOpen: context.isPayConfirmOpen,
      isWalletConnected: context.isWalletConnected,
      walletAddress: context.walletAddress,
      walletBalance: context.walletBalance,
      walletType: context.walletType,
      selectedNetwork: context.selectedNetwork,
      selectedCurrency: context.selectedCurrency,
      x402PaymentInfo: context.x402PaymentInfo,
      unlockedUrl: context.unlockedUrl,
      isPaymentInProgress: context.isPaymentInProgress,
    },

    // Direct actions from context
    actions: {
      openPaymentModal: context.openPaymentModal,
      closePaymentModal: context.closePaymentModal,
      connectWallet: context.connectWallet,
      disconnectWallet: context.disconnectWallet,
      fetchPaymentInfo: context.fetchPaymentInfo,
      executePayment: context.executePayment,
      selectNetwork: context.selectNetwork,
      selectCurrency: context.selectCurrency,
      setWalletBalance: context.setWalletBalance,
      setUnlockedUrl: context.setUnlockedUrl,
    },

    // Workflow helpers
    workflow: paymentWorkflow,

    // Utility helpers
    wallet: walletHelpers,
    network: networkHelpers,
  };
};

// 🔍 SEARCH: payment-hook-types
export type UsePaymentReturn = ReturnType<typeof usePayment>;