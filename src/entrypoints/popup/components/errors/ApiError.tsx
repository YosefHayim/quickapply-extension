import { AlertTriangle } from 'lucide-react';
import ErrorScreen from './ErrorScreen';

interface ApiErrorProps {
  onRetry: () => void;
}

export default function ApiError({ onRetry }: ApiErrorProps) {
  return (
    <ErrorScreen
      icon={AlertTriangle}
      iconClassName="text-red-500"
      iconBgClassName="bg-red-100 dark:bg-red-950"
      title="Something Went Wrong"
      subtitle="We couldn't complete your request. Please try again."
      buttonText="Try Again"
      onRetry={onRetry}
    />
  );
}
