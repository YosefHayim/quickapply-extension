import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const toastVariants = cva(
  'w-80 rounded-lg px-4 py-3 flex items-center gap-3 shadow-lg animate-in slide-in-from-top-2 fade-in duration-300',
  {
    variants: {
      variant: {
        success: 'bg-emerald-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-amber-500 text-white',
        info: 'bg-blue-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps extends VariantProps<typeof toastVariants> {
  message: string;
  variant?: ToastVariant;
  onClose?: () => void;
  className?: string;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ message, variant = 'info', onClose, className, ...props }, ref) => {
    const Icon = toastIcons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium flex-1">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 rounded-full p-0.5 hover:bg-white/20 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }
);
Toast.displayName = 'Toast';

export interface ToastContainerProps {
  children: React.ReactNode;
  className?: string;
}

const ToastContainer = React.forwardRef<HTMLDivElement, ToastContainerProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2',
          className
        )}
      >
        {children}
      </div>
    );
  }
);
ToastContainer.displayName = 'ToastContainer';

export { Toast, ToastContainer, toastVariants };
