import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { users, subscriptions, dailyUsage, submissions, customFields } from '../../backend/src/db/schema';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Subscription = InferSelectModel<typeof subscriptions>;
export type NewSubscription = InferInsertModel<typeof subscriptions>;

export type DailyUsage = InferSelectModel<typeof dailyUsage>;
export type NewDailyUsage = InferInsertModel<typeof dailyUsage>;

export type Submission = InferSelectModel<typeof submissions>;
export type NewSubmission = InferInsertModel<typeof submissions>;

export type CustomField = InferSelectModel<typeof customFields>;
export type NewCustomField = InferInsertModel<typeof customFields>;
