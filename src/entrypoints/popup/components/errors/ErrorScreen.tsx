import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorScreenProps {
  icon: LucideIcon;
  iconClassName: string;
  iconBgClassName: string;
  title: string;
  subtitle: string;
  buttonText: string;
  onRetry: () => void;
  buttonVariant?: 'primary' | 'outline';
  countdownText?: string;
  countdownClassName?: string;
  className?: string;
}

export default function ErrorScreen({
  icon: Icon,
  iconClassName,
  iconBgClassName,
  title,
  subtitle,
  buttonText,
  onRetry,
  buttonVariant = 'primary',
  countdownText,
  countdownClassName,
  className,
}: ErrorScreenProps) {
  return (
    <div
      className={cn(
        'w-[400px] min-h-[500px] flex flex-col items-center justify-center bg-background text-foreground p-8',
        className
      )}
    >
      <div className="flex flex-col items-center gap-6 max-w-[320px] text-center">
        <div
          className={cn(
            'flex items-center justify-center w-20 h-20 rounded-full transition-colors',
            iconBgClassName
          )}
        >
          <Icon className={cn('w-10 h-10', iconClassName)} strokeWidth={1.75} />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
        </div>

        {countdownText && (
          <p
            className={cn('text-sm font-medium', countdownClassName || 'text-blue-500')}
          >
            {countdownText}
          </p>
        )}

        <Button
          className="w-full h-11 font-medium"
          variant={buttonVariant === 'outline' ? 'outline' : 'default'}
          onClick={onRetry}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
