// 全局类型定义

// Metamask Ethereum Provider
interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
  chainId?: string;
}

// 扩展 Window 接口
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};