import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Form Detection Module', () => {
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

  describe('Name Fields', () => {
    it('should detect first name variations', () => {
      expect(matchFieldType('first name')).toBe('firstName');
      expect(matchFieldType('firstname')).toBe('firstName');
      expect(matchFieldType('First Name')).toBe('firstName');
      expect(matchFieldType('fname')).toBe('firstName');
      expect(matchFieldType('given name')).toBe('firstName');
      expect(matchFieldType('nombre')).toBe('firstName');
      expect(matchFieldType('vorname')).toBe('firstName');
      expect(matchFieldType('prenom')).toBe('firstName');
    });

    it('should detect last name variations', () => {
      expect(matchFieldType('last name')).toBe('lastName');
      expect(matchFieldType('lastname')).toBe('lastName');
      expect(matchFieldType('Last Name')).toBe('lastName');
      expect(matchFieldType('lname')).toBe('lastName');
      expect(matchFieldType('surname')).toBe('lastName');
      expect(matchFieldType('family name')).toBe('lastName');
      expect(matchFieldType('apellido')).toBe('lastName');
      expect(matchFieldType('nachname')).toBe('lastName');
    });

    it('should detect full name variations', () => {
      expect(matchFieldType('full name')).toBe('fullName');
      expect(matchFieldType('your name')).toBe('fullName');
    });
  });

  describe('Contact Fields', () => {
    it('should detect email variations', () => {
      expect(matchFieldType('email')).toBe('email');
      expect(matchFieldType('Email Address')).toBe('email');
      expect(matchFieldType('e-mail')).toBe('email');
      expect(matchFieldType('correo')).toBe('email');
      expect(matchFieldType('courriel')).toBe('email');
    });

    it('should detect phone variations', () => {
      expect(matchFieldType('phone')).toBe('phone');
      expect(matchFieldType('Phone Number')).toBe('phone');
      expect(matchFieldType('mobile')).toBe('phone');
      expect(matchFieldType('tel')).toBe('phone');
      expect(matchFieldType('cell')).toBe('phone');
      expect(matchFieldType('teléfono')).toBe('phone');
    });
  });

  describe('Address Fields', () => {
    it('should detect address variations', () => {
      expect(matchFieldType('address')).toBe('address');
      expect(matchFieldType('Street Address')).toBe('address');
      expect(matchFieldType('street')).toBe('address');
      expect(matchFieldType('dirección')).toBe('address');
    });

    it('should detect city variations', () => {
      expect(matchFieldType('city')).toBe('city');
      expect(matchFieldType('City')).toBe('city');
      expect(matchFieldType('ciudad')).toBe('city');
      expect(matchFieldType('ville')).toBe('city');
      expect(matchFieldType('stadt')).toBe('city');
    });

    it('should detect state/province variations', () => {
      expect(matchFieldType('state')).toBe('state');
      expect(matchFieldType('State/Province')).toBe('state');
      expect(matchFieldType('province')).toBe('state');
      expect(matchFieldType('estado')).toBe('state');
    });

    it('should detect zip/postal code variations', () => {
      expect(matchFieldType('zip')).toBe('zipCode');
      expect(matchFieldType('Zip Code')).toBe('zipCode');
      expect(matchFieldType('postal')).toBe('zipCode');
      expect(matchFieldType('Postal Code')).toBe('zipCode');
      expect(matchFieldType('postleitzahl')).toBe('zipCode');
    });

    it('should detect country variations', () => {
      expect(matchFieldType('country')).toBe('country');
      expect(matchFieldType('Country')).toBe('country');
      expect(matchFieldType('país')).toBe('country');
      expect(matchFieldType('pays')).toBe('country');
    });
  });

  describe('URL Fields', () => {
    it('should detect LinkedIn URL', () => {
      expect(matchFieldType('linkedin')).toBe('linkedinUrl');
      expect(matchFieldType('LinkedIn Profile')).toBe('linkedinUrl');
      expect(matchFieldType('LinkedIn URL')).toBe('linkedinUrl');
    });

    it('should detect portfolio/website URL', () => {
      expect(matchFieldType('portfolio')).toBe('portfolioUrl');
      expect(matchFieldType('Portfolio URL')).toBe('portfolioUrl');
      expect(matchFieldType('website')).toBe('portfolioUrl');
      expect(matchFieldType('personal site')).toBe('portfolioUrl');
    });

    it('should detect GitHub URL', () => {
      expect(matchFieldType('github')).toBe('githubUrl');
      expect(matchFieldType('GitHub Profile')).toBe('githubUrl');
    });
  });

  describe('Document Fields', () => {
    it('should detect resume variations', () => {
      expect(matchFieldType('resume')).toBe('resume');
      expect(matchFieldType('Resume')).toBe('resume');
      expect(matchFieldType('cv')).toBe('resume');
      expect(matchFieldType('CV')).toBe('resume');
      expect(matchFieldType('curriculum')).toBe('resume');
      expect(matchFieldType('lebenslauf')).toBe('resume');
    });

    it('should detect cover letter variations', () => {
      expect(matchFieldType('cover letter')).toBe('coverLetter');
      expect(matchFieldType('Cover Letter')).toBe('coverLetter');
      expect(matchFieldType('coverletter')).toBe('coverLetter');
      expect(matchFieldType('anschreiben')).toBe('coverLetter');
    });
  });

  describe('Experience Fields', () => {
    it('should detect years of experience', () => {
      expect(matchFieldType('years of experience')).toBe('yearsExperience');
      expect(matchFieldType('Years Experience')).toBe('yearsExperience');
      expect(matchFieldType('experience years')).toBe('yearsExperience');
    });

    it('should detect job title', () => {
      expect(matchFieldType('current title')).toBe('currentTitle');
      expect(matchFieldType('job title')).toBe('currentTitle');
      expect(matchFieldType('position')).toBe('currentTitle');
    });

    it('should detect company name', () => {
      expect(matchFieldType('current company')).toBe('currentCompany');
      expect(matchFieldType('current employer')).toBe('currentCompany');
    });

    it('should detect salary', () => {
      expect(matchFieldType('salary')).toBe('salary');
      expect(matchFieldType('Expected Salary')).toBe('salary');
      expect(matchFieldType('compensation')).toBe('salary');
      expect(matchFieldType('pay')).toBe('salary');
    });
  });

  describe('Work Authorization Fields', () => {
    it('should detect work authorization', () => {
      expect(matchFieldType('authorized to work')).toBe('authorizedToWork');
      expect(matchFieldType('legally work')).toBe('authorizedToWork');
      expect(matchFieldType('work authorization')).toBe('authorizedToWork');
    });

    it('should detect sponsorship requirement', () => {
      expect(matchFieldType('sponsorship')).toBe('requiresSponsorship');
      expect(matchFieldType('Require Sponsorship')).toBe('requiresSponsorship');
      expect(matchFieldType('visa')).toBe('requiresSponsorship');
    });

    it('should detect start date', () => {
      expect(matchFieldType('start date')).toBe('startDate');
      expect(matchFieldType('available')).toBe('startDate');
      expect(matchFieldType('when can you start')).toBe('startDate');
    });
  });

  describe('EEO Fields', () => {
    it('should detect gender', () => {
      expect(matchFieldType('gender')).toBe('gender');
      expect(matchFieldType('Gender')).toBe('gender');
      expect(matchFieldType('sex')).toBe('gender');
    });

    it('should detect race/ethnicity', () => {
      expect(matchFieldType('race')).toBe('race');
      expect(matchFieldType('raza')).toBe('race');
    });

    it('should detect veteran status', () => {
      expect(matchFieldType('veteran')).toBe('veteranStatus');
      expect(matchFieldType('Veteran Status')).toBe('veteranStatus');
      expect(matchFieldType('military')).toBe('veteranStatus');
    });

    it('should detect disability status', () => {
      expect(matchFieldType('disability')).toBe('disabilityStatus');
      expect(matchFieldType('Disability Status')).toBe('disabilityStatus');
      expect(matchFieldType('disabled')).toBe('disabilityStatus');
    });
  });

  describe('No Match Cases', () => {
    it('should return null for unrecognized fields', () => {
      expect(matchFieldType('random field')).toBeNull();
      expect(matchFieldType('favorite color')).toBeNull();
      expect(matchFieldType('hobbies')).toBeNull();
      expect(matchFieldType('xyz123')).toBeNull();
    });
  });

  describe('Platform Detection', () => {
    const platforms = [
      { host: 'linkedin.com', expected: 'linkedin' },
      { host: 'jobs.lever.co', expected: 'lever' },
      { host: 'boards.greenhouse.io', expected: 'greenhouse' },
      { host: 'company.myworkdayjobs.com', expected: 'workday' },
      { host: 'indeed.com', expected: 'indeed' },
      { host: 'jobs.smartrecruiters.com', expected: 'smartrecruiters' },
      { host: 'careers.icims.com', expected: 'icims' },
      { host: 'company.taleo.net', expected: 'taleo' },
      { host: 'app.breezy.hr', expected: 'breezy' },
      { host: 'random-company.com', expected: 'generic' },
    ];

    function detectPlatform(host: string): string {
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

    platforms.forEach(({ host, expected }) => {
      it(`should detect ${expected} platform from ${host}`, () => {
        expect(detectPlatform(host)).toBe(expected);
      });
    });
  });

  describe('Job Application Page Detection', () => {
    const jobUrls = [
      'https://company.com/apply',
      'https://company.com/application',
      'https://company.com/careers',
      'https://company.com/jobs/123',
      'https://company.com/position/software-engineer',
      'https://company.com/candidate/new',
      'https://company.com/recruit/apply',
    ];

    const nonJobUrls = [
      'https://company.com/about',
      'https://company.com/products',
      'https://company.com/blog',
      'https://company.com/contact',
    ];

    function isJobUrl(url: string): boolean {
      const lowerUrl = url.toLowerCase();
      const jobKeywords = ['apply', 'application', 'career', 'job', 'position', 'candidate', 'recruit'];
      return jobKeywords.some((keyword) => lowerUrl.includes(keyword));
    }

    jobUrls.forEach((url) => {
      it(`should detect ${url} as job application URL`, () => {
        expect(isJobUrl(url)).toBe(true);
      });
    });

    nonJobUrls.forEach((url) => {
      it(`should NOT detect ${url} as job application URL`, () => {
        expect(isJobUrl(url)).toBe(false);
      });
    });
  });
});
