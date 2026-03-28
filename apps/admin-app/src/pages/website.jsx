import React, { useCallback, useEffect, useState } from 'react';
import { Globe, MessageSquare, Save, Sparkles, ExternalLink } from 'lucide-react';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';
import FormField from '../../../../shared/components/FormField.jsx';
import { useToast } from '../../../../shared/components/Toast.jsx';
import { useAuth } from '../../../../shared/utils/auth.jsx';
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
} from '../../../../shared/utils/api.js';

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
            imageUrl: '',
            imageFileId: '',
        },
        about: {
            title: 'About Us',
            body: 'Tell your school story here.',
            imageUrls: [],
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
        hero: { ...d.hero, ...(o.hero || {}) },
        about: {
            ...d.about,
            ...(o.about || {}),
            imageUrls: Array.isArray(o.about?.imageUrls) ? o.about.imageUrls : d.about.imageUrls,
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
];

export default function Website() {
    const { schoolId } = useAuth();
    const toast = useToast();
    const [tab, setTab] = useState('setup');
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
                setLogoStorage('');
                setLogoPreview('');
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
                    className={`btn ${tab === 'setup' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTab('setup')}
                >
                    <Globe size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Setup
                </button>
                <button
                    type="button"
                    className={`btn ${tab === 'messages' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTab('messages')}
                >
                    <MessageSquare size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Contact messages
                </button>
            </div>

            {tab === 'setup' && (
                <>
                    <LiquidGlassPanel title="Public URL & testing" style={{ marginBottom: 20 }}>
                        <FormField
                            label="Website slug (subdomain)"
                            placeholder="e.g. demo"
                            value={websiteSlug}
                            onChange={(v) => setWebsiteSlug(String(v).toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        />
                        <p style={{ fontSize: 13, opacity: 0.8, marginTop: -8 }}>
                            Use in hosts file: <code>{slugHint}.buchis.site</code> → your dev server. Or test with{' '}
                            <code>/site/{slugHint}</code> on the school-website app.
                        </p>
                        <p style={{ fontSize: 13, opacity: 0.75 }}>
                            Preview base (this admin origin): <code>{previewPath}</code>
                        </p>
                    </LiquidGlassPanel>

                    <LiquidGlassPanel title="Template" style={{ marginBottom: 20 }}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: 12,
                            }}
                        >
                            {TEMPLATES.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setTemplateId(t.id)}
                                    style={{
                                        padding: 12,
                                        borderRadius: 12,
                                        border: templateId === t.id ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.2)',
                                        background: templateId === t.id ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                    }}
                                >
                                    <div style={{ fontWeight: 700 }}>{t.label}</div>
                                    <div style={{ fontSize: 11, opacity: 0.75, marginTop: 4 }}>{t.hint}</div>
                                    <div style={{ fontSize: 10, opacity: 0.5, marginTop: 6 }}>{t.id}</div>
                                </button>
                            ))}
                        </div>
                    </LiquidGlassPanel>

                    <LiquidGlassPanel title="Brand & colours" style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" style={{ height: 56, objectFit: 'contain', borderRadius: 8 }} />
                            ) : (
                                <span style={{ opacity: 0.7 }}>No logo</span>
                            )}
                            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                                Upload logo
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                            </label>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                            {['primary', 'secondary', 'accent', 'background', 'text'].map((key) => (
                                <div key={key}>
                                    <label className="input-label" style={{ textTransform: 'capitalize' }}>
                                        {key}
                                    </label>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <input
                                            type="color"
                                            value={data.colors[key] || '#000000'}
                                            onChange={(e) => patch('colors', { [key]: e.target.value })}
                                            style={{ width: 44, height: 36, padding: 0, border: 'none', cursor: 'pointer' }}
                                        />
                                        <input
                                            className="input"
                                            value={data.colors[key] || ''}
                                            onChange={(e) => patch('colors', { [key]: e.target.value })}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </LiquidGlassPanel>

                    <LiquidGlassPanel title="Hero" style={{ marginBottom: 20 }}>
                        <FormField label="Headline" value={data.hero.headline} onChange={(v) => patch('hero', { headline: v })} />
                        <FormField label="Subheadline" value={data.hero.subheadline} onChange={(v) => patch('hero', { subheadline: v })} />
                        <FormField
                            label="Hero image URL (optional, overrides upload)"
                            value={data.hero.imageUrl || ''}
                            onChange={(v) => patch('hero', { imageUrl: v, imageFileId: '' })}
                        />
                        {data.hero.imageFileId ? (
                            <p style={{ fontSize: 13 }}>File ID set: {data.hero.imageFileId.slice(0, 12)}…</p>
                        ) : null}
                        <label className="btn btn-secondary" style={{ cursor: 'pointer', marginTop: 8 }}>
                            Upload hero image
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleHeroUpload} />
                        </label>
                    </LiquidGlassPanel>

                    <LiquidGlassPanel title="About" style={{ marginBottom: 20 }}>
                        <FormField label="Section title" value={data.about.title || ''} onChange={(v) => patch('about', { title: v })} />
                        <FormField
                            label="Body"
                            type="textarea"
                            rows={6}
                            value={data.about.body || ''}
                            onChange={(v) => patch('about', { body: v })}
                        />
                    </LiquidGlassPanel>

                    <LiquidGlassPanel title="Content" style={{ marginBottom: 20 }}>
                        <FormField
                            label="School anthem"
                            type="textarea"
                            rows={4}
                            value={data.schoolAnthem}
                            onChange={(v) => patch('schoolAnthem', v)}
                        />
                        <FormField
                            label="School pledge"
                            type="textarea"
                            rows={3}
                            value={data.schoolPledge}
                            onChange={(v) => patch('schoolPledge', v)}
                        />
                        <FormField
                            label="Principal’s pledge"
                            type="textarea"
                            rows={3}
                            value={data.principalsPledge}
                            onChange={(v) => patch('principalsPledge', v)}
                        />
                        <FormField label="Vision" type="textarea" rows={3} value={data.vision} onChange={(v) => patch('vision', v)} />
                        <FormField label="Mission" type="textarea" rows={3} value={data.mission} onChange={(v) => patch('mission', v)} />
                        <FormField
                            label="Core values (one per line)"
                            type="textarea"
                            rows={4}
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
                            label="Welcome address (principal)"
                            type="textarea"
                            rows={5}
                            value={data.welcomeAddress}
                            onChange={(v) => patch('welcomeAddress', v)}
                        />
                    </LiquidGlassPanel>

                    <LiquidGlassPanel title="Contact & social" style={{ marginBottom: 20 }}>
                        <FormField
                            label="Address"
                            type="textarea"
                            rows={2}
                            value={data.contact.address || ''}
                            onChange={(v) => patch('contact', { address: v })}
                        />
                        <FormField
                            label="Phone numbers (one per line)"
                            type="textarea"
                            rows={3}
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
                            label="Emails (one per line)"
                            type="textarea"
                            rows={3}
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
                        <FormField
                            label="School hours"
                            value={data.contact.schoolHours || ''}
                            onChange={(v) => patch('contact', { schoolHours: v })}
                        />
                        <FormField
                            label="Facebook URL"
                            value={data.contact.social?.facebook || ''}
                            onChange={(v) => patch('social', { facebook: v })}
                        />
                        <FormField
                            label="Instagram URL"
                            value={data.contact.social?.instagram || ''}
                            onChange={(v) => patch('social', { instagram: v })}
                        />
                        <FormField
                            label="YouTube URL"
                            value={data.contact.social?.youtube || ''}
                            onChange={(v) => patch('social', { youtube: v })}
                        />
                        <FormField
                            label="LinkedIn URL"
                            value={data.contact.social?.linkedin || ''}
                            onChange={(v) => patch('social', { linkedin: v })}
                        />
                    </LiquidGlassPanel>

                    <LiquidGlassPanel title="Quick test content" style={{ marginBottom: 20 }}>
                        <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 12 }}>
                            Adds sample events, news, a testimonial, and two accreditation/partnership rows so the public site has data to show.
                        </p>
                        <button type="button" className="btn btn-secondary" disabled={seeding} onClick={seedDemoContent}>
                            <Sparkles size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                            {seeding ? 'Adding…' : 'Seed sample content'}
                        </button>
                    </LiquidGlassPanel>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                        <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>
                            <Save size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                            {saving ? 'Saving…' : 'Save website settings'}
                        </button>
                        <a
                            className="btn btn-secondary"
                            href={`https://${slugHint}.buchis.site`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                            Try subdomain
                            <ExternalLink size={14} />
                        </a>
                    </div>
                </>
            )}

            {tab === 'messages' && (
                <LiquidGlassPanel title="Contact form messages">
                    {msgLoading ? (
                        <p>Loading…</p>
                    ) : messages.length === 0 ? (
                        <p style={{ opacity: 0.8 }}>No messages yet. They appear when visitors submit the Get In Touch form on the public site.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {messages.map((m) => (
                                <div
                                    key={m.$id}
                                    style={{
                                        padding: 14,
                                        borderRadius: 12,
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                                        <strong>{m.name}</strong>
                                        <span style={{ fontSize: 12, opacity: 0.7 }}>{m.createdAt}</span>
                                    </div>
                                    {m.email ? <div style={{ fontSize: 13, marginTop: 4 }}>{m.email}</div> : null}
                                    {m.phone ? <div style={{ fontSize: 13 }}>{m.phone}</div> : null}
                                    {m.subject ? <div style={{ fontSize: 13, marginTop: 4 }}>Subject: {m.subject}</div> : null}
                                    <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{m.message}</p>
                                    {m.status === 'new' ? (
                                        <button type="button" className="btn btn-sm btn-secondary" style={{ marginTop: 8 }} onClick={() => markRead(m)}>
                                            Mark as read
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: 12, opacity: 0.6 }}>Read</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </LiquidGlassPanel>
            )}
        </div>
    );
}
