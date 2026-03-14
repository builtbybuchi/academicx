import React, { useEffect, useMemo, useState } from 'react';

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
}) {
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
        setError('');
        try {
            await onLogin?.(loginData);
        } catch (err) {
            setError(err.message || 'Unable to sign in.');
        }
    }

    async function submitSignup(event) {
        event.preventDefault();
        if (disableSignup) {
            setError(disableSignupMessage);
            return;
        }
        setError('');
        try {
            await onSignup?.(signupData);
        } catch (err) {
            setError(err.message || 'Unable to create account.');
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.layer} />
            <div style={{ ...styles.grid, gridTemplateColumns: isDesktop ? 'minmax(420px, 1fr) minmax(360px, 1fr)' : '1fr' }}>
                <section style={{ ...styles.left, padding: isDesktop ? 34 : 24 }}>
                    <div style={styles.brandWrap}>
                        <div style={styles.brandRow}>
                        <img
                            src={logoSrc}
                            alt={brand}
                            style={styles.logo}
                            onError={(event) => {
                                event.currentTarget.style.display = 'none';
                                const textNode = event.currentTarget.nextSibling;
                                if (textNode && textNode.style) textNode.style.display = 'inline';
                            }}
                        />
                        <span style={{ ...styles.logoFallback, display: 'none' }}>{fallbackLogoText}</span>
                        <span style={styles.brandText}>{brand}</span>
                        </div>
                    </div>

                    <h1 style={styles.title}>{title}</h1>
                    <p style={styles.subtitle}>{subtitle}</p>

                    <div style={styles.card}>
                        <div style={styles.tabs}>
                            <button
                                type="button"
                                style={{ ...styles.tabBtn, ...(tab === 'login' ? styles.tabBtnActive : {}) }}
                                onClick={() => { setTab('login'); setError(''); }}
                            >
                                Sign In
                            </button>
                            {allowSignup && (
                                <button
                                    type="button"
                                    style={{ ...styles.tabBtn, ...(tab === 'signup' ? styles.tabBtnActive : {}) }}
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
                                        <input
                                            style={styles.input}
                                            type={field.type || 'text'}
                                            placeholder={field.placeholder || ''}
                                            autoComplete={field.autoComplete || 'off'}
                                            value={loginData[field.name] || ''}
                                            onChange={(event) => setLoginData((current) => ({ ...current, [field.name]: event.target.value }))}
                                            required={field.required !== false}
                                        />
                                    </div>
                                ))}
                                <button disabled={loading} type="submit" style={styles.primaryBtn}>
                                    {loading ? 'Loading...' : loginButtonText}
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
                                    onChange={(event) => setSignupData((current) => ({ ...current, schoolCode: event.target.value.toUpperCase() }))}
                                />
                                <input
                                    style={styles.input}
                                    type="password"
                                    placeholder="Password"
                                    value={signupData.password}
                                    onChange={(event) => setSignupData((current) => ({ ...current, password: event.target.value }))}
                                    required
                                />
                                <button disabled={loading || disableSignup} type="submit" style={styles.primaryBtn}>
                                    {disableSignup ? 'Signup Disabled' : loading ? 'Loading...' : 'Create account'}
                                </button>
                                {disableSignup && <div style={styles.note}>{disableSignupMessage}</div>}
                            </form>
                        )}

                        {error && <div style={styles.error}>{error}</div>}
                    </div>
                </section>

                <section style={{ ...styles.right, padding: isDesktop ? 24 : 20 }}>
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
            </div>
        </div>
    );
}

const styles = {
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
    brandRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 18,
    },
    brandWrap: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        textAlign: 'center',
    },
    logo: {
        width: 34,
        height: 34,
        objectFit: 'cover',
        borderRadius: 10,
        border: '1px solid rgba(0,0,0,0.08)',
    },
    logoFallback: {
        fontSize: 12,
        fontWeight: 700,
        padding: '6px 8px',
        borderRadius: 8,
        background: '#de7d43',
        color: '#fff',
    },
    brandText: {
        fontSize: 30,
        fontWeight: 700,
        fontFamily: 'Georgia, Cambria, Times New Roman, serif',
        color: '#111827',
        lineHeight: 1,
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
