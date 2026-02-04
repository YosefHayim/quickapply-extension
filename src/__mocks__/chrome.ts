import { vi } from 'vitest';

export const createChromeMock = () => {
  const storageData: Record<string, Record<string, any>> = {
    local: {},
    sync: {},
    session: {},
  };

  const listeners: Record<string, Function[]> = {
    'storage.onChanged': [],
    'runtime.onMessage': [],
  };

  const createStorageArea = (area: 'local' | 'sync' | 'session') => ({
    get: vi.fn(async (keys?: string | string[] | null) => {
      const data = storageData[area];
      if (!keys) return { ...data };
      if (typeof keys === 'string') return { [keys]: data[keys] };
      if (Array.isArray(keys)) {
        return keys.reduce((acc, key) => {
          acc[key] = data[key];
          return acc;
        }, {} as Record<string, any>);
      }
      return {};
    }),
    set: vi.fn(async (items: Record<string, any>) => {
      Object.assign(storageData[area], items);
      listeners['storage.onChanged'].forEach((listener) => {
        listener(items, area);
      });
    }),
    remove: vi.fn(async (keys: string | string[]) => {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      keysArray.forEach((key) => {
        delete storageData[area][key];
      });
    }),
    clear: vi.fn(async () => {
      storageData[area] = {};
    }),
  });

  return {
    storage: {
      local: createStorageArea('local'),
      sync: createStorageArea('sync'),
      session: createStorageArea('session'),
      onChanged: {
        addListener: vi.fn((callback: Function) => {
          listeners['storage.onChanged'].push(callback);
        }),
        removeListener: vi.fn((callback: Function) => {
          const index = listeners['storage.onChanged'].indexOf(callback);
          if (index > -1) {
            listeners['storage.onChanged'].splice(index, 1);
          }
        }),
      },
    },
    runtime: {
      sendMessage: vi.fn(async (message: any) => {
        return { success: true, message };
      }),
      onMessage: {
        addListener: vi.fn((callback: Function) => {
          listeners['runtime.onMessage'].push(callback);
        }),
        removeListener: vi.fn((callback: Function) => {
          const index = listeners['runtime.onMessage'].indexOf(callback);
          if (index > -1) {
            listeners['runtime.onMessage'].splice(index, 1);
          }
        }),
      },
      getURL: vi.fn((path: string) => `chrome-extension://mock-id/${path}`),
    },
    identity: {
      launchWebAuthFlow: vi.fn(async (details: any) => {
        return 'https://example.com/callback?code=mock-code';
      }),
      getRedirectURL: vi.fn(() => 'https://example.com/callback'),
    },
    tabs: {
      query: vi.fn(async (queryInfo: any) => {
        return [
          {
            id: 1,
            windowId: 1,
            index: 0,
            url: 'https://example.com',
            title: 'Example',
            active: true,
            pinned: false,
            highlighted: false,
            incognito: false,
            selected: true,
          },
        ];
      }),
      get: vi.fn(async (tabId: number) => {
        return {
          id: tabId,
          windowId: 1,
          index: 0,
          url: 'https://example.com',
          title: 'Example',
          active: true,
          pinned: false,
          highlighted: false,
          incognito: false,
          selected: true,
        };
      }),
      sendMessage: vi.fn(async (tabId: number, message: any) => {
        return { success: true, message };
      }),
    },
  };
};

export const chromeMock = createChromeMock();
