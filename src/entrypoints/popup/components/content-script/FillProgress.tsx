import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FillProgressProps {
  filled: number;
  total: number;
  onCancel?: () => void;
  className?: string;
}

export default function FillProgress({ filled, total, onCancel, className }: FillProgressProps) {
  const percentage = total > 0 ? Math.min(100, Math.round((filled / total) * 100)) : 0;

  return (
    <Card
      className={cn(
        'fixed bottom-6 right-6 z-[9999]',
        'w-72',
        'bg-[#171717] border-white/10',
        'shadow-2xl shadow-black/40',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
              <div className="absolute inset-0 h-5 w-5 rounded-full bg-emerald-500/20 animate-ping" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#FAFAFA]">
                Filling {filled} of {total} fields...
              </p>
              <p className="text-xs text-[#FAFAFA]/60 mt-0.5">
                {percentage}% complete
              </p>
            </div>
          </div>
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-6 w-6 text-[#FAFAFA]/60 hover:text-[#FAFAFA] hover:bg-white/10 shrink-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel</span>
            </Button>
          )}
        </div>

        <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
