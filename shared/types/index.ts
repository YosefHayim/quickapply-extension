export interface User {
  id: string;
  email: string;
  googleId: string;
  name?: string;
  createdAt: string;
  trialStartedAt: string;
}

export interface UserStatus {
  user: User;
  trial: {
    isActive: boolean;
    daysRemaining: number | null;
    startedAt: string;
  };
  subscription: {
    isActive: boolean;
    status: string | null;
    expiresAt: string | null;
  };
  usage: {
    fillsToday: number;
    fillsRemaining: number | null;
    resetsAt: string;
  };
}

export interface Submission {
  id: string;
  urlHash: string;
  urlDisplay: string;
  platform: string;
  submittedAt: string;
}

export interface CustomField {
  key: string;
  value: string;
}
