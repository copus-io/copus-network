export interface ValidationRule {
  required?: boolean;
  email?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  match?: string; // 用于确认密码等场景
  custom?: (value: string) => boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class FormValidator {
  private static validateField(value: string, rules: ValidationRule, allValues?: Record<string, string>): string | null {
    // Required validation
    if (rules.required && (!value || value.trim() === '')) {
      return '此字段为必填项';
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') {
      return null;
    }

    // Email validation
    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return '请输入有效的邮箱地址';
      }
    }

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      return `至少需要 ${rules.minLength} 个字符`;
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      return `不能超过 ${rules.maxLength} 个字符`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return '格式不正确';
    }

    // Match validation (for confirm password)
    if (rules.match && allValues && value !== allValues[rules.match]) {
      return '两次输入不一致';
    }

    // Custom validation
    if (rules.custom && !rules.custom(value)) {
      return '验证失败';
    }

    return null;
  }

  static validateForm(
    values: Record<string, string>,
    rules: Record<string, ValidationRule>
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    Object.keys(rules).forEach(field => {
      const value = values[field] || '';
      const fieldRules = rules[field];
      const error = this.validateField(value, fieldRules, values);

      if (error) {
        errors.push({ field, message: error });
      }
    });

    return errors;
  }

  static validateSingleField(
    field: string,
    value: string,
    rules: ValidationRule,
    allValues?: Record<string, string>
  ): string | null {
    return this.validateField(value, rules, allValues);
  }
}

// 常用验证规则预设
export const VALIDATION_RULES = {
  EMAIL: {
    required: true,
    email: true,
  },
  USERNAME: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  PASSWORD: {
    required: true,
    minLength: 6,
    pattern: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/, // 至少包含字母和数字
  },
  CONFIRM_PASSWORD: (passwordField: string = 'password') => ({
    required: true,
    match: passwordField,
  }),
  VERIFICATION_CODE: {
    required: true,
    pattern: /^\d{4,6}$/, // 4-6位数字
  },
} as const;

// 密码强度检查器
export class PasswordStrengthChecker {
  static checkStrength(password: string): {
    score: number; // 0-4
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('至少8个字符');
    }

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('包含大小写字母');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('包含数字');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('包含特殊字符');
    }

    return { score, feedback };
  }

  static getStrengthLabel(score: number): string {
    switch (score) {
      case 0:
      case 1:
        return '弱';
      case 2:
        return '一般';
      case 3:
        return '强';
      case 4:
        return '很强';
      default:
        return '弱';
    }
  }

  static getStrengthColor(score: number): string {
    switch (score) {
      case 0:
      case 1:
        return 'text-red-500';
      case 2:
        return 'text-yellow-500';
      case 3:
        return 'text-blue-500';
      case 4:
        return 'text-green-500';
      default:
        return 'text-red-500';
    }
  }
}