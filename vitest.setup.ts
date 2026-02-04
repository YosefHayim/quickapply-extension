import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing';

beforeEach(() => {
  vi.clearAllMocks();
});
