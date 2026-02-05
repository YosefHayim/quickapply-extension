import { useState, useCallback, useEffect, useRef } from 'react';
import type { ToastVariant } from '@/components/ui/toast';

export interface ToastState {
  id: string;
  type: ToastVariant;
  message: string;
  duration?: number;
}

export interface ShowToastOptions {
  type: ToastVariant;
  message: string;
  duration?: number;
}

const DEFAULT_DURATION = 3000;

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    ({ type, message, duration = DEFAULT_DURATION }: ShowToastOptions) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToast({ id, type, message, duration });

      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          setToast(null);
          timeoutRef.current = null;
        }, duration);
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { toast, showToast, hideToast };
}
