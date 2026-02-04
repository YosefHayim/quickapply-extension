import { useState, useEffect, useCallback } from 'react';
import { getLicense, saveLicense, clearLicense } from '@/lib/storage';
import { validateLicenseKey, activateLicense, getDailyFillLimit } from '@/lib/lemon-squeezy';
import type { LicenseInfo } from '@/types/profile';

export function useLicense() {
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    getLicense().then((storedLicense) => {
      setLicense(storedLicense);
      setLoading(false);
    });
  }, []);

  const activate = useCallback(async (licenseKey: string): Promise<boolean> => {
    setValidating(true);
    try {
      const validatedLicense = await validateLicenseKey(licenseKey);
      
      if (!validatedLicense) {
        return false;
      }

      const instanceName = `quickapply-${Date.now()}`;
      const activated = await activateLicense(licenseKey, instanceName);
      
      if (activated) {
        await saveLicense(validatedLicense);
        setLicense(validatedLicense);
        return true;
      }
      
      return false;
    } finally {
      setValidating(false);
    }
  }, []);

  const deactivate = useCallback(async () => {
    await clearLicense();
    setLicense(null);
  }, []);

  const plan = license?.plan || 'free';
  const isActive = license?.status === 'active';
  const isPremium = plan === 'pro' || plan === 'lifetime';
  const dailyLimit = getDailyFillLimit(plan);

  return {
    license,
    loading,
    validating,
    plan,
    isActive,
    isPremium,
    dailyLimit,
    activate,
    deactivate,
  };
}
