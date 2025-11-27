// 模拟邮箱验证服务
interface VerificationCode {
  code: string;
  email: string;
  timestamp: number;
  used: boolean;
}

class EmailVerificationService {
  private codes: Map<string, VerificationCode> = new Map();
  private readonly EXPIRY_DURATION = 10 * 60 * 1000; // 10分钟

  /**
   * 生成6位数字验证码
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 发送验证码到指定邮箱
   * @param email 邮箱地址
   * @returns 发送结果
   */
  async sendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1500));

      const code = this.generateCode();
      const verificationData: VerificationCode = {
        code,
        email,
        timestamp: Date.now(),
        used: false
      };

      // 存储验证码
      this.codes.set(email, verificationData);

      // 模拟发送邮件
      console.log(`[模拟邮件发送]
        收件人: ${email}
        验证码: ${code}
        有效期: 10分钟
        邮件内容:
        ═══════════════════════════
        【Copus】提现验证码

        您正在申请提现，验证码为：

        ${code}

        验证码有效期为10分钟，请勿泄露给他人。
        如非本人操作，请忽略此邮件。

        - Copus团队
        ═══════════════════════════
      `);

      return {
        success: true,
        message: '验证码已发送，请查收邮件'
      };
    } catch (error) {
      console.error('发送验证码失败:', error);
      return {
        success: false,
        message: '发送失败，请稍后重试'
      };
    }
  }

  /**
   * 验证邮箱验证码
   * @param email 邮箱地址
   * @param inputCode 用户输入的验证码
   * @returns 验证结果
   */
  async verifyCode(email: string, inputCode: string): Promise<{
    success: boolean;
    message: string;
    expired?: boolean;
  }> {
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 800));

      const storedData = this.codes.get(email);

      if (!storedData) {
        return {
          success: false,
          message: '验证码不存在，请重新发送'
        };
      }

      if (storedData.used) {
        return {
          success: false,
          message: '验证码已使用，请重新发送'
        };
      }

      // 检查是否过期
      const isExpired = Date.now() - storedData.timestamp > this.EXPIRY_DURATION;
      if (isExpired) {
        this.codes.delete(email);
        return {
          success: false,
          message: '验证码已过期，请重新发送',
          expired: true
        };
      }

      // 验证码校验
      if (storedData.code !== inputCode) {
        return {
          success: false,
          message: '验证码错误，请重新输入'
        };
      }

      // 验证成功，标记为已使用
      storedData.used = true;
      this.codes.set(email, storedData);

      console.log(`[验证成功] 邮箱 ${email} 的验证码验证通过`);

      return {
        success: true,
        message: '验证码正确'
      };
    } catch (error) {
      console.error('验证码校验失败:', error);
      return {
        success: false,
        message: '验证失败，请重试'
      };
    }
  }

  /**
   * 检查验证码状态
   * @param email 邮箱地址
   * @returns 验证码信息
   */
  getCodeStatus(email: string): {
    exists: boolean;
    expired: boolean;
    used: boolean;
    remainingTime?: number;
  } {
    const storedData = this.codes.get(email);

    if (!storedData) {
      return { exists: false, expired: false, used: false };
    }

    const elapsed = Date.now() - storedData.timestamp;
    const isExpired = elapsed > this.EXPIRY_DURATION;
    const remainingTime = isExpired ? 0 : this.EXPIRY_DURATION - elapsed;

    return {
      exists: true,
      expired: isExpired,
      used: storedData.used,
      remainingTime: Math.floor(remainingTime / 1000) // 转换为秒
    };
  }

  /**
   * 清理过期的验证码
   */
  private cleanup() {
    const now = Date.now();
    for (const [email, data] of this.codes.entries()) {
      if (now - data.timestamp > this.EXPIRY_DURATION) {
        this.codes.delete(email);
      }
    }
  }

  /**
   * 获取调试信息（仅开发环境使用）
   */
  getDebugInfo(): { email: string; code: string; expired: boolean; used: boolean }[] {
    if (process.env.NODE_ENV !== 'development') {
      return [];
    }

    const result = [];
    const now = Date.now();

    for (const [email, data] of this.codes.entries()) {
      result.push({
        email,
        code: data.code,
        expired: now - data.timestamp > this.EXPIRY_DURATION,
        used: data.used
      });
    }

    return result;
  }
}

// 创建单例实例
export const emailVerificationService = new EmailVerificationService();

// 每5分钟清理一次过期验证码
if (typeof window !== 'undefined') {
  setInterval(() => {
    (emailVerificationService as any).cleanup();
  }, 5 * 60 * 1000);
}