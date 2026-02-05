import { useCallback } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useProfile } from '@/hooks/useProfile';
import OnboardingStep1 from './OnboardingStep1';
import OnboardingStep2 from './OnboardingStep2';
import OnboardingStep3 from './OnboardingStep3';
import SetupComplete from './SetupComplete';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const {
    currentStep,
    formData,
    resumeFile,
    nextStep,
    prevStep,
    updateFormData,
    setResumeFile,
    completeOnboarding,
  } = useOnboarding();

  const { profile, saveProfile } = useProfile();

  const handleStep3Complete = useCallback(async () => {
    if (!profile) return;

    const nameParts = formData.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const locationParts = formData.location.trim().split(',');
    const city = locationParts[0]?.trim() || '';
    const state = locationParts[1]?.trim() || '';

    const updatedProfile = {
      ...profile,
      personal: {
        ...profile.personal,
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone,
        address: {
          ...profile.personal.address,
          city,
          state,
        },
      },
      files: {
        ...profile.files,
        resume: resumeFile ?? undefined,
      },
    };

    await saveProfile(updatedProfile);
    nextStep();
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
        />
      )}

      {currentStep === 4 && (
        <SetupComplete hasResume={!!resumeFile} onFinish={handleFinish} />
      )}
    </div>
  );
}
