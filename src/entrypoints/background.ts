export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      console.log('QuickApply installed');
    }
  });

  chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'fill-form') {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'fill-form' });
      }
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'get-profile') {
      import('@/lib/storage').then(({ getActiveProfile }) => {
        getActiveProfile().then(sendResponse);
      });
      return true;
    }

    if (message.action === 'fill-result') {
      console.log('Fill result:', message.result);
    }
  });
});
