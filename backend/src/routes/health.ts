import { Hono } from 'hono';

type Bindings = {
  ENVIRONMENT: string;
};

export const healthRoute = new Hono<{ Bindings: Bindings }>();

healthRoute.get('/', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT,
  });
});
