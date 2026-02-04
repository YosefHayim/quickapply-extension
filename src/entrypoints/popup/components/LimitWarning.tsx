import { AlertTriangle, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createCheckoutUrl, PRICING_PLANS } from '@/lib/lemon-squeezy';

interface LimitWarningToastProps {
  fillsRemaining: number;
  onDismiss: () => void;
}

export function LimitWarningToast({ fillsRemaining, onDismiss }: LimitWarningToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-amber-500/95 text-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 max-w-sm">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-sm">
            {fillsRemaining} {fillsRemaining === 1 ? 'fill' : 'fills'} remaining today
          </p>
          <p className="text-xs opacity-90">Upgrade to Pro for unlimited fills</p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface LimitReachedModalProps {
  onUpgrade: () => void;
  onDismiss: () => void;
}

export function LimitReachedModal({ onUpgrade, onDismiss }: LimitReachedModalProps) {
  const proPlan = PRICING_PLANS.find((p) => p.id === 'pro');

  const handleUpgrade = async () => {
    if (proPlan?.variantId) {
      const url = await createCheckoutUrl(proPlan.variantId);
      chrome.tabs.create({ url });
    }
    onUpgrade();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border rounded-xl shadow-2xl p-6 max-w-sm mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Daily Limit Reached</h3>
            <p className="text-sm text-muted-foreground">
              You've used all 10 free fills for today
            </p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Upgrade to Pro</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Unlimited form fills</li>
            <li>• Advanced field detection</li>
            <li>• Priority support</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onDismiss} className="flex-1">
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade} className="flex-1">
            Upgrade Now
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-3">
          Resets at midnight UTC
        </p>
      </div>
    </div>
  );
}

interface FillSuccessMessageProps {
  fillsRemaining: number | null;
  filledCount: number;
  onDismiss: () => void;
}

export function FillSuccessMessage({
  fillsRemaining,
  filledCount,
  onDismiss,
}: FillSuccessMessageProps) {
  const isUnlimited = fillsRemaining === null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-emerald-500/95 text-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 max-w-sm">
        <Zap className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-sm">Form filled! {filledCount} fields completed</p>
          {!isUnlimited && (
            <p className="text-xs opacity-90">
              {fillsRemaining} {fillsRemaining === 1 ? 'fill' : 'fills'} remaining today
            </p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
