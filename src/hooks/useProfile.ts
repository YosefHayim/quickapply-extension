import { useState, useEffect, useCallback } from 'react';
import {
  getProfiles,
  getActiveProfile,
  setActiveProfileId,
  updateProfile,
  createProfile,
  deleteProfile,
  onStorageChange,
  getJWT,
} from '@/lib/storage';
import { pushFields, syncOnLogin } from '@/lib/fields-sync';
import type { UserProfile } from '@/types/profile';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [activeProfile, allProfiles] = await Promise.all([
        getActiveProfile(),
        getProfiles(),
      ]);
      setProfile(activeProfile);
      setProfiles(allProfiles);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = onStorageChange(() => {
      loadData();
    });
    return unsubscribe;
  }, [loadData]);

  const switchProfile = useCallback(async (id: string) => {
    await setActiveProfileId(id);
    await loadData();
  }, [loadData]);

  const saveProfile = useCallback(async (updatedProfile: UserProfile) => {
    await updateProfile(updatedProfile);
    setProfile(updatedProfile);
    
    const jwt = await getJWT();
    if (jwt && updatedProfile.customFields) {
      pushFields(updatedProfile.customFields).catch(() => {});
    }
  }, []);

  const addProfile = useCallback(async (name: string) => {
    const newProfile = await createProfile(name);
    await loadData();
    return newProfile;
  }, [loadData]);

  const removeProfile = useCallback(async (id: string) => {
    await deleteProfile(id);
    await loadData();
  }, [loadData]);

  const syncCustomFields = useCallback(async () => {
    if (!profile) return;
    
    const jwt = await getJWT();
    if (!jwt) return;

    const localFields = profile.customFields || {};
    const mergedFields = await syncOnLogin(localFields);
    
    const updatedProfile = { ...profile, customFields: mergedFields };
    await updateProfile(updatedProfile);
    setProfile(updatedProfile);
  }, [profile]);

  return {
    profile,
    profiles,
    loading,
    switchProfile,
    saveProfile,
    addProfile,
    removeProfile,
    refreshProfile: loadData,
    syncCustomFields,
  };
}
