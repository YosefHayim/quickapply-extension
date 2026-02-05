import { useId } from 'react';
import { Globe, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useModalFocusTrap } from '@/hooks/useModalFocusTrap';

interface SupportedSitesProps {
  onClose: () => void;
}

const SUPPORTED_PLATFORMS = [
  { name: 'LinkedIn', domain: 'linkedin.com' },
  { name: 'Greenhouse', domain: 'greenhouse.io' },
  { name: 'Lever', domain: 'lever.co' },
  { name: 'Workday', domain: 'workday.com' },
  { name: 'Indeed', domain: 'indeed.com' },
  { name: 'SmartRecruiters', domain: 'smartrecruiters.com' },
  { name: 'iCIMS', domain: 'icims.com' },
  { name: 'Taleo', domain: 'taleo.net' },
  { name: 'BreezyHR', domain: 'breezy.hr' },
];

export default function SupportedSites({ onClose }: SupportedSitesProps) {
  const titleId = useId();
  const dialogRef = useModalFocusTrap(onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-[340px] border-blue-500/30 shadow-2xl shadow-blue-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/15">
              <Globe className="h-7 w-7 text-blue-500" />
            </div>
            <CardTitle id={titleId} className="text-center text-lg">
              Supported Job Sites
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="max-h-[280px] space-y-1 overflow-y-auto pr-1">
            {SUPPORTED_PLATFORMS.map((platform) => (
              <div
                key={platform.name}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {platform.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {platform.domain}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            More platforms coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
