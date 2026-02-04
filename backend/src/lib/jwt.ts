import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export interface JWTUserPayload extends JWTPayload {
  sub: string;
  email: string;
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string;
  type: 'refresh';
}

export async function signJWT(
  payload: { sub: string; email: string },
  secret: string,
  expiresIn: string = '15m'
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

export async function verifyJWT(
  token: string,
  secret: string
): Promise<JWTUserPayload> {
  const secretKey = new TextEncoder().encode(secret);

  const { payload } = await jwtVerify(token, secretKey);

  if (!payload.sub || !payload.email) {
    throw new Error('Invalid JWT payload: missing required claims');
  }

  return payload as JWTUserPayload;
}

export async function signRefreshToken(
  userId: string,
  secret: string
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);

  return new SignJWT({ sub: userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifyRefreshToken(
  token: string,
  secret: string
): Promise<RefreshTokenPayload> {
  const secretKey = new TextEncoder().encode(secret);

  const { payload } = await jwtVerify(token, secretKey);

  if (!payload.sub || payload.type !== 'refresh') {
    throw new Error('Invalid refresh token');
  }

  return payload as RefreshTokenPayload;
}

export function isRefreshTokenExpiringSoon(payload: RefreshTokenPayload): boolean {
  if (!payload.exp) return true;
  const oneDayInSeconds = 24 * 60 * 60;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - now < oneDayInSeconds;
}
