import { apiRequest } from './api';

export interface WithdrawalRequest {
  amount: string;
  assetName: string;
  chainId: number;
  code: string;
  toAddress: string;
}

export interface WithdrawalResponse {
  message: string;
  orderId: number;
  status: number;
}

export interface UserAccountInfo {
  balance: string;
  createdAt: number;
  id: number;
  targetUserType: number;
  totalIncome: string;
  updatedAt: number;
  userId: number;
}

export interface TransactionHistory {
  id: number;
  amount: string;
  createdAt: number;
  description: string;
  status: number;
  transactionType: number;
}

export interface TransactionHistoryRequest {
  /**
   * 资金流向类型 (0:所有, 1:流入, 2:流出)
   */
  flowType?: number;
  /**
   * 当前页码
   */
  pageIndex?: number;
  /**
   * 每页显示记录数
   */
  pageSize?: number;
}

export interface TransactionHistoryResponse {
  data: TransactionHistory[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
}

export interface WalletBindEmailRequest {
  /**
   * 邮箱验证码
   */
  code: string;
  /**
   * 邮箱地址
   */
  email: string;
  /**
   * 钱包签名
   */
  signature: string;
}

export class WithdrawalService {
  /**
   * Submit withdrawal request
   */
  static async submitWithdrawal(data: WithdrawalRequest): Promise<WithdrawalResponse> {
    return await apiRequest<WithdrawalResponse>('/client/user/withdrawal/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Send email verification code for withdrawal
   */
  static async sendVerificationCode(email: string): Promise<{ message: string }> {
    // This endpoint may need to be confirmed with backend
    return await apiRequest<{ message: string }>('/client/user/withdrawal/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Get user account information including balance and total income
   */
  static async getUserAccountInfo(): Promise<UserAccountInfo> {
    return await apiRequest<UserAccountInfo>('/client/account/info', {
      method: 'GET',
    });
  }

  /**
   * Get user transaction history with pagination
   */
  static async getTransactionHistory(params?: TransactionHistoryRequest): Promise<TransactionHistoryResponse> {
    const queryParams = new URLSearchParams();

    if (params?.flowType !== undefined) {
      queryParams.append('flowType', params.flowType.toString());
    }
    if (params?.pageIndex !== undefined) {
      queryParams.append('pageIndex', params.pageIndex.toString());
    }
    if (params?.pageSize !== undefined) {
      queryParams.append('pageSize', params.pageSize.toString());
    }

    const url = `/client/account/pageTx${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return await apiRequest<TransactionHistoryResponse>(url, {
      method: 'GET',
    });
  }

  /**
   * Bind email to wallet for users who haven't bound an email yet
   */
  static async bindWalletEmail(data: WalletBindEmailRequest): Promise<boolean> {
    return await apiRequest<boolean>('/client/user/walletBindEmail', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}