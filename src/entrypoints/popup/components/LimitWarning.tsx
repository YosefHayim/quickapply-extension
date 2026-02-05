import { AlertTriangle, X, Zap } from 'lucide-react';

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
