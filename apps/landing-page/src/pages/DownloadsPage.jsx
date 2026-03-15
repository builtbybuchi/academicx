import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Apple,
    ChevronDown,
    Download,
    Facebook,
    Globe,
    Instagram,
    Laptop,
    MonitorCog,
    Smartphone,
    Twitter,
    UserRound,
    Users,
    Wrench,
} from 'lucide-react';
import './download-experience.css';

const roles = [
    { value: 'student-parent', label: 'Student/Parent', icon: Users },
    { value: 'staff', label: 'Staff', icon: Wrench },
    { value: 'school-admin', label: 'School Admin', icon: UserRound },
];

const schools = [
    { id: 'lagos-heights', name: 'Lagos Heights College' },
    { id: 'evergreen', name: 'Evergreen International School' },
    { id: 'unity-grammar', name: 'Unity Grammar Academy' },
    { id: 'harbor-view', name: 'Harbor View School' },
    { id: 'blossom', name: 'Blossom Scholars Academy' },
    { id: 'riverdale', name: 'Riverdale Community School' },
    { id: 'st-michaels', name: 'St. Michaels College' },
    { id: 'excel', name: 'Excel Future Institute' },
];

const platforms = [
    {
        id: 'windows',
        label: 'Windows',
        subtitle: 'Windows 10 and newer',
        tint: 'linear-gradient(115deg, #eef4ff, #f7fbff)',
        icon: Laptop,
        formats: ['.exe', '.msi'],
    },
    {
        id: 'mac',
        label: 'Mac',
        subtitle: 'macOS 12 and newer',
        tint: 'linear-gradient(115deg, #ecfffa, #f9fffd)',
        icon: Apple,
        formats: ['.dmg', '.pkg'],
    },
    {
        id: 'linux',
        label: 'Linux',
        subtitle: 'Ubuntu, Debian, Fedora and more',
        tint: 'linear-gradient(115deg, #fff8ee, #fffcf7)',
        icon: MonitorCog,
        formats: ['AppImage', '.deb', '.rpm'],
    },
    {
        id: 'android',
        label: 'Android',
        subtitle: 'Android 9 and newer',
        tint: 'linear-gradient(115deg, #f0fffa, #f7fffd)',
        icon: Smartphone,
        formats: ['Standard APK', 'Admin APK'],
    },
    {
        id: 'ios',
        label: 'iOS',
        subtitle: 'iOS 15 and newer',
        tint: 'linear-gradient(115deg, #f4f5ff, #fbfbff)',
        icon: Apple,
        formats: ['TestFlight', 'Enterprise Profile'],
    },
];

function buildDownloadUrl({ role, schoolId, platform, format, fallback }) {
    const school = fallback ? 'standard' : schoolId || 'standard';
    const fileFormat = format.replace('.', '').replace(/\s+/g, '-').toLowerCase();
    return `https://downloads.academicx.app/${role}/${school}/${platform}/${fileFormat}`;
}

export default function DownloadsPage() {
    const [expandedPlatform, setExpandedPlatform] = useState('');
    const [selectedRole, setSelectedRole] = useState('student-parent');
    const [schoolQuery, setSchoolQuery] = useState('');
    const [selectedSchoolId, setSelectedSchoolId] = useState('');
    const [useStandardApp, setUseStandardApp] = useState(false);
    const [selectedFormatByPlatform, setSelectedFormatByPlatform] = useState(() => {
        const defaults = {};
        for (const item of platforms) {
            defaults[item.id] = item.formats[0];
        }
        return defaults;
    });
    const [statusMessage, setStatusMessage] = useState('Select your configuration to generate your download package.');
    const navigate = useNavigate();

    const filteredSchools = useMemo(() => {
        const term = schoolQuery.trim().toLowerCase();
        if (!term) {
            return schools;
        }
        return schools.filter((school) => school.name.toLowerCase().includes(term));
    }, [schoolQuery]);

    const selectedSchool = useMemo(
        () => schools.find((school) => school.id === selectedSchoolId) || null,
        [selectedSchoolId],
    );

    const handleCardToggle = (platformId) => {
        setExpandedPlatform((current) => (current === platformId ? '' : platformId));
    };

    const setFormat = (platformId, format) => {
        setSelectedFormatByPlatform((current) => ({ ...current, [platformId]: format }));
    };

    const runDownload = (platform) => {
        const selectedFormat = selectedFormatByPlatform[platform.id] || platform.formats[0];
        const url = buildDownloadUrl({
            role: selectedRole,
            schoolId: selectedSchoolId,
            platform: platform.id,
            format: selectedFormat,
            fallback: useStandardApp,
        });

        if (!useStandardApp && !selectedSchoolId) {
            setStatusMessage('Select a school or use the Standard App fallback to continue.');
            return;
        }

        const payload = {
            role: selectedRole,
            schoolId: selectedSchoolId,
            schoolName: selectedSchool ? selectedSchool.name : 'Standard App',
            platform: platform.id,
            platformLabel: platform.label,
            format: selectedFormat,
            url,
            startedAt: new Date().toISOString(),
        };

        sessionStorage.setItem('downloadContext', JSON.stringify(payload));
        window.open(url, '_blank', 'noopener,noreferrer');
        navigate('/downloads/thank-you');
    };

    return (
        <div className="download-shell" style={{ paddingTop: 80 }}>
            <section className="download-wrap download-hero">
                <h1 style={{ fontSize: 'clamp(32px, 6vw, 64px)', letterSpacing: '-0.03em', marginBottom: 24, color: 'var(--color-gray-900)' }}>Download academicX</h1>
                <p>Instantly access our platform on any device.</p>
            </section>

            <section className="download-wrap platform-stack" aria-label="Platform download options">
                {platforms.map((platform) => {
                    const Icon = platform.icon;
                    const isOpen = expandedPlatform === platform.id;
                    return (
                        <article
                            key={platform.id}
                            className="platform-card"
                            style={{ background: platform.tint }}
                        >
                            <button
                                className="platform-head"
                                onClick={() => handleCardToggle(platform.id)}
                                aria-expanded={isOpen}
                            >
                                <div className="platform-meta">
                                    <div className="platform-icon" aria-hidden="true">
                                        <Icon size={24} color="#111827" />
                                    </div>
                                    <div>
                                        <h2 className="platform-title">{platform.label}</h2>
                                        <p className="platform-subtitle">{platform.subtitle}</p>
                                    </div>
                                </div>
                                <span className="platform-cta">
                                    Download Options
                                    <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 180ms ease' }} />
                                </span>
                            </button>

                            <div className="accordion-panel" data-open={isOpen}>
                                <div className="accordion-content">
                                    <div className="accordion-body">
                                        <div className="field-grid">
                                            <div className="field">
                                                <label>Role Selector</label>
                                                <div className="segmented" role="tablist" aria-label="User roles">
                                                    {roles.map((role) => {
                                                        const RoleIcon = role.icon;
                                                        return (
                                                            <button
                                                                key={role.value}
                                                                className="segment-btn"
                                                                data-active={selectedRole === role.value}
                                                                onClick={() => setSelectedRole(role.value)}
                                                                type="button"
                                                            >
                                                                <RoleIcon size={14} style={{ marginRight: 6, verticalAlign: 'text-top' }} />
                                                                {role.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="field">
                                                <label htmlFor={`format-${platform.id}`}>File Format Selector</label>
                                                <div className="select-wrap">
                                                    <select
                                                        id={`format-${platform.id}`}
                                                        className="field-select"
                                                        value={selectedFormatByPlatform[platform.id]}
                                                        onChange={(event) => setFormat(platform.id, event.target.value)}
                                                    >
                                                        {platform.formats.map((format) => (
                                                            <option key={format} value={format}>{format}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="field" style={{ marginTop: '0.9rem' }}>
                                            <label htmlFor={`school-search-${platform.id}`}>School Selector</label>
                                            <div className="search-wrap">
                                                <input
                                                    id={`school-search-${platform.id}`}
                                                    className="search-input"
                                                    type="text"
                                                    placeholder="Search for your school..."
                                                    value={schoolQuery}
                                                    onChange={(event) => {
                                                        setSchoolQuery(event.target.value);
                                                        if (selectedSchoolId) {
                                                            setSelectedSchoolId('');
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {schoolQuery.trim().length > 0 && filteredSchools.length > 0 && (
                                                <div className="search-results">
                                                    {filteredSchools.slice(0, 7).map((school) => (
                                                        <button
                                                            key={school.id}
                                                            className="search-option"
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedSchoolId(school.id);
                                                                setSchoolQuery(school.name);
                                                                setUseStandardApp(false);
                                                            }}
                                                        >
                                                            {school.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {schoolQuery.trim().length > 0 && filteredSchools.length === 0 && (
                                                <div className="search-results">
                                                    <div className="search-option" style={{ cursor: 'default' }}>
                                                        No matching schools found.
                                                    </div>
                                                </div>
                                            )}

                                            <label className="fallback-note" htmlFor={`fallback-${platform.id}`}>
                                                <input
                                                    id={`fallback-${platform.id}`}
                                                    type="checkbox"
                                                    checked={useStandardApp}
                                                    onChange={(event) => {
                                                        const useFallback = event.target.checked;
                                                        setUseStandardApp(useFallback);
                                                        if (useFallback) {
                                                            setSelectedSchoolId('');
                                                            setSchoolQuery('');
                                                        }
                                                    }}
                                                />
                                                <span>Can&apos;t find your school? Download the Standard App.</span>
                                            </label>
                                        </div>

                                        <div className="final-actions">
                                            <p className="status-inline">
                                                {selectedSchool ? `Selected: ${selectedSchool.name}` : useStandardApp ? 'Standard App mode enabled.' : statusMessage}
                                            </p>
                                            <button
                                                className="download-now"
                                                type="button"
                                                disabled={!selectedRole || (!selectedSchoolId && !useStandardApp)}
                                                onClick={() => runDownload(platform)}
                                            >
                                                <Download size={16} />
                                                Download Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </section>
        </div>
    );
}
