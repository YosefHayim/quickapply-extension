import { Clock } from 'lucide-react';
import ErrorScreen from './ErrorScreen';

interface SessionExpiredProps {
  onRetry: () => void;
}

export default function SessionExpired({ onRetry }: SessionExpiredProps) {
  return (
    <ErrorScreen
      icon={Clock}
      iconColor="#F59E0B"
      iconBgLight="bg-amber-100"
      iconBgDark="bg-amber-950"
      title="Session Expired"
      subtitle="Your session has timed out. Please sign in again to continue."
      buttonText="Sign In Again"
      onRetry={onRetry}
    />
  );
}
