import { detectFormFields, isJobApplicationPage, detectPlatform } from '@/lib/form-detection';
import { fillForm, highlightFields, clearHighlights } from '@/lib/form-filler';
import type { UserProfile, DetectedField } from '@/types/profile';

export default defineContentScript({
  matches: [
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
  runAt: 'document_idle',

  main() {
    let detectedFields: DetectedField[] = [];

    async function handleFillForm() {
      try {
        const profile = await chrome.runtime.sendMessage({ action: 'get-profile' }) as UserProfile;

        if (!profile) {
          console.error('No profile found');
          return;
        }

        detectedFields = detectFormFields();
        
        if (detectedFields.length === 0) {
          console.log('No form fields detected');
          return;
        }

        const result = await fillForm(detectedFields, profile);

        chrome.runtime.sendMessage({
          action: 'fill-result',
          result,
          platform: detectPlatform(),
        });

        console.log(`Filled ${result.filled} fields, skipped ${result.skipped}`);
      } catch (error) {
        console.error('Error filling form:', error);
      }
    }

    function handleDetectFields() {
      detectedFields = detectFormFields();
      highlightFields(detectedFields);

      setTimeout(() => {
        clearHighlights(detectedFields);
      }, 3000);

      return {
        count: detectedFields.length,
        fields: detectedFields.map((f) => ({
          fieldType: f.fieldType,
          type: f.type,
          confidence: f.confidence,
        })),
      };
    }

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.action === 'fill-form') {
        handleFillForm().then(() => {
          sendResponse({ success: true });
        });
        return true;
      }

      if (message.action === 'detect-fields') {
        const result = handleDetectFields();
        sendResponse(result);
        return true;
      }

      if (message.action === 'check-page') {
        sendResponse({
          isJobPage: isJobApplicationPage(),
          platform: detectPlatform(),
        });
        return true;
      }
    });

    if (isJobApplicationPage()) {
      console.log(`QuickApply ready on ${detectPlatform()}`);
    }
  },
});
