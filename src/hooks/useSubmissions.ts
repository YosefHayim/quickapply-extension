import { useState, useEffect, useCallback, useMemo } from 'react';
import { authenticatedFetch, AuthError } from '@/lib/api';

export interface Submission {
  id: string;
  jobTitle: string | null;
  url: string;
  platform: string;
  filledAt: string;
}

interface SubmissionsResponse {
  submissions: Submission[];
}

interface GroupedSubmissions {
  label: string;
  submissions: Submission[];
}

interface SubmissionStats {
  total: number;
  thisWeek: number;
  today: number;
}

function getDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const submissionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (submissionDate.getTime() === today.getTime()) {
    return 'Today';
  }
  if (submissionDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }
  if (submissionDate >= weekAgo) {
    return 'This Week';
  }
  
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

function groupSubmissionsByDate(submissions: Submission[]): GroupedSubmissions[] {
  const groups = new Map<string, Submission[]>();
  const labelOrder: string[] = [];

  const sorted = [...submissions].sort(
    (a, b) => new Date(b.filledAt).getTime() - new Date(a.filledAt).getTime()
  );

  for (const submission of sorted) {
    const label = getDateLabel(new Date(submission.filledAt));
    
    if (!groups.has(label)) {
      groups.set(label, []);
      labelOrder.push(label);
    }
    groups.get(label)!.push(submission);
  }

  return labelOrder.map(label => ({
    label,
    submissions: groups.get(label)!,
  }));
}

function calculateStats(submissions: Submission[]): SubmissionStats {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  let thisWeek = 0;
  let todayCount = 0;

  for (const submission of submissions) {
    const date = new Date(submission.filledAt);
    const submissionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (submissionDate.getTime() === today.getTime()) {
      todayCount++;
      thisWeek++;
    } else if (date >= weekAgo) {
      thisWeek++;
    }
  }

  return {
    total: submissions.length,
    thisWeek,
    today: todayCount,
  };
}

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch<SubmissionsResponse>('/submissions');
      setSubmissions(response.submissions || []);
    } catch (err) {
      if (err instanceof AuthError) {
        setError('Please sign in to view your history');
      } else {
        setError('Failed to load submissions');
      }
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const grouped = useMemo(() => groupSubmissionsByDate(submissions), [submissions]);
  const stats = useMemo(() => calculateStats(submissions), [submissions]);

  return {
    submissions,
    grouped,
    stats,
    loading,
    error,
    refresh: loadSubmissions,
  };
}
