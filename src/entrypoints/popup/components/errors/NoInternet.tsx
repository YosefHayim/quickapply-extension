import { WifiOff } from 'lucide-react';
import ErrorScreen from './ErrorScreen';

interface NoInternetProps {
  onRetry: () => void;
}

export default function NoInternet({ onRetry }: NoInternetProps) {
  return (
    <ErrorScreen
      icon={WifiOff}
      iconColor="#EF4444"
      iconBgLight="bg-red-100"
      iconBgDark="bg-red-950"
      title="No Internet Connection"
      subtitle="Please check your connection and try again."
      buttonText="Retry"
      onRetry={onRetry}
    />
  );
}
