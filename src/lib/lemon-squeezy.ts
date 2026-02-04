import type { PricingPlan, LicenseInfo } from '@/types/profile';

const LEMON_SQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'lifetime',
    features: [
      '5 form fills per day',
      'Basic field detection',
      '1 profile',
      'Community support',
    ],
    variantId: 0,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9,
    interval: 'month',
    features: [
      'Unlimited form fills',
      'Advanced field detection',
      'Unlimited profiles',
      'Resume & cover letter upload',
      'Priority support',
      'All future updates',
    ],
    variantId: parseInt(import.meta.env.VITE_LEMON_PRO_VARIANT_ID || '0'),
    popular: true,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 79,
    interval: 'lifetime',
    features: [
      'Everything in Pro',
      'One-time payment',
      'Lifetime access',
      'Early access to new features',
    ],
    variantId: parseInt(import.meta.env.VITE_LEMON_LIFETIME_VARIANT_ID || '0'),
  },
];

export async function createCheckoutUrl(variantId: number, email?: string): Promise<string> {
  const storeId = import.meta.env.VITE_LEMON_STORE_ID;
  if (!storeId || !variantId) {
    throw new Error('Lemon Squeezy configuration missing');
  }

  const checkoutUrl = new URL(`https://quickapply.lemonsqueezy.com/checkout/buy/${variantId}`);
  if (email) {
    checkoutUrl.searchParams.set('checkout[email]', email);
  }
  checkoutUrl.searchParams.set('embed', '1');
  
  return checkoutUrl.toString();
}

export async function validateLicenseKey(licenseKey: string): Promise<LicenseInfo | null> {
  try {
    const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        license_key: licenseKey,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (!data.valid) {
      return null;
    }

    const variantId = data.meta?.variant_id;
    let plan: 'free' | 'pro' | 'lifetime' = 'free';
    
    const proPlan = PRICING_PLANS.find((p) => p.id === 'pro');
    const lifetimePlan = PRICING_PLANS.find((p) => p.id === 'lifetime');
    
    if (variantId === lifetimePlan?.variantId) {
      plan = 'lifetime';
    } else if (variantId === proPlan?.variantId) {
      plan = 'pro';
    }

    return {
      key: licenseKey,
      status: 'active',
      plan,
      activatedAt: Date.now(),
      expiresAt: data.license_key?.expires_at
        ? new Date(data.license_key.expires_at).getTime()
        : undefined,
    };
  } catch {
    return null;
  }
}

export async function activateLicense(licenseKey: string, instanceName: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        license_key: licenseKey,
        instance_name: instanceName,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.activated === true;
  } catch {
    return false;
  }
}

export async function deactivateLicense(licenseKey: string, instanceId: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/deactivate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        license_key: licenseKey,
        instance_id: instanceId,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export function getPlanFeatures(plan: 'free' | 'pro' | 'lifetime'): string[] {
  const planData = PRICING_PLANS.find((p) => p.id === plan);
  return planData?.features || [];
}

export function isPremiumFeature(
  feature: 'unlimited_fills' | 'unlimited_profiles' | 'file_upload',
  currentPlan: 'free' | 'pro' | 'lifetime'
): boolean {
  return currentPlan === 'free';
}

export function getDailyFillLimit(plan: 'free' | 'pro' | 'lifetime'): number {
  return plan === 'free' ? 5 : Infinity;
}
