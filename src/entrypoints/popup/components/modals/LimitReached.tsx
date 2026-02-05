import { useId } from 'react';
import { AlertTriangle, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useModalFocusTrap } from '@/hooks/useModalFocusTrap';

interface LimitReachedProps {
  dailyLimit: number;
  usedCount: number;
  onUpgrade: () => void;
  onClose: () => void;
}

export default function LimitReached({ dailyLimit, usedCount, onUpgrade, onClose }: LimitReachedProps) {
  const titleId = useId();
  const dialogRef = useModalFocusTrap(onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-[340px] border-amber-500/30 shadow-2xl shadow-amber-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="relative pb-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15">
              <AlertTriangle className="h-7 w-7 text-amber-500" />
            </div>
            <CardTitle id={titleId} className="text-center text-lg">
              Daily Limit Reached
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pb-6">
          <p className="text-center text-sm text-muted-foreground">
            You've used{' '}
            <span className="font-semibold text-foreground">{usedCount}</span> of{' '}
            <span className="font-semibold text-foreground">{dailyLimit}</span> free
            applications today.
          </p>

          <div className="space-y-3">
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500"
              onClick={onUpgrade}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Resets at midnight UTC
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
