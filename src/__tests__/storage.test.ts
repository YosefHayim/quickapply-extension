import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getProfiles,
  saveProfiles,
  getActiveProfileId,
  setActiveProfileId,
  getActiveProfile,
  updateProfile,
  createProfile,
  deleteProfile,
  getSettings,
  saveSettings,
  storeAuthTokens,
  getJWT,
  setJWT,
  getRefreshToken,
  clearAuth,
  STORAGE_KEYS,
} from '@/lib/storage';
import type { UserProfile, ExtensionSettings, User } from '@/types/profile';

describe('Storage Module', () => {
  beforeEach(async () => {
    await chrome.storage.local.clear();
    await chrome.storage.session.clear();
  });

  describe('Profile Management', () => {
    it('should create a default profile when none exists', async () => {
      const profiles = await getProfiles();

      expect(profiles).toHaveLength(1);
      expect(profiles[0].name).toBe('Default Profile');
      expect(profiles[0].isDefault).toBe(true);
      expect(profiles[0].personal.firstName).toBe('');
    });

    it('should return existing profiles', async () => {
      const mockProfile: UserProfile = {
        id: 'test-id',
        name: 'Test Profile',
        isDefault: true,
        personal: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
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
          totalYears: 5,
          skills: [],
          currentTitle: 'Developer',
          currentCompany: 'Tech Co',
        },
        salary: {
          minimum: 80000,
          maximum: 120000,
          preferred: 100000,
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

      await saveProfiles([mockProfile]);
      const profiles = await getProfiles();

      expect(profiles).toHaveLength(1);
      expect(profiles[0].name).toBe('Test Profile');
      expect(profiles[0].personal.firstName).toBe('John');
    });

    it('should get and set active profile ID', async () => {
      const profiles = await getProfiles();
      const profileId = profiles[0].id;

      await setActiveProfileId(profileId);
      const activeId = await getActiveProfileId();

      expect(activeId).toBe(profileId);
    });

    it('should get the active profile', async () => {
      const profiles = await getProfiles();
      await setActiveProfileId(profiles[0].id);

      const activeProfile = await getActiveProfile();

      expect(activeProfile.id).toBe(profiles[0].id);
    });

    it('should update a profile', async () => {
      const profiles = await getProfiles();
      const profile = profiles[0];
      profile.personal.firstName = 'Updated';

      await updateProfile(profile);
      const updatedProfiles = await getProfiles();

      expect(updatedProfiles[0].personal.firstName).toBe('Updated');
      expect(updatedProfiles[0].updatedAt).toBeGreaterThanOrEqual(profile.updatedAt);
    });

    it('should create a new profile', async () => {
      const newProfile = await createProfile('Work Profile');

      expect(newProfile.name).toBe('Work Profile');
      expect(newProfile.isDefault).toBe(false);

      const profiles = await getProfiles();
      expect(profiles).toHaveLength(2);
    });

    it('should delete a profile and fall back to default', async () => {
      await createProfile('To Delete');
      let profiles = await getProfiles();
      expect(profiles).toHaveLength(2);

      const profileToDelete = profiles.find((p) => p.name === 'To Delete')!;
      await deleteProfile(profileToDelete.id);

      profiles = await getProfiles();
      expect(profiles).toHaveLength(1);
    });

    it('should create new default when deleting last profile', async () => {
      const profiles = await getProfiles();
      await deleteProfile(profiles[0].id);

      const newProfiles = await getProfiles();
      expect(newProfiles).toHaveLength(1);
      expect(newProfiles[0].isDefault).toBe(true);
    });
  });

  describe('Settings Management', () => {
    it('should return default settings when none exist', async () => {
      const settings = await getSettings();

      expect(settings.theme).toBe('system');
      expect(settings.autoDetectForms).toBe(true);
      expect(settings.showNotifications).toBe(true);
    });

    it('should save and retrieve settings', async () => {
      const newSettings: ExtensionSettings = {
        theme: 'dark',
        autoDetectForms: false,
        showNotifications: false,
      };

      await saveSettings(newSettings);
      const settings = await getSettings();

      expect(settings.theme).toBe('dark');
      expect(settings.autoDetectForms).toBe(false);
      expect(settings.showNotifications).toBe(false);
    });
  });

  describe('Auth Token Management', () => {
    const mockUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    };

    it('should store and retrieve JWT from session storage', async () => {
      await storeAuthTokens('jwt-token', 'refresh-token', mockUser);

      const jwt = await getJWT();
      expect(jwt).toBe('jwt-token');
    });

    it('should store refresh token in local storage', async () => {
      await storeAuthTokens('jwt-token', 'refresh-token', mockUser);

      const refreshToken = await getRefreshToken();
      expect(refreshToken).toBe('refresh-token');
    });

    it('should set JWT separately', async () => {
      await setJWT('new-jwt-token');

      const jwt = await getJWT();
      expect(jwt).toBe('new-jwt-token');
    });

    it('should clear all auth data', async () => {
      await storeAuthTokens('jwt-token', 'refresh-token', mockUser);
      await clearAuth();

      const jwt = await getJWT();
      const refreshToken = await getRefreshToken();

      expect(jwt).toBeNull();
      expect(refreshToken).toBeNull();
    });

    it('should return null for missing JWT', async () => {
      const jwt = await getJWT();
      expect(jwt).toBeNull();
    });

    it('should return null for missing refresh token', async () => {
      const refreshToken = await getRefreshToken();
      expect(refreshToken).toBeNull();
    });
  });

  describe('Storage Keys', () => {
    it('should have all required storage keys defined', () => {
      expect(STORAGE_KEYS.PROFILES).toBe('profiles');
      expect(STORAGE_KEYS.ACTIVE_PROFILE_ID).toBe('activeProfileId');
      expect(STORAGE_KEYS.SETTINGS).toBe('settings');
      expect(STORAGE_KEYS.LICENSE).toBe('license');
      expect(STORAGE_KEYS.JWT).toBe('jwt');
      expect(STORAGE_KEYS.REFRESH_TOKEN).toBe('refreshToken');
      expect(STORAGE_KEYS.USER).toBe('user');
    });
  });
});
