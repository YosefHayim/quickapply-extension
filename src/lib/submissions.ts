import { authenticatedFetch, AuthError } from './api';

interface DuplicateCheckResponse {
  isDuplicate: boolean;
  submittedAt?: string;
}

interface LogSubmissionResponse {
  id?: string;
  isDuplicate: boolean;
  submittedAt?: string;
}

export interface Submission {
  id: string;
  url: string;
  platform: string;
  jobTitle?: string;
  company?: string;
  submittedAt: string;
}

interface GetSubmissionsResponse {
  submissions: Submission[];
  total: number;
}

export async function getSubmissions(limit = 50, offset = 0): Promise<GetSubmissionsResponse> {
  try {
    return await authenticatedFetch<GetSubmissionsResponse>(
      `/submissions?limit=${limit}&offset=${offset}`
    );
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.warn('Failed to fetch submissions:', error);
    return { submissions: [], total: 0 };
  }
}

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return url;
  }
}

export async function checkDuplicate(url: string): Promise<DuplicateCheckResponse> {
  try {
    const encodedUrl = encodeURIComponent(url);
    return await authenticatedFetch<DuplicateCheckResponse>(
      `/submissions/check?url=${encodedUrl}`
    );
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.warn('Duplicate check failed, proceeding with fill:', error);
    return { isDuplicate: false };
  }
}

export async function logSubmission(url: string, platform: string): Promise<void> {
  try {
    await authenticatedFetch<LogSubmissionResponse>('/submissions', {
      method: 'POST',
      body: JSON.stringify({ url, platform }),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.warn('Failed to log submission:', error);
  }
}
