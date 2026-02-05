import { useId, useMemo } from 'react';
import { Keyboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useModalFocusTrap } from '@/hooks/useModalFocusTrap';

interface KeyboardShortcutsProps {
  onClose: () => void;
}

const SHORTCUTS = [
  {
    keys: ['Ctrl', 'Shift', 'F'],
    description: 'Fill current form',
  },
  {
    keys: ['Ctrl', 'Shift', 'D'],
    description: 'Open QuickApply',
  },
  {
    keys: ['Escape'],
    description: 'Close popup',
  },
];

export default function KeyboardShortcuts({ onClose }: KeyboardShortcutsProps) {
  const titleId = useId();
  const dialogRef = useModalFocusTrap(onClose);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  const shortcuts = useMemo(
    () =>
      SHORTCUTS.map((shortcut) => ({
        ...shortcut,
        keys: shortcut.keys.map((key) => (key === 'Ctrl' && isMac ? 'Cmd' : key)),
      })),
    [isMac]
  );

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
        className="w-[340px] border-cyan-500/30 shadow-2xl shadow-cyan-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="relative pb-3">
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
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/15">
              <Keyboard className="h-7 w-7 text-cyan-500" />
            </div>
            <CardTitle id={titleId} className="text-center text-lg">
              Keyboard Shortcuts
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pb-6">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.description}
              className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3"
            >
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, index) => (
                  <span key={index}>
                    <kbd className="inline-flex min-w-[28px] items-center justify-center rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-foreground shadow-sm">
                      {key}
                    </kbd>
                    {index < shortcut.keys.length - 1 && (
                      <span className="mx-0.5 text-xs text-muted-foreground">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <p className="pt-2 text-center text-xs text-muted-foreground">
            Works on any supported job site
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
