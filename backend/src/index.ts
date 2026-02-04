import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { healthRoute } from './routes/health';

type Bindings = {
  ENVIRONMENT: string;
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
