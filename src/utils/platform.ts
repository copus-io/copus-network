declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean;
      getPlatform: () => string;
    };
  }
}

export function isNativeApp(): boolean {
  return !!window.Capacitor?.isNativePlatform();
}

export function getPlatform(): 'ios' | 'android' | 'web' {
  if (!window.Capacitor) return 'web';
  const platform = window.Capacitor.getPlatform();
  if (platform === 'ios') return 'ios';
  if (platform === 'android') return 'android';
  return 'web';
}
