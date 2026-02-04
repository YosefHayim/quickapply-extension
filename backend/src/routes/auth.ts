import { Hono } from 'hono';
import { z } from 'zod';
import { eq, or } from 'drizzle-orm';
import { createDb } from '../db';
import { users } from '../db/schema';
import { verifyGoogleIdToken } from '../lib/google';
import {
  signJWT,
  signRefreshToken,
  verifyRefreshToken,
  isRefreshTokenExpiringSoon,
} from '../lib/jwt';

type AuthBindings = {
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  DATABASE_URL: string;
};

export const authRoute = new Hono<{ Bindings: AuthBindings }>();

const googleAuthSchema = z.object({
  idToken: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

authRoute.post('/google', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = googleAuthSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Bad Request', message: 'Invalid request body' }, 400);
  }

  const { idToken } = parsed.data;

  let googleUser;
  try {
    googleUser = await verifyGoogleIdToken(idToken, c.env.GOOGLE_CLIENT_ID);
  } catch (error) {
    return c.json({ error: 'Unauthorized', message: 'Invalid Google ID token' }, 401);
  }

  const db = createDb(c.env.DATABASE_URL);

  const existingUsers = await db
    .select()
    .from(users)
    .where(or(eq(users.googleId, googleUser.sub), eq(users.email, googleUser.email)));

  let user = existingUsers[0];

  if (!user) {
    const newUserId = crypto.randomUUID();
    const now = new Date();

    const insertedUsers = await db
      .insert(users)
      .values({
        id: newUserId,
        googleId: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name || null,
        createdAt: now,
        trialStartedAt: now,
      })
      .returning();

    const insertedUser = insertedUsers[0];
    if (!insertedUser) {
      return c.json({ error: 'Internal Server Error', message: 'Failed to create user' }, 500);
    }
    user = insertedUser;
  } else if (user.googleId !== googleUser.sub) {
    await db
      .update(users)
      .set({ googleId: googleUser.sub })
      .where(eq(users.id, user.id));
    user = { ...user, googleId: googleUser.sub };
  }

  const [jwt, refreshToken] = await Promise.all([
    signJWT({ sub: user.id, email: user.email }, c.env.JWT_SECRET, '15m'),
    signRefreshToken(user.id, c.env.JWT_REFRESH_SECRET),
  ]);

  return c.json({
    jwt,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      trialStartedAt: user.trialStartedAt.toISOString(),
    },
  });
});

authRoute.post('/refresh', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = refreshSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Bad Request', message: 'Invalid request body' }, 400);
  }

  const { refreshToken } = parsed.data;

  let payload;
  try {
    payload = await verifyRefreshToken(refreshToken, c.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return c.json({ error: 'Unauthorized', message: 'Invalid refresh token' }, 401);
  }

  const db = createDb(c.env.DATABASE_URL);

  const userRecords = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.sub));

  const user = userRecords[0];
  if (!user) {
    return c.json({ error: 'Unauthorized', message: 'User not found' }, 401);
  }

  const jwt = await signJWT({ sub: user.id, email: user.email }, c.env.JWT_SECRET, '15m');

  const response: { jwt: string; refreshToken?: string } = { jwt };

  if (isRefreshTokenExpiringSoon(payload)) {
    response.refreshToken = await signRefreshToken(user.id, c.env.JWT_REFRESH_SECRET);
  }

  return c.json(response);
});

authRoute.post('/logout', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = logoutSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Bad Request', message: 'Invalid request body' }, 400);
  }

  return c.json({ success: true });
});
