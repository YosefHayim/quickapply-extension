import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons'],
  manifest: {
    name: 'QuickApply - Job Application AutoFill',
    description: 'One-click auto-fill for job applications with resume upload. Save hours on repetitive form filling.',
    version: '1.0.0',
    permissions: ['storage', 'activeTab', 'scripting', 'identity'],
    oauth2: {
      client_id: '${VITE_GOOGLE_CLIENT_ID}',
      scopes: ['openid', 'email', 'profile'],
    },
    host_permissions: [
      'https://www.linkedin.com/*',
      'https://jobs.lever.co/*',
      'https://boards.greenhouse.io/*',
      'https://*.workday.com/*',
      'https://*.indeed.com/*',
      'https://*.smartrecruiters.com/*',
      'https://*.icims.com/*',
      'https://*.myworkdayjobs.com/*',
      'https://*.taleo.net/*',
      'https://*.breezy.hr/*',
    ],
    commands: {
      'fill-form': {
        suggested_key: {
          default: 'Ctrl+Shift+F',
          mac: 'Command+Shift+F',
        },
        description: 'Fill the current form',
      },
    },
  },
  webExt: {
    startUrls: ['https://jobs.lever.co/'],
  },
});
