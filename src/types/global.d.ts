// Global type definitions

// Metamask Ethereum Provider
interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
  chainId?: string;
}

// Extend Window interface
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};