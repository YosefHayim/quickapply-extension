# QuickApply Backend API

Hono.js serverless API for the QuickApply Chrome extension, deployed on Cloudflare Workers.

## Quick Start

### Installation
```bash
cd backend
pnpm install
```

### Development
```bash
pnpm dev
```

Server runs on `http://localhost:8787`

### Testing
```bash
pnpm test          # Watch mode
pnpm test:run      # Single run
```

### Deployment
```bash
pnpm deploy
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts           # Main Hono app with CORS & middleware
│   └── routes/
│       └── health.ts      # Health check endpoint
├── package.json           # Dependencies & scripts
├── tsconfig.json          # TypeScript configuration
├── wrangler.toml          # Cloudflare Workers config
├── vitest.config.ts       # Test configuration
└── .dev.vars.example      # Environment variables template
```

## API Endpoints

### Health Check
```
GET /health
```
Returns:
```json
{
  "status": "ok",
  "timestamp": "2026-02-04T21:38:06.523Z",
  "environment": "development"
}
```

### Root
```
GET /
```
Returns:
```json
{
  "message": "QuickApply API",
  "version": "1.0.0",
  "environment": "development"
}
```

## Configuration

### Environment Variables

Copy `.dev.vars.example` to `.dev.vars` for local development:

```bash
cp .dev.vars.example .dev.vars
```

Required secrets (set via `wrangler secret put`):
- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - JWT signing key
- `JWT_REFRESH_SECRET` - JWT refresh token key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `WEBHOOK_SECRET` - Webhook verification secret

### CORS

The API allows requests from:
- `chrome-extension://*` (all extension origins)
- `http://localhost:3000` (local dev)
- `http://localhost:5173` (Vite dev)

## Tech Stack

- **Framework**: Hono.js 4.x
- **Runtime**: Cloudflare Workers
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle ORM
- **Auth**: JWT (jose)
- **Validation**: Zod
- **Testing**: Vitest
- **Language**: TypeScript 5.x

## Development Notes

- TypeScript strict mode enabled
- All endpoints are type-safe
- CORS configured for extension + local dev
- Error handling middleware included
- Request logging enabled

## Shared Types

Shared TypeScript types between extension and backend are in `/shared/types/index.ts`:
- `User` - User profile
- `UserStatus` - User subscription & usage status
- `Submission` - Job application submission
- `CustomField` - Custom form field

## Next Steps

1. Set up environment variables in `.dev.vars`
2. Implement database schema with Drizzle
3. Add authentication routes
4. Add job submission tracking endpoints
5. Deploy to Cloudflare Workers
