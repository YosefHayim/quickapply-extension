import { createRemoteJWKSet, jwtVerify } from 'jose';

const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUER = 'https://accounts.google.com';

export interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getGoogleJWKS() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(GOOGLE_CERTS_URL));
  }
  return jwks;
}

export async function verifyGoogleIdToken(
  idToken: string,
  clientId: string
): Promise<GoogleUserInfo> {
  const JWKS = getGoogleJWKS();

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: GOOGLE_ISSUER,
    audience: clientId,
  });

  if (!payload.sub || !payload.email) {
    throw new Error('Invalid Google ID token: missing required claims');
  }

  return {
    sub: payload.sub,
    email: payload.email as string,
    name: (payload.name as string) || '',
    picture: (payload.picture as string) || '',
  };
}
