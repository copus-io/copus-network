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
   * 钱包签名 (必需字段)
   */
  signature: string;
}

export class WithdrawalService {
  /**
   * Submit withdrawal request
   */
  static async submitWithdrawal(data: WithdrawalRequest): Promise<WithdrawalResponse> {
    console.log('🔗 WithdrawalService.submitWithdrawal 调用:', {
      endpoint: '/client/user/withdrawal/request',
      method: 'POST',
      requestData: data,
      requestJSON: JSON.stringify(data),
      timestamp: new Date().toISOString()
    });

    try {
      const response = await apiRequest<WithdrawalResponse>('/client/user/withdrawal/request', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      console.log('📡 WithdrawalService API响应:', {
        response,
        responseType: typeof response,
        responseKeys: response ? Object.keys(response) : 'null',
        timestamp: new Date().toISOString()
      });

      return response;
    } catch (error) {
      console.error('🔥 WithdrawalService API错误:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        requestData: data,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
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
    const response = await apiRequest<{status: number; msg: string; data: UserAccountInfo}>('/client/account/info', {
      method: 'GET',
    });

    // Handle the nested API response structure
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data;
    }

    // Fallback for direct response format
    return response as UserAccountInfo;
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

    const response = await apiRequest<{status: number; msg: string; data: TransactionHistoryResponse}>(url, {
      method: 'GET',
    });

    // Handle the nested API response structure
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data;
    }

    // Fallback for direct response format
    return response as TransactionHistoryResponse;
  }

  /**
   * Bind email to wallet for users who haven't bound an email yet
   */
  static async bindWalletEmail(data: WalletBindEmailRequest): Promise<any> {
    console.log('🔍 API Request Debug:', {
      endpoint: '/client/user/walletBindEmail',
      method: 'POST',
      requestBody: data,
      requestBodyJSON: JSON.stringify(data)
    });

    const response = await apiRequest<any>('/client/user/walletBindEmail', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    console.log('📥 API Response Debug:', {
      response: response,
      responseType: typeof response,
      responseKeys: Object.keys(response || {})
    });

    return response;
  }
}