import { Crown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PRO_FEATURES = [
  'Unlimited daily fills',
  'Priority support',
  'Advanced field detection',
] as const;

export interface UpgradeCompleteProps {
  onStart?: () => void;
  className?: string;
}

export function UpgradeComplete({ onStart, className }: UpgradeCompleteProps) {
  return (
    <div
      className={cn(
        'w-[400px] min-h-[500px] bg-background flex flex-col items-center justify-center px-8',
        className
      )}
    >
      <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center mb-6">
        <Crown className="w-10 h-10 text-violet-500" strokeWidth={2} />
      </div>

      <h1 className="text-xl font-bold text-foreground mb-2">Welcome to Pro!</h1>

      <p className="text-sm text-neutral-500 text-center mb-6">
        You now have unlimited form fills and premium features
      </p>

      <ul className="w-full space-y-3 mb-8">
        {PRO_FEATURES.map((feature) => (
          <li key={feature} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
            <span className="text-sm text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onStart}
        className="w-full h-11 bg-violet-500 hover:bg-violet-600 text-white font-medium"
      >
        Start Filling Forms
      </Button>
    </div>
  );
}

export default UpgradeComplete;
