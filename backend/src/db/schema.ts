import { pgTable, text, timestamp, integer, date, uniqueIndex } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  googleId: text('google_id').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  trialStartedAt: timestamp('trial_started_at').defaultNow().notNull(),
});

// Subscriptions table (Lemon Squeezy)
export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lsCustomerId: text('ls_customer_id').notNull(),
  lsOrderId: text('ls_order_id'),
  lsProductId: text('ls_product_id'),
  lsVariantId: text('ls_variant_id'),
  status: text('status').notNull(),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Daily usage tracking
export const dailyUsage = pgTable('daily_usage', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  fillCount: integer('fill_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('daily_usage_user_date_idx').on(table.userId, table.date),
]);

// Submission tracking (prevent duplicates)
export const submissions = pgTable('submissions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  urlHash: text('url_hash').notNull(),
  urlDisplay: text('url_display'),
  platform: text('platform'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('submissions_user_url_idx').on(table.userId, table.urlHash),
]);

// Custom fields
export const customFields = pgTable('custom_fields', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fieldKey: text('field_key').notNull(),
  fieldValue: text('field_value'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('custom_fields_user_field_idx').on(table.userId, table.fieldKey),
]);
