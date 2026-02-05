import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { OnboardingFormData } from '@/hooks/useOnboarding';

interface OnboardingStep2Props {
  formData: OnboardingFormData;
  onUpdate: (data: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingStep2({ 
  formData, 
  onUpdate, 
  onNext, 
  onBack 
}: OnboardingStep2Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="flex flex-col h-full px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-foreground">Your Profile</h1>
        <span className="text-sm text-muted-foreground">Step 2 of 3</span>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => onUpdate({ email: e.target.value })}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => onUpdate({ phone: e.target.value })}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">
              Location
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="San Francisco, CA"
              value={formData.location}
              onChange={(e) => onUpdate({ location: e.target.value })}
              className="h-10"
            />
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-11"
              onClick={onBack}
            >
              Back
            </Button>
            <Button type="submit" className="flex-1 h-11">
              Continue
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-border" />
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full bg-border" />
          </div>
        </div>
      </form>
    </div>
  );
}
