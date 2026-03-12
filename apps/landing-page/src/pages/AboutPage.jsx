import React from 'react';

export default function AboutPage() {
    return (
        <div style={{ background: '#FFFFFF', minHeight: '100vh', padding: '100px 40px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>About AcademicX</span>
                <h1 style={{ fontSize: 48, marginTop: 16, marginBottom: 32 }}>Built for the modern edge of education.</h1>
                <p style={{ fontSize: 18, color: 'var(--color-gray-600)', marginBottom: 40, lineHeight: 1.8 }}>
                    AcademicX was founded under the umbrella of <strong>Lexrunit</strong> with a singular vision: to eliminate the administrative friction that plagues modern educational institutions. We believe that technology should be invisible—so seamless and beautiful that it feels like magic, allowing educators to focus entirely on what matters most: teaching.
                </p>

                <img src="https://diviengine.com/wp-content/uploads/2025/08/naughtyduk-liquid-glass-1024x611.webp" alt="Our vision" style={{ width: '100%', borderRadius: 24, marginBottom: 40, boxShadow: '0 12px 32px rgba(0,0,0,0.05)' }} />

                <h2 style={{ fontSize: 32, marginTop: 40, marginBottom: 20 }}>Our Mission</h2>
                <p style={{ fontSize: 16, color: 'var(--color-gray-600)', marginBottom: 24, lineHeight: 1.8 }}>
                    By integrating state-of-the-art Liquid Glass design principles with robust, scalable backend architecture, we deliver an app-like experience directly in the browser.
                </p>
                <p style={{ fontSize: 16, color: 'var(--color-gray-600)', marginBottom: 24, lineHeight: 1.8 }}>
                    From our custom PIN-based Result Access system to automated broadsheet generation and seamless Squad payment integration, we ensure every touchpoint is fast, secure, and delightful to use.
                </p>
            </div>
        </div>
    );
}
