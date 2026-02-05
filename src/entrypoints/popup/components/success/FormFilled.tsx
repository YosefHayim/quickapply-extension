import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FormFilledProps {
  fieldsFilled?: number;
  onDone?: () => void;
  className?: string;
}

export function FormFilled({ fieldsFilled = 15, onDone, className }: FormFilledProps) {
  return (
    <div
      className={cn(
        'w-[400px] min-h-[500px] bg-background flex flex-col items-center justify-center px-8',
        className
      )}
    >
      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mb-6">
        <CheckCircle className="w-10 h-10 text-emerald-500" strokeWidth={2} />
      </div>

      <h1 className="text-xl font-bold text-foreground mb-2">Form Filled!</h1>

      <p className="text-sm text-neutral-500 text-center mb-4">
        All fields have been auto-filled successfully.
      </p>

      <p className="text-sm font-medium text-foreground mb-8">
        {fieldsFilled} fields filled
      </p>

      <Button
        onClick={onDone}
        className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
      >
        Done
      </Button>
    </div>
  );
}
