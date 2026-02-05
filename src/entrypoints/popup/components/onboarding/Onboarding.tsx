import { useCallback, useState } from 'react';
import type { OnboardingHook } from '@/hooks/useOnboarding';
import { useProfile } from '@/hooks/useProfile';
import OnboardingStep1 from './OnboardingStep1';
import OnboardingStep2 from './OnboardingStep2';
import OnboardingStep3 from './OnboardingStep3';
import SetupComplete from './SetupComplete';

interface OnboardingProps {
  onComplete: () => void;
  onboarding: OnboardingHook;
}

export default function Onboarding({ onComplete, onboarding }: OnboardingProps) {
  const {
    currentStep,
    formData,
    resumeFile,
    nextStep,
    prevStep,
    updateFormData,
    setResumeFile,
    completeOnboarding,
  } = onboarding;

  const { profile, saveProfile } = useProfile();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasSavedResume, setHasSavedResume] = useState(false);

  const handleStep3Complete = useCallback(async () => {
    if (!profile) {
      setSaveError('Profile data is still loading. Please try again.');
      return;
    }

    setSaveError(null);

    const parseFullName = (fullName: string): { firstName: string; lastName: string } => {
      const trimmed = fullName.trim();
      if (!trimmed) {
        return { firstName: '', lastName: '' };
      }

      let parts = trimmed.split(/\s+/);

      const prefixTokens = ['mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'mx'];
      const suffixTokens = ['jr', 'sr', 'ii', 'iii', 'iv', 'phd', 'md'];
      const normalize = (token: string) => token.replace(/\./g, '').toLowerCase();

      if (parts.length > 1 && prefixTokens.includes(normalize(parts[0]))) {
        parts = parts.slice(1);
      }

      if (parts.length > 1 && suffixTokens.includes(normalize(parts[parts.length - 1]))) {
        parts = parts.slice(0, -1);
      }

      if (parts.length === 1) {
        return { firstName: parts[0], lastName: '' };
      }

      return {
        firstName: parts[0],
        lastName: parts.slice(1).join(' '),
      };
    };

    const parseLocation = (location: string): { city: string; state: string } => {
      const parts = location
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);

      if (parts.length === 0) {
        return { city: '', state: '' };
      }

      const [city, ...rest] = parts;
      return { city, state: rest.join(', ') };
    };

    const { firstName, lastName } = parseFullName(formData.name);
    const { city, state } = parseLocation(formData.location);

    const existingAddress = profile.personal.address ?? {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    };

    const updatedProfile = {
      ...profile,
      personal: {
        ...profile.personal,
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: existingAddress.street ?? '',
          city,
          state,
          zipCode: existingAddress.zipCode ?? '',
          country: existingAddress.country ?? '',
        },
      },
      files: {
        ...profile.files,
        resume: resumeFile ?? undefined,
      },
    };

    try {
      await saveProfile(updatedProfile);
      setHasSavedResume(Boolean(updatedProfile.files.resume));
      nextStep();
    } catch (error) {
      console.error('Failed to save onboarding profile:', error);
      setSaveError('Failed to save your profile. Please try again.');
    }
  }, [profile, formData, resumeFile, saveProfile, nextStep]);

  const handleFinish = useCallback(async () => {
    await completeOnboarding();
    onComplete();
  }, [completeOnboarding, onComplete]);

  return (
    <div className="w-[400px] min-h-[500px] bg-background text-foreground">
      {currentStep === 1 && <OnboardingStep1 onNext={nextStep} />}

      {currentStep === 2 && (
        <OnboardingStep2
          formData={formData}
          onUpdate={updateFormData}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}

      {currentStep === 3 && (
        <OnboardingStep3
          resumeFile={resumeFile}
          onSetResume={setResumeFile}
          onComplete={handleStep3Complete}
          onBack={prevStep}
          saveError={saveError}
        />
      )}

      {currentStep === 4 && (
        <SetupComplete hasResume={hasSavedResume} onFinish={handleFinish} />
      )}
    </div>
  );
}
