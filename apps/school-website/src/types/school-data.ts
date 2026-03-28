/**
 * Shape of School.data (JSON string on Appwrite school document).
 * templateFields holds template-specific admin keys (template1 … template6).
 */

export type TemplateId = 'template1' | 'template2' | 'template3' | 'template4' | 'template5' | 'template6';

export interface SchoolDataColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
}

export interface SchoolDataHero {
    headline: string;
    subheadline: string;
    /** Storage file ID or absolute URL */
    imageUrl?: string;
    imageFileId?: string;
}

export interface SchoolDataAbout {
    title?: string;
    body: string;
    /** Storage file IDs or URLs for about section images */
    imageUrls?: string[];
    imageFileIds?: string[];
}

export interface SchoolDataContact {
    address: string;
    phones: string[];
    emails: string[];
    schoolHours: string;
    social: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        youtube?: string;
        linkedin?: string;
    };
}

export interface SchoolDataJson {
    colors: SchoolDataColors;
    hero: SchoolDataHero;
    about: SchoolDataAbout;
    schoolAnthem: string;
    schoolPledge: string;
    principalsPledge: string;
    vision: string;
    mission: string;
    coreValues: string[];
    welcomeAddress: string;
    contact: SchoolDataContact;
    /** Optional keys per template for dynamic admin forms */
    templateFields?: Partial<Record<TemplateId, Record<string, unknown>>>;
}

export const DEFAULT_SCHOOL_DATA: SchoolDataJson = {
    colors: {
        primary: '#1e3a5f',
        secondary: '#c9a227',
        accent: '#e85d04',
        background: '#faf8f5',
        text: '#1a1a1a',
    },
    hero: {
        headline: 'Welcome to our school',
        subheadline: 'Excellence in education',
        imageUrl: '',
    },
    about: {
        title: 'About Us',
        body: 'Tell your school story here.',
        imageUrls: [],
    },
    schoolAnthem: '',
    schoolPledge: '',
    principalsPledge: '',
    vision: '',
    mission: '',
    coreValues: ['Integrity', 'Excellence', 'Respect'],
    welcomeAddress: '',
    contact: {
        address: '',
        phones: [],
        emails: [],
        schoolHours: 'Mon–Fri 8:00 – 15:00',
        social: {},
    },
    templateFields: {},
};

export function parseSchoolDataJson(raw: unknown): SchoolDataJson {
    let obj: Record<string, unknown> = {};
    if (typeof raw === 'string') {
        try {
            obj = JSON.parse(raw || '{}') as Record<string, unknown>;
        } catch {
            obj = {};
        }
    } else if (raw && typeof raw === 'object') {
        obj = raw as Record<string, unknown>;
    }
    return mergeDeep(DEFAULT_SCHOOL_DATA, obj) as SchoolDataJson;
}

function isPlainObject(x: unknown): x is Record<string, unknown> {
    return x !== null && typeof x === 'object' && !Array.isArray(x);
}

function mergeDeep<T extends Record<string, unknown>>(base: T, patch: Record<string, unknown>): T {
    const out = { ...base } as Record<string, unknown>;
    for (const key of Object.keys(patch)) {
        const pv = patch[key];
        const bv = out[key];
        if (isPlainObject(pv) && isPlainObject(bv as unknown)) {
            out[key] = mergeDeep(bv as Record<string, unknown>, pv);
        } else if (pv !== undefined) {
            out[key] = pv;
        }
    }
    return out as T;
}
