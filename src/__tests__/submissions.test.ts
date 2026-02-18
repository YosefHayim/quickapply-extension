import { describe, it, expect } from 'vitest';
import { normalizeUrl } from '@/lib/submissions';

describe('normalizeUrl', () => {
  it('strips hash fragments', () => {
    expect(normalizeUrl('https://jobs.lever.co/company/role#apply')).toBe(
      'https://jobs.lever.co/company/role'
    );
  });

  it('lowercases the hostname', () => {
    expect(normalizeUrl('https://BOARDS.Greenhouse.IO/company/jobs/123')).toBe(
      'https://boards.greenhouse.io/company/jobs/123'
    );
  });

  it('removes www. prefix', () => {
    expect(normalizeUrl('https://www.linkedin.com/jobs/view/123')).toBe(
      'https://linkedin.com/jobs/view/123'
    );
  });

  it('preserves query parameters', () => {
    const url = 'https://boards.greenhouse.io/company/jobs/123?gh_jid=456';
    const result = normalizeUrl(url);
    expect(result).toContain('gh_jid=456');
  });

  it('strips hash while keeping query params', () => {
    const url = 'https://jobs.lever.co/company/role?lever-source=linkedin#top';
    const result = normalizeUrl(url);
    expect(result).not.toContain('#top');
    expect(result).toContain('lever-source=linkedin');
  });

  it('returns the original string for invalid URLs', () => {
    expect(normalizeUrl('not-a-url')).toBe('not-a-url');
  });

  it('does not strip www from non-www hostnames', () => {
    expect(normalizeUrl('https://greenhouse.io/jobs/123')).toBe(
      'https://greenhouse.io/jobs/123'
    );
  });

  it('handles URLs without path', () => {
    expect(normalizeUrl('https://www.example.com')).toBe('https://example.com/');
  });
});
