import { ShieldX } from 'lucide-react';
import ErrorScreen from './ErrorScreen';

interface AuthFailedProps {
  onRetry: () => void;
}

export default function AuthFailed({ onRetry }: AuthFailedProps) {
  return (
    <ErrorScreen
      icon={ShieldX}
      iconColor="#EF4444"
      iconBgLight="bg-red-100"
      iconBgDark="bg-red-950"
      title="Authentication Failed"
      subtitle="We couldn't verify your identity. Please sign in again."
      buttonText="Sign In"
      onRetry={onRetry}
    />
  );
}
