import { useId } from 'react';
import { LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useModalFocusTrap } from '@/hooks/useModalFocusTrap';

interface LogoutConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutConfirm({ onConfirm, onCancel }: LogoutConfirmProps) {
  const titleId = useId();
  const dialogRef = useModalFocusTrap(onCancel);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <Card
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-[340px] border-orange-500/30 shadow-2xl shadow-orange-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="relative pb-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onCancel}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/15">
              <LogOut className="h-7 w-7 text-orange-500" />
            </div>
            <CardTitle id={titleId} className="text-center text-lg">
              Sign Out?
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pb-6">
          <p className="text-center text-sm text-muted-foreground">
            Your profile data will remain saved locally.
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={onConfirm}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
