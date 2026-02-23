/**
 * 🔍 SEARCH: component-atomic-functions
 * Atomic component functions for rapid UI modifications
 */

import { FeatureFlags } from '../config/featureFlags';
import { API_ENDPOINTS } from '../config/apiEndpoints';
import { ErrorHandler } from './errorHandler';
import { devLog } from './devLogger';
// Toast will be handled by components using useToast hook

// 🔍 SEARCH: atomic-input-config
export interface AtomicInputConfig {
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  disabledPlaceholder?: string;
  disabledClass?: string;
}

// 🔍 SEARCH: atomic-button-config
export interface AtomicButtonConfig {
  visible?: boolean;
  disabled?: boolean;
  text?: string;
  className?: string;
  confirmationText?: string;
  requireConfirmation?: boolean;
}

// 🔍 SEARCH: component-atomics-class
export class ComponentAtomics {
  // 🔍 SEARCH: atomic-input-generator
  static generateInputConfig(
    fieldName: string,
    permissions: any,
    baseConfig: AtomicInputConfig = {}
  ): AtomicInputConfig {
    const canEdit = permissions[`canEdit${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`];

    return {
      disabled: !canEdit,
      placeholder: canEdit ? (baseConfig.placeholder || `Enter ${fieldName}`) : (baseConfig.disabledPlaceholder || `${fieldName} cannot be edited`),
      className: canEdit ? (baseConfig.className || 'text-medium-dark-grey') : (baseConfig.disabledClass || 'text-gray-500 cursor-not-allowed'),
    };
  }

  // 🔍 SEARCH: atomic-button-generator
  static generateButtonConfig(
    action: string,
    permissions: any,
    baseConfig: AtomicButtonConfig = {}
  ): AtomicButtonConfig {
    const canPerform = permissions[`can${action.charAt(0).toUpperCase() + action.slice(1)}`];
    const requireConfirmation = permissions.requireConfirmation;

    return {
      visible: canPerform,
      disabled: !canPerform,
      text: baseConfig.text || action,
      className: baseConfig.className || 'bg-red-600 hover:bg-red-700',
      requireConfirmation: requireConfirmation,
      confirmationText: baseConfig.confirmationText || `Are you sure you want to ${action}?`
    };
  }

  // 🔍 SEARCH: atomic-validation-generator
  static generateValidationRules(permissions: any, fieldName: string) {
    const canEdit = permissions[`canEdit${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`];

    return {
      required: canEdit,
      minLength: canEdit ? 1 : 0,
      skipValidation: !canEdit
    };
  }

  // 🔍 SEARCH: atomic-api-handler
  static async executeAtomicAction(
    actionType: 'update' | 'delete' | 'create',
    entityType: 'space' | 'article' | 'user',
    data: any,
    context: { component: string; entityId?: string | number }
  ) {
    const endpoint = API_ENDPOINTS[entityType.toUpperCase()][actionType.toUpperCase()];
    const actionName = `${actionType}-${entityType}`;

    try {
      devLog.apiCall(endpoint, data, {
        component: context.component,
        action: actionName,
        entityId: context.entityId
      });

      const startTime = Date.now();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('copus_token')}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      const duration = Date.now() - startTime;

      devLog.apiResponse(endpoint, result, duration, {
        component: context.component,
        action: actionName,
        entityId: context.entityId
      });

      if (result.success) {
        console.log(`✅ ${entityType} ${actionType}d successfully`);
        // Auto-refresh page for immediate feedback
        setTimeout(() => window.location.reload(), 1000);
        return result;
      } else {
        throw new Error(result.msg || `Failed to ${actionType} ${entityType}`);
      }
    } catch (error) {
      const message = ErrorHandler.handleApiError(error, {
        component: context.component,
        action: actionName,
        endpoint: endpoint,
        additionalData: { entityId: context.entityId, data }
      });
      console.error(`❌ ${message}`);
      throw error;
    }
  }

  // 🔍 SEARCH: atomic-permission-checker
  static checkPermissions(entityType: string, entityData: any, userId?: number) {
    switch (entityType) {
      case 'space':
        return FeatureFlags.getSpacePermissions(entityData?.spaceType);
      default:
        return {
          canEdit: true,
          canDelete: true,
          canCreate: true,
          showEditUI: true,
          requireConfirmation: false
        };
    }
  }

  // 🔍 SEARCH: atomic-ui-renderer
  static renderAtomicInput(
    fieldName: string,
    value: string,
    onChange: (value: string) => void,
    config: AtomicInputConfig
  ) {
    return {
      props: {
        type: 'text',
        value: value,
        onChange: (e: any) => onChange(e.target.value),
        disabled: config.disabled,
        placeholder: config.placeholder,
        className: `w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${config.className}`
      }
    };
  }

  // 🔍 SEARCH: atomic-button-renderer
  static renderAtomicButton(
    action: string,
    onClick: () => void,
    config: AtomicButtonConfig
  ) {
    if (!config.visible) return null;

    const handleClick = () => {
      if (config.requireConfirmation) {
        if (window.confirm(config.confirmationText)) {
          onClick();
        }
      } else {
        onClick();
      }
    };

    return {
      visible: config.visible,
      props: {
        onClick: handleClick,
        disabled: config.disabled,
        className: `px-4 py-2 text-white rounded-lg transition-colors ${config.className}`,
        children: config.text
      }
    };
  }
}

// 🔍 SEARCH: atomic-shortcuts
export const atomicShortcuts = {
  // Quick space permission check
  spacePermissions: (spaceType?: number) => FeatureFlags.getSpacePermissions(spaceType),

  // Quick input config for space name
  spaceNameInput: (spaceType?: number, baseClass = '') => {
    const permissions = FeatureFlags.getSpacePermissions(spaceType);
    return ComponentAtomics.generateInputConfig('name', permissions, {
      className: `${baseClass} text-medium-dark-grey`,
      disabledClass: `${baseClass} text-gray-500 cursor-not-allowed`,
      disabledPlaceholder: 'Space name cannot be edited (default space)'
    });
  },

  // Quick button config for space deletion
  spaceDeleteButton: (spaceType?: number) => {
    const permissions = FeatureFlags.getSpacePermissions(spaceType);
    return ComponentAtomics.generateButtonConfig('delete', permissions, {
      text: 'Delete Space',
      confirmationText: 'Are you sure you want to delete this space? This action cannot be undone.',
      className: 'bg-red-600 hover:bg-red-700'
    });
  },

  // Quick API action for space update
  updateSpace: async (spaceId: number, data: any, component: string) => {
    return ComponentAtomics.executeAtomicAction('update', 'space',
      { spaceId, ...data },
      { component, entityId: spaceId }
    );
  }
};