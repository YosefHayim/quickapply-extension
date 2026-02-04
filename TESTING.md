# Testing Setup

Vitest is configured with Chrome API mocks for testing the WXT extension.

## Running Tests

```bash
# Watch mode
pnpm test

# Run once
pnpm test:run

# With coverage
pnpm test:coverage
```

## Files Created

- **vitest.config.ts** - Vitest configuration with WXT plugin and React support
- **vitest.setup.ts** - Global test setup with Chrome API mocks
- **src/__mocks__/chrome.ts** - Reusable Chrome mock factory
- **src/test-utils/index.ts** - React Testing Library utilities
- **src/__tests__/setup.test.ts** - Verification tests for the setup

## Chrome API Mocks

The setup provides mocked implementations of:

- `chrome.storage.local` - Local storage with get/set/remove/clear
- `chrome.storage.sync` - Sync storage (same interface as local)
- `chrome.storage.session` - Session storage (same interface as local)
- `chrome.runtime.getURL()` - Returns mock extension URL
- `chrome.identity.*` - Identity API stubs
- `chrome.tabs.*` - Tabs API stubs

## Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test-utils';

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should use chrome storage', async () => {
    await chrome.storage.local.set({ key: 'value' });
    const result = await chrome.storage.local.get('key');
    expect(result.key).toBe('value');
  });
});
```

## Path Aliases

Use `@/*` to import from `src/`:

```typescript
import { render } from '@/test-utils';
import { MyComponent } from '@/components/MyComponent';
```
