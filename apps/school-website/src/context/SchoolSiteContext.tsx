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
    getSystemConfig,
    listAcademicSessions,
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
    template7: { display: 'ui-sans-serif, system-ui, sans-serif', body: 'ui-sans-serif, system-ui, sans-serif' },
    template8: { display: '"Quicksand", sans-serif', body: '"Quicksand", sans-serif' },
    template9: { display: '"Montserrat", sans-serif', body: '"Open Sans", sans-serif' },
    template10: { display: '"Playfair Display", serif', body: '"Nunito", sans-serif' },
};

const PLACEHOLDER_1 = 'https://res.cloudinary.com/dlvffw5wt/image/upload/v1774778057/emmanuel-ikwuegbu-VC6MGt9ZoBA-unsplash_lz8ghr.jpg';
const PLACEHOLDER_2 = 'https://res.cloudinary.com/dlvffw5wt/image/upload/v1774778053/ben-white-83tkHLPgg2Q-unsplash_vj2fjt.jpg';
const PLACEHOLDER_3 = 'https://res.cloudinary.com/dlvffw5wt/image/upload/v1774778053/topsphere-media-oOHBxlGADx4-unsplash_hsnsik.jpg';
const DEFAULT_LOGO = 'https://res.cloudinary.com/dlvffw5wt/image/upload/v1773427661/square-image_butlfh.jpg';

function applyTheme(data: SchoolDataJson, templateId: string) {
    const root = document.documentElement;
    const c = data.colors;
    root.style.setProperty('--school-primary', c.primary);
    root.style.setProperty('--school-secondary', c.secondary);
    root.style.setProperty('--school-accent', c.accent);
    root.style.setProperty('--school-background', c.background);
    root.style.setProperty('--school-text', c.text);
    
    // Additional colors if provided
    if (c.card) root.style.setProperty('--school-card', c.card);
    if (c.border) root.style.setProperty('--school-border', c.border);
    if (c.button) root.style.setProperty('--school-button', c.button);
    if (c.buttonText) root.style.setProperty('--school-button-text', c.buttonText);
    if (c.navBackground) root.style.setProperty('--school-nav-bg', c.navBackground);
    if (c.navText) root.style.setProperty('--school-nav-text', c.navText);
    if (c.footerBackground) root.style.setProperty('--school-footer-bg', c.footerBackground);
    if (c.footerText) root.style.setProperty('--school-footer-text', c.footerText);

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
    sessions: Models.Document[];
    systemConfig: Models.Document | null;
    assets: {
        logo: string;
        placeholders: string[];
    };
    refresh: () => Promise<void>;
}

const SchoolSiteContext = createContext<SchoolSiteState | null>(null);

function normalizeTemplateId(raw: unknown): TemplateId {
    const s = String(raw || 'template1').toLowerCase();
    const allowed: TemplateId[] = [
        'template1', 'template2', 'template3', 'template4', 'template5', 
        'template6', 'template7', 'template8', 'template9', 'template10'
    ];
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
    const [sessions, setSessions] = useState<Models.Document[]>([]);
    const [systemConfig, setSystemConfig] = useState<Models.Document | null>(null);

    const templateId = useMemo(() => {
        const rawTid = (school as any)?.templateId;
        return normalizeTemplateId(rawTid);
    }, [school]);

    const assets = useMemo(() => {
        let logo = (school as any)?.logo || '';
        if (!logo || logo === '') logo = DEFAULT_LOGO;
        return {
            logo,
            placeholders: [PLACEHOLDER_1, PLACEHOLDER_2, PLACEHOLDER_3]
        };
    }, [school]);

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
            
            // 1. Parse data first
            const parsed = parseSchoolDataJson(doc.data);
            
            // 2. Apply default images to the parsed object if missing
            if (!parsed.hero.imageUrl) {
                parsed.hero.imageUrl = PLACEHOLDER_1;
            }
            if (!parsed.about.imageUrls || parsed.about.imageUrls.length === 0) {
                parsed.about.imageUrls = [PLACEHOLDER_2, PLACEHOLDER_3];
            }

            // 3. Enrich school document
            const enrichedSchool = {
                ...doc,
                logo: doc.logo || DEFAULT_LOGO
            };

            // 4. Update states
            setSchool(enrichedSchool as any);
            setData(parsed);
            
            const tid = normalizeTemplateId((doc as any).templateId);
            applyTheme(parsed, tid);

            const schoolId = doc.$id;
            const [ev, nw, gal, test, acc, part, sess, sys] = await Promise.all([
                listSchoolEvents(schoolId, 12),
                listSchoolNews(schoolId, 12),
                listSchoolGalleryImages(schoolId, 24),
                listSchoolTestimonials(schoolId, 20),
                listSchoolAccreditations(schoolId, 'accreditation', 40),
                listSchoolAccreditations(schoolId, 'partnership', 40),
                listAcademicSessions(schoolId),
                getSystemConfig(),
            ]);
            setEvents(ev.documents);
            setNews(nw.documents);
            setGallery(gal.documents);
            setTestimonials(test.documents);
            setAccreditations(acc.documents);
            setPartnerships(part.documents);
            setSessions(sess.documents);
            setSystemConfig(sys);
        } catch (e) {
            console.error('Error loading school:', e);
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
            sessions,
            systemConfig,
            assets,
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
            sessions,
            systemConfig,
            assets,
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
