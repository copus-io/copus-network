declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
      isOKXWallet?: boolean;
      isCoinbaseWallet?: boolean;
    };
  }
}

export {};