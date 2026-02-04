import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authMiddleware, type AuthEnv } from '../middleware/auth';
import { createDb } from '../db';
import { submissions, users } from '../db/schema';
import { hashUrl, normalizeUrl } from '../lib/url-utils';
import {
  calculateTrialStatus,
  calculateSubscriptionStatus,
  getSubscriptionByUserId,
  getDailyUsage,
  incrementDailyUsage,
} from '../lib/trial';

const FREE_DAILY_LIMIT = 10;
const UPGRADE_URL = 'https://quickapply.lemonsqueezy.com/checkout';

export const submissionsRoute = new Hono<AuthEnv>();

submissionsRoute.use('*', authMiddleware);

const createSubmissionSchema = z.object({
  url: z.string().url(),
  platform: z.string().optional(),
});

const listQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

const checkQuerySchema = z.object({
  url: z.string().url(),
});

submissionsRoute.post('/', async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const parsed = createSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Bad Request', message: 'Invalid request body' }, 400);
  }

  const { url, platform } = parsed.data;
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
  const hasUnlimitedAccess = trialStatus.isActive || subscriptionStatus.isActive;

  if (!hasUnlimitedAccess) {
    const todayUsage = await getDailyUsage(db, user.id);
    if (todayUsage >= FREE_DAILY_LIMIT) {
      return c.json(
        {
          error: 'Daily limit reached',
          message: `You've used all ${FREE_DAILY_LIMIT} free fills for today. Upgrade to Pro for unlimited fills.`,
          upgradeUrl: UPGRADE_URL,
          fillsUsed: todayUsage,
          fillsLimit: FREE_DAILY_LIMIT,
        },
        429
      );
    }
  }

  const urlHash = await hashUrl(url);

  const existing = await db
    .select()
    .from(submissions)
    .where(and(eq(submissions.userId, authUser.id), eq(submissions.urlHash, urlHash)));

  if (existing[0]) {
    return c.json({
      isDuplicate: true,
      submittedAt: existing[0].submittedAt.toISOString(),
    });
  }

  const newSubmission = await db
    .insert(submissions)
    .values({
      id: crypto.randomUUID(),
      userId: authUser.id,
      urlHash,
      urlDisplay: normalizeUrl(url),
      platform: platform ?? null,
    })
    .returning();

  const submission = newSubmission[0];
  if (!submission) {
    return c.json({ error: 'Internal Server Error', message: 'Failed to create submission' }, 500);
  }

  const newUsageCount = await incrementDailyUsage(db, user.id);
  const fillsRemaining = hasUnlimitedAccess
    ? null
    : Math.max(0, FREE_DAILY_LIMIT - newUsageCount);

  return c.json({
    id: submission.id,
    isDuplicate: false,
    usage: {
      fillsToday: newUsageCount,
      fillsRemaining,
      isUnlimited: hasUnlimitedAccess,
    },
  });
});

submissionsRoute.get('/', async (c) => {
  const authUser = c.get('user');
  const query = listQuerySchema.safeParse({
    limit: c.req.query('limit'),
    offset: c.req.query('offset'),
  });

  if (!query.success) {
    return c.json({ error: 'Bad Request', message: 'Invalid query parameters' }, 400);
  }

  const { limit, offset } = query.data;
  const db = createDb(c.env.DATABASE_URL);

  const [submissionsList, countResult] = await Promise.all([
    db
      .select()
      .from(submissions)
      .where(eq(submissions.userId, authUser.id))
      .orderBy(desc(submissions.submittedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(submissions)
      .where(eq(submissions.userId, authUser.id)),
  ]);

  return c.json({
    submissions: submissionsList.map((s) => ({
      id: s.id,
      url: s.urlDisplay,
      platform: s.platform,
      submittedAt: s.submittedAt.toISOString(),
    })),
    total: countResult[0]?.count ?? 0,
  });
});

submissionsRoute.get('/check', async (c) => {
  const authUser = c.get('user');
  const urlParam = c.req.query('url');

  const parsed = checkQuerySchema.safeParse({ url: urlParam });
  if (!parsed.success) {
    return c.json({ error: 'Bad Request', message: 'Invalid URL parameter' }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);
  const urlHash = await hashUrl(parsed.data.url);

  const existing = await db
    .select()
    .from(submissions)
    .where(and(eq(submissions.userId, authUser.id), eq(submissions.urlHash, urlHash)));

  if (existing[0]) {
    return c.json({
      isDuplicate: true,
      submittedAt: existing[0].submittedAt.toISOString(),
    });
  }

  return c.json({ isDuplicate: false });
});
