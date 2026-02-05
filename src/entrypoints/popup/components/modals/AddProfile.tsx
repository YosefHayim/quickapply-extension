import { useId, useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useModalFocusTrap } from '@/hooks/useModalFocusTrap';

interface AddProfileProps {
  onSave: (name: string) => void;
  onCancel: () => void;
}

export default function AddProfile({ onSave, onCancel }: AddProfileProps) {
  const [name, setName] = useState('');
  const titleId = useId();
  const dialogRef = useModalFocusTrap(onCancel);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  const isValid = name.trim().length > 0;

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
        className="w-[340px] border-emerald-500/30 shadow-2xl shadow-emerald-500/10"
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
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
              <UserPlus className="h-7 w-7 text-emerald-500" />
            </div>
            <CardTitle id={titleId} className="text-center text-lg">
              Create New Profile
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Profile Name</Label>
              <Input
                id="profile-name"
                type="text"
                placeholder="e.g., Tech Jobs, Marketing"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="focus-visible:ring-emerald-500/50"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValid}
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Create Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
