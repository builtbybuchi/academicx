import React, { useEffect, useMemo, useState } from 'react';

export default function AuthPage({
    brand = 'AcademicX',
    title = 'Spark your productivity',
    subtitle = 'Access your workspace with secure email authentication.',
    logoSrc = '/logo.png',
    fallbackLogoText = 'AcademicX',
    highlights = [],
    allowSignup = true,
    disableSignup = false,
    disableSignupMessage = 'Account signup is disabled for this portal. Contact your administrator.',
    onLogin,
    onSignup,
    loading = false,
}) {
    const [tab, setTab] = useState('login');
    const [error, setError] = useState('');
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ firstName: '', lastName: '', email: '', password: '', organization: '', schoolCode: '' });
    const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 980 : false);

    useEffect(() => {
        const onResize = () => setIsDesktop(window.innerWidth >= 980);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

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
                                <input
                                    style={styles.input}
                                    type="email"
                                    placeholder="name@yourcompany.com"
                                    value={loginData.email}
                                    onChange={(event) => setLoginData((current) => ({ ...current, email: event.target.value }))}
                                    required
                                />
                                <input
                                    style={styles.input}
                                    type="password"
                                    placeholder="Password"
                                    value={loginData.password}
                                    onChange={(event) => setLoginData((current) => ({ ...current, password: event.target.value }))}
                                    required
                                />
                                <button disabled={loading} type="submit" style={styles.primaryBtn}>
                                    {loading ? 'Loading...' : 'Continue with email'}
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
        background: 'linear-gradient(145deg, #f8f8f4 0%, #f3f2eb 50%, #f9f8f3 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '20px 16px',
    },
    layer: {
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 20% 10%, rgba(193, 122, 74, 0.18), transparent 40%), radial-gradient(circle at 80% 80%, rgba(78, 139, 167, 0.16), transparent 45%)',
        pointerEvents: 'none',
    },
    grid: {
        maxWidth: 1200,
        margin: '0 auto',
        position: 'relative',
        display: 'grid',
        gap: 20,
        gridTemplateColumns: '1fr',
    },
    left: {
        borderRadius: 28,
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(8px)',
        padding: 24,
        border: '1px solid rgba(0,0,0,0.06)',
    },
    right: {
        borderRadius: 28,
        background: 'rgba(250,248,239,0.8)',
        padding: 20,
        border: '1px solid rgba(0,0,0,0.05)',
    },
    brandRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 18,
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
        color: '#201f1b',
    },
    title: {
        margin: 0,
        fontSize: 'clamp(34px, 8vw, 68px)',
        lineHeight: 1,
        fontWeight: 500,
        fontFamily: 'Georgia, Cambria, Times New Roman, serif',
        color: '#343127',
    },
    subtitle: {
        marginTop: 12,
        marginBottom: 24,
        color: '#666255',
        fontSize: 15,
    },
    card: {
        borderRadius: 24,
        border: '1px solid rgba(0,0,0,0.09)',
        background: '#f9f8f2',
        padding: 16,
    },
    tabs: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: '#ebe9df',
        borderRadius: 12,
        padding: 4,
        gap: 4,
        marginBottom: 14,
    },
    tabBtn: {
        border: 'none',
        borderRadius: 10,
        padding: '9px 10px',
        fontSize: 13,
        fontWeight: 600,
        color: '#5a5647',
        background: 'transparent',
        cursor: 'pointer',
    },
    tabBtnActive: {
        background: '#fff',
        color: '#2e2a1d',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    },
    form: {
        display: 'grid',
        gap: 10,
    },
    row: {
        display: 'grid',
        gap: 10,
        gridTemplateColumns: '1fr',
    },
    input: {
        width: '100%',
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 12,
        padding: '12px 14px',
        outline: 'none',
        fontSize: 14,
        background: '#fff',
        color: '#2c2a22',
    },
    primaryBtn: {
        border: 'none',
        borderRadius: 12,
        padding: '12px 14px',
        fontSize: 18,
        fontWeight: 700,
        color: '#fff',
        background: '#c85f38',
        cursor: 'pointer',
        marginTop: 4,
    },
    note: {
        fontSize: 12,
        color: '#6e6a59',
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
        background: '#f1efe6',
        border: '1px solid rgba(0,0,0,0.08)',
        padding: 16,
        minHeight: 260,
    },
    previewChip: {
        display: 'inline-block',
        borderRadius: 999,
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.08)',
        padding: '8px 12px',
        fontSize: 12,
        fontWeight: 600,
        color: '#4f4a3d',
        marginBottom: 12,
    },
    previewItem: {
        color: '#4d493f',
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 1.45,
    },
    previewPanel: {
        marginTop: 16,
        borderRadius: 16,
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.08)',
        padding: 14,
    },
    fakeLineLong: {
        height: 8,
        width: '85%',
        borderRadius: 999,
        background: '#d9d6c7',
        marginBottom: 8,
    },
    fakeLineShort: {
        height: 8,
        width: '55%',
        borderRadius: 999,
        background: '#e8e6dc',
        marginBottom: 12,
    },
    fakeChart: {
        height: 90,
        borderRadius: 12,
        background: 'linear-gradient(180deg, #e1edf7 0%, #d7e7f0 100%)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        padding: '10px 10px',
    },
    chartBar: {
        flex: 1,
        borderRadius: 6,
        background: 'linear-gradient(180deg, #de7d43 0%, #cb5e35 100%)',
    },
};
