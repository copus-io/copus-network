/**
 * 🔍 SEARCH: component-configuration-objects
 * Declarative component configurations for rapid UI modifications
 */

// 🔍 SEARCH: space-component-config
export const SPACE_COMPONENT_CONFIG = {
  // 🔍 SEARCH: space-edit-form-config
  editForm: {
    nameInput: {
      baseClass: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      enabledClass: 'text-medium-dark-grey',
      disabledClass: 'text-gray-500 cursor-not-allowed bg-gray-50',
      placeholder: 'Enter space name',
      disabledPlaceholder: 'Space name cannot be edited (default space)'
    },
    descriptionInput: {
      baseClass: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      enabledClass: 'text-medium-dark-grey',
      disabledClass: 'text-gray-500 cursor-not-allowed bg-gray-50',
      placeholder: 'Enter space description',
      rows: 3
    },
    coverUrlInput: {
      baseClass: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      enabledClass: 'text-medium-dark-grey',
      disabledClass: 'text-gray-500 cursor-not-allowed bg-gray-50',
      placeholder: 'Enter cover image URL'
    }
  },

  // 🔍 SEARCH: space-action-buttons-config
  actionButtons: {
    save: {
      text: 'Save Changes',
      baseClass: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
      disabledClass: 'px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed'
    },
    delete: {
      text: 'Delete Space',
      baseClass: 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors',
      hiddenClass: 'hidden',
      confirmationText: 'Are you sure you want to delete this space? This action cannot be undone.'
    },
    cancel: {
      text: 'Cancel',
      baseClass: 'px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors'
    }
  },

  // 🔍 SEARCH: space-validation-config
  validation: {
    name: {
      required: true,
      minLength: 1,
      maxLength: 100,
      pattern: null
    },
    description: {
      required: false,
      minLength: 0,
      maxLength: 500,
      pattern: null
    },
    coverUrl: {
      required: false,
      pattern: /^https?:\/\/.+/
    }
  }
};

// 🔍 SEARCH: article-component-config
export const ARTICLE_COMPONENT_CONFIG = {
  // 🔍 SEARCH: article-edit-form-config
  editForm: {
    titleInput: {
      baseClass: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      placeholder: 'Enter article title'
    },
    contentEditor: {
      baseClass: 'w-full min-h-[300px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      placeholder: 'Write your article content...'
    },
    categorySelect: {
      baseClass: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
    }
  },

  // 🔍 SEARCH: article-action-buttons-config
  actionButtons: {
    publish: {
      text: 'Publish',
      baseClass: 'px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
    },
    saveDraft: {
      text: 'Save as Draft',
      baseClass: 'px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors'
    },
    preview: {
      text: 'Preview',
      baseClass: 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
    }
  }
};

// 🔍 SEARCH: user-component-config
export const USER_COMPONENT_CONFIG = {
  // 🔍 SEARCH: user-profile-form-config
  profileForm: {
    usernameInput: {
      baseClass: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      placeholder: 'Enter username'
    },
    emailInput: {
      baseClass: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      placeholder: 'Enter email address',
      type: 'email'
    },
    bioTextarea: {
      baseClass: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      placeholder: 'Tell us about yourself...',
      rows: 4
    }
  }
};

// 🔍 SEARCH: notification-config
export const NOTIFICATION_CONFIG = {
  // 🔍 SEARCH: toast-messages-config
  messages: {
    success: {
      spaceUpdated: 'Space updated successfully',
      spaceDeleted: 'Space deleted successfully',
      spaceCreated: 'Sub-treasury created successfully',
      articlePublished: 'Article published successfully',
      profileUpdated: 'Profile updated successfully'
    },
    error: {
      spaceUpdateFailed: 'Failed to update space',
      spaceDeleteFailed: 'Failed to delete space',
      networkError: 'Network connection error. Please check your internet connection.',
      unauthorized: 'You are not authorized to perform this action.',
      validationFailed: 'Please check your input and try again.'
    },
    info: {
      pageRefreshing: 'Page refreshing to show latest changes...',
      savingChanges: 'Saving changes...',
      deletingSpace: 'Deleting space...'
    }
  },

  // 🔍 SEARCH: toast-styling-config
  styling: {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-black'
  }
};

// 🔍 SEARCH: api-response-config
export const API_RESPONSE_CONFIG = {
  // 🔍 SEARCH: auto-refresh-config
  autoRefresh: {
    enabled: true,
    delay: 1000, // 1 second delay before refresh
    showLoadingMessage: true,
    loadingMessage: 'Refreshing page...'
  },

  // 🔍 SEARCH: error-retry-config
  errorRetry: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 2000, // 2 seconds between retries
    exponentialBackoff: true
  },

  // 🔍 SEARCH: loading-states-config
  loadingStates: {
    saving: 'Saving...',
    deleting: 'Deleting...',
    loading: 'Loading...',
    uploading: 'Uploading...',
    processing: 'Processing...'
  }
};

// 🔍 SEARCH: theme-config
export const THEME_CONFIG = {
  // 🔍 SEARCH: color-palette-config
  colors: {
    primary: '#f23a00',
    secondary: '#666666',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    background: '#ffffff',
    surface: '#f9fafb',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    border: '#d1d5db'
  },

  // 🔍 SEARCH: spacing-config
  spacing: {
    xs: '5px',
    sm: '10px',
    md: '15px',
    lg: '30px',
    xl: '60px'
  },

  // 🔍 SEARCH: typography-config
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px'
    }
  }
};

// 🔍 SEARCH: rapid-config-exports
export const RAPID_CONFIGS = {
  space: SPACE_COMPONENT_CONFIG,
  article: ARTICLE_COMPONENT_CONFIG,
  user: USER_COMPONENT_CONFIG,
  notification: NOTIFICATION_CONFIG,
  api: API_RESPONSE_CONFIG,
  theme: THEME_CONFIG
};