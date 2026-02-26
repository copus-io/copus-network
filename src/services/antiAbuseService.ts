// 防滥用服务
import { SubscriptionRequest } from '../types/subscription';

// 配置常量
export const ANTI_ABUSE_CONFIG = {
  RATE_LIMITS: {
    SUBSCRIPTIONS_PER_HOUR: 10,
    SUBSCRIPTIONS_PER_DAY: 50,
    SUSPICIOUS_THRESHOLD: 20
  },
  RISK_SCORES: {
    LOW_THRESHOLD: 30,
    MEDIUM_THRESHOLD: 60,
    HIGH_THRESHOLD: 80
  }
};

// 黑名单域名（一次性邮箱服务）
const BLACKLISTED_DOMAINS = [
  '10minutemail.com',
  'guerrillamail.com',
  'tempmail.org',
  'mailinator.com',
  'throwaway.email',
  'temp-mail.org',
  'sharklasers.com',
  'getnada.com',
  'test.com',
  'example.com',
  'localhost'
];

// 可疑邮箱模式
const SUSPICIOUS_PATTERNS = [
  /^test\d+@/i,           // test123@...
  /^admin@/i,             // admin@...
  /^support@/i,           // support@...
  /^noreply@/i,           // noreply@...
  /^\d{10,}@/i,          // 长数字用户名
  /^[a-z]{1,3}@/i,       // 过短用户名
  /^.{50,}@/i            // 过长用户名
];

// 接口定义
export interface RiskFactor {
  type: string;
  score: number;
  description: string;
}

export interface RiskAssessment {
  totalScore: number;
  level: 'low' | 'medium' | 'high';
  factors: RiskFactor[];
  action: 'allow' | 'warn' | 'block' | 'manual_review';
  message?: string;
}

export interface SubscriptionAttempt {
  email: string;
  authorUserId: number;
  timestamp: string;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
}

export interface IPRateLimit {
  ip: string;
  attempts: SubscriptionAttempt[];
  suspiciousActivity: number;
  lastCheck: string;
}

class AntiAbuseService {
  private ipHistory: Map<string, IPRateLimit> = new Map();
  private subscriptionAttempts: SubscriptionAttempt[] = [];

  constructor() {
    this.loadFromStorage();
    // 定期清理过期数据
    setInterval(() => this.cleanupExpiredData(), 60 * 60 * 1000); // 每小时清理一次
  }

  /**
   * 验证邮箱格式和域名
   */
  validateEmailForSubscription(email: string): {
    isValid: boolean;
    risk: 'low' | 'medium' | 'high';
    reason?: string;
  } {
    // 基础格式检查
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, risk: 'high', reason: 'invalid_format' };
    }

    const domain = email.split('@')[1].toLowerCase();

    // 检查黑名单域名
    if (BLACKLISTED_DOMAINS.includes(domain)) {
      return { isValid: false, risk: 'high', reason: 'disposable_email' };
    }

    // 检查可疑模式
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(email)) {
        return { isValid: true, risk: 'medium', reason: 'suspicious_pattern' };
      }
    }

    return { isValid: true, risk: 'low' };
  }

  /**
   * 检查IP频率限制
   */
  checkIPRateLimit(ip: string): boolean {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const ipRecord = this.ipHistory.get(ip);
    if (!ipRecord) return true;

    // 统计过去1小时的成功订阅数
    const recentSuccessfulAttempts = ipRecord.attempts.filter(
      attempt => new Date(attempt.timestamp) > oneHourAgo && attempt.success
    );

    return recentSuccessfulAttempts.length < ANTI_ABUSE_CONFIG.RATE_LIMITS.SUBSCRIPTIONS_PER_HOUR;
  }

  /**
   * 检查重复订阅
   */
  checkDuplicateSubscription(email: string, authorUserId: number): {
    isDuplicate: boolean;
    action: 'allow' | 'warn' | 'block';
    message?: string;
  } {
    // 检查短时间内重复尝试
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentAttempts = this.subscriptionAttempts.filter(
      attempt =>
        attempt.email.toLowerCase() === email.toLowerCase() &&
        attempt.authorUserId === authorUserId &&
        new Date(attempt.timestamp) > fifteenMinutesAgo
    );

    if (recentAttempts.length >= 3) {
      return {
        isDuplicate: true,
        action: 'block',
        message: 'Please do not repeatedly subscribe to the same author in a short period'
      };
    }

    if (recentAttempts.length >= 1) {
      return {
        isDuplicate: true,
        action: 'warn',
        message: 'You just attempted to subscribe to this author. Confirm to continue?'
      };
    }

    return { isDuplicate: false, action: 'allow' };
  }

  /**
   * 分析行为模式
   */
  private analyzeBehaviorPattern(email: string, ip: string): {
    suspicionScore: number;
    flags: RiskFactor[];
  } {
    let score = 0;
    const flags: RiskFactor[] = [];

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 检查1：短时间大量订阅
    const recentAttempts = this.subscriptionAttempts.filter(
      attempt =>
        attempt.ipAddress === ip &&
        new Date(attempt.timestamp) > fiveMinutesAgo
    );

    if (recentAttempts.length > 5) {
      score += 50;
      flags.push({
        type: 'rapid_subscription',
        score: 50,
        description: 'More than 5 subscription attempts within 5 minutes'
      });
    }

    // 检查2：相同邮箱订阅大量作者
    const emailAttempts = this.subscriptionAttempts.filter(
      attempt =>
        attempt.email.toLowerCase() === email.toLowerCase() &&
        new Date(attempt.timestamp) > oneDayAgo
    );

    const uniqueAuthors = new Set(emailAttempts.map(a => a.authorUserId));
    if (uniqueAuthors.size > 10) {
      score += 30;
      flags.push({
        type: 'mass_subscription',
        score: 30,
        description: `Single email subscribed to ${uniqueAuthors.size} authors within 24 hours`
      });
    }

    // 检查3：IP行为历史
    const ipRecord = this.ipHistory.get(ip);
    if (ipRecord && ipRecord.suspiciousActivity > 5) {
      score += 25;
      flags.push({
        type: 'suspicious_ip',
        score: 25,
        description: 'IP history shows suspicious activity'
      });
    }

    return { suspicionScore: score, flags };
  }

  /**
   * 综合风险评估
   */
  assessSubscriptionRisk(request: {
    email: string;
    authorUserId: number;
    ip: string;
    userAgent?: string;
  }): RiskAssessment {
    let totalScore = 0;
    const factors: RiskFactor[] = [];

    // 邮箱验证 (0-30分)
    const emailValidation = this.validateEmailForSubscription(request.email);
    if (emailValidation.risk === 'high') {
      totalScore += 30;
      factors.push({
        type: 'email_risk',
        score: 30,
        description: `Email risk: ${emailValidation.reason || 'high-risk email'}`
      });
    } else if (emailValidation.risk === 'medium') {
      totalScore += 15;
      factors.push({
        type: 'email_risk',
        score: 15,
        description: `Email risk: ${emailValidation.reason || 'medium-risk email'}`
      });
    }

    // IP频率检查 (0-25分)
    if (!this.checkIPRateLimit(request.ip)) {
      totalScore += 25;
      factors.push({
        type: 'rate_limit',
        score: 25,
        description: 'IP subscription frequency exceeds limit'
      });
    }

    // 行为模式分析 (0-45分)
    const behaviorAnalysis = this.analyzeBehaviorPattern(request.email, request.ip);
    totalScore += Math.min(behaviorAnalysis.suspicionScore, 45);
    factors.push(...behaviorAnalysis.flags);

    // 重复检查 (0-20分)
    const duplicateCheck = this.checkDuplicateSubscription(request.email, request.authorUserId);
    if (duplicateCheck.action === 'block') {
      totalScore += 20;
      factors.push({
        type: 'duplicate',
        score: 20,
        description: duplicateCheck.message || 'duplicate subscription'
      });
    } else if (duplicateCheck.action === 'warn') {
      totalScore += 10;
      factors.push({
        type: 'duplicate_warning',
        score: 10,
        description: duplicateCheck.message || 'suspected duplicate subscription'
      });
    }

    // 确定风险等级和处理动作
    let level: 'low' | 'medium' | 'high';
    let action: 'allow' | 'warn' | 'block' | 'manual_review';
    let message: string | undefined;

    if (totalScore < ANTI_ABUSE_CONFIG.RISK_SCORES.LOW_THRESHOLD) {
      level = 'low';
      action = 'allow';
    } else if (totalScore < ANTI_ABUSE_CONFIG.RISK_SCORES.MEDIUM_THRESHOLD) {
      level = 'medium';
      action = 'warn';
      message = 'System detected potential risk, please confirm your action';
    } else if (totalScore < ANTI_ABUSE_CONFIG.RISK_SCORES.HIGH_THRESHOLD) {
      level = 'high';
      action = 'manual_review';
      message = 'Subscription request requires manual review, we will process within 24 hours';
    } else {
      level = 'high';
      action = 'block';
      message = 'Subscription request blocked, please retry later or contact support';
    }

    return { totalScore, level, factors, action, message };
  }

  /**
   * 记录订阅尝试
   */
  recordSubscriptionAttempt(attempt: {
    email: string;
    authorUserId: number;
    ip: string;
    userAgent?: string;
    success: boolean;
  }) {
    const subscriptionAttempt: SubscriptionAttempt = {
      ...attempt,
      timestamp: new Date().toISOString()
    };

    this.subscriptionAttempts.push(subscriptionAttempt);

    // 更新IP历史记录
    let ipRecord = this.ipHistory.get(attempt.ip);
    if (!ipRecord) {
      ipRecord = {
        ip: attempt.ip,
        attempts: [],
        suspiciousActivity: 0,
        lastCheck: new Date().toISOString()
      };
      this.ipHistory.set(attempt.ip, ipRecord);
    }

    ipRecord.attempts.push(subscriptionAttempt);
    ipRecord.lastCheck = new Date().toISOString();

    // 如果失败次数过多，标记为可疑
    const recentFailures = ipRecord.attempts
      .filter(a => !a.success && new Date(a.timestamp) > new Date(Date.now() - 60 * 60 * 1000))
      .length;

    if (recentFailures > 5) {
      ipRecord.suspiciousActivity += 1;
    }

    this.saveToStorage();
  }

  /**
   * 检查蜜罐字段
   */
  checkHoneypot(formData: any): boolean {
    // 如果隐藏字段有值，说明是机器人填写
    return !formData.website && !formData.phone && !formData.company;
  }

  /**
   * 清理过期数据
   */
  private cleanupExpiredData() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 清理过期的订阅尝试记录
    this.subscriptionAttempts = this.subscriptionAttempts.filter(
      attempt => new Date(attempt.timestamp) > oneDayAgo
    );

    // 清理过期的IP记录
    for (const [ip, record] of this.ipHistory) {
      record.attempts = record.attempts.filter(
        attempt => new Date(attempt.timestamp) > oneDayAgo
      );

      // 如果IP记录过期且无活动，删除
      if (record.attempts.length === 0 && new Date(record.lastCheck) < oneWeekAgo) {
        this.ipHistory.delete(ip);
      }
    }

    this.saveToStorage();
  }

  /**
   * 获取当前用户IP (模拟实现)
   */
  getCurrentUserIP(): string {
    // 在实际实现中，这应该从请求头或其他来源获取真实IP
    // 这里使用模拟IP用于开发测试
    return localStorage.getItem('dev_user_ip') || '192.168.1.100';
  }

  /**
   * 数据持久化
   */
  private saveToStorage() {
    try {
      const data = {
        subscriptionAttempts: this.subscriptionAttempts.slice(-100), // 只保留最近100条记录
        ipHistory: Array.from(this.ipHistory.entries()).slice(-50),   // 只保留最近50个IP
        timestamp: Date.now()
      };
      sessionStorage.setItem('copus_anti_abuse_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save anti-abuse data:', error);
    }
  }

  private loadFromStorage() {
    try {
      const dataStr = sessionStorage.getItem('copus_anti_abuse_data');
      if (dataStr) {
        const data = JSON.parse(dataStr);

        // 检查数据是否过期（24小时）
        const isExpired = Date.now() - data.timestamp > 24 * 60 * 60 * 1000;
        if (!isExpired && data.subscriptionAttempts) {
          this.subscriptionAttempts = data.subscriptionAttempts;
          this.ipHistory = new Map(data.ipHistory || []);
          console.log('📚 Loading anti-abuse data:', this.subscriptionAttempts.length, 'records');
        }
      }
    } catch (error) {
      console.error('Failed to load anti-abuse data:', error);
    }
  }

  /**
   * 重置数据（用于测试）
   */
  resetData() {
    this.subscriptionAttempts = [];
    this.ipHistory.clear();
    sessionStorage.removeItem('copus_anti_abuse_data');
  }
}

export const antiAbuseService = new AntiAbuseService();
export default antiAbuseService;