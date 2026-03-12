import React from 'react';

const steps = [
    { number: '01', title: 'Sign Up', desc: 'Register your school in minutes. No credit card required.', img: 'signup' },
    { number: '02', title: 'Login & Access Dashboard', desc: 'Securely authenticate and access your centralized admin overview.', img: 'dashboard' },
    { number: '03', title: 'School Settings', desc: 'Configure basics: academic terms, general info, and session timings.', img: 'settings' },
    { number: '04', title: 'Create Academic Sessions', desc: 'Initialize term calendars so records align chronologically.', img: 'calendar' },
    { number: '05', title: 'Create Classes & Subjects', desc: 'Build the foundational infrastructure of your curriculum.', img: 'class' },
    { number: '06', title: 'Set Limits & Grading', desc: 'Customize grade thresholds, CATs vs Exam weightings, and remarks.', img: 'grade' },
];

export default function HowItWorksPage() {
    return (
        <div style={{ background: '#FFFFFF', minHeight: '100vh', padding: '100px 40px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', marginBottom: 80 }}>
                <h1 style={{ fontSize: 48, marginBottom: 16 }}>How It Works</h1>
                <p style={{ fontSize: 20, color: 'var(--color-gray-600)' }}>A seamless transition from signup to fully functioning school platform.</p>
            </div>

            <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
                {steps.map((step, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        gap: 40,
                        alignItems: 'center',
                        flexDirection: idx % 2 === 0 ? 'row' : 'row-reverse',
                        background: 'var(--color-gray-50)',
                        padding: 40,
                        borderRadius: 32,
                        border: '1px solid var(--color-gray-100)'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 64, fontWeight: 900, color: 'var(--color-primary-100)', lineHeight: 1, marginBottom: 16 }}>{step.number}</div>
                            <h3 style={{ fontSize: 28, marginBottom: 16, color: 'var(--color-gray-900)' }}>{step.title}</h3>
                            <p style={{ fontSize: 18, color: 'var(--color-gray-600)', lineHeight: 1.6 }}>{step.desc}</p>
                        </div>
                        <div style={{ flex: 1 }}>
                            <img src="https://diviengine.com/wp-content/uploads/2025/08/naughtyduk-liquid-glass-1024x611.webp" alt={step.title} style={{ width: '100%', borderRadius: 24, boxShadow: '0 12px 32px rgba(0,0,0,0.05)' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
