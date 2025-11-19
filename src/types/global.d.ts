// Global type definitions

// Ethereum Provider (supports MetaMask, Coinbase, OKX)
interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isOkxWallet?: boolean;
  chainId?: string;
  selectedAddress?: string;
}

// Extend Window interface
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};