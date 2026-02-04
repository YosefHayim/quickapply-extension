const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  jwt: string;
  refreshToken: string;
  user: AuthUser;
}

function buildGoogleAuthUrl(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('VITE_GOOGLE_CLIENT_ID environment variable is not set');
  }

  const redirectUri = chrome.identity.getRedirectURL();
  const nonce = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce: nonce,
    prompt: 'select_account',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

function parseIdTokenFromUrl(redirectUrl: string): string {
  const url = new URL(redirectUrl);
  const hashFragment = url.hash.substring(1);
  const params = new URLSearchParams(hashFragment);
  const idToken = params.get('id_token');
  if (!idToken) {
    throw new Error('No id_token in OAuth response');
  }
  return idToken;
}

async function launchOAuth(): Promise<string> {
  const authUrl = buildGoogleAuthUrl();

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, (redirectUrl) => {
      if (chrome.runtime.lastError) {
        const errorMessage = chrome.runtime.lastError.message || 'OAuth flow failed';
        const isCancellation =
          errorMessage.includes('canceled') ||
          errorMessage.includes('cancelled') ||
          errorMessage.includes('user denied');

        if (isCancellation) {
          reject(new Error('Google sign-in was cancelled'));
          return;
        }
        reject(new Error(errorMessage));
        return;
      }

      if (!redirectUrl) {
        reject(new Error('No redirect URL received from OAuth flow'));
        return;
      }

      try {
        const idToken = parseIdTokenFromUrl(redirectUrl);
        resolve(idToken);
      } catch (e) {
        reject(e);
      }
    });
  });
}

async function authenticateWithBackend(idToken: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      (errorData as { message?: string }).message || `Authentication failed: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data as AuthResponse;
}

export async function loginWithGoogle(): Promise<AuthResponse> {
  const idToken = await launchOAuth();
  const authResponse = await authenticateWithBackend(idToken);
  return authResponse;
}

export async function logout(): Promise<void> {}
