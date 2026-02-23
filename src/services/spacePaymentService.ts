import { apiRequest } from './api';
import {
  SpacePaymentConfig,
  SpacePaymentInfo,
  ContentPermission,
  BatchContentPermissions,
  SpacePurchase,
  SpacePaymentRequest,
  SpacePaymentResponse,
  SpaceRevenueStats,
  CurrencyType,
  PaymentType
} from '../types/space';

export class SpacePaymentService {

  // ========================================
  // 空间付费配置管理
  // ========================================

  /**
   * 设置空间付费配置
   */
  static async setSpacePaymentConfig(spaceId: number, config: SpacePaymentConfig): Promise<any> {
    return await apiRequest(`/client/spaces/${spaceId}/payment-config`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  /**
   * 获取空间付费信息
   */
  static async getSpacePaymentInfo(spaceId: number): Promise<SpacePaymentInfo> {
    return await apiRequest(`/client/spaces/${spaceId}/payment-info`, {
      method: 'GET',
    });
  }

  /**
   * 启用/禁用空间付费功能
   */
  static async toggleSpacePayment(spaceId: number, enabled: boolean): Promise<any> {
    return await apiRequest(`/client/spaces/${spaceId}/payment-toggle`, {
      method: 'POST',
      body: JSON.stringify({ paymentEnabled: enabled }),
    });
  }

  // ========================================
  // 内容权限管理
  // ========================================

  /**
   * 设置单个文章的付费状态
   */
  static async setContentPermission(
    spaceId: number,
    articleId: number,
    permission: ContentPermission
  ): Promise<any> {
    return await apiRequest(`/client/spaces/${spaceId}/articles/${articleId}/payment`, {
      method: 'PUT',
      body: JSON.stringify(permission),
    });
  }

  /**
   * 批量设置内容权限
   */
  static async batchSetContentPermissions(config: BatchContentPermissions): Promise<any> {
    return await apiRequest(`/client/spaces/${config.spaceId}/content-permissions`, {
      method: 'PUT',
      body: JSON.stringify({ articles: config.permissions }),
    });
  }

  /**
   * 获取空间内容权限列表
   */
  static async getContentPermissions(spaceId: number): Promise<ContentPermission[]> {
    return await apiRequest(`/client/spaces/${spaceId}/content-permissions`, {
      method: 'GET',
    });
  }

  // ========================================
  // 空间购买和支付
  // ========================================

  /**
   * 获取空间支付信息 (用于x402支付)
   */
  static async getSpacePaymentData(request: SpacePaymentRequest): Promise<SpacePaymentResponse> {
    const params = new URLSearchParams({
      uuid: request.spaceId.toString(),
      network: request.network,
      asset: request.asset,
      userAddress: request.userAddress,
    });

    return await apiRequest(`/client/spaces/payment/info?${params.toString()}`, {
      method: 'GET',
    });
  }

  /**
   * 执行空间解锁支付
   */
  static async unlockSpace(spaceId: number, paymentHeader: string): Promise<any> {
    return await apiRequest(`/client/spaces/${spaceId}/payment/unlock`, {
      method: 'POST',
      headers: {
        'X-PAYMENT': paymentHeader,
      },
    });
  }

  /**
   * 检查用户是否有空间访问权限
   */
  static async checkSpaceAccess(spaceId: number): Promise<{ hasAccess: boolean }> {
    return await apiRequest(`/client/spaces/${spaceId}/access`, {
      method: 'GET',
    });
  }

  /**
   * 获取用户的空间购买记录
   */
  static async getUserSpacePurchases(userId?: number): Promise<SpacePurchase[]> {
    const endpoint = userId
      ? `/client/users/${userId}/space-purchases`
      : '/client/user/space-purchases';

    return await apiRequest(endpoint, {
      method: 'GET',
    });
  }

  /**
   * 获取空间的订阅用户列表
   */
  static async getSpaceSubscribers(spaceId: number, page: number = 1, pageSize: number = 20): Promise<any> {
    return await apiRequest(`/client/spaces/${spaceId}/subscribers?page=${page}&pageSize=${pageSize}`, {
      method: 'GET',
    });
  }

  // ========================================
  // 空间收益统计
  // ========================================

  /**
   * 获取空间收益统计
   */
  static async getSpaceRevenueStats(spaceId: number): Promise<SpaceRevenueStats> {
    return await apiRequest(`/client/spaces/${spaceId}/revenue-stats`, {
      method: 'GET',
    });
  }

  /**
   * 获取空间收益历史
   */
  static async getSpaceRevenueHistory(
    spaceId: number,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const queryString = params.toString();
    const endpoint = `/client/spaces/${spaceId}/revenue-history${queryString ? `?${queryString}` : ''}`;

    return await apiRequest(endpoint, {
      method: 'GET',
    });
  }

  // ========================================
  // 空间内容获取 (带权限控制)
  // ========================================

  /**
   * 获取空间内容 (自动根据用户权限返回相应内容)
   */
  static async getSpaceContent(spaceId: number, page: number = 1, pageSize: number = 20): Promise<any> {
    return await apiRequest(`/client/spaces/${spaceId}/content?page=${page}&pageSize=${pageSize}`, {
      method: 'GET',
    });
  }

  /**
   * 获取空间免费预览内容
   */
  static async getSpacePreviewContent(spaceId: number): Promise<any> {
    return await apiRequest(`/client/spaces/${spaceId}/preview`, {
      method: 'GET',
    });
  }

  // ========================================
  // 工具方法
  // ========================================

  /**
   * 格式化价格显示
   */
  static formatPrice(price: number, currency: CurrencyType): string {
    return `${price} ${currency}`;
  }

  /**
   * 检查是否为付费空间
   */
  static isPaidSpace(paymentType?: PaymentType): boolean {
    return paymentType === 'paid' || paymentType === 'hybrid';
  }

  /**
   * 获取空间类型显示文本
   */
  static getPaymentTypeText(paymentType?: PaymentType): string {
    switch (paymentType) {
      case 'free': return '免费空间';
      case 'paid': return '付费空间';
      case 'hybrid': return '混合空间';
      default: return '免费空间';
    }
  }
}