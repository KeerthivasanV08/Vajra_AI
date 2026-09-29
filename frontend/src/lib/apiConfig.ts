export const DEFAULT_PRODUCTION_API_URL = 'https://vajra-ai-sh9c.onrender.com';

function resolveApiBaseUrl(): string {
  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

  // If running in browser and hostname is not localhost/127.0.0.1 (e.g. deployed on Vercel),
  // never send requests to 127.0.0.1 or localhost (prevents ERR_CONNECTION_REFUSED).
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
    if (!isLocalhost) {
      if (!configuredApiUrl || configuredApiUrl.includes('127.0.0.1') || configuredApiUrl.includes('localhost')) {
        return DEFAULT_PRODUCTION_API_URL;
      }
    }
  }

  // If in production mode and configuredApiUrl is missing or local
  if (import.meta.env.PROD) {
    if (!configuredApiUrl || configuredApiUrl.includes('127.0.0.1') || configuredApiUrl.includes('localhost')) {
      return DEFAULT_PRODUCTION_API_URL;
    }
  }

  const url = configuredApiUrl || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : DEFAULT_PRODUCTION_API_URL);
  return url.replace(/\/+$/, '');
}

export const API_BASE_URL = resolveApiBaseUrl();