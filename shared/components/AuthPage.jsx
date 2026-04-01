import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

// Add responsive styles globally
const styleSheet = typeof window !== 'undefined' ? document.createElement('style') : null;
if (styleSheet) {
    styleSheet.textContent = `
        @media (max-width: 768px) {
            .welcome-grid {
                grid-template-columns: 1fr !important;
                gap: 20px !important;
            }
        }
    `;
    if (document.head && !document.getElementById('auth-page-styles')) {
        styleSheet.id = 'auth-page-styles';
        document.head.appendChild(styleSheet);
    }
}

export default function AuthPage({
    brand = 'academicX',
    title = 'Spark your productivity',
    subtitle = 'Access your workspace with secure email authentication.',
    logoSrc = '/logo.png',
    fallbackLogoText = 'academicX',
    highlights = [],
    loginFields,
    loginButtonText = 'Continue with email',
    allowSignup = true,
    disableSignup = false,
    disableSignupMessage = 'Account signup is disabled for this portal. Contact your administrator.',
    onLogin,
    onSignup,
    loading = false,
    role = 'default', // 'student', 'staff', 'admin'
}) {
    const roleWelcome = {
        student: {
            heading: "YOUR ACADEMIC JOURNEY, SIMPLIFIED.",
            subheading: "All your grades, schedules, and learning materials in one place.",
            image: "https://res.cloudinary.com/dlvffw5wt/image/upload/f_webp/q_auto:eco/Gemini_Generated_Image_l0aqi5l0aqi5l0aq_mqmtcp",
            buttonText: "GET STARTED"
        },
        staff: {
            heading: "EMPOWERING EXCELLENCE IN TEACHING.",
            subheading: "Automated grading, real-time attendance, and secure result management.",
            image: "https://diviengine.com/wp-content/uploads/2025/08/naughtyduk-liquid-glass-1024x611.webp",
            buttonText: "CONTINUE TO STAFF PORTAL"
        },
        admin: {
            heading: "INSTITUTION-WIDE CONTROL AT YOUR FINGERTIPS.",
            subheading: "Secure data access, multi-app management, and performance insights.",
            image: "https://diviengine.com/wp-content/uploads/2025/08/naughtyduk-liquid-glass-1024x611.webp",
            buttonText: "ADMINISTRATOR LOGIN"
        },
        default: {
            heading: "Welcome to academicX",
            subheading: "The complete platform for modern education.",
            image: "https://diviengine.com/wp-content/uploads/2025/08/naughtyduk-liquid-glass-1024x611.webp",
            buttonText: "Get Started"
        }
    };

    const [view, setView] = useState('welcome');
    const [tab, setTab] = useState('login');
    const [error, setError] = useState('');
    
    const normalizedLoginFields = useMemo(() => (
        loginFields && loginFields.length > 0
            ? loginFields
            : [
                { name: 'email', type: 'email', placeholder: 'name@yourcompany.com', autoComplete: 'email' },
                { name: 'password', type: 'password', placeholder: 'Password', autoComplete: 'current-password' },
            ]
    ), [loginFields]);

    const [loginData, setLoginData] = useState(() => (
        normalizedLoginFields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
    ));
    const [signupData, setSignupData] = useState({ firstName: '', lastName: '', email: '', password: '', organization: '', schoolCode: '' });
    const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 980 : false);
    const [submittingMode, setSubmittingMode] = useState(null);
    const [loginPasswordVisibility, setLoginPasswordVisibility] = useState({});
    const [showSignupPassword, setShowSignupPassword] = useState(false);

    useEffect(() => {
        const onResize = () => setIsDesktop(window.innerWidth >= 980);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        setLoginData(normalizedLoginFields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}));
    }, [normalizedLoginFields]);

    const previewItems = useMemo(() => {
        if (highlights.length > 0) return highlights;
        return [
            'Live results and attendance dashboards',
            'Fast role-based workflows for your team',
            'Secure function-backed data operations',
        ];
    }, [highlights]);

    async function submitLogin(event) {
        event.preventDefault();
        if (submittingMode) return;
        setError('');
        setSubmittingMode('login');
        try {
            await onLogin?.(loginData);
        } catch (err) {
            setError(err.message || 'Unable to sign in.');
        } finally {
            setSubmittingMode(null);
        }
    }

    async function submitSignup(event) {
        event.preventDefault();
        if (submittingMode) return;
        if (disableSignup) {
            setError(disableSignupMessage);
            return;
        }

        if (typeof signupData.schoolCode !== 'string') {
            setError('School code must be a valid uppercase string (max 8 characters).');
            return;
        }

        const normalizedSchoolCode = signupData.schoolCode.trim().toUpperCase();
        if (!normalizedSchoolCode) {
            setError('School code is required.');
            return;
        }

        if (normalizedSchoolCode.length > 8) {
            setError('School code must not exceed 8 characters.');
            return;
        }

        if (normalizedSchoolCode !== signupData.schoolCode.trim()) {
            setError('School code must be in uppercase.');
            return;
        }

        setError('');
        setSubmittingMode('signup');
        try {
            await onSignup?.({ ...signupData, schoolCode: normalizedSchoolCode });
        } catch (err) {
            setError(err.message || 'Unable to create account.');
        } finally {
            setSubmittingMode(null);
        }
    }

    if (view === 'welcome') {
        const welcome = roleWelcome[role] || roleWelcome.default;

        const containerVariants = {
            hidden: { opacity: 0 },
            visible: { 
                opacity: 1, 
                transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
            }
        };

        const itemVariants = {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
        };

        const imageVariants = {
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
        };

        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: '#FFFFFF',
                padding: isDesktop ? '60px 40px' : '40px 20px',
                position: 'relative',
                zIndex: 1
            }}>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: isDesktop ? 1200 : '100%'
                    }}
                >
                    {/* Brand Logo */}
                    <motion.div
                        variants={itemVariants}
                        style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: '#1D4ED8',
                            marginBottom: 48,
                            fontFamily: 'Inter, sans-serif',
                            letterSpacing: '-0.5px'
                        }}
                    >
                        {brand}
                    </motion.div>

                    {/* Main Container: Desktop side-by-side, Mobile stacked */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
                        gap: isDesktop ? 60 : 40,
                        alignItems: 'center',
                        width: '100%'
                    }}>
                        {/* Image Section - appears first on mobile, second on desktop */}
                        {!isDesktop && (
                            <motion.div
                                variants={itemVariants}
                                style={{
                                    width: '100%',
                                    height: 300,
                                    borderRadius: 16,
                                    overflow: 'hidden',
                                    order: -1
                                }}
                            >
                                <img
                                    src={welcome.image}
                                    alt={welcome.heading}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                />
                            </motion.div>
                        )}

                        {/* Text Content */}
                        <motion.div
                            variants={itemVariants}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 20,
                                textAlign: 'center'
                            }}
                        >
                            {/* Heading */}
                            <motion.h1
                                variants={itemVariants}
                                style={{
                                    fontSize: isDesktop ? 32 : 28,
                                    fontWeight: 700,
                                    fontFamily: 'Inter, sans-serif',
                                    color: '#1D4ED8',
                                    lineHeight: 1.2,
                                    margin: 0,
                                    letterSpacing: '-0.02em'
                                }}
                            >
                                {welcome.heading}
                            </motion.h1>

                            {/* Subheading */}
                            <motion.p
                                variants={itemVariants}
                                style={{
                                    fontSize: isDesktop ? 20 : 16,
                                    fontWeight: 500,
                                    fontFamily: 'Inter, sans-serif',
                                    color: '#374151',
                                    lineHeight: 1.6,
                                    margin: 0,
                                    maxWidth: 500
                                }}
                            >
                                {welcome.subheading}
                            </motion.p>

                            {/* CTA Button */}
                            <motion.div
                                variants={itemVariants}
                                style={{ marginTop: 20 }}
                            >
                                <motion.button
                                    type="button"
                                    whileHover={{ backgroundColor: '#3B82F6' }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        padding: '14px 40px',
                                        backgroundColor: '#1D4ED8',
                                        color: '#FFFFFF',
                                        fontWeight: 500,
                                        fontSize: 16,
                                        fontFamily: 'Inter, sans-serif',
                                        border: 'none',
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5,
                                        transition: 'background-color 0.3s ease',
                                        boxShadow: '0 2px 8px rgba(29, 78, 216, 0.15)'
                                    }}
                                    onClick={() => setView('auth')}
                                >
                                    {welcome.buttonText}
                                </motion.button>
                            </motion.div>
                        </motion.div>

                        {/* Image Section - appears on desktop on the right */}
                        {isDesktop && (
                            <motion.div
                                variants={imageVariants}
                                style={{
                                    width: '100%',
                                    height: 400,
                                    borderRadius: 16,
                                    overflow: 'hidden'
                                }}
                            >
                                <img
                                    src={welcome.image}
                                    alt={welcome.heading}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                />
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.layer} />
            <div style={{ ...styles.grid, gridTemplateColumns: isDesktop ? 'minmax(420px, 1fr) minmax(360px, 1fr)' : '1fr' }}>
                <section style={{ ...styles.left, padding: isDesktop ? 34 : 24 }}>

                    <h1 style={styles.title}>{title}</h1>
                    <p style={styles.subtitle}>{subtitle}</p>

                    <div style={styles.card}>
                        <div style={styles.tabs}>
                            <button
                                type="button"
                                style={{ ...styles.tabBtn, ...(tab === 'login' ? styles.tabBtnActive : {}) }}
                                disabled={Boolean(submittingMode)}
                                onClick={() => { setTab('login'); setError(''); }}
                            >
                                Sign In
                            </button>
                            {allowSignup && (
                                <button
                                    type="button"
                                    style={{ ...styles.tabBtn, ...(tab === 'signup' ? styles.tabBtnActive : {}) }}
                                    disabled={Boolean(submittingMode)}
                                    onClick={() => { setTab('signup'); setError(''); }}
                                >
                                    Sign Up
                                </button>
                            )}
                        </div>

                        {tab === 'login' && (
                            <form onSubmit={submitLogin} style={styles.form}>
                                {normalizedLoginFields.map((field) => (
                                    <div key={field.name} style={styles.loginFieldWrap}>
                                        {field.label && <label style={styles.loginFieldLabel}>{field.label}</label>}
                                        {field.type === 'password' ? (
                                            <div style={styles.passwordFieldWrap}>
                                                <input
                                                    style={styles.inputWithAction}
                                                    type={loginPasswordVisibility[field.name] ? 'text' : 'password'}
                                                    placeholder={field.placeholder || ''}
                                                    autoComplete={field.autoComplete || 'off'}
                                                    value={loginData[field.name] || ''}
                                                    onChange={(event) => setLoginData((current) => ({ ...current, [field.name]: event.target.value }))}
                                                    required={field.required !== false}
                                                />
                                                <button
                                                    type="button"
                                                    style={styles.passwordToggleBtn}
                                                    aria-label={loginPasswordVisibility[field.name] ? 'Hide password' : 'Show password'}
                                                    onClick={() => setLoginPasswordVisibility((current) => ({ ...current, [field.name]: !current[field.name] }))}
                                                >
                                                    {loginPasswordVisibility[field.name] ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        ) : (
                                            <input
                                                style={styles.input}
                                                type={field.type || 'text'}
                                                placeholder={field.placeholder || ''}
                                                autoComplete={field.autoComplete || 'off'}
                                                value={loginData[field.name] || ''}
                                                onChange={(event) => setLoginData((current) => ({ ...current, [field.name]: event.target.value }))}
                                                required={field.required !== false}
                                            />
                                        )}
                                    </div>
                                ))}
                                <button disabled={loading || submittingMode === 'login'} type="submit" style={styles.primaryBtn}>
                                    {loading || submittingMode === 'login' ? 'Loading...' : loginButtonText}
                                </button>
                            </form>
                        )}

                        {allowSignup && tab === 'signup' && (
                            <form onSubmit={submitSignup} style={styles.form}>
                                <div style={{ ...styles.row, gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr' }}>
                                    <input
                                        style={styles.input}
                                        type="text"
                                        placeholder="First name"
                                        value={signupData.firstName}
                                        onChange={(event) => setSignupData((current) => ({ ...current, firstName: event.target.value }))}
                                        required
                                    />
                                    <input
                                        style={styles.input}
                                        type="text"
                                        placeholder="Last name"
                                        value={signupData.lastName}
                                        onChange={(event) => setSignupData((current) => ({ ...current, lastName: event.target.value }))}
                                        required
                                    />
                                </div>
                                <input
                                    style={styles.input}
                                    type="email"
                                    placeholder="Email"
                                    value={signupData.email}
                                    onChange={(event) => setSignupData((current) => ({ ...current, email: event.target.value }))}
                                    required
                                />
                                <input
                                    style={styles.input}
                                    type="text"
                                    placeholder="School name"
                                    value={signupData.organization}
                                    onChange={(event) => setSignupData((current) => ({ ...current, organization: event.target.value }))}
                                />
                                <input
                                    style={styles.input}
                                    type="text"
                                    placeholder="School Code"
                                    value={signupData.schoolCode}
                                    onChange={(event) => setSignupData((current) => ({
                                        ...current,
                                        schoolCode: String(event.target.value || '').replace(/\s+/g, '').toUpperCase().slice(0, 8),
                                    }))}
                                    maxLength={8}
                                    required
                                />
                                <div style={styles.passwordFieldWrap}>
                                    <input
                                        style={styles.inputWithAction}
                                        type={showSignupPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={signupData.password}
                                        onChange={(event) => setSignupData((current) => ({ ...current, password: event.target.value }))}
                                        required
                                    />
                                    <button
                                        type="button"
                                        style={styles.passwordToggleBtn}
                                        aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                                        onClick={() => setShowSignupPassword((current) => !current)}
                                    >
                                        {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <button disabled={loading || disableSignup || submittingMode === 'signup'} type="submit" style={styles.primaryBtn}>
                                    {disableSignup ? 'Signup Disabled' : loading || submittingMode === 'signup' ? 'Loading...' : 'Create account'}
                                </button>
                                {disableSignup && <div style={styles.note}>{disableSignupMessage}</div>}
                            </form>
                        )}

                        {error && <div style={styles.error}>{error}</div>}
                    </div>
                </section>

                {isDesktop && (
                    <section style={{ ...styles.right, padding: 24 }}>
                        <div style={styles.previewCard}>
                            <div style={styles.previewChip}>Insights from your portal</div>
                            {previewItems.map((item) => (
                                <div key={item} style={styles.previewItem}>• {item}</div>
                            ))}
                            <div style={styles.previewPanel}>
                                <div style={styles.fakeLineLong} />
                                <div style={styles.fakeLineShort} />
                                <div style={styles.fakeChart}>
                                    <span style={{ ...styles.chartBar, height: 36 }} />
                                    <span style={{ ...styles.chartBar, height: 58 }} />
                                    <span style={{ ...styles.chartBar, height: 42 }} />
                                    <span style={{ ...styles.chartBar, height: 70 }} />
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

const styles = {
    welcomePage: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f4f8ff 0%, #eef5ff 48%, #f6faff 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '32px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    welcomeGrid: {
        position: 'relative',
        width: '100%',
        maxWidth: 1400,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 40,
        alignItems: 'center',
    },
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #f4f8ff 0%, #eef5ff 48%, #f6faff 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '32px 20px',
    },
    layer: {
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 20% 10%, rgba(29, 78, 216, 0.18), transparent 40%), radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.16), transparent 45%)',
        pointerEvents: 'none',
    },
    grid: {
        maxWidth: 1200,
        margin: '0 auto',
        position: 'relative',
        display: 'grid',
        gap: 28,
        gridTemplateColumns: '1fr',
    },
    left: {
        borderRadius: 28,
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(8px)',
        padding: 30,
        border: '1px solid rgba(29,78,216,0.12)',
    },
    right: {
        borderRadius: 28,
        background: 'rgba(239,246,255,0.88)',
        padding: 26,
        border: '1px solid rgba(29,78,216,0.1)',
    },
    title: {
        margin: 0,
        fontSize: 'clamp(34px, 8vw, 68px)',
        lineHeight: 1,
        fontWeight: 500,
        fontFamily: 'Georgia, Cambria, Times New Roman, serif',
        color: '#1f2937',
        marginBottom: 14,
    },
    subtitle: {
        marginTop: 0,
        marginBottom: 30,
        color: '#4b5563',
        fontSize: 15,
        lineHeight: 1.6,
    },
    card: {
        borderRadius: 24,
        border: '1px solid rgba(29,78,216,0.12)',
        background: '#f8fbff',
        padding: 20,
    },
    tabs: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: '#eaf2ff',
        borderRadius: 12,
        padding: 5,
        gap: 4,
        marginBottom: 20,
    },
    tabBtn: {
        border: 'none',
        borderRadius: 10,
        padding: '9px 10px',
        fontSize: 13,
        fontWeight: 600,
        color: '#4b5563',
        background: 'transparent',
        cursor: 'pointer',
    },
    tabBtnActive: {
        background: '#fff',
        color: '#1d4ed8',
        boxShadow: '0 2px 10px rgba(29,78,216,0.12)',
    },
    form: {
        display: 'grid',
        gap: 14,
    },
    row: {
        display: 'grid',
        gap: 12,
        gridTemplateColumns: '1fr',
    },
    input: {
        width: '100%',
        border: '1px solid rgba(29,78,216,0.18)',
        borderRadius: 12,
        padding: '14px 16px',
        outline: 'none',
        fontSize: 14,
        background: '#fff',
        color: '#1f2937',
    },
    loginFieldWrap: {
        display: 'grid',
        gap: 6,
    },
    passwordFieldWrap: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    inputWithAction: {
        width: '100%',
        border: '1px solid rgba(29,78,216,0.18)',
        borderRadius: 12,
        padding: '14px 44px 14px 16px',
        outline: 'none',
        fontSize: 14,
        background: '#fff',
        color: '#1f2937',
    },
    passwordToggleBtn: {
        position: 'absolute',
        right: 12,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        background: 'transparent',
        color: '#64748b',
        cursor: 'pointer',
        padding: 4,
    },
    loginFieldLabel: {
        fontSize: 12,
        fontWeight: 700,
        color: '#334155',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    primaryBtn: {
        border: 'none',
        borderRadius: 12,
        padding: '14px 16px',
        fontSize: 18,
        fontWeight: 700,
        color: '#fff',
        background: '#1d4ed8',
        cursor: 'pointer',
        marginTop: 8,
    },
    note: {
        fontSize: 12,
        color: '#6b7280',
        lineHeight: 1.4,
    },
    error: {
        marginTop: 12,
        color: '#b3261e',
        fontSize: 13,
        fontWeight: 600,
    },
    previewCard: {
        borderRadius: 20,
        background: '#eff6ff',
        border: '1px solid rgba(29,78,216,0.12)',
        padding: 22,
        minHeight: 260,
    },
    previewChip: {
        display: 'inline-block',
        borderRadius: 999,
        background: '#fff',
        border: '1px solid rgba(29,78,216,0.16)',
        padding: '8px 12px',
        fontSize: 12,
        fontWeight: 600,
        color: '#1d4ed8',
        marginBottom: 12,
    },
    previewItem: {
        color: '#374151',
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 1.45,
    },
    previewPanel: {
        marginTop: 20,
        borderRadius: 16,
        background: '#fff',
        border: '1px solid rgba(29,78,216,0.12)',
        padding: 16,
    },
    fakeLineLong: {
        height: 8,
        width: '85%',
        borderRadius: 999,
        background: '#bfdbfe',
        marginBottom: 8,
    },
    fakeLineShort: {
        height: 8,
        width: '55%',
        borderRadius: 999,
        background: '#dbeafe',
        marginBottom: 12,
    },
    fakeChart: {
        height: 90,
        borderRadius: 12,
        background: 'linear-gradient(180deg, #e7f1ff 0%, #dbeafe 100%)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        padding: '10px 10px',
    },
    chartBar: {
        flex: 1,
        borderRadius: 6,
        background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
    },
};
