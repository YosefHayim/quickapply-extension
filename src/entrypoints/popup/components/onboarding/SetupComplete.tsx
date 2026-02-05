import { CheckCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SetupCompleteProps {
  hasResume: boolean;
  onFinish: () => void;
}

export default function SetupComplete({ hasResume, onFinish }: SetupCompleteProps) {
  const checklistItems = [
    { label: 'Profile information saved', completed: true },
    { label: 'Resume uploaded successfully', completed: hasResume },
    { label: 'Free fills available', completed: true },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-8 text-center">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            You're All Set!
          </h1>
          <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
            Your profile is ready. Start auto-filling job applications with one click.
          </p>
        </div>

        <div className="w-full max-w-[280px] space-y-3 mt-2">
          {checklistItems.map((item) => (
            <div 
              key={item.label}
              className="flex items-center gap-3 text-left"
            >
              <div className={`
                w-5 h-5 rounded-full flex items-center justify-center shrink-0
                ${item.completed 
                  ? 'bg-emerald-100 dark:bg-emerald-950' 
                  : 'bg-secondary'
                }
              `}>
                <Check className={`
                  w-3 h-3
                  ${item.completed 
                    ? 'text-emerald-500' 
                    : 'text-muted-foreground'
                  }
                `} />
              </div>
              <span className={`
                text-sm
                ${item.completed 
                  ? 'text-foreground' 
                  : 'text-muted-foreground'
                }
              `}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full mt-auto">
        <Button 
          className="w-full h-11 text-base font-medium"
          onClick={onFinish}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
