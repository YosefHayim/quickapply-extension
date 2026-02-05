import { Rocket, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStep1Props {
  onNext: () => void;
}

export default function OnboardingStep1({ onNext }: OnboardingStep1Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-8 text-center">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
          <Rocket className="w-10 h-10 text-foreground" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-[22px] font-bold text-foreground tracking-tight">
            Welcome to QuickApply
          </h1>
          <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
            Fill job applications 10x faster with AI-powered auto-fill
          </p>
        </div>
      </div>

      <div className="w-full space-y-6 mt-auto">
        <Button 
          className="w-full h-11 text-base font-medium"
          onClick={onNext}
        >
          Get Started
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-border" />
          <div className="w-2 h-2 rounded-full bg-border" />
        </div>
      </div>
    </div>
  );
}
