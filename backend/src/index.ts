import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { healthRoute } from './routes/health';
import { userRoute } from './routes/user';
import { authRoute } from './routes/auth';
import { webhookRoute } from './routes/webhooks';

type Bindings = {
  ENVIRONMENT: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  DATABASE_URL: string;
  WEBHOOK_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(logger());

app.use(
  cors({
    origin: [
      'chrome-extension://*',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.route('/health', healthRoute);
app.route('/auth', authRoute);
app.route('/user', userRoute);
app.route('/webhooks', webhookRoute);

app.get('/', (c) => {
  return c.json({
    message: 'QuickApply API',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT,
  });
});

app.onError((err, c) => {
  console.error('Error:', err);
  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message,
    },
    500
  );
});

export default app;
