import { useState, useEffect, useCallback } from 'react';
import type { StoredFile } from '@/types/profile';

const STORAGE_KEY = 'onboardingCompleted';

export interface OnboardingFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
}

export interface OnboardingState {
  currentStep: number;
  formData: OnboardingFormData;
  resumeFile: StoredFile | null;
  isCompleted: boolean;
  isLoading: boolean;
}

const initialFormData: OnboardingFormData = {
  name: '',
  email: '',
  phone: '',
  location: '',
};

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    formData: initialFormData,
    resumeFile: null,
    isCompleted: false,
    isLoading: true,
  });

  useEffect(() => {
    const checkCompletion = async () => {
      try {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        const isCompleted = result[STORAGE_KEY] === true;
        setState(prev => ({ ...prev, isCompleted, isLoading: false }));
      } catch (error) {
        console.error('Failed to load onboarding completion state:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    checkCompletion();
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 4),
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  }, []);

  const updateFormData = useCallback((data: Partial<OnboardingFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data },
    }));
  }, []);

  const setResumeFile = useCallback((file: StoredFile | null) => {
    setState(prev => ({ ...prev, resumeFile: file }));
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: true });
      setState(prev => ({ ...prev, isCompleted: true }));
    } catch (error) {
      console.error('Failed to save onboarding completion:', error);
    }
  }, []);

  const resetOnboarding = useCallback(async () => {
    try {
      await chrome.storage.local.remove(STORAGE_KEY);
      setState({
        currentStep: 1,
        formData: initialFormData,
        resumeFile: null,
        isCompleted: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
    }
  }, []);

  return {
    ...state,
    setCurrentStep,
    nextStep,
    prevStep,
    updateFormData,
    setResumeFile,
    completeOnboarding,
    resetOnboarding,
  };
}

export type OnboardingHook = ReturnType<typeof useOnboarding>;
