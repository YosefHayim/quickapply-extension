import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { createDb, users, subscriptions } from '../db';
import { verifyLemonSqueezySignature } from '../lib/webhook-verify';

type Bindings = {
  DATABASE_URL: string;
  WEBHOOK_SECRET: string;
};

type LemonSqueezyStatus =
  | 'on_trial'
  | 'active'
  | 'paused'
  | 'past_due'
  | 'unpaid'
  | 'cancelled'
  | 'expired';

type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired';

interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: { user_id?: string };
  };
  data: {
    id: string;
    attributes: {
      store_id: number;
      customer_id: number;
      order_id: number;
      product_id: number;
      variant_id: number;
      status: LemonSqueezyStatus;
      user_email: string;
      user_name: string;
      renews_at: string | null;
      ends_at: string | null;
      created_at: string;
      updated_at: string;
    };
  };
}

const STATUS_MAP: Record<LemonSqueezyStatus, SubscriptionStatus> = {
  on_trial: 'active',
  active: 'active',
  paused: 'paused',
  past_due: 'active',
  unpaid: 'expired',
  cancelled: 'cancelled',
  expired: 'expired',
};

export const webhookRoute = new Hono<{ Bindings: Bindings }>();

webhookRoute.post('/lemonsqueezy', async (c) => {
  const signature = c.req.header('X-Signature');
  
  if (!signature) {
    return c.json({ error: 'Missing signature' }, 400);
  }

  const rawBody = await c.req.text();
  const isValid = await verifyLemonSqueezySignature(
    rawBody,
    signature,
    c.env.WEBHOOK_SECRET
  );

  if (!isValid) {
    return c.json({ error: 'Invalid signature' }, 401);
  }

  const payload: LemonSqueezyWebhookPayload = JSON.parse(rawBody);
  const eventName = payload.meta.event_name;
  const attributes = payload.data.attributes;
  const subscriptionId = payload.data.id;

  const db = createDb(c.env.DATABASE_URL);

  const user = await db.query.users.findFirst({
    where: eq(users.email, attributes.user_email),
  });

  if (!user) {
    console.warn(`Webhook: User not found for email ${attributes.user_email}`);
    return c.json({ received: true });
  }

  switch (eventName) {
    case 'subscription_created': {
      const now = new Date();
      await db
        .insert(subscriptions)
        .values({
          id: subscriptionId,
          userId: user.id,
          lsCustomerId: String(attributes.customer_id),
          lsOrderId: String(attributes.order_id),
          lsProductId: String(attributes.product_id),
          lsVariantId: String(attributes.variant_id),
          status: STATUS_MAP[attributes.status],
          currentPeriodStart: now,
          currentPeriodEnd: attributes.renews_at ? new Date(attributes.renews_at) : null,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: subscriptions.id,
          set: {
            status: STATUS_MAP[attributes.status],
            currentPeriodEnd: attributes.renews_at ? new Date(attributes.renews_at) : null,
            updatedAt: now,
          },
        });
      break;
    }

    case 'subscription_updated': {
      await db
        .update(subscriptions)
        .set({
          status: STATUS_MAP[attributes.status],
          currentPeriodEnd: attributes.renews_at ? new Date(attributes.renews_at) : null,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId));
      break;
    }

    case 'subscription_cancelled': {
      await db
        .update(subscriptions)
        .set({
          status: 'cancelled',
          currentPeriodEnd: attributes.ends_at ? new Date(attributes.ends_at) : null,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId));
      break;
    }

    case 'subscription_payment_success': {
      await db
        .update(subscriptions)
        .set({
          currentPeriodEnd: attributes.renews_at ? new Date(attributes.renews_at) : null,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId));
      break;
    }

    case 'subscription_expired': {
      await db
        .update(subscriptions)
        .set({
          status: 'expired',
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId));
      break;
    }

    default:
      console.warn(`Webhook: Unknown event type ${eventName}`);
  }

  return c.json({ received: true });
});
