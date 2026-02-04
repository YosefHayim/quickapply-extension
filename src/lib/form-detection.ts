import type { DetectedField } from '@/types/profile';

const FIELD_PATTERNS: Record<string, RegExp[]> = {
  firstName: [/first.?name/i, /fname/i, /given.?name/i, /nombre/i, /vorname/i, /prenom/i],
  lastName: [/last.?name/i, /lname/i, /surname/i, /family.?name/i, /apellido/i, /nachname/i],
  fullName: [/full.?name/i, /name$/i, /your.?name/i],
  email: [/email/i, /e-mail/i, /correo/i, /courriel/i],
  phone: [/phone/i, /mobile/i, /tel/i, /teléfono/i, /telefon/i, /cell/i],
  address: [/address/i, /street/i, /dirección/i, /adresse/i],
  city: [/city/i, /ciudad/i, /ville/i, /stadt/i],
  state: [/state/i, /province/i, /estado/i, /région/i],
  zipCode: [/zip/i, /postal/i, /código.?postal/i, /postleitzahl/i],
  country: [/country/i, /país/i, /pays/i, /land/i],
  linkedinUrl: [/linkedin/i],
  portfolioUrl: [/portfolio/i, /website/i, /personal.?site/i],
  githubUrl: [/github/i],
  resume: [/resume/i, /cv/i, /curriculum/i, /lebenslauf/i],
  coverLetter: [/cover.?letter/i, /carta/i, /lettre/i, /anschreiben/i],
  yearsExperience: [/years?.?(of)?.?experience/i, /experience.?years/i, /años.?experiencia/i],
  currentTitle: [/current.?title/i, /job.?title/i, /position/i, /título/i],
  currentCompany: [/current.?(company|employer)/i, /company.?name/i, /empresa/i],
  salary: [/salary/i, /compensation/i, /salario/i, /pay/i],
  authorizedToWork: [/authorized.?to.?work/i, /legally.?work/i, /work.?authorization/i],
  requiresSponsorship: [/sponsorship/i, /visa/i, /sponsor/i],
  startDate: [/start.?date/i, /available/i, /when.?can.?you/i],
  gender: [/gender/i, /sex/i, /género/i],
  race: [/race/i, /ethnicity/i, /raza/i],
  veteranStatus: [/veteran/i, /military/i],
  disabilityStatus: [/disability/i, /disabled/i, /discapacidad/i],
};

function generateSelector(element: Element): string {
  if (element.id) {
    return `#${CSS.escape(element.id)}`;
  }
  if (element.getAttribute('name')) {
    const name = element.getAttribute('name')!;
    return `[name="${CSS.escape(name)}"]`;
  }
  const tagName = element.tagName.toLowerCase();
  const parent = element.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children).filter((el) => el.tagName === element.tagName);
    const index = siblings.indexOf(element);
    if (index !== -1) {
      const parentSelector = generateSelector(parent);
      return `${parentSelector} > ${tagName}:nth-of-type(${index + 1})`;
    }
  }
  return tagName;
}

function getFieldLabel(input: Element): string {
  const id = input.id;
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) return label.textContent?.toLowerCase().trim() || '';
  }

  const parentLabel = input.closest('label');
  if (parentLabel) return parentLabel.textContent?.toLowerCase().trim() || '';

  const ariaLabel = input.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel.toLowerCase();

  const ariaLabelledBy = input.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    if (labelElement) return labelElement.textContent?.toLowerCase().trim() || '';
  }

  const placeholder = input.getAttribute('placeholder') || '';
  const name = input.getAttribute('name') || '';
  const title = input.getAttribute('title') || '';

  return `${placeholder} ${name} ${title}`.toLowerCase().trim();
}

function matchFieldType(labelText: string): string | null {
  for (const [fieldType, patterns] of Object.entries(FIELD_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(labelText)) {
        return fieldType;
      }
    }
  }
  return null;
}

function calculateConfidence(labelText: string, fieldType: string): number {
  const patterns = FIELD_PATTERNS[fieldType];
  if (!patterns) return 0.5;

  for (const pattern of patterns) {
    if (pattern.test(labelText)) {
      const source = pattern.source.toLowerCase();
      if (source.includes('|') || source.includes('.?')) {
        return 0.7;
      }
      return 0.9;
    }
  }
  return 0.5;
}

export function detectFormFields(): DetectedField[] {
  const fields: DetectedField[] = [];
  const inputs = document.querySelectorAll(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), select, textarea'
  );

  inputs.forEach((element) => {
    const input = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

    if (!input.offsetParent && input.type !== 'file') return;

    const labelText = getFieldLabel(input);
    const fieldType = matchFieldType(labelText);

    if (fieldType || input.type === 'file') {
      const detectedType = fieldType || (input.type === 'file' ? 'resume' : 'unknown');
      fields.push({
        element: input,
        type: input.type || input.tagName.toLowerCase(),
        fieldType: detectedType,
        confidence: fieldType ? calculateConfidence(labelText, fieldType) : 0.5,
        selector: generateSelector(input),
      });
    }
  });

  return fields;
}

export function detectPlatform(): string {
  const host = window.location.hostname;

  if (host.includes('linkedin.com')) return 'linkedin';
  if (host.includes('lever.co')) return 'lever';
  if (host.includes('greenhouse.io')) return 'greenhouse';
  if (host.includes('workday.com') || host.includes('myworkdayjobs.com')) return 'workday';
  if (host.includes('indeed.com')) return 'indeed';
  if (host.includes('smartrecruiters.com')) return 'smartrecruiters';
  if (host.includes('icims.com')) return 'icims';
  if (host.includes('taleo.net')) return 'taleo';
  if (host.includes('breezy.hr')) return 'breezy';

  return 'generic';
}

export function isJobApplicationPage(): boolean {
  const url = window.location.href.toLowerCase();
  const jobKeywords = ['apply', 'application', 'career', 'job', 'position', 'candidate', 'recruit'];

  if (jobKeywords.some((keyword) => url.includes(keyword))) return true;

  const pageText = document.body.innerText.toLowerCase();
  const applicationKeywords = ['submit application', 'apply now', 'upload resume', 'cover letter'];

  return applicationKeywords.some((keyword) => pageText.includes(keyword));
}
