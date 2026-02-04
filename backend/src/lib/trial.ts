import { eq, and, sql } from 'drizzle-orm';
import type { Database } from '../db';
import { subscriptions, dailyUsage } from '../db/schema';

const TRIAL_DAYS = 14;
const FREE_DAILY_LIMIT = 10;

export interface TrialStatus {
  isActive: boolean;
  daysRemaining: number | null;
  startedAt: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  status: string | null;
  expiresAt: string | null;
}

export interface UsageStatus {
  fillsToday: number;
  fillsRemaining: number | null;
  resetsAt: string;
}

export function calculateTrialStatus(trialStartedAt: Date): TrialStatus {
  const trialEndsAt = new Date(trialStartedAt);
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);
  
  const now = new Date();
  const isActive = now < trialEndsAt;
  const daysRemaining = isActive
    ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  return {
    isActive,
    daysRemaining,
    startedAt: trialStartedAt.toISOString(),
  };
}

export function calculateSubscriptionStatus(
  subscription: {
    status: string;
    currentPeriodEnd: Date | null;
  } | null
): SubscriptionStatus {
  if (!subscription) {
    return {
      isActive: false,
      status: null,
      expiresAt: null,
    };
  }
  
  const now = new Date();
  const isActive = 
    subscription.status === 'active' && 
    subscription.currentPeriodEnd !== null &&
    now < subscription.currentPeriodEnd;
  
  return {
    isActive,
    status: subscription.status,
    expiresAt: subscription.currentPeriodEnd?.toISOString() ?? null,
  };
}

export function calculateNextResetTime(): string {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  ));
  return tomorrow.toISOString();
}

export async function calculateUsageStatus(
  db: Database,
  userId: string,
  isTrialActive: boolean,
  isSubscriptionActive: boolean
): Promise<UsageStatus> {
  const todayUtc = new Date().toISOString().slice(0, 10);
  
  const usageRecords = await db
    .select()
    .from(dailyUsage)
    .where(and(eq(dailyUsage.userId, userId), eq(dailyUsage.date, todayUtc)));
  
  const fillsToday = usageRecords[0]?.fillCount ?? 0;
  
  const hasUnlimitedAccess = isTrialActive || isSubscriptionActive;
  const fillsRemaining = hasUnlimitedAccess
    ? null
    : Math.max(0, FREE_DAILY_LIMIT - fillsToday);
  
  return {
    fillsToday,
    fillsRemaining,
    resetsAt: calculateNextResetTime(),
  };
}

export async function getSubscriptionByUserId(db: Database, userId: string) {
  const results = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));
  
  return results[0] ?? null;
}

export async function getDailyUsage(db: Database, userId: string): Promise<number> {
  const todayUtc = new Date().toISOString().slice(0, 10);
  
  const usageRecords = await db
    .select()
    .from(dailyUsage)
    .where(and(eq(dailyUsage.userId, userId), eq(dailyUsage.date, todayUtc)));
  
  return usageRecords[0]?.fillCount ?? 0;
}

export async function incrementDailyUsage(db: Database, userId: string): Promise<number> {
  const todayUtc = new Date().toISOString().slice(0, 10);
  const id = `${userId}_${todayUtc}`;
  
  const result = await db
    .insert(dailyUsage)
    .values({
      id,
      userId,
      date: todayUtc,
      fillCount: 1,
    })
    .onConflictDoUpdate({
      target: [dailyUsage.userId, dailyUsage.date],
      set: {
        fillCount: sql`${dailyUsage.fillCount} + 1`,
      },
    })
    .returning();
  
  return result[0]?.fillCount ?? 1;
}
