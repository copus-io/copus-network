import { isNativeApp } from './platform';

export async function initCapacitorListeners() {
  if (!isNativeApp()) return;

  const { App } = await import('@capacitor/app');

  // Handle deep links (OAuth callbacks + share extension)
  App.addListener('appUrlOpen', ({ url }) => {
    const parsed = new URL(url);

    // Share extension: copus://curate?url=...&title=...
    if (parsed.hostname === 'curate') {
      const sharedUrl = parsed.searchParams.get('url');
      const title = parsed.searchParams.get('title');
      const params = new URLSearchParams();
      if (sharedUrl) params.set('url', sharedUrl);
      if (title) params.set('title', title);
      window.location.href = `/create?${params.toString()}`;
      return;
    }

    // OAuth callback: copus://callback?code=...&state=...&provider=...
    if (parsed.hostname === 'callback') {
      const code = parsed.searchParams.get('code');
      const state = parsed.searchParams.get('state');
      const provider = parsed.searchParams.get('provider');
      if (code && state) {
        const params = new URLSearchParams({ code, state });
        if (provider) params.set('provider', provider);
        window.location.href = `/login?${params.toString()}`;
      }
      // Close the in-app browser
      import('@capacitor/browser').then(({ Browser }) => Browser.close());
      return;
    }
  });
}
