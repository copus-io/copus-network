export interface ValidationRule {
  required?: boolean;
  email?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  match?: string; // For confirm password scenarios
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
      return 'This field is required';
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') {
      return null;
    }

    // Email validation
    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      return `At least ${rules.minLength} characters required`;
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Cannot exceed ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Invalid format';
    }

    // Match validation (for confirm password)
    if (rules.match && allValues && value !== allValues[rules.match]) {
      return 'Inputs do not match';
    }

    // Custom validation
    if (rules.custom && !rules.custom(value)) {
      return 'Validation failed';
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

// Common validation rules presets
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
    pattern: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/, // At least contains letters and numbers
  },
  CONFIRM_PASSWORD: (passwordField: string = 'password') => ({
    required: true,
    match: passwordField,
  }),
  VERIFICATION_CODE: {
    required: true,
    pattern: /^\d{4,6}$/, // 4-6 digit numbers
  },
} as const;

// Password strength checker
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
      feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include uppercase and lowercase letters');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include numbers');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include special characters');
    }

    return { score, feedback };
  }

  static getStrengthLabel(score: number): string {
    switch (score) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Strong';
      case 4:
        return 'Very Strong';
      default:
        return 'Weak';
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