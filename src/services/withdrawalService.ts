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
  email?: string;
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
   * Uses the common verification code endpoint with codeType=5 for withdrawal
   */
  static async sendVerificationCode(email: string): Promise<{ message: string }> {
    console.log('📧 Sending verification code for withdrawal to email:', email);

    const queryParams = new URLSearchParams({
      codeType: '5', // 5 = 提现申请
      email: email
    });

    const url = `/client/common/getVerificationCode?${queryParams.toString()}`;

    const response = await apiRequest<{ status: number; msg: string; data: string }>(url, {
      method: 'GET',
      requiresAuth: true // This endpoint requires authentication
    });

    // Convert API response to expected format
    return {
      message: response.msg || 'Verification code sent successfully'
    };
  }

  /**
   * Send email verification code for wallet email binding
   * Uses the common verification code endpoint with codeType=4 for wallet binding
   */
  static async sendBindingVerificationCode(email: string): Promise<{ message: string }> {
    console.log('📧 Sending verification code for wallet binding to email:', email);

    const queryParams = new URLSearchParams({
      codeType: '4', // 4 = 钱包绑定邮箱
      email: email
    });

    const url = `/client/common/getVerificationCode?${queryParams.toString()}`;

    const response = await apiRequest<{ status: number; msg: string; data: string }>(url, {
      method: 'GET',
      requiresAuth: true // This endpoint requires authentication
    });

    // Convert API response to expected format
    return {
      message: response.msg || 'Verification code sent successfully'
    };
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