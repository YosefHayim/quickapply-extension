import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormNotFoundProps {
  onDismiss?: () => void;
  className?: string;
}

export default function FormNotFound({ onDismiss, className }: FormNotFoundProps) {
  return (
    <Card
      className={cn(
        'fixed bottom-6 right-6 z-[9999]',
        'w-80',
        'bg-[#171717] border-[#EF4444]/30',
        'shadow-2xl shadow-black/40',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <div className="h-8 w-8 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#FAFAFA]">
              No application form found
            </p>
            <p className="text-xs text-[#FAFAFA]/60 mt-1 leading-relaxed">
              Try refreshing the page or navigate to an application form
            </p>
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
