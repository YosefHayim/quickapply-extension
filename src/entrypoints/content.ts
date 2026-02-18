import { detectFormFields, isJobApplicationPage, detectPlatform } from '@/lib/form-detection';
import { fillForm, highlightFields, clearHighlights } from '@/lib/form-filler';
import { checkDuplicate, logSubmission, normalizeUrl } from '@/lib/submissions';
import { getSettings } from '@/lib/storage';
import type { UserProfile, DetectedField } from '@/types/profile';
import type { UserStatus } from 'shared/types';

const UPGRADE_URL = 'https://quickapply.lemonsqueezy.com/checkout';
const STATUS_CACHE_KEY = 'userStatus';

async function getCachedUserStatus(): Promise<UserStatus | null> {
  const result = await chrome.storage.local.get(STATUS_CACHE_KEY);
  return result[STATUS_CACHE_KEY] as UserStatus | null;
}

async function updateCachedUsage(fillsToday: number, fillsRemaining: number | null): Promise<void> {
  const result = await chrome.storage.local.get(STATUS_CACHE_KEY);
  const cached = result[STATUS_CACHE_KEY] as UserStatus | undefined;
  if (!cached) return;

  await chrome.storage.local.set({
    [STATUS_CACHE_KEY]: {
      ...cached,
      usage: {
        ...cached.usage,
        fillsToday,
        fillsRemaining,
      },
    },
  });
}

function hasUnlimitedAccess(status: UserStatus): boolean {
  return status.trial.isActive || status.subscription.isActive;
}

type ToastType = 'warning' | 'success' | 'error' | 'info';

function showToast(message: string, type: ToastType = 'info', subtext?: string, duration = 4000) {
  const existing = document.getElementById('quickapply-toast');
  if (existing) existing.remove();

  const bgColors: Record<ToastType, string> = {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  };

  const toast = document.createElement('div');
  toast.id = 'quickapply-toast';
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: bgColors[type],
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    zIndex: '2147483647',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '320px',
  });
  
  const mainText = document.createElement('div');
  mainText.textContent = message;
  toast.appendChild(mainText);
  
  if (subtext) {
    const sub = document.createElement('div');
    sub.textContent = subtext;
    Object.assign(sub.style, { fontSize: '12px', opacity: '0.9', marginTop: '4px' });
    toast.appendChild(sub);
  }
  
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

function showLimitModal(): Promise<void> {
  return new Promise((resolve) => {
    const existingModal = document.getElementById('quickapply-limit-modal');
    if (existingModal) existingModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'quickapply-limit-modal';
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '2147483647',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    });

    const modal = document.createElement('div');
    Object.assign(modal.style, {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '400px',
      margin: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    });

    modal.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <div style="width: 40px; height: 40px; background: #fef2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div>
          <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #111;">Daily Limit Reached</h3>
          <p style="margin: 4px 0 0; font-size: 14px; color: #666;">You've used all 10 free fills for today</p>
        </div>
      </div>
      
      <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          <span style="font-weight: 600; font-size: 14px; color: #111;">Upgrade to Pro</span>
        </div>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #666; line-height: 1.6;">
          <li>Unlimited form fills</li>
          <li>Advanced field detection</li>
          <li>Priority support</li>
        </ul>
      </div>
      
      <div style="display: flex; gap: 8px;">
        <button id="quickapply-dismiss" style="flex: 1; padding: 10px 16px; border: 1px solid #e5e7eb; background: white; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; color: #374151;">Maybe Later</button>
        <button id="quickapply-upgrade" style="flex: 1; padding: 10px 16px; border: none; background: #7c3aed; color: white; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">Upgrade Now</button>
      </div>
      
      <p style="text-align: center; font-size: 12px; color: #9ca3af; margin: 12px 0 0;">Resets at midnight UTC</p>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const dismissBtn = document.getElementById('quickapply-dismiss');
    const upgradeBtn = document.getElementById('quickapply-upgrade');

    dismissBtn?.addEventListener('click', () => {
      overlay.remove();
      resolve();
    });

    upgradeBtn?.addEventListener('click', () => {
      window.open(UPGRADE_URL, '_blank');
      overlay.remove();
      resolve();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        resolve();
      }
    });
  });
}

function formatDateForToast(isoString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoString));
}

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
        const currentUrl = window.location.href;
        const platform = detectPlatform();

        const status = await getCachedUserStatus();
        
        if (status && !hasUnlimitedAccess(status)) {
          const { fillsRemaining } = status.usage;
          
          if (fillsRemaining === 0) {
            await showLimitModal();
            return;
          }
          
          if (fillsRemaining !== null && fillsRemaining <= 3) {
            showToast(
              `${fillsRemaining} ${fillsRemaining === 1 ? 'fill' : 'fills'} remaining today`,
              'warning',
              'Upgrade to Pro for unlimited fills'
            );
          }
        }

        const normalizedUrl = normalizeUrl(currentUrl);
        const duplicateCheck = await checkDuplicate(normalizedUrl);
        if (duplicateCheck.isDuplicate && duplicateCheck.submittedAt) {
          const formattedDate = formatDateForToast(duplicateCheck.submittedAt);
          showToast(`Already applied to this job on ${formattedDate}`, 'warning');
          return;
        }

        const profile = await chrome.runtime.sendMessage({ action: 'get-profile' }) as UserProfile;

        if (!profile) {
          console.error('No profile found');
          return;
        }

        detectedFields = detectFormFields();
        
        if (detectedFields.length === 0) {
          showToast('No form fields detected on this page', 'warning');
          console.log('No form fields detected');
          return;
        }

        const settings = await getSettings();
        const fillDelayMs = settings.fillDelay ?? 0;
        const showNotifications = settings.showNotifications !== false;

        const result = await fillForm(detectedFields, profile, fillDelayMs);

        chrome.runtime.sendMessage({
          action: 'fill-result',
          result,
          platform,
        });

        if (result.filled > 0) {
          await logSubmission(normalizedUrl, platform);
          
          if (status && !hasUnlimitedAccess(status)) {
            const newFillsToday = status.usage.fillsToday + 1;
            const newFillsRemaining = status.usage.fillsRemaining !== null 
              ? Math.max(0, status.usage.fillsRemaining - 1) 
              : null;
            
            await updateCachedUsage(newFillsToday, newFillsRemaining);
            
            if (showNotifications) {
              showToast(
                `Form filled! ${result.filled} fields completed`,
                'success',
                newFillsRemaining !== null ? `${newFillsRemaining} fills remaining today` : undefined
              );
            }
          } else if (showNotifications) {
            showToast(`Form filled! ${result.filled} fields completed`, 'success');
          }
        }

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
