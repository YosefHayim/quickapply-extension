import { Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DeleteConfirmProps {
  profileName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirm({ profileName, onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <Card
        className="w-[340px] border-red-500/30 bg-[#171717] shadow-2xl shadow-red-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="relative pb-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15">
              <Trash2 className="h-7 w-7 text-red-500" />
            </div>
            <CardTitle className="text-center text-lg text-[#FAFAFA]">
              Delete Profile?
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pb-6">
          <p className="text-center text-sm text-muted-foreground">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-[#FAFAFA]">'{profileName}'</span>?
            This cannot be undone.
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
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={onConfirm}
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
