import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { authMiddleware, type AuthEnv } from '../middleware/auth';
import { createDb } from '../db';
import { users } from '../db/schema';
import {
  calculateTrialStatus,
  calculateSubscriptionStatus,
  calculateUsageStatus,
  getSubscriptionByUserId,
} from '../lib/trial';

export const userRoute = new Hono<AuthEnv>();

userRoute.use('*', authMiddleware);

userRoute.get('/status', async (c) => {
  const authUser = c.get('user');
  const db = createDb(c.env.DATABASE_URL);
  
  const userRecords = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id));
  
  const user = userRecords[0];
  if (!user) {
    return c.json({ error: 'Not Found', message: 'User not found' }, 404);
  }
  
  const subscription = await getSubscriptionByUserId(db, user.id);
  
  const trialStatus = calculateTrialStatus(user.trialStartedAt);
  const subscriptionStatus = calculateSubscriptionStatus(subscription);
  const usageStatus = await calculateUsageStatus(
    db,
    user.id,
    trialStatus.isActive,
    subscriptionStatus.isActive
  );
  
  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    trial: trialStatus,
    subscription: subscriptionStatus,
    usage: usageStatus,
  });
});
