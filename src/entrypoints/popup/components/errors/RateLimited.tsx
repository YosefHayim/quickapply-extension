import { useState, useEffect } from 'react';
import { Hourglass } from 'lucide-react';
import ErrorScreen from './ErrorScreen';

interface RateLimitedProps {
  onGoBack: () => void;
  retryAfter?: number;
}

export default function RateLimited({ onGoBack, retryAfter = 30 }: RateLimitedProps) {
  const [secondsLeft, setSecondsLeft] = useState(retryAfter);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const countdownText =
    secondsLeft > 0
      ? `Try again in ${secondsLeft} second${secondsLeft !== 1 ? 's' : ''}`
      : 'You can try again now';

  return (
    <ErrorScreen
      icon={Hourglass}
      iconColor="#3B82F6"
      iconBgLight="bg-blue-100"
      iconBgDark="bg-blue-950"
      title="Too Many Requests"
      subtitle="Please wait a moment before trying again."
      buttonText="Go Back"
      buttonVariant="outline"
      onRetry={onGoBack}
      countdownText={countdownText}
      countdownColor="#3B82F6"
    />
  );
}
