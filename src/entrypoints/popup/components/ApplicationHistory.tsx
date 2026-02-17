import { ArrowLeft, Check, Clock, ExternalLink } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useSubmissions } from '@/hooks/useSubmissions';
import type { Submission } from '@/lib/submissions';

type DateFilter = 'all' | 'today' | 'week';

const MAX_DISPLAYED_MISSING_FIELDS = 3;

interface ApplicationHistoryProps {
  onBack: () => void;
}

function getStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#F5F5F5] dark:bg-[#1A1A1A] flex items-center justify-center mb-4">
        <Clock className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">
        No Applications Yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-[200px]">
        Start filling forms to see your history here
      </p>
    </div>
  );
}

interface StatsBarProps {
  total: number;
  thisWeek: number;
  today: number;
}

function StatsBar({ total, thisWeek, today }: StatsBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-lg">
      <div className="flex-1 text-center">
        <div className="text-xl font-bold text-foreground">{total}</div>
        <div className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">Total</div>
      </div>
      <div className="w-px h-10 bg-border/50" />
      <div className="flex-1 text-center">
        <div className="text-xl font-bold text-[#10B981]">{thisWeek}</div>
        <div className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">This Week</div>
      </div>
      <div className="w-px h-10 bg-border/50" />
      <div className="flex-1 text-center">
        <div className="text-xl font-bold text-[#3B82F6]">{today}</div>
        <div className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">Today</div>
      </div>
    </div>
  );
}

interface ApplicationItemProps {
  submission: Submission;
}

function ApplicationItem({ submission }: ApplicationItemProps) {
  const domain = extractDomain(submission.url);
  const time = formatTime(submission.submittedAt);
  const title = submission.jobTitle ?? 'Job Application';

  const handleClick = () => {
    chrome.tabs.create({ url: submission.url });
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      role="link"
      aria-label={`Open ${title} on ${domain}`}
      className="w-full flex items-center gap-3 p-3 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-lg hover:bg-[#EBEBEB] dark:hover:bg-[#252525] transition-colors text-left group"
    >
      <div className="w-9 h-9 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B] flex items-center justify-center shrink-0">
        <Check className="w-[18px] h-[18px] text-[#10B981]" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">{title}</div>
        <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
          <span>{domain}</span>
          <span className="opacity-60">•</span>
          <span>{time}</span>
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
}

interface DateGroupProps {
  label: string;
  submissions: Submission[];
}

function DateGroup({ label, submissions }: DateGroupProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        {label}
      </div>
      <div className="space-y-2">
        {submissions.map((submission) => (
          <ApplicationItem key={submission.id} submission={submission} />
        ))}
      </div>
    </div>
  );
}

export default function ApplicationHistory({ onBack }: ApplicationHistoryProps) {
  const { submissions, grouped, stats, loading, error, refresh } = useSubmissions();
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const filteredGroups = useMemo(() => {
    if (dateFilter === 'all') return grouped;

    const now = new Date();
    const startOfToday = getStartOfDay(now);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const filteredSubmissions = submissions.filter((s) => {
      const ts = new Date(s.submittedAt).getTime();
      if (dateFilter === 'today') return ts >= startOfToday.getTime();
      return ts >= startOfWeek.getTime();
    });

    // Re-group the filtered submissions preserving original group labels
    const seen = new Set<string>();
    return grouped
      .map((group) => ({
        ...group,
        submissions: group.submissions.filter((s) => filteredSubmissions.some((fs) => fs.id === s.id)),
      }))
      .filter((group) => {
        if (group.submissions.length === 0) return false;
        if (seen.has(group.label)) return false;
        seen.add(group.label);
        return true;
      });
  }, [grouped, submissions, dateFilter]);

  return (
    <div className="w-[400px] min-h-[500px] max-h-[550px] bg-background text-foreground flex flex-col">
      <header className="flex items-center gap-3 p-4 border-b shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="w-8 h-8 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-base font-semibold text-foreground flex-1">
          Application History
        </h1>
        <div className="w-8" />
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={refresh}>
              Try Again
            </Button>
          </div>
        ) : grouped.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <StatsBar {...stats} />

            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {(['all', 'week', 'today'] as DateFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setDateFilter(f)}
                  className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    dateFilter === f
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'week' ? 'This Week' : 'Today'}
                </button>
              ))}
            </div>

            <div className="space-y-5 pt-1">
              {filteredGroups.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No applications found for this period
                </p>
              ) : (
                filteredGroups.map((group) => (
                  <DateGroup
                    key={group.label}
                    label={group.label}
                    submissions={group.submissions}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export { MAX_DISPLAYED_MISSING_FIELDS };
