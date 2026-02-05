import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PartialFillProps {
  filledCount: number;
  skippedCount: number;
  skippedFields?: string[];
  onDismiss?: () => void;
  className?: string;
}

export default function PartialFill({
  filledCount,
  skippedCount,
  skippedFields,
  onDismiss,
  className,
}: PartialFillProps) {
  return (
    <Card
      className={cn(
        'fixed bottom-6 right-6 z-[9999]',
        'w-80',
        'bg-[#171717] border-[#F59E0B]/30',
        'shadow-2xl shadow-black/40',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <div className="h-8 w-8 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-[#F59E0B]" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#FAFAFA]">
              Some fields need manual entry
            </p>

            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {filledCount} filled
              </Badge>
              <Badge
                variant="outline"
                className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30 text-xs"
              >
                {skippedCount} skipped
              </Badge>
            </div>

            {skippedFields && skippedFields.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-[#FAFAFA]/50 mb-1.5">Skipped fields:</p>
                <ul className="space-y-1">
                  {skippedFields.slice(0, 5).map((field, index) => (
                    <li
                      key={`${field}-${index}`}
                      className="text-xs text-[#FAFAFA]/70 flex items-center gap-1.5"
                    >
                      <span className="h-1 w-1 rounded-full bg-[#F59E0B]/50 shrink-0" />
                      <span className="truncate">{field}</span>
                    </li>
                  ))}
                  {skippedFields.length > 5 && (
                    <li className="text-xs text-[#FAFAFA]/50">
                      +{skippedFields.length - 5} more
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-6 w-6 text-[#FAFAFA]/60 hover:text-[#FAFAFA] hover:bg-white/10 shrink-0 -mt-0.5 -mr-1"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
