import { Keyboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        className="w-[340px] border-cyan-500/30 bg-[#171717] shadow-2xl shadow-cyan-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/15">
              <Keyboard className="h-7 w-7 text-cyan-500" />
            </div>
            <CardTitle className="text-center text-lg text-[#FAFAFA]">
              Keyboard Shortcuts
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pb-6">
          {SHORTCUTS.map((shortcut) => (
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
                    <kbd className="inline-flex min-w-[28px] items-center justify-center rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-[#FAFAFA] shadow-sm">
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
