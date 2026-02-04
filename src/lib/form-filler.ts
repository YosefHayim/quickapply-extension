import type { UserProfile, DetectedField, FillResult, StoredFile } from '@/types/profile';
import { base64ToFile } from './utils';

function triggerInputEvents(element: HTMLElement): void {
  element.focus();
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

function fillTextInput(element: HTMLInputElement | HTMLTextAreaElement, value: string): boolean {
  if (!value) return false;
  element.value = value;
  triggerInputEvents(element);
  return true;
}

function fillSelect(element: HTMLSelectElement, value: string): boolean {
  if (!value) return false;

  const valueLower = value.toLowerCase();
  const options = Array.from(element.options);

  let matchedOption = options.find((opt) => opt.value.toLowerCase() === valueLower);

  if (!matchedOption) {
    matchedOption = options.find((opt) => opt.text.toLowerCase().includes(valueLower));
  }

  if (!matchedOption) {
    matchedOption = options.find((opt) => valueLower.includes(opt.text.toLowerCase()));
  }

  if (matchedOption) {
    element.value = matchedOption.value;
    triggerInputEvents(element);
    return true;
  }

  return false;
}

function fillCheckbox(element: HTMLInputElement, checked: boolean): boolean {
  if (element.checked !== checked) {
    element.checked = checked;
    triggerInputEvents(element);
  }
  return true;
}

function fillRadio(element: HTMLInputElement, value: string): boolean {
  const name = element.name;
  if (!name) return false;

  const radios = document.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${name}"]`);
  const valueLower = value.toLowerCase();

  for (const radio of radios) {
    const radioValue = radio.value.toLowerCase();
    const label = document.querySelector(`label[for="${radio.id}"]`);
    const labelText = label?.textContent?.toLowerCase() || '';

    if (
      radioValue === valueLower ||
      radioValue.includes(valueLower) ||
      labelText.includes(valueLower)
    ) {
      radio.checked = true;
      triggerInputEvents(radio);
      return true;
    }
  }

  return false;
}

async function fillFileInput(element: HTMLInputElement, storedFile: StoredFile): Promise<boolean> {
  try {
    const file = base64ToFile(storedFile.data, storedFile.name, storedFile.type);
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    element.files = dataTransfer.files;
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  } catch {
    return false;
  }
}

function getProfileValue(profile: UserProfile, fieldType: string): string | boolean | undefined {
  const mappings: Record<string, () => string | boolean | undefined> = {
    firstName: () => profile.personal.firstName,
    lastName: () => profile.personal.lastName,
    fullName: () => `${profile.personal.firstName} ${profile.personal.lastName}`.trim(),
    email: () => profile.personal.email,
    phone: () => profile.personal.phone,
    address: () => profile.personal.address.street,
    city: () => profile.personal.address.city,
    state: () => profile.personal.address.state,
    zipCode: () => profile.personal.address.zipCode,
    country: () => profile.personal.address.country,
    linkedinUrl: () => profile.personal.linkedinUrl,
    portfolioUrl: () => profile.personal.portfolioUrl,
    githubUrl: () => profile.personal.githubUrl,
    yearsExperience: () => profile.experience.totalYears.toString(),
    currentTitle: () => profile.experience.currentTitle,
    currentCompany: () => profile.experience.currentCompany,
    salary: () => profile.salary.preferred.toString(),
    authorizedToWork: () => profile.workAuth.authorizedToWork,
    requiresSponsorship: () => profile.workAuth.requiresSponsorship,
    gender: () => profile.eeo.gender,
    race: () => profile.eeo.race,
    veteranStatus: () => profile.eeo.veteranStatus,
    disabilityStatus: () => profile.eeo.disabilityStatus,
  };

  const getter = mappings[fieldType];
  return getter ? getter() : undefined;
}

export async function fillForm(
  fields: DetectedField[],
  profile: UserProfile
): Promise<FillResult> {
  const result: FillResult = {
    filled: 0,
    skipped: 0,
    errors: [],
  };

  for (const field of fields) {
    try {
      const { element, type, fieldType } = field;

      if (fieldType === 'resume' && type === 'file') {
        if (profile.files.resume) {
          const success = await fillFileInput(element as HTMLInputElement, profile.files.resume);
          if (success) {
            result.filled++;
          } else {
            result.skipped++;
          }
        } else {
          result.skipped++;
        }
        continue;
      }

      if (fieldType === 'coverLetter' && type === 'file') {
        if (profile.files.coverLetter) {
          const success = await fillFileInput(
            element as HTMLInputElement,
            profile.files.coverLetter
          );
          if (success) {
            result.filled++;
          } else {
            result.skipped++;
          }
        } else {
          result.skipped++;
        }
        continue;
      }

      const value = getProfileValue(profile, fieldType);

      if (value === undefined || value === '') {
        result.skipped++;
        continue;
      }

      let success = false;

      if (element.tagName === 'SELECT') {
        success = fillSelect(element as HTMLSelectElement, String(value));
      } else if (type === 'checkbox') {
        success = fillCheckbox(element as HTMLInputElement, Boolean(value));
      } else if (type === 'radio') {
        success = fillRadio(element as HTMLInputElement, String(value));
      } else if (element.tagName === 'TEXTAREA' || type === 'text' || type === 'email' || type === 'tel' || type === 'url' || type === 'number') {
        success = fillTextInput(element as HTMLInputElement | HTMLTextAreaElement, String(value));
      }

      if (success) {
        result.filled++;
      } else {
        result.skipped++;
      }
    } catch (error) {
      result.errors.push(`Failed to fill ${field.fieldType}: ${error}`);
      result.skipped++;
    }
  }

  return result;
}

export function highlightFields(fields: DetectedField[]): void {
  fields.forEach((field) => {
    const element = field.element;
    element.style.outline = '2px solid #22c55e';
    element.style.outlineOffset = '2px';
  });
}

export function clearHighlights(fields: DetectedField[]): void {
  fields.forEach((field) => {
    const element = field.element;
    element.style.outline = '';
    element.style.outlineOffset = '';
  });
}
