import { Button } from '@/components/ui/button';
import type { UserStatus } from 'shared/types';

interface StatusBannerProps {
  status: UserStatus;
  onUpgrade: () => void;
}

export default function StatusBanner({ status, onUpgrade }: StatusBannerProps) {
  const { trial, subscription, usage } = status;

  if (subscription.isActive) {
    return null;
  }

  if (trial.isActive && trial.daysRemaining !== null) {
    return (
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          {trial.daysRemaining} {trial.daysRemaining === 1 ? 'day' : 'days'} left in trial
        </div>
      </div>
    );
  }

  if (usage.fillsRemaining === 0) {
    return (
      <div className="bg-red-500/10 border-b border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm font-medium">Daily limit reached</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10"
            onClick={onUpgrade}
          >
            Upgrade to Pro
          </Button>
        </div>
      </div>
    );
  }

  if (usage.fillsRemaining !== null) {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-600 dark:text-amber-400 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
          {usage.fillsRemaining} {usage.fillsRemaining === 1 ? 'fill' : 'fills'} remaining today
        </div>
      </div>
    );
  }

  return null;
}
