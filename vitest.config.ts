import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [WxtVitest(), react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    mockReset: true,
    restoreMocks: true,
  },
});
