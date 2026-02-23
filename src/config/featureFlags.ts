/**
 * 🔍 SEARCH: feature-flags-system
 * Feature flags for rapid development and A/B testing
 */

// 🔍 SEARCH: space-feature-flags
export interface SpaceFeatureFlags {
  canEditName: boolean;
  canDelete: boolean;
  canEditDescription: boolean;
  canEditCover: boolean;
  showEditUI: boolean;
  requireConfirmation: boolean;
}

// 🔍 SEARCH: feature-flag-rules
export class FeatureFlags {
  // 🔍 SEARCH: space-permission-calculator
  static getSpacePermissions(spaceType?: number): SpaceFeatureFlags {
    // spaceType 0 or undefined = custom space (full permissions)
    // spaceType 1 = Treasury (limited permissions)
    // spaceType 2 = Curations (limited permissions)
    const isDefaultSpace = spaceType && spaceType > 0;

    return {
      canEditName: !isDefaultSpace,
      canDelete: !isDefaultSpace,
      canEditDescription: true, // Always allow description editing
      canEditCover: false, // Disable cover editing - not supported yet
      showEditUI: true, // Always show edit UI
      requireConfirmation: isDefaultSpace, // Require confirmation for default spaces
    };
  }

  // 🔍 SEARCH: ui-feature-flags
  static getUIFeatures() {
    return {
      showDevLogs: process.env.NODE_ENV === 'development',
      showDebugInfo: process.env.NODE_ENV === 'development',
      enableAdvancedFeatures: true,
      showPerformanceMetrics: process.env.NODE_ENV === 'development',
    };
  }

  // 🔍 SEARCH: validation-rules
  static getValidationRules(permissions: SpaceFeatureFlags) {
    return {
      nameRequired: permissions.canEditName,
      nameMinLength: permissions.canEditName ? 1 : 0,
      descriptionMaxLength: 500,
      coverUrlValidation: permissions.canEditCover,
    };
  }
}

// 🔍 SEARCH: permission-hooks
export const useSpacePermissions = (spaceType?: number) => {
  return FeatureFlags.getSpacePermissions(spaceType);
};

export const useUIFeatures = () => {
  return FeatureFlags.getUIFeatures();
};