import { getJWT, getRefreshToken, setJWT, setRefreshToken, clearAuth } from './storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    await setJWT(data.jwt);

    if (data.refreshToken) {
      await setRefreshToken(data.refreshToken);
    }

    return data.jwt;
  } catch {
    return null;
  }
}

export async function authenticatedFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let jwt = await getJWT();

  if (!jwt) {
    throw new AuthError('Not authenticated');
  }

  const makeRequest = async (token: string) => {
    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  let response = await makeRequest(jwt);

  if (response.status === 401) {
    const newJwt = await refreshAccessToken();
    if (newJwt) {
      response = await makeRequest(newJwt);
    } else {
      await clearAuth();
      throw new AuthError('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
