/**
 * 🔍 SEARCH: development-shortcuts-templates
 * Development shortcuts and templates for rapid coding
 */

import { ComponentAtomics, atomicShortcuts } from './componentAtomics';
import { RAPID_CONFIGS } from '../config/componentConfigs';
import { FeatureFlags } from '../config/featureFlags';
import { API_ENDPOINTS } from '../config/apiEndpoints';
import { ErrorHandler } from './errorHandler';
import { devLog } from './devLogger';

// 🔍 SEARCH: rapid-space-shortcuts
export const spaceShortcuts = {
  // 🔍 SEARCH: space-edit-setup
  setupSpaceEdit: (spaceInfo: any, userId?: number) => {
    const permissions = FeatureFlags.getSpacePermissions(spaceInfo?.spaceType);
    const config = RAPID_CONFIGS.space.editForm;

    return {
      permissions,
      inputs: {
        name: ComponentAtomics.generateInputConfig('name', permissions, config.nameInput),
        description: ComponentAtomics.generateInputConfig('description', permissions, config.descriptionInput),
        coverUrl: ComponentAtomics.generateInputConfig('coverUrl', permissions, config.coverUrlInput)
      },
      buttons: {
        delete: ComponentAtomics.generateButtonConfig('delete', permissions, RAPID_CONFIGS.space.actionButtons.delete)
      },
      validation: FeatureFlags.getValidationRules(permissions)
    };
  },

  // 🔍 SEARCH: space-quick-update
  quickUpdate: async (spaceId: number, updates: any, component: string) => {
    return atomicShortcuts.updateSpace(spaceId, updates, component);
  },

  // 🔍 SEARCH: space-permission-check
  checkPermissions: (spaceType?: number) => atomicShortcuts.spacePermissions(spaceType)
};

// 🔍 SEARCH: rapid-component-templates
export const componentTemplates = {
  // 🔍 SEARCH: input-template
  generateInput: (fieldName: string, value: any, onChange: (value: any) => void, permissions: any, configs: any) => {
    const inputConfig = ComponentAtomics.generateInputConfig(fieldName, permissions, configs);
    return ComponentAtomics.renderAtomicInput(fieldName, value, onChange, inputConfig);
  },

  // 🔍 SEARCH: button-template
  generateButton: (action: string, onClick: () => void, permissions: any, configs: any) => {
    const buttonConfig = ComponentAtomics.generateButtonConfig(action, permissions, configs);
    return ComponentAtomics.renderAtomicButton(action, onClick, buttonConfig);
  },

  // 🔍 SEARCH: form-template
  generateForm: (entityType: 'space' | 'article' | 'user', entityData: any, onSubmit: (data: any) => void) => {
    const permissions = ComponentAtomics.checkPermissions(entityType, entityData);
    const config = RAPID_CONFIGS[entityType];

    return {
      permissions,
      config,
      onSubmit,
      entityData,
      renderField: (fieldName: string) => {
        const fieldConfig = config.editForm[`${fieldName}Input`] || config.editForm[`${fieldName}Textarea`];
        return ComponentAtomics.generateInputConfig(fieldName, permissions, fieldConfig);
      }
    };
  }
};

// 🔍 SEARCH: rapid-api-shortcuts
export const apiShortcuts = {
  // 🔍 SEARCH: quick-api-call
  quickCall: async (endpoint: string, data: any, context: { component: string; action: string }) => {
    try {
      devLog.apiCall(endpoint, data, context);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('copus_token')}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      devLog.apiResponse(endpoint, result, 0, context);

      return result;
    } catch (error) {
      devLog.apiError(endpoint, error, context);
      throw error;
    }
  },

  // 🔍 SEARCH: space-api-shortcuts
  space: {
    update: (spaceId: number, data: any, component: string) =>
      apiShortcuts.quickCall(API_ENDPOINTS.SPACE.UPDATE, { spaceId, ...data }, { component, action: 'update-space' }),

    delete: (spaceId: number, component: string) =>
      apiShortcuts.quickCall(API_ENDPOINTS.SPACE.DELETE, { spaceId }, { component, action: 'delete-space' }),

    info: (spaceId: number, component: string) =>
      apiShortcuts.quickCall(API_ENDPOINTS.SPACE.INFO, { spaceId }, { component, action: 'get-space-info' })
  },

  // 🔍 SEARCH: article-api-shortcuts
  article: {
    create: (data: any, component: string) =>
      apiShortcuts.quickCall(API_ENDPOINTS.ARTICLE.CREATE, data, { component, action: 'create-article' }),

    update: (articleId: number, data: any, component: string) =>
      apiShortcuts.quickCall(API_ENDPOINTS.ARTICLE.UPDATE, { articleId, ...data }, { component, action: 'update-article' })
  }
};

// 🔍 SEARCH: rapid-event-handlers
export const eventHandlers = {
  // 🔍 SEARCH: space-edit-handler
  createSpaceEditHandler: (spaceInfo: any, component: string) => {
    const permissions = FeatureFlags.getSpacePermissions(spaceInfo?.spaceType);

    return {
      handleNameEdit: async (newName: string) => {
        if (!permissions.canEditName) {
          console.warn('🚫 Name editing not allowed for this space type');
          return;
        }

        try {
          await apiShortcuts.space.update(spaceInfo.id, { name: newName }, component);
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          ErrorHandler.handleApiError(error, { component, action: 'edit-space-name' });
        }
      },

      handleDescriptionEdit: async (newDescription: string) => {
        try {
          await apiShortcuts.space.update(spaceInfo.id, { description: newDescription }, component);
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          ErrorHandler.handleApiError(error, { component, action: 'edit-space-description' });
        }
      },

      handleDelete: async () => {
        if (!permissions.canDelete) {
          console.warn('🚫 Space deletion not allowed for this space type');
          return;
        }

        const confirmText = permissions.requireConfirmation ?
          'Are you sure you want to delete this default space? This action cannot be undone.' :
          'Are you sure you want to delete this space? This action cannot be undone.';

        if (!window.confirm(confirmText)) return;

        try {
          await apiShortcuts.space.delete(spaceInfo.id, component);
          window.location.href = '/spaces';
        } catch (error) {
          ErrorHandler.handleApiError(error, { component, action: 'delete-space' });
        }
      }
    };
  },

  // 🔍 SEARCH: generic-form-handler
  createFormHandler: (entityType: string, entityData: any, component: string) => {
    return {
      handleSubmit: async (formData: any) => {
        const endpoint = API_ENDPOINTS[entityType.toUpperCase()].UPDATE;

        try {
          await apiShortcuts.quickCall(endpoint, {
            [`${entityType}Id`]: entityData.id,
            ...formData
          }, { component, action: `update-${entityType}` });

          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          ErrorHandler.handleApiError(error, { component, action: `update-${entityType}` });
        }
      }
    };
  }
};

// 🔍 SEARCH: code-generation-templates
export const codeTemplates = {
  // 🔍 SEARCH: component-boilerplate
  componentBoilerplate: (componentName: string, entityType: string) => `
import React, { useState } from 'react';
import { ${entityType}Shortcuts } from '../utils/devShortcuts';
import { RAPID_CONFIGS } from '../config/componentConfigs';
import { showToast } from '../components/ui/toast';

// 🔍 SEARCH: ${componentName.toLowerCase()}-component
export const ${componentName} = ({ ${entityType}Data }: { ${entityType}Data: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const setup = ${entityType}Shortcuts.setup${componentName.replace(componentName[0], componentName[0].toUpperCase())}(${entityType}Data);

  // 🔍 SEARCH: ${componentName.toLowerCase()}-handlers
  const handlers = eventHandlers.create${componentName.replace(componentName[0], componentName[0].toUpperCase())}Handler(${entityType}Data, '${componentName}');

  return (
    <div className="p-6">
      {/* Component JSX here */}
    </div>
  );
};`,

  // 🔍 SEARCH: hook-boilerplate
  hookBoilerplate: (hookName: string, entityType: string) => `
import { useState, useCallback } from 'react';
import { ${entityType}Shortcuts } from '../utils/devShortcuts';
import { ErrorHandler } from '../utils/errorHandler';

// 🔍 SEARCH: ${hookName.toLowerCase()}-hook
export const ${hookName} = (${entityType}Data: any) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (action: string, data?: any) => {
    setLoading(true);
    setError(null);

    try {
      const result = await ${entityType}Shortcuts.quickUpdate(${entityType}Data.id, data, '${hookName}');
      return result;
    } catch (err) {
      const message = ErrorHandler.handleApiError(err, { component: '${hookName}', action });
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [${entityType}Data.id]);

  return { execute, loading, error };
};`
};

// 🔍 SEARCH: rapid-development-shortcuts-export
export const rapidDev = {
  space: spaceShortcuts,
  components: componentTemplates,
  api: apiShortcuts,
  events: eventHandlers,
  templates: codeTemplates
};