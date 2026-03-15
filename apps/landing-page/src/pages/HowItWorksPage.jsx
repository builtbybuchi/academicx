import React from 'react';

const steps = [
    { number: '01', title: 'Sign Up', desc: 'Register your school in minutes. No credit card required.', img: 'https://res.cloudinary.com/dlvffw5wt/image/upload/f_webp/q_auto:eco/Gemini_Generated_Image_l0aqi5l0aqi5l0aq_mqmtcp' },
    { number: '02', title: 'Login & Access Dashboard', desc: 'Securely authenticate and access your centralized admin overview.', img: 'https://res.cloudinary.com/dlvffw5wt/image/upload/f_webp/q_auto:eco/Gemini_Generated_Image_l0aqi5l0aqi5l0aq_mqmtcp' },
    { number: '03', title: 'School Settings', desc: 'Configure basics: academic terms, general info, and session timings.', img: 'https://res.cloudinary.com/dlvffw5wt/image/upload/f_webp/q_auto:eco/Gemini_Generated_Image_l0aqi5l0aqi5l0aq_mqmtcp' },
    { number: '04', title: 'Create Academic Sessions', desc: 'Initialize term calendars so records align chronologically.', img: 'https://res.cloudinary.com/dlvffw5wt/image/upload/f_webp/q_auto:eco/Gemini_Generated_Image_l0aqi5l0aqi5l0aq_mqmtcp' },
    { number: '05', title: 'Create Classes & Subjects', desc: 'Build the foundational infrastructure of your curriculum.', img: 'https://res.cloudinary.com/dlvffw5wt/image/upload/f_webp/q_auto:eco/Gemini_Generated_Image_l0aqi5l0aqi5l0aq_mqmtcp' },
    { number: '06', title: 'Set Limits & Grading', desc: 'Customize grade thresholds, CATs vs Exam weightings, and remarks.', img: 'https://res.cloudinary.com/dlvffw5wt/image/upload/f_webp/q_auto:eco/Gemini_Generated_Image_l0aqi5l0aqi5l0aq_mqmtcp' },
    { number: '07', title: 'Enroll staffs & Students', desc: '', img: 'https://res.cloudinary.com/dlvffw5wt/image/upload/f_webp/q_auto:eco/Gemini_Generated_Image_l0aqi5l0aqi5l0aq_mqmtcp' },
    { number: '08', title: 'Enjoy the intuitive dashboard', desc: 'Facilitate seamless communication between admins, teachers, and parents.', img: 'https://res.cloudinary.com/dlvffw5wt/image/upload/f_webp/q_auto:eco/Gemini_Generated_Image_l0aqi5l0aqi5l0aq_mqmtcp' },

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
                    <div key={idx} className="step-card" style={{
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
                        <div className="step-image-container" style={{ flex: 1 }}>
                            {step.img ? (
                                <img src={step.img.startsWith('http') ? step.img : "https://diviengine.com/wp-content/uploads/2025/08/naughtyduk-liquid-glass-1024x611.webp"} alt={step.title} style={{ width: '100%', borderRadius: 24, boxShadow: '0 12px 32px rgba(0,0,0,0.05)' }} />
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .step-card {
                        flex-direction: column !important;
                        padding: 24px !important;
                    }
                    .step-image-container {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
