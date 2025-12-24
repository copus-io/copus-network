// Icon configuration for the application
export const ICON_CONFIG = {
  // x402 payment icons
  X402_PAYMENT: 'https://c.animaapp.com/ikGVr3RO/img/x402-icon-blue-1@2x.png',

  // Action icons
  VIEW: 'https://c.animaapp.com/mft5gmofxQLTNf/img/ic-view.svg',
  EDIT: 'https://c.animaapp.com/w7obk4mX/img/edit-1.svg',
  DELETE: 'https://c.animaapp.com/mft4oqz6uyUKY7/img/delete-1.svg',
  BRANCH_IT: 'https://c.animaapp.com/mftam89xRJwsqQ/img/branch-it.svg',
  CLOSE: 'https://c.animaapp.com/RWdJi6d2/img/close.svg',

  // Icon styles
  ICON_FILTER_DARK_GREY: 'brightness(0) saturate(100%) invert(27%) sepia(0%) saturate(0%)',
};

// Function to get icon URL - can be extended to fetch from API in the future
export const getIconUrl = (iconKey: keyof typeof ICON_CONFIG): string => {
  return ICON_CONFIG[iconKey];
};

// Function to get icon style
export const getIconStyle = (styleKey: keyof typeof ICON_CONFIG): string => {
  return ICON_CONFIG[styleKey];
};