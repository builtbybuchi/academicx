import React, { useCallback, useEffect, useState } from 'react';
import { Globe, MessageSquare, Save, Sparkles, ExternalLink } from 'lucide-react';
import LiquidGlassPanel from '../shared/components/LiquidGlassPanel.jsx';
import FormField from '../shared/components/FormField.jsx';
import { useToast } from '../shared/components/Toast.jsx';
import { useAuth } from '../shared/utils/auth.jsx';
import {
    getSchool,
    updateSchool,
    uploadImage,
    getSchoolMediaPreviewUrl,
    listContactMessages,
    updateContactMessage,
    createSchoolEvent,
    createSchoolNews,
    createTestimonial,
    createAccreditation,
} from '../shared/utils/api.js';

const PLACEHOLDER_1 = 'https://res.cloudinary.com/dlvffw5wt/image/upload/v1774778057/emmanuel-ikwuegbu-VC6MGt9ZoBA-unsplash_lz8ghr.jpg';
const PLACEHOLDER_2 = 'https://res.cloudinary.com/dlvffw5wt/image/upload/v1774778053/ben-white-83tkHLPgg2Q-unsplash_vj2fjt.jpg';
const PLACEHOLDER_3 = 'https://res.cloudinary.com/dlvffw5wt/image/upload/v1774778053/topsphere-media-oOHBxlGADx4-unsplash_hsnsik.jpg';
const DEFAULT_LOGO = 'https://res.cloudinary.com/dlvffw5wt/image/upload/v1773427661/square-image_butlfh.jpg';

function defaultData() {
    return {
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
            imageUrl: PLACEHOLDER_1,
            imageFileId: '',
        },
        about: {
            title: 'About Us',
            body: 'Tell your school story here.',
            imageUrls: [PLACEHOLDER_2, PLACEHOLDER_3],
            imageFileIds: [],
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
            social: { facebook: '', twitter: '', instagram: '', youtube: '', linkedin: '' },
        },
        templateFields: {},
    };
}

function parseData(raw) {
    const d = defaultData();
    let o = {};
    try {
        o = typeof raw === 'string' ? JSON.parse(raw || '{}') : raw || {};
    } catch {
        o = {};
    }
    return {
        colors: { ...d.colors, ...(o.colors || {}) },
        hero: { 
            ...d.hero, 
            ...(o.hero || {}),
            imageUrl: o.hero?.imageUrl || d.hero.imageUrl 
        },
        about: {
            ...d.about,
            ...(o.about || {}),
            imageUrls: Array.isArray(o.about?.imageUrls) && o.about.imageUrls.length ? o.about.imageUrls : d.about.imageUrls,
            imageFileIds: Array.isArray(o.about?.imageFileIds) ? o.about.imageFileIds : d.about.imageFileIds,
        },
        schoolAnthem: o.schoolAnthem ?? d.schoolAnthem,
        schoolPledge: o.schoolPledge ?? d.schoolPledge,
        principalsPledge: o.principalsPledge ?? d.principalsPledge,
        vision: o.vision ?? d.vision,
        mission: o.mission ?? d.mission,
        coreValues: Array.isArray(o.coreValues) && o.coreValues.length ? o.coreValues : d.coreValues,
        welcomeAddress: o.welcomeAddress ?? d.welcomeAddress,
        contact: {
            ...d.contact,
            ...(o.contact || {}),
            phones: Array.isArray(o.contact?.phones) ? o.contact.phones : d.contact.phones,
            emails: Array.isArray(o.contact?.emails) ? o.contact.emails : d.contact.emails,
            social: { ...d.contact.social, ...(o.contact?.social || {}) },
        },
        templateFields: o.templateFields && typeof o.templateFields === 'object' ? o.templateFields : {},
    };
}

const TEMPLATES = [
    { id: 'template1', label: 'Classic', hint: 'Stacked, serif hero' },
    { id: 'template2', label: 'Split', hint: 'News + split hero' },
    { id: 'template3', label: 'Magazine', hint: 'Wide hero, asymmetric' },
    { id: 'template4', label: 'Geometric', hint: 'Bold angles' },
    { id: 'template5', label: 'Editorial', hint: 'Serif, airy' },
    { id: 'template6', label: 'Poster', hint: 'High-contrast borders' },
    { id: 'template7', label: 'Minimal', hint: 'Modern & clean' },
    { id: 'template8', label: 'Vibrant', hint: 'Playful community' },
    { id: 'template9', label: 'Corporate', hint: 'Professional' },
    { id: 'template10', label: 'Nature', hint: 'Serene & earthy' },
];

export default function Website() {
    const { schoolId } = useAuth();
    const toast = useToast();
    const [tab, setTab] = useState('appearance');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [seeding, setSeeding] = useState(false);

    const [websiteSlug, setWebsiteSlug] = useState('');
    const [templateId, setTemplateId] = useState('template1');
    /** Stored on school document: file ID or external URL string */
    const [logoStorage, setLogoStorage] = useState('');
    const [logoPreview, setLogoPreview] = useState('');
    const [data, setData] = useState(() => defaultData());

    const [messages, setMessages] = useState([]);
    const [msgLoading, setMsgLoading] = useState(false);

    const loadSchool = useCallback(async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            const school = await getSchool(schoolId);
            setWebsiteSlug((school.websiteSlug || '').toLowerCase());
            setTemplateId(school.templateId || 'template1');
            const logo = school.logo || '';
            if (logo.startsWith('http')) {
                setLogoStorage(logo);
                setLogoPreview(logo);
            } else if (logo) {
                setLogoStorage(logo);
                setLogoPreview(getSchoolMediaPreviewUrl(logo, 200, 200));
            } else {
                setLogoStorage(DEFAULT_LOGO);
                setLogoPreview(DEFAULT_LOGO);
            }
            setData(parseData(school.data));
        } catch (e) {
            toast({ type: 'error', title: 'Load failed', message: e.message });
        } finally {
            setLoading(false);
        }
    }, [schoolId, toast]);

    useEffect(() => {
        loadSchool();
    }, [loadSchool]);

    const loadMessages = useCallback(async () => {
        if (!schoolId) return;
        setMsgLoading(true);
        try {
            const res = await listContactMessages(schoolId);
            setMessages(res.documents);
        } catch (e) {
            toast({ type: 'error', title: 'Messages', message: e.message });
        } finally {
            setMsgLoading(false);
        }
    }, [schoolId, toast]);

    useEffect(() => {
        if (tab === 'messages' && schoolId) loadMessages();
    }, [tab, schoolId, loadMessages]);

    const patch = (path, value) => {
        setData((prev) => {
            if (path === 'colors') return { ...prev, colors: { ...prev.colors, ...value } };
            if (path === 'hero') return { ...prev, hero: { ...prev.hero, ...value } };
            if (path === 'about') return { ...prev, about: { ...prev.about, ...value } };
            if (path === 'contact') return { ...prev, contact: { ...prev.contact, ...value } };
            if (path === 'social') return { ...prev, contact: { ...prev.contact, social: { ...prev.contact.social, ...value } } };
            return { ...prev, [path]: value };
        });
    };

    async function handleSave() {
        if (!schoolId) return;
        setSaving(true);
        try {
            const slug = String(websiteSlug || '').trim().toLowerCase();
            await updateSchool(schoolId, {
                websiteSlug: slug,
                templateId,
                logo: logoStorage,
                data: JSON.stringify(data),
            });
            toast({ type: 'success', title: 'Saved', message: 'School website settings were updated.' });
        } catch (e) {
            toast({ type: 'error', title: 'Save failed', message: e.message });
        } finally {
            setSaving(false);
        }
    }

    async function handleLogoUpload(e) {
        const file = e.target.files?.[0];
        if (!file || !schoolId) return;
        try {
            const uploaded = await uploadImage(file);
            setLogoStorage(uploaded.$id);
            setLogoPreview(getSchoolMediaPreviewUrl(uploaded.$id, 400, 400));
            await updateSchool(schoolId, { logo: uploaded.$id });
            toast({ type: 'success', title: 'Logo uploaded', message: 'Logo file saved to storage.' });
        } catch (err) {
            toast({ type: 'error', title: 'Upload failed', message: err.message });
        }
    }

    async function handleHeroUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const uploaded = await uploadImage(file);
            patch('hero', { imageFileId: uploaded.$id, imageUrl: '' });
            toast({ type: 'success', title: 'Hero image', message: 'Set in page data — click Save to persist.' });
        } catch (err) {
            toast({ type: 'error', title: 'Upload failed', message: err.message });
        }
    }

    async function seedDemoContent() {
        if (!schoolId) return;
        setSeeding(true);
        try {
            await createSchoolEvent(schoolId, {
                title: 'Open Day',
                date: new Date().toISOString().slice(0, 10),
                description: 'Visit our campus and meet teachers.',
                summary: 'Annual open day for prospective families.',
            });
            await createSchoolEvent(schoolId, {
                title: 'Sports Week',
                date: new Date().toISOString().slice(0, 10),
                description: 'Inter-house athletics and team events.',
                summary: 'Sports week across all year groups.',
            });
            await createSchoolNews(schoolId, {
                title: 'Welcome to the new term',
                summary: 'We are excited to welcome students back.',
                body: 'Full details of orientation and schedules will be shared via email.',
            });
            await createSchoolNews(schoolId, {
                title: 'Parent forum',
                summary: 'Join us for the quarterly parent forum.',
                body: 'Date and venue will be announced shortly.',
            });
            await createTestimonial(schoolId, {
                name: 'Parent Name',
                role: 'Parent',
                message: 'We are grateful for the supportive environment and dedicated staff.',
                sortOrder: 0,
            });
            await createAccreditation(schoolId, {
                name: 'Ministry of Education',
                type: 'accreditation',
                sortOrder: 0,
            });
            await createAccreditation(schoolId, {
                name: 'Community Partner',
                type: 'partnership',
                sortOrder: 0,
            });
            toast({ type: 'success', title: 'Sample content added', message: 'Events, news, testimonial, and accreditations were created.' });
        } catch (e) {
            toast({ type: 'error', title: 'Seed failed', message: e.message });
        } finally {
            setSeeding(false);
        }
    }

    async function markRead(msg) {
        try {
            await updateContactMessage(msg.$id, { status: 'read', readAt: new Date().toISOString() });
            setMessages((prev) => prev.map((m) => (m.$id === msg.$id ? { ...m, status: 'read' } : m)));
        } catch (e) {
            toast({ type: 'error', title: 'Update failed', message: e.message });
        }
    }

    if (!schoolId) {
        return <div style={{ padding: 24 }}>No school context.</div>;
    }

    if (loading) {
        return <div style={{ padding: 24 }}>Loading website settings…</div>;
    }

    const slugHint = websiteSlug || 'your-slug';
    const previewPath = `${typeof window !== 'undefined' ? window.location.origin : ''}`.replace(/\/$/, '');

    return (
        <div style={{ padding: '24px 24px 80px', maxWidth: 960, margin: '0 auto' }}>
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Globe size={28} />
                <h1 style={{ margin: 0, fontSize: 28 }}>School website</h1>
            </div>
            <p style={{ opacity: 0.85, marginBottom: 24, maxWidth: 720 }}>
                Configure the public school site (Vite app): subdomain slug, template, colours, and page copy. Save, then open the school website
                with the same slug or <code style={{ background: 'rgba(0,0,0,0.08)', padding: '2px 6px', borderRadius: 4 }}>/site/{'{slug}'}</code>.
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                <button
                    type="button"
                    className={`btn ${tab === 'appearance' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTab('appearance')}
                >
                    <Sparkles size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Appearance
                </button>
                <button
                    type="button"
                    className={`btn ${tab === 'content' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTab('content')}
                >
                    <Sparkles size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Content
                </button>
                <button
                    type="button"
                    className={`btn ${tab === 'contact' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTab('contact')}
                >
                    <Globe size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Contact & Social
                </button>
                <button
                    type="button"
                    className={`btn ${tab === 'messages' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTab('messages')}
                >
                    <MessageSquare size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Messages
                </button>
                <button
                    type="button"
                    className={`btn ${tab === 'tools' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTab('tools')}
                >
                    <Sparkles size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Tools
                </button>
            </div>

            {tab === 'appearance' && (
                <>
                    <LiquidGlassPanel title="Public URL & Preview" style={{ marginBottom: 20 }}>
                        <FormField
                            label="Website slug (subdomain)"
                            placeholder="e.g. demo"
                            value={websiteSlug}
                            onChange={(v) => setWebsiteSlug(String(v).toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        />
                        <p style={{ fontSize: 13, opacity: 0.8, marginTop: -8 }}>
                            Public URL: <code>{slugHint}.buchis.site</code>. Or test with{' '}
                            <code>/site/{slugHint}</code>.
                        </p>
                        <div style={{ marginTop: 16 }}>
                            <a
                                className="btn btn-secondary btn-sm"
                                href={`https://${slugHint}.buchis.site`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                                Open website
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    </LiquidGlassPanel>

                    <LiquidGlassPanel title="Visual Template" style={{ marginBottom: 20 }}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                gap: 12,
                            }}
                        >
                            {TEMPLATES.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setTemplateId(t.id)}
                                    style={{
                                        padding: 16,
                                        borderRadius: 16,
                                        border: templateId === t.id ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                                        background: templateId === t.id ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <div style={{ fontWeight: 800, fontSize: 15 }}>{t.label}</div>
                                    <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>{t.hint}</div>
                                </button>
                            ))}
                        </div>
                    </LiquidGlassPanel>

                    <LiquidGlassPanel title="Brand Identity" style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" style={{ height: 64, width: 64, objectFit: 'contain' }} />
                                ) : (
                                    <div style={{ height: 64, width: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>No Logo</div>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>School Logo</h4>
                                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                                    Upload new logo
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                                </label>
                            </div>
                        </div>
                        
                        <h4 style={{ margin: '0 0 16px 0', fontSize: 14 }}>Theme Colors</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                            {['primary', 'secondary', 'accent', 'background', 'text'].map((key) => (
                                <div key={key}>
                                    <label className="input-label" style={{ textTransform: 'capitalize', fontSize: 12, marginBottom: 6 }}>
                                        {key}
                                    </label>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <div style={{ position: 'relative', width: 44, height: 36, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                                            <input
                                                type="color"
                                                value={data.colors[key] || '#000000'}
                                                onChange={(e) => patch('colors', { [key]: e.target.value })}
                                                style={{ position: 'absolute', top: -5, left: -5, width: 60, height: 50, cursor: 'pointer', border: 'none' }}
                                            />
                                        </div>
                                        <input
                                            className="input"
                                            value={data.colors[key] || ''}
                                            onChange={(e) => patch('colors', { [key]: e.target.value })}
                                            style={{ flex: 1, fontSize: 13, height: 36 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </LiquidGlassPanel>
                </>
            )}

            {tab === 'content' && (
                <>
                    <LiquidGlassPanel title="Hero Section" style={{ marginBottom: 20 }}>
                        <FormField label="Main Headline" value={data.hero.headline} onChange={(v) => patch('hero', { headline: v })} />
                        <FormField label="Subheadline / Description" value={data.hero.subheadline} onChange={(v) => patch('hero', { subheadline: v })} />
                        <div style={{ marginTop: 16, display: 'flex', gap: 16, alignItems: 'start' }}>
                            <div style={{ flex: 1 }}>
                                <FormField
                                    label="Hero Image URL"
                                    placeholder="External URL"
                                    value={data.hero.imageUrl || ''}
                                    onChange={(v) => patch('hero', { imageUrl: v, imageFileId: '' })}
                                />
                            </div>
                            <div style={{ width: 120 }}>
                                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', width: '100%', marginTop: 28 }}>
                                    Upload
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleHeroUpload} />
                                </label>
                            </div>
                        </div>
                    </LiquidGlassPanel>

                    <LiquidGlassPanel title="About Us" style={{ marginBottom: 20 }}>
                        <FormField label="Section Title" value={data.about.title || ''} onChange={(v) => patch('about', { title: v })} />
                        <FormField
                            label="About Story / Body"
                            type="textarea"
                            rows={8}
                            value={data.about.body || ''}
                            onChange={(v) => patch('about', { body: v })}
                        />
                    </LiquidGlassPanel>

                    <LiquidGlassPanel title="Institutional Identity" style={{ marginBottom: 20 }}>
                        <div style={{ display: 'grid', mdGridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <FormField
                                label="School Anthem"
                                type="textarea"
                                rows={5}
                                value={data.schoolAnthem}
                                onChange={(v) => patch('schoolAnthem', v)}
                            />
                            <FormField
                                label="School Pledge"
                                type="textarea"
                                rows={5}
                                value={data.schoolPledge}
                                onChange={(v) => patch('schoolPledge', v)}
                            />
                        </div>
                        <FormField
                            label="Principal’s Personal Pledge"
                            type="textarea"
                            rows={3}
                            value={data.principalsPledge}
                            onChange={(v) => patch('principalsPledge', v)}
                        />
                        <div style={{ display: 'grid', mdGridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
                            <FormField label="Vision Statement" type="textarea" rows={4} value={data.vision} onChange={(v) => patch('vision', v)} />
                            <FormField label="Mission Statement" type="textarea" rows={4} value={data.mission} onChange={(v) => patch('mission', v)} />
                        </div>
                        <FormField
                            label="Core Values (one per line)"
                            type="textarea"
                            rows={5}
                            value={(data.coreValues || []).join('\n')}
                            onChange={(v) =>
                                patch(
                                    'coreValues',
                                    String(v)
                                        .split('\n')
                                        .map((s) => s.trim())
                                        .filter(Boolean),
                                )
                            }
                        />
                        <FormField
                            label="Principal's Welcome Address"
                            type="textarea"
                            rows={8}
                            value={data.welcomeAddress}
                            onChange={(v) => patch('welcomeAddress', v)}
                        />
                    </LiquidGlassPanel>
                </>
            )}

            {tab === 'contact' && (
                <LiquidGlassPanel title="Contact Information & Socials">
                    <FormField
                        label="Physical Address"
                        type="textarea"
                        rows={3}
                        value={data.contact.address || ''}
                        onChange={(v) => patch('contact', { address: v })}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <FormField
                            label="Phone Numbers (one per line)"
                            type="textarea"
                            rows={4}
                            value={(data.contact.phones || []).join('\n')}
                            onChange={(v) =>
                                patch('contact', {
                                    phones: String(v)
                                        .split('\n')
                                        .map((s) => s.trim())
                                        .filter(Boolean),
                                })
                            }
                        />
                        <FormField
                            label="Email Addresses (one per line)"
                            type="textarea"
                            rows={4}
                            value={(data.contact.emails || []).join('\n')}
                            onChange={(v) =>
                                patch('contact', {
                                    emails: String(v)
                                        .split('\n')
                                        .map((s) => s.trim())
                                        .filter(Boolean),
                                })
                            }
                        />
                    </div>
                    <FormField
                        label="School Operating Hours"
                        placeholder="e.g. Mon–Fri 8:00 – 16:00"
                        value={data.contact.schoolHours || ''}
                        onChange={(v) => patch('contact', { schoolHours: v })}
                    />
                    
                    <h4 style={{ margin: '24px 0 16px 0', fontSize: 16, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>Social Media Links</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <FormField
                            label="Facebook"
                            value={data.contact.social?.facebook || ''}
                            onChange={(v) => patch('social', { facebook: v })}
                        />
                        <FormField
                            label="Instagram"
                            value={data.contact.social?.instagram || ''}
                            onChange={(v) => patch('social', { instagram: v })}
                        />
                        <FormField
                            label="Twitter / X"
                            value={data.contact.social?.twitter || ''}
                            onChange={(v) => patch('social', { twitter: v })}
                        />
                        <FormField
                            label="LinkedIn"
                            value={data.contact.social?.linkedin || ''}
                            onChange={(v) => patch('social', { linkedin: v })}
                        />
                        <FormField
                            label="YouTube"
                            value={data.contact.social?.youtube || ''}
                            onChange={(v) => patch('social', { youtube: v })}
                        />
                    </div>
                </LiquidGlassPanel>
            )}

            {tab === 'tools' && (
                <LiquidGlassPanel title="Developer Tools">
                    <div style={{ spaceY: 12 }}>
                        <h4 style={{ margin: '0 0 8px 0' }}>Quick Test Content</h4>
                        <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 16 }}>
                            Generates sample events, news articles, testimonials, and accreditations to populate the public website for testing.
                        </p>
                        <button type="button" className="btn btn-secondary" disabled={seeding} onClick={seedDemoContent}>
                            <Sparkles size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                            {seeding ? 'Generating...' : 'Seed Sample Content'}
                        </button>
                    </div>
                </LiquidGlassPanel>
            )}

            {tab === 'messages' && (
                <LiquidGlassPanel title="Inbound Contact Messages">
                    {msgLoading ? (
                        <p>Loading messages...</p>
                    ) : messages.length === 0 ? (
                        <p style={{ opacity: 0.6, textAlign: 'center', padding: '40px 0' }}>No messages received yet. When visitors use the contact form on your website, they will appear here.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {messages.map((m) => (
                                <div
                                    key={m.$id}
                                    style={{
                                        padding: 20,
                                        borderRadius: 16,
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: 16 }}>{m.name}</h4>
                                            <div style={{ fontSize: 13, opacity: 0.5 }}>{new Date(m.$createdAt || m.createdAt).toLocaleString()}</div>
                                        </div>
                                        {m.status === 'new' ? (
                                            <span style={{ background: 'var(--color-primary)', color: 'white', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>New</span>
                                        ) : (
                                            <span style={{ fontSize: 12, opacity: 0.4 }}>Read</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16, fontSize: 13 }}>
                                        {m.email && <div style={{ opacity: 0.8 }}><strong>Email:</strong> {m.email}</div>}
                                        {m.phone && <div style={{ opacity: 0.8 }}><strong>Phone:</strong> {m.phone}</div>}
                                    </div>
                                    {m.subject && <div style={{ marginBottom: 8, fontSize: 14 }}><strong>Subject:</strong> {m.subject}</div>}
                                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.6, opacity: 0.9 }}>{m.message}</p>
                                    
                                    {m.status === 'new' && (
                                        <button type="button" className="btn btn-sm btn-secondary" style={{ marginTop: 20 }} onClick={() => markRead(m)}>
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </LiquidGlassPanel>
            )}

            {tab !== 'messages' && (
                <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
                    <button type="button" className="btn btn-primary" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)', height: 56, padding: '0 32px', borderRadius: 28, fontSize: 16, fontWeight: 700 }} disabled={saving} onClick={handleSave}>
                        <Save size={20} style={{ marginRight: 10, verticalAlign: 'middle' }} />
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            )}
        </div>
    );
}
