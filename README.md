# QuickApply - Job Application AutoFill

[![CI](https://github.com/YosefHayim/quickapply-extension/actions/workflows/ci.yml/badge.svg)](https://github.com/YosefHayim/quickapply-extension/actions/workflows/ci.yml)

One-click Chrome extension to auto-fill job application forms with your saved profile data, including resume upload.

## Features

- **One-Click Fill**: Fill entire job application forms with a single click
- **Smart Detection**: Automatically detects form fields across major job platforms
- **Resume Upload**: Automatically uploads your resume PDF
- **Multiple Profiles**: Create different profiles for different job types
- **Dark/Light Theme**: Beautiful UI with theme toggle
- **Keyboard Shortcut**: `Ctrl+Shift+F` to fill forms instantly
- **Multi-Platform Support**: LinkedIn, Greenhouse, Lever, Workday, Indeed, and more

## Supported Platforms

- LinkedIn
- Greenhouse
- Lever
- Workday
- Indeed
- SmartRecruiters
- iCIMS
- Taleo
- Breezy HR

## Tech Stack

- **Extension**: WXT + React 19 + TypeScript + Tailwind CSS v4
- **Backend**: Hono.js + Cloudflare Workers
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Auth**: Google OAuth + JWT
- **Payments**: Lemon Squeezy

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+

### Setup

```bash
# Clone the repository
git clone https://github.com/YosefHayim/quickapply-extension.git
cd quickapply-extension

# Install extension dependencies
pnpm install

# Install backend dependencies
cd backend && pnpm install && cd ..

# Copy environment files
cp .env.example .env
```

### Development

```bash
# Start extension development server
pnpm dev

# In another terminal, start backend
cd backend && pnpm dev
```

### Testing

```bash
# Run extension tests
pnpm test:run

# Run backend tests
cd backend && pnpm test:run
```

### Build

```bash
# Build extension for production
pnpm build

# Create ZIP for Chrome Web Store
pnpm zip
```

## Project Structure

```
quickapply-extension/
├── src/                    # Extension source
│   ├── entrypoints/
│   │   ├── popup/          # Popup UI (React)
│   │   ├── background.ts   # Service worker
│   │   └── content.ts      # Content script
│   ├── components/ui/      # shadcn/ui components
│   ├── hooks/              # React hooks
│   ├── lib/                # Core utilities
│   │   ├── auth.ts         # Google OAuth flow
│   │   ├── api.ts          # API client
│   │   ├── storage.ts      # Chrome storage
│   │   ├── form-detection.ts
│   │   └── form-filler.ts
│   └── types/              # TypeScript types
├── backend/                # Cloudflare Workers API
│   └── src/
│       ├── routes/         # API endpoints
│       ├── db/             # Drizzle schema
│       ├── lib/            # Utilities
│       └── middleware/     # Auth middleware
├── shared/                 # Shared types
└── .github/workflows/      # CI/CD
```

## Environment Variables

### Extension (`.env`)

| Variable | Description |
|----------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `VITE_API_URL` | Backend API URL |
| `VITE_LEMON_STORE_ID` | Lemon Squeezy store ID |
| `VITE_LEMON_PRO_VARIANT_ID` | Pro plan variant ID |
| `VITE_LEMON_LIFETIME_VARIANT_ID` | Lifetime plan variant ID |

### Backend (Cloudflare Workers secrets)

| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `WEBHOOK_SECRET` | Lemon Squeezy webhook secret |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions.

### Quick Deploy

```bash
# Deploy backend to Cloudflare Workers
cd backend && pnpm deploy

# Build extension for Chrome Web Store
pnpm zip
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/google` | Google OAuth login |
| POST | `/auth/refresh` | Refresh JWT |
| POST | `/auth/logout` | Logout |
| GET | `/user/status` | Get user trial/subscription status |
| POST | `/webhooks/lemonsqueezy` | Payment webhooks |
| GET | `/submissions` | List submissions |
| POST | `/submissions` | Record submission |
| GET | `/submissions/check` | Check URL duplicate |
| GET | `/fields` | Get custom fields |
| PUT | `/fields` | Update custom fields |
| GET | `/health` | Health check |

## License

MIT
