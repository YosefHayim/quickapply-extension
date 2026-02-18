export interface StoredFile {
  name: string;
  type: string;
  size: number;
  data: string;
  lastModified: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  linkedinUrl: string;
  portfolioUrl: string;
  githubUrl: string;
}

export interface WorkAuth {
  authorizedToWork: boolean;
  requiresSponsorship: boolean;
  visaStatus: string;
}

export interface Skill {
  name: string;
  years: number;
}

export interface Experience {
  totalYears: number;
  skills: Skill[];
  currentTitle: string;
  currentCompany: string;
}

export interface Salary {
  minimum: number;
  maximum: number;
  preferred: number;
  currency: string;
}

export interface EEO {
  gender: 'male' | 'female' | 'non-binary' | 'decline' | '';
  race: string;
  veteranStatus: 'yes' | 'no' | 'decline' | '';
  disabilityStatus: 'yes' | 'no' | 'decline' | '';
}

export interface UserProfile {
  id: string;
  name: string;
  isDefault: boolean;
  personal: PersonalInfo;
  workAuth: WorkAuth;
  experience: Experience;
  salary: Salary;
  eeo: EEO;
  files: {
    resume?: StoredFile;
    coverLetter?: StoredFile;
  };
  customFields: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

export interface ExtensionSettings {
  theme: 'light' | 'dark' | 'system';
  autoDetectForms: boolean;
  showNotifications: boolean;
  fillDelay: number;
}

export interface LicenseInfo {
  key: string;
  status: 'active' | 'inactive' | 'expired';
  plan: 'free' | 'pro' | 'lifetime';
  expiresAt?: number;
  activatedAt?: number;
}

export interface DetectedField {
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  type: string;
  fieldType: string;
  confidence: number;
  selector: string;
}

export interface FillResult {
  filled: number;
  skipped: number;
  errors: string[];
}

export type PlanType = 'free' | 'pro' | 'lifetime';

export interface User {
  id: string;
  email: string;
  name: string | null;
  picture?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year' | 'lifetime';
  features: string[];
  variantId: number;
  popular?: boolean;
}

export interface ResumeItem {
  id: string;
  name: string;
  size: number;
  date: number;
  isDefault: boolean;
  data: string;
  mimeType: string;
}
