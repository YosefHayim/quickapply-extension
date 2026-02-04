import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useLicense } from '@/hooks/useLicense';
import { PRICING_PLANS, createCheckoutUrl } from '@/lib/lemon-squeezy';

export default function PricingView() {
  const { license, plan, isPremium, validating, activate, deactivate } = useLicense();
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');

  const handleActivate = async () => {
    setError('');
    const success = await activate(licenseKey);
    if (!success) {
      setError('Invalid license key');
    } else {
      setLicenseKey('');
    }
  };

  const handlePurchase = async (variantId: number) => {
    if (!variantId) return;
    const url = await createCheckoutUrl(variantId);
    chrome.tabs.create({ url });
  };

  if (isPremium && license) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              {plan === 'lifetime' ? 'Lifetime' : 'Pro'} Plan Active
            </CardTitle>
            <CardDescription className="text-xs">
              Thank you for your support!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs text-muted-foreground">
              License: {license.key.substring(0, 8)}...
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={deactivate}>
              Deactivate License
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto">
      <div className="grid gap-3">
        {PRICING_PLANS.map((pricing) => (
          <Card
            key={pricing.id}
            className={pricing.popular ? 'border-primary' : ''}
          >
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{pricing.name}</CardTitle>
                {pricing.popular && <Badge className="text-xs">Popular</Badge>}
              </div>
              <CardDescription className="text-xs">
                {pricing.price === 0 ? (
                  'Free forever'
                ) : (
                  <>
                    ${pricing.price}
                    {pricing.interval !== 'lifetime' && `/${pricing.interval}`}
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-2">
              <ul className="text-xs space-y-1">
                {pricing.features.slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              {pricing.id !== 'free' && (
                <Button
                  className="w-full mt-3"
                  size="sm"
                  variant={pricing.popular ? 'default' : 'outline'}
                  onClick={() => handlePurchase(pricing.variantId)}
                  disabled={!pricing.variantId}
                >
                  {pricing.id === 'lifetime' ? 'Buy Now' : 'Subscribe'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Have a license key?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label className="text-xs">License Key</Label>
            <Input
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
              className="h-8 text-sm mt-1"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button
            className="w-full"
            size="sm"
            onClick={handleActivate}
            disabled={!licenseKey || validating}
          >
            {validating ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Validating...
              </>
            ) : (
              'Activate License'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
