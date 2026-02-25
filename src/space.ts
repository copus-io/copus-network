// 空间付费相关类型定义

export type PaymentType = 'free' | 'paid' | 'hybrid';
export type CurrencyType = 'USDT' | 'USDC';
export type PurchaseStatus = 'pending' | 'completed' | 'failed';

// 空间付费配置
export interface SpacePaymentConfig {
  paymentType: PaymentType;
  unlockPrice?: number;
  currency?: CurrencyType;
}

// 空间付费信息
export interface SpacePaymentInfo {
  paymentType: PaymentType;
  unlockPrice: number;
  currency: CurrencyType;
  userHasAccess: boolean;
  freeContentCount: number;
  paidContentCount: number;
  totalRevenue?: number;
  subscriberCount?: number;
}

// 内容权限
export interface ContentPermission {
  articleId: number;
  isPaidContent: boolean;
  previewLength?: number; // 免费预览字数
}

// 批量设置内容权限
export interface BatchContentPermissions {
  spaceId: number;
  permissions: ContentPermission[];
}

// 空间购买记录
export interface SpacePurchase {
  id: number;
  spaceId: number;
  spaceName: string;
  userId: number;
  purchasePrice: number;
  purchaseCurrency: CurrencyType;
  transactionHash?: string;
  paymentNetwork?: string;
  walletAddress?: string;
  purchaseDate: string;
  status: PurchaseStatus;
}

// 空间支付请求数据
export interface SpacePaymentRequest {
  spaceId: number;
  network: string;
  asset: string;
  userAddress: string;
}

// 空间支付响应数据
export interface SpacePaymentResponse {
  eip712Data?: any;
  paymentInfo?: {
    network: string;
    asset: string;
    amount: string;
    recipient: string;
    contractAddress: string;
    resourceUrl: string;
  };
}

// 用于 x402 支付的空间信息
export interface SpaceX402PaymentInfo {
  payTo: string;
  asset: string;
  amount: string;
  network: string;
  resource: string;
}

// 空间收益统计
export interface SpaceRevenueStats {
  spaceId: number;
  totalRevenue: number;
  totalSubscribers: number;
  monthlyRevenue: number;
  monthlySubscribers: number;
  revenueHistory: Array<{
    month: string;
    revenue: number;
    subscribers: number;
  }>;
}