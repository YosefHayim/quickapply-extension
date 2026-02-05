import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export default function FloatingButton({ onClick, disabled, className }: FloatingButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size="icon"
      className={cn(
        'fixed bottom-6 right-6 z-[9999]',
        'h-12 w-12 rounded-full',
        'bg-[#171717] hover:bg-[#262626]',
        'text-[#FAFAFA]',
        'shadow-lg shadow-black/25',
        'border border-white/10',
        'transition-all duration-200 ease-out',
        'hover:scale-110 hover:shadow-xl hover:shadow-black/30',
        'active:scale-95',
        'focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Zap className="h-5 w-5 fill-current" />
      <span className="sr-only">QuickApply - Fill Form</span>
    </Button>
  );
}
