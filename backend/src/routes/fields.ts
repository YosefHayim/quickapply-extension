import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { authMiddleware, type AuthEnv } from '../middleware/auth';
import { createDb } from '../db';
import { customFields } from '../db/schema';

export const fieldsRoute = new Hono<AuthEnv>();

fieldsRoute.use('*', authMiddleware);

// GET /fields - Get all custom fields for user
fieldsRoute.get('/', async (c) => {
  const authUser = c.get('user');
  const db = createDb(c.env.DATABASE_URL);

  const records = await db
    .select({
      fieldKey: customFields.fieldKey,
      fieldValue: customFields.fieldValue,
    })
    .from(customFields)
    .where(eq(customFields.userId, authUser.id));

  const fields: Record<string, string> = {};
  for (const record of records) {
    fields[record.fieldKey] = record.fieldValue ?? '';
  }

  return c.json({ fields });
});

// PUT /fields - Replace all custom fields
fieldsRoute.put('/', async (c) => {
  const authUser = c.get('user');
  const db = createDb(c.env.DATABASE_URL);
  const body = await c.req.json<{ fields: Record<string, string> }>();

  if (!body.fields || typeof body.fields !== 'object') {
    return c.json({ error: 'Bad Request', message: 'fields object required' }, 400);
  }

  await db
    .delete(customFields)
    .where(eq(customFields.userId, authUser.id));

  const now = new Date();
  const entries = Object.entries(body.fields);
  
  if (entries.length > 0) {
    const insertData = entries.map(([key, value]) => ({
      id: `${authUser.id}_${key}_${Date.now()}`,
      userId: authUser.id,
      fieldKey: key,
      fieldValue: value,
      updatedAt: now,
    }));

    await db.insert(customFields).values(insertData);
  }

  return c.json({
    fields: body.fields,
    updatedAt: now.toISOString(),
  });
});
