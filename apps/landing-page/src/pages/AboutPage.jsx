import React from 'react';

export default function AboutPage() {
    return (
        <div style={{ background: '#FFFFFF', minHeight: '100vh', padding: '100px 40px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <h1 style={{ fontSize: 48, marginTop: 16, marginBottom: 32 }}>About AcademicX</h1>
                <h1 style={{ fontSize: 'clamp(32px, 6vw, 64px)', letterSpacing: '-0.03em', marginBottom: 24, color: 'var(--color-gray-900)' }}>Built to transform schools and empower educators.</h1>
                <p style={{ fontSize: 18, color: 'var(--color-gray-600)', marginBottom: 40, lineHeight: 1.8 }}>
                    academicX was founded under the umbrella of a leading healthtech company <strong>Lexrunit</strong> with a singular vision: to help schools run more efficiently. We believe that technology should be invisible—so seamless and beautiful that it feels like magic, allowing educators to focus entirely on what matters most: teaching.
                </p>

                <img src="https://res.cloudinary.com/dlvffw5wt/image/upload/f_webp/q_auto:eco/Gemini_Generated_Image_l0aqi5l0aqi5l0aq_mqmtcp" alt="Our vision" style={{ width: '100%', borderRadius: 24, marginBottom: 40, boxShadow: '0 12px 32px rgba(0,0,0,0.05)' }} />

                <h2 style={{ fontSize: 32, marginTop: 40, marginBottom: 20 }}>Our Mission</h2>
                <p style={{ fontSize: 16, color: 'var(--color-gray-600)', marginBottom: 24, lineHeight: 1.8 }}>
                    To ensure that every school spend less time in repetitive computation and allow schools to focus more in education and training of mentally and psycologically healthy children. We are committed to providing a platform that is not only powerful and feature-rich but also helps in sharping these children and young adults.
                </p>

                <img src="https://res.cloudinary.com/dlvffw5wt/image/upload/f_webp/q_auto:eco/Gemini_Generated_Image_l0aqi5l0aqi5l0aq_mqmtcp" alt="Our vision" style={{ width: '100%', borderRadius: 24, marginBottom: 40, boxShadow: '0 12px 32px rgba(0,0,0,0.05)' }} />

                <h2 style={{ fontSize: 32, marginTop: 40, marginBottom: 20 }}>Our Promise</h2>
                <p style={{ fontSize: 16, color: 'var(--color-gray-600)', marginBottom: 24, lineHeight: 1.8 }}>
                    By integrating state-of-the-art design principles with robust, scalable backend architecture, we deliver an outstanding experience on the web and all major operating systems. Our platform is built to be lightning-fast, secure, and intuitive, ensuring that administrators, teachers, and students can navigate their tasks with ease and confidence.
                </p>
                <p style={{ fontSize: 16, color: 'var(--color-gray-600)', marginBottom: 24, lineHeight: 1.8 }}>
                    From our result access system to automated broadsheet generation and our internal & external communication system, we ensure every touchpoint is fast, secure, and delightful to use. We promise a seemless online and offline experience without any major glitch to the extent that the technologies allow. 
                </p>
            </div>
        </div>
    );
}
