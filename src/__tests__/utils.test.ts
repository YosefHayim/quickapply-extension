import { describe, it, expect } from 'vitest';
import { calculateProfileCompletion } from '@/lib/utils';

function makeProfile(overrides: Partial<Parameters<typeof calculateProfileCompletion>[0]> = {}) {
  return {
    personal: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-1234',
      address: { city: 'New York', state: 'NY', country: 'United States' },
      linkedinUrl: 'https://linkedin.com/in/john',
    },
    experience: { totalYears: 5, currentTitle: 'Software Engineer' },
    files: { resume: { name: 'resume.pdf', type: 'application/pdf', size: 1024, data: '', lastModified: 0 } },
    ...overrides,
  };
}

describe('calculateProfileCompletion', () => {
  it('returns 100% when all fields are filled', () => {
    const result = calculateProfileCompletion(makeProfile());
    expect(result.percentage).toBe(100);
    expect(result.missingFields).toHaveLength(0);
  });

  it('returns 0% when all fields are empty', () => {
    const emptyProfile = {
      personal: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: { city: '', state: '', country: '' },
        linkedinUrl: '',
      },
      experience: { totalYears: 0, currentTitle: '' },
      files: {},
    };
    const result = calculateProfileCompletion(emptyProfile);
    expect(result.percentage).toBe(0);
    expect(result.missingFields).toHaveLength(10);
  });

  it('reports missing firstName', () => {
    const profile = makeProfile({
      personal: {
        firstName: '',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        address: { city: 'NY', state: 'NY', country: 'US' },
        linkedinUrl: 'https://linkedin.com/in/john',
      },
    });
    const result = calculateProfileCompletion(profile);
    expect(result.missingFields).toContain('First name');
  });

  it('reports missing resume', () => {
    const profile = makeProfile({ files: {} });
    const result = calculateProfileCompletion(profile);
    expect(result.missingFields).toContain('Resume');
  });

  it('reports missing years of experience when 0', () => {
    const profile = makeProfile({
      experience: { totalYears: 0, currentTitle: 'Engineer' },
    });
    const result = calculateProfileCompletion(profile);
    expect(result.missingFields).toContain('Years of experience');
  });

  it('does not report years of experience when greater than 0', () => {
    const profile = makeProfile({
      experience: { totalYears: 3, currentTitle: 'Engineer' },
    });
    const result = calculateProfileCompletion(profile);
    expect(result.missingFields).not.toContain('Years of experience');
  });

  it('percentage is a round integer', () => {
    const profile = makeProfile({
      personal: {
        firstName: '',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        address: { city: 'NY', state: 'NY', country: 'US' },
        linkedinUrl: 'https://linkedin.com/in/john',
      },
    });
    const result = calculateProfileCompletion(profile);
    expect(Number.isInteger(result.percentage)).toBe(true);
  });

  it('lists up to all missing fields', () => {
    const profile = makeProfile({
      personal: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: { city: '', state: '', country: '' },
        linkedinUrl: '',
      },
      experience: { totalYears: 0, currentTitle: '' },
      files: {},
    });
    const { missingFields } = calculateProfileCompletion(profile);
    expect(missingFields).toContain('First name');
    expect(missingFields).toContain('Last name');
    expect(missingFields).toContain('Email');
    expect(missingFields).toContain('Phone');
    expect(missingFields).toContain('City');
    expect(missingFields).toContain('Country');
    expect(missingFields).toContain('LinkedIn URL');
    expect(missingFields).toContain('Job title');
    expect(missingFields).toContain('Years of experience');
    expect(missingFields).toContain('Resume');
  });
});
