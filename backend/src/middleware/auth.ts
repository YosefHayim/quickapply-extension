import { createMiddleware } from 'hono/factory';
import { errors as joseErrors } from 'jose';
import { verifyJWT } from '../lib/jwt';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthEnv {
  Variables: {
    user: AuthUser;
  };
  Bindings: {
    JWT_SECRET: string;
    DATABASE_URL: string;
  };
}

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', message: 'Missing or invalid authorization header' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyJWT(token, c.env.JWT_SECRET);

    c.set('user', {
      id: payload.sub,
      email: payload.email,
    });

    await next();
  } catch (error) {
    if (error instanceof joseErrors.JWTExpired) {
      return c.json({ error: 'Unauthorized', message: 'Token expired' }, 401);
    }
    return c.json({ error: 'Unauthorized', message: 'Invalid token' }, 401);
  }
});
