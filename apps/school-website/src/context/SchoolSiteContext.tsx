import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Models } from 'appwrite';
import { parseSchoolDataJson, type SchoolDataJson, type TemplateId } from '@/types/school-data';
import {
    getSchoolByWebsiteSlug,
    listSchoolAccreditations,
    listSchoolEvents,
    listSchoolGalleryImages,
    listSchoolNews,
    listSchoolTestimonials,
} from '@/lib/api';

const FONT_PRESETS: Record<
    string,
    { display: string; body: string }
> = {
    template1: { display: '"Georgia", "Times New Roman", serif', body: 'ui-sans-serif, system-ui, sans-serif' },
    template2: { display: '"DM Sans", ui-sans-serif, sans-serif', body: '"DM Sans", ui-sans-serif, sans-serif' },
    template3: { display: '"Playfair Display", Georgia, serif', body: '"Source Sans 3", system-ui, sans-serif' },
    template4: { display: '"Space Grotesk", system-ui, sans-serif', body: '"Inter", system-ui, sans-serif' },
    template5: { display: '"Merriweather", Georgia, serif', body: '"Lato", system-ui, sans-serif' },
    template6: { display: '"Archivo Black", system-ui, sans-serif', body: '"IBM Plex Sans", system-ui, sans-serif' },
};

function applyTheme(data: SchoolDataJson, templateId: string) {
    const root = document.documentElement;
    const c = data.colors;
    root.style.setProperty('--school-primary', c.primary);
    root.style.setProperty('--school-secondary', c.secondary);
    root.style.setProperty('--school-accent', c.accent);
    root.style.setProperty('--school-background', c.background);
    root.style.setProperty('--school-text', c.text);
    const fonts = FONT_PRESETS[templateId] || FONT_PRESETS.template1;
    root.style.setProperty('--school-font-display', fonts.display);
    root.style.setProperty('--school-font-body', fonts.body);
}

export interface SchoolSiteState {
    slug: string;
    school: Models.Document | null;
    data: SchoolDataJson;
    templateId: TemplateId;
    loading: boolean;
    error: string | null;
    events: Models.Document[];
    news: Models.Document[];
    gallery: Models.Document[];
    testimonials: Models.Document[];
    accreditations: Models.Document[];
    partnerships: Models.Document[];
    refresh: () => Promise<void>;
}

const SchoolSiteContext = createContext<SchoolSiteState | null>(null);

function normalizeTemplateId(raw: unknown): TemplateId {
    const s = String(raw || 'template1').toLowerCase();
    const allowed: TemplateId[] = ['template1', 'template2', 'template3', 'template4', 'template5', 'template6'];
    return (allowed.includes(s as TemplateId) ? s : 'template1') as TemplateId;
}

export function SchoolSiteProvider({ slug, children }: { slug: string; children: ReactNode }) {
    const [school, setSchool] = useState<Models.Document | null>(null);
    const [data, setData] = useState<SchoolDataJson>(() => parseSchoolDataJson({}));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [events, setEvents] = useState<Models.Document[]>([]);
    const [news, setNews] = useState<Models.Document[]>([]);
    const [gallery, setGallery] = useState<Models.Document[]>([]);
    const [testimonials, setTestimonials] = useState<Models.Document[]>([]);
    const [accreditations, setAccreditations] = useState<Models.Document[]>([]);
    const [partnerships, setPartnerships] = useState<Models.Document[]>([]);

    const templateId = useMemo(() => normalizeTemplateId(school?.templateId), [school?.templateId]);

    const load = useCallback(async () => {
        if (!slug) return;
        setLoading(true);
        setError(null);
        try {
            const doc = await getSchoolByWebsiteSlug(slug);
            if (!doc) {
                setSchool(null);
                setError('School not found for this address.');
                return;
            }
            setSchool(doc);
            const parsed = parseSchoolDataJson(doc.data);
            setData(parsed);
            const tid = normalizeTemplateId(doc.templateId);
            applyTheme(parsed, tid);

            const schoolId = doc.$id;
            const [ev, nw, gal, test, acc, part] = await Promise.all([
                listSchoolEvents(schoolId, 12),
                listSchoolNews(schoolId, 12),
                listSchoolGalleryImages(schoolId, 24),
                listSchoolTestimonials(schoolId, 20),
                listSchoolAccreditations(schoolId, 'accreditation', 40),
                listSchoolAccreditations(schoolId, 'partnership', 40),
            ]);
            setEvents(ev.documents);
            setNews(nw.documents);
            setGallery(gal.documents);
            setTestimonials(test.documents);
            setAccreditations(acc.documents);
            setPartnerships(part.documents);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load school.');
            setSchool(null);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        void load();
    }, [load]);

    const value = useMemo<SchoolSiteState>(
        () => ({
            slug,
            school,
            data,
            templateId,
            loading,
            error,
            events,
            news,
            gallery,
            testimonials,
            accreditations,
            partnerships,
            refresh: load,
        }),
        [
            slug,
            school,
            data,
            templateId,
            loading,
            error,
            events,
            news,
            gallery,
            testimonials,
            accreditations,
            partnerships,
            load,
        ],
    );

    return <SchoolSiteContext.Provider value={value}>{children}</SchoolSiteContext.Provider>;
}

export function useSchoolSite(): SchoolSiteState {
    const ctx = useContext(SchoolSiteContext);
    if (!ctx) throw new Error('useSchoolSite must be used within SchoolSiteProvider');
    return ctx;
}
