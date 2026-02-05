import { ShieldX } from 'lucide-react';
import ErrorScreen from './ErrorScreen';

interface AuthFailedProps {
  onRetry: () => void;
}

export default function AuthFailed({ onRetry }: AuthFailedProps) {
  return (
    <ErrorScreen
      icon={ShieldX}
      iconClassName="text-red-500"
      iconBgClassName="bg-red-100 dark:bg-red-950"
      title="Authentication Failed"
      subtitle="We couldn't verify your identity. Please sign in again."
      buttonText="Sign In"
      onRetry={onRetry}
    />
  );
}
