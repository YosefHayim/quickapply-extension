import { describe, it, expect, beforeEach } from 'vitest';

describe('Vitest Setup', () => {
  it('should have chrome API available globally', () => {
    expect((globalThis as any).chrome).toBeDefined();
    expect((globalThis as any).chrome.storage).toBeDefined();
    expect((globalThis as any).chrome.runtime).toBeDefined();
  });

  describe('Chrome Storage API', () => {
    beforeEach(async () => {
      await chrome.storage.local.clear();
    });

    it('should store and retrieve data from local storage', async () => {
      await chrome.storage.local.set({ testKey: 'testValue' });
      const result = await chrome.storage.local.get('testKey');
      expect(result.testKey).toBe('testValue');
    });

    it('should handle multiple keys in get', async () => {
      await chrome.storage.local.set({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      });
      const result = await chrome.storage.local.get(['key1', 'key2']);
      expect(result.key1).toBe('value1');
      expect(result.key2).toBe('value2');
      expect(result.key3).toBeUndefined();
    });

    it('should return all data when get is called without keys', async () => {
      await chrome.storage.local.set({
        key1: 'value1',
        key2: 'value2',
      });
      const result = await chrome.storage.local.get();
      expect(result.key1).toBe('value1');
      expect(result.key2).toBe('value2');
    });

    it('should clear storage', async () => {
      await chrome.storage.local.set({ key1: 'value1' });
      await chrome.storage.local.clear();
      const result = await chrome.storage.local.get();
      expect(Object.keys(result).length).toBe(0);
    });

    it('should remove specific keys', async () => {
      await chrome.storage.local.set({
        key1: 'value1',
        key2: 'value2',
      });
      await chrome.storage.local.remove('key1');
      const result = await chrome.storage.local.get();
      expect(result.key1).toBeUndefined();
      expect(result.key2).toBe('value2');
    });
  });

  describe('Chrome Runtime API', () => {
    it('should get extension URL', () => {
      const url = chrome.runtime.getURL('popup.html');
      expect(url).toContain('popup.html');
    });
  });

  describe('Storage Areas', () => {
    it('should have separate storage areas', async () => {
      await chrome.storage.local.set({ localKey: 'localValue' });
      await chrome.storage.sync.set({ syncKey: 'syncValue' });
      await chrome.storage.session.set({ sessionKey: 'sessionValue' });

      const localResult = await chrome.storage.local.get('localKey');
      const syncResult = await chrome.storage.sync.get('syncKey');
      const sessionResult = await chrome.storage.session.get('sessionKey');

      expect(localResult.localKey).toBe('localValue');
      expect(syncResult.syncKey).toBe('syncValue');
      expect(sessionResult.sessionKey).toBe('sessionValue');

      const localCheck = await chrome.storage.local.get('syncKey');
      expect(localCheck.syncKey).toBeUndefined();
    });
  });
});
