# Deployment Guide

This guide covers deploying the QuickApply Chrome Extension and its backend API.

## Prerequisites

Before deploying, you'll need accounts and credentials from:

1. **Cloudflare** - For Workers (backend hosting)
2. **Neon** - For PostgreSQL database
3. **Google Cloud Console** - For OAuth credentials
4. **Lemon Squeezy** - For payment processing

## Environment Setup

### Backend Secrets (Cloudflare Workers)

Set these secrets using `wrangler secret put <NAME>`:

| Secret | Description | How to Get |
|--------|-------------|------------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Neon dashboard → Connection Details |
| `JWT_SECRET` | Random 32+ char string for signing JWTs | Generate with `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Random 32+ char string for refresh tokens | Generate with `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Google Cloud Console → APIs & Services → Credentials |
| `WEBHOOK_SECRET` | Lemon Squeezy webhook signing secret | Lemon Squeezy → Settings → Webhooks |

### Extension Environment Variables

Create a `.env` file in the root directory:

```bash
VITE_LEMON_STORE_ID=your_store_id
VITE_LEMON_PRO_VARIANT_ID=your_pro_variant_id
VITE_LEMON_LIFETIME_VARIANT_ID=your_lifetime_variant_id
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_API_URL=https://your-worker.your-subdomain.workers.dev
```

## Step-by-Step Deployment

### 1. Set Up Neon Database

1. Create a Neon account at https://neon.tech
2. Create a new project
3. Copy the connection string (with pooler enabled)
4. Run database migrations:

```bash
cd backend
pnpm db:push
```

### 2. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to APIs & Services → Credentials
4. Create an OAuth 2.0 Client ID:
   - Application type: **Chrome Extension**
   - Name: QuickApply
   - Add your extension ID (from `chrome://extensions`)
5. Copy the Client ID

### 3. Set Up Lemon Squeezy

1. Create a Lemon Squeezy account
2. Create products for Pro and Lifetime plans
3. Note the Store ID and Variant IDs
4. Set up webhook:
   - URL: `https://your-worker.workers.dev/webhooks/lemonsqueezy`
   - Events: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `order_created`
5. Copy the webhook signing secret

### 4. Deploy Backend to Cloudflare Workers

```bash
cd backend

# Login to Cloudflare
pnpm exec wrangler login

# Set secrets
pnpm exec wrangler secret put DATABASE_URL
pnpm exec wrangler secret put JWT_SECRET
pnpm exec wrangler secret put JWT_REFRESH_SECRET
pnpm exec wrangler secret put GOOGLE_CLIENT_ID
pnpm exec wrangler secret put WEBHOOK_SECRET

# Deploy
pnpm deploy
```

Your API will be available at: `https://quickapply-api.<your-subdomain>.workers.dev`

### 5. Build Extension

```bash
# In project root
pnpm build
```

The built extension will be in `.output/chrome-mv3/`.

### 6. Publish to Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Create a new item
3. Upload the `.output/chrome-mv3/` folder as a ZIP
4. Fill in listing details
5. Submit for review

## GitHub Actions Setup

For automated deployments, add these secrets to your GitHub repository:

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Workers edit permissions |

To create a Cloudflare API token:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Create Token → Use template "Edit Cloudflare Workers"
3. Copy the token and add it to GitHub Secrets

## Verifying Deployment

### Backend Health Check

```bash
curl https://your-worker.workers.dev/health
```

Expected response:
```json
{"status":"ok","timestamp":"..."}
```

### Test Authentication Flow

1. Install the extension locally
2. Click the extension icon
3. Sign in with Google
4. Verify trial status appears

## Troubleshooting

### Common Issues

**"Database connection failed"**
- Verify `DATABASE_URL` is correct
- Ensure Neon project is active (not suspended)
- Check that pooler connection string is used

**"Invalid Google token"**
- Verify `GOOGLE_CLIENT_ID` matches in both backend and extension
- Ensure extension ID is added to OAuth client in Google Console

**"Webhook signature invalid"**
- Regenerate webhook secret in Lemon Squeezy
- Update `WEBHOOK_SECRET` in Cloudflare

### Logs

View backend logs:
```bash
cd backend
pnpm exec wrangler tail
```

## Production Checklist

- [ ] Database migrations applied
- [ ] All secrets configured in Cloudflare
- [ ] Google OAuth configured for production extension ID
- [ ] Lemon Squeezy webhook pointing to production URL
- [ ] Extension `.env` pointing to production API
- [ ] GitHub Actions secrets configured
- [ ] Extension submitted to Chrome Web Store
