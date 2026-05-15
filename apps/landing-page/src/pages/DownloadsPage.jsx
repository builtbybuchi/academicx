import React, { useMemo, useState, useEffect } from 'react';
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

// Appwrite client setup
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || '';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';

const roleConfigs = {
    'student-parent': { label: 'Student/Parent', icon: Users, appType: 'student' },
    'staff': { label: 'Staff', icon: Wrench, appType: 'staff' },
    'school-admin': { label: 'School Admin', icon: UserRound, appType: 'admin' },
};

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
        subtitle: 'iOS 15 and newer (Web version fallback)',
        tint: 'linear-gradient(115deg, #f4f5ff, #fbfbff)',
        icon: Apple,
        formats: ['Web App'],
        disabled: true,
    },
];

// Map internal platform names to Appwrite download keys
const platformMap = {
    'windows': 'windows',
    'mac': 'macos',
    'linux': 'linux',
    'android': 'android',
};

export default function DownloadsPage() {
    const [schools, setSchools] = useState([]);
    const [loadingSchools, setLoadingSchools] = useState(true);
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
    const [statusMessage, setStatusMessage] = useState('Loading schools...');
    const navigate = useNavigate();

    // Preload schools from Appwrite in the background
    useEffect(() => {
        const loadSchools = async () => {
            try {
                const response = await fetch(`${APPWRITE_ENDPOINT}/v1/databases/academicx_db/collections/schools/documents`, {
                    headers: {
                        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const activeSchools = data.documents
                        .filter(doc => doc.status !== 'inactive')
                        .map(doc => ({
                            id: doc.$id,
                            schoolCode: doc.schoolCode,
                            name: doc.name,
                            logo: doc.logo,
                            downloads: (() => {
                                try {
                                    const parsed = JSON.parse(doc.data || '{}');
                                    return parsed.downloads || {};
                                } catch {
                                    return {};
                                }
                            })(),
                        }));
                    setSchools(activeSchools);
                    setStatusMessage('Select your configuration to generate your download package.');
                } else {
                    console.warn('Failed to load schools from Appwrite');
                    setStatusMessage('Could not load schools. Using standard app.');
                }
            } catch (error) {
                console.warn('Error loading schools:', error);
                setStatusMessage('Could not load schools. Using standard app.');
            } finally {
                setLoadingSchools(false);
            }
        };

        loadSchools();
    }, []);

    const filteredSchools = useMemo(() => {
        const term = schoolQuery.trim().toLowerCase();
        if (!term) {
            return schools;
        }
        return schools.filter((school) => 
            school.name.toLowerCase().includes(term) || 
            school.schoolCode.toLowerCase().includes(term)
        );
    }, [schoolQuery, schools]);

    const selectedSchool = useMemo(
        () => schools.find((school) => school.id === selectedSchoolId) || null,
        [selectedSchoolId, schools],
    );

    const handleCardToggle = (platformId) => {
        setExpandedPlatform((current) => (current === platformId ? '' : platformId));
    };

    const setFormat = (platformId, format) => {
        setSelectedFormatByPlatform((current) => ({ ...current, [platformId]: format }));
    };

    const getDownloadUrl = (platform) => {
        if (useStandardApp || !selectedSchool) {
            // Return standard app URL from ACADEMIX
            const academixSchool = schools.find(s => s.schoolCode === 'ACADEMIX');
            if (academixSchool && academixSchool.downloads[platformMap[platform.id]]) {
                return academixSchool.downloads[platformMap[platform.id]][0]?.url;
            }
            return null;
        }

        const roleConfig = roleConfigs[selectedRole];
        if (!roleConfig) return null;

        const platformKey = platformMap[platform.id];
        if (selectedSchool.downloads[platformKey]) {
            const files = selectedSchool.downloads[platformKey];
            return files[0]?.url; // Return first available file
        }

        return null;
    };

    const runDownload = (platform) => {
        if (platform.disabled) {
            // iOS fallback to web version
            showIosFallbackPopup();
            return;
        }

        const downloadUrl = getDownloadUrl(platform);

        if (!downloadUrl) {
            // For role-based apps, always use ACADEMIX
            if (selectedRole !== 'student-parent' || useStandardApp) {
                const academixSchool = schools.find(s => s.schoolCode === 'ACADEMIX');
                if (academixSchool && academixSchool.downloads[platformMap[platform.id]]) {
                    const url = academixSchool.downloads[platformMap[platform.id]][0]?.url;
                    if (url) {
                        triggerDownload(platform, url, academixSchool.name);
                        return;
                    }
                }
            } else if (!selectedSchoolId) {
                setStatusMessage('Select a school or use the Standard App fallback to continue.');
                return;
            } else {
                setStatusMessage('Download not yet available for this platform. Please check back later.');
                return;
            }
        }

        triggerDownload(platform, downloadUrl, selectedSchool?.name || 'Standard App');
    };

    const triggerDownload = (platform, url, schoolName) => {
        const payload = {
            role: selectedRole,
            schoolId: selectedSchoolId,
            schoolName,
            platform: platform.id,
            platformLabel: platform.label,
            url,
            startedAt: new Date().toISOString(),
        };

        sessionStorage.setItem('downloadContext', JSON.stringify(payload));
        window.open(url, '_blank', 'noopener,noreferrer');
        navigate('/downloads/thank-you');
    };

    const showIosFallbackPopup = () => {
        const message = 'iOS support coming soon! In the meantime, use our web version at https://academicx.app';
        alert(message);
        window.open('https://academicx.app', '_blank', 'noopener,noreferrer');
    };

    const getRoleIcon = (roleValue) => {
        const Icon = roleConfigs[roleValue]?.icon || UserRound;
        return Icon;
    };

    return (
        <div className="download-shell" style={{ paddingTop: 80 }}>
            <section className="download-wrap download-hero">
                <h1 style={{ fontSize: 'clamp(32px, 6vw, 64px)', letterSpacing: '-0.03em', marginBottom: 24, color: 'var(--color-gray-900)' }}>Download academicX</h1>
                <p>{loadingSchools ? 'Loading available apps...' : 'Instantly access our platform on any device.'}</p>
            </section>

            <section className="download-wrap platform-stack" aria-label="Platform download options">
                {platforms.map((platform) => {
                    const Icon = platform.icon;
                    const isOpen = expandedPlatform === platform.id;
                    const isDisabled = platform.disabled || loadingSchools;
                    return (
                        <article
                            key={platform.id}
                            className="platform-card"
                            style={{ background: platform.tint, opacity: isDisabled ? 0.7 : 1 }}
                        >
                            <button
                                className="platform-head"
                                onClick={() => handleCardToggle(platform.id)}
                                aria-expanded={isOpen}
                                disabled={isDisabled}
                            >
                                <div className="platform-meta">
                                    <div className="platform-icon" aria-hidden="true">
                                        <Icon size={24} color="#111827" />
                                    </div>
                                    <div>
                                        <h2 className="platform-title">
                                            {platform.label}
                                            {platform.disabled && ' (Web Fallback)'}
                                        </h2>
                                        <p className="platform-subtitle">{platform.subtitle}</p>
                                    </div>
                                </div>
                                <span className="platform-cta">
                                    Download Options
                                    <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 180ms ease' }} />
                                </span>
                            </button>

                            {!isDisabled && (
                                <div className="accordion-panel" data-open={isOpen}>
                                    <div className="accordion-content">
                                        <div className="accordion-body">
                                            <div className="field-grid">
                                                <div className="field">
                                                    <label>Role Selector</label>
                                                    <div className="segmented" role="tablist" aria-label="User roles">
                                                        {Object.entries(roleConfigs).map(([value, config]) => {
                                                            const RoleIcon = config.icon;
                                                            return (
                                                                <button
                                                                    key={value}
                                                                    className="segment-btn"
                                                                    data-active={selectedRole === value}
                                                                    onClick={() => setSelectedRole(value)}
                                                                    type="button"
                                                                >
                                                                    <RoleIcon size={14} style={{ marginRight: 6, verticalAlign: 'text-top' }} />
                                                                    {config.label}
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

                                            {selectedRole === 'student-parent' && (
                                                <div className="field" style={{ marginTop: '0.9rem' }}>
                                                    <label htmlFor={`school-search-${platform.id}`}>School Selector</label>
                                                    <div className="search-wrap">
                                                        <input
                                                            id={`school-search-${platform.id}`}
                                                            className="search-input"
                                                            type="text"
                                                            placeholder={loadingSchools ? 'Loading schools...' : 'Search for your school...'}
                                                            value={schoolQuery}
                                                            onChange={(event) => {
                                                                setSchoolQuery(event.target.value);
                                                                if (selectedSchoolId) {
                                                                    setSelectedSchoolId('');
                                                                }
                                                            }}
                                                            disabled={loadingSchools}
                                                        />
                                                    </div>
                                                    {!loadingSchools && schoolQuery.trim().length > 0 && filteredSchools.length > 0 && (
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
                                                    {!loadingSchools && schoolQuery.trim().length > 0 && filteredSchools.length === 0 && (
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
                                            )}

                                            <div className="final-actions">
                                                <p className="status-inline">
                                                    {selectedRole !== 'student-parent' ? 
                                                        'Role-based app' : 
                                                        selectedSchool ? `Selected: ${selectedSchool.name}` : 
                                                        useStandardApp ? 'Standard App mode enabled.' : 
                                                        statusMessage}
                                                </p>
                                                <button
                                                    className="download-now"
                                                    type="button"
                                                    disabled={loadingSchools || (selectedRole === 'student-parent' && !selectedSchoolId && !useStandardApp)}
                                                    onClick={() => runDownload(platform)}
                                                >
                                                    <Download size={16} />
                                                    {platform.disabled ? 'Use Web Version' : 'Download Now'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </article>
                    );
                })}
            </section>
        </div>
    );
}
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
