# QuickApply - Job Application AutoFill

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

- **Framework**: WXT (Next-gen Web Extension Framework)
- **UI**: React + shadcn/ui + Tailwind CSS
- **Language**: TypeScript
- **Payments**: Lemon Squeezy

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Create ZIP for Chrome Web Store
pnpm zip
```

## Project Structure

```
src/
├── entrypoints/
│   ├── popup/          # Extension popup UI
│   ├── background.ts   # Service worker
│   └── content.ts      # Content script for form detection
├── components/ui/      # shadcn/ui components
├── hooks/              # React hooks
├── lib/                # Utilities and core logic
└── types/              # TypeScript types
```

## Configuration

Copy `.env.example` to `.env` and fill in your Lemon Squeezy credentials:

```bash
cp .env.example .env
```

## License

MIT
