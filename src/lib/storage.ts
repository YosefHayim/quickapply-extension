import type { UserProfile, ExtensionSettings, LicenseInfo, User, ResumeItem } from '@/types/profile';
import { generateId } from './utils';

export const STORAGE_KEYS = {
  PROFILES: 'profiles',
  ACTIVE_PROFILE_ID: 'activeProfileId',
  SETTINGS: 'settings',
  LICENSE: 'license',
  JWT: 'jwt',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  RESUMES: 'resumes',
} as const;

function createDefaultProfile(): UserProfile {
  return {
    id: generateId(),
    name: 'Default Profile',
    isDefault: true,
    personal: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
      },
      linkedinUrl: '',
      portfolioUrl: '',
      githubUrl: '',
    },
    workAuth: {
      authorizedToWork: true,
      requiresSponsorship: false,
      visaStatus: '',
    },
    experience: {
      totalYears: 0,
      skills: [],
      currentTitle: '',
      currentCompany: '',
    },
    salary: {
      minimum: 0,
      maximum: 0,
      preferred: 0,
      currency: 'USD',
    },
    eeo: {
      gender: '',
      race: '',
      veteranStatus: '',
      disabilityStatus: '',
    },
    files: {},
    customFields: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function createDefaultSettings(): ExtensionSettings {
  return {
    theme: 'system',
    autoDetectForms: true,
    showNotifications: true,
    fillDelay: 0,
  };
}

export async function getProfiles(): Promise<UserProfile[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.PROFILES);
  const profiles = result[STORAGE_KEYS.PROFILES] as UserProfile[] | undefined;
  if (!profiles || profiles.length === 0) {
    const defaultProfile = createDefaultProfile();
    await saveProfiles([defaultProfile]);
    return [defaultProfile];
  }
  return profiles;
}

export async function saveProfiles(profiles: UserProfile[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.PROFILES]: profiles });
}

export async function getActiveProfileId(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.ACTIVE_PROFILE_ID);
  const id = result[STORAGE_KEYS.ACTIVE_PROFILE_ID] as string | undefined;
  if (!id) {
    const profiles = await getProfiles();
    const defaultProfile = profiles.find((p) => p.isDefault) || profiles[0];
    await setActiveProfileId(defaultProfile.id);
    return defaultProfile.id;
  }
  return id;
}

export async function setActiveProfileId(id: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.ACTIVE_PROFILE_ID]: id });
}

export async function getActiveProfile(): Promise<UserProfile> {
  const profiles = await getProfiles();
  const activeId = await getActiveProfileId();
  return profiles.find((p) => p.id === activeId) || profiles[0];
}

export async function updateProfile(profile: UserProfile): Promise<void> {
  const profiles = await getProfiles();
  const index = profiles.findIndex((p) => p.id === profile.id);
  if (index !== -1) {
    profiles[index] = { ...profile, updatedAt: Date.now() };
    await saveProfiles(profiles);
  }
}

export async function createProfile(name: string): Promise<UserProfile> {
  const profiles = await getProfiles();
  const newProfile = createDefaultProfile();
  newProfile.id = generateId();
  newProfile.name = name;
  newProfile.isDefault = false;
  profiles.push(newProfile);
  await saveProfiles(profiles);
  return newProfile;
}

export async function deleteProfile(id: string): Promise<void> {
  const profiles = await getProfiles();
  const filtered = profiles.filter((p) => p.id !== id);
  if (filtered.length === 0) {
    filtered.push(createDefaultProfile());
  }
  await saveProfiles(filtered);
  const activeId = await getActiveProfileId();
  if (activeId === id) {
    await setActiveProfileId(filtered[0].id);
  }
}

export async function getSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  return (result[STORAGE_KEYS.SETTINGS] as ExtensionSettings) || createDefaultSettings();
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings });
}

export async function getLicense(): Promise<LicenseInfo | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.LICENSE);
  return (result[STORAGE_KEYS.LICENSE] as LicenseInfo) || null;
}

export async function saveLicense(license: LicenseInfo): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.LICENSE]: license });
}

export async function clearLicense(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEYS.LICENSE);
}

export function onStorageChange(
  callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === 'local') {
      callback(changes);
    }
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}

// Security: JWT in session storage (ephemeral), refresh token in local storage (persistent)
export async function storeAuthTokens(jwt: string, refreshToken: string, user: User): Promise<void> {
  await chrome.storage.session.set({ [STORAGE_KEYS.JWT]: jwt });
  await chrome.storage.local.set({
    [STORAGE_KEYS.REFRESH_TOKEN]: refreshToken,
    [STORAGE_KEYS.USER]: user,
  });
}

export async function getJWT(): Promise<string | null> {
  const result = await chrome.storage.session.get(STORAGE_KEYS.JWT);
  return (result[STORAGE_KEYS.JWT] as string) || null;
}

export async function setJWT(jwt: string): Promise<void> {
  await chrome.storage.session.set({ [STORAGE_KEYS.JWT]: jwt });
}

export async function getRefreshToken(): Promise<string | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.REFRESH_TOKEN);
  return (result[STORAGE_KEYS.REFRESH_TOKEN] as string) || null;
}

export async function setRefreshToken(refreshToken: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.REFRESH_TOKEN]: refreshToken });
}

export async function getStoredUser(): Promise<User | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.USER);
  return (result[STORAGE_KEYS.USER] as User) || null;
}

export async function clearAuth(): Promise<void> {
  await chrome.storage.session.remove(STORAGE_KEYS.JWT);
  await chrome.storage.local.remove([STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.USER]);
}

export async function getResumes(): Promise<ResumeItem[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.RESUMES);
  return (result[STORAGE_KEYS.RESUMES] as ResumeItem[]) || [];
}

export async function saveResumes(resumes: ResumeItem[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.RESUMES]: resumes });
}

export async function addResume(resume: ResumeItem): Promise<void> {
  const resumes = await getResumes();
  if (resume.isDefault) {
    resumes.forEach((r) => (r.isDefault = false));
  }
  resumes.push(resume);
  await saveResumes(resumes);
}

export async function updateResume(id: string, updates: Partial<ResumeItem>): Promise<void> {
  const resumes = await getResumes();
  const index = resumes.findIndex((r) => r.id === id);
  if (index !== -1) {
    if (updates.isDefault) {
      resumes.forEach((r) => (r.isDefault = false));
    }
    resumes[index] = { ...resumes[index], ...updates };
    await saveResumes(resumes);
  }
}

export async function deleteResume(id: string): Promise<void> {
  const resumes = await getResumes();
  const filtered = resumes.filter((r) => r.id !== id);
  if (filtered.length > 0 && !filtered.some((r) => r.isDefault)) {
    filtered[0].isDefault = true;
  }
  await saveResumes(filtered);
}

export async function setDefaultResume(id: string): Promise<void> {
  const resumes = await getResumes();
  if (!resumes.some((resume) => resume.id === id)) {
    return;
  }
  resumes.forEach((r) => (r.isDefault = r.id === id));
  await saveResumes(resumes);
}
